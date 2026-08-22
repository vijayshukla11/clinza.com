import React, { useState } from "react";
import {
  Sparkles,
  Shirt,
  Layers,
  Repeat,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Table,
  Image as ImageIcon,
  Columns,
  List,
  Compass,
  AlertCircle
} from "lucide-react";
import {
  APlusContentData,
  APlusSection,
  APlusSectionType,
  APlusHeroStorySection,
  APlusImageTextSection,
  APlusFeatureGridSection,
  APlusDetailStorySection,
  APlusStyleGuideSection,
  APlusFullBannerSection,
  APlusSpecTableSection,
  APlusFaqSection
} from "../../types";
import APlusContent from "../APlusContent";

interface APlusContentBuilderProps {
  value?: APlusContentData | null;
  onChange: (data: APlusContentData) => void;
  productName?: string;
}

const SECTION_TYPE_INFO: Record<APlusSectionType, { label: string; description: string; icon: React.ElementType }> = {
  hero_story: {
    label: "Hero Story",
    description: "Large full-width editorial visual with high-contrast cinematic typography.",
    icon: ImageIcon
  },
  image_text: {
    label: "Image + Text (Two-Column)",
    description: "Clean split layout for craftsmanship stories. Toggle image on left or right.",
    icon: Columns
  },
  feature_grid: {
    label: "Feature Grid",
    description: "3 or 4 responsive cards highlighting key attributes, materials, or features.",
    icon: Layers
  },
  detail_story: {
    label: "Product Detail Story",
    description: "Focal product image accompanied by a checklist of craft details and specifications.",
    icon: List
  },
  style_guide: {
    label: "Three Looks / Style Guide",
    description: "3 visual cards demonstrating how to style the item (e.g. Look 01, Look 02, Look 03).",
    icon: Shirt
  },
  full_banner: {
    label: "Full-Width Lifestyle Banner",
    description: "Immersive full-bleed banner with centered narrative text.",
    icon: Compass
  },
  spec_table: {
    label: "Specification Table",
    description: "Structured key-value specification table (e.g. Colour, Set Includes, Fit, Origin).",
    icon: Table
  },
  faq: {
    label: "Product FAQ",
    description: "Expandable accordion answering product-specific questions.",
    icon: HelpCircle
  }
};

