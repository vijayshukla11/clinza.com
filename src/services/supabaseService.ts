/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  supabase, 
  syncCustomersFromCloud, 
  saveCustomerToCloud, 
  deleteCustomerFromCloud 
} from "../supabase";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BLOGS, INITIAL_REVIEWS } from "../data";
import { getCollections, saveCollections } from "../utils";
import { generateVariantsForProduct } from "../utils/variantUtils";
import { 
  Product, 
  BlogPost, 
  Order, 
  CustomerProfile, 
  TestimonialConfig, 
  ThemeConfig, 
  HomepageConfig, 
  ProductCollection,
  Category,
  CollectionMaster,
  Coupon,
  ReviewItem,
  ProductReview,
  Address,
  OrderReturnRequest,
  Promotion
} from "../types";

export interface CollectionItem {
  id: string;
  name: string;
  slug: ProductCollection | string;
  description: string;
  shortDescription?: string;
  buttonText?: string;
  image: string;
  thumbnail?: string;
  banner?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  altText?: string;
  displayOrder?: number;
  featured?: boolean;
  showOnHomepage?: boolean;
  isActive?: boolean;
}

// -------------------------------------------------------------
// 1. PRODUCTS SERVICE (CRUD)
// -------------------------------------------------------------
export const ProductsService = {
  async getAll(): Promise<Product[]> {
    try {
      const fetchPromise = supabase.from("products").select("*").order("name");
      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Timeout") }), 3000)
      );
      const res = await Promise.race([fetchPromise, timeoutPromise]);
      const { data, error } = res;

      let result: Product[] | null = null;
      if (!error && data && data.length > 0) {
        result = data.map(mapDbProduct);
      }

      // Safe cache handling: If fetch failed or returned empty data, prefer existing local cache over seed data
      if (!result || result.length === 0) {
        if (typeof window !== "undefined") {
          try {
            const cachedStr = localStorage.getItem("clinza_products");
            if (cachedStr) {
              const parsed = JSON.parse(cachedStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
              }
            }
          } catch {}
        }
        result = INITIAL_PRODUCTS;
      } else {
        if (typeof window !== "undefined" && result && result.length > 0) {
          try {
            localStorage.setItem("clinza_products", JSON.stringify(result));
            window.dispatchEvent(new CustomEvent("clinza_products_updated", { detail: result }));
          } catch {}
        }
      }

      return result;
    } catch (e) {
      console.error("Supabase products getAll error:", e);
      if (typeof window !== "undefined") {
        try {
          const cachedStr = localStorage.getItem("clinza_products");
          if (cachedStr) {
            const parsed = JSON.parse(cachedStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed;
            }
          }
        } catch {}
      }
      return INITIAL_PRODUCTS;
    }
  },

  async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase.from("products").select("*").or(`id.eq.${id},slug.eq.${id}`).maybeSingle();
      if (error) throw error;
      return data ? mapDbProduct(data) : null;
    } catch (e) {
      console.error("Supabase products getById error:", e);
      return null;
    }
  },

  async create(product: Product): Promise<Product> {
    const row = mapProductToDb(product);
    const { data, error } = await supabase.from("products").insert(row).select().single();
    if (error) throw error;
    return mapDbProduct(data);
  },

  async update(id: string, product: Partial<Product>): Promise<Product | null> {
    // Get current first to merge
    const current = await this.getById(id);
    if (!current) throw new Error(`Product with ID ${id} not found.`);
    const merged = { ...current, ...product } as Product;
    const row = mapProductToDb(merged);
    const { data, error } = await supabase.from("products").update(row).eq("id", id).select().single();
    if (error) throw error;
    return mapDbProduct(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  async getHomepageBestSellers(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("display_order", { ascending: true, nullsFirst: false })
        .limit(16);

      if (error || !data || data.length === 0) {
        const all = await this.getAll();
        return all.slice(0, 8);
      }

      const mapped = data.map(mapDbProduct);
      
      const publishedAndActive = mapped.filter(p => {
        const isPub = (p as any).status ? (p as any).status === "Published" : true;
        const isActive = (p as any).is_active !== undefined ? (p as any).is_active : ((p as any).isActive !== undefined ? (p as any).isActive : true);
        return isPub && isActive;
      });

      const featuredList = publishedAndActive.filter(p => p.isTrending || p.isNewArrival || (p as any).featured || (p as any).is_featured);

      const result = featuredList.length >= 4 ? featuredList : (publishedAndActive.length > 0 ? publishedAndActive : mapped);
      return result.slice(0, 8);
    } catch (e) {
      console.warn("Supabase getHomepageBestSellers error fallback to getAll:", e);
      const all = await this.getAll();
      return all.slice(0, 8);
    }
  },

  async search(query: string): Promise<Product[]> {
    const list = await this.getAll();
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  },

  async filter(criteria: { 
    collection?: string; 
    category?: string; 
    maxPrice?: number; 
    isTrending?: boolean; 
    isNewArrival?: boolean; 
    inStockOnly?: boolean 
  }): Promise<Product[]> {
    let list = await this.getAll();
    if (criteria.collection) {
      list = list.filter(p => p.collection === criteria.collection);
    }
    if (criteria.category) {
      list = list.filter(p => p.category.toLowerCase().includes(criteria.category!.toLowerCase()));
    }
    if (criteria.maxPrice !== undefined) {
      list = list.filter(p => p.price <= criteria.maxPrice!);
    }
    if (criteria.isTrending !== undefined) {
      list = list.filter(p => p.isTrending === criteria.isTrending);
    }
    if (criteria.isNewArrival !== undefined) {
      list = list.filter(p => p.isNewArrival === criteria.isNewArrival);
    }
    if (criteria.inStockOnly) {
      list = list.filter(p => p.stockStatus === "In Stock" || p.stockStatus === "Low Stock");
    }
    return list;
  },

  async getRankedProducts(): Promise<Product[]> {
    const list = await this.getAll();
    return [...list].sort((a, b) => {
      const rankA = a.trendingRank !== undefined && a.trendingRank !== null ? a.trendingRank : 999;
      const rankB = b.trendingRank !== undefined && b.trendingRank !== null ? b.trendingRank : 999;
      if (rankA !== rankB) return rankA - rankB;
      return 0;
    });
  },

  async updateProductRanks(rankedItems: { id: string; rank: number; demandBadge?: string }[]): Promise<boolean> {
    try {
      for (const item of rankedItems) {
        try {
          await supabase
            .from("products")
            .update({
              trending_rank: item.rank,
              demand_badge: item.demandBadge || `No. ${item.rank} High Demand`
            })
            .eq("id", item.id);
        } catch (subErr) {
          console.warn("Single rank update error:", subErr);
        }
      }
      return true;
    } catch (e) {
      console.warn("Error updating product ranks:", e);
      return false;
    }
  }
};

