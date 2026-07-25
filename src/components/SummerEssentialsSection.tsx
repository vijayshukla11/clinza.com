/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowRight, Feather, Sparkles, Sun, Scissors, Shirt, ShieldCheck, Layers } from "lucide-react";
import { HomepageSettingsService } from "../services/supabaseService";
import { SummerEssentialsSectionConfig } from "../types";

interface SummerEssentialsSectionProps {
  setRoute: (route: string) => void;
}

const DEFAULT_SUMMER_DATA: SummerEssentialsSectionConfig = {
  isPublished: true,
  label: "SUMMER ESSENTIALS",
  heading: "Lightweight. Effortless.",
  headingHighlight: "Premium.",
  description: "Experience the ultimate seasonal campaign with refined Italian linen, relaxed resort tailoring, and airy silhouettes designed for modern warm-weather luxury.",
  buttonText: "SHOP SUMMER COLLECTION",
  buttonLink: "collections/summer",
  image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=1920",
  highlights: [
    { icon: "Feather", title: "Breathable Linen", description: "Pure natural flax fibers woven for maximum air permeability." },
    { icon: "Sparkles", title: "Premium Cotton", description: "Ultra-soft extra-long staple organic cotton for weightless comfort." },
    { icon: "Sun", title: "Everyday Comfort", description: "Unstructured silhouettes engineered for fluid movement." },
    { icon: "Scissors", title: "Modern Tailoring", description: "Hand-finished double lapels and French seams." }
  ]
};

const ICON_MAP: Record<string, React.ElementType> = {
  Feather,
  Sparkles,
  Sun,
  Scissors,
  Shirt,
  ShieldCheck,
  Layers
};

export default function SummerEssentialsSection({ setRoute }: SummerEssentialsSectionProps) {
  const [data, setData] = useState<SummerEssentialsSectionConfig>(DEFAULT_SUMMER_DATA);

  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const config = await HomepageSettingsService.getById("homepage");
        if (config && (config as any).summerEssentialsSection) {
          if (isMounted) {
            setData({
              ...DEFAULT_SUMMER_DATA,
              ...(config as any).summerEssentialsSection,
              highlights: Array.isArray((config as any).summerEssentialsSection.highlights)
                ? (config as any).summerEssentialsSection.highlights
                : DEFAULT_SUMMER_DATA.highlights
            });
          }
        }
      } catch (err) {
        console.warn("Using default Summer Essentials section data:", err);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  if (data.isPublished === false) {
    return null;
  }

  return (
    <section id="summer-essentials-section" className="py-12 md:py-14 lg:py-16 px-4 sm:px-8 lg:px-12 bg-[#F7F7F5] text-left overflow-hidden">
      <div className="max-w-[1440px] mx-auto space-y-12 lg:space-y-16">
        
        {/* MAIN EDITORIAL CAMPAIGN BANNER CARD */}
        <div className="bg-white rounded-[20px] p-6 sm:p-10 lg:p-12 border border-gray-100/80 shadow-sm flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12 min-h-[480px] lg:min-h-[520px]">
          
          {/* LEFT CONTENT (45%) */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center items-start pr-0 lg:pr-4">
            
            {/* SMALL LABEL */}
            <span className="text-[11px] font-bold uppercase tracking-[6px] text-[#888888] block mb-4 font-mono">
              {data.label}
            </span>

            {/* MAIN HEADING */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.12] font-bold text-[#111111] tracking-tight mb-6">
              {data.heading}
              {data.headingHighlight && (
                <>
                  <br />
                  <span className="font-serif italic font-normal text-amber-900/90">{data.headingHighlight}</span>
                </>
              )}
            </h2>

            {/* DESCRIPTION */}
            <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed max-w-[420px] mb-8">
              {data.description}
            </p>

            {/* CTA BUTTON */}
            <button
              id="shop-summer-collection-btn"
              onClick={() => {
                setRoute(data.buttonLink || "collections/summer");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 h-[56px] bg-[#111111] hover:bg-black text-white font-bold text-xs uppercase tracking-[0.18em] rounded-[10px] shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <span>{data.buttonText}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* RIGHT LIFESTYLE CAMPAIGN IMAGE (55%) */}
          <div className="w-full lg:w-[55%] relative min-h-[300px] sm:min-h-[380px] lg:min-h-[440px] rounded-[16px] overflow-hidden bg-[#ECEAE6] group/summerImg">
            <img
              src={data.image}
              alt={data.heading || "Summer Essentials Campaign"}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover/summerImg:scale-[1.03] transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
          </div>

        </div>

        {/* OPTIONAL FEATURE HIGHLIGHT STRIP (3-4 HIGHLIGHTS) */}
        {data.highlights && data.highlights.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {data.highlights.map((item, idx) => {
              const IconComp = ICON_MAP[item.icon] || Sparkles;
              return (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-[16px] border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col items-start"
                >
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[#111111] mb-4">
                    <IconComp className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111111] tracking-tight mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
