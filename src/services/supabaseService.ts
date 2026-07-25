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
  Address,
  OrderReturnRequest
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
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) {
        console.warn("Supabase products getAll fallback to local initial products:", error.message);
        return INITIAL_PRODUCTS;
      }
      if (!data || data.length === 0) {
        return INITIAL_PRODUCTS;
      }
      return data.map(mapDbProduct);
    } catch (e) {
      console.warn("Supabase products getAll error fallback to local initial products:", e);
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
  }
};

// -------------------------------------------------------------
// 2. CATEGORIES SERVICE
// -------------------------------------------------------------
export const CategoriesService = {
  async getAll(): Promise<Category[]> {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) {
        console.warn("Supabase categories getAll fallback to local initial categories:", error.message);
        return INITIAL_CATEGORIES;
      }
      if (!data || data.length === 0) {
        return INITIAL_CATEGORIES;
      }
      return data.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description || "",
        banner: row.banner || "",
        seoTitle: row.seo_title || "",
        seoDescription: row.seo_description || "",
        keywords: row.keywords || ""
      }));
    } catch (e) {
      console.warn("Supabase categories getAll error fallback to local initial categories:", e);
      return INITIAL_CATEGORIES;
    }
  },

  async getById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase.from("categories").select("*").or(`id.eq.${id},slug.eq.${id}`).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        banner: data.banner || "",
        seoTitle: data.seo_title || "",
        seoDescription: data.seo_description || "",
        keywords: data.keywords || ""
      };
    } catch (e) {
      console.error("Supabase categories getById error:", e);
      return null;
    }
  },

  async create(category: Category): Promise<Category> {
    const row = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      banner: category.banner,
      seo_title: category.seoTitle,
      seo_description: category.seoDescription,
      keywords: category.keywords
    };
    const { data, error } = await supabase.from("categories").insert(row).select().single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      banner: data.banner || "",
      seoTitle: data.seo_title || "",
      seoDescription: data.seo_description || "",
      keywords: data.keywords || ""
    };
  },

  async update(id: string, category: Partial<Category>): Promise<Category | null> {
    const current = await this.getById(id);
    if (!current) throw new Error(`Category with ID ${id} not found.`);
    const merged = { ...current, ...category };
    const row = {
      name: merged.name,
      slug: merged.slug,
      description: merged.description,
      banner: merged.banner,
      seo_title: merged.seoTitle,
      seo_description: merged.seoDescription,
      keywords: merged.keywords
    };
    const { data, error } = await supabase.from("categories").update(row).eq("id", id).select().single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      banner: data.banner || "",
      seoTitle: data.seo_title || "",
      seoDescription: data.seo_description || "",
      keywords: data.keywords || ""
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
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
    banner: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800",
    thumbnail: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800",
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
    banner: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
    thumbnail: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
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
    banner: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800",
    thumbnail: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800",
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
    banner: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800",
    thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800",
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
    banner: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800",
    thumbnail: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800",
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
      console.log("========== UPDATE START ==========");
console.log("Target ID:", targetId);
console.log("Merged Object:", merged);
console.log("Payload Being Sent:", row);
      const { data, error } = await supabase.from("collections").upsert(row, { onConflict: "id" }).select().maybeSingle();
     if (error) {
  console.error("Supabase collections update error object:", error);
  throw error;
}

if (!data) {
  throw new Error("Supabase update returned no data.");
}

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
     catch (err) {
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

const DEFAULT_SLIDES_FALLBACK = [
  {
    id: "1",
    title: "ELEVATED CUBAN CUTS",
    subtitle: "Linen Shirts Collection",
    description: "Breathe effortlessly. Minimalist silhouettes designed with heavyweight double pleated linen trousers and mother-of-pearl resort shirts.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600",
    badge: "SARTORIAL SEASON",
    route: "collections/shirts",
    button1Text: "Explore Linen Shirts",
    button1Link: "collections/shirts"
  },
  {
    id: "2",
    title: "COTTON RESORT SHIRTS",
    subtitle: "Shirts Collection",
    description: "Tailored lightweight linen-cotton shirts in earthy resort hues, boasting premium mother-of-pearl button detailing.",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1600",
    badge: "PRE-WASHED COTTON",
    route: "collections/shirts",
    button1Text: "Explore Shirts",
    button1Link: "collections/shirts"
  },
  {
    id: "3",
    title: "RAW REDLINE DENIM",
    subtitle: "Jeans Collection",
    description: "Premium 13.5 oz selvedge shuttle denim crafted in vintage straight-leg and tapered fits. Built to age like gold.",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=1600",
    badge: "HEAVYWEIGHT SELVEDGE",
    route: "collections/jeans",
    button1Text: "Shop Selvedge Jeans",
    button1Link: "collections/jeans"
  },
  {
    id: "4",
    title: "SARTORIAL PLEATED TROUSERS",
    subtitle: "Pants Collection",
    description: "Elegant double-pleated flax trousers in structured relaxed silhouettes with clean waistband adjusters.",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=1600",
    badge: "LUXURY DRAPE",
    route: "collections/pants",
    button1Text: "Shop Luxury Pants",
    button1Link: "collections/pants"
  }
];

export const HomepageSlidesService = {
  async getSlides(): Promise<any[]> {
    try {
      let slides: any[] = [];
      let fetchError = false;

      try {
        // Query the configs table used by the Admin CMS theme configuration (the source of truth)
        const { data, error } = await supabase
          .from("configs")
          .select("value")
          .eq("key", "theme_published")
          .maybeSingle();

        if (!error && data?.value?.slides && data.value.slides.length > 0) {
          slides = data.value.slides;
        } else if (error) {
          fetchError = true;
        }
      } catch (dbErr) {
        console.warn("Supabase database fetch error, falling back to cache:", dbErr);
        fetchError = true;
      }

      // Fallback to localstorage theme active if DB failed or had no slides
      if (slides.length === 0) {
        try {
          const localTheme = localStorage.getItem("clinza_theme_active");
          if (localTheme) {
            const parsed = JSON.parse(localTheme);
            if (parsed?.slides && parsed.slides.length > 0) {
              slides = parsed.slides;
            }
          }
        } catch (localErr) {
          console.warn("Local storage active theme check error:", localErr);
        }
      }

      if (slides.length > 0) {
        // Ensure at least 4 slides are present on the homepage by padding with defaults if needed
        let finalSlides = [...slides];
        if (finalSlides.length < DEFAULT_SLIDES_FALLBACK.length) {
          finalSlides = [
            ...finalSlides,
            ...DEFAULT_SLIDES_FALLBACK.slice(finalSlides.length)
          ];
        }

        return finalSlides.map((slide: any) => ({
          id: slide.id,
          title: slide.title,
          subtitle: slide.subtitle,
          description: slide.description,
          image: slide.desktopImage || slide.mobileImage || slide.image,
          badge: slide.badge || "FEATURED",
          route: slide.button1Link || "collections/all",
          button1Text: slide.button1Text || "Shop Collection",
          button1Link: slide.button1Link || "collections/all"
        }));
      }

      // If we still have no slides, return full default 4 slides!
      return DEFAULT_SLIDES_FALLBACK;
    } catch (e) {
      console.error("Supabase slider loading error, returning default slides:", e);
      return DEFAULT_SLIDES_FALLBACK;
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
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", email.trim())
        .maybeSingle();
      if (error) throw error;
      if (data) {
        return {
          name: data.name,
          email: data.email,
          role: data.role || "Admin"
        };
      }
    } catch (err) {
      console.error("Failed to fetch admin details from Supabase:", err);
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
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Failed to write audit log:", err);
      return false;
    }
  },

  async getLogs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
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
function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    originalPrice: Number(row.original_price ?? row.originalPrice ?? row.price),
    collection: row.collection,
    category: row.category,
    images: Array.isArray(row.images) ? row.images : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    stockStatus: row.stock_status || row.stockStatus || "In Stock",
    sku: row.sku,
    brand: row.brand || "CLINZA Luxury",
    rating: Number(row.rating || 5.0),
    reviews: Array.isArray(row.reviews) ? row.reviews : [],
    description: row.description || "",
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    aPlusContent: row.a_plus_content ?? row.aPlusContent ?? { title: "", description: "", features: [] },
    isTrending: !!(row.is_trending ?? row.isTrending),
    isNewArrival: !!(row.is_new_arrival ?? row.isNewArrival)
  };
}

function mapProductToDb(product: Product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    original_price: product.originalPrice,
    collection: product.collection,
    category: product.category,
    images: product.images,
    colors: product.colors,
    sizes: product.sizes,
    stock_status: product.stockStatus,
    sku: product.sku,
    brand: product.brand,
    rating: product.rating,
    reviews: product.reviews,
    description: product.description,
    specifications: product.specifications,
    a_plus_content: product.aPlusContent,
    is_trending: product.isTrending || false,
    is_new_arrival: product.isNewArrival || false
  };
}

function mapDbOrder(row: any): Order {
  return {
    id: row.id,
    customer: row.customer,
    items: Array.isArray(row.items) ? row.items : [],
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
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
