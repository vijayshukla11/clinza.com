/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Flame, Trophy, Award, Star, ArrowRight, ShieldCheck, Sparkles, Filter, RefreshCw } from "lucide-react";
import { Product } from "../types";
import { ProductsService } from "../services/supabaseService";
import ProductCard from "./ProductCard";

interface TopRankedProductsPageProps {
  setRoute: (route: string) => void;
  onProductClick: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string, quantity?: number) => void;
  wishlistIds: string[];
  onOpenQuickView: (product: Product) => void;
}

export default function TopRankedProductsPage({
  setRoute,
  onProductClick,
  onAddToWishlist,
  onAddToCart,
  wishlistIds,
  onOpenQuickView
}: TopRankedProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    async function loadRanked() {
      try {
        setLoading(true);
        const all = await ProductsService.getAll();
        
        // Sort products by trendingRank ascending (1, 2, 3...)
        const sorted = [...all].sort((a, b) => {
          const rankA = a.trendingRank !== undefined && a.trendingRank !== null ? a.trendingRank : 999;
          const rankB = b.trendingRank !== undefined && b.trendingRank !== null ? b.trendingRank : 999;
          if (rankA !== rankB) return rankA - rankB;
          return a.name.localeCompare(b.name);
        });

        // Ensure every product has a fallback rank 1..N if not set
        const ranked = sorted.map((p, idx) => ({
          ...p,
          trendingRank: p.trendingRank ?? (idx + 1)
        }));

        if (isMounted) {
          setProducts(ranked);
        }
      } catch (err) {
        console.error("Error loading top ranked products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRanked();
  }, []);

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20 pt-6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* TOP RANKED PAGE POSTER BANNER */}
        <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-lg bg-stone-100 mb-8 group">
          <img
            src="https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/collections/collections/trending.png"
            alt="Top Ranked Products Poster"
            className="w-full h-auto object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 ease-out"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* CATEGORY FILTER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-4 rounded-[14px] border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider font-mono">
            <Filter className="h-4 w-4 text-[#F27D26]" />
            <span>Filter By Category:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "btn-premium-maroon text-white font-bold shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="h-8 w-8 border-2 border-[#F27D26] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Loading High Demand Rankings...
            </p>
          </div>
        ) : (
          <div>
            {/* FEATURED TOP 3 PODIUM */}
            {selectedCategory === "all" && filteredProducts.length >= 3 && (
              <div className="mb-14">
                <div className="text-center mb-6">
                  <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-amber-700 uppercase">
                    ★ THE TOP 3 LEADERBOARD PODIUM ★
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900">
                    Highest Demand Champions
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  {/* RANK #2 - SILVER */}
                  {filteredProducts[1] && (
                    <div className="relative bg-white border-2 border-zinc-300 rounded-[16px] p-4 flex flex-col justify-between shadow-md hover:shadow-xl transition-all">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full border border-zinc-400 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-zinc-300" /> #2 HIGH DEMAND
                      </div>
                      <div className="pt-3">
                        <ProductCard
                          product={filteredProducts[1]}
                          onProductClick={onProductClick}
                          onAddToWishlist={onAddToWishlist}
                          onAddToCart={onAddToCart}
                          wishlistIds={wishlistIds}
                          onOpenQuickView={onOpenQuickView}
                          setRoute={setRoute}
                          idPrefix="podium-silver"
                        />
                      </div>
                    </div>
                  )}

                  {/* RANK #1 - GOLD (CENTER, ELEVATED) */}
                  {filteredProducts[0] && (
                    <div className="relative bg-gradient-to-b from-amber-50 to-white border-2 border-amber-400 rounded-[16px] p-4 flex flex-col justify-between shadow-xl md:-mt-4 mb-2 hover:shadow-2xl transition-all">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white font-mono text-[11px] font-extrabold px-4 py-1.5 rounded-full border border-amber-200 shadow-md flex items-center gap-1.5 animate-pulse">
                        <Trophy className="h-4 w-4 text-amber-200" /> #1 MOST DEMANDED
                      </div>
                      <div className="pt-4">
                        <ProductCard
                          product={filteredProducts[0]}
                          onProductClick={onProductClick}
                          onAddToWishlist={onAddToWishlist}
                          onAddToCart={onAddToCart}
                          wishlistIds={wishlistIds}
                          onOpenQuickView={onOpenQuickView}
                          setRoute={setRoute}
                          idPrefix="podium-gold"
                        />
                      </div>
                    </div>
                  )}

                  {/* RANK #3 - BRONZE */}
                  {filteredProducts[2] && (
                    <div className="relative bg-white border-2 border-amber-800/40 rounded-[16px] p-4 flex flex-col justify-between shadow-md hover:shadow-xl transition-all">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-900 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full border border-amber-600 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-amber-400" /> #3 HIGH DEMAND
                      </div>
                      <div className="pt-3">
                        <ProductCard
                          product={filteredProducts[2]}
                          onProductClick={onProductClick}
                          onAddToWishlist={onAddToWishlist}
                          onAddToCart={onAddToCart}
                          wishlistIds={wishlistIds}
                          onOpenQuickView={onOpenQuickView}
                          setRoute={setRoute}
                          idPrefix="podium-bronze"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FULL PRODUCTS LISTING IN RANK ORDER */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-zinc-900">
                Complete Demand Ranking Sequence ({filteredProducts.length} Items)
              </h2>
              <span className="text-xs text-zinc-500 font-mono">
                Sorted by Rank Sequence (#1 - #20)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((p, idx) => (
                <div key={`rank-grid-${p.id}-${idx}`} className="relative">
                  <ProductCard
                    product={p}
                    onProductClick={onProductClick}
                    onAddToWishlist={onAddToWishlist}
                    onAddToCart={onAddToCart}
                    wishlistIds={wishlistIds}
                    onOpenQuickView={onOpenQuickView}
                    setRoute={setRoute}
                    idPrefix={`topranked-grid-${idx}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
