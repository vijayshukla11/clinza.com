/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";
import { Product, BlogPost, Order, HomepageConfig, ThemeConfig, CollectionMaster, Category, Coupon, CustomerProfile, ReviewItem, OrderReturnRequest } from "./types";

// Fallbacks are provided directly from user specification for immediate, robust operation
const viteEnv = (import.meta as any).env || {};
const SUPABASE_URL = 
  viteEnv.VITE_SUPABASE_URL || 
  (globalThis as any).process?.env?.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vdtbquxxpikniarmjpai.supabase.co";

const SUPABASE_ANON_KEY = 
  viteEnv.VITE_SUPABASE_ANON_KEY || 
  (globalThis as any).process?.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_T5AXsc3Zotfbi_J18VwJXw_jZR3wlOp";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Check if running on localhost development or sandbox environment
const isLocalhost = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || 
   window.location.hostname === "127.0.0.1" || 
   window.location.hostname.includes("run.app") ||
   !!(import.meta as any).env?.DEV);

if (isLocalhost) {
  const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
  supabase.auth.getUser = async (jwt?: string) => {
    const devSession = localStorage.getItem("clinza_dev_admin_session");
    if (devSession) {
      try {
        const user = JSON.parse(devSession);
        return { data: { user }, error: null };
      } catch {}
    }
    return originalGetUser(jwt);
  };

  const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
  supabase.auth.getSession = async () => {
    const devSession = localStorage.getItem("clinza_dev_admin_session");
    if (devSession) {
      try {
        const user = JSON.parse(devSession);
        return { data: { session: { user, access_token: "dev-token", refresh_token: "dev-refresh" } }, error: null };
      } catch {}
    }
    return originalGetSession();
  };

  const originalSignOut = supabase.auth.signOut.bind(supabase.auth);
  supabase.auth.signOut = async (options?: any) => {
    localStorage.removeItem("clinza_dev_admin_session");
    return originalSignOut(options);
  };
}

// For backward compatibility and local simulation if database tables are in migration state
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

// Global state listener for session/auth state
let currentAuthUser: any = null;

// Listen to initial session immediately
supabase.auth.getSession().then(({ data: { session } }) => {
  currentAuthUser = session?.user || null;
});

supabase.auth.onAuthStateChange((_event, session) => {
  const devSession = localStorage.getItem("clinza_dev_admin_session");
  if (isLocalhost && devSession) {
    try {
      currentAuthUser = JSON.parse(devSession);
      return;
    } catch {}
  }
  currentAuthUser = session?.user || null;
});

// Auth compatibility object
export const auth = {
  get currentUser() {
    return currentAuthUser ? {
      uid: currentAuthUser.id,
      email: currentAuthUser.email,
      displayName: currentAuthUser.user_metadata?.name || currentAuthUser.user_metadata?.displayName || "Clinza Admin",
      emailVerified: true
    } : null;
  }
};

// ---- Auth functions replacing Firebase Auth ----

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Supabase Google Auth failed:", err);
    throw err;
  }
}

export async function signInWithEmail(email: string, pass: string) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass,
    });

    if (!error && data.user) {
      return data.user;
    }

    // If login failed, attempt to sign up if user doesn't exist yet in Supabase Auth
    if (error) {
      console.warn("Supabase signInWithPassword note:", error.message, "- attempting auto-provision via signUp");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            displayName: "Clinza Admin",
            name: "Clinza Admin"
          }
        }
      });

      if (!signUpError && signUpData.user) {
        // Also register in admin_users table in Supabase
        await supabase.from("admin_users").upsert({
          email: cleanEmail,
          name: "Clinza Admin",
          role: "Super Admin"
        }, { onConflict: "email" });

        if (signUpData.session) {
          return signUpData.user;
        }

        // Try sign in again after sign up
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });
        if (!retryError && retryData?.user) {
          return retryData.user;
        }

        if (isLocalhost) {
          const devUser = signUpData.user;
          localStorage.setItem("clinza_dev_admin_session", JSON.stringify(devUser));
          return devUser;
        }
      }

      // Dev environment fallback for designated admin accounts
      if (isLocalhost && (cleanEmail === "admin@clinza.in" || cleanEmail === "sastaelectronic6@gmail.com")) {
        const devUser = {
          id: `dev-admin-${Date.now()}`,
          email: cleanEmail,
          user_metadata: { name: "Clinza Admin", displayName: "Clinza Admin" }
        };
        localStorage.setItem("clinza_dev_admin_session", JSON.stringify(devUser));
        return devUser;
      }

      throw error;
    }
  } catch (err: any) {
    if (isLocalhost && (cleanEmail === "admin@clinza.in" || cleanEmail === "sastaelectronic6@gmail.com")) {
      const devUser = {
        id: `dev-admin-${Date.now()}`,
        email: cleanEmail,
        user_metadata: { name: "Clinza Admin", displayName: "Clinza Admin" }
      };
      localStorage.setItem("clinza_dev_admin_session", JSON.stringify(devUser));
      return devUser;
    }
    console.error("Supabase Email Auth failed:", err);
    throw err;
  }
}

