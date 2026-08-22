/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  useNavigate, 
  useLocation, 
  useParams,
  Navigate 
} from "react-router-dom";
import { 
  Sparkles, 
  MessageCircleCode, 
  CheckCircle, 
  Flame, 
  Star, 
  Award, 
  Heart, 
  ShoppingBag, 
  ArrowRight, 
  X, 
  Phone, 
  Mail, 
  Instagram, 
  ShieldCheck, 
  Tag 
} from "lucide-react";

// Existing custom views
import TopShippingBar from "./components/TopShippingBar";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import CollectionList from "./components/CollectionList";
import BestSellersSection from "./components/BestSellersSection";
import NewArrivalsBanner from "./components/NewArrivalsBanner";
import LookbookSection from "./components/LookbookSection";
import SummerEssentialsSection from "./components/SummerEssentialsSection";
import ProductCard from "./components/ProductCard";
import ProductDetail from "./components/ProductDetail";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import TrackOrderPage from "./components/TrackOrderPage";
import BlogSystem from "./components/BlogSystem";
import AdminPanel from "./components/AdminPanel";
import FeaturesSection from "./components/FeaturesSection";
import WhatsAppButton from "./components/WhatsAppButton";
import PolicyPageView from "./components/PolicyPageView";
import ContactPage from "./components/ContactPage";
import NotFoundPage from "./components/NotFoundPage";
import SchemaMarkup from "./components/SchemaMarkup";

// New high-fidelity Shopify-style views
import AboutPage from "./components/AboutPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AccountPage from "./components/AccountPage";
import ShopAllCollectionsPage from "./components/ShopAllCollectionsPage";
import CollectionsPage from "./components/CollectionsPage";
import CollectionDetailPage from "./components/CollectionDetailPage";
import TopRankedProductsPage from "./components/TopRankedProductsPage";
import TrendingLeaderboardSection from "./components/TrendingLeaderboardSection";

import { Product, CartItem, Order, Category, HomepageSectionConfig, HomepageConfig } from "./types";
import {
  getProducts,
  getCollections,
  getCart,
  saveCart,
  getWishlist,
  saveWishlist,
  subscribeNewsletter,
  initializeDatabase,
  getOrders,
  getBlogs,
  getHomeConfig,
  getHomepageSections,
  getThemeConfig,
  saveThemeConfig,
  saveHomeConfig,
  calculateComboPromotion,
  isComboProduct
} from "./utils";

import { CategoriesService, CollectionsService, CollectionItem, ProductsService } from "./services/supabaseService";
import { isProductInCollection } from "./utils/productMatcher";

import { 
  trackPageView, 
  trackProductView, 
  trackCollectionView, 
  trackAddToCart, 
  trackBeginCheckout, 
  trackPurchase, 
  trackBlogView 
} from "./services/analyticsService";

import { 
  trackMetaPageView, 
  trackMetaViewContent, 
  trackMetaAddToCart, 
  trackMetaInitiateCheckout, 
  trackMetaPurchase 
} from "./services/metaPixelService";

