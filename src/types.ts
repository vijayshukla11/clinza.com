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
  verified: boolean;
  date: string;
}

export interface APlusSection {
  title: string;
  description: string;
  imageUrl?: string;
  features: { icon: string; title: string; description: string }[];
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
  colors: { name: string; hex: string }[];
  sizes: string[];
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  sku: string;
  brand: string;
  rating: number;
  reviews: Review[];
  description: string;
  specifications: { label: string; value: string }[];
  aPlusContent: APlusSection;
  isTrending?: boolean;
  isNewArrival?: boolean;
  seoTitle?: string;
  metaDescription?: string;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
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
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "COD";
  trackingHistory: { status: string; timestamp: string; description: string }[];
  trackingNumber?: string;
  courierPartner?: string;
  createdAt: string;
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
}

export interface HomepageConfig {
  slides: HomeSlide[];
  trendingTitle: string;
  trendingSubtitle: string;
  editorialTitle: string;
  editorialSubtitle: string;
  editorialDesc: string;
  editorialImg?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string;
}

export interface CollectionMaster {
  id: string;
  name: string;
  slug: string;
  banner: string;
  thumbnail: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  displayOrder: number;
  featured: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "flat" | "free_shipping";
  value: number;
  minCartValue: number;
  expiryDate: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  addressBook: string[];
  totalSpend: number;
  wishlist: string[];
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

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "document";
  size: string;
  createdAt: string;
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
}

export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  buttonFont: string;
  headingWeight: string;
  bodySize: string;
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
}