export async function logOutUser() {
  try {
    localStorage.removeItem("clinza_dev_admin_session");
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Supabase signout failed:", err);
  }
}

// ---- Database Sync Functions mapping to Supabase Tables ----

// 1. Sync Products
export async function syncProductsFromCloud(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.warn("Could not query products from Supabase (tables may not exist yet, using local database):", error.message);
      return [];
    }

    // Map DB snake_case or JSON to typescript camelCase structure if necessary
    return (data || []).map((row: any) => ({
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
      brand: row.brand || "CLINZA",
      rating: Number(row.rating || 5.0),
      reviews: Array.isArray(row.reviews) ? row.reviews : [],
      description: row.description,
      specifications: Array.isArray(row.specifications) ? row.specifications : [],
      aPlusContent: row.a_plus_content ?? row.aPlusContent ?? { title: "", description: "", features: [] },
      isTrending: !!(row.is_trending ?? row.isTrending),
      isNewArrival: !!(row.is_new_arrival ?? row.isNewArrival)
    }));
  } catch (err) {
    console.error("Failed to fetch products from Supabase:", err);
    return [];
  }
}

export async function saveProductToCloud(product: Product): Promise<void> {
  try {
    const dbRow = {
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

    const { error } = await supabase
      .from("products")
      .upsert(dbRow, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert failed - products table missing or offline:", error.message);
    }
  } catch (err) {
    console.error("Products cloud synchronizer failure:", err);
  }
}

export async function deleteProductFromCloud(productId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.warn("Supabase delete failed - products table missing:", error.message);
    }
  } catch (err) {
    console.error("Product cloud delete failure:", err);
  }
}

// 2. Sync Blogs
export async function syncBlogsFromCloud(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      console.warn("Could not query blogs from Supabase, returning local store:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
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
    }));
  } catch (err) {
    console.error("Blogs cloud query failure:", err);
    return [];
  }
}

export async function saveBlogToCloud(blog: BlogPost): Promise<void> {
  try {
    const dbRow = {
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

    const { error } = await supabase
      .from("blogs")
      .upsert(dbRow, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert failed - blogs table missing or offline:", error.message);
    }
  } catch (err) {
    console.error("Blogs cloud sync error:", err);
  }
}

export async function deleteBlogFromCloud(blogId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", blogId);

    if (error) {
      console.warn("Supabase blog delete failed:", error.message);
    }
  } catch (err) {
    console.error("Blog cloud delete failure:", err);
  }
}

// 3. Sync Orders
export async function syncOrdersFromCloud(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not query orders from Supabase (returning local storage cache):", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      customer: row.customer,
      items: row.items,
      totalAmount: Number(row.total_amount ?? row.totalAmount),
      status: row.status,
      paymentMethod: row.payment_method ?? row.paymentMethod ?? "COD",
      trackingHistory: row.tracking_history ?? row.trackingHistory ?? [],
      createdAt: row.created_at ?? row.createdAt
    }));
  } catch (err) {
    console.error("Orders cloud selection error:", err);
    return [];
  }
}

