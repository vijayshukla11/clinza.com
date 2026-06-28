import React from "react";
import { useLocation } from "react-router-dom";
import { Product, BlogPost } from "../types";
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

    // 2. Organization Schema (always present)
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      "name": "CLINZA",
      "url": "https://clinza.com",
      "logo": "https://clinza.com/assets/logo.png",
      "sameAs": [
        "https://instagram.com/clinza",
        "https://facebook.com/clinza"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-XXXXXXXXXX",
        "contactType": "customer service"
      }
    };
    schemas.push(orgSchema);

    // 3. Breadcrumb Schema
    const pathParts = path.split("/").filter(Boolean);
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://clinza.com"
      }
    ];

    let currentUrl = "https://clinza.com";
    pathParts.forEach((part, index) => {
      currentUrl += `/${part}`;
      const name = part.charAt(0).toUpperCase() + part.slice(1).replace("-", " ");
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

    // 4. Case-by-case Routing Schema injection
    if (path.startsWith("/product/") && activeProduct) {
      // Product Schema
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": activeProduct.name,
        "image": activeProduct.images || [],
        "description": activeProduct.description || `${activeProduct.name} - Premium luxury garments loomed with excellence.`,
        "sku": activeProduct.sku || `CLI-${activeProduct.id}`,
        "brand": {
          "@type": "Brand",
          "name": "CLINZA"
        },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "INR",
          "price": activeProduct.price,
          "priceValidUntil": "2027-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": activeProduct.rating || 5.0,
          "reviewCount": Array.isArray(activeProduct.reviews) ? activeProduct.reviews.length || 1 : 1
        }
      };
      schemas.push(productSchema);
    } 
    
    else if ((path.startsWith("/collection/") || path.startsWith("/collections/")) || path === "/shop") {
      // Collection Schema
      const collectionSlug = path.split("/").pop() || "all";
      const products = getProducts().filter(p => 
        collectionSlug === "all" || 
        p.collection.toLowerCase() === collectionSlug.toLowerCase() ||
        p.category.toLowerCase().includes(collectionSlug.toLowerCase())
      );

      const itemsList = products.slice(0, 10).map((prod, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://clinza.com/product/${prod.slug}`
      }));

      const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": collectionSlug === "all" ? "Clinza Wardrobe Catalog" : `${collectionSlug.toUpperCase()} Collections`,
        "numberOfItems": products.length,
        "itemListElement": itemsList
      };
      schemas.push(collectionSchema);
    } 
    
    else if (path.startsWith("/blog") && activeBlogSlug) {
      const blogs = getBlogs();
      const activeBlog = blogs.find(b => b.slug === activeBlogSlug);
      if (activeBlog) {
        // Blog Schema (Article)
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
            "logo": "https://clinza.com/assets/logo.png"
          },
          "url": window.location.href,
          "datePublished": activeBlog.publishedAt || new Date().toISOString(),
          "author": {
            "@type": "Person",
            "name": typeof activeBlog.author === "object" ? activeBlog.author.name || "Clinza Stylist" : "Clinza Stylist"
          },
          "description": activeBlog.summary || activeBlog.title
        };
        schemas.push(blogSchema);
      }
    }

    // 5. Inject scripts to Document Head
    schemas.forEach(schemaData => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-dynamic-schema", "true");
      script.innerHTML = JSON.stringify(schemaData);
      document.head.appendChild(script);
    });

    // 6. Dynamic Canonical Link and Open Graph URL
    const canonicalUrl = `https://clinza.com${path}`;
    
    // Manage Canonical Tag
    let linkCanonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl);

    // Manage OG URL Tag
    let ogUrl = document.querySelector("meta[property='og:url']") as HTMLMetaElement;
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", canonicalUrl);

    // Manage Title and OG Title
    let currentTitle = "CLINZA Premium Fashion E-Commerce";
    if (path.startsWith("/product/") && activeProduct) {
      currentTitle = `${activeProduct.name} | CLINZA`;
    } else if (path.startsWith("/collection/") || path.startsWith("/collections/")) {
      const collectionSlug = path.split("/").pop() || "all";
      currentTitle = `${collectionSlug.toUpperCase()} Collections | CLINZA`;
    } else if (path.startsWith("/blog") && activeBlogSlug) {
      const blogs = getBlogs();
      const activeBlog = blogs.find(b => b.slug === activeBlogSlug);
      if (activeBlog) {
        currentTitle = `${activeBlog.title} | Clinza Journal`;
      }
    }

    document.title = currentTitle;

    let ogTitle = document.querySelector("meta[property='og:title']") as HTMLMetaElement;
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", currentTitle);

  }, [path, activeProduct, activeBlogSlug]);

  return null; // Side effect strictly registers dynamic schema
}
