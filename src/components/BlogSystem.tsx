/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, Clock, Calendar, User, ArrowRight, Share2, Heart, Award } from "lucide-react";
import { BlogPost } from "../types";
import { getBlogs } from "../utils";
import { trackBlogView } from "../services/analyticsService";

interface BlogSystemProps {
  setRoute: (route: string) => void;
  activeBlogSlug: string | null;
  setActiveBlogSlug: (slug: string | null) => void;
}

export default function BlogSystem({
  setRoute,
  activeBlogSlug,
  setActiveBlogSlug
}: BlogSystemProps) {
  const blogs = getBlogs();
  const [likes, setLikes] = useState<Record<string, number>>({});

  const handleLike = (slug: string, e: React.MouseEventHTMLButtonElement) => {
    e.stopPropagation();
    setLikes(prev => ({
      ...prev,
      [slug]: (prev[slug] || 0) + 1
    }));
  };

  const handleShare = (title: string, e: React.MouseEventHTMLButtonElement) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/blog/${activeBlogSlug || ""}`);
      alert(`Editorial Article Url copied to clipboard:\n"${title}"`);
    } else {
      alert("Sharing active! Link copied.");
    }
  };

  // Find active blog
  const activeBlog = blogs.find(b => b.slug === activeBlogSlug);

  React.useEffect(() => {
    if (activeBlog) {
      trackBlogView(activeBlog.id, activeBlog.slug, activeBlog.title);
    }
  }, [activeBlogSlug, activeBlog]);

  if (activeBlog) {
    return (
      <article id="editorial-blog-detail" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-white min-h-screen text-left">
        <div className="max-w-3xl mx-auto">
          
          {/* Back button */}
          <button
            id="blog-back-btn"
            onClick={() => setActiveBlogSlug(null)}
            className="group flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest text-zinc-500 hover:text-orange-600 uppercase mb-5 focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Articles
          </button>

          {/* META HEADER */}
          <div className="space-y-3 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-orange-650" /> {new Date(activeBlog.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-orange-650" /> {activeBlog.readTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-orange-650" /> By {activeBlog.author.name}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black tracking-tight text-gray-950 uppercase font-serif md:leading-[1.15]">
              {activeBlog.title}
            </h1>
            
            <p className="text-gray-650 text-base font-sans font-normal leading-relaxed italic">
              "{activeBlog.summary}"
            </p>
          </div>

          {/* LARGE MAIN IMAGE HERO */}
          <div className="aspect-[16/9] bg-gray-50 rounded-2xl overflow-hidden mb-8 border border-gray-100 shadow-sm">
            <img
              src={activeBlog.coverImage}
              alt={activeBlog.title}
              className="h-full w-full object-cover object-center"
            />
          </div>

          {/* CONTENT ACCENTS WITH SPLIT PARAGRAPHS */}
          <div className="prose prose-orange max-w-none text-gray-800 text-sm sm:text-base font-sans leading-relaxed font-light space-y-6">
            <p className="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-orange-650 first-letter:font-black">
              The sartorial dialogue surrounding high-end fabrics has shifted profoundly over the past decade. It is no longer just about visual geometry or tailoring contours; it is fundamentally about the tactile resonance of fibers against skin. Pure European flax linen stands at the very focal point of this modern philosophical pivot.
            </p>
            <p>
              When we unpack the structural physics of long-staple flax threads, we discover a natural carbohydrate cell wall structure that absorbs moisture at rates 3x faster than traditional short-staple carded cottons. This high moisture absorption rate reduces surface humidity, fostering an eye-safe, temperature-regulated microclimate next to your body.
            </p>
            
            <div className="bg-zinc-50 border border-gray-200 p-6 rounded-2xl my-8 text-left">
              <h4 className="text-xs font-black tracking-wider text-orange-655 uppercase font-mono mb-2 flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-orange-600" /> SARTORIAL INSIGHT BY {activeBlog.author.name.toUpperCase()}
              </h4>
              <p className="text-xs text-gray-650 leading-relaxed font-sans italic">
                "Fashion is transient, but the engineering coefficients of thread strength and fiber breathability remain permanently unchanging. True luxury begins in the soil with raw fibers."
              </p>
            </div>

            <p>
              In our manufacturing pipelines across Mumbai and Italian weaving labs, we enforce a strict zero-friction wash technique. We allow the authentic slubs and natural crinkled waves to remain intact, celebrating structural honesty rather than forcing artificial high-sheen synthetic flat finishes.
            </p>
            <p>
              Whether you pair our double pleated linen trousers with resort-collared shirts for sunset cocktail sessions, or choose robust 13.5 oz selvedge raw indigo denim for urban commutes, CLINZA assures and represents absolute architectural authenticity at every pivot.
            </p>
          </div>

          {/* SHARE AND INTERACT ACTIONS FOOTER */}
          <div className="border-t border-gray-150 pt-8 mt-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                id={`like-blog-btn-${activeBlog.slug}`}
                onClick={(e) => handleLike(activeBlog.slug, e)}
                className="flex items-center gap-1.5 text-xs text-gray-550 hover:text-red-500 font-bold uppercase tracking-wider bg-gray-50 hover:bg-red-50 border border-gray-200 px-4 py-2 rounded-full transition-colors cursor-pointer"
              >
                <Heart className={`h-4.5 w-4.5 text-red-500 ${(likes[activeBlog.slug] || 0) > 0 ? "fill-red-550 stroke-red-550" : ""}`} />
                Like This ({(likes[activeBlog.slug] || 0) + 12})
              </button>
              <button
                id={`share-blog-btn-${activeBlog.slug}`}
                onClick={(e) => handleShare(activeBlog.title, e)}
                className="text-gray-550 hover:text-orange-600 p-2.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                title="Share Article"
              >
                <Share2 className="h-4.5 w-4.5" />
              </button>
            </div>

            <button
              id="editorial-return-articles-footer"
              onClick={() => setActiveBlogSlug(null)}
              className="text-xs font-black uppercase tracking-wider text-orange-655 hover:underline font-mono"
            >
              See other publications
            </button>
          </div>

        </div>
      </article>
    );
  }

  return (
    <section id="clinza-blog-publications-list" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center max-w-xl mx-auto mb-10 border-b border-zinc-200 pb-4">
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#F27D26] uppercase font-bold mb-1.5 block">
            Editorial insights
          </span>
          <h1 className="text-2xl sm:text-3.5xl font-sans font-black tracking-tight text-gray-950 uppercase">
            Clinza Publications
          </h1>
          <p className="text-gray-550 text-xs sm:text-sm font-sans font-light mt-2 animate-fade-in">
            Deep-dives into textiles, sustainable flax harvesting, selvedge architecture, boot welt styling, and classic modern wardrobe pairings.
          </p>
        </div>

        {/* ARTICLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {blogs.map((b) => (
            <div
              id={`blog-card-${b.slug}`}
              key={b.slug}
              onClick={() => {
                setActiveBlogSlug(b.slug);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group bg-white border border-gray-200 rounded-none overflow-hidden hover:border-black transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    className="h-full w-full object-cover object-center group-hover:scale-102 transition-transform duration-550"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-none border border-zinc-200">
                    <span className="text-[9px] font-bold font-mono tracking-widest text-gray-950 uppercase">
                      {b.readTime}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-[#F27D26]" /> {new Date(b.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3 text-zinc-500" /> By {b.author.name}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-sans font-black tracking-tight text-gray-950 group-hover:text-[#F27D26] transition-colors uppercase font-serif line-clamp-2 h-12 leading-snug">
                    {b.title}
                  </h3>

                  <p className="text-gray-500 text-xs font-sans font-light leading-relaxed line-clamp-2">
                    {b.summary}
                  </p>
                </div>
              </div>

              {/* READ ACTION ROW */}
              <div className="p-5 pt-0 mt-3 border-t border-zinc-100 flex items-center justify-between text-left">
                <button
                  id={`blog-read-btn-${b.slug}`}
                  onClick={() => {
                    setActiveBlogSlug(b.slug);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#F27D26] group-hover:text-black transition-colors cursor-pointer font-mono"
                >
                  Read Article <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id={`blog-like-${b.slug}`}
                  onClick={(e) => handleLike(b.slug, e)}
                  title="Like Article"
                  className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer focus:outline-none"
                >
                  <Heart className={`h-4.5 w-4.5 ${(likes[b.slug] || 0) > 0 ? "fill-red-550 stroke-red-550 text-red-550" : ""}`} />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
