/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Truck, RotateCcw, Banknote, ShieldCheck, Award, Heart, CheckCircle, Sparkles } from "lucide-react";
import { getThemeConfig } from "../utils";

const ICON_MAP: Record<string, any> = {
  Truck,
  RotateCcw,
  Banknote,
  ShieldCheck,
  Award,
  Heart,
  CheckCircle,
  Sparkles
};

export default function FeaturesSection() {
  const [themeConfig, setThemeConfig] = useState(() => getThemeConfig(false));

  useEffect(() => {
    const handleUpdate = () => {
      setThemeConfig(getThemeConfig(false));
    };
    window.addEventListener("clinza_theme_updated", handleUpdate);
    window.addEventListener("clinza_homepage_updated", handleUpdate);
    return () => {
      window.removeEventListener("clinza_theme_updated", handleUpdate);
      window.removeEventListener("clinza_homepage_updated", handleUpdate);
    };
  }, []);

  if (themeConfig?.features?.enabled === false) {
    return null;
  }

  const customCards = themeConfig?.features?.cards;
  const trustItems = (customCards && Array.isArray(customCards) && customCards.length > 0)
    ? customCards.map((card: any, index: number) => {
        const IconComponent = ICON_MAP[card.icon] || Truck;
        return {
          id: `trust-item-${index}`,
          icon: IconComponent,
          title: card.title || "Feature",
          description: card.description || ""
        };
      })
    : [
        {
          id: "trust-shipping",
          icon: Truck,
          title: "FREE SHIPPING",
          description: "On orders above ₹1499",
        },
        {
          id: "trust-returns",
          icon: RotateCcw,
          title: "EASY RETURNS",
          description: "7 days return policy",
        },
        {
          id: "trust-cod",
          icon: Banknote,
          title: "CASH ON DELIVERY",
          description: "Available across India",
        },
        {
          id: "trust-payments",
          icon: ShieldCheck,
          title: "SECURE PAYMENTS",
          description: "100% secure checkout",
        },
      ];

  return (
    <section id="clinza-trust-bar" className="w-full bg-white border-y border-[#ECECEC] py-3 sm:py-4 lg:py-4 px-3 sm:px-8 lg:px-12">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={item.id}
              className="flex items-center gap-2.5 sm:gap-3.5 justify-start p-1.5 sm:p-0"
            >
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.25] text-[#111111] shrink-0" />
              <div className="flex flex-col text-left min-w-0">
                <h4 className="text-[11px] sm:text-[13px] font-bold text-[#111111] uppercase tracking-[0.06em] sm:tracking-[0.08em] leading-tight truncate">
                  {item.title}
                </h4>
                <p className="text-[10px] sm:text-[12px] font-normal text-[#666666] leading-tight mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
