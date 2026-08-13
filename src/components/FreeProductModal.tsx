/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Gift, Check, Sparkles } from "lucide-react";
import { Product } from "../types";

interface FreeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFreeProduct: (product: Product, color: string, size: string) => void;
  products: Product[];
  giftType?: "shirt_or_pant" | "combo_set" | null;
}

export default function FreeProductModal({
  isOpen,
  onClose,
  onSelectFreeProduct,
  products,
  giftType = "shirt_or_pant"
}: FreeProductModalProps) {
  // Filter eligible products based on giftType
  const eligibleProducts = products.filter(p => {
    if (!p || p.stockStatus === "Out of Stock" || !p.images || p.images.length === 0) return false;
    
    const col = (p.collection || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    const name = (p.name || "").toLowerCase();

    if (giftType === "combo_set") {
      // ONLY active Combo Sets!
      return col === "combos" || cat.includes("combo") || name.includes("combo");
    } else {
      // "shirt_or_pant": ONLY Shirts and Pants! Exclude footwear, accessories, combos, shoes, boots, loafers, bags, belts
      if (col === "footwear" || col === "accessories" || col === "combos") return false;
      if (cat.includes("shoes") || cat.includes("boot") || cat.includes("loafer") || cat.includes("accessory") || cat.includes("combo") || cat.includes("footwear")) return false;
      if (name.includes("shoe") || name.includes("boot") || name.includes("loafer") || name.includes("bag") || name.includes("belt") || name.includes("combo") || name.includes("slipper")) return false;

      return col === "shirts" || col === "jeans" || col === "pants" ||
             cat.includes("shirt") || cat.includes("pant") || cat.includes("denim") || cat.includes("trouser") || cat.includes("jeans") ||
             name.includes("shirt") || name.includes("pant") || name.includes("jean") || name.includes("trouser");
    }
  });

  const [selectedProductId, setSelectedProductId] = useState<string>(eligibleProducts[0]?.id || "");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  if (!isOpen) return null;

  const activeProduct = eligibleProducts.find(p => p.id === selectedProductId) || eligibleProducts[0];
  if (!activeProduct) return null;

  // Initialize defaults if not set
  const colors = activeProduct.colors || [{ name: "Standard", hex: "#000000" }];
  const sizes = activeProduct.sizes || ["S", "M", "L", "XL"];

  const currentColor = selectedColor || colors[0]?.name || "Standard";
  const currentSize = selectedSize || sizes[0] || "M";

  const handleClaim = () => {
    onSelectFreeProduct(activeProduct, currentColor, currentSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white border border-gray-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-hidden text-left space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-600/10 text-orange-600 flex items-center justify-center shrink-0">
              <Gift className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 font-mono bg-orange-50 px-2 py-0.5 rounded-md">
                  {giftType === "combo_set" ? "5 COMBOS REWARD" : "CLINZA COMBO REWARD"}
                </span>
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-950 uppercase tracking-tight mt-0.5">
                {giftType === "combo_set" ? "Choose Your FREE Combo Set" : "Choose Your FREE Shirt or Pant"}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-950 transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Product Selection List */}
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
            1. Select Free Item
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
            {eligibleProducts.map((prod) => {
              const isSelected = prod.id === activeProduct.id;
              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    setSelectedProductId(prod.id);
                    setSelectedColor("");
                    setSelectedSize("");
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center ${
                    isSelected
                      ? "border-orange-600 bg-orange-600/5 shadow-sm"
                      : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="h-14 w-11 object-cover rounded-lg bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-950 truncate">{prod.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono line-through text-gray-400">
                        ₹{prod.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-black text-green-600 font-mono">
                        FREE (₹0)
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Variant Customization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-150">
          {/* Color options */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 font-mono mb-2">
              Color: <span className="text-gray-950 font-sans">{currentColor}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((col) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setSelectedColor(col.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    currentColor === col.name
                      ? "border-gray-950 bg-gray-950 text-white shadow-xs"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size options */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 font-mono mb-2">
              Size: <span className="text-gray-950 font-sans">{currentSize}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`h-8 min-w-[32px] px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    currentSize === sz
                      ? "border-orange-600 bg-orange-600 text-white shadow-xs"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 border border-gray-250 hover:bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClaim}
            className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-orange-600/20 flex items-center justify-center gap-2"
          >
            <Gift className="h-4 w-4" />
            Claim FREE Gift (₹0)
          </button>
        </div>

      </div>
    </div>
  );
}
