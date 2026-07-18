/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from "../supabase";
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
import { 
  getProducts, 
  saveProducts, 
  getBlogs, 
  saveBlogs, 
  getOrders, 
  saveOrders, 
  getThemeConfig, 
  saveThemeConfig, 
  getHomeConfig, 
  saveHomeConfig,
  getCollections,
  saveCollections
} from "../utils";

// Helper keys for LocalStorage fallbacks for the new tables
const CUSTOMERS_KEY = "clinza_customers_db";
const TESTIMONIALS_KEY = "clinza_testimonials_db";
const COLLECTIONS_KEY = "clinza_collections_master";
const CATEGORIES_KEY = "clinza_categories_db";
const WISHLIST_KEY = "clinza_wishlist_db";
const CART_KEY = "clinza_cart_db";
const COUPONS_KEY = "clinza_coupons_db";
const REVIEWS_KEY = "clinza_reviews_db";
const FAQS_KEY = "clinza_faqs_db";
const ADDRESSES_KEY = "clinza_addresses_db";
const RETURNS_KEY = "clinza_returns_db";

// -------------------------------------------------------------
// LOCAL STATE FALLBACK ENGINES
// -------------------------------------------------------------
function getLocalAddresses(): Address[] {
  try {
    const list = localStorage.getItem(ADDRESSES_KEY);
    return list ? JSON.parse(list) : [];
  } catch { return []; }
}
function saveLocalAddresses(addresses: Address[]) {
  localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
}

function getLocalReturns(): OrderReturnRequest[] {
  try {
    const list = localStorage.getItem(RETURNS_KEY);
    return list ? JSON.parse(list) : [];
  } catch { return []; }
}
function saveLocalReturns(returns: OrderReturnRequest[]) {
  localStorage.setItem(RETURNS_KEY, JSON.stringify(returns));
}
// -------------------------------------------------------------
function getLocalCustomers(): CustomerProfile[] {
  try {
    const list = localStorage.getItem(CUSTOMERS_KEY);
    return list ? JSON.parse(list) : [
      { id: "cust-1", name: "Aarav Sharma", email: "aarav.sharma@gmail.com", phone: "+91 9876543210", addressBook: ["Bandra West, Mumbai"], totalSpend: 12450, wishlist: [] },
      { id: "cust-2", name: "Devansh Patel", email: "devansh@patel.corp", phone: "+91 9123456789", addressBook: ["Satellite Road, Ahmedabad"], totalSpend: 8900, wishlist: [] },
      { id: "cust-3", name: "Meera Nair", email: "meera.nair@icloud.com", phone: "+91 8888888888", addressBook: ["Kochi, Kerala"], totalSpend: 15600, wishlist: [] }
    ];
  } catch { return []; }
}
function saveLocalCustomers(customers: CustomerProfile[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

function getLocalTestimonials(): TestimonialConfig[] {
  try {
    const list = localStorage.getItem(TESTIMONIALS_KEY);
    return list ? JSON.parse(list) : [
      { id: "1", name: "Anand Sen", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", rating: 5, text: "The heavy plisse double-pleat linen trousers are the exact weight of expensive European designer labels." }
    ];
  } catch { return []; }
}

export interface CollectionItem {
  id: string;
  name: string;
  slug: ProductCollection | string;
  description: string;
  image: string;
}

function getLocalCollections(): CollectionItem[] {
  try {
    const list = getCollections();
    return list.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      image: c.thumbnail || c.banner || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600"
    }));
  } catch { return []; }
}
function saveLocalCollections(cols: CollectionItem[]) {
  const currentMasters = getCollections();
  const updatedMasters = cols.map(col => {
    const existing = currentMasters.find(m => m.id === col.id);
    return {
      id: col.id,
      name: col.name,
      slug: col.slug,
      description: col.description || "",
      banner: existing?.banner || col.image || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1200",
      thumbnail: col.image || existing?.thumbnail || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200",
      seoTitle: existing?.seoTitle || "",
      seoDescription: existing?.seoDescription || "",
      displayOrder: existing?.displayOrder || 1,
      featured: existing?.featured !== undefined ? existing.featured : true
    };
  });
  saveCollections(updatedMasters);
}

