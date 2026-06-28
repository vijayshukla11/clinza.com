/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Edit, Trash2, ChevronLeft, Eye, ImageIcon, HelpCircle, Check, Info } from "lucide-react";
import { Product } from "../../types";
import MediaUploader from "./MediaUploader";

interface ProductsTabProps {
  productList: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductsTab({ productList, onSaveProduct, onDeleteProduct }: ProductsTabProps) {
  const [editorMode, setEditorMode] = useState<"list" | "create" | "edit">("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subFilter, setSubFilter] = useState<"all" | "draft" | "out_of_stock" | "archived">("all");

  // Multi-field Form state
  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    shortDescription: "",
    longDescription: "",
    aPlusTitle: "",
    aPlusDesc: "",
    brand: "CLINZA Luxury",
    sku: "",
    barcode: "",
    tagsStr: "",
    collection: "shirts",
    category: "Premium Shirts",
    gender: "Unisex",
    season: "Summer/Resort 2026",
    fabric: "100% Organic Linen",
    fitType: "Tailored Fit",
    countryOfOrigin: "India",
    
    // Images
    mainImage: "",
    hoverImage: "",
    thumbnailImage: "",
    galleryImagesStr: "",
    view360Str: "",
    videoUrl: "",

    // Pricing
    originalPrice: 2999, // MRP
    price: 1999, // Sale Price
    costPrice: 950,
    taxPercent: 5,
    shippingCharge: 0,
    codCharge: 100,

    // Inventory
    stockQuantity: 150,
    stockStatus: "In Stock" as "In Stock" | "Low Stock" | "Out of Stock",
    lowStockLimit: 20,
    outOfStockLimit: 0,

    // SEO
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    jsonLdSchema: "",

    // Badges
    isTrending: false,
    isNewArrival: false,

    // Colors & Sizes
    colorsStr: "Cream White:#FFFFFF, Sage Green:#8E998B",
    sizesList: ["S", "M", "L", "XL"]
  });

