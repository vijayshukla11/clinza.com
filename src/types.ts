/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProductCollection {
  SHIRTS = "shirts",
  JEANS = "jeans",
  PANTS = "pants",
  COMBOS = "combos",
  FOOTWEAR = "footwear",
  ACCESSORIES = "accessories"
}

export interface Review {
  id: string;
  rating: number;
  userName: string;
  avatarUrl?: string;
  comment: string;
  location: string;
  userLocation?: string;
  helpfulCount?: number;
  verified: boolean;
  date: string;
}

export type APlusSectionType = 
  | "hero_story" 
  | "image_text" 
  | "feature_grid" 
  | "detail_story" 
  | "style_guide" 
  | "full_banner" 
  | "spec_table" 
  | "faq";

export interface APlusHeroStorySection {
  type: "hero_story";
  id: string;
  eyebrow?: string;
  heading: string;
  description?: string;
  image: string;
  badges?: string[];
}

export interface APlusImageTextSection {
  type: "image_text";
  id: string;
  layout?: "image_left" | "image_right";
  eyebrow?: string;
  heading: string;
  description: string;
  image: string;
  badge?: string;
}

export interface APlusFeatureItem {
  icon?: string;
  image?: string;
  title: string;
  description: string;
}

export interface APlusFeatureGridSection {
  type: "feature_grid";
  id: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
  columns?: 3 | 4;
  items: APlusFeatureItem[];
}

export interface APlusDetailStorySection {
  type: "detail_story";
  id: string;
  eyebrow?: string;
  heading: string;
  description?: string;
  image: string;
  details: string[];
}

export interface APlusLookItem {
  lookNumber?: string | number;
  lookTitle: string;
  occasion?: string;
  description?: string;
  image: string;
}

export interface APlusStyleGuideSection {
  type: "style_guide";
  id: string;
  eyebrow?: string;
  heading: string;
  description?: string;
  looks: APlusLookItem[];
}

export interface APlusFullBannerSection {
  type: "full_banner";
  id: string;
  eyebrow?: string;
  heading: string;
  description?: string;
  image: string;
}

export interface APlusSpecItem {
  label: string;
  value: string;
}

export interface APlusSpecTableSection {
  type: "spec_table";
  id: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
  specs: APlusSpecItem[];
}

export interface APlusFaqItem {
  question: string;
  answer: string;
}

export interface APlusFaqSection {
  type: "faq";
  id: string;
  eyebrow?: string;
  heading?: string;
  items: APlusFaqItem[];
}

export type APlusSection = 
  | APlusHeroStorySection
  | APlusImageTextSection
  | APlusFeatureGridSection
  | APlusDetailStorySection
  | APlusStyleGuideSection
  | APlusFullBannerSection
  | APlusSpecTableSection
  | APlusFaqSection;

export interface APlusContentData {
  enabled?: boolean;
  sections?: APlusSection[];
  title?: string;
  description?: string;
  features?: any[];
}

export interface LegacyAPlusSection {
  title: string;
  description: string;
  imageUrl?: string;
  features: { icon: string; title: string; description: string }[];
}

export interface ProductVariant {
  id: string;
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  barcode?: string;
  stockQuantity: number;
  price?: number; // Override price if different for specific variant
  originalPrice?: number; // MRP
  status?: "In Stock" | "Low Stock" | "Out of Stock" | "Active" | "Inactive";
  images?: string[]; // Color/variant specific image gallery
}

export interface MasterProductAttribute {
  id: string;
  type: "color" | "size" | "fabric" | "fit" | "pattern" | "sleeve" | "occasion" | "season";
  name: string;
  code?: string; // hex code for color, abbreviation for size
  displayOrder?: number;
  active?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number; // MRP
  collection: ProductCollection;
  category: string; // e.g., "Premium Linen", "Regular Fit Jeans"
  images: string[];
  hoverImage?: string;
  view360Images?: string[];
  videoUrl?: string;
  imageAltTexts?: Record<string, string>; // Map of image URL/index to accessibility alt text
  colors: { name: string; hex: string }[];
  sizes: string[];
  variants?: ProductVariant[]; // Advanced variant matrix (SKU, Stock, Images per Size/Color)
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  stockQuantity?: number;
  lowStockLimit?: number;
  sku: string;
  barcode?: string;
  brand: string;
  rating: number;
  reviews: Review[];
  reviewsCount?: number;
  description: string;
  shortDescription?: string;
  
