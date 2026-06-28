/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Edit, Trash2, ChevronLeft, Calendar, User, Eye, Bookmark, FileText } from "lucide-react";
import { BlogPost } from "../../types";
import MediaUploader from "./MediaUploader";

interface BlogsTabProps {
  blogList: BlogPost[];
  onSaveBlog: (blog: BlogPost) => void;
  onDeleteBlog: (slug: string) => void;
}

export default function BlogsTab({ blogList, onSaveBlog, onDeleteBlog }: BlogsTabProps) {
  const [editorMode, setEditorMode] = useState<"list" | "form">("list");
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    id: "",
    title: "",
    slug: "",
    summary: "",
    content: "",
    coverImage: "",
    category: "Styling",
    authorName: "Clinza Editorial Deck",
    authorBio: "Styling lead at Clinza Milan studio",
    readTime: "5 Mins Read",
    tagsStr: "Linen, Summer, Wardrobe",
    state: "Published" as "Draft" | "Published" | "Scheduled",
    scheduleDate: ""
  });

  const handleOpenForm = (blog: BlogPost | null) => {
    if (blog) {
      setEditingBlog(blog);
      setForm({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        summary: blog.summary || "",
        content: blog.content || "",
        coverImage: blog.coverImage || "",
        category: blog.category || "Styling",
        authorName: blog.author?.name || "Clinza Editorial Deck",
        authorBio: blog.author?.bio || "Styling lead at Clinza Milan studio",
        readTime: blog.readTime || "5 Mins Read",
        tagsStr: blog.tags?.join(", ") || "",
        state: (blog as any).state || "Published",
        scheduleDate: (blog as any).scheduleDate || ""
      });
    } else {
      setEditingBlog(null);
      setForm({
        id: `blog-${Date.now()}`,
        title: "",
        slug: "",
        summary: "",
        content: "",
        coverImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
        category: "Styling",
        authorName: "Clinza Editorial Deck",
        authorBio: "Styling lead at Clinza Milan studio",
        readTime: "5 Mins Read",
        tagsStr: "Linen, Styling, Resort",
        state: "Published",
        scheduleDate: ""
      });
    }
    setEditorMode("form");
  };

  const handleTitleSync = (val: string) => {
    if (!editingBlog) {
      const slug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setForm(f => ({ ...f, title: val, slug }));
    } else {
      setForm(f => ({ ...f, title: val }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) {
      alert("Title and URL Slug are required!");
      return;
    }

    const tagsArr = form.tagsStr.split(",").map(t => t.trim()).filter(Boolean);

    // Auto Schema generator (Article breadcrumb schema)
    const articleLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": form.title,
      "image": form.coverImage,
      "datePublished": editingBlog ? editingBlog.publishedAt : new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": form.authorName
      },
      "publisher": {
        "@type": "Organization",
        "name": "CLINZA India"
      },
      "description": form.summary || form.content?.slice(0, 150)
    }, null, 2);

    const completeBlog: BlogPost = {
      id: form.id,
      title: form.title.trim(),
      slug: form.slug.trim(),
      summary: form.summary.trim() || form.content.slice(0, 140) + "...",
      content: form.content.trim(),
      coverImage: form.coverImage.trim() || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
      category: form.category.trim(),
      publishedAt: editingBlog ? editingBlog.publishedAt : new Date().toISOString(),
      author: {
        name: form.authorName.trim(),
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
        bio: form.authorBio.trim()
      },
      tags: tagsArr,
      readTime: form.readTime.trim(),
      // Injected CMS fields
      ...({
        state: form.state,
        scheduleDate: form.scheduleDate,
        articleSchema: articleLd
      } as any)
    };

    onSaveBlog(completeBlog);
    setEditorMode("list");
    setEditingBlog(null);
    alert(`Blog Editorial committed: "${form.title}" saved successfully!`);
  };

  const filteredBlog = blogList.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="blog-editorial-cms" className="space-y-6 text-left animate-fade-in">
      {editorMode === "list" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Editorial Blog CMS</h3>
              <p className="text-[11px] text-zinc-400 font-sans">Shopify-like article publisher and content coordinator</p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="bg-zinc-900 hover:bg-zinc-850 text-white font-sans text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Assemble Article
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBlog.map((b) => {
              const textState = (b as any).state || "Published";
              return (
                <div key={b.id} className="bg-white border text-xs border-zinc-200 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xs">
                  <div>
                    <img src={b.coverImage} alt="" className="w-full h-44 object-cover group-hover:scale-101 transition-all duration-300" />
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="bg-zinc-100 text-zinc-650 px-2.5 py-0.5 rounded-full font-bold uppercase">{b.category}</span>
                        <span className={`font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          textState === "Published" ? "bg-green-100 text-green-700" : (textState === "Scheduled" ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700")
                        }`}>{textState}</span>
                      </div>
                      <h4 className="text-lg font-bold font-serif text-zinc-950 pt-1 leading-tight">{b.title}</h4>
                      <p className="text-[11.5px] text-zinc-500 leading-relaxed font-sans">{b.summary}</p>
                    </div>
                  </div>

                  <div className="p-5 bg-zinc-50 border-t flex justify-between items-center text-[10px] font-mono text-zinc-450 font-semibold">
                    <span>By: {b.author?.name} • {b.readTime || "4 Mins"}</span>
                    <div className="space-x-1 flex items-center shrink-0">
                      <button
                        onClick={() => handleOpenForm(b)}
                        className="p-1.5 text-blue-600 hover:bg-white rounded border border-transparent hover:border-zinc-200 cursor-pointer inline-block"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this blog article permanently?")) {
                            onDeleteBlog(b.slug);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-white rounded border border-transparent hover:border-zinc-200 cursor-pointer inline-block"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <button
              type="button"
              onClick={() => setEditorMode("list")}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 uppercase cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Cancel Back
            </button>
            <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-500 px-3 py-1 font-bold">Editorial Sheet</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Article Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleSync(e.target.value)}
                className="w-full border rounded-lg p-2.5 font-semibold focus:outline-none focus:border-orange-500 bg-white"
                placeholder="e.g. Linen resort resort coordinates"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">URL slug PathID</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g,"-") })}
                className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white"
                placeholder="e.g. linen-styling-guide"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Cover Image Banner URL</label>
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                className="w-full border rounded-lg p-2.5 font-mono focus:outline-none focus:border-orange-500 bg-white"
              />
              <MediaUploader
                bucketName="blogs"
                onUploadSuccess={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
                label="Upload Cover Image"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Read Time Estimate</label>
              <input
                type="text"
                value={form.readTime}
                onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Article Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white font-bold"
              >
                <option value="Styling">Styling Guide</option>
                <option value="Summer Resourcing">Summer Resourcing</option>
                <option value="Fabric Science">Fabric Science</option>
                <option value="Industry News">Industry News</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Publication State</label>
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value as any })}
                className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
              >
                <option value="Published">Published Live</option>
                <option value="Draft">Draft Outline</option>
                <option value="Scheduled">Scheduled Queue</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Scheduled Date & Time (Optional)</label>
              <input
                type="datetime-local"
                disabled={form.state !== "Scheduled"}
                value={form.scheduleDate}
                onChange={(e) => setForm({ ...form, scheduleDate: e.target.value })}
                className="w-full border rounded-lg p-2 focus:outline-none bg-white font-mono"
              />
            </div>
          </div>

          <div className="text-xs font-sans">
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Featured Snippet Summary</label>
            <input
              type="text"
              required
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full border rounded-lg p-2.5 focus:outline-none focus:border-orange-500 bg-white"
              placeholder="Keep under 150 characters for dynamic meta tags rendering..."
            />
          </div>

          <div className="text-xs font-sans">
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Full Article content (Supports Markdown or HTML)</label>
            <textarea
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border rounded-lg p-3 font-mono text-[11px] focus:outline-none focus:border-orange-500 bg-white"
              placeholder="Formulate fashion paragraphs here..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow cursor-pointer text-center"
          >
            Committed Article to Journal
          </button>
        </form>
      )}
    </div>
  );
}
