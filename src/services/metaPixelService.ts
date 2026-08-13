/**
 * Clinza Premium E-Commerce Meta Pixel Integration Service
 * Logs standard funnel interactions and page pixel fires.
 */

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

const META_PIXEL_ID = ((import.meta as any).env?.VITE_META_PIXEL_ID || "META_PIXEL_ID_PLACEHOLDER") as string;

export function initMetaPixel() {
  if (typeof window === "undefined") return;

  // Standard Meta Pixel snippet
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );

  if (META_PIXEL_ID && META_PIXEL_ID !== "META_PIXEL_ID_PLACEHOLDER") {
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
    console.log(`[Meta Pixel] Initialized with Pixel ID: ${META_PIXEL_ID}`);
  } else {
    // Graceful developer logging
    console.warn("[Meta Pixel] ID is missing or set to placeholder. Pixel fires will be logged to console in developer fallback mode.");
    window.fbq = window.fbq || function (action: string, eventName: string, params?: any) {
      console.log(`[Meta Pixel Mock Fire] ${action} -> ${eventName}`, params || "");
    };
  }
}

/**
 * Fire page views
 */
export function trackMetaPageView() {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", "PageView");
}

/**
 * Fire product item lookups
 */
export function trackMetaViewContent(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  if (typeof window === "undefined" || !window.fbq) return;

  window.fbq("track", "ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "USD",
    content_category: product.category || "Apparel",
  });
}

/**
 * Fire cart items add logs
 */
export function trackMetaAddToCart(product: {
  id: string;
  name: string;
  price: number;
}) {
  if (typeof window === "undefined" || !window.fbq) return;

  window.fbq("track", "AddToCart", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "USD",
  });
}

/**
 * Fire checkout initiated state
 */
export function trackMetaInitiateCheckout(totalValue: number, itemsCount: number) {
  if (typeof window === "undefined" || !window.fbq) return;

  window.fbq("track", "InitiateCheckout", {
    value: totalValue,
    currency: "USD",
    num_items: itemsCount,
  });
}

/**
 * Fire checkout completion logs
 */
export function trackMetaPurchase(orderId: string, totalAmount: number, items: any[]) {
  if (typeof window === "undefined" || !window.fbq) return;

  window.fbq("track", "Purchase", {
    content_type: "product",
    content_ids: items.map(item => item.id),
    value: totalAmount,
    currency: "USD",
    order_id: orderId,
  });
}
