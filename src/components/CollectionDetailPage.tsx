/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, Filter, SlidersHorizontal, Package, RefreshCw } from "lucide-react";
import { CollectionsService, CollectionItem, ProductsService, CategoriesService } from "../services/supabaseService";
import { Product } from "../types";
import { isProductInCollection, COLLECTION_ALIASES } from "../utils/productMatcher";
import { updateCollectionSeoTags, resetSeoMetaTagsToDefault } from "../utils/seoUtils";
import ProductCard from "./ProductCard";
import NotFoundPage from "./NotFoundPage";

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
        const [cols, cats, prods] = await Promise.all([
          CollectionsService.getAll(),
          CategoriesService.getAll(),
          ProductsService.getAll()
        ]);

        if (isMounted) {
          const normSlug = (slug || "").toLowerCase().trim();
          setAllProducts(prods || []);

          // Find standard collection or category by slug or id
          const matched = (cols || []).find(
            (c) =>
              (c.slug && c.slug.toLowerCase() === normSlug) ||
              (c.id && c.id.toLowerCase() === normSlug) ||
              (c.name && c.name.toLowerCase().replace(/\s+/g, "-") === normSlug)
          ) || (cats || []).find(
            (c) =>
              (c.slug && c.slug.toLowerCase() === normSlug) ||
              (c.id && c.id.toLowerCase() === normSlug) ||
              (c.name && c.name.toLowerCase().replace(/\s+/g, "-") === normSlug)
          );

          if (matched) {
            setCollection(matched as any);
            updateCollectionSeoTags(matched as any);
          } else {
            // Fallback object for unmapped/dynamic category slugs like "all", "shirts", "jeans"
            const fallbackName =
              normSlug === "all"
                ? "All Wardrobe Products"
                : normSlug
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");

            const fallbackDesc = `Explore our complete range of ${fallbackName.toLowerCase()} crafted with premium fabrics and sartorial precision.`;

            const fallbackObj = {
              id: normSlug,
              name: fallbackName,
              slug: normSlug,
              description: fallbackDesc,
              banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
              thumbnail: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
              isActive: true,
              displayOrder: 99
            };

            setCollection(fallbackObj);
            updateCollectionSeoTags(fallbackObj);
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
    window.addEventListener("clinza_categories_updated", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("clinza_collections_updated", handleUpdate);
      window.removeEventListener("clinza_categories_updated", handleUpdate);
    };
  }, [slug]);

  // Dynamically update OpenGraph and Twitter SEO meta tags on collection load and clean up on unmount
  useEffect(() => {
    if (collection) {
      updateCollectionSeoTags(collection);
    }
    return () => {
      resetSeoMetaTagsToDefault();
    };
  }, [collection]);

  // Filter products matching collection slug
  let filteredProducts = allProducts.filter((p) => {
    if (inStockOnly && p.stockQuantity === 0) return false;
    if (p.price > maxPrice) return false;

    return isProductInCollection(p, slug, collection);
  });

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

      {/* LARGE EDITORIAL BANNER - CLEAN POSTER IMAGE WITH ACCESSIBLE SEO TEXT */}
      <section id="collection-banner-header" className="relative w-full overflow-hidden bg-stone-100 border-b border-stone-200">
        <img
          src={bannerImg}
          alt={collection?.name || slug}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png";
          }}
          className="w-full h-auto max-h-[480px] object-cover object-center block"
          loading="eager"
        />

        {/* Visually hidden text for SEO crawlers & Screen Readers */}
        <div className="sr-only">
          <h1>{collection?.name || slug.replace("-", " ")}</h1>
          <p>
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
                onProductClick={(p) => setRoute(`product/${p.slug || p.id}`)}
                onAddToWishlist={onAddToWishlist}
                onAddToCart={onAddToCart}
                wishlistIds={wishlistIds}
                onOpenQuickView={onOpenQuickView}
                setRoute={setRoute}
                idPrefix="collection-detail"
              />
            ))}
          </div>
        )}

      </section>

    </div>
  );
}