// -------------------------------------------------------------
// 2. CATEGORIES SERVICE
// -------------------------------------------------------------
export const CategoriesService = {
  async getAll(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true, nullsFirst: false });

      if (!error && data && data.length > 0) {
        const categories: Category[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description || "",
          shortDescription: row.short_description || row.shortDescription || "",
          banner: row.banner || row.thumbnail || "",
          thumbnail: row.thumbnail || row.banner || "",
          altText: row.alt_text || row.altText || row.name || "",
          seoTitle: row.seo_title || row.seoTitle || row.meta_title || row.metaTitle || "",
          seoDescription: row.seo_description || row.seoDescription || row.meta_description || row.metaDescription || "",
          metaTitle: row.meta_title || row.metaTitle || row.seo_title || row.seoTitle || "",
          metaDescription: row.meta_description || row.metaDescription || row.seo_description || row.seoDescription || "",
          keywords: row.keywords || "",
          canonicalUrl: row.canonical_url || row.canonicalUrl || "",
          displayOrder: row.display_order !== undefined && row.display_order !== null ? Number(row.display_order) : 0,
          featured: row.featured !== false,
          showOnHomepage: row.show_on_homepage !== false,
          isActive: row.is_active !== false,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));

        try {
          localStorage.setItem("clinza_categories", JSON.stringify(categories));
        } catch {}

        return categories;
      }
    } catch (e) {
      console.warn("CategoriesService.getAll exception, using local fallback:", e);
    }

    // Local Storage Fallback
    try {
      const cached = localStorage.getItem("clinza_categories");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    return INITIAL_CATEGORIES;
  },

  async getById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`id.eq.${id},slug.eq.${id}`)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          shortDescription: data.short_description || data.shortDescription || "",
          banner: data.banner || data.thumbnail || "",
          thumbnail: data.thumbnail || data.banner || "",
          altText: data.alt_text || data.altText || data.name || "",
          seoTitle: data.seo_title || data.seoTitle || data.meta_title || data.metaTitle || "",
          seoDescription: data.seo_description || data.seoDescription || data.meta_description || data.metaDescription || "",
          metaTitle: data.meta_title || data.metaTitle || data.seo_title || data.seoTitle || "",
          metaDescription: data.meta_description || data.metaDescription || data.seo_description || data.seoDescription || "",
          keywords: data.keywords || "",
          canonicalUrl: data.canonical_url || data.canonicalUrl || "",
          displayOrder: data.display_order !== undefined && data.display_order !== null ? Number(data.display_order) : 0,
          featured: data.featured !== false,
          showOnHomepage: data.show_on_homepage !== false,
          isActive: data.is_active !== false,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
    } catch (e) {
      console.warn("CategoriesService.getById exception:", e);
    }

    const all = await this.getAll();
    return all.find(c => c.id === id || c.slug === id) || null;
  },

  async getBySlug(slug: string): Promise<Category | null> {
    return this.getById(slug);
  },

  async create(category: Category): Promise<Category> {
    const catId = category.id || `cat-${Date.now()}`;
    const row = {
      id: catId,
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      short_description: category.shortDescription || "",
      banner: category.banner || category.thumbnail || "",
      thumbnail: category.thumbnail || category.banner || "",
      alt_text: category.altText || category.name || "",
      seo_title: category.seoTitle || category.metaTitle || "",
      seo_description: category.seoDescription || category.metaDescription || "",
      meta_title: category.metaTitle || category.seoTitle || "",
      meta_description: category.metaDescription || category.seoDescription || "",
      keywords: category.keywords || category.slug || "",
      canonical_url: category.canonicalUrl || "",
      display_order: category.displayOrder !== undefined ? Number(category.displayOrder) : 0,
      featured: category.featured !== false,
      show_on_homepage: category.showOnHomepage !== false,
      is_active: category.isActive !== false
    };

    const newItem: Category = {
      ...category,
      id: catId,
      shortDescription: row.short_description,
      banner: row.banner,
      thumbnail: row.thumbnail,
      altText: row.alt_text,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      keywords: row.keywords,
      canonicalUrl: row.canonical_url,
      displayOrder: row.display_order,
      featured: row.featured,
      showOnHomepage: row.show_on_homepage,
      isActive: row.is_active
    };

    try {
      const { data, error } = await supabase.from("categories").upsert(row, { onConflict: "id" }).select().maybeSingle();
      if (error) {
        console.error("CategoriesService.create Supabase error:", error);
      } else if (data) {
        newItem.createdAt = data.created_at;
        newItem.updatedAt = data.updated_at;
      }
    } catch (err) {
      console.error("CategoriesService.create exception:", err);
    }

    try {
      const cached = localStorage.getItem("clinza_categories");
      const current: Category[] = cached ? JSON.parse(cached) : INITIAL_CATEGORIES;
      const updated = [newItem, ...current.filter(c => c.id !== catId && c.slug !== newItem.slug)];
      localStorage.setItem("clinza_categories", JSON.stringify(updated));
    } catch (err) {
      console.error("CategoriesService local sync error:", err);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clinza_categories_updated"));
    }

    return newItem;
  },

  async update(id: string, category: Partial<Category>): Promise<Category | null> {
    const current = await this.getById(id);
    const targetId = current?.id || category.id || id;

    const merged = {
      ...current,
      ...category,
      id: targetId
    } as Category;

    const row = {
      id: targetId,
      name: merged.name,
      slug: merged.slug,
      description: merged.description || "",
      short_description: merged.shortDescription || "",
      banner: merged.banner || merged.thumbnail || "",
      thumbnail: merged.thumbnail || merged.banner || "",
      alt_text: merged.altText || merged.name || "",
      seo_title: merged.seoTitle || merged.metaTitle || "",
      seo_description: merged.seoDescription || merged.metaDescription || "",
      meta_title: merged.metaTitle || merged.seoTitle || "",
      meta_description: merged.metaDescription || merged.seoDescription || "",
      keywords: merged.keywords || merged.slug || "",
      canonical_url: merged.canonicalUrl || "",
      display_order: merged.displayOrder !== undefined ? Number(merged.displayOrder) : 0,
      featured: merged.featured !== false,
      show_on_homepage: merged.showOnHomepage !== false,
      is_active: merged.isActive !== false
    };

    let updatedItem: Category = merged;

    try {
      const { data, error } = await supabase.from("categories").upsert(row, { onConflict: "id" }).select().maybeSingle();
      if (error) {
        console.error("CategoriesService.update Supabase error:", error);
      } else if (data) {
        updatedItem.createdAt = data.created_at;
        updatedItem.updatedAt = data.updated_at;
      }
    } catch (err) {
      console.error("CategoriesService.update exception:", err);
    }

    try {
      const cached = localStorage.getItem("clinza_categories");
      const all: Category[] = cached ? JSON.parse(cached) : INITIAL_CATEGORIES;
      const updatedList = all.map(c => (c.id === targetId || c.slug === merged.slug) ? updatedItem : c);
      localStorage.setItem("clinza_categories", JSON.stringify(updatedList));
    } catch (err) {
      console.error("CategoriesService.update local sync error:", err);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clinza_categories_updated"));
    }

    return updatedItem;
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("categories").delete().or(`id.eq.${id},slug.eq.${id}`);
      if (error) console.error("CategoriesService.delete Supabase error:", error);
    } catch (err) {
      console.error("CategoriesService.delete exception:", err);
    }

    try {
      const cached = localStorage.getItem("clinza_categories");
      const all: Category[] = cached ? JSON.parse(cached) : INITIAL_CATEGORIES;
      const filtered = all.filter(c => c.id !== id && c.slug !== id);
      localStorage.setItem("clinza_categories", JSON.stringify(filtered));
    } catch (err) {
      console.error("CategoriesService.delete local sync error:", err);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clinza_categories_updated"));
    }

    return true;
  }
};

// -------------------------------------------------------------
// 3. COLLECTIONS SERVICE
// -------------------------------------------------------------
// Default seed collections used strictly on first database initialization
const DEFAULT_COLLECTIONS_SEED = [
  {
    id: "combos",
    name: "Combos",
    slug: "combos",
    short_description: "Tailored co-ord sets crafted from pure European flax and breathable cotton blends.",
    description: "Pre-coordinated matching clothing sets curated for effortless styling.",
    button_text: "Explore Combos",
    banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    display_order: 1,
    show_on_homepage: true,
    is_active: true,
    featured: true,
    meta_title: "Combos - Clinza Wardrobe",
    meta_description: "Shop premium linen co-ord combo sets engineered for modern elegance.",
    alt_text: "Clinza Combos"
  },
  {
    id: "shirts",
    name: "Shirts",
    slug: "shirts",
    short_description: "Elevated Cuban cuts and relaxed button-down shirts in summer-ready textures.",
    description: "Premium linen and cotton-linen shirts tailored for summer elegance.",
    button_text: "Explore Shirts",
    banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    display_order: 2,
    show_on_homepage: true,
    is_active: true,
    featured: true,
    meta_title: "Luxury Shirts - Clinza Wardrobe",
    meta_description: "Shop luxury resort shirts crafted from premium organic fabrics.",
    alt_text: "Clinza Luxury Shirts"
  },
  {
    id: "pants",
    name: "Pants",
    slug: "pants",
    short_description: "Sartorial double pleated trousers and casual linen pants tailored to perfection.",
    description: "Architectural pleated trousers and relaxed linen pants.",
    button_text: "Explore Pants",
    banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    display_order: 3,
    show_on_homepage: true,
    is_active: true,
    featured: true,
    meta_title: "Tailored Pants & Trousers - Clinza Wardrobe",
    meta_description: "Discover luxury pleated trousers and versatile trousers for all occasions.",
    alt_text: "Clinza Tailored Pants"
  },
  {
    id: "jeans",
    name: "Jeans",
    slug: "jeans",
    short_description: "Heavyweight 13.5 oz selvedge shuttle denim crafted for authentic heritage aging.",
    description: "Heritage Japanese selvedge denim built to last generations.",
    button_text: "Explore Jeans",
    banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    display_order: 4,
    show_on_homepage: true,
    is_active: true,
    featured: true,
    meta_title: "Selvedge Denim & Jeans - Clinza Wardrobe",
    meta_description: "Shop raw redline selvedge denim and premium jeans with modern straight cuts.",
    alt_text: "Clinza Selvedge Denim Jeans"
  },
  {
    id: "footwear",
    name: "Footwear",
    slug: "footwear",
    short_description: "Handcrafted suede and full-grain leather footwear for modern tailoring.",
    description: "Handcrafted suede and full grain leather loafers.",
    button_text: "Explore Footwear",
    banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    display_order: 5,
    show_on_homepage: true,
    is_active: true,
    featured: true,
    meta_title: "Luxury Footwear - Clinza Wardrobe",
    meta_description: "Shop handcrafted suede and full grain leather loafers.",
    alt_text: "Clinza Luxury Footwear"
  }
];

