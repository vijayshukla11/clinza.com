/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Truck, RotateCcw, ShieldCheck, Award } from "lucide-react";
import { motion } from "motion/react";

interface FeatureCard {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
}

const FEATURES: FeatureCard[] = [
  {
    id: 1,
    title: "Free Shipping",
    description: "Reliable and trackable shipping dispatched within 24 hours.",
    icon: Truck,
    iconColor: "text-amber-500"
  },
  {
    id: 2,
    title: "Easy Returns",
    description: "Frictionless 15-day simple return or exchange window.",
    icon: RotateCcw,
    iconColor: "text-amber-500"
  },
  {
    id: 3,
    title: "Secure Checkout",
    description: "Industry-standard solid end-to-end payment encryption.",
    icon: ShieldCheck,
    iconColor: "text-amber-500"
  },
  {
    id: 4,
    title: "Premium Quality",
    description: "Certified European long-staple flax and pure combed yarns.",
    icon: Award,
    iconColor: "text-amber-500"
  }
];

export default function FeaturesSection() {
  return (
    <section id="clinza-brand-features" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-950 relative overflow-hidden border-t border-zinc-900">
      
      {/* Background ambient light arcs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[150px] md:w-[600px] md:h-[300px] bg-gradient-to-tr from-orange-600/5 to-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        {/* Title Elements */}
        <div className="mb-6 md:mb-10 text-center space-y-1 border-b border-zinc-900 pb-4">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#F27D26] block"
          >
            The Clinza Experience
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3.5xl font-sans font-black text-white uppercase tracking-tight"
          >
            Sartorial Standards
          </motion.h2>
        </div>

        {/* Features 2x2 on Mobile, 4x1 on Large Screens */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          {FEATURES.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                id={`feature-card-${feat.id}`}
                viewport={{ once: true, margin: "-30px" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                whileHover={{ 
                  y: -4, 
                  borderColor: "rgba(242, 125, 38, 0.5)"
                }}
                className="group relative flex flex-col items-center text-center p-4 md:p-8 bg-zinc-900/40 border border-zinc-800/60 rounded-none backdrop-blur-md transition-all duration-300"
              >
                {/* Floating shine layer on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Icon wrapper with glow element */}
                <div className="relative mb-3 md:mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 bg-orange-500/10 rounded-none blur-xl scale-0 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-none bg-zinc-850/80 border border-zinc-800/80 flex items-center justify-center group-hover:border-orange-500/30 group-hover:bg-zinc-800 transition-all duration-300">
                    <Icon className={`w-5 h-5 md:w-7 md:h-7 ${feat.iconColor} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`} />
                  </div>
                </div>

                {/* Text specs */}
                <h3 className="text-xs md:text-lg font-sans font-bold text-white mb-1 md:mb-3 tracking-wide">
                  {feat.title}
                </h3>
                <p className="text-zinc-500 text-[10px] md:text-xs font-sans leading-normal md:leading-relaxed max-w-[140px] md:max-w-none">
                  {feat.description}
                </p>

                {/* Absolute status corners */}
                <span className="absolute bottom-3 right-3 h-1 w-1 rounded-none bg-orange-500/0 group-hover:bg-orange-500/60 transition-all duration-300" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
