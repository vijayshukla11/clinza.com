/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Heart, ShoppingBag, User, Menu, X, Landmark, ArrowRight, Clock, Trash2 } from "lucide-react";
import { Product, ProductCollection } from "../types";
import { getSearchHistory, addSearchHistory, clearSearchHistory, getProducts } from "../utils";

interface NavbarProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  cartCount: number;
  wishlistCount: number;
  onSearch: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  searchOpen: boolean;
}

export default function Navbar({
  currentRoute,
  setRoute,
  cartCount,
  wishlistCount,
  onSearch,
  setSearchOpen,
  searchOpen
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll event detector for sticky styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, [searchOpen]);

  // Handle instant search typing
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const allProducts = getProducts();
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(val.toLowerCase()) ||
      p.category.toLowerCase().includes(val.toLowerCase()) ||
      p.collection.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5);
    setSuggestions(filtered);
  };

  const executeSearch = (query: string) => {
    if (!query.trim()) return;
    addSearchHistory(query);
    onSearch(query);
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setRoute(`collections/all`);
  };

  const handleKeyPress = (e: React.KeyboardEventHTML) => {
    if (e.key === "Enter") {
      executeSearch(searchQuery);
    }
  };

  const selectSuggestion = (prod: Product) => {
    addSearchHistory(prod.name);
    setSearchOpen(false);
    setRoute(`product/${prod.slug}`);
  };

  const menuItems = [
    { name: "Home", route: "home" },
    { name: "Shop All Collections", route: "shop-all-collections" },
    { name: "Shirts", route: "collections/shirts" },
    { name: "Jeans", route: "collections/jeans" },
    { name: "Pants", route: "collections/pants" },
    { name: "New Arrivals", route: "new-arrivals" },
    { name: "Trending", route: "trending" },
    { name: "Blog", route: "blog" },
    { name: "Contact", route: "contact" }
  ];

  return (
    <header
      id="navbar-header"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <button
            id="nav-logo-btn"
            onClick={() => setRoute("home")}
            className="group flex items-center gap-1 focus:outline-none"
          >
            <span className="font-sans font-black tracking-tighter text-2xl text-gray-950 transition-colors uppercase">
              Clinza
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#F27D26] self-end mb-2 animate-pulse"></span>
          </button>
        </div>

        {/* CENTER MENU LINKS (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-8">
          {menuItems.map((item) => {
            const isActive = currentRoute === item.route;
            if (item.route === "shop-all-collections") {
              return (
                <button
                  id={`nav-link-${item.route}`}
                  key={item.route}
                  onClick={() => setRoute(item.route)}
                  className={`font-sans text-[10px] font-black uppercase tracking-widest transition-all px-3 py-2 border rounded-full focus:outline-none cursor-pointer flex items-center gap-1 bg-[#F27D26]/10 text-[#F27D26] border-[#F27D26] hover:bg-[#F27D26] hover:text-white hover:border-[#F27D26] animate-pulse`}
                >
                  {item.name}
                </button>
              );
            }
            return (
              <button
                id={`nav-link-${item.route}`}
                key={item.route}
                onClick={() => setRoute(item.route)}
                className={`font-sans text-[11px] font-semibold uppercase tracking-widest transition-all py-1.5 border-b focus:outline-none cursor-pointer ${
                  isActive ? "text-black border-black font-bold" : "text-gray-400 hover:text-black border-transparent"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* RIGHT ACTION ICONS */}
        <div className="flex items-center space-x-4 sm:space-x-5">
          {/* SEARCH BUTTON */}
          <button
            id="nav-search-button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1.5 text-gray-850 hover:text-gray-950 hover:bg-gray-50 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer"
            aria-label="Toggle Search"
          >
            <Search className="h-5 w-5 stroke-[2]" />
          </button>

          {/* WISHLIST ICON */}
          <button
            id="nav-wishlist-button"
            onClick={() => setRoute("wishlist")}
            className="p-1.5 text-gray-850 hover:text-gray-950 hover:bg-gray-50 rounded-full transition-colors relative focus:outline-none cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5 stroke-[2]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F27D26] text-[10px] text-white font-bold h-4 w-4 flex items-center justify-center rounded-full scale-100 animate-fade-in ring-2 ring-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* CART ICON */}
          <button
            id="nav-cart-button"
            onClick={() => setRoute("cart")}
            className="p-1.5 text-gray-850 hover:text-gray-950 hover:bg-gray-50 rounded-full transition-colors relative focus:outline-none cursor-pointer"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="h-5 w-5 stroke-[2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gray-950 text-[10px] text-white font-bold h-4 w-4 flex items-center justify-center rounded-full scale-100 animate-fade-in ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* MOBILE HAMBURGER TOGGLE */}
          <button
            id="nav-mobile-toggle-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-gray-850 hover:text-gray-950 hover:bg-gray-100 rounded-lg lg:hidden transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* FULL SCREEN SLIDEDOWN SEARCH DROPDOWN */}
      {searchOpen && (
        <div id="search-modal" className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl py-6 animate-slide-down z-40 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Search Input bar */}
            <div className="flex items-center border-b-2 border-gray-900 py-2">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input
                id="navbar-search-input"
                type="text"
                placeholder="Search premium linen, selvedge raw indigo, boots..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full bg-transparent border-none text-gray-900 focus:outline-none text-base font-medium placeholder-gray-450"
                autoFocus
              />
              <button
                id="search-clear-btn"
                onClick={() => handleSearchChange("")}
                className="p-1 text-gray-450 hover:text-gray-950 focus:outline-none cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Suggestions & Search History split layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              {/* Left Column: Instant Live Suggestions */}
              <div>
                <h4 className="text-[10px] font-bold tracking-widest text-gray-450 uppercase mb-3">
                  Instant Suggestions
                </h4>
                {suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.map((p) => (
                      <button
                        id={`suggestion-${p.id}`}
                        key={p.id}
                        onClick={() => selectSuggestion(p)}
                        className="w-full flex items-center gap-3 text-left p-1.5 hover:bg-gray-50 rounded transition-colors focus:outline-none group cursor-pointer"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-10 w-8 object-cover rounded bg-gray-100"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {p.category} • ₹{p.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 text-xs">
                    {searchQuery ? "No matching products found." : "Type above to explore our premium catalog."}
                  </div>
                )}
              </div>

              {/* Right Column: Search History */}
              <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-bold tracking-widest text-gray-450 uppercase">
                    Recent Searches
                  </h4>
                  {history.length > 0 && (
                    <button
                      id="clear-history-btn"
                      onClick={() => {
                        clearSearchHistory();
                        setHistory([]);
                      }}
                      className="text-[10px] text-red-500 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" /> Clear History
                    </button>
                  )}
                </div>
                {history.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {history.map((q) => (
                      <button
                        id={`history-item-${q}`}
                        key={q}
                        onClick={() => {
                          setSearchQuery(q);
                          executeSearch(q);
                        }}
                        className="flex items-center gap-1 text-xs text-gray-750 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all cursor-pointer"
                      >
                        <Clock className="h-3 w-3 text-gray-400" />
                        {q}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No search history recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MENU TRAY */}
      {mobileMenuOpen && (
        <div id="mobile-menu-tray" className="fixed inset-0 top-[60px] bg-white z-30 lg:hidden px-6 py-8 overflow-y-auto animate-fade-in border-t border-gray-100">
          {/* Quick search input */}
          <div className="relative mb-8">
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search clinza catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && executeSearch(searchQuery)}
              className="w-full bg-gray-50 border border-gray-250 py-3 pl-11 pr-4 rounded-xl focus:outline-none text-sm text-gray-900 font-medium"
            />
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-450" />
          </div>

          <nav className="flex flex-col space-y-5">
            {menuItems.map((item) => {
              const isActive = currentRoute === item.route;
              if (item.route === "shop-all-collections") {
                return (
                  <button
                    id={`mobile-nav-${item.route}`}
                    key={item.route}
                    onClick={() => {
                      setRoute(item.route);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left font-sans text-sm font-black uppercase tracking-widest border-b border-gray-50 pb-3 transition-colors text-[#F27D26] animate-pulse`}
                  >
                    🔥 {item.name}
                  </button>
                );
              }
              return (
                <button
                  id={`mobile-nav-${item.route}`}
                  key={item.route}
                  onClick={() => {
                    setRoute(item.route);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left font-sans text-sm font-bold uppercase tracking-widest border-b border-gray-50 pb-3 transition-colors ${
                    isActive ? "text-[#F27D26]" : "text-gray-800 hover:text-gray-950"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
            <button
              id="mobile-nav-user"
              onClick={() => {
                setRoute("admin");
                setMobileMenuOpen(false);
              }}
              className="text-left font-sans text-sm font-bold uppercase tracking-widest text-gray-800 hover:text-gray-950 flex items-center gap-2 cursor-pointer pb-3 border-b border-gray-50"
            >
              <User className="h-4 w-4" /> Admin Portal
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
