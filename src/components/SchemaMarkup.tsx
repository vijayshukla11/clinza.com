import React from "react";
import { useLocation } from "react-router-dom";
import { Product } from "../types";
import { getProducts, getBlogs } from "../utils";

interface SchemaMarkupProps {
  activeProduct?: Product | null;
  activeBlogSlug?: string | null;
}

export default function SchemaMarkup({ activeProduct, activeBlogSlug }: SchemaMarkupProps) {
  const location = useLocation();
  const path = location.pathname;

  React.useEffect(() => {
    // 1. Remove any old dynamic schema scripts
    const existingScripts = document.querySelectorAll("script[data-dynamic-schema='true']");
    existingScripts.forEach(el => el.remove());

    const schemas: any[] = [];
    const BASE_DOMAIN = "https://www.clinza.in";

    // 2. Organization Schema (always present)
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      "name": "CLINZA",
      "url": BASE_DOMAIN,
      "logo": `${BASE_DOMAIN}/assets/logo.png`,
      "sameAs": [
        "https://instagram.com/clinza",
        "https://facebook.com/clinza"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-7208572688",
        "contactType": "customer service"
      }
    };
    schemas.push(orgSchema);

    // 3. WebSite Schema with SearchAction for Homepage
    if (path === "/" || path === "") {
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "CLINZA",
        "url": BASE_DOMAIN,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${BASE_DOMAIN}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };
      schemas.push(websiteSchema);
    }

    // 4. Breadcrumb Schema
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
      const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
      breadcrumbItems.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": name,
        "item": currentUrl
      });
    });

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    };
    schemas.push(breadcrumbSchema);

    let pageTitle = "CLINZA | Luxury European Linen & Tailored Menswear";
    let pageDescription = "Explore CLINZA for luxury European linen shirts, raw selvedge denim, sartorial trousers, and coordinates crafted with uncompromised quality.";
    let pageOgImage = "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png";

    // 5. Case-by-case Routing Schema & Meta Tags
    if ((path.startsWith("/product/") || path.startsWith("/products/")) && activeProduct) {
      const prodCanonicalUrl = `${BASE_DOMAIN}/product/${activeProduct.slug || activeProduct.id}`;
      pageTitle = `${activeProduct.name} | CLINZA`;
      pageDescription = activeProduct.description || activeProduct.shortDescription || `Shop ${activeProduct.name} at CLINZA. Premium European linen and cotton menswear.`;
      if (activeProduct.images && activeProduct.images.length > 0) {
        pageOgImage = activeProduct.images[0];
      }

      // Product Schema
      const offers = activeProduct.variants && activeProduct.variants.length > 0
        ? activeProduct.variants.map(v => {
            const offerObj: any = {
              "@type": "Offer",
              "url": prodCanonicalUrl,
              "priceCurrency": "INR",
              "price": v.price,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": (v.stockQuantity !== undefined ? v.stockQuantity > 0 : activeProduct.stockStatus !== "Out of Stock")
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock"
            };
            if (v.sku) offerObj.sku = v.sku;
            if (v.barcode) offerObj.gtin = v.barcode;
            return offerObj;
          })
        : {
            "@type": "Offer",
            "url": prodCanonicalUrl,
            "priceCurrency": "INR",
            "price": activeProduct.price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": activeProduct.stockStatus === "Out of Stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
          };

      const productSchema: any = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": activeProduct.name,
        "image": activeProduct.images || [],
        "description": pageDescription,
        "brand": {
          "@type": "Brand",
          "name": activeProduct.brand || "CLINZA"
        },
        "offers": offers
      };

      if (activeProduct.sku) {
        productSchema.sku = activeProduct.sku;
      }

      const reviewCount = Array.isArray(activeProduct.reviews) ? activeProduct.reviews.length : 0;
      const ratingVal = activeProduct.rating;
      if (reviewCount > 0 && ratingVal && ratingVal > 0) {
        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": ratingVal,
          "reviewCount": reviewCount
        };
      }

      schemas.push(productSchema);
    } 
    
    else if ((path.startsWith("/collection/") || path.startsWith("/collections/")) || path === "/shop") {
      const collectionSlug = path.split("/").pop() || "all";
      const formatName = collectionSlug === "all" ? "Wardrobe Catalog" : collectionSlug.replace(/-/g, " ").toUpperCase();
      pageTitle = `${formatName} | CLINZA`;
      pageDescription = `Discover CLINZA's curated ${formatName} collection. Engineered with European flax fibers and precision tailoring.`;

      const products = getProducts().filter(p => 
        collectionSlug === "all" || 
        p.collection.toLowerCase() === collectionSlug.toLowerCase() ||
        p.category.toLowerCase().includes(collectionSlug.toLowerCase())
      );

      const itemsList = products.slice(0, 10).map((prod, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `${BASE_DOMAIN}/product/${prod.slug || prod.id}`
      }));

      const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `${formatName} Collections`,
        "numberOfItems": products.length,
        "itemListElement": itemsList
      };
      schemas.push(collectionSchema);
    } 
    
    else if (path.startsWith("/blog")) {
      const blogs = getBlogs();
      const activeBlog = blogs.find(b => b.slug === activeBlogSlug);
      if (activeBlog) {
        pageTitle = `${activeBlog.title} | Clinza Journal`;
        pageDescription = activeBlog.summary || activeBlog.title;
        if (activeBlog.coverImage) {
          pageOgImage = activeBlog.coverImage;
        }

        const blogSchema = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": activeBlog.title,
          "image": activeBlog.coverImage,
          "genre": activeBlog.category,
          "keywords": activeBlog.tags?.join(", ") || "Fashion, Styling, Luxury",
          "publisher": {
            "@type": "Organization",
            "name": "CLINZA",
            "logo": `${BASE_DOMAIN}/assets/logo.png`
          },
          "url": `${BASE_DOMAIN}/blog/${activeBlog.slug}`,
          "datePublished": activeBlog.publishedAt || new Date().toISOString(),
          "author": {
            "@type": "Person",
            "name": typeof activeBlog.author === "object" ? activeBlog.author.name || "Clinza Stylist" : "Clinza Stylist"
          },
          "description": pageDescription
        };
        schemas.push(blogSchema);
      } else {
        pageTitle = "CLINZA Journal | Fashion & Textile Guides";
        pageDescription = "Deep-dives into textiles, sustainable flax harvesting, selvedge architecture, boot welt styling, and classic modern wardrobe pairings.";
      }
    }

    // 6. Inject JSON-LD Schema scripts
    schemas.forEach(schemaData => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-dynamic-schema", "true");
      script.innerHTML = JSON.stringify(schemaData);
      document.head.appendChild(script);
    });

    // 7. Update Document Title, Canonical Link, OG Tags
    document.title = pageTitle;

    const canonicalUrl = `${BASE_DOMAIN}${path}`;
    
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

    // OG Title
    let ogTitle = document.querySelector("meta[property='og:title']") as HTMLMetaElement;
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", pageTitle);

    // OG Description
    let ogDesc = document.querySelector("meta[property='og:description']") as HTMLMetaElement;
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute("content", pageDescription);

    // OG URL
    let ogUrl = document.querySelector("meta[property='og:url']") as HTMLMetaElement;
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", canonicalUrl);

    // OG Image
    let ogImage = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
    if (!ogImage) {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute("content", pageOgImage);

    // 8. Inject Google Analytics & Search Console verification tags from localStorage
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

        if (integrations.ga4Id && !document.querySelector(`script[src*='googletagmanager.com/gtag/js']`)) {
          const gaScript = document.createElement("script");
          gaScript.async = true;
          gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${integrations.ga4Id}`;
          document.head.appendChild(gaScript);

          const gaConfigScript = document.createElement("script");
          gaConfigScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${integrations.ga4Id}');
          `;
          document.head.appendChild(gaConfigScript);
        }
      }
    } catch (e) {
      console.warn("Analytics pixel tag injection notice:", e);
    }

  }, [path, activeProduct, activeBlogSlug]);

  return null;
}