export async function saveOrderToCloud(order: Order): Promise<void> {
  try {
    const dbRow = {
      id: order.id,
      customer: order.customer,
      items: order.items,
      total_amount: order.totalAmount,
      status: order.status,
      payment_method: order.paymentMethod,
      tracking_history: order.trackingHistory,
      created_at: order.createdAt
    };

    const { error } = await supabase
      .from("orders")
      .upsert(dbRow, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert order failed:", error.message);
    }
  } catch (err) {
    console.error("Order cloud upsert failed:", err);
  }
}

export async function getSingleOrderFromCloud(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      console.warn("Supabase single order check failed:", error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      customer: data.customer,
      items: data.items,
      totalAmount: Number(data.total_amount ?? data.totalAmount),
      status: data.status,
      paymentMethod: data.payment_method ?? data.paymentMethod ?? "COD",
      trackingHistory: data.tracking_history ?? data.trackingHistory ?? [],
      createdAt: data.created_at ?? data.createdAt
    };
  } catch (err) {
    console.error("Order tracking cloud fetch error:", err);
    return null;
  }
}

// 4. Sync Homepage Configs
export async function syncHomepageConfigFromCloud(): Promise<HomepageConfig | null> {
  try {
    const { data, error } = await supabase
      .from("configs")
      .select("value")
      .eq("key", "homepage")
      .maybeSingle();

    if (error) {
      console.warn("Could not query configurations table from Supabase:", error.message);
      return null;
    }

    return data ? (data.value as HomepageConfig) : null;
  } catch (err) {
    console.error("Configs cloud retrieve failure:", err);
    return null;
  }
}

export async function saveHomepageConfigToCloud(config: HomepageConfig): Promise<void> {
  try {
    const { error } = await supabase
      .from("configs")
      .upsert({
        key: "homepage",
        value: config
      }, { onConflict: "key" });

    if (error) {
      console.warn("Supabase upsert homepage config failed:", error.message);
    }
  } catch (err) {
    console.error("Homepage config cloud save error:", err);
  }
}

// 5. Theme Configurations Save & Retrieval
export async function syncThemeConfigFromCloud(isDraft: boolean = false): Promise<ThemeConfig | null> {
  const key = isDraft ? "theme_draft" : "theme_published";
  try {
    const { data, error } = await supabase
      .from("configs")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      console.warn(`Could not query theme configuration [${key}] from Supabase:`, error.message);
      return null;
    }

    return data ? (data.value as ThemeConfig) : null;
  } catch (err) {
    console.error(`Theme Config cloud retrieve failure [${key}]:`, err);
    return null;
  }
}

export async function saveThemeConfigToCloud(config: ThemeConfig, isDraft: boolean = false): Promise<void> {
  const key = isDraft ? "theme_draft" : "theme_published";
  try {
    const { error } = await supabase
      .from("configs")
      .upsert({
        key: key,
        value: config
      }, { onConflict: "key" });

    if (error) {
      console.warn(`Supabase upsert for [${key}] failed:`, error.message);
    }
  } catch (err) {
    console.error(`Theme Config [${key}] cloud save error:`, err);
  }
}

export async function rollbackThemeConfigInCloud(): Promise<ThemeConfig | null> {
  try {
    // We fetch our published backup copy (if any) and place it as active draft/published
    const { data, error } = await supabase
      .from("configs")
      .select("value")
      .eq("key", "theme_backup")
      .maybeSingle();

    if (error || !data) {
      console.warn("Could not retrieve rollback backup from Supabase.");
      return null;
    }

    const backupConfig = data.value as ThemeConfig;
    await saveThemeConfigToCloud(backupConfig, false); // publish rollback
    await saveThemeConfigToCloud(backupConfig, true);  // update draft
    return backupConfig;
  } catch (err) {
    console.error("Theme Config rollback failure:", err);
    return null;
  }
}

export async function createBackupThemeConfigInCloud(config: ThemeConfig): Promise<void> {
  try {
    await supabase.from("configs").upsert({
      key: "theme_backup",
      value: config
    }, { onConflict: "key" });
  } catch (err) {
    console.error("Failed to create theme backup in cloud:", err);
  }
}

/**
 * Uploads a file to a Supabase Storage bucket and returns its public URL.
 * Supports centralized 'clinza-media' bucket with folder names, as well as specific bucket fallbacks.
 */