export const APlusContentBuilder: React.FC<APlusContentBuilderProps> = ({
  value,
  onChange,
  productName = "Product"
}) => {
  const content: APlusContentData = value || { enabled: false, sections: [] };
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});

  const toggleEnabled = (enabled: boolean) => {
    onChange({
      ...content,
      enabled
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedSectionIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const createNewSection = (type: APlusSectionType): APlusSection => {
    const id = `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    switch (type) {
      case "hero_story":
        return {
          id,
          type: "hero_story",
          eyebrow: "ARCTIC COLLECTION",
          heading: "THE COMPLETE LOOK",
          description: "A refined monochrome combination designed for effortless everyday dressing.",
          image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
        };
      case "image_text":
        return {
          id,
          type: "image_text",
          layout: "image_left",
          eyebrow: "DESIGN & PROPORTION",
          heading: "Tailored for Everyday Ease",
          description: "Balanced proportions between the relaxed spread-collar upper and the pleated trouser create a cohesive, clean silhouette suitable for all occasions.",
          image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1000&q=80",
          badge: "SIGNATURE SET"
        };
      case "feature_grid":
        return {
          id,
          type: "feature_grid",
          eyebrow: "KEY HIGHLIGHTS",
          heading: "Crafted with Purpose",
          columns: 4,
          items: [
            { icon: "Sparkles", title: "PREMIUM FEEL", description: "Designed for everyday comfort and refined texture." },
            { icon: "Shirt", title: "RELAXED FIT", description: "Easy movement with a clean, structured silhouette." },
            { icon: "Layers", title: "MONOCHROME STYLE", description: "A refined coordinated aesthetic from top to bottom." },
            { icon: "Repeat", title: "VERSATILE WEAR", description: "Style together as a complete set or mix separately." }
          ]
        };
      case "detail_story":
        return {
          id,
          type: "detail_story",
          eyebrow: "CRAFTSMANSHIP",
          heading: "DESIGNED IN EVERY DETAIL",
          description: "Every component is thoughtfully proportioned to create an effortless aesthetic.",
          image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80",
          details: [
            "Classic shirt collar",
            "Full sleeves with button cuffs",
            "Clean button-front closure",
            "Functional chest pocket",
            "Relaxed double-pleat trousers",
            "Adjustable comfort waistband"
          ]
        };
      case "style_guide":
        return {
          id,
          type: "style_guide",
          eyebrow: "STYLE GUIDE",
          heading: "One Set. Three Ways to Wear It.",
          description: "Maximize your wardrobe versatility with three effortless styling combinations.",
          looks: [
            {
              lookNumber: "LOOK 01",
              lookTitle: "COMPLETE SET",
              description: "Wear together for a striking, effortless monochrome statement.",
              image: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"
            },
            {
              lookNumber: "LOOK 02",
              lookTitle: "SHIRT + DENIM",
              description: "Pair the shirt with vintage selvedge denim for a casual weekend look.",
              image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=800&q=80"
            },
            {
              lookNumber: "LOOK 03",
              lookTitle: "TROUSER + TEE",
              description: "Style the pleated trousers with a minimalist tee or knit polo.",
              image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80"
            }
          ]
        };
      case "full_banner":
        return {
          id,
          type: "full_banner",
          eyebrow: "EDITORIAL ESSENTIAL",
          heading: "TIMELESS MONOCHROME SIMPLICITY",
          description: "Engineered for modern living with seamless versatility across daytime meetings and evening dinners.",
          image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1600&q=80"
        };
      case "spec_table":
        return {
          id,
          type: "spec_table",
          eyebrow: "PRODUCT DETAILS",
          heading: "Garment Specifications",
          specs: [
            { label: "COLOUR", value: "Arctic White" },
            { label: "SET INCLUDES", value: "Shirt + Trouser" },
            { label: "FIT", value: "Relaxed" },
            { label: "GENDER", value: "Men" },
            { label: "ORIGIN", value: "India" }
          ]
        };
      case "faq":
        return {
          id,
          type: "faq",
          eyebrow: "QUESTIONS & ANSWERS",
          heading: "Frequently Asked Questions",
          items: [
            {
              question: "Can I wear the shirt and trouser separately?",
              answer: "Yes. Both pieces are designed as standalone wardrobe staples that mix effortlessly with denims, tees, and tailored jackets."
            },
            {
              question: "How should I care for this co-ord set?",
              answer: "We recommend gentle cold wash or dry clean. Hang dry in shade and iron on medium heat to preserve the fabric texture."
            },
            {
              question: "Is Cash on Delivery (COD) available for this set?",
              answer: "Yes, complimentary COD and express courier shipping are available across all serviceable pincodes in India."
            }
          ]
        };
    }
  };

  const addSection = (type: APlusSectionType) => {
    const newSection = createNewSection(type);
    const updatedSections = [...content.sections, newSection];
    onChange({
      ...content,
      enabled: true,
      sections: updatedSections
    });
    setExpandedSectionIds(prev => ({ ...prev, [newSection.id]: true }));
    setShowAddMenu(false);
  };

  const removeSection = (index: number) => {
    const updated = content.sections.filter((_, i) => i !== index);
    onChange({
      ...content,
      sections: updated
    });
  };

  const duplicateSection = (index: number) => {
    const target = content.sections[index];
    const clone = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    };
    const updated = [...content.sections];
    updated.splice(index + 1, 0, clone);
    onChange({
      ...content,
      sections: updated
    });
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= content.sections.length) return;
    const updated = [...content.sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChange({
      ...content,
      sections: updated
    });
  };

  const updateSection = (index: number, updatedSec: APlusSection) => {
    const updated = [...content.sections];
    updated[index] = updatedSec;
    onChange({
      ...content,
      sections: updated
    });
  };

  const loadExampleTemplate = () => {
    const templateSections: APlusSection[] = [
      createNewSection("hero_story"),
      createNewSection("image_text"),
      createNewSection("feature_grid"),
      createNewSection("detail_story"),
      createNewSection("style_guide"),
      createNewSection("full_banner"),
      createNewSection("spec_table"),
      createNewSection("faq")
    ];
    onChange({
      enabled: true,
      sections: templateSections
    });
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
      {/* Top Banner Controls */}
      <div className="p-4 sm:p-6 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-950 text-lg">Product A+ Visual Content</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
              content.enabled ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-zinc-200 text-zinc-600 border border-zinc-300"
            }`}>
              {content.enabled ? "Enabled on Product Page" : "Disabled (Hidden)"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 max-w-xl">
            Rich visual storytelling, lifestyle imagery, style guides, and spec tables displayed below product information. If disabled or empty, nothing renders on the live store.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => toggleEnabled(!content.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              content.enabled ? "bg-[#F27D26]" : "bg-zinc-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                content.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="px-6 border-b border-zinc-200 bg-white flex items-center justify-between">
        <div className="flex space-x-6">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "editor"
                ? "border-zinc-950 text-zinc-950"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Visual Builder ({content.sections?.length || 0} Sections)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "preview"
                ? "border-zinc-950 text-zinc-950"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Eye className="w-4 h-4" />
            Live Preview
          </button>
        </div>

        {activeTab === "editor" && content.sections?.length === 0 && (
          <button
            type="button"
            onClick={loadExampleTemplate}
            className="text-xs text-[#F27D26] hover:text-[#e06c15] font-semibold flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-orange-50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Complete Editorial Template
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "editor" ? (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Section List */}
          {(!content.sections || content.sections.length === 0) ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-zinc-200 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-zinc-900 mb-1">No A+ Content Sections Added Yet</h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto mb-6">
                Enhance your product page with rich lifestyle stories, two-column layouts, feature grids, 3-look style guides, and spec tables.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddMenu(true)}
                  className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-800 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add First Section
                </button>
                <button
                  type="button"
                  onClick={loadExampleTemplate}
                  className="px-4 py-2 bg-orange-50 text-[#F27D26] border border-orange-200 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-orange-100"
                >
                  <Sparkles className="w-4 h-4" />
                  Load 8-Section Luxury Template
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {content.sections.map((section, idx) => {
                const info = SECTION_TYPE_INFO[section.type] || {
                  label: section.type,
                  description: "",
                  icon: Layers
                };
                const SectionIcon = info.icon;
                const isExpanded = expandedSectionIds[section.id] ?? false;

                return (
                  <div
                    key={section.id || idx}
                    className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50/50 shadow-sm transition-all"
                  >
                    {/* Section Bar */}
                    <div className="p-4 bg-white flex items-center justify-between border-b border-zinc-100">
                      <div
                        className="flex items-center gap-3 cursor-pointer flex-grow"
                        onClick={() => toggleExpand(section.id)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0">
                          <SectionIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-zinc-400">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-900">
                              {info.label}
                            </span>
                            {section.heading && (
                              <span className="text-xs text-zinc-500 truncate max-w-xs font-medium">
                                — "{section.heading}"
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 font-light truncate max-w-md">
                            {info.description}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, "up")}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 rounded"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === content.sections.length - 1}
                          onClick={() => moveSection(idx, "down")}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 disabled:hover:text-zinc-400 rounded"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateSection(idx)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded"
                          title="Duplicate Section"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(idx)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 rounded"
                          title="Delete Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpand(section.id)}
                          className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Section Edit Panel */}
                    {isExpanded && (
                      <div className="p-4 sm:p-6 bg-white border-t border-zinc-100 space-y-4">
                        {renderSectionEditor(section, updatedSec => updateSection(idx, updatedSec))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Section Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="w-full py-3 border-2 border-dashed border-zinc-300 hover:border-zinc-500 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-zinc-950 flex items-center justify-center gap-2 bg-zinc-50/50 hover:bg-zinc-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Another A+ Section
                </button>
              </div>
            </div>
          )}

          {/* Section Picker Modal/Dropdown */}
          {showAddMenu && (
            <div className="p-5 border border-zinc-200 bg-zinc-50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
                  Select Section Type to Add
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddMenu(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-700"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.keys(SECTION_TYPE_INFO) as APlusSectionType[]).map(type => {
                  const item = SECTION_TYPE_INFO[type];
                  const IconComp = item.icon;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addSection(type)}
                      className="p-3.5 text-left rounded-xl bg-white border border-zinc-200 hover:border-zinc-900 hover:shadow-sm transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors flex items-center justify-center text-zinc-700">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-zinc-900">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-light leading-snug">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Preview Tab */
        <div className="p-4 sm:p-6 bg-zinc-100/60 min-h-[400px]">
          <div className="mb-4 flex items-center justify-between bg-white p-3 rounded-lg border border-zinc-200">
            <span className="text-xs text-zinc-500 font-medium">
              Simulated Product Detail Page Injection:
            </span>
            <span className="text-xs font-mono text-zinc-700">
              Target: <strong className="text-zinc-950">{productName}</strong>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-2 sm:p-6 shadow-sm">
            {content.enabled && content.sections?.length > 0 ? (
              <APlusContent content={content} />
            ) : (
              <div className="text-center py-16 text-zinc-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                <p className="text-sm font-semibold text-zinc-600">A+ Content is currently hidden or has zero sections.</p>
                <p className="text-xs text-zinc-400 mt-1">Enable A+ Content and add sections to preview the live layout.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Form renderers for individual section types
function renderSectionEditor(section: APlusSection, onUpdate: (sec: APlusSection) => void) {
  switch (section.type) {
    case "hero_story": {
      const s = section as APlusHeroStorySection;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Eyebrow (Mono Label)
              </label>
              <input
                type="text"
                value={s.eyebrow || ""}
                onChange={e => onUpdate({ ...s, eyebrow: e.target.value })}
                placeholder="e.g. ARCTIC WHITE"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Main Heading
              </label>
              <input
                type="text"
                value={s.heading || ""}
                onChange={e => onUpdate({ ...s, heading: e.target.value })}
                placeholder="e.g. THE COMPLETE LOOK"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950 font-bold"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
              Description / Narrative
            </label>
            <textarea
              rows={2}
              value={s.description || ""}
              onChange={e => onUpdate({ ...s, description: e.target.value })}
              placeholder="e.g. A refined monochrome combination designed for effortless everyday dressing."
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
              Image Asset URL
            </label>
            <input
              type="text"
              value={s.image || ""}
              onChange={e => onUpdate({ ...s, image: e.target.value })}
              placeholder="https://..."
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
            />
          </div>
        </div>
      );
    }

    case "image_text": {
      const s = section as APlusImageTextSection;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Layout Direction
              </label>
              <select
                value={s.layout || "image_left"}
                onChange={e => onUpdate({ ...s, layout: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
              >
                <option value="image_left">Image Left / Text Right</option>
                <option value="image_right">Text Left / Image Right</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Eyebrow (Mono Label)
              </label>
              <input
                type="text"
                value={s.eyebrow || ""}
                onChange={e => onUpdate({ ...s, eyebrow: e.target.value })}
                placeholder="e.g. DESIGN & PROPORTION"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Optional Badge
              </label>
              <input
                type="text"
                value={s.badge || ""}
                onChange={e => onUpdate({ ...s, badge: e.target.value })}
                placeholder="e.g. SIGNATURE SET"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
              Heading
            </label>
            <input
              type="text"
              value={s.heading || ""}
              onChange={e => onUpdate({ ...s, heading: e.target.value })}
              placeholder="e.g. Tailored for Everyday Ease"
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950 font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={s.description || ""}
              onChange={e => onUpdate({ ...s, description: e.target.value })}
              placeholder="Craft description paragraph..."
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
              Image URL
            </label>
            <input
              type="text"
              value={s.image || ""}
              onChange={e => onUpdate({ ...s, image: e.target.value })}
              placeholder="https://..."
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
            />
          </div>
        </div>
      );
    }

    case "feature_grid": {
      const s = section as APlusFeatureGridSection;
      const items = s.items || [];

      const updateItem = (idx: number, field: string, val: string) => {
        const next = [...items];
        next[idx] = { ...next[idx], [field]: val };
        onUpdate({ ...s, items: next });
      };

      const addItem = () => {
        onUpdate({
          ...s,
          items: [...items, { icon: "Sparkles", title: "NEW HIGHLIGHT", description: "Short description" }]
        });
      };

      const removeItem = (idx: number) => {
        onUpdate({
          ...s,
          items: items.filter((_, i) => i !== idx)
        });
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Eyebrow
              </label>
              <input
                type="text"
                value={s.eyebrow || ""}
                onChange={e => onUpdate({ ...s, eyebrow: e.target.value })}
                placeholder="e.g. KEY HIGHLIGHTS"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Section Heading
              </label>
              <input
                type="text"
                value={s.heading || ""}
                onChange={e => onUpdate({ ...s, heading: e.target.value })}
                placeholder="e.g. Crafted with Purpose"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Columns
              </label>
              <select
                value={s.columns || 4}
                onChange={e => onUpdate({ ...s, columns: Number(e.target.value) as any })}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
              >
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
              </select>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
                Feature Cards ({items.length})
              </span>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-[#F27D26] hover:text-[#e06c15] font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Card
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="absolute top-2 right-2 text-zinc-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500">Icon / Symbol</label>
                      <input
                        type="text"
                        value={item.icon || ""}
                        onChange={e => updateItem(idx, "icon", e.target.value)}
                        placeholder="Sparkles, Shirt, Layers"
                        className="w-full text-xs p-1.5 rounded border border-zinc-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500">Title</label>
                      <input
                        type="text"
                        value={item.title || ""}
                        onChange={e => updateItem(idx, "title", e.target.value)}
                        placeholder="Card Title"
                        className="w-full text-xs p-1.5 rounded border border-zinc-300 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500">Description</label>
                    <textarea
                      rows={2}
                      value={item.description || ""}
                      onChange={e => updateItem(idx, "description", e.target.value)}
                      placeholder="Short feature description"
                      className="w-full text-xs p-1.5 rounded border border-zinc-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "detail_story": {
      const s = section as APlusDetailStorySection;
      const details = s.details || [];

      const updateDetail = (idx: number, val: string) => {
        const next = [...details];
        next[idx] = val;
        onUpdate({ ...s, details: next });
      };

      const addDetail = () => {
        onUpdate({ ...s, details: [...details, "New craftsmanship detail"] });
      };

      const removeDetail = (idx: number) => {
        onUpdate({ ...s, details: details.filter((_, i) => i !== idx) });
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Eyebrow
              </label>
              <input
                type="text"
                value={s.eyebrow || ""}
                onChange={e => onUpdate({ ...s, eyebrow: e.target.value })}
                placeholder="e.g. CRAFTSMANSHIP"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Heading
              </label>
              <input
                type="text"
                value={s.heading || ""}
                onChange={e => onUpdate({ ...s, heading: e.target.value })}
                placeholder="e.g. DESIGNED IN EVERY DETAIL"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950 font-bold"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
              Image URL
            </label>
            <input
              type="text"
              value={s.image || ""}
              onChange={e => onUpdate({ ...s, image: e.target.value })}
              placeholder="https://..."
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
                Detail Bullet Points ({details.length})
              </span>
              <button
                type="button"
                onClick={addDetail}
                className="text-xs text-[#F27D26] hover:text-[#e06c15] font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bullet
              </button>
            </div>
            {details.map((bullet, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={e => updateDetail(idx, e.target.value)}
                  placeholder="e.g. Classic shirt collar"
                  className="flex-grow text-xs p-2 rounded border border-zinc-300"
                />
                <button
                  type="button"
                  onClick={() => removeDetail(idx)}
                  className="text-zinc-400 hover:text-red-600 p-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "style_guide": {
      const s = section as APlusStyleGuideSection;
      const looks = s.looks || [];

      const updateLook = (idx: number, field: string, val: string) => {
        const next = [...looks];
        next[idx] = { ...next[idx], [field]: val };
        onUpdate({ ...s, looks: next });
      };

      const addLook = () => {
        onUpdate({
          ...s,
          looks: [
            ...looks,
            {
              lookNumber: `LOOK 0${looks.length + 1}`,
              lookTitle: "NEW LOOK",
              description: "Look styling description",
              image: ""
            }
          ]
        });
      };

      const removeLook = (idx: number) => {
        onUpdate({ ...s, looks: looks.filter((_, i) => i !== idx) });
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Eyebrow
              </label>
              <input
                type="text"
                value={s.eyebrow || ""}
                onChange={e => onUpdate({ ...s, eyebrow: e.target.value })}
                placeholder="e.g. STYLE GUIDE"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Heading
              </label>
              <input
                type="text"
                value={s.heading || ""}
                onChange={e => onUpdate({ ...s, heading: e.target.value })}
                placeholder="e.g. One Set. Three Ways to Wear It."
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950 font-bold"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
                Visual Style Looks ({looks.length})
              </span>
              <button
                type="button"
                onClick={addLook}
                className="text-xs text-[#F27D26] hover:text-[#e06c15] font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Look
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {looks.map((look, idx) => (
                <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => removeLook(idx)}
                    className="absolute top-2 right-2 text-zinc-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500">Look Tag</label>
                    <input
                      type="text"
                      value={look.lookNumber || ""}
                      onChange={e => updateLook(idx, "lookNumber", e.target.value)}
                      placeholder="LOOK 01"
                      className="w-full text-xs p-1.5 rounded border border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500">Look Title</label>
                    <input
                      type="text"
                      value={look.lookTitle || ""}
                      onChange={e => updateLook(idx, "lookTitle", e.target.value)}
                      placeholder="e.g. COMPLETE SET"
                      className="w-full text-xs p-1.5 rounded border border-zinc-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500">Description</label>
                    <textarea
                      rows={2}
                      value={look.description || ""}
                      onChange={e => updateLook(idx, "description", e.target.value)}
                      placeholder="Styling description"
                      className="w-full text-xs p-1.5 rounded border border-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500">Image URL</label>
                    <input
                      type="text"
                      value={look.image || ""}
                      onChange={e => updateLook(idx, "image", e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs p-1.5 rounded border border-zinc-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "full_banner": {
      const s = section as APlusFullBannerSection;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Eyebrow
              </label>
              <input
                type="text"
                value={s.eyebrow || ""}
                onChange={e => onUpdate({ ...s, eyebrow: e.target.value })}
                placeholder="e.g. EDITORIAL ESSENTIAL"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Banner Heading
              </label>
              <input
                type="text"
                value={s.heading || ""}
                onChange={e => onUpdate({ ...s, heading: e.target.value })}
                placeholder="e.g. TIMELESS MONOCHROME SIMPLICITY"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950 font-bold"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
              Description
            </label>
            <textarea
              rows={2}
              value={s.description || ""}
              onChange={e => onUpdate({ ...s, description: e.target.value })}
              placeholder="Narrative text"
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
              Image URL
            </label>
            <input
              type="text"
              value={s.image || ""}
              onChange={e => onUpdate({ ...s, image: e.target.value })}
              placeholder="https://..."
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
            />
          </div>
        </div>
      );
    }

    case "spec_table": {
      const s = section as APlusSpecTableSection;
      const specs = s.specs || [];

      const updateSpec = (idx: number, field: "label" | "value", val: string) => {
        const next = [...specs];
        next[idx] = { ...next[idx], [field]: val };
        onUpdate({ ...s, specs: next });
      };

      const addSpec = () => {
        onUpdate({ ...s, specs: [...specs, { label: "NEW SPEC", value: "Value" }] });
      };

      const removeSpec = (idx: number) => {
        onUpdate({ ...s, specs: specs.filter((_, i) => i !== idx) });
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Eyebrow
              </label>
              <input
                type="text"
                value={s.eyebrow || ""}
                onChange={e => onUpdate({ ...s, eyebrow: e.target.value })}
                placeholder="e.g. PRODUCT DETAILS"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Table Heading
              </label>
              <input
                type="text"
                value={s.heading || ""}
                onChange={e => onUpdate({ ...s, heading: e.target.value })}
                placeholder="e.g. Garment Specifications"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
                Specification Rows ({specs.length})
              </span>
              <button
                type="button"
                onClick={addSpec}
                className="text-xs text-[#F27D26] hover:text-[#e06c15] font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>
            {specs.map((spec, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={spec.label}
                  onChange={e => updateSpec(idx, "label", e.target.value)}
                  placeholder="e.g. COLOUR"
                  className="w-1/3 text-xs p-2 rounded border border-zinc-300 font-mono font-bold uppercase"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={e => updateSpec(idx, "value", e.target.value)}
                  placeholder="e.g. Arctic White"
                  className="flex-grow text-xs p-2 rounded border border-zinc-300"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="text-zinc-400 hover:text-red-600 p-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "faq": {
      const s = section as APlusFaqSection;
      const items = s.items || [];

      const updateFaq = (idx: number, field: "question" | "answer", val: string) => {
        const next = [...items];
        next[idx] = { ...next[idx], [field]: val };
        onUpdate({ ...s, items: next });
      };

      const addFaq = () => {
        onUpdate({ ...s, items: [...items, { question: "New Question?", answer: "Answer here." }] });
      };

      const removeFaq = (idx: number) => {
        onUpdate({ ...s, items: items.filter((_, i) => i !== idx) });
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                Eyebrow
              </label>
              <input
                type="text"
                value={s.eyebrow || ""}
                onChange={e => onUpdate({ ...s, eyebrow: e.target.value })}
                placeholder="e.g. QUESTIONS & ANSWERS"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1 font-semibold">
                FAQ Heading
              </label>
              <input
                type="text"
                value={s.heading || ""}
                onChange={e => onUpdate({ ...s, heading: e.target.value })}
                placeholder="e.g. Frequently Asked Questions"
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:border-zinc-950 font-bold"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
                FAQ Accordion Items ({items.length})
              </span>
              <button
                type="button"
                onClick={addFaq}
                className="text-xs text-[#F27D26] hover:text-[#e06c15] font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Q&A
              </button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2 relative">
                <button
                  type="button"
                  onClick={() => removeFaq(idx)}
                  className="absolute top-2 right-2 text-zinc-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500">Question</label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={e => updateFaq(idx, "question", e.target.value)}
                    placeholder="e.g. Can I wear the shirt and trouser separately?"
                    className="w-full text-xs p-2 rounded border border-zinc-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500">Answer</label>
                  <textarea
                    rows={2}
                    value={item.answer}
                    onChange={e => updateFaq(idx, "answer", e.target.value)}
                    placeholder="Detailed response..."
                    className="w-full text-xs p-2 rounded border border-zinc-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

export default APlusContentBuilder;
