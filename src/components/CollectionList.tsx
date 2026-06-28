/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowRight } from "lucide-react";
import { ProductCollection } from "../types";

interface CollectionListProps {
  setRoute: (route: string) => void;
}

interface CollectionItem {
  name: string;
  slug: string;
  description: string;
  image: string;
  count: number;
}

const COLLECTIONS_META: CollectionItem[] = [
  {
    name: "Linen Shirts",
    slug: "shirts",
    description: "Premium European long-staple flax camp shirts and spread-collar summer classics.",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
    count: 14
  },
  {
    name: "Selvedge Jeans",
    slug: "jeans",
    description: "Raw indigo heavy cotton woven on vintage Japanese heritage shuttle looms.",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600",
    count: 8
  },
  {
    name: "Sartorial Pants",
    slug: "pants",
    description: "Double pleated higher-rise tailored trousers with Italian side adjusters.",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600",
    count: 11
  },
  {
    name: "Resort Combos",
    slug: "combos",
    description: "Complete matching vacation co-ord sets. Minimalist drawstring aesthetics.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600",
    count: 6
  },
  {
    name: "Luxury Footwear",
    slug: "footwear",
    description: "Handcrafted Chelsea boots welted manually using water-repellant Italian calf suede.",
    image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=600",
    count: 5
  },
  {
    name: "Sartorial Accessories",
    slug: "accessories",
    description: "Precision steel watches with ceramic bezels alongside minimal full-grain leather wallets.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
    count: 9
  }
];

export default function CollectionList({ setRoute }: CollectionListProps) {
  return (
    <section id="clinza-collections-section" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 border-b border-zinc-200 pb-4">
          <div className="max-w-xl text-left">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#F27D26] uppercase mb-1.5 font-mono block">
              The Clinza Wardrobe
            </span>
            <h2 className="text-2xl sm:text-3.5xl font-sans font-black tracking-tight text-gray-950 uppercase">
              Shop By Collection
            </h2>
          </div>
          <button
            id="collections-all-btn"
            onClick={() => setRoute("collections/all")}
            className="mt-3 sm:mt-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F27D26] hover:text-black transition-colors cursor-pointer font-mono"
          >
            Explore Full Wardrobe <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {COLLECTIONS_META.map((item) => (
            <div
              id={`collection-card-${item.slug}`}
              key={item.slug}
              className="group relative h-80 sm:h-84 rounded-none overflow-hidden hover:border-black transition-all duration-300 border border-gray-200 flex flex-col justify-end"
            >
              {/* BACKDROP IMAGE */}
              <div className="absolute inset-0 z-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-all duration-700"
                  loading="lazy"
                />
                {/* DARK SLATE GRADIENT GRIP */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/45 to-transparent z-10" />
              </div>

              {/* FLOATING PRODUCT COUNT ACCENT */}
              <div className="absolute top-4 right-4 z-20 bg-white/10 border border-white/20 backdrop-blur-md px-3 py-1 rounded-none">
                <p className="text-[10px] font-extrabold font-mono text-zinc-100 uppercase tracking-widest leading-none">
                  {item.count} items
                </p>
              </div>

              {/* CARD DETAILS */}
              <div className="relative z-20 p-6 flex flex-col items-start text-left">
                <h3 className="text-xl font-sans font-black tracking-tight text-white uppercase mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-300 text-xs font-sans leading-relaxed mb-6 font-light">
                  {item.description}
                </p>
                <button
                  id={`collection-btn-${item.slug}`}
                  onClick={() => {
                    setRoute(`collections/${item.slug}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group/btn flex items-center justify-center gap-1.5 bg-white text-gray-950 text-xs font-bold font-sans uppercase tracking-widest px-5 py-3 rounded-none hover:bg-[#F27D26] hover:text-black transition-all cursor-pointer border border-transparent hover:border-black"
                >
                  View Collection
                  <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1.5 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
