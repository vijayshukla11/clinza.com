/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Star, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Upload, 
  Eye,
  Award,
  Filter
} from "lucide-react";
import { ProductReview, Product } from "../../types";
import { ProductReviewsService, ProductsService } from "../../services/supabaseService";

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled" | "featured">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Editor Modal
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [previewReview, setPreviewReview] = useState<ProductReview | null>(null);

  // Form State
  const [form, setForm] = useState<Partial<ProductReview>>({
    productId: "",
    customerName: "",
    customerLocation: "India",
    customerEmail: "",
    rating: 5,
    reviewTitle: "",
    reviewText: "",
    reviewImage: "",
    reviewGallery: [],
    verifiedPurchase: true,
    displayOrder: 1,
    helpfulCount: 0,
    isFeatured: false,
    isActive: true
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [revList, prodList] = await Promise.all([
        ProductReviewsService.getReviews(true),
        ProductsService.getAll()
      ]);
      setReviews(revList);
      setProducts(prodList);
    } catch (err) {
      console.error("Failed to load reviews or products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOpenNew = () => {
    setIsNew(true);
    const defaultProd = products[0]?.id || "";
    setForm({
      productId: defaultProd,
      customerName: "",
      customerLocation: "India",
      customerEmail: "",
      rating: 5,
      reviewTitle: "",
      reviewText: "",
      reviewImage: "",
      reviewGallery: [],
      verifiedPurchase: true,
      displayOrder: 1,
      helpfulCount: 0,
      isFeatured: false,
      isActive: true
    });
    setEditingReview({
      id: "temp",
      productId: defaultProd,
      customerName: "",
      customerLocation: "India",
      rating: 5,
      reviewTitle: "",
      reviewText: "",
      verifiedPurchase: true,
      displayOrder: 1,
      helpfulCount: 0,
      isFeatured: false,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  };

  const handleOpenEdit = (rev: ProductReview) => {
    setIsNew(false);
    setEditingReview(rev);
    setForm({ ...rev });
  };

  const handleToggleActive = async (rev: ProductReview) => {
    await ProductReviewsService.toggleReview(rev.id, !rev.isActive);
    await loadAll();
  };

  const handleToggleFeatured = async (rev: ProductReview) => {
    await ProductReviewsService.updateReview(rev.id, { isFeatured: !rev.isFeatured });
    await loadAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer review permanently?")) return;
    await ProductReviewsService.deleteReview(id);
    await loadAll();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const url = await ProductReviewsService.uploadReviewImage(file);
      setForm(f => ({
        ...f,
        reviewImage: f.reviewImage || url,
        reviewGallery: [...(f.reviewGallery || []), url]
      }));
    } catch (err) {
      console.error("Failed to upload review image:", err);
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId || !form.customerName?.trim() || !form.reviewText?.trim()) {
      alert("Product, Customer Name, and Review Text are required.");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await ProductReviewsService.createReview({
          productId: form.productId,
          customerName: form.customerName.trim(),
          customerLocation: form.customerLocation?.trim() || "India",
          customerEmail: form.customerEmail?.trim(),
          rating: Number(form.rating) || 5,
          reviewTitle: form.reviewTitle?.trim() || `${form.rating} Star Review`,
          reviewText: form.reviewText.trim(),
          reviewImage: form.reviewImage || undefined,
          reviewGallery: form.reviewGallery || [],
          verifiedPurchase: form.verifiedPurchase ?? true,
          displayOrder: Number(form.displayOrder) || 1,
          helpfulCount: Number(form.helpfulCount) || 0,
          isFeatured: !!form.isFeatured,
          isActive: form.isActive ?? true
        });
      } else if (editingReview) {
        await ProductReviewsService.updateReview(editingReview.id, {
          productId: form.productId,
          customerName: form.customerName?.trim(),
          customerLocation: form.customerLocation?.trim(),
          customerEmail: form.customerEmail?.trim(),
          rating: Number(form.rating) || 5,
          reviewTitle: form.reviewTitle?.trim(),
          reviewText: form.reviewText?.trim(),
          reviewImage: form.reviewImage || undefined,
          reviewGallery: form.reviewGallery || [],
          verifiedPurchase: form.verifiedPurchase,
          displayOrder: Number(form.displayOrder) || 1,
          helpfulCount: Number(form.helpfulCount) || 0,
          isFeatured: form.isFeatured,
          isActive: form.isActive
        });
      }
      setEditingReview(null);
      await loadAll();
    } catch (err) {
      console.error("Failed to save review:", err);
      alert("Error saving review.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered reviews
  const filteredReviews = reviews.filter(rev => {
    if (selectedProductId !== "all" && rev.productId !== selectedProductId) return false;
    if (statusFilter === "active" && !rev.isActive) return false;
    if (statusFilter === "disabled" && rev.isActive) return false;
    if (statusFilter === "featured" && !rev.isFeatured) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rev.customerName.toLowerCase().includes(q);
      const matchTitle = rev.reviewTitle?.toLowerCase().includes(q);
      const matchText = rev.reviewText.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchText) return false;
    }
    return true;
  });

  const getProductName = (pid: string) => {
    const found = products.find(p => p.id === pid || p.slug === pid);
    return found ? found.name : pid;
  };

  return (
    <div id="reviews-moderator-panel" className="space-y-6 text-left animate-fade-in">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-mono">
            Reviews & Testimonials Cockpit
          </h3>
          <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
            Manage customer feedback, ratings, photo uploads, and verified buyer badges
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            className="px-3 py-2 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-mono font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </button>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
        
        {/* Product Filter */}
        <div className="space-y-1">
          <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500">Filter By Product</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full bg-white border border-zinc-300 py-1.5 px-3 rounded-lg text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
          >
            <option value="all">All Catalog Products ({products.length})</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500">Filter By Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-white border border-zinc-300 py-1.5 px-3 rounded-lg text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
          >
            <option value="all">All Review Statuses</option>
            <option value="active">Active Live</option>
            <option value="disabled">Disabled / Draft</option>
            <option value="featured">Featured Reviews</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="space-y-1">
          <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500">Search Review Text</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search author, title, comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-300 pl-8 pr-3 py-1.5 rounded-lg text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          </div>
        </div>

      </div>

      {/* Table reviews */}
      {loading ? (
        <div className="py-12 text-center text-zinc-400 font-mono text-xs">Loading reviews database...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300 space-y-3">
          <p className="text-xs font-sans text-zinc-500">No customer reviews matched your search filters.</p>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold uppercase rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Review
          </button>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-x-auto shadow-xs">
          <table className="w-full text-xs text-left text-zinc-700 min-w-[800px]">
            <thead className="bg-zinc-50 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">Author & Location</th>
                <th className="py-3 px-4">Subject Product</th>
                <th className="py-3 px-4">Rating & Content</th>
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-zinc-50/50">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-zinc-950 block">{rev.customerName}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{rev.customerLocation || "India"}</span>
                  </td>
                  <td className="py-3.5 px-4 max-w-[180px]">
                    <span className="font-bold text-zinc-900 truncate block text-[11px]">
                      {getProductName(rev.productId)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex text-amber-400 mb-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-zinc-900 truncate block text-[11px]">{rev.reviewTitle}</span>
                    <p className="text-[11px] text-zinc-600 line-clamp-2 mt-0.5">{rev.reviewText}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    {rev.reviewImage ? (
                      <img src={rev.reviewImage} alt="" className="h-10 w-10 object-cover rounded-lg border bg-zinc-100" />
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 space-y-1">
                    {rev.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block w-max">
                        Verified
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleFeatured(rev)}
                      className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border cursor-pointer block w-max ${
                        rev.isFeatured ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-zinc-100 text-zinc-500 border-zinc-200"
                      }`}
                    >
                      {rev.isFeatured ? "★ Featured" : "+ Feature"}
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(rev)}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-full cursor-pointer transition-colors ${
                        rev.isActive ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      {rev.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => setPreviewReview(rev)}
                      title="Preview Card"
                      className="p-1.5 hover:bg-zinc-100 text-zinc-600 rounded cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(rev)}
                      title="Edit Review"
                      className="p-1.5 hover:bg-zinc-100 text-zinc-900 rounded cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rev.id)}
                      title="Delete Review"
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT / CREATE MODAL */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[220] flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingReview(null)}
              className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <h3 className="text-base font-bold text-zinc-950 uppercase tracking-tight font-sans">
                {isNew ? "Create Customer Review" : "Edit Customer Review"}
              </h3>

              {/* Select product */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase font-mono text-zinc-700">Select Product *</label>
                <select
                  required
                  value={form.productId || ""}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-250 py-2 px-3 rounded-lg text-xs font-sans font-bold text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
                >
                  <option value="" disabled>Select Target Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku || p.slug})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase font-mono text-zinc-700">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={form.customerName || ""}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-250 py-2 px-3 rounded-lg text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase font-mono text-zinc-700">Location</label>
                  <input
                    type="text"
                    value={form.customerLocation || ""}
                    onChange={(e) => setForm({ ...form, customerLocation: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-250 py-2 px-3 rounded-lg text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase font-mono text-zinc-700">Rating (1-5 Stars) *</label>
                  <select
                    value={form.rating || 5}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full bg-zinc-50 border border-zinc-250 py-2 px-3 rounded-lg text-xs font-sans font-bold text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
                  >
                    <option value={5}>★★★★★ 5 Stars</option>
                    <option value={4}>★★★★☆ 4 Stars</option>
                    <option value={3}>★★★☆☆ 3 Stars</option>
                    <option value={2}>★★☆☆☆ 2 Stars</option>
                    <option value={1}>★☆☆☆☆ 1 Star</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase font-mono text-zinc-700">Customer Email (Optional)</label>
                  <input
                    type="email"
                    value={form.customerEmail || ""}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-250 py-2 px-3 rounded-lg text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase font-mono text-zinc-700">Review Title</label>
                <input
                  type="text"
                  placeholder="e.g. Incredible handfeel and stitching"
                  value={form.reviewTitle || ""}
                  onChange={(e) => setForm({ ...form, reviewTitle: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-250 py-2 px-3 rounded-lg text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase font-mono text-zinc-700">Review Text *</label>
                <textarea
                  rows={4}
                  required
                  value={form.reviewText || ""}
                  onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-250 py-2 px-3 rounded-lg text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-900 resize-none"
                />
              </div>

              {/* Upload image */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase font-mono text-zinc-700">Customer Image</label>
                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg text-xs font-mono font-bold text-zinc-700 cursor-pointer flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploading ? "Uploading..." : "Choose Image File"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  {form.reviewImage && (
                    <div className="relative h-10 w-10 border rounded overflow-hidden">
                      <img src={form.reviewImage} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, reviewImage: "", reviewGallery: [] }))}
                        className="absolute top-0 right-0 bg-black/80 text-white p-0.5 rounded-bl"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Switches */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-zinc-800">
                  <input
                    type="checkbox"
                    checked={form.verifiedPurchase ?? true}
                    onChange={(e) => setForm({ ...form, verifiedPurchase: e.target.checked })}
                  />
                  <span>Verified Buyer</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-zinc-800">
                  <input
                    type="checkbox"
                    checked={form.isFeatured ?? false}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  <span>Featured</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-zinc-800">
                  <input
                    type="checkbox"
                    checked={form.isActive ?? true}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span>Active Live</span>
                </label>

                <div className="flex items-center gap-1">
                  <span className="font-mono text-zinc-500 font-bold">Order:</span>
                  <input
                    type="number"
                    value={form.displayOrder ?? 1}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-14 bg-white border border-zinc-300 py-0.5 px-1 rounded text-center font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase rounded-lg shadow-xs cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[220] flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-zinc-200 space-y-4">
            <button
              onClick={() => setPreviewReview(null)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-900 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              CARD PREVIEW ON PRODUCT DETAIL PAGE
            </span>

            <div className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-zinc-950 font-sans">{previewReview.customerName}</span>
                  {previewReview.verifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified Buyer
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  {new Date(previewReview.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex text-amber-400">
                {[...Array(previewReview.rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <h4 className="font-bold text-xs text-zinc-900">{previewReview.reviewTitle}</h4>
              <p className="text-xs text-zinc-700 leading-relaxed font-normal">{previewReview.reviewText}</p>

              {previewReview.reviewImage && (
                <img src={previewReview.reviewImage} alt="" className="h-16 w-16 object-cover rounded-lg border bg-zinc-100" />
              )}
            </div>

            <button
              onClick={() => setPreviewReview(null)}
              className="w-full py-2 bg-zinc-900 text-white text-xs font-mono font-bold uppercase rounded-lg"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
