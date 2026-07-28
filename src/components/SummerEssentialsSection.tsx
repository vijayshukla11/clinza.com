/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowRight, Feather, Sparkles, Sun, Scissors, Shirt, ShieldCheck, Layers, Crown, Wind, Award, BadgeCheck, Gem, CheckCircle2 } from "lucide-react";
import { HomepageSettingsService } from "../services/supabaseService";
import { SummerEssentialsSectionConfig } from "../types";

interface SummerEssentialsSectionProps {
  setRoute: (route: string) => void;
}

const DEFAULT_SUMMER_DATA: SummerEssentialsSectionConfig = {
  isPublished: true,
  label: "CLINZA™ LINEN CO. HERITAGE",
  heading: "Timeless Style.",
  headingHighlight: "Everyday Luxury. Clinza Pure Linen.",
  description: "Crafted from 100% authentic Normandy flax by Clinza Linen Co. Designed with clean bespoke tailoring and weightless silhouettes for effortless sophistication.",
  buttonText: "SHOP CLINZA LINEN",
  buttonLink: "collections/summer",
  image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
  highlights: [
    {
      icon: "Crown",
      title: "Clinza™ Normandy Flax",
      description: "100% authentic French Normandy flax fibers woven by Clinza Linen Co. for supreme natural breathability.",
      badge: "PURE LINEN BRAND"
    },
    {
      icon: "Wind",
      title: "Clinza Air-Breathe™",
      description: "Signature 140 GSM lightweight open-weave construction engineered for maximum cooling in heat.",
      badge: "CLINZA INNOVATION"
    },
    {
      icon: "Sparkles",
      title: "Enzyme Softened Touch",
      description: "Pre-washed with Clinza's organic enzymatic process for a weightless, silky, broken-in luxury feel.",
      badge: "ULTRA SOFT"
    },
    {
      icon: "Scissors",
      title: "Bespoke Tailored Craft",
      description: "Hand-finished double lapels, French seams, and natural mother-of-pearl Clinza brand buttons.",
      badge: "HERITAGE FINISH"
    }
  ]
};

const ICON_MAP: Record<string, React.ElementType> = {
  Crown,
  Wind,
  Sparkles,
  Scissors,
  Feather,
  Sun,
  Shirt,
  ShieldCheck,
  Layers,
  Award,
  BadgeCheck,
  Gem,
  CheckCircle2
};