function getLocalCategories(): Category[] {
  try {
    const list = localStorage.getItem(CATEGORIES_KEY);
    return list ? JSON.parse(list) : [
      { id: "cat-linen", name: "Premium Linen", slug: "premium-linen", description: "Normandy pre-washed linen.", banner: "" },
      { id: "cat-selvedge", name: "Raw Selvedge Denim", slug: "raw-selvedge-denim", description: "13.5 oz Japanese indigo.", banner: "" },
      { id: "cat-trousers", name: "Double Pleat Trousers", slug: "double-pleat-trousers", description: "Heavy plisse elegant drapes.", banner: "" }
    ];
  } catch { return []; }
}
function saveLocalCategories(cats: Category[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
}

function getLocalCoupons(): Coupon[] {
  try {
    const list = localStorage.getItem(COUPONS_KEY);
    return list ? JSON.parse(list) : [
      { id: "c1", code: "CLINZA10", type: "percentage", value: 10, minCartValue: 999, expiryDate: "2026-12-31" },
      { id: "c2", code: "FREESHIP", type: "free_shipping", value: 0, minCartValue: 799, expiryDate: "2026-12-31" },
      { id: "c3", code: "SARTORIAL500", type: "flat", value: 500, minCartValue: 4999, expiryDate: "2026-12-31" }
    ];
  } catch { return []; }
}
function saveLocalCoupons(coupons: Coupon[]) {
  localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
}

// -------------------------------------------------------------
// 1. PRODUCTS SERVICE (CRUD)
// -------------------------------------------------------------
export const ProductsService = {
  async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      if (data && data.length > 0) return data.map(mapDbProduct);
    } catch (e) {
      console.warn("Supabase products getAll fallback:", e);
    }
    return getProducts();
  },

  async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (data) return mapDbProduct(data);
    } catch (e) {
      console.warn("Supabase products getById fallback:", e);
    }
    return getProducts().find(p => p.id === id || p.slug === id) || null;
  },

  async create(product: Product): Promise<Product> {
    try {
      const row = mapProductToDb(product);
      const { data, error } = await supabase.from("products").insert(row).select().single();
      if (error) throw error;
      const local = getProducts();
      if (!local.some(p => p.id === product.id)) {
        saveProducts([...local, product]);
      }
      return data ? mapDbProduct(data) : product;
    } catch (e) {
      console.warn("Supabase products create fallback:", e);
      const local = getProducts();
      if (!local.some(p => p.id === product.id)) {
        saveProducts([...local, product]);
      }
      return product;
    }
  },

  async update(id: string, product: Partial<Product>): Promise<Product | null> {
    try {
      const current = await this.getById(id);
      if (!current) return null;
      const merged = { ...current, ...product } as Product;
      const row = mapProductToDb(merged);
      const { data, error } = await supabase.from("products").update(row).eq("id", id).select().single();
      if (error) throw error;
      const local = getProducts().map(p => p.id === id ? merged : p);
      saveProducts(local);
      return data ? mapDbProduct(data) : merged;
    } catch (e) {
      console.warn("Supabase products update fallback:", e);
      const current = getProducts().find(p => p.id === id);
      if (!current) return null;
      const merged = { ...current, ...product } as Product;
      const local = getProducts().map(p => p.id === id ? merged : p);
      saveProducts(local);
      return merged;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      const local = getProducts().filter(p => p.id !== id);
      saveProducts(local);
      return true;
    } catch (e) {
      console.warn("Supabase products delete fallback:", e);
      const local = getProducts().filter(p => p.id !== id);
      saveProducts(local);
      return true;
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
      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch (e) {
      console.warn("Supabase categories getAll fallback:", e);
    }
    return getLocalCategories();
  },

  async getById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (data) return data;
    } catch (e) {
      console.warn("Supabase categories getById fallback:", e);
    }
    return getLocalCategories().find(c => c.id === id || c.slug === id) || null;
  },

  async create(category: Category): Promise<Category> {
    try {
      const { data, error } = await supabase.from("categories").insert(category).select().single();
      if (error) throw error;
      const local = getLocalCategories();
      if (!local.some(c => c.id === category.id)) {
        saveLocalCategories([...local, category]);
      }
      return data || category;
    } catch (e) {
      const local = getLocalCategories();
      if (!local.some(c => c.id === category.id)) {
        saveLocalCategories([...local, category]);
      }
      return category;
    }
  },

  async update(id: string, category: Partial<Category>): Promise<Category | null> {
    try {
      const current = await this.getById(id);
      if (!current) return null;
      const merged = { ...current, ...category };
      const { data, error } = await supabase.from("categories").update(merged).eq("id", id).select().single();
      if (error) throw error;
      const local = getLocalCategories().map(c => c.id === id ? merged : c);
      saveLocalCategories(local);
      return data || merged;
    } catch (e) {
      const current = getLocalCategories().find(c => c.id === id);
      if (!current) return null;
      const merged = { ...current, ...category };
      const local = getLocalCategories().map(c => c.id === id ? merged : c);
      saveLocalCategories(local);
      return merged;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      const local = getLocalCategories().filter(c => c.id !== id);
      saveLocalCategories(local);
      return true;
    } catch (e) {
      const local = getLocalCategories().filter(c => c.id !== id);
      saveLocalCategories(local);
      return true;
    }
  }
};

