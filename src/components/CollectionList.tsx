/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { CollectionsService, CollectionItem } from "../services/supabaseService";

interface CollectionListProps {
  setRoute: (route: string) => void;
  currentRoute?: string;
}

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
          setCollections(cols || []);
        }
      } catch (error) {
        console.error("Error loading collection list from Supabase:", error);
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

  if (loading) {
    return (
      <section id="clinza-departments-section" className="py-12 px-4 sm:px-8 lg:px-12 bg-[#FAFAF8]">
        <div className="max-w-[1440px] mx-auto text-center">
          <div className="animate-pulse space-y-4 max-w-sm mx-auto">
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
            <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <section id="clinza-departments-section" className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 bg-[#FAFAF8]">
      <div className="max-w-[1440px] mx-auto">
        {/* EDITORIAL SECTION HEADER */}
        <div className="text-center mb-8 sm:mb-10 space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 block font-mono">
            COLLECTIONS ATELIER
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#111111] tracking-tight">
            Explore By Collection
          </h2>
        </div>

        {/* COLLECTION CMS GRID (Minimal luxury cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-7 xl:gap-8">
          {collections.map((item) => {
            const displayImg =
              item.thumbnail ||
              item.banner ||
              item.image ||
              "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800";
            const subtitle =
              item.shortDescription && item.shortDescription.length <= 70
                ? item.shortDescription
                : null;

            return (
              <div
                id={`department-card-${item.slug}`}
                key={item.id}
                onClick={() => {
                  setRoute(`collections/${item.slug}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group relative aspect-[3/4] w-full bg-zinc-100 overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 ease-out flex flex-col justify-end"
              >
                {/* BACKGROUND IMAGE WITH 1.03 ZOOM */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={displayImg}
                    alt={item.altText || item.name}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* OVERLAY GRADIENT */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 z-10" />
                </div>

                {/* BOTTOM OVERLAY DETAILS */}
                <div className="relative z-20 p-5 sm:p-6 text-left flex items-end justify-between w-full">
                  <div className="space-y-0.5">
                    <h3 className="text-[16px] sm:text-[18px] font-semibold text-white tracking-wide">
                      {item.name}
                    </h3>
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
      </div>
    </section>
  );
}

