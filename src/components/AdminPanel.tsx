/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Package, 
  Smartphone, 
  TrendingUp, 
  DollarSign, 
  ListOrdered, 
  FileText, 
  Star, 
  Plus, 
  X, 
  RefreshCw, 
  ChevronRight,
  ShieldCheck,
  FolderOpen,
  Grid,
  Heart,
  Users,
  Tag,
  FolderLock,
  Wrench,
  Sparkles,
  Palette,
  MessageSquare,
  Mail
} from "lucide-react";

import { Product, BlogPost, Order, HomepageConfig } from "../types";
import {
  getProducts,
  saveProduct,
  deleteProduct,
  getBlogs,
  saveBlogPost,
  deleteBlogPost,
  getOrders,
  updateOrderStatus,
  getReviews,
  forceSyncFromCloud,
  getHomeConfig,
  saveHomeConfig
} from "../utils";
import { auth, signInWithGoogle, signInWithEmail, logOutUser, supabase } from "../supabase";

// Import modular tab panels
import AnalyticsTab from "./admin/AnalyticsTab";
import ProductsTab from "./admin/ProductsTab";
import CategoriesTab from "./admin/CategoriesTab";
import CollectionsTab from "./admin/CollectionsTab";
import OrdersTab from "./admin/OrdersTab";
import CustomersTab from "./admin/CustomersTab";
import BlogsTab from "./admin/BlogsTab";
import ReviewsTab from "./admin/ReviewsTab";
import CouponsTab from "./admin/CouponsTab";
import MediaLibraryTab from "./admin/MediaLibraryTab";
import IntegrationsTab from "./admin/IntegrationsTab";
import ThemeEditorTab from "./admin/ThemeEditorTab";
import ContactLeadsTab from "./admin/ContactLeadsTab";
import NewsletterTab from "./admin/NewsletterTab";

type AdminRole = "Super Admin" | "Admin" | "Content Manager";

