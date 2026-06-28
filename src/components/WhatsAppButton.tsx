/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { MessageSquareCode, MessageCircle } from "lucide-react";
import { Product } from "../types";

interface WhatsAppButtonProps {
  currentProduct: Product | null;
  selectedColor?: string;
  selectedSize?: string;
}

export default function WhatsAppButton({ 
  currentProduct, 
  selectedColor, 
  selectedSize 
}: WhatsAppButtonProps) {
  const [pulse, setPulse] = useState(false);

  // Periodically toggle local green halo pulsing effect every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const phoneNumber = "917208572688";
  
  // Format message lines safely
  const prodName = currentProduct ? currentProduct.name : "Clinza Collection";
  const prodColor = selectedColor || (currentProduct?.colors?.[0]?.name) || "Any";
  const prodSize = selectedSize || (currentProduct?.sizes?.[0]) || "Any";

  const message = `Hello CLINZA Team,

I am interested in your collection.

Product: ${prodName}
Color: ${prodColor}
Size: ${prodSize}

Please assist me.`;

  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = "https://i.postimg.cc/Vr6DJmCQ/image.png";
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end select-none">
      {/* Tiny descriptive bubble above on hover */}
      <div className="group relative flex items-center justify-end">
        
        {/* Label tooltip (grows on hover matching premium themes) */}
        <span className="mr-3 scale-90 translate-x-3 opacity-0 group-hover:scale-100 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg pointer-events-none">
          Stylist helpline (online)
        </span>

        {/* Outer Pulsing Green Halo */}
        <div className="relative">
          {pulse && (
            <span className="absolute -inset-1.5 rounded-full bg-emerald-500/45 animate-ping opacity-75 pointer-events-none"></span>
          )}

          {/* Core Green anchor button with official branding */}
          <a
            id="floating-whatsapp-trigger"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-14 w-14 bg-white text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-[#25D366]/20 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden border border-emerald-500/10"
            title="Chat via WhatsApp with CLINZA styling room"
          >
            <img 
              src="https://i.postimg.cc/fVFPc5Mf/image.png" 
              onError={handleImgError}
              alt="WhatsApp Support" 
              className="h-10 w-10 object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </a>
        </div>

      </div>
    </div>
  );
}
