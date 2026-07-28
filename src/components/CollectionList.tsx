/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CollectionsService, CollectionItem } from "../services/supabaseService";

interface CollectionListProps {
  setRoute: (route: string) => void;
  currentRoute?: string;
}

// Decorative ornamental flourish SVG matching the reference header design
function HeaderFlourish({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2,12 C10,4 20,4 30,12 C40,20 50,20 60,12 C70,4 80,4 90,12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15,12 C22,7 32,7 38,12 C44,17 54,17 62,12"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.6"
        strokeLinecap="round"
      />
      <circle cx="95" cy="12" r="2.5" fill="currentColor" />
      <circle cx="5" cy="12" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

const DEFAULT_CATEGORIES: Partial<CollectionItem>[] = [
  {
    id: "cat-combos",
    name: "Combo Sets",
    slug: "combos",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  {
    id: "cat-linen-shirts",
    name: "Linen Shirts",
    slug: "shirts",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  {
    id: "cat-cotton-shirts",
    name: "Cotton Shirts",
    slug: "shirts",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  {
    id: "cat-linen-pants",
    name: "Linen Pants",
    slug: "pants",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  {
    id: "cat-formal-pants",
    name: "Formal Pants",
    slug: "pants",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  {
    id: "cat-jeans",
    name: "Jeans & Denim",
    slug: "jeans",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  {
    id: "cat-coord-sets",
    name: "Co-ord Sets",
    slug: "combos",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  {
    id: "cat-resort-wear",
    name: "Resort Wear",
    slug: "summer",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  {
    id: "cat-shorts",
    name: "Linen Shorts",
    slug: "pants",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  {
    id: "cat-jackets",
    name: "Jackets & Overshirts",
    slug: "shirts",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  {
    id: "cat-summer-essentials",
    name: "Summer Linen",
    slug: "summer",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  },
  {
    id: "cat-new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
  }
];

export default function CollectionList({ setRoute, currentRoute }: CollectionListProps) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Automatically load collections from Supabase on mount, route change, or update event
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const cols = await CollectionsService.getHomepageCollections();
        if (isMounted) {
          if (cols && cols.length > 0) {
            setCollections(cols);
          } else {
            setCollections(DEFAULT_CATEGORIES as CollectionItem[]);
          }
        }
      } catch (error) {
        console.error("Error loading collection list from Supabase:", error);
        if (isMounted) {
          setCollections(DEFAULT_CATEGORIES as CollectionItem[]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("clinza_collections_updated", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("clinza_collections_updated", handleUpdate);
    };
  }, [currentRoute]);

  const displayList = collections.length > 0 ? collections : (DEFAULT_CATEGORIES as CollectionItem[]);

  if (loading) {
    return (
      <section id="clinza-departments-section" className="py-8 sm:py-12 bg-white">
        <div className="max-w-[1440px] mx-auto text-center px-4">
          <div className="animate-pulse space-y-4 max-w-sm mx-auto">
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 pt-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="shop-by-category-section" className="pt-6 pb-6 sm:pt-8 sm:pb-8 lg:pt-10 lg:pb-8 px-3 sm:px-6 lg:px-10 bg-white border-y border-gray-100">
      <div className="max-w-[1440px] mx-auto space-y-6 sm:space-y-8">
        
        {/* SHOP BY CATEGORY HEADER WITH ORNAMENTAL FLOURISHES */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-6 text-zinc-900">
          <HeaderFlourish className="w-10 sm:w-16 lg:w-24 h-3.5 sm:h-5 text-zinc-800 shrink-0 transform scale-x-[-1]" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 font-serif text-center">
            Shop By Category
          </h2>
          <HeaderFlourish className="w-10 sm:w-16 lg:w-24 h-3.5 sm:h-5 text-zinc-800 shrink-0" />
        </div>

        {/* CATEGORY GRID (3 per row on desktop and tablet, 2 per row on phone) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3.5 sm:gap-5 lg:gap-6">
          {displayList.map((item) => {
            const displayImg =
              item.thumbnail ||
              item.banner ||
              item.image ||
              "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png";

            return (
              <div
                id={`category-card-${item.slug}`}
                key={item.id}
                onClick={() => {
                  setRoute(`collections/${item.slug}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group relative bg-white border border-stone-200 hover:border-[#5B1824] rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer hover:-translate-y-1 ring-1 ring-black/5"
              >
                {/* TOP IMAGE AREA WITH ANIMATED SHINE OVERLAY */}
                <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img
                    src={displayImg}
                    alt={item.altText || item.name}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.08] transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* HOVER SHINE EFFECT */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#5B1824]/20 via-transparent to-amber-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* OPTION ANIMATION BADGE */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-300 z-10">
                    <span className="bg-[#5B1824] text-white text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full shadow-md uppercase flex items-center gap-1">
                      VIEW <span className="text-amber-300">→</span>
                    </span>
                  </div>
                </div>

                {/* BOTTOM WHITE LABEL BOX WITH PREMIUM BUTTON STYLE */}
                <div className="py-2.5 sm:py-3 px-2 bg-white border-t border-stone-100 text-center flex flex-col items-center justify-center min-h-[52px] sm:min-h-[60px] group-hover:bg-stone-50/80 transition-colors">
                  <h3 className="text-[12px] sm:text-[13px] font-serif font-bold text-zinc-900 tracking-tight leading-snug group-hover:text-[#5B1824] transition-colors text-center flex items-center gap-1">
                    <span>{item.name}</span>
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-amber-800 uppercase tracking-widest mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    EXPLORE STYLE
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


