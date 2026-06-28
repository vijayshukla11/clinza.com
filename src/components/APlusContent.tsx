/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, Feather, Wind, ShieldCheck, ChevronRight, Award, Ruler } from "lucide-react";
import { APlusSection } from "../types";

interface APlusContentProps {
  block: APlusSection;
  name: string;
}

export default function APlusContent({ block, name }: APlusContentProps) {
  return (
    <section id={`aplus-section-${name.toLowerCase().replace(/\s+/g, "-")}`} className="border-t border-gray-100 pt-16 mt-16 max-w-5xl mx-auto">
      
      {/* SECTION HEADER EDITORIAL */}
      <div className="text-center md:text-left mb-10 border-b border-gray-100 pb-6">
        <h4 className="text-[10px] font-black tracking-[0.25em] text-orange-650 uppercase mb-1.5 font-mono">
          Premium Product Blueprint
        </h4>
        <h2 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-gray-950 uppercase">
          A+ Detail: Storytelling & Thread Engineering
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-12">
        {/* EDITORIAL NARRATIVE */}
        <div className="space-y-4 text-left">
          <h3 className="text-lg font-sans font-black tracking-tight text-gray-950 uppercase leading-snug">
            {block.title}
          </h3>
          <p className="text-gray-650 text-xs sm:text-sm font-sans leading-relaxed font-light">
            {block.description}
          </p>
          <div className="pt-2">
            <div className="flex items-center gap-2.5 text-xs text-orange-650 font-bold uppercase tracking-wider">
              <Award className="h-4.5 w-4.5 text-orange-600 shrink-0" />
              Normandy Flax Association Certified
            </div>
          </div>
        </div>

        {/* COMPARISON CHART MATRIX (AMAZON STYLING) */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[340px]">
            <thead>
              <tr className="border-b border-gray-250 pb-2">
                <th className="font-extrabold text-gray-400 uppercase text-[9px] tracking-wider py-1.5">FABRIC METRIC</th>
                <th className="font-extrabold text-orange-650 uppercase text-[9px] tracking-wider py-1.5">CLINZA LINEN</th>
                <th className="font-extrabold text-gray-500 uppercase text-[9px] tracking-wider py-1.5">SHORT COTTON</th>
                <th className="font-extrabold text-gray-500 uppercase text-[9px] tracking-wider py-1.5">POLYESTER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 align-baseline text-[11px]">
              <tr>
                <td className="py-2.5 font-bold text-gray-900">Breathability</td>
                <td className="py-2.5 text-green-600 font-extrabold">Maximum (140 GSM)</td>
                <td className="py-2.5 text-gray-600 font-medium">Moderate</td>
                <td className="py-2.5 text-red-500 font-medium">Minimal / Traps Heat</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-gray-900">Tensile Strength</td>
                <td className="py-2.5 text-green-600 font-extrabold">Ultra-High (Long staple)</td>
                <td className="py-2.5 text-gray-500 font-medium">Medium</td>
                <td className="py-2.5 text-gray-500 font-medium">Degrades quickly</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-gray-900">Crease Recovery</td>
                <td className="py-2.5 text-zinc-650 font-bold">Natural Slub Crinkle</td>
                <td className="py-2.5 text-gray-500 font-medium">Folds Deeply</td>
                <td className="py-2.5 text-green-600 font-extrabold">Rigidly Flat</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-gray-900">Sartorial Visual</td>
                <td className="py-2.5 text-orange-600 font-extrabold">Lustrous Luxury Texture</td>
                <td className="py-2.5 text-gray-500 font-medium">Flat Matte</td>
                <td className="py-2.5 text-red-500 font-medium">Artificial Sheen</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ICON GRIDS DETAILED */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
        {block.features.map((feat, idx) => {
          let IconComp = Sparkles;
          if (feat.icon === "Wind") IconComp = Wind;
          else if (feat.icon === "Feather") IconComp = Feather;
          else if (feat.icon === "Shield") IconComp = ShieldCheck;

          return (
            <div id={`aplus-feature-${idx}`} key={idx} className="text-left space-y-2">
              <div className="h-10 w-10 rounded-xl bg-orange-600/5 flex items-center justify-center text-orange-600 border border-orange-600/10 shrink-0">
                <IconComp className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-black tracking-tight text-gray-950 uppercase">
                {feat.title}
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans font-light">
                {feat.description}
              </p>
            </div>
          );
        })}
      </div>

    </section>
  );
}