  const handleOpenEditor = (prod: Product | null) => {
    if (prod) {
      setEditingProduct(prod);
      
      // Attempt to load advanced field fallbacks in case product lacks them
      const specs = prod.specifications || [];
      const getSpec = (lbl: string) => specs.find(s => s.label.toLowerCase() === lbl.toLowerCase())?.value || "";

      // Re-load image structures
      const mainImg = prod.images?.[0] || "";
      const hoverImg = prod.images?.[1] || "";
      const thumbImg = prod.images?.[0] || "";
      const galleryList = prod.images?.slice(1) || [];

      // Re-load colors
      const colStr = prod.colors?.map(c => `${c.name}:${c.hex}`).join(", ") || "Cream White:#FFFFFF";

      setForm({
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        shortDescription: prod.description || "",
        longDescription: prod.description || "Fully breathable luxury design pre-treated and loom woven meticulously.",
        aPlusTitle: prod.aPlusContent?.title || "SARTORIAL ARCHITECTURE",
        aPlusDesc: prod.aPlusContent?.description || "Woven from French organic linen staples designed for hot climates.",
        brand: prod.brand || "CLINZA Luxury",
        sku: prod.sku || `CLZ-${Date.now().toString().slice(-4)}`,
        barcode: (prod as any).barcode || `8900${Math.floor(100000 + Math.random() * 900000)}`,
        tagsStr: (prod as any).tags?.join(", ") || `${prod.category || "shirts"}, Premium`,
        collection: prod.collection || "shirts",
        category: prod.category || "Premium Shirts",
        gender: (prod as any).gender || getSpec("Gender") || "Men",
        season: (prod as any).season || getSpec("Season") || "Summer 2026",
        fabric: (prod as any).fabric || getSpec("Fabric Blend") || "100% Pure Linen",
        fitType: (prod as any).fitType || getSpec("Washing Care") || "Regular Comfort Fit",
        countryOfOrigin: (prod as any).countryOfOrigin || "India",
        
        mainImage: mainImg,
        hoverImage: hoverImg,
        thumbnailImage: thumbImg,
        galleryImagesStr: galleryList.join(", "),
        view360Str: (prod as any).view360Images?.join(", ") || "",
        videoUrl: (prod as any).videoUrl || "",

        originalPrice: prod.originalPrice || prod.price * 1.5,
        price: prod.price,
        costPrice: (prod as any).costPrice || Math.floor(prod.price * 0.45),
        taxPercent: (prod as any).taxPercent || 5,
        shippingCharge: (prod as any).shippingCharge || 0,
        codCharge: (prod as any).codCharge || 0,

        stockQuantity: (prod as any).stockQuantity || 120,
        stockStatus: prod.stockStatus || "In Stock",
        lowStockLimit: (prod as any).lowStockLimit || 15,
        outOfStockLimit: (prod as any).outOfStockLimit || 0,

        seoTitle: (prod as any).seoTitle || `${prod.name} | CLINZA India`,
        seoDescription: (prod as any).seoDescription || `${prod.description?.slice(0, 150)}`,
        seoKeywords: (prod as any).seoKeywords || "linen shirt, luxury fashion",
        canonicalUrl: (prod as any).canonicalUrl || `https://clinza.in/product/${prod.slug}`,
        ogTitle: (prod as any).seoTitle || `${prod.name}`,
        ogDescription: (prod as any).seoDescription || `${prod.description?.slice(0, 150)}`,
        ogImage: mainImg,
        jsonLdSchema: (prod as any).jsonLdSchema || "",

        isTrending: !!prod.isTrending,
        isNewArrival: !!prod.isNewArrival,

        colorsStr: colStr,
        sizesList: prod.sizes || ["S", "M", "L"]
      });
      setEditorMode("edit");
    } else {
      setEditingProduct(null);
      const tempId = `prod-${Date.now()}`;
      setForm({
        id: tempId,
        name: "",
        slug: "",
        shortDescription: "",
        longDescription: "",
        aPlusTitle: "SARTORIAL CRAFTSMANSHIP",
        aPlusDesc: "European organic linen strands loom woven for ultra lightweight thermal ventilation.",
        brand: "CLINZA Luxury",
        sku: `CLZ-LN-${Math.floor(100 + Math.random() * 900)}`,
        barcode: `8902${Math.floor(100000 + Math.random() * 900000)}`,
        tagsStr: "Linen, Premium, Classic",
        collection: "shirts",
        category: "shirts",
        gender: "Men",
        season: "Summer/Resort 2026",
        fabric: "100% Bio-Washed Linen",
        fitType: "Tailored Spread-Collar",
        countryOfOrigin: "India",
        
        mainImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
        hoverImage: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600",
        thumbnailImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200",
        galleryImagesStr: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600",
        view360Str: "",
        videoUrl: "",

        originalPrice: 2999,
        price: 1999,
        costPrice: 850,
        taxPercent: 5,
        shippingCharge: 0,
        codCharge: 80,

        stockQuantity: 100,
        stockStatus: "In Stock",
        lowStockLimit: 15,
        outOfStockLimit: 0,

        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        canonicalUrl: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        jsonLdSchema: "",

        isTrending: false,
        isNewArrival: true,

        colorsStr: "Sage Green:#8E998B, Slate Blue:#4A5568",
        sizesList: ["S", "M", "L", "XL"]
      });
      setEditorMode("create");
    }
  };

