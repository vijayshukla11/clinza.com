/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  MessageCircle, 
  Check, 
  ArrowLeft, 
  ZoomIn, 
  Play, 
  RotateCw, 
  Truck, 
  RefreshCw, 
  Trophy, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Sparkles, 
  ShieldCheck 
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

export default function ProductDetail({
  product,
  onBackToCollection,
  onAddToCart,
  onAddToWishlist,
  wishlistIds,
  setRoute
}: ProductDetailProps) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || "Default");
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("fabric");
  const isInWishlist = wishlistIds.includes(product.id);

  // Advanced features state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [is360Active, setIs360Active] = useState(false);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  // Fetch related products (same collection, excluding self)
  const relatedList = getProducts()
    .filter((p) => p.collection === product.collection && p.id !== product.id)
    .slice(0, 4);

  // Zoom position tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y });
  };

  // Mock 360 Degree rotation sequence simulator
  const handle360Rotate = () => {
    setIs360Active(true);
    setIsVideoPlaying(false);
    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % product.images.length;
      setRotationIndex(current);
      if (current === 0) {
        clearInterval(interval);
        setIs360Active(false);
      }
    }, 350);
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedColor, selectedSize, quantity);
    alert(`${product.name} (${selectedSize} / ${selectedColor}) successfully added to your bag.`);
  };

  const handleBuyNowClick = () => {
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setRoute("cart");
  };

  const buildWhatsAppLink = () => {
    const itemUrl = `${window.location.origin}/product/${product.slug}`;
    const text = `Hello CLINZA Team,

I am interested in your collection.

Product: ${product.name}
Color: ${selectedColor}
Size: ${selectedSize}

Please assist me. Link: ${itemUrl}`;
    return `https://wa.me/917208572688?text=${encodeURIComponent(text)}`;
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <article id="clinza-product-detail-page" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* BACK TO WARDROBE BROWSE */}
        <button
          id="detail-back-button"
          onClick={onBackToCollection}
          className="group flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-zinc-500 hover:text-black uppercase mb-4 sm:mb-6 focus:outline-none cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Wardrobe
        </button>

        {/* MAIN PRODUCT COCKPIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-10 bg-white p-4 md:p-8 rounded-3xl border border-zinc-200">
          
          {/* COLUMN 1: INTERACTIVE GALLERY SUITE (5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* HERO HERO CONTAINER */}
            <div
              id="detail-image-hero-viewport"
              className="relative aspect-[3/4] bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200 group/zoom shadow-xs cursor-crosshair select-none"
              onMouseEnter={() => !is360Active && !isVideoPlaying && setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
              {isVideoPlaying ? (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 text-center">
                  <Play className="h-10 w-10 text-orange-500 animate-ping mb-4" />
                  <p className="text-xs font-black text-white uppercase tracking-widest mb-1">CLINZA Editorial Video</p>
                  <p className="text-[11px] text-zinc-400 max-w-xs mb-6">Authentic showcase of fabric weight, motion fall, and tailored alignments on model.</p>
                  <button
                    id="stop-presentation-btn"
                    onClick={() => setIsVideoPlaying(false)}
                    className="bg-white/10 hover:bg-white text-[10px] text-white hover:text-black py-2 px-5 rounded-full font-bold uppercase transition-all cursor-pointer border border-white/20"
                  >
                    Close Video
                  </button>
                </div>
              ) : (
                <img
                  src={is360Active ? product.images[rotationIndex] : product.images[activeImgIdx]}
                  alt={product.name}
                  className={`h-full w-full object-cover object-center transition-all duration-300 ${
                    isZooming ? "scale-140" : "scale-100"
                  }`}
                  style={
                    isZooming
                      ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                      : undefined
                  }
                />
              )}

              {/* OUT OF STOCK BADGER */}
              {product.stockStatus === "Out of Stock" && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                  <span className="bg-red-650 text-white font-mono text-[10px] font-black tracking-widest px-4 py-2 uppercase">
                    Sold Out
                  </span>
                </div>
              )}

              {/* ACTION ZOOM INDICATOR */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center justify-center h-8 w-8 rounded-full bg-black/75 text-white pointer-events-none">
                <ZoomIn className="h-4 w-4" />
              </div>

              {/* OVERLAYS */}
              {is360Active && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white font-mono text-[10px] font-black tracking-[0.25em] uppercase pointer-events-none">
                  <RotateCw className="h-6 w-6 animate-spin text-orange-400 mb-2" /> 
                  SCANNING 360° VIEW
                </div>
              )}
            </div>

            {/* GALLERY THUMB TRACKS */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 items-center">
              {product.images.map((img, idx) => (
                <button
                  id={`detail-thumb-${idx}`}
                  key={idx}
                  onClick={() => {
                    setActiveImgIdx(idx);
                    setIsVideoPlaying(false);
                  }}
                  className={`relative aspect-[3/4] w-14 md:w-20 rounded-xl overflow-hidden border-2 shrink-0 bg-zinc-50 cursor-pointer transition-all ${
                    activeImgIdx === idx && !isVideoPlaying ? "border-orange-500 scale-102" : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}

              {/* VIDEO TRIGGER KEY */}
              <button
                id="detail-thumb-video"
                onClick={() => setIsVideoPlaying(true)}
                className={`relative aspect-[3/4] w-14 md:w-20 rounded-xl overflow-hidden border-2 shrink-0 bg-zinc-900 cursor-pointer flex flex-col items-center justify-center text-zinc-100 font-mono text-[8px] font-bold ${
                  isVideoPlaying ? "border-orange-500 bg-zinc-800" : "border-zinc-200 hover:border-zinc-700"
                }`}
              >
                <Play className="h-4 w-4 text-orange-400 mb-1" />
                <span>VIDEO</span>
              </button>

              {/* 360 SPIN TRIGGER KEY */}
              <button
                id="detail-thumb-360"
                onClick={handle360Rotate}
                className="relative aspect-[3/4] w-14 md:w-20 rounded-xl overflow-hidden border-2 border-zinc-200 shrink-0 bg-zinc-900 cursor-pointer flex flex-col items-center justify-center text-zinc-100 font-mono text-[8px] font-bold hover:border-orange-500"
              >
                <RotateCw className="h-4 w-4 text-orange-400 mb-1" />
                <span>360° SPIN</span>
              </button>
            </div>
            
          </div>

          {/* COLUMN 2: CUSTOM CONTROL HUB & CORE SPECS (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* NAME, HEADER & REVIEWS STATUS */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase bg-orange-50 px-2 py-0.5 rounded">
                  {product.brand}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  SKU: {product.sku}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-sans font-black tracking-tight text-zinc-950 uppercase">
                {product.name}
              </h1>

              {/* RATINGS LINE */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-zinc-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-zinc-600 font-bold font-sans">
                  {product.rating} Rating
                </span>
                <span className="text-xs text-orange-500 font-bold hover:underline cursor-pointer">
                  ({product.reviews.length} Customer reviews)
                </span>
              </div>
            </div>

            {/* SEVERE PRICING CARDS */}
            <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-3">
              <div className="flex items-baseline gap-3.5 flex-wrap">
                <span className="text-3xl font-black text-zinc-900">₹{product.price.toLocaleString("en-IN")}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-sm font-semibold text-zinc-400 line-through">MRP: ₹{product.originalPrice.toLocaleString("en-IN")}</span>
                    <span className="text-xs bg-red-650 text-white font-mono font-black px-2.5 py-0.5 rounded-none">{discountPercent}% OFF</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 border-t border-zinc-200 pt-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Delivery: <strong>Free Express Shipping</strong> nationwide. Pay on Delivery available.</span>
              </div>
            </div>

            {/* GARMENT CUSTOMIZABLE SWATCHES */}
            <div className="space-y-4 py-4 border-y border-zinc-200">
              
              {/* SWATCHES MATRIX */}
              <div>
                <span className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-2">
                  Select Color: <strong className="text-zinc-800">{selectedColor}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((col) => (
                    <button
                      id={`color-swatch-${col.name}`}
                      key={col.name}
                      onClick={() => setSelectedColor(col.name)}
                      className={`h-8 px-3 rounded-full border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedColor === col.name
                          ? "border-black bg-zinc-950 text-white font-black"
                          : "border-zinc-200 hover:border-zinc-950 bg-white text-zinc-700"
                      }`}
                    >
                      <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: col.hex }} />
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* SIZES MATRIX */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                    Select Size: <strong className="text-zinc-800">{selectedSize}</strong>
                  </span>
                  <button
                    id="trigger-sizechart-btn"
                    className="text-[10px] text-orange-500 hover:underline font-bold uppercase tracking-wider cursor-pointer"
                    onClick={() => setShowSizeModal(true)}
                  >
                    Size Advisor Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((sz) => (
                    <button
                      id={`size-swatch-${sz}`}
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`h-9 w-11 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        selectedSize === sz
                          ? "border-zinc-950 bg-zinc-950 text-white font-black"
                          : "border-zinc-200 hover:border-zinc-950 bg-white text-zinc-800"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUANTITY PICKER */}
              <div className="flex items-center gap-3">
                <span className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase select-none">
                  Choose Qty
                </span>
                <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50 h-9 w-24">
                  <button
                    id="qty-decrement"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-7 text-center text-sm font-black text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono text-xs font-bold text-zinc-800">
                    {quantity}
                  </span>
                  <button
                    id="qty-increment"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-7 text-center text-sm font-black text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* ACTIONS SYSTEM (BButtons aligned with specifications) */}
            <div className="space-y-3 pt-2">
              {product.stockStatus !== "Out of Stock" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      id="detail-add-to-bag"
                      onClick={handleAddToCartClick}
                      className="w-full bg-white hover:bg-zinc-50 border-2 border-zinc-950 text-zinc-950 font-sans text-xs font-black uppercase tracking-widest py-3 rounded-none flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                    >
                      <ShoppingBag className="h-4.5 w-4.5" /> Add to Bag
                    </button>
                    <button
                      id="detail-buy-now"
                      onClick={handleBuyNowClick}
                      className="w-full bg-zinc-900 hover:bg-orange-600 hover:text-black text-white font-sans text-xs font-black uppercase tracking-widest py-3 rounded-none flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
                    >
                      Buy Now
                    </button>
                  </div>

                  <a
                    id="detail-whatsapp-checkout"
                    href={buildWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#1b8a3a] hover:bg-[#126b2b] text-white font-sans text-xs font-black uppercase tracking-widest py-3 rounded-none transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <img 
                      src="https://i.postimg.cc/fVFPc5Mf/image.png" 
                      onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/Vr6DJmCQ/image.png"; }}
                      alt="WhatsApp" 
                      className="h-4.5 w-4.5 object-contain rounded-full bg-white shrink-0"
                    /> 
                    WhatsApp Order
                  </a>
                </>
              ) : (
                <button
                  id="detail-soldout-btn"
                  disabled
                  className="w-full bg-zinc-100 border border-zinc-250 text-zinc-400 font-sans text-xs font-bold uppercase tracking-widest py-3.5 cursor-not-allowed select-none text-center"
                >
                  Sold Out Catalog
                </button>
              )}
            </div>

            {/* ACCORDION CONTENT FOR SPECIFICATIONS, FABRIC, WASH, SHIPPING AND REFUNDS (AMAZON-STYLE) */}
            <div className="border border-zinc-200 rounded-2xl overflow-hidden mt-6 bg-white divide-y divide-zinc-200">
              
              {/* ACCORDION item 0: Description */}
              <div className="p-4 text-zinc-800">
                <span className="block text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-2">Designer's Description & Notes</span>
                <p className="text-xs leading-relaxed font-sans">{product.description}</p>
              </div>

              {/* ACCORDION ITEM 1: Fabric Details */}
              <div>
                <button
                  onClick={() => toggleAccordion("fabric")}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-orange-500" /> Fabric Specifications</span>
                  {openAccordion === "fabric" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === "fabric" && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-600 space-y-2">
                    <p>Woven meticulously using premium long-staple organic materials, specifically engineered for luxury breathability and continuous shape rentention.</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 bg-zinc-50 p-2 border border-zinc-100">
                      {product.specifications.map((spec) => (
                        <div key={spec.label} className="text-[11px]">
                          <strong className="text-zinc-700 block text-[9px] uppercase tracking-wider">{spec.label}</strong>
                          <span>{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACCORDION ITEM 2: Wash Care Instructions */}
              <div>
                <button
                  onClick={() => toggleAccordion("care")}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-orange-500" /> Wash Care Instructions</span>
                  {openAccordion === "care" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === "care" && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-650 space-y-1.5 font-sans">
                    <p>At CLINZA, we produce durable natural fiber garments. Treat with the following instructions to bypass common garment stresses:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Machine wash cold under 30°C on a delicate spin cycle.</li>
                      <li>Use mild organic eco-friendly detergents; do not bleach.</li>
                      <li>Damp hang-dry in shade. Never tumble dry raw linen or selvedge cotton.</li>
                      <li>Use a medium steam iron while the garment is naturally damp.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* ACCORDION ITEM 3: Shipping Policy */}
              <div>
                <button
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-orange-500" /> Shipping & Dispatch Logistics</span>
                  {openAccordion === "shipping" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === "shipping" && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-650 space-y-1 font-sans">
                    <p><strong>Frictionless Dispatch Corridor:</strong></p>
                    <p>All items in stock are carefully packed and dispatched from our primary hub within 24 hours.</p>
                    <ul className="list-disc pl-4 space-y-0.5 mt-1">
                      <li>Metros (Mumbai, Delhi, Bangalore): 2–3 business days.</li>
                      <li>Rest of India: 4–6 business days with real-time tracking IDs.</li>
                      <li>Free Express Shipping above order value ₹999.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* ACCORDION ITEM 4: Return Policy */}
              <div>
                <button
                  onClick={() => toggleAccordion("return")}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><RefreshCw className="h-4 w-4 text-orange-500" /> Return & Exchange Policy</span>
                  {openAccordion === "return" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openAccordion === "return" && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-650 space-y-1.5 font-sans">
                    <p>We are dedicated to building impeccable matching fits. If your sizing is not perfect:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Frictionless 10-day exchange or reverse pick-up window.</li>
                      <li>Reverse pick-up is completely free and handled from your doorstep.</li>
                      <li>Garments must remain unwashed with tags intact.</li>
                    </ul>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* AMAZON-STYLE A+ CORE STORY CONTENT */}
        <APlusContent block={product.aPlusContent} name={product.name} />

        {/* FREQUENTLY BOUGHT TOGETHER SECTION */}
        <div className="border border-zinc-200 p-6 md:p-8 rounded-3xl mt-12 bg-zinc-900 text-white relative overflow-hidden">
          {/* Ambient background accent */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[80px]" />
          
          <h3 className="text-xs font-black uppercase tracking-widest text-orange-400 font-mono mb-6 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-orange-400"></span> Frequently Bought Together
          </h3>
          
          <div className="flex flex-col lg:flex-row items-center gap-6 justify-between relative z-10">
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Product 1: Core */}
              <div className="flex items-center gap-3 bg-zinc-850 p-3 rounded-xl border border-zinc-800 w-full sm:w-auto">
                <img src={product.images[0]} alt="" className="h-16 w-12 object-cover rounded bg-zinc-900 shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] font-bold truncate max-w-[150px]">{product.name}</p>
                  <span className="text-xs font-black text-orange-400">₹{product.price.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <span className="text-sm font-bold text-zinc-400 select-none font-mono">+</span>

              {/* Product 2: Complementary Denim / Shirt */}
              {(() => {
                const isShirt = product.category?.toLowerCase()?.includes("shirt") ?? false;
                const crossImg = isShirt 
                  ? "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200"
                  : "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200";
                const crossName = isShirt ? "Raw Selvedge Denim" : "Normandy French Flax Shirt";
                const crossPrice = isShirt ? 2490 : 1890;

                return (
                  <>
                    <div className="flex items-center gap-3 bg-zinc-850 p-3 rounded-xl border border-zinc-800 w-full sm:w-auto">
                      <input type="checkbox" defaultChecked className="accent-orange-500 cursor-pointer h-4 w-4 shrink-0" id="cross-buy-box" />
                      <label htmlFor="cross-buy-box" className="flex items-center gap-3 cursor-pointer select-none">
                        <img src={crossImg} alt="" className="h-16 w-12 object-cover rounded bg-zinc-900 shrink-0" />
                        <div className="text-left">
                          <p className="text-[10px] font-bold truncate max-w-[150px]">{crossName}</p>
                          <span className="text-xs font-black text-orange-400 font-mono">₹{crossPrice.toLocaleString("en-IN")}</span>
                          <span className="text-[8px] uppercase tracking-wider font-extrabold bg-orange-500/10 px-1 py-0.5 text-orange-400 block mt-0.5 font-mono">Stylist Combo</span>
                        </div>
                      </label>
                    </div>

                    <span className="text-sm font-bold text-zinc-400 select-none font-mono">=</span>

                    {/* Total billing checkout trigger */}
                    <div className="p-5 bg-zinc-850 border border-zinc-800 rounded-xl text-center sm:text-left min-w-[210px] shadow-sm">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Bundle price</p>
                      <div className="flex items-baseline gap-2 mt-0.5 mb-2">
                        <span className="text-base font-black text-orange-400 font-mono">₹{(product.price + crossPrice).toLocaleString("en-IN")}</span>
                        <span className="line-through text-[10px] text-zinc-500 font-mono">₹{(product.originalPrice + crossPrice + 1200).toLocaleString("en-IN")}</span>
                      </div>
                      <button
                        onClick={() => {
                          onAddToCart(product, selectedColor, selectedSize, 1);
                          // Create artificial complementary product
                          const fakeAddon: Product = {
                            id: isShirt ? "addon-jeans" : "addon-shirt",
                            name: crossName,
                            slug: isShirt ? "selvedge-jeans" : "european-flax-shirt",
                            price: crossPrice,
                            originalPrice: crossPrice + 1200,
                            rating: 4.8,
                            stockStatus: "In Stock",
                            brand: "CLINZA Luxury",
                            category: isShirt ? "jeans" : "shirts",
                            sku: isShirt ? "CLZ-SEL-JEAN-M" : "CLZ-FLX-SHRT-M",
                            collection: isShirt ? ProductCollection.JEANS : ProductCollection.SHIRTS,
                            description: `Complementary textile styling recommended dynamically to pair with ${product.name}. Woven meticulously with premium long-staple organic flax strands, standard pre-treated bounds.`,
                            images: [crossImg],
                            colors: [{ name: isShirt ? "Dark Indigo" : "French White", hex: isShirt ? "#1a2a3a" : "#ffffff" }],
                            sizes: ["M", "L", "XL"],
                            reviews: [],
                            specifications: [],
                            aPlusContent: {
                              title: "Artisanal Craft",
                              description: "Spun in India based on legacy weave models.",
                              features: []
                            }
                          };
                          onAddToCart(fakeAddon, fakeAddon.colors[0].name, "M", 1);
                          alert("Great selection! Both items packed successfully in your shopping bag. Head over to Cart to finalize details.");
                        }}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-black font-mono text-[9px] font-black uppercase tracking-widest py-2 rounded-lg transition-all cursor-pointer"
                      >
                        Add Combo to Bag
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* RELATED / RECOMMENDED PRODUCTS CATALOG */}
        {relatedList.length > 0 && (
          <div className="mt-10 md:mt-12 text-left">
            <h2 className="text-xl md:text-2xl font-sans font-black tracking-tight text-zinc-950 uppercase mb-4 flex items-center gap-2">
              <span className="h-5 w-1 bg-zinc-950" /> Related Collections Recommendations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    // Navigate to product and reset states safely
                    window.location.hash = `#product-${item.slug}`;
                    const customHashChangeEvent = new HashChangeEvent("hashchange");
                    window.dispatchEvent(customHashChangeEvent);
                  }}
                  className="group bg-white border border-zinc-200 hover:border-black rounded-lg overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer p-3"
                >
                  <div className="aspect-[3/4] bg-zinc-50 rounded-md overflow-hidden relative mb-2">
                    <img src={item.images[0]} alt="" className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                    {item.isTrending && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white font-mono text-[7px] font-black tracking-widest px-1.5 py-0.5">TRENDING</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono font-black text-orange-500 uppercase">{item.category}</p>
                    <h4 className="text-xs font-bold font-serif text-zinc-900 truncate">{item.name}</h4>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-950">₹{item.price.toLocaleString("en-IN")}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-[10px] text-zinc-400 line-through">₹{item.originalPrice.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS COMMENTS SUMMARY FOR VERIFICATION */}
        <div className="border-t border-zinc-200 pt-10 mt-10 md:pt-12 md:mt-12 text-left">
          <h2 className="text-xl md:text-2xl font-sans font-black tracking-tight text-zinc-950 uppercase mb-5">
            Verified Client Logs ({product.reviews.length})
          </h2>
          {product.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs font-extrabold text-zinc-905">{rev.userName}</p>
                        <p className="text-[9px] text-zinc-450 font-mono tracking-wider">{rev.location} • Verified Buyer</p>
                      </div>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed font-sans">{rev.comment}</p>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono mt-4 block">{rev.date || "Verified Purchase"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 p-8 text-center text-zinc-450 rounded-2xl font-sans text-xs">
              Zero active comments logged yet. Be the absolute first to submit styling reviews!
            </div>
          )}
        </div>

      </div>

      {/* SIZING ADVISOR MODAL */}
      {showSizeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 text-left animate-fade-in select-none">
          <div className="bg-white rounded-none max-w-sm w-full border border-black p-6 relative">
            <button
              onClick={() => setShowSizeModal(false)}
              className="absolute top-0 right-0 p-3 hover:bg-black hover:text-white border-b border-l border-zinc-200 text-zinc-450 z-10 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-zinc-950 text-xs font-bold uppercase tracking-widest font-mono mb-4 flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 bg-orange-500"></span> Sizing Advisor Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 font-bold bg-zinc-50 text-zinc-700">
                    <th className="p-2 uppercase tracking-wide">Tag Label</th>
                    <th className="p-2 uppercase tracking-wide">Chest (in)</th>
                    <th className="p-2 uppercase tracking-wide">Waist (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono">
                  <tr>
                    <td className="p-2 font-bold text-zinc-950">S</td>
                    <td className="p-2 text-zinc-500">38 inches</td>
                    <td className="p-2 text-zinc-500">30 inches</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-zinc-950">M</td>
                    <td className="p-2 text-zinc-500">40 inches</td>
                    <td className="p-2 text-zinc-500">32 inches</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-zinc-950">L</td>
                    <td className="p-2 text-zinc-500">42 inches</td>
                    <td className="p-2 text-zinc-500">34 inches</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-zinc-950">XL</td>
                    <td className="p-2 text-zinc-500">44 inches</td>
                    <td className="p-2 text-zinc-500">36 inches</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-zinc-950">XXL</td>
                    <td className="p-2 text-zinc-500">46 inches</td>
                    <td className="p-2 text-zinc-500">38 inches</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-zinc-500 leading-relaxed font-sans mt-4">
              Our wardrobes fit true to standard European specs. Spun with double locks. Reach our WhatsApp hotline for custom measurements.
            </p>
          </div>
        </div>
      )}

    </article>
  );
}
