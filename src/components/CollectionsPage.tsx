/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronRight, Package, Sparkles, Filter, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { CollectionsService, CollectionItem, ProductsService } from "../services/supabaseService";
import { Product } from "../types";

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
    const normalized = (collectionSlugOrId || "").toLowerCase();
    if (!normalized) return 0;

    if (normalized === "premium-linen" || normalized === "linen-shirts") {
      return allProducts.filter(
        (p) => p.category.toLowerCase().includes("linen") || p.description.toLowerCase().includes("linen")
      ).length;
    } else if (normalized === "combo" || normalized === "combos" || normalized === "co-ord") {
      return allProducts.filter(
        (p) =>
          p.collection?.toLowerCase() === "combo" ||
          p.collection?.toLowerCase() === "combos" ||
          p.category.toLowerCase().includes("combo") ||
          p.name.toLowerCase().includes("co-ord") ||
          p.name.toLowerCase().includes("set")
      ).length;
    } else {
      return allProducts.filter(
        (p) =>
          (p.collection && p.collection.toLowerCase() === normalized) ||
          (p.category && p.category.toLowerCase().includes(normalized)) ||
          (p.description && p.description.toLowerCase().includes(normalized))
      ).length;
    }
  };

  return (
    <div id="collections-listing-page" className="bg-[#FAFAF8] min-h-screen text-left font-sans text-[#111111] animate-fade-in pb-16">
      
      {/* BREADCRUMB & PAGE HEADER */}
      <section id="collections-hero-header" className="bg-white border-b border-[#ECECEC] py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto space-y-4">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            <button
              onClick={() => setRoute("home")}
              className="hover:text-black transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-black font-bold">Collections</span>
          </nav>

          <div className="max-w-3xl space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-[#F27D26]">
              CLINZA ATELIER CURATIONS
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-gray-950 font-sans">
              All Collections
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm font-light leading-relaxed">
              Explore our masterfully designed wardrobe departments. Every collection is engineered with Normandy flax linens, Japanese shuttle loom indigo blocks, and structural precision tailored for modern life.
            </p>
          </div>

        </div>
      </section>

      {/* COLLECTIONS GRID CONTAINER */}
      <section id="collections-grid-section" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-12">
        
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="h-8 w-8 border-2 border-[#F27D26] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase font-mono tracking-widest text-zinc-500 font-bold animate-pulse">
              Synchronizing Collections CMS...
            </p>
          </div>
        ) : collections.length === 0 ? (
          <div className="py-20 text-center bg-white border border-zinc-200 rounded-none p-8 max-w-lg mx-auto space-y-4">
            <Package className="h-10 w-10 text-zinc-300 mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
              No Collections Currently Active
            </h3>
            <p className="text-xs text-zinc-500 font-light leading-relaxed">
              New wardrobe collections are currently being curated in our atelier. Please check back soon or explore our full product catalogue.
            </p>
            <button
              onClick={() => setRoute("collections/all")}
              className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#F27D26] transition-colors cursor-pointer"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-7 xl:gap-8">
            {collections.map((col) => {
              const displayImg =
                col.thumbnail || col.banner || col.image || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800";
              const title = col.name;
              const subtitle = col.shortDescription && col.shortDescription.length <= 70 ? col.shortDescription : null;

              return (
                <div
                  key={col.id || col.slug}
                  id={`collection-card-${col.slug}`}
                  onClick={() => {
                    setRoute(`collections/${col.slug}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group relative aspect-[3/4] w-full bg-zinc-100 overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 ease-out flex flex-col justify-end"
                >
                  {/* BACKGROUND IMAGE WITH 1.03 ZOOM */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                      src={displayImg}
                      alt={col.altText || title}
                      className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    {/* OVERLAY GRADIENT */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 z-10" />
                  </div>

                  {/* BOTTOM OVERLAY DETAILS */}
                  <div className="relative z-20 p-6 text-left flex items-end justify-between w-full">
                    <div className="space-y-0.5">
                      <h2 className="text-[17px] sm:text-[19px] font-semibold text-white tracking-wide">
                        {title}
                      </h2>
                      {subtitle && (
                        <p className="text-zinc-300 text-[12px] font-normal line-clamp-1 opacity-90">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 ml-3 text-white transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                      <ArrowRight className="h-5 w-5 stroke-[1.75]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* FOOTER ASSURANCE STRIP */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-zinc-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-zinc-600 text-xs font-sans">
          <div className="flex items-center justify-center gap-2">
            <Truck className="h-4 w-4 text-[#F27D26]" />
            <span className="uppercase font-mono font-bold">Complimentary COD Across India</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#F27D26]" />
            <span className="uppercase font-mono font-bold">7-Day Free Size Exchange</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-[#F27D26]" />
            <span className="uppercase font-mono font-bold">Normandy Flax Verified</span>
          </div>
        </div>
      </section>

    </div>
  );
}