export const CollectionsService = {
  async getAll(): Promise<CollectionItem[]> {
    try {
      let { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        console.warn("Supabase collections query error/offline, falling back to local storage:", error.message || error);
      }

      if (data && data.length > 0) {
        const mapped: CollectionItem[] = data.map(row => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description || "",
          shortDescription: row.short_description || row.description || "",
          buttonText: row.button_text || "View Collection",
          image: row.thumbnail || row.banner || "",
          thumbnail: row.thumbnail || "",
          banner: row.banner || "",
          seoTitle: row.seo_title || row.meta_title || "",
          seoDescription: row.seo_description || row.meta_description || "",
          metaTitle: row.meta_title || row.seo_title || "",
          metaDescription: row.meta_description || row.seo_description || "",
          altText: row.alt_text || row.name || "",
          displayOrder: row.display_order !== undefined && row.display_order !== null ? Number(row.display_order) : 0,
          featured: row.featured !== false,
          showOnHomepage: row.show_on_homepage !== false,
          isActive: row.is_active !== false
        }));

        // Deduplicate collections while maintaining custom items
        const seenKeys = new Set<string>();
        const uniqueCollections: CollectionItem[] = [];
        for (const item of mapped) {
          const key = (item.id || item.slug || "").toLowerCase().trim();
          if (key && !seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueCollections.push(item);
          }
        }

        // Sync local storage with latest cloud data
        try {
          saveCollections(uniqueCollections.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            banner: c.banner || "",
            thumbnail: c.thumbnail || "",
            description: c.description,
            shortDescription: c.shortDescription,
            buttonText: c.buttonText,
            altText: c.altText,
            seoTitle: c.seoTitle,
            seoDescription: c.seoDescription,
            displayOrder: c.displayOrder || 0,
            featured: c.featured !== false,
            showOnHomepage: c.showOnHomepage !== false,
            isActive: c.isActive !== false
          })));
        } catch (syncErr) {
          console.warn("Failed syncing fetched DB collections to local cache:", syncErr);
        }

        return uniqueCollections;
      }
    } catch (e) {
      console.error("Supabase collections getAll exception, using local fallback:", e);
    }

    // Fallback to local storage (clinza_collections_master) when Supabase returns no data or fails
    try {
      const localList = getCollections();
      if (localList && localList.length > 0) {
        return localList.map(col => ({
          id: col.id,
          name: col.name,
          slug: col.slug,
          description: col.description || "",
          shortDescription: col.shortDescription || col.description || "",
          buttonText: col.buttonText || "View Collection",
          image: col.thumbnail || col.banner || "",
          thumbnail: col.thumbnail || "",
          banner: col.banner || "",
          seoTitle: col.seoTitle || col.metaTitle || "",
          seoDescription: col.seoDescription || col.metaDescription || "",
          metaTitle: col.metaTitle || col.seoTitle || "",
          metaDescription: col.metaDescription || col.seoDescription || "",
          altText: col.altText || col.name || "",
          displayOrder: col.displayOrder !== undefined && col.displayOrder !== null ? Number(col.displayOrder) : 0,
          featured: col.featured !== false,
          showOnHomepage: col.showOnHomepage !== false,
          isActive: col.isActive !== false
        }));
      }
    } catch (localErr) {
      console.error("Failed reading local storage fallback collections:", localErr);
    }

    // Return default seed objects if DB was empty and insertion failed/unreachable
    return DEFAULT_COLLECTIONS_SEED.map(col => ({
      id: col.id,
      name: col.name,
      slug: col.slug,
      description: col.description,
      shortDescription: col.short_description,
      buttonText: col.button_text,
      image: col.banner,
      thumbnail: col.thumbnail,
      banner: col.banner,
      seoTitle: col.meta_title,
      seoDescription: col.meta_description,
      metaTitle: col.meta_title,
      metaDescription: col.meta_description,
      altText: col.alt_text,
      displayOrder: col.display_order,
      featured: col.featured,
      showOnHomepage: col.show_on_homepage,
      isActive: col.is_active
    }));
  },

  async getHomepageCollections(): Promise<CollectionItem[]> {
    try {
      const all = await this.getAll();
      return all
        .filter(c => c.isActive !== false && c.showOnHomepage !== false)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    } catch (e) {
      console.error("Supabase collections getHomepageCollections error:", e);
      return [];
    }
  },

  async getFeaturedCollections(): Promise<CollectionItem[]> {
    try {
      const all = await this.getAll();
      return all
        .filter(c => c.isActive !== false && c.featured !== false)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    } catch (e) {
      console.error("Supabase collections getFeaturedCollections error:", e);
      return [];
    }
  },

  async getById(id: string): Promise<CollectionItem | null> {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .or(`id.eq.${id},slug.eq.${id}`)
        .maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          shortDescription: data.short_description || "",
          buttonText: data.button_text || "View Collection",
          image: data.thumbnail || data.banner || "",
          thumbnail: data.thumbnail || "",
          banner: data.banner || "",
          seoTitle: data.seo_title || data.meta_title || "",
          seoDescription: data.seo_description || data.meta_description || "",
          metaTitle: data.meta_title || data.seo_title || "",
          metaDescription: data.meta_description || data.seo_description || "",
          altText: data.alt_text || data.name || "",
          displayOrder: data.display_order !== undefined && data.display_order !== null ? Number(data.display_order) : 0,
          featured: !!data.featured,
          showOnHomepage: data.show_on_homepage !== false,
          isActive: data.is_active !== false
        };
      }
    } catch (e) {
      console.warn("Supabase collections getById exception:", e);
    }
    // Local fallback search
    try {
      const localList = getCollections();
      const match = localList.find(c => c.id === id || c.slug === id);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          slug: match.slug,
          description: match.description || "",
          shortDescription: match.shortDescription || match.description || "",
          buttonText: match.buttonText || "View Collection",
          image: match.banner || match.thumbnail || "",
          thumbnail: match.thumbnail || "",
          banner: match.banner || "",
          seoTitle: match.seoTitle || "",
          seoDescription: match.seoDescription || "",
          metaTitle: match.seoTitle || "",
          metaDescription: match.seoDescription || "",
          altText: match.altText || match.name || "",
          displayOrder: match.displayOrder || 0,
          featured: match.featured !== false,
          showOnHomepage: match.showOnHomepage !== false,
          isActive: match.isActive !== false
        };
      }
    } catch (err) {
      console.error("Local fallback search in getById error:", err);
    }
    return null;
  },

  async create(collection: CollectionItem): Promise<CollectionItem> {
    const colId = collection.id || `col-${Date.now()}`;
    const row = {
      id: colId,
      name: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      short_description: collection.shortDescription || collection.description || "",
      button_text: collection.buttonText || "View Collection",
      banner: collection.banner || "",
      thumbnail: collection.thumbnail || "",
      seo_title: collection.seoTitle || collection.metaTitle || "",
      seo_description: collection.seoDescription || collection.metaDescription || "",
      meta_title: collection.metaTitle || collection.seoTitle || "",
      meta_description: collection.metaDescription || collection.seoDescription || "",
      alt_text: collection.altText || collection.name || "",
      display_order: collection.displayOrder !== undefined ? Number(collection.displayOrder) : 0,
      featured: collection.featured !== false,
      show_on_homepage: collection.showOnHomepage !== false,
      is_active: collection.isActive !== false
    };

    console.log("CollectionsService.create payload being sent:", {
      collectionId: colId,
      slug: collection.slug,
      imageUrl: collection.banner || collection.thumbnail || collection.image,
      payload: row
    });

    let createdItem: CollectionItem = {
      ...collection,
      id: colId,
      image: collection.thumbnail || collection.banner || collection.image || ""
    };

    try {
      const { data, error } = await supabase.from("collections").upsert(row, { onConflict: "id" }).select().maybeSingle();
      if (error) {
        console.error("Supabase collections create error object:", error);
      } else if (data) {
        console.log("Supabase collections create response data:", data);
        createdItem = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          shortDescription: data.short_description || "",
          buttonText: data.button_text || "View Collection",
          image: data.thumbnail || data.banner || "",
          thumbnail: data.thumbnail || "",
          banner: data.banner || "",
          seoTitle: data.seo_title || data.meta_title || "",
          seoDescription: data.seo_description || data.meta_description || "",
          metaTitle: data.meta_title || data.seo_title || "",
          metaDescription: data.meta_description || data.seo_description || "",
          altText: data.alt_text || data.name || "",
          displayOrder: data.display_order !== undefined ? Number(data.display_order) : 0,
          featured: !!data.featured,
          showOnHomepage: data.show_on_homepage !== false,
          isActive: data.is_active !== false
        };
      }
    } catch (err) {
      console.error("Supabase collections create exception:", err);
    }

    // Always keep local storage synchronized
    try {
      const localList = getCollections();
      const existingIdx = localList.findIndex(c => c.id === colId || c.slug === createdItem.slug);
      const masterObj: CollectionMaster = {
        id: createdItem.id,
        name: createdItem.name,
        slug: createdItem.slug,
        banner: createdItem.banner || "",
        thumbnail: createdItem.thumbnail || "",
        description: createdItem.description,
        shortDescription: createdItem.shortDescription,
        buttonText: createdItem.buttonText,
        altText: createdItem.altText,
        seoTitle: createdItem.seoTitle,
        seoDescription: createdItem.seoDescription,
        displayOrder: createdItem.displayOrder || 0,
        featured: createdItem.featured !== false,
        showOnHomepage: createdItem.showOnHomepage !== false,
        isActive: createdItem.isActive !== false
      };
      if (existingIdx >= 0) {
        localList[existingIdx] = masterObj;
      } else {
        localList.push(masterObj);
      }
      saveCollections(localList);
    } catch (localErr) {
      console.error("Error syncing create to local storage:", localErr);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clinza_collections_updated"));
    }

    return createdItem;
  },

  async update(id: string, collection: Partial<CollectionItem>): Promise<CollectionItem | null> {
    let current = await this.getById(id);
    if (!current && collection.slug) {
      current = await this.getById(collection.slug);
    }

    const targetId = current?.id || collection.id || id;

    // Respect explicit empty string values if user deleted or replaced an image
    const thumbnail = collection.thumbnail !== undefined ? collection.thumbnail : (current?.thumbnail || "");
    const banner = collection.banner !== undefined ? collection.banner : (current?.banner || "");

    const merged = { 
      ...current, 
      ...collection, 
      id: targetId,
      thumbnail,
      banner,
      image: thumbnail || banner || ""
    } as CollectionItem;

    const row = {
      id: targetId,
      name: merged.name,
      slug: merged.slug,
      description: merged.description || "",
      short_description: merged.shortDescription || merged.description || "",
      button_text: merged.buttonText || "View Collection",
      banner: merged.banner || "",
      thumbnail: merged.thumbnail || "",
      seo_title: merged.seoTitle || merged.metaTitle || "",
      seo_description: merged.seoDescription || merged.metaDescription || "",
      meta_title: merged.metaTitle || merged.seoTitle || "",
      meta_description: merged.metaDescription || merged.seoDescription || "",
      alt_text: merged.altText || merged.name || "",
      display_order: merged.displayOrder !== undefined ? Number(merged.displayOrder) : 0,
      featured: merged.featured !== false,
      show_on_homepage: merged.showOnHomepage !== false,
      is_active: merged.isActive !== false
    };

    console.log("CollectionsService.update payload being sent:", {
      collectionId: targetId,
      slug: merged.slug,
      imageUrl: merged.banner || merged.thumbnail || merged.image,
      payload: row
    });

    let updatedItem: CollectionItem = merged;

    try {
      const { data, error } = await supabase.from("collections").upsert(row, { onConflict: "id" }).select().maybeSingle();
      if (error) {
        console.error("Supabase collections update error object:", error);
      } else if (data) {
        console.log("Supabase collections update response data:", data);
        updatedItem = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          shortDescription: data.short_description || "",
          buttonText: data.button_text || "View Collection",
          image: data.thumbnail || data.banner || "",
          thumbnail: data.thumbnail || "",
          banner: data.banner || "",
          seoTitle: data.seo_title || data.meta_title || "",
          seoDescription: data.seo_description || data.meta_description || "",
          metaTitle: data.meta_title || data.seo_title || "",
          metaDescription: data.meta_description || data.seo_description || "",
          altText: data.alt_text || data.name || "",
          displayOrder: data.display_order !== undefined ? Number(data.display_order) : 0,
          featured: !!data.featured,
          showOnHomepage: data.show_on_homepage !== false,
          isActive: data.is_active !== false
        };
      }
    } catch (err) {
      console.error("Supabase collections update exception:", err);
    }

    // Always keep local storage master list synchronized
    try {
      const localList = getCollections();
      const existingIdx = localList.findIndex(c => c.id === targetId || c.slug === merged.slug || c.id === id);
      const masterObj: CollectionMaster = {
        id: updatedItem.id,
        name: updatedItem.name,
        slug: updatedItem.slug,
        banner: updatedItem.banner || "",
        thumbnail: updatedItem.thumbnail || "",
        description: updatedItem.description,
        shortDescription: updatedItem.shortDescription,
        buttonText: updatedItem.buttonText,
        altText: updatedItem.altText,
        seoTitle: updatedItem.seoTitle,
        seoDescription: updatedItem.seoDescription,
        displayOrder: updatedItem.displayOrder || 0,
        featured: updatedItem.featured !== false,
        showOnHomepage: updatedItem.showOnHomepage !== false,
        isActive: updatedItem.isActive !== false
      };
      if (existingIdx >= 0) {
        localList[existingIdx] = masterObj;
      } else {
        localList.push(masterObj);
      }
      saveCollections(localList);
    } catch (localErr) {
      console.error("Error syncing update to local storage:", localErr);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clinza_collections_updated"));
    }

    return updatedItem;
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("collections").delete().or(`id.eq.${id},slug.eq.${id}`);
      if (error) console.error("Supabase collections delete error object:", error);
    } catch (err) {
      console.error("Supabase collections delete exception:", err);
    }
    try {
      const localList = getCollections().filter(c => c.id !== id && c.slug !== id);
      saveCollections(localList);
    } catch (localErr) {
      console.error("Error syncing delete to local storage:", localErr);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clinza_collections_updated"));
    }

    return true;
  }
};

