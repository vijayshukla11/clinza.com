import React from "react";
import { useLocation } from "react-router-dom";
import { Product } from "../types";
import { getProducts, getBlogs } from "../utils";

interface SchemaMarkupProps {
  activeProduct?: Product | null;
  activeBlogSlug?: string | null;
}

const BASE_DOMAIN = "https://clinza.in";
const LOGO_URL = "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/logo%20n%20deisgn/clinza.png";
const DEFAULT_OG_IMAGE = "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png";

/**
 * Strips HTML tags and collapses whitespace for clean schema string values.
 */
function cleanText(input?: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function SchemaMarkup({ activeProduct, activeBlogSlug }: SchemaMarkupProps) {
  const location = useLocation();
  const path = location.pathname;

  React.useEffect(() => {
    // 1. Remove any previously injected dynamic schema scripts to prevent duplicate tags
    const existingScripts = document.querySelectorAll("script[data-dynamic-schema='true']");
    existingScripts.forEach(el => el.remove());

    const schemas: any[] = [];

    // 2. Organization Schema (always present)
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      "name": "CLINZA",
      "url": BASE_DOMAIN,
      "logo": LOGO_URL,
      "image": DEFAULT_OG_IMAGE,
      "description": "Luxury European linen shirts, raw selvedge denim, double-pleated sartorial trousers, and bespoke menswear.",
      "sameAs": [
        "https://www.instagram.com/clinza.in",
        "https://www.facebook.com/clinza.in"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-7208572688",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      }
    };
    schemas.push(orgSchema);

    // 3. WebSite Schema with SearchAction ONLY on Homepage
    if (path === "/" || path === "") {
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "CLINZA",
        "url": BASE_DOMAIN,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${BASE_DOMAIN}/collections?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };
      schemas.push(websiteSchema);
    }

    // 4. BreadcrumbList Schema (scoped to deeper routes)
    const pathParts = path.split("/").filter(Boolean);
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_DOMAIN
      }
    ];

    let currentUrl = BASE_DOMAIN;
    pathParts.forEach((part, index) => {
      currentUrl += `/${part}`;
      const formattedName = part
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
      breadcrumbItems.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": formattedName,
        "item": currentUrl
      });
    });

    if (breadcrumbItems.length > 1) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
      };
      schemas.push(breadcrumbSchema);
    }

    let pageTitle = "CLINZA | Luxury European Linen & Tailored Menswear";
    let pageDescription = "Explore CLINZA for luxury European linen shirts, raw selvedge denim, sartorial trousers, and coordinates crafted with uncompromised quality.";
    let pageOgImage = DEFAULT_OG_IMAGE;
    let canonicalUrl = `${BASE_DOMAIN}${path}`;

    // 5. Dynamic Product Schema & Metadata Injection (Strictly on Product Pages)
    if (path.startsWith("/product/") || path.startsWith("/products/")) {
      const slugFromPath = path.replace(/^\/products?\//, "").split("?")[0].split("/")[0];
      const allProducts = getProducts();
      const resolvedProduct = activeProduct || allProducts.find(
        p => p.slug === slugFromPath ||
             p.id === slugFromPath ||
             p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slugFromPath
      );

      if (resolvedProduct) {
        canonicalUrl = `${BASE_DOMAIN}/product/${resolvedProduct.slug || resolvedProduct.id}`;
        pageTitle = resolvedProduct.seoTitle || `${resolvedProduct.name} | CLINZA`;
        const rawDesc = resolvedProduct.metaDescription || resolvedProduct.description || `Shop ${resolvedProduct.name} at CLINZA. Premium European linen and cotton menswear.`;
        pageDescription = cleanText(rawDesc);
        
        if (Array.isArray(resolvedProduct.images) && resolvedProduct.images.length > 0) {
          pageOgImage = resolvedProduct.images[0];
        }

        const isInStock = resolvedProduct.stockStatus !== "Out of Stock";
        
        // Construct offers
        const offers = resolvedProduct.variants && resolvedProduct.variants.length > 0
          ? resolvedProduct.variants.map(v => {
              const offerObj: any = {
                "@type": "Offer",
                "url": canonicalUrl,
                "priceCurrency": "INR",
                "price": v.price || resolvedProduct.price,
                "priceValidUntil": "2026-12-31",
                "itemCondition": "https://schema.org/NewCondition",
                "availability": (v.stockQuantity !== undefined ? v.stockQuantity > 0 : isInStock)
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                "seller": {
                  "@type": "Organization",
                  "name": "CLINZA"
                }
              };
              if (v.sku) offerObj.sku = v.sku;
              if (v.barcode) offerObj.gtin = v.barcode;
              return offerObj;
            })
          : {
              "@type": "Offer",
              "url": canonicalUrl,
              "priceCurrency": "INR",
              "price": resolvedProduct.price,
              "priceValidUntil": "2026-12-31",
              "itemCondition": "https://schema.org/NewCondition",
              "availability": isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "CLINZA"
              }
            };

        const productSchema: any = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": resolvedProduct.name,
          "image": Array.isArray(resolvedProduct.images) && resolvedProduct.images.length > 0
            ? resolvedProduct.images
            : [DEFAULT_OG_IMAGE],
          "description": pageDescription,
          "brand": {
            "@type": "Brand",
            "name": resolvedProduct.brand || "CLINZA"
          },
          "sku": resolvedProduct.sku || `CLZ-${resolvedProduct.id}`,
          "offers": offers
        };

        // Genuine Reviews & Ratings only — NO invented fallback numbers
        if (Array.isArray(resolvedProduct.reviews) && resolvedProduct.reviews.length > 0) {
          const validReviews = resolvedProduct.reviews.filter(r => typeof r.rating === "number" && r.rating > 0);
          if (validReviews.length > 0) {
            const sumRatings = validReviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = Math.round((sumRatings / validReviews.length) * 10) / 10;
            
            productSchema.aggregateRating = {
              "@type": "AggregateRating",
              "ratingValue": avgRating.toString(),
              "reviewCount": validReviews.length,
              "bestRating": "5",
              "worstRating": "1"
            };

            productSchema.review = validReviews.map(r => ({
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": r.rating.toString(),
                "bestRating": "5",
                "worstRating": "1"
              },
              "author": {
                "@type": "Person",
                "name": r.userName || "Verified Buyer"
              },
              "reviewBody": cleanText(r.comment) || "Excellent craftsmanship.",
              "datePublished": r.date || "2026-05-01"
            }));
          }
        }

        schemas.push(productSchema);
      }
    } 
    
    // 6. Collections & Category ItemList Schema
    else if (
      path.startsWith("/collection/") || 
      path.startsWith("/collections") || 
      path === "/shop" ||
      path === "/shirts" ||
      path === "/jeans" ||
      path === "/pants" ||
      path === "/combos" ||
      path === "/linen-shirts" ||
      path === "/cotton-shirts" ||
      path === "/linen-pants" ||
      path === "/new-arrivals" ||
      path === "/trending" ||
      path === "/best-sellers" ||
      path === "/summer-collection" ||
      path === "/limited-edition"
    ) {
      let collectionSlug = "all";
      if (path.startsWith("/collections/")) {
        collectionSlug = path.replace("/collections/", "");
      } else if (path.startsWith("/collection/")) {
        collectionSlug = path.replace("/collection/", "");
      } else if (path.startsWith("/")) {
        collectionSlug = path.substring(1);
      }

      const formatName = (collectionSlug === "all" || collectionSlug === "collections" || collectionSlug === "shop")
        ? "Luxury Wardrobe Catalog"
        : collectionSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        
      pageTitle = `${formatName} | CLINZA`;
      pageDescription = `Discover CLINZA's curated ${formatName} collection. Handcrafted with European flax linen, raw selvedge cotton, and bespoke tailoring.`;

      const allProducts = getProducts();
      const filteredProducts = allProducts.filter(p => {
        if (collectionSlug === "all" || collectionSlug === "collections" || collectionSlug === "shop") return true;
        const lowerSlug = collectionSlug.toLowerCase();
        if (p.collection && p.collection.toLowerCase().includes(lowerSlug)) return true;
        if (p.category && p.category.toLowerCase().includes(lowerSlug)) return true;
        if (lowerSlug === "shirts" && (p.category.toLowerCase().includes("shirt") || p.collection.toLowerCase().includes("shirt"))) return true;
        if (lowerSlug === "jeans" && (p.category.toLowerCase().includes("jean") || p.collection.toLowerCase().includes("denim"))) return true;
        if (lowerSlug === "pants" && (p.category.toLowerCase().includes("trouser") || p.category.toLowerCase().includes("pant"))) return true;
        if (lowerSlug === "combos" && p.category.toLowerCase().includes("combo")) return true;
        if (lowerSlug === "new-arrivals" && p.isNewArrival) return true;
        if (lowerSlug === "trending" && p.isTrending) return true;
        if (lowerSlug === "best-sellers") return true;
        return false;
      });

      const itemsList = filteredProducts.slice(0, 10).map((prod, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `${BASE_DOMAIN}/product/${prod.slug || prod.id}`,
        "name": prod.name
      }));

      if (itemsList.length > 0) {
        const collectionSchema = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": `${formatName} Collection`,
          "numberOfItems": filteredProducts.length,
          "itemListElement": itemsList
        };
        schemas.push(collectionSchema);
      }
    } 
    
    // 7. Editorial & Blog Posting Schema
    else if (path.startsWith("/blog") || path.startsWith("/blogs")) {
      const blogSlugFromPath = path.replace(/^\/blogs?\/(news\/)?/, "").split("?")[0].split("/")[0];
      const allBlogs = getBlogs();
      const activeBlog = allBlogs.find(
        b => b.slug === activeBlogSlug ||
             b.slug === blogSlugFromPath ||
             b.id === blogSlugFromPath
      );

      if (activeBlog && activeBlog.slug) {
        canonicalUrl = `${BASE_DOMAIN}/blog/${activeBlog.slug}`;
        pageTitle = `${activeBlog.title} | Clinza Journal`;
        pageDescription = cleanText(activeBlog.summary || activeBlog.title);
        if (activeBlog.coverImage) {
          pageOgImage = activeBlog.coverImage;
        }

        const blogSchema = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": activeBlog.title,
          "image": activeBlog.coverImage || DEFAULT_OG_IMAGE,
          "genre": activeBlog.category || "Style Guide",
          "keywords": activeBlog.tags?.join(", ") || "Fashion, Styling, Luxury Linen",
          "publisher": {
            "@type": "Organization",
            "name": "CLINZA",
            "logo": LOGO_URL
          },
          "url": canonicalUrl,
          "datePublished": activeBlog.publishedAt || "2026-06-01T10:00:00Z",
          "author": {
            "@type": "Person",
            "name": typeof activeBlog.author === "object" ? (activeBlog.author.name || "Alessandro Vanti") : "Alessandro Vanti"
          },
          "description": pageDescription
        };
        schemas.push(blogSchema);
      } else {
        pageTitle = "CLINZA Journal | Fashion & Textile Guides";
        pageDescription = "Deep-dives into textiles, sustainable flax harvesting, selvedge architecture, boot welt styling, and classic modern wardrobe pairings.";
      }
    }

    // 8. Static Policy Pages
    else if (path === "/about") {
      pageTitle = "About CLINZA | Generational European Craftsmanship";
      pageDescription = "Learn about CLINZA's philosophy: 100% Normandy flax linen, raw shuttle-loom selvedge denim, and artisanal tailoring crafted for timeless longevity.";
    } else if (path === "/contact" || path === "/contact-us") {
      pageTitle = "Contact CLINZA | Client Concierge & Support";
      pageDescription = "Get in touch with CLINZA client support for sizing assistance, custom tailoring inquiries, and order tracking.";
    } else if (path === "/privacy-policy") {
      pageTitle = "Privacy Policy | CLINZA";
      pageDescription = "Read the CLINZA privacy policy detailing how your customer data and payment information are protected.";
    } else if (path === "/terms" || path === "/terms-and-conditions") {
      pageTitle = "Terms & Conditions | CLINZA";
      pageDescription = "Review the official terms of service and purchase conditions for CLINZA.";
    } else if (path === "/refund-policy" || path === "/return-policy") {
      pageTitle = "Refund & Exchange Policy | CLINZA";
      pageDescription = "CLINZA offers hassle-free 7-day returns and size exchanges on all unworn luxury menswear garments.";
    } else if (path === "/shipping-policy") {
      pageTitle = "Shipping Policy | CLINZA";
      pageDescription = "Information regarding complimentary express shipping and insured pan-India delivery for CLINZA orders.";
    }

    // 9. Inject Single Consolidated JSON-LD Script into Document Head
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-dynamic-schema", "true");
    script.innerHTML = JSON.stringify(schemas.length === 1 ? schemas[0] : {
      "@context": "https://schema.org",
      "@graph": schemas.map(({ "@context": _, ...rest }) => rest)
    });
    document.head.appendChild(script);

    // 10. Update Document Title and Head Meta Elements
    document.title = pageTitle;

    // Canonical Tag
    let linkCanonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl);

    // Meta Description
    let metaDesc = document.querySelector("meta[name='description']") as HTMLMetaElement;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", pageDescription);

    // Open Graph Tags
    const updateOgTag = (property: string, content: string) => {
      let el = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateOgTag("og:title", pageTitle);
    updateOgTag("og:description", pageDescription);
    updateOgTag("og:url", canonicalUrl);
    updateOgTag("og:image", pageOgImage);

    // Twitter Card Tags
    const updateTwitterTag = (name: string, content: string) => {
      let el = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateTwitterTag("twitter:title", pageTitle);
    updateTwitterTag("twitter:description", pageDescription);
    updateTwitterTag("twitter:image", pageOgImage);

    // 11. Google Search Console Verification Meta Tag (if configured in settings)
    try {
      const integrationsStr = localStorage.getItem("clinza_pixel_integrations");
      if (integrationsStr) {
        const integrations = JSON.parse(integrationsStr);
        if (integrations.gscMeta && !document.querySelector("meta[name='google-site-verification']")) {
          const metaGsc = document.createElement("meta");
          metaGsc.name = "google-site-verification";
          metaGsc.content = integrations.gscMeta;
          document.head.appendChild(metaGsc);
        }
      }
    } catch (e) {
      console.warn("Analytics pixel tag notice:", e);
    }

  }, [path, activeProduct, activeBlogSlug]);

  return null;
}
