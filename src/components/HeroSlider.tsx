/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getHomeConfig } from "../utils";

interface HeroSliderProps {
  setRoute: (route: string) => void;
  scrollToAI: () => void;
}

export default function HeroSlider({ setRoute, scrollToAI }: HeroSliderProps) {
  const slides = getHomeConfig().slides;
  const [activeIdx, setActiveIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  // Auto slide every 3 seconds as requested
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(timer);
  }, [activeIdx, slides.length]);

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

  if (slides.length === 0) {
    return null;
  }

  const currentSlide = slides[activeIdx];

  return (
    <section 
      id="hero-minimal-luxury-slider" 
      className="relative h-[85vh] sm:h-[90vh] w-full bg-[#fafafa] overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. HERO VISUAL - LIGHT GRADIENT OVERLAY ONLY */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Elegant light gradient overlay: readable text on left, 100% visible product image on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent z-10 pointer-events-none" />
            <img
              src={currentSlide.image}
              alt="Premium Collection model showcase"
              className="h-full w-full object-cover object-center sm:object-[center_35%]"
              loading="eager"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle modern soft lighting flare */}
      <div className="absolute top-10 left-10 w-[300px] h-[300px] rounded-full bg-white/20 blur-[100px] pointer-events-none z-1" />

      {/* 2. MINIMALIST FOREGROUND HERO CONTENT */}
      <div className="absolute inset-0 z-10 flex items-end sm:items-center px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto pb-20 sm:pb-0">
        <div className="max-w-xl text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 sm:space-y-6"
            >
              {/* BRAND BADGE */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/30 px-3.5 py-1 text-[10px] font-black font-mono tracking-[0.3em] text-white"
              >
                NEW COLLECTION
              </motion.div>

              {/* HEADING */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-black tracking-tight leading-[1.1] text-white uppercase select-none drop-shadow-sm">
                Premium Everyday Fashion
              </h1>

              {/* SUBHEADING */}
              <p className="text-white/95 text-xs sm:text-base font-sans font-light tracking-wide leading-relaxed max-w-md drop-shadow-sm">
                Timeless fits. Premium fabrics. Designed for modern India.
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex flex-row gap-4 pt-4">
                <button
                  id="hero-shop-collection-btn"
                  onClick={() => setRoute("collections/all")}
                  className="px-6 sm:px-8 py-4 bg-white text-zinc-950 text-xs uppercase tracking-widest font-black transition-all duration-300 hover:bg-zinc-900 hover:text-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer rounded-none border border-white"
                >
                  Shop Collection
                </button>

                <button
                  id="hero-shop-all-collections-btn"
                  onClick={() => setRoute("shop-all-collections")}
                  className="px-6 sm:px-8 py-4 bg-transparent text-white text-xs uppercase tracking-widest font-black transition-all duration-300 hover:bg-white hover:text-zinc-950 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer rounded-none border border-white backdrop-blur-xs"
                >
                  Shop All Collections
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. MINIMALIST CORNER SLIDER CONTROLS (ZARA STYLE) */}
      <div className="absolute right-4 sm:right-8 bottom-6 sm:bottom-10 z-20 flex items-center gap-2">
        <button
          id="hero-prev-arrow-btn"
          onClick={handlePrev}
          className="w-10 h-10 border border-white/30 bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black text-white transition-all cursor-pointer rounded-none"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          id="hero-next-arrow-btn"
          onClick={handleNext}
          className="w-10 h-10 border border-white/30 bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black text-white transition-all cursor-pointer rounded-none"
          aria-label="Next image"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 4. MODERN PROGRESS LINES (BOTTOM LEFT) */}
      <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-12 z-20 flex items-center gap-2 bg-black/20 backdrop-blur-md p-2 px-3.5 border border-white/10 rounded-none">
        {slides.map((slide, index) => {
          const isActive = index === activeIdx;
          return (
            <button
              id={`hero-progress-dot-${index}`}
              key={slide.id}
              onClick={() => {
                if (!animating) {
                  setAnimating(true);
                  setActiveIdx(index);
                  setTimeout(() => setAnimating(false), 500);
                }
              }}
              className="relative h-1 w-8 sm:w-14 bg-white/30 overflow-hidden cursor-pointer rounded-none focus:outline-none transition-all duration-300"
              aria-label={`Show design ${index + 1}`}
            >
              {isActive && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }} // 3 second auto-slide representation
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