// -------------------------------------------------------------
// 4. ORDERS SERVICE & 5. ORDER_ITEMS SUB-SERVICE
// -------------------------------------------------------------
export const OrdersService = {
  async getAll(): Promise<Order[]> {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapDbOrder);
    } catch (e) {
      console.error("Supabase orders getAll error:", e);
      return [];
    }
  },

  async getById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? mapDbOrder(data) : null;
    } catch (e) {
      console.error("Supabase orders getById error:", e);
      return null;
    }
  },

  async create(order: Order): Promise<Order> {
    const row = mapOrderToDb(order);
    const { data, error } = await supabase.from("orders").insert(row).select().single();
    if (error) throw error;
    return mapDbOrder(data);
  },

  async update(id: string, order: Partial<Order>): Promise<Order | null> {
    const current = await this.getById(id);
    if (!current) throw new Error(`Order with ID ${id} not found.`);
    const merged = { ...current, ...order } as Order;
    const row = mapOrderToDb(merged);
    const { data, error } = await supabase.from("orders").update(row).eq("id", id).select().single();
    if (error) throw error;
    return mapDbOrder(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
};

export const OrderItemsService = {
  async getItemsForOrder(orderId: string) {
    const order = await OrdersService.getById(orderId);
    return order ? order.items : [];
  }
};

// -------------------------------------------------------------
// 5. INVENTORY & STOCK LOGS SERVICE
// -------------------------------------------------------------
export const InventoryService = {
  async getLogs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("inventory_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        const local = localStorage.getItem("clinza_inventory_logs");
        return local ? JSON.parse(local) : [];
      }
      return (data || []).map(row => ({
        id: row.id,
        productId: row.product_id,
        productName: row.product_name,
        sku: row.sku,
        user: row.user_email || row.user_name || "Admin",
        date: row.created_at || new Date().toISOString(),
        previousStock: Number(row.previous_stock || 0),
        newStock: Number(row.new_stock || 0),
        changeAmount: Number(row.change_amount || 0),
        reason: row.reason || "Manual Adjustment",
        warehouse: row.warehouse || "Main Hub - Bay A1"
      }));
    } catch {
      const local = localStorage.getItem("clinza_inventory_logs");
      return local ? JSON.parse(local) : [];
    }
  },

  async logStockChange(log: {
    productId: string;
    productName: string;
    sku: string;
    user: string;
    previousStock: number;
    newStock: number;
    changeAmount: number;
    reason: string;
    warehouse?: string;
  }): Promise<void> {
    const newLog = {
      id: "invlog-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      ...log,
      warehouse: log.warehouse || "Main Hub - Bay A1",
      date: new Date().toISOString()
    };

    // Save locally
    const current = JSON.parse(localStorage.getItem("clinza_inventory_logs") || "[]");
    current.unshift(newLog);
    localStorage.setItem("clinza_inventory_logs", JSON.stringify(current));

    // Async sync to cloud table
    try {
      await supabase.from("inventory_logs").insert({
        id: newLog.id,
        product_id: newLog.productId,
        product_name: newLog.productName,
        sku: newLog.sku,
        user_email: newLog.user,
        previous_stock: newLog.previousStock,
        new_stock: newLog.newStock,
        change_amount: newLog.changeAmount,
        reason: newLog.reason,
        warehouse: newLog.warehouse,
        created_at: newLog.date
      });
    } catch (err) {
      console.warn("Cloud inventory log write fallback active:", err);
    }
  },

  async updateStock(
    productId: string,
    newQuantity: number,
    reason: string,
    userEmail: string = "sastaelectronic6@gmail.com",
    warehouse: string = "Main Hub - Bay A1"
  ): Promise<Product | null> {
    const products = await ProductsService.getAll();
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    const previousStock = (product as any).stockQuantity !== undefined
      ? (product as any).stockQuantity
      : (product.stockStatus === "Out of Stock" ? 0 : 100);

    const changeAmount = newQuantity - previousStock;
    const stockStatus = newQuantity <= 0 ? "Out of Stock" as const : (newQuantity < 10 ? "Low Stock" as const : "In Stock" as const);

    const updatedProduct: Product = {
      ...product,
      stockQuantity: newQuantity,
      stockStatus
    };

    await ProductsService.update(productId, updatedProduct);

    // Create log entry
    await this.logStockChange({
      productId,
      productName: product.name,
      sku: product.sku || `SKU-${productId.slice(0, 6)}`,
      user: userEmail,
      previousStock,
      newStock: newQuantity,
      changeAmount,
      reason,
      warehouse
    });

    return updatedProduct;
  }
};

// -------------------------------------------------------------
// 6. CUSTOMERS SERVICE
// -------------------------------------------------------------
export const CustomersService = {
  async getAll(): Promise<CustomerProfile[]> {
    try {
      const cloudData = await syncCustomersFromCloud();
      if (cloudData && cloudData.length > 0) {
        localStorage.setItem("clinza_customers", JSON.stringify(cloudData));
        return cloudData;
      }
      const local = localStorage.getItem("clinza_customers");
      return local ? JSON.parse(local) : [];
    } catch (e) {
      console.error("Supabase customers getAll error:", e);
      const local = localStorage.getItem("clinza_customers");
      return local ? JSON.parse(local) : [];
    }
  },

  async getById(id: string): Promise<CustomerProfile | null> {
    const customers = await this.getAll();
    const found = customers.find(c => c.id === id || c.email.toLowerCase() === id.toLowerCase());
    return found || null;
  },

  async create(customer: CustomerProfile): Promise<CustomerProfile> {
    await saveCustomerToCloud(customer);
    const current = await this.getAll();
    const updated = [customer, ...current.filter(c => c.id !== customer.id)];
    localStorage.setItem("clinza_customers", JSON.stringify(updated));
    return customer;
  },

  async update(id: string, customer: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
    const currentList = await this.getAll();
    const existing = currentList.find(c => c.id === id || c.email.toLowerCase() === id.toLowerCase());
    if (!existing) {
      console.warn(`Customer profile not found for ${id}`);
      return null;
    }
    const merged: CustomerProfile = { ...existing, ...customer };
    await saveCustomerToCloud(merged);

    const updatedList = currentList.map(c => c.id === existing.id ? merged : c);
    localStorage.setItem("clinza_customers", JSON.stringify(updatedList));
    return merged;
  },

  async delete(id: string): Promise<boolean> {
    await deleteCustomerFromCloud(id);
    const currentList = await this.getAll();
    const updatedList = currentList.filter(c => c.id !== id);
    localStorage.setItem("clinza_customers", JSON.stringify(updatedList));
    return true;
  }
};

// -------------------------------------------------------------
// 7. WISHLIST SERVICE
// -------------------------------------------------------------
export const WishlistService = {
  async getWishlist(customerId?: string): Promise<string[]> {
    if (customerId) {
      const profile = await CustomersService.getById(customerId);
      if (profile) return profile.wishlist || [];
    }
    try {
      const list = localStorage.getItem("clinza_wishlist_db");
      return list ? JSON.parse(list) : [];
    } catch {
      return [];
    }
  },

  async toggle(productId: string, customerId?: string): Promise<string[]> {
    const list = await this.getWishlist(customerId);
    const updated = list.includes(productId) 
      ? list.filter(id => id !== productId) 
      : [...list, productId];
    
    if (customerId) {
      await CustomersService.update(customerId, { wishlist: updated });
    } else {
      localStorage.setItem("clinza_wishlist_db", JSON.stringify(updated));
    }
    return updated;
  }
};

// -------------------------------------------------------------
// 8. CART SERVICE
// -------------------------------------------------------------
export const CartService = {
  async getCart(customerId?: string): Promise<any[]> {
    try {
      const cart = localStorage.getItem("clinza_cart_db");
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  },

  async saveCart(cartItems: any[], customerId?: string): Promise<void> {
    localStorage.setItem("clinza_cart_db", JSON.stringify(cartItems));
  }
};

// -------------------------------------------------------------
// 9. BLOGS SERVICE
// -------------------------------------------------------------
export const BlogsService = {
  async getAll(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase.from("blogs").select("*").order("published_at", { ascending: false });
      if (error) {
        console.warn("Supabase blogs getAll fallback to local initial blog posts:", error.message);
        return INITIAL_BLOGS;
      }
      if (!data || data.length === 0) {
        return INITIAL_BLOGS;
      }
      return data.map(mapDbBlog);
    } catch (e) {
      console.warn("Supabase blogs getAll error fallback to local initial blog posts:", e);
      return INITIAL_BLOGS;
    }
  },

  async getById(id: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase.from("blogs").select("*").or(`id.eq.${id},slug.eq.${id}`).maybeSingle();
      if (error) throw error;
      return data ? mapDbBlog(data) : null;
    } catch (e) {
      console.error("Supabase blogs getById error:", e);
      return null;
    }
  },

  async create(blog: BlogPost): Promise<BlogPost> {
    const row = mapBlogToDb(blog);
    const { data, error } = await supabase.from("blogs").insert(row).select().single();
    if (error) throw error;
    return mapDbBlog(data);
  },

  async update(id: string, blog: Partial<BlogPost>): Promise<BlogPost | null> {
    const current = await this.getById(id);
    if (!current) throw new Error(`Blog with ID ${id} not found.`);
    const merged = { ...current, ...blog } as BlogPost;
    const row = mapBlogToDb(merged);
    const { data, error } = await supabase.from("blogs").update(row).eq("id", id).select().single();
    if (error) throw error;
    return mapDbBlog(data);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
};

