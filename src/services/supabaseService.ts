/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from "../supabase";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BLOGS, INITIAL_REVIEWS } from "../data";
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
    id: "linen-combo",
    name: "Linen Combo",
    slug: "combos",
    short_description: "Tailored co-ord sets crafted from pure European flax and breathable cotton blends.",
    description: "Pre-coordinated matching clothing sets curated for effortless styling.",
    button_text: "Explore Linen Combo",
    banner: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800",
    thumbnail: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800",
    display_order: 1,
    show_on_homepage: true,
    is_active: true,
    featured: true,
    meta_title: "Linen Combo Sets - Clinza Wardrobe",
    meta_description: "Shop premium linen co-ord combo sets engineered for modern elegance.",
    alt_text: "Clinza Linen Combo Set"
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
  }
];

export const CollectionsService = {
  async getAll(): Promise<CollectionItem[]> {
    try {
      let { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("display_order", { ascending: true });

      // One-time database seed if the table is completely empty during first run
      if ((!data || data.length === 0) && !error) {
        try {
          const { data: insertedData, error: insertError } = await supabase
            .from("collections")
            .insert(DEFAULT_COLLECTIONS_SEED)
            .select();
          if (!insertError && insertedData) {
            data = insertedData;
          }
        } catch (seedErr) {
          console.warn("Failed to seed default collections into database:", seedErr);
        }
      }

      if (data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description || "",
          shortDescription: row.short_description || row.description || "",
          buttonText: row.button_text || "View Collection",
          image: row.banner || row.thumbnail || "",
          thumbnail: row.thumbnail || "",
          banner: row.banner || "",
          seoTitle: row.seo_title || row.meta_title || "",
          seoDescription: row.seo_description || row.meta_description || "",
          metaTitle: row.meta_title || row.seo_title || "",
          metaDescription: row.meta_description || row.seo_description || "",
          altText: row.alt_text || row.name || "",
          displayOrder: row.display_order !== undefined && row.display_order !== null ? row.display_order : 0,
          featured: !!row.featured,
          showOnHomepage: row.show_on_homepage !== false,
          isActive: row.is_active !== false
        }));
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
    } catch (e) {
      console.error("Supabase collections getAll error:", e);
      return [];
    }
  },

  async getHomepageCollections(): Promise<CollectionItem[]> {
    try {
      const all = await this.getAll();
      // Homepage displays first 4 collections where is_active = true AND show_on_homepage = true ordered by display_order
      return all
        .filter(c => c.isActive !== false && c.showOnHomepage !== false)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .slice(0, 4);
    } catch (e) {
      console.error("Supabase collections getHomepageCollections error:", e);
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
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        shortDescription: data.short_description || "",
        buttonText: data.button_text || "View Collection",
        image: data.banner || data.thumbnail || "",
        thumbnail: data.thumbnail || "",
        banner: data.banner || "",
        seoTitle: data.seo_title || data.meta_title || "",
        seoDescription: data.seo_description || data.meta_description || "",
        metaTitle: data.meta_title || data.seo_title || "",
        metaDescription: data.meta_description || data.seo_description || "",
        altText: data.alt_text || data.name || "",
        displayOrder: data.display_order !== undefined && data.display_order !== null ? data.display_order : 0,
        featured: !!data.featured,
        showOnHomepage: data.show_on_homepage !== false,
        isActive: data.is_active !== false
      };
    } catch (e) {
      console.error("Supabase collections getById error:", e);
      return null;
    }
  },

  async create(collection: CollectionItem): Promise<CollectionItem> {
    const row = {
      id: collection.id || `col-${Date.now()}`,
      name: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      short_description: collection.shortDescription || collection.description || "",
      button_text: collection.buttonText || "View Collection",
      banner: collection.banner || collection.image,
      thumbnail: collection.thumbnail || collection.image,
      seo_title: collection.seoTitle || collection.metaTitle || "",
      seo_description: collection.seoDescription || collection.metaDescription || "",
      meta_title: collection.metaTitle || collection.seoTitle || "",
      meta_description: collection.metaDescription || collection.seoDescription || "",
      alt_text: collection.altText || collection.name || "",
      display_order: collection.displayOrder !== undefined ? collection.displayOrder : 0,
      featured: collection.featured !== false,
      show_on_homepage: collection.showOnHomepage !== false,
      is_active: collection.isActive !== false
    };
    const { data, error } = await supabase.from("collections").insert(row).select().single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      shortDescription: data.short_description || "",
      buttonText: data.button_text || "View Collection",
      image: data.banner || data.thumbnail || "",
      thumbnail: data.thumbnail || "",
      banner: data.banner || "",
      seoTitle: data.seo_title || data.meta_title || "",
      seoDescription: data.seo_description || data.meta_description || "",
      metaTitle: data.meta_title || data.seo_title || "",
      metaDescription: data.meta_description || data.seo_description || "",
      altText: data.alt_text || data.name || "",
      displayOrder: data.display_order || 0,
      featured: !!data.featured,
      showOnHomepage: data.show_on_homepage !== false,
      isActive: data.is_active !== false
    };
  },

  async update(id: string, collection: Partial<CollectionItem>): Promise<CollectionItem | null> {
    const current = await this.getById(id);
    if (!current) throw new Error(`Collection with ID ${id} not found.`);
    const merged = { ...current, ...collection } as CollectionItem;
    const row = {
      name: merged.name,
      slug: merged.slug,
      description: merged.description || "",
      short_description: merged.shortDescription || merged.description || "",
      button_text: merged.buttonText || "View Collection",
      banner: merged.banner || merged.image,
      thumbnail: merged.thumbnail || merged.image,
      seo_title: merged.seoTitle || merged.metaTitle || "",
      seo_description: merged.seoDescription || merged.metaDescription || "",
      meta_title: merged.metaTitle || merged.seoTitle || "",
      meta_description: merged.metaDescription || merged.seoDescription || "",
      alt_text: merged.altText || merged.name || "",
      display_order: merged.displayOrder !== undefined ? merged.displayOrder : 0,
      featured: merged.featured !== false,
      show_on_homepage: merged.showOnHomepage !== false,
      is_active: merged.isActive !== false
    };
    const { data, error } = await supabase.from("collections").update(row).eq("id", id).select().single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      shortDescription: data.short_description || "",
      buttonText: data.button_text || "View Collection",
      image: data.banner || data.thumbnail || "",
      thumbnail: data.thumbnail || "",
      banner: data.banner || "",
      seoTitle: data.seo_title || data.meta_title || "",
      seoDescription: data.seo_description || data.meta_description || "",
      metaTitle: data.meta_title || data.seo_title || "",
      metaDescription: data.meta_description || data.seo_description || "",
      altText: data.alt_text || data.name || "",
      displayOrder: data.display_order || 0,
      featured: !!data.featured,
      showOnHomepage: data.show_on_homepage !== false,
      isActive: data.is_active !== false
    };
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) throw error;
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
// 6. CUSTOMERS SERVICE
// -------------------------------------------------------------
export const CustomersService = {
  async getAll(): Promise<CustomerProfile[]> {
    try {
      const { data, error } = await supabase.from("customers").select("*").order("name");
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Supabase customers getAll error:", e);
      return [];
    }
  },

  async getById(id: string): Promise<CustomerProfile | null> {
    try {
      const { data, error } = await supabase.from("customers").select("*").or(`id.eq.${id},email.eq.${id}`).maybeSingle();
      if (error) throw error;
      return data || null;
    } catch (e) {
      console.error("Supabase customers getById error:", e);
      return null;
    }
  },

  async create(customer: CustomerProfile): Promise<CustomerProfile> {
    const { data, error } = await supabase.from("customers").insert(customer).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, customer: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
    const current = await this.getById(id);
    if (!current) throw new Error(`Customer profile not found for ${id}`);
    const merged = { ...current, ...customer };
    const { data, error } = await supabase.from("customers").update(merged).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
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
    items: row.items,
    totalAmount: Number(row.total_amount ?? row.totalAmount),
    status: row.status,
    paymentMethod: row.payment_method ?? row.paymentMethod ?? "COD",
    trackingHistory: row.tracking_history ?? row.trackingHistory ?? [],
    createdAt: row.created_at ?? row.createdAt
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
    tracking_history: order.trackingHistory,
    created_at: order.createdAt
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
