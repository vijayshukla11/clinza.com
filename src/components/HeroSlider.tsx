/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HomepageSlidesService } from "../services/supabaseService";

interface HeroSliderProps {
  setRoute: (route: string) => void;
  scrollToAI?: () => void;
}

export default function HeroSlider({ setRoute }: HeroSliderProps) {
  const [slides, setSlides] = useState<any[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadSlides() {
      try {
        setLoading(true);
        const list = await HomepageSlidesService.getSlides();
        setSlides(list || []);
      } catch (err) {
        console.error("Failed to load hero slides from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSlides();

    const handleUpdate = () => loadSlides();
    window.addEventListener("clinza_homepage_updated", handleUpdate);
    window.addEventListener("clinza_theme_updated", handleUpdate);
    return () => {
      window.removeEventListener("clinza_homepage_updated", handleUpdate);
      window.removeEventListener("clinza_theme_updated", handleUpdate);
    };
  }, []);

  // Auto slide every 5 seconds, pause on hover
  useEffect(() => {
    if (slides.length <= 1 || isHovered || loading) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [activeIdx, slides.length, isHovered, loading]);

  const handleNext = () => {
    if (animating || slides.length === 0) return;
    setAnimating(true);
    setActiveIdx((prev) => (prev + 1) % slides.length);
    setTimeout(() => setAnimating(false), 600);
  };

  const handlePrev = () => {
    if (animating || slides.length === 0) return;
    setAnimating(true);
    setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setAnimating(false), 600);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  if (loading) {
    return (
      <section 
        id="hero-skeleton-loader" 
        className="relative w-full h-[46vh] sm:h-[52vh] md:h-[60vh] lg:h-[68vh] xl:h-[72vh] min-h-[300px] sm:min-h-[360px] max-h-[720px] bg-zinc-100 overflow-hidden mb-0 pb-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-200/60 via-zinc-100 to-zinc-200/60 animate-pulse" />
        <div className="absolute bottom-[24px] left-[16px] sm:bottom-[44px] sm:left-[44px] lg:bottom-[48px] lg:left-[48px] z-10 space-y-2 sm:space-y-3">
          <div className="h-3 w-28 bg-zinc-300/70 rounded-full animate-pulse" />
          <div className="h-7 sm:h-8 w-48 sm:w-80 bg-zinc-300/80 rounded-md animate-pulse" />
          <div className="h-[44px] w-[160px] sm:w-[180px] bg-zinc-300/90 rounded-full mt-2 animate-pulse" />
        </div>
        <div className="absolute bottom-[10px] sm:bottom-[18px] left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          <div className="h-[3px] w-8 bg-zinc-300 rounded-full animate-pulse" />
          <div className="h-[3px] w-3 bg-zinc-300/50 rounded-full animate-pulse" />
          <div className="h-[3px] w-3 bg-zinc-300/50 rounded-full animate-pulse" />
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative w-full h-[320px] sm:h-[420px] bg-zinc-900 flex flex-col items-center justify-center text-center px-4 sm:px-6 text-white my-0">
        <div className="max-w-md space-y-3 sm:space-y-4">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#F27D26] uppercase block">
            CLINZA ATELIER
          </span>
          <h2 className="text-xl sm:text-3xl font-sans font-bold uppercase tracking-tight text-white">
            Editorial Showcase
          </h2>
          <p className="text-zinc-400 text-xs font-sans leading-relaxed">
            Our seasonal campaign carousel is currently being updated.
          </p>
          <button
            onClick={() => setRoute("shop-all-collections")}
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Explore Wardrobe
          </button>
        </div>
      </section>
    );
  }

  const activeSlides = slides;
  const currentSlide = activeSlides[activeIdx % activeSlides.length] as any;

  // Extract dynamic values
  const title = currentSlide.title || "CLINZA COLLECTION";
  const desktopImage = currentSlide.desktopImage || currentSlide.image || "";
  const rawMobileImage = currentSlide.mobileImage;
  const hasMobileImage = Boolean(rawMobileImage && typeof rawMobileImage === "string" && rawMobileImage.trim() !== "" && rawMobileImage !== desktopImage);
  const mobileImage = hasMobileImage ? rawMobileImage : desktopImage;
  const primaryButtonText = currentSlide.button1Text || "Explore Collection";
  const primaryButtonLink = currentSlide.button1Link || currentSlide.route || "collections/all";

  return (
    <section 
      id="hero-minimal-editorial-slider" 
      className="relative w-full h-[44vh] sm:h-[52vh] md:h-[60vh] lg:h-[68vh] xl:h-[72vh] min-h-[280px] sm:min-h-[360px] max-h-[720px] bg-[#F9F9F8] overflow-hidden select-none mb-0 pb-0"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visually hidden primary H1 for search engine crawlers */}
      <div className="sr-only">
        <h1>CLINZA | Luxury European Linen & Tailored Menswear</h1>
        <p>{title}</p>
      </div>

      {/* 1. EDITORIAL FULL-WIDTH CAMPAIGN ARTWORK */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {desktopImage || mobileImage ? (
            <picture className="w-full h-full block">
              {hasMobileImage && (
                <source media="(max-width: 639px)" srcSet={mobileImage} />
              )}
              <img
                src={desktopImage || mobileImage}
                alt={currentSlide?.altText || title || "Campaign Poster"}
                className={`w-full h-full object-center ${
                  hasMobileImage ? 'object-cover' : 'object-cover max-sm:object-contain bg-[#F4F3EF]'
                }`}
                loading="eager"
              />
            </picture>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 2. BOTTOM-LEFT CTA BUTTON */}
      <div className="absolute bottom-[20px] left-[16px] sm:bottom-[36px] sm:left-[36px] lg:bottom-[40px] lg:left-[40px] z-20">
        <button
          id="hero-explore-collection-btn"
          onClick={() => setRoute(primaryButtonLink)}
          className="group h-[40px] sm:h-[42px] px-[18px] sm:px-[24px] bg-gradient-to-r from-[#5B1824] via-[#4A121D] to-[#3B0E17] text-white border border-white/40 hover:border-white rounded-full text-[11px] sm:text-[12px] font-bold tracking-[0.1em] uppercase transition-all duration-300 ease-out shadow-md hover:shadow-xl hover:shadow-[#5B1824]/40 hover:scale-[1.03] active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>{primaryButtonText || "Explore Collection"}</span>
          <ArrowRight className="h-3.5 w-3.5 text-amber-300 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>

      {/* 3. CENTERED PAGINATION DOTS AT BOTTOM */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-[8px] sm:bottom-[16px] left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5">
          {activeSlides.map((_, index) => {
            const isActive = index === activeIdx;
            return (
              <button
                id={`hero-pagination-dot-${index}`}
                key={index}
                onClick={() => {
                  if (!animating) {
                    setAnimating(true);
                    setActiveIdx(index);
                    setTimeout(() => setAnimating(false), 600);
                  }
                }}
                className="p-1 focus:outline-none cursor-pointer"
                aria-label={`Go to slide ${index + 1}`}
              >
                <span className={`block h-[3px] transition-all duration-300 rounded-full ${
                  isActive ? "w-7 sm:w-8 bg-[#5B1824] shadow-xs" : "w-2.5 sm:w-3 bg-black/30 hover:bg-[#5B1824]/60"
                }`} />
              </button>
            );
          })}
        </div>
      )}

      {/* 4. CORNER SLIDER NAVIGATION ARROWS (MINIMAL MAROON & WHITE) */}
      {activeSlides.length > 1 && (
        <div className="flex absolute bottom-[20px] right-[16px] sm:bottom-[36px] sm:right-[36px] lg:bottom-[40px] lg:right-[40px] z-20 items-center gap-2">
          <button
            id="hero-prev-arrow-btn"
            onClick={handlePrev}
            className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full border border-white/80 bg-white/90 backdrop-blur-md text-[#5B1824] hover:bg-[#5B1824] hover:text-white hover:border-[#5B1824] hover:scale-110 active:scale-90 transition-all duration-300 ease-out shadow-sm hover:shadow-md flex items-center justify-center cursor-pointer focus:outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
          </button>

          <button
            id="hero-next-arrow-btn"
            onClick={handleNext}
            className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full border border-amber-300/40 bg-[#5B1824] text-white hover:bg-[#43101A] hover:border-white hover:scale-110 active:scale-90 transition-all duration-300 ease-out shadow-md hover:shadow-lg hover:shadow-[#5B1824]/50 flex items-center justify-center cursor-pointer focus:outline-none"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </section>
  );
}
