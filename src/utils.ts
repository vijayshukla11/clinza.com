/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, BlogPost, Order, CartItem, HomepageConfig, ThemeConfig, ThemeSlide, CollectionMaster, Category } from "./types";
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
  createBackupThemeConfigInCloud,
  getCollectionsFromCloud,
  saveCollectionToCloud,
  deleteCollectionFromCloud,
  syncCategoriesFromCloud,
  saveCategoryToCloud
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
    text: "#09090b",
    borderColor: "#e4e4e7"
  },
  typography: {
    headingFont: "sans-serif",
    bodyFont: "sans-serif",
    buttonFont: "sans-serif",
    headingWeight: "font-black",
    bodySize: "text-sm",
    fontSizeScale: "100%"
  },
  announcement: {
    enabled: true,
    text: "🔥 EXCLUSIVE DISCOUNTS: Flat 10% OFF + Free Cash On Delivery (COD) India-Wide Above ₹999!",
    bgColor: "#f27d26",
    textColor: "#ffffff",
    link: "collections/shirts"
  },
  header: {
    logoUrl: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/logo%20n%20deisgn/clinza.png",
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
  slides: [],
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
    { id: "1", name: "Anand Sen", image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", rating: 5, text: "The heavy plisse double-pleat linen trousers are the exact weight of expensive European designer labels. Perfect crease styling!" },
    { id: "2", name: "Kunal Kapoor", image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", rating: 5, text: "I ordered the redline 13.5 oz selvedge jeans on COD. Delivery was done in Pune in 2 days. The denim fit sits beautifully, ages like gold." }
  ],
  blogs: {
    enabled: true,
    heading: "Sartorial Conversations",
    selectedBlogIds: [],
    showFeaturedFirst: true
  },
  newsletter: {
    enabled: true,
    heading: "The CLINZA Newsletter",
    description: "Register your email to receive priority updates on new collections and seasonal releases.",
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
  },
  brandName: "CLINZA",
  brandTagline: "Premium Organic Clothing",
  faviconUrl: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/logo%20n%20deisgn/clinza%20favicon.png",
  mobileLogo: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/logo%20n%20deisgn/clinza.png",
  heroOverlayOpacity: 40,
  borderRadius: "rounded-xl",
  buttonStyle: "rounded",
  cardStyle: "bordered",
  newArrivalsBanner: {
    isPublished: true,
    label: "NEW ARRIVALS",
    heading: "Fresh Styles.",
    headingHighlight: "New Vibes.",
    description: "Discover our latest seasonal drops crafted with fine breathable linens, structured cottons, and refined minimalist fits.",
    ctaText: "SHOP NEW ARRIVALS",
    ctaLink: "collections/new-arrivals",
    image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    features: [
      { icon: "Sparkles", title: "Premium Fabrics", description: "High-grade Italian & Japanese linen-cotton weaves." },
      { icon: "Shirt", title: "Modern Fit", description: "Precision tailoring designed for effortless drapes." },
      { icon: "Layers", title: "Versatile Styles", description: "Day-to-night minimalist essentials for any occasion." },
      { icon: "ShieldCheck", title: "Quality Assured", description: "Double-stitched seams & handcrafted finishes." }
    ]
  },
  lookbookSection: {
    isPublished: true,
    label: "LOOKBOOK",
    heading: "Designed for",
    headingLine2: "Modern Living.",
    description: "Discover effortless dressing with breathable fabrics, refined tailoring and timeless silhouettes designed for everyday confidence.",
    buttonText: "EXPLORE LOOKBOOK",
    buttonLink: "collections/all",
    mainImage: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    secondaryImage: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  summerEssentialsSection: {
    isPublished: true,
    label: "SUMMER ESSENTIALS",
    heading: "Lightweight. Effortless.",
    headingHighlight: "Premium.",
    description: "Experience the ultimate seasonal campaign with refined Italian linen, relaxed resort tailoring, and airy silhouettes designed for modern warm-weather luxury.",
    buttonText: "SHOP SUMMER COLLECTION",
    buttonLink: "collections/summer",
    image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    highlights: [
      { icon: "Feather", title: "Breathable Linen", description: "Pure natural flax fibers woven for maximum air permeability." },
      { icon: "Sparkles", title: "Premium Cotton", description: "Ultra-soft extra-long staple organic cotton for weightless comfort." },
      { icon: "Sun", title: "Everyday Comfort", description: "Unstructured silhouettes engineered for fluid movement." },
      { icon: "Scissors", title: "Modern Tailoring", description: "Hand-finished double lapels and French seams." }
    ]
  }
};

export const DEFAULT_HOME_CONFIG: HomepageConfig = {
  slides: [],
  trendingTitle: "Trending Curation",
  trendingSubtitle: "Highly Coveted Silhouettes",
  editorialTitle: "Style & Craftsmanship",
  editorialSubtitle: "CLINZA JOURNAL",
  editorialDesc: "Discover our guides on European flax linen, fine cotton weaves, and timeless luxury wardrobe essentials.",
  editorialImg: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
  offers: [
    {
      id: "offer-1",
      image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
      title: "Linen Resort Wardrobe",
      subtitle: "Spun from long-staple Normandy flax, meticulously pre-washed.",
      discount: "FLAT 10% OFF",
      buttonText: "Shop Now",
      link: "collections/shirts",
      badge: "BEST SELLER",
      startDate: "2026-07-01",
      endDate: "2026-12-31"
    },
    {
      id: "offer-2",
      image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
      title: "Selvedge Denim Drop",
      subtitle: "Woven on historical Japanese shuttle looms with authentic redline tickers.",
      discount: "FREE SHIPPING",
      buttonText: "Explore",
      link: "collections/jeans",
      badge: "NEW ARRIVAL",
      startDate: "2026-07-01",
      endDate: "2026-12-31"
    },
    {
      id: "offer-3",
      image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
      title: "Double-Breasted Blazers",
      subtitle: "Reinterpreting classical office attire for the modern visionary.",
      discount: "UP TO 15% OFF",
      buttonText: "Sartorial Fits",
      link: "collections/pants",
      badge: "LIMITED DROP",
      startDate: "2026-07-01",
      endDate: "2026-12-31"
    },
    {
      id: "offer-4",
      image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
      title: "Luxury Accessories",
      subtitle: "Handcrafted leather accents and everyday minimal luxury goods.",
      discount: "COMPLIMENTARY GIFT",
      buttonText: "Discover",
      link: "collections/accessories",
      badge: "EXQUISITE",
      startDate: "2026-07-01",
      endDate: "2026-12-31"
    }
  ],
  newArrivalsBanner: {
    isPublished: true,
    label: "NEW ARRIVALS",
    heading: "Fresh Styles.",
    headingHighlight: "New Vibes.",
    description: "Discover our latest seasonal drops crafted with fine breathable linens, structured cottons, and refined minimalist fits.",
    ctaText: "SHOP NEW ARRIVALS",
    ctaLink: "collections/new-arrivals",
    image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    features: [
      { icon: "Sparkles", title: "Premium Fabrics", description: "High-grade Italian & Japanese linen-cotton weaves." },
      { icon: "Shirt", title: "Modern Fit", description: "Precision tailoring designed for effortless drapes." },
      { icon: "Layers", title: "Versatile Styles", description: "Day-to-night minimalist essentials for any occasion." },
      { icon: "ShieldCheck", title: "Quality Assured", description: "Double-stitched seams & handcrafted finishes." }
    ]
  },
  lookbookSection: {
    isPublished: true,
    label: "LOOKBOOK",
    heading: "Designed for",
    headingLine2: "Modern Living.",
    description: "Discover effortless dressing with breathable fabrics, refined tailoring and timeless silhouettes designed for everyday confidence.",
    buttonText: "EXPLORE LOOKBOOK",
    buttonLink: "collections/all",
    mainImage: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    secondaryImage: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  summerEssentialsSection: {
    isPublished: true,
    label: "SUMMER ESSENTIALS",
    heading: "Lightweight. Effortless.",
    headingHighlight: "Premium.",
    description: "Experience the ultimate seasonal campaign with refined Italian linen, relaxed resort tailoring, and airy silhouettes designed for modern warm-weather luxury.",
    buttonText: "SHOP SUMMER COLLECTION",
    buttonLink: "collections/summer",
    image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    highlights: [
      { icon: "Feather", title: "Breathable Linen", description: "Pure natural flax fibers woven for maximum air permeability." },
      { icon: "Sparkles", title: "Premium Cotton", description: "Ultra-soft extra-long staple organic cotton for weightless comfort." },
      { icon: "Sun", title: "Everyday Comfort", description: "Unstructured silhouettes engineered for fluid movement." },
      { icon: "Scissors", title: "Modern Tailoring", description: "Hand-finished double lapels and French seams." }
    ]
  }
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

  // 4. Sync public Curated Collections
  try {
    const cloudCollections = await getCollectionsFromCloud();
    if (cloudCollections && cloudCollections.length > 0) {
      saveCollections(cloudCollections);
    } else if (auth.currentUser && auth.currentUser.email === "sastaelectronic6@gmail.com") {
      const currentLocals = getCollections();
      for (const col of currentLocals) {
        await saveCollectionToCloud(col).catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Could not sync collections from cloud:", err);
  }

  // 5. Sync public Categories (follows Collections as master)
  try {
    const cloudCategories = await syncCategoriesFromCloud();
    if (cloudCategories && cloudCategories.length > 0) {
      localStorage.setItem("clinza_categories", JSON.stringify(cloudCategories));
    } else {
      const currentLocals = getCollections().map(mapCollectionToCategory);
      localStorage.setItem("clinza_categories", JSON.stringify(currentLocals));
      if (auth.currentUser && auth.currentUser.email === "sastaelectronic6@gmail.com") {
        for (const cat of currentLocals) {
          await saveCategoryToCloud(cat).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.warn("Could not sync categories from cloud:", err);
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
  
  // Deduct stock for each ordered item
  if (order.items && Array.isArray(order.items)) {
    for (const item of order.items) {
      deductProductStock(item.productId, item.quantity);
    }
  }
  
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

const CLINZA_COMBO_IMAGE = "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png";

export function sanitizeImageUrl(url: string | undefined): string {
  if (!url || typeof url !== "string" || url.includes("unsplash.com") || url.trim() === "") {
    return CLINZA_COMBO_IMAGE;
  }
  return url;
}

export function getHomeConfig(): HomepageConfig {
  let config: HomepageConfig = DEFAULT_HOME_CONFIG;
  if (!localStorage.getItem(HOME_CONFIG_KEY)) {
    localStorage.setItem(HOME_CONFIG_KEY, JSON.stringify(DEFAULT_HOME_CONFIG));
  } else {
    try {
      config = JSON.parse(localStorage.getItem(HOME_CONFIG_KEY)!);
    } catch (e) {
      config = DEFAULT_HOME_CONFIG;
    }
  }

  // Dynamic sanitization of unsplash images
  config.editorialImg = sanitizeImageUrl(config.editorialImg);
  if (config.lookbookSection) {
    config.lookbookSection.mainImage = sanitizeImageUrl(config.lookbookSection.mainImage);
    config.lookbookSection.secondaryImage = sanitizeImageUrl(config.lookbookSection.secondaryImage);
  }
  if (config.summerEssentialsSection) {
    config.summerEssentialsSection.image = sanitizeImageUrl(config.summerEssentialsSection.image);
  }
  if (config.newArrivalsBanner) {
    config.newArrivalsBanner.image = sanitizeImageUrl(config.newArrivalsBanner.image);
  }
  if (Array.isArray(config.offers)) {
    config.offers = config.offers.map(o => ({
      ...o,
      image: sanitizeImageUrl(o.image)
    }));
  }

  return config;
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

export function mapCollectionToCategory(col: CollectionMaster): Category {
  return {
    id: col.id,
    name: col.name,
    slug: col.slug,
    description: col.description || "",
    banner: "",
    seoTitle: col.seoTitle || "",
    seoDescription: col.seoDescription || "",
    keywords: col.slug
  };
}

export function getCollections(): CollectionMaster[] {
  const cached = localStorage.getItem("clinza_collections_master");
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Clean out legacy invalid duplicate items if present
        const cleaned = parsed.filter((c: any) => c.id !== "linen-combo-set" && c.slug !== "linen-combo-set");
        if (cleaned.length > 0) {
          return cleaned;
        }
      }
    } catch (e) {
      console.error("Failed to parse clinza_collections_master cache:", e);
    }
  }

  // Pure single source of truth Master Collections (Combos, Shirts, Pants, Jeans, Footwear)
  const initial: CollectionMaster[] = [
    { 
      id: "combos", 
      name: "Combos", 
      slug: "combos", 
      banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", 
      thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", 
      description: "Pre-coordinated matching clothing sets curated for effortless styling.", 
      displayOrder: 1, 
      featured: true, 
      seoTitle: "Combo Sets | Clinza", 
      seoDescription: "Shop luxury organic pre-coordinated apparel combo bundles." 
    },
    { 
      id: "shirts", 
      name: "Shirts", 
      slug: "shirts", 
      banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", 
      thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", 
      description: "Premium linen and organic cotton shirts crafted for supreme breathability.", 
      displayOrder: 2, 
      featured: true, 
      seoTitle: "Premium Shirts | Clinza", 
      seoDescription: "Shop premium luxury linen and cotton shirts." 
    },
    { 
      id: "pants", 
      name: "Pants", 
      slug: "pants", 
      banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", 
      thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", 
      description: "Pleated heavyweight trousers and tailored modern chinos.", 
      displayOrder: 3, 
      featured: true, 
      seoTitle: "Sartorial Pants | Clinza", 
      seoDescription: "Double pleat elegant trousers and pants." 
    },
    { 
      id: "jeans", 
      name: "Jeans", 
      slug: "jeans", 
      banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", 
      thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", 
      description: "Selvedge denim jeans structured for timeless shapes.", 
      displayOrder: 4, 
      featured: true, 
      seoTitle: "Selvedge Jeans | Clinza Denim", 
      seoDescription: "Heavy raw indigo selvedge denim jeans." 
    },
    { 
      id: "footwear", 
      name: "Footwear", 
      slug: "footwear", 
      banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", 
      thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", 
      description: "Luxury leather footwear handcrafted to perfect your silhouette.", 
      displayOrder: 5, 
      featured: true, 
      seoTitle: "Luxury Footwear | Clinza", 
      seoDescription: "Handcrafted suede and full grain leather loafers." 
    }
  ];

  localStorage.setItem("clinza_collections_master", JSON.stringify(initial));
  
  // Also keep categories in sync locally!
  const initialCategories = initial.map(mapCollectionToCategory);
  localStorage.setItem("clinza_categories", JSON.stringify(initialCategories));

  return initial;
}

export function saveCollections(list: CollectionMaster[]): void {
  console.log("saveCollections() writing to localstorage key: clinza_collections_master", list);
  localStorage.setItem("clinza_collections_master", JSON.stringify(list));
  // Keep categories list matched to collections!
  const matchingCategories = list.map(mapCollectionToCategory);
  localStorage.setItem("clinza_categories", JSON.stringify(matchingCategories));
}

export function calculateCartTotals(cart: CartItem[], appliedCoupon: string | null) {
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  
  // Automatic 20% discount when subtotal >= 3000
  let discountPercent = 0;
  if (subtotal >= 3000) {
    discountPercent = 20;
  } else if (appliedCoupon) {
    if (appliedCoupon === "CLINZA10") {
      discountPercent = 10;
    } else if (appliedCoupon === "LUXURY20") {
      discountPercent = 20;
    }
  }

  const discount = Math.round(subtotal * (discountPercent / 100));
  const tax = 0; // Tax is ALWAYS ₹0
  const shipping = 50; // Shipping is ALWAYS ₹50 flat
  const total = subtotal - discount + tax + shipping;

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total,
    discountPercent,
    appliedCoupon
  };
}

export function deductProductStock(productId: string, qtyToDeduct: number) {
  const current = getProducts();
  const index = current.findIndex(p => p.id === productId);
  if (index !== -1) {
    const product = current[index];
    const currentQty = (product as any).stockQuantity !== undefined
      ? (product as any).stockQuantity
      : (product.stockStatus === "Out of Stock" ? 0 : 120);
    
    const newQty = Math.max(0, currentQty - qtyToDeduct);
    
    const updatedProduct = {
      ...product,
      stockQuantity: newQty,
      stockStatus: newQty <= 0 ? "Out of Stock" as const : (newQty < 20 ? "Low Stock" as const : "In Stock" as const)
    };
    
    current[index] = updatedProduct;
    saveProducts(current);
    
    saveProductToCloud(updatedProduct).catch(err => console.error("Cloud product stock deduction failed:", err));
  }
}


