/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Check, 
  ArrowLeft, 
  ZoomIn, 
  RotateCw, 
  Truck, 
  RefreshCw, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck,
  Share2,
  Copy,
  Lock,
  Package,
  Clock,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Award,
  Zap
} from "lucide-react";
import { Product, ProductCollection } from "../types";
import { getProducts } from "../utils";
import APlusContent from "./APlusContent";

interface ProductDetailProps {
  product: Product;
  onBackToCollection: () => void;
  onAddToCart: (product: Product, color: string, size: string, quantity: number) => void;
  onAddToWishlist: (product: Product) => void;
  wishlistIds: string[];
  setRoute: (route: string) => void;
}

// Default luxury editorial fallback images for gallery completeness (min 6 images)
const EDITORIAL_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=1200"
];

export default function ProductDetail({
  product,
  onBackToCollection,
  onAddToCart,
  onAddToWishlist,
  wishlistIds,
  setRoute
}: ProductDetailProps) {
  // Gallery state
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Variant selection state
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || "Default");
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  // Interactive UI feedback state
  const [isCopied, setIsCopied] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Hover zoom state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // 360 Spin state
  const [is360Active, setIs360Active] = useState(false);
  const [rotationIndex, setRotationIndex] = useState(0);

  const isInWishlist = wishlistIds.includes(product.id);

  // Construct gallery images ensuring minimum 6 images for editorial depth
  const galleryImages = useMemo(() => {
    const rawImages = product.images && product.images.length > 0 ? product.images : [EDITORIAL_FALLBACK_IMAGES[0]];
    if (rawImages.length >= 6) return rawImages;
    const filled = [...rawImages];
    let fallbackIdx = 0;
    while (filled.length < 6) {
      const fallbackImg = EDITORIAL_FALLBACK_IMAGES[fallbackIdx % EDITORIAL_FALLBACK_IMAGES.length];
      if (!filled.includes(fallbackImg)) {
        filled.push(fallbackImg);
      }
      fallbackIdx++;
    }
    return filled;
  }, [product.images]);

  // Discount percentage calculation
  const discountPercent = useMemo(() => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  }, [product.price, product.originalPrice]);

  // Estimated Delivery calculation (3 business days ahead)
  const estimatedDeliveryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
  }, []);

  // Track Recently Viewed products in localStorage
  useEffect(() => {
    if (!product?.id) return;
    try {
      const raw = localStorage.getItem("clinza_recently_viewed_ids");
      let ids: string[] = raw ? JSON.parse(raw) : [];
      ids = [product.id, ...ids.filter((id) => id !== product.id)].slice(0, 10);
      localStorage.setItem("clinza_recently_viewed_ids", JSON.stringify(ids));
    } catch (e) {
      console.warn("Could not save recently viewed product:", e);
    }
  }, [product.id]);

  // Retrieve Recently Viewed products
  const recentlyViewedProducts = useMemo(() => {
    try {
      const all = getProducts();
      const raw = localStorage.getItem("clinza_recently_viewed_ids");
      if (!raw) return [];
      const ids: string[] = JSON.parse(raw);
      return ids
        .filter((id) => id !== product.id)
        .map((id) => all.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p))
        .slice(0, 6);
    } catch {
      return [];
    }
  }, [product.id]);

  // Retrieve Related products (same collection or category)
  const relatedProducts = useMemo(() => {
    const all = getProducts();
    return all
      .filter((p) => p.id !== product.id && (p.collection === product.collection || p.category === product.category))
      .slice(0, 8);
  }, [product.id, product.collection, product.category]);

  // Image preloading for hero image
  useEffect(() => {
    if (galleryImages[0]) {
      const img = new Image();
      img.src = galleryImages[0];
    }
  }, [galleryImages]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, galleryImages.length]);

  // Handle Mouse Zoom position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  // Handle 360 Spin simulation
  const handle360Rotate = () => {
    setIs360Active(true);
    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % galleryImages.length;
      setRotationIndex(current);
      if (current === 0) {
        clearInterval(interval);
        setIs360Active(false);
      }
    }, 300);
  };

  // Add to Bag with feedback
  const handleAddToCartClick = () => {
    setIsAdding(true);
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setTimeout(() => {
      setIsAdding(false);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    }, 300);
  };

  // Buy Now direct redirect
  const handleBuyNowClick = () => {
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setRoute("cart");
  };

  // Share link handler
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#product-${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | CLINZA Luxury`,
          text: product.shortDescription || product.description,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Accordion toggle helper
  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  // JSON-LD Structured Product Data for SEO
  const jsonLdData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": galleryImages,
    "description": product.shortDescription || product.description,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "CLINZA Luxury"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stockStatus === "Out of Stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
    }
  };

  return (
    <article id="clinza-product-detail-page" className="bg-[#FBFBFA] min-h-screen text-[#111111] font-sans pt-6 pb-20">
      
      {/* JSON-LD STRUCTURED DATA */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />

      {/* TOAST NOTIFICATION FOR ADDED TO BAG */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-[120] bg-[#111111] text-white px-5 py-3.5 rounded-[12px] shadow-2xl flex items-center gap-3 text-xs font-semibold animate-slide-up border border-white/10">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Added <strong>{product.name}</strong> ({selectedSize} / {selectedColor}) to your bag.</span>
          <button onClick={() => setRoute("cart")} className="ml-2 text-amber-400 underline font-bold uppercase hover:text-white transition-colors cursor-pointer text-[11px]">
            View Bag
          </button>
        </div>
      )}

      {/* TOAST NOTIFICATION FOR LINK COPIED */}
      {isCopied && (
        <div className="fixed bottom-6 right-6 z-[120] bg-[#111111] text-white px-4 py-3 rounded-[10px] shadow-xl flex items-center gap-2 text-xs font-medium animate-slide-up border border-white/10">
          <Copy className="h-4 w-4 text-emerald-400" />
          <span>Product link copied to clipboard!</span>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">

        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-[11px] font-medium tracking-wide text-zinc-500 uppercase font-mono py-2">
          <button onClick={() => setRoute("home")} className="hover:text-black transition-colors cursor-pointer">
            Home
          </button>
          <span>/</span>
          <button onClick={() => setRoute(`collections/${product.collection || 'all'}`)} className="hover:text-black transition-colors cursor-pointer">
            {product.collection ? product.collection.replace("_", " ") : "Collections"}
          </button>
          <span>/</span>
          <span className="text-zinc-600">{product.category}</span>
          <span>/</span>
          <span className="text-black font-semibold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* MAIN PRODUCT LAYOUT GRID (LEFT GALLERY + RIGHT INFO) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">

          {/* LEFT COLUMN: EDITORIAL GALLERY (7 COLUMNS) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            
            {/* THUMBNAIL TRACK (VERTICAL ON DESKTOP, HORIZONTAL ON MOBILE) */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[640px] scrollbar-none shrink-0 py-1">
              {galleryImages.map((img, idx) => (
                <button
                  id={`gallery-thumb-${idx}`}
                  key={idx}
                  onClick={() => {
                    setActiveImgIdx(idx);
                    setIs360Active(false);
                  }}
                  onMouseEnter={() => setActiveImgIdx(idx)}
                  className={`relative aspect-[3/4] w-16 md:w-20 rounded-[10px] overflow-hidden border transition-all duration-200 cursor-pointer shrink-0 bg-zinc-100 ${
                    activeImgIdx === idx && !is360Active
                      ? "border-black shadow-sm ring-1 ring-black"
                      : "border-zinc-200 opacity-70 hover:opacity-100 hover:border-zinc-400"
                  }`}
                  aria-label={`View product image ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} angle ${idx + 1}`}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}

              {/* 360 SPIN THUMB TRIGGER */}
              <button
                id="gallery-thumb-360"
                onClick={handle360Rotate}
                className="relative aspect-[3/4] w-16 md:w-20 rounded-[10px] overflow-hidden border border-zinc-200 bg-zinc-900 text-white flex flex-col items-center justify-center text-[9px] font-mono font-bold tracking-wider hover:bg-black transition-colors shrink-0 cursor-pointer"
                aria-label="Interactive 360 degree product view"
              >
                <RotateCw className="h-4 w-4 text-amber-400 mb-1" />
                <span>360°</span>
              </button>
            </div>

            {/* MAIN HERO IMAGE VIEWPORT */}
            <div className="relative flex-1 aspect-[3/4] bg-[#F2F2EF] rounded-[16px] overflow-hidden border border-zinc-200/80 group shadow-sm">
              
              <div
                className="w-full h-full relative cursor-crosshair overflow-hidden"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                onClick={() => {
                  setLightboxIndex(activeImgIdx);
                  setIsLightboxOpen(true);
                }}
              >
                <img
                  src={is360Active ? galleryImages[rotationIndex] : galleryImages[activeImgIdx]}
                  alt={product.name}
                  loading="eager"
                  className={`w-full h-full object-cover object-center transition-transform duration-300 ${
                    isZooming ? "scale-150" : "scale-100"
                  }`}
                  style={isZooming ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                />
              </div>

              {/* BADGES ON HERO IMAGE */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                {product.isNewArrival && (
                  <span className="bg-black text-white text-[9px] font-mono font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full shadow-sm">
                    NEW SEASON
                  </span>
                )}
                {product.isTrending && (
                  <span className="bg-amber-900 text-white text-[9px] font-mono font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full shadow-sm">
                    TRENDING
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-red-650 text-white text-[9px] font-mono font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full shadow-sm">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* LIGHTBOX EXPAND BUTTON */}
              <button
                id="pdp-lightbox-trigger"
                onClick={() => {
                  setLightboxIndex(activeImgIdx);
                  setIsLightboxOpen(true);
                }}
                className="absolute bottom-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-black hover:bg-white shadow-md transition-all cursor-pointer hover:scale-105"
                aria-label="Open full-screen image gallery"
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              {/* 360 SPIN OVERLAY INDICATOR */}
              {is360Active && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white font-mono text-[11px] font-bold tracking-[0.2em] uppercase pointer-events-none">
                  <RotateCw className="h-6 w-6 animate-spin text-amber-400 mb-2" />
                  <span>Interactive 360° View</span>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: PRODUCT INFORMATION & CONTROLS (5 COLUMNS) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 text-left">
            
            {/* BRAND & SKU & RATING */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase font-mono text-zinc-500">
                  {product.brand || "CLINZA LUXURY"}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  SKU: {product.sku}
                </span>
              </div>

              {/* H1 TITLE */}
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#111111] tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* RATING & REVIEWS SUMMARY */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 4.5) ? "fill-amber-400 text-amber-400" : "text-zinc-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-zinc-800">
                  {product.rating || 4.5}
                </span>
                <span className="text-xs text-zinc-400">
                  ({product.reviews?.length || 12} Verified Reviews)
                </span>
              </div>
            </div>

            {/* PRICING & DISCOUNTS */}
            <div className="bg-[#F4F4F1] p-4 sm:p-5 rounded-[12px] border border-zinc-200/80 space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-[#111111] tracking-tight">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-sm font-medium text-zinc-400 line-through">
                      MRP: ₹{product.originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      SAVE {discountPercent}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                Inclusive of all taxes. Free doorstep express delivery across India.
              </p>
            </div>

            {/* SHORT DESCRIPTION */}
            <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* STOCK AVAILABILITY BADGE */}
            <div className="flex items-center gap-2 text-xs font-medium">
              {product.stockStatus === "Out of Stock" ? (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  <span>Currently Out of Stock</span>
                </div>
              ) : product.stockStatus === "Low Stock" || (product.stockQuantity && product.stockQuantity < 10) ? (
                <div className="flex items-center gap-2 text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Limited Stock: Only {product.stockQuantity || 4} units remaining</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>In Stock • Ready to Dispatch</span>
                </div>
              )}
            </div>

            {/* COLOR SELECTOR */}
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#111111] uppercase tracking-wider font-mono text-[11px]">
                  Color: <span className="font-normal text-zinc-600 normal-case">{selectedColor}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    id={`pdp-color-${c.name}`}
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`h-9 px-3.5 rounded-[8px] border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      selectedColor === c.name
                        ? "border-black bg-black text-white shadow-xs"
                        : "border-zinc-200 hover:border-zinc-400 bg-white text-zinc-700"
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#111111] uppercase tracking-wider font-mono text-[11px]">
                  Size: <span className="font-normal text-zinc-600 normal-case">{selectedSize}</span>
                </span>
                <button
                  id="pdp-size-guide-btn"
                  onClick={() => setShowSizeModal(true)}
                  className="text-xs text-black underline font-semibold hover:text-amber-800 transition-colors cursor-pointer"
                >
                  Size Guide & Advisor
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => {
                  const isAvailable = product.sizes.includes(sz);
                  return (
                    <button
                      id={`pdp-size-${sz}`}
                      key={sz}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(sz)}
                      className={`h-11 w-12 rounded-[8px] border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                        !isAvailable
                          ? "border-zinc-100 bg-zinc-100 text-zinc-300 cursor-not-allowed line-through"
                          : selectedSize === sz
                          ? "border-black bg-black text-white shadow-xs"
                          : "border-zinc-200 hover:border-black bg-white text-zinc-800"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUANTITY PICKER */}
            <div className="space-y-2 pt-2">
              <span className="block font-bold text-[#111111] uppercase tracking-wider font-mono text-[11px]">
                Quantity
              </span>
              <div className="flex items-center border border-zinc-300 rounded-[8px] bg-white h-11 w-32">
                <button
                  id="pdp-qty-minus"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-full flex items-center justify-center text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="flex-1 text-center font-mono text-xs font-bold text-black">
                  {quantity}
                </span>
                <button
                  id="pdp-qty-plus"
                  onClick={() => setQuantity((prev) => Math.min(product.stockQuantity || 10, prev + 1))}
                  className="w-10 h-full flex items-center justify-center text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* PRIMARY BUTTONS */}
            <div className="space-y-3 pt-2">
              {product.stockStatus !== "Out of Stock" ? (
                <>
                  <button
                    id="pdp-add-to-cart-btn"
                    disabled={isAdding}
                    onClick={handleAddToCartClick}
                    className="w-full h-[54px] bg-[#111111] hover:bg-black text-white font-bold text-xs uppercase tracking-[0.2em] rounded-[10px] shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <ShoppingBag className="h-4.5 w-4.5" />
                    <span>{isAdding ? "ADDING TO BAG..." : "ADD TO BAG"}</span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      id="pdp-buy-now-btn"
                      onClick={handleBuyNowClick}
                      className="w-full h-[48px] bg-[#F4F4F2] hover:bg-[#EAEAE6] text-[#111111] font-bold text-xs uppercase tracking-[0.18em] rounded-[10px] transition-all cursor-pointer border border-zinc-200"
                    >
                      BUY NOW
                    </button>

                    <div className="flex gap-2">
                      <button
                        id="pdp-wishlist-btn"
                        onClick={() => onAddToWishlist(product)}
                        className={`flex-1 h-[48px] rounded-[10px] border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                          isInWishlist
                            ? "border-red-200 bg-red-50 text-red-600"
                            : "border-zinc-200 hover:border-black bg-white text-zinc-700"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-600 text-red-600" : ""}`} />
                        <span>{isInWishlist ? "SAVED" : "WISHLIST"}</span>
                      </button>

                      <button
                        id="pdp-share-btn"
                        onClick={handleShare}
                        className="h-[48px] w-[48px] rounded-[10px] border border-zinc-200 hover:border-black bg-white text-zinc-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
                        title="Share Product"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  disabled
                  className="w-full h-[54px] bg-zinc-200 text-zinc-400 font-bold text-xs uppercase tracking-[0.2em] rounded-[10px] cursor-not-allowed text-center"
                >
                  SOLD OUT
                </button>
              )}
            </div>

            {/* DELIVERY & LOGISTICS SUMMARY CARD */}
            <div className="bg-[#F8F8F6] p-4 rounded-[12px] border border-zinc-200/80 space-y-3 text-xs text-zinc-700">
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 text-black shrink-0" />
                <div>
                  <p className="font-semibold text-black">Estimated Delivery</p>
                  <p className="text-[11px] text-zinc-500">Delivered by <strong className="text-black">{estimatedDeliveryDate}</strong> with live tracking.</p>
                </div>
              </div>
              <div className="border-t border-zinc-200 pt-2.5 flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-black shrink-0" />
                <div>
                  <p className="font-semibold text-black">COD & Shipping Guarantee</p>
                  <p className="text-[11px] text-zinc-500">Cash on Delivery Available • Free Shipping on orders over ₹999.</p>
                </div>
              </div>
            </div>

            {/* TRUST FEATURES ROW */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-[10px] bg-white border border-zinc-200 text-[11px] font-medium text-zinc-800">
                <Lock className="h-4 w-4 text-zinc-600 shrink-0" />
                <span>100% Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-[10px] bg-white border border-zinc-200 text-[11px] font-medium text-zinc-800">
                <Sparkles className="h-4 w-4 text-zinc-600 shrink-0" />
                <span>Pure Organic Fibers</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-[10px] bg-white border border-zinc-200 text-[11px] font-medium text-zinc-800">
                <Package className="h-4 w-4 text-zinc-600 shrink-0" />
                <span>24hr Express Dispatch</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-[10px] bg-white border border-zinc-200 text-[11px] font-medium text-zinc-800">
                <RefreshCw className="h-4 w-4 text-zinc-600 shrink-0" />
                <span>10-Day Free Returns</span>
              </div>
            </div>

            {/* PRODUCT ACCORDIONS */}
            <div className="border border-zinc-200 rounded-[12px] bg-white divide-y divide-zinc-200 overflow-hidden text-xs">
              
              {/* ACCORDION 1: DESCRIPTION */}
              <div>
                <button
                  onClick={() => toggleAccordion("description")}
                  className="w-full px-4 py-3.5 flex items-center justify-between font-bold text-black uppercase tracking-wider text-[11px] hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <span>PRODUCT STORY & DESCRIPTION</span>
                  {openAccordion === "description" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === "description" && (
                  <div className="px-4 pb-4 pt-1 text-zinc-600 font-normal leading-relaxed space-y-2">
                    <p>{product.description}</p>
                  </div>
                )}
              </div>

              {/* ACCORDION 2: SPECIFICATIONS */}
              <div>
                <button
                  onClick={() => toggleAccordion("specifications")}
                  className="w-full px-4 py-3.5 flex items-center justify-between font-bold text-black uppercase tracking-wider text-[11px] hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <span>GARMENT SPECIFICATIONS</span>
                  {openAccordion === "specifications" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === "specifications" && (
                  <div className="px-4 pb-4 pt-1 text-zinc-600">
                    <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3 rounded-[8px] border border-zinc-100">
                      <div>
                        <span className="block text-[10px] font-mono text-zinc-400 uppercase">Fabric Blend</span>
                        <span className="font-semibold text-black">{product.fabric || "100% Organic Linen"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono text-zinc-400 uppercase">Fit Architecture</span>
                        <span className="font-semibold text-black">{product.fit || "Tailored Resort Fit"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono text-zinc-400 uppercase">Brand</span>
                        <span className="font-semibold text-black">{product.brand || "CLINZA Luxury"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono text-zinc-400 uppercase">Category</span>
                        <span className="font-semibold text-black">{product.category}</span>
                      </div>
                      {(product.specifications || []).map((s, idx) => (
                        <div key={idx}>
                          <span className="block text-[10px] font-mono text-zinc-400 uppercase">{s.label}</span>
                          <span className="font-semibold text-black">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACCORDION 3: FABRIC & CARE */}
              <div>
                <button
                  onClick={() => toggleAccordion("care")}
                  className="w-full px-4 py-3.5 flex items-center justify-between font-bold text-black uppercase tracking-wider text-[11px] hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <span>FABRIC & WASH CARE</span>
                  {openAccordion === "care" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === "care" && (
                  <div className="px-4 pb-4 pt-1 text-zinc-600 leading-relaxed space-y-2">
                    <p>{product.fabricCare || "Woven using long-staple organic flax strands. Follow these instructions for optimal fabric longevity:"}</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li>Machine wash cold below 30°C on a delicate cycle.</li>
                      <li>Use mild organic detergent. Do not bleach or soak.</li>
                      <li>Hang dry in shade to maintain natural fiber integrity.</li>
                      <li>Warm steam iron while slightly damp for effortless crispness.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* ACCORDION 4: SHIPPING & RETURNS */}
              <div>
                <button
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full px-4 py-3.5 flex items-center justify-between font-bold text-black uppercase tracking-wider text-[11px] hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <span>SHIPPING & RETURNS POLICY</span>
                  {openAccordion === "shipping" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === "shipping" && (
                  <div className="px-4 pb-4 pt-1 text-zinc-600 leading-relaxed space-y-2 text-[11px]">
                    <p><strong>Fast Dispatch:</strong> Orders are packed and dispatched within 24 hours from our warehouse.</p>
                    <p><strong>Shipping Times:</strong> Metro cities deliver in 2-3 days; rest of India in 4-5 business days.</p>
                    <p><strong>Hassle-Free Returns:</strong> We offer a 10-day complimentary doorstep reverse pickup and exchange guarantee.</p>
                  </div>
                )}
              </div>

              {/* ACCORDION 5: FAQ */}
              <div>
                <button
                  onClick={() => toggleAccordion("faq")}
                  className="w-full px-4 py-3.5 flex items-center justify-between font-bold text-black uppercase tracking-wider text-[11px] hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <span>FREQUENTLY ASKED QUESTIONS</span>
                  {openAccordion === "faq" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === "faq" && (
                  <div className="px-4 pb-4 pt-1 text-zinc-600 space-y-3 text-[11px]">
                    <div>
                      <strong className="block text-black">Q: Is Cash on Delivery (COD) available?</strong>
                      <span>Yes, COD is available across all serviceable pincodes in India.</span>
                    </div>
                    <div>
                      <strong className="block text-black">Q: How do I know my correct size?</strong>
                      <span>Our garments follow standard European tailoring specs. Refer to our Size Guide or contact our WhatsApp support team for custom guidance.</span>
                    </div>
                    <div>
                      <strong className="block text-black">Q: How do I initiate a return or exchange?</strong>
                      <span>Simply visit our Track Order / Account portal or contact support within 10 days of delivery.</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* A+ EDITORIAL BRAND STORYTELLING CONTENT */}
        {product.aPlusContent && (
          <div className="pt-10">
            <APlusContent block={product.aPlusContent} name={product.name} />
          </div>
        )}

        {/* RECENTLY VIEWED PRODUCTS */}
        {recentlyViewedProducts.length > 0 && (
          <div className="pt-12 border-t border-zinc-200 text-left space-y-6">
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-black font-sans flex items-center gap-2">
              <span className="h-4 w-1 bg-black" /> Recently Viewed
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {recentlyViewedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    window.location.hash = `#product-${p.slug}`;
                    window.dispatchEvent(new HashChangeEvent("hashchange"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group bg-white rounded-[12px] border border-zinc-200 overflow-hidden cursor-pointer hover:border-black transition-all p-2.5 flex flex-col justify-between"
                >
                  <div className="aspect-[3/4] bg-zinc-100 rounded-[8px] overflow-hidden mb-2">
                    <img
                      src={p.images?.[0] || EDITORIAL_FALLBACK_IMAGES[0]}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono text-zinc-400 uppercase font-bold">{p.brand || "CLINZA"}</p>
                    <h3 className="text-xs font-semibold text-black truncate">{p.name}</h3>
                    <p className="text-xs font-bold text-black">₹{p.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RELATED PRODUCTS RECOMMENDATIONS */}
        {relatedProducts.length > 0 && (
          <div className="pt-10 border-t border-zinc-200 text-left space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] font-mono block mb-1">
                  YOU MAY ALSO LIKE
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black font-sans">
                  Related Collections
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    window.location.hash = `#product-${item.slug}`;
                    window.dispatchEvent(new HashChangeEvent("hashchange"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group bg-white rounded-[14px] border border-zinc-200/80 overflow-hidden cursor-pointer hover:border-black hover:shadow-md transition-all duration-300 p-3 flex flex-col justify-between"
                >
                  <div className="aspect-[3/4] bg-zinc-100 rounded-[10px] overflow-hidden relative mb-3">
                    <img
                      src={item.images?.[0] || EDITORIAL_FALLBACK_IMAGES[0]}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.isNewArrival && (
                      <span className="absolute top-2.5 left-2.5 bg-black text-white text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase block">{item.category}</span>
                    <h3 className="text-xs sm:text-sm font-bold text-black truncate">{item.name}</h3>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xs font-bold text-black">₹{item.price.toLocaleString("en-IN")}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-[11px] text-zinc-400 line-through">₹{item.originalPrice.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fade-in">
          {/* HEADER BAR */}
          <div className="flex items-center justify-between text-white text-xs font-mono tracking-widest uppercase">
            <span>{product.name} ({lightboxIndex + 1} / {galleryImages.length})</span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* MAIN LIGHTBOX IMAGE */}
          <div className="relative flex-1 flex items-center justify-center my-4">
            <button
              onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
              className="absolute left-2 sm:left-6 z-10 p-3 bg-black/50 hover:bg-white text-white hover:text-black rounded-full transition-colors cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <img
              src={galleryImages[lightboxIndex]}
              alt={`${product.name} large view`}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-[8px] shadow-2xl"
            />

            <button
              onClick={() => setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 sm:right-6 z-10 p-3 bg-black/50 hover:bg-white text-white hover:text-black rounded-full transition-colors cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* THUMBNAIL TRACK IN LIGHTBOX */}
          <div className="flex justify-center gap-2 overflow-x-auto py-2">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`h-14 w-11 rounded-[6px] overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  lightboxIndex === idx ? "border-amber-400 scale-105" : "border-white/20 opacity-50 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SIZE GUIDE ADVISOR MODAL */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[150] flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-zinc-200">
            <button
              onClick={() => setShowSizeModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-black" />
                <h3 className="text-base font-bold uppercase tracking-wider text-black font-mono">
                  Sizing & Fit Advisor Matrix
                </h3>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">
                All CLINZA garments are crafted to standard European tailored fits. Measure around the fullest part of your chest and waist for optimal selection.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 font-bold bg-zinc-50 text-black">
                      <th className="p-2.5 uppercase font-mono">Size Tag</th>
                      <th className="p-2.5 uppercase font-mono">Chest (in)</th>
                      <th className="p-2.5 uppercase font-mono">Waist (in)</th>
                      <th className="p-2.5 uppercase font-mono">Shoulder (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono text-[11px] text-zinc-700">
                    <tr className={selectedSize === "XS" ? "bg-amber-50 font-bold" : ""}>
                      <td className="p-2.5 font-bold text-black">XS</td>
                      <td className="p-2.5">36 inches</td>
                      <td className="p-2.5">28 inches</td>
                      <td className="p-2.5">16.5 inches</td>
                    </tr>
                    <tr className={selectedSize === "S" ? "bg-amber-50 font-bold" : ""}>
                      <td className="p-2.5 font-bold text-black">S</td>
                      <td className="p-2.5">38 inches</td>
                      <td className="p-2.5">30 inches</td>
                      <td className="p-2.5">17.0 inches</td>
                    </tr>
                    <tr className={selectedSize === "M" ? "bg-amber-50 font-bold" : ""}>
                      <td className="p-2.5 font-bold text-black">M</td>
                      <td className="p-2.5">40 inches</td>
                      <td className="p-2.5">32 inches</td>
                      <td className="p-2.5">17.5 inches</td>
                    </tr>
                    <tr className={selectedSize === "L" ? "bg-amber-50 font-bold" : ""}>
                      <td className="p-2.5 font-bold text-black">L</td>
                      <td className="p-2.5">42 inches</td>
                      <td className="p-2.5">34 inches</td>
                      <td className="p-2.5">18.0 inches</td>
                    </tr>
                    <tr className={selectedSize === "XL" ? "bg-amber-50 font-bold" : ""}>
                      <td className="p-2.5 font-bold text-black">XL</td>
                      <td className="p-2.5">44 inches</td>
                      <td className="p-2.5">36 inches</td>
                      <td className="p-2.5">18.5 inches</td>
                    </tr>
                    <tr className={selectedSize === "XXL" ? "bg-amber-50 font-bold" : ""}>
                      <td className="p-2.5 font-bold text-black">XXL</td>
                      <td className="p-2.5">46 inches</td>
                      <td className="p-2.5">38 inches</td>
                      <td className="p-2.5">19.0 inches</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowSizeModal(false)}
                  className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-[8px] hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Understood & Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </article>
  );
}
