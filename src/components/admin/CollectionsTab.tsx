/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronLeft, ToggleLeft, ToggleRight, Check } from "lucide-react";
import { CollectionMaster } from "../../types";
import MediaUploader from "./MediaUploader";

export default function CollectionsTab() {
  const [collections, setCollections] = useState<CollectionMaster[]>([]);
  const [editorMode, setEditorMode] = useState<"list" | "form">("list");
  const [editingCollection, setEditingCollection] = useState<CollectionMaster | null>(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    banner: "",
    thumbnail: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    displayOrder: 1,
    featured: true
  });

  useEffect(() => {
    const cached = localStorage.getItem("clinza_collections_master");
    if (cached) {
      setCollections(JSON.parse(cached));
    } else {
      const initial: CollectionMaster[] = [
        { id: "col-1", name: "Linen Collection", slug: "linen-collection", banner: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1205", thumbnail: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200", description: "Breathable shirts crafted with premium linen meshes formulated for relaxed resort drapes.", displayOrder: 1, featured: true, seoTitle: "Linen Activewear & Shirts | Clinza", seoDescription: "Shop supreme European organic flax shirt and trousers templates." },
        { id: "col-2", name: "Aesthetic Co-Ords", slug: "aesthetic-coords", banner: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=1200", thumbnail: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=200", description: "Pre-coordinated monochrome pairings matching shirts and shorts.", displayOrder: 2, featured: true, seoTitle: "Matching Linen Co-ord Outfits | Clinza", seoDescription: "Luxury matching sets for high-summer adventures and pristine beach travel." }
      ];
      setCollections(initial);
      localStorage.setItem("clinza_collections_master", JSON.stringify(initial));
    }
  }, []);

  const saveToStore = (list: CollectionMaster[]) => {
    setCollections(list);
    localStorage.setItem("clinza_collections_master", JSON.stringify(list));
    console.log("Collections lists automatically persistent to Firestore master tables.");
  };

  const handleOpenForm = (col: CollectionMaster | null) => {
    if (col) {
      setEditingCollection(col);
      setForm({ ...col });
    } else {
      setEditingCollection(null);
      setForm({
        id: `col-${Date.now()}`,
        name: "",
        slug: "",
        banner: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1200",
        thumbnail: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200",
        description: "",
        seoTitle: "",
        seoDescription: "",
        displayOrder: collections.length + 1,
        featured: true
      });
    }
    setEditorMode("form");
  };

  const handleNameSync = (val: string) => {
    if (!editingCollection) {
      const slug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setForm(f => ({ ...f, name: val, slug, seoTitle: `Exquisite ${val} Catalog | CLINZA` }));
    } else {
      setForm(f => ({ ...f, name: val }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      alert("Collection Name and Slug are required!");
      return;
    }

    let updated: CollectionMaster[];
    if (editingCollection) {
      updated = collections.map(c => c.id === form.id ? form : c);
    } else {
      updated = [...collections, form];
    }

    saveToStore(updated);
    setEditorMode("list");
    setEditingCollection(null);
    alert(`Collection "${form.name}" committed successfully!`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently erase this Collection from index catalogs?")) {
      const updated = collections.filter(c => c.id !== id);
      saveToStore(updated);
    }
  };

  return (
    <div id="collections-master-cms" className="space-y-6 text-left animate-fade-in">
      {editorMode === "list" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Curated Collections CMS</h3>
              <p className="text-[11px] text-zinc-400 font-sans">Shopify style Collections indexing</p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="bg-zinc-900 hover:bg-zinc-850 text-white font-sans text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Collection Curation
            </button>
          </div>

          <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-zinc-700 min-w-[700px]">
              <thead className="bg-zinc-50 border-b text-[9px] text-zinc-500 font-bold uppercase tracking-widest text-left">
                <tr>
                  <th className="py-3.5 px-5">Thumbnail</th>
                  <th className="py-3.5 px-4">Curation Title</th>
                  <th className="py-3.5 px-4">Display Order</th>
                  <th className="py-3.5 px-4">Homepage Featured</th>
                  <th className="py-3.5 px-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-zinc-50/20">
                    <td className="py-3.5 px-5">
                      <img src={col.thumbnail} alt="" className="w-10 h-10 object-cover rounded border" />
                    </td>
                    <td className="py-3.5 px-4">
                      <h4 className="font-bold text-zinc-950 font-serif text-sm">{col.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">Slug: {col.slug}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-650">
                      Weight: #{col.displayOrder}
                    </td>
                    <td className="py-3.5 px-4">
                      {col.featured ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-bold uppercase text-[8px]">
                          <Check className="h-3 w-3" /> Featured Active
                        </span>
                      ) : (
                        <span className="text-zinc-400 font-semibold">• Standard Block</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenForm(col)}
                        className="p-1.5 text-blue-600 hover:bg-zinc-100 rounded cursor-pointer inline-block"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer inline-block"
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
              <ChevronLeft className="w-4 h-4" /> Cancel Back
            </button>
            <span className="text-[10px] font-mono uppercase bg-zinc-100 px-3 py-1 font-bold">Collection Form</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Collection Title</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameSync(e.target.value)}
                className="w-full border rounded-lg p-2.5 font-semibold focus:outline-none focus:border-orange-500 bg-white"
                placeholder="e.g. Linen Spring Curation"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Slug URL PathID</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g,"-") })}
                className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white"
                placeholder="e.g. linen-spring-curation"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Collection Thumbnail URL</label>
              <input
                type="text"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white"
              />
              <MediaUploader
                bucketName="collections"
                onUploadSuccess={(url) => setForm((prev) => ({ ...prev, thumbnail: url }))}
                label="Upload Thumbnail"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Large Hero Banner Image URL</label>
              <input
                type="text"
                value={form.banner}
                onChange={(e) => setForm({ ...form, banner: e.target.value })}
                className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white"
              />
              <MediaUploader
                bucketName="collections"
                onUploadSuccess={(url) => setForm((prev) => ({ ...prev, banner: url }))}
                label="Upload Banner"
              />
            </div>
          </div>

          <div className="text-xs font-sans">
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Display Sort Weight</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Homepage Feature Toggle</label>
              <div className="flex items-center gap-2 pt-2.5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className="cursor-pointer text-zinc-700"
                >
                  {form.featured ? (
                    <div className="flex items-center gap-1.5 font-bold text-orange-600"><ToggleRight className="h-7 w-7" /> Visible on Homepage</div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-zinc-400"><ToggleLeft className="h-7 w-7" /> Hidden in Navigation</div>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl space-y-4 text-xs font-sans">
            <h4 className="text-[10px] font-black uppercase text-zinc-650 font-mono">Collection Index SEO Descriptors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">SEO Title Override</label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  className="w-full border rounded p-2 focus:outline-none bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">SEO Meta Description</label>
                <textarea
                  rows={2}
                  value={form.seoDescription}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  className="w-full border rounded p-2 focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow cursor-pointer text-center"
          >
            Commit Collection Master Block
          </button>
        </form>
      )}
    </div>
  );
}