// -------------------------------------------------------------
// 10. HOMEPAGE SLIDES & HOMEPAGE SETTINGS SERVICE (CMS)
// -------------------------------------------------------------
export const HomepageSettingsService = {
  async getAll(): Promise<HomepageConfig[]> {
    try {
      const active = await this.getById("homepage");
      if (active) return [active];
    } catch {}
    return [];
  },

  async getById(id: string): Promise<HomepageConfig | null> {
    try {
      const { data, error } = await supabase.from("configs").select("value").eq("key", "homepage").maybeSingle();
      if (error) {
        console.warn("Supabase homepage config fetch notice:", error.message || error);
        return null;
      }
      if (data) return data.value as HomepageConfig;
    } catch (e) {
      console.warn("Supabase homepage config fetch notice:", e);
    }
    return null;
  },

  async create(config: HomepageConfig): Promise<HomepageConfig> {
    return this.update("homepage", config);
  },

  async update(id: string, config: HomepageConfig): Promise<HomepageConfig> {
    const { error } = await supabase.from("configs").upsert({ key: "homepage", value: config }, { onConflict: "key" });
    if (error) throw error;
    return config;
  }
};

export const HomepageSlidesService = {
  async getSlides(): Promise<any[]> {
    try {
      let slides: any[] = [];

      try {
        // Query the configs table used by the Admin CMS theme configuration (the source of truth)
        const { data, error } = await supabase
          .from("configs")
          .select("value")
          .eq("key", "theme_published")
          .maybeSingle();

        if (!error && data?.value?.slides && Array.isArray(data.value.slides) && data.value.slides.length > 0) {
          slides = data.value.slides;
        }
      } catch (dbErr) {
        console.warn("Supabase database fetch error:", dbErr);
      }

      // If DB query returned no slides, check localstorage active theme ONLY if valid slides exist there
      if (slides.length === 0) {
        try {
          const localTheme = localStorage.getItem("clinza_theme_active");
          if (localTheme) {
            const parsed = JSON.parse(localTheme);
            if (parsed?.slides && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
              slides = parsed.slides;
            }
          }
        } catch (localErr) {
          console.warn("Local storage active theme check error:", localErr);
        }
      }

      // Filter and map ONLY valid slides received from Supabase or published configuration
      return slides
        .filter((slide: any) => slide && slide.enabled !== false && (slide.desktopImage || slide.mobileImage || slide.image || slide.image_url))
        .map((slide: any) => {
          const desktopImage = slide.desktopImage || slide.image || slide.image_url || slide.mobileImage || "";
          const mobileImage = slide.mobileImage || slide.desktopImage || slide.image || slide.image_url || "";
          return {
            id: slide.id || `slide-${Math.random()}`,
            title: slide.title || "",
            subtitle: slide.subtitle || "",
            description: slide.description || "",
            image: desktopImage,
            desktopImage,
            mobileImage,
            badge: slide.badge || "FEATURED",
            route: slide.button1Link || slide.route || "collections/all",
            button1Text: slide.button1Text || "Shop Collection",
            button1Link: slide.button1Link || slide.route || "collections/all",
            button2Text: slide.button2Text || "",
            button2Link: slide.button2Link || ""
          };
        });
    } catch (e) {
      console.error("Supabase slider loading error:", e);
      return [];
    }
  },
  async create(slide: any): Promise<any> {
    const row = {
      id: slide.id || `slide-${Date.now()}`,
      title: slide.title,
      subtitle: slide.subtitle,
      image_url: slide.image,
      button_text: slide.button1Text || slide.button_text || "Shop Collection",
      button_link: slide.button1Link || slide.button_link || "collections/all",
      order_index: slide.order_index || 0
    };
    const { data, error } = await supabase.from("homepage_slides").insert(row).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, slide: any): Promise<any> {
    const row = {
      title: slide.title,
      subtitle: slide.subtitle,
      image_url: slide.image,
      button_text: slide.button1Text || slide.button_text,
      button_link: slide.button1Link || slide.button_link,
      order_index: slide.order_index
    };
    const { data, error } = await supabase.from("homepage_slides").update(row).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("homepage_slides").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
};

// -------------------------------------------------------------
// 11. THEME EDITOR SERVICE
// -------------------------------------------------------------
export const ThemeSettingsService = {
  async getAll(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("theme_settings").select("*");
      if (error) throw error;
      return (data || []).map(row => ({
        primaryColor: row.brand_primary || "#000000",
        secondaryColor: row.brand_secondary || "#ffffff",
        fontFamily: row.font_family || "Inter",
        isDarkMode: !!row.is_dark_mode
      }));
    } catch (e) {
      console.error("Supabase theme_settings error:", e);
      return [];
    }
  },

  async getById(id: string): Promise<any | null> {
    const dbKey = id === "draft" || id === "theme_draft" ? "draft" : "active";
    try {
      const { data, error } = await supabase.from("theme_settings").select("*").eq("key", dbKey).maybeSingle();
      if (error) throw error;
      if (data) {
        return {
          primaryColor: data.brand_primary || "#000000",
          secondaryColor: data.brand_secondary || "#ffffff",
          fontFamily: data.font_family || "Inter",
          isDarkMode: !!data.is_dark_mode
        };
      }
    } catch (e) {
      console.error("Supabase theme_settings getById error:", e);
    }
    return null;
  },

  async update(id: string, theme: any): Promise<any> {
    const dbKey = id === "draft" || id === "theme_draft" ? "draft" : "active";
    const row = {
      key: dbKey,
      brand_primary: theme.primaryColor || "#000000",
      brand_secondary: theme.secondaryColor || "#ffffff",
      font_family: theme.fontFamily || "Inter",
      is_dark_mode: theme.isDarkMode || false,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from("theme_settings").upsert(row, { onConflict: "key" });
    if (error) throw error;
    return theme;
  }
};

// -------------------------------------------------------------
// 12. COUPON_CODES SERVICE
// -------------------------------------------------------------
export const CouponCodesService = {
  async getAll(): Promise<Coupon[]> {
    try {
      const { data, error } = await supabase.from("coupon_codes").select("*").order("code");
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Supabase coupon_codes getAll error:", e);
      return [];
    }
  },

  async getByCode(code: string): Promise<Coupon | null> {
    try {
      const { data, error } = await supabase.from("coupon_codes").select("*").eq("code", code.toUpperCase().trim()).maybeSingle();
      if (error) throw error;
      return data || null;
    } catch (e) {
      console.error("Supabase getByCode error:", e);
      return null;
    }
  },

  async create(coupon: Coupon): Promise<Coupon> {
    const { data, error } = await supabase.from("coupon_codes").insert(coupon).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("coupon_codes").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
};

// -------------------------------------------------------------
// 13. ADMIN_USERS & AUDIT LOG SERVICES
// -------------------------------------------------------------
export const AdminUsersService = {
  async getAdminByEmail(email: string): Promise<{ name: string; email: string; role: string } | null> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (data) {
        return {
          name: data.name || "Clinza Admin",
          email: data.email,
          role: data.role || "Super Admin"
        };
      }

      if (cleanEmail === "admin@clinza.in" || cleanEmail === "sastaelectronic6@gmail.com") {
        await supabase.from("admin_users").upsert({
          email: cleanEmail,
          name: "Clinza Admin",
          role: "Super Admin"
        }, { onConflict: "email" });

        return {
          name: "Clinza Admin",
          email: cleanEmail,
          role: "Super Admin"
        };
      }
    } catch (err) {
      console.error("Failed to fetch admin details from Supabase:", err);
      if (cleanEmail === "admin@clinza.in" || cleanEmail === "sastaelectronic6@gmail.com") {
        return {
          name: "Clinza Admin",
          email: cleanEmail,
          role: "Super Admin"
        };
      }
    }
    
    return null;
  }
};

export const AdminAuditLogService = {
  async logActivity(
    email: string,
    name: string,
    action: string,
    affectedRecord?: string,
    ipAddress?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("admin_audit_logs").insert({
        admin_email: email,
        admin_name: name,
        action,
        affected_record: affectedRecord || null,
        ip_address: ipAddress || null
      });
      if (error) {
        // If the table does not exist or schema is not yet provisioned, fail silently without disrupting core CRUD
        if (error.code === "PGRST205" || error.message?.includes("admin_audit_logs")) {
          return false;
        }
        console.warn("Audit log write notice:", error.message);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  async getLogs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        if (error.code === "PGRST205" || error.message?.includes("admin_audit_logs")) {
          return [];
        }
        console.warn("Audit logs fetch notice:", error.message);
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  }
};

// -------------------------------------------------------------
// 14. REVIEWS SERVICE (Direct connection to standalone table)
// -------------------------------------------------------------
export const ReviewsService = {
  async getAll(): Promise<ReviewItem[]> {
    try {
      const { data, error } = await supabase.from("reviews").select("*").order("date", { ascending: false });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        productId: row.product_id ?? row.productId,
        productName: row.product_name ?? row.productName,
        rating: Number(row.rating),
        userName: row.user_name ?? row.userName,
        comment: row.comment,
        location: row.location,
        approved: !!row.approved,
        date: row.date
      }));
    } catch (e) {
      console.error("Supabase reviews getAll error:", e);
      return [];
    }
  },

  async addReview(productId: string, rating: number, userName: string, comment: string, location: string = "India"): Promise<boolean> {
    const product = await ProductsService.getById(productId);
    const id = "rev-" + Math.random().toString(36).substring(2, 9);
    try {
      const { error } = await supabase.from("reviews").insert({
        id,
        product_id: productId,
        product_name: product ? product.name : "Product",
        rating,
        user_name: userName,
        comment,
        location,
        approved: true,
        date: new Date().toISOString()
      });
      if (error) throw error;

      // Also sync nested review array in product
      if (product) {
        const newRev = {
          id,
          rating,
          userName,
          comment,
          location,
          verified: true,
          date: new Date().toISOString().split("T")[0]
        };
        const updatedReviews = [...(product.reviews || []), newRev];
        await ProductsService.update(product.id, { reviews: updatedReviews });
      }
      return true;
    } catch (e) {
      console.error("Supabase addReview error:", e);
      return false;
    }
  }
};

