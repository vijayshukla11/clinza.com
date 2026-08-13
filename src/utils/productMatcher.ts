/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "../types";
import { CollectionItem } from "../services/supabaseService";

/**
 * Centralized alias configuration mapping canonical keys to keyword variations.
 * Editing or extending aliases here updates collection/category matching across the entire platform.
 */
export const COLLECTION_ALIASES: Record<string, string[]> = {
  shirts: ["shirt", "shirts", "button-down", "polo", "linen-shirt", "cotton-shirt"],
  jeans: ["jean", "jeans", "denim"],
  pants: ["pant", "pants", "trouser", "trousers", "chinos", "formal-pant", "linen-pant"],
  combos: ["combo", "combos", "co-ord", "set", "sets", "linen-combo-set", "combo-sets"],
  linen: ["linen", "premium-linen"],
  footwear: ["footwear", "shoe", "shoes", "sneaker", "sneakers", "loafers"],
  accessories: ["accessory", "accessories", "belt", "wallet", "tie"]
};

/**
 * Safely normalizes arbitrary text to lowercase trimmed string, handling null/undefined.
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text.toLowerCase().trim();
}

/**
 * Normalizes slug or ID values by stripping common prefixes and non-alphanumeric noise.
 */
export function normalizeSlug(slug: string | null | undefined): string {
  const raw = normalizeText(slug);
  if (!raw) return "";
  return raw.replace(/^(col-|cat-|collection-)/, "").trim();
}

/**
 * Handles special/virtual system collections (all, trending, new-arrivals, best-sellers, featured).
 * Returns true/false if target corresponds to a special collection, or null if target is standard.
 */
export function matchesSpecialCollection(product: Product, targetSlug: string): boolean | null {
  const norm = normalizeSlug(targetSlug);
  if (!norm) return null;

  if (norm === "all") {
    return true;
  }

  if (norm === "trending") {
    return Boolean(
      product.isTrending ||
      (product.trendingRank && product.trendingRank > 0) ||
      normalizeText(product.demandBadge).includes("trending") ||
      normalizeText(product.demandBadge).includes("high demand") ||
      product.merchandisingSlugs?.some((s) => normalizeText(s).includes("trending"))
    );
  }

  if (norm === "new-arrivals" || norm === "new_arrivals" || norm === "new-arrivals-grid" || norm === "new-arrivals-all") {
    return Boolean(
      product.isNewArrival ||
      product.merchandisingSlugs?.some((s) => normalizeText(s).includes("new"))
    );
  }

  if (norm === "best-sellers" || norm === "bestsellers" || norm === "best_sellers") {
    return Boolean(
      normalizeText(product.demandBadge).includes("best seller") ||
      product.merchandisingSlugs?.some((s) => normalizeText(s).includes("best-sellers")) ||
      product.isTrending ||
      (product as any).is_featured ||
      (product as any).featured ||
      (product.rating && product.rating >= 4.5) ||
      ((product as any).displayOrder !== undefined && (product as any).displayOrder <= 12)
    );
  }

  if (norm === "featured") {
    return Boolean(
      product.rating && product.rating >= 4.8 || product.isTrending
    );
  }

  return null;
}

/**
 * Safely checks if target phrase/token matches within text on word boundaries.
 * Prevents false positive substring matches (e.g., 'offset' matching 'set').
 */
export function matchesToken(text: string | null | undefined, target: string | null | undefined): boolean {
  if (!text || !target) return false;
  const normalizedText = normalizeText(text);
  const normalizedTarget = normalizeText(target);
  if (!normalizedText || !normalizedTarget) return false;

  const escaped = normalizedTarget.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");
  return regex.test(normalizedText);
}

/**
 * Checks if the product matches any configured keyword aliases for the given target slug.
 */
