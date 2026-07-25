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
      <section className="relative h-[480px] sm:h-[520px] md:h-[580px] lg:h-[620px] w-full bg-zinc-50 flex flex-col items-center justify-center text-zinc-400 font-mono text-xs gap-3">
        <Loader className="h-6 w-6 animate-spin text-black" />
        <span className="tracking-[0.2em] uppercase font-bold text-zinc-500">Loading Editorial Showcase...</span>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-[480px] sm:h-[520px] md:h-[580px] lg:h-[620px] w-full bg-zinc-900 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-md space-y-6">
          <span className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase font-mono block">
            CLINZA ATELIER
          </span>
          <h1 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-white uppercase leading-none">
            Editorial Showcase
          </h1>
          <p className="text-zinc-400 text-sm font-sans font-light leading-relaxed">
            Our homepage hero carousel is ready for curation. Add high-fidelity slides inside the Admin Panel.
          </p>
          <button
            onClick={() => setRoute("shop-all-collections")}
            className="inline-block px-8 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-[0.18em] rounded-[6px] hover:bg-zinc-200 transition-colors cursor-pointer"
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
      title: "PREMIUM LINEN SHIRTS",
      description: "Crafted for effortless everyday luxury.",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2000",
      button1Text: "SHOP COLLECTION",
      button1Link: "collections/all",
      button2Text: "DISCOVER MORE",
      button2Link: "collections/combos"
    },
    {
      id: "hero-slide-2",
      badge: "RESORT '26",
      title: "EUROPEAN FLAX LINEN",
      description: "Tactile breathability in sophisticated neutral tones.",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=2000",
      button1Text: "SHOP LINEN",
      button1Link: "collections/shirts",
      button2Text: "VIEW COMBOS",
      button2Link: "collections/combos"
    }
  ];

  const activeSlides = slides.length > 0 ? slides : defaultSlides;
  const currentSlide = activeSlides[activeIdx % activeSlides.length] as any;

  // Extract dynamic values with fallback
  const title = currentSlide.title || "PREMIUM LINEN SHIRTS";
  const description = currentSlide.description || "Crafted for effortless everyday luxury.";
  const image = currentSlide.image || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2000";
  const badgeText = currentSlide.badge || "NEW COLLECTION";
  const primaryButtonText = currentSlide.button1Text || "SHOP COLLECTION";
  const primaryButtonLink = currentSlide.button1Link || "collections/all";
  const secondaryButtonText = currentSlide.button2Text || "DISCOVER MORE";
  const secondaryButtonLink = currentSlide.button2Link || "collections/combos";

  return (
    <section 
      id="hero-minimal-editorial-slider" 
      className="relative w-full h-[58vh] sm:h-[60vh] md:h-[62vh] lg:h-[68vh] xl:h-[72vh] min-h-[380px] max-h-[720px] bg-[#F9F9F8] overflow-hidden select-none mb-0 pb-0"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
          <img
            src={image}
            alt={currentSlide?.altText || title || "Campaign Poster"}
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* 2. MINIMAL HIGH-CONTRAST CTA BUTTON */}
      <div className="absolute bottom-8 left-6 sm:bottom-10 sm:left-10 lg:bottom-12 lg:left-14 z-20">
        <button
          id="hero-explore-collection-btn"
          onClick={() => setRoute(primaryButtonLink)}
          className="h-[46px] px-[30px] bg-black text-white hover:bg-white hover:text-black border border-black rounded-full text-[13px] sm:text-[14px] font-semibold tracking-[0.08em] uppercase transition-all duration-[250ms] ease-out shadow-sm hover:shadow-md cursor-pointer inline-flex items-center justify-center"
        >
          {primaryButtonText || "Explore Collection"}
        </button>
      </div>

      {/* 3. SLIDER CONTROLS (44px CIRCLES MOVED INWARD) */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-12 lg:bottom-12 lg:right-16 z-20 flex items-center gap-2.5">
          <button
            id="hero-prev-arrow-btn"
            onClick={handlePrev}
            className="w-[44px] h-[44px] rounded-full border border-black/15 bg-white/90 hover:bg-black hover:text-white backdrop-blur-xs flex items-center justify-center text-black transition-all duration-[250ms] ease-out shadow-xs cursor-pointer focus:outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4 stroke-[2]" />
          </button>

          <button
            id="hero-next-arrow-btn"
            onClick={handleNext}
            className="w-[44px] h-[44px] rounded-full border border-black/15 bg-white/90 hover:bg-black hover:text-white backdrop-blur-xs flex items-center justify-center text-black transition-all duration-[250ms] ease-out shadow-xs cursor-pointer focus:outline-none"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4 stroke-[2]" />
          </button>
        </div>
      )}

      {/* 4. MINIMAL LINE SLIDE INDICATORS */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
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
                className={`h-[2px] transition-all duration-300 cursor-pointer focus:outline-none rounded-full ${
                  isActive ? "w-6 bg-black" : "w-2 bg-black/20 hover:bg-black/40"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