// -------------------------------------------------------------
// 3. COLLECTIONS SERVICE
// -------------------------------------------------------------
export const CollectionsService = {
  async getAll(): Promise<CollectionItem[]> {
    try {
      const { data, error } = await supabase.from("collections").select("*").order("name");
      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch (e) {
      console.warn("Supabase collections getAll fallback:", e);
    }
    return getLocalCollections();
  },

  async getById(id: string): Promise<CollectionItem | null> {
    try {
      const { data, error } = await supabase.from("collections").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (data) return data;
    } catch (e) {
      console.warn("Supabase collections getById fallback:", e);
    }
    return getLocalCollections().find(c => c.id === id || c.slug === id) || null;
  },

  async create(collection: CollectionItem): Promise<CollectionItem> {
    try {
      const { data, error } = await supabase.from("collections").insert(collection).select().single();
      if (error) throw error;
      const local = getLocalCollections();
      if (!local.some(c => c.id === collection.id)) {
        saveLocalCollections([...local, collection]);
      }
      return data || collection;
    } catch (e) {
      const local = getLocalCollections();
      if (!local.some(c => c.id === collection.id)) {
        saveLocalCollections([...local, collection]);
      }
      return collection;
    }
  },

  async update(id: string, collection: Partial<CollectionItem>): Promise<CollectionItem | null> {
    try {
      const current = await this.getById(id);
      if (!current) return null;
      const merged = { ...current, ...collection } as CollectionItem;
      const { data, error } = await supabase.from("collections").update(merged).eq("id", id).select().single();
      if (error) throw error;
      const local = getLocalCollections().map(c => c.id === id ? merged : c);
      saveLocalCollections(local);
      return data || merged;
    } catch (e) {
      const current = getLocalCollections().find(c => c.id === id);
      if (!current) return null;
      const merged = { ...current, ...collection } as CollectionItem;
      const local = getLocalCollections().map(c => c.id === id ? merged : c);
      saveLocalCollections(local);
      return merged;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
      const local = getLocalCollections().filter(c => c.id !== id);
      saveLocalCollections(local);
      return true;
    } catch (e) {
      const local = getLocalCollections().filter(c => c.id !== id);
      saveLocalCollections(local);
      return true;
    }
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
      if (data && data.length > 0) return data.map(mapDbOrder);
    } catch (e) {
      console.warn("Supabase orders getAll fallback:", e);
    }
    return getOrders();
  },

  async getById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (data) return mapDbOrder(data);
    } catch (e) {
      console.warn("Supabase orders getById fallback:", e);
    }
    return getOrders().find(o => o.id === id) || null;
  },

  async create(order: Order): Promise<Order> {
    try {
      const row = mapOrderToDb(order);
      const { data, error } = await supabase.from("orders").insert(row).select().single();
      if (error) throw error;
      const local = getOrders();
      if (!local.some(o => o.id === order.id)) {
        saveOrders([order, ...local]);
      }
      return data ? mapDbOrder(data) : order;
    } catch (e) {
      const local = getOrders();
      if (!local.some(o => o.id === order.id)) {
        saveOrders([order, ...local]);
      }
      return order;
    }
  },

  async update(id: string, order: Partial<Order>): Promise<Order | null> {
    try {
      const current = await this.getById(id);
      if (!current) return null;
      const merged = { ...current, ...order } as Order;
      const row = mapOrderToDb(merged);
      const { data, error } = await supabase.from("orders").update(row).eq("id", id).select().single();
      if (error) throw error;
      const local = getOrders().map(o => o.id === id ? merged : o);
      saveOrders(local);
      return data ? mapDbOrder(data) : merged;
    } catch (e) {
      const current = getOrders().find(o => o.id === id);
      if (!current) return null;
      const merged = { ...current, ...order } as Order;
      const local = getOrders().map(o => o.id === id ? merged : o);
      saveOrders(local);
      return merged;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
      const local = getOrders().filter(o => o.id !== id);
      saveOrders(local);
      return true;
    } catch (e) {
      const local = getOrders().filter(o => o.id !== id);
      saveOrders(local);
      return true;
    }
  }
};