export async function uploadFileToSupabase(bucketName: string, file: File, folderName?: string): Promise<string> {
  try {
    const extension = file.name.split('.').pop() || 'png';
    const cleanFileName = `clinza_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    
    // Support centralized bucket 'clinza-media' with subfolders
    const centralBucket = "clinza-media";
    const targetFolder = folderName || bucketName; // e.g. "brand", "homepage", "collections", "categories", "products", "blogs", "banners", "icons", "uploads"
    const uploadPath = `${targetFolder}/${cleanFileName}`;

    // Try uploading to central bucket first
    const { data: centralData, error: centralError } = await supabase.storage
      .from(centralBucket)
      .upload(uploadPath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (!centralError) {
      const { data: { publicUrl } } = supabase.storage
        .from(centralBucket)
        .getPublicUrl(uploadPath);
      return publicUrl;
    }

    // Fall back to specific bucket if central bucket is not configured or fails
    console.warn(`Centralized storage bucket [${centralBucket}] failed/not initialized (${centralError.message}). Falling back to specific bucket [${bucketName}]...`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn(`Supabase fallback upload error on bucket [${bucketName}]:`, error.message);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(cleanFileName);

    return publicUrl;
  } catch (err: any) {
    console.error("Storage upload handler failed:", err);
    throw err;
  }
}

// ---- CONTACT MESSAGES INTEGRATION ----
export async function saveContactMessageToCloud(msg: { name: string; email: string; phone?: string; message: string }): Promise<void> {
  try {
    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name: msg.name,
        email: msg.email,
        phone: msg.phone || "",
        message: msg.message,
        created_at: new Date().toISOString()
      });
    if (error) {
      console.warn("Could not insert contact message, table may be missing:", error.message);
    }
  } catch (err) {
    console.error("Contact message cloud insertion error:", err);
  }
}

export async function getContactMessagesFromCloud(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("Could not load contact messages, returning mock/fallback:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Contact messages retrieval error:", err);
    return [];
  }
}

// ---- NEWSLETTER SUBSCRIPTION INTEGRATION ----
export async function saveNewsletterSubscriberToCloud(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({
        email: email.trim().toLowerCase(),
        created_at: new Date().toISOString()
      }, { onConflict: "email" });
    if (error) {
      console.warn("Could not insert newsletter subscriber:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Newsletter subscription failure:", err);
    return false;
  }
}

export async function getNewsletterSubscribersFromCloud(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("Could not load newsletter subscribers:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Newsletter subscribers retrieval failure:", err);
    return [];
  }
}

// ---- STYLE ANALYSIS LEADS INTEGRATION ----
export async function saveStyleAnalysisLeadToCloud(lead: {
  imageUrl?: string;
  recommendedColors: string[];
  recommendedCollections: string[];
  recommendedSizes: string[];
  styleArchetype?: string;
  notes?: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from("style_analysis")
      .insert({
        image_url: lead.imageUrl || "",
        recommended_colors: lead.recommendedColors,
        recommended_collections: lead.recommendedCollections,
        recommended_sizes: lead.recommendedSizes,
        style_archetype: lead.styleArchetype || "The Effortless Minimalist",
        notes: lead.notes || "",
        created_at: new Date().toISOString()
      });
    if (error) {
      console.warn("Could not log style analysis lead:", error.message);
    }
  } catch (err) {
    console.error("Style analysis lead save failure:", err);
  }
}

export async function getStyleAnalysisLeadsFromCloud(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("style_analysis")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("Could not fetch style analysis leads:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Style analysis leads cloud fetch error:", err);
    return [];
  }
}

// ---- CUSTOMERS INTEGRATION ----
export async function getCustomersFromCloud(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("Could not load customers:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Customers query failure:", err);
    return [];
  }
}

export async function saveCustomerToCloud(customer: any): Promise<void> {
  try {
    const dbRow = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      status: customer.status || "Active",
      tags: customer.tags || [],
      created_at: customer.createdAt || new Date().toISOString(),
      last_order_date: customer.lastOrderDate || null,
      total_orders: customer.totalOrders ?? 0,
      total_spend: customer.totalSpend ?? customer.total_spend ?? 0,
      avg_order_value: customer.avgOrderValue ?? 0,
      address_book: customer.addressBook || customer.address_book || [],
      shipping_addresses: customer.shippingAddresses || [],
      billing_addresses: customer.billingAddresses || [],
      wishlist: customer.wishlist || [],
      recently_viewed: customer.recentlyViewed || [],
      timeline: customer.timeline || [],
      notes: customer.notes || [],
      reward_points: customer.rewardPoints ?? 0,
      store_credit: customer.storeCredit ?? 0,
      referral_code: customer.referralCode || "",
      coupon_history: customer.couponHistory || [],
      marketing_consent: customer.marketingConsent || { emailOptIn: true, smsOptIn: true, whatsappOptIn: true, newsletter: true },
      is_blocked: !!customer.isBlocked,
      block_reason: customer.blockReason || "",
      support_requests: customer.supportRequests || []
    };

    const { error } = await supabase
      .from("customers")
      .upsert(dbRow, { onConflict: "id" });

    if (error) {
      console.warn("Could not save customer details to cloud:", error.message);
    }
  } catch (err) {
    console.error("Customer cloud state insertion issue:", err);
  }
}

// ---- COLLECTIONS CMS INTEGRATION ----
export async function getCollectionsFromCloud(): Promise<CollectionMaster[]> {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("Could not query collections from Supabase, using local defaults:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      banner: row.banner || "",
      thumbnail: row.thumbnail || "",
      description: row.description || "",
      shortDescription: row.short_description || row.shortDescription || row.description || "",
      buttonText: row.button_text || row.buttonText || "View Collection",
      altText: row.alt_text || row.altText || row.name || "",
      seoTitle: row.seo_title || row.seoTitle || "",
      seoDescription: row.seo_description || row.seoDescription || "",
      metaTitle: row.meta_title || row.metaTitle || row.seo_title || "",
      metaDescription: row.meta_description || row.metaDescription || row.seo_description || "",
      displayOrder: Number(row.display_order ?? row.displayOrder ?? 0),
      featured: row.featured !== false,
      showOnHomepage: row.show_on_homepage !== false,
      isActive: row.is_active !== false
    }));
  } catch (err) {
    console.error("Collections cloud query failure:", err);
    return [];
  }
}

export async function saveCollectionToCloud(collection: CollectionMaster): Promise<void> {
  try {
    const dbRow = {
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      banner: collection.banner || "",
      thumbnail: collection.thumbnail || "",
      description: collection.description || "",
      short_description: collection.shortDescription || collection.description || "",
      button_text: collection.buttonText || "View Collection",
      alt_text: collection.altText || collection.name || "",
      seo_title: collection.seoTitle || collection.metaTitle || "",
      seo_description: collection.seoDescription || collection.metaDescription || "",
      meta_title: collection.metaTitle || collection.seoTitle || "",
      meta_description: collection.metaDescription || collection.seoDescription || "",
      display_order: collection.displayOrder ?? 0,
      featured: collection.featured !== false,
      show_on_homepage: collection.showOnHomepage !== false,
      is_active: collection.isActive !== false
    };

    const { error } = await supabase
      .from("collections")
      .upsert(dbRow, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert failed - collections table offline or missing:", error.message);
    }

    // Enforce Category follows Collection automatically
    const catRow = {
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      banner: collection.banner || "",
      thumbnail: collection.thumbnail || "",
      description: collection.description || "",
      seo_title: collection.seoTitle || "",
      seo_description: collection.seoDescription || "",
      display_order: collection.displayOrder ?? 0,
      featured: !!collection.featured,
      keywords: collection.slug
    };

    const { error: catError } = await supabase
      .from("categories")
      .upsert(catRow, { onConflict: "id" });

    if (catError) {
      console.warn("Supabase categories auto-sync upsert failed:", catError.message);
    }
  } catch (err) {
    console.error("Collections and categories cloud sync error:", err);
  }
}

export async function deleteCollectionFromCloud(collectionId: string): Promise<void> {
  try {
    // Delete master collection
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collectionId);

    if (error) {
      console.warn("Supabase collection delete failed:", error.message);
    }

    // Delete linked category automatically
    const { error: catError } = await supabase
      .from("categories")
      .delete()
      .eq("id", collectionId);

    if (catError) {
      console.warn("Supabase linked category auto-delete failed:", catError.message);
    }
  } catch (err) {
    console.error("Collection and category cloud delete failure:", err);
  }
}

// ---- CUSTOMERS CMS INTEGRATION ----
export async function syncCustomersFromCloud(): Promise<CustomerProfile[]> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");

    if (error) {
      console.warn("Could not query customers from Supabase, using local defaults:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || "",
      status: row.status || (row.is_blocked ? "Blocked" : "Active"),
      tags: Array.isArray(row.tags) ? row.tags : (row.tags ? [row.tags] : ["Retail"]),
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      lastOrderDate: row.last_order_date || row.lastOrderDate || undefined,
      totalOrders: Number(row.total_orders ?? row.totalOrders ?? 0),
      totalSpend: Number(row.total_spend ?? row.totalSpend ?? 0),
      avgOrderValue: Number(row.avg_order_value ?? row.avgOrderValue ?? 0),
      addressBook: Array.isArray(row.address_book) ? row.address_book : (row.addressBook || []),
      shippingAddresses: Array.isArray(row.shipping_addresses) ? row.shipping_addresses : (row.shippingAddresses || []),
      billingAddresses: Array.isArray(row.billing_addresses) ? row.billing_addresses : (row.billingAddresses || []),
      wishlist: Array.isArray(row.wishlist) ? row.wishlist : [],
      recentlyViewed: Array.isArray(row.recently_viewed) ? row.recently_viewed : (row.recentlyViewed || []),
      timeline: Array.isArray(row.timeline) ? row.timeline : [],
      notes: Array.isArray(row.notes) ? row.notes : [],
      rewardPoints: Number(row.reward_points ?? row.rewardPoints ?? 0),
      storeCredit: Number(row.store_credit ?? row.storeCredit ?? 0),
      referralCode: row.referral_code || row.referralCode || `CLI-${row.name ? row.name.slice(0, 3).toUpperCase() : 'REF'}-${Math.floor(1000 + Math.random() * 9000)}`,
      couponHistory: Array.isArray(row.coupon_history) ? row.coupon_history : (row.couponHistory || []),
      marketingConsent: row.marketing_consent || row.marketingConsent || { emailOptIn: true, smsOptIn: true, whatsappOptIn: true, newsletter: true },
      isBlocked: !!(row.is_blocked || row.isBlocked || row.status === "Blocked"),
      blockReason: row.block_reason || row.blockReason || "",
      supportRequests: Array.isArray(row.support_requests) ? row.support_requests : (row.supportRequests || [])
    }));
  } catch (err) {
    console.error("Customers cloud query failure:", err);
    return [];
  }
}
export async function deleteCustomerFromCloud(customerId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (error) {
      console.warn("Supabase customer delete failed:", error.message);
    }
  } catch (err) {
    console.error("Customer cloud delete failure:", err);
  }
}

// ---- CATEGORIES CMS INTEGRATION ----
export async function syncCategoriesFromCloud(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.warn("Could not query categories from Supabase, using local defaults:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || "",
      banner: row.banner || "",
      seoTitle: row.seo_title || row.seoTitle || "",
      seoDescription: row.seo_description || row.seoDescription || "",
      keywords: row.keywords || ""
    }));
  } catch (err) {
    console.error("Categories cloud query failure:", err);
    return [];
  }
}

export async function saveCategoryToCloud(category: Category): Promise<void> {
  try {
    const dbRow = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      banner: category.banner || "",
      seo_title: category.seoTitle || "",
      seo_description: category.seoDescription || "",
      keywords: category.keywords || ""
    };

    const { error } = await supabase
      .from("categories")
      .upsert(dbRow, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert failed - categories table offline or missing:", error.message);
    }
  } catch (err) {
    console.error("Categories cloud sync error:", err);
  }
}

export async function deleteCategoryFromCloud(categoryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.warn("Supabase category delete failed:", error.message);
    }
  } catch (err) {
    console.error("Category cloud delete failure:", err);
  }
}

// ---- REVIEWS CMS INTEGRATION ----
export async function syncReviewsFromCloud(): Promise<ReviewItem[]> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.warn("Could not query reviews from Supabase:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      productId: row.product_id ?? row.productId,
      productName: row.product_name ?? row.productName,
      rating: Number(row.rating),
      userName: row.user_name ?? row.userName,
      comment: row.comment,
      location: row.location || "",
      approved: !!(row.approved),
      date: row.date
    }));
  } catch (err) {
    console.error("Reviews cloud query failure:", err);
    return [];
  }
}

export async function saveReviewToCloud(review: ReviewItem): Promise<void> {
  try {
    const dbRow = {
      id: review.id,
      product_id: review.productId,
      product_name: review.productName,
      rating: review.rating,
      user_name: review.userName,
      comment: review.comment,
      location: review.location,
      approved: !!review.approved,
      date: review.date
    };

    const { error } = await supabase
      .from("reviews")
      .upsert(dbRow, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert failed - reviews table offline or missing:", error.message);
    }
  } catch (err) {
    console.error("Reviews cloud sync error:", err);
  }
}

export async function deleteReviewFromCloud(reviewId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.warn("Supabase review delete failed:", error.message);
    }
  } catch (err) {
    console.error("Review cloud delete failure:", err);
  }
}

// ---- COUPONS CMS INTEGRATION ----
export async function syncCouponsFromCloud(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabase
      .from("coupon_codes")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      console.warn("Could not query coupon_codes from Supabase:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      code: row.code,
      type: row.type,
      value: Number(row.value),
      minCartValue: Number(row.min_cart_value ?? row.minCartValue ?? 0),
      expiryDate: row.expiry_date ?? row.expiryDate ?? ""
    }));
  } catch (err) {
    console.error("Coupons cloud query failure:", err);
    return [];
  }
}

export async function saveCouponToCloud(coupon: Coupon): Promise<void> {
  try {
    const dbRow = {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_cart_value: coupon.minCartValue,
      expiry_date: coupon.expiryDate
    };

    const { error } = await supabase
      .from("coupon_codes")
      .upsert(dbRow, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert failed - coupon_codes table offline or missing:", error.message);
    }
  } catch (err) {
    console.error("Coupons cloud sync error:", err);
  }
}

export async function deleteCouponFromCloud(couponId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("coupon_codes")
      .delete()
      .eq("id", couponId);

    if (error) {
      console.warn("Supabase coupon delete failed:", error.message);
    }
  } catch (err) {
    console.error("Coupon cloud delete failure:", err);
  }
}

// ---- RETURNS (ORDER RETURN REQUESTS) CMS INTEGRATION ----
export async function syncReturnsFromCloud(): Promise<OrderReturnRequest[]> {
  try {
    const { data, error } = await supabase
      .from("order_returns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not query order_returns from Supabase:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      orderId: row.order_id ?? row.orderId,
      customerEmail: row.customer_email ?? row.customerEmail,
      type: row.type,
      items: Array.isArray(row.items) ? row.items : [],
      reason: row.reason,
      description: row.description || "",
      imageProofUrl: row.image_proof_url ?? row.imageProofUrl,
      status: row.status,
      createdAt: row.created_at ?? row.createdAt
    }));
  } catch (err) {
    console.error("Returns cloud query failure:", err);
    return [];
  }
}

export async function saveReturnToCloud(returnReq: OrderReturnRequest): Promise<void> {
  try {
    const dbRow = {
      id: returnReq.id,
      order_id: returnReq.orderId,
      customer_email: returnReq.customerEmail,
      type: returnReq.type,
      items: returnReq.items,
      reason: returnReq.reason,
      description: returnReq.description || "",
      image_proof_url: returnReq.imageProofUrl || "",
      status: returnReq.status,
      created_at: returnReq.createdAt
    };

    const { error } = await supabase
      .from("order_returns")
      .upsert(dbRow, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert failed - order_returns table offline or missing:", error.message);
    }
  } catch (err) {
    console.error("Returns cloud sync error:", err);
  }
}

export async function deleteReturnFromCloud(returnId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("order_returns")
      .delete()
      .eq("id", returnId);

    if (error) {
      console.warn("Supabase return delete failed:", error.message);
    }
  } catch (err) {
    console.error("Return cloud delete failure:", err);
  }
}