function formatButtonText(text: string): string {
  if (!text) return "SHOP LINEN COLLECTION";
  return text.replace(/[→\->\s]+$/, "").trim();
}

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

  const cleanCta = formatButtonText(data.buttonText);

  return (
    <section id="summer-essentials-section" className="py-8 sm:py-12 md:py-14 lg:py-16 px-4 sm:px-8 lg:px-12 bg-[#F7F7F5] text-left overflow-hidden">
      <div className="max-w-[1440px] mx-auto space-y-10 lg:space-y-12">
        
        {/* MAIN EDITORIAL CAMPAIGN POSTER CARD */}
        <div className="relative w-full rounded-[20px] sm:rounded-[24px] overflow-hidden bg-zinc-900 shadow-sm min-h-[420px] h-[460px] sm:h-[520px] md:h-[600px] lg:h-[660px] flex items-end sm:items-center">
          
          {/* BACKGROUND IMAGE */}
          {data.image && (
            <img
              src={data.image}
              alt={data.heading || "Summer Linen Campaign"}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          )}

          {/* DUAL GRADIENT OVERLAY FOR CRISP LEGIBILITY ON MOBILE AND DESKTOP */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 sm:bg-gradient-to-r sm:from-black/90 sm:via-black/55 sm:to-transparent pointer-events-none z-10" />
          <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />

          {/* EDITORIAL POSTER CONTENT */}
          <div className="relative z-20 w-full max-w-[640px] p-6 sm:p-10 md:p-14 lg:p-16 flex flex-col items-start text-left text-white">
            {/* LABEL */}
            {data.label && (
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-zinc-300 block mb-2 sm:mb-3 font-mono">
                {data.label}
              </span>
            )}

            {/* LARGE HEADING */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-white uppercase mb-3 sm:mb-4">
              {data.heading || "Timeless Style."}
              {data.headingHighlight && (
                <>
                  <br />
                  <span className="text-zinc-300 font-serif italic normal-case font-normal text-[0.88em]">
                    {data.headingHighlight}
                  </span>
                </>
              )}
            </h2>

            {/* SUBTITLE / DESCRIPTION */}
            {data.description && (
              <p className="text-xs sm:text-sm md:text-base text-zinc-200 font-light leading-relaxed line-clamp-3 sm:line-clamp-2 max-w-md mb-6 sm:mb-8">
                {data.description}
              </p>
            )}

            {/* PREMIUM MAROON CTA BUTTON */}
            <button
              id="shop-summer-collection-btn"
              onClick={() => {
                setRoute(data.buttonLink || "collections/summer");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-[48px] sm:h-[54px] px-6 sm:px-8 btn-premium-maroon rounded-full text-[12px] sm:text-[14px] font-bold tracking-[0.08em] uppercase transition-all duration-[250ms] ease-out shadow-lg cursor-pointer inline-flex items-center justify-center gap-2.5 group"
            >
              <span>{cleanCta}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

        </div>

        {/* UNIQUE FEATURE HIGHLIGHT CARDS (CLINZA™ LINEN CRAFTSMANSHIP) */}
        {data.highlights && data.highlights.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {data.highlights.map((item, idx) => {
              const IconComp = ICON_MAP[item.icon] || Crown;
              const badgeText = item.badge || (idx === 0 ? "PURE LINEN" : idx === 1 ? "CLINZA WEAVE" : idx === 2 ? "ENZYME WASHED" : "HERITAGE FIT");
              
              return (
                <div
                  key={idx}
                  className="group relative bg-gradient-to-b from-white via-zinc-50/60 to-stone-50/80 p-5 sm:p-6 rounded-[18px] sm:rounded-[20px] border border-stone-200/90 shadow-2xs hover:shadow-xl hover:border-[#5B1824]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                >
                  {/* Subtle Top Accent Bar on Hover */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#5B1824] via-amber-500 to-[#3B0E17] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    {/* ICON & BADGE ROW */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      {/* LUXURY MAROON GRADIENT ICON BADGE */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#5B1824] via-[#4A121D] to-[#3B0E17] text-amber-200 border border-amber-300/30 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:shadow-md group-hover:border-amber-300/60 transition-all duration-300">
                        <IconComp className="h-5 w-5 stroke-[2] text-amber-200" />
                      </div>

                      {/* CLINZA BRAND BADGE TAG */}
                      <span className="text-[9px] font-bold tracking-widest text-[#5B1824] bg-[#5B1824]/8 px-2.5 py-1 rounded-full uppercase border border-[#5B1824]/15 font-mono shadow-2xs group-hover:bg-[#5B1824] group-hover:text-white transition-colors duration-300">
                        {badgeText}
                      </span>
                    </div>

                    {/* CARD TITLE WITH CLINZA BRAND HIGHLIGHT */}
                    <h3 className="text-sm font-bold text-zinc-900 tracking-tight mb-1.5 group-hover:text-[#5B1824] transition-colors flex items-center gap-1">
                      <span>{item.title}</span>
                    </h3>

                    {/* CARD DESCRIPTION */}
                    <p className="text-xs text-zinc-600 font-sans font-normal leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* BOTTOM SUBTLE BRAND STAMP */}
                  <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-stone-600 font-mono">
                    <span className="flex items-center gap-1 text-[#5B1824]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B1824]" />
                      Clinza™ Linen Co.
                    </span>
                    <span className="text-amber-800">100% Genuine</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}

