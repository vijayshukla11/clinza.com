import { Product, ProductVariant, Category } from "../types";

/**
 * Validates and deduplicates category slugs with numeric suffixes (shirts, shirts-2, shirts-3...)
 * Never uses timestamps or random IDs.
 */
export function ensureUniqueCategorySlug(
  desiredSlug: string,
  categoryId: string,
  existingCategories: Category[]
): string {
  const base = (desiredSlug || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!base) return `category-${categoryId ? categoryId.slice(0, 6) : "1"}`;

  const otherSlugs = new Set(
    (existingCategories || [])
      .filter(c => c.id !== categoryId)
      .map(c => (c.slug || "").toLowerCase().trim())
  );

  if (!otherSlugs.has(base)) {
    return base;
  }

  let counter = 2;
  while (otherSlugs.has(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}

/**
 * Validates and deduplicates product slugs with numeric suffixes (product, product-2, product-3...)
 * Never uses timestamps or random IDs.
 */
export function ensureUniqueSlug(
  desiredSlug: string,
  productId: string,
  existingProducts: Product[]
): string {
  const base = (desiredSlug || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!base) return `product-${productId ? productId.slice(0, 6) : "1"}`;

  const otherSlugs = new Set(
    (existingProducts || [])
      .filter(p => p.id !== productId)
      .map(p => (p.slug || "").toLowerCase().trim())
  );

  if (!otherSlugs.has(base)) {
    return base;
  }

  let counter = 2;
  while (otherSlugs.has(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}

/**
 * Utility that allocates parent total stock evenly across variants
 */
export function distributeStockAcrossVariants(
  variants: ProductVariant[],
  totalParentStock: number
): ProductVariant[] {
  if (!variants || variants.length === 0) return [];
  const safeTotal = Math.max(0, Math.floor(totalParentStock || 0));
  const count = variants.length;
  const baseQty = Math.floor(safeTotal / count);
  const remainder = safeTotal % count;

  return variants.map((v, idx) => {
    const allocated = safeTotal <= 0 ? 0 : baseQty + (idx < remainder ? 1 : 0);
    const status: "In Stock" | "Low Stock" | "Out of Stock" =
      allocated <= 0 ? "Out of Stock" : (allocated <= 5 ? "Low Stock" : "In Stock");

    return {
      ...v,
      stockQuantity: allocated,
      status
    };
  });
}

/**
 * Auto-generates a Color × Size matrix of variants for a product
 */
export function generateVariantsForProduct(
  colors: { name: string; hex: string }[],
  sizes: string[],
  baseSku: string,
  basePrice: number,
  baseOriginalPrice: number,
  baseImages: string[] = [],
  totalParentStock?: number
): ProductVariant[] {
  const variants: ProductVariant[] = [];
  const safeSku = baseSku ? baseSku.trim().toUpperCase() : "CLN-SKU";

  const colorList = colors && colors.length > 0 ? colors : [{ name: "Standard", hex: "#000000" }];
  const sizeList = sizes && sizes.length > 0 ? sizes : ["M"];

  colorList.forEach((color, colorIdx) => {
    sizeList.forEach((size, sizeIdx) => {
      const colorShort = color.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 3).toUpperCase() || "CLR";
      const sizeShort = size.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const variantSku = `${safeSku}-${colorShort}-${sizeShort}`;
      const pseudoBarcode = `890${(1000000000 + (colorIdx * 100 + sizeIdx * 10) + Math.abs(hashCode(variantSku) % 899999999)).toString().padStart(10, '0')}`;

      variants.push({
        id: `var-${safeSku.toLowerCase()}-${colorShort.toLowerCase()}-${sizeShort.toLowerCase()}`,
        colorName: color.name,
        colorHex: color.hex,
        size: size,
        sku: variantSku,
        barcode: pseudoBarcode,
        stockQuantity: 25,
        price: basePrice,
        originalPrice: baseOriginalPrice,
        status: "In Stock",
        images: baseImages.length > 0 ? (baseImages[colorIdx] ? [baseImages[colorIdx]] : baseImages) : []
      });
    });
  });

  if (totalParentStock !== undefined && totalParentStock >= 0) {
    return distributeStockAcrossVariants(variants, totalParentStock);
  }

  return variants;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Calculates total inventory stock across all variants of a product
 */
export function calculateProductTotalStock(product: Product): number {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  }
  return product.stockQuantity !== undefined ? product.stockQuantity : 50;
}

/**
 * Evaluates aggregated stock status
 */
export function calculateProductStockStatus(product: Product): "In Stock" | "Low Stock" | "Out of Stock" {
  const totalStock = calculateProductTotalStock(product);
  const lowLimit = product.lowStockLimit || 5;
  if (totalStock <= 0) return "Out of Stock";
  if (totalStock <= lowLimit) return "Low Stock";
  return "In Stock";
}

/**
 * Finds specific variant by color name and size
 */
export function findMatchingVariant(
  product: Product,
  colorName?: string,
  size?: string
): ProductVariant | undefined {
  if (!product.variants || product.variants.length === 0) return undefined;
  
  return product.variants.find(v => {
    const matchColor = !colorName || v.colorName.toLowerCase() === colorName.toLowerCase();
    const matchSize = !size || v.size.toLowerCase() === size.toLowerCase();
    return matchColor && matchSize;
  });
}
