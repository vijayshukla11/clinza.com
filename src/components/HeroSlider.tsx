/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HomepageSlidesService } from "../services/supabaseService";

interface HeroSliderProps {
  setRoute: (route: string) => void;
  scrollToAI: () => void;
}

export default function HeroSlider({ setRoute, scrollToAI }: HeroSliderProps) {
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
  }, []);

  // Auto slide every 5 seconds as requested, pause on hover
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
    setTimeout(() => setAnimating(false), 500);
  };

  const handlePrev = () => {
    if (animating || slides.length === 0) return;
    setAnimating(true);
    setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setAnimating(false), 500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) { // threshold of 50px
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  if (loading) {
    return (
      <section className="relative h-[55vh] xs:h-[60vh] sm:h-[92vh] sm:min-h-[700px] sm:max-h-[950px] w-full bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 font-mono text-xs gap-3">
        <Loader className="h-6 w-6 animate-spin text-orange-500" />
        INITIALIZING LUXURY SLIDER...
      </section>
    );
  }

  if (slides.length === 0) {
    // Elegant fallback empty state as requested: "If a table is empty, show a proper empty state instead of loading demo data."
    return (
      <section className="relative h-[55vh] xs:h-[60vh] sm:h-[92vh] sm:min-h-[700px] sm:max-h-[950px] w-full bg-zinc-950 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-xl space-y-6">
          <span className="text-[10px] font-black tracking-[0.3em] text-orange-500 uppercase font-mono block">
            CLINZA ATELIER
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-black tracking-tight text-white uppercase leading-none">
            LUXURY APPAREL
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans font-light leading-relaxed max-w-md mx-auto">
            Our homepage showcase is ready for curation. Add beautiful high-fidelity slides inside the Admin Panel to feature products here.
          </p>
          <button
            onClick={() => setRoute("shop-all-collections")}
            className="inline-block px-8 py-4 bg-white text-black text-xs font-mono font-black uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-colors"
          >
            Explore Wardrobe
          </button>
        </div>
      </section>
    );
  }

  const defaultSlides = [
    {
      id: "hero-slide-1",
      badge: "NEW COLLECTION",
      title: "EFFORTLESS STYLE.\nEVERYDAY YOU.",
      description: "Premium fabrics. Timeless designs.\nMade for the modern man.",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2000",
      button1Text: "SHOP NOW",
      button1Link: "collections/all",
      button2Text: "EXPLORE COMBOS",
      button2Link: "collections/combos"
    },
    {
      id: "hero-slide-2",
      badge: "EUROPEAN FLAX",
      title: "TACTILE TEXTURAL\nLINEN SHIRTS",
      description: "Breathable European flax and pure combed yarns crafted for the modern wardrobe.",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=2000",
      button1Text: "SHOP NOW",
      button1Link: "collections/shirts",
      button2Text: "EXPLORE COMBOS",
      button2Link: "collections/combos"
    }
  ];

  const activeSlides = slides.length > 0 ? slides : defaultSlides;
  const currentSlide = activeSlides[activeIdx % activeSlides.length] as any;

  // Extract dynamic values with fallback
  const title = currentSlide.title || "EFFORTLESS STYLE.\nEVERYDAY YOU.";
  const description = currentSlide.description || "Premium fabrics. Timeless designs.\nMade for the modern man.";
  const image = currentSlide.image || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2000";
  const badgeText = currentSlide.badge || "NEW COLLECTION";
  const primaryButtonText = currentSlide.button1Text || "SHOP NOW";
  const primaryButtonLink = currentSlide.button1Link || "collections/all";
  const secondaryButtonText = currentSlide.button2Text || "EXPLORE COMBOS";
  const secondaryButtonLink = currentSlide.button2Link || "collections/combos";

  return (
    <section 
      id="hero-minimal-editorial-slider" 
      className="relative w-full h-[520px] sm:h-[620px] md:h-[700px] lg:h-[760px] bg-[#F5F3EF] overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. FULL WIDTH LIFESTYLE CAMPAIGN IMAGE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, scale: 1.01 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={image}
            alt="Clinza Luxury Fashion Campaign"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* 2. LIGHT SOFT VIGNETTE OVERLAY BEHIND TEXT */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "linear-gradient(90deg, rgba(245,243,239,0.75) 0%, rgba(245,243,239,0.45) 40%, rgba(245,243,239,0.05) 70%, transparent 100%)"
        }}
      />

      {/* 3. CONTENT OVERLAY (POSITIONED ~8% FROM LEFT) */}
      <div className="absolute left-6 sm:left-12 lg:left-[8%] top-1/2 -translate-y-1/2 z-20 max-w-[500px] pr-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-5 text-left"
          >
            {/* SMALL UPPERCASE LABEL */}
            {badgeText && (
              <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#111111] block">
                {badgeText}
              </span>
            )}

            {/* MAIN EDITORIAL HEADING */}
            <h1 className="text-[36px] sm:text-[50px] lg:text-[62px] font-bold leading-[1.02] text-[#111111] uppercase tracking-tight whitespace-pre-line">
              {title}
            </h1>

            {/* DESCRIPTION */}
            {description && (
              <p className="text-sm sm:text-base lg:text-[17px] font-normal leading-relaxed text-[#333333] max-w-[440px] whitespace-pre-line">
                {description}
              </p>
            )}

            {/* BUTTONS */}
            <div className="flex flex-row items-center gap-3.5 pt-2">
              <button
                id="hero-shop-now-btn"
                onClick={() => setRoute(primaryButtonLink)}
                className="h-[48px] px-8 bg-[#111111] text-white text-xs font-bold uppercase tracking-[0.15em] rounded-[4px] hover:bg-black hover:shadow-md transition-all duration-250 cursor-pointer flex items-center justify-center border border-[#111111]"
              >
                {primaryButtonText}
              </button>

              <button
                id="hero-explore-combos-btn"
                onClick={() => setRoute(secondaryButtonLink)}
                className="h-[48px] px-8 bg-[#EAE7E0] hover:bg-[#E2DFD7] text-[#111111] border border-[#D5D2C9] text-xs font-bold uppercase tracking-[0.15em] rounded-[4px] transition-all duration-250 cursor-pointer flex items-center justify-center"
              >
                {secondaryButtonText}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. SLIDER CHEVRON ARROWS */}
      <button
        id="hero-prev-arrow-btn"
        onClick={handlePrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 text-white/90 hover:text-white hover:scale-110 transition-all bg-transparent border-0 p-2 cursor-pointer focus:outline-none drop-shadow-md"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10 stroke-[2]" />
      </button>

      <button
        id="hero-next-arrow-btn"
        onClick={handleNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 text-white/90 hover:text-white hover:scale-110 transition-all bg-transparent border-0 p-2 cursor-pointer focus:outline-none drop-shadow-md"
        aria-label="Next slide"
      >
        <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10 stroke-[2]" />
      </button>

      {/* 5. PAGINATION DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
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
                  setTimeout(() => setAnimating(false), 500);
                }
              }}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                isActive ? "w-2.5 bg-[#111111]" : "w-2.5 bg-white border border-[#111111]/30 hover:bg-[#111111]/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          );
        })}
      </div>
    </section>
  );
}
