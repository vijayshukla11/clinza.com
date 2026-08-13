import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronLeft, Image as ImageIcon, Eye, CheckCircle2, XCircle, Upload } from "lucide-react";
import { Category } from "../../types";
import { CategoriesService, ProductsService } from "../../services/supabaseService";
import { ensureUniqueCategorySlug } from "../../utils/variantUtils";
import MediaUploader from "./MediaUploader";

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorMode, setEditorMode] = useState<"list" | "form">("list");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [form, setForm] = useState<Category>({
    id: "",
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    banner: "",
    thumbnail: "",
    altText: "",
    seoTitle: "",
    seoDescription: "",
    keywords: "",
    canonicalUrl: "",
    displayOrder: 0,
    featured: true,
    showOnHomepage: true,
    isActive: true
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const list = await CategoriesService.getAll();
      setCategories(list || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();

    const handleUpdate = () => {
      loadCategories();
    };

    window.addEventListener("clinza_categories_updated", handleUpdate);
    window.addEventListener("clinza_collections_updated", handleUpdate);
    return () => {
      window.removeEventListener("clinza_categories_updated", handleUpdate);
      window.removeEventListener("clinza_collections_updated", handleUpdate);
    };
  }, []);

  const handleOpenForm = (cat: Category | null) => {
    if (cat) {
      setEditingCategory(cat);
      setForm({
        id: cat.id,
        name: cat.name || "",
        slug: cat.slug || "",
        description: cat.description || "",
        shortDescription: cat.shortDescription || "",
        banner: cat.banner || "",
        thumbnail: cat.thumbnail || "",
        altText: cat.altText || cat.name || "",
        seoTitle: cat.seoTitle || cat.metaTitle || "",
        seoDescription: cat.seoDescription || cat.metaDescription || "",
        keywords: cat.keywords || "",
        canonicalUrl: cat.canonicalUrl || `https://www.clinza.in/category/${cat.slug}`,
        displayOrder: cat.displayOrder ?? 0,
        featured: cat.featured !== false,
        showOnHomepage: cat.showOnHomepage !== false,
        isActive: cat.isActive !== false
      });
    } else {
      const newId = `cat-${Date.now()}`;
      setEditingCategory(null);
      setForm({
        id: newId,
        name: "",
        slug: "",
        description: "",
        shortDescription: "",
        banner: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
        thumbnail: "",
        altText: "",
        seoTitle: "",
        seoDescription: "",
        keywords: "",
        canonicalUrl: "",
        displayOrder: categories.length + 1,
        featured: true,
        showOnHomepage: true,
        isActive: true
      });
    }
    setEditorMode("form");
  };

  const handleNameChange = (val: string) => {
    if (!editingCategory) {
      const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setForm(f => ({
        ...f,
        name: val,
        slug: autoSlug,
        altText: val,
        seoTitle: `${val} Collection | CLINZA`
      }));
    } else {
      setForm(f => ({ ...f, name: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedName = form.name.trim();
    if (!sanitizedName) {
      alert("Category Name is required!");
      return;
    }

    // Deduplicate route slug (shirts, shirts-2, shirts-3...)
    const finalSlug = ensureUniqueCategorySlug(form.slug || sanitizedName, editingCategory?.id || form.id, categories);
    const finalCanonicalUrl = form.canonicalUrl.trim() || `https://www.clinza.in/category/${finalSlug}`;

    const payload: Category = {
      ...form,
      name: sanitizedName,
      slug: finalSlug,
      canonicalUrl: finalCanonicalUrl,
      seoTitle: form.seoTitle || `${sanitizedName} Collection | CLINZA`,
      seoDescription: form.seoDescription || form.shortDescription || form.description || `Discover ${sanitizedName} at CLINZA.`,
      metaTitle: form.metaTitle || form.seoTitle || `${sanitizedName} Collection | CLINZA`,
      metaDescription: form.metaDescription || form.seoDescription || form.shortDescription || form.description || `Discover ${sanitizedName} at CLINZA.`
    };

    try {
      if (editingCategory) {
        // Product integration: if category name changed, cascade update associated products
        if (editingCategory.name.trim() !== sanitizedName) {
          const oldName = editingCategory.name.trim().toLowerCase();
          const products = await ProductsService.getAll();
          const assignedProducts = (products || []).filter(p => (p.category || "").trim().toLowerCase() === oldName);
          for (const prod of assignedProducts) {
            await ProductsService.update(prod.id, { category: sanitizedName });
          }
        }
        await CategoriesService.update(editingCategory.id, payload);
      } else {
        await CategoriesService.create(payload);
      }
      await loadCategories();
      setEditorMode("list");
      setEditingCategory(null);
      alert(`Category "${sanitizedName}" saved and synchronized successfully!`);
    } catch (err: any) {
      console.error("Failed to save category:", err);
      alert("Error saving category: " + (err.message || err));
    }
  };

  const handleDelete = async (id: string, name: string, slug?: string) => {
    try {
      const products = await ProductsService.getAll();
      const normName = name.toLowerCase().trim();
      const normSlug = (slug || "").toLowerCase().trim();

      const assignedProducts = (products || []).filter(p => {
        const pCat = (p.category || "").toLowerCase().trim();
        const pCol = (p.collection || "").toLowerCase().trim();
        return pCat === normName || pCat === normSlug || pCol === normSlug;
      });

      let confirmMessage = `Permanently delete category "${name}"?`;
      if (assignedProducts.length > 0) {
        confirmMessage = `WARNING: ${assignedProducts.length} product(s) are currently associated with category "${name}".\nDeleting this category will reassign those products to "General" to prevent broken mappings.\n\nAre you sure you want to delete "${name}"?`;
      }

      if (confirm(confirmMessage)) {
        // Reassign assigned products to General to avoid orphan products
        if (assignedProducts.length > 0) {
          for (const prod of assignedProducts) {
            await ProductsService.update(prod.id, { category: "General" });
          }
        }
        await CategoriesService.delete(id);
        await loadCategories();
        alert(`Category "${name}" deleted successfully.`);
      }
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      alert("Error deleting category: " + (err.message || err));
    }
  };

  return (
    <div id="category-cms-screen" className="space-y-6 text-left animate-fade-in">
      {editorMode === "list" ? (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-amber-50 border border-amber-200 rounded-2xl p-4 gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase text-amber-900 font-mono flex items-center gap-2">
                <span>🔄 Master Taxonomic Category Architecture</span>
              </h4>
              <p className="text-[11px] text-amber-800 leading-relaxed max-w-3xl font-sans">
                Manage high-level catalog category segments. Fully synced with Supabase Database and frontend shop filters.
              </p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">
                Taxonomic Categories ({categories.length})
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans">Single Source of Truth for Catalog Taxonomy</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-zinc-400 font-mono text-xs">
              Loading category metadata...
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-zinc-500">No categories found in database.</p>
              <button
                onClick={() => handleOpenForm(null)}
                className="px-4 py-2 bg-orange-600 text-white font-mono text-xs font-bold uppercase rounded-xl inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create First Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white border text-xs border-zinc-200 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xs hover:border-zinc-300 transition-all">
                  <div>
                    <div className="bg-zinc-100 w-full h-36 relative overflow-hidden flex items-center justify-center border-b">
                      {cat.banner || cat.thumbnail ? (
                        <img
                          src={cat.banner || cat.thumbnail}
                          alt={cat.altText || cat.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-zinc-400">
                          <ImageIcon className="w-6 h-6" />
                          <span className="text-[10px] font-mono uppercase tracking-widest">No Banner Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${cat.isActive !== false ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
                          {cat.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-mono bg-zinc-100 px-2.5 py-0.5 rounded-full text-zinc-650 font-bold">
                          Slug: {cat.slug}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          Order: #{cat.displayOrder ?? 0}
                        </span>
                      </div>
                      <h4 className="text-base font-bold font-serif text-zinc-950 pt-1">{cat.name}</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-sans line-clamp-2">
                        {cat.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 border-t flex justify-between items-center">
                    <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">
                      SEO: {cat.seoTitle ? "Custom" : "Auto"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenForm(cat)}
                        className="p-1.5 text-blue-600 hover:bg-white rounded border border-transparent hover:border-zinc-200 cursor-pointer inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name, cat.slug)}
                        className="p-1.5 text-rose-600 hover:bg-white rounded border border-transparent hover:border-zinc-200 cursor-pointer inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <button
              type="button"
              onClick={() => setEditorMode("list")}
              className="flex items-center gap-1 text-xs font-mono font-bold text-zinc-500 uppercase cursor-pointer hover:text-zinc-900"
            >
              <ChevronLeft className="w-4 h-4" /> Cancel & Return
            </button>
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
              {editingCategory ? "Edit Category" : "New Category"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border rounded-lg p-2.5 font-semibold focus:outline-none focus:border-orange-500 bg-white"
                placeholder="e.g. Linen Shorts"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Route Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white"
                placeholder="e.g. linen-shorts"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Display Order</label>
              <input
                type="number"
                value={form.displayOrder ?? 0}
                onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            {/* BANNER MEDIA MANAGEMENT */}
            <div className="space-y-2 p-3 border border-zinc-200 rounded-xl bg-zinc-50/50">
              <label className="block text-[10px] font-bold uppercase text-zinc-700">Category Banner Image</label>
              {form.banner ? (
                <div className="relative group rounded-lg overflow-hidden border border-zinc-200 bg-white">
                  <img
                    src={form.banner}
                    alt="Banner preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png";
                    }}
                    className="w-full h-28 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, banner: "" })}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Remove Banner
                    </button>
                  </div>
                </div>
              ) : null}
              <input
                type="text"
                value={form.banner}
                onChange={(e) => setForm({ ...form, banner: e.target.value })}
                className="w-full border rounded-lg p-2 font-mono text-[11px] focus:outline-none focus:border-orange-500 bg-white"
                placeholder="Banner Image URL (https://...)"
              />
              <MediaUploader
                bucketName="collections"
                label="Upload Banner to Cloud"
                onUploadSuccess={(url) => setForm({ ...form, banner: url })}
              />
            </div>

            {/* THUMBNAIL MEDIA MANAGEMENT */}
            <div className="space-y-2 p-3 border border-zinc-200 rounded-xl bg-zinc-50/50">
              <label className="block text-[10px] font-bold uppercase text-zinc-700">Category Thumbnail Image</label>
              {form.thumbnail ? (
                <div className="relative group rounded-lg overflow-hidden border border-zinc-200 bg-white w-28 h-28 mx-auto">
                  <img
                    src={form.thumbnail}
                    alt="Thumbnail preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png";
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, thumbnail: "" })}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : null}
              <input
                type="text"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                className="w-full border rounded-lg p-2 font-mono text-[11px] focus:outline-none focus:border-orange-500 bg-white"
                placeholder="Thumbnail Image URL (https://...)"
              />
              <MediaUploader
                bucketName="collections"
                label="Upload Thumbnail to Cloud"
                onUploadSuccess={(url) => setForm({ ...form, thumbnail: url })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Alt Text (Accessibility)</label>
              <input
                type="text"
                value={form.altText}
                onChange={(e) => setForm({ ...form, altText: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
                placeholder="Image description..."
              />
            </div>
            <div className="flex items-center gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={form.isActive !== false}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                Is Active
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={form.featured !== false}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                Featured
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={form.showOnHomepage !== false}
                  onChange={(e) => setForm({ ...form, showOnHomepage: e.target.checked })}
                  className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                Show on Homepage
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Short Description</label>
              <input
                type="text"
                value={form.shortDescription || ""}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
                placeholder="Concise summary for cards & meta tags..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Full Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
                placeholder="State unique design hallmarks..."
              />
            </div>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl space-y-4 text-xs font-sans border">
            <h4 className="text-[10px] font-black uppercase text-zinc-700 font-mono">Organic Category Index SEO Block</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">SEO Title Override</label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  className="w-full border rounded p-2 focus:outline-none bg-white font-mono"
                  placeholder="e.g. Premium Linen Shirts | Clinza Collection"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Keywords</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="w-full border rounded p-2 focus:outline-none bg-white font-mono"
                  placeholder="e.g. linen shirt, resort shirt"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={form.canonicalUrl || ""}
                  onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                  className="w-full border rounded p-2 focus:outline-none bg-white font-mono"
                  placeholder="https://www.clinza.in/category/..."
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
                placeholder="Meta description for search engine result snippets..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow cursor-pointer text-center transition-all"
          >
            {editingCategory ? "Update Category" : "Create & Sync Category"}
          </button>
        </form>
      )}
    </div>
  );
}
