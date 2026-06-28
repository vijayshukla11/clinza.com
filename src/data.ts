/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, ProductCollection, BlogPost } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  // === SHIRTS (1 to 7) ===
  {
    id: "prod-italian-white-linen",
    name: "Classic Italian Linen Shirt",
    slug: "classic-italian-linen-shirt",
    price: 2490,
    originalPrice: 3990,
    collection: ProductCollection.SHIRTS,
    category: "Premium Linen",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [
      { name: "Sartorial White", hex: "#FFFFFF" },
      { name: "Cream Oasis", hex: "#FDF5E6" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stockStatus: "In Stock",
    sku: "CLN-SH-001",
    brand: "CLINZA Luxury",
    rating: 4.8,
    reviews: [
      { id: "r1", rating: 5, userName: "Aarav Sharma", comment: "Beautiful material. Feels incredibly premium and breathes well.", location: "Mumbai", verified: true, date: "2026-05-15" }
    ],
    description: "Indulge in absolute comfort with our signature Italian Linen Shirt. Meticulously spun from high-grade European flax, it features a highly breathable structure, tailored regular fit, classic spread collar, and mother-of-pearl hardware accents. Perfect for hot climates and pristine resort layering.",
    specifications: [
      { label: "Fabric Blend", value: "100% Pure European Linen" },
      { label: "Weave Density", value: "Ultra-Lightweight 140 GSM" },
      { label: "Collar Type", value: "Modern Semi-Spread" }
    ],
    aPlusContent: {
      title: "Meticulously Spun European Linen",
      description: "Our linen is cultivated under natural maritime elements, ensuring exceptional long-staple fibers that offer unrivaled tensile strength and sensory comfort over time.",
      features: [
        { icon: "Wind", title: "Max Air Flow", description: "Hollow core flax fibers draw body heat away cleanly, keeping you 4 degrees cooler than cotton meshes." }
      ]
    },
    isTrending: true,
    isNewArrival: false,
    seoTitle: "Classic Italian Linen Shirt - Pure European Flax | CLINZA",
    metaDescription: "Shop the iconic CLINZA Classic Italian Linen Shirt. Tailored from 100% pure organic European flax for ultimate dry cooling comfort and luxury resort drape."
  },
  {
    id: "prod-sage-resort-linen",
    name: "Sage Resort Spread Linen Shirt",
    slug: "sage-resort-spread-linen-shirt",
    price: 2590,
    originalPrice: 4290,
    collection: ProductCollection.SHIRTS,
    category: "Premium Linen",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1621072156002-e2fcc103e81e?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [
      { name: "Sage Green", hex: "#8FBC8F" },
      { name: "Oatmeal Beige", hex: "#D2B48C" }
    ],
    sizes: ["M", "L", "XL"],
    stockStatus: "Low Stock",
    sku: "CLN-SH-002",
    brand: "CLINZA Resort",
    rating: 4.7,
    reviews: [],
    description: "Designed with a casual resort vibe, this semi-relaxed linen masterpiece features a sophisticated Cuban camp collar, clean flat hemline, and tonal bespoke stitching. Perfect as a lightweight overshirt for beach retreats or outdoor sunset events.",
    specifications: [
      { label: "Fabric Blend", value: "80% Organic Linen, 20% Pure Cotton" },
      { label: "Collar Type", value: "Relaxed Camp/Cuban Collar" }
    ],
    aPlusContent: {
      title: "Resort Comfort Reimagined",
      description: "Infused with a touch of combed cotton to maintain structural shape while retaining linen's organic raw texture and thermal regulation.",
      features: [
        { icon: "Feather", title: "Featherlight Craft", description: "Weighs a nominal 125 GSM for unhindered modern layering during balmy conditions." }
      ]
    },
    isTrending: true,
    isNewArrival: true,
    seoTitle: "Sage Camp Collar Resort Linen Shirt | CLINZA Luxury",
    metaDescription: "Drape yourself in effortless elegance with the Sage Green Cuban camp collar resort linen shirt. Breathable pre-shrunk linen blend construction."
  },
  {
    id: "prod-navy-club-linen",
    name: "Navy Club Spread Linen Shirt",
    slug: "navy-club-spread-linen-shirt",
    price: 2490,
    originalPrice: 3990,
    collection: ProductCollection.SHIRTS,
    category: "Premium Linen",
    images: [
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Rich Navy", hex: "#1D2951" }],
    sizes: ["S", "M", "L", "XL"],
    stockStatus: "In Stock",
    sku: "CLN-SH-003",
    brand: "CLINZA Luxury",
    rating: 4.6,
    reviews: [],
    description: "Dyed at micro-precision using organic indigo concentrates, this rich Navy spread collar linen shirt provides an instantly commanding evening posture. Pre-treated to eliminate common linen shrinkage issues.",
    specifications: [
      { label: "Fabric Blend", value: "100% Normandy Flax" },
      { label: "Weave Density", value: "145 GSM heavy plait" }
    ],
    aPlusContent: {
      title: "Deep Indigo Lustre",
      description: "Features custom reinforced double stitches and deep sea pearl toggles that reflect a subtle metallic gray glow.",
      features: []
    },
    isTrending: false,
    isNewArrival: false,
    seoTitle: "Navy Linen Spread Collar Evening Shirt | CLINZA",
    metaDescription: "The absolute rich Navy evening linen shirt. Features a structured modern cut, reinforced collar, and ocean-shell mother-of-pearl buttons."
  },
  {
    id: "prod-champagne-double-linen",
    name: "Champagne Mandarin Collar Linen Shirt",
    slug: "champagne-mandarin-collar-linen-shirt",
    price: 2690,
    originalPrice: 4490,
    collection: ProductCollection.SHIRTS,
    category: "Premium Linen",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Champagne Gold", hex: "#F3E5AB" }],
    sizes: ["M", "L", "XL", "XXL"],
    stockStatus: "In Stock",
    sku: "CLN-SH-004",
    brand: "CLINZA Luxury",
    rating: 4.9,
    reviews: [],
    description: "An elegant, minimal design. The Mandarin (band) collar pairs with clean neutral colors. Handcrafted with extra long sleeve plackets that cuff cleanly.",
    specifications: [
      { label: "Collar Archetype", value: "Sartorial Chinese Band / Mandarin" },
      { label: "Buttons", value: "Selected bio-degradable horn fasteners" }
    ],
    aPlusContent: {
      title: "Pure Minimalist Styling",
      description: "Unfussy necklines that stand parallel with modern editorial sensibilities. Perfect under fine linen blazers.",
      features: []
    },
    isTrending: true,
    isNewArrival: true,
    seoTitle: "Champagne Silk-Blend Mandarin Collar Shirt | CLINZA",
    metaDescription: "Modern sleek champagne linen-silk hybrid shirt featuring a minimalist banded Mandarin collar and premium horn-patterned buttons."
  },
  {
    id: "prod-terracotta-sun-linen",
    name: "Terracotta Sunset Breathable Shirt",
    slug: "terracotta-sunset-breathable-shirt",
    price: 2390,
    originalPrice: 3990,
    collection: ProductCollection.SHIRTS,
    category: "Premium Linen",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Terracotta Clay", hex: "#C05A46" }],
    sizes: ["S", "M", "L", "XL"],
    stockStatus: "In Stock",
    sku: "CLN-SH-005",
    brand: "CLINZA Resort",
    rating: 4.5,
    reviews: [],
    description: "Capturing the warm color tones of coastal sundowers, this clay orange terracotta fabric is pre-washed under bio-enzyme triggers to render standard velvet skin contact.",
    specifications: [
      { label: "Fabric", value: "90% Linen, 10% Micro-tencel" }
    ],
    aPlusContent: {
      title: "Sunset Tonal Softness",
      description: "Incorporates modal fluid structures to drape smoothly across chest partitions without rigid boxing.",
      features: []
    },
    isTrending: false,
    isNewArrival: false,
    seoTitle: "Terracotta Sunset Resort Linen Shirt | CLINZA",
    metaDescription: "Vibrant and earthly terracotta orange resort linen shirt. Pre-shrunk, bio-washed for unmatched drape and next-to-skin luxury softness."
  },
  {
    id: "prod-french-stripe-linen",
    name: "French Riviera Striped Linen Shirt",
    slug: "french-riviera-striped-linen-shirt",
    price: 2790,
    originalPrice: 4500,
    collection: ProductCollection.SHIRTS,
    category: "Premium Linen",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Classic Blue Stripe", hex: "#4682B4" }],
    sizes: ["M", "L", "XL"],
    stockStatus: "In Stock",
    sku: "CLN-SH-006",
    brand: "CLINZA Luxury",
    rating: 4.7,
    reviews: [],
    description: "Channeling old-money Mediterranean yacht aesthetics, this shirt incorporates crisp vertical stripes spun in yarn-dyed flax. Maintains precise structural alignment even in tropical moisture.",
    specifications: [
      { label: "Pattern type", value: "Yarn-dyed vertical stripes" }
    ],
    aPlusContent: {
      title: "Timeless Yacht Heritage",
      description: "Engineered specifically with high-tensile lock threads so stripes resist warping during active coastal wear.",
      features: []
    },
    isTrending: true,
    isNewArrival: false,
    seoTitle: "French Riviera Vertical Stripe Linen Shirt | CLINZA",
    metaDescription: "Timeless linen-striped vacation shirt in blue and white vertical yarns. Sourced from high-grade French flax fibers."
  },
  {
    id: "prod-obsidian-black-linen",
    name: "Obsidian Onyx Matte Linen Shirt",
    slug: "obsidian-onyx-matte-linen-shirt",
    price: 2590,
    originalPrice: 4190,
    collection: ProductCollection.SHIRTS,
    category: "Premium Linen",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Obsidian Black", hex: "#1A1A1A" }],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stockStatus: "In Stock",
    sku: "CLN-SH-007",
    brand: "CLINZA Luxury",
    rating: 4.8,
    reviews: [],
    description: "Deep, absorbing matte black yarn configurations make this structured linen model a stunning fit under neutral ivory blazers. Crafted with curved sartorial cuffs.",
    specifications: [
      { label: "Color Treatment", value: "Matte-level double reactive dyestuff" }
    ],
    aPlusContent: {
      title: "Ultra-Rich Matte Black Tint",
      description: "Retains its dark Obsidian saturation with superior industrial resistance against chlorinated pool waters or UV elements.",
      features: []
    },
    isTrending: false,
    isNewArrival: true,
    seoTitle: "Obsidian Black Matte Linen Shirt | CLINZA Luxury",
    metaDescription: "A luxurious deep black matte linen shirt. Pre-washed for a velvet feel. Uncompromising elite tailoring and custom curved barrel cuffs."
  },

  // === JEANS (8 to 12) ===
  {
    id: "prod-selvedge-indigo-jean",
    name: "Classic Selvedge Raw Denim Jeans",
    slug: "classic-selvedge-raw-denim-jeans",
    price: 3890,
    originalPrice: 5990,
    collection: ProductCollection.JEANS,
    category: "Selvedge Denim",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [
      { name: "Raw Indigo", hex: "#1D2951" },
      { name: "Obsidian Raw Black", hex: "#111111" }
    ],
    sizes: ["30", "32", "34", "36"],
    stockStatus: "In Stock",
    sku: "CLN-JN-001",
    brand: "CLINZA Denim Corp",
    rating: 4.9,
    reviews: [
      { id: "r4", rating: 5, userName: "Kabir Mehta", comment: "Pure selvedge gold. Dense and breaks in beautifully. Love the redline ticker.", location: "Bangalore", verified: true, date: "2026-05-30" }
    ],
    description: "Weft in vintage low-tension Japanese shuttle looms, our raw redline selvedge is a marvel of retro engineering. Sourced in 13.5 Oz raw organic cotton, it breaks in beautifully to sculpt customizable fade profiles mapped exactly to your natural lifestyle contours.",
    specifications: [
      { label: "Fabric Weight", value: "13.5 Oz Dry Pure Cotton Denim" },
      { label: "Loom Breed", value: "Vintage Shuttle shuttle-loom weave" },
      { label: "Inner Stitch", value: "Traditional Redline Selvedge secure edge" }
    ],
    aPlusContent: {
      title: "The Vintage Redline ID Ticker",
      description: "Woven continuously at conservative speed rates, preventing fiber stress and locking edges beautifully in traditional color tickers.",
      features: [
        { icon: "Shield", title: "Indestructible Weight", description: "Built with thick organic cotton yarns that outlive regular ring-spun models thrice." }
      ]
    },
    isTrending: true,
    isNewArrival: false,
    seoTitle: "Classic Raw Selvedge Japanese Denim Jeans | CLINZA",
    metaDescription: "Authentic 13.5 Oz raw Japanese selvedge denim jeans. Features organic indigo hues, solid brass button fly, and the iconic redline ID cuff ticker."
  },
  {
    id: "prod-vintage-washed-indigo",
    name: "Classic Vintage-Wash Selvedge Jeans",
    slug: "classic-vintage-wash-selvedge-jeans",
    price: 3990,
    originalPrice: 6290,
    collection: ProductCollection.JEANS,
    category: "Selvedge Denim",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Vintage Mid-Wash", hex: "#4682B4" }],
    sizes: ["30", "32", "34", "36"],
    stockStatus: "In Stock",
    sku: "CLN-JN-002",
    brand: "CLINZA Denim Corp",
    rating: 4.8,
    reviews: [],
    description: "A highly coveted pre-faded mid-washed indigo model that mimics authentic 10-year wear parameters. Hand-scraped delicately around high wear zones to reveal white cotton cores cleanly.",
    specifications: [
      { label: "Wash Level", value: "Pumice stone bio-wash with hand whiskers" }
    ],
    aPlusContent: {
      title: "10-Year Archival Patina",
      description: "Skip the stiffness. High-contrast faded streaks are manually crafted by denim artisans using traditional hand-scraping paddles.",
      features: []
    },
    isTrending: true,
    isNewArrival: true,
    seoTitle: "Vintage Washed Selvedge Denim Indigo Jeans | CLINZA",
    metaDescription: "Perfect pre-washed retro-wash selvedge denim jeans. Features natural whiskering, vintage copper rivets, and structured tapered fit."
  },
  {
    id: "prod-acid-charcoal-jean",
    name: "Acid Charcoal Tapered Selvedge Jeans",
    slug: "acid-charcoal-tapered-selvedge-jeans",
    price: 3790,
    originalPrice: 5790,
    collection: ProductCollection.JEANS,
    category: "Selvedge Denim",
    images: [
      "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Washed Charcoal", hex: "#3A3A3A" }],
    sizes: ["30", "32", "34", "36"],
    stockStatus: "In Stock",
    sku: "CLN-JN-003",
    brand: "CLINZA Denim Corp",
    rating: 4.6,
    reviews: [],
    description: "A gorgeous urban classic. Sourced in a modern charcoal hue, washed with mild bleach parameters for an industrial grunge outlook. Styled with silver zinc solid hardware.",
    specifications: [
      { label: "Hardware", value: "Heavy solid zinc cast buttons" }
    ],
    aPlusContent: {
      title: "Sleek Urban Coloration",
      description: "Subtle gray fade dynamics that play beautifully against neutral camel outerwear and leather chelsea models.",
      features: []
    },
    isTrending: false,
    isNewArrival: false,
    seoTitle: "Acid Wash Charcoal Grey Tapered Selvedge Jeans | CLINZA",
    metaDescription: "Elevated gray washy tapered selvedge denim pants. Features raw low tension cotton structure and clean double stitched flat hems."
  },
  {
    id: "prod-japanese-broken-jean",
    name: "Japanese Broken Twill Indigo Jeans",
    slug: "japanese-broken-twill-indigo-jeans",
    price: 4190,
    originalPrice: 6990,
    collection: ProductCollection.JEANS,
    category: "Selvedge Denim",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Deep Royal Dye", hex: "#1A2E40" }],
    sizes: ["32", "34", "36"],
    stockStatus: "Low Stock",
    sku: "CLN-JN-004",
    brand: "CLINZA Denim Corp",
    rating: 4.9,
    reviews: [],
    description: "Featuring a rare broken twill weave configuration (weaving left and right twills alternately) to prevent leg twist. Soft, exceptionally balanced feel out of the box with high horizontal dye variations.",
    specifications: [
      { label: "Weave Breed", value: "Authentic Symmetrical Broken Twill" }
    ],
    aPlusContent: {
      title: "Twist-Prevention Broken Weave",
      description: "Pioneered by vintage rodeo riders. Completely eliminates the inner leg seam twisting inward during heavy physical runs.",
      features: []
    },
    isTrending: true,
    isNewArrival: false,
    seoTitle: "Japanese Broken Twill Premium Indigo Jeans | CLINZA",
    metaDescription: "Authentic broken twill non-stretch selvedge denim pants. Crafted directly inside specialist Okayama factories using organic indigos."
  },
  {
    id: "prod-arctic-cream-jean",
    name: "Arctic Alabaster Clean Canvas Jeans",
    slug: "arctic-alabaster-clean-canvas-jeans",
    price: 3690,
    originalPrice: 5490,
    collection: ProductCollection.JEANS,
    category: "Selvedge Denim",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Alabaster White", hex: "#F2F0EA" }],
    sizes: ["30", "32", "34"],
    stockStatus: "In Stock",
    sku: "CLN-JN-005",
    brand: "CLINZA Denim Corp",
    rating: 4.5,
    reviews: [],
    description: "Unwashed raw ecru denim retaining its natural cotton seed speckles. Beautifully textured and dense, it represents a standard elegant choice for high-summer Italian ensembles.",
    specifications: [
      { label: "Color Way", value: "Unbleached Natural Ecru with seed flakes" }
    ],
    aPlusContent: {
      title: "Raw Unbleached Purity",
      description: "Skip chemical bleaches. Natural unbleached organic cotton reveals beautiful textured seed structures on close inspection.",
      features: []
    },
    isTrending: false,
    isNewArrival: true,
    seoTitle: "Arctic Alabaster Raw Ecru Denim Jeans | CLINZA",
    metaDescription: "Pristine, heavy unbleached off-white ecru denim pants. Perfect summer look. Pairs beautifully with linen resort spread-collar shirts."
  },

  // === PANTS (13 to 18) ===
  {
    id: "prod-sand-double-pant",
    name: "Sand Double Pleated Sartorial Trousers",
    slug: "sand-double-pleated-sartorial-trousers",
    price: 3290,
    originalPrice: 4990,
    collection: ProductCollection.PANTS,
    category: "Sartorial Pants",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [
      { name: "Sartorial Sand", hex: "#E6D7C3" },
      { name: "Double Olive", hex: "#556B2F" }
    ],
    sizes: ["30", "32", "34", "36"],
    stockStatus: "In Stock",
    sku: "CLN-PT-001",
    brand: "CLINZA Tailoring",
    rating: 4.9,
    reviews: [
      { id: "r6", rating: 5, userName: "Aditya Roy", comment: "The double pleat drape is outstanding. Extremely elegant side metal adjusters.", location: "Kolkata", verified: true, date: "2026-06-01" }
    ],
    description: "Reject mass-market flats. Our double-pleated sand trousers feature double forward pleats, an elevated long beltless waistband, and custom side adjusters for a snug, modern grip. Pre-hemmed with dual cuff turn-ups.",
    specifications: [
      { label: "Pleat Type", value: "Traditional Double Forward Pleat config" },
      { label: "Waistline", value: "Buttonless Beltless with side adjuster metal buckles" },
      { label: "Drop", value: "2-inch pre-stitched cuff turn-up (cuffed hem)" }
    ],
    aPlusContent: {
      title: "Extended Dual Forward Pleat",
      description: "Provides beautiful hip mobility while keeping the front silhouette completely flush. The drape line flows cleanly down the leg crease.",
      features: [
        { icon: "Feather", title: "Heavy Weight Summer Drills", description: "Woven in premium cotton-viscose-linen blend that holds dry crease forms for five days." }
      ]
    },
    isTrending: true,
    isNewArrival: false,
    seoTitle: "Sand Double Pleated Sartorial Pants | CLINZA Luxury",
    metaDescription: "Tailored beltless sand khaki double pleated dress trousers featuring adjustable side strap buckles, high rise, and cuffed hem."
  },
  {
    id: "prod-olive-double-pant",
    name: "Olive Drab Double Pleated Sartorial Trousers",
    slug: "olive-drab-double-pleated-sartorial-trousers",
    price: 3290,
    originalPrice: 4990,
    collection: ProductCollection.PANTS,
    category: "Sartorial Pants",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Olive Drab", hex: "#556B2F" }],
    sizes: ["30", "32", "34", "36"],
    stockStatus: "In Stock",
    sku: "CLN-PT-002",
    brand: "CLINZA Tailoring",
    rating: 4.7,
    reviews: [],
    description: "A gorgeous military slate olive shade. Fitted with a neat buttonless high-waist band. Beautifully frames white and sand shirts.",
    specifications: [
      { label: "Composition", value: "80% Long-staple Combed Cotton, 20% Hemp" }
    ],
    aPlusContent: {
      title: "Hemp Infused Longevity",
      description: "Woven under high density, hemp blends breathe beautifully and resist micro-fuzzing around heavy friction zones.",
      features: []
    },
    isTrending: false,
    isNewArrival: true,
    seoTitle: "Olive High-Rise Double Pleated Side Adjuster Pants | CLINZA",
    metaDescription: "Beautifully draped high-rise sartorial trousers in deep olive drab. Dual front pleat structure with adjustable brass slide-tabs."
  },
  {
    id: "prod-obsidian-double-pant",
    name: "Obsidian Black Sartorial Beltless Trousers",
    slug: "obsidian-black-sartorial-beltless-trousers",
    price: 3390,
    originalPrice: 5190,
    collection: ProductCollection.PANTS,
    category: "Sartorial Pants",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Obsidian Onyx", hex: "#0E0E0E" }],
    sizes: ["30", "32", "34", "36"],
    stockStatus: "In Stock",
    sku: "CLN-PT-003",
    brand: "CLINZA Tailoring",
    rating: 4.8,
    reviews: [],
    description: "Deep, pristine black matte finish, these cuffed trousers provide the ultimate baseline for monochromatic tailoring. Symmetrical forward creases have been heat-set permanently.",
    specifications: [
      { label: "Crease treatment", value: "Permanent sharp silicone-infused heat set" }
    ],
    aPlusContent: {
      title: "Matte Black Night Aesthetics",
      description: "The deep light-absorbing onyx tint holds structural integrity after multiple washes with zero chalking lines.",
      features: []
    },
    isTrending: true,
    isNewArrival: false,
    seoTitle: "Onyx Black Double Pleated High-Waisted Pants | CLINZA",
    metaDescription: "Shop luxury cuffed caddy grey or onyx black double-pleated sartorial trousers. Engineered for black-tie minimalism and high-rise ease."
  },
  {
    id: "prod-alabaster-cream-pant",
    name: "Ivory Alabaster Pleated Riviera Trousers",
    slug: "ivory-alabaster-pleated-riviera-trousers",
    price: 3495,
    originalPrice: 5490,
    collection: ProductCollection.PANTS,
    category: "Sartorial Pants",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Ivory cream", hex: "#FFFDF2" }],
    sizes: ["30", "32", "34", "36"],
    stockStatus: "Low Stock",
    sku: "CLN-PT-004",
    brand: "CLINZA Tailoring",
    rating: 4.9,
    reviews: [],
    description: "Spun in lightweight combed linen-tencel composites, this ivory linen trouser has an elegant weight that prevents it from feeling flimsy, holding a straight form effortlessly.",
    specifications: [
      { label: "Pocket lining", value: "Dense organic sateen soft sheets" }
    ],
    aPlusContent: {
      title: "Ultra Opaque Weave Tech",
      description: "Never see-through. Incorporates dual-layer backing weaves to block inner outlines fully while keeping airflow completely active.",
      features: []
    },
    isTrending: true,
    isNewArrival: true,
    seoTitle: "Ivory Off-White Pleated Riviera Trousers | CLINZA",
    metaDescription: "Tailored premium off-white alabaster high rise cuffed linen-tencel trousers. Completely opaque, modern side adjuster side-tabs."
  },
  {
    id: "prod-terracotta-pleated-pant",
    name: "Terracotta Earth Double Pleated Pants",
    slug: "terracotta-earth-double-pleated-pants",
    price: 3190,
    originalPrice: 4890,
    collection: ProductCollection.PANTS,
    category: "Sartorial Pants",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Terracotta Earth", hex: "#B85C42" }],
    sizes: ["30", "32", "34"],
    stockStatus: "In Stock",
    sku: "CLN-PT-005",
    brand: "CLINZA Tailoring",
    rating: 4.5,
    reviews: [],
    description: "Bring rich earth tones into your evening routine. Spun from high density organic cotton drill, it breathes beautifully and maintains its structured cuffs.",
    specifications: [
      { label: "Yarn Material", value: "95% combed cotton, 5% high stretch lycra" }
    ],
    aPlusContent: {
      title: "Subtle Flex Technology",
      description: "Features secret lycra nodes inside the waist belt that expand seamlessly during prolonged dining sessions.",
      features: []
    },
    isTrending: false,
    isNewArrival: false,
    seoTitle: "Terracotta Earth Orange Side Adjuster Trousers | CLINZA",
    metaDescription: "Stately warm rust Terracotta double pleated cuffed trousers. Adjustable side metal buckle-strap closures for standard custom fits."
  },
  {
    id: "prod-french-navy-double-pant",
    name: "French Admiral Navy Pleated Trousers",
    slug: "french-admiral-navy-pleated-trousers",
    price: 3290,
    originalPrice: 4990,
    collection: ProductCollection.PANTS,
    category: "Sartorial Pants",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Admiral Navy", hex: "#0F1A2B" }],
    sizes: ["30", "32", "34", "36"],
    stockStatus: "In Stock",
    sku: "CLN-PT-006",
    brand: "CLINZA Tailoring",
    rating: 4.8,
    reviews: [],
    description: "The gold standard of smart-casual trousers. Designed after clean British archival uniforms, complete with double-welt back pockets and authentic horn hardware buttons.",
    specifications: [
      { label: "Lining", value: "Full knee-lining with silky anti-friction rayon sheet" }
    ],
    aPlusContent: {
      title: "Silky Anti-Friction Inner Lining",
      description: "Rayon mesh panels run smoothly behind knees to bypass fabric friction when climbing stairs or during quick runs.",
      features: []
    },
    isTrending: false,
    isNewArrival: true,
    seoTitle: "French Admiral Navy Silk-Cotton Dress Pants | CLINZA",
    metaDescription: "Superbly tailored deep blue navy high rise cuffed dress pants. Featuring beltless buckle adjustment tabs and crease retention."
  },

  // === COMBOS (19 to 24) ===
  {
    id: "prod-linen-coord-combo",
    name: "Sartorial Sand linen Coordinates Set",
    slug: "sartorial-sand-linen-coordinates-set",
    price: 4990,
    originalPrice: 8980,
    collection: ProductCollection.COMBOS,
    category: "Premium Look Combos",
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Sartorial Sand", hex: "#E5D8C0" }],
    sizes: ["S", "M", "L", "XL"],
    stockStatus: "In Stock",
    sku: "CLN-CB-001",
    brand: "CLINZA Curated",
    rating: 4.9,
    reviews: [
      { id: "r7", rating: 5, userName: "Rohan Khanna", comment: "Breathtaking package. Buying the shirt and pants together saved a ton, fabric weight matches premium Italian boutiques.", location: "Delhi", verified: true, date: "2026-06-03" }
    ],
    description: "The absolute pinnacle of CLINZA coordinates. Includes our flagship camp-collar Italian resort sand linen overshirt paired perfectly with matching double-pleated sand pants. Sourced in matching Normandy flax lots for seamless color unity.",
    specifications: [
      { label: "Pack Inclusions", value: "1 × resort camp pocket shirt, 1 × double-pleated high cuffed trouser" },
      { label: "Pre-shrink Treatment", value: "Industrial wash pre-shrunk, pre-washed" }
    ],
    aPlusContent: {
      title: "Monochrome Sartorial Harmony",
      description: "Dye-matched meticulously from a single flax harvest bunch, ensuring completely uniform shade transitions between upper clothing and trousers.",
      features: [
        { icon: "Sparkles", title: "Instant Old-Money Drape", description: "Minimalist structures that make vacation dinners look effortlessly curated in 10 seconds." }
      ]
    },
    isTrending: true,
    isNewArrival: false,
    seoTitle: "Sartorial Sand Linen Shirt & Trouser Combo Coord Set | CLINZA",
    metaDescription: "Complete neutral sand-colored old-money linen coordinate set. Buy together and save 35%. Tailored Cuban neck shirt and pleated side buckle trousers."
  },
  {
    id: "prod-oasis-sage-combo",
    name: "The Emerald Oasis Sartorial Combo",
    slug: "the-emerald-oasis-sartorial-combo",
    price: 5290,
    originalPrice: 9280,
    collection: ProductCollection.COMBOS,
    category: "Premium Look Combos",
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Sage & Sand mix", hex: "#8FBC8F" }],
    sizes: ["M", "L", "XL"],
    stockStatus: "In Stock",
    sku: "CLN-CB-002",
    brand: "CLINZA Curated",
    rating: 4.8,
    reviews: [],
    description: "Our styling directors' absolute favorite recommendation. Packs a gorgeous Sage Green Mandarin collar resort shirt with the Classic double-pleated Sand Khaki trousers. Incredible color contrast for daytime luxury events.",
    specifications: [
      { label: "Shirt component", value: "Sage Green Resort spread Linen" },
      { label: "Pants component", value: "Sartorial Creased Sand drill trousers" }
    ],
    aPlusContent: {
      title: "Nature-Tone Color Blocking",
      description: "A seamless pairing of soft, earthen sage green fiber with deep champagne sand trousers. Elegant visual balance.",
      features: []
    },
    isTrending: true,
    isNewArrival: true,
    seoTitle: "Emerald Oasis Sage Green Shirt & Khaki Pants Combo | CLINZA",
    metaDescription: "Save heavily on the Emerald Oasis combination package. Sophisticated Sage linen shirt paired cleanly with double pleated sand cuffed trousers."
  },
  {
    id: "prod-naval-monolith-combo",
    name: "The Naval Monolith Indigo Set",
    slug: "the-naval-monolith-indigo-set",
    price: 5495,
    originalPrice: 9980,
    collection: ProductCollection.COMBOS,
    category: "Premium Look Combos",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Rich Admiral Navy mix", hex: "#1A2A3A" }],
    sizes: ["M", "L", "XL"],
    stockStatus: "In Stock",
    sku: "CLN-CB-003",
    brand: "CLINZA Curated",
    rating: 4.7,
    reviews: [],
    description: "Our absolute most muscular raw pairing. Sells a long placket deep navy spread linen shirt beautifully matched over raw cuffed blue line selvedge denim jeans. Extremely crisp evening armor.",
    specifications: [
      { label: "Upper", value: "Navy Club Spread Linen Shirt" },
      { label: "Lower", value: "13.5 Oz raw Japanese indigo selvedge jeans" }
    ],
    aPlusContent: {
      title: "High-Contrast Indigo Matrix",
      description: "Combines the organic, uneven slub texture of high density navy flax cleanly against the structural deep indigo selvedge wall.",
      features: []
    },
    isTrending: false,
    isNewArrival: false,
    seoTitle: "Naval Indigo Monolith Linen Shirt & Selvedge Denim Combo | CLINZA",
    metaDescription: "The absolute evening smart look. structured high contrast indigo monolith outfit. Navy flax linen shirt paired with raw Japanese selvedge denim."
  },
  {
    id: "prod-arctic-royale-combo",
    name: "The Alabaster Royalty Casual Combo",
    slug: "the-alabaster-royalty-casual-combo",
    price: 5790,
    originalPrice: 10480,
    collection: ProductCollection.COMBOS,
    category: "Premium Look Combos",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "White & Cream mix", hex: "#FDFDFD" }],
    sizes: ["S", "M", "L", "XL"],
    stockStatus: "In Stock",
    sku: "CLN-CB-004",
    brand: "CLINZA Curated",
    rating: 4.9,
    reviews: [],
    description: "Ultimate Mediterranean yacht look. Bundles our pristine Italian Alabaster White long-sleeve linen shirt cleanly matched over unbleached raw Ecru canvas selvedge jeans. Breathtaking cream contrast.",
    specifications: [
      { label: "Upper", value: "Pristine white European linen shirt" },
      { label: "Lower", value: "Natural speckle raw Ecru selvedge jeans" }
    ],
    aPlusContent: {
      title: "Alabaster Old Money Layering",
      description: "Uncompromised white-on-cream coordinates that bypass standard bright coloring for quiet, elevated luxury confidence.",
      features: []
    },
    isTrending: true,
    isNewArrival: true,
    seoTitle: "Alabaster Royalty White Linen Shirt & Raw Ecru Jean Combo | CLINZA",
    metaDescription: "Mediterranean pure ivory beach combo. Pristine Italian linen white shirt perfectly paired over natural cotton speckle ecru raw jeans."
  },
  {
    id: "prod-clay-drab-combo",
    name: "Terracotta Sunset & Slate Olive Set",
    slug: "terracotta-sunset-slate-olive-set",
    price: 4890,
    originalPrice: 8980,
    collection: ProductCollection.COMBOS,
    category: "Premium Look Combos",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Terracotta & Olive mix", hex: "#C25D43" }],
    sizes: ["M", "L", "XL"],
    stockStatus: "In Stock",
    sku: "CLN-CB-005",
    brand: "CLINZA Curated",
    rating: 4.6,
    reviews: [],
    description: "An incredibly warm earth-tone combo. Packs the micro-tencel Terracotta Sunset Resort linen shirt over our deep Olive Drab side adjuster cuffed trousers. Ultimate resort style champion.",
    specifications: [
      { label: "Upper", value: "Terracotta Sunset camp shirt" },
      { label: "Lower", value: "Military finish hemp-cotton side adjuster trousers" }
    ],
    aPlusContent: {
      title: "Warm Earth Matrix",
      description: "Designed specifically to elevate intermediate brown and wheat skin tones with visual warmth and highly rich contrasts.",
      features: []
    },
    isTrending: false,
    isNewArrival: false,
    seoTitle: "Terracotta Orange Shirt & Olive Drab Pants Combo | CLINZA",
    metaDescription: "Earth tone high resort combination set. Terracotta copper lightweight shirt combined with tailored olive pleated trousers."
  },
  {
    id: "prod-onyx-monolith-combo",
    name: "The Obsidian Monochromatic Combo",
    slug: "the-obsidian-monochromatic-combo",
    price: 5390,
    originalPrice: 9380,
    collection: ProductCollection.COMBOS,
    category: "Premium Look Combos",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Onyx Black mix", hex: "#000000" }],
    sizes: ["S", "M", "L", "XL"],
    stockStatus: "Low Stock",
    sku: "CLN-CB-006",
    brand: "CLINZA Curated",
    rating: 4.8,
    reviews: [],
    description: "For the elite rebel stylist. Packs our matte-black Obsidian Linen Shirt cleanly over our structured Obsidian Black high waisted double pleated trousers. Absolutely striking nighttime monolith armor.",
    specifications: [
      { label: "Upper", value: "Matte black European linen spread collar shirt" },
      { label: "Lower", value: "Sharp permanent crease high rise black cuffed trousers" }
    ],
    aPlusContent: {
      title: "High Precision Monochromatic Depth",
      description: "Combines two matching black finishes of distinct textures to reveal sharp structural shoulders and clean, tapering lines.",
      features: []
    },
    isTrending: true,
    isNewArrival: true,
    seoTitle: "Obsidian All Black Monochromatic Coordinate Set | CLINZA",
    metaDescription: "The ultimate monochrome black statement combo. Buy the Obsidian Onyx matte shirt with pleated high-rise trousers at 35% discount."
  },

  // === SHOES (25 to 30) ===
  {
    id: "prod-chelsea-suede-boot",
    name: "Handcrafted Suede Chelsea Boots",
    slug: "handcrafted-suede-chelsea-boots",
    price: 4890,
    originalPrice: 7990,
    collection: ProductCollection.FOOTWEAR,
    category: "Luxury Footwear",
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [
      { name: "Castagna Tan", hex: "#8B5A2B" },
      { name: "Matte Black Suede", hex: "#222222" }
    ],
    sizes: ["7", "8", "9", "10"],
    stockStatus: "In Stock",
    sku: "CLN-SH-101",
    brand: "CLINZA Calzolai",
    rating: 4.9,
    reviews: [
      { id: "r8", rating: 5, userName: "Tushar Kapoor", comment: "Exceptional suede texture. Fits incredibly snug. Perfect width around arches.", location: "Pune", verified: true, date: "2026-06-02" }
    ],
    description: "Meticulously lasted by hand inside generational workspaces, our Chelsea boots feature premium Italian calfskin suede, robust water-repellent pre-treatment, expandable side stretch elastic walls, and a clean Blake-stitched shock absorbing leather sole.",
    specifications: [
      { label: "Leather Origin", value: "Tuscan Castagna calf-suede sheets" },
      { label: "Sole Assembly", value: "Hand Blake-stitch construction with anti-skid rubber pads" },
      { label: "Heel Height", value: "1.18 inches reinforced stack-leather" }
    ],
    aPlusContent: {
      title: "Premium Tuscan Calfskin Suede",
      description: "Hand-brushed extensively to create a velvet-smooth pile. Pre-treated under specialized waterproofing layers so boots resist sudden spot water marks.",
      features: [
        { icon: "Shield", title: "Blake Stitch Weft", description: "Enables elegant, close-to-edge profile cuts that mold completely to your feet shape after ten walks." }
      ]
    },
    isTrending: true,
    isNewArrival: false,
    seoTitle: "Handcrafted Suede Chelsea Boots in Castagna Tan | CLINZA",
    metaDescription: "Indulge in Italian leather mastercraft. Handmade tan calfskin suede chelsea boots featuring blake-stitched comfort soles and water repellency."
  },
  {
    id: "prod-belgian-suede-loafer",
    name: "Castagna Suede Belgian Loafers",
    slug: "castagna-suede-belgian-loafers",
    price: 4490,
    originalPrice: 6990,
    collection: ProductCollection.FOOTWEAR,
    category: "Luxury Footwear",
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Castagna Tan", hex: "#8B5A2B" }],
    sizes: ["7", "8", "9", "10"],
    stockStatus: "In Stock",
    sku: "CLN-SH-102",
    brand: "CLINZA Calzolai",
    rating: 4.8,
    reviews: [],
    description: "The ultimate old-money slip-on. Features a crisp forward leather piping layout, a flexible minimal heel, and soft structural footbeds that render a glove-like walking sensation without socks.",
    specifications: [
      { label: "Sartorial Trim", value: "Classic Belgian piping apron" }
    ],
    aPlusContent: {
      title: "Glove Like Unstructured Fit",
      description: "Features zero heavy plastic counters inside the heels, allowing the premium calfskin to collapse and wrap around feet seamlessly.",
      features: []
    },
    isTrending: true,
    isNewArrival: true,
    seoTitle: "Castagna Suede Belgian Loafers | CLINZA Luxury",
    metaDescription: "Classic handcrafted brown suede Belgian shoes featuring refined piping trim and ultra-comfy unstructured walk profiles for loafers."
  },
  {
    id: "prod-white-calfskin-sneaker",
    name: "Classic Alabaster Calfskin Court Sneakers",
    slug: "classic-alabaster-calfskin-court-sneakers",
    price: 3890,
    originalPrice: 5990,
    collection: ProductCollection.FOOTWEAR,
    category: "Luxury Footwear",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Pristine White", hex: "#FFFFFF" }],
    sizes: ["7", "8", "9", "10"],
    stockStatus: "In Stock",
    sku: "CLN-SH-103",
    brand: "CLINZA Calzolai",
    rating: 4.7,
    reviews: [],
    description: "Crafted with butter-soft full grain white calfskin leather linings. Anchored over robust Margom-style solid rubber cup soles. Pristine minimalist court aesthetic that matches tailored denims perfectly.",
    specifications: [
      { label: "Leather", value: "Full-grain select calfskin hide" }
    ],
    aPlusContent: {
      title: "Margom-Class Solid Rubber Cups",
      description: "High density natural rubber bases that do not peel or yellower. Sewn completely through upper hides for absolute structural integrity.",
      features: []
    },
    isTrending: false,
    isNewArrival: false,
    seoTitle: "Minimalist Full Grain White Calfskin Court Sneakers | CLINZA",
    metaDescription: "Shop luxury pristine white low-top sneakers. Fully leather-lined, handcrafted in calf-hides with heavy industrial Margom rubber cup-soles."
  },
  {
    id: "prod-oxford-tan-loafer",
    name: "Heritage Oxford Tan Penny Loafers",
    slug: "heritage-oxford-tan-penny-loafers",
    price: 4990,
    originalPrice: 7490,
    collection: ProductCollection.FOOTWEAR,
    category: "Luxury Footwear",
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Heritage Cognac Tan", hex: "#A0522D" }],
    sizes: ["8", "9", "10"],
    stockStatus: "In Stock",
    sku: "CLN-SH-104",
    brand: "CLINZA Calzolai",
    rating: 4.8,
    reviews: [],
    description: "Highly polished grain cognac leather, lasted slowly over historical British rounded profiles. Form-holding and extremely commanding under pleated Admiral trousers.",
    specifications: [
      { label: "Assembly", value: "Traditional Goodyear welted" }
    ],
    aPlusContent: {
      title: "Goodyear Welt Architecture",
      description: "Waterproofed lock threads run across inner structures to enable resoling after five years of daily city grinds.",
      features: []
    },
    isTrending: true,
    isNewArrival: false,
    seoTitle: "Goodyear Welted Tan Leather Penny Loafers | CLINZA",
    metaDescription: "Elite Cognac tan glazed leather penny loafers. Traditional Goodyear stitch construct with dual thick leather soles and stacked heels."
  },
  {
    id: "prod-espresso-tassel-loafer",
    name: "Espresso Glazed Calfskin Tassel Loafers",
    slug: "espresso-glazed-calfskin-tassel-loafers",
    price: 4690,
    originalPrice: 7290,
    collection: ProductCollection.FOOTWEAR,
    category: "Luxury Footwear",
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Espresso Brown", hex: "#3D2B1F" }],
    sizes: ["7", "8", "9", "10"],
    stockStatus: "In Stock",
    sku: "CLN-SH-105",
    brand: "CLINZA Calzolai",
    rating: 4.9,
    reviews: [],
    description: "A deep, glazed dark espresso bean colorway. Decorated with twin hand-pleated leather tassels suspended off thin leather side tunnels. Striking old school visual finish.",
    specifications: [
      { label: "Aesthetic features", value: "Hand bound twins leather side-tassels" }
    ],
    aPlusContent: {
      title: "Generational Apron Stitching",
      description: "The forward apron seam is sewn completely by hand over raw lasts using a unique twin bridge needle thread.",
      features: []
    },
    isTrending: false,
    isNewArrival: true,
    seoTitle: "Glazed Espresso Brown Leather Tassel Loafers | CLINZA",
    metaDescription: "Rich espresso brown full grain leather tassel loafers. Sleek formal dress profile handcrafted inside specialized Italian style units."
  },
  {
    id: "prod-chelsea-black-boot",
    name: "Obsidian Onyx Full-Grain Chelsea Boots",
    slug: "obsidian-onyx-full-grain-chelsea-boots",
    price: 4990,
    originalPrice: 8290,
    collection: ProductCollection.FOOTWEAR,
    category: "Luxury Footwear",
    images: [
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600"
    ],
    colors: [{ name: "Obsidian Black", hex: "#111111" }],
    sizes: ["7", "8", "9", "10"],
    stockStatus: "In Stock",
    sku: "CLN-SH-106",
    brand: "CLINZA Calzolai",
    rating: 4.8,
    reviews: [],
    description: "Pristine matte black glazed leather, these full-height boots capture clean rock-and-roll visual proportions. Dual-pull elastic ribs ensure they slide on cleanly.",
    specifications: [
      { label: "Ribbing", value: "Standard industrial strength spandex double weave" }
    ],
    aPlusContent: {
      title: "Matte Black Glaze Shield",
      description: "Thick oil-tanned calf leather hides are highly resistant to moisture scuffs. Shines beautifully under minimal buffing cloth strokes.",
      features: []
    },
    isTrending: false,
    isNewArrival: false,
    seoTitle: "Black Glazed Leather Chelsea Dress Boots | CLINZA",
    metaDescription: "Dapper all-black calf-leather chelsea boots featuring high-traction dress soles and Blake architecture for elite modern wardrobes."
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "blog-linen-guide",
    slug: "linen-layering-art-fashion-luxury",
    title: "The Art of Sartorial Linen: Summer Layering & Fabric Selection",
    summary: "Discover why European flax linen remains the absolute pinnacle of warm-weather premium clothing, and how to style double pleats without looking disheveled.",
    content: `
# The Art of Sartorial Linen: Summer Layering & Fabric Selection

Linen, forged from the humble European flax plant (*Linum usitatissimum*), carries a sartorial pedigree older than the pharaohs. Historically reserved for priests and royalty, it stands in the modern era as the ultimate visual shorthand for effortless, luxury lifestyle. 

Yet, for many premium buyers, linen remains a territory of hesitation. "Doesn't it fold and crease too easily?" "How can I wear linen to an evening cocktail function without looking disheveled?" 

In this comprehensive style guide, we dismantle the myths and map the exact sartorial coordinates to pull off high-end linen cleanly.

## 1. Understanding Flax Pedigree: The European Advantage
The world's absolute finest linen is harvested along the coastal maritime strips of Northern France, Belgium, and the Netherlands. The unique moisture regulation, rich soils, and generational weaver knowledge yield **long-staple fibers**.

Compared to short-chain cotton strings, European flax fibers possess:
- Exceptional tensile strength (they actually harden and soften simultaneously during washes)
- Ultra-high moisture absorbency (drawing perspiration off skin instantly)
- Distinct organic slub texture that catches light with subtle luxury gradients

At **CLINZA**, we hand-select European flax linen engineered directly at 140 GSM density—creating the dream balance of weighted structural fall and maximum breathability.

---

## 2. Waist Silhouette Rules: Buckles Over Belt Loops
If you are still wearing linen trousers with bulky leather belts, you are disrupting the clean, visual continuation of your frame. 

Sartorial trousers employ **side adjusters** with metal buckles and extended waistband buttons instead of belt loops. 

### Why Side Adjusters are Mandatory:
1. **Clean Continuous Line**: Buckles pull the hips inward flush, maintaining an uninterrupted line between your linen shirt structure and trouser.
2. **Double Pleating Volume**: Trousers with double forward pleats require a high rise. Belts crush these pleats. Side adjusters allow the pleats to fall perfectly from the center hip line, giving you room and impeccable drape.

---

## 3. The Resort Color Palette
When styling resort wear, look to nature’s raw neutrals:
- **Cream & Alabaster White**: Complete timeless classics.
- **Sage Green**: Extremely modern shade that represents premium calm.
- **Oatmeal Tan**: Perfect bridge color that coordinates flawlessly with darker raw denims.

Pair a sage green Cuban resort shirt cleanly over a crisp white ribbed tank, styled with a double pleated sand trouser and tan Chelsea suede boots.

---

## 4. Care Invariants: How to Treat Your Linen
Linen is remarkably forgiving if you understand one rule: **Never blast it with dry heat.**
1. **Hand Wash Cold or Gentle Cycle**: Prevents fiber breakage.
2. **Damp Hang Dry**: Shake the item vigorously while wet to naturally reset the flax weave, then hang to air dry. 
3. **Slight Creases are Premium**: Embrace the organic wrinkles. An authentic, lived-in linen crease is a badge of organic fabric authenticity. If a flat press is desired, steam or iron while the fabric is slightly damp.
    `,
    coverImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
    category: "Style Guide",
    publishedAt: "2026-06-05T08:30:00Z",
    author: {
      name: "Alessandro Vanti",
      avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200",
      bio: "Sartorial Designer & Fashion Columnist based in Milan. Alessandro has spent 15 years consulting for elite European menswear boutiques."
    },
    tags: ["Linen", "Resort Wear", "Summer Trends", "Tailoring"],
    readTime: "5 min read"
  },
  {
    id: "blog-denim-heritage",
    slug: "selvedge-denim-raw-heritage-indigo",
    title: "Selvedge Denim Demystified: The Vintage Loom Revolution",
    summary: "An intensive dive into shuttle looms, the redline ticker ID, and how raw organic indigo cotton creates a tailored narrative of your life.",
    content: `
# Selvedge Denim Demystified: The Vintage Loom Revolution

In an era of hyper-fast polyester stretching, raw **Selvedge Denim** represents a bold return to slow, industrial craftsmanship. But what makes selvedge jeans fetch a premium tier, and why should you care about vintage looms?

## 1. What Exactly is a \"Selvedge\"?
The word *selvedge* is derived from "self-edge". It refers to the finished, clean edge of denim fabric that prevents it from unraveling. 

In mass-market denim production, massive projectile looms weave fabric at high speed, cut the edges raw, and overlock-stitch them. This results in standard frayed inner pants walls.

In classic selvedge denim:
- Vintage **shuttle looms** (like Toyoda model G under the Japanese heritage factories) weave slowly, carrying a single weft thread continuously back and forth.
- The fabric edge is sealed with a beautiful, woven colored ticker yarn (famously the Redline ticker).
- When you cuff your jeans, this pristine, contrasting edge is visible to everyone around.

---

## 2. Raw Denim: The Ultimate Personal Canvas
Mass-market jeans are distressed inside factories using heavy hand-scraping, sandblasting, and chemical bleach. While convenient, it severely degrades the longevity of the cotton fiber and leaves a replica look.

Raw (unwashed) denim is dyed, woven, stitched, and shipped directly without any washing.

### The Personal Patina Process:
When you wear raw selvedge, the dark indigo fades specifically where you form creases. 
- Your phone outline leaves a personalized pocket mark.
- Your walking pattern creates horizontal "whiskers" around your thighs.
- Your sitting folds create Honeycomb meshlines behind your knees.

No machine on earth can replicate the beautiful, high-contrast fading patterns your body sculpts into heavy-weight cotton.

---

## 3. Styling Raw Denim Cleanly
A heavy 13.5 Oz raw denim jean is a highly versatile garment.
- **Casual Minimalist**: Pair with a crisp heavyweight white tee and clean white leather retro sneakers.
- **Sartorial Smart-Casual**: Pair with a tailored classic white linen shirt tucked in, topped off with suede Chelsea boots. The organic rustic texture of the linen coordinates perfectly with the raw density of the denim.
    `,
    coverImage: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600",
    category: "Fashion",
    publishedAt: "2026-06-01T10:15:00Z",
    author: {
      name: "Rohan Kapoor",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      bio: "Menswear consultant & historical denim archivist with a deep love for vintage textile machinery and raw indigo."
    },
    tags: ["Selvedge", "Raw Denim", "Heritage Craft", "Styling Tips"],
    readTime: "4 min read"
  }
];

export const INITIAL_REVIEWS = [
  {
    id: "rev-long-1",
    rating: 5,
    userName: "Samarth Nair",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100",
    comment: "I used the AI Style Analyzer on Clinza and it recommended Sand Double Pleat pants with Classic White Linen shirt. I bought the combo and the fit is absolutely breathtaking! Best shopping experience ever.",
    location: "Bangalore",
    verified: true
  },
  {
    id: "rev-long-2",
    rating: 5,
    userName: "Aditya Mehta",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
    comment: "Stunning quality. The premium packaging makes you feel like you bought a luxury Swiss watches product. Highly recommend the automatic watch and suede chelsea boots.",
    location: "Mumbai",
    verified: true
  },
  {
    id: "rev-long-3",
    rating: 5,
    userName: "Ishaan Goel",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100",
    comment: "Hands down the best linen shirts in India. Unbelievably soft out of the box, doesn't scratch at all like cheap linen. Very fast COD delivery too.",
    location: "Gurugram",
    verified: true
  }
];
