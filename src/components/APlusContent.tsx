import React, { useState } from "react";
import {
  Sparkles,
  Shirt,
  Layers,
  Repeat,
  ShieldCheck,
  Award,
  Wind,
  Feather,
  Check,
  ChevronDown,
  Info,
  Tag,
  Scissors,
  Sun,
  Eye,
  Heart,
  Droplet,
  Compass
} from "lucide-react";
import {
  APlusContentData,
  APlusSection,
  APlusHeroStorySection,
  APlusImageTextSection,
  APlusFeatureGridSection,
  APlusDetailStorySection,
  APlusStyleGuideSection,
  APlusFullBannerSection,
  APlusSpecTableSection,
  APlusFaqSection
} from "../types";

// Dynamic Icon resolver with fallback
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Shirt,
  Layers,
  Repeat,
  ShieldCheck,
  Award,
  Wind,
  Feather,
  Check,
  Info,
  Tag,
  Scissors,
  Sun,
  Eye,
  Heart,
  Droplet,
  Compass
};

function renderIcon(iconName?: string) {
  if (!iconName) return <Sparkles className="w-5 h-5 text-zinc-900" />;
  const IconComponent = ICON_MAP[iconName];
  if (IconComponent) {
    return <IconComponent className="w-5 h-5 text-zinc-900" />;
  }
  // If icon is an emoji or text character
  if (typeof iconName === "string" && iconName.length <= 4) {
    return <span className="text-lg leading-none">{iconName}</span>;
  }
  return <Sparkles className="w-5 h-5 text-zinc-900" />;
}