  const handleSlugSync = (nameVal: string) => {
    if (editorMode === "create") {
      const generatedSlug = nameVal.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setForm(f => ({ 
        ...f, 
        name: nameVal, 
        slug: generatedSlug,
        canonicalUrl: `https://clinza.in/product/${generatedSlug}`,
        seoTitle: `${nameVal} | CLINZA Luxury India`
      }));
    } else {
      setForm(f => ({ ...f, name: nameVal }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      alert("Product Name and SEO URL Slug are required!");
      return;
    }

    // Process strings -> collections
    const colorsArr = form.colorsStr.split(",").map(c => {
      const parts = c.trim().split(":");
      return { name: parts[0] || "Default", hex: parts[1] || "#888888" };
    }).filter(Boolean);

    const galleryArr = form.galleryImagesStr.split(",").map(g => g.trim()).filter(Boolean);
    const view360Arr = form.view360Str.split(",").map(v => v.trim()).filter(Boolean);
    const tagsArr = form.tagsStr.split(",").map(t => t.trim()).filter(Boolean);

    // Dynamic Image compilation list
    const finalImages = [form.mainImage || form.thumbnailImage];
    if (form.hoverImage) finalImages.push(form.hoverImage);
    finalImages.push(...galleryArr);

    // Auto calculate Discount %
    const discountPercent = form.originalPrice > form.price 
      ? Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)
      : 0;

    // Auto JSON-LD build
    const generatedLd = form.jsonLdSchema.trim() || JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": form.name,
      "image": finalImages,
      "description": form.shortDescription || form.longDescription,
      "sku": form.sku,
      "mpn": form.barcode,
      "offers": {
        "@type": "Offer",
        "url": form.canonicalUrl || `https://clinza.in/product/${form.slug}`,
        "priceCurrency": "INR",
        "price": form.price,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": form.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "CLINZA India"
        }
      }
    }, null, 2);

    const completeProduct: Product = {
      id: form.id,
      name: form.name.trim(),
      slug: form.slug.trim(),
      price: form.price,
      originalPrice: form.originalPrice,
      collection: form.collection as any,
      category: form.category.trim(),
      images: finalImages,
      sizes: form.sizesList,
      colors: colorsArr,
      stockStatus: form.stockQuantity <= 0 ? "Out of Stock" : (form.stockQuantity < form.lowStockLimit ? "Low Stock" : "In Stock"),
      sku: form.sku.trim().toUpperCase(),
      brand: form.brand.trim(),
      rating: editingProduct ? editingProduct.rating : 4.5,
      description: form.shortDescription.trim() || form.longDescription.trim(),
      reviews: editingProduct ? editingProduct.reviews : [],
      isTrending: form.isTrending,
      isNewArrival: form.isNewArrival,
      specifications: [
        { label: "Fabric Blend", value: form.fabric },
        { label: "Fit Model", value: form.fitType },
        { label: "Gender Archetype", value: form.gender },
        { label: "Origin of Production", value: form.countryOfOrigin },
        { label: "Collection Season", value: form.season }
      ],
      aPlusContent: {
        title: form.aPlusTitle.trim(),
        description: form.aPlusDesc.trim(),
        features: [
          { icon: "Wind", title: "Organic Thermoregulation", description: "Linen fibres ventilate moisture directly from cells." },
          { icon: "ShieldAlert", title: "Normandy Flax Traceability", description: "Carefully produced under organic European textile guides." }
        ]
      },
      // Injected auxiliary fields for Shopify specifications
      ...({
        barcode: form.barcode.trim(),
        tags: tagsArr,
        gender: form.gender,
        season: form.season,
        fabric: form.fabric,
        fitType: form.fitType,
        countryOfOrigin: form.countryOfOrigin,
        costPrice: form.costPrice,
        taxPercent: form.taxPercent,
        shippingCharge: form.shippingCharge,
        codCharge: form.codCharge,
        stockQuantity: form.stockQuantity,
        lowStockLimit: form.lowStockLimit,
        outOfStockLimit: form.outOfStockLimit,
        seoTitle: form.seoTitle || form.name,
        seoDescription: form.seoDescription || form.shortDescription,
        seoKeywords: form.seoKeywords,
        canonicalUrl: form.canonicalUrl,
        discountPercent,
        view360Images: view360Arr,
        videoUrl: form.videoUrl,
        jsonLdSchema: generatedLd
      } as any)
    };

    onSaveProduct(completeProduct);
    setEditorMode("list");
    setEditingProduct(null);
    alert(`Product committed: "${form.name}" catalog credentials successfully synchronized!`);
  };

  // Filtration logic
  const filteredList = productList.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = p.name.toLowerCase().includes(query) || 
                         p.sku.toLowerCase().includes(query) || 
                         p.category.toLowerCase().includes(query);
    
    // Shopify catalog sub-filters
    if (subFilter === "draft") {
      return matchesQuery && (p as any).isDraft === true;
    }
    if (subFilter === "out_of_stock") {
      return matchesQuery && p.stockStatus === "Out of Stock";
    }
    if (subFilter === "archived") {
      return matchesQuery && (p as any).isArchived === true;
    }
    return matchesQuery;
  });

  return (
    <div id="product-management-wrapper" className="space-y-6 animate-fade-in text-left">
      {editorMode === "list" ? (
        <div className="space-y-4">
          
          {/* Sub-Filters row */}
          <div className="flex border-b border-zinc-200">
            {[
              { id: "all", label: "All Products" },
              { id: "draft", label: "Drafts" },
              { id: "out_of_stock", label: "Out of Stock" },
              { id: "archived", label: "Archived" }
            ].map((subf) => (
              <button
                key={subf.id}
                onClick={() => setSubFilter(subf.id as any)}
                className={`py-3 px-6 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  subFilter === subf.id 
                    ? "border-orange-500 text-orange-600 font-bold" 
                    : "border-transparent text-zinc-500 hover:text-zinc-950"
                }`}
              >
                {subf.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Filter Clinza catalog table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-md bg-white border border-zinc-250 py-2.5 px-4 rounded-xl text-xs font-sans focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={() => handleOpenEditor(null)}
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-sans text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" /> Add New Item
            </button>
          </div>

          {/* Table display */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left text-zinc-700 min-w-[800px]">
              <thead className="bg-zinc-50/50 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="py-4 px-5">Media</th>
                  <th className="py-4 px-4">Title & Collection</th>
                  <th className="py-4 px-4">Pricing Specs</th>
                  <th className="py-4 px-4">Status / Qty</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredList.map((p) => {
                  const barcodeValue = (p as any).barcode || "N/A";
                  const stock = (p as any).stockQuantity || 120;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/20">
                      <td className="py-4 px-5">
                        <img src={p.images?.[0]} alt="" className="h-14 w-11 object-cover rounded bg-zinc-100 border shrink-0" />
                      </td>
                      <td className="py-4 px-4">
                        <h4 className="font-bold text-zinc-950 font-serif text-sm">{p.name}</h4>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          SKU: {p.sku} | Barcode: {barcodeValue} | Gender: {(p as any).gender || "Men" }
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 items-center">
                          <span className="font-bold text-zinc-900">₹{p.price.toLocaleString("en-IN")}</span>
                          {p.originalPrice > p.price && (
                            <span className="line-through text-zinc-400">₹{p.originalPrice.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 block font-mono">Tax: {(p as any).taxPercent || 5}% • Cost: ₹{(p as any).costPrice || "—"}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full mr-2 ${
                          p.stockStatus === "In Stock" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {p.stockStatus}
                        </span>
                        <span className="font-mono text-zinc-500">({stock} left)</span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditor(p)}
                          className="p-1.5 hover:bg-zinc-100 text-zinc-600 rounded cursor-pointer inline-block"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Acknowledge removing product: "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer inline-block"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* EDIT OR CREATE SCREEN */
        <form onSubmit={handleSubmit} className="space-y-8 bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <button
              type="button"
              onClick={() => setEditorMode("list")}
              className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Return to Catalog
            </button>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase bg-zinc-100 px-3 py-1 text-zinc-600">
                {editorMode === "create" ? "CREATING NEW ENTRY" : "EDIT COCKPIT FILE"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* L.H.S CORE SCHEMES (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* BRANDING INHERITANCE */}
              <div className="p-4 bg-zinc-50 rounded-xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 font-mono">Basic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Product Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Italian spread spread linen resort shirt"
                      value={form.name}
                      onChange={(e) => handleSlugSync(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">SEO URL Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. italian-spread-linen-shirt"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g,"-") })}
                      className="w-full border rounded-lg px-3 py-2 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Short Summary (Featured Snippet)</label>
                  <input
                    type="text"
                    placeholder="Brief description displaying under search cards"
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Long Descriptive Article Body</label>
                  <textarea
                    rows={4}
                    placeholder="Rich description showcasing fabrication, drapes, and organic credentials..."
                    value={form.longDescription}
                    onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                    className="w-full border rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>

              {/* IMAGES VAULT */}
              <div className="p-4 bg-zinc-50 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 font-mono">Product Media Vault</h3>
                  <span className="text-[9px] font-mono text-orange-600">Vapor Storage Enabled</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Main Cover Image URL</label>
                    <input
                      type="text"
                      value={form.mainImage}
                      onChange={(e) => setForm({ ...form, mainImage: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-[10px] font-mono focus:ring-1 focus:ring-orange-500 bg-white"
                    />
                    <MediaUploader
                      bucketName="products"
                      onUploadSuccess={(url) => setForm((prev) => ({ ...prev, mainImage: url }))}
                      label="Upload Cover Image"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Hover Reveal Image URL</label>
                    <input
                      type="text"
                      value={form.hoverImage}
                      onChange={(e) => setForm({ ...form, hoverImage: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-[10px] font-mono focus:ring-1 focus:ring-orange-500 bg-white"
                    />
                    <MediaUploader
                      bucketName="products"
                      onUploadSuccess={(url) => setForm((prev) => ({ ...prev, hoverImage: url }))}
                      label="Upload Hover Image"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Gallery Image list (Comma Split)</label>
                    <input
                      type="text"
                      placeholder="URL1, URL2, URL3"
                      value={form.galleryImagesStr}
                      onChange={(e) => setForm({ ...form, galleryImagesStr: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-[10px] font-mono focus:ring-1 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">360 View Images list (Comma Split)</label>
                    <input
                      type="text"
                      placeholder="URL-front, URL-left, URL-back"
                      value={form.view360Str}
                      onChange={(e) => setForm({ ...form, view360Str: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-[10px] font-mono focus:ring-1 focus:ring-orange-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Video Demonstration URL</label>
                  <input
                    type="text"
                    placeholder="URL to .mp4 file or Vimeo embed"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-[10px] font-mono focus:ring-1 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>

              {/* VARIANTS COGNIZANCE */}
              <div className="p-4 bg-zinc-50 rounded-xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 font-mono">Sizing & Color Variants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Colors (Syntax: Name:#Hex, Name2:#Hex2)</label>
                    <input
                      type="text"
                      value={form.colorsStr}
                      onChange={(e) => setForm({ ...form, colorsStr: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-[11px] font-mono focus:ring-1 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Active Sizes</label>
                    <div className="flex gap-2 pt-1.5">
                      {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => {
                        const active = form.sizesList.includes(sz);
                        return (
                          <button
                            type="button"
                            key={sz}
                            onClick={() => {
                              const list = active 
                                ? form.sizesList.filter(s => s !== sz) 
                                : [...form.sizesList, sz];
                              setForm({ ...form, sizesList: list });
                            }}
                            className={`w-10 h-8 border rounded text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                              active ? "border-orange-500 bg-orange-50 text-orange-600" : "border-zinc-200 text-zinc-400 hover:border-zinc-400 bg-white"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCT SEO SCHEMES */}
              <div className="p-4 bg-zinc-50 rounded-xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 font-mono">Search Engine Optimization (SEO)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">SEO Custom Title Override</label>
                    <input
                      type="text"
                      placeholder="If different from product name"
                      value={form.seoTitle}
                      onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">SEO Keywords</label>
                    <input
                      type="text"
                      placeholder="linen shirts, luxury fashion, resort wear"
                      value={form.seoKeywords}
                      onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    placeholder="150 character meta snippet for Google Indexing pages..."
                    value={form.seoDescription}
                    onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-orange-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Custom JSON-LD Schema (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Leave empty to let clinically organized automated JSON-LD schema builder generate structured definitions."
                    value={form.jsonLdSchema}
                    onChange={(e) => setForm({ ...form, jsonLdSchema: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-[10px] font-mono focus:ring-1 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* R.H.S SIDE COCKPIT CONTROLS (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* STATUS & ARCHIVES */}
              <div className="p-4 border bg-zinc-50/60 rounded-xl space-y-4 text-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-650 font-mono">Catalogue Placement</h3>
                
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Product Category Classification</label>
                  <select
                    value={form.collection}
                    onChange={(e) => setForm({ ...form, collection: e.target.value })}
                    className="w-full border rounded-lg p-2 focus:outline-none bg-white font-semibold text-zinc-800"
                  >
                    <option value="shirts">Shirts (Linen Resort)</option>
                    <option value="jeans">Jeans (Heavy Raw Denims)</option>
                    <option value="pants">Pants & Tapered Trousering</option>
                    <option value="combos">Combos & Co-Ord Sets</option>
                    <option value="footwear">Footwear Collection</option>
                    <option value="accessories">Aesthetic Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Designated Fit category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border rounded-lg px-2.5 py-1.5 focus:outline-none bg-white text-zinc-700"
                    placeholder="e.g. European spread spread linen"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold font-sans text-zinc-700">
                    <input
                      type="checkbox"
                      checked={form.isTrending}
                      onChange={(e) => setForm({ ...form, isTrending: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    Mark as Trending Curation
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold font-sans text-zinc-700">
                    <input
                      type="checkbox"
                      checked={form.isNewArrival}
                      onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    Mark as New Arrival Highlight
                  </label>
                </div>
              </div>

              {/* PRICING SCHEME */}
              <div className="p-4 border bg-zinc-50/60 rounded-xl space-y-4 text-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-650 font-mono">Financials & Taxation</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-450 uppercase mb-1">M.R.P (₹)</label>
                    <input
                      type="number"
                      value={form.originalPrice}
                      onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-850 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-450 uppercase mb-1">Sale Price (₹)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-orange-600 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">Cost Price (₹)</label>
                    <input
                      type="number"
                      value={form.costPrice}
                      onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">Tax Code (GST%)</label>
                    <input
                      type="number"
                      value={form.taxPercent}
                      onChange={(e) => setForm({ ...form, taxPercent: Number(e.target.value) })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">Shipping Fee (₹)</label>
                    <input
                      type="number"
                      value={form.shippingCharge}
                      onChange={(e) => setForm({ ...form, shippingCharge: Number(e.target.value) })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">COD Surcharge (₹)</label>
                    <input
                      type="number"
                      value={form.codCharge}
                      onChange={(e) => setForm({ ...form, codCharge: Number(e.target.value) })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-700"
                    />
                  </div>
                </div>
              </div>

              {/* COMPOSITION SPECIFICS */}
              <div className="p-4 border bg-zinc-50/60 rounded-xl space-y-4 text-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-650 font-mono">Composition Specifications</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">Fabric Blend</label>
                    <input
                      type="text"
                      value={form.fabric}
                      onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-750"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">Fit Silhouette</label>
                    <input
                      type="text"
                      value={form.fitType}
                      onChange={(e) => setForm({ ...form, fitType: e.target.value })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-750"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">Gender Class</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full border rounded p-1.5 focus:outline-none bg-white text-zinc-750"
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">Country of Origin</label>
                    <input
                      type="text"
                      value={form.countryOfOrigin}
                      onChange={(e) => setForm({ ...form, countryOfOrigin: e.target.value })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-750"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">SKU Code</label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-750 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">EAN/Barcode</label>
                    <input
                      type="text"
                      value={form.barcode}
                      onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-750 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* INVENTORY TRACKING */}
              <div className="p-4 border bg-zinc-50/60 rounded-xl space-y-4 text-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-650 font-mono">Inventory & Logistics Alert</h3>
                
                <div>
                  <label className="block text-[10px] text-zinc-450 mb-1">Available Stock (Qty Units)</label>
                  <input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                    className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-800 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">Low Stock Limit</label>
                    <input
                      type="number"
                      value={form.lowStockLimit}
                      onChange={(e) => setForm({ ...form, lowStockLimit: Number(e.target.value) })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-750"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-450 mb-1">OOS Warning Limit</label>
                    <input
                      type="number"
                      value={form.outOfStockLimit}
                      onChange={(e) => setForm({ ...form, outOfStockLimit: Number(e.target.value) })}
                      className="w-full border rounded px-2.5 py-1.5 focus:outline-none bg-white text-zinc-750"
                    />
                  </div>
                </div>
              </div>

              {/* COMPOSE SUBMIT */}
              <button
                type="submit"
                className="w-full py-4 uppercase font-sans font-black text-xs tracking-widest bg-orange-600 hover:bg-orange-700 transition duration-300 text-white rounded-xl shadow cursor-pointer text-center"
              >
                Committed Changes to Database
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
