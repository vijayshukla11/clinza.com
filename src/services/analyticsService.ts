/**
 * Clinza Premium E-Commerce Analytics Pipeline (GA4 & GTM)
 * Handles centralized funnel events, page views, and behavioral tracking.
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = ((import.meta as any).env?.VITE_GA_MEASUREMENT_ID || "G-XXXXXXXXXX") as string;
const GTM_ID = ((import.meta as any).env?.VITE_GTM_ID || "GTM-XXXXXXXX") as string;

// Initialize Google Tag Manager and Google Analytics 4 dynamically
export function initAnalytics() {
  if (typeof window === "undefined") return;

  // 1. Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // Define helper function
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false, // Page view is managed manually below
    cookie_flags: "SameSite=None;Secure",
  });

  // 2. Inject Google Analytics script dynamically
  if (!document.getElementById("google-gtag-script")) {
    const script = document.createElement("script");
    script.id = "google-gtag-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  // 3. Inject Google Tag Manager (GTM)
  if (!document.getElementById("gtm-script")) {
    const gtmScript = document.createElement("script");
    gtmScript.id = "gtm-script";
    gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');`;
    document.head.appendChild(gtmScript);

    // Also inject GTM iframe noscript fallback into body
    const noscript = document.createElement("noscript");
    noscript.id = "gtm-noscript";
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);
  }

  console.log(`[Analytics] Initialized GA4 (${GA_MEASUREMENT_ID}) & GTM (${GTM_ID})`);
}

/**
 * Tracks a simple page view to GA4 and GTM
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined" || !window.gtag) return;

  // Standard GA4
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });

  // Custom GTM DataLayer Push
  window.dataLayer.push({
    event: "virtual_page_view",
    pagePath: path,
    pageTitle: title || document.title,
  });
}

/**
 * Tracks product details view (View Item event)
 */
export function trackProductView(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  sku?: string;
}) {
  if (typeof window === "undefined" || !window.gtag) return;

  const item = {
    item_id: product.id,
    item_name: product.name,
    price: product.price,
    item_category: product.category || "General",
    item_brand: "CLINZA",
    index: 0,
    quantity: 1,
  };

  // GA4 View Item
  window.gtag("event", "view_item", {
    currency: "USD",
    value: product.price,
    items: [item],
  });

  // GTM DataLayer Push
  window.dataLayer.push({
    event: "view_item",
    ecommerce: {
      currency: "USD",
      value: product.price,
      items: [item],
    },
  });
}

/**
 * Tracks collection view (View Item List event)
 */
export function trackCollectionView(collectionSlug: string, collectionName: string, itemsCount: number) {
  if (typeof window === "undefined" || !window.gtag) return;

  // GA4 view_item_list
  window.gtag("event", "view_item_list", {
    item_list_id: collectionSlug,
    item_list_name: collectionName,
  });

  // GTM DataLayer Push
  window.dataLayer.push({
    event: "view_item_list",
    collection_slug: collectionSlug,
    collection_name: collectionName,
    items_count: itemsCount,
  });
}

/**
 * Tracks add to cart action
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  quantity?: number;
}, selectedSize?: string, selectedColor?: string) {
  if (typeof window === "undefined" || !window.gtag) return;

  const item = {
    item_id: product.id,
    item_name: product.name,
    price: product.price,
    item_category: product.category || "General",
    item_brand: "CLINZA",
    item_variant: `${selectedSize || ""}-${selectedColor || ""}`,
    quantity: product.quantity || 1,
  };

  // GA4 Add to Cart
  window.gtag("event", "add_to_cart", {
    currency: "USD",
    value: product.price * (product.quantity || 1),
    items: [item],
  });

  // GTM DataLayer
  window.dataLayer.push({
    event: "add_to_cart",
    ecommerce: {
      currency: "USD",
      value: product.price * (product.quantity || 1),
      items: [item],
    },
  });
}

/**
 * Tracks initiate checkout sequence
 */
export function trackBeginCheckout(cartItems: any[], totalValue: number) {
  if (typeof window === "undefined" || !window.gtag) return;

  const items = cartItems.map((prod, idx) => ({
    item_id: prod.id,
    item_name: prod.name,
    price: prod.price,
    item_category: prod.category || "General",
    item_brand: "CLINZA",
    item_variant: `${prod.size || ""}-${prod.color || ""}`,
    quantity: prod.quantity || 1,
    index: idx,
  }));

  // GA4 begin_checkout
  window.gtag("event", "begin_checkout", {
    currency: "USD",
    value: totalValue,
    items: items,
  });

  // GTM DataLayer
  window.dataLayer.push({
    event: "begin_checkout",
    ecommerce: {
      currency: "USD",
      value: totalValue,
      items: items,
    },
  });
}

/**
 * Tracks order purchase checkout completion
 */
export function trackPurchase(orderId: string, totalAmount: number, items: any[]) {
  if (typeof window === "undefined" || !window.gtag) return;

  const mappedItems = items.map((prod, idx) => ({
    item_id: prod.id,
    item_name: prod.name,
    price: prod.price,
    item_brand: "CLINZA",
    quantity: prod.quantity || 1,
    index: idx,
  }));

  // GA4 purchase
  window.gtag("event", "purchase", {
    transaction_id: orderId,
    value: totalAmount,
    currency: "USD",
    tax: 0.0,
    shipping: 0.0,
    items: mappedItems,
  });

  // GTM purchase
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: orderId,
      value: totalAmount,
      currency: "USD",
      tax: 0.0,
      shipping: 0.0,
      items: mappedItems,
    },
  });
}

/**
 * Tracks editorial blog views
 */
export function trackBlogView(blogId: string, slug: string, title: string) {
  if (typeof window === "undefined" || !window.gtag) return;

  // Custom GA4 Editorial Event
  window.gtag("event", "view_blog", {
    blog_id: blogId,
    blog_slug: slug,
    blog_title: title,
  });

  // GTM post DataLayer
  window.dataLayer.push({
    event: "blog_view",
    blog_id: blogId,
    blog_slug: slug,
    blog_title: title,
  });
}