// -------------------------------------------------------------
// 14b. PRODUCT REVIEWS SERVICE (Dedicated product_reviews table & storage bucket)
// -------------------------------------------------------------

const REVIEWS_STORAGE_KEY = "clinza_product_reviews_v2";

const INITIAL_PRODUCT_REVIEWS: ProductReview[] = [
  {
    id: "rev-sky-1",
    productId: "sky-blue-premium-linen-shirt",
    customerName: "Aarav Sharma",
    customerLocation: "Mumbai",
    customerEmail: "aarav.sharma@example.com",
    rating: 5,
    reviewTitle: "Unbelievable Linen Quality & Fit!",
    reviewText: "The sky blue shade is even richer in person. Bio-washed linen feels extremely soft against skin and breathes so well in humid weather. Tailoring is sharp around shoulders.",
    reviewImage: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/shirts/clinza%20linen%20skyblue%20shirt%20(2).png",
    reviewGallery: [
      "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/shirts/clinza%20linen%20skyblue%20shirt%20(2).png",
      "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/shirts/clinza%20linen%20skyblue%20shirt%20(3).png"
    ],
    verifiedPurchase: true,
    displayOrder: 1,
    helpfulCount: 24,
    isFeatured: true,
    isActive: true,
    createdAt: "2026-07-20T10:15:00Z"
  },
  {
    id: "rev-sky-2",
    productId: "sky-blue-premium-linen-shirt",
    customerName: "Rohan Varma",
    customerLocation: "Bengaluru",
    customerEmail: "rohan.v@example.com",
    rating: 5,
    reviewTitle: "Perfect Summer Resort Wear",
    reviewText: "Wore this to a beach resort and got multiple compliments. The fabric has an organic drape that looks incredibly premium.",
    reviewImage: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/shirts/clinza%20linen%20skyblue%20shirt%20(4).png",
    reviewGallery: [
      "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/shirts/clinza%20linen%20skyblue%20shirt%20(4).png"
    ],
    verifiedPurchase: true,
    displayOrder: 2,
    helpfulCount: 18,
    isFeatured: true,
    isActive: true,
    createdAt: "2026-07-22T14:30:00Z"
  },
  {
    id: "rev-sky-3",
    productId: "sky-blue-premium-linen-shirt",
    customerName: "Karan Patel",
    customerLocation: "Ahmedabad",
    customerEmail: "karan.p@example.com",
    rating: 5,
    reviewTitle: "Great Stitching & Fast Delivery",
    reviewText: "Received in 2 days. The buttons and collar stitching feel very durable. 100% genuine bio-washed linen.",
    verifiedPurchase: true,
    displayOrder: 3,
    helpfulCount: 11,
    isFeatured: false,
    isActive: true,
    createdAt: "2026-07-25T09:00:00Z"
  },
  {
    id: "rev-ita-1",
    productId: "prod-italian-white-linen",
    customerName: "Vikramaditya Roy",
    customerLocation: "New Delhi",
    customerEmail: "vikram.roy@example.com",
    rating: 5,
    reviewTitle: "Luxury Italian Linen at its finest",
    reviewText: "Elegant spread collar and immaculate finish. Lightweight and classy for evening dinners.",
    verifiedPurchase: true,
    displayOrder: 1,
    helpfulCount: 32,
    isFeatured: true,
    isActive: true,
    createdAt: "2026-06-15T18:20:00Z"
  }
];

function mapDbProductReview(row: any): ProductReview {
  return {
    id: row.id || `rev-${Math.random().toString(36).substring(2, 9)}`,
    productId: row.product_id || row.productId || "",
    customerName: row.customer_name || row.customerName || row.userName || "Verified Customer",
    customerLocation: row.customer_location || row.customerLocation || row.location || "India",
    customerEmail: row.customer_email || row.customerEmail || "",
    rating: Number(row.rating) || 5,
    reviewTitle: row.review_title || row.reviewTitle || "Excellent Product",
    reviewText: row.review_text || row.reviewText || row.comment || "",
    reviewImage: row.review_image || row.reviewImage || undefined,
    reviewGallery: Array.isArray(row.review_gallery) 
      ? row.review_gallery 
      : (Array.isArray(row.reviewGallery) ? row.reviewGallery : (row.review_image ? [row.review_image] : [])),
    verifiedPurchase: row.verified_purchase !== undefined ? !!row.verified_purchase : true,
    displayOrder: Number(row.display_order ?? row.displayOrder ?? 0),
    helpfulCount: Number(row.helpful_count ?? row.helpfulCount ?? 0),
    isFeatured: !!(row.is_featured ?? row.isFeatured),
    isActive: row.is_active !== undefined ? !!row.is_active : true,
    createdAt: row.created_at || row.createdAt || row.date || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt
  };
}

function mapProductReviewToDb(rev: Partial<ProductReview>): any {
  return {
    id: rev.id,
    product_id: rev.productId,
    customer_name: rev.customerName,
    customer_location: rev.customerLocation || "India",
    customer_email: rev.customerEmail || null,
    rating: rev.rating,
    review_title: rev.reviewTitle,
    review_text: rev.reviewText,
    review_image: rev.reviewImage || null,
    review_gallery: rev.reviewGallery && rev.reviewGallery.length > 0 ? rev.reviewGallery : null,
    verified_purchase: rev.verifiedPurchase ?? true,
    display_order: rev.displayOrder ?? 0,
    helpful_count: rev.helpfulCount ?? 0,
    is_featured: rev.isFeatured ?? false,
    is_active: rev.isActive ?? true,
    created_at: rev.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function getLocalProductReviews(): ProductReview[] {
  if (typeof window === "undefined") return INITIAL_PRODUCT_REVIEWS;
  const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCT_REVIEWS));
    return INITIAL_PRODUCT_REVIEWS;
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCT_REVIEWS;
  } catch {
    return INITIAL_PRODUCT_REVIEWS;
  }
}

function saveLocalProductReviews(list: ProductReview[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));
  }
}

export const ProductReviewsService = {
  async getReviews(includeInactive = false): Promise<ProductReview[]> {
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        const list = data.map(mapDbProductReview);
        const filtered = includeInactive ? list : list.filter(r => r.isActive);
        saveLocalProductReviews(list);
        return filtered;
      }
    } catch (e) {
      console.warn("ProductReviewsService.getReviews Supabase warning, using local cache fallback:", e);
    }
    const local = getLocalProductReviews();
    return includeInactive ? local : local.filter(r => r.isActive);
  },

  async getProductReviews(productId: string, includeInactive = false): Promise<ProductReview[]> {
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        const list = data.map(mapDbProductReview);
        return includeInactive ? list : list.filter(r => r.isActive);
      }
    } catch (e) {
      console.warn("ProductReviewsService.getProductReviews Supabase warning, using local fallback:", e);
    }
    const all = getLocalProductReviews();
    const matches = all.filter(r => r.productId === productId || (r.productId && r.productId.toLowerCase() === productId.toLowerCase()));
    return includeInactive ? matches : matches.filter(r => r.isActive);
  },

  async createReview(reviewData: Omit<ProductReview, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string }): Promise<ProductReview | null> {
    const id = reviewData.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = reviewData.createdAt || new Date().toISOString();
    const newReview: ProductReview = {
      id,
      productId: reviewData.productId,
      customerName: reviewData.customerName,
      customerLocation: reviewData.customerLocation || "India",
      customerEmail: reviewData.customerEmail,
      rating: Math.min(5, Math.max(1, Number(reviewData.rating) || 5)),
      reviewTitle: reviewData.reviewTitle || "Great product",
      reviewText: reviewData.reviewText || "",
      reviewImage: reviewData.reviewImage,
      reviewGallery: reviewData.reviewGallery || (reviewData.reviewImage ? [reviewData.reviewImage] : []),
      verifiedPurchase: reviewData.verifiedPurchase ?? true,
      displayOrder: reviewData.displayOrder ?? 0,
      helpfulCount: reviewData.helpfulCount ?? 0,
      isFeatured: !!reviewData.isFeatured,
      isActive: reviewData.isActive ?? true,
      createdAt,
      updatedAt: new Date().toISOString()
    };

    const localList = getLocalProductReviews();
    const updatedLocal = [newReview, ...localList];
    saveLocalProductReviews(updatedLocal);

    try {
      const dbRow = mapProductReviewToDb(newReview);
      const { error } = await supabase.from("product_reviews").insert(dbRow);
      if (error) {
        console.warn("Supabase product_reviews insert notice:", error.message);
      }
    } catch (e) {
      console.warn("Supabase insert catch:", e);
    }

    return newReview;
  },

  async updateReview(id: string, reviewData: Partial<ProductReview>): Promise<boolean> {
    const localList = getLocalProductReviews();
    const updatedLocal = localList.map(r => r.id === id ? { ...r, ...reviewData, updatedAt: new Date().toISOString() } : r);
    saveLocalProductReviews(updatedLocal);

    try {
      const target = updatedLocal.find(r => r.id === id);
      if (target) {
        const dbRow = mapProductReviewToDb(target);
        const { error } = await supabase.from("product_reviews").update(dbRow).eq("id", id);
        if (error) console.warn("Supabase update error:", error);
      }
      return true;
    } catch (e) {
      console.warn("Supabase update catch:", e);
      return true;
    }
  },

  async deleteReview(id: string): Promise<boolean> {
    const localList = getLocalProductReviews();
    const updatedLocal = localList.filter(r => r.id !== id);
    saveLocalProductReviews(updatedLocal);

    try {
      const { error } = await supabase.from("product_reviews").delete().eq("id", id);
      if (error) console.warn("Supabase delete error:", error);
      return true;
    } catch (e) {
      console.warn("Supabase delete catch:", e);
      return true;
    }
  },

  async toggleReview(id: string, isActive: boolean): Promise<boolean> {
    return this.updateReview(id, { isActive });
  },

  async incrementHelpfulCount(id: string): Promise<number> {
    const localList = getLocalProductReviews();
    const target = localList.find(r => r.id === id);
    const newCount = (target?.helpfulCount || 0) + 1;
    await this.updateReview(id, { helpfulCount: newCount });
    return newCount;
  },

  async reorderReviews(reorderedList: { id: string; displayOrder: number }[]): Promise<boolean> {
    const localList = getLocalProductReviews();
    const updatedLocal = localList.map(r => {
      const match = reorderedList.find(item => item.id === r.id);
      return match ? { ...r, displayOrder: match.displayOrder } : r;
    });
    saveLocalProductReviews(updatedLocal);

    try {
      for (const item of reorderedList) {
        await supabase.from("product_reviews").update({ display_order: item.displayOrder }).eq("id", item.id);
      }
    } catch (e) {
      console.warn("Supabase reorder catch:", e);
    }
    return true;
  },

  async uploadReviewImage(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `reviews/${fileName}`;

      const { error } = await supabase.storage.from("review-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true
      });

      if (!error) {
        const { data: publicUrlData } = supabase.storage.from("review-images").getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (e) {
      console.warn("Supabase review-images storage upload warning:", e);
    }

    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve("https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/shirts/clinza%20linen%20skyblue%20shirt%20(2).png");
      reader.readAsDataURL(file);
    });
  },

  calculateAverageRating(reviews: ProductReview[]) {
    const active = reviews.filter(r => r.isActive !== false);
    const total = active.length;
    if (total === 0) {
      return {
        averageRating: 5.0,
        totalReviews: 0,
        verifiedCount: 0,
        starDistribution: {
          5: { count: 0, percentage: 0 },
          4: { count: 0, percentage: 0 },
          3: { count: 0, percentage: 0 },
          2: { count: 0, percentage: 0 },
          1: { count: 0, percentage: 0 }
        }
      };
    }

    const sum = active.reduce((acc, r) => acc + (r.rating || 5), 0);
    const averageRating = Number((sum / total).toFixed(1));
    const verifiedCount = active.filter(r => r.verifiedPurchase).length;

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    active.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });

    const starDistribution: Record<number, { count: number; percentage: number }> = {
      5: { count: counts[5], percentage: Math.round((counts[5] / total) * 100) },
      4: { count: counts[4], percentage: Math.round((counts[4] / total) * 100) },
      3: { count: counts[3], percentage: Math.round((counts[3] / total) * 100) },
      2: { count: counts[2], percentage: Math.round((counts[2] / total) * 100) },
      1: { count: counts[1], percentage: Math.round((counts[1] / total) * 100) }
    };

    return {
      averageRating,
      totalReviews: total,
      verifiedCount,
      starDistribution
    };
  }
};