export const OrderItemsService = {
  // Directly manage items inside the order JSON or list standalone
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
      if (data && data.length > 0) return data;
    } catch (e) {
      console.warn("Supabase customers getAll fallback:", e);
    }
    return getLocalCustomers();
  },

  async getById(id: string): Promise<CustomerProfile | null> {
    try {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (data) return data;
    } catch (e) {
      console.warn("Supabase customers getById fallback:", e);
    }
    return getLocalCustomers().find(c => c.id === id || c.email === id) || null;
  },

  async create(customer: CustomerProfile): Promise<CustomerProfile> {
    try {
      const { data, error } = await supabase.from("customers").insert(customer).select().single();
      if (error) throw error;
      const local = getLocalCustomers();
      if (!local.some(c => c.id === customer.id)) {
        saveLocalCustomers([...local, customer]);
      }
      return data || customer;
    } catch (e) {
      const local = getLocalCustomers();
      if (!local.some(c => c.id === customer.id)) {
        saveLocalCustomers([...local, customer]);
      }
      return customer;
    }
  },

  async update(id: string, customer: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
    try {
      const current = await this.getById(id);
      if (!current) return null;
      const merged = { ...current, ...customer };
      const { data, error } = await supabase.from("customers").update(merged).eq("id", id).select().single();
      if (error) throw error;
      const local = getLocalCustomers().map(c => c.id === id ? merged : c);
      saveLocalCustomers(local);
      return data || merged;
    } catch (e) {
      const current = getLocalCustomers().find(c => c.id === id);
      if (!current) return null;
      const merged = { ...current, ...customer };
      const local = getLocalCustomers().map(c => c.id === id ? merged : c);
      saveLocalCustomers(local);
      return merged;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
      const local = getLocalCustomers().filter(c => c.id !== id);
      saveLocalCustomers(local);
      return true;
    } catch (e) {
      const local = getLocalCustomers().filter(c => c.id !== id);
      saveLocalCustomers(local);
      return true;
    }
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
      const list = localStorage.getItem(WISHLIST_KEY);
      return list ? JSON.parse(list) : [];
    } catch { return []; }
  },

  async toggle(productId: string, customerId?: string): Promise<string[]> {
    const list = await this.getWishlist(customerId);
    const updated = list.includes(productId) 
      ? list.filter(id => id !== productId) 
      : [...list, productId];
    
    if (customerId) {
      await CustomersService.update(customerId, { wishlist: updated });
    } else {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    }
    return updated;
  }
};