  // Apparel Specifications
  fabric?: string;
  fit?: string;
  pattern?: string; // Solid, Striped, Printed, Checked, Textured
  sleeve?: string; // Full Sleeve, Half Sleeve, Sleeveless, Roll-up
  occasion?: string; // Casual, Formal, Resort/Vacation, Party, Evening
  season?: string; // Spring/Summer, Autumn/Winter, All-Season, Resort Collection
  countryOfOrigin?: string; // India, Italy, Turkey, etc.
  fabricCare?: string;
  shippingInfo?: string;
  
  faqs?: { question: string; answer: string }[];
  specifications: { label: string; value: string }[];
  aPlusContent?: APlusContentData;
  isTrending?: boolean;
  isNewArrival?: boolean;
  trendingRank?: number; // Sequence number #1, #2, #3, #4...
  demandBadge?: string; // e.g. "No. 1 High Demand", "No. 2 Best Seller"
  merchandisingSlugs?: string[]; // Merchandising collection slugs e.g. ["best-sellers", "summer-collection"]
  promotionIds?: string[]; // Promotion IDs assigned to product
  
  // Advanced SEO Metadata
  seoTitle?: string;
  metaDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  seoImage?: string;
  jsonLdSchema?: string;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  variantId?: string;
  variantSku?: string;
  isFreeItem?: boolean;
  appliedOffer?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export type OrderStatus = 
  | "Pending" 
  | "Confirmed" 
  | "Packed" 
  | "Shipped" 
  | "Out For Delivery" 
  | "Delivered" 
  | "Cancelled" 
  | "Returned" 
  | "Refunded";

export interface Order {
  id: string; // Order Number CLI-XXXX
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal?: number;
  discount?: number;
  shippingFee?: number;
  shipping_fee?: number;
  tax?: number;
  couponCode?: string | null;
  coupon_code?: string | null;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "COD";
  trackingHistory: { status: string; timestamp: string; description: string }[];
  trackingNumber?: string;
  courierPartner?: string;
  createdAt: string;
  paymentStatus?: "Pending" | "Paid" | "Refunded";
  notes?: { id: string; user: string; text: string; date: string }[];
}

export interface InventoryLogItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  user: string;
  date: string;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  reason: string;
  warehouse?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string; // Markdown supported
  coverImage: string;
  category: "Fashion" | "Lifestyle" | "Style Guide" | "Premium Living" | "Seasonal Trends";
  publishedAt: string;
  author: {
    name: string;
    avatarUrl: string;
    bio: string;
  };
  tags: string[];
  readTime: string;
}

export interface AIAnalysisResult {
  faceShape: string;
  skinTone: string;
  bodyType: string;
  fashionPreference: string;
  colorCompatibility: {
    recommended: string[];
    avoid: string[];
  };
  styleArchetype: string;
  rationale: string;
  recommendedCollections: string[];
  recommendedFits: string[];
  recommendedColors: string[];
}

export interface HomeSlide {
  id: number;
  badge: string;
  subtitle: string;
  title: string;
  description: string;
  image: string;
  route: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export interface OfferItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  discount: string;
  buttonText: string;
  link: string;
  badge: string;
  startDate: string;
  endDate: string;
}

export interface NewArrivalsFeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface NewArrivalsBannerConfig {
  isPublished?: boolean;
  label: string;
  heading: string;
  headingHighlight?: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  features: NewArrivalsFeatureItem[];
}

export interface LookbookSectionConfig {
  isPublished?: boolean;
  label: string;
  heading: string;
  headingLine2?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  mainImage: string;
  secondaryImage?: string;
}

