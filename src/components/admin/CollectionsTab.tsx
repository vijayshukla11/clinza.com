/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronLeft, ToggleLeft, ToggleRight, Check, X, Eye, EyeOff } from "lucide-react";
import { CollectionMaster } from "../../types";
import MediaUploader from "./MediaUploader";
import { CollectionsService } from "../../services/supabaseService";

export default function CollectionsTab() {
  const [collections, setCollections] = useState<CollectionMaster[]>([]);
  const [editorMode, setEditorMode] = useState<"list" | "form">("list");
  const [editingCollection, setEditingCollection] = useState<CollectionMaster | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    banner: "",
    thumbnail: "",
    description: "",
    shortDescription: "",
    buttonText: "View Collection",
    altText: "",
    seoTitle: "",
    seoDescription: "",
    metaTitle: "",
    metaDescription: "",
    displayOrder: 1,
    featured: true,
    showOnHomepage: true,
    isActive: true
  });

  const refreshCollections = () => {
    setLoading(true);
    CollectionsService.getAll().then((cloudList) => {
      setCollections(cloudList as any[]);
    }).catch((err) => {
      console.error("Error loading collections:", err);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshCollections();
  }, []);

  const handleOpenForm = (col: CollectionMaster | null) => {
    if (col) {
      setEditingCollection(col);
      setForm({
        id: col.id || "",
        name: col.name || "",
        slug: col.slug || "",
        banner: col.banner || col.thumbnail || "",
        thumbnail: col.thumbnail || col.banner || "",
        description: col.description || "",
        shortDescription: col.shortDescription || col.description || "",
        buttonText: col.buttonText || "View Collection",
        altText: col.altText || col.name || "",
        seoTitle: col.seoTitle || col.metaTitle || "",
        seoDescription: col.seoDescription || col.metaDescription || "",
        metaTitle: col.metaTitle || col.seoTitle || "",
        metaDescription: col.metaDescription || col.seoDescription || "",
        displayOrder: col.displayOrder !== undefined ? col.displayOrder : 1,
        featured: col.featured !== false,
        showOnHomepage: col.showOnHomepage !== false,
        isActive: col.isActive !== false
      });
    } else {
      setEditingCollection(null);
      setForm({
        id: `col-${Date.now()}`,
        name: "",
        slug: "",
        banner: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1200",
        thumbnail: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=300",
        description: "",
        shortDescription: "",
        buttonText: "View Collection",
        altText: "",
        seoTitle: "",
        seoDescription: "",
        metaTitle: "",
        metaDescription: "",
        displayOrder: collections.length + 1,
        featured: true,
        showOnHomepage: true,
        isActive: true
      });
    }
    setEditorMode("form");
  };

  const handleNameSync = (val: string) => {
    if (!editingCollection) {
      const slug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setForm(f => ({
        ...f,
        name: val,
        slug,
        seoTitle: `${val} - Clinza Wardrobe`,
        metaTitle: `${val} - Clinza Wardrobe`,
        altText: `Clinza ${val}`
      }));
    } else {
      setForm(f => ({ ...f, name: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      alert("Collection Name and Slug are required!");
      return;
    }

    try {
      setLoading(true);
      if (editingCollection) {
        await CollectionsService.update(form.id, form as any);
      } else {
        await CollectionsService.create(form as any);
      }
      alert(`Collection "${form.name}" saved successfully!`);
      refreshCollections();
      setEditorMode("list");
      setEditingCollection(null);
    } catch (err) {
      console.error("Failed to save collection:", err);
      alert("Failed to save collection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this collection?")) {
      try {
        setLoading(true);
        await CollectionsService.delete(id);
        alert("Collection deleted successfully!");
        refreshCollections();
      } catch (err) {
        console.error("Failed to delete collection:", err);
        alert("Failed to delete collection.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div id="collections-master-cms" className="space-y-6 text-left animate-fade-in">
      {editorMode === "list" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Clinza Collections CMS</h3>
              <p className="text-[11px] text-zinc-400 font-sans">Manage homepage departments, order, status, and metadata</p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="bg-zinc-900 hover:bg-zinc-850 text-white font-sans text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Collection
            </button>
          </div>

          <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-zinc-700 min-w-[700px]">
              <thead className="bg-zinc-50 border-b text-[9px] text-zinc-500 font-bold uppercase tracking-widest text-left">
                <tr>
                  <th className="py-3.5 px-5">Image</th>
                  <th className="py-3.5 px-4">Collection Title & Slug</th>
                  <th className="py-3.5 px-4">Display Order</th>
                  <th className="py-3.5 px-4">Homepage Visibility</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-zinc-50/20">
                    <td className="py-3.5 px-5">
                      <img src={col.thumbnail || col.banner} alt={col.altText || col.name} className="w-10 h-10 object-cover rounded border" />
                    </td>
                    <td className="py-3.5 px-4">
                      <h4 className="font-bold text-zinc-950 font-sans text-sm">{col.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">/collections/{col.slug}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-650">
                      Order: #{col.displayOrder}
                    </td>
                    <td className="py-3.5 px-4">
                      {col.showOnHomepage !== false ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-bold uppercase text-[8px]">
                          <Eye className="h-3 w-3" /> Show on Homepage
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-500 border border-zinc-200 px-2.5 py-0.5 rounded-full font-semibold uppercase text-[8px]">
                          <EyeOff className="h-3 w-3" /> Hidden from Homepage
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {col.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold uppercase text-[8px]">
                          <Check className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded-full font-semibold uppercase text-[8px]">
                          <X className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenForm(col)}
                        className="p-1.5 text-blue-600 hover:bg-zinc-100 rounded cursor-pointer inline-block"
                        title="Edit Collection"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer inline-block"
                        title="Delete Collection"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <button
              type="button"
              onClick={() => setEditorMode("list")}
              className="flex items-center gap-1 text-xs font-mono font-bold text-zinc-500 uppercase cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Collections List
            </button>
            <span className="text-[10px] font-mono uppercase bg-zinc-100 px-3 py-1 font-bold">
              {editingCollection ? "Edit Collection" : "Add New Collection"}
            </span>
          </div>

          {/* BASIC INFORMATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Collection Title</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameSync(e.target.value)}
                className="w-full border rounded-lg p-2.5 font-semibold focus:outline-none focus:border-orange-500 bg-white"
                placeholder="e.g. Linen Combo"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">URL Slug</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g,"-") })}
                className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white"
                placeholder="e.g. combos"
              />
            </div>
          </div>

          {/* DESCRIPTIONS & BUTTON TEXT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Short Description (Homepage Card)</label>
              <textarea
                rows={2}
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
                placeholder="Brief summary displayed on homepage card..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Button Text</label>
              <input
                type="text"
                value={form.buttonText}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white font-semibold"
                placeholder="e.g. Explore Linen Combo"
              />
              <p className="text-[10px] text-zinc-400 mt-1">Default: "View Collection"</p>
            </div>
          </div>

          <div className="text-xs font-sans">
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Full Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
              placeholder="Detailed description for collection page..."
            />
          </div>

          {/* MEDIA UPLOADERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Collection Thumbnail / Card Image</label>
              <input
                type="text"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white mb-2"
                placeholder="Image URL (700x900 recommended)"
              />
              <MediaUploader
                bucketName="collections"
                onUploadSuccess={(url) => setForm((prev) => ({ ...prev, thumbnail: url }))}
                label="Upload Thumbnail (700x900)"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Hero Banner Image URL</label>
              <input
                type="text"
                value={form.banner}
                onChange={(e) => setForm({ ...form, banner: e.target.value })}
                className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white mb-2"
                placeholder="Hero banner image URL"
              />
              <MediaUploader
                bucketName="collections"
                onUploadSuccess={(url) => setForm((prev) => ({ ...prev, banner: url }))}
                label="Upload Banner Image"
              />
            </div>
          </div>

          {/* ALT TEXT */}
          <div className="text-xs font-sans">
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Image Alt Text</label>
            <input
              type="text"
              value={form.altText}
              onChange={(e) => setForm({ ...form, altText: e.target.value })}
              className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
              placeholder="e.g. Clinza Linen Combo Set"
            />
          </div>

          {/* ORDER & TOGGLES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans items-center bg-zinc-50 p-4 rounded-xl border">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Display Order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Homepage Visibility</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, showOnHomepage: !form.showOnHomepage })}
                className="cursor-pointer flex items-center gap-2 pt-1.5"
              >
                {form.showOnHomepage ? (
                  <div className="flex items-center gap-1.5 font-bold text-green-600"><ToggleRight className="h-7 w-7" /> Show on Homepage</div>
                ) : (
                  <div className="flex items-center gap-1.5 text-zinc-400 font-semibold"><ToggleLeft className="h-7 w-7" /> Hide from Homepage</div>
                )}
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Active Status</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className="cursor-pointer flex items-center gap-2 pt-1.5"
              >
                {form.isActive ? (
                  <div className="flex items-center gap-1.5 font-bold text-blue-600"><ToggleRight className="h-7 w-7" /> Active</div>
                ) : (
                  <div className="flex items-center gap-1.5 text-red-500 font-semibold"><ToggleLeft className="h-7 w-7" /> Inactive</div>
                )}
              </button>
            </div>
          </div>

          {/* SEO FIELDS */}
          <div className="p-4 bg-zinc-50 border rounded-xl space-y-4 text-xs font-sans">
            <h4 className="text-[10px] font-black uppercase text-zinc-650 font-mono">SEO Fields</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Meta Title</label>
                <input
                  type="text"
                  value={form.metaTitle || form.seoTitle}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value, seoTitle: e.target.value })}
                  className="w-full border rounded p-2 focus:outline-none bg-white font-mono"
                  placeholder="Meta Title for search engines..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={form.metaDescription || form.seoDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value, seoDescription: e.target.value })}
                  className="w-full border rounded p-2 focus:outline-none bg-white"
                  placeholder="Meta Description for search engines..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow cursor-pointer text-center"
          >
            Save Collection
          </button>
        </form>
      )}
    </div>
  );
}
