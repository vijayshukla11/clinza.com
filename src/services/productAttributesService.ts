import { MasterProductAttribute } from "../types";
import { supabase } from "../supabase";

const LOCAL_ATTRIBUTES_KEY = "clinza_master_product_attributes";

export const DEFAULT_MASTER_ATTRIBUTES: MasterProductAttribute[] = [
  // Colors
  { id: "col-white", type: "color", name: "Sartorial White", code: "#FFFFFF", displayOrder: 1, active: true },
  { id: "col-navy", type: "color", name: "Midnight Navy", code: "#0B192C", displayOrder: 2, active: true },
  { id: "col-olive", type: "color", name: "Tuscan Olive", code: "#3B4A3F", displayOrder: 3, active: true },
  { id: "col-cream", type: "color", name: "Cream Oasis", code: "#FDF5E6", displayOrder: 4, active: true },
  { id: "col-black", type: "color", name: "Onyx Black", code: "#121212", displayOrder: 5, active: true },
  { id: "col-beige", type: "color", name: "Sand Beige", code: "#E8D8C8", displayOrder: 6, active: true },
  { id: "col-sky", type: "color", name: "Amalfi Blue", code: "#87CEEB", displayOrder: 7, active: true },
  { id: "col-terracotta", type: "color", name: "Rust Terracotta", code: "#C85A32", displayOrder: 8, active: true },

  // Sizes
  { id: "sz-xs", type: "size", name: "Extra Small", code: "XS", displayOrder: 1, active: true },
  { id: "sz-s", type: "size", name: "Small", code: "S", displayOrder: 2, active: true },
  { id: "sz-m", type: "size", name: "Medium", code: "M", displayOrder: 3, active: true },
  { id: "sz-l", type: "size", name: "Large", code: "L", displayOrder: 4, active: true },
  { id: "sz-xl", type: "size", name: "Extra Large", code: "XL", displayOrder: 5, active: true },
  { id: "sz-xxl", type: "size", name: "2X Large", code: "XXL", displayOrder: 6, active: true },
  { id: "sz-3xl", type: "size", name: "3X Large", code: "3XL", displayOrder: 7, active: true },

  // Fabrics
  { id: "fab-pure-linen", type: "fabric", name: "100% Pure Italian Linen", displayOrder: 1, active: true },
  { id: "fab-organic-cotton", type: "fabric", name: "Organic Egyptian Cotton", displayOrder: 2, active: true },
  { id: "fab-selvedge-denim", type: "fabric", name: "Japanese Selvedge Denim", displayOrder: 3, active: true },
  { id: "fab-linen-cotton", type: "fabric", name: "Linen-Cotton Blend", displayOrder: 4, active: true },
  { id: "fab-bamboo-viscose", type: "fabric", name: "Bamboo Viscose", displayOrder: 5, active: true },
  { id: "fab-poplin", type: "fabric", name: "Lightweight Poplin", displayOrder: 6, active: true },
  { id: "fab-oxford", type: "fabric", name: "Pinpoint Oxford", displayOrder: 7, active: true },

  // Fits
  { id: "fit-slim", type: "fit", name: "Slim Fit", displayOrder: 1, active: true },
  { id: "fit-tailored", type: "fit", name: "Tailored Fit", displayOrder: 2, active: true },
  { id: "fit-regular", type: "fit", name: "Regular Classic Fit", displayOrder: 3, active: true },
  { id: "fit-relaxed", type: "fit", name: "Relaxed Fit", displayOrder: 4, active: true },
  { id: "fit-oversized", type: "fit", name: "Oversized Street", displayOrder: 5, active: true },

  // Patterns
  { id: "pat-solid", type: "pattern", name: "Solid", displayOrder: 1, active: true },
  { id: "pat-striped", type: "pattern", name: "Bengal Stripe", displayOrder: 2, active: true },
  { id: "pat-checked", type: "pattern", name: "Windowpane Check", displayOrder: 3, active: true },
  { id: "pat-textured", type: "pattern", name: "Subtle Slub Texture", displayOrder: 4, active: true },
  { id: "pat-printed", type: "pattern", name: "Resort Botanical Print", displayOrder: 5, active: true },

  // Sleeves
  { id: "slv-full", type: "sleeve", name: "Full Sleeve", displayOrder: 1, active: true },
  { id: "slv-half", type: "sleeve", name: "Half Sleeve", displayOrder: 2, active: true },
  { id: "slv-rollup", type: "sleeve", name: "Convertible Roll-Up", displayOrder: 3, active: true },
  { id: "slv-sleeveless", type: "sleeve", name: "Sleeveless / Vest", displayOrder: 4, active: true },

  // Occasions
  { id: "occ-casual", type: "occasion", name: "Resort & Casual Wear", displayOrder: 1, active: true },
  { id: "occ-formal", type: "occasion", name: "Business & Formal", displayOrder: 2, active: true },
  { id: "occ-vacation", type: "occasion", name: "Vacation & Beach", displayOrder: 3, active: true },
  { id: "occ-evening", type: "occasion", name: "Evening & Cocktail", displayOrder: 4, active: true },
  { id: "occ-party", type: "occasion", name: "Celebration & Party", displayOrder: 5, active: true },

  // Seasons
  { id: "sea-ss", type: "season", name: "Spring / Summer 2026", displayOrder: 1, active: true },
  { id: "sea-fw", type: "season", name: "Autumn / Winter 2026", displayOrder: 2, active: true },
  { id: "sea-all", type: "season", name: "All-Season Core", displayOrder: 3, active: true },
  { id: "sea-resort", type: "season", name: "Resort Capsule", displayOrder: 4, active: true }
];

export const ProductAttributesService = {
  getAll(): MasterProductAttribute[] {
    try {
      const stored = localStorage.getItem(LOCAL_ATTRIBUTES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error reading local product attributes:", e);
    }
    return DEFAULT_MASTER_ATTRIBUTES;
  },

  getByType(type: MasterProductAttribute["type"]): MasterProductAttribute[] {
    return this.getAll().filter(a => a.type === type && a.active !== false);
  },

  saveAll(attributes: MasterProductAttribute[]): void {
    try {
      localStorage.setItem(LOCAL_ATTRIBUTES_KEY, JSON.stringify(attributes));
    } catch (e) {
      console.error("Error saving product attributes:", e);
    }
  },

  addAttribute(attribute: Omit<MasterProductAttribute, "id">): MasterProductAttribute {
    const list = this.getAll();
    const newAttr: MasterProductAttribute = {
      ...attribute,
      id: `attr-${attribute.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      active: attribute.active !== undefined ? attribute.active : true
    };
    list.push(newAttr);
    this.saveAll(list);
    return newAttr;
  },

  updateAttribute(id: string, updates: Partial<MasterProductAttribute>): MasterProductAttribute | null {
    const list = this.getAll();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.saveAll(list);
    return list[idx];
  },

  deleteAttribute(id: string): boolean {
    const list = this.getAll().filter(a => a.id !== id);
    this.saveAll(list);
    return true;
  }
};
