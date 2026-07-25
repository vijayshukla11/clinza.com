/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { HomepageSettingsService } from "../services/supabaseService";

interface LookbookData {
  label: string;
  heading: string;
  headingLine2?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  mainImage: string;
  secondaryImage?: string;
  isPublished?: boolean;
}

interface LookbookSectionProps {
  setRoute: (route: string) => void;
}

const DEFAULT_LOOKBOOK_DATA: LookbookData = {
  label: "LOOKBOOK",
  heading: "Designed for",
  headingLine2: "Modern Living.",
  description: "Discover effortless dressing with breathable fabrics, refined tailoring and timeless silhouettes designed for everyday confidence.",
  buttonText: "EXPLORE LOOKBOOK",
  buttonLink: "collections/all",
  mainImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1400",
  secondaryImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=900",
  isPublished: true
};

export default function LookbookSection({ setRoute }: LookbookSectionProps) {
  const [data, setData] = useState<LookbookData>(DEFAULT_LOOKBOOK_DATA);

  useEffect(() => {
    let isMounted = true;
    async function loadLookbookConfig() {
      try {
        const config = await HomepageSettingsService.getById("homepage");
        if (config && (config as any).lookbookSection) {
          if (isMounted) {
            setData({
              ...DEFAULT_LOOKBOOK_DATA,
              ...(config as any).lookbookSection
            });
          }
        }
      } catch (err) {
        console.warn("Using default Lookbook section data:", err);
      }
    }
    loadLookbookConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  if (data.isPublished === false) {
    return null;
  }

  return (
    <section id="lookbook-editorial-section" className="py-12 md:py-14 lg:py-16 px-4 sm:px-8 lg:px-12 bg-[#FAFAF8] text-left overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* LEFT COLUMN: EDITORIAL TEXT (40%) */}
          <div className="w-full lg:w-[40%] flex flex-col justify-center items-start pr-0 lg:pr-6">
            {/* SMALL LABEL */}
            <span className="text-[11px] font-bold uppercase tracking-[6px] text-[#888888] block mb-4 font-mono">
              {data.label}
            </span>

            {/* MAIN HEADING */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] leading-[1.15] font-bold text-[#111111] tracking-tight mb-6">
              {data.heading}
              {data.headingLine2 && (
                <>
                  <br />
                  <span className="font-serif italic font-normal text-gray-800">{data.headingLine2}</span>
                </>
              )}
            </h2>

            {/* PARAGRAPH */}
            <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed max-w-[420px] mb-8">
              {data.description}
            </p>

            {/* BUTTON */}
            <button
              id="explore-lookbook-btn"
              onClick={() => {
                setRoute(data.buttonLink || "collections/all");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 h-[56px] bg-[#111111] hover:bg-black text-white font-bold text-xs uppercase tracking-[0.18em] rounded-[10px] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <span>{data.buttonText}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* RIGHT COLUMN: EDITORIAL LIFESTYLE PHOTOGRAPHY (60%) */}
          <div className="w-full lg:w-[60%] relative">
            {/* MAIN IMAGE */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[14/11] lg:aspect-[14/10] rounded-[16px] overflow-hidden bg-[#F2F0EC] shadow-sm group/img">
              <img
                src={data.mainImage}
                alt={data.heading || "Clinza Lookbook Editorial"}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover/img:scale-[1.03] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            </div>

            {/* SECONDARY FLOATING OVERLAPPING IMAGE (DESKTOP ONLY) */}
            {data.secondaryImage && (
              <div className="hidden sm:block absolute -bottom-8 -left-8 w-[40%] sm:w-[35%] aspect-[3/4] rounded-[12px] overflow-hidden border-4 border-white shadow-2xl z-20 group/sec hidden md:block">
                <img
                  src={data.secondaryImage}
                  alt="Clinza Lookbook Detail"
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover/sec:scale-[1.05] transition-transform duration-500 ease-out"
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
