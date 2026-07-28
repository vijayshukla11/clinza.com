/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowLeft, ShoppingBag, Search, Home } from "lucide-react";

interface NotFoundPageProps {
  handleOldRouteTrigger?: (route: string) => void;
  navigate?: (path: string) => void;
}

export default function NotFoundPage({ handleOldRouteTrigger, navigate }: NotFoundPageProps) {
  const goHome = () => {
    if (navigate) {
      navigate("/");
    } else if (handleOldRouteTrigger) {
      handleOldRouteTrigger("home");
    } else {
      window.location.href = "/";
    }
  };

  const goRoute = (route: string) => {
    if (navigate) {
      navigate(route);
    } else if (handleOldRouteTrigger) {
      handleOldRouteTrigger(route.replace("/", ""));
    } else {
      window.location.href = route;
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#FAFAF8] text-center">
      <div className="max-w-md mx-auto space-y-6">
        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-[#F27D26] block">
          404 — PAGE NOT FOUND
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 uppercase">
          This Piece Is Out Of Reach
        </h1>

        <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
          The requested address could not be located. It may have been moved, renamed, or is temporarily unavailable.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={goHome}
            className="w-full sm:w-auto px-6 h-12 bg-zinc-900 hover:bg-black text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </button>

          <button
            onClick={() => goRoute("/collections")}
            className="w-full sm:w-auto px-6 h-12 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Explore Catalog</span>
          </button>
        </div>

        {/* QUICK POPULAR CATEGORIES */}
        <div className="pt-8 border-t border-zinc-200">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Popular Wardrobe Categories
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <button
              onClick={() => goRoute("/shirts")}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 hover:border-black transition-colors cursor-pointer"
            >
              Linen Shirts
            </button>
            <button
              onClick={() => goRoute("/pants")}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 hover:border-black transition-colors cursor-pointer"
            >
              Trousers
            </button>
            <button
              onClick={() => goRoute("/jeans")}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 hover:border-black transition-colors cursor-pointer"
            >
              Selvedge Jeans
            </button>
            <button
              onClick={() => goRoute("/new-arrivals")}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-700 hover:border-black transition-colors cursor-pointer"
            >
              New Arrivals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
