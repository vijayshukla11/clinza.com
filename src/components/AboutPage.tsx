/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Award, Compass, Heart, Leaf, ShieldAlert, Sparkles, Star } from "lucide-react";

export default function AboutPage() {
  return (
    <div id="about-page-container" className="bg-zinc-50 py-24 px-4 sm:px-6 lg:px-8 text-left animate-fade-in font-sans">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* HERO HEADER */}
        <div className="text-center space-y-4">
          <span className="text-[10px] font-black tracking-[0.25em] text-orange-650 uppercase font-mono bg-orange-600/10 px-4 py-1.5 rounded-full inline-block">
            Our Architectural Heritage
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950 uppercase">
            The CLINZA Manifesto
          </h1>
          <p className="text-gray-500 font-light text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Meticulously engineering premium garments since 2026. Combining high-grade raw Normandy flax linen, Japanese shuttle loom denims, and bespoke digital precision.
          </p>
        </div>

        {/* IMAGE BANNER */}
        <div className="rounded-3xl overflow-hidden aspect-[21/9] shadow-xl border border-gray-200">
          <img 
            src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1200" 
            alt="CLINZA Atelier and Looming"
            className="w-full h-full object-cover grayscale opacity-95 hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* THREE CORE PRINCIPLES BENTO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-150 space-y-4">
            <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F27D26]">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-gray-950">Normandy Linen</h3>
            <p className="text-gray-500 text-xs leading-relaxed font-light">
              We cultivate raw European flax from premium farms in Normandy, France. Spun into long-staple fibers for peerless longevity and heat regulation.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-150 space-y-4">
            <div className="h-12 w-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-gray-900">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-gray-950">Selvedge Denim</h3>
            <p className="text-gray-500 text-xs leading-relaxed font-light">
              Our raw denim is slowly woven on vintage antique shuttle machines to maximize dimensional texture, high-tensile resistance, and beautiful wash drapes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-150 space-y-4">
            <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F27D26]">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-gray-950">Staff Tailoring</h3>
            <p className="text-gray-500 text-xs leading-relaxed font-light">
              Every detail, from the real mother-of-pearl hardware attachments to reinforced double flat-felled stitches, is hand-finished in curated ateliers.
            </p>
          </div>
        </div>

        {/* STORY EDITORIAL */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-150 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-950 border-b border-gray-100 pb-4">
            Our Production Architecture
          </h2>
          <div className="space-y-4 text-gray-600 text-xs sm:text-sm font-light leading-relaxed">
            <p>
              At CLINZA, we hold a deep physical reverence for premium fibers. We reject the generic fast-fashion cycle, which yields disposable polymer meshes and unstable synthetic threads. Instead, our design laboratory focuses exclusively on raw materials that breathe, age elegantly, and maintain structural pride over years of washing.
            </p>
            <p>
              By aligning high-grade European agricultural flaxes with Indian artisan looming techniques, every tailored piece reflects supreme organic excellence. Our pieces are vacuum-sealed at our centralized Mumbai distribution lounge and shipped straight to you with premium ecological packaging.
            </p>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="bg-zinc-950 p-6 rounded-2xl text-white">
            <p className="text-2xl sm:text-3.5xl font-extrabold font-mono text-[#F27D26]">100%</p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono mt-1">Organic Flax</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-2xl text-white">
            <p className="text-2xl sm:text-3.5xl font-extrabold font-mono text-[#F27D26]">13.5 oz</p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono mt-1">Raw Selvedge</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-2xl text-white">
            <p className="text-2xl sm:text-3.5xl font-extrabold font-mono text-[#F27D26]">4.9★</p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono mt-1">Global Reviews</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-2xl text-white">
            <p className="text-2xl sm:text-3.5xl font-extrabold font-mono text-[#F27D26]">21+</p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono mt-1">Ateliers Loomed</p>
          </div>
        </div>

      </div>
    </div>
  );
}