// 1. Hero Story Section
const HeroStoryBlock: React.FC<{ section: APlusHeroStorySection }> = ({ section }) => {
  if (!section.image && !section.heading) return null;
  return (
    <section id={`aplus-hero-${section.id}`} className="w-full relative overflow-hidden rounded-2xl bg-zinc-950 text-white my-8 sm:my-12">
      {section.image && (
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[560px] overflow-hidden">
          <img
            src={section.image}
            alt={section.heading || "CLINZA Editorial Story"}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform hover:scale-[1.02] transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end">
        {section.eyebrow && (
          <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-[#F27D26] mb-2 font-semibold">
            {section.eyebrow}
          </span>
        )}
        {section.heading && (
          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight max-w-3xl">
            {section.heading}
          </h3>
        )}
        {section.description && (
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-300 max-w-2xl font-light leading-relaxed">
            {section.description}
          </p>
        )}
      </div>
    </section>
  );
};

// 2. Image + Text Section (Two-Column)
const ImageTextBlock: React.FC<{ section: APlusImageTextSection }> = ({ section }) => {
  const isImageRight = section.layout === "image_right";
  return (
    <section id={`aplus-imgtxt-${section.id}`} className="my-10 sm:my-14">
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${isImageRight ? "lg:flex-row-reverse" : ""}`}>
        {/* Image Column */}
        <div className={`lg:col-span-6 ${isImageRight ? "lg:order-2" : "lg:order-1"}`}>
          <div className="relative overflow-hidden rounded-2xl bg-zinc-100 shadow-sm border border-zinc-200/80 group aspect-[4/5] max-h-[520px]">
            {section.image ? (
              <img
                src={section.image}
                alt={section.heading || "CLINZA Craft Story"}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100">
                <Shirt className="w-12 h-12 stroke-[1.2]" />
              </div>
            )}
            {section.badge && (
              <span className="absolute top-4 left-4 bg-zinc-950/90 backdrop-blur-md text-white text-[11px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-full border border-zinc-700/50">
                {section.badge}
              </span>
            )}
          </div>
        </div>

        {/* Text Column */}
        <div className={`lg:col-span-6 flex flex-col justify-center ${isImageRight ? "lg:order-1" : "lg:order-2"}`}>
          {section.eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-6 h-[1.5px] bg-[#F27D26]" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#F27D26] font-semibold">
                {section.eyebrow}
              </span>
            </div>
          )}
          {section.heading && (
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-950 leading-snug">
              {section.heading}
            </h3>
          )}
          {section.description && (
            <p className="mt-4 sm:mt-5 text-zinc-600 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
              {section.description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

// 3. Feature Grid Section (3 or 4 Cards)
const FeatureGridBlock: React.FC<{ section: APlusFeatureGridSection }> = ({ section }) => {
  const items = section.items || [];
  if (items.length === 0) return null;
  const cols = section.columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section id={`aplus-grid-${section.id}`} className="my-12 sm:my-16">
      {(section.eyebrow || section.heading || section.description) && (
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          {section.eyebrow && (
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#F27D26] font-semibold block mb-2">
              {section.eyebrow}
            </span>
          )}
          {section.heading && (
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950">
              {section.heading}
            </h3>
          )}
          {section.description && (
            <p className="mt-2 text-sm text-zinc-600">{section.description}</p>
          )}
        </div>
      )}

      <div className={`grid grid-cols-1 ${cols} gap-5 sm:gap-6`}>
        {items.map((item, idx) => (
          <div
            key={idx}
            className="group relative p-6 sm:p-7 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-start"
          >
            {item.image ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden mb-5 bg-zinc-200">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#F27D26]/10 transition-all duration-300">
                {renderIcon(item.icon)}
              </div>
            )}
            <h4 className="text-base font-bold uppercase tracking-wide text-zinc-950 mb-2">
              {item.title}
            </h4>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// 4. Product Detail Story Section (Image with Craftsmanship Bullets)
const DetailStoryBlock: React.FC<{ section: APlusDetailStorySection }> = ({ section }) => {
  const details = (section.details || []).filter(Boolean);
  return (
    <section id={`aplus-detail-${section.id}`} className="my-12 sm:my-16 bg-zinc-50 rounded-3xl p-6 sm:p-10 lg:p-12 border border-zinc-200/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Image */}
        <div className="lg:col-span-6">
          <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/5] bg-zinc-200 max-h-[500px]">
            {section.image && (
              <img
                src={section.image}
                alt={section.heading || "Craft Details"}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            )}
          </div>
        </div>

        {/* Bullets & Narrative */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {section.eyebrow && (
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#F27D26] font-semibold block mb-2">
              {section.eyebrow}
            </span>
          )}
          {section.heading && (
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950 mb-4">
              {section.heading}
            </h3>
          )}
          {section.description && (
            <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
              {section.description}
            </p>
          )}

          {details.length > 0 && (
            <div className="space-y-3 pt-2">
              {details.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-zinc-950 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-zinc-800">
                    {bullet}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// 5. Three Looks / Style Guide Section
const StyleGuideBlock: React.FC<{ section: APlusStyleGuideSection }> = ({ section }) => {
  const looks = section.looks || [];
  if (looks.length === 0) return null;

  return (
    <section id={`aplus-style-${section.id}`} className="my-12 sm:my-16">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        {section.eyebrow && (
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#F27D26] font-semibold block mb-2">
            {section.eyebrow}
          </span>
        )}
        {section.heading && (
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950">
            {section.heading}
          </h3>
        )}
        {section.description && (
          <p className="mt-2 text-sm text-zinc-600">{section.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {looks.map((look, idx) => (
          <div
            key={idx}
            className="group relative bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-zinc-200">
              {look.image ? (
                <img
                  src={look.image}
                  alt={look.lookTitle}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <Shirt className="w-10 h-10 stroke-[1.2]" />
                </div>
              )}
              {look.lookNumber && (
                <span className="absolute top-4 left-4 bg-zinc-950/90 text-white font-mono text-[10px] tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-sm">
                  {look.lookNumber}
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h4 className="text-base font-bold uppercase tracking-wider text-zinc-950 mb-1.5">
                {look.lookTitle}
              </h4>
              {look.description && (
                <p className="text-xs sm:text-sm text-zinc-600 font-light leading-relaxed">
                  {look.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// 6. Full-Width Lifestyle Banner Section
const FullBannerBlock: React.FC<{ section: APlusFullBannerSection }> = ({ section }) => {
  if (!section.image && !section.heading) return null;
  return (
    <section id={`aplus-banner-${section.id}`} className="my-10 sm:my-14 relative overflow-hidden rounded-3xl bg-zinc-900 text-white">
      {section.image && (
        <div className="relative w-full aspect-[16/8] sm:aspect-[21/8] max-h-[480px] overflow-hidden">
          <img
            src={section.image}
            alt={section.heading || "CLINZA Banner"}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-brightness-90" />
        </div>
      )}
      <div className="absolute inset-0 p-6 sm:p-10 lg:p-14 flex flex-col justify-center items-center text-center">
        {section.eyebrow && (
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#F27D26] mb-2 font-semibold">
            {section.eyebrow}
          </span>
        )}
        {section.heading && (
          <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white max-w-3xl leading-tight">
            {section.heading}
          </h3>
        )}
        {section.description && (
          <p className="mt-3 text-xs sm:text-sm text-zinc-200 max-w-xl font-light leading-relaxed">
            {section.description}
          </p>
        )}
      </div>
    </section>
  );
};

// 7. Specification Table Section
const SpecTableBlock: React.FC<{ section: APlusSpecTableSection }> = ({ section }) => {
  const specs = (section.specs || []).filter(s => s && s.label && s.value && s.label.trim() !== "" && s.value.trim() !== "");
  if (specs.length === 0) return null;

  return (
    <section id={`aplus-specs-${section.id}`} className="my-10 sm:my-14">
      {(section.eyebrow || section.heading) && (
        <div className="mb-6">
          {section.eyebrow && (
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#F27D26] font-semibold block mb-1">
              {section.eyebrow}
            </span>
          )}
          {section.heading && (
            <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-zinc-950">
              {section.heading}
            </h3>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
        <table className="w-full text-left text-sm divide-y divide-zinc-200">
          <tbody className="divide-y divide-zinc-100">
            {specs.map((spec, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-zinc-50/70" : "bg-white"}>
                <td className="py-3.5 px-5 sm:px-6 font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold w-1/3 sm:w-1/4">
                  {spec.label}
                </td>
                <td className="py-3.5 px-5 sm:px-6 text-zinc-900 font-medium">
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// 8. FAQ Accordion Section
const FaqBlock: React.FC<{ section: APlusFaqSection }> = ({ section }) => {
  const items = (section.items || []).filter(item => item && item.question && item.question.trim() !== "");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section id={`aplus-faq-${section.id}`} className="my-10 sm:my-14 max-w-4xl mx-auto">
      {(section.eyebrow || section.heading) && (
        <div className="text-center mb-8">
          {section.eyebrow && (
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#F27D26] font-semibold block mb-1">
              {section.eyebrow}
            </span>
          )}
          {section.heading && (
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950">
              {section.heading}
            </h3>
          )}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200/80 bg-zinc-50 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-zinc-900 hover:bg-zinc-100/70 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-bold pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-zinc-950" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed font-light border-t border-zinc-200/50">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

// Main A+ Content Root Component
export const APlusContent: React.FC<{ content?: APlusContentData | null }> = ({ content }) => {
  // CASE B: If A+ content is disabled or sections array is empty, render NOTHING at all.
  if (!content || !content.enabled || !Array.isArray(content.sections) || content.sections.length === 0) {
    return null;
  }

  const validSections = content.sections.filter(sec => sec && sec.type);
  if (validSections.length === 0) {
    return null;
  }

  return (
    <div id="product-a-plus-content" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 border-t border-zinc-200">
      {validSections.map((section, index) => {
        switch (section.type) {
          case "hero_story":
            return <HeroStoryBlock key={section.id || index} section={section as APlusHeroStorySection} />;
          case "image_text":
            return <ImageTextBlock key={section.id || index} section={section as APlusImageTextSection} />;
          case "feature_grid":
            return <FeatureGridBlock key={section.id || index} section={section as APlusFeatureGridSection} />;
          case "detail_story":
            return <DetailStoryBlock key={section.id || index} section={section as APlusDetailStorySection} />;
          case "style_guide":
            return <StyleGuideBlock key={section.id || index} section={section as APlusStyleGuideSection} />;
          case "full_banner":
            return <FullBannerBlock key={section.id || index} section={section as APlusFullBannerSection} />;
          case "spec_table":
            return <SpecTableBlock key={section.id || index} section={section as APlusSpecTableSection} />;
          case "faq":
            return <FaqBlock key={section.id || index} section={section as APlusFaqSection} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default APlusContent;
