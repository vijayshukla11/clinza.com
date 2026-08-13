/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Trophy, Flame, ArrowRight, Award, ShieldCheck, Sparkles } from "lucide-react";
import { Product } from "../types";
import { ProductsService } from "../services/supabaseService";
import ProductCard from "./ProductCard";

interface TrendingLeaderboardSectionProps {
  setRoute: (route: string) => void;
  onProductClick: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string, quantity?: number) => void;
  wishlistIds: string[];
  onOpenQuickView: (product: Product) => void;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  merchandisingSlug?: string;
  limit?: number;
}

export default function TrendingLeaderboardSection({
  setRoute,
  onProductClick,
  onAddToWishlist,
  onAddToCart,
  wishlistIds,
  onOpenQuickView,
  title,
  subtitle,
  ctaText,
  ctaUrl,
  limit
}: TrendingLeaderboardSectionProps) {
  const [rankedProducts, setRankedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRanked() {
      try {
        setLoading(true);
        const all = await ProductsService.getAll();
        
        // Sort by trendingRank ascending (1, 2, 3...)
        const sorted = [...all].sort((a, b) => {
          const rankA = a.trendingRank !== undefined && a.trendingRank !== null ? a.trendingRank : 999;
          const rankB = b.trendingRank !== undefined && b.trendingRank !== null ? b.trendingRank : 999;
          if (rankA !== rankB) return rankA - rankB;
          return a.name.localeCompare(b.name);
        });

        // Ensure every product has a fallback rank
        const ranked = sorted.map((p, idx) => ({
          ...p,
          trendingRank: p.trendingRank ?? (idx + 1)
        }));

        if (isMounted) {
          const maxCount = limit || 8;
          setRankedProducts(ranked.slice(0, maxCount));
        }
      } catch (err) {
        console.error("Error loading homepage ranked products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRanked();
  }, [limit]);

  if (loading || rankedProducts.length === 0) return null;

  return (
    <section id="trending-leaderboard-section" className="pt-8 pb-12 sm:pt-10 sm:pb-14 bg-[#FAF9F6] border-y border-gray-200/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
              <Trophy className="h-3.5 w-3.5 text-amber-600" />
              <span>{subtitle || "HIGH DEMAND LEADERBOARD"}</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-zinc-900 tracking-tight">
              {title || "Top Ranked Products (#1 to #8)"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-sans max-w-xl">
              Curated and ranked dynamically by customer orders, high demand velocity, and sartorial popularity.
            </p>
          </div>

          <button
            id="view-full-leaderboard-btn"
            onClick={() => {
              setRoute("trending");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="btn-premium-maroon h-[44px] px-6 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md self-start md:self-auto"
          >
            <span>View Full Leaderboard (#1 - #20)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* TOP 8 PRODUCT GRID WITH RANK BADGES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {rankedProducts.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard
                product={product}
                onProductClick={onProductClick}
                onAddToWishlist={onAddToWishlist}
                onAddToCart={onAddToCart}
                wishlistIds={wishlistIds}
                onOpenQuickView={onOpenQuickView}
                setRoute={setRoute}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
