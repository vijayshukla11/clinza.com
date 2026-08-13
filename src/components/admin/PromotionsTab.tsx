/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, Sparkles, Tag, Check, Calendar, ArrowUpRight, Package } from "lucide-react";
import { Promotion, Product } from "../../types";
import { PromotionsService, ProductsService } from "../../services/supabaseService";
import MediaUploader from "./MediaUploader";

export default function PromotionsTab() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editorMode, setEditorMode] = useState<"list" | "form">("list");
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    banner: "",
    offerType: "Percentage Discount",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    active: true,
    landingPage: "/collections/all",
    description: "",
    discountValue: "",
    displayOrder: 1,
    productIds: [] as string[]
  });

  const [productSearch, setProductSearch] = useState("");

  const refreshData = async () => {
    setLoading(true);
    try {
      const [promoList, prodList] = await Promise.all([
        PromotionsService.getAll(),
        ProductsService.getAll()
      ]);
      setPromotions(promoList);
      setProducts(prodList);
    } catch (err) {
      console.error("[PromotionsTab] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenForm = (item: Promotion | null) => {
    if (item) {
      setEditingPromo(item);
      setForm({
        id: item.id,
        name: item.name,
        banner: item.banner || "",
        offerType: item.offerType || "Percentage Discount",
        startDate: item.startDate || "2026-01-01",
        endDate: item.endDate || "2026-12-31",
        active: item.active !== false,
        landingPage: item.landingPage || "/collections/all",
        description: item.description || "",
        discountValue: item.discountValue || "",
        displayOrder: item.displayOrder ?? 1,
        productIds: item.productIds || []
      });
    } else {
      setEditingPromo(null);
      setForm({
        id: `promo-${Date.now()}`,
        name: "",
        banner: "",
        offerType: "Percentage Discount",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "2026-12-31",
        active: true,
        landingPage: "/collections/all",
        description: "",
        discountValue: "",
        displayOrder: promotions.length + 1,
        productIds: []
      });
    }
    setProductSearch("");
    setEditorMode("form");
  };

  const handleToggleProduct = (prodId: string) => {
    setForm(f => {
      const exists = f.productIds.includes(prodId);
      const updated = exists ? f.productIds.filter(id => id !== prodId) : [...f.productIds, prodId];
      return { ...f, productIds: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      alert("Promotion Name is required!");
      return;
    }

    try {
      setLoading(true);
      if (editingPromo) {
        await PromotionsService.update(form.id, form);
      } else {
        await PromotionsService.create(form as Promotion);
      }
      alert(`Promotion "${form.name}" saved successfully!`);
      await refreshData();
      setEditorMode("list");
      setEditingPromo(null);
    } catch (err: any) {
      alert(`Failed to save promotion: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete promotion "${name}"?`)) return;
    try {
      setLoading(true);
      await PromotionsService.delete(id);
      await refreshData();
    } catch (err: any) {
      alert(`Failed to delete: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (promo: Promotion) => {
    try {
      await PromotionsService.update(promo.id, { active: !promo.active });
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div id="admin-promotions-tab" className="space-y-6 text-left font-sans text-zinc-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" /> Marketing Promotions & Offers
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Create active promotional campaigns, discounts, BOGO offers, banners, and landing page campaign destinations.
          </p>
        </div>
        {editorMode === "list" && (
          <button
            onClick={() => handleOpenForm(null)}
            className="py-2 px-4 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-600/20"
          >
            <Plus className="h-4 w-4" /> Create New Promotion
          </button>
        )}
      </div>

      {loading && (
        <div className="py-8 text-center text-xs font-mono text-orange-400 animate-pulse">
          Synchronizing Promotions & Campaign Engine...
        </div>
      )}

      {/* LIST VIEW */}
      {editorMode === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => {
            const assignedCount = promo.productIds ? promo.productIds.length : 0;
            return (
              <div 
                key={promo.id}
                className={`bg-zinc-900 border rounded-xl overflow-hidden flex flex-col justify-between transition-all ${
                  promo.active ? "border-zinc-800 hover:border-zinc-700" : "border-zinc-800/50 opacity-60"
                }`}
              >
                <div>
                  {/* Banner Preview */}
                  <div className="relative h-36 bg-zinc-950 overflow-hidden">
                    {promo.banner ? (
                      <img src={promo.banner} alt={promo.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-xs">
                        No Banner Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        promo.active ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}>
                        {promo.active ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-950/60 text-orange-400 border border-orange-800/50">
                        {promo.offerType}
                      </span>
                      {promo.discountValue && (
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          {promo.discountValue}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white tracking-wide">{promo.name}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-2">{promo.description || "No promotional summary specified."}</p>

                    <div className="space-y-1 pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-400">
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-zinc-500" /> {promo.startDate} to {promo.endDate}
                      </p>
                      <p className="flex items-center gap-1 text-orange-400 truncate">
                        <ArrowUpRight className="h-3 w-3" /> Landing: {promo.landingPage}
                      </p>
                      <p className="flex items-center gap-1 text-zinc-300">
                        <Package className="h-3 w-3 text-zinc-500" /> {assignedCount} {assignedCount === 1 ? "Product" : "Products"} Participating
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(promo)}
                    className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition cursor-pointer"
                    title={promo.active ? "Deactivate Promotion" : "Activate Promotion"}
                  >
                    {promo.active ? <ToggleRight className="h-5 w-5 text-emerald-400" /> : <ToggleLeft className="h-5 w-5 text-zinc-500" />}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenForm(promo)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id, promo.name)}
                      className="p-1.5 hover:bg-red-950 text-red-400 rounded transition cursor-pointer"
                      title="Delete Promotion"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDITOR FORM VIEW */}
      {editorMode === "form" && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 max-w-4xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-bold text-white tracking-wide">
              {editingPromo ? `Edit Promotion: ${editingPromo.name}` : "Create New Promotion Campaign"}
            </h3>
            <button
              type="button"
              onClick={() => setEditorMode("list")}
              className="py-1.5 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition"
            >
              Cancel & Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Promotion Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Grand Festive Sale, Buy 2 Get 1 Free, Summer Splash"
                className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Offer Type</label>
              <select
                value={form.offerType}
                onChange={(e) => setForm({ ...form, offerType: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="Percentage Discount">Percentage Discount (e.g. 30% OFF)</option>
                <option value="Flat Off">Flat Amount Off (e.g. ₹500 OFF)</option>
                <option value="Buy X Get Y">Buy X Get Y (e.g. Buy 2 Get 1 Free)</option>
                <option value="Bundle Deal">Bundle Combo Deal</option>
                <option value="Free Shipping">Free Shipping Promo</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Discount Value / Badge Text</label>
              <input
                type="text"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                placeholder="e.g. FLAT 30% OFF, SAVE ₹1,500, FREE SHIPPING"
                className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Landing Page URL</label>
              <input
                type="text"
                value={form.landingPage}
                onChange={(e) => setForm({ ...form, landingPage: e.target.value })}
                placeholder="e.g. /collections/combos or /collections/shirts"
                className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm font-mono text-orange-400 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Description / Terms</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Promotional subtitle or terms summary..."
                className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Banner Image URL</label>
              <MediaUploader
                label="Promotion Banner"
                value={form.banner}
                onChange={(url) => setForm({ ...form, banner: url })}
              />
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                <span className="text-sm font-bold text-white">Active Promotion Campaign</span>
              </label>
            </div>
          </div>

          {/* PRODUCT PARTICIPATION SELECTOR MATRIX */}
          <div className="space-y-3 border-t border-zinc-800 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Participating Products ({form.productIds.length} Assigned)
                </h4>
                <p className="text-xs text-zinc-400">Select which products qualify for this promotional deal.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-black border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-2 bg-black border border-zinc-800 rounded-xl">
              {filteredProducts.map((prod) => {
                const isSelected = form.productIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleToggleProduct(prod.id)}
                    className={`p-2.5 rounded-lg border flex items-center gap-3 cursor-pointer transition ${
                      isSelected 
                        ? "bg-orange-950/40 border-orange-500/80 text-white" 
                        : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div className="w-10 h-10 rounded bg-zinc-800 shrink-0 overflow-hidden">
                      <img src={(Array.isArray(prod.images) && prod.images[0]) || ""} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold truncate text-white">{prod.name}</p>
                      <p className="text-[10px] font-mono text-zinc-400">₹{prod.price} • {prod.category}</p>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-orange-600 border-orange-500 text-white" : "border-zinc-700 bg-black"
                    }`}>
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
            <button
              type="button"
              onClick={() => setEditorMode("list")}
              className="py-2.5 px-5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white uppercase tracking-wider transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-orange-600/20"
            >
              Save Promotion
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