// -------------------------------------------------------------
// 15. FAQ SERVICE
// -------------------------------------------------------------
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const FAQService = {
  async getAll(): Promise<FaqItem[]> {
    try {
      const { data, error } = await supabase.from("faq").select("*");
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Supabase faq getAll error:", e);
      return [];
    }
  },

  async create(faq: FaqItem): Promise<FaqItem> {
    const { data, error } = await supabase.from("faq").insert(faq).select().single();
    if (error) throw error;
    return data;
  }
};

// -------------------------------------------------------------
// 16. ADDRESSES SERVICE
// -------------------------------------------------------------
export const AddressesService = {
  async getForUser(userEmail: string): Promise<Address[]> {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_email", userEmail.trim().toLowerCase());
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        addressLine: row.address_line ?? row.addressLine,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        isDefault: !!row.is_default
      }));
    } catch (e) {
      console.error("Supabase addresses getForUser error:", e);
      return [];
    }
  },

  async save(userEmail: string, address: Address): Promise<Address> {
    const row = {
      id: address.id,
      user_email: userEmail.trim().toLowerCase(),
      name: address.name,
      phone: address.phone,
      address_line: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: address.isDefault,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from("addresses").upsert(row, { onConflict: "id" });
    if (error) throw error;
    return address;
  },

  async delete(addressId: string): Promise<boolean> {
    const { error } = await supabase.from("addresses").delete().eq("id", addressId);
    if (error) throw error;
    return true;
  }
};

// -------------------------------------------------------------
// 17. ORDER RETURNS SERVICE
// -------------------------------------------------------------
export const OrderReturnsService = {
  async getAll(): Promise<OrderReturnRequest[]> {
    try {
      const { data, error } = await supabase
        .from("order_returns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        orderId: row.order_id ?? row.orderId,
        customerEmail: row.customer_email ?? row.customerEmail,
        type: row.type,
        items: row.items,
        reason: row.reason,
        description: row.description,
        imageProofUrl: row.image_proof_url ?? row.imageProofUrl,
        status: row.status,
        createdAt: row.created_at ?? row.createdAt
      }));
    } catch (e) {
      console.error("Supabase order_returns getAll error:", e);
      return [];
    }
  },

  async getForUser(userEmail: string): Promise<OrderReturnRequest[]> {
    try {
      const { data, error } = await supabase
        .from("order_returns")
        .select("*")
        .eq("customer_email", userEmail.trim().toLowerCase())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        orderId: row.order_id ?? row.orderId,
        customerEmail: row.customer_email ?? row.customerEmail,
        type: row.type,
        items: row.items,
        reason: row.reason,
        description: row.description,
        imageProofUrl: row.image_proof_url ?? row.imageProofUrl,
        status: row.status,
        createdAt: row.created_at ?? row.createdAt
      }));
    } catch (e) {
      console.error("Supabase order_returns getForUser error:", e);
      return [];
    }
  },

  async create(req: OrderReturnRequest): Promise<OrderReturnRequest> {
    const { error } = await supabase
      .from("order_returns")
      .insert({
        id: req.id,
        order_id: req.orderId,
        customer_email: req.customerEmail.trim().toLowerCase(),
        type: req.type,
        items: req.items,
        reason: req.reason,
        description: req.description,
        image_proof_url: req.imageProofUrl || "",
        status: req.status,
        created_at: req.createdAt
      });
    if (error) throw error;
    return req;
  },

  async updateStatus(id: string, status: any): Promise<boolean> {
    const { error } = await supabase
      .from("order_returns")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    return true;
  }
};

// -------------------------------------------------------------
// 18. NEWSLETTER SUBSCRIBERS SERVICE
// -------------------------------------------------------------
export const NewsletterSubscribersService = {
  async getAll(): Promise<string[]> {
    try {
      const { data, error } = await supabase.from("newsletter_subscribers").select("email");
      if (error) throw error;
      return (data || []).map(row => row.email);
    } catch (e) {
      console.error("Supabase newsletter_subscribers error:", e);
      return [];
    }
  },
  async subscribe(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim() });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase newsletter subscribe error:", e);
      return false;
    }
  }
};

// -------------------------------------------------------------
// 19. CONTACT MESSAGES SERVICE
// -------------------------------------------------------------
export const ContactMessagesService = {
  async getAll(): Promise<any[]> {
    try {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Supabase contact_messages error:", e);
      return [];
    }
  },
  async create(msg: { name: string; email: string; phone?: string; message: string }): Promise<boolean> {
    try {
      const { error } = await supabase.from("contact_messages").insert(msg);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase contact_messages create error:", e);
      return false;
    }
  }
};

// -------------------------------------------------------------
// STRUCTURAL MAPPING UTILITIES
// -------------------------------------------------------------
function parseSeoKeywords(raw: any, defaultFallback: string = ""): string {
  if (Array.isArray(raw)) {
    return raw.filter(Boolean).map((k: any) => String(k).trim()).filter(Boolean).join(", ");
  }
  if (typeof raw === "string") {
    return raw.trim();
  }
  return defaultFallback;
}

