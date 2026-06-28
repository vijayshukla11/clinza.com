/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, BlogPost, Order, CartItem, HomepageConfig, ThemeConfig, ThemeSlide } from "./types";
import { INITIAL_PRODUCTS, INITIAL_BLOGS } from "./data";
import { 
  auth,
  syncProductsFromCloud, 
  saveProductToCloud, 
  deleteProductFromCloud, 
  syncBlogsFromCloud, 
  saveBlogToCloud, 
  deleteBlogFromCloud, 
  syncOrdersFromCloud, 
  saveOrderToCloud,
  getSingleOrderFromCloud,
  syncHomepageConfigFromCloud,
  saveHomepageConfigToCloud,
  syncThemeConfigFromCloud,
  saveThemeConfigToCloud,
  rollbackThemeConfigInCloud,
  createBackupThemeConfigInCloud
} from "./supabase";

const PRODUCTS_KEY = "clinza_products_db";
const BLOGS_KEY = "clinza_blogs_db";
const ORDERS_KEY = "clinza_orders_db";
const WISHLIST_KEY = "clinza_wishlist_db";
const CART_KEY = "clinza_cart_db";
const NEWSLETTER_KEY = "clinza_newsletters_db";
const SEARCH_HISTORY_KEY = "clinza_search_history_db";
const HOME_CONFIG_KEY = "clinza_homepage_config";
const THEME_ACTIVE_KEY = "clinza_theme_active";
const THEME_DRAFT_KEY = "clinza_theme_draft";

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  colors: {
    primary: "#09090b",
    secondary: "#f4f4f5",
    accent: "#f27d26",
    button: "#f27d26",
    headerBg: "#ffffff",
    footerBg: "#09090b",
    background: "#ffffff",
    text: "#09090b"
  },
  typography: {
    headingFont: "sans-serif",
    bodyFont: "sans-serif",
    buttonFont: "sans-serif",
    headingWeight: "font-black",
    bodySize: "text-sm"
  },
  announcement: {
    enabled: true,
    text: "🔥 EXCLUSIVE DISCOUNTS: Flat 10% OFF + Free Cash On Delivery (COD) India-Wide Above ₹999!",
    bgColor: "#f27d26",
    textColor: "#ffffff",
    link: "collections/shirts"
  },
  header: {
    logoUrl: "",
    menuItems: [
      { label: "Home", route: "home" },
      { label: "Linen Shirts", route: "collections/shirts" },
      { label: "Selvedge Jeans", route: "collections/jeans" },
      { label: "Sartorial Trousers", route: "collections/pants" },
      { label: "Editorial Room", route: "blog" },
      { label: "Track Shipment", route: "track-order" }
    ],
    enableMegaMenu: true,
    enableSearchBar: true,
    enableCartIcon: true,
    enableWishlistIcon: true,
    enableAccountIcon: true
  },
  sliderSettings: {
    autoSlide: true,
    slideSpeed: 5000,
    animationType: "fade",
    navArrows: true,
    paginationDots: true,
    pauseOnHover: true
  },
  slides: [
    {
      id: "1",
      desktopImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600",
      mobileImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=640",
      badge: "SARTORIAL SEASON",
      subtitle: "The Premium Summer Collection",
      title: "ELEVATED CUBAN CUTS",
      description: "Breathe effortlessly. Minimalist silhouettes designed with heavyweight double pleated linen trousers and mother-of-pearl resort shirts.",
      button1Text: "Explore Shirts",
      button1Link: "collections/shirts",
      button2Text: "Shop All Designs",
      button2Link: "collections/all",
      bgOverlay: 40,
      textPosition: "left",
      textColor: "#ffffff",
      enabled: true
    },
    {
      id: "2",
      desktopImage: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=1600",
      mobileImage: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=640",
      badge: "EUROPEAN FLAX",
      subtitle: "Premium Linen Series",
      title: "TACTILE TEXTURAL LINEN",
      description: "Spun from long-staple Normandy flax, meticulously pre-washed for zero skin friction. Elegant modern spread-collar profiles.",
      button1Text: "Sartorial Trousers",
      button1Link: "collections/pants",
      button2Text: "Curated Style Room",
      button2Link: "blog",
      bgOverlay: 30,
      textPosition: "center",
      textColor: "#ffffff",
      enabled: true
    }
  ],
  featuredCollections: {
    enabled: true,
    title: "The Clinza Departments",
    description: "Expertly tailored silhouettes using premium organic linen yarn and vintage shuttle denim fabrics.",
    collectionIds: ["shirts", "jeans", "pants", "combos", "footwear"],
    layout: "grid"
  },
  trendingProducts: {
    enabled: true,
    title: "Highly Coveted Pieces",
    selectionMethod: "automatic",
    productIds: []
  },
  features: {
    enabled: true,
    cards: [
      { id: "1", icon: "Award", title: "Premium Long-Staple Flax", description: "Sourced directly, bringing supreme thermoregulation & lightweight skin feel to every wear." },
      { id: "2", icon: "ShieldCheck", title: "Pronto Secure COD Checkouts", description: "Verify garments at your doorstep and pay instantly with Cash On Delivery option nationwide." },
      { id: "3", icon: "Flame", title: "Fast Express Shipping", description: "Mumbai-based warehouses ensure delivery inside metropolitan locations under 48 hours." },
      { id: "4", icon: "RefreshCw", title: "Easy Returns Policy", description: "Hassle-free seven-day window to swap sizing tags. Complete product health insurance." }
    ]
  },
  testimonials: [
    { id: "1", name: "Anand Sen", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", rating: 5, text: "The heavy plisse double-pleat linen trousers are the exact weight of expensive European designer labels. Perfect crease styling!" },
    { id: "2", name: "Kunal Kapoor", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150", rating: 5, text: "I ordered the redline 13.5 oz selvedge jeans on COD. Delivery was done in Pune in 2 days. The denim fit sits beautifully, ages like gold." }
  ],
  blogs: {
    enabled: true,
    heading: "Sartorial Conversations",
    selectedBlogIds: [],
    showFeaturedFirst: true
  },
  newsletter: {
    enabled: true,
    heading: "The CLINZA Editorial List",
    description: "Register your email to gain instant priority notices regarding seasonal resort drops.",
    buttonText: "Subscribe",
    bgImage: "",
    bgColor: "#09090b"
  },
  footer: {
    companyInfo: "CLINZA is a premium direct-to-consumer fashion house engineered in Mumbai. We design luxurious elevated wardrobe articles from authentic natural flax and heritage raw fabrics.",
    address: "Clinza Corporate House, S.V. Road, Santacruz West, Mumbai, MH - 400054",
    email: "concierge@clinza.com",
    phone: "+91 72085 72688",
    facebookLink: "https://facebook.com",
    instagramLink: "https://instagram.com",
    twitterLink: "https://twitter.com",
    whatsappLink: "https://wa.me/917208572688",
    copyrightText: "© 2026 CLINZA Premium Clothing Ltd. All rights reserved."
  },
  policies: {
    privacy: "Review our deep administrative data treating practices, designed to safe-keep sizing pictures.",
    returnPolicy: "Hassle-free 7 days sizing swap request channels. Keep ticket tags bound.",
    refundPolicy: "Pre-paid gateway refunds disbursed instantly. COD orders exchanged via bank coordinates.",
    shippingPolicy: "Double-checked for crease zero flaws. Metro cities transit delivers inside 3 days.",
    terms: "Corporate contract policies and catalog pricing acceptance parameters.",
    contactPage: "Chat with the executive desk or log tracking sequences directly with our stylist helpline."
  }
};

export const DEFAULT_HOME_CONFIG: HomepageConfig = {
  slides: [
    {
      id: 1,
      badge: "SARTORIAL SEASON",
      subtitle: "The Summer Collection",
      title: "ELEVATED CUBAN CUTS",
      description: "Breathe effortlessly. Minimalist silhouettes designed with heavyweight double pleated linen trousers and mother-of-pearl resort shirts.",
      image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=1600",
      route: "collections/shirts"
    },
    {
      id: 2,
      badge: "EUROPEAN FLAX",
      subtitle: "Premium Linen series",
      title: "TACTILE TEXTURAL SILK",
      description: "Spun from long-staple Normandy flax, meticulously pre-washed for zero skin friction. Elegant modern spread-collar profiles.",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1600",
      route: "collections/shirts"
    },
    {
      id: 3,
      badge: "MODERN ARISTOCRAT",
      subtitle: "Business Casual Curation",
      title: "INTELLIGENT CASUAL COMFORT",
      description: "Premium double-breasted blazers paired beautifully with tapered stretch pants. Reinterpreting classical office attire for the modern visionary.",
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=1600",
      route: "collections/pants"
    },
    {
      id: 4,
      badge: "SOCIETY OFF-DUTY",
      subtitle: "The Weekend Collection",
      title: "MINIMALIST DRAWSTRING ESSENTIALS",
      description: "Complete linen-blend co-ords. Sophisticated side-vented camp shirts designed for seamless beach-to-evening style styling.",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600",
      route: "collections/combos"
    },
    {
      id: 5,
      badge: "INDIGO ARCHIVES",
      subtitle: "Trending Selvedge Denim",
      title: "13.5 OZ SOLID HEAVY RAW DENIM",
      description: "Woven meticulously on historical Japanese shuttle looms. Authentic redline tickers, designed to age beautifully with your lifestyle.",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=1600",
      route: "collections/jeans"
    }
  ],
  trendingTitle: "Trending Curation",
  trendingSubtitle: "Highly Coveted Silhouettes",
  editorialTitle: "Unpacking Textile Architecture",
  editorialSubtitle: "Clinza Publication Room",
  editorialDesc: "Read deep reports regarding sustainable European flax agriculture, Mumbai denim loom methods, and precise luxury styling rules formulated directly by our staff.",
  editorialImg: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800"
};

export function initializeDatabase() {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(BLOGS_KEY)) {
    localStorage.setItem(BLOGS_KEY, JSON.stringify(INITIAL_BLOGS));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(WISHLIST_KEY)) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CART_KEY)) {
    localStorage.setItem(CART_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(NEWSLETTER_KEY)) {
    localStorage.setItem(NEWSLETTER_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(SEARCH_HISTORY_KEY)) {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(["Linen", "Jeans", "Accessories"]));
  }
  if (!localStorage.getItem(HOME_CONFIG_KEY)) {
    localStorage.setItem(HOME_CONFIG_KEY, JSON.stringify(DEFAULT_HOME_CONFIG));
  }
  if (!localStorage.getItem(THEME_ACTIVE_KEY)) {
    localStorage.setItem(THEME_ACTIVE_KEY, JSON.stringify(DEFAULT_THEME_CONFIG));
  }
  if (!localStorage.getItem(THEME_DRAFT_KEY)) {
    localStorage.setItem(THEME_DRAFT_KEY, JSON.stringify(DEFAULT_THEME_CONFIG));
  }

  // Load custom configs from cloud if exists
  syncHomepageConfigFromCloud().then(config => {
    if (config) {
      localStorage.setItem(HOME_CONFIG_KEY, JSON.stringify(config));
    }
  }).catch(() => {});

  syncThemeConfigFromCloud(false).then(activeTheme => {
    if (activeTheme) {
      localStorage.setItem(THEME_ACTIVE_KEY, JSON.stringify(activeTheme));
    }
  }).catch(() => {});

  syncThemeConfigFromCloud(true).then(draftTheme => {
    if (draftTheme) {
      localStorage.setItem(THEME_DRAFT_KEY, JSON.stringify(draftTheme));
    }
  }).catch(() => {});

  // Soft-trigger an asynchronous cloud sync to avoid blocking the main thread
  forceSyncFromCloud().catch(err => {
    console.debug("Initial background cloud sync skipped/failed:", err);
  });
}