export default function AdminPanel() {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Dynamic Workspace Staff Role Selection
  const [staffRole, setStaffRole] = useState<AdminRole>("Super Admin");

  // Tabs layout
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Database lists
  const [productList, setProductList] = useState<Product[]>([]);
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [blogList, setBlogPostList] = useState<BlogPost[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [homeConfig, setHomeConfig] = useState<HomepageConfig>(getHomeConfig());

  // Email login inputs
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Slides CMS inputs
  const [slideEditIdx, setSlideEditIdx] = useState<number | null>(null);

  useEffect(() => {
    // Route matching for active tab
    const pathname = window.location.pathname;
    if (pathname.includes("/admin/products")) {
      setActiveTab("products");
    } else if (pathname.includes("/admin/orders")) {
      setActiveTab("orders");
    } else if (pathname.includes("/admin/blog")) {
      setActiveTab("blogs");
    } else if (pathname.includes("/admin/theme-editor")) {
      setActiveTab("theme-customizer");
    } else if (pathname.includes("/admin/collections")) {
      setActiveTab("collections");
    } else if (pathname.includes("/admin/contact-leads")) {
      setActiveTab("contact-leads");
    } else if (pathname.includes("/admin/newsletters")) {
      setActiveTab("newsletters");
    } else if (pathname.includes("/admin/customers")) {
      setActiveTab("customers");
    }

    // Check current session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      if (user) {
        setGoogleUser({
          email: user.email,
          displayName: user.user_metadata?.name || user.user_metadata?.displayName || "Clinza Admin"
        });
        if (user.email === "sastaelectronic6@gmail.com") {
          setIsAdminAuth(true);
          setAuthError("");
        } else {
          setIsAdminAuth(false);
          setAuthError(`Access Denied: Supabase profile ${user.email} is not listed on Clinza staff ledger.`);
        }
      } else {
        setIsAdminAuth(false);
      }
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      if (user) {
        setGoogleUser({
          email: user.email,
          displayName: user.user_metadata?.name || user.user_metadata?.displayName || "Clinza Admin"
        });
        if (user.email === "sastaelectronic6@gmail.com") {
          setIsAdminAuth(true);
          setAuthError("");
        } else {
          setIsAdminAuth(false);
          setAuthError(`Access Denied: Supabase profile ${user.email} is not listed on Clinza staff ledger.`);
        }
      } else {
        setGoogleUser(null);
        setIsAdminAuth(false);
      }
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAuthError("Staff credentials cannot be left blank.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      const user = await signInWithEmail(adminEmail.trim(), adminPassword.trim());
      if (user) {
        if (user.email === "sastaelectronic6@gmail.com") {
          setIsAdminAuth(true);
          setGoogleUser(user);
        } else {
          setAuthError(`Access Denied: The account "${user.email}" does not have cloud clearances.`);
          setIsAdminAuth(false);
        }
      }
    } catch (err: any) {
      console.warn("Auth redirect fallback:", err);
      // Hardcoded bypass for specific admin email requested
      if (adminEmail.trim() === "sastaelectronic6@gmail.com" && adminPassword.trim() === "clinza2026") {
        setIsAdminAuth(true);
        setGoogleUser({
          email: "sastaelectronic6@gmail.com",
          displayName: "Super Administrator",
          photoURL: null
        });
      } else {
        setAuthError("Incorrect password. Use master credentials for sastaelectronic6@gmail.com.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsAdminAuth(false);
    setAuthError("");
    setGoogleUser(null);
    setAdminEmail("");
    setAdminPassword("");
    await logOutUser();
  };

  const reloadData = () => {
    setProductList(getProducts());
    setOrderList(getOrders());
    setBlogPostList(getBlogs());
    setReviewCount(getReviews().length);
    setHomeConfig(getHomeConfig());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleDBCloudSync = async () => {
    setSyncing(true);
    try {
      await forceSyncFromCloud();
      reloadData();
      alert("Committed sitemaps successfully. Cloud Firestore resources synchronized!");
    } catch (err) {
      alert("Synchronization failed. Check internet coordinates.");
    } finally {
      setSyncing(false);
    }
  };

  // Dedicated Product callbacks
  const handleSaveProduct = (prod: Product) => {
    saveProduct(prod);
    reloadData();
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    reloadData();
  };

  // Dedicated Blog callbacks
  const handleSaveBlog = (blog: BlogPost) => {
    saveBlogPost(blog);
    reloadData();
  };

  const handleDeleteBlog = (slug: string) => {
    deleteBlogPost(slug);
    reloadData();
  };

  // Dedicated Order callbacks
  const handleUpdateOrderStatus = (id: string, status: any) => {
    updateOrderStatus(id, status);
    reloadData();
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white font-sans">
        <div className="space-y-4 text-center">
          <RefreshCw className="h-10 w-10 text-orange-500 animate-spin mx-auto" />
          <p className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">Authenticating Staff Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 text-white font-sans py-24">
        <div id="admin-login-cockpit" className="max-w-md w-full bg-zinc-900/50 border border-zinc-800/80 p-8 rounded-2xl backdrop-blur-xl shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center mx-auto rounded-xl shadow-lg">
            <FolderLock className="h-6 w-6 text-white" />
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white">CLINZA Cockpit Portal</h2>
            <p className="text-[11px] text-zinc-400 font-light max-w-xs mx-auto leading-relaxed mt-1.5">
              Secure administrative controller. Restricted under Google database access policies.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-red-950/40 border border-red-900 rounded-lg text-left text-[11px] text-zinc-200 leading-snug">
              {authError}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
            
            {/* WORKSPACE ROLE SELECTOR */}
            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                Assigned Staff Workspace Role
              </label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as AdminRole)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-bold"
              >
                <option value="Super Admin">Super Admin (Full Catalog Clearance)</option>
                <option value="Admin">Admin (Promotional Coupons & Orders)</option>
                <option value="Content Manager">Content Manager (Editorial Blogs only)</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. sastaelectronic6@gmail.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                Staff Master Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password..."
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-orange-500 text-white font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 transition duration-300 rounded-lg text-white text-xs font-black tracking-widest uppercase cursor-pointer"
            >
              {authLoading ? "Verifying Keys..." : "Verify Clearances"}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-850"></div>
            <span className="flex-shrink mx-4 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-zinc-850"></div>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition"
          >
            <span className="font-mono text-[10px] font-black uppercase tracking-wider">Authorize with Google Account</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <section id="clinza-shopify-admin-cockpit" className="min-h-screen bg-zinc-950 font-sans flex text-left relative text-zinc-300">
      
      {/* 1. DARK SIDEBAR SECTION */}
      <aside className="w-64 border-r border-zinc-900 bg-[#070707] flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-6">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-lg">
              <span className="font-serif text-white font-black">C</span>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-[0.15em] text-white">CLINZA</h2>
              <span className="text-[9px] text-orange-500 font-mono tracking-widest uppercase font-bold">{staffRole}</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 text-xs">
            {[
              { id: "overview", label: "Dashboard overview", icon: TrendingUp },
              { id: "products", label: "Our Products Catalog", icon: Package },
              { id: "categories", label: "Taxonomic Categories", icon: Grid },
              { id: "collections", label: "Curated Collections", icon: FolderOpen },
              { id: "orders", label: "Apparel Orders Board", icon: ListOrdered },
              { id: "customers", label: "Customer CRM", icon: Users },
              { id: "contact-leads", label: "Contact Form Leads", icon: MessageSquare },
              { id: "newsletters", label: "Newsletter Subscribers", icon: Mail },
              { id: "blogs", label: "Editorial Blog CMS", icon: FileText },
              { id: "reviews", label: "Review Testimonials", icon: Star },
              { id: "coupons", label: "Promotions & Coupons", icon: Tag },
              { id: "media-vault", label: "Banners Media Vault", icon: FolderLock },
              { id: "home-cms", label: "Homepage Blocks CMS", icon: Smartphone },
              { id: "theme-customizer", label: "Shopify Theme Editor", icon: Palette },
              { id: "google-seo", label: "Integrations & GA4", icon: Wrench }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSlideEditIdx(null);
                  }}
                  className={`w-full py-2.5 px-3.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer font-sans font-bold text-left ${
                    isSelected 
                      ? "bg-orange-600 text-white font-black shadow-md shadow-orange-600/10" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card bottom */}
        <div className="p-6 border-t border-zinc-900 bg-black/40 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold">
              {googleUser?.displayName?.charAt(0) || "S"}
            </div>
            <div className="truncate text-[11px]">
              <h4 className="font-bold text-white truncate">{googleUser?.displayName || "Super Admin"}</h4>
              <span className="text-[9px] text-zinc-400 font-mono block truncate">{googleUser?.email || "sastaelectronic6@gmail.com"}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 text-[10px] font-mono tracking-wider text-center border border-zinc-800 hover:border-zinc-500 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer font-bold uppercase"
          >
            Terminate Session
          </button>
        </div>
      </aside>

      {/* 2. R.H.S CORE WORKSPACE AREA */}
      <main className="flex-1 min-h-screen bg-zinc-950 overflow-y-auto px-6 py-8 sm:px-10">
        
        {/* Workspace Top Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-5 mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-sans font-black text-white uppercase tracking-tight">Clinza Control Room</h1>
            <p className="text-xs text-zinc-500 font-sans mt-0.5">Shopify inspired apparel catalog engine & automated SEO</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDBCloudSync}
              disabled={syncing}
              className="bg-orange-600/15 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/25 px-5 py-2.5 text-xs uppercase tracking-widest font-mono font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin text-white" : ""}`} />
              {syncing ? "Syncing..." : "Sync Cloud"}
            </button>
          </div>
        </div>

        {/* Tab content routing */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <AnalyticsTab
              productList={productList}
              orderList={orderList}
              blogList={blogList}
              reviewCount={reviewCount}
            />
          )}

          {activeTab === "products" && (
            <ProductsTab
              productList={productList}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === "categories" && <CategoriesTab />}

          {activeTab === "collections" && <CollectionsTab />}

          {activeTab === "orders" && (
            <OrdersTab
              orderList={orderList}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === "customers" && <CustomersTab />}

          {activeTab === "contact-leads" && <ContactLeadsTab />}

          {activeTab === "newsletters" && <NewsletterTab />}

          {activeTab === "blogs" && (
            <BlogsTab
              blogList={blogList}
              onSaveBlog={handleSaveBlog}
              onDeleteBlog={handleDeleteBlog}
            />
          )}

          {activeTab === "reviews" && <ReviewsTab />}

          {activeTab === "coupons" && <CouponsTab />}

          {activeTab === "media-vault" && <MediaLibraryTab />}

          {activeTab === "google-seo" && <IntegrationsTab />}

          {activeTab === "theme-customizer" && (
            <ThemeEditorTab
              productList={productList}
              blogList={blogList}
              orderList={orderList}
            />
          )}

          {/* HOMEPAGE SLIDERS & BLOCKS CMS */}
          {activeTab === "home-cms" && (
            <div className="space-y-6 text-left animate-fade-in text-xs font-sans">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Homepage Sliders & Blocks CMS</h3>
                <p className="text-[11px] text-zinc-400 font-sans">Modify captions, background slides, and titles of theme compartments in real-time</p>
              </div>

              {/* Slider customization list */}
              <div className="bg-white border rounded-2xl p-6 text-zinc-750 font-sans border-zinc-200">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-800 border-b pb-3 mb-4">Hero Slider Slides Editor</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {homeConfig.slides.map((slide, idx) => (
                    <div key={slide.id} className="p-4 bg-zinc-50 border rounded-xl flex gap-4">
                      <img src={slide.image} alt="" className="w-16 h-20 object-cover border rounded shrink-0" />
                      <div className="flex-1 space-y-1 truncate">
                        <span className="text-[9px] font-mono font-bold text-orange-600 block uppercase">{slide.subtitle || "Curation"}</span>
                        <h5 className="font-bold text-zinc-950 truncate">{slide.title || "No Title"}</h5>
                        <p className="text-[10px] text-zinc-400 truncate">{slide.description}</p>
                        <button
                          type="button"
                          onClick={() => setSlideEditIdx(idx)}
                          className="text-[10px] font-mono font-bold text-orange-600 uppercase hover:underline pt-2 cursor-pointer"
                        >
                          Modify Slide Parameters
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {slideEditIdx !== null && (
                  <div className="mt-8 p-5 bg-zinc-50 border-t space-y-4 rounded-xl text-xs">
                    <div className="flex justify-between border-b pb-2 mb-2 items-center">
                      <span className="font-bold text-zinc-800">EDITING SLIDE INDEX #{slideEditIdx + 1}</span>
                      <button onClick={() => setSlideEditIdx(null)} className="h-4 w-4 bg-zinc-200 rounded flex items-center justify-center font-bold cursor-pointer">✕</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Slide Header Title</label>
                        <input
                          type="text"
                          value={homeConfig.slides[slideEditIdx].title}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            copy.slides[slideEditIdx].title = e.target.value;
                            setHomeConfig(copy);
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white font-semibold text-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Slide Subtitle Tag</label>
                        <input
                          type="text"
                          value={homeConfig.slides[slideEditIdx].subtitle}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            copy.slides[slideEditIdx].subtitle = e.target.value;
                            setHomeConfig(copy);
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white font-semibold text-zinc-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Slide Description</label>
                        <input
                          type="text"
                          value={homeConfig.slides[slideEditIdx].description}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            copy.slides[slideEditIdx].description = e.target.value;
                            setHomeConfig(copy);
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white text-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Slide Background Image URL</label>
                        <input
                          type="text"
                          value={homeConfig.slides[slideEditIdx].image}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            copy.slides[slideEditIdx].image = e.target.value;
                            setHomeConfig(copy);
                          }}
                          className="w-full border rounded px-3 py-1.5 text-[10px] font-mono focus:outline-none bg-white text-zinc-850"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        saveHomeConfig(homeConfig);
                        alert("Slide coordinates persistent. Auto-sync has saved changes to Cloud Rules!");
                        setSlideEditIdx(null);
                      }}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest rounded shadow cursor-pointer transition"
                    >
                      Update Theme Slider
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </main>

    </section>
  );
}
