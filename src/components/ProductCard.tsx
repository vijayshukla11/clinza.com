/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Heart, Eye, ShoppingCart, MessageCircleCode, CheckCircle, Flame, Star, ShieldAlert, Zap, ShoppingBag } from "lucide-react";
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
  idPrefix?: string;
}

export default function ProductCard({
  product,
  onProductClick,
  onAddToWishlist,
  onAddToCart,
  wishlistIds,
  onOpenQuickView,
  setRoute,
  idPrefix
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const isInWishlist = wishlistIds.includes(product.id);
  const prefix = idPrefix ? `${idPrefix}-` : "";
  
  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  // Generate customized WhatsApp concierge order link
  const buildWhatsAppLink = () => {
    const itemColor = (Array.isArray(product.colors) && product.colors[0]?.name) || "Default";
    const itemSize = (Array.isArray(product.sizes) && product.sizes[0]) || "M";
    const itemUrl = `${window.location.origin}/product/${product.slug || product.id}`;
    const mainImg = (Array.isArray(product.images) && product.images[0]) || "";

    const text = `Hello Clinza Team,

I would like to place an order.

Product: ${product.name}
Color: ${itemColor}
Size: ${itemSize}
Quantity: 1
Price: ₹${product.price.toLocaleString("en-IN")}
Product Image: ${mainImg}

Please confirm availability. Link: ${itemUrl}`;

    return `https://wa.me/917208572688?text=${encodeURIComponent(text)}`;
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const itemColor = (Array.isArray(product.colors) && product.colors[0]?.name) || "Default";
    const itemSize = (Array.isArray(product.sizes) && product.sizes[0]) || "M";
    onAddToCart(product, itemColor, itemSize);
    setRoute("checkout");
  };

  const displayImage = (hovered 
    ? (product.hoverImage || (Array.isArray(product.images) && product.images[1]) || (Array.isArray(product.images) && product.images[0]) || "") 
    : ((Array.isArray(product.images) && product.images[0]) || "")
  );

  const mainImageAlt = (Array.isArray(product.images) && product.images[0] && product.imageAltTexts?.[product.images[0]]) || product.name || "Product";

  return (
    <div
      id={`${prefix}prod-card-${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group bg-white rounded-none overflow-hidden transition-all duration-300 border border-gray-200 hover:border-black flex flex-col justify-between text-left"
    >
      {/* UPPER IMAGE SECTION */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          console.log(`[CLICK]\nid: ${product.id}\nslug: ${product.slug}\nname: ${product.name}`);
          onProductClick(product);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="cursor-pointer relative aspect-[3/4] overflow-hidden bg-gray-50 flex items-center justify-center"
      >
        <img
          src={displayImage}
          alt={mainImageAlt}
          className="h-full w-full object-cover object-center transition-all duration-700 ease-out"
          loading="lazy"
        />

        {/* ACCENT LABELS ROW */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {product.trendingRank !== undefined && product.trendingRank !== null && product.trendingRank <= 20 && (
            <div className={`font-mono text-[9px] font-black tracking-wider px-2.5 py-1.2 rounded-md flex items-center gap-1 shadow-md text-white ${
              product.trendingRank === 1 
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 border border-amber-300 animate-pulse" 
                : product.trendingRank === 2
                ? "bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-800 border border-zinc-400"
                : product.trendingRank === 3
                ? "bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 border border-amber-600"
                : "bg-black/90 backdrop-blur-md border border-white/20"
            }`}>
              <Flame className="h-3 w-3 text-amber-300" />
              <span>#{product.trendingRank} {product.demandBadge || (product.trendingRank === 1 ? "NO.1 HIGH DEMAND" : "TOP DEMAND")}</span>
            </div>
          )}
          {product.isTrending && (!product.trendingRank || product.trendingRank > 20) && (
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
            id={`${prefix}card-quickview-${product.id}`}
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
              id={`${prefix}card-addcart-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                const itemColor = (Array.isArray(product.colors) && product.colors[0]?.name) || "Default";
                const itemSize = (Array.isArray(product.sizes) && product.sizes[0]) || "M";
                onAddToCart(product, itemColor, itemSize);
              }}
              className="p-3 bg-white text-gray-950 hover:bg-black hover:text-white rounded-none transition-all duration-300 shadow-sm focus:outline-none cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}

          {/* WISHLIST HEART */}
          <button
            id={`${prefix}card-wishlist-${product.id}`}
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
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between text-left">
        <div>
          {/* CATEGORY & STAR RATINGS */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] sm:text-[10px] font-black font-mono tracking-widest text-[#F27D26] uppercase truncate max-w-[60%]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 bg-yellow-500/5 px-1.5 py-0.5 border border-yellow-500/10 rounded-xs">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 shrink-0" />
              <span className="text-[9px] font-bold text-yellow-750 font-mono leading-none">{product.rating}</span>
              <span className="text-[8px] text-gray-400 font-mono">({product.reviewsCount ?? product.reviews?.length ?? 0})</span>
            </div>
          </div>

          {/* PRODUCT NAME HEADLINE */}
          <button
            id={`${prefix}card-name-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              console.log(`[CLICK]\nid: ${product.id}\nslug: ${product.slug}\nname: ${product.name}`);
              onProductClick(product);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-gray-950 hover:text-[#F27D26] text-xs sm:text-sm tracking-tight leading-snug line-clamp-1 block font-serif font-bold transition-colors focus:outline-none cursor-pointer text-left"
          >
            {product.name}
          </button>

          {/* SHORT DESCRIPTION */}
          {(product.shortDescription || product.description) && (
            <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1 mt-0.5 font-sans">
              {product.shortDescription || product.description}
            </p>
          )}

          {/* PRICING DETAIL */}
          <div className="flex items-baseline gap-1.5 sm:gap-2.5 mt-2">
            <span className="text-xs sm:text-sm font-bold text-gray-950">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-normal">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-green-600 font-mono">
                  ({discountPercent}% OFF)
                </span>
              </>
            )}
          </div>
        </div>

        {/* BOTTOM ORDER WORKFLOW GATES */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
          {product.stockStatus !== "Out of Stock" ? (
            <>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id={`${prefix}card-buy-now-${product.id}`}
                  onClick={(e) => handleBuyNow(e)}
                  className="bg-gradient-to-r from-[#5B1824] via-[#43101A] to-zinc-900 hover:from-black hover:to-black text-white font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-tight h-8 sm:h-8.5 px-1 sm:px-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 text-center shadow-2xs hover:shadow-sm active:scale-95 whitespace-nowrap overflow-hidden"
                >
                  <Zap className="h-3 w-3 text-amber-300 shrink-0" />
                  <span className="whitespace-nowrap">Buy Now</span>
                </button>
                <button
                  id={`${prefix}card-add-to-cart-${product.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const itemColor = (Array.isArray(product.colors) && product.colors[0]?.name) || "Default";
                    const itemSize = (Array.isArray(product.sizes) && product.sizes[0]) || "M";
                    onAddToCart(product, itemColor, itemSize);
                  }}
                  className="bg-white hover:bg-zinc-900 border border-zinc-300 hover:border-zinc-900 text-zinc-900 hover:text-white font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-tight h-8 sm:h-8.5 px-1 sm:px-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 text-center shadow-2xs active:scale-95 group/btn whitespace-nowrap overflow-hidden"
                >
                  <ShoppingBag className="h-3 w-3 text-zinc-600 group-hover/btn:text-white transition-colors shrink-0" />
                  <span className="whitespace-nowrap">Add to Bag</span>
                </button>
              </div>
              <a
                id={`${prefix}card-wa-order-${product.id}`}
                onClick={(e) => e.stopPropagation()}
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-50 hover:bg-[#126b2b] border border-emerald-200 hover:border-[#126b2b] text-[#126b2b] hover:text-white font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-normal h-7.5 sm:h-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs whitespace-nowrap"
              >
                <img 
                  src="https://i.postimg.cc/fVFPc5Mf/image.png" 
                  onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/Vr6DJmCQ/image.png"; }}
                  alt="WhatsApp" 
                  className="h-3.5 w-3.5 object-contain rounded-full shrink-0"
                /> 
                <span className="whitespace-nowrap">WhatsApp Order</span>
              </a>
            </>
          ) : (
            <button
              id={`${prefix}card-outstock-btn-${product.id}`}
              disabled
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-stone-100 border border-stone-200 text-stone-400 font-sans text-[10px] font-bold uppercase tracking-wider h-8 rounded-lg cursor-not-allowed select-none flex items-center justify-center text-center whitespace-nowrap"
            >
              Sold Out
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
