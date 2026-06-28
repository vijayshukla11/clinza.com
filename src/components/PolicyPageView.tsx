/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
  ChevronUp
} from "lucide-react";

interface PolicyPageViewProps {
  initialPolicy: string;
  onBack: () => void;
  setRoute: (route: string) => void;
}

export default function PolicyPageView({ initialPolicy, onBack, setRoute }: PolicyPageViewProps) {
  const [activeTab, setActiveTab] = useState<string>(initialPolicy || "shipping");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const tabs = [
    { id: "shipping", label: "Shipping Policy", icon: Truck, color: "text-blue-500 bg-blue-50" },
    { id: "refund", label: "Return & Refund Policy", icon: RotateCcw, color: "text-orange-500 bg-orange-50" },
    { id: "privacy", label: "Privacy Protection", icon: ShieldCheck, color: "text-emerald-500 bg-emerald-50" },
    { id: "terms", label: "Terms of Use", icon: FileText, color: "text-zinc-500 bg-zinc-50" },
    { id: "faq", label: "Client FAQ", icon: HelpCircle, color: "text-purple-500 bg-purple-50" }
  ];

  // FAQs Database
  const faqsList = [
    {
      q: "Does CLINZA really charge zero shipping fees for Cash on Delivery?",
      a: "Yes! At CLINZA, we provide absolutely free express shipping and zero Cash on Delivery charges on all domestic wardrobes inside the territory of India, regardless of purchase value size."
    },
    {
      q: "How long does shipping take to deliver Metro corridors?",
      a: "All shipments destined for Tier-1 Metro zones (Mumbai, Delhi NCR, Bangalore, Chennai) are optimized under express air routes, arriving safely at your doorstep within 2–3 business days."
    },
    {
      q: "What is your return window eligibility?",
      a: "Our Return & Swap Policy is active for 10 consecutive days from the timestamp of delivery confirmation. Garments must remain completely unwashed and unworn, with all designer thread tags safely attached."
    },
    {
      q: "Can I cancel my outfit order after checking out?",
      a: "Cancellations are accepted freely prior to dispatch. Simply navigate to the Track Order portal or send a direct text message on our WhatsApp business hotline, and we will update your docket instantly."
    },
    {
      q: "Are my selfie uploads stored permanently in the AI Analyzer tool?",
      a: "Never. All photo assets compiled under the CLINZA Style Smart Analyzer are evaluated purely utilizing real-time computational buffers. They are processed server-side and immediately flushed from active RAM."
    },
    {
      q: "How can I verify the status of a returned package?",
      a: "Our reverse pickup logistics partners will send you a shipment docket receipt at your doorstep. Once our Mumbai sorting chamber receives the parcel, our crew performs an audit and initiates a refund or sizing exchange within 24 hours."
    }
  ];

  return (
    <section id="clinza-corporate-policy-module" className="py-10 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 bg-zinc-100 min-h-screen text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* BACK TRIGGER */}
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-bold font-mono tracking-widest text-zinc-500 hover:text-black uppercase mb-5 focus:outline-none cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Wardrobe
        </button>

        {/* HERO TITLE BLOCK */}
        <div className="bg-zinc-950 text-white rounded-3xl p-8 md:p-12 mb-10 relative overflow-hidden shadow-xl border border-zinc-800">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-2xl relative z-10 space-y-3">
            <span className="text-[10px] font-mono font-black text-orange-400 tracking-[0.25em] uppercase">Corporate Desk</span>
            <h1 className="text-3xl md:text-5xl font-sans font-black uppercase tracking-tight leading-none text-zinc-50">
              CLINZA Customer Care Policy Hub
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed font-light">
              We design luxury outfits combined with unparalleled merchant service. Review our shipping coverages, easy reverse return policies, and data guidelines below.
            </p>
          </div>
        </div>

        {/* DOUBLE COLUMN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT CHROME TABS (4 Columns) */}
          <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-4 space-y-1 shadow-xs">
            <span className="block text-[10px] font-mono font-black tracking-widest text-zinc-400 uppercase py-2 px-3">Topics Navigation</span>
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive 
                      ? "bg-zinc-950 text-white shadow-md scale-102" 
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`p-1.5 rounded-lg ${isActive ? "bg-white/10 text-orange-400" : tab.color}`}>
                      <TabIcon className="h-4 w-4" />
                    </span>
                    {tab.label}
                  </span>
                  <ChevronRight className={`h-4 w-4 ${isActive ? "text-orange-400" : "text-zinc-300"}`} />
                </button>
              );
            })}

            <div className="mt-8 p-4 bg-orange-50/20 border border-orange-100 rounded-xl space-y-3">
              <p className="text-xs font-black uppercase text-zinc-900 tracking-wide">Need Support?</p>
              <p className="text-[11px] text-zinc-550 leading-relaxed font-sans">Connect with our corporate garment helpdesk instantly via one-click WhatsApp assistance.</p>
              <a
                href="https://wa.me/917208572688?text=Hello%20Clinza%20Support%20Desk%2C%20please%20help%20me%20with%20my%20queries."
                target="_blank"
                rel="noreferrer"
                className="block text-center bg-[#1b8a3a] hover:bg-[#126b2b] text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-colors shadow-sm"
              >
                Launch Helpdesk Chat
              </a>
            </div>
          </div>

          {/* RIGHT VIEWPORT DETAIL (8 Columns) */}
          <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-3xl p-6 md:p-10 shadow-xs text-left min-h-[500px]">
            
            {/* TAB: SHIPPING POLICY */}
            {activeTab === "shipping" && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Header title */}
                <div className="border-b border-zinc-100 pb-5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-orange-500 uppercase">
                    <Truck className="h-4 w-4" /> Live Transit & Distribution
                  </div>
                  <h2 className="text-2xl md:text-3.5xl font-sans font-black text-zinc-950 uppercase">Shipping Coverage, Charges, and Logistics Times</h2>
                </div>

                {/* Grid metrics highlight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 border bg-zinc-50 border-zinc-200 rounded-2xl">
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400">Pincode Reach</span>
                    <p className="text-lg font-black text-zinc-950 uppercase mt-1">Pan-India Courier Network</p>
                    <p className="text-xs text-zinc-650 leading-relaxed mt-1">Free express shipping to virtually all cities and remote rural towns in India.</p>
                  </div>
                  <div className="p-5 border bg-orange-600/5 border-orange-100 rounded-2xl">
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-orange-650 animate-pulse">Charges</span>
                    <p className="text-lg font-black text-zinc-950 uppercase mt-1">₹0 Ship Fee - Always Free</p>
                    <p className="text-xs text-zinc-650 leading-relaxed mt-1">Cash on Delivery option generates no hidden transactional surcharges.</p>
                  </div>
                </div>

                {/* Delivery Timeframes list */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase text-zinc-900 tracking-wider">Estimated Delivery Commitments</h3>
                  <div className="space-y-3 font-sans text-xs text-zinc-700">
                    <div className="flex gap-3.5 items-start p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100/50 transition border border-zinc-100">
                      <Clock className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-zinc-950">Metros Hub (Mumbai, Delhi-NCR, Bangalore)</p>
                        <p className="text-zinc-550 leading-relaxed mt-0.5">Dispatched via premium express air carriers. Arrival within <strong>2 to 3 Working Days</strong>.</p>
                      </div>
                    </div>
                    <div className="flex gap-3.5 items-start p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                      <Clock className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-zinc-950">Rest of Indian States & UTs</p>
                        <p className="text-zinc-550 leading-relaxed mt-0.5">Shipped securely with leading surface courier systems. Arrival within <strong>4 to 6 Working Days</strong>.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="bg-zinc-900 text-zinc-100 rounded-2xl p-6 relative overflow-hidden">
                  <h3 className="text-xs font-mono font-black text-orange-400 uppercase tracking-widest mb-4">Loom Dispatch Processing Sequence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                    <div className="space-y-1">
                      <p className="font-bold text-white font-mono text-[11px] text-orange-400">STEP 1: PACKING</p>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">Garments are meticulously steamed, inspected, and vacuum safe sealed for absolute hygiene.</p>
                    </div>
                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-4">
                      <p className="font-bold text-white font-mono text-[11px] text-orange-400">STEP 2: ALLOCATION</p>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">A live airway bill docket is generated under carrier partners (Shiprocket, Blue Dart, or Delhivery).</p>
                    </div>
                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-4">
                      <p className="font-bold text-white font-mono text-[11px] text-orange-400">STEP 3: SHIPMENT</p>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">Pincode sorting is finalized, and real-time transit status updates instantly reflect on your tracking logs.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: RETURNS & REFUNDS POLICY */}
            {activeTab === "refund" && (
              <div className="space-y-8 animate-fade-in">
                
                <div className="border-b border-zinc-100 pb-5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-[#F27D26] uppercase">
                    <RotateCcw className="h-4 w-4" /> Seamless Replacement
                  </div>
                  <h2 className="text-2xl md:text-3.5xl font-sans font-black text-zinc-950 uppercase">10-Day Perfect Fit Return & Refund Policy</h2>
                </div>

                {/* Overview callout */}
                <div className="p-5 bg-orange-50/10 border-2 border-orange-100 rounded-2xl flex items-start gap-4">
                  <RotateCcw className="h-6 w-6 text-orange-500 shrink-0 mt-1" />
                  <div className="text-xs leading-relaxed text-zinc-650 space-y-1">
                    <p className="font-bold text-zinc-900 uppercase tracking-wide text-[10px]">Pristine Condition Eligibility</p>
                    <p>To qualify for size exchanges or complete direct refunds, newly acquired CLINZA apparel garments must be returned completely unwashed, unaltered, and equipped with all original ticket tags still intact.</p>
                  </div>
                </div>

                {/* Double column details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-700">
                  <div className="space-y-3 bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
                    <h4 className="font-bold text-zinc-950 uppercase font-mono tracking-wider text-[10px] text-orange-600">The Sizing exchange process</h4>
                    <ul className="list-disc pl-4 space-y-1.5 leading-relaxed text-zinc-650">
                      <li>Launch WhatsApp support or fill the exchange request.</li>
                      <li>Select your required size configuration swap.</li>
                      <li>We arrange a doorstep courier pickup of the original item completely free of charge.</li>
                    </ul>
                  </div>
                  <div className="space-y-3 bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
                    <h4 className="font-bold text-zinc-950 uppercase font-mono tracking-wider text-[10px] text-orange-600">Pure Refund processing</h4>
                    <p className="leading-relaxed text-zinc-650">Upon receiving the original garment at our Mumbai logistical sorting hub, our team audits the fibers within 24 hours.</p>
                    <p className="leading-relaxed text-zinc-650">Approved refunds are credited directly to your credit card gateway or bank account within 3–5 working days.</p>
                  </div>
                </div>

                {/* Non-returnable list */}
                <div className="border border-zinc-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-zinc-900 font-bold">
                    <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
                    <span className="text-[11px] font-mono uppercase tracking-wider">Non-returnable Garment items</span>
                  </div>
                  <p className="text-xs text-zinc-550 leading-relaxed">
                    Custom built bespoke tailored coordinates, limited capsule-edition items with explicitly marked clearances, and select inner garments cannot be processed for swaps or refunds due to corporate dynamic health and hygiene mandates.
                  </p>
                </div>

              </div>
            )}

            {/* TAB: PRIVACY POLICY */}
            {activeTab === "privacy" && (
              <div className="space-y-8 animate-fade-in">
                
                <div className="border-b border-zinc-100 pb-5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-[#F27D26] uppercase">
                    <ShieldCheck className="h-4 w-4" /> Client Privacy Desk
                  </div>
                  <h2 className="text-2xl md:text-3.5xl font-sans font-black text-zinc-950 uppercase">Intellectual Data Protection & Selfie Storage Guidelines</h2>
                </div>

                <div className="prose prose-zinc text-xs text-zinc-650 space-y-5 leading-relaxed">
                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-900 uppercase tracking-widest text-[10px]">1. Absolute Data Safety Assurance</h3>
                    <p>At CLINZA, we adhere to strict digital encryption frameworks. User credentials, shipping contact indices, and communication logs are stored inside isolated databases strictly for checkout processing, and are never shared with or licensed to advertising syndicates.</p>
                  </div>

                  <div className="space-y-1 pt-3 border-t">
                    <h3 className="font-bold text-zinc-900 uppercase tracking-widest text-[10px] text-orange-600 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> 2. AI Style Analyzer Selfie Procedures
                    </h3>
                    <p>Images and facial snaps uploaded dynamically via our AI smart styling tool are analyzed purely client-to-server utilizing instantaneous dynamic math matrices: </p>
                    <ul className="list-disc pl-4 space-y-1 mt-1 font-sans text-zinc-500">
                      <li>Faces are mapped temporarily in live virtual RAM segments to deduce color palette compatibility.</li>
                      <li>Images are never written to permanent cloud files or hard disk arrays.</li>
                      <li>These matrices are automatically garbage-collected and flushed immediately upon closing the session.</li>
                    </ul>
                  </div>

                  <div className="space-y-2 pt-3 border-t">
                    <h3 className="font-bold text-zinc-900 uppercase tracking-widest text-[10px]">3. Shipping integrations protection</h3>
                    <p>Outward transmission of user coordinates is restricted exclusively to vetted courier hubs (e.g. Shiprocket API) for printing real-world packing waybills with signature verification.</p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: TERMS & CONDITIONS */}
            {activeTab === "terms" && (
              <div className="space-y-8 animate-fade-in">
                
                <div className="border-b border-zinc-100 pb-5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                    <FileText className="h-4 w-4" /> Legal Framework
                  </div>
                  <h2 className="text-2xl md:text-3.5xl font-sans font-black text-zinc-950 uppercase">Corporate Service & Outfit reservation Terms</h2>
                </div>

                <div className="prose prose-zinc text-xs text-zinc-650 space-y-5 leading-relaxed font-sans">
                  
                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-950 uppercase tracking-wider text-[11px]">1. Intellectual Property Protection</h3>
                    <p>
                      The stylistic textures, clothing silhouettes, layout visuals, code sequences, custom styling algorithms, and photographic catalog matrices displayed across our portals are the exclusive property of CLINZA Luxury Garments Private Limited. Any imitation is subject to copyright prosecution.
                    </p>
                  </div>

                  <div className="space-y-1 pt-3 border-t">
                    <h3 className="font-bold text-zinc-950 uppercase tracking-wider text-[11px]">2. High-Risk Order evaluation guidelines</h3>
                    <p>
                      To prevent Cash on Delivery loss loops, our systems run background threat scores on pincodes and contact fields. We reserve absolute corporate rights to reject or suspend orders which flag high-risk coordinates or match historic courier return patterns.
                    </p>
                  </div>

                  <div className="space-y-1 pt-3 border-t">
                    <h3 className="font-bold text-zinc-950 uppercase tracking-wider text-[11px]">3. Liability Disclaimers</h3>
                    <p>
                      We strive to display garment dye tones as accurately as possible under professional lighting conditions. Subtle tone variances may arise depending on color temperatures in your viewing monitors, which does not constitute texturing flaw status.
                    </p>
                  </div>

                </div>

              </div>
            )}

            {/* TAB: GENERAL FAQS CLIENT ACCORDION */}
            {activeTab === "faq" && (
              <div className="space-y-6 animate-fade-in">
                
                <div className="border-b border-zinc-100 pb-5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-purple-500 uppercase">
                    <HelpCircle className="h-4 w-4" /> Modern accordion FAQ
                  </div>
                  <h2 className="text-2xl md:text-3.5xl font-sans font-black text-zinc-950 uppercase">Frequently Asked Sizing & Merchant Questions</h2>
                </div>

                {/* FAQ list with accordion expand */}
                <div className="space-y-3 text-left">
                  {faqsList.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                          isOpen ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-400"
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-4 md:p-5 flex items-center justify-between text-xs md:text-sm font-semibold text-zinc-900 focus:outline-none cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5 font-sans">
                            <span className="font-mono text-xs font-bold text-orange-500">Q{idx + 1}.</span>
                            {faq.q}
                          </span>
                          {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                        </button>
                        
                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 text-xs text-zinc-650 leading-relaxed animate-fade-in font-sans">
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
