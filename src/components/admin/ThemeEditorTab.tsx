/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Palette, 
  Type, 
  Megaphone, 
  LayoutTemplate, 
  ListCollapse, 
  Check, 
  RotateCcw, 
  UploadCloud, 
  Eye, 
  Smartphone, 
  Laptop, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  ShieldCheck, 
  HelpCircle, 
  Info,
  Navigation,
  Image,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Award
} from "lucide-react";
import { ThemeConfig, ThemeSlide, Product, BlogPost, Order } from "../../types";
import { getThemeConfig, saveThemeConfig, publishThemeConfig, rollbackThemeConfig, DEFAULT_THEME_CONFIG } from "../../utils";
import MediaUploader from "./MediaUploader";

interface ThemeEditorTabProps {
  productList: Product[];
  blogList: BlogPost[];
  orderList: Order[];
}

export default function ThemeEditorTab({ productList, blogList, orderList }: ThemeEditorTabProps) {
  // 1. Core States
  const [draftConfig, setDraftConfig] = useState<ThemeConfig>(() => getThemeConfig(true));
  const [activeSection, setActiveSection] = useState<string>("colors");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number>(0);

  // Auto clear status message after a few seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Helper safe nested updater
  const updateDraft = (updater: (prev: ThemeConfig) => ThemeConfig) => {
    setDraftConfig(prev => {
      const updated = updater(prev);
      // Soft-save to local and cloud Draft storage instantly (Draft Auto-Save behavior)
      saveThemeConfig(updated, true);
      return updated;
    });
  };

  // 2. Action Handlers
  const handleSaveDraft = async () => {
    setIsSyncing(true);
    setStatusMessage({ type: "info", text: "Encrypting draft configurations and backing up to cloud..." });
    try {
      saveThemeConfig(draftConfig, true);
      setStatusMessage({ type: "success", text: "Draft changes safely saved to Supabase configurations! Share this workspace URL to preview." });
    } catch (e) {
      setStatusMessage({ type: "error", text: "Failed to sync draft changes with database levels." });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to promote your current draft to the live CLINZA storefront? A backup of the previous active theme will be created automatically.")) {
      return;
    }
    setIsSyncing(true);
    setStatusMessage({ type: "info", text: "Backing up active configuration and pushing theme draft live..." });
    try {
      await publishThemeConfig(draftConfig);
      // Trigger update on published storage so visitors see the changes instantly
      setStatusMessage({ type: "success", text: "Congratulations! Theme has been published live. Standard users will now experience the updated styling." });
    } catch (e) {
      setStatusMessage({ type: "error", text: "Failed to publish theme configurations." });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRollback = async () => {
    if (!confirm("Acknowledge reverting all live and draft customizer configurations to the last published cloud backup?")) {
      return;
    }
    setIsSyncing(true);
    setStatusMessage({ type: "info", text: "Retrieving secure remote backup settings..." });
    try {
      const restored = await rollbackThemeConfig();
      if (restored) {
        setDraftConfig(restored);
        setStatusMessage({ type: "success", text: "Successfully restored last published Theme configuration! Reloading variables..." });
      } else {
        setStatusMessage({ type: "error", text: "No published backup configuration was found. Create a backup first by publishing live edits." });
      }
    } catch (e) {
      setStatusMessage({ type: "error", text: "Failed to perform database rollback transaction." });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm("Reset current Customizer workspace to system default clothing template values? You will lose unsaved draft changes.")) {
      setDraftConfig(DEFAULT_THEME_CONFIG);
      saveThemeConfig(DEFAULT_THEME_CONFIG, true);
      setStatusMessage({ type: "success", text: "Workspace reverted locally. Press Save Draft or Publish to overwrite the cloud state." });
    }
  };

  // 3. Dynamic Slide Helpers
  const addSlide = () => {
    updateDraft(prev => {
      const newSlide: ThemeSlide = {
        id: `slide-${Date.now()}`,
        desktopImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600",
        mobileImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=640",
        badge: "NEW COORT",
        subtitle: "Loom Engineered Silk",
        title: "SARTORIAL ENCOUNTERS",
        description: "Pre-treated to prevent crease flaws.",
        button1Text: "Browse Collection",
        button1Link: "collections/shirts",
        button2Text: "Curated Styling",
        button2Link: "blog",
        bgOverlay: 45,
        textPosition: "left",
        textColor: "#ffffff",
        enabled: true
      };
      const nextSlides = [...prev.slides, newSlide];
      setSelectedSlideIdx(nextSlides.length - 1);
      return { ...prev, slides: nextSlides };
    });
  };

  const removeSlide = (idx: number) => {
    if (draftConfig.slides.length <= 1) {
      alert("At least one hero slide is required to prevent rendering crash!");
      return;
    }
    updateDraft(prev => {
      const nextSlides = prev.slides.filter((_, i) => i !== idx);
      setSelectedSlideIdx(0);
      return { ...prev, slides: nextSlides };
    });
  };

  const updateSlideField = (index: number, field: keyof ThemeSlide, value: any) => {
    updateDraft(prev => {
      const nextSlides = prev.slides.map((slide, i) => {
        if (i === index) {
          return { ...slide, [field]: value };
        }
        return slide;
      });
      return { ...prev, slides: nextSlides };
    });
  };

  return (
    <div className="space-y-6 text-left animate-fade-in text-xs font-sans">
      
      {/* 1. Editor Control Dashboard Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase text-orange-500 tracking-wider font-extrabold">Shopify Visual Style Engine</span>
          </div>
          <h2 className="text-sm font-black text-white font-serif uppercase tracking-wider">Theme Customizer Dashboard</h2>
        </div>

        {/* Sync, Save, Publish Status items */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className="px-3.5 py-2 text-[10px] font-mono tracking-wider text-zinc-400 hover:text-white border border-zinc-700/50 hover:border-zinc-500 rounded-xl transition cursor-pointer font-bold uppercase"
            title="Reset sandbox layout models to factory settings"
          >
            Reset Default
          </button>
          
          <button
            onClick={handleRollback}
            disabled={isSyncing}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-mono text-[10px] uppercase font-bold tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
            title="Rollback core models to the last published cloud snapshot"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Rollback
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSyncing}
            className="bg-orange-600/15 text-orange-400 hover:bg-orange-600 hover:text-white border border-orange-500/20 font-mono text-[10px] uppercase font-bold tracking-wider py-2 py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
          >
            <UploadCloud className="h-3.5 w-3.5" /> Save Draft
          </button>

          <button
            onClick={handlePublish}
            disabled={isSyncing}
            className="bg-emerald-600 text-white hover:bg-emerald-500 font-mono text-[10px] uppercase font-bold tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
          >
            <Check className="h-3.5 w-3.5" /> Publish Live
          </button>
        </div>
      </div>

      {/* Top status notification toast */}
      {statusMessage && (
        <div className={`p-3.5 rounded-xl flex items-start gap-2.5 font-sans text-[11px] border ${
          statusMessage.type === "success" 
            ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/25" 
            : statusMessage.type === "error"
            ? "bg-red-950/20 text-red-400 border-red-500/25"
            : "bg-blue-950/20 text-blue-400 border-blue-500/25"
        }`}>
          <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div>{statusMessage.text}</div>
        </div>
      )}

      {/* 2. Visual Split screen layout (Left: Controls, Right: Visual preview panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column Controls (4 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Section Selector Grid tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
            {[
              { id: "colors", label: "Colors Palette", icon: Palette },
              { id: "typography", label: "Fonts Layout", icon: Type },
              { id: "announcement", label: "Announce Bar", icon: Megaphone },
              { id: "slideshow", label: "Slideshow", icon: Image },
              { id: "header-footer", label: "Header & Footer", icon: Navigation },
              { id: "homepage-modules", label: "Home Shelves", icon: LayoutTemplate },
              { id: "policies", label: "Legal Policies", icon: ShieldCheck }
            ].map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`py-2 px-2.5 rounded-lg flex flex-col items-center justify-center text-center gap-1.5 transition cursor-pointer border ${
                  activeSection === sec.id 
                    ? "bg-zinc-800 text-white border-zinc-700/85 font-bold" 
                    : "text-zinc-400 border-transparent hover:text-white"
                }`}
              >
                <sec.icon className="h-4 w-4 text-orange-500" />
                <span className="text-[9px] uppercase tracking-wider">{sec.label}</span>
              </button>
            ))}
          </div>

          {/* ACTIVE SETTINGS CONTROL FORMS PANEL */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5 text-zinc-300">
            
            {/* COLORS SETTINGS SECTION */}
            {activeSection === "colors" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-800 pb-2 mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Global Colors Customizer</h3>
                  <p className="text-[10px] text-zinc-500">Pick signature tones to apply across checkout, widgets, lists, and buttons.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Brand Primary</label>
                    <div className="flex gap-2 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <input
                        type="color"
                        value={draftConfig.colors.primary}
                        onChange={(e) => updateDraft(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors, primary: e.target.value } 
                        }))}
                        className="h-6 w-8 border-none cursor-pointer p-0 bg-transparent"
                      />
                      <span className="font-mono text-[10px] font-bold text-white uppercase">{draftConfig.colors.primary}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Slate Secondary</label>
                    <div className="flex gap-2 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <input
                        type="color"
                        value={draftConfig.colors.secondary}
                        onChange={(e) => updateDraft(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors, secondary: e.target.value } 
                        }))}
                        className="h-6 w-8 border-none cursor-pointer p-0 bg-transparent"
                      />
                      <span className="font-mono text-[10px] font-bold text-white uppercase">{draftConfig.colors.secondary}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Highlight Accent</label>
                    <div className="flex gap-2 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <input
                        type="color"
                        value={draftConfig.colors.accent}
                        onChange={(e) => updateDraft(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors, accent: e.target.value } 
                        }))}
                        className="h-6 w-8 border-none cursor-pointer p-0 bg-transparent"
                      />
                      <span className="font-mono text-[10px] font-bold text-white uppercase">{draftConfig.colors.accent}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Buttons & Widgets</label>
                    <div className="flex gap-2 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <input
                        type="color"
                        value={draftConfig.colors.button}
                        onChange={(e) => updateDraft(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors, button: e.target.value } 
                        }))}
                        className="h-6 w-8 border-none cursor-pointer p-0 bg-transparent"
                      />
                      <span className="font-mono text-[10px] font-bold text-white uppercase">{draftConfig.colors.button}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Header Background</label>
                    <div className="flex gap-2 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <input
                        type="color"
                        value={draftConfig.colors.headerBg}
                        onChange={(e) => updateDraft(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors, headerBg: e.target.value } 
                        }))}
                        className="h-6 w-8 border-none cursor-pointer p-0 bg-transparent"
                      />
                      <span className="font-mono text-[10px] font-bold text-white uppercase">{draftConfig.colors.headerBg}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Footer Background</label>
                    <div className="flex gap-2 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <input
                        type="color"
                        value={draftConfig.colors.footerBg}
                        onChange={(e) => updateDraft(prev => ({ 
                          ...prev, 
                          colors: { ...prev.colors, footerBg: e.target.value } 
                        }))}
                        className="h-6 w-8 border-none cursor-pointer p-0 bg-transparent"
                      />
                      <span className="font-mono text-[10px] font-bold text-white uppercase">{draftConfig.colors.footerBg}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-600/10 rounded-xl text-[10px] border border-orange-500/15">
                  <span className="font-bold text-orange-400 block mb-0.5">💡 DESIGN PAIRING RULE</span>
                  We recommend matching Header background to white (`#ffffff`) and block buttons to CLINZA signature orange (`#f27d26`) for an elite, high-fashion presentation.
                </div>
              </div>
            )}

            {/* TYPOGRAPHY SETTINGS SECTION */}
            {activeSection === "typography" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-800 pb-2 mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Typography Font Selection</h3>
                  <p className="text-[10px] text-zinc-500">Pick paired typefaces to style titles, specifications, and articles.</p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Display Headings Font</label>
                    <select
                      value={draftConfig.typography.headingFont}
                      onChange={(e) => updateDraft(prev => ({ 
                        ...prev, 
                        typography: { ...prev.typography, headingFont: e.target.value } 
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-500 text-white font-bold"
                    >
                      <option value="Playfair Display">Playfair Display (Classy Italian Serif)</option>
                      <option value="Inter">Inter (Swiss Modern Sans-serif)</option>
                      <option value="JetBrains Mono">JetBrains Mono (Contemporary Technical)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Body Text Font</label>
                    <select
                      value={draftConfig.typography.bodyFont}
                      onChange={(e) => updateDraft(prev => ({ 
                        ...prev, 
                        typography: { ...prev.typography, bodyFont: e.target.value } 
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-500 text-white"
                    >
                      <option value="Inter">Inter (Swiss Modern Sans-serif)</option>
                      <option value="Playfair Display">Playfair Display (Classy Italian Serif)</option>
                      <option value="JetBrains Mono">JetBrains Mono (Contemporary Technical)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Title Weight Expression</label>
                    <select
                      value={draftConfig.typography.headingWeight}
                      onChange={(e) => updateDraft(prev => ({ 
                        ...prev, 
                        typography: { ...prev.typography, headingWeight: e.target.value } 
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-500 text-white font-mono"
                    >
                      <option value="font-black">Super Heavy Bold (font-black)</option>
                      <option value="font-bold">Standard Bold (font-bold)</option>
                      <option value="font-medium">Sartorial Medium (font-medium)</option>
                      <option value="font-light italic">European Light Italic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">General Body Sizing</label>
                    <select
                      value={draftConfig.typography.bodySize}
                      onChange={(e) => updateDraft(prev => ({ 
                        ...prev, 
                        typography: { ...prev.typography, bodySize: e.target.value } 
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-500 text-white font-mono"
                    >
                      <option value="text-sm">Standard (text-sm)</option>
                      <option value="text-xs">Compact (text-xs)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ANNOUNCEMENT BAR SECTION */}
            {activeSection === "announcement" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-800 pb-2 mb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Store Announcement Marquee</h3>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={draftConfig.announcement.enabled}
                        onChange={(e) => updateDraft(prev => ({ 
                          ...prev, 
                          announcement: { ...prev.announcement, enabled: e.target.checked } 
                        }))}
                        className="cursor-pointer"
                        id="ann-enabled"
                      />
                      <label htmlFor="ann-enabled" className="text-[10px] font-bold text-zinc-400 uppercase select-none cursor-pointer">Show</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Marquee Broadcast Text</label>
                    <textarea
                      rows={3}
                      value={draftConfig.announcement.text}
                      onChange={(e) => updateDraft(prev => ({ 
                        ...prev, 
                        announcement: { ...prev.announcement, text: e.target.value } 
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 focus:outline-none focus:border-zinc-500 text-white text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Marquee Link Route (Click action)</label>
                    <input
                      type="text"
                      value={draftConfig.announcement.link}
                      onChange={(e) => updateDraft(prev => ({ 
                        ...prev, 
                        announcement: { ...prev.announcement, link: e.target.value } 
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-[10px] font-mono focus:outline-none focus:border-zinc-500 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Background Color</label>
                      <div className="flex gap-1.5 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                        <input
                          type="color"
                          value={draftConfig.announcement.bgColor}
                          onChange={(e) => updateDraft(prev => ({ 
                            ...prev, 
                            announcement: { ...prev.announcement, bgColor: e.target.value } 
                          }))}
                          className="h-5 w-6 border-none cursor-pointer p-0 bg-transparent"
                        />
                        <span className="font-mono text-[9px] text-white uppercase">{draftConfig.announcement.bgColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Text Color</label>
                      <div className="flex gap-1.5 items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                        <input
                          type="color"
                          value={draftConfig.announcement.textColor}
                          onChange={(e) => updateDraft(prev => ({ 
                            ...prev, 
                            announcement: { ...prev.announcement, textColor: e.target.value } 
                          }))}
                          className="h-5 w-6 border-none cursor-pointer p-0 bg-transparent"
                        />
                        <span className="font-mono text-[9px] text-white uppercase">{draftConfig.announcement.textColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC HERO SLIDESHOW SECTION */}
            {activeSection === "slideshow" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-800 pb-2 mb-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Hero Slider CMS</h3>
                    <p className="text-[9px] text-zinc-500">Edit headings, CTA covers, buttons, links, and banners.</p>
                  </div>
                  <button
                    onClick={addSlide}
                    className="p-1 px-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="h-3 w-3" /> Insert Slide
                  </button>
                </div>

                {/* Slides selector tab row */}
                <div className="flex flex-wrap gap-1 border-b border-zinc-800 pb-2">
                  {draftConfig.slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSlideIdx(i)}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider ${
                        selectedSlideIdx === i 
                          ? "bg-orange-600 text-white" 
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      Slide #{i + 1}
                    </button>
                  ))}
                </div>

                {/* Select active slide metadata */}
                {draftConfig.slides[selectedSlideIdx] && (
                  <div className="space-y-3.5 bg-zinc-950 p-3.5 rounded-xl border border-zinc-850/50">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] text-zinc-400 uppercase font-bold text-orange-500">Slide #{selectedSlideIdx + 1} Parameters</span>
                      <button
                        onClick={() => removeSlide(selectedSlideIdx)}
                        className="text-red-500 hover:text-red-400 flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                        title="Delete this hero frame"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={draftConfig.slides[selectedSlideIdx].badge}
                          onChange={(e) => updateSlideField(selectedSlideIdx, "badge", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 text-white font-semibold"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Headline Subtitle</label>
                        <input
                          type="text"
                          value={draftConfig.slides[selectedSlideIdx].subtitle}
                          onChange={(e) => updateSlideField(selectedSlideIdx, "subtitle", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Spread Display Headline Title</label>
                      <input
                        type="text"
                        value={draftConfig.slides[selectedSlideIdx].title}
                        onChange={(e) => updateSlideField(selectedSlideIdx, "title", e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Slide Body description</label>
                      <input
                        type="text"
                        value={draftConfig.slides[selectedSlideIdx].description}
                        onChange={(e) => updateSlideField(selectedSlideIdx, "description", e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Desktop Background Image (1600x800)</label>
                      <input
                        type="text"
                        value={draftConfig.slides[selectedSlideIdx].desktopImage}
                        onChange={(e) => updateSlideField(selectedSlideIdx, "desktopImage", e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-[9px] font-mono text-zinc-300 animate-none"
                      />
                      <div className="mt-1 bg-zinc-800/50 p-1.5 rounded-lg border border-zinc-800">
                        <MediaUploader
                          bucketName="sliders"
                          onUploadSuccess={(url) => updateSlideField(selectedSlideIdx, "desktopImage", url)}
                          label="Upload Desktop Image"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Responsive Mobile Image (640x960)</label>
                      <input
                        type="text"
                        value={draftConfig.slides[selectedSlideIdx].mobileImage}
                        onChange={(e) => updateSlideField(selectedSlideIdx, "mobileImage", e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-[9px] font-mono text-zinc-300 animate-none"
                      />
                      <div className="mt-1 bg-zinc-800/50 p-1.5 rounded-lg border border-zinc-800">
                        <MediaUploader
                          bucketName="sliders"
                          onUploadSuccess={(url) => updateSlideField(selectedSlideIdx, "mobileImage", url)}
                          label="Upload Mobile Image"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Button #1 Text</label>
                        <input
                          type="text"
                          value={draftConfig.slides[selectedSlideIdx].button1Text}
                          onChange={(e) => updateSlideField(selectedSlideIdx, "button1Text", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Button #1 Route</label>
                        <input
                          type="text"
                          value={draftConfig.slides[selectedSlideIdx].button1Link}
                          onChange={(e) => updateSlideField(selectedSlideIdx, "button1Link", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-[10px] font-mono text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Overlay %</label>
                        <input
                          type="number"
                          min={0}
                          max={90}
                          value={draftConfig.slides[selectedSlideIdx].bgOverlay}
                          onChange={(e) => updateSlideField(selectedSlideIdx, "bgOverlay", parseInt(e.target.value) || 0)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Text Align</label>
                        <select
                          value={draftConfig.slides[selectedSlideIdx].textPosition}
                          onChange={(e) => updateSlideField(selectedSlideIdx, "textPosition", e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-white"
                        >
                          <option value="left">Left align</option>
                          <option value="center">Center align</option>
                          <option value="right">Right align</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Text Color</label>
                        <div className="flex gap-1.5 items-center bg-zinc-900 p-1 px-1.5 rounded border border-zinc-800">
                          <input
                            type="color"
                            value={draftConfig.slides[selectedSlideIdx].textColor || "#ffffff"}
                            onChange={(e) => updateSlideField(selectedSlideIdx, "textColor", e.target.value)}
                            className="h-5 w-5 border-none cursor-pointer p-0 bg-transparent"
                          />
                          <span className="font-mono text-[9px] text-white uppercase">{draftConfig.slides[selectedSlideIdx].textColor || "#FFFFFF"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HEADER & FOOTER SETTINGS SECTION */}
            {activeSection === "header-footer" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-800 pb-2 mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Header & Footer Parameters</h3>
                </div>

                <div className="space-y-4">
                  {/* Branding logo */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Logo Cover Image Link (leave empty for typography logo)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://clinza.in/logo.png"
                      value={draftConfig.header.logoUrl}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        header: { ...prev.header, logoUrl: e.target.value }
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 font-mono text-[10px] text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                    <span className="col-span-2 text-[9px] font-bold uppercase tracking-wider text-zinc-500 pb-1">Helpline details</span>
                    
                    <div>
                      <label className="block text-[8px] font-mono text-zinc-400">Concierge Email</label>
                      <input
                        type="email"
                        value={draftConfig.footer.email}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          footer: { ...prev.footer, email: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[10px] text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono text-zinc-400">Helpline Phone/Mobile</label>
                      <input
                        type="text"
                        value={draftConfig.footer.phone}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          footer: { ...prev.footer, phone: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[10px] text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Mumbai Corporate HQ Address</label>
                    <input
                      type="text"
                      value={draftConfig.footer.address}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        footer: { ...prev.footer, address: e.target.value }
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Company Description Sentence</label>
                    <textarea
                      rows={3}
                      value={draftConfig.footer.companyInfo}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        footer: { ...prev.footer, companyInfo: e.target.value }
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HOMEPAGE MODULES CONFIG */}
            {activeSection === "homepage-modules" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-800 pb-2 mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Homepage Shelves</h3>
                  <p className="text-[10px] text-zinc-500">Enable or rename collections displays and testimonial shelves.</p>
                </div>

                <div className="space-y-4">
                  {/* Departments Section */}
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white uppercase font-mono">1. Clinza Departments Grid</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.featuredCollections.enabled}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          featuredCollections: { ...prev.featuredCollections, enabled: e.target.checked }
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[8px] uppercase font-mono text-zinc-400 mb-0.5">Section Title</label>
                      <input
                        type="text"
                        value={draftConfig.featuredCollections.title}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          featuredCollections: { ...prev.featuredCollections, title: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] uppercase font-mono text-zinc-400 mb-0.5">Section Description</label>
                      <input
                        type="text"
                        value={draftConfig.featuredCollections.description}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          featuredCollections: { ...prev.featuredCollections, description: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-[11px] text-zinc-300"
                      />
                    </div>
                  </div>

                  {/* Trending products shelf */}
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white uppercase font-mono">2. Trending Products Shelf</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.trendingProducts.enabled}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          trendingProducts: { ...prev.trendingProducts, enabled: e.target.checked }
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] uppercase font-mono text-zinc-400 mb-0.5">Trending Title</label>
                      <input
                        type="text"
                        value={draftConfig.trendingProducts.title}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          trendingProducts: { ...prev.trendingProducts, title: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Editor Newsletter block */}
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white uppercase font-mono">3. Newsletter editorial list</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.newsletter.enabled}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          newsletter: { ...prev.newsletter, enabled: e.target.checked }
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] uppercase font-mono text-zinc-400 mb-0.5">Newsletter Title</label>
                      <input
                        type="text"
                        value={draftConfig.newsletter.heading}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          newsletter: { ...prev.newsletter, heading: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] uppercase font-mono text-zinc-400 mb-0.5">Newsletter greeting summary</label>
                      <input
                        type="text"
                        value={draftConfig.newsletter.description}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          newsletter: { ...prev.newsletter, description: e.target.value }
                        }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LEGAL POLICY TEXTS CMS SECTION */}
            {activeSection === "policies" && (
              <div className="space-y-4">
                <div className="border-b border-zinc-800 pb-2 mb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Legal Policies CMS</h3>
                  <p className="text-[10px] text-zinc-500">Provide authentic terms of service, returns constraints, other guidelines.</p>
                </div>

                <div className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Privacy Terms Policy</label>
                    <textarea
                      rows={3}
                      value={draftConfig.policies.privacy}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        policies: { ...prev.policies, privacy: e.target.value }
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">General Return Rules</label>
                    <textarea
                      rows={3}
                      value={draftConfig.policies.returnPolicy}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        policies: { ...prev.policies, returnPolicy: e.target.value }
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Cash on Delivery Refund Terms</label>
                    <textarea
                      rows={3}
                      value={draftConfig.policies.refundPolicy}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        policies: { ...prev.policies, refundPolicy: e.target.value }
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Metropolitan Transit Logistics Parameters</label>
                    <textarea
                      rows={3}
                      value={draftConfig.policies.shippingPolicy}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        policies: { ...prev.policies, shippingPolicy: e.target.value }
                      }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Preview Column (7 columns - LIVE STOREFRONT ACCURATE SIMULATOR!) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Header controls for the simulator */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-zinc-800 rounded-lg font-mono text-[9px] font-extrabold tracking-widest text-emerald-400 select-none">
                LIVE PREVIEW DRAFT ACTIVE
              </span>
            </div>

            <div className="flex gap-1 bg-zinc-950 border border-zinc-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("desktop")}
                className={`p-1.5 rounded cursor-pointer ${
                  viewMode === "desktop" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Desktop View Mode"
              >
                <Laptop className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`p-1.5 rounded cursor-pointer ${
                  viewMode === "mobile" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Mobile View Mode"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* REAL PREVIEW SCREEN STAGE CONTAINERS */}
          <div className="flex justify-center transition-all duration-300">
            <div className={`bg-white text-zinc-900 border border-zinc-200 shadow-2xl transition-all duration-300 text-left overflow-y-auto max-h-[750px] ${
              viewMode === "mobile" 
                ? "w-[360px] rounded-3xl min-h-[640px]" 
                : "w-full rounded-2xl min-h-[500px]"
            }`} style={{
              fontFamily: draftConfig.typography.bodyFont === "Playfair Display" ? "'Playfair Display', Georgia, serif" : "sans-serif"
            }}>

              {/* SIMULATOR CORE CONTAINER */}
              <div className="w-full">
                
                {/* 1. Announcement Bar */}
                {draftConfig.announcement.enabled && (
                  <div 
                    className="py-2.5 px-4 text-center text-[10px] font-bold tracking-widest uppercase transition-all duration-300 font-mono"
                    style={{
                      backgroundColor: draftConfig.announcement.bgColor,
                      color: draftConfig.announcement.textColor
                    }}
                  >
                    {draftConfig.announcement.text}
                  </div>
                )}

                {/* 2. Top Header Navbar */}
                <header className="border-b transition-all border-zinc-200/80" style={{
                  backgroundColor: draftConfig.colors.headerBg
                }}>
                  <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    {/* Brand Logo typography */}
                    <span 
                      className={`text-sm uppercase tracking-[0.25em] font-serif transition-all`}
                      style={{
                        color: draftConfig.colors.primary,
                        fontFamily: draftConfig.typography.headingFont === "Playfair Display" ? "'Playfair Display', Georgia, serif" : "sans-serif",
                        fontWeight: draftConfig.typography.headingWeight.includes("black") ? 900 : 700
                      }}
                    >
                      {draftConfig.header.logoUrl ? (
                        <img src={draftConfig.header.logoUrl} className="h-4 w-auto self-center" alt="Clinza" />
                      ) : "CLINZA"}
                    </span>

                    {/* Desktop menu mock */}
                    {viewMode === "desktop" && (
                      <nav className="flex items-center gap-5 text-[9px] uppercase tracking-widest font-black text-zinc-600">
                        {draftConfig.header.menuItems.slice(0, 5).map((item, id) => (
                          <span key={id} className="hover:text-zinc-950 transition cursor-pointer">{item.label}</span>
                        ))}
                      </nav>
                    )}

                    {/* Helper icons mock */}
                    <div className="flex items-center gap-3 text-zinc-700">
                      <ShoppingBag className="h-4 w-4 shrink-0" style={{ color: draftConfig.colors.primary }} />
                      <span className="text-[10px] bg-zinc-900 border text-white h-4.5 w-4.5 rounded-full flex items-center justify-center font-bold">2</span>
                    </div>
                  </div>
                </header>

                {/* 3. Slider frame */}
                {draftConfig.slides[selectedSlideIdx] && (
                  <div className="relative w-full overflow-hidden transition-all duration-300" style={{
                    height: viewMode === "mobile" ? "320px" : "420px"
                  }}>
                    {/* Slide Cover Background */}
                    <img 
                      src={viewMode === "mobile" ? draftConfig.slides[selectedSlideIdx].mobileImage : draftConfig.slides[selectedSlideIdx].desktopImage} 
                      alt="" 
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    
                    {/* Dim Overlay */}
                    <div 
                      className="absolute inset-0 bg-black"
                      style={{ opacity: `${draftConfig.slides[selectedSlideIdx].bgOverlay / 100}` }}
                    ></div>

                    {/* Text Container */}
                    <div className="absolute inset-0 z-10 p-6 sm:p-12 flex flex-col justify-center text-white">
                      <div className={`max-w-md ${
                        draftConfig.slides[selectedSlideIdx].textPosition === "center" 
                          ? "mx-auto text-center" 
                          : draftConfig.slides[selectedSlideIdx].textPosition === "right"
                          ? "ml-auto text-right"
                          : "text-left"
                      }`}>
                        <span className="inline-block px-2.5 py-0.5 bg-orange-600 text-white font-mono text-[8px] font-bold tracking-widest uppercase rounded-sm mb-2.5">
                          {draftConfig.slides[selectedSlideIdx].badge}
                        </span>
                        
                        <h4 className="text-[10px] font-bold tracking-widest uppercase opacity-85 block mb-1">
                          {draftConfig.slides[selectedSlideIdx].subtitle}
                        </h4>
                        
                        <h3 
                          className="text-lg sm:text-2xl tracking-normal uppercase block leading-tight mb-2"
                          style={{
                            fontFamily: draftConfig.typography.headingFont === "Playfair Display" ? "'Playfair Display', serif" : "sans-serif",
                            fontWeight: 900
                          }}
                        >
                          {draftConfig.slides[selectedSlideIdx].title || "CUBAN LINEN CUTS"}
                        </h3>

                        <p className="text-[10px] text-zinc-200 line-clamp-2 block font-sans mb-4">
                          {draftConfig.slides[selectedSlideIdx].description}
                        </p>

                        <div className="flex gap-2 items-center justify-start pointer-events-none">
                          <span 
                            className="inline-block px-4 py-2 text-[8px] font-black uppercase text-center font-mono tracking-widest transition-all rounded shadow"
                            style={{ 
                              backgroundColor: draftConfig.colors.button,
                              color: "#ffffff"
                            }}
                          >
                            {draftConfig.slides[selectedSlideIdx].button1Text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Slider Pills bottom */}
                    <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-1.5">
                      {draftConfig.slides.map((_, i) => (
                        <span key={i} className={`h-1.5 rounded-full ${selectedSlideIdx === i ? "w-4 bg-orange-500" : "w-1.5 bg-white/50"}`}></span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Departments Grid */}
                {draftConfig.featuredCollections.enabled && (
                  <section className="py-8 px-4 bg-zinc-50 border-b">
                    <div className="text-center max-w-lg mx-auto mb-6">
                      <h3 className="text-sm font-bold uppercase tracking-wider font-serif mb-1" style={{ color: draftConfig.colors.primary }}>
                        {draftConfig.featuredCollections.title}
                      </h3>
                      <p className="text-[10px] text-zinc-500">
                        {draftConfig.featuredCollections.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                      {[
                        { name: "Linen Shirts", count: "12 Styles", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200" },
                        { name: "Raw Selvedge Jeans", count: "8 Styles", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200" },
                        { name: "Sartorial Pants", count: "14 Styles", img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=200" },
                        { name: "Resort Co-ords", count: "6 Styles", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200" }
                      ].map((col, idx) => (
                        <div key={idx} className="bg-white border rounded-xl overflow-hidden shadow-xs shrink-0 flex flex-col hover:scale-102 transition duration-300">
                          <img src={col.img} alt="" className="h-24 w-full object-cover bg-zinc-100" />
                          <div className="p-2.5 text-left">
                            <h5 className="font-bold text-[10px] text-zinc-950 truncate">{col.name}</h5>
                            <span className="text-[8px] text-zinc-400 font-mono uppercase">{col.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 5. Trending Shelby */}
                {draftConfig.trendingProducts.enabled && (
                  <section className="py-8 px-4 bg-white text-zinc-700">
                    <div className="max-w-7xl mx-auto">
                      <div className="flex justify-between items-end border-b pb-3 mb-6">
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-serif">
                          {draftConfig.trendingProducts.title}
                        </h3>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-orange-500 font-mono flex items-center gap-1">
                          Browse all cuts <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>

                      {/* Mock list items */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {productList.slice(0, 4).map((item) => (
                          <div key={item.id} className="group relative">
                            <img src={item.images?.[0]} className="h-40 w-full object-cover rounded-xl bg-zinc-50 border" alt="" />
                            <div className="mt-2.5 text-left text-zinc-900">
                              <span className="text-[8px] font-mono uppercase text-zinc-400 font-bold block mb-0.5">{item.brand || "CLINZA"}</span>
                              <h4 className="font-bold text-[10px] leading-tight text-zinc-950 truncate font-serif">{item.name}</h4>
                              <div className="flex gap-1.5 items-center mt-1">
                                <span className="font-bold text-[10px]" style={{ color: draftConfig.colors.accent }}>₹{item.price.toLocaleString("en-IN")}</span>
                                <span className="line-through text-zinc-400 text-[9px]">₹{(item.price * 1.5).toLocaleString("en-IN")}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* 6. Premium Testimonial Cards Layout */}
                {draftConfig.features.enabled && (
                  <section className="bg-zinc-950 p-6 py-8 text-white grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-850">
                    {draftConfig.features.cards.map((card, idx) => (
                      <div key={idx} className="space-y-1.5 text-left">
                        <Award className="h-5 w-5 text-orange-500" />
                        <h5 className="font-mono text-[9px] font-bold uppercase text-zinc-300">{card.title}</h5>
                        <p className="text-[9px] text-zinc-400 font-sans leading-relaxed">{card.description}</p>
                      </div>
                    ))}
                  </section>
                )}

                {/* 7. Footer bottom info */}
                <footer className="p-8 border-t transition" style={{
                  backgroundColor: draftConfig.colors.footerBg,
                  color: "#d4d4d8"
                }}>
                  <div className="max-w-4xl mx-auto space-y-6 text-[10px] leading-loose">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
                      <div className="space-y-2">
                        <span className="text-xs uppercase tracking-widest text-white font-serif">{draftConfig.header.logoUrl ? "CLINZA" : "CLINZA"}</span>
                        <p className="text-zinc-400">
                          {draftConfig.footer.companyInfo}
                        </p>
                      </div>
                      
                      <div className="space-y-1 bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-orange-400 font-bold block mb-1">Corporate Contact</span>
                        <p className="text-white font-serif">{draftConfig.footer.address}</p>
                        <p className="text-zinc-300 font-mono text-[9px]"> concierge@clinza.com | {draftConfig.footer.phone}</p>
                        <p className="text-zinc-500 pt-1 border-t border-white/5 mt-1">{draftConfig.footer.copyrightText}</p>
                      </div>
                    </div>
                  </div>
                </footer>

              </div>

            </div>
          </div>

          <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-2xl flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="text-[10px] text-zinc-400 leading-relaxed">
              <span className="font-bold text-white block">✨ FULL SIMULATOR HARNESS</span>
              Choose between <strong>Desktop</strong> and <strong>Mobile</strong> responsive layout selectors. Changes in sliders, badge text alignments, logo images, announcement texts, button colors, and fonts reflecting draft states are simulated instantly inside this viewport!
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