export function matchesKeywordAlias(product: Product, targetSlug: string): boolean {
  const normTarget = normalizeSlug(targetSlug);
  if (!normTarget) return false;

  const prodCollection = normalizeText(product.collection);
  const prodCategory = normalizeText(product.category);
  const prodName = normalizeText(product.name);

  // Find matching alias group key or alias array
  for (const [key, aliases] of Object.entries(COLLECTION_ALIASES)) {
    const keyNorm = normalizeSlug(key);
    const matchesGroup = keyNorm === normTarget || aliases.some((a) => normalizeSlug(a) === normTarget);

    if (matchesGroup) {
      return aliases.some((alias) => {
        const normAlias = normalizeSlug(alias);
        const aliasWords = normAlias.replace(/-/g, " ");
        return (
          prodCollection === normAlias ||
          prodCategory === normAlias ||
          matchesToken(prodCollection, normAlias) ||
          matchesToken(prodCollection, aliasWords) ||
          matchesToken(prodCategory, normAlias) ||
          matchesToken(prodCategory, aliasWords) ||
          matchesToken(prodName, normAlias) ||
          matchesToken(prodName, aliasWords)
        );
      });
    }
  }

  return false;
}

/**
 * Direct check against metadata provided by a CollectionItem metadata object.
 */
export function matchesCollectionMetadata(product: Product, collection?: CollectionItem | null): boolean {
  if (!collection) return false;

  const colId = normalizeSlug(collection.id);
  const colSlug = normalizeSlug(collection.slug);
  const colName = normalizeText(collection.name);
  const colNameSlug = colName.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const prodCol = normalizeSlug(product.collection);
  const prodCat = normalizeText(product.category);
  const prodCatSlug = prodCat.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Match ID, Slug, or Name (both direct & normalized)
  if (colId && prodCol === colId) return true;
  if (colSlug && (prodCol === colSlug || prodCatSlug === colSlug)) return true;
  if (colName && (prodCol === colName || prodCat === colName || prodCatSlug === colNameSlug)) return true;

  return false;
}

/**
 * CANONICAL SINGLE SOURCE OF TRUTH
 * Determines whether a product belongs to a given collection or category using hierarchical matching:
 * 1. Special Collections (all, trending, new-arrivals, etc.)
 * 2. Collection Metadata Match (ID / Slug / Name)
 * 3. Exact Collection/Category ID or Slug Match
 * 4. Keyword Alias Match
 * 5. Safe Token Match (Name / Category / Collection) — Never searches description
 */
export function isProductInCollection(
  product: Product | null | undefined,
  targetSlugOrId: string | null | undefined,
  collection?: CollectionItem | null
): boolean {
  if (!product) return false;

  // 1. Check special collections
  if (targetSlugOrId) {
    const specialMatch = matchesSpecialCollection(product, targetSlugOrId);
    if (specialMatch !== null) return specialMatch;
  }

  // 2. Collection metadata object check
  if (collection && matchesCollectionMetadata(product, collection)) {
    return true;
  }

  const normTarget = normalizeSlug(targetSlugOrId);
  if (!normTarget) return false;

  const prodCollection = normalizeSlug(product.collection);
  const prodCategory = normalizeText(product.category);
  const prodName = normalizeText(product.name);
  const prodCategorySlug = prodCategory.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const normTargetSlug = normTarget.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Priority 1 & 2: Exact ID / Slug Match
  if (prodCollection === normTarget || (normTargetSlug && prodCollection === normTargetSlug)) return true;
  if (prodCategorySlug === normTarget || (normTargetSlug && prodCategorySlug === normTargetSlug)) return true;

  // Priority 3 & 4: Exact Category / Collection Name Match
  if (prodCategory === normTarget || prodCategory === normTargetSlug) return true;
  if (prodCollection === normTarget || prodCollection === normTargetSlug) return true;

  // Priority 5: Keyword Alias Match
  if (matchesKeywordAlias(product, normTarget)) return true;

  // Priority 6: Safe Token Match (Word boundaries on Name, Category, Collection; never description)
  const targetWords = normTarget.replace(/-/g, " ");
  if (matchesToken(prodName, normTarget) || matchesToken(prodName, targetWords)) return true;
  if (matchesToken(prodCategory, normTarget) || matchesToken(prodCategory, targetWords)) return true;
  if (matchesToken(prodCollection, normTarget) || matchesToken(prodCollection, targetWords)) return true;

  return false;
}
