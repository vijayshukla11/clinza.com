/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Plus, Image, Eye, Trash2, Clipboard, Check, Film, FileText, Upload, Loader, FolderOpen, Filter } from "lucide-react";
import { MediaAsset } from "../../types";
import { uploadFileToSupabase } from "../../supabase";

export default function MediaLibraryTab() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New URL input
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");

  // Upload state
  const [selectedFolder, setSelectedFolder] = useState<string>("uploads");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders = [
    "brand",
    "homepage",
    "collections",
    "categories",
    "products",
    "blogs",
    "banners",
    "icons",
    "uploads"
  ];

  useEffect(() => {
    const cached = localStorage.getItem("clinza_media_vault");
    if (cached) {
      setAssets(JSON.parse(cached));
    } else {
      const initial: MediaAsset[] = [
        { id: "ast-1", name: "Italian Linen Cream Cover", url: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", type: "image", size: "320 KB", createdAt: "2026-06-03", folder: "collections" },
        { id: "ast-2", name: "Classic Italian Linen Model Roll", url: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", type: "image", size: "280 KB", createdAt: "2026-06-04", folder: "homepage" },
        { id: "ast-3", name: "Indigo Selvedge Shuttle Loom Close", url: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", type: "image", size: "1.2 MB", createdAt: "2026-06-05", folder: "products" },
        { id: "ast-4", name: "Luxury Resort Wear Co-ord Shoot", url: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png", type: "image", size: "480 KB", createdAt: "2026-06-05", folder: "blogs" }
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
      createdAt: new Date().toISOString().slice(0, 10),
      folder: selectedFolder
    };

    const updated = [...assets, payload];
    saveToStore(updated);
    setNewUrl("");
    setNewName("");
    alert("Resource links recorded and synced to central repository!");
  };

  const handleUploadFile = async (file: File) => {
    if (!file) return;
    setUploading(true);

    try {
      const publicUrl = await uploadFileToSupabase("clinza-media", file, selectedFolder);
      
      const payload: MediaAsset = {
        id: `ast-${Date.now()}`,
        name: file.name,
        url: publicUrl,
        type: file.type.startsWith("video/") ? "video" : "image",
        size: `${Math.round(file.size / 1024)} KB`,
        createdAt: new Date().toISOString().slice(0, 10),
        folder: selectedFolder
      };

      const updated = [payload, ...assets];
      saveToStore(updated);
      alert(`Successfully uploaded "${file.name}" into folder "${selectedFolder}/"!`);
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message || "Ensure the 'clinza-media' bucket exists in your Supabase dashboard or check permissions."}`);
    } finally {
      setUploading(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this media URL reference from visual catalog index?")) {
      const updated = assets.filter(a => a.id !== id);
      saveToStore(updated);
    }
  };

  const filteredAssets = activeFilter === "all"
    ? assets
    : assets.filter(a => a.folder === activeFilter);

  return (
    <div id="media-library-console" className="space-y-6 text-left animate-fade-in text-xs font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Central Media & Banners Vault</h3>
          <p className="text-[11px] text-zinc-400">Add, upload or extract resource links for slider models, listings, and banners</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Direct Upload Panel */}
        <div className="lg:col-span-1 bg-zinc-50/70 border border-zinc-200 rounded-2xl p-4 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-600 font-mono">Supabase Storage Direct Uploader</h4>
          
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-zinc-500 uppercase">Target Library Folder</label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none bg-white font-semibold text-zinc-800 text-xs"
            >
              {folders.map(f => (
                <option key={f} value={f}>{`${f}/`}</option>
              ))}
            </select>
          </div>

          <div
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive ? "border-orange-500 bg-orange-50/40" : "border-zinc-200 hover:border-zinc-300 bg-white"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*"
            />
            {uploading ? (
              <div className="space-y-2 py-4">
                <Loader className="h-8 w-8 text-orange-500 animate-spin mx-auto" />
                <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-500">Uploading to Supabase...</span>
              </div>
            ) : (
              <div className="space-y-2 py-2 text-zinc-400">
                <Upload className="h-8 w-8 mx-auto text-zinc-300" />
                <p className="font-bold text-zinc-600">Drag & drop asset file</p>
                <p className="text-[9px]">or click to select files (Images / Videos)</p>
              </div>
            )}
          </div>
        </div>

        {/* Link / URL Registry Panel */}
        <div className="lg:col-span-2 bg-zinc-50/70 border border-zinc-200 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-600 font-mono">External URL Registry</h4>
            <p className="text-[11px] text-zinc-400">Instantly record and classify external Unsplash, CDN, or model photoshoot links.</p>
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Asset Reference Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sage Green Model"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Target Folder Classification</label>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full border rounded-lg p-2 focus:outline-none bg-white font-semibold text-zinc-800 text-xs"
                  >
                    {folders.map(f => (
                      <option key={f} value={f}>{`${f}/`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Raw File or Image URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-zinc-950 hover:bg-zinc-850 text-white font-sans text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Plus className="h-4 w-4" /> Link External Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Filter and Assets Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-[10px] font-black uppercase text-zinc-500 font-mono">Folder Filter:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono font-bold tracking-wider transition ${
                activeFilter === "all" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              All Assets
            </button>
            {folders.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono font-bold tracking-wider transition ${
                  activeFilter === f ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                {`${f}/`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of cards */}
        {filteredAssets.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 border rounded-2xl text-zinc-400 space-y-2">
            <FolderOpen className="h-10 w-10 mx-auto text-zinc-300" />
            <p className="font-bold">No assets found in folder "{activeFilter}/"</p>
            <p className="text-[10px]">Upload or link assets into this folder to populate your visual gallery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-zinc-700">
            {filteredAssets.map((ast) => (
              <div key={ast.id} className="bg-white border text-xs border-zinc-200 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xs">
                <div className="relative aspect-square bg-zinc-100 overflow-hidden border-b">
                  <span className="absolute top-2 left-2 z-10 text-[8px] uppercase font-mono bg-black/75 text-white px-2 py-0.5 rounded-full font-bold">
                    {`${ast.folder || "uploads"}/`}
                  </span>
                  {ast.type === "video" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-900">
                      <Film className="h-10 w-10 text-orange-500 animate-pulse" />
                      <span className="text-[9px] uppercase font-mono mt-2 font-bold select-none text-zinc-500">Demonstration Video</span>
                    </div>
                  ) : (
                    <img src={ast.url} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300" referrerPolicy="no-referrer" />
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
        )}
      </div>
    </div>
  );
}
