/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Star, 
  CheckCircle2, 
  ThumbsUp, 
  MessageSquare, 
  X, 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Filter, 
  SlidersHorizontal,
  Award,
  Sparkles,
  Search,
  ZoomIn
} from "lucide-react";
import { Product, ProductReview } from "../types";
import { ProductReviewsService } from "../services/supabaseService";

interface ProductReviewSectionProps {
  product: Product;
}

export default function ProductReviewSection({ product }: ProductReviewSectionProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Sorting state
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | "all">("all");
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterWithPhotosOnly, setFilterWithPhotosOnly] = useState(false);
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest" | "helpful" | "featured" | "verified">("featured");

  // Write Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review Form state
  const [form, setForm] = useState({
    customerName: "",
    customerLocation: "",
    customerEmail: "",
    rating: 5,
    reviewTitle: "",
    reviewText: "",
    reviewImage: "",
    reviewGallery: [] as string[]
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Lightbox modal state for photo gallery
  const [activeLightbox, setActiveLightbox] = useState<{
    images: string[];
    currentIndex: number;
    reviewTitle?: string;
    customerName?: string;
  } | null>(null);

  // Helpful votes clicked local tracker
  const [votedHelpfulIds, setVotedHelpfulIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      setLoading(true);
      try {
        const fetched = await ProductReviewsService.getProductReviews(product.id || product.slug);
        if (isMounted) {
          setReviews(fetched);
        }
      } catch (err) {
        console.error("Error loading product reviews:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReviews();
    return () => { isMounted = false; };
  }, [product.id, product.slug]);

  // Calculate statistics
  const stats = useMemo(() => {
    return ProductReviewsService.calculateAverageRating(reviews);
  }, [reviews]);

  // Extract all customer uploaded photos across active reviews for top photo gallery
  const allCustomerPhotos = useMemo(() => {
    const photos: { url: string; reviewTitle: string; customerName: string; rating: number }[] = [];
    reviews.forEach(r => {
      if (r.reviewImage) {
        photos.push({ url: r.reviewImage, reviewTitle: r.reviewTitle, customerName: r.customerName, rating: r.rating });
      }
      if (r.reviewGallery && r.reviewGallery.length > 0) {
        r.reviewGallery.forEach(gUrl => {
          if (gUrl !== r.reviewImage) {
            photos.push({ url: gUrl, reviewTitle: r.reviewTitle, customerName: r.customerName, rating: r.rating });
          }
        });
      }
    });
    return photos;
  }, [reviews]);

  // Apply filters and sorting
  const processedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by rating
    if (selectedRatingFilter !== "all") {
      result = result.filter(r => Math.round(r.rating) === selectedRatingFilter);
    }

    // Filter by verified
    if (filterVerifiedOnly) {
      result = result.filter(r => r.verifiedPurchase);
    }

    // Filter by photos
    if (filterWithPhotosOnly) {
      result = result.filter(r => r.reviewImage || (r.reviewGallery && r.reviewGallery.length > 0));
    }

    // Filter by featured
    if (filterFeaturedOnly) {
      result = result.filter(r => r.isFeatured);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating;
      }
      if (sortBy === "helpful") {
        return b.helpfulCount - a.helpfulCount;
      }
      if (sortBy === "verified") {
        return (b.verifiedPurchase ? 1 : 0) - (a.verifiedPurchase ? 1 : 0);
      }
      // Default: featured first, then displayOrder asc, then created_at desc
      if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1;
      }
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [reviews, selectedRatingFilter, filterVerifiedOnly, filterWithPhotosOnly, filterFeaturedOnly, sortBy]);

  // Handle image upload in write review modal
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const file = files[0];
      const uploadedUrl = await ProductReviewsService.uploadReviewImage(file);
      setForm(f => ({
        ...f,
        reviewImage: f.reviewImage || uploadedUrl,
        reviewGallery: [...f.reviewGallery, uploadedUrl]
      }));
    } catch (err) {
      console.error("Failed to upload review photo:", err);
      alert("Could not upload photo. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle helpful vote
  const handleHelpfulClick = async (reviewId: string) => {
    if (votedHelpfulIds[reviewId]) return;
    setVotedHelpfulIds(prev => ({ ...prev, [reviewId]: true }));

    const updatedCount = await ProductReviewsService.incrementHelpfulCount(reviewId);
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: updatedCount } : r));
  };

  // Submit write review form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.customerName.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!form.reviewText.trim()) {
      alert("Please write your feedback description.");
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      alert("Rating must be between 1 and 5 stars.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await ProductReviewsService.createReview({
        productId: product.id || product.slug,
        customerName: form.customerName.trim(),
        customerLocation: form.customerLocation.trim() || "India",
        customerEmail: form.customerEmail.trim(),
        rating: form.rating,
        reviewTitle: form.reviewTitle.trim() || `${form.rating} Star Review`,
        reviewText: form.reviewText.trim(),
        reviewImage: form.reviewImage || undefined,
        reviewGallery: form.reviewGallery,
        verifiedPurchase: true,
        displayOrder: 0,
        helpfulCount: 0,
        isFeatured: false,
        isActive: true
      });

      if (created) {
        setReviews(prev => [created, ...prev]);
        setShowReviewModal(false);
        setForm({
          customerName: "",
          customerLocation: "",
          customerEmail: "",
          rating: 5,
          reviewTitle: "",
          reviewText: "",
          reviewImage: "",
          reviewGallery: []
        });
        setToastMessage("Thank you! Your verified review has been published.");
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error("Error creating review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Inject Structured Data JSON-LD for SEO Schema
  useEffect(() => {
    if (typeof document === "undefined") return;

    const schemaId = "clinza-review-jsonld-schema";
    let existingScript = document.getElementById(schemaId);
    if (existingScript) {
      existingScript.remove();
    }

    if (reviews.length > 0) {
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images?.[0] || "",
        "description": product.description || "",
        "sku": product.sku || "",
        "brand": {
          "@type": "Brand",
          "name": product.brand || "CLINZA Luxury"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": stats.averageRating,
          "reviewCount": stats.totalReviews,
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": reviews.slice(0, 5).map(r => ({
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": r.rating,
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": r.customerName
          },
          "reviewBody": r.reviewText,
          "name": r.reviewTitle,
          "datePublished": r.createdAt.split("T")[0]
        }))
      };

      const script = document.createElement("script");
      script.id = schemaId;
      script.type = "application/ld+json";
      script.innerHTML = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }
  }, [product, reviews, stats]);

  return (
    <section id="reviews-section" className="pt-12 border-t border-zinc-200 text-left space-y-8 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-zinc-900 text-white text-xs font-sans font-medium px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.25em] block mb-1">
            AUTHENTIC CUSTOMER TESTIMONIALS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-zinc-950 font-sans flex items-center gap-2">
            <span>Customer Reviews</span>
            <span className="text-sm font-mono text-zinc-400 font-normal">({stats.totalReviews})</span>
          </h2>
        </div>
        <button
          onClick={() => setShowReviewModal(true)}
          className="px-6 py-3 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Write A Review</span>
        </button>
      </div>

      {/* RATING BREAKDOWN & SUMMARY CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FAF9F5] p-6 sm:p-8 rounded-2xl border border-zinc-200/90 shadow-xs">
        
        {/* Overall Score Box */}
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-200 pb-6 md:pb-0 md:pr-6">
          <span className="text-6xl font-black text-zinc-950 font-mono tracking-tight">
            {stats.averageRating.toFixed(1)}
          </span>
          <div className="flex text-amber-400 my-2.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                className={`h-5 w-5 ${s <= Math.round(stats.averageRating) ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-zinc-200"}`} 
              />
            ))}
          </div>
          <p className="text-xs font-sans text-zinc-500 font-medium text-center">
            Based on <span className="font-bold text-zinc-900">{stats.totalReviews}</span> verified buyer feedback
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>100% Verified Purchases</span>
          </div>
        </div>

        {/* 5 Star Distribution Bars */}
        <div className="md:col-span-2 space-y-2.5 flex flex-col justify-center">
          {[5, 4, 3, 2, 1].map((stars) => {
            const dist = stats.starDistribution[stars] || { count: 0, percentage: 0 };
            const isSelected = selectedRatingFilter === stars;
            return (
              <button
                key={stars}
                onClick={() => setSelectedRatingFilter(isSelected ? "all" : stars)}
                className={`w-full flex items-center gap-3 text-xs font-mono text-zinc-700 group cursor-pointer p-1 rounded-lg transition-colors ${
                  isSelected ? "bg-amber-50/80 font-bold" : "hover:bg-zinc-100/60"
                }`}
              >
                <span className="w-16 shrink-0 font-bold text-zinc-900 text-left flex items-center gap-1">
                  <span>{stars}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 bg-zinc-200/80 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-zinc-950 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${dist.percentage}%` }} 
                  />
                </div>
                <span className="w-12 text-right shrink-0 text-zinc-400 text-[11px] font-mono">
                  {dist.percentage}%
                </span>
                <span className="w-8 text-right shrink-0 text-zinc-500 text-[10px] font-mono">
                  ({dist.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CUSTOMER PHOTO GALLERY TAPE */}
      {allCustomerPhotos.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-zinc-700" />
              <span>Customer Photos ({allCustomerPhotos.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">Click photo to enlarge</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {allCustomerPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setActiveLightbox({
                  images: allCustomerPhotos.map(p => p.url),
                  currentIndex: idx,
                  reviewTitle: photo.reviewTitle,
                  customerName: photo.customerName
                })}
                className="relative group shrink-0 h-24 w-24 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 cursor-pointer shadow-xs transition-transform hover:scale-105"
              >
                <img src={photo.url} alt="Customer upload" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="h-5 w-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FILTERS & SORTING TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-zinc-200 pb-4">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => setSelectedRatingFilter("all")}
            className={`px-3 py-1.5 rounded-full font-sans text-[11px] font-bold transition-all cursor-pointer ${
              selectedRatingFilter === "all" 
                ? "bg-zinc-950 text-white shadow-xs" 
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All Ratings
          </button>

          {[5, 4, 3].map((star) => (
            <button
              key={star}
              onClick={() => setSelectedRatingFilter(selectedRatingFilter === star ? "all" : star)}
              className={`px-3 py-1.5 rounded-full font-sans text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedRatingFilter === star 
                  ? "bg-zinc-950 text-white shadow-xs" 
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <span>{star} Stars</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            </button>
          ))}

          <button
            onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
            className={`px-3 py-1.5 rounded-full font-sans text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterVerifiedOnly 
                ? "bg-emerald-800 text-white shadow-xs" 
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Verified Buyers</span>
          </button>

          <button
            onClick={() => setFilterWithPhotosOnly(!filterWithPhotosOnly)}
            className={`px-3 py-1.5 rounded-full font-sans text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterWithPhotosOnly 
                ? "bg-zinc-950 text-white shadow-xs" 
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <Camera className="h-3 w-3" />
            <span>With Photos</span>
          </button>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-xs font-mono text-zinc-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-zinc-250 py-1.5 px-3 rounded-lg text-xs font-sans font-semibold text-zinc-800 focus:outline-none focus:border-zinc-900 cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
            <option value="verified">Verified Buyers First</option>
          </select>
        </div>
      </div>

      {/* REVIEWS CARDS LIST */}
      {loading ? (
        <div className="py-12 text-center text-zinc-400 font-mono text-xs space-y-2">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-zinc-900 border-t-transparent"></div>
          <p>Loading authenticated customer feedback...</p>
        </div>
      ) : processedReviews.length === 0 ? (
        /* EMPTY STATE */
        <div className="py-16 text-center bg-zinc-50/70 border border-dashed border-zinc-300 rounded-2xl p-8 space-y-4">
          <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 font-sans">No reviews yet for these filters</h3>
            <p className="text-xs text-zinc-500 font-sans mt-1">
              Be the first to share your experience with this luxury garment!
            </p>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-800 transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Write First Review</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {processedReviews.map((rev) => {
            const gallery = rev.reviewGallery || (rev.reviewImage ? [rev.reviewImage] : []);
            const hasVoted = !!votedHelpfulIds[rev.id];

            return (
              <div 
                key={rev.id} 
                className={`p-6 bg-white rounded-2xl border transition-all space-y-3.5 shadow-xs ${
                  rev.isFeatured ? "border-amber-300/80 bg-amber-50/20" : "border-zinc-200/80"
                }`}
              >
                {/* Top User Info & Flags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar circle */}
                    <div className="h-8 w-8 rounded-full bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-950 font-sans">{rev.customerName}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                        {rev.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300">
                            <Award className="h-3 w-3 text-amber-600" />
                            <span>Featured Review</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 block">{rev.customerLocation || "India"}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>

                {/* Rating Stars & Title */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-zinc-200"}`} 
                      />
                    ))}
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 font-sans">{rev.reviewTitle}</h4>
                </div>

                {/* Review Text */}
                <p className="text-xs text-zinc-700 leading-relaxed font-sans font-normal">
                  {rev.reviewText}
                </p>

                {/* Customer Uploaded Images */}
                {gallery.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {gallery.map((imgUrl, imgIdx) => (
                      <button
                        key={imgIdx}
                        onClick={() => setActiveLightbox({
                          images: gallery,
                          currentIndex: imgIdx,
                          reviewTitle: rev.reviewTitle,
                          customerName: rev.customerName
                        })}
                        className="relative group h-16 w-16 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 cursor-pointer"
                      >
                        <img src={imgUrl} alt="Review attachment" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ZoomIn className="h-4 w-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer / Helpful Button */}
                <div className="pt-3 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100">
                  <span className="font-mono text-[10px] text-zinc-400">CLINZA Verified Purchase</span>
                  <button
                    onClick={() => handleHelpfulClick(rev.id)}
                    disabled={hasVoted}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-mono font-semibold ${
                      hasVoted ? "text-emerald-700 font-bold cursor-default" : "text-zinc-500 hover:text-zinc-950"
                    }`}
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${hasVoted ? "fill-emerald-700 text-emerald-700" : ""}`} />
                    <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX PHOTO MODAL */}
      {activeLightbox && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[220] flex items-center justify-center p-4 text-white animate-fade-in">
          <button
            onClick={() => setActiveLightbox(null)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="max-w-3xl w-full flex flex-col items-center space-y-4">
            <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              <img 
                src={activeLightbox.images[activeLightbox.currentIndex]} 
                alt="Enlarged customer preview" 
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />

              {activeLightbox.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveLightbox(prev => prev ? {
                      ...prev,
                      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
                    } : null)}
                    className="absolute left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setActiveLightbox(prev => prev ? {
                      ...prev,
                      currentIndex: (prev.currentIndex + 1) % prev.images.length
                    } : null)}
                    className="absolute right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm font-bold font-sans text-white">{activeLightbox.reviewTitle}</p>
              <p className="text-xs font-mono text-zinc-400">Photo uploaded by {activeLightbox.customerName}</p>
            </div>
          </div>
        </div>
      )}

      {/* WRITE A REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[200] flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-zinc-200 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                  COMMUNITY FEEDBACK
                </span>
                <h3 className="text-lg font-bold uppercase tracking-tight text-zinc-950 font-sans">
                  Write a review for {product.name}
                </h3>
              </div>

              {/* Star Rating selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-zinc-700 font-mono">Overall Rating *</label>
                <div className="flex gap-2 text-zinc-300">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`h-7 w-7 ${star <= form.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 fill-zinc-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-700 font-mono">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-250 py-2.5 px-3.5 rounded-xl text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>

              {/* Location & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-700 font-mono">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, MH"
                    value={form.customerLocation}
                    onChange={(e) => setForm({ ...form, customerLocation: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-250 py-2.5 px-3.5 rounded-xl text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-zinc-700 font-mono">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-250 py-2.5 px-3.5 rounded-xl text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-700 font-mono">Review Title</label>
                <input
                  type="text"
                  placeholder="e.g. Luxurious linen fabric with incredible drape"
                  value={form.reviewTitle}
                  onChange={(e) => setForm({ ...form, reviewTitle: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-250 py-2.5 px-3.5 rounded-xl text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>

              {/* Review Text */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-700 font-mono">Detailed Review *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe fit, fabric quality, softness, stitching, and overall impression..."
                  value={form.reviewText}
                  onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-250 py-2.5 px-3.5 rounded-xl text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>

              {/* Upload Customer Photos */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-zinc-700 font-mono">Attach Customer Photo</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-xl text-xs font-mono font-bold text-zinc-700 cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{uploadingImage ? "Uploading..." : "Upload Photo"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageFileChange} 
                      disabled={uploadingImage}
                    />
                  </label>
                  {form.reviewImage && (
                    <div className="relative h-12 w-12 rounded-lg border overflow-hidden shrink-0">
                      <img src={form.reviewImage} alt="Uploaded" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, reviewImage: "", reviewGallery: [] }))}
                        className="absolute top-0 right-0 bg-black/70 text-white p-0.5 rounded-bl text-[9px]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-sans text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? "Publishing Review..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