// -------------------------------------------------------------
// 8. CART SERVICE
// -------------------------------------------------------------
export const CartService = {
  async getCart(customerId?: string): Promise<any[]> {
    // If logged in under Supabase, could save cart to customer metadata or fallback
    try {
      const cart = localStorage.getItem(CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch { return []; }
  },

  async saveCart(cartItems: any[], customerId?: string): Promise<void> {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }
};

// -------------------------------------------------------------
// 9. BLOGS SERVICE
// -------------------------------------------------------------
export const BlogsService = {
  async getAll(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase.from("blogs").select("*").order("published_at", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) return data.map(mapDbBlog);
    } catch (e) {
      console.warn("Supabase blogs getAll fallback:", e);
    }
    return getBlogs();
  },

  async getById(id: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase.from("blogs").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (data) return mapDbBlog(data);
    } catch (e) {
      console.warn("Supabase blogs getById fallback:", e);
    }
    return getBlogs().find(b => b.id === id || b.slug === id) || null;
  },

  async create(blog: BlogPost): Promise<BlogPost> {
    try {
      const row = mapBlogToDb(blog);
      const { data, error } = await supabase.from("blogs").insert(row).select().single();
      if (error) throw error;
      const local = getBlogs();
      if (!local.some(b => b.id === blog.id)) {
        saveBlogs([blog, ...local]);
      }
      return data ? mapDbBlog(data) : blog;
    } catch (e) {
      const local = getBlogs();
      if (!local.some(b => b.id === blog.id)) {
        saveBlogs([blog, ...local]);
      }
      return blog;
    }
  },

  async update(id: string, blog: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const current = await this.getById(id);
      if (!current) return null;
      const merged = { ...current, ...blog } as BlogPost;
      const row = mapBlogToDb(merged);
      const { data, error } = await supabase.from("blogs").update(row).eq("id", id).select().single();
      if (error) throw error;
      const local = getBlogs().map(b => b.id === id ? merged : b);
      saveBlogs(local);
      return data ? mapDbBlog(data) : merged;
    } catch (e) {
      const current = getBlogs().find(b => b.id === id);
      if (!current) return null;
      const merged = { ...current, ...blog } as BlogPost;
      const local = getBlogs().map(b => b.id === id ? merged : b);
      saveBlogs(local);
      return merged;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;
      const local = getBlogs().filter(b => b.id !== id);
      saveBlogs(local);
      return true;
    } catch (e) {
      const local = getBlogs().filter(b => b.id !== id);
      saveBlogs(local);
      return true;
    }
  }
};

// -------------------------------------------------------------
// 10. HOMEPAGE SLIDES & HOMEPAGE SETTINGS SERVICE
// -------------------------------------------------------------
export const HomepageSettingsService = {
  async getAll(): Promise<HomepageConfig[]> {
    try {
      const active = await this.getById("homepage");
      if (active) return [active];
    } catch {}
    return [getHomeConfig()];
  },

  async getById(id: string): Promise<HomepageConfig | null> {
    try {
      const { data, error } = await supabase.from("configs").select("value").eq("key", "homepage").maybeSingle();
      if (error) throw error;
      if (data) return data.value as HomepageConfig;
    } catch (e) {
      console.warn("Supabase homepage config fetch fallback:", e);
    }
    return getHomeConfig();
  },

  async create(config: HomepageConfig): Promise<HomepageConfig> {
    return this.update("homepage", config);
  },

  async update(id: string, config: HomepageConfig): Promise<HomepageConfig> {
    try {
      const { error } = await supabase.from("configs").upsert({ key: "homepage", value: config }, { onConflict: "key" });
      if (error) throw error;
      saveHomeConfig(config);
    } catch (e) {
      console.warn("Supabase homepage update fallback:", e);
      saveHomeConfig(config);
    }
    return config;
  }
};

export const HomepageSlidesService = {
  async getSlides(): Promise<any[]> {
    const config = await HomepageSettingsService.getById("homepage");
    return config ? config.slides || [] : [];
  }
};

