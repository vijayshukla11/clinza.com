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
  Mail,
  History,
  Boxes,
  Bot,
  Trophy,
  Flame
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
import { AdminUsersService, AdminAuditLogService } from "../services/supabaseService";

// Import modular tab panels
import AnalyticsTab from "./admin/AnalyticsTab";
import ProductsTab from "./admin/ProductsTab";
import InventoryTab from "./admin/InventoryTab";
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
import ReturnsTab from "./admin/ReturnsTab";
import AuditLogsTab from "./admin/AuditLogsTab";
import AutomationCenterTab from "./admin/AutomationCenterTab";
import ProductRankingTab from "./admin/ProductRankingTab";

type AdminRole = "Super Admin" | "Admin" | "Inventory Manager" | "Order Manager" | "Marketing Manager" | "Customer Support";

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
  const [offerEditIdx, setOfferEditIdx] = useState<number | null>(null);

  // Helper to verify admin user from DB
  const verifyAdminUser = async (email: string, userObj: any) => {
    // Check if running on localhost development or sandbox environment
    const isDev = typeof window !== "undefined" && 
      (window.location.hostname === "localhost" || 
       window.location.hostname === "127.0.0.1" || 
       window.location.hostname.includes("run.app") ||
       !!(import.meta as any).env?.DEV);

    const cleanEmail = email.toLowerCase().trim();
    if (isDev && (cleanEmail === "sastaelectronic6@gmail.com" || cleanEmail === "admin@clinza.in")) {
      setIsAdminAuth(true);
      setStaffRole("Super Admin");
      setGoogleUser({
        email: cleanEmail,
        displayName: userObj?.user_metadata?.name || userObj?.user_metadata?.displayName || "Clinza Super Admin"
      });
      setAuthError("");
      return true;
    }

    try {
      const admin = await AdminUsersService.getAdminByEmail(email);
      if (admin) {
        setIsAdminAuth(true);
        setStaffRole(admin.role as AdminRole);
        setGoogleUser({
          email: admin.email,
          displayName: admin.name || userObj.user_metadata?.name || userObj.user_metadata?.displayName || "Clinza Admin"
        });
        setAuthError("");
        return true;
      } else {
        setIsAdminAuth(false);
        setAuthError(`Access Denied: Supabase profile "${email}" is not listed on Clinza staff ledger with administrative privileges.`);
        return false;
      }
    } catch (err) {
      setIsAdminAuth(false);
      setAuthError("Security Clearance check failed. Please check your network connection.");
      return false;
    }
  };

  useEffect(() => {
    // Route matching for active tab
    const pathname = window.location.pathname;
    if (pathname.includes("/admin/products")) {
      setActiveTab("products");
    } else if (pathname.includes("/admin/inventory")) {
      setActiveTab("inventory");
    } else if (pathname.includes("/admin/categories")) {
      setActiveTab("categories");
    } else if (pathname.includes("/admin/collections")) {
      setActiveTab("collections");
    } else if (pathname.includes("/admin/orders")) {
      setActiveTab("orders");
    } else if (pathname.includes("/admin/returns") || pathname.includes("/admin/returns-manager")) {
      setActiveTab("returns-manager");
    } else if (pathname.includes("/admin/customers")) {
      setActiveTab("customers");
    } else if (pathname.includes("/admin/contact-leads")) {
      setActiveTab("contact-leads");
    } else if (pathname.includes("/admin/newsletters")) {
      setActiveTab("newsletters");
    } else if (pathname.includes("/admin/blog") || pathname.includes("/admin/blogs")) {
      setActiveTab("blogs");
    } else if (pathname.includes("/admin/reviews")) {
      setActiveTab("reviews");
    } else if (pathname.includes("/admin/coupons")) {
      setActiveTab("coupons");
    } else if (pathname.includes("/admin/media")) {
      setActiveTab("media-vault");
    } else if (pathname.includes("/admin/home-cms")) {
      setActiveTab("home-cms");
    } else if (pathname.includes("/admin/theme-editor") || pathname.includes("/admin/theme-customizer")) {
      setActiveTab("theme-customizer");
    } else if (pathname.includes("/admin/integrations") || pathname.includes("/admin/google-seo")) {
      setActiveTab("google-seo");
    } else if (pathname.includes("/admin/audit-logs")) {
      setActiveTab("audit-logs");
    } else if (pathname.includes("/admin/automation") || pathname.includes("/admin/automation-center")) {
      setActiveTab("automation-center");
    } else if (pathname.includes("/admin/rankings") || pathname.includes("/admin/product-rankings")) {
      setActiveTab("product-rankings");
    } else if (pathname.includes("/admin/overview")) {
      setActiveTab("overview");
    }

    // Check current session first with secure server-validated getUser()
    supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (user && !error) {
        await verifyAdminUser(user.email!, user);
      } else {
        // Fallback to local session validation if offline
        const { data: { session } } = await supabase.auth.getSession();
        const sUser = session?.user || null;
        if (sUser) {
          await verifyAdminUser(sUser.email!, sUser);
        } else {
          setIsAdminAuth(false);
        }
      }
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null;
      if (user) {
        await verifyAdminUser(user.email!, user);
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

    // Rate Limiting Protection (Task 5)
    const attempts = parseInt(localStorage.getItem(`login_attempts_${adminEmail}`) || "0", 10);
    const lockoutTime = parseInt(localStorage.getItem(`login_lockout_${adminEmail}`) || "0", 10);
    
    if (Date.now() < lockoutTime) {
      const remainingSeconds = Math.ceil((lockoutTime - Date.now()) / 1000);
      setAuthError(`Brute-force security lockout active. Try again in ${remainingSeconds} seconds.`);
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    try {
      // Progressive Delay
      if (attempts > 0) {
        const delayMs = Math.min(attempts * 1000, 5000); // progressive delay up to 5s
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      const user = await signInWithEmail(adminEmail.trim(), adminPassword.trim());
      if (user) {
        const isAuthorized = await verifyAdminUser(user.email!, user);
        if (isAuthorized) {
          // Reset rate limits on success
          localStorage.removeItem(`login_attempts_${adminEmail}`);
          localStorage.removeItem(`login_lockout_${adminEmail}`);
          
          // Log Activity (Task 4)
          await AdminAuditLogService.logActivity(
            user.email!,
            user.user_metadata?.name || user.user_metadata?.displayName || user.email || "Clinza Admin",
            "Login",
            "Cockpit Portal"
          );
        } else {
          // If authenticated but not in admin_users, log failed attempt
          await AdminAuditLogService.logActivity(
            user.email!,
            user.email || "Unknown",
            "Login Failed: Unauthorized Role",
            "Cockpit Portal"
          );
        }
      }
    } catch (err: any) {
      console.warn("Auth failed:", err);
      const newAttempts = attempts + 1;
      localStorage.setItem(`login_attempts_${adminEmail}`, newAttempts.toString());
      
      let errorMsg = err.message || "Incorrect email or password.";
      if (newAttempts >= 5) {
        const lockoutDuration = 60 * 1000; // 1 minute lockout after 5 failed attempts
        localStorage.setItem(`login_lockout_${adminEmail}`, (Date.now() + lockoutDuration).toString());
        errorMsg = "Too many failed attempts. Brute-force protection lockout activated for 60 seconds.";
      } else if (newAttempts >= 3) {
        errorMsg = `Incorrect credentials. Warning: ${5 - newAttempts} attempts remaining before temporary lockout.`;
      }
      
      setAuthError(errorMsg);
      setIsAdminAuth(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (googleUser) {
      await AdminAuditLogService.logActivity(
        googleUser.email,
        googleUser.displayName || "Admin",
        "Logout",
        "Cockpit Portal"
      );
    }
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
  const handleSaveProduct = async (prod: Product) => {
    saveProduct(prod);
    reloadData();
    if (googleUser) {
      await AdminAuditLogService.logActivity(
        googleUser.email,
        googleUser.displayName || "Admin",
        `Product Saved / Updated`,
        `SKU/ID: ${prod.id} (${prod.name})`
      );
    }
  };

  const handleDeleteProduct = async (id: string) => {
    deleteProduct(id);
    reloadData();
    if (googleUser) {
      await AdminAuditLogService.logActivity(
        googleUser.email,
        googleUser.displayName || "Admin",
        `Product Deleted`,
        `Product ID: ${id}`
      );
    }
  };

  // Dedicated Blog callbacks
  const handleSaveBlog = async (blog: BlogPost) => {
    saveBlogPost(blog);
    reloadData();
    if (googleUser) {
      await AdminAuditLogService.logActivity(
        googleUser.email,
        googleUser.displayName || "Admin",
        `Blog Saved / Updated`,
        `Slug: ${blog.slug} (${blog.title})`
      );
    }
  };

  const handleDeleteBlog = async (slug: string) => {
    deleteBlogPost(slug);
    reloadData();
    if (googleUser) {
      await AdminAuditLogService.logActivity(
        googleUser.email,
        googleUser.displayName || "Admin",
        `Blog Deleted`,
        `Slug: ${slug}`
      );
    }
  };

  // Dedicated Order callbacks
  const handleUpdateOrderStatus = async (id: string, status: any) => {
    updateOrderStatus(id, status);
    reloadData();
    if (googleUser) {
      await AdminAuditLogService.logActivity(
        googleUser.email,
        googleUser.displayName || "Admin",
        `Order Updated`,
        `Order ID: ${id} to Status: ${status}`
      );
    }
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
            
            {/* WORKSPACE ROLE DETAILS */}
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg text-[10px] font-mono text-zinc-400 leading-relaxed">
              <span className="text-orange-500 font-bold">Roster Clearance:</span> Workspace permissions are verified automatically based on your credential records.
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
            {(() => {
              const pendingCount = orderList.filter(o => o.status === "Pending" || o.status === "Confirmed" || o.status === "Packed").length;
              const lowStockCount = productList.filter(p => p.stockStatus === "Low Stock" || p.stockStatus === "Out of Stock" || ((p as any).stockQuantity !== undefined && (p as any).stockQuantity <= 10)).length;

              const tabs = [
                { id: "overview", label: "Dashboard overview", icon: TrendingUp },
                { id: "products", label: "Our Products Catalog", icon: Package },
                { id: "product-rankings", label: "Product Rankings Sequence", icon: Trophy },
                { id: "inventory", label: "Inventory & Stock Control", icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: "bg-red-600" },
                { id: "categories", label: "Taxonomic Categories", icon: Grid },
                { id: "collections", label: "Curated Collections", icon: FolderOpen },
                { id: "orders", label: "Apparel Orders Board", icon: ListOrdered, badge: pendingCount > 0 ? pendingCount : undefined, badgeColor: "bg-orange-600" },
                { id: "returns-manager", label: "Returns & Exchanges", icon: RefreshCw },
                { id: "customers", label: "Customer CRM", icon: Users },
                { id: "contact-leads", label: "Contact Form Leads", icon: MessageSquare },
                { id: "newsletters", label: "Newsletter Subscribers", icon: Mail },
                { id: "blogs", label: "Editorial Blog CMS", icon: FileText },
                { id: "reviews", label: "Review Testimonials", icon: Star },
                { id: "coupons", label: "Promotions & Coupons", icon: Tag },
                { id: "automation-center", label: "Automation Center", icon: Bot },
                { id: "media-vault", label: "Banners Media Vault", icon: FolderLock },
                { id: "home-cms", label: "Homepage Blocks CMS", icon: Smartphone },
                { id: "theme-customizer", label: "Shopify Theme Editor", icon: Palette },
                { id: "google-seo", label: "Integrations & GA4", icon: Wrench },
                ...(staffRole === "Super Admin" || staffRole === "Admin" ? [{ id: "audit-logs", label: "Security Audit Logs", icon: History }] : [])
              ];

              return tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSlideEditIdx(null);
                      if (window.history && window.history.pushState) {
                        window.history.pushState({}, "", `/admin/${tab.id}`);
                      }
                    }}
                    className={`w-full py-2.5 px-3.5 rounded-lg flex items-center justify-between gap-3 transition-all cursor-pointer font-sans font-bold text-left ${
                      isSelected 
                        ? "bg-orange-600 text-white font-black shadow-md shadow-orange-600/10" 
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span className={`text-[9px] font-mono font-bold text-white px-1.5 py-0.5 rounded-full shrink-0 ${tab.badgeColor || "bg-orange-600"}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              });
            })()}
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

          {activeTab === "inventory" && (
            <InventoryTab
              productList={productList}
              orderList={orderList}
              onRefresh={handleDBCloudSync}
            />
          )}

          {activeTab === "categories" && <CategoriesTab />}

          {activeTab === "collections" && <CollectionsTab />}

          {activeTab === "orders" && (
            <OrdersTab
              orderList={orderList}
              productList={productList}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === "returns-manager" && <ReturnsTab />}

          {activeTab === "customers" && (
            <CustomersTab
              orderList={orderList}
              productList={productList}
            />
          )}

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

          {activeTab === "automation-center" && <AutomationCenterTab />}

          {activeTab === "product-rankings" && (
            <ProductRankingTab
              products={productList}
              onProductsUpdate={handleDBCloudSync}
            />
          )}

          {activeTab === "media-vault" && <MediaLibraryTab />}

          {activeTab === "google-seo" && <IntegrationsTab />}

          {activeTab === "audit-logs" && <AuditLogsTab />}

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
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Slide Badge Text</label>
                        <input
                          type="text"
                          value={homeConfig.slides[slideEditIdx].badge ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            copy.slides[slideEditIdx].badge = e.target.value;
                            setHomeConfig(copy);
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white font-semibold text-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Slide Subtitle Tag</label>
                        <input
                          type="text"
                          value={homeConfig.slides[slideEditIdx].subtitle ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            copy.slides[slideEditIdx].subtitle = e.target.value;
                            setHomeConfig(copy);
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white font-semibold text-zinc-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Slide Header Title</label>
                      <input
                        type="text"
                        value={homeConfig.slides[slideEditIdx].title ?? ""}
                        onChange={(e) => {
                          const copy = { ...homeConfig };
                          copy.slides[slideEditIdx].title = e.target.value;
                          setHomeConfig(copy);
                        }}
                        className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white font-semibold text-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Slide Description</label>
                      <textarea
                        rows={3}
                        value={homeConfig.slides[slideEditIdx].description ?? ""}
                        onChange={(e) => {
                          const copy = { ...homeConfig };
                          copy.slides[slideEditIdx].description = e.target.value;
                          setHomeConfig(copy);
                        }}
                        className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white text-zinc-800 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Slide Background Image URL</label>
                      <input
                        type="text"
                        value={homeConfig.slides[slideEditIdx].image ?? ""}
                        onChange={(e) => {
                          const copy = { ...homeConfig };
                          copy.slides[slideEditIdx].image = e.target.value;
                          setHomeConfig(copy);
                        }}
                        className="w-full border rounded px-3 py-1.5 text-[10px] font-mono focus:outline-none bg-white text-zinc-850"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Primary Button Text</label>
                        <input
                          type="text"
                          value={homeConfig.slides[slideEditIdx].primaryButtonText ?? homeConfig.slides[slideEditIdx].button1Text ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            copy.slides[slideEditIdx].primaryButtonText = e.target.value;
                            copy.slides[slideEditIdx].button1Text = e.target.value;
                            setHomeConfig(copy);
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white text-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Primary Button Route</label>
                        <input
                          type="text"
                          value={homeConfig.slides[slideEditIdx].primaryButtonLink ?? homeConfig.slides[slideEditIdx].button1Link ?? homeConfig.slides[slideEditIdx].route ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            const val = e.target.value;
                            copy.slides[slideEditIdx].primaryButtonLink = val;
                            copy.slides[slideEditIdx].button1Link = val;
                            copy.slides[slideEditIdx].route = val;
                            setHomeConfig(copy);
                          }}
                          className="w-full border rounded px-3 py-1.5 text-[10px] font-mono focus:outline-none bg-white text-zinc-850"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Secondary Button Text</label>
                        <input
                          type="text"
                          value={homeConfig.slides[slideEditIdx].secondaryButtonText ?? homeConfig.slides[slideEditIdx].button2Text ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            copy.slides[slideEditIdx].secondaryButtonText = e.target.value;
                            copy.slides[slideEditIdx].button2Text = e.target.value;
                            setHomeConfig(copy);
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white text-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Secondary Button Route</label>
                        <input
                          type="text"
                          value={homeConfig.slides[slideEditIdx].secondaryButtonLink ?? homeConfig.slides[slideEditIdx].button2Link ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            copy.slides[slideEditIdx].secondaryButtonLink = e.target.value;
                            copy.slides[slideEditIdx].button2Link = e.target.value;
                            setHomeConfig(copy);
                          }}
                          className="w-full border rounded px-3 py-1.5 text-[10px] font-mono focus:outline-none bg-white text-zinc-850"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const copy = { ...homeConfig };
                        const s = copy.slides[slideEditIdx];
                        s.badge = s.badge || "NEW COLLECTION";
                        s.title = s.title || "Premium Everyday Fashion";
                        s.subtitle = s.subtitle || "The Premium Summer Collection";
                        s.description = s.description || "Timeless fits. Premium fabrics. Designed for modern India.";
                        s.image = s.image || "";
                        s.primaryButtonText = s.primaryButtonText ?? s.button1Text ?? "Shop Collection";
                        s.primaryButtonLink = s.primaryButtonLink ?? s.button1Link ?? s.route ?? "collections/all";
                        s.secondaryButtonText = s.secondaryButtonText ?? s.button2Text ?? "Shop All Collections";
                        s.secondaryButtonLink = s.secondaryButtonLink ?? s.button2Link ?? "shop-all-collections";

                        // Set backward compatibility aliases explicitly on save too
                        s.button1Text = s.primaryButtonText;
                        s.button1Link = s.primaryButtonLink;
                        s.route = s.primaryButtonLink;
                        s.button2Text = s.secondaryButtonText;
                        s.button2Link = s.secondaryButtonLink;

                        setHomeConfig(copy);
                        saveHomeConfig(copy);
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

              {/* Offers customization list */}
              <div className="bg-white border rounded-2xl p-6 text-zinc-750 font-sans border-zinc-200 mt-6">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-800">Dynamic Current Offers CMS</h4>
                    <p className="text-[10px] text-zinc-400 font-sans">These offers display in a premium grid/scroller right after the Hero Slider on the homepage.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = { ...homeConfig };
                      const currentOffers = copy.offers || [];
                      const newOffer = {
                        id: `offer-${Date.now()}`,
                        image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
                        title: "New Premium Offer",
                        subtitle: "Meticulously crafted premium wardrobe apparel.",
                        discount: "FLAT 10% OFF",
                        buttonText: "Shop Now",
                        link: "collections/shirts",
                        badge: "NEW",
                        startDate: new Date().toISOString().split("T")[0],
                        endDate: "2026-12-31"
                      };
                      copy.offers = [...currentOffers, newOffer];
                      setHomeConfig(copy);
                      saveHomeConfig(copy);
                      setOfferEditIdx(copy.offers.length - 1);
                    }}
                    className="px-3 py-1.5 bg-[#F27D26] hover:bg-[#d66518] text-white font-black text-[10px] uppercase tracking-wider rounded cursor-pointer transition"
                  >
                    + Add New Offer
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(homeConfig.offers || []).map((offer, idx) => (
                    <div key={offer.id} className="p-4 bg-zinc-50 border rounded-xl flex gap-4 items-start justify-between">
                      <div className="flex gap-4">
                        <img src={offer.image} alt="" className="w-16 h-20 object-cover border rounded shrink-0" />
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold text-orange-600 block uppercase">{offer.badge || "SPECIAL"}</span>
                          <h5 className="font-bold text-zinc-950 truncate max-w-[150px]">{offer.title || "No Title"}</h5>
                          <p className="text-[10px] text-zinc-500">{offer.discount || "No Discount Text"}</p>
                          <p className="text-[9px] text-zinc-400 font-mono">{offer.startDate} to {offer.endDate}</p>
                          <button
                            type="button"
                            onClick={() => setOfferEditIdx(idx)}
                            className="text-[10px] font-mono font-bold text-orange-600 uppercase hover:underline pt-2 cursor-pointer block text-left"
                          >
                            Modify Parameters
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this offer?")) {
                            const copy = { ...homeConfig };
                            const currentOffers = copy.offers || [];
                            copy.offers = currentOffers.filter((_, oidx) => oidx !== idx);
                            setHomeConfig(copy);
                            saveHomeConfig(copy);
                            setOfferEditIdx(null);
                          }
                        }}
                        className="text-[10px] text-red-500 hover:text-red-700 font-black uppercase cursor-pointer"
                        title="Delete offer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {offerEditIdx !== null && homeConfig.offers && homeConfig.offers[offerEditIdx] && (
                  <div className="mt-8 p-5 bg-zinc-50 border border-zinc-200 space-y-4 rounded-xl text-xs">
                    <div className="flex justify-between border-b pb-2 mb-2 items-center">
                      <span className="font-bold text-zinc-800">EDITING OFFER INDEX #{offerEditIdx + 1}</span>
                      <button onClick={() => setOfferEditIdx(null)} className="h-4 w-4 bg-zinc-200 rounded flex items-center justify-center font-bold cursor-pointer">✕</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Offer Title</label>
                        <input
                          type="text"
                          value={homeConfig.offers[offerEditIdx].title ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            if (copy.offers) {
                              copy.offers[offerEditIdx].title = e.target.value;
                              setHomeConfig(copy);
                            }
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white font-semibold text-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Offer Subtitle</label>
                        <input
                          type="text"
                          value={homeConfig.offers[offerEditIdx].subtitle ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            if (copy.offers) {
                              copy.offers[offerEditIdx].subtitle = e.target.value;
                              setHomeConfig(copy);
                            }
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white font-semibold text-zinc-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Discount Text / Subheading</label>
                        <input
                          type="text"
                          value={homeConfig.offers[offerEditIdx].discount ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            if (copy.offers) {
                              copy.offers[offerEditIdx].discount = e.target.value;
                              setHomeConfig(copy);
                            }
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white font-semibold text-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Offer Badge Text</label>
                        <input
                          type="text"
                          value={homeConfig.offers[offerEditIdx].badge ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            if (copy.offers) {
                              copy.offers[offerEditIdx].badge = e.target.value;
                              setHomeConfig(copy);
                            }
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white font-semibold text-zinc-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Button Text</label>
                        <input
                          type="text"
                          value={homeConfig.offers[offerEditIdx].buttonText ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            if (copy.offers) {
                              copy.offers[offerEditIdx].buttonText = e.target.value;
                              setHomeConfig(copy);
                            }
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white text-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Button Link / Route</label>
                        <input
                          type="text"
                          value={homeConfig.offers[offerEditIdx].link ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            if (copy.offers) {
                              copy.offers[offerEditIdx].link = e.target.value;
                              setHomeConfig(copy);
                            }
                          }}
                          className="w-full border rounded px-3 py-1.5 text-[10px] font-mono focus:outline-none bg-white text-zinc-850"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Offer Image URL</label>
                      <input
                        type="text"
                        value={homeConfig.offers[offerEditIdx].image ?? ""}
                        onChange={(e) => {
                          const copy = { ...homeConfig };
                          if (copy.offers) {
                            copy.offers[offerEditIdx].image = e.target.value;
                            setHomeConfig(copy);
                          }
                        }}
                        className="w-full border rounded px-3 py-1.5 text-[10px] font-mono focus:outline-none bg-white text-zinc-850"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">Start Date</label>
                        <input
                          type="date"
                          value={homeConfig.offers[offerEditIdx].startDate ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            if (copy.offers) {
                              copy.offers[offerEditIdx].startDate = e.target.value;
                              setHomeConfig(copy);
                            }
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white text-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-550 uppercase mb-1">End Date</label>
                        <input
                          type="date"
                          value={homeConfig.offers[offerEditIdx].endDate ?? ""}
                          onChange={(e) => {
                            const copy = { ...homeConfig };
                            if (copy.offers) {
                              copy.offers[offerEditIdx].endDate = e.target.value;
                              setHomeConfig(copy);
                            }
                          }}
                          className="w-full border rounded px-3 py-1.5 focus:outline-none bg-white text-zinc-800"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const copy = { ...homeConfig };
                          setHomeConfig(copy);
                          saveHomeConfig(copy);
                          alert("Dynamic offer parameters saved successfully!");
                          setOfferEditIdx(null);
                        }}
                        className="px-5 py-2.5 bg-[#F27D26] hover:bg-[#d66518] text-white font-black text-xs uppercase tracking-widest rounded shadow cursor-pointer transition"
                      >
                        Update Dynamic Offer
                      </button>
                    </div>
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
