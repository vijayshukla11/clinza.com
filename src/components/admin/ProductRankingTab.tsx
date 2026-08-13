/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Trophy, ArrowUp, ArrowDown, Save, Copy, Check, Sparkles, RefreshCw, AlertCircle, Database, Flame } from "lucide-react";
import { Product } from "../../types";
import { ProductsService } from "../../services/supabaseService";

interface ProductRankingTabProps {
  products: Product[];
  onProductsUpdate: () => void;
}

export default function ProductRankingTab({ products, onProductsUpdate }: ProductRankingTabProps) {
  const [rankedList, setRankedList] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    // Sort products initially by trendingRank (1, 2, 3...) or index + 1
    const sorted = [...products].sort((a, b) => {
      const rankA = a.trendingRank !== undefined && a.trendingRank !== null ? a.trendingRank : 999;
      const rankB = b.trendingRank !== undefined && b.trendingRank !== null ? b.trendingRank : 999;
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });

    // Ensure rank sequence 1..N
    const withRanks = sorted.map((p, idx) => ({
      ...p,
      trendingRank: p.trendingRank ?? (idx + 1),
      demandBadge: p.demandBadge || (idx === 0 ? "NO.1 HIGH DEMAND" : idx === 1 ? "NO.2 BESTSELLER" : idx === 2 ? "NO.3 TOP RATED" : "HIGH DEMAND")
    }));

    setRankedList(withRanks);
  }, [products]);

  const handleRankChange = (id: string, newRank: number) => {
    setRankedList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, trendingRank: Math.max(1, newRank) } : item))
    );
  };

  const handleBadgeChange = (id: string, badgeText: string) => {
    setRankedList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, demandBadge: badgeText } : item))
    );
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === rankedList.length - 1)) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...rankedList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Re-index ranks 1..N
    const reindexed = updated.map((item, idx) => ({
      ...item,
      trendingRank: idx + 1
    }));

    setRankedList(reindexed);
  };

  const handleSaveSequence = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      // Re-index cleanly 1..N
      const sortedPayload = [...rankedList].sort((a, b) => (a.trendingRank ?? 999) - (b.trendingRank ?? 999));
      const payload = sortedPayload.map((item, idx) => ({
        id: item.id,
        rank: idx + 1,
        demandBadge: item.demandBadge || `No. ${idx + 1} High Demand`
      }));

      await ProductsService.updateProductRanks(payload);
      setSaveSuccess(true);
      onProductsUpdate();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving rank sequence:", err);
      alert("Failed to update ranks in Supabase. Check console logs.");
    } finally {
      setSaving(false);
    }
  };

  const sqlQuery = `-- SUPABASE SQL MIGRATION FOR PRODUCT RANKING SEQUENCE
ALTER TABLE products ADD COLUMN IF NOT EXISTS trending_rank INTEGER DEFAULT 999;
ALTER TABLE products ADD COLUMN IF NOT EXISTS demand_badge TEXT;

-- Update top 3 initial ranks
UPDATE products SET trending_rank = 1, demand_badge = 'NO.1 HIGH DEMAND' WHERE id = '${rankedList[0]?.id || 'prod-classic-italian-linen'}';
UPDATE products SET trending_rank = 2, demand_badge = 'NO.2 BESTSELLER' WHERE id = '${rankedList[1]?.id || 'prod-sage-resort-linen'}';
UPDATE products SET trending_rank = 3, demand_badge = 'NO.3 TOP RATED' WHERE id = '${rankedList[2]?.id || 'prod-navy-club-linen'}';`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#3B0E17] to-zinc-950 p-6 sm:p-8 rounded-[18px] text-white shadow-lg border border-[#5B1824]/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-widest">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>HIGH DEMAND SEQUENCE MANAGER</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Product Rankings & Leaderboard Sequence
          </h2>
          <p className="text-zinc-300 text-xs sm:text-sm font-sans leading-relaxed">
            Drag, reorder, or edit rank sequence numbers (#1, #2, #3, #4...) for all store products. This directly controls which products appear on the homepage Leaderboard section and `/trending` page!
          </p>
        </div>

        <button
          onClick={handleSaveSequence}
          disabled={saving}
          className="btn-premium-maroon px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shrink-0 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-white" />
              <span>Saving Sequence...</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4 text-emerald-300" />
              <span>Sequence Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 text-white" />
              <span>Save Live Sequence</span>
            </>
          )}
        </button>
      </div>

      {/* SQL MIGRATION HELPER BOX */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-[14px] p-4 sm:p-5 text-amber-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-bold uppercase tracking-wider font-mono text-amber-950">
              Supabase SQL Query Migration (Optional)
            </span>
            <p className="text-amber-800">
              If your Supabase `products` table requires explicit database columns, click below to copy the SQL query and execute it in your Supabase SQL Editor.
            </p>
          </div>
        </div>

        <button
          onClick={copySqlToClipboard}
          className="px-4 py-2 bg-amber-950 text-amber-100 hover:bg-black rounded-lg text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-xs"
        >
          {copiedSql ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          <span>{copiedSql ? "SQL Copied!" : "Copy Supabase SQL"}</span>
        </button>
      </div>

      {/* PRODUCT RANKINGS REORDER TABLE */}
      <div className="bg-white rounded-[16px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="font-serif font-bold text-base text-zinc-900">
              Active Ranking List ({rankedList.length} Products)
            </h3>
            <p className="text-xs text-zinc-500 font-sans">
              #1 product gets the Top Gold Leaderboard placement.
            </p>
          </div>

          <span className="text-xs font-mono text-amber-700 bg-amber-100 px-3 py-1 rounded-full font-bold">
            Live Reordering Enabled
          </span>
        </div>

        <div className="divide-y divide-gray-200 overflow-x-auto">
          {rankedList.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 flex items-center gap-4 hover:bg-zinc-50/80 transition-colors ${
                idx === 0
                  ? "bg-amber-50/40"
                  : idx === 1
                  ? "bg-zinc-50/60"
                  : idx === 2
                  ? "bg-amber-900/5"
                  : ""
              }`}
            >
              {/* REORDER UP/DOWN BUTTONS */}
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => moveItem(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveItem(idx, "down")}
                  disabled={idx === rankedList.length - 1}
                  className="p-1 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>

              {/* RANK BADGE & INPUT */}
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs text-white shadow-xs ${
                  idx === 0
                    ? "bg-gradient-to-r from-amber-600 to-yellow-600"
                    : idx === 1
                    ? "bg-zinc-700"
                    : idx === 2
                    ? "bg-amber-800"
                    : "bg-zinc-900"
                }`}>
                  #{idx + 1}
                </div>

                <div className="w-16">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block">Rank #</label>
                  <input
                    type="number"
                    min="1"
                    value={item.trendingRank ?? (idx + 1)}
                    onChange={(e) => handleRankChange(item.id, parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-mono font-bold text-center"
                  />
                </div>
              </div>

              {/* PRODUCT THUMBNAIL & DETAILS */}
              <div className="flex items-center gap-3 min-w-[200px] flex-1">
                <img
                  src={(Array.isArray(item.images) && item.images[0]) || ""}
                  alt={item.name}
                  className="w-12 h-14 object-cover rounded-md border border-gray-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 truncate">{item.name}</h4>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    ₹{item.price.toLocaleString("en-IN")} • {item.category}
                  </p>
                </div>
              </div>

              {/* DEMAND BADGE TEXT INPUT */}
              <div className="w-48 shrink-0 hidden sm:block">
                <label className="text-[9px] font-mono text-zinc-500 uppercase block">Badge Tagline</label>
                <input
                  type="text"
                  value={item.demandBadge || ""}
                  placeholder="e.g. NO.1 HIGH DEMAND"
                  onChange={(e) => handleBadgeChange(item.id, e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded font-mono"
                />
              </div>

              {/* LIVE BADGE PREVIEW */}
              <div className="shrink-0 hidden md:block">
                <span className="text-[9px] font-mono text-zinc-400 block uppercase mb-1">Live Badge Preview</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black text-amber-300 text-[10px] font-mono font-bold">
                  <Flame className="h-3 w-3 text-amber-400" />
                  <span>#{idx + 1} {item.demandBadge || "HIGH DEMAND"}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
