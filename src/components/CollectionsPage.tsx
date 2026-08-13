/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  ChevronRight, 
  Package, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Award, 
  Shirt, 
  Layers, 
  Zap, 
  CheckCircle2, 
  ShoppingBag,
  ExternalLink
} from "lucide-react";
import { CollectionsService, CollectionItem, ProductsService } from "../services/supabaseService";
import { Product } from "../types";
import { isProductInCollection } from "../utils/productMatcher";

interface CollectionsPageProps {
  setRoute: (route: string) => void;
  onAddToCart?: (product: Product, color: string, size: string, quantity?: number) => void;
  onAddToWishlist?: (product: Product) => void;
  wishlistIds?: string[];
  onOpenQuickView?: (product: Product) => void;
}

export default function CollectionsPage({ setRoute }: CollectionsPageProps) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [cols, prods] = await Promise.all([
          CollectionsService.getAll(),
          ProductsService.getAll()
        ]);

        if (isMounted) {
          // Filter active collections and sort by display_order ascending
          const activeCols = (cols || [])
            .filter((c) => c.isActive !== false)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

          setCollections(activeCols);
          setAllProducts(prods || []);
        }
      } catch (e) {
        console.error("CollectionsPage data fetch error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    // SEO setup
    document.title = "Collections | CLINZA Luxury Atelier";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Explore Clinza's complete range of active clothing collections crafted with European Normandy flax and precision tailoring."
      );
    }

    // Automatic real-time listener for CMS updates
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("clinza_collections_updated", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("clinza_collections_updated", handleUpdate);
    };
  }, []);

  const getProductCount = (collectionSlugOrId: string): number => {
    if (!collectionSlugOrId) return allProducts.length;

    const colObj = collections.find(c => c.slug === collectionSlugOrId || c.id === collectionSlugOrId);
    const count = allProducts.filter(p => isProductInCollection(p, collectionSlugOrId, colObj)).length;

    return count;
  };

  return (
    <div id="collections-listing-page" className="bg-[#FAFAF8] min-h-screen text-left font-sans text-[#111111] animate-fade-in pb-16">
      
      {/* BREADCRUMB HEADER */}
      <div id="collections-hero-header" className="bg-white border-b border-[#ECECEC] py-4 sm:py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            <button
              onClick={() => setRoute("home")}
              className="hover:text-[#5B1824] transition-colors cursor-pointer font-bold"
            >
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#5B1824] font-extrabold">All Collections</span>
          </nav>
        </div>
      </div>

      {/* BIG COLLECTION POSTER BANNER - CLEAN POSTER IMAGE (NO TEXT OVERLAY) */}
      <section id="big-collection-poster-banner" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-lg bg-stone-100 group">
          <img
            src="https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/collections/collections/collections.png"
            alt="Clinza Collections Poster"
            className="w-full h-auto object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 ease-out"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* COLLECTIONS GRID CONTAINER (1-1 ON MOBILE, 2-2 ON DESKTOP WITH UNIQUE CARDS & ANIMATED BUTTONS) */}
      <section id="collections-grid-section" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        
        {/* Section Title */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between border-b border-stone-200/80 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-amber-800 block mb-1">
              EXPLORE WARDROBE DEPARTMENTS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold uppercase tracking-tight text-zinc-900">
              Curated Collections
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-stone-500 uppercase tracking-widest mt-2 sm:mt-0">
            {collections.length} ACTIVE DEPARTMENTS
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="h-8 w-8 border-2 border-[#5B1824] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase font-mono tracking-widest text-zinc-500 font-bold animate-pulse">
              Synchronizing Collections CMS...
            </p>
          </div>
        ) : collections.length === 0 ? (
          <div className="py-20 text-center bg-white border border-stone-200 rounded-2xl p-8 max-w-lg mx-auto space-y-4 shadow-sm">
            <Package className="h-10 w-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
              No Collections Currently Active
            </h3>
            <p className="text-xs text-zinc-500 font-light leading-relaxed">
              New wardrobe collections are currently being curated in our atelier. Please check back soon or explore our full product catalogue.
            </p>
            <button
              onClick={() => setRoute("collections/all")}
              className="bg-[#5B1824] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-black transition-colors cursor-pointer shadow-md"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          /* UNIQUE CARD GRID: 1-1 ON MOBILE (grid-cols-1), 2-2 ON DESKTOP (md:grid-cols-2) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {collections.map((col, idx) => {
              const displayImg =
                col.thumbnail || col.banner || col.image || "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png";
              const title = col.name;
              const itemCount = getProductCount(col.slug);

              return (
                <div
                  key={col.id || col.slug}
                  id={`collection-unique-card-${col.slug}`}
                  onClick={() => {
                    setRoute(`collections/${col.slug}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group relative bg-white border-2 border-stone-200 hover:border-[#5B1824] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer hover:-translate-y-1.5 ring-1 ring-black/5"
                >
                  {/* CARD TOP IMAGE AREA - FULL VISIBLE CLEAN POSTER IMAGE (NO DARK TEXT OVERLAYS) */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-stone-100 overflow-hidden">
                    <img
                      src={displayImg}
                      alt={col.altText || title}
                      className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                      loading="lazy"
                    />

                    {/* TOP LEFT MINIMAL BADGE */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold tracking-widest px-3 py-1 rounded-full border border-amber-300/30 uppercase shadow-md">
                        <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                        DEPT #{idx + 1}
                      </span>
                    </div>

                    {/* TOP RIGHT ITEM COUNT BADGE */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1 bg-[#5B1824] text-white text-[10px] font-mono font-bold tracking-widest px-3 py-1 rounded-full uppercase shadow-md border border-amber-300/30">
                        <ShoppingBag className="h-3 w-3 text-amber-300" />
                        {itemCount > 0 ? `${itemCount} ITEMS` : "FEATURED"}
                      </span>
                    </div>
                  </div>

                  {/* CARD BOTTOM BAR WITH UNIQUE ANIMATED BUTTON & BORDER (NO DESCRIPTION TEXT) */}
                  <div className="p-4 sm:p-5 bg-white border-t border-stone-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl font-serif font-extrabold uppercase tracking-tight text-zinc-950 group-hover:text-[#5B1824] transition-colors">
                        {title}
                      </h2>
                      <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        OFFICIAL DEPT
                      </span>
                    </div>

                    {/* ANIMATED UNIQUE BUTTON WITH BORDER */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoute(`collections/${col.slug}`);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full border-2 border-[#5B1824] bg-white group-hover:bg-[#5B1824] text-[#5B1824] group-hover:text-white px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-between shadow-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[#5B1824] group-hover:text-amber-300 transition-colors" />
                        <span>EXPLORE {title}</span>
                      </span>
                      
                      <div className="flex items-center gap-1.5 bg-amber-100 group-hover:bg-amber-400 text-[#5B1824] group-hover:text-zinc-950 px-3 py-1 rounded-lg transition-colors font-extrabold shadow-2xs">
                        <span className="text-[10px] font-mono uppercase tracking-wider">VIEW</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* BOTTOM UNIQUE ICON EXPLANATION OF THE PRODUCT */}
      <section id="product-explanation-section" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <div className="bg-gradient-to-br from-stone-900 via-zinc-900 to-[#3b0f17] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-stone-800">
          
          {/* HEADER */}
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              THE CLINZA ATELIER PROMISE
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold uppercase tracking-tight text-white">
              Why Our Collections Stand Apart
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
              Every garment inside our collections is engineered with structural craftsmanship, organic French Normandy flaxes, and vintage loom precision.
            </p>
          </div>

          {/* 6 UNIQUE ICON EXPLANATION CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            
            {/* ITEM 1 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/50 p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-4 group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors">
                <Sparkles className="h-6 w-6 text-amber-300 group-hover:text-zinc-950 transition-colors" />
              </div>
              <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                <span>Normandy Organic Linen</span>
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed font-sans">
                Sourced from long-staple flax fields across Normandy, France. Delivers lightweight, ultra-breathable temperature regulation all day long.
              </p>
            </div>

            {/* ITEM 2 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/50 p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-4 group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors">
                <Shirt className="h-6 w-6 text-amber-300 group-hover:text-zinc-950 transition-colors" />
              </div>
              <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                <span>Shuttle-Loom Weaving</span>
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed font-sans">
                Precision woven using vintage shuttle looms for high structural integrity, reinforced seams, and non-fading rich indigo dyes.
              </p>
            </div>

            {/* ITEM 3 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/50 p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-4 group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors">
                <Award className="h-6 w-6 text-amber-300 group-hover:text-zinc-950 transition-colors" />
              </div>
              <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                <span>Ergonomic Tailored Fits</span>
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed font-sans">
                Calibrated modern silhouettes engineered specifically for active posture, smooth draping, and effortless confidence in any setting.
              </p>
            </div>

            {/* ITEM 4 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/50 p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-4 group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors">
                <Truck className="h-6 w-6 text-amber-300 group-hover:text-zinc-950 transition-colors" />
              </div>
              <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                <span>Complimentary Doorstep COD</span>
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed font-sans">
                100% free Cash on Delivery & Express doorstep dispatch across 20,000+ pincodes in India with live tracking integrations.
              </p>
            </div>

            {/* ITEM 5 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/50 p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-4 group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors">
                <RefreshCw className="h-6 w-6 text-amber-300 group-hover:text-zinc-950 transition-colors" />
              </div>
              <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                <span>7-Day Free Size Swaps</span>
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed font-sans">
                Zero-fee reverse doorstep pick-up and instant size exchange program if you need custom fitting calibrations.
              </p>
            </div>

            {/* ITEM 6 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/50 p-5 sm:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-4 group-hover:bg-amber-400 group-hover:text-zinc-950 transition-colors">
                <ShieldCheck className="h-6 w-6 text-amber-300 group-hover:text-zinc-950 transition-colors" />
              </div>
              <h3 className="text-base font-serif font-bold text-white mb-2 flex items-center gap-2">
                <span>Multi-Tier Quality Guarantee</span>
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed font-sans">
                Every garment undergoes strict seam, thread, and dye inspection before being sealed in luxury protective packaging.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

