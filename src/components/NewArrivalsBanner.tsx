/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
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
  ctaText: "Shop New Arrivals",
  ctaLink: "collections/new-arrivals",
  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600",
  features: []
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

  return (
    <section id="new-arrivals-banner-section" className="py-10 md:py-14 lg:py-16 px-4 sm:px-8 lg:px-12 bg-[#FAFAF8] text-left">
      <div className="max-w-[1440px] mx-auto">
        {/* SINGLE FULL-WIDTH CAMPAIGN BANNER */}
        <div className="relative w-full rounded-[20px] overflow-hidden bg-zinc-900 shadow-sm min-h-[420px] h-[440px] sm:h-[500px] md:h-[600px] lg:h-[660px] flex items-center">
          {/* BACKGROUND IMAGE */}
          <img
            src={bannerData.image}
            alt={bannerData.heading || "New Arrivals Campaign"}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* SUBTLE DARK GRADIENT OVERLAY FOR READABILITY */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />

          {/* EDITORIAL CONTENT */}
          <div className="relative z-20 w-full max-w-[640px] p-6 sm:p-10 md:p-14 lg:p-16 flex flex-col items-start text-white">
            {/* CAMPAIGN LABEL */}
            {bannerData.label && (
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-zinc-300 block mb-3 font-mono">
                {bannerData.label}
              </span>
            )}

            {/* LARGE HEADING */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-white uppercase mb-4">
              {bannerData.heading || "Fresh Styles."}
              {bannerData.headingHighlight && (
                <>
                  <br />
                  <span className="text-zinc-300 font-light text-[0.88em]">
                    {bannerData.headingHighlight}
                  </span>
                </>
              )}
            </h2>

            {/* SHORT SUBTITLE (MAX 2 LINES) */}
            {bannerData.description && (
              <p className="text-xs sm:text-sm md:text-base text-zinc-200 font-light leading-relaxed line-clamp-2 max-w-md mb-8">
                {bannerData.description}
              </p>
            )}

            {/* CTA BUTTON */}
            <button
              id="shop-new-arrivals-cta"
              onClick={() => {
                setRoute(bannerData.ctaLink || "collections/new-arrivals");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-[48px] px-[32px] bg-white text-black hover:bg-black hover:text-white border border-white rounded-full text-[13px] sm:text-[14px] font-semibold tracking-[0.08em] uppercase transition-all duration-[250ms] ease-out shadow-md hover:shadow-xl cursor-pointer inline-flex items-center justify-center gap-2 group"
            >
              <span>{bannerData.ctaText || "Shop New Arrivals"}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