export interface SummerHighlightItem {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

export interface SummerEssentialsSectionConfig {
  isPublished?: boolean;
  label: string;
  heading: string;
  headingHighlight?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  highlights: SummerHighlightItem[];
}

export interface HomepageSectionConfig {
  id: string;
  type: 
    | "hero-slider"
    | "features-bar"
    | "collections-grid"
    | "best-sellers" 
    | "trending-leaderboard" 
    | "new-arrivals-banner" 
    | "lookbook" 
    | "summer-essentials" 
    | "offers" 
    | "trending-grid" 
    | "new-arrivals-grid" 
    | "merchandising-collection" 
    | "journal-highlight";
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaUrl?: string;
  merchandisingSlug?: string;
  banner?: string;
  productLimit?: number;
  active: boolean;
  displayOrder: number;
}

export interface HomepageConfig {
  slides: HomeSlide[];
  trendingTitle: string;
  trendingSubtitle: string;
  editorialTitle: string;
  editorialSubtitle: string;
  editorialDesc: string;
  editorialImg?: string;
  offers?: OfferItem[];
  newsletter?: {
    enabled: boolean;
    heading: string;
    description: string;
    buttonText: string;
    bgImage: string;
    bgColor: string;
  };
  newArrivalsBanner?: NewArrivalsBannerConfig;
  lookbookSection?: LookbookSectionConfig;
  summerEssentialsSection?: SummerEssentialsSectionConfig;
  homepageSections?: HomepageSectionConfig[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  banner: string;
  thumbnail?: string;
  altText?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  displayOrder?: number;
  featured?: boolean;
  showOnHomepage?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MerchandisingCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner: string;
  displayOrder: number;
  active: boolean;
  productIds?: string[];
}

export interface Promotion {
  id: string;
  name: string;
  banner: string;
  offerType: string;
  startDate: string;
  endDate: string;
  active: boolean;
  landingPage: string;
  description?: string;
  discountValue?: string;
  displayOrder?: number;
  productIds?: string[];
}

export interface CollectionMaster {
  id: string;
  name: string;
  slug: string;
  banner: string;
  thumbnail: string;
  description: string;
  shortDescription?: string;
  buttonText?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  altText?: string;
  displayOrder: number;
  featured: boolean;
  showOnHomepage?: boolean;
  isActive?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "flat" | "free_shipping";
  value: number;
  minCartValue: number;
  expiryDate: string;
}

export interface CustomerTimelineItem {
  id: string;
  type: "order" | "support" | "note" | "loyalty" | "login" | "status";
  title: string;
  description: string;
  timestamp: string;
}

export interface CustomerNote {
  id: string;
  user: string;
  text: string;
  date: string;
}

export interface MarketingConsent {
  emailOptIn: boolean;
  smsOptIn: boolean;
  whatsappOptIn: boolean;
  newsletter: boolean;
}

export interface RecentlyViewedItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  viewedAt: string;
}

export interface SupportRequestItem {
  id: string;
  subject: string;
  status: "Pending" | "In Progress" | "Resolved";
  date: string;
  priority?: "Low" | "Medium" | "High";
  message?: string;
}

export interface CouponUsageItem {
  code: string;
  date: string;
  discountAmount: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  status?: "Active" | "Blocked" | "Inactive";
  tags?: string[]; // VIP, Wholesale, Retail, High Value, First Order, Repeat Customer, Inactive
  createdAt?: string;
  lastOrderDate?: string;
  totalOrders?: number;
  totalSpend: number;
  avgOrderValue?: number;
  addressBook: string[];
  shippingAddresses?: Address[];
  billingAddresses?: Address[];
  wishlist: string[];
  recentlyViewed?: RecentlyViewedItem[];
  timeline?: CustomerTimelineItem[];
  notes?: CustomerNote[];
  // Loyalty
  rewardPoints?: number;
  storeCredit?: number;
  referralCode?: string;
  couponHistory?: CouponUsageItem[];
  // Marketing
  marketingConsent?: MarketingConsent;
  // Admin flags
  isBlocked?: boolean;
  blockReason?: string;
  supportRequests?: SupportRequestItem[];
}

export interface ReviewItem {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  userName: string;
  comment: string;
  location: string;
  approved: boolean;
  date: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  customerLocation: string;
  customerEmail?: string;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  reviewImage?: string;
  reviewGallery?: string[];
  verifiedPurchase: boolean;
  displayOrder: number;
  helpfulCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "document";
  size: string;
  createdAt: string;
  folder?: string;
}

// Shopify style Theme Editor settings
export interface ThemeSlide {
  id: string;
  desktopImage: string;
  mobileImage: string;
  badge: string;
  subtitle: string;
  title: string;
  description: string;
  button1Text: string;
  button1Link: string;
  button2Text: string;
  button2Link: string;
  bgOverlay: number; // percentage opacity
  textPosition: "left" | "center" | "right";
  textColor: string;
  enabled: boolean;
  scheduleStart?: string;
  scheduleEnd?: string;
}

export interface FeaturedCollectionSection {
  enabled: boolean;
  title: string;
  description: string;
  collectionIds: string[];
  layout: "grid" | "carousel";
}

export interface TrendingProductsSection {
  enabled: boolean;
  title: string;
  selectionMethod: "automatic" | "manual";
  productIds: string[];
}

export interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesSectionConfig {
  enabled: boolean;
  cards: FeatureCard[];
}

export interface TestimonialConfig {
  id: string;
  name: string;
  image: string;
  rating: number;
  text: string;
}

export interface BlogSectionConfig {
  enabled: boolean;
  heading: string;
  selectedBlogIds: string[];
  showFeaturedFirst: boolean;
}

export interface NewsletterSectionConfig {
  enabled: boolean;
  heading: string;
  description: string;
  buttonText: string;
  bgImage: string;
  bgColor: string;
}

export interface FooterConfig {
  companyInfo: string;
  address: string;
  email: string;
  phone: string;
  facebookLink: string;
  instagramLink: string;
  twitterLink: string;
  whatsappLink: string;
  copyrightText: string;
}

export interface HeaderConfig {
  logoUrl: string;
  menuItems: { label: string; route: string }[];
  enableMegaMenu: boolean;
  enableSearchBar: boolean;
  enableCartIcon: boolean;
  enableWishlistIcon: boolean;
  enableAccountIcon: boolean;
}

export interface ColorSettings {
  primary: string;
  secondary: string;
  accent: string;
  button: string;
  headerBg: string;
  footerBg: string;
  background: string;
  text: string;
  borderColor?: string;
}

export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  buttonFont: string;
  headingWeight: string;
  bodySize: string;
  fontSizeScale?: string;
}

