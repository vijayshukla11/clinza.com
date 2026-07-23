/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { CollectionsService, CollectionItem } from "../services/supabaseService";

interface CollectionListProps {
  setRoute: (route: string) => void;
}

export default function CollectionList({ setRoute }: CollectionListProps) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Automatically load collections from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const cols = await CollectionsService.getHomepageCollections();
        setCollections(cols || []);
      } catch (error) {
        console.error("Error loading collection list from Supabase:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const defaultSixCollections: Partial<CollectionItem>[] = [
    {
      id: "col-linen-shirts",
      name: "Linen Shirts",
      slug: "linen-shirts",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "col-cotton-shirts",
      name: "Cotton Shirts",
      slug: "cotton-shirts",
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "col-linen-pants",
      name: "Linen Pants",
      slug: "linen-pants",
      image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "col-jeans",
      name: "Jeans",
      slug: "jeans",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "col-combos",
      name: "Combos",
      slug: "combos",
      image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "col-new-arrivals",
      name: "New Arrivals",
      slug: "new-arrivals",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
    }
  ];

  // Merge loaded collections or fallback to default 6
  const displayCollections = React.useMemo(() => {
    if (collections && collections.length >= 6) {
      return collections.slice(0, 6).map(c => ({
        id: c.id || c.slug,
        name: c.name,
        slug: c.slug || c.id,
        image: c.thumbnail || c.banner || c.image || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800"
      }));
    }
    
    // If fewer than 6 loaded, use available then fill with defaults
    if (collections && collections.length > 0) {
      const loaded = collections.map(c => ({
        id: c.id || c.slug,
        name: c.name,
        slug: c.slug || c.id,
        image: c.thumbnail || c.banner || c.image || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800"
      }));
      const loadedSlugs = new Set(loaded.map(item => item.slug));
      const remainingDefaults = defaultSixCollections.filter(item => !loadedSlugs.has(item.slug!));
      return [...loaded, ...remainingDefaults].slice(0, 6) as { id: string; name: string; slug: string; image: string }[];
    }

    return defaultSixCollections as { id: string; name: string; slug: string; image: string }[];
  }, [collections]);

  return (
    <section id="featured-collections-section" className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 bg-[#FAFAF8]">
      <div className="max-w-[1440px] mx-auto">
        {/* LUXURY EDITORIAL SECTION HEADER */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#111111] block mb-2">
            FEATURED COLLECTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111111] tracking-tight mb-3">
            Timeless Pieces. Modern Vibes.
          </h2>
          <div className="w-12 h-[2px] bg-[#111111] mx-auto" />
        </div>

        {/* 6 COLLECTION CARDS GRID (Desktop: 6, Tablet: 3x2, Mobile: 2x3) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
          {displayCollections.map((item) => {
            return (
              <div
                id={`collection-card-${item.slug}`}
                key={item.id}
                onClick={() => {
                  setRoute(`collections/${item.slug}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group relative aspect-[4/5] w-full bg-[#EAE8E3] rounded-[12px] overflow-hidden cursor-pointer border border-[#E0DDD7] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl flex flex-col justify-end"
              >
                {/* BACKGROUND IMAGE WITH ZOOM */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* BOTTOM OVERLAY GRADIENT FOR TEXT LEGIBILITY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-10" />
                </div>

                {/* BOTTOM OVERLAY DETAILS */}
                <div className="relative z-20 p-4 sm:p-4 text-left flex items-center justify-between w-full">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight text-white uppercase leading-snug drop-shadow-xs">
                    {item.name}
                  </h3>
                  
                  <div className="shrink-0 ml-2 w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#111111] transition-all duration-300">
                    <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

