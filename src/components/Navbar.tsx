/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ArrowRight,
  Clock,
  Trash2,
  ChevronDown,
  Plus,
  Minus,
  Instagram,
  Facebook,
  Globe,
  Package,
  LogOut,
  MapPin,
  Sparkles,
  Check,
  ShieldCheck,
  Gift,
  Mail
} from "lucide-react";
import { Product, CartItem } from "../types";
import { getSearchHistory, addSearchHistory, clearSearchHistory, getProducts } from "../utils";
import { CollectionsService, CollectionItem } from "../services/supabaseService";

interface NavbarProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  cart?: CartItem[];
  cartCount: number;
  updateCartQty?: (itemIndex: number, quantity: number) => void;
  removeCartItem?: (itemIndex: number) => void;
  wishlist?: string[];
  wishlistCount: number;
  toggleWishlist?: (product: Product) => void;
  addToCart?: (product: Product, color: string, size: string, quantity?: number) => void;
  currentUser?: any;
  onLogout?: () => void;
  onSearch: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  searchOpen: boolean;
}

export default function Navbar({
  currentRoute,
  setRoute,
  cart = [],
  cartCount,
  updateCartQty,
  removeCartItem,
  wishlist = [],
  wishlistCount,
  toggleWishlist,
  addToCart,
  currentUser,
  onLogout,
  onSearch,
  setSearchOpen,
  searchOpen
}: NavbarProps) {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<"shop" | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navCollections, setNavCollections] = useState<CollectionItem[]>([]);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Listen for open_cart_drawer custom event triggered when adding items to cart
  useEffect(() => {
    const handleOpenCart = () => setCartDrawerOpen(true);
    window.addEventListener("open_cart_drawer", handleOpenCart);
    return () => window.removeEventListener("open_cart_drawer", handleOpenCart);
  }, []);

  // Scroll handler for sticky luxury header height & shadow transitions
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync search history when search modal opens
  useEffect(() => {
    if (searchOpen) {
      setHistory(getSearchHistory());
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Keyboard navigation & ESC key handler for modals/drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setCartDrawerOpen(false);
        setWishlistDrawerOpen(false);
        setAccountMenuOpen(false);
        setMegaMenuOpen(null);
        setSideDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchOpen]);

  // Click outside listener for account dropdown and mega menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch collections from database
  useEffect(() => {
    let isMounted = true;
    async function loadNavCollections() {
      try {
        const cols = await CollectionsService.getAll();
        if (isMounted && cols) {
          setNavCollections(cols.filter((c) => c.isActive !== false));
        }
      } catch (e) {
        console.error("Error loading navbar collections:", e);
      }
    }
    loadNavCollections();

    const handleUpdate = () => {
      loadNavCollections();
    };
    window.addEventListener("clinza_collections_updated", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("clinza_collections_updated", handleUpdate);
    };
  }, [currentRoute]);

  // Search input handler
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const allProducts = getProducts();
    const filtered = allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(val.toLowerCase()) ||
          p.category.toLowerCase().includes(val.toLowerCase()) ||
          p.collection.toLowerCase().includes(val.toLowerCase())
      )
      .slice(0, 5);
    setSuggestions(filtered);
  };

  const executeSearch = (query: string) => {
    if (!query.trim()) return;
    addSearchHistory(query);
    onSearch(query);
    setSearchOpen(false);
    setSideDrawerOpen(false);
    setRoute(`collections/all`);
  };

  const selectSuggestion = (prod: Product) => {
    addSearchHistory(prod.name);
    setSearchOpen(false);
    setRoute(`product/${prod.slug}`);
  };

  // Cart Subtotal calculation
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 1499;
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  // Wishlist products resolution
  const allProductsList = getProducts();
  const wishlistProducts = allProductsList.filter((p) => wishlist.includes(p.id));

  return (
    <>
      {/* HEADER CONTAINER */}
      <header
        id="navbar-header"
        className={`sticky top-0 z-[9999] w-full transition-all duration-300 flex items-center h-[60px] md:h-[64px] lg:h-[72px] ${
          isScrolled 
            ? "bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-xs" 
            : "bg-white border-b border-[#EFEFEF] shadow-none"
        }`}
        onMouseLeave={() => setMegaMenuOpen(null)}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between w-full h-full relative">
          
          {/* LEFT: CLINZA LOGO */}
          <div className="flex items-center shrink-0 lg:mr-12">
            <button
              id="nav-logo-btn"
              onClick={() => {
                setMegaMenuOpen(null);
                setRoute("home");
              }}
              className="group flex items-center focus:outline-none cursor-pointer py-1"
              aria-label="CLINZA Home"
            >
              <img
                src="https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/logo%20n%20deisgn/clinza.png"
                alt="CLINZA"
                className="h-7 sm:h-8 lg:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <span className="hidden font-sans font-extrabold tracking-[0.2em] text-black text-2xl lg:text-[26px] xl:text-3xl uppercase transition-all duration-300">
                CLINZA
              </span>
            </button>
          </div>

          {/* CENTER: LUXURY NAVIGATION (Home | Shop ▼ | Collections | New Arrivals | Best Sellers | About | Contact) */}
          <nav
            className="hidden lg:flex items-center gap-3.5 xl:gap-[24px] 2xl:gap-[32px] h-full"
            ref={megaMenuRef}
          >
            {/* 1. HOME */}
            <div className="h-full flex items-center relative group">
              <button
                id="nav-link-home"
                onClick={() => {
                  setMegaMenuOpen(null);
                  setRoute("home");
                }}
                className={`font-sans text-[13px] xl:text-[15px] font-medium uppercase tracking-[0.04em] xl:tracking-[0.08em] transition-colors duration-200 h-full flex items-center focus:outline-none cursor-pointer whitespace-nowrap relative ${
                  currentRoute === "home" || currentRoute === "" || currentRoute === "/"
                    ? "text-black font-semibold"
                    : "text-[#111111] hover:text-black"
                }`}
              >
                <span>Home</span>
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#F27D26] transition-transform duration-300 ease-out origin-left ${
                    currentRoute === "home" || currentRoute === "" || currentRoute === "/"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            </div>

            {/* 2. SHOP ▼ */}
            <div
              className="h-full flex items-center relative group"
              onMouseEnter={() => setMegaMenuOpen("shop")}
            >
              <button
                id="nav-link-shop"
                onClick={() => {
                  setMegaMenuOpen(megaMenuOpen === "shop" ? null : "shop");
                }}
                className={`font-sans text-[13px] xl:text-[15px] font-medium uppercase tracking-[0.04em] xl:tracking-[0.08em] transition-colors duration-200 h-full flex items-center gap-1 focus:outline-none cursor-pointer whitespace-nowrap relative ${
                  currentRoute === "shop" || megaMenuOpen === "shop"
                    ? "text-black font-semibold"
                    : "text-[#111111] hover:text-black"
                }`}
              >
                <span>Shop</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    megaMenuOpen === "shop" ? "rotate-180 text-[#F27D26]" : "text-zinc-500 group-hover:text-black"
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#F27D26] transition-transform duration-300 ease-out origin-left ${
                    currentRoute === "shop" || megaMenuOpen === "shop"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            </div>

            {/* 3. COLLECTIONS */}
            <div className="h-full flex items-center relative group">
              <button
                id="nav-link-collections"
                onClick={() => {
                  setMegaMenuOpen(null);
                  setRoute("collections");
                }}
                className={`font-sans text-[13px] xl:text-[15px] font-medium uppercase tracking-[0.04em] xl:tracking-[0.08em] transition-colors duration-200 h-full flex items-center focus:outline-none cursor-pointer whitespace-nowrap relative ${
                  currentRoute === "collections" ||
                  currentRoute === "/collections" ||
                  currentRoute.startsWith("collections/") ||
                  currentRoute.startsWith("/collections/") ||
                  currentRoute.startsWith("collection/") ||
                  currentRoute === "shop-all-collections"
                    ? "text-[#F27D26] font-semibold"
                    : "text-[#111111] hover:text-black"
                }`}
              >
                <span>Collections</span>
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#F27D26] transition-transform duration-300 ease-out origin-left ${
                    currentRoute === "collections" ||
                    currentRoute === "/collections" ||
                    currentRoute.startsWith("collections/") ||
                    currentRoute.startsWith("/collections/") ||
                    currentRoute.startsWith("collection/") ||
                    currentRoute === "shop-all-collections"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            </div>

            {/* 4. NEW ARRIVALS */}
            <div className="h-full flex items-center relative group">
              <button
                id="nav-link-new-arrivals"
                onClick={() => {
                  setMegaMenuOpen(null);
                  setRoute("new-arrivals");
                }}
                className={`font-sans text-[13px] xl:text-[15px] font-medium uppercase tracking-[0.04em] xl:tracking-[0.08em] transition-colors duration-200 h-full flex items-center focus:outline-none cursor-pointer whitespace-nowrap relative ${
                  currentRoute === "new-arrivals" || currentRoute === "/new-arrivals"
                    ? "text-black font-semibold"
                    : "text-[#111111] hover:text-black"
                }`}
              >
                <span>New Arrivals</span>
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#F27D26] transition-transform duration-300 ease-out origin-left ${
                    currentRoute === "new-arrivals" || currentRoute === "/new-arrivals"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            </div>

            {/* 5. BEST SELLERS / TOP RANKED */}
            <div className="h-full flex items-center relative group">
              <button
                id="nav-link-top-ranked"
                onClick={() => {
                  setMegaMenuOpen(null);
                  setRoute("trending");
                }}
                className={`font-sans text-[13px] xl:text-[15px] font-medium uppercase tracking-[0.04em] xl:tracking-[0.08em] transition-colors duration-200 h-full flex items-center gap-1 focus:outline-none cursor-pointer whitespace-nowrap relative ${
                  currentRoute === "trending" || currentRoute === "/trending"
                    ? "text-[#F27D26] font-bold"
                    : "text-[#111111] hover:text-[#F27D26]"
                }`}
              >
                <span className="text-amber-600 font-black">#1</span>
                <span>Top Ranked</span>
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#F27D26] transition-transform duration-300 ease-out origin-left ${
                    currentRoute === "trending" || currentRoute === "/trending"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            </div>

            {/* 6. ABOUT */}
            <div className="h-full flex items-center relative group">
              <button
                id="nav-link-about"
                onClick={() => {
                  setMegaMenuOpen(null);
                  setRoute("about");
                }}
                className={`font-sans text-[13px] xl:text-[15px] font-medium uppercase tracking-[0.04em] xl:tracking-[0.08em] transition-colors duration-200 h-full flex items-center focus:outline-none cursor-pointer whitespace-nowrap relative ${
                  currentRoute === "about" || currentRoute === "/about"
                    ? "text-black font-semibold"
                    : "text-[#111111] hover:text-black"
                }`}
              >
                <span>About</span>
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#F27D26] transition-transform duration-300 ease-out origin-left ${
                    currentRoute === "about" || currentRoute === "/about"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            </div>

            {/* 7. CONTACT */}
            <div className="h-full flex items-center relative group">
              <button
                id="nav-link-contact"
                onClick={() => {
                  setMegaMenuOpen(null);
                  setRoute("contact");
                }}
                className={`font-sans text-[13px] xl:text-[15px] font-medium uppercase tracking-[0.04em] xl:tracking-[0.08em] transition-colors duration-200 h-full flex items-center focus:outline-none cursor-pointer whitespace-nowrap relative ${
                  currentRoute === "contact" || currentRoute === "/contact"
                    ? "text-black font-semibold"
                    : "text-[#111111] hover:text-black"
                }`}
              >
                <span>Contact</span>
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#F27D26] transition-transform duration-300 ease-out origin-left ${
                    currentRoute === "contact" || currentRoute === "/contact"
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            </div>
          </nav>

          {/* RIGHT: COMBO SHOP CTA | SEARCH | ACCOUNT | WISHLIST | CART */}
          <div className="flex items-center gap-3 xl:gap-[20px]">
            
            {/* ★ COMBO SHOP SPECIAL CTA BUTTON (PREMIUM MAROON WITH WHITE ANIMATED BORDER/CORNER) */}
            <button
              id="nav-combo-shop-cta"
              onClick={() => {
                setMegaMenuOpen(null);
                setRoute("collections/combos");
              }}
              className="hidden md:inline-flex items-center justify-center gap-2 btn-premium-maroon text-[12px] xl:text-[13.5px] font-bold uppercase tracking-[0.06em] h-[40px] xl:h-[44px] px-3.5 xl:px-5 rounded-full shadow-md cursor-pointer shrink-0"
            >
              <Gift className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-white stroke-[2.2]" />
              <span>COMBO SHOP</span>
            </button>

            {/* ICONS GROUP: SEARCH, ACCOUNT, WISHLIST, CART (Gap: 20px) */}
            <div className="flex items-center gap-[20px]">
              {/* SEARCH ICON */}
              <button
                id="nav-search-button"
                onClick={() => setSearchOpen(true)}
                className="p-1 text-black hover:opacity-75 transition-all duration-200 focus:outline-none cursor-pointer relative"
                aria-label="Search Catalog"
              >
                <Search className="h-[22px] w-[22px] stroke-[1.6]" />
              </button>

              {/* PROFILE ICON & DROPDOWN */}
              <div className="relative" ref={accountMenuRef}>
                <button
                  id="nav-account-button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="p-1 text-black hover:opacity-75 transition-all duration-200 focus:outline-none cursor-pointer flex items-center"
                  aria-label="Account Menu"
                >
                  <User className="h-[22px] w-[22px] stroke-[1.6]" />
                </button>

              {/* Account Dropdown */}
              {accountMenuOpen && (
                <div
                  id="account-dropdown-menu"
                  className="absolute -right-10 sm:right-0 top-full mt-3 w-60 sm:w-64 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-stone-200 py-3 px-1 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {currentUser ? (
                    <div className="px-4 py-2.5 border-b border-stone-100 mb-1">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold">Signed In As</p>
                      <p className="text-xs font-bold text-zinc-900 truncate">{currentUser.name || currentUser.email || "VIP Member"}</p>
                    </div>
                  ) : null}

                  <div className="space-y-1">
                    {!currentUser ? (
                      <>
                        <button
                          id="acc-menu-login"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setRoute("login");
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-[#5B1824] hover:text-white rounded-xl transition-colors flex items-center gap-2 cursor-pointer uppercase tracking-wider font-sans"
                        >
                          Login
                        </button>
                        <button
                          id="acc-menu-register"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setRoute("register");
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-[#5B1824] hover:text-white rounded-xl transition-colors flex items-center gap-2 cursor-pointer uppercase tracking-wider font-sans"
                        >
                          Register
                        </button>
                      </>
                    ) : null}

                    <button
                      id="acc-menu-profile"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        setRoute("account");
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-stone-100 hover:text-[#5B1824] rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer uppercase tracking-wider font-sans"
                    >
                      <User className="h-4 w-4 text-zinc-500 stroke-[1.8] shrink-0" /> My Account
                    </button>

                    <button
                      id="acc-menu-orders"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        setRoute("account");
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-stone-100 hover:text-[#5B1824] rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer uppercase tracking-wider font-sans"
                    >
                      <Package className="h-4 w-4 text-zinc-500 stroke-[1.8] shrink-0" /> Orders
                    </button>

                    <button
                      id="acc-menu-wishlist"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        setWishlistDrawerOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-800 hover:bg-stone-100 hover:text-[#5B1824] rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer uppercase tracking-wider font-sans"
                    >
                      <Heart className="h-4 w-4 text-zinc-500 stroke-[1.8] shrink-0" /> Wishlist ({wishlistCount})
                    </button>

                    {currentUser && (
                      <div className="pt-1 mt-1 border-t border-stone-100">
                        <button
                          id="acc-menu-logout"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onLogout?.();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer uppercase tracking-wider font-sans"
                        >
                          <LogOut className="h-4 w-4 stroke-[1.8] shrink-0" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* WISHLIST ICON */}
            <button
              id="nav-wishlist-button"
              onClick={() => setWishlistDrawerOpen(true)}
              className="p-1 text-black hover:opacity-75 transition-all duration-200 relative focus:outline-none cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="h-[22px] w-[22px] stroke-[1.6]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F27D26] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* CART ICON */}
            <button
              id="nav-cart-button"
              onClick={() => setCartDrawerOpen(true)}
              className="p-1 text-black hover:opacity-75 transition-all duration-200 relative focus:outline-none cursor-pointer"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="h-[22px] w-[22px] stroke-[1.6]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F27D26] text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* MENU ICON (☰) FOR MOBILE/TABLET */}
            <button
              id="nav-side-drawer-toggle"
              onClick={() => setSideDrawerOpen(true)}
              className="p-1 text-black hover:opacity-75 transition-all duration-200 focus:outline-none cursor-pointer lg:hidden"
              aria-label="Open Side Drawer Menu"
            >
              <Menu className="h-6 w-6 stroke-[1.6]" />
            </button>

          </div>
        </div>
      </div>

        {/* SHOP MEGA MENU */}
        {megaMenuOpen === "shop" && (
          <div
            id="navbar-shop-mega-menu"
            className="absolute top-full left-0 w-full bg-white border-t border-b border-zinc-200/80 shadow-[0_24px_60px_rgba(0,0,0,0.08)] py-10 px-8 lg:px-16 animate-in fade-in slide-in-from-top-2 duration-200 z-40"
            onMouseEnter={() => setMegaMenuOpen("shop")}
            onMouseLeave={() => setMegaMenuOpen(null)}
          >
            <div className="max-w-[1440px] mx-auto grid grid-cols-12 gap-8 lg:gap-12">
              
              {/* Column 1: Collections */}
              <div className="col-span-3 space-y-4">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase font-mono border-b border-zinc-100 pb-2">
                  Collections
                </h3>
                <ul className="space-y-3">
                  {[
                    { name: "Premium Shirts", route: "collections/shirts" },
                    { name: "Linen Shirts", route: "collections/linen-shirts" },
                    { name: "Jeans", route: "collections/jeans" },
                    { name: "Pants", route: "collections/pants" },
                    { name: "Combo Sets", route: "collections/combos" }
                  ].map((col) => (
                    <li key={col.name}>
                      <button
                        onClick={() => {
                          setMegaMenuOpen(null);
                          setRoute(col.route);
                        }}
                        className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 hover:text-black hover:translate-x-1.5 transition-all duration-200 cursor-pointer block text-left"
                      >
                        {col.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Featured */}
              <div className="col-span-3 space-y-4">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase font-mono border-b border-zinc-100 pb-2">
                  Featured
                </h3>
                <ul className="space-y-3">
                  {[
                    { name: "New Arrivals", route: "new-arrivals" },
                    { name: "Best Sellers", route: "trending" },
                    { name: "Summer Collection", route: "collections/linen-shirts" },
                    { name: "Limited Edition", route: "shop-all-collections" }
                  ].map((feat) => (
                    <li key={feat.name}>
                      <button
                        onClick={() => {
                          setMegaMenuOpen(null);
                          setRoute(feat.route);
                        }}
                        className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 hover:text-black hover:translate-x-1.5 transition-all duration-200 cursor-pointer block text-left"
                      >
                        {feat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Promotions */}
              <div className="col-span-3 space-y-4">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase font-mono border-b border-zinc-100 pb-2">
                  Promotions
                </h3>
                <ul className="space-y-3">
                  {[
                    { name: "Buy 2 Get 1", route: "collections/combos" },
                    { name: "Combo Offers", route: "collections/combos" }
                  ].map((promo) => (
                    <li key={promo.name}>
                      <button
                        onClick={() => {
                          setMegaMenuOpen(null);
                          setRoute(promo.route);
                        }}
                        className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-800 hover:text-black hover:translate-x-1.5 transition-all duration-200 cursor-pointer flex items-center gap-2 group text-left"
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-black group-hover:scale-125 transition-transform" />
                        <span>{promo.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setMegaMenuOpen(null);
                      setRoute("collections/combos");
                    }}
                    className="w-full py-2.5 px-4 bg-black text-white text-[11px] font-bold uppercase tracking-[0.14em] rounded-[8px] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Gift className="h-3.5 w-3.5" />
                    <span>Explore Combo Shop</span>
                  </button>
                </div>
              </div>

              {/* Column 4: Lifestyle Banner */}
              <div className="col-span-3">
                <div
                  onClick={() => {
                    setMegaMenuOpen(null);
                    setRoute("collections/linen-shirts");
                  }}
                  className="group cursor-pointer relative rounded-xl overflow-hidden bg-zinc-950 aspect-[4/3] flex flex-col justify-end p-5 shadow-sm border border-zinc-100"
                >
                  <img
                    src="https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
                    alt="CLINZA Lifestyle Campaign"
                    className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="relative z-10 text-white space-y-1.5">
                    <span className="text-[9px] font-mono tracking-widest uppercase bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full inline-block font-medium">
                      Summer '26 Edit
                    </span>
                    <h4 className="text-sm font-bold tracking-[0.12em] uppercase font-sans">
                      European Linen Atelier
                    </h4>
                    <p className="text-[10px] text-zinc-300 font-medium tracking-wide flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Discover Handcrafted Shirts</span>
                      <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <div id="search-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex flex-col items-center justify-start pt-16 px-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 animate-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="p-6 border-b border-zinc-100 flex items-center gap-4 bg-white">
              <Search className="h-5 w-5 text-zinc-400 stroke-[1.75]" />
              <input
                ref={searchInputRef}
                id="navbar-search-input"
                type="text"
                placeholder="Search European linen, raw denim, sartorial trousers..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") executeSearch(searchQuery);
                }}
                className="w-full bg-transparent border-none text-zinc-950 font-medium text-base focus:outline-none placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="p-1 text-zinc-400 hover:text-black focus:outline-none cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                id="search-close-btn"
                onClick={() => setSearchOpen(false)}
                className="p-1.5 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors focus:outline-none cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Popular Searches & Suggestions Panel */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              
              {/* Popular Searches Tags */}
              <div>
                <h4 className="text-[10px] font-bold tracking-[0.18em] text-zinc-400 uppercase font-mono mb-3">
                  Popular Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Linen Shirts",
                    "Raw Selvedge Denim",
                    "Sartorial Trousers",
                    "Combo Sets",
                    "Oversized Tees",
                    "Mandarin Collar"
                  ].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchQuery(tag);
                        executeSearch(tag);
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestions vs Search History split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-zinc-100">
                
                {/* Instant Suggestions */}
                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.18em] text-zinc-400 uppercase font-mono mb-3">
                    Instant Suggestions
                  </h4>
                  {suggestions.length > 0 ? (
                    <div className="space-y-2">
                      {suggestions.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => selectSuggestion(p)}
                          className="w-full flex items-center gap-3 text-left p-2 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer group"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-12 w-10 object-cover rounded-lg bg-zinc-100"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-zinc-900 group-hover:text-black truncate uppercase tracking-wide">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-zinc-500 font-mono">
                              {p.category} • ₹{p.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 py-4 italic">
                      {searchQuery ? "No matching products found." : "Type above to search our luxury collection."}
                    </p>
                  )}
                </div>

                {/* Recent Searches */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-bold tracking-[0.18em] text-zinc-400 uppercase font-mono">
                      Recent Searches
                    </h4>
                    {history.length > 0 && (
                      <button
                        onClick={() => {
                          clearSearchHistory();
                          setHistory([]);
                        }}
                        className="text-[10px] font-semibold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    )}
                  </div>
                  {history.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {history.map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setSearchQuery(q);
                            executeSearch(q);
                          }}
                          className="flex items-center gap-1.5 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-full hover:bg-black hover:text-white transition-all cursor-pointer"
                        >
                          <Clock className="h-3 w-3 text-zinc-400" />
                          {q}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 py-4 italic">No recent search history.</p>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* MINI CART DRAWER */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setCartDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-black stroke-[1.5]" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-black">
                    Shopping Bag ({cartCount})
                  </h3>
                </div>
                <button
                  id="cart-drawer-close"
                  onClick={() => setCartDrawerOpen(false)}
                  className="p-2 text-zinc-400 hover:text-black transition-colors rounded-full focus:outline-none cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Free Shipping Progress */}
              <div className="bg-zinc-50 px-6 py-3 border-b border-zinc-100">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-800 uppercase tracking-wider mb-1">
                  <span>
                    {cartSubtotal >= freeShippingThreshold
                      ? "✨ FREE Shipping Unlocked!"
                      : `Add ₹${(freeShippingThreshold - cartSubtotal).toLocaleString("en-IN")} more for FREE Shipping`}
                  </span>
                  <span className="font-mono text-zinc-500">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-black h-full transition-all duration-300 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length > 0 ? (
                  cart.map((item, idx) => (
                    <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${idx}`} className="flex gap-4 border-b border-zinc-100 pb-6">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-20 w-16 object-cover rounded-lg bg-zinc-100"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-black uppercase tracking-wide">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeCartItem?.(idx)}
                              className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-500 uppercase tracking-wider mt-0.5 font-mono">
                            Size: {item.selectedSize} • Color: {item.selectedColor}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateCartQty?.(idx, Math.max(1, item.quantity - 1))}
                              className="px-2 py-1 text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 py-1 text-xs font-mono font-bold text-black">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty?.(idx, item.quantity + 1)}
                              className="px-2 py-1 text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-black font-mono">
                            ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center space-y-4">
                    <ShoppingBag className="h-12 w-12 text-zinc-300 mx-auto stroke-[1]" />
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                      Your shopping bag is empty.
                    </p>
                    <button
                      onClick={() => {
                        setCartDrawerOpen(false);
                        setRoute("collections/all");
                      }}
                      className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      Explore Catalog
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-zinc-100 bg-white space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider text-black">
                    <span>Subtotal</span>
                    <span className="font-mono text-base">
                      ₹{cartSubtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono text-center">
                    Taxes and shipping calculated at checkout
                  </p>

                  <div className="space-y-2">
                    <button
                      id="cart-drawer-checkout"
                      onClick={() => {
                        setCartDrawerOpen(false);
                        setRoute("cart");
                      }}
                      className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-900 transition-all shadow-md cursor-pointer"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={() => {
                        setCartDrawerOpen(false);
                        setRoute("cart");
                      }}
                      className="w-full py-2.5 bg-zinc-100 text-zinc-800 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition-all cursor-pointer"
                    >
                      View Shopping Bag
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* WISHLIST MINI DRAWER */}
      {wishlistDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setWishlistDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-black stroke-[1.5]" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-black">
                    Your Wishlist ({wishlistCount})
                  </h3>
                </div>
                <button
                  id="wishlist-drawer-close"
                  onClick={() => setWishlistDrawerOpen(false)}
                  className="p-2 text-zinc-400 hover:text-black transition-colors rounded-full focus:outline-none cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Wishlist Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {wishlistProducts.length > 0 ? (
                  wishlistProducts.map((p) => (
                    <div key={p.id} className="flex gap-4 border-b border-zinc-100 pb-6">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-20 w-16 object-cover rounded-lg bg-zinc-100"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-black uppercase tracking-wide">
                              {p.name}
                            </h4>
                            <button
                              onClick={() => toggleWishlist?.(p)}
                              className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-500 uppercase tracking-wider mt-0.5 font-mono">
                            {p.category} • ₹{p.price.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            addToCart?.(p, p.colors[0]?.name || "Default", p.sizes[0] || "M");
                            toggleWishlist?.(p);
                          }}
                          className="mt-3 w-full py-2 bg-black text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" /> Move to Bag
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center space-y-4">
                    <Heart className="h-12 w-12 text-zinc-300 mx-auto stroke-[1]" />
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                      Your wishlist is empty.
                    </p>
                    <button
                      onClick={() => {
                        setWishlistDrawerOpen(false);
                        setRoute("collections/all");
                      }}
                      className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      Browse Catalog
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {wishlistProducts.length > 0 && (
                <div className="p-6 border-t border-zinc-100 bg-white">
                  <button
                    onClick={() => {
                      setWishlistDrawerOpen(false);
                      setRoute("wishlist");
                    }}
                    className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-900 transition-all shadow-md cursor-pointer"
                  >
                    View All Wishlist Items
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MENU ICON SIDE DRAWER */}
      {sideDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setSideDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-full max-w-md lg:max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
              
              {/* Drawer Top Header */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <button
                  onClick={() => {
                    setSideDrawerOpen(false);
                    setRoute("home");
                  }}
                  className="flex items-center cursor-pointer"
                  aria-label="CLINZA Home"
                >
                  <img
                    src="https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/logo%20n%20deisgn/clinza.png"
                    alt="CLINZA"
                    className="h-7 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <span className="hidden font-sans font-extrabold tracking-[0.25em] text-black text-2xl uppercase">
                    CLINZA
                  </span>
                </button>
                <button
                  id="side-drawer-close-btn"
                  onClick={() => setSideDrawerOpen(false)}
                  className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Close Drawer"
                >
                  <X className="h-6 w-6 stroke-[1.5]" />
                </button>
              </div>

              {/* Search Bar inside Drawer */}
              <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search European linen, denim..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSideDrawerOpen(false);
                        executeSearch(searchQuery);
                      }
                    }}
                    className="w-full bg-white border border-zinc-200 py-2.5 pl-10 pr-4 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:border-black"
                  />
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 stroke-[1.75]" />
                </div>
              </div>

              {/* Drawer Body Content */}
              <div className="p-6 flex-1 space-y-8">
                
                {/* SECTION 1: Navigation */}
                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.22em] text-zinc-400 uppercase font-mono mb-3">
                    Navigation
                  </h4>
                  <nav className="space-y-2">
                    {[
                      { name: "Home", route: "home" },
                      { name: "Shop", route: "collections/all" },
                      { name: "Collections", route: "collections" },
                      { name: "New Arrivals", route: "new-arrivals" },
                      { name: "Best Sellers", route: "trending" },
                      { name: "About Us", route: "about" },
                      { name: "Contact Us", route: "contact" }
                    ].map((nav) => {
                      const isColActive =
                        nav.route === "collections" &&
                        (currentRoute === "collections" ||
                          currentRoute === "/collections" ||
                          currentRoute.startsWith("collections/") ||
                          currentRoute.startsWith("/collections/") ||
                          currentRoute.startsWith("collection/") ||
                          currentRoute === "shop-all-collections");
                      return (
                        <button
                          key={nav.name}
                          onClick={() => {
                            setSideDrawerOpen(false);
                            setRoute(nav.route);
                          }}
                          className={`w-full text-left py-2.5 text-sm font-bold uppercase tracking-[0.14em] transition-colors flex justify-between items-center group cursor-pointer border-b border-zinc-50 ${
                            isColActive ? "text-[#F27D26]" : "text-zinc-900 hover:text-black"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {nav.name}
                            {isColActive && (
                              <span className="bg-[#F27D26]/10 text-[#F27D26] text-[10px] px-2 py-0.5 rounded-full font-mono">
                                ACTIVE
                              </span>
                            )}
                          </span>
                          <ArrowRight className={`h-4 w-4 transition-all ${isColActive ? "text-[#F27D26] translate-x-1" : "text-zinc-300 group-hover:text-black group-hover:translate-x-1"}`} />
                        </button>
                      );
                    })}

                    {/* Combo Shop CTA inside Navigation */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setSideDrawerOpen(false);
                          setRoute("collections/combos");
                        }}
                        className="w-full py-3 px-4 bg-black text-white text-xs font-bold uppercase tracking-[0.16em] rounded-[8px] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Gift className="h-4 w-4 text-white" />
                        <span>★ COMBO SHOP</span>
                      </button>
                    </div>
                  </nav>
                </div>

                {/* SECTION 2: Collections */}
                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.22em] text-zinc-400 uppercase font-mono mb-3">
                    Collections
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Premium Shirts", route: "collections/shirts" },
                      { name: "Linen Shirts", route: "collections/linen-shirts" },
                      { name: "Selvedge Jeans", route: "collections/jeans" },
                      { name: "Sartorial Pants", route: "collections/pants" },
                      { name: "Combo Sets", route: "collections/combos" },
                      { name: "Heavyweight Tees", route: "collections/all" }
                    ].map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setSideDrawerOpen(false);
                          setRoute(c.route);
                        }}
                        className="p-3 text-left bg-zinc-50 rounded-xl hover:bg-black hover:text-white transition-all text-xs font-semibold uppercase tracking-wider text-zinc-800 cursor-pointer"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SECTION 3: Categories */}
                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.22em] text-zinc-400 uppercase font-mono mb-3">
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "New Arrivals", route: "new-arrivals" },
                      { name: "Best Sellers", route: "trending" },
                      { name: "Resort Edit", route: "collections/linen-shirts" },
                      { name: "Limited Edition", route: "shop-all-collections" }
                    ].map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setSideDrawerOpen(false);
                          setRoute(cat.route);
                        }}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SECTION 4: Customer Service */}
                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.22em] text-zinc-400 uppercase font-mono mb-3">
                    Customer Service
                  </h4>
                  <div className="space-y-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        setRoute("track-order");
                      }}
                      className="w-full text-left py-1.5 hover:text-black transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Track Your Order</span>
                      <Package className="h-3.5 w-3.5 text-zinc-400" />
                    </button>
                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        setRoute("contact");
                      }}
                      className="w-full text-left py-1.5 hover:text-black transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Contact Support</span>
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    </button>
                  </div>
                </div>

                {/* SECTION 5: Policies */}
                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.22em] text-zinc-400 uppercase font-mono mb-3">
                    Policies
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        setRoute("policies");
                      }}
                      className="hover:text-black transition-colors cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        setRoute("policies");
                      }}
                      className="hover:text-black transition-colors cursor-pointer"
                    >
                      Terms of Service
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        setRoute("policies");
                      }}
                      className="hover:text-black transition-colors cursor-pointer"
                    >
                      Returns & Shipping
                    </button>
                  </div>
                </div>

                {/* SECTION 6: Newsletter */}
                <div className="p-5 bg-zinc-950 text-white rounded-2xl space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase">
                      CLINZA Atelier
                    </span>
                    <h5 className="text-xs font-bold uppercase tracking-[0.14em]">
                      Subscribe to Newsletter
                    </h5>
                    <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                      Receive exclusive invites to private drops and sartorial releases.
                    </p>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("Thank you for subscribing to CLINZA!");
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-white placeholder:text-zinc-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer shrink-0"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>

                {/* SECTION 7: Social Links */}
                <div>
                  <h4 className="text-[10px] font-bold tracking-[0.22em] text-zinc-400 uppercase font-mono mb-3">
                    Social Links
                  </h4>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-zinc-100 hover:bg-black hover:text-white rounded-full transition-all cursor-pointer text-zinc-800"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-zinc-100 hover:bg-black hover:text-white rounded-full transition-all cursor-pointer text-zinc-800"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                    <a
                      href="https://clinza.com"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-zinc-100 hover:bg-black hover:text-white rounded-full transition-all cursor-pointer text-zinc-800"
                      aria-label="Website"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 text-[11px] text-zinc-400 font-mono text-center">
                © 2026 CLINZA LUXURY FASHION. ALL RIGHTS RESERVED.
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

