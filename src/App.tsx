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
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import AIAnalyzer from "./components/AIAnalyzer";
import CollectionList from "./components/CollectionList";
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
import SchemaMarkup from "./components/SchemaMarkup";

// New high-fidelity Shopify-style views
import AboutPage from "./components/AboutPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AccountPage from "./components/AccountPage";
import ShopAllCollectionsPage from "./components/ShopAllCollectionsPage";

import { Product, CartItem, Order } from "./types";
import {
  getProducts,
  getCart,
  saveCart,
  getWishlist,
  saveWishlist,
  subscribeNewsletter,
  initializeDatabase,
  getOrders,
  getBlogs,
  getHomeConfig,
  getThemeConfig,
  saveThemeConfig,
  saveHomeConfig
} from "./utils";

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

  // Core global state matching prior specifications
  const [theme, setTheme] = useState(() => getThemeConfig(false));
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

  const aiSectionRef = useRef<HTMLDivElement>(null);

  // Auto-initialize local storage databases
  useEffect(() => {
    initializeDatabase();
    setCartState(getCart());
    setWishlistState(getWishlist());
    setTheme(getThemeConfig(false));

    // Try and recover any active logged-in customer profile session from localStorage
    try {
      const stored = localStorage.getItem("clinza_customer_session");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Update theme configurations periodically and track page views
  useEffect(() => {
    setTheme(getThemeConfig(false));
    trackPageView(location.pathname);
    trackMetaPageView();
  }, [location.pathname]);

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
    
    alert(`Success! Packed ${quantity} × ${product.name} (${color}, size ${size}) in your shopping bag.`);
  };

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

  const scrollToAISection = () => {
    navigate("/");
    setTimeout(() => {
      aiSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  // Adapter function mapping old string-based route triggers to standard React Router navigate updates
  const handleOldRouteTrigger = (val: string) => {
    setSearchOpen(false);
    setActiveBlogSlug(null);

    if (val === "home") {
      navigate("/");
    } else if (val === "new-arrivals") {
      navigate("/new-arrivals");
    } else if (val === "trending") {
      navigate("/trending");
    } else if (val === "cart") {
      navigate("/cart");
    } else if (val === "checkout") {
      navigate("/checkout");
    } else if (val === "wishlist") {
      navigate("/wishlist");
    } else if (val === "track-order") {
      navigate("/track-order");
    } else if (val === "shop-all-collections") {
      navigate("/shop-all-collections");
    } else if (val === "contact") {
      navigate("/contact");
    } else if (val === "about") {
      navigate("/about");
    } else if (val === "login") {
      navigate("/login");
    } else if (val === "register") {
      navigate("/register");
    } else if (val === "account") {
      navigate("/account");
    } else if (val === "admin") {
      navigate("/admin");
    } else if (val === "admin/login") {
      navigate("/admin/login");
    } else if (val === "blog") {
      navigate("/blog");
    } else if (val.startsWith("collections/")) {
      const slug = val.replace("collections/", "");
      if (slug === "all") {
        navigate("/collections");
      } else {
        navigate("/" + slug);
      }
    } else if (val.startsWith("product/")) {
      const slug = val.replace("product/", "");
      navigate(`/product/${slug}`);
    } else if (val.startsWith("policy/")) {
      const policySlug = val.replace("policy/", "");
      navigate(`/${policySlug}`);
    } else {
      navigate("/" + val);
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
    <div id="clinza-e-commerce-root" className="min-h-screen flex flex-col bg-white">
      <SchemaMarkup activeProduct={activeProduct} activeBlogSlug={activeBlogSlug} />
      
      {/* ANNOUNCEMENT BAR & CUSTOM CUSTOMER NAVIGATION (HIDDEN ON ADMIN VIEWS) */}
      {!isAdminRoute && (
        <>
          {/* Announcement promotion ribbon */}
          <div className="bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-2 px-4 text-center border-b border-white/5 font-mono select-none">
            ⚡ COMPLIMENTARY CASH ON DELIVERY (COD) + FREE EXPEDITED CARGO ALL INDIA ⚡
          </div>

          <Navbar
            currentRoute={getCurrentActiveRouteString()}
            setRoute={handleOldRouteTrigger}
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            wishlistCount={wishlist.length}
            onSearch={(query) => {
              setSearchQuery(query);
              handleOldRouteTrigger("collections/all");
            }}
            setSearchOpen={setSearchOpen}
            searchOpen={searchOpen}
          />
        </>
      )}

      {/* DYNAMIC PAGE ROUTE MOUNT */}
      <main className={`flex-1 ${!isAdminRoute ? "mt-[65px]" : ""}`}>
        
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
            {/* 1. HOME VIEW */}
            <Route path="/" element={
              <div id="home-route-viewport" className="animate-fade-in">
                <HeroSlider 
                  setRoute={handleOldRouteTrigger} 
                  scrollToAI={scrollToAISection} 
                />

                {/* Collections (Fade Up) */}
                <motion.div
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <CollectionList setRoute={handleOldRouteTrigger} />
                </motion.div>

                {/* Trending section (Fade Up) */}
                <motion.div
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <section id="trending-products-section" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-white text-left border-y border-gray-100">
                    <div className="max-w-7xl mx-auto">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8">
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-[#F27D26] uppercase font-mono block mb-1.5">
                            Highly Coveted Silhouettes
                          </span>
                          <h2 className="text-2xl sm:text-4xl font-sans font-black tracking-tight text-gray-950 uppercase">
                            Trending Curation
                          </h2>
                        </div>
                        <button
                          id="trending-see-all-btn"
                          onClick={() => handleOldRouteTrigger("collections/all")}
                          className="mt-3 sm:mt-0 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#F27D26] hover:text-black transition-colors"
                        >
                          Explore Catalog <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {getProducts().filter(p => p.isTrending).slice(0, 4).map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            onProductClick={(p) => navigate(`/product/${p.slug}`)}
                            onAddToWishlist={toggleWishlist}
                            onAddToCart={addToCart}
                            wishlistIds={wishlist}
                            onOpenQuickView={setQuickViewProduct}
                            setRoute={handleOldRouteTrigger}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                </motion.div>

                {/* New Arrivals (Fade Up) */}
                <motion.div
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <section id="new-arrivals-products-section" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50 text-left border-b border-gray-200">
                    <div className="max-w-7xl mx-auto">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8">
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-[#F27D26] uppercase font-mono block mb-1.5">
                            Just Released Summer Articles
                          </span>
                          <h2 className="text-2xl sm:text-4xl font-sans font-black tracking-tight text-gray-950 uppercase">
                            New Arrivals
                          </h2>
                        </div>
                        <button
                          id="new-arrivals-all-btn"
                          onClick={() => handleOldRouteTrigger("collections/all")}
                          className="mt-3 sm:mt-0 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#F27D26] hover:text-black transition-colors"
                        >
                          Explore All Releases <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {getProducts().slice(0, 4).map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            onProductClick={(p) => navigate(`/product/${p.slug}`)}
                            onAddToWishlist={toggleWishlist}
                            onAddToCart={addToCart}
                            wishlistIds={wishlist}
                            onOpenQuickView={setQuickViewProduct}
                            setRoute={handleOldRouteTrigger}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                </motion.div>

                {/* Features (Why Clinza - Fade In) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <FeaturesSection />
                </motion.div>

                {/* Editorial / Blogs (Fade Up) */}
                <motion.div
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <section id="recent-blogs-highlight" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white text-left">
                    <div className="max-w-7xl mx-auto">
                      {(() => {
                        const cfg = getHomeConfig();
                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            <div className="lg:col-span-5 space-y-5">
                              <span className="text-[10px] font-black tracking-wider text-orange-400 font-mono uppercase bg-orange-600/10 px-3.5 py-1 rounded-full">
                                {cfg.editorialSubtitle || "Clinza Publication Room"}
                              </span>
                              <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white uppercase leading-none">
                                {cfg.editorialTitle || "Unpacking Textile Architecture"}
                              </h2>
                              <p className="text-gray-400 text-xs sm:text-sm font-sans leading-relaxed">
                                {cfg.editorialDesc || "Read deep reports regarding sustainable European flax agriculture, Mumbai denim loom methods, and precise luxury styling rules formulated directly by our staff."}
                              </p>
                              <button
                                id="home-blog-btn"
                                onClick={() => handleOldRouteTrigger("blog")}
                                className="group bg-white text-gray-950 hover:bg-[#F27D26] hover:text-white font-sans text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                See Editorial Publications
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                            <div className="lg:col-span-7 rounded-2xl overflow-hidden aspect-[16/9] border border-white/10 shadow-xl bg-zinc-900">
                              <img
                                src={cfg.editorialImg || "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800"}
                                alt="Japan indigo shuttles cover image"
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
                </motion.div>

                <div ref={aiSectionRef}>
                  <AIAnalyzer
                    setRoute={handleOldRouteTrigger}
                    onProductClick={(p) => navigate(`/product/${p.slug}`)}
                    onAddToWishlist={toggleWishlist}
                    onAddToCart={addToCart}
                    wishlistIds={wishlist}
                  />
                </div>
              </div>
            } />

            {/* 2. DIRECT CLOTHING CATEGORIES */}
            <Route path="/shirts" element={<CategoryPage colSlug="shirts" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/jeans" element={<CategoryPage colSlug="jeans" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/pants" element={<CategoryPage colSlug="pants" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/new-arrivals" element={<CuratedPage type="new-arrivals" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/trending" element={<CuratedPage type="trending" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/collections" element={<CategoryPage colSlug="all" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/shop" element={<CategoryPage colSlug="all" wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/collection/:slug" element={<DynamicCategoryPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />
            <Route path="/collections/:slug" element={<DynamicCategoryPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setQuickViewProduct={setQuickViewProduct} handleOldRouteTrigger={handleOldRouteTrigger} />} />

            {/* 3. PRODUCT SPEC DETAIL */}
            <Route path="/product/:slug" element={<ProductDetailPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} handleOldRouteTrigger={handleOldRouteTrigger} />} />

            {/* 4. CART & CHECKOUT SYSTEMS */}
            <Route path="/cart" element={
              <CartPage
                cart={cart}
                onUpdateQty={updateCartQty}
                onRemoveItem={removeCartItem}
                setRoute={handleOldRouteTrigger}
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
            <Route path="/admin/login" element={<AdminPanel />} />
            <Route path="/admin/products" element={<AdminPanel />} />
            <Route path="/admin/orders" element={<AdminPanel />} />
            <Route path="/admin/blog" element={<AdminPanel />} />
            <Route path="/admin/theme-editor" element={<AdminPanel />} />
            <Route path="/admin/collections" element={<AdminPanel />} />

            {/* Fallback routing catalog */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}

      </main>

      {/* FOOTER (HIDDEN ON ADMIN PANEL) */}
      {!isAdminRoute && (
        <footer id="clinza-corporate-footer" className="bg-zinc-950 text-white border-t border-white/5 py-16 px-4 sm:px-6 lg:px-8 text-left select-none">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
            
            {/* Column 1: Editorial */}
            <div className="space-y-4">
              <h3 className="font-sans font-black tracking-tighter text-xl text-white uppercase flex items-center">
                CLINZA<span className="h-1.5 w-1.5 rounded-full bg-[#F27D26] ml-1 self-end mb-1"></span>
              </h3>
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
                The Wardrobe Directory
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-450 text-left">
                <button onClick={() => navigate("/shirts")} className="text-left hover:text-white cursor-pointer py-1">Linen Shirts</button>
                <button onClick={() => navigate("/jeans")} className="text-left hover:text-white cursor-pointer py-1">Selvedge Jeans</button>
                <button onClick={() => navigate("/pants")} className="text-left hover:text-white cursor-pointer py-1">Sartorial Trousers</button>
                <button onClick={() => navigate("/new-arrivals")} className="text-left hover:text-white cursor-pointer py-1">New Arrivals</button>
                <button onClick={() => navigate("/trending")} className="text-left hover:text-white cursor-pointer py-1">Trending Outfits</button>
                <button onClick={() => navigate("/collections")} className="text-left hover:text-white cursor-pointer py-1">Entire Catalog</button>
              </div>
            </div>

            {/* Column 3: Corporate Policy */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black tracking-[0.2em] text-[#F27D26] uppercase font-mono">
                Corporate Ethics
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-gray-450">
                <li><button onClick={() => navigate("/about")} className="hover:text-white cursor-pointer text-left">The Clinza Atelier Sourcing</button></li>
                <li><button onClick={() => navigate("/shipping-policy")} className="hover:text-white cursor-pointer text-left">Logistic & Sea Cargo Options</button></li>
                <li><button onClick={() => navigate("/return-policy")} className="hover:text-white cursor-pointer text-left">Exchange Ledger (7 Days)</button></li>
                <li><button onClick={() => navigate("/privacy-policy")} className="hover:text-white cursor-pointer text-left text-xs">Privacy Protocols</button></li>
                <li><button onClick={() => navigate("/terms-and-conditions")} className="hover:text-white cursor-pointer text-left text-xs font-semibold">Terms & Conditions</button></li>
                <li><button onClick={() => navigate("/contact")} className="hover:text-white cursor-pointer text-left font-bold text-orange-400">Contact Showroom Desk</button></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black tracking-[0.2em] text-[#F27D26] uppercase font-mono">
                Atelier Publications
              </h4>
              <p className="text-gray-400 text-xs font-light leading-relaxed">
                Subscribe to receive seasonal textile releases, styling manuals, and exclusive pre-booking codes.
              </p>
              
              {!newsletterSubbed ? (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                  <input
                    id="newsletter-email-field"
                    type="email"
                    placeholder="sartorialist@gmail.com"
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
                  <CheckCircle className="h-4.5 w-4.5 stroke-[3.5]" /> SUBSCRIBED TO THE CIRCLE
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
                navigate(`/product/${quickViewProduct.slug}`);
                setQuickViewProduct(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="cursor-pointer aspect-[3/4] bg-gray-50 group/qvimg relative overflow-hidden"
              title="Click to view full specifications"
            >
              <img
                src={quickViewProduct.images[0]}
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
                    navigate(`/product/${quickViewProduct.slug}`);
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
  const allProducts = getProducts();
  
  const filtered = colSlug === "all"
    ? allProducts
    : allProducts.filter(p =>
        p.collection.toLowerCase() === colSlug.toLowerCase() ||
        p.category.toLowerCase().includes(colSlug.toLowerCase())
      );

  React.useEffect(() => {
    trackCollectionView(colSlug, colSlug === "all" ? "Clinza Wardrobe Catalog" : `${colSlug.toUpperCase()} Collections`, filtered.length);
  }, [colSlug, filtered.length]);

  const capitalizedColTitle = colSlug === "all"
    ? "Clinza Wardrobe Catalog"
    : `${colSlug.toUpperCase()} Collections`;

  return (
    <section id="collection-grid-viewport" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen text-left animate-fade-in font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3.5xl font-sans font-black tracking-tight text-gray-950 uppercase mb-2">
          {capitalizedColTitle}
        </h1>
        <p className="text-zinc-550 text-xs sm:text-sm mb-6">
          Showing total of {filtered.length} curated luxury items. Complimentary Cash On Delivery available across India.
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onProductClick={(p) => navigate(`/product/${p.slug}`)}
                onAddToWishlist={toggleWishlist}
                onAddToCart={addToCart}
                wishlistIds={wishlist}
                onOpenQuickView={setQuickViewProduct}
                setRoute={handleOldRouteTrigger}
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
  return (
    <CategoryPage
      colSlug={slug || "all"}
      wishlist={wishlist}
      toggleWishlist={toggleWishlist}
      addToCart={addToCart}
      setQuickViewProduct={setQuickViewProduct}
      handleOldRouteTrigger={handleOldRouteTrigger}
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
  const filtered = getProducts().filter(p => type === "new-arrivals" ? p.isNewArrival : p.isTrending);

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
              onProductClick={(p) => navigate(`/product/${p.slug}`)}
              onAddToWishlist={toggleWishlist}
              onAddToCart={addToCart}
              wishlistIds={wishlist}
              onOpenQuickView={setQuickViewProduct}
              setRoute={handleOldRouteTrigger}
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
  const matched = getProducts().find(p => p.slug === slug);

  if (!matched) {
    return (
      <div className="py-32 text-center text-gray-500 font-sans">
        <p>The premium silhouette is being calibrated. Please browse our active collections.</p>
        <button onClick={() => navigate("/collections")} className="mt-4 bg-zinc-950 text-white px-5 py-2.5 rounded-xl uppercase tracking-wider text-xs font-bold cursor-pointer">
          Browse Catalog
        </button>
      </div>
    );
  }

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
                onProductClick={(p) => navigate(`/product/${p.slug}`)}
                onAddToWishlist={toggleWishlist}
                onAddToCart={addToCart}
                wishlistIds={wishlist}
                onOpenQuickView={setQuickViewProduct}
                setRoute={handleOldRouteTrigger}
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