// Core App Entry Point wrapping BrowserRouter
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// AppContent executes inside BrowserRouter, allowing use of React Router Hooks
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Categories from Supabase state
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsState, setProductsState] = useState<Product[]>(() => getProducts());

  // Core global state matching prior specifications
  const [theme, setTheme] = useState(() => getThemeConfig(false));
  const [homeConfigState, setHomeConfigState] = useState<HomepageConfig>(() => getHomeConfig());
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [wishlist, setWishlistState] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orderSuccessDetail, setOrderSuccessDetail] = useState<Order | null>(null);
  const [successTrackingQuery, setSuccessTrackingQuery] = useState("");

  // Cart summary transition variables
  const [checkoutSummary, setCheckoutSummary] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    appliedCoupon: null as string | null
  });

  // Newsletter form subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubbed, setNewsletterSubbed] = useState(false);
  const [newsletterErr, setNewsletterErr] = useState<string | null>(null);

  // Auto-initialize local storage databases
  useEffect(() => {
    initializeDatabase();
    setCartState(getCart());
    setWishlistState(getWishlist());
    setTheme(getThemeConfig(false));

    // Fetch categories and products from Supabase
    const refreshCategories = () => {
      CategoriesService.getAll().then(res => {
        if (res && res.length > 0) {
          setCategories(res);
        }
      });
    };
    const refreshProducts = () => {
      const loadStart = performance.now();
      console.log(`[PERF][App] Product catalog loading initiated at ${new Date().toISOString()}`);
      ProductsService.getAll().then(res => {
        const duration = (performance.now() - loadStart).toFixed(2);
        console.log(`[PERF][App] Product catalog loaded: ${res?.length || 0} products in ${duration}ms`);
        if (res && res.length > 0) {
          setProductsState(res);

          // Automatically purge deleted products from cart and wishlist
          const validProductIds = new Set(res.map(p => p.id));

          setCartState(prevCart => {
            const cleanedCart = prevCart.filter(item => validProductIds.has(item.product.id));
            if (cleanedCart.length !== prevCart.length) {
              saveCart(cleanedCart);
            }
            return cleanedCart;
          });

          setWishlistState(prevWishlist => {
            const cleanedWishlist = prevWishlist.filter(id => validProductIds.has(id));
            if (cleanedWishlist.length !== prevWishlist.length) {
              saveWishlist(cleanedWishlist);
            }
            return cleanedWishlist;
          });
        }
      });
    };
    refreshCategories();
    refreshProducts();

    const refreshHomepage = () => {
      setHomeConfigState(getHomeConfig());
      setTheme(getThemeConfig(false));
    };

    window.addEventListener("clinza_categories_updated", refreshCategories);
    window.addEventListener("clinza_collections_updated", refreshCategories);
    window.addEventListener("clinza_products_updated", refreshProducts);
    window.addEventListener("clinza_homepage_updated", refreshHomepage);
    window.addEventListener("clinza_theme_updated", refreshHomepage);

    // Try and recover any active logged-in customer profile session from localStorage
    try {
      const stored = localStorage.getItem("clinza_customer_session");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {}

    return () => {
      window.removeEventListener("clinza_categories_updated", refreshCategories);
      window.removeEventListener("clinza_collections_updated", refreshCategories);
      window.removeEventListener("clinza_products_updated", refreshProducts);
      window.removeEventListener("clinza_homepage_updated", refreshHomepage);
      window.removeEventListener("clinza_theme_updated", refreshHomepage);
    };
  }, []);

  // Update theme configurations periodically and track page views
  useEffect(() => {
    setTheme(getThemeConfig(false));
    trackPageView(location.pathname);
    trackMetaPageView();
  }, [location.pathname]);

  // Reset window scroll position on internal SPA route changes when no anchor hash is present
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.search]);

  // Handle automatic deep-link parsing to set activeProduct state when entering a product URL directly
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/product/")) {
      const slug = path.replace("/product/", "");
      const matched = getProducts().find(p => p.slug === slug);
      if (matched) {
        setActiveProduct(matched);
        trackProductView(matched);
        trackMetaViewContent(matched);
      }
    } else if (path === "/checkout") {
      const totalVal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      trackBeginCheckout(cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        category: item.product.category,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity
      })), totalVal);
      trackMetaInitiateCheckout(totalVal, cart.length);
    }
  }, [location.pathname]);

  const updateCart = (newCart: CartItem[]) => {
    setCartState(newCart);
    saveCart(newCart);
  };

  const addToCart = (product: Product, color: string, size: string, quantity = 1) => {
    const existingIdx = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedColor === color &&
        item.selectedSize === size
    );

    if (existingIdx > -1) {
      const copy = [...cart];
      copy[existingIdx].quantity += quantity;
      updateCart(copy);
    } else {
      updateCart([...cart, { product, selectedColor: color, selectedSize: size, quantity }]);
    }

    // Call centralized analytics tracking engines
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: quantity
    }, size, color);
    trackMetaAddToCart(product);
    
    // Smoothly pop open Mini Cart Drawer
    window.dispatchEvent(new CustomEvent("open_cart_drawer"));
  };

  const addFreeItemToCart = (product: Product, color: string, size: string) => {
    const freeItem: CartItem = {
      product: {
        ...product,
        price: 0
      },
      selectedColor: color,
      selectedSize: size,
      quantity: 1,
      isFreeItem: true,
      appliedOffer: "CLINZA_COMBO_TIER"
    };

    const paidCart = cart.filter(item => !item.isFreeItem);
    updateCart([...paidCart, freeItem]);
  };

  // Auto-prune free items if combo count drops below qualification threshold or gift type changes
  useEffect(() => {
    const promo = calculateComboPromotion(cart);
    const freeItemsInCart = cart.filter(i => i.isFreeItem);

    if (promo.freeGiftMaxCount === 0 && freeItemsInCart.length > 0) {
      const paidOnly = cart.filter(i => !i.isFreeItem);
      updateCart(paidOnly);
    } else if (promo.freeGiftMaxCount > 0 && freeItemsInCart.length > 0) {
      let changed = false;
      let validCount = 0;
      const filtered: CartItem[] = [];

      for (const item of cart) {
        if (item.isFreeItem) {
          const isCombo = isComboProduct(item.product);
          const isValidForTier = promo.freeGiftType === "combo_set" ? isCombo : !isCombo;

          if (isValidForTier && validCount < promo.freeGiftMaxCount) {
            if (item.quantity !== 1) {
              filtered.push({ ...item, quantity: 1 });
              changed = true;
            } else {
              filtered.push(item);
            }
            validCount++;
          } else {
            changed = true;
          }
        } else {
          filtered.push(item);
        }
      }

      if (changed) {
        updateCart(filtered);
      }
    }
  }, [cart]);

  const updateCartQty = (itemIndex: number, quantity: number) => {
    const copy = [...cart];
    copy[itemIndex].quantity = quantity;
    updateCart(copy);
  };

  const removeCartItem = (itemIndex: number) => {
    const copy = cart.filter((_, idx) => idx !== itemIndex);
    updateCart(copy);
  };

  const toggleWishlist = (product: Product) => {
    let copy = [...wishlist];
    const isPresent = copy.includes(product.id);
    if (isPresent) {
      copy = copy.filter((id) => id !== product.id);
    } else {
      copy.push(product.id);
    }
    setWishlistState(copy);
    saveWishlist(copy);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterErr(null);
    const email = newsletterEmail.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setNewsletterErr("Provide a correct email syntax (e.g. sam@gmail.com).");
      return;
    }
    const success = subscribeNewsletter(email);
    if (success) {
      setNewsletterSubbed(true);
      setNewsletterEmail("");
    } else {
      setNewsletterErr("This email is already registered inside Clinza's circles.");
    }
  };

  // Adapter function mapping old string-based route triggers to standard React Router navigate updates
  const handleOldRouteTrigger = (val: string) => {
    setSearchOpen(false);
    setActiveBlogSlug(null);

    if (!val) return;
    const cleanVal = val.startsWith("/") ? val.substring(1) : val;

    if (cleanVal === "home" || cleanVal === "") {
      navigate("/");
    } else if (cleanVal === "new-arrivals") {
      navigate("/new-arrivals");
    } else if (cleanVal === "trending") {
      navigate("/trending");
    } else if (cleanVal === "cart") {
      navigate("/cart");
    } else if (cleanVal === "checkout") {
      navigate("/checkout");
    } else if (cleanVal === "wishlist") {
      navigate("/wishlist");
    } else if (cleanVal === "track-order") {
      navigate("/track-order");
    } else if (cleanVal === "shop-all-collections") {
      navigate("/shop-all-collections");
    } else if (cleanVal === "contact") {
      navigate("/contact");
    } else if (cleanVal === "about") {
      navigate("/about");
    } else if (cleanVal === "login") {
      navigate("/login");
    } else if (cleanVal === "register") {
      navigate("/register");
    } else if (cleanVal === "account") {
      navigate("/account");
    } else if (cleanVal === "admin") {
      navigate("/admin");
    } else if (cleanVal === "admin/login") {
      navigate("/admin/login");
    } else if (cleanVal === "blog") {
      navigate("/blog");
    } else if (cleanVal.startsWith("collections/")) {
      const slug = cleanVal.replace("collections/", "");
      if (slug === "all") {
        navigate("/collections");
      } else if (["shirts", "jeans", "pants"].includes(slug.toLowerCase())) {
        navigate("/" + slug);
      } else {
        navigate("/collections/" + slug);
      }
    } else if (cleanVal.startsWith("product/") || cleanVal.startsWith("products/")) {
      const slug = cleanVal.replace(/^products?\//, "");
      navigate(`/product/${slug}`);
    } else if (cleanVal.startsWith("policy/")) {
      const policySlug = cleanVal.replace("policy/", "");
      navigate(`/${policySlug}`);
    } else {
      navigate("/" + cleanVal);
    }
  };

  // Clean-up variable mapping current route path back to string for UI active states
  const getCurrentActiveRouteString = (): string => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/new-arrivals") return "new-arrivals";
    if (path === "/trending") return "trending";
    if (path === "/cart") return "cart";
    if (path === "/checkout") return "checkout";
    if (path === "/wishlist") return "wishlist";
    if (path === "/blog") return "blog";
    if (path === "/contact") return "contact";
    if (path === "/about") return "about";
    if (path === "/login") return "login";
    if (path === "/register") return "register";
    if (path === "/account") return "account";
    if (path.startsWith("/product/")) return "product";
    if (path === "/shirts" || path === "/jeans" || path === "/pants") return `collections${path}`;
    return path.replace(/^\//, "");
  };

  // Determine whether we are in an administrative route to hide regular customer layout
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div id="clinza-e-commerce-root" className="min-h-screen flex flex-col bg-[#FAFAF8] w-full min-w-0 overflow-x-clip">
      <SchemaMarkup activeProduct={activeProduct} activeBlogSlug={activeBlogSlug} />
      
      {/* STICKY HEADER (HIDDEN ON ADMIN VIEWS) */}
      {!isAdminRoute && (
        <div className="w-full relative z-50">
          <Navbar
            currentRoute={getCurrentActiveRouteString()}
            setRoute={handleOldRouteTrigger}
            cart={cart}
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            updateCartQty={updateCartQty}
            removeCartItem={removeCartItem}
            wishlist={wishlist}
            wishlistCount={wishlist.length}
            toggleWishlist={toggleWishlist}
            addToCart={addToCart}
            currentUser={currentUser}
            onLogout={() => { setCurrentUser(null); localStorage.removeItem("clinza_customer_session"); }}
            onSearch={(query) => {
              setSearchQuery(query);
              handleOldRouteTrigger("collections/all");
            }}
            setSearchOpen={setSearchOpen}
            searchOpen={searchOpen}
          />
        </div>
      )}

      {/* DYNAMIC PAGE ROUTE MOUNT */}
      <main className="flex-1 w-full min-w-0 overflow-x-clip">
        
        {/* SUCCESS MODAL REDIRECT */}
        {orderSuccessDetail ? (
          <section id="order-success-screen" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-[85vh] flex flex-col items-center justify-center text-left">
            <div className="max-w-xl w-full bg-white border border-gray-150 rounded-3xl p-8 md:p-10 shadow-lg text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <ShieldCheck className="h-9 w-9 stroke-[2]" />
              </div>
              
              <span className="text-[10px] font-black tracking-widest text-[#F27D26] uppercase font-mono mb-2">
                Corporate COD Reservation Confirmed
              </span>

              <h2 className="text-2xl sm:text-3xl font-sans font-black uppercase tracking-tight text-gray-900 mb-2">
                Sartorial Order Accepted
              </h2>

              <p className="text-gray-550 text-xs sm:text-sm font-sans mb-6">
                Thank you for ordering with us. Your reservation ticket is <strong className="text-gray-900 font-bold uppercase font-mono">{orderSuccessDetail.id}</strong>. We are vacuum-packing your linen coordinates for hygiene.
              </p>

              {/* ORDER DATA DRILLS */}
              <div className="w-full bg-gray-50 rounded-2xl p-5 text-left text-xs font-sans text-gray-650 space-y-3 mb-6 border border-gray-150">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="font-bold text-gray-950">Order Number:</span>
                  <span className="font-black text-[#F27D26] font-mono tracking-wider">{orderSuccessDetail.id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="font-bold text-gray-950">Customer Name:</span>
                  <span className="font-semibold text-gray-800">{orderSuccessDetail.customer.name}</span>
                </div>
                <div className="border-b border-gray-100 pb-2 space-y-1">
                  <p className="font-bold text-gray-950">Order Summary:</p>
                  <div className="pl-2 space-y-1.5 divide-y divide-gray-100">
                    {orderSuccessDetail.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] pt-1 text-gray-600">
                        <span>{it.name} (x{it.quantity} • {it.size})</span>
                        <span className="font-mono">₹{(it.price * it.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="font-bold text-gray-950">Total Pay Amount:</span>
                  <span className="font-extrabold text-gray-950 font-serif">₹{orderSuccessDetail.totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Deliver Destination:</span>
                  <span className="font-semibold text-gray-800">{orderSuccessDetail.customer.city}, {orderSuccessDetail.customer.state}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="font-bold text-gray-950">Expected Delivery:</span>
                  <span className="font-bold text-green-700 font-mono">
                    {(() => {
                      const est = new Date();
                      est.setDate(est.getDate() + 4);
                      return est.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Integrated Method:</span>
                  <span className="font-bold text-green-700 tracking-wider">CASH ON DELIVERY (COD)</span>
                </div>
              </div>

              {/* DEDICATED TRACKING INPUT FIELD */}
              <div className="w-full bg-zinc-50 border border-gray-200 rounded-2xl p-5 text-left text-xs mb-8 space-y-3.5">
                <span className="text-[10px] font-black tracking-widest text-[#F27D26] uppercase font-mono block">
                  Interactive Shiprocket Waybill Tracker
                </span>
                <p className="text-gray-500 font-light leading-relaxed">
                  Enter your assigned Order ID below to track your package live. We've pre-filled it with your current Order ID below:
                </p>
                <div className="flex gap-2 w-full mt-2">
                  <div className="relative flex-1">
                    <input
                      id="success-tracking-input"
                      type="text"
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-mono font-bold tracking-wider text-gray-950 uppercase focus:outline-none focus:ring-1 focus:ring-[#F27D26]"
                      value={successTrackingQuery}
                      onChange={(e) => setSuccessTrackingQuery(e.target.value)}
                      placeholder="e.g. CLN-1001"
                    />
                  </div>
                  <button
                    id="success-tracking-btn"
                    onClick={() => {
                      if (successTrackingQuery.trim()) {
                        setOrderSuccessDetail(null);
                        navigate(`/track-order?orderId=${encodeURIComponent(successTrackingQuery.trim())}`, {
                          state: { orderId: successTrackingQuery.trim() }
                        });
                      }
                    }}
                    className="bg-zinc-950 hover:bg-[#F27D26] text-white px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Track Order Live
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                <button
                  id="success-track-packing"
                  onClick={() => {
                    setOrderSuccessDetail(null);
                    handleOldRouteTrigger("track-order");
                  }}
                  className="bg-gray-950 hover:bg-[#F27D26] text-white font-sans text-xs font-bold uppercase tracking-[0.15em] py-4 rounded-xl transition-colors cursor-pointer text-center"
                >
                  Track Cargo Shipments
                </button>
                <button
                  id="success-continue-shop"
                  onClick={() => {
                    setOrderSuccessDetail(null);
                    handleOldRouteTrigger("collections/all");
                  }}
                  className="bg-white hover:bg-gray-50 border border-gray-250 text-gray-800 font-sans text-xs font-bold uppercase tracking-[0.15em] py-4 rounded-xl transition-colors cursor-pointer text-center"
                >
                  Assemble More Outfits
                </button>
              </div>
            </div>
          </section>
        ) : (
          <Routes>
            {/* 1. HOME VIEW - Fully CMS-Driven Merchandising Architecture */}
            <Route path="/" element={
              <div id="home-route-viewport" className="animate-fade-in">
                {getHomepageSections(homeConfigState)
                  .filter((sec) => sec.active !== false)
                  .map((sec) => (
                    <motion.div
                      key={sec.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "0px" }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {(() => {
                        switch (sec.type) {
                          case "hero-slider":
                            return <HeroSlider setRoute={handleOldRouteTrigger} />;

                          case "features-bar":
                            return <FeaturesSection />;

                          case "collections-grid":
                            return <CollectionList setRoute={handleOldRouteTrigger} currentRoute={location.pathname} />;

                          case "best-sellers":
                            return (
                              <BestSellersSection
                                title={sec.title}
                                subtitle={sec.subtitle}
                                ctaText={sec.ctaText}
                                ctaUrl={sec.ctaUrl}
                                merchandisingSlug={sec.merchandisingSlug}
                                limit={sec.productLimit}
                                onProductClick={(p) => navigate(`/product/${p.slug || p.id}`)}
                                onAddToWishlist={toggleWishlist}
                                onAddToCart={addToCart}
                                wishlistIds={wishlist}
                                onOpenQuickView={setQuickViewProduct}
                                setRoute={handleOldRouteTrigger}
                              />
                            );

                          case "trending-leaderboard":
                            return (
                              <TrendingLeaderboardSection
                                title={sec.title}
                                subtitle={sec.subtitle}
                                ctaText={sec.ctaText}
                                ctaUrl={sec.ctaUrl}
                                merchandisingSlug={sec.merchandisingSlug}
                                limit={sec.productLimit}
                                onProductClick={(p) => navigate(`/product/${p.slug || p.id}`)}
                                onAddToWishlist={toggleWishlist}
                                onAddToCart={addToCart}
                                wishlistIds={wishlist}
                                onOpenQuickView={setQuickViewProduct}
                                setRoute={handleOldRouteTrigger}
                              />
                            );

                          case "new-arrivals-banner":
                            return (
                              <NewArrivalsBanner
                                title={sec.title}
                                subtitle={sec.subtitle}
                                ctaText={sec.ctaText}
                                ctaUrl={sec.ctaUrl}
                                banner={sec.banner}
                                setRoute={handleOldRouteTrigger}
                              />
                            );

                          case "lookbook":
                            return (
                              <LookbookSection
                                title={sec.title}
                                subtitle={sec.subtitle}
                                ctaText={sec.ctaText}
                                ctaUrl={sec.ctaUrl}
                                banner={sec.banner}
                                setRoute={handleOldRouteTrigger}
                              />
                            );

                          case "summer-essentials":
                            return (
                              <SummerEssentialsSection
                                title={sec.title}
                                subtitle={sec.subtitle}
                                ctaText={sec.ctaText}
                                ctaUrl={sec.ctaUrl}
                                banner={sec.banner}
                                setRoute={handleOldRouteTrigger}
                              />
                            );

                          case "offers":
                            return (
                              <section id="current-offers-section" className="py-12 md:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white text-left border-b border-gray-100">
                                <div className="max-w-7xl mx-auto">
                                  <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 border-b border-zinc-200 pb-4">
                                    <div className="max-w-xl text-left">
                                      <span className="text-[10px] font-black tracking-[0.2em] text-[#F27D26] uppercase mb-1.5 font-mono block">
                                        {sec.subtitle || "Exclusive Time-Limited Deals"}
                                      </span>
                                      <h2 className="text-2xl sm:text-3.5xl font-sans font-black tracking-tight text-gray-950 uppercase">
                                        {sec.title || "Current Offers"}
                                      </h2>
                                    </div>
                                  </div>

                                  {(() => {
                                    const homeConfig = getHomeConfig();
                                    const activeOffers = (homeConfig.offers || []).filter((offer: any) => {
                                      if (!offer.startDate || !offer.endDate) return true;
                                      const now = new Date();
                                      return now >= new Date(offer.startDate) && now <= new Date(offer.endDate);
                                    });

                                    if (activeOffers.length === 0) {
                                      return (
                                        <div className="text-center py-10 text-gray-400 font-sans text-xs">
                                          No active offers at this moment. Stay tuned for our next seasonal drop!
                                        </div>
                                      );
                                    }

                                    return (
                                      <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 sm:gap-6 pb-4 lg:pb-0 snap-x scrollbar-none">
                                        {activeOffers.map((offer: any, idx: number) => (
                                          <div
                                            id={`offer-card-${idx}`}
                                            key={idx}
                                            className="group relative flex flex-col bg-white border border-gray-150 rounded-none overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 h-[370px] sm:h-[440px] snap-start min-w-[270px] sm:min-w-[320px] lg:min-w-0 flex-shrink-0"
                                          >
                                            <div className="relative h-44 sm:h-64 overflow-hidden bg-gray-50">
                                              <img
                                                src={(offer.image && offer.image.trim()) || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"}
                                                alt={offer.title}
                                                className="h-full w-full object-cover object-center group-hover:scale-105 transition-all duration-700"
                                                loading="lazy"
                                                referrerPolicy="no-referrer"
                                              />
                                              {offer.badge && (
                                                <div className="absolute top-3 left-3 bg-orange-600 text-white font-mono text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 sm:px-3 sm:py-1">
                                                  {offer.badge}
                                                </div>
                                              )}
                                            </div>

                                            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                              <div>
                                                {offer.discount && (
                                                  <span className="text-[9px] sm:text-[10px] text-orange-600 font-bold tracking-widest uppercase mb-1 block font-mono">
                                                    {offer.discount}
                                                  </span>
                                                )}
                                                <h3 className="text-sm sm:text-base font-sans font-black text-gray-950 uppercase tracking-tight line-clamp-1">
                                                  {offer.title}
                                                </h3>
                                                <p className="text-[11px] sm:text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed font-light">
                                                  {offer.subtitle}
                                                </p>
                                              </div>

                                              <button
                                                id={`offer-btn-${idx}`}
                                                onClick={() => {
                                                  if (offer.link) {
                                                    handleOldRouteTrigger(offer.link);
                                                  } else {
                                                    handleOldRouteTrigger("collections/all");
                                                  }
                                                }}
                                                className="mt-3 w-full bg-zinc-950 hover:bg-orange-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest py-2 sm:py-3 rounded-none transition-colors duration-300 text-center flex items-center justify-center gap-1.5 font-mono cursor-pointer"
                                              >
                                                {offer.buttonText || sec.ctaText || "Shop Now"}
                                                <ArrowRight className="h-3.5 w-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </section>
                            );

                          case "journal-highlight":
                            return (
                              <section id="recent-blogs-highlight" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white text-left">
                                <div className="max-w-7xl mx-auto">
                                  {(() => {
                                    const cfg = getHomeConfig();
                                    const bannerImg = sec.banner || cfg.editorialImg;
                                    return (
                                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                        <div className="lg:col-span-5 space-y-5">
                                          <span className="text-[10px] font-black tracking-wider text-orange-400 font-mono uppercase bg-orange-600/10 px-3.5 py-1 rounded-full">
                                            {sec.subtitle || cfg.editorialSubtitle || "CLINZA JOURNAL"}
                                          </span>
                                          <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white uppercase leading-none">
                                            {sec.title || cfg.editorialTitle || "Style & Craftsmanship"}
                                          </h2>
                                          <p className="text-gray-400 text-xs sm:text-sm font-sans leading-relaxed">
                                            {cfg.editorialDesc || "Discover our guides on European flax linen, fine cotton weaves, and timeless luxury wardrobe essentials."}
                                          </p>
                                          <button
                                            id="home-blog-btn"
                                            onClick={() => handleOldRouteTrigger(sec.ctaUrl || "blog")}
                                            className="group bg-white text-gray-950 hover:bg-[#F27D26] hover:text-white font-sans text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                                          >
                                            {sec.ctaText || "Read Journal"}
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                          </button>
                                        </div>
                                        <div className="lg:col-span-7 rounded-2xl overflow-hidden aspect-[16/9] border border-white/10 shadow-xl bg-zinc-900">
                                          <img
                                            src={(bannerImg && bannerImg.trim()) || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"}
                                            alt="Journal cover image"
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </section>
                            );

                          case "trending-grid":
                          case "new-arrivals-grid":
                          case "merchandising-collection":
                          default: {
                            const rawSlug = (sec.merchandisingSlug || (sec.type === "new-arrivals-grid" ? "new-arrivals" : "trending")).toLowerCase().trim();
                            const limitCount = sec.productLimit || 4;
                            const filteredProds = (productsState.length > 0 ? productsState : getProducts())
                              .filter((prod) => isProductInCollection(prod, rawSlug))
                              .slice(0, limitCount);

                            return (
                              <section id={`sec-grid-${sec.id}`} className="py-12 md:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white text-left border-y border-gray-100">
                                <div className="max-w-7xl mx-auto">
                                  {sec.banner && (
                                    <div className="mb-8 rounded-2xl overflow-hidden h-[220px] sm:h-[300px] relative shadow-md">
                                      <img src={sec.banner} alt={sec.title} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                                        <div>
                                          <span className="text-orange-400 font-mono text-[10px] uppercase font-bold tracking-widest">{sec.subtitle}</span>
                                          <h3 className="text-2xl font-bold text-white uppercase">{sec.title}</h3>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-8">
                                    <div>
                                      <span className="text-[10px] font-black tracking-widest text-[#F27D26] uppercase font-mono block mb-1.5">
                                        {sec.subtitle || "Merchandising Curation"}
                                      </span>
                                      <h2 className="text-2xl sm:text-4xl font-sans font-black tracking-tight text-gray-950 uppercase">
                                        {sec.title || "Curated Selection"}
                                      </h2>
                                    </div>
                                    <button
                                      id={`sec-btn-${sec.id}`}
                                      onClick={() => handleOldRouteTrigger(sec.ctaUrl || `collections/${rawSlug}`)}
                                      className="mt-3 sm:mt-0 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#F27D26] hover:text-black transition-colors cursor-pointer"
                                    >
                                      {sec.ctaText || "Explore Collection"} <ArrowRight className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                    {filteredProds.map((prod) => (
                                      <ProductCard
                                        key={prod.id}
                                        product={prod}
                                        onProductClick={(p) => navigate(`/product/${p.slug || p.id}`)}
                                        onAddToWishlist={toggleWishlist}
                                        onAddToCart={addToCart}
                                        wishlistIds={wishlist}
                                        onOpenQuickView={setQuickViewProduct}
                                        setRoute={handleOldRouteTrigger}
                                        idPrefix={`home-sec-${sec.id}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </section>
                            );
                          }
                        }
                      })()}
                    </motion.div>
                  ))}
              </div>
            } />

            {/* 2. DIRECT CLOTHING CATEGORIES & COLLECTIONS */}
            <Route path="/shirts" element={<CategoryPage colSlug="shirts" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/linen-shirts" element={<CategoryPage colSlug="linen-shirts" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/cotton-shirts" element={<CategoryPage colSlug="cotton-shirts" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/jeans" element={<CategoryPage colSlug="jeans" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/pants" element={<CategoryPage colSlug="pants" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/linen-pants" element={<CategoryPage colSlug="linen-pants" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/formal-pants" element={<CategoryPage colSlug="formal-pants" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/combos" element={<CategoryPage colSlug="combos" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/combo-sets" element={<CategoryPage colSlug="combo-sets" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/new-arrivals" element={<CuratedPage type="new-arrivals" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/best-sellers" element={<DynamicCategoryPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/bestsellers" element={<DynamicCategoryPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/trending" element={<TopRankedProductsPage setRoute={handleOldRouteTrigger} onProductClick={(p) => navigate(`/product/${p.slug || p.id}`)} onAddToWishlist={toggleWishlist} onAddToCart={addToCart} wishlistIds={wishlist} onOpenQuickView={setQuickViewProduct} />} />
            <Route path="/top-ranked" element={<TopRankedProductsPage setRoute={handleOldRouteTrigger} onProductClick={(p) => navigate(`/product/${p.slug || p.id}`)} onAddToWishlist={toggleWishlist} onAddToCart={addToCart} wishlistIds={wishlist} onOpenQuickView={setQuickViewProduct} />} />
            <Route path="/collections" element={<CollectionsPage setRoute={handleOldRouteTrigger} onAddToCart={addToCart} onAddToWishlist={toggleWishlist} wishlistIds={wishlist} onOpenQuickView={setQuickViewProduct} />} />
            <Route path="/shop" element={<CollectionsPage setRoute={handleOldRouteTrigger} onAddToCart={addToCart} onAddToWishlist={toggleWishlist} wishlistIds={wishlist} onOpenQuickView={setQuickViewProduct} />} />
            <Route path="/collection/:slug" element={<DynamicCategoryPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/collections/:slug" element={<DynamicCategoryPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />

            {/* 3. PRODUCT SPEC DETAIL */}
            <Route path="/product/:slug" element={<ProductDetailPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/products/:slug" element={<ProductDetailPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} handleOldRouteTrigger={handleOldRouteTrigger} />} />

            {/* 4. CART & CHECKOUT SYSTEMS */}
            <Route path="/cart" element={
              <CartPage
                cart={cart}
                onUpdateQty={updateCartQty}
                onRemoveItem={removeCartItem}
                setRoute={handleOldRouteTrigger}
                onAddFreeItem={addFreeItemToCart}
                onCheckout={(subtotal, discount, tax, total, couponCode) => {
                  setCheckoutSummary({ subtotal, discount, tax, total, appliedCoupon: couponCode });
                  handleOldRouteTrigger("checkout");
                }}
              />
            } />
            <Route path="/checkout" element={
              <CheckoutPage
                cart={cart}
                checkoutSummary={checkoutSummary}
                setRoute={handleOldRouteTrigger}
                onOrderSuccess={(finalOrder) => {
                  setOrderSuccessDetail(finalOrder);
                  setSuccessTrackingQuery(finalOrder.id);
                  if (finalOrder) {
                    trackPurchase(finalOrder.id, finalOrder.totalAmount, finalOrder.items);
                    trackMetaPurchase(finalOrder.id, finalOrder.totalAmount, finalOrder.items);
                  }
                  updateCart([]); // flush standard cart
                }}
              />
            } />

            {/* 5. WISHLIST & ACCOUNT LEDGERS */}
            <Route path="/wishlist" element={<WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/shop-all-collections" element={
              <ShopAllCollectionsPage
                onAddToCart={addToCart}
                onAddToWishlist={toggleWishlist}
                wishlistIds={wishlist}
                onOpenQuickView={setQuickViewProduct}
                setRoute={handleOldRouteTrigger}
              />
            } />
            
            {/* Authenticated routes */}
            <Route path="/login" element={<LoginPage onLoginSuccess={(usr) => { setCurrentUser(usr); localStorage.setItem("clinza_customer_session", JSON.stringify(usr)); }} setRoute={handleOldRouteTrigger} />} />
            <Route path="/register" element={<RegisterPage onRegisterSuccess={(usr) => { setCurrentUser(usr); localStorage.setItem("clinza_customer_session", JSON.stringify(usr)); }} setRoute={handleOldRouteTrigger} />} />
            <Route path="/account" element={
              currentUser ? (
                <AccountPage user={currentUser} onLogout={() => { setCurrentUser(null); localStorage.removeItem("clinza_customer_session"); }} setRoute={handleOldRouteTrigger} />
              ) : (
                <Navigate to="/login" replace />
              )
            } />

            {/* 6. POLICIES */}
            <Route path="/shipping-policy" element={<PolicyPageView initialPolicy="shipping-policy" onBack={() => navigate("/")} setRoute={handleOldRouteTrigger} />} />
            <Route path="/return-policy" element={<PolicyPageView initialPolicy="return-policy" onBack={() => navigate("/")} setRoute={handleOldRouteTrigger} />} />
            <Route path="/privacy-policy" element={<PolicyPageView initialPolicy="privacy-policy" onBack={() => navigate("/")} setRoute={handleOldRouteTrigger} />} />
            <Route path="/terms-and-conditions" element={<PolicyPageView initialPolicy="terms-and-conditions" onBack={() => navigate("/")} setRoute={handleOldRouteTrigger} />} />

            {/* 7. CMS editorial journal */}
            <Route path="/blog" element={
              <BlogSystem
                setRoute={handleOldRouteTrigger}
                activeBlogSlug={activeBlogSlug}
                setActiveBlogSlug={setActiveBlogSlug}
              />
            } />
            <Route path="/blog/:slug" element={
              <BlogSystem
                setRoute={handleOldRouteTrigger}
                activeBlogSlug={activeBlogSlug}
                setActiveBlogSlug={setActiveBlogSlug}
              />
            } />

            {/* 8. PORTALS FOR STAFF */}
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/*" element={<AdminPanel />} />

            {/* Fallback 404 Page */}
            <Route path="*" element={<NotFoundPage navigate={navigate} handleOldRouteTrigger={handleOldRouteTrigger} />} />
          </Routes>
        )}

      </main>

      {/* FOOTER (HIDDEN ON ADMIN PANEL) */}
      {!isAdminRoute && (
        <footer id="clinza-corporate-footer" className="bg-zinc-950 text-white border-t border-white/5 py-16 px-4 sm:px-6 lg:px-8 text-left select-none">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
            
            {/* Column 1: Editorial */}
            <div className="space-y-4">
              <div className="flex items-center">
                <img
                  src="https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/logo%20n%20deisgn/clinza.png"
                  alt="CLINZA"
                  className="h-7 w-auto object-contain brightness-0 invert"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <h3 className="hidden font-sans font-black tracking-tighter text-xl text-white uppercase flex items-center">
                  CLINZA<span className="h-1.5 w-1.5 rounded-full bg-[#F27D26] ml-1 self-end mb-1"></span>
                </h3>
              </div>
              <p className="text-gray-400 text-xs font-sans leading-relaxed font-light">
                Redefining premium men's clothing through tactile organic European flax fibers, raw shuttle loom indigo raw denims, and bespoke digital engineering.
              </p>
              <div className="flex items-center gap-3">
                <a
                  id="footer-wa-icon"
                  href="https://wa.me/917208572688"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-white/5 rounded-none hover:bg-green-600 hover:text-white transition-colors"
                  title="Chat with Stylist Desk"
                >
                  <Phone className="h-4.5 w-4.5" />
                </a>
                <a
                  id="footer-ig-icon"
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-white/5 rounded-none hover:bg-[#F27D26] hover:text-white transition-colors"
                >
                  <Instagram className="h-4.5 w-4.5" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links Directory */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black tracking-[0.2em] text-[#F27D26] uppercase font-mono">
                Quick Links
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-450 text-left">
                <a href="/shirts" onClick={(e) => { e.preventDefault(); navigate("/shirts"); }} className="text-left hover:text-white cursor-pointer py-1">Linen Shirts</a>
                <a href="/jeans" onClick={(e) => { e.preventDefault(); navigate("/jeans"); }} className="text-left hover:text-white cursor-pointer py-1">Selvedge Jeans</a>
                <a href="/pants" onClick={(e) => { e.preventDefault(); navigate("/pants"); }} className="text-left hover:text-white cursor-pointer py-1">Sartorial Trousers</a>
                <a href="/new-arrivals" onClick={(e) => { e.preventDefault(); navigate("/new-arrivals"); }} className="text-left hover:text-white cursor-pointer py-1">New Arrivals</a>
                <a href="/trending" onClick={(e) => { e.preventDefault(); navigate("/trending"); }} className="text-left hover:text-white cursor-pointer py-1">Trending Outfits</a>
                <a href="/collections" onClick={(e) => { e.preventDefault(); navigate("/collections"); }} className="text-left hover:text-white cursor-pointer py-1">Entire Catalog</a>
              </div>
            </div>

            {/* Column 3: Corporate Policy */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black tracking-[0.2em] text-[#F27D26] uppercase font-mono">
                Customer Care
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-gray-450">
                <li><a href="/about" onClick={(e) => { e.preventDefault(); navigate("/about"); }} className="hover:text-white cursor-pointer text-left block">About Us</a></li>
                <li><a href="/shipping-policy" onClick={(e) => { e.preventDefault(); navigate("/shipping-policy"); }} className="hover:text-white cursor-pointer text-left block">Shipping & Delivery</a></li>
                <li><a href="/track-order" onClick={(e) => { e.preventDefault(); navigate("/track-order"); }} className="hover:text-white cursor-pointer text-left block">Track Order</a></li>
                <li><a href="/return-policy" onClick={(e) => { e.preventDefault(); navigate("/return-policy"); }} className="hover:text-white cursor-pointer text-left block">Returns & Exchanges</a></li>
                <li><a href="/privacy-policy" onClick={(e) => { e.preventDefault(); navigate("/privacy-policy"); }} className="hover:text-white cursor-pointer text-left text-xs block">Privacy Policy</a></li>
                <li><a href="/terms-and-conditions" onClick={(e) => { e.preventDefault(); navigate("/terms-and-conditions"); }} className="hover:text-white cursor-pointer text-left text-xs font-semibold block">Terms & Conditions</a></li>
                <li><a href="/contact" onClick={(e) => { e.preventDefault(); navigate("/contact"); }} className="hover:text-white cursor-pointer text-left font-bold text-orange-400 block">Contact Support</a></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black tracking-[0.2em] text-[#F27D26] uppercase font-mono">
                Newsletter
              </h4>
              <p className="text-gray-400 text-xs font-light leading-relaxed">
                Subscribe to receive seasonal releases, styling manuals, and exclusive offers.
              </p>
              
              {!newsletterSubbed ? (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                  <input
                    id="newsletter-email-field"
                    type="email"
                    placeholder="your.email@example.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="bg-white/5 border border-white/10 px-4 py-3 text-xs focus:ring-1 focus:ring-orange-600 focus:outline-none text-white font-sans w-full"
                    required
                  />
                  <button
                    id="newsletter-submit-btn"
                    type="submit"
                    className="bg-white hover:bg-[#F27D26] hover:text-white text-gray-950 font-sans text-xs font-black uppercase tracking-widest py-3 transition-colors cursor-pointer text-center w-full"
                  >
                    Subscribe
                  </button>
                </form>
              ) : (
                <div className="bg-green-500/10 border border-green-500/25 p-3 rounded-none text-green-400 text-xs font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle className="h-4.5 w-4.5 stroke-[3.5]" /> SUBSCRIBED TO NEWSLETTER
                </div>
              )}

              {newsletterErr && (
                <p className="text-[11px] text-red-400 font-medium font-mono leading-none mt-1">{newsletterErr}</p>
              )}
            </div>

          </div>

          {/* BOTTOM METRIC */}
          <div className="max-w-7xl mx-auto border-t border-white/5 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>© 2026 CLINZA Premium Ltd. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="hover:text-white cursor-pointer">Sitemap.xml</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Security Cert</span>
              <span>•</span>
              <span onClick={() => navigate("/admin")} className="font-bold text-orange-400 hover:underline cursor-pointer">Staff access</span>
            </div>
          </div>
        </footer>
      )}

      {/* QUICK VIEW SCREEN OVERLAY MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 text-left animate-fade-in select-none">
          <div className="bg-white rounded-none max-w-2xl w-full border border-black overflow-hidden shadow-2xl relative grid grid-cols-1 md:grid-cols-2 animate-scale-up">
            
            {/* CLOSE */}
            <button
              id="close-quickview-btn"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-0 right-0 p-3 hover:bg-black hover:text-white border-b border-l border-gray-100 text-gray-400 z-10 cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Photo column */}
            <div
              onClick={() => {
                navigate(`/product/${quickViewProduct.slug || quickViewProduct.id}`);
                setQuickViewProduct(null);
              }}
              className="cursor-pointer aspect-[3/4] bg-gray-50 group/qvimg relative overflow-hidden"
              title="Click to view full specifications"
            >
              <img
                src={(quickViewProduct.images && quickViewProduct.images[0]) || null}
                alt={quickViewProduct.name}
                className="h-full w-full object-cover group-hover/qvimg:scale-105 transition-transform duration-500"
              />
            </div>

            {/* details column */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#F27D26] uppercase font-mono block mb-1">
                  {quickViewProduct.category}
                </span>
                <h3 className="text-gray-950 text-base sm:text-lg font-bold uppercase leading-tight font-serif mb-1">
                  {quickViewProduct.name}
                </h3>
                
                {/* Score */}
                <div className="flex items-center gap-1 text-xs text-yellow-500 mb-4 font-bold">
                  <span>★ {quickViewProduct.rating} / 5</span>
                </div>

                <p className="text-gray-550 text-xs font-light leading-relaxed mb-6 line-clamp-3 font-serif">
                  {quickViewProduct.description}
                </p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-base font-bold text-gray-950 font-serif font-sans">₹{quickViewProduct.price.toLocaleString("en-IN")}</span>
                  {quickViewProduct.originalPrice > quickViewProduct.price && (
                    <span className="text-xs text-gray-400 line-through font-normal font-sans">₹{quickViewProduct.originalPrice.toLocaleString("en-IN")}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  id="qv-details-btn"
                  onClick={() => {
                    navigate(`/product/${quickViewProduct.slug || quickViewProduct.id}`);
                    setQuickViewProduct(null);
                  }}
                  className="w-full bg-black hover:bg-[#F27D26] text-white font-sans text-[10px] font-black uppercase tracking-widest py-3.5 rounded-none transition-all cursor-pointer text-center block"
                >
                  View full specifications
                </button>
                <button
                  id="qv-add-cart-btn"
                  onClick={() => {
                    addToCart(quickViewProduct, quickViewProduct.colors[0]?.name || "Default", quickViewProduct.sizes[0] || "M");
                    setQuickViewProduct(null);
                  }}
                  className="w-full bg-white hover:bg-gray-50 border border-black text-black font-sans text-[10px] font-black uppercase tracking-widest py-3.5 rounded-none transition-all cursor-pointer text-center block"
                >
                  Add Bag
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Official floating WhatsApp feedback mechanism */}
      <WhatsAppButton currentProduct={activeProduct} />

    </div>
  );
}

// Subordinate page components cleanly utilizing route structures and parameters
interface SubcomponentProps {
  colSlug: string;
  wishlist: string[];
  toggleWishlist: (p: Product) => void;
  addToCart: (p: Product, col: string, size: string) => void;
  setQuickViewProduct: (p: Product) => void;
  handleOldRouteTrigger: (val: string) => void;
}

function CategoryPage({ 
  colSlug, 
  wishlist, 
  toggleWishlist, 
  addToCart, 
  setQuickViewProduct, 
  handleOldRouteTrigger 
}: SubcomponentProps) {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = React.useState<Product[]>(() => getProducts());
  const [dbCollections, setDbCollections] = React.useState<CollectionItem[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [cols, prods] = await Promise.all([
          CollectionsService.getAll(),
          ProductsService.getAll()
        ]);
        if (isMounted) {
          if (cols && cols.length > 0) setDbCollections(cols);
          if (prods && prods.length > 0) setAllProducts(prods);
        }
      } catch (e) {
        console.error("CategoryPage data fetch error:", e);
      }
    }
    fetchData();

    const handleUpdate = () => {
      fetchData();
    };
    window.addEventListener("clinza_collections_updated", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("clinza_collections_updated", handleUpdate);
    };
  }, []);

  const normalized = (colSlug || "").toLowerCase().trim();
  const activeCol = dbCollections.find(c => c.slug.toLowerCase() === normalized || c.id.toLowerCase() === normalized)
    || getCollections().find(c => c.slug.toLowerCase() === normalized || c.id.toLowerCase() === normalized);

  const filtered = allProducts.filter(p => isProductInCollection(p, colSlug, activeCol));

  const colBannerImage = (activeCol?.banner || activeCol?.thumbnail || activeCol?.image || "").trim() || null;
  const colDescription = activeCol?.description || activeCol?.shortDescription || "Showing total of " + filtered.length + " curated luxury items. Complimentary Cash On Delivery available across India.";

  const capitalizedColTitle = colSlug === "all"
    ? "Clinza Wardrobe Catalog"
    : activeCol ? activeCol.name : (colSlug || "Collection").toUpperCase();

  React.useEffect(() => {
    trackCollectionView(colSlug, capitalizedColTitle, filtered.length);
  }, [colSlug, capitalizedColTitle, filtered.length]);

  return (
    <section id="collection-grid-viewport" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen text-left animate-fade-in font-sans">
      <div className="max-w-7xl mx-auto">
        {colBannerImage ? (
          <div className="w-full overflow-hidden rounded-2xl border border-gray-200 mb-8 bg-stone-100">
            <img 
              src={colBannerImage} 
              alt={capitalizedColTitle} 
              className="w-full h-auto max-h-[420px] object-cover block"
            />
            {/* Visually hidden for SEO */}
            <div className="sr-only">
              <h1>{capitalizedColTitle}</h1>
              <p>{colDescription}</p>
            </div>
          </div>
        ) : (
          <div className="mb-8 text-left border-b border-zinc-200 pb-4">
            <h1 className="text-2xl sm:text-3.5xl font-sans font-black tracking-tight text-gray-950 uppercase mb-2">
              {capitalizedColTitle}
            </h1>
            <p className="text-zinc-550 text-xs sm:text-sm">
              {colDescription}
            </p>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onProductClick={(p) => navigate(`/product/${p.slug || p.id}`)}
                onAddToWishlist={toggleWishlist}
                onAddToCart={addToCart}
                wishlistIds={wishlist}
                onOpenQuickView={setQuickViewProduct}
                setRoute={handleOldRouteTrigger}
                idPrefix="category-grid"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-gray-150 rounded-2xl">
            <p className="text-gray-500 font-serif text-sm">No items matching criteria. Explore other loomed coordinates.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function DynamicCategoryPage({
  wishlist,
  toggleWishlist,
  addToCart,
  setQuickViewProduct,
  handleOldRouteTrigger
}: Omit<SubcomponentProps, "colSlug">) {
  const { slug } = useParams();
  if (!slug || slug === "all") {
    return (
      <CollectionsPage
        setRoute={handleOldRouteTrigger}
        onAddToCart={addToCart}
        onAddToWishlist={toggleWishlist}
        wishlistIds={wishlist}
        onOpenQuickView={setQuickViewProduct}
      />
    );
  }
  return (
    <CollectionDetailPage
      slug={slug}
      setRoute={handleOldRouteTrigger}
      onAddToCart={addToCart}
      onAddToWishlist={toggleWishlist}
      wishlistIds={wishlist}
      onOpenQuickView={setQuickViewProduct}
    />
  );
}

function CuratedPage({ 
  type, 
  wishlist, 
  toggleWishlist, 
  addToCart, 
  setQuickViewProduct, 
  handleOldRouteTrigger 
}: { 
  type: "new-arrivals" | "trending" 
} & Omit<SubcomponentProps, "colSlug">) {
  const navigate = useNavigate();
  const [items, setItems] = useState<Product[]>(() => getProducts().filter(p => type === "new-arrivals" ? p.isNewArrival : p.isTrending));

  useEffect(() => {
    ProductsService.getAll().then(all => {
      if (all && all.length > 0) {
        setItems(all.filter(p => type === "new-arrivals" ? p.isNewArrival : p.isTrending));
      }
    });
  }, [type]);

  const filtered = items;

  React.useEffect(() => {
    trackCollectionView(type, type === "new-arrivals" ? "The New Arrivals" : "The Trending Curation", filtered.length);
  }, [type, filtered.length]);

  return (
    <section id="custom-curation-viewport" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen text-left animate-fade-in font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight text-gray-950 uppercase mb-3">
          {type === "new-arrivals" ? "The New Arrivals" : "The Trending Curation"}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filtered.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onProductClick={(p) => navigate(`/product/${p.slug || p.id}`)}
              onAddToWishlist={toggleWishlist}
              onAddToCart={addToCart}
              wishlistIds={wishlist}
              onOpenQuickView={setQuickViewProduct}
              setRoute={handleOldRouteTrigger}
              idPrefix="curated-grid"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductDetailPage({ 
  wishlist, 
  toggleWishlist, 
  addToCart, 
  handleOldRouteTrigger 
}: Omit<SubcomponentProps, "colSlug" | "setQuickViewProduct">) {
  const navigate = useNavigate();
  const { slug } = useParams();

  // STEP 2: Immediately after useParams()
  console.log("route slug:", slug);

  const normSlug = (slug || "").toLowerCase().trim();

  const [allProducts, setAllProducts] = React.useState<Product[]>(() => getProducts());
  
  // STEP 3: Before const matched = ...
  console.log("[STEP 3] Before matching:", {
    currentSlug: normSlug,
    currentLoadingState: undefined,
    currentAllProductsLength: allProducts.length,
    first10ProductSlugs: allProducts.slice(0, 10).map(p => p.slug || p.id)
  });

  // Find matched product from current products state
  const matched = allProducts.find(p => 
    (p.slug && p.slug.toLowerCase() === normSlug) || 
    (p.id && p.id.toLowerCase() === normSlug) ||
    (p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") === normSlug)
  );

  // STEP 4: Immediately after const matched = ...
  if (matched) {
    console.log("[STEP 4] Matched product:", {
      matchedProductExists: true,
      matchedId: matched.id,
      matchedSlug: matched.slug,
      matchedName: matched.name
    });
  } else {
    console.log("No matching product");
  }

  // Only start in loading state if the product is not found in initial local products
  const [loading, setLoading] = React.useState<boolean>(() => !matched);

  // STEP 12: Immediately after render
  console.log("[STEP 12] ProductDetailPage render cycle:", {
    matchedProduct: matched ? { id: matched.id, slug: matched.slug, name: matched.name } : null,
    loading: loading
  });

  React.useEffect(() => {
    let isMounted = true;

    // STEP 5: Inside useEffect()
    const seqStart = performance.now();
    console.log(`[PERF][ProductDetailPage] Product load sequence initiated for slug: "${slug}"`);
    console.log("[STEP 5] useEffect started:", {
      currentSlug: slug,
      currentLoading: loading
    });

    // If switching slugs and new slug isn't in local state, show loader
    const exists = allProducts.some(p => 
      (p.slug && p.slug.toLowerCase() === normSlug) || 
      (p.id && p.id.toLowerCase() === normSlug) ||
      (p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") === normSlug)
    );
    if (!exists) {
      setLoading(true);
    }

    async function syncCloud() {
      try {
        // STEP 6: Before ProductsService.getAll()
        console.log(`[PERF][ProductDetailPage] Fetching cloud products for "${slug}"...`);
        const fetchStart = performance.now();

        const cloudProds = await ProductsService.getAll();
        const fetchDuration = (performance.now() - fetchStart).toFixed(2);
        const totalDuration = (performance.now() - seqStart).toFixed(2);
        console.log(`[PERF][ProductDetailPage] Cloud products fetched in ${fetchDuration}ms (Total load sequence: ${totalDuration}ms, count: ${cloudProds ? cloudProds.length : 0})`);

        // STEP 10: After getAll()
        console.log("cloudProds.length:", cloudProds ? cloudProds.length : 0);

        if (isMounted && cloudProds && cloudProds.length > 0) {
          // STEP 11: Immediately before setAllProducts(cloudProds)
          console.log("[STEP 11] Before setAllProducts:", {
            previousProductsLength: allProducts.length,
            incomingProductsLength: cloudProds.length
          });

          setAllProducts(cloudProds);
        }
      } catch (e) {
        console.error("[syncCloud] ERROR:", e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    syncCloud();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // STEP 14: Before EVERY return statement
  if (loading && !matched) {
    console.log("Returning Loading Screen");
    return (
      <div className="py-12 text-center text-gray-500 font-sans">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-zinc-900 border-t-transparent mb-4"></div>
        <p className="text-xs uppercase tracking-widest font-mono">Loading Product Details...</p>
      </div>
    );
  }

  if (!matched) {
    console.log("Returning NotFound");
    return (
      <NotFoundPage navigate={navigate} handleOldRouteTrigger={handleOldRouteTrigger} />
    );
  }

  console.log("Returning Product Page");
  return (
    <ProductDetail
      product={matched}
      onBackToCollection={() => navigate("/collections")}
      onAddToCart={addToCart}
      onAddToWishlist={toggleWishlist}
      wishlistIds={wishlist}
      setRoute={handleOldRouteTrigger}
    />
  );
}

function WishlistPage({ 
  wishlist, 
  toggleWishlist, 
  addToCart, 
  setQuickViewProduct, 
  handleOldRouteTrigger 
}: Omit<SubcomponentProps, "colSlug">) {
  const navigate = useNavigate();
  const allProducts = getProducts();
  const wishlistItems = allProducts.filter(p => wishlist.includes(p.id));

  return (
    <section id="wishlist-grid-viewport" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen text-left animate-fade-in font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight text-gray-950 uppercase mb-6">
          Your Stylist Wishlist ({wishlistItems.length} items)
        </h1>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {wishlistItems.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onProductClick={(p) => navigate(`/product/${p.slug || p.id}`)}
                onAddToWishlist={toggleWishlist}
                onAddToCart={addToCart}
                wishlistIds={wishlist}
                onOpenQuickView={setQuickViewProduct}
                setRoute={handleOldRouteTrigger}
                idPrefix="wishlist-grid"
              />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-16 bg-white border border-gray-150 rounded-2xl p-6">
            <Heart className="h-10 w-10 text-zinc-300 mx-auto mb-4" />
            <p className="text-gray-950 text-sm font-bold uppercase tracking-wider mb-2">No items saved yet</p>
            <p className="text-gray-500 text-xs mb-6 font-light">Explore Clinza collections and use the heart badges to bookmark your absolute favorites.</p>
            <button
              id="wishlist-browse"
              onClick={() => navigate("/collections")}
              className="w-full bg-gray-950 hover:bg-[#F27D26] text-white font-sans text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
            >
              Explore Full Catalog
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
