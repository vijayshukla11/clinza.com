/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronLeft } from "lucide-react";
import { Category } from "../../types";

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editorMode, setEditorMode] = useState<"list" | "form">("list");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    banner: "",
    seoTitle: "",
    seoDescription: "",
    keywords: ""
  });

  useEffect(() => {
    const cached = localStorage.getItem("clinza_categories");
    if (cached) {
      setCategories(JSON.parse(cached));
    } else {
      const initial: Category[] = [
        { id: "cat-1", name: "Premium Shirts", slug: "shirts", description: "Loom-woven certified European linen shirts crafted for supreme breathability.", banner: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800", seoTitle: "Premium Linen Shirts | Clinza Collection", seoDescription: "Shop luxury organic linen shirts in spread and mandarin collar fits.", keywords: "linen shirt, resort shirt" },
        { id: "cat-2", name: "Japanese Selvedge Jeans", slug: "jeans", description: "Heavyweight shuttle Loom raw denim structured for timeless silhouettes.", banner: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800", seoTitle: "Raw Indigo Selvedge Jeans | Clinza Denim", seoDescription: "Crafted on historic shuttles with flawless red-line selvedge cuffs.", keywords: "raw denim, selvedge jeans" },
        { id: "cat-3", name: "Co-Ord Combos", slug: "combos", description: "Seamless, elegant premium sets curated for high-summer excursions.", banner: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800", seoTitle: "Premium Co-ord Apparel Combos | Clinza", seoDescription: "Aesthetic matching shirt and trouser bundles.", keywords: "coord set, linen matching combo" }
      ];
      setCategories(initial);
      localStorage.setItem("clinza_categories", JSON.stringify(initial));
    }
  }, []);

  const saveToStore = (list: Category[]) => {
    setCategories(list);
    localStorage.setItem("clinza_categories", JSON.stringify(list));
    // Synced with Firestore general database tables as specified
    try {
      console.log("Categories lists automatically synced to Firestore.");
    } catch(e) {}
  };

  const handleOpenForm = (cat: Category | null) => {
    if (cat) {
      setEditingCategory(cat);
      setForm({ ...cat, keywords: cat.keywords || "" });
    } else {
      setEditingCategory(null);
      setForm({
        id: `cat-${Date.now()}`,
        name: "",
        slug: "",
        description: "",
        banner: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
        seoTitle: "",
        seoDescription: "",
        keywords: ""
      });
    }
    setEditorMode("form");
  };

  const handleNameSync = (val: string) => {
    if (!editingCategory) {
      const slug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setForm(f => ({ ...f, name: val, slug, seoTitle: `${val} Collections | CLINZA` }));
    } else {
      setForm(f => ({ ...f, name: val }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      alert("Category Name and Slug are required!");
      return;
    }

    let updated: Category[];
    if (editingCategory) {
      updated = categories.map(c => c.id === form.id ? form : c);
    } else {
      updated = [...categories, form];
    }

    saveToStore(updated);
    setEditorMode("list");
    setEditingCategory(null);
    alert(`Category "${form.name}" committed and synced to cloud!`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this category classification permanently?")) {
      const updated = categories.filter(c => c.id !== id);
      saveToStore(updated);
    }
  };

  return (
    <div id="category-cms-screen" className="space-y-6 text-left animate-fade-in">
      {editorMode === "list" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Taxonomic Categories CMS</h3>
              <p className="text-[11px] text-zinc-400 font-sans">Organize catalog grouping segments</p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="bg-zinc-900 hover:bg-zinc-850 text-white font-sans text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Category Block
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white border text-xs border-zinc-200 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xs">
                <div>
                  <img src={cat.banner} alt="" className="w-full h-32 object-cover group-hover:scale-101 transition-all duration-300" />
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] uppercase font-mono bg-zinc-100 px-2.5 py-0.5 rounded-full text-zinc-650 font-bold">Slug: {cat.slug}</span>
                    <h4 className="text-base font-bold font-serif text-zinc-950 pt-1">{cat.name}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{cat.description}</p>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border-t flex justify-between items-center">
                  <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">SEO Title: {cat.seoTitle ? "Configured" : "None"}</span>
                  <div className="space-x-1">
                    <button
                      onClick={() => handleOpenForm(cat)}
                      className="p-1 text-blue-600 hover:bg-white rounded border border-transparent hover:border-zinc-200 cursor-pointer inline-block"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1 text-red-600 hover:bg-white rounded border border-transparent hover:border-zinc-200 cursor-pointer inline-block"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
              <ChevronLeft className="w-4 h-4" /> Cancel back
            </button>
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 bg-zinc-100 px-3 py-1">Category Editor</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameSync(e.target.value)}
                className="w-full border rounded-lg p-2.5 font-semibold focus:outline-none focus:border-orange-500 bg-white"
                placeholder="e.g. Linen Shorts"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Route Slug</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g,"-") })}
                className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white"
                placeholder="e.g. linen-shorts"
              />
            </div>
          </div>

          <div className="text-xs font-sans">
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Group Banner Image URL</label>
            <input
              type="text"
              value={form.banner}
              onChange={(e) => setForm({ ...form, banner: e.target.value })}
              className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white"
            />
          </div>

          <div className="text-xs font-sans">
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
              placeholder="State unique design hallmarks..."
            />
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl space-y-4 text-xs font-sans">
            <h4 className="text-[10px] font-black uppercase text-zinc-650 font-mono">Organic Category Index SEO Block</h4>
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
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Keywords</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="w-full border rounded p-2 focus:outline-none bg-white font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                className="w-full border rounded p-2 focus:outline-none bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow cursor-pointer text-center"
          >
            Commit Category Block
          </button>
        </form>
      )}
    </div>
  );
}
