/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Heart, ChevronLeft, ChevronRight, Star, MoveRight } from "lucide-react";
import { ProductsService } from "../services/supabaseService";
import { Product } from "../types";

interface BestSellersSectionProps {
  onProductClick: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string, quantity?: number) => void;
  wishlistIds: string[];
  onOpenQuickView: (product: Product) => void;
  setRoute: (route: string) => void;
}

export default function BestSellersSection({
  onProductClick,
  onAddToWishlist,
  wishlistIds,
  setRoute
}: BestSellersSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await ProductsService.getHomepageBestSellers();
        if (isMounted) {
          setProducts(data || []);
        }
      } catch (err) {
        console.error("Error loading best sellers from Supabase:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  return (
    <section id="best-sellers-section" className="pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pt-10 lg:pb-14 px-4 sm:px-8 lg:px-12 bg-white text-left overflow-hidden border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto">
        {/* SECTION HEADER */}
        <div className="text-center mb-5 sm:mb-7">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800 block mb-1 font-mono">
            BEST SELLERS
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 tracking-tight">
            Loved by Thousands
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-sans tracking-wide mt-1">
            Timeless pieces. Trusted by you.
          </p>
          
          {/* SCROLL INDICATOR ICON & BADGE WITH NAVIGATION CONTROLS */}
          <div className="flex items-center justify-center gap-2 mt-3.5">
            <button
              id="scroll-icon-prev-btn"
              onClick={scrollLeft}
              className="p-1.5 rounded-full bg-stone-100 hover:bg-[#5B1824] hover:text-white transition-colors cursor-pointer border border-stone-200 shadow-2xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-stone-50 via-stone-100 to-stone-50 border border-stone-200/90 px-3.5 py-1 rounded-full shadow-2xs text-[11px] font-mono font-bold text-[#5B1824] uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>Scroll / Swipe</span>
              <MoveRight className="h-4 w-4 animate-bounce text-[#5B1824]" />
            </span>

            <button
              id="scroll-icon-next-btn"
              onClick={scrollRight}
              className="p-1.5 rounded-full bg-stone-100 hover:bg-[#5B1824] hover:text-white transition-colors cursor-pointer border border-stone-200 shadow-2xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CAROUSEL WRAPPER WITH CONTROLS */}
        <div className="relative group/carousel">
          {/* DESKTOP NAV ARROWS */}
          <button
            id="best-sellers-prev-btn"
            onClick={scrollLeft}
            className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#111111] border border-gray-200 shadow-lg items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Previous products"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            id="best-sellers-next-btn"
            onClick={scrollRight}
            className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#111111] border border-gray-200 shadow-lg items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Next products"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* PRODUCT CAROUSEL CONTAINER */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="aspect-[4/5] bg-gray-100 rounded-[12px] w-full" />
                  <div className="h-4 bg-gray-100 rounded-sm w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-sm w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-3.5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth pb-4 -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0"
            >
              {products.map((product) => {
                const isInWishlist = wishlistIds.includes(product.id);
                const discountPercent = product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    id={`best-seller-card-${product.id}`}
                    onClick={() => {
                      onProductClick(product);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group relative flex-shrink-0 w-[calc(50%-7px)] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl rounded-[12px] bg-white border border-gray-100/80 p-2 sm:p-2.5 flex flex-col justify-between"
                  >
                    {/* IMAGE CONTAINER */}
                    <div className="relative aspect-[4/5] w-full rounded-[10px] overflow-hidden bg-[#F5F5F3]">
                      <img
                        src={product.images[0] || "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-[1.05] transition-transform duration-500 ease-out"
                      />

                      {/* TOP LEFT DISCOUNT BADGE */}
                      {discountPercent > 0 && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="bg-[#111111] text-white text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-[4px] uppercase shadow-xs">
                            -{discountPercent}%
                          </span>
                        </div>
                      )}

                      {/* TOP RIGHT WISHLIST ICON */}
                      <button
                        id={`best-seller-wishlist-${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToWishlist(product);
                        }}
                        className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-[#111111] backdrop-blur-xs transition-all duration-200 shadow-xs hover:scale-110"
                        title="Add to Wishlist"
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-600 text-red-600" : ""}`} />
                      </button>
                    </div>

                    {/* PRODUCT CONTENT */}
                    <div className="pt-3 px-1 pb-1 flex flex-col justify-between flex-1">
                      <div>
                        {/* RATING & STOCK STATUS */}
                        <div className="flex items-center justify-between mb-1 text-[11px]">
                          <div className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                            <span>{product.rating || 4.9}</span>
                            <span className="text-gray-400 font-normal">
                              ({product.reviews?.length || 28})
                            </span>
                          </div>
                          
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            product.stockStatus === "Out of Stock" 
                              ? "text-red-500" 
                              : product.stockStatus === "Low Stock" 
                              ? "text-amber-600" 
                              : "text-emerald-600"
                          }`}>
                            {product.stockStatus || "In Stock"}
                          </span>
                        </div>

                        {/* PRODUCT NAME */}
                        <h3 className="text-xs sm:text-sm font-medium text-[#111111] line-clamp-1 group-hover:text-black transition-colors mb-1">
                          {product.name}
                        </h3>
                      </div>

                      {/* PRICE DETAILS */}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm sm:text-base font-bold text-[#111111]">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through font-normal">
                            ₹{product.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CENTERED BUTTON */}
        <div className="mt-10 sm:mt-14 text-center">
          <button
            id="view-all-best-sellers-btn"
            onClick={() => {
              setRoute("collections/all");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center justify-center px-10 h-[56px] bg-[#111111] hover:bg-black text-white font-bold text-xs uppercase tracking-[0.18em] rounded-[12px] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            VIEW ALL BEST SELLERS
          </button>
        </div>
      </div>
    </section>
  );
}