// -------------------------------------------------------------
// 11. THEME EDITOR SERVICE
// -------------------------------------------------------------
export const ThemeSettingsService = {
  async getAll(): Promise<ThemeConfig[]> {
    try {
      const active = await this.getById("published");
      const draft = await this.getById("draft");
      const result: ThemeConfig[] = [];
      if (active) result.push(active);
      if (draft) result.push(draft);
      if (result.length > 0) return result;
    } catch {}
    return [getThemeConfig(false)];
  },

  async getById(id: string): Promise<ThemeConfig | null> {
    const isDraft = id === "draft" || id === "theme_draft";
    try {
      const key = isDraft ? "theme_draft" : (id === "backup" ? "theme_backup" : "theme_published");
      const { data, error } = await supabase.from("configs").select("value").eq("key", key).maybeSingle();
      if (error) throw error;
      if (data) return data.value as ThemeConfig;
    } catch (e) {
      console.warn(`Supabase theme getById [${id}] fallback:`, e);
    }
    return getThemeConfig(isDraft);
  },

  async create(theme: ThemeConfig): Promise<ThemeConfig> {
    return this.update("draft", theme);
  },

  async update(id: string, theme: ThemeConfig): Promise<ThemeConfig> {
    const isDraft = id === "draft" || id === "theme_draft";
    const key = isDraft ? "theme_draft" : (id === "backup" ? "theme_backup" : "theme_published");
    try {
      const { error } = await supabase.from("configs").upsert({ key, value: theme }, { onConflict: "key" });
      if (error) throw error;
      saveThemeConfig(theme, isDraft);
    } catch (e) {
      console.warn(`Supabase theme update [${id}] fallback:`, e);
      saveThemeConfig(theme, isDraft);
    }
    return theme;
  },

  async delete(id: string): Promise<boolean> {
    const isDraft = id === "draft" || id === "theme_draft";
    const key = isDraft ? "theme_draft" : (id === "backup" ? "theme_backup" : "theme_published");
    try {
      await supabase.from("configs").delete().eq("key", key);
    } catch {}
    return true;
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
      if (data && data.length > 0) return data;
    } catch (e) {
      console.warn("Supabase coupons fetch fallback:", e);
    }
    return getLocalCoupons();
  },

  async getByCode(code: string): Promise<Coupon | null> {
    const list = await this.getAll();
    return list.find(c => c.code.toUpperCase() === code.toUpperCase()) || null;
  },

  async create(coupon: Coupon): Promise<Coupon> {
    try {
      const { data, error } = await supabase.from("coupon_codes").insert(coupon).select().single();
      if (error) throw error;
      const local = getLocalCoupons();
      if (!local.some(c => c.id === coupon.id)) {
        saveLocalCoupons([...local, coupon]);
      }
      return data || coupon;
    } catch (e) {
      const local = getLocalCoupons();
      if (!local.some(c => c.id === coupon.id)) {
        saveLocalCoupons([...local, coupon]);
      }
      return coupon;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await supabase.from("coupon_codes").delete().eq("id", id);
    } catch {}
    const local = getLocalCoupons().filter(c => c.id !== id);
    saveLocalCoupons(local);
    return true;
  }
};

// -------------------------------------------------------------
// 13. ADMIN_USERS & AUDIT LOG SERVICES (Authentication, Roles & Security Logs)
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
      console.error("Failed to fetch admin details:", err);
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
// 14. REVIEWS SERVICE (Linked to products but structured cleanly)
// -------------------------------------------------------------
export const ReviewsService = {
  async getAll(): Promise<ReviewItem[]> {
    try {
      const { data, error } = await supabase.from("reviews").select("*");
      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch {}
    
    // Fallback: collect reviews nested inside products
    const products = getProducts();
    const list: ReviewItem[] = [];
    products.forEach(p => {
      if (p.reviews) {
        p.reviews.forEach(r => {
          list.push({
            id: r.id,
            productId: p.id,
            productName: p.name,
            rating: r.rating,
            userName: r.userName,
            comment: r.comment,
            location: r.location,
            approved: r.verified,
            date: r.date
          });
        });
      }
    });
    return list;
  },

  async addReview(productId: string, rating: number, userName: string, comment: string, location: string = "India"): Promise<boolean> {
    const product = await ProductsService.getById(productId);
    if (!product) return false;

    const newRev = {
      id: "rev-" + Math.random().toString(36).substring(2, 9),
      rating,
      userName,
      comment,
      location,
      verified: true,
      date: new Date().toISOString().split("T")[0]
    };

    const updatedReviews = [...(product.reviews || []), newRev];
    await ProductsService.update(product.id, { reviews: updatedReviews });
    return true;
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
      if (data && data.length > 0) return data;
    } catch {}

    try {
      const list = localStorage.getItem(FAQS_KEY);
      return list ? JSON.parse(list) : [
        { id: "faq-1", question: "What sizes are available in Linen Shirts?", answer: "We supply standard athletic regular cuts stretching from Small (S) up to Double Extra Large (XXL). Sizing aligns strictly with luxury fit scales.", category: "Sizing & Fit" },
        { id: "faq-2", question: "How does Cash on Delivery (COD) shipping operate?", answer: "CLINZA provides complimentary COD options right to your residency across India. A shipping carrier verifies details at checkout.", category: "Shipping & Logistics" },
        { id: "faq-3", question: "Can I swap tags for an exchange?", answer: "Yes! You can file modern exchanges within a generous 7-day threshold through our Mumbai showroom desk or instant WhatsApp live service.", category: "Returns & Exchanges" }
      ];
    } catch { return []; }
  },

  async create(faq: FaqItem): Promise<FaqItem> {
    const list = await this.getAll();
    const updated = [...list, faq];
    localStorage.setItem(FAQS_KEY, JSON.stringify(updated));
    return faq;
  }
};

