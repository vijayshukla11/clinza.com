/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Heart, Eye, ShoppingCart, MessageCircleCode, CheckCircle, Flame, Star, ShieldAlert } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string;
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onAddToCart: (product: Product, color: string, size: string, quantity?: number) => void;
  wishlistIds: string[];
  onOpenQuickView: (product: Product) => void;
  setRoute: (route: string) => void;
}

export default function ProductCard({
  product,
  onProductClick,
  onAddToWishlist,
  onAddToCart,
  wishlistIds,
  onOpenQuickView,
  setRoute
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const isInWishlist = wishlistIds.includes(product.id);
  
  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  // Generate customized WhatsApp concierge order link
  const buildWhatsAppLink = () => {
    const itemColor = product.colors[0]?.name || "Default";
    const itemSize = product.sizes[0] || "M";
    const itemUrl = `${window.location.origin}/product/${product.slug}`;

    const text = `Hello Clinza Team,

I would like to place an order.

Product: ${product.name}
Color: ${itemColor}
Size: ${itemSize}
Quantity: 1
Price: ₹${product.price.toLocaleString("en-IN")}
Product Image: ${product.images[0]}

Please confirm availability. Link: ${itemUrl}`;

    return `https://wa.me/917208572688?text=${encodeURIComponent(text)}`;
  };

  const handleBuyNow = () => {
    onAddToCart(product, product.colors[0]?.name || "Default", product.sizes[0] || "M");
    setRoute("cart");
  };

  return (
    <div
      id={`prod-card-${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group bg-white rounded-none overflow-hidden transition-all duration-300 border border-gray-200 hover:border-black flex flex-col justify-between text-left"
    >
      {/* UPPER IMAGE SECTION */}
      <div
        onClick={() => {
          onProductClick(product);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="cursor-pointer relative aspect-[3/4] overflow-hidden bg-gray-50 flex items-center justify-center"
      >
        <img
          src={hovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-all duration-700 ease-out"
          loading="lazy"
        />

        {/* ACCENT LABELS ROW */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isTrending && (
            <div className="bg-red-650 text-white font-mono text-[8px] font-black tracking-widest px-2.5 py-1.2 rounded-none flex items-center gap-1 shadow-xs">
              <Flame className="h-3 w-3" /> TRENDING
            </div>
          )}
          {product.isNewArrival && (
            <div className="bg-[#F27D26] text-black font-mono text-[8px] font-black tracking-widest px-2.5 py-1.2 rounded-none shadow-xs">
              NEW ARRIVAL
            </div>
          )}
          {discountPercent > 0 && (
            <div className="bg-gray-950 text-white font-mono text-[8px] font-black tracking-widest px-2.5 py-1.2 rounded-none shadow-xs">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* RE-ALIGNMENT ACTIONS DRAWER */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center gap-1.5">
          {/* QUICK VIEW */}
          <button
            id={`card-quickview-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickView(product);
            }}
            className="p-3 bg-white text-gray-950 hover:bg-[#F27D26] hover:text-black rounded-none transition-all duration-300 shadow-sm focus:outline-none cursor-pointer"
            title="Quick View"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          {/* DIRECT ADD CART */}
          {product.stockStatus !== "Out of Stock" && (
            <button
              id={`card-addcart-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product, product.colors[0]?.name || "Default", product.sizes[0] || "M");
              }}
              className="p-3 bg-white text-gray-950 hover:bg-black hover:text-white rounded-none transition-all duration-300 shadow-sm focus:outline-none cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}

          {/* WISHLIST HEART */}
          <button
            id={`card-wishlist-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist(product);
            }}
            className="p-3 bg-white text-gray-950 hover:bg-red-500 hover:text-white rounded-none transition-all duration-300 shadow-sm focus:outline-none cursor-pointer"
            title="Add to Wishlist"
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-600 stroke-red-600 text-white" : ""}`} />
          </button>
        </div>

        {/* STOCK STATE RIBBON */}
        {product.stockStatus === "Out of Stock" ? (
          <div className="absolute bottom-0 left-0 w-full bg-red-600 text-white text-[9px] font-bold text-center py-1.5 uppercase text-nowrap select-none tracking-widest">
            Out of Stock
          </div>
        ) : product.stockStatus === "Low Stock" ? (
          <div className="absolute bottom-0 left-0 w-full bg-orange-600 text-white text-[9px] font-bold text-center py-1.2 uppercase text-nowrap select-none flex items-center justify-center gap-1 tracking-widest border-t border-orange-550">
            <ShieldAlert className="h-3 w-3" /> Low Stock
          </div>
        ) : null}
      </div>

      {/* LOWER DATA PANEL */}
      <div className="p-4 flex flex-col flex-1 justify-between text-left">
        <div>
          {/* CATEGORY & STAR RATINGS */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black font-mono tracking-widest text-[#F27D26] uppercase">
              {product.category}
            </span>
            <div className="flex items-center gap-1 bg-yellow-500/5 px-1.5 py-0.5 border border-yellow-500/10 rounded-xs">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 shrink-0" />
              <span className="text-[9px] font-bold text-yellow-750 font-mono leading-none">{product.rating}</span>
            </div>
          </div>

          {/* PRODUCT NAME HEADLINE */}
          <button
            id={`card-name-btn-${product.id}`}
            onClick={() => {
              onProductClick(product);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-gray-950 hover:text-[#F27D26] text-sm tracking-tight leading-snug line-clamp-2 block font-serif h-10 transition-colors focus:outline-none cursor-pointer text-left"
          >
            {product.name}
          </button>

          {/* PRICING DETAIL */}
          <div className="flex items-baseline gap-2.5 mt-2.5">
            <span className="text-sm font-bold text-gray-950">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-xs text-gray-400 line-through font-normal">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] font-bold text-green-600 font-mono">
                  ({discountPercent}% OFF)
                </span>
              </>
            )}
          </div>
        </div>

        {/* BOTTOM ORDER WORKFLOW GATES */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1.5">
          {product.stockStatus !== "Out of Stock" ? (
            <>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id={`card-buy-now-${product.id}`}
                  onClick={handleBuyNow}
                  className="bg-black hover:bg-[#F27D26] text-white hover:text-black font-sans text-[9px] font-black uppercase tracking-widest py-3 rounded-none transition-colors cursor-pointer text-center"
                >
                  Buy Now
                </button>
                <button
                  id={`card-add-to-cart-${product.id}`}
                  onClick={() => onAddToCart(product, product.colors[0]?.name || "Default", product.sizes[0] || "M")}
                  className="bg-white hover:bg-gray-50 border border-black text-black font-sans text-[9px] font-black uppercase tracking-widest py-3 rounded-none transition-colors cursor-pointer text-center"
                >
                  Add to Bag
                </button>
              </div>
              <a
                id={`card-wa-order-${product.id}`}
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#1b8a3a] hover:bg-[#126b2b] text-white font-sans text-[9px] font-black uppercase tracking-widest py-3 rounded-none transition-all flex items-center justify-center gap-2"
              >
                <img 
                  src="https://i.postimg.cc/fVFPc5Mf/image.png" 
                  onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/Vr6DJmCQ/image.png"; }}
                  alt="WhatsApp" 
                  className="h-4 w-4 object-contain rounded-full bg-white shrink-0"
                /> 
                WhatsApp
              </a>
            </>
          ) : (
            <button
              id={`card-outstock-btn-${product.id}`}
              disabled
              className="w-full bg-gray-50 border border-gray-200 text-gray-400 font-sans text-[9px] font-bold uppercase tracking-widest py-3.5 rounded-none cursor-not-allowed select-none text-center"
            >
              Sold Out
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
