/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  MapPin, 
  Truck, 
  Award, 
  ShieldCheck, 
  Flame, 
  Star, 
  TrendingUp, 
  Package, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  HelpCircle, 
  UserCheck, 
  Check, 
  ShoppingBag, 
  Shirt, 
  Grid, 
  Zap, 
  HelpCircle as FaqIcon, 
  FileText 
} from "lucide-react";
import { Product, BlogPost } from "../types";
import { getProducts, getBlogs } from "../utils";
import ProductCard from "./ProductCard";

interface ShopAllCollectionsPageProps {
  onAddToCart: (product: Product, color: string, size: string, quantity?: number) => void;
  onAddToWishlist: (product: Product) => void;
  wishlistIds: string[];
  onOpenQuickView: (product: Product) => void;
  setRoute: (route: string) => void;
}

export default function ShopAllCollectionsPage({
  onAddToCart,
  onAddToWishlist,
  wishlistIds,
  onOpenQuickView,
  setRoute
}: ShopAllCollectionsPageProps) {
  // Database retrieval
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number>(3999);
  const [filterNewArrivals, setFilterNewArrivals] = useState<boolean>(false);
  const [filterTrending, setFilterTrending] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");

  // FAQs Expandable States
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Targets for scrolling
  const productsSectionRef = useRef<HTMLDivElement>(null);
  const collectionsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Collect 30 products dynamically or fall back
    const prods = getProducts();
    setAllProducts(prods);
    setFilteredProducts(prods);

    // Collect high-fidelity blog posts
    const b = getBlogs();
    setBlogs(b);
  }, []);

  // Multi-criteria active cascading filtering engine
  useEffect(() => {
    let result = [...allProducts];

    // Filter by main product category
    if (selectedCategory !== "all") {
      result = result.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || p.collection.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Shopify collection definitions
    if (selectedCollection !== "all") {
      if (selectedCollection === "premium-linen") {
        result = result.filter(p => p.category.toLowerCase().includes("linen") || p.description.toLowerCase().includes("linen"));
      } else if (selectedCollection === "shirts") {
        result = result.filter(p => p.collection.toLowerCase() === "shirts");
      } else if (selectedCollection === "jeans") {
        result = result.filter(p => p.collection.toLowerCase() === "jeans");
      } else if (selectedCollection === "pants") {
        result = result.filter(p => p.collection.toLowerCase() === "pants");
      } else if (selectedCollection === "trending") {
        result = result.filter(p => p.isTrending);
      } else if (selectedCollection === "new-arrivals") {
        result = result.filter(p => p.isNewArrival);
      } else if (selectedCollection === "co-ord") {
        result = result.filter(p => p.category.toLowerCase().includes("combo") || p.name.toLowerCase().includes("co-ord") || p.name.toLowerCase().includes("set"));
      } else {
        result = result.filter(p => p.category.toLowerCase().includes(selectedCollection) || p.description.toLowerCase().includes(selectedCollection));
      }
    }

    // Filter by price range slider
    result = result.filter(p => p.price <= priceRange);

    // Filter by New arrivals toggle checkbox
    if (filterNewArrivals) {
      result = result.filter(p => p.isNewArrival);
    }

    // Filter by Trending toggle checkbox
    if (filterTrending) {
      result = result.filter(p => p.isTrending);
    }

    // Custom sorting routines
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "discount") {
      result.sort((a, b) => {
        const discA = a.originalPrice - a.price;
        const discB = b.originalPrice - b.price;
        return discB - discA;
      });
    }

    setFilteredProducts(result);
  }, [allProducts, selectedCategory, selectedCollection, priceRange, filterNewArrivals, filterTrending, sortBy]);

  const scrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToCollections = () => {
    collectionsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCollectionSelect = (slug: string) => {
    setSelectedCollection(slug);
    scrollToProducts();
  };

  const faqs = [
    {
      q: "Where is Clinza's premium organic linen sourced?",
      a: "All of our linen premium collections are organically harvested from long-staple flax fields across Normandy, Northern France. The flax fibers undergo strict ecological inspection before being shipped to Mumbai, where we weave and stitch using vintage precision loom frameworks for maximum structural longevity, airy draping and soft temperature regulation."
    },
    {
      q: "What payment options are accepted, and is Cash on Delivery free?",
      a: "We offer 100% free shipping and Cash on Delivery (COD) services across all active zones in India. You can inspect your wrapped garment directly at your doorstep and pay via cash or UPI to our logistical partner securely. UPI and credit card prepayments are also supported with extra security layers."
    },
    {
      q: "How does the easy 7-day sizing exchange program function?",
      a: "If your tailored clothes need custom calibrated fitting adjustments, simply submit an exchange prompt via email or our floating WhatsApp desk. We will coordinate a reverse-pickup associate directly to your doorstep inside 48 hours to exchange tags securely and send your ideal calibrated size at zero premium."
    },
    {
      q: "Can I customize sizing coordinates like sleeve lengths?",
      a: "Yes! Simply click our floating WhatsApp assistance button to talk directly to a professional brand stylist. We provide manual custom tailoring options, cuff alterations, and matching styling recommendations tailored exactly to your body shape profile."
    },
    {
      q: "How can I track my Order status live?",
      a: "Every transaction generates a discrete tracking waybill (e.g. CLN-1002). You can enter this identifier on our interactive Track Order page alongside your phone number to receive real-time package coordination logs linked directly to Delhivery, Shiprocket, or BlueDart network routing APIs."
    }
  ];

  // Static collections master data
  const premiumCollections = [
    {
      id: "premium-linen",
      title: "Premium Linen Luxe",
      description: "Heavyweight Normandy flax threads loomed for airy, refined sophistication.",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
      itemCount: "12 Garments",
      badge: "SARTORIAL HERITAGE"
    },
    {
      id: "shirts",
      title: "Classic Spread Shirts",
      description: "Crisp spread-collars, mother-of-pearl buttons and tailored flat-felled stitches.",
      image: "https://images.unsplash.com/photo-1620012253295-c05518e99351?auto=format&fit=crop&q=80&w=800",
      itemCount: "10 Garments",
      badge: "CURATED ATELIER"
    },
    {
      id: "jeans",
      title: "Vintage Selvedge Jeans",
      description: "13.5 oz raw redline shuttle-woven Japanese denim made to custom model your stance.",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800",
      itemCount: "6 Garments",
      badge: "HEAVY-SPEC CRAFT"
    },
    {
      id: "pants",
      title: "Sartorial Pleated Pants",
      description: "Double pleated, tailored trousers offering generous strides and crease drapes.",
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800",
      itemCount: "8 Garments",
      badge: "MODERN OFFICE"
    },
    {
      id: "new-arrivals",
      title: "New Indigo Drop",
      description: "Freshly loomed autumn coordinates calibrated for everyday confidence.",
      image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800",
      itemCount: "14 Garments",
      badge: "LATEST RELEASE"
    },
    {
      id: "trending",
      title: "The Coveted Circle",
      description: "Critically-acclaimed silhouettes selected by verified sartorial wearers.",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
      itemCount: "9 Garments",
      badge: "BEST SELLERS"
    }
  ];

  return (
    <div id="shop-all-collections-page" className="bg-zinc-50 font-sans text-left min-h-screen pb-10 sm:pb-12 selection:bg-[#F27D26] selection:text-white animate-fade-in">
      
      {/* SECTION 1: PREMIUM HERO BANNER & SHORT DESCRIPTION */}
      <section id="luxury-landing-hero" className="relative w-full overflow-hidden bg-white border-b border-gray-200 py-10 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6 lg:pr-6">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#F27D26] uppercase font-mono px-4 py-1.5 rounded-none bg-orange-500/5 border border-orange-200 inline-block">
              International Luxury Standards
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-950 uppercase leading-none font-sans">
              Premium Fashion. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-950 via-[#F27D26] to-orange-750">
                Timeless Style.
              </span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm font-light leading-relaxed max-w-lg">
              Discover Clinza's complete collection of premium shirts, jeans, pants, co-ord sets and fashion essentials crafted for modern India. Spun from Normandy flaxes and antique Japanese shuttle loom indigo blocks. Beautiful, clean wardrobe classics that value substance over speed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4 font-sans">
              <button
                id="hero-scroll-collections"
                onClick={scrollToProducts}
                className="bg-black hover:bg-[#F27D26] text-white hover:text-black px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-none text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                Shop All Products
                <ArrowRight className="h-4.5 w-4.5 animate-pulse" />
              </button>
              <button
                id="hero-scroll-products"
                onClick={scrollToCollections}
                className="bg-white hover:bg-zinc-50 text-black px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 cursor-pointer border border-black rounded-none"
              >
                Browse Departments
              </button>
            </div>

            {/* Quick trust strip */}
            <div className="pt-6 border-t border-gray-200 flex items-center gap-6 text-zinc-500 text-[10px] sm:text-xs">
              <div className="flex items-center gap-1.5 font-sans">
                <Check className="h-4 w-4 text-[#F27D26]" /> Fast Free COD
              </div>
              <div className="flex items-center gap-1.5 font-sans">
                <Check className="h-4 w-4 text-[#F27D26]" /> 7 Day Quick Swap
              </div>
              <div className="flex items-center gap-1.5 font-sans">
                <Check className="h-4 w-4 text-[#F27D26]" /> Normandy Flax
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative bg-zinc-100 rounded-none border border-zinc-200 overflow-hidden leading-none h-full">
            <div className="aspect-[4/3] rounded-none overflow-hidden bg-gray-100 group">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200" 
                alt="CLINZA Editorial Campaign Model"
                className="w-full h-full object-cover grayscale opacity-95 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 text-white text-left">
                <p className="font-mono text-[9px] font-bold tracking-widest text-[#F27D26] uppercase">Active Lookbook 2026</p>
                <h4 className="font-bold text-lg leading-tight uppercase font-serif">Aura de Normandy Linen</h4>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: NEWLY CURATED FEATURED PRODUCTS (As requested in structure sequence) */}
      <section id="luxury-featured-products-catalog" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-white text-left border-b border-zinc-200">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-zinc-200 pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between">
            <div className="max-w-xl text-left">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#F27D26] uppercase font-bold mb-1.5 block font-sans">
                The Selected Masterpieces
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-gray-950 uppercase">
                Featured Products
              </h2>
            </div>
            <p className="text-[#F27D26] font-mono text-xs tracking-wider mt-2 sm:mt-0 font-bold">
              [ CURATED SELECTIONS ]
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {allProducts.filter(p => p.isTrending || p.isNewArrival).slice(0, 4).map((prod) => (
              <ProductCard
                key={`featured-${prod.id}`}
                product={prod}
                onProductClick={(p) => setRoute(`product/${p.slug}`)}
                onAddToWishlist={onAddToWishlist}
                onAddToCart={onAddToCart}
                wishlistIds={wishlistIds}
                onOpenQuickView={onOpenQuickView}
                setRoute={setRoute}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: ALL PRODUCTS SHOWCASE & FILTERING ENGINE */}
      <section ref={productsSectionRef} id="all-products-inventory-engine" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Clean, elegant header section */}
          <div className="text-center border-b border-zinc-200 pb-5 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#F27D26] uppercase font-semibold mb-1.5 block font-sans">
              Our Curated Pieces
            </span>
            <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-gray-950 uppercase">
              All Products
            </h2>
            {selectedCollection !== "all" || selectedCategory !== "all" ? (
              <p className="text-gray-550 text-xs sm:text-sm font-light leading-relaxed max-w-xl mx-auto flex items-center justify-center gap-2 mt-2 font-sans">
                <span>Showing coordinates in <strong className="text-gray-950 font-bold uppercase">{selectedCollection !== "all" ? selectedCollection.replace("-", " ") : selectedCategory}</strong>.</span>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedCollection("all");
                  }}
                  className="text-[#F27D26] hover:underline font-bold uppercase text-[10px] tracking-wider ml-1"
                >
                  [ Clear Filter × ]
                </button>
              </p>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm font-light leading-relaxed mt-2 font-sans">
                Explore our full line of carefully tailored wardrobe pieces, engineered with extreme comfort and premium French flax threads for modern confidence.
              </p>
            )}
          </div>

          {/* DYNAMIC FILTER TOOLBAR */}
          <div className="bg-white border border-zinc-200 p-4 sm:p-6 rounded-none shadow-none space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Category selector row */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[280px]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mr-2">Category:</span>
                {["all", "shirts", "jeans", "pants", "combos", "accessories"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors rounded-none border ${
                      selectedCategory === cat 
                        ? "bg-black text-white border-black" 
                        : "bg-zinc-50 text-zinc-650 border-zinc-200 hover:border-black"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Price range and check filters */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-1 px-2 border border-zinc-200 bg-white text-[10px] font-mono text-zinc-700 outline-none uppercase tracking-widest rounded-none hover:border-black cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-zinc-150 gap-4">
              {/* Checkboxes */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterNewArrivals}
                    onChange={(e) => setFilterNewArrivals(e.target.checked)}
                    className="accent-[#F27D26] h-3.5 w-3.5 cursor-pointer rounded-none border-zinc-300"
                  />
                  New Releases
                </label>
                <label className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterTrending}
                    onChange={(e) => setFilterTrending(e.target.checked)}
                    className="accent-[#F27D26] h-3.5 w-3.5 cursor-pointer rounded-none border-zinc-300"
                  />
                  Trending Now
                </label>
              </div>

              {/* Price slider */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Max Price:</span>
                <input
                  type="range"
                  min="999"
                  max="3999"
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="accent-[#F27D26] h-1.5 w-24 sm:w-32 bg-zinc-200 rounded-none cursor-pointer"
                />
                <span className="text-[10px] font-mono font-bold text-zinc-950">₹{priceRange.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* ACTIVE GRID RENDER */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onProductClick={(p) => setRoute(`product/${p.slug}`)}
                  onAddToWishlist={onAddToWishlist}
                  onAddToCart={onAddToCart}
                  wishlistIds={wishlistIds}
                  onOpenQuickView={onOpenQuickView}
                  setRoute={setRoute}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-none border border-zinc-200 space-y-4">
              <Package className="h-8 w-8 text-zinc-300 mx-auto" />
              <p className="text-gray-950 text-xs font-bold uppercase tracking-wider">
                No garments match this filter node
              </p>
              <p className="text-zinc-400 text-[11px] max-w-sm mx-auto leading-relaxed font-light">
                Please calibrate your filters or reset the capping parameters to explore our French Normandy flax or Japanese shuttle loom coordinates.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedCollection("all");
                  setPriceRange(3999);
                  setFilterNewArrivals(false);
                  setFilterTrending(false);
                  setSortBy("featured");
                }}
                className="bg-zinc-950 text-white font-sans text-xs font-bold uppercase tracking-widest px-6 py-3.5 hover:bg-[#F27D26] transition-colors cursor-pointer rounded-none animate-pulse"
              >
                Reset Catalog Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: RELATED COLLECTIONS (Bento departments, as requested downstream of All Products) */}
      <section ref={collectionsSectionRef} id="collection-showcase-bento" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-white text-left border-b border-zinc-200">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          <div className="border-b border-zinc-200 pb-4">
            <div className="max-w-xl text-left space-y-1">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#F27D26] uppercase font-bold mb-1.5 block font-sans">
                Architectural Curations
              </span>
              <h2 className="text-2xl sm:text-3.5xl font-sans font-black tracking-tight text-gray-950 uppercase">
                Explore Collections
              </h2>
            </div>
            <p className="text-gray-550 font-light text-xs sm:text-sm max-w-xl mt-2 leading-relaxed">
              Meticulously designed clothing wardrobes. Tap any department to dynamically trigger and view verified coordinates inside our interactive database viewer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumCollections.map((col) => (
              <div 
                key={col.id}
                className="group bg-white rounded-none overflow-hidden border border-zinc-200 hover:border-black transition-all duration-300 flex flex-col justify-between"
              >
                {/* Collection image container with slight zoom */}
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                  <img 
                    src={col.image} 
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-all duration-700 ease-out"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-zinc-950 text-white font-mono text-[8px] font-black tracking-widest px-2.5 py-1 uppercase">
                    {col.badge}
                  </div>
                </div>

                {/* Info and action panel */}
                <div className="p-5 flex flex-col justify-between flex-1 border-t border-zinc-100">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="text-sm font-sans font-bold text-gray-950 uppercase tracking-tight">
                        {col.title}
                      </h3>
                      <span className="text-[9px] font-bold text-[#F27D26] font-mono uppercase bg-orange-550/5 px-2 py-0.5 border border-orange-550/10">
                        {col.itemCount}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs font-light leading-relaxed mb-4">
                      {col.description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleCollectionSelect(col.id)}
                    className="w-full bg-zinc-950 hover:bg-[#F27D26]/10 hover:text-[#F27D26] text-white hover:border-[#F27D26] font-sans text-[10px] font-bold uppercase tracking-widest py-3.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5 rounded-none border border-zinc-950"
                  >
                    <span>Shop Collection</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 5: WHY CHOOSE CLINZA */}
      <section id="why-choose-clinza-excellence" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50 text-left text-zinc-950 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          <div className="border-b border-zinc-200 pb-4 text-center">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#F27D26] uppercase font-bold mb-1.5 block font-sans">
              Outstanding Sartorial Standards
            </span>
            <h2 className="text-2xl sm:text-3.5xl font-sans font-black tracking-tight text-gray-950 uppercase">
              Why Choose Clinza
            </h2>
            <p className="text-gray-550 font-light text-xs sm:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
              At CLINZA, we approach dressmaking with botanical and physical precision, delivering garments that age elegantly while holding shape integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-zinc-200 p-6 rounded-none space-y-3 bg-white hover:border-black transition-colors">
              <div className="h-10 w-10 bg-[#F27D26]/5 text-[#F27D26] rounded-none flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-gray-950 font-sans">Premium Fabric</h3>
              <p className="text-zinc-500 text-xs leading-relaxed font-light">
                Normandy Flax Linen and raw long-staple organic cotton. Beautiful, distinct texture profiles providing maximum thermal ease for Indian skies next to none.
              </p>
            </div>

            <div className="border border-zinc-200 p-6 rounded-none space-y-3 bg-white hover:border-black transition-colors">
              <div className="h-10 w-10 bg-zinc-100 text-zinc-950 rounded-none flex items-center justify-center">
                <Shirt className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-gray-950 font-sans">Expert Craftsmanship</h3>
              <p className="text-zinc-500 text-xs leading-relaxed font-light">
                Tailored flat-felled double stitching line locks, verified mother-of-pearl buttons and clean cuffs stitched to block physical sagging or textile decay.
              </p>
            </div>

            <div className="border border-zinc-200 p-6 rounded-none space-y-3 bg-white hover:border-black transition-colors">
              <div className="h-10 w-10 bg-[#F27D26]/5 text-[#F27D26] rounded-none flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-gray-950 font-sans">Modern Designs</h3>
              <p className="text-zinc-500 text-xs leading-relaxed font-light">
                Clean minimalist drapes, classic drapes, classic band/spread collar layouts and custom-calibrated color dyes formulated with skin-safe organic pigments.
              </p>
            </div>

            <div className="border border-zinc-200 p-6 rounded-none space-y-3 bg-white hover:border-black transition-colors">
              <div className="h-10 w-10 bg-zinc-100 text-gray-900 rounded-none flex items-center justify-center">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-gray-950 font-sans">Perfect Fit</h3>
              <p className="text-zinc-500 text-xs leading-relaxed font-light">
                Meticulously proportioned sizes modeled dynamically. We calibrate our cuts specifically matching modern everyday stances with absolute confidence.
              </p>
            </div>

            <div className="border border-zinc-200 p-6 rounded-none space-y-3 bg-white hover:border-black transition-colors">
              <div className="h-10 w-10 bg-[#F27D26]/5 text-[#F27D26] rounded-none flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-gray-950 font-sans">Secure Checkout</h3>
              <p className="text-zinc-500 text-xs leading-relaxed font-light">
                No advanced cash stakes required. Confirm ordering tickets with Cash On Delivery (COD) booking and verify your parcel before release of payments.
              </p>
            </div>

            <div className="border border-zinc-200 p-6 rounded-none space-y-3 bg-white hover:border-black transition-colors">
              <div className="h-10 w-10 bg-zinc-100 text-zinc-950 rounded-none flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-gray-950 font-sans">Fast Delivery</h3>
              <p className="text-zinc-500 text-xs leading-relaxed font-light">
                Expedited logistics dispatching from our integrated Mumbai hub centers with protective premium wrapping to preserve garment sanitization.
              </p>
            </div>
          </div>

        </div>
      </section>
      {/* SECTION 6: OUR QUALITY PROMISE (Sartorial Promise) */}
      <section id="clinza-editorial-promise" className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 relative aspect-video lg:aspect-[4/3] rounded-none overflow-hidden border border-white/10 bg-zinc-900 leading-none">
            <img 
              src="https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800" 
              alt="Japanese antique loomer shuttling premium denims"
              className="h-full w-full object-cover grayscale opacity-90 hover:opacity-100 hover:scale-102 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-black tracking-widest text-[#F27D26] uppercase font-mono bg-white/5 border border-white/10 px-4 py-1.5 inline-block rounded-none font-sans">
              Loom & Fiber Protocols
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-sans leading-none">
              OUR SARTORIAL PROMISE
            </h2>
            <div className="space-y-4 text-zinc-405 text-xs sm:text-sm font-light leading-relaxed font-sans">
              <p>
                At Clinza, every product is designed with attention to detail, premium materials, and modern craftsmanship. Our mission is to provide stylish, comfortable and affordable fashion for customers who value quality.
              </p>
              <p>
                We outright reject the shortcut framework of fast-fashion cycles that employ chemical polyester blends and flimsy loose stitching. By treating every fabric piece as an architectural design problem, we ensure you receive pristine, skin-safe clothing that endures countless washings without fading or stretching.
              </p>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-none border border-white/5 space-y-1">
                <p className="text-lg font-black text-[#F27D26] font-mono leading-none">100%</p>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">France Crop Flax</p>
              </div>
              <div className="bg-white/5 p-4 rounded-none border border-white/5 space-y-1">
                <p className="text-lg font-black text-[#F27D26] font-mono leading-none">ZERO</p>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">Polyester Resins</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7: SHOPPING BENEFITS */}
      <section id="shopping-benefits-row" className="py-12 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="flex items-center gap-4 text-left p-4 rounded-none border border-transparent hover:border-zinc-200 hover:bg-zinc-50 transition-all">
              <div className="h-10 w-10 bg-orange-50 text-[#F27D26] rounded-none flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-tight text-gray-950 font-sans">Free Shipping</h4>
                <p className="text-[10px] text-gray-550 font-light font-sans">Prompt parcel drops pan-India</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left p-4 rounded-none border border-transparent hover:border-zinc-200 hover:bg-zinc-50 transition-all">
              <div className="h-10 w-10 bg-zinc-100 text-gray-950 rounded-none flex items-center justify-center shrink-0">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-tight text-gray-950 font-sans">Easy Returns</h4>
                <p className="text-[10px] text-gray-550 font-light font-sans">7 Days stress-free sizing swap</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left p-4 rounded-none border border-transparent hover:border-zinc-200 hover:bg-zinc-50 transition-all">
              <div className="h-10 w-10 bg-orange-50 text-[#F27D26] rounded-none flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-tight text-gray-950 font-sans">Secure Payments</h4>
                <p className="text-[10px] text-gray-550 font-light font-sans">100% Secure doorstep UPI or Cash</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left p-4 rounded-none border border-transparent hover:border-zinc-200 hover:bg-zinc-50 transition-all">
              <div className="h-10 w-10 bg-zinc-100 text-gray-950 rounded-none flex items-center justify-center shrink-0">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-tight text-gray-950 font-sans">Premium Support</h4>
                <p className="text-[10px] text-gray-550 font-light font-sans">Always-on personal WhatsApp stylist</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 8: CUSTOMER TRUST COUNTER SECTION */}
      <section id="trust-metrics-counters" className="py-10 sm:py-12 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-black tracking-widest text-[#F27D26] uppercase font-mono font-sans">Clinza Customer Census</span>
            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-950 font-sans">VERIFIED METRIC AUDITING</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white border border-zinc-200 p-6 rounded-none shadow-none space-y-1.5 hover:border-black transition-colors">
              <span className="text-2xl sm:text-3xl font-bold text-[#F27D26] font-mono block">50,000+</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block font-sans">Verified Customers</span>
            </div>
            <div className="bg-white border border-zinc-200 p-6 rounded-none shadow-none space-y-1.5 hover:border-black transition-colors">
              <span className="text-2xl sm:text-3xl font-bold text-gray-950 font-mono block">120,000+</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block font-sans">Tailored Pieces Sold</span>
            </div>
            <div className="bg-white border border-zinc-200 p-6 rounded-none shadow-none space-y-1.5 hover:border-black transition-colors">
              <span className="text-2xl sm:text-3xl font-bold text-[#F27D26] font-mono block">99.4%</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block font-sans">Design Happiness Rate</span>
            </div>
            <div className="bg-white border border-zinc-200 p-6 rounded-none shadow-none space-y-1.5 hover:border-black transition-colors">
              <span className="text-2xl sm:text-3xl font-bold text-gray-950 font-mono block">45%</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block font-sans">Seasonal Repeat Orders</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: BLOG & STYLE GUIDE */}
      <section id="stylebook-blogs-editorial" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-white text-left border-b border-zinc-200">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-4">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#F27D26] uppercase font-mono block mb-1 font-sans">Textile Journal</span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-950 font-sans">CLINZA STYLE & CULTURE</h2>
            </div>
            <button
              onClick={() => setRoute("blog")}
              className="text-xs font-bold uppercase tracking-wider text-[#F27D26] hover:underline flex items-center gap-1 cursor-pointer font-mono"
            >
              Enter Publication Room <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.slice(0, 3).map((post) => (
              <div 
                key={post.id} 
                onClick={() => setRoute(`blog`)}
                className="group border border-zinc-200 rounded-none overflow-hidden hover:border-black transition-all duration-300 bg-zinc-50/20 cursor-pointer text-left flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100 border-b border-zinc-200 leading-none">
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-550"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-6 space-y-2">
                    <span className="text-[9px] font-bold tracking-widest text-[#F27D26] uppercase font-mono block font-sans">
                      {post.category} • {post.readTime}
                    </span>
                    <h4 className="text-base font-sans font-bold text-gray-950 uppercase tracking-tight leading-tight group-hover:text-[#F27D26] transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-zinc-500 text-xs font-light line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-950 group-hover:underline inline-flex items-center gap-1">
                    Read Article <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 10: EXPANDABLE FAQ SECTION */}
      <section id="cliza-comprehensive-faq" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-b border-zinc-200 text-left">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          
          <div className="text-center border-b border-zinc-200 pb-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono tracking-widest text-[#F27D26] uppercase font-black mb-1 block font-sans">
              Immediate Reference
            </span>
            <h2 className="text-2xl sm:text-3xl font-sans font-black uppercase tracking-tight text-gray-950">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm font-light leading-relaxed mt-2 font-sans">
              Everything you need to verify our premium French flax sourcing, COD delivery logistics, or sizes.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-white border border-zinc-200 rounded-none overflow-hidden transition-colors hover:border-black"
                >
                  <button
                    id={`faq-toggle-btn-${index}`}
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left focus:outline-none cursor-pointer hover:bg-zinc-50/50"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-gray-950 uppercase tracking-tight pr-4 font-sans">
                      {faq.q}
                    </span>
                    <span className={`h-6 w-6 rounded-none bg-zinc-100 flex items-center justify-center shrink-0 text-gray-950 transition-transform duration-300 ${isOpen ? "rotate-180 bg-[#F27D26] text-white" : ""}`}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-zinc-500 font-light leading-relaxed border-t border-zinc-100 pt-4 animate-fade-in font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 11: FINAL CTA CALL-TO-ACTION */}
      <section id="luxury-promotional-cta" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950 text-white text-center relative overflow-hidden">
        
        {/* Abstract design vector layers */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="text-[10px] font-black tracking-widest text-[#F27D26] uppercase font-mono bg-white/5 border border-white/10 px-4 py-1.5 rounded-none inline-block font-sans">
            Elevating Modern India Since 2026
          </span>
          
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none font-sans">
            Ready To Upgrade <br />
            Your Wardrobe?
          </h2>

          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed font-sans">
            Explore Clinza's complete collection and discover premium fashion designed for everyday confidence. Enjoy free shipping and safe Cash On Delivery directly at checkout.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 font-sans">
            <button
              id="cta-buy-all"
              onClick={scrollToProducts}
              className="bg-[#F27D26] hover:bg-white text-white hover:text-black px-8 py-4 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-none"
            >
              Shop All Products
            </button>
            <button
              id="cta-explore-dep"
              onClick={scrollToCollections}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-none"
            >
              Shop Collections
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