export function mapDbProduct(row: any): Product {
  try {
    const baseColors = Array.isArray(row.colors) ? row.colors : [];
    const baseSizes = Array.isArray(row.sizes) ? row.sizes : [];
    const baseSku = row.sku || "CLN-PROD";
    const basePrice = Number(row.price || 0);
    const baseOriginalPrice = Number(row.original_price ?? row.originalPrice ?? row.price ?? 0);
    const baseImages = Array.isArray(row.images) ? row.images.filter(Boolean) : [];

    let variants = Array.isArray(row.variants) ? row.variants : [];
    if (variants.length === 0 && (baseColors.length > 0 || baseSizes.length > 0)) {
      variants = generateVariantsForProduct(baseColors, baseSizes, baseSku, basePrice, baseOriginalPrice, baseImages);
    }

    const calculatedStock = variants.length > 0
      ? variants.reduce((sum: number, v: any) => sum + Number(v?.stockQuantity || 0), 0)
      : Number(row.stock_quantity ?? row.stockQuantity ?? 50);

    const productName = row.name ? String(row.name) : "Untitled Product";
    const productCategory = row.category ? String(row.category) : "General";
    const productFabric = row.fabric ? String(row.fabric) : "100% Pure Italian Linen";
    const productBrand = row.brand ? String(row.brand) : "CLINZA Luxury";
    const productSlug = row.slug || row.id || (productName ? productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "product");

    const mapped: Product = {
      id: String(row.id || ""),
      name: productName,
      slug: productSlug,
      price: basePrice,
      originalPrice: baseOriginalPrice,
      collection: (row.collection as ProductCollection) || ProductCollection.SHIRTS,
      category: productCategory,
      images: baseImages,
      hoverImage: row.hover_image ?? row.hoverImage ?? row.hover_url ?? row.hoverUrl ?? (baseImages[1] || baseImages[0] || ""),
      view360Images: Array.isArray(row.view_360_images) ? row.view_360_images : (Array.isArray(row.view360Images) ? row.view360Images : []),
      videoUrl: row.video_url ?? row.videoUrl ?? "",
      imageAltTexts: typeof row.image_alt_texts === "object" && row.image_alt_texts !== null ? row.image_alt_texts : (typeof row.imageAltTexts === "object" && row.imageAltTexts !== null ? row.imageAltTexts : {}),
      colors: baseColors,
      sizes: baseSizes,
      variants: variants,
      stockStatus: row.stock_status || row.stockStatus || (calculatedStock <= 0 ? "Out of Stock" : calculatedStock <= 5 ? "Low Stock" : "In Stock"),
      stockQuantity: calculatedStock,
      lowStockLimit: Number(row.low_stock_limit ?? row.lowStockLimit ?? 5),
      sku: baseSku,
      barcode: row.barcode || `890${Math.abs(row.id ? String(row.id).split('').reduce((a:number,b:string)=>a+b.charCodeAt(0),0) : 1000000000).toString().padStart(10, '0')}`,
      brand: productBrand,
      rating: Number(row.rating || 5.0),
      reviews: Array.isArray(row.reviews) ? row.reviews : [],
      reviewsCount: Number(row.reviews_count ?? row.reviewsCount ?? (Array.isArray(row.reviews) ? row.reviews.length : (row.rating ? Math.floor(row.rating * 12) : 18))),
      description: row.description || "",
      shortDescription: row.short_description ?? row.shortDescription ?? "",
      
      // Apparel Specifications
      fabric: productFabric,
      fit: row.fit || "Tailored Fit",
      pattern: row.pattern || "Solid",
      sleeve: row.sleeve || "Full Sleeve",
      occasion: row.occasion || "Resort & Casual Wear",
      season: row.season || "Spring / Summer 2026",
      countryOfOrigin: row.country_of_origin ?? row.countryOfOrigin ?? "Italy / India",
      fabricCare: row.fabric_care ?? row.fabricCare ?? "Dry Clean or Gentle Cold Hand Wash. Do not tumble dry.",
      shippingInfo: row.shipping_info ?? row.shippingInfo ?? "Ships in 24-48 hours with complimentary express delivery across India.",

      specifications: Array.isArray(row.specifications) ? row.specifications : [],
      aPlusContent: (function() {
        const raw = row.a_plus_content ?? row.aPlusContent;
        if (typeof raw === "object" && raw !== null) {
          return {
            title: typeof raw.title === "string" ? raw.title : "",
            description: typeof raw.description === "string" ? raw.description : "",
            features: Array.isArray(raw.features) ? raw.features : []
          };
        }
        return { title: "", description: "", features: [] };
      })(),
      isTrending: !!(row.is_trending ?? row.isTrending),
      isNewArrival: !!(row.is_new_arrival ?? row.isNewArrival),
      trendingRank: row.trending_rank !== undefined && row.trending_rank !== null ? Number(row.trending_rank) : (row.trendingRank !== undefined && row.trendingRank !== null ? Number(row.trendingRank) : (row.display_order ? Number(row.display_order) : undefined)),
      demandBadge: row.demand_badge ?? row.demandBadge,
      merchandisingSlugs: Array.isArray(row.merchandising_slugs) ? row.merchandising_slugs : (Array.isArray(row.merchandisingSlugs) ? row.merchandisingSlugs : []),
      promotionIds: Array.isArray(row.promotion_ids) ? row.promotion_ids : (Array.isArray(row.promotionIds) ? row.promotionIds : []),
      
      // SEO
      seoTitle: row.seo_title ?? row.seoTitle ?? `${productName} | CLINZA Luxury Apparel`,
      metaDescription: row.meta_description ?? row.metaDescription ?? row.description ?? "",
      seoKeywords: parseSeoKeywords(row.seo_keywords ?? row.seoKeywords, `${productName}, ${productCategory}, ${productFabric}, ${productBrand}`),
      canonicalUrl: row.canonical_url ?? row.canonicalUrl ?? `https://www.clinza.in/product/${productSlug}`,
      seoImage: row.seo_image ?? row.seoImage ?? (baseImages[0] || ""),
      jsonLdSchema: row.json_ld_schema ?? row.jsonLdSchema
    };

    return mapped;
  } catch (err: any) {
    console.error("mapDbProduct error on row:", row, err);
    throw err;
  }
}

export function mapProductToDb(product: Product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    original_price: product.originalPrice,
    collection: product.collection,
    category: product.category,
    images: Array.isArray(product.images) ? product.images : [],
    hover_image: product.hoverImage || (product as any).hoverUrl || (product as any).hover_url || "",
    view_360_images: Array.isArray(product.view360Images) ? product.view360Images : [],
    video_url: product.videoUrl || "",
    image_alt_texts: product.imageAltTexts || {},
    colors: Array.isArray(product.colors) ? product.colors : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    variants: Array.isArray(product.variants) ? product.variants : [],
    stock_status: product.stockStatus || "In Stock",
    stock_quantity: product.stockQuantity ?? 50,
    low_stock_limit: product.lowStockLimit ?? 5,
    sku: product.sku || "CLN-PROD",
    barcode: product.barcode || "",
    brand: product.brand || "CLINZA Luxury",
    rating: product.rating ?? 5.0,
    reviews: Array.isArray(product.reviews) ? product.reviews : [],
    description: product.description || "",
    short_description: product.shortDescription || "",
    
    fabric: product.fabric || "",
    fit: product.fit || "",
    pattern: product.pattern || "",
    sleeve: product.sleeve || "",
    occasion: product.occasion || "",
    season: product.season || "",
    country_of_origin: product.countryOfOrigin || "",
    fabric_care: product.fabricCare || "",
    shipping_info: product.shippingInfo || "",

    specifications: Array.isArray(product.specifications) ? product.specifications : [],
    a_plus_content: product.aPlusContent || { title: "", description: "", features: [] },
    is_trending: product.isTrending || false,
    is_new_arrival: product.isNewArrival || false,
    trending_rank: product.trendingRank ?? null,
    demand_badge: product.demandBadge || null,
    merchandising_slugs: Array.isArray(product.merchandisingSlugs) ? product.merchandisingSlugs : [],
    promotion_ids: Array.isArray(product.promotionIds) ? product.promotionIds : [],

    seo_title: product.seoTitle || "",
    meta_description: product.metaDescription || "",
    seo_keywords: parseSeoKeywords(product.seoKeywords, ""),
    canonical_url: product.canonicalUrl || "",
    seo_image: product.seoImage || "",
    json_ld_schema: product.jsonLdSchema || null
  };
}

function mapDbOrder(row: any): Order {
  const parsedItems = (Array.isArray(row.items) ? row.items : []).map((it: any) => ({
    productId: it.productId || it.product_id || "",
    name: it.name || it.product_name || "Apparel Item",
    price: Number(it.price || it.unit_price || 0),
    quantity: Number(it.quantity || it.qty || 1),
    size: it.size || "",
    color: it.color || "",
    image: it.image || it.image_url || ""
  }));

  const itemsSubtotal = parsedItems.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0);
  const parsedTotal = Number(row.total_amount ?? row.totalAmount ?? 0);
  const parsedSubtotal = Number(row.subtotal ?? row.sub_total ?? (itemsSubtotal > 0 ? itemsSubtotal : parsedTotal));

  return {
    id: row.id,
    customer: row.customer,
    items: parsedItems,
    subtotal: parsedSubtotal,
    discount: Number(row.discount ?? row.discount_amount ?? 0),
    shippingFee: Number(row.shipping_fee ?? row.shippingFee ?? 0),
    tax: Number(row.tax ?? 0),
    couponCode: row.coupon_code ?? row.couponCode ?? null,
    totalAmount: parsedTotal > 0 ? parsedTotal : parsedSubtotal,
    status: row.status || "Pending",
    paymentMethod: row.payment_method ?? row.paymentMethod ?? "COD",
    paymentStatus: row.payment_status ?? row.paymentStatus ?? (row.status === "Delivered" ? "Paid" : "Pending"),
    trackingHistory: Array.isArray(row.tracking_history) ? row.tracking_history : (Array.isArray(row.trackingHistory) ? row.trackingHistory : []),
    trackingNumber: row.tracking_number ?? row.trackingNumber,
    courierPartner: row.courier_partner ?? row.courierPartner,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    notes: Array.isArray(row.notes) ? row.notes : []
  };
}

function mapOrderToDb(order: Order) {
  return {
    id: order.id,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping_fee: order.shippingFee !== undefined ? order.shippingFee : order.shipping_fee,
    tax: order.tax,
    coupon_code: order.couponCode || order.coupon_code,
    total_amount: order.totalAmount,
    status: order.status,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus || (order.status === "Delivered" ? "Paid" : "Pending"),
    tracking_history: order.trackingHistory,
    tracking_number: order.trackingNumber,
    courier_partner: order.courierPartner,
    created_at: order.createdAt,
    notes: order.notes || []
  };
}

function mapDbBlog(row: any): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    coverImage: row.cover_image ?? row.coverImage,
    category: row.category,
    publishedAt: row.published_at ?? row.publishedAt,
    author: row.author || { name: "", avatarUrl: "", bio: "" },
    tags: Array.isArray(row.tags) ? row.tags : [],
    readTime: row.read_time ?? row.readTime ?? "4 min"
  };
}

function mapBlogToDb(blog: BlogPost) {
  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    summary: blog.summary,
    content: blog.content,
    cover_image: blog.coverImage,
    category: blog.category,
    published_at: blog.publishedAt,
    author: blog.author,
    tags: blog.tags,
    read_time: blog.readTime
  };
}

// -------------------------------------------------------------
// PROMOTIONS SERVICE
// -------------------------------------------------------------
export const PromotionsService = {
  async getAll(): Promise<Promotion[]> {
    try {
      const raw = localStorage.getItem("clinza_promotions_master");
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse clinza_promotions_master:", e);
    }
    return [];
  },
  async save(promo: Promotion): Promise<Promotion> {
    const list = await this.getAll();
    const idx = list.findIndex(p => p.id === promo.id);
    if (idx >= 0) list[idx] = promo;
    else list.push(promo);
    localStorage.setItem("clinza_promotions_master", JSON.stringify(list));
    return promo;
  },
  async create(promo: Promotion): Promise<Promotion> {
    return this.save(promo);
  },
  async update(id: string, promo: Partial<Promotion>): Promise<Promotion> {
    const list = await this.getAll();
    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...promo };
      localStorage.setItem("clinza_promotions_master", JSON.stringify(list));
      return list[idx];
    }
    return promo as Promotion;
  },
  async delete(id: string): Promise<void> {
    const list = await this.getAll();
    const filtered = list.filter(p => p.id !== id);
    localStorage.setItem("clinza_promotions_master", JSON.stringify(filtered));
  }
};
