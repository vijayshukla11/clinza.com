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
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  banner?: string;
}

const DEFAULT_BANNER_DATA: NewArrivalsBannerData = {
  label: "NEW ARRIVALS",
  heading: "Fresh Styles.",
  headingHighlight: "New Vibes.",
  description: "Discover our latest seasonal drops crafted with fine breathable linens, structured cottons, and refined minimalist fits.",
  ctaText: "Shop New Arrivals",
  ctaLink: "collections/new-arrivals",
  image: "",
  features: []
};

// Helper to strip any trailing arrows or extra symbols from button text
function formatCtaText(text: string): string {
  if (!text) return "Shop New Arrivals";
  return text.replace(/[→\->\s]+$/, "").trim();
}

export default function NewArrivalsBanner({ setRoute, title, subtitle, ctaText, ctaUrl, banner }: NewArrivalsBannerProps) {
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
    const handleUpdate = () => loadBannerConfig();
    window.addEventListener("clinza_homepage_updated", handleUpdate);
    window.addEventListener("clinza_theme_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("clinza_homepage_updated", handleUpdate);
      window.removeEventListener("clinza_theme_updated", handleUpdate);
    };
  }, []);

  const displayTitle = title || `${bannerData.heading} ${bannerData.headingHighlight || ""}`.trim();
  const displaySubtitle = subtitle || bannerData.label;
  const displayCta = formatCtaText(ctaText || bannerData.ctaText);
  const displayLink = ctaUrl || bannerData.ctaLink;
  const displayImage = banner || bannerData.image || "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png";

  return (
    <section id="new-arrivals-banner-section" className="py-8 sm:py-12 md:py-14 lg:py-16 px-4 sm:px-8 lg:px-12 bg-[#FAFAF8] text-left">
      <div className="max-w-[1440px] mx-auto">
        {/* SINGLE FULL-WIDTH CAMPAIGN POSTER BANNER */}
        <div className="relative w-full rounded-[20px] sm:rounded-[24px] overflow-hidden bg-zinc-900 shadow-sm min-h-[420px] h-[460px] sm:h-[520px] md:h-[600px] lg:h-[660px] flex items-end sm:items-center">
          {/* BACKGROUND IMAGE */}
          <img
            src={displayImage}
            alt={displayTitle || "New Arrivals Campaign"}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* DUAL GRADIENT OVERLAY FOR CRISP LEGIBILITY ON MOBILE AND DESKTOP */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 sm:bg-gradient-to-r sm:from-black/90 sm:via-black/55 sm:to-transparent pointer-events-none z-10" />
          <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />

          {/* EDITORIAL POSTER CONTENT */}
          <div className="relative z-20 w-full max-w-[640px] p-6 sm:p-10 md:p-14 lg:p-16 flex flex-col items-start text-left text-white">
            {/* CAMPAIGN LABEL */}
            {displaySubtitle && (
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-zinc-300 block mb-2 sm:mb-3 font-mono">
                {displaySubtitle}
              </span>
            )}

            {/* LARGE HEADING */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-white uppercase mb-3 sm:mb-4">
              {displayTitle}
            </h2>

            {/* SHORT SUBTITLE / DESCRIPTION */}
            {bannerData.description && (
              <p className="text-xs sm:text-sm md:text-base text-zinc-200 font-light leading-relaxed line-clamp-3 sm:line-clamp-2 max-w-md mb-6 sm:mb-8">
                {bannerData.description}
              </p>
            )}

            {/* CTA BUTTON */}
            <button
              id="shop-new-arrivals-cta"
              onClick={() => {
                setRoute(displayLink || "collections/new-arrivals");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-[48px] sm:h-[54px] px-6 sm:px-8 btn-premium-maroon rounded-full text-[12px] sm:text-[14px] font-bold tracking-[0.08em] uppercase transition-all duration-[250ms] ease-out shadow-lg cursor-pointer inline-flex items-center justify-center gap-2.5 group"
            >
              <span>{displayCta}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

