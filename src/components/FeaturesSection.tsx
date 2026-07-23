/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Truck, RotateCcw, Banknote, ShieldCheck } from "lucide-react";

export default function FeaturesSection() {
  const trustItems = [
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
    <section id="clinza-trust-bar" className="w-full bg-white border-y border-[#ECECEC] py-8 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={item.id}
              className="flex items-center gap-3.5 justify-center sm:justify-start"
            >
              <Icon className="w-7 h-7 stroke-[1.25] text-[#111111] shrink-0" />
              <div className="flex flex-col text-left">
                <h4 className="text-[12px] sm:text-[13px] font-bold text-[#111111] uppercase tracking-[0.08em] leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-[12px] font-normal text-[#666666] leading-tight mt-0.5">
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
