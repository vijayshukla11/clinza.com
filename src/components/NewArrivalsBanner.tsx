/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Layers, ShieldCheck, Shirt, ArrowRight } from "lucide-react";
import { HomepageSettingsService } from "../services/supabaseService";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface NewArrivalsBannerData {
  label: string;
  heading: string;
  headingHighlight?: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  features: FeatureItem[];
}

interface NewArrivalsBannerProps {
  setRoute: (route: string) => void;
}

const DEFAULT_BANNER_DATA: NewArrivalsBannerData = {
  label: "NEW ARRIVALS",
  heading: "Fresh Styles.",
  headingHighlight: "New Vibes.",
  description: "Discover our latest seasonal drops crafted with fine breathable linens, structured cottons, and refined minimalist fits.",
  ctaText: "SHOP NEW ARRIVALS",
  ctaLink: "collections/new-arrivals",
  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200",
  features: [
    {
      icon: "Sparkles",
      title: "Premium Fabrics",
      description: "High-grade Italian & Japanese linen-cotton weaves."
    },
    {
      icon: "Shirt",
      title: "Modern Fit",
      description: "Precision tailoring designed for effortless drapes."
    },
    {
      icon: "Layers",
      title: "Versatile Styles",
      description: "Day-to-night minimalist essentials for any occasion."
    },
    {
      icon: "ShieldCheck",
      title: "Quality Assured",
      description: "Double-stitched seams & handcrafted finishes."
    }
  ]
};

export default function NewArrivalsBanner({ setRoute }: NewArrivalsBannerProps) {
  const [bannerData, setBannerData] = useState<NewArrivalsBannerData>(DEFAULT_BANNER_DATA);

  useEffect(() => {
    let isMounted = true;
    async function loadBannerConfig() {
      try {
        const config = await HomepageSettingsService.getById("homepage");
        if (config && (config as any).newArrivalsBanner) {
          if (isMounted) {
            setBannerData({
              ...DEFAULT_BANNER_DATA,
              ...(config as any).newArrivalsBanner
            });
          }
        }
      } catch (err) {
        console.warn("Using default New Arrivals banner data:", err);
      }
    }
    loadBannerConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to render outline icons dynamically
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Shirt":
        return <Shirt className="h-5 w-5 text-[#111111]" />;
      case "Layers":
        return <Layers className="h-5 w-5 text-[#111111]" />;
      case "ShieldCheck":
        return <ShieldCheck className="h-5 w-5 text-[#111111]" />;
      case "Sparkles":
      default:
        return <Sparkles className="h-5 w-5 text-[#111111]" />;
    }
  };

  return (
    <section id="new-arrivals-banner-section" className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 bg-[#FAFAF8] text-left">
      <div className="max-w-[1440px] mx-auto">
        {/* MAIN CONTAINER */}
        <div className="group relative w-full rounded-[16px] overflow-hidden bg-white border border-[#EAE8E3] shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[420px] flex flex-col lg:flex-row items-stretch">
          
          {/* LEFT COLUMN: EDITORIAL CONTENT (~35%) */}
          <div className="w-full lg:w-[35%] p-6 sm:p-10 lg:p-12 flex flex-col justify-between items-start z-10 bg-white">
            <div>
              {/* SMALL LABEL */}
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#111111] block mb-3 font-mono">
                {bannerData.label}
              </span>

              {/* LARGE HEADING */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111111] tracking-tight leading-tight mb-4">
                {bannerData.heading}
                {bannerData.headingHighlight && (
                  <>
                    <br />
                    <span className="text-gray-500 font-light">{bannerData.headingHighlight}</span>
                  </>
                )}
              </h2>

              {/* SHORT EDITORIAL COPY */}
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed max-w-sm mb-6">
                {bannerData.description}
              </p>
            </div>

            {/* PRIMARY CTA BUTTON */}
            <div className="w-full sm:w-auto mt-4">
              <button
                id="shop-new-arrivals-cta"
                onClick={() => {
                  setRoute(bannerData.ctaLink || "collections/new-arrivals");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 h-[56px] bg-[#111111] hover:bg-black text-white font-bold text-xs uppercase tracking-[0.18em] rounded-[12px] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <span>{bannerData.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CENTER COLUMN: LIFESTYLE MODEL IMAGE */}
          <div className="relative w-full lg:w-[38%] min-h-[280px] sm:min-h-[360px] lg:min-h-[420px] bg-[#F5F5F3] overflow-hidden">
            <img
              src={bannerData.image}
              alt="Clinza New Arrivals Banner"
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Subtle Gradient Overlays for smooth edge blending on smaller screens */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:hidden pointer-events-none" />
          </div>

          {/* RIGHT COLUMN: 4 PREMIUM FEATURES (~27%) */}
          <div className="w-full lg:w-[27%] p-6 sm:p-8 lg:p-10 bg-[#FAFAF8] border-t lg:border-t-0 lg:border-l border-[#EAE8E3] flex flex-col justify-center">
            <div className="space-y-6">
              {bannerData.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 pb-5 border-b border-[#EAE8E3] last:border-b-0 last:pb-0 transition-all duration-200 hover:translate-x-1"
                >
                  <div className="shrink-0 p-2.5 rounded-[10px] bg-white border border-[#E0DDD7] shadow-2xs">
                    {renderIcon(feature.icon)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#111111] tracking-tight mb-0.5">
                      {feature.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-light leading-snug">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
