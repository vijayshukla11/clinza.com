/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  MapPin, 
  Layers, 
  Flame, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Crown
} from "lucide-react";

interface PolicyPageViewProps {
  initialPolicy: string;
  onBack: () => void;
  setRoute: (route: string) => void;
}

function normalizeTabKey(policy: string | undefined): string {
  if (!policy) return "shipping";
  const p = policy.toLowerCase();
  if (p.includes("ship")) return "shipping";
  if (p.includes("refund") || p.includes("return")) return "refund";
  if (p.includes("priv")) return "privacy";
  if (p.includes("term")) return "terms";
  if (p.includes("faq")) return "faq";
  return "shipping";
}

export default function PolicyPageView({ initialPolicy, onBack, setRoute }: PolicyPageViewProps) {
  const [activeTab, setActiveTab] = useState<string>(() => normalizeTabKey(initialPolicy));
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    setActiveTab(normalizeTabKey(initialPolicy));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [initialPolicy]);

  const tabs = [
    { id: "shipping", label: "Shipping & Delivery", icon: Truck, color: "text-[#5B1824] bg-stone-100" },
    { id: "refund", label: "Return & Exchange Policy", icon: RotateCcw, color: "text-[#5B1824] bg-stone-100" },
    { id: "privacy", label: "Privacy Protection", icon: ShieldCheck, color: "text-[#5B1824] bg-stone-100" },
    { id: "terms", label: "Terms of Service", icon: FileText, color: "text-[#5B1824] bg-stone-100" },
    { id: "faq", label: "Customer FAQ", icon: HelpCircle, color: "text-[#5B1824] bg-stone-100" }
  ];

  // FAQs Database
  const faqsList = [
    {
      q: "Does CLINZA charge shipping fees for Cash on Delivery?",
      a: "No! At CLINZA, we provide 100% free express shipping and zero Cash on Delivery charges on all orders across India, regardless of cart value."
    },
    {
      q: "How long does delivery take for Metro cities?",
      a: "Orders for Metro corridors (Mumbai, Delhi NCR, Bangalore, Chennai, Hyderabad, Kolkata) are dispatched via express air freight, delivering in 2–3 business days."
    },
    {
      q: "What is your return & exchange window?",
      a: "Our Return & Exchange Policy is valid for 10 consecutive days from the date of delivery confirmation. Garments must remain unwashed and unworn, with all tags intact."
    },
    {
      q: "Can I cancel my order after checkout?",
      a: "Cancellations are accepted freely prior to dispatch. You can cancel from your account portal or message our WhatsApp team for immediate help."
    },
    {
      q: "Is payment on CLINZA secure?",
      a: "Yes. All transactions are processed through SSL-encrypted, PCI-DSS compliant banking gateways (Razorpay, UPI, Credit/Debit cards)."
    },
    {
      q: "How does the doorstep reverse pickup work for returns?",
      a: "Our courier partner collects the package directly from your address at zero cost. Once audited at our sorting hub, a replacement or direct refund is processed within 24 hours."
    }
  ];

  return (
    <section id="clinza-corporate-policy-module" className="py-8 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-stone-50 min-h-screen text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* BACK TRIGGER */}
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-zinc-500 hover:text-[#5B1824] uppercase mb-5 focus:outline-none cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </button>

        {/* HERO TITLE BLOCK WITH CLINZA MAROON BRANDING */}
        <div className="bg-gradient-to-r from-[#5B1824] via-[#4A121D] to-[#2B0A11] text-white rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 mb-8 relative overflow-hidden shadow-lg border border-amber-500/20">
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="max-w-2xl relative z-10 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-300 tracking-[0.25em] uppercase bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
              <Crown className="h-3 w-3 text-amber-300" />
              CLINZA™ Client Services
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold uppercase tracking-tight leading-tight text-white">
              Customer Care & Policy Center
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans font-normal">
              Transparent, reliable customer commitments. Review our zero-cost express delivery, hassle-free 10-day returns, and encrypted privacy protocols below.
            </p>
          </div>
        </div>

        {/* DOUBLE COLUMN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT TABS NAVIGATION (4 Columns) */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-3 sm:p-4 space-y-1.5 shadow-2xs">
            <span className="block text-[10px] font-mono font-bold tracking-widest text-stone-400 uppercase py-1.5 px-3">
              Policy Index
            </span>
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full py-3 px-3.5 rounded-xl flex items-center justify-between text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    isActive 
                      ? "bg-[#5B1824] text-white shadow-sm" 
                      : "text-zinc-700 hover:bg-stone-100 hover:text-[#5B1824]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`p-1.5 rounded-lg ${isActive ? "bg-white/15 text-amber-300" : tab.color}`}>
                      <TabIcon className="h-4 w-4" />
                    </span>
                    <span>{tab.label}</span>
                  </span>
                  <ChevronRight className={`h-4 w-4 ${isActive ? "text-amber-300" : "text-stone-300"}`} />
                </button>
              );
            })}

            <div className="mt-6 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2.5">
              <p className="text-xs font-bold text-zinc-900 tracking-wide font-sans">Have Questions?</p>
              <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">Chat directly with our support team on WhatsApp for instant assistance.</p>
              <a
                href="https://wa.me/917208572688?text=Hello%20Clinza%20Support%20Desk%2C%20please%20help%20me%20with%20my%20queries."
                target="_blank"
                rel="noreferrer"
                className="block text-center bg-[#126b2b] hover:bg-[#0c4d1f] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg transition-colors shadow-2xs font-sans"
              >
                Launch WhatsApp Chat
              </a>
            </div>
          </div>

          {/* RIGHT VIEWPORT DETAIL (8 Columns) */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xs text-left min-h-[450px]">
            
            {/* TAB: SHIPPING POLICY */}
            {activeTab === "shipping" && (
              <div className="space-y-6 sm:space-y-8 animate-fade-in">
                
                {/* Header title */}
                <div className="border-b border-stone-100 pb-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-[#5B1824] uppercase">
                    <Truck className="h-4 w-4" /> Nationwide Transit & Delivery
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-zinc-900">
                    Shipping Policy & Delivery Timelines
                  </h2>
                </div>

                {/* Grid metrics highlight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 sm:p-5 border bg-stone-50 border-stone-200 rounded-xl">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-800">Coverage</span>
                    <p className="text-base sm:text-lg font-bold text-zinc-900 mt-1">Pan-India Express Delivery</p>
                    <p className="text-xs text-zinc-600 leading-relaxed mt-1">Free express courier coverage across all Indian pincodes and Metro corridors.</p>
                  </div>
                  <div className="p-4 sm:p-5 border bg-amber-500/10 border-amber-200/80 rounded-xl">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#5B1824]">Delivery Fee</span>
                    <p className="text-base sm:text-lg font-bold text-[#5B1824] mt-1">100% Free Shipping & COD</p>
                    <p className="text-xs text-zinc-700 leading-relaxed mt-1">Zero hidden charges on both Prepaid and Cash on Delivery orders.</p>
                  </div>
                </div>

                {/* Delivery Timeframes list */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold uppercase text-zinc-900 tracking-wider font-mono">
                    Estimated Delivery Timelines
                  </h3>
                  <div className="space-y-2.5 font-sans text-xs text-zinc-700">
                    <div className="flex gap-3 items-start p-3 sm:p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                      <Clock className="h-4 w-4 text-[#5B1824] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-zinc-900">Tier-1 Metro Cities (Mumbai, Delhi-NCR, Bangalore, etc.)</p>
                        <p className="text-zinc-600 leading-relaxed mt-0.5">Dispatched via premium express air carriers. Delivered within <strong>2 to 3 Working Days</strong>.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start p-3 sm:p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                      <Clock className="h-4 w-4 text-[#5B1824] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-zinc-900">Rest of India & Rural Regions</p>
                        <p className="text-zinc-600 leading-relaxed mt-0.5">Shipped via reliable surface logistics partners (Delhivery, Blue Dart, Shiprocket). Delivered in <strong>4 to 6 Working Days</strong>.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="bg-gradient-to-br from-[#5B1824] via-[#4A121D] to-zinc-900 text-white rounded-xl p-5 sm:p-6 relative overflow-hidden shadow-xs">
                  <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest mb-3">Order Dispatch Flow</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-sans">
                    <div className="space-y-1">
                      <p className="font-bold font-mono text-[11px] text-amber-300">STEP 1: QUALITY CHECK</p>
                      <p className="text-stone-300 text-[11px] leading-relaxed">Garments are inspected, steam-pressed, and eco-sealed for safe transit.</p>
                    </div>
                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/15 pt-2.5 md:pt-0 md:pl-3.5">
                      <p className="font-bold font-mono text-[11px] text-amber-300">STEP 2: DISPATCH</p>
                      <p className="text-stone-300 text-[11px] leading-relaxed">Airway bill generated with live tracking details sent to your phone/email.</p>
                    </div>
                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/15 pt-2.5 md:pt-0 md:pl-3.5">
                      <p className="font-bold font-mono text-[11px] text-amber-300">STEP 3: DOORSTEP DELIVERY</p>
                      <p className="text-stone-300 text-[11px] leading-relaxed">OTP-verified delivery at your specified address.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: RETURNS & REFUNDS POLICY */}
            {activeTab === "refund" && (
              <div className="space-y-6 sm:space-y-8 animate-fade-in">
                
                <div className="border-b border-stone-100 pb-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-[#5B1824] uppercase">
                    <RotateCcw className="h-4 w-4" /> Hassle-Free Exchange
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-zinc-900">
                    10-Day Return & Exchange Policy
                  </h2>
                </div>

                {/* Overview callout */}
                <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-3.5">
                  <RotateCcw className="h-5 w-5 text-[#5B1824] shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-zinc-700 space-y-1">
                    <p className="font-bold text-zinc-900 uppercase tracking-wide text-[10px]">Simple & Direct Guarantee</p>
                    <p>If you face any size mismatch or fit issues, you can request a size exchange or full refund within 10 days of delivery. Items must be unworn, unwashed, and in original condition with brand tags attached.</p>
                  </div>
                </div>

                {/* Double column details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs text-zinc-700">
                  <div className="space-y-2.5 bg-stone-50 border border-stone-200 p-4 rounded-xl">
                    <h4 className="font-bold text-[#5B1824] uppercase font-mono tracking-wider text-[10px]">Size Exchange Process</h4>
                    <ul className="list-disc pl-4 space-y-1.5 leading-relaxed text-zinc-600">
                      <li>Contact our WhatsApp team or submit a request online.</li>
                      <li>Select your required replacement size.</li>
                      <li>We arrange a free doorstep pickup of your current parcel.</li>
                      <li>Replacement size is dispatched immediately upon pickup confirmation.</li>
                    </ul>
                  </div>
                  <div className="space-y-2.5 bg-stone-50 border border-stone-200 p-4 rounded-xl">
                    <h4 className="font-bold text-[#5B1824] uppercase font-mono tracking-wider text-[10px]">Refund Processing</h4>
                    <p className="leading-relaxed text-zinc-600">Upon receiving the returned item at our central hub, our quality team conducts a brief verification within 24 hours.</p>
                    <p className="leading-relaxed text-zinc-600">Approved refunds are credited back to your original payment method (or UPI/Bank transfer for COD) in 3–5 working days.</p>
                  </div>
                </div>

                {/* Conditions list */}
                <div className="border border-stone-200 rounded-xl p-4 sm:p-5 space-y-2 bg-white">
                  <div className="flex items-center gap-1.5 text-zinc-900 font-bold">
                    <ShieldAlert className="h-4 w-4 text-amber-800" />
                    <span className="text-[11px] font-mono uppercase tracking-wider">Return Conditions</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    To maintain hygiene and quality standards, returned items must show no signs of wash, alteration, fragrance, or fabric damage. Original invoice and brand tags must be returned together with the product.
                  </p>
                </div>

              </div>
            )}

            {/* TAB: PRIVACY POLICY */}
            {activeTab === "privacy" && (
              <div className="space-y-6 sm:space-y-8 animate-fade-in">
                
                <div className="border-b border-stone-100 pb-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-[#5B1824] uppercase">
                    <ShieldCheck className="h-4 w-4" /> Data Protection
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-zinc-900">
                    Privacy Protection & Data Security
                  </h2>
                </div>

                <div className="prose prose-stone text-xs text-zinc-700 space-y-4 leading-relaxed font-sans">
                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] font-mono text-[#5B1824]">1. Information Collection & Usage</h3>
                    <p>At CLINZA, we strictly respect your personal privacy. We collect basic customer details (Name, Shipping Address, Email, Phone Number) solely for order fulfillment, delivery updates, and customer support.</p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-stone-100">
                    <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] font-mono text-[#5B1824]">2. Banking & Payment Security</h3>
                    <p>Your payment credentials (Credit/Debit Card numbers, NetBanking passwords, UPI PINs) are processed directly through 256-bit SSL encrypted gateways. CLINZA never stores or views your sensitive financial passwords.</p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-stone-100">
                    <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] font-mono text-[#5B1824]">3. No Third-Party Data Selling</h3>
                    <p>We do not sell, rent, or lease your personal information to third-party advertising brokers. Data is shared exclusively with verified shipping partners (e.g., Shiprocket) strictly for delivery execution.</p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: TERMS OF SERVICE */}
            {activeTab === "terms" && (
              <div className="space-y-6 sm:space-y-8 animate-fade-in">
                
                <div className="border-b border-stone-100 pb-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-[#5B1824] uppercase">
                    <FileText className="h-4 w-4" /> Legal Terms
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-zinc-900">
                    Terms & Conditions of Use
                  </h2>
                </div>

                <div className="prose prose-stone text-xs text-zinc-700 space-y-4 leading-relaxed font-sans">
                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] font-mono text-[#5B1824]">1. Intellectual Property & Brand Assets</h3>
                    <p>All brand logos, product photography, textile descriptions, graphic banners, and website designs displayed on CLINZA are protected under copyright and trademark laws. Unauthorized reproduction is strictly prohibited.</p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-stone-100">
                    <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] font-mono text-[#5B1824]">2. Product Availability & Pricing</h3>
                    <p>We strive to keep catalog prices and stock availability accurate at all times. In the rare event of a inventory error, CLINZA reserves the right to cancel or refund any affected order prior to shipment.</p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-stone-100">
                    <h3 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] font-mono text-[#5B1824]">3. Customer Support & Governing Law</h3>
                    <p>For any disputes or customer service inquiries, please contact us at support@clinza.in or via WhatsApp. All terms are governed by the applicable laws of India.</p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: GENERAL FAQS CLIENT ACCORDION */}
            {activeTab === "faq" && (
              <div className="space-y-6 animate-fade-in">
                
                <div className="border-b border-stone-100 pb-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-[#5B1824] uppercase">
                    <HelpCircle className="h-4 w-4" /> Customer Help
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-zinc-900">
                    Frequently Asked Questions
                  </h2>
                </div>

                {/* FAQ list with accordion expand */}
                <div className="space-y-3 text-left">
                  {faqsList.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                          isOpen ? "border-[#5B1824] bg-stone-50" : "border-stone-200 bg-white hover:border-stone-300"
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-zinc-900 focus:outline-none cursor-pointer text-left"
                        >
                          <span className="flex items-center gap-2 font-sans pr-2">
                            <span className="font-mono text-xs font-bold text-[#5B1824]">Q{idx + 1}.</span>
                            {faq.q}
                          </span>
                          {isOpen ? <ChevronUp className="h-4 w-4 text-[#5B1824] shrink-0" /> : <ChevronDown className="h-4 w-4 text-stone-400 shrink-0" />}
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 text-xs text-zinc-600 leading-relaxed animate-fade-in font-sans">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}