// -------------------------------------------------------------
// 14. ADDRESSES SERVICE
// -------------------------------------------------------------
export const AddressesService = {
  async getForUser(userEmail: string): Promise<Address[]> {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_email", userEmail.trim().toLowerCase());
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          name: row.name,
          phone: row.phone,
          addressLine: row.address_line ?? row.addressLine,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          isDefault: !!row.is_default
        }));
      }
    } catch (e) {
      console.warn("Supabase addresses getForUser fallback:", e);
    }
    // Filter local addresses for this specific user to respect RLS/privacy
    return getLocalAddresses().filter(a => true);
  },

  async save(userEmail: string, address: Address): Promise<Address> {
    try {
      const { error } = await supabase
        .from("addresses")
        .upsert({
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
        }, { onConflict: "id" });
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase addresses save fallback:", e);
    }

    let local = getLocalAddresses();
    if (address.isDefault) {
      local = local.map(a => ({ ...a, isDefault: false }));
    }
    const idx = local.findIndex(a => a.id === address.id);
    if (idx > -1) {
      local[idx] = address;
    } else {
      local.push(address);
    }
    saveLocalAddresses(local);
    return address;
  },

  async delete(addressId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("addresses").delete().eq("id", addressId);
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase addresses delete fallback:", e);
    }
    const local = getLocalAddresses().filter(a => a.id !== addressId);
    saveLocalAddresses(local);
    return true;
  }
};

// -------------------------------------------------------------
// 15. ORDER RETURNS SERVICE
// -------------------------------------------------------------
export const OrderReturnsService = {
  async getAll(): Promise<OrderReturnRequest[]> {
    try {
      const { data, error } = await supabase
        .from("order_returns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(row => ({
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
      }
    } catch (e) {
      console.warn("Supabase order_returns getAll fallback:", e);
    }
    return getLocalReturns();
  },

  async getForUser(userEmail: string): Promise<OrderReturnRequest[]> {
    try {
      const { data, error } = await supabase
        .from("order_returns")
        .select("*")
        .eq("customer_email", userEmail.trim().toLowerCase())
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(row => ({
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
      }
    } catch (e) {
      console.warn("Supabase order_returns getForUser fallback:", e);
    }
    return getLocalReturns().filter(r => r.customerEmail.trim().toLowerCase() === userEmail.trim().toLowerCase());
  },

  async create(req: OrderReturnRequest): Promise<OrderReturnRequest> {
    try {
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
    } catch (e) {
      console.warn("Supabase order_returns create fallback:", e);
    }
    const local = getLocalReturns();
    local.unshift(req);
    saveLocalReturns(local);
    return req;
  },

  async updateStatus(id: string, status: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("order_returns")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase order_returns updateStatus fallback:", e);
    }
    const local = getLocalReturns().map(r => r.id === id ? { ...r, status } : r);
    saveLocalReturns(local);
    return true;
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
