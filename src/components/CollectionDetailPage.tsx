/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ChevronRight, ArrowLeft, Filter, SlidersHorizontal, Package, RefreshCw } from "lucide-react";
import { CollectionsService, CollectionItem, ProductsService } from "../services/supabaseService";
import { Product } from "../types";
import ProductCard from "./ProductCard";

interface CollectionDetailPageProps {
  slug: string;
  setRoute: (route: string) => void;
  onAddToCart?: (product: Product, color: string, size: string, quantity?: number) => void;
  onAddToWishlist?: (product: Product) => void;
  wishlistIds?: string[];
  onOpenQuickView?: (product: Product) => void;
}

export default function CollectionDetailPage({
  slug,
  setRoute,
  onAddToCart,
  onAddToWishlist,
  wishlistIds = [],
  onOpenQuickView
}: CollectionDetailPageProps) {
  const [collection, setCollection] = useState<CollectionItem | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<string>("featured");
  const [maxPrice, setMaxPrice] = useState<number>(4999);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCollectionData() {
      setLoading(true);
      try {
        const [cols, prods] = await Promise.all([
          CollectionsService.getAll(),
          ProductsService.getAll()
        ]);

        if (isMounted) {
          const normSlug = (slug || "").toLowerCase().trim();
          setAllProducts(prods || []);

          // Find collection by slug or id
          const matched = (cols || []).find(
            (c) =>
              c.slug.toLowerCase() === normSlug ||
              c.id.toLowerCase() === normSlug ||
              (c.name && c.name.toLowerCase().replace(/\s+/g, "-") === normSlug)
          );

          if (matched) {
            setCollection(matched);
            // SEO update
            const seoTitle = matched.seoTitle || matched.metaTitle || `${matched.name} | CLINZA`;
            const seoDesc =
              matched.seoDescription ||
              matched.metaDescription ||
              matched.description ||
              matched.shortDescription ||
              `Discover ${matched.name} collection at CLINZA.`;

            document.title = seoTitle;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute("content", seoDesc);
            }
          } else {
            // Fallback object for unmapped/dynamic category slugs like "all", "shirts", "jeans"
            const fallbackName =
              normSlug === "all"
                ? "All Wardrobe Products"
                : normSlug
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");

            setCollection({
              id: normSlug,
              name: fallbackName,
              slug: normSlug,
              description: `Explore our complete range of ${fallbackName.toLowerCase()} crafted with premium fabrics and sartorial precision.`,
              banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
              thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
              isActive: true,
              displayOrder: 99
            });

            document.title = `${fallbackName} | CLINZA`;
          }
        }
      } catch (e) {
        console.error("Error loading collection detail page:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCollectionData();

    // Listen to real-time CMS updates
    const handleUpdate = () => {
      loadCollectionData();
    };
    window.addEventListener("clinza_collections_updated", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("clinza_collections_updated", handleUpdate);
    };
  }, [slug]);

  // Filter products matching collection slug
  const normalizedSlug = (slug || "").toLowerCase().trim();

  let filteredProducts = allProducts.filter((p) => {
    if (inStockOnly && p.stock === 0) return false;
    if (p.price > maxPrice) return false;

    if (normalizedSlug === "all") return true;

    if (normalizedSlug === "premium-linen" || normalizedSlug === "linen-shirts") {
      return p.category?.toLowerCase().includes("linen") || p.description?.toLowerCase().includes("linen") || p.name?.toLowerCase().includes("linen");
    }

    if (normalizedSlug === "combo" || normalizedSlug === "combos" || normalizedSlug === "co-ord") {
      return (
        p.collection?.toLowerCase().includes("combo") ||
        p.category?.toLowerCase().includes("combo") ||
        p.name?.toLowerCase().includes("co-ord") ||
        p.name?.toLowerCase().includes("set")
      );
    }

    if (normalizedSlug === "shirts") {
      return p.collection?.toLowerCase().includes("shirt") || p.category?.toLowerCase().includes("shirt") || p.name?.toLowerCase().includes("shirt");
    }

    if (normalizedSlug === "jeans") {
      return p.collection?.toLowerCase().includes("jean") || p.category?.toLowerCase().includes("jean") || p.name?.toLowerCase().includes("jean") || p.category?.toLowerCase().includes("denim");
    }

    if (normalizedSlug === "pants" || normalizedSlug === "trousers") {
      return p.collection?.toLowerCase().includes("pant") || p.collection?.toLowerCase().includes("trouser") || p.category?.toLowerCase().includes("pant") || p.category?.toLowerCase().includes("trouser") || p.name?.toLowerCase().includes("pant") || p.name?.toLowerCase().includes("trouser");
    }

    if (normalizedSlug === "trending") return p.isTrending;
    if (normalizedSlug === "new-arrivals") return p.isNewArrival;

    const cleanSlug = normalizedSlug.replace(/^(col-|cat-|collection-)/, "").trim();

    return (
      (p.collection && (p.collection.toLowerCase().includes(normalizedSlug) || p.collection.toLowerCase().includes(cleanSlug))) ||
      (p.category && (p.category.toLowerCase().includes(normalizedSlug) || p.category.toLowerCase().includes(cleanSlug))) ||
      (p.description && (p.description.toLowerCase().includes(normalizedSlug) || p.description.toLowerCase().includes(cleanSlug))) ||
      (p.name && (p.name.toLowerCase().includes(normalizedSlug) || p.name.toLowerCase().includes(cleanSlug)))
    );
  });

  // Fallback if specific keyword filters returned 0 items
  if (filteredProducts.length === 0 && allProducts.length > 0) {
    filteredProducts = allProducts;
  }

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "rank") {
      const rankA = a.trendingRank !== undefined && a.trendingRank !== null ? a.trendingRank : 999;
      const rankB = b.trendingRank !== undefined && b.trendingRank !== null ? b.trendingRank : 999;
      return rankA - rankB;
    }
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "newest") return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
    return 0; // featured
  });

  const bannerImg =
    collection?.banner ||
    collection?.thumbnail ||
    collection?.image ||
    "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png";

  return (
    <div id="collection-detail-page" className="bg-[#FAFAF8] min-h-screen text-left font-sans text-[#111111] animate-fade-in pb-16">
      
      {/* TOP NAVIGATION & BREADCRUMB */}
      <div className="bg-white border-b border-[#ECECEC] py-3.5 px-4 sm:px-8 lg:px-12">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            <button
              onClick={() => setRoute("home")}
              className="hover:text-black transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <button
              onClick={() => setRoute("collections")}
              className="hover:text-black transition-colors cursor-pointer"
            >
              Collections
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-black font-bold truncate max-w-[200px]">
              {collection?.name || slug}
            </span>
          </nav>

          <button
            onClick={() => setRoute("collections")}
            className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-600 hover:text-black flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Collections</span>
          </button>
        </div>
      </div>

      {/* LARGE EDITORIAL BANNER */}
      <section id="collection-banner-header" className="relative bg-zinc-950 text-white overflow-hidden min-h-[220px] sm:min-h-[280px] md:min-h-[340px] flex items-end">
        <img
          src={bannerImg}
          alt={collection?.name || slug}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-65"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 md:py-12 space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#F27D26] bg-black/40 backdrop-blur-md px-3 py-1 inline-block border border-[#F27D26]/20">
            COLLECTION ATELIER
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-sans drop-shadow-md">
            {collection?.name || slug.replace("-", " ")}
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm font-light max-w-2xl leading-relaxed">
            {collection?.description ||
              `Explore our curated selection of ${collection?.name || slug} coordinates, crafted for physical longevity and effortless stance.`}
          </p>
        </div>
      </section>

      {/* CONTROLS BAR: FILTER & SORT */}
      <section id="collection-controls-bar" className="bg-white border-b border-[#ECECEC] sticky top-[70px] lg:top-[76px] z-30 shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-4 flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Product count */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-950">
              {sortedProducts.length} {sortedProducts.length === 1 ? "Product" : "Products"} Found
            </span>
          </div>

          {/* Right: Filters & Sort */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            
            {/* Price slider */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Max ₹{maxPrice}
              </span>
              <input
                type="range"
                min="999"
                max="4999"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="accent-[#F27D26] h-1.5 w-24 sm:w-32 bg-zinc-200 cursor-pointer"
              />
            </div>

            {/* In stock checkbox */}
            <label className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-[#F27D26] h-3.5 w-3.5 cursor-pointer border-zinc-300"
              />
              In Stock
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-900 py-1.5 px-3 focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="featured">Featured Order</option>
                <option value="rank">By Rank Sequence (#1 Top Demand)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

          </div>

        </div>
      </section>

      {/* PRODUCT GRID SECTION */}
      <section id="collection-products-grid" className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10">
        
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="h-8 w-8 border-2 border-[#F27D26] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase font-mono tracking-widest text-zinc-500 font-bold animate-pulse">
              Fetching Collection Garments...
            </p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-20 text-center bg-white border border-zinc-200 p-8 max-w-lg mx-auto space-y-4">
            <Package className="h-10 w-10 text-zinc-300 mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
              No Products Match Your Filters
            </h3>
            <p className="text-xs text-zinc-500 font-light leading-relaxed">
              Try adjusting your price range filter or browse all active items in our catalog.
            </p>
            <button
              onClick={() => {
                setMaxPrice(4999);
                setInStockOnly(false);
                setSortBy("featured");
              }}
              className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#F27D26] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {sortedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onProductClick={(p) => setRoute(`product/${p.slug}`)}
                onAddToWishlist={onAddToWishlist}
                onAddToCart={onAddToCart}
                wishlistIds={wishlistIds}
                onOpenQuickView={onOpenQuickView}
                setRoute={setRoute}
              />
            ))}
          </div>
        )}

      </section>

    </div>
  );
}