// FORCE INTERACTIVE CLOUD SYNCING FOR COHESIVE READS
export async function forceSyncFromCloud() {
  // 1. Sync public products Catalog
  try {
    const cloudProducts = await syncProductsFromCloud();
    if (cloudProducts && cloudProducts.length > 0) {
      saveProducts(cloudProducts);
    } else if (auth.currentUser && auth.currentUser.email === "sastaelectronic6@gmail.com") {
      // If cloud was freshly provisioned and has zero catalog items, seed it from our local template
      const currentLocals = getProducts();
      for (const prod of currentLocals) {
        await saveProductToCloud(prod).catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Could not sync products catalog from firestore (offline / standard permissions):", err);
  }

  // 2. Sync public Editorial fashion archive Blogs
  try {
    const cloudBlogs = await syncBlogsFromCloud();
    if (cloudBlogs && cloudBlogs.length > 0) {
      saveBlogs(cloudBlogs);
    } else if (auth.currentUser && auth.currentUser.email === "sastaelectronic6@gmail.com") {
      const currentLocals = getBlogs();
      for (const blog of currentLocals) {
        await saveBlogToCloud(blog).catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Could not sync editorial blogs from firestore:", err);
  }

  // 3. Sync private corporate Orders (Requires authenticated administrator login credentials)
  if (auth.currentUser && auth.currentUser.email === "sastaelectronic6@gmail.com") {
    try {
      const cloudOrders = await syncOrdersFromCloud();
      if (cloudOrders && cloudOrders.length > 0) {
        saveOrders(cloudOrders);
      }
    } catch (err) {
      // Highly expected and secure check that standard non-logged-in customers are rejected access
      console.debug("Corporate orders sync omitted for non-staff instances.");
    }
  }
}

// Products API
export function getProducts(): Product[] {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  }
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Product) {
  const current = getProducts();
  current.unshift(product);
  saveProducts(current);
  
  // Update cloud asynchronous
  saveProductToCloud(product).catch(err => console.error("Cloud product save failed:", err));
}

export function editProduct(updated: Product) {
  const current = getProducts();
  const index = current.findIndex(p => p.id === updated.id);
  if (index !== -1) {
    current[index] = updated;
    saveProducts(current);
    
    saveProductToCloud(updated).catch(err => console.error("Cloud product edit failed:", err));
  }
}

export function deleteProduct(id: string) {
  const current = getProducts();
  const updated = current.filter(p => p.id !== id);
  saveProducts(updated);
  
  deleteProductFromCloud(id).catch(err => console.error("Cloud product delete failed:", err));
}

// Blogs API
export function getBlogs(): BlogPost[] {
  if (!localStorage.getItem(BLOGS_KEY)) {
    localStorage.setItem(BLOGS_KEY, JSON.stringify(INITIAL_BLOGS));
  }
  return JSON.parse(localStorage.getItem(BLOGS_KEY) || "[]");
}

export function saveBlogs(blogs: BlogPost[]) {
  localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
}

export function addBlog(blog: BlogPost) {
  const current = getBlogs();
  current.unshift(blog);
  saveBlogs(current);
  
  saveBlogToCloud(blog).catch(err => console.error("Cloud blog save failed:", err));
}

export function editBlog(updated: BlogPost) {
  const current = getBlogs();
  const index = current.findIndex(b => b.id === updated.id);
  if (index !== -1) {
    current[index] = updated;
    saveBlogs(current);
    
    saveBlogToCloud(updated).catch(err => console.error("Cloud blog edit failed:", err));
  }
}

export function deleteBlog(id: string) {
  const current = getBlogs();
  const updated = current.filter(b => b.id !== id);
  saveBlogs(updated);
  
  deleteBlogFromCloud(id).catch(err => console.error("Cloud blog delete failed:", err));
}

// Orders API
export function getOrders(): Order[] {
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
  }
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function createOrder(order: Omit<Order, "id" | "status" | "trackingHistory" | "createdAt">): Order {
  const currentList = getOrders();
  const nextSeq = String(currentList.length + 1).padStart(6, "0");
  const orderNum = `CLNZA-2026-${nextSeq}`;
  const now = new Date().toISOString();
  
  const fullOrder: Order = {
    ...order,
    id: orderNum,
    status: "Pending",
    createdAt: now,
    trackingHistory: [
      {
        status: "Pending",
        timestamp: now,
        description: "Order placed successfully. Thank you for choosing CLINZA."
      }
    ]
  };

  currentList.unshift(fullOrder);
  saveOrders(currentList);
  
  // Sync to Firestore
  saveOrderToCloud(fullOrder).catch(err => console.error("Firestore order logging failed:", err));
  
  return fullOrder;
}

export function updateOrderStatus(orderId: string, status: Order["status"], note?: string) {
  const current = getOrders();
  const index = current.findIndex(o => o.id === orderId);
  if (index !== -1) {
    const order = current[index];
    order.status = status;
    order.trackingHistory.push({
      status,
      timestamp: new Date().toISOString(),
      description: note || `Order status updated to ${status}`
    });
    saveOrders(current);
    
    // Sync order modification to cloud
    saveOrderToCloud(order).catch(err => console.error("Firestore order update failed:", err));
  }
}

export function updateOrderTracking(
  orderId: string, 
  trackingNumber: string, 
  courierPartner: string, 
  status?: Order["status"], 
  updateNote?: string
) {
  const current = getOrders();
  const index = current.findIndex(o => o.id === orderId);
  if (index !== -1) {
    const order = current[index];
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (courierPartner !== undefined) order.courierPartner = courierPartner;
    
    const now = new Date().toISOString();
    if (status) {
      order.status = status;
      order.trackingHistory.push({
        status,
        timestamp: now,
        description: updateNote || `Parcel status advanced to ${status}. Carrier partner: ${courierPartner || 'Shiprocket'}. Tracking Code: ${trackingNumber || 'Pending'}.`
      });
    } else if (updateNote) {
      order.trackingHistory.push({
        status: order.status,
        timestamp: now,
        description: updateNote
      });
    }
    saveOrders(current);
    saveOrderToCloud(order).catch(err => console.error("Firestore order tracking save failed:", err));
  }
}

// Fetch single order statically for tracking (tries cloud, falls back to local check)
export async function fetchOrderForTracking(orderId: string): Promise<Order | null> {
  try {
    const cloudOrder = await getSingleOrderFromCloud(orderId);
    if (cloudOrder) {
      // Update local storage so cache is synced
      const current = getOrders();
      const index = current.findIndex(o => o.id === orderId);
      if (index !== -1) {
        current[index] = cloudOrder;
      } else {
        current.unshift(cloudOrder);
      }
      saveOrders(current);
      return cloudOrder;
    }
  } catch (err) {
    console.warn("Online order lookup restricted or timed out, assessing local cache:", err);
  }
  
  const local = getOrders();
  return local.find(o => o.id === orderId) || null;
}

// Cart UI
export function getCart(): CartItem[] {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Wishlist API
export function getWishlist(): string[] {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
}

export function saveWishlist(wishlist: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}

// Product / Blog saving wrappers for Admin Panel
export function saveProduct(product: Product) {
  const current = getProducts();
  const index = current.findIndex(p => p.id === product.id);
  if (index !== -1) {
    current[index] = product;
    saveProducts(current);
  } else {
    current.unshift(product);
    saveProducts(current);
  }
  
  saveProductToCloud(product).catch(err => console.error("Cloud product save wrapper failed:", err));
}

export function saveBlogPost(blog: BlogPost) {
  const current = getBlogs();
  const index = current.findIndex(b => b.slug === blog.slug || b.id === blog.id);
  if (index !== -1) {
    current[index] = blog;
    saveBlogs(current);
  } else {
    current.unshift(blog);
    saveBlogs(current);
  }
  
  saveBlogToCloud(blog).catch(err => console.error("Cloud blog save wrapper failed:", err));
}

export function deleteBlogPost(slug: string) {
  const current = getBlogs();
  const matched = current.find(b => b.slug === slug);
  const updated = current.filter(b => b.slug !== slug);
  saveBlogs(updated);
  
  if (matched) {
    deleteBlogFromCloud(matched.id).catch(err => console.error("Cloud blog delete wrapper failed:", err));
  }
}

export function getReviews(): any[] {
  return getProducts().flatMap(p => p.reviews || []);
}

// Newsletter API
export function addNewsletterEmail(email: string): boolean {
  const current = JSON.parse(localStorage.getItem(NEWSLETTER_KEY) || "[]") as string[];
  if (current.includes(email)) {
    return false;
  }
  current.push(email);
  localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(current));
  return true;
}

export function subscribeNewsletter(email: string): boolean {
  return addNewsletterEmail(email);
}

export function getNewsletterEmails(): string[] {
  return JSON.parse(localStorage.getItem(NEWSLETTER_KEY) || "[]");
}

// Search history helper
export function getSearchHistory(): string[] {
  return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
}

export function addSearchHistory(queryStr: string) {
  if (!queryStr.trim()) return;
  const current = getSearchHistory();
  const filtered = current.filter(q => q.toLowerCase() !== queryStr.toLowerCase());
  filtered.unshift(queryStr);
  const truncated = filtered.slice(0, 8); // Keep last 8 searches
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(truncated));
}

export function clearSearchHistory() {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([]));
}

export function getHomeConfig(): HomepageConfig {
  if (!localStorage.getItem(HOME_CONFIG_KEY)) {
    localStorage.setItem(HOME_CONFIG_KEY, JSON.stringify(DEFAULT_HOME_CONFIG));
  }
  try {
    return JSON.parse(localStorage.getItem(HOME_CONFIG_KEY) || JSON.stringify(DEFAULT_HOME_CONFIG));
  } catch (e) {
    return DEFAULT_HOME_CONFIG;
  }
}

export function saveHomeConfig(config: HomepageConfig) {
  localStorage.setItem(HOME_CONFIG_KEY, JSON.stringify(config));
  // Sync to database
  saveHomepageConfigToCloud(config).catch(err => console.error("Cloud config sync failed:", err));
}

// Custom Shopify Theme Customizer API
export function getThemeConfig(isDraft: boolean = false): ThemeConfig {
  const key = isDraft ? THEME_DRAFT_KEY : THEME_ACTIVE_KEY;
  const raw = localStorage.getItem(key);
  if (!raw) {
    // If not found, try to populate from the other key, or fall back to default
    const peerKey = isDraft ? THEME_ACTIVE_KEY : THEME_DRAFT_KEY;
    const peerRaw = localStorage.getItem(peerKey);
    if (peerRaw) {
      localStorage.setItem(key, peerRaw);
      return JSON.parse(peerRaw);
    }
    localStorage.setItem(key, JSON.stringify(DEFAULT_THEME_CONFIG));
    return DEFAULT_THEME_CONFIG;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_THEME_CONFIG;
  }
}

export function saveThemeConfig(config: ThemeConfig, isDraft: boolean = false) {
  const key = isDraft ? THEME_DRAFT_KEY : THEME_ACTIVE_KEY;
  localStorage.setItem(key, JSON.stringify(config));
  
  // Async update our Supabase server
  saveThemeConfigToCloud(config, isDraft).catch(err => {
    console.warn("Could not save theme configuration to remote database:", err);
  });
}

export async function publishThemeConfig(config: ThemeConfig): Promise<void> {
  // Create backup of previous published version first if possible
  const prevPublished = getThemeConfig(false);
  try {
    await createBackupThemeConfigInCloud(prevPublished);
  } catch (err) {
    console.warn("Could not backup previous theme published state:", err);
  }

  // Set as published & draft both
  localStorage.setItem(THEME_ACTIVE_KEY, JSON.stringify(config));
  localStorage.setItem(THEME_DRAFT_KEY, JSON.stringify(config));
  
  await saveThemeConfigToCloud(config, false);
  await saveThemeConfigToCloud(config, true);
}

export async function rollbackThemeConfig(): Promise<ThemeConfig | null> {
  const backup = await rollbackThemeConfigInCloud();
  if (backup) {
    localStorage.setItem(THEME_ACTIVE_KEY, JSON.stringify(backup));
    localStorage.setItem(THEME_DRAFT_KEY, JSON.stringify(backup));
    return backup;
  }
  return null;
}

