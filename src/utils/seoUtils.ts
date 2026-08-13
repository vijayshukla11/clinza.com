/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "../types";
import { CollectionItem } from "../services/supabaseService";

export interface SeoMetaOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: "website" | "product" | "article";
  price?: number;
  currency?: string;
  availability?: string;
  siteName?: string;
  twitterSite?: string;
}

const DEFAULT_DOMAIN = "https://www.clinza.in";
const DEFAULT_SITE_NAME = "CLINZA";
const DEFAULT_FALLBACK_IMAGE = "https://www.clinza.in/icon.png";

/**
 * Sets or creates a <meta> element in document.head
 */
export function setHeadMetaTag(selector: string, attrName: string, attrValue: string, content: string): void {
  if (typeof document === "undefined") return;

  let element = document.querySelector(selector);
  if (element) {
    element.setAttribute("content", content);
  } else {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrValue);
    element.setAttribute("content", content);
    document.head.appendChild(element);
  }
}

/**
 * Sets or creates a <link rel="canonical"> element in document.head
 */
export function setCanonicalUrl(url: string): void {
  if (typeof document === "undefined") return;

  let link = document.querySelector('link[rel="canonical"]');
  if (link) {
    link.setAttribute("href", url);
  } else {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", url);
    document.head.appendChild(link);
  }
}

/**
 * Dynamically injects or updates OpenGraph, Twitter, and standard SEO meta tags into <head>
 */
export function updateSeoMetaTags(options: SeoMetaOptions): void {
  if (typeof document === "undefined") return;

  const {
    title,
    description,
    url,
    image = DEFAULT_FALLBACK_IMAGE,
    type = "website",
    price,
    currency = "INR",
    availability = "instock",
    siteName = DEFAULT_SITE_NAME,
    twitterSite = "@clinza_in"
  } = options;

  // 1. Page Title
  if (title) {
    document.title = title;
  }

  // 2. Standard Meta Description
  if (description) {
    setHeadMetaTag('meta[name="description"]', 'name', 'description', description);
  }

  // 3. Canonical Link
  if (url) {
    setCanonicalUrl(url);
  }

  // 4. OpenGraph Tags
  setHeadMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
  setHeadMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
  if (title) setHeadMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
  if (description) setHeadMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  if (url) setHeadMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
  if (image) setHeadMetaTag('meta[property="og:image"]', 'property', 'og:image', image);

  // OpenGraph Product specific attributes
  if (type === "product") {
    if (price !== undefined && price !== null) {
      setHeadMetaTag('meta[property="product:price:amount"]', 'property', 'product:price:amount', String(price));
    }
    if (currency) {
      setHeadMetaTag('meta[property="product:price:currency"]', 'property', 'product:price:currency', currency);
    }
    if (availability) {
      setHeadMetaTag('meta[property="product:availability"]', 'property', 'product:availability', availability);
    }
  }

  // 5. Twitter Card Meta Tags
  setHeadMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  if (twitterSite) setHeadMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', twitterSite);
  if (title) setHeadMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  if (description) setHeadMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  if (image) setHeadMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);
}

/**
 * Resets head SEO meta tags back to site default values
 */
export function resetSeoMetaTagsToDefault(domain: string = DEFAULT_DOMAIN): void {
  updateSeoMetaTags({
    title: "CLINZA | Luxury European Linen & Tailored Menswear",
    description: "Explore CLINZA for luxury European linen shirts, suits, pants, and bespoke tailored menswear crafted with Italian and European fabrics in Mumbai, India.",
    url: `${domain}/`,
    image: DEFAULT_FALLBACK_IMAGE,
    type: "website"
  });
}

/**
 * Generate and inject OpenGraph & Twitter tags for a Product
 */
export function updateProductSeoTags(product: Partial<Product>, domain: string = DEFAULT_DOMAIN): void {
  if (!product) return;

  const rawTitle = product.seoTitle || (product as any).metaTitle || (product.name ? `${product.name} | CLINZA` : "CLINZA Luxury Apparel");
  const cleanTitle = rawTitle.includes("CLINZA") ? rawTitle : `${rawTitle} | CLINZA`;

  const rawDesc =
    product.metaDescription ||
    (product as any).seoDescription ||
    product.description ||
    product.shortDescription ||
    `Discover ${product.name || "luxury menswear"} crafted from premium materials at CLINZA.`;
  const cleanDescription = rawDesc.replace(/(<([^>]+)>)/gi, "").trim();

  const productSlug = product.slug || product.id || "";
  const canonicalUrl = `${domain}/product/${productSlug}`;

  const image =
    product.seoImage ||
    (Array.isArray(product.images) && product.images[0]) ||
    (product as any).image ||
    DEFAULT_FALLBACK_IMAGE;

  const inStock = product.stockStatus !== "Out of Stock" && (product.stockQuantity === undefined || product.stockQuantity > 0);

  updateSeoMetaTags({
    title: cleanTitle,
    description: cleanDescription,
    url: canonicalUrl,
    image,
    type: "product",
    price: product.price,
    currency: "INR",
    availability: inStock ? "instock" : "oos"
  });
}

/**
 * Generate and inject OpenGraph & Twitter tags for a Collection or Category
 */
export function updateCollectionSeoTags(
  collection: Partial<CollectionItem> & {
    seoTitle?: string;
    seoDescription?: string;
    shortDescription?: string;
    bannerImage?: string;
    image?: string;
  },
  domain: string = DEFAULT_DOMAIN
): void {
  if (!collection) return;

  const collectionName = collection.name || "Collection";
  const rawTitle = collection.seoTitle || collection.metaTitle || `${collectionName} | CLINZA`;
  const cleanTitle = rawTitle.includes("CLINZA") ? rawTitle : `${rawTitle} | CLINZA`;

  const rawDesc =
    collection.seoDescription ||
    collection.metaDescription ||
    collection.description ||
    collection.shortDescription ||
    `Explore our curated ${collectionName} collection at CLINZA. Luxury menswear & tailored fits.`;
  const cleanDescription = rawDesc.replace(/(<([^>]+)>)/gi, "").trim();

  const collectionSlug = collection.slug || collectionName.toLowerCase().replace(/\s+/g, "-");
  const canonicalUrl = `${domain}/collections/${collectionSlug}`;

  const image =
    collection.image ||
    collection.banner ||
    collection.bannerImage ||
    collection.thumbnail ||
    DEFAULT_FALLBACK_IMAGE;

  updateSeoMetaTags({
    title: cleanTitle,
    description: cleanDescription,
    url: canonicalUrl,
    image,
    type: "website"
  });
}
