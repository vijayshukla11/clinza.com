/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Image, Eye, Trash2, Clipboard, Check, Film, FileText } from "lucide-react";
import { MediaAsset } from "../../types";

export default function MediaLibraryTab() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New URL input
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const cached = localStorage.getItem("clinza_media_vault");
    if (cached) {
      setAssets(JSON.parse(cached));
    } else {
      const initial: MediaAsset[] = [
        { id: "ast-1", name: "Italian Linen Cream Cover", url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800", type: "image", size: "320 KB", createdAt: "2026-06-03" },
        { id: "ast-2", name: "Classic Italian Linen Model Roll", url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800", type: "image", size: "280 KB", createdAt: "2026-06-04" },
        { id: "ast-3", name: "Indigo Selvedge Shuttle Loom Close", url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800", type: "image", size: "1.2 MB", createdAt: "2026-06-05" },
        { id: "ast-4", name: "Luxury Resort Wear Co-ord Shoot", url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800", type: "image", size: "480 KB", createdAt: "2026-06-05" }
      ];
      setAssets(initial);
      localStorage.setItem("clinza_media_vault", JSON.stringify(initial));
    }
  }, []);

  const saveToStore = (list: MediaAsset[]) => {
    setAssets(list);
    localStorage.setItem("clinza_media_vault", JSON.stringify(list));
  };

  const handleCopy = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const payload: MediaAsset = {
      id: `ast-${Date.now()}`,
      name: newName.trim() || `Asset-${Math.floor(100 + Math.random() * 900)}`,
      url: newUrl.trim(),
      type: newUrl.match(/\.(mp4|mov|avi)$/i) ? "video" : "image",
      size: `${Math.floor(100 + Math.random() * 800)} KB`,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    const updated = [...assets, payload];
    saveToStore(updated);
    setNewUrl("");
    setNewName("");
    alert("Resource links recorded and synced to central repository!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this media URL reference from visual catalog index?")) {
      const updated = assets.filter(a => a.id !== id);
      saveToStore(updated);
    }
  };

  return (
    <div id="media-library-console" className="space-y-6 text-left animate-fade-in text-xs font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Central Media & Banners Vault</h3>
          <p className="text-[11px] text-zinc-400">Add or extract resource links for slider models, listings, and banners</p>
        </div>
      </div>

      {/* Quick link creator form */}
      <form onSubmit={handleCreate} className="p-4 bg-zinc-50/70 border rounded-2xl flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Asset Frame Name</label>
          <input
            type="text"
            placeholder="e.g. Sage Green linen shirt slider photo"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 bg-white"
          />
        </div>
        <div className="flex-[2] min-w-[250px]">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Raw file / Image URL</label>
          <input
            type="text"
            required
            placeholder="https://images.unsplash.com/photo-..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-orange-500 bg-white"
          />
        </div>
        <button
          type="submit"
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-sans text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Link Asset
        </button>
      </form>

      {/* Grid of cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-zinc-700">
        {assets.map((ast) => (
          <div key={ast.id} className="bg-white border text-xs border-zinc-200 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xs">
            <div className="relative aspect-square bg-zinc-100 overflow-hidden">
              {ast.type === "video" ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-900">
                  <Film className="h-10 w-10 text-orange-500 animate-pulse" />
                  <span className="text-[9px] uppercase font-mono mt-2 font-bold select-none text-zinc-500">Demonstration Video</span>
                </div>
              ) : (
                <img src={ast.url} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300" />
              )}
            </div>

            <div className="p-3.5 space-y-2 bg-white">
              <h4 className="font-bold text-zinc-900 truncate leading-tight" title={ast.name}>{ast.name}</h4>
              <p className="text-[9px] text-zinc-400 font-mono flex justify-between">
                <span>Size: {ast.size}</span>
                <span>Date: {ast.createdAt}</span>
              </p>
              
              <div className="flex border-t pt-2.5 gap-1 justify-between">
                <button
                  type="button"
                  onClick={() => handleCopy(ast.url, ast.id)}
                  className="flex-1 py-1.5 border hover:bg-zinc-50 text-zinc-600 rounded flex items-center justify-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer transition"
                >
                  {copiedId === ast.id ? (
                    <>
                      <Check className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-3 w-3 text-zinc-400" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(ast.id)}
                  className="p-1 px-2 border hover:bg-red-50 text-red-500 rounded flex items-center justify-center cursor-pointer transition"
                  title="Remove catalog reference"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