export interface AnnouncementBarConfig {
  enabled: boolean;
  text: string;
  bgColor: string;
  textColor: string;
  link: string;
  scheduleStart?: string;
  scheduleEnd?: string;
}

export interface PolicyPagesConfig {
  privacy: string;
  returnPolicy: string;
  refundPolicy: string;
  shippingPolicy: string;
  terms: string;
  contactPage: string;
}

export interface PLPSettingsConfig {
  defaultGridColumns?: 2 | 3 | 4;
  productsPerPage?: number;
  paginationType?: "load-more" | "pagination";
  enableQuickView?: boolean;
  showColorSwatches?: boolean;
  showComparePrice?: boolean;
  enableFilters?: boolean;
}

export interface ThemeConfig {
  colors: ColorSettings;
  typography: TypographySettings;
  announcement: AnnouncementBarConfig;
  header: HeaderConfig;
  sliderSettings: {
    autoSlide: boolean;
    slideSpeed: number;
    animationType: "fade" | "slide";
    navArrows: boolean;
    paginationDots: boolean;
    pauseOnHover: boolean;
  };
  slides: ThemeSlide[];
  featuredCollections: FeaturedCollectionSection;
  trendingProducts: TrendingProductsSection;
  features: FeaturesSectionConfig;
  testimonials: TestimonialConfig[];
  blogs: BlogSectionConfig;
  newsletter: NewsletterSectionConfig;
  footer: FooterConfig;
  policies: PolicyPagesConfig;
  brandName?: string;
  brandTagline?: string;
  faviconUrl?: string;
  mobileLogo?: string;
  heroOverlayOpacity?: number;
  borderRadius?: string;
  buttonStyle?: string;
  cardStyle?: string;
  newArrivalsBanner?: NewArrivalsBannerConfig;
  lookbookSection?: LookbookSectionConfig;
  summerEssentialsSection?: SummerEssentialsSectionConfig;
  plpSettings?: PLPSettingsConfig;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface ReturnExchangeItem {
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  image: string;
  price: number;
  exchangeSize?: string;
  exchangeColor?: string;
}

export interface OrderReturnRequest {
  id: string;
  orderId: string;
  customerEmail: string;
  type: "return" | "exchange";
  items: ReturnExchangeItem[];
  reason: string;
  description: string;
  imageProofUrl?: string;
  status: "Pending" | "Approved" | "Rejected" | "Pickup Scheduled" | "Completed" | "Refunded";
  createdAt: string;
}



