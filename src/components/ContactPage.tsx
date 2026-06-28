/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  RefreshCw
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Wardrobe Inquiry",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErr("Please complete all requested asterisk (*) credentials.");
      return;
    }
    setErr(null);
    setSending(true);

    // Simulate sending corporate message
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Wardrobe Inquiry",
        message: ""
      });
    }, 1200);
  };

  return (
    <section id="clinza-contact-channel" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-100 min-h-screen text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP TITLE */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-mono font-black text-orange-500 tracking-[0.25em] pb-1 uppercase border-b border-orange-200 inline-block">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-sans font-black uppercase tracking-tight text-zinc-950 leading-none">
            Connect with our Stylists
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light">
            Have questions about clothing material threads, fit sizing, custom deliveries, or bulk order reservations? Send our Mumbai showroom a ticket.
          </p>
        </div>

        {/* DOUBLE COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* L.H.S COMPILATION (5 Columns) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            
            <div className="bg-zinc-950 text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-xl border border-zinc-800 flex-1">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-orange-500/10 rounded-full blur-[60px]" />
              
              <div className="relative z-10 space-y-1">
                <span className="text-[9px] font-mono tracking-widest text-orange-400 font-bold uppercase">Corporate Headquarters</span>
                <h2 className="text-2xl font-sans font-black uppercase text-zinc-50 tracking-tight leading-none">Mumbai Showroom Desk</h2>
              </div>

              {/* STATS MATRIX */}
              <div className="space-y-4.5 font-sans text-xs pt-4 border-t border-zinc-800 relative z-10">
                
                {/* Location */}
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-white/5 text-orange-400 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-100">Showroom Address</p>
                    <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                      CLINZA Luxury Threads Ltd., Block C-14, Laxami Silk Mill Compound, Lower Parel, Mumbai, Maharashtra - 400013
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-white/5 text-orange-400 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-100">Stylist Email Desk</p>
                    <p className="text-zinc-400 text-[11px] mt-0.5 font-mono select-all">concierge@clinza.com</p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-[#1b8a3a]/10 text-emerald-400 shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-100">Concierge Active Hours</p>
                    <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                      Daily: <strong>10:00 AM – 8:00 PM IST</strong>
                    </p>
                    <span className="text-[9px] text-[#1b8a3a] font-mono font-bold uppercase block mt-1">Ready for real-time order tracking support</span>
                  </div>
                </div>

                {/* WhatsApp button inside card */}
                <div className="pt-2">
                  <a
                    href="https://wa.me/917208572688?text=Hello%20CLINZA%20Team%2C%20I%20need%20stylist%20support."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#1b8a3a] hover:bg-[#126b2b] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all cursor-pointer text-center block flex items-center justify-center gap-2"
                  >
                    <img 
                      src="https://i.postimg.cc/fVFPc5Mf/image.png" 
                      onError={(e) => { e.currentTarget.src = "https://i.postimg.cc/Vr6DJmCQ/image.png"; }}
                      alt="WhatsApp" 
                      className="h-4.5 w-4.5 object-contain rounded-full bg-white shrink-0"
                    /> 
                    Start Live WhatsApp Support
                  </a>
                </div>

              </div>

            </div>

            {/* Simulated Google Map Placeholder (using visual illustration layout) */}
            <div className="bg-zinc-200 border border-zinc-300 rounded-3xl p-6 relative overflow-hidden h-[240px] flex flex-col justify-between shadow-xs">
              {/* Decorative Map Pattern background */}
              <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />
              <div className="absolute top-[35%] left-[45%] h-12 w-12 bg-orange-500/25 rounded-full blur-xl animate-pulse" />
              <div className="absolute top-[41%] left-[51%] text-orange-600 animate-bounce">
                <MapPin className="h-8 w-8 fill-orange-500 stroke-white stroke-[2]" />
              </div>
              
              <div className="relative z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl border max-w-xs text-left">
                <p className="text-[10px] font-black uppercase text-zinc-900 tracking-wide font-sans">Lower Parel Showroom locator</p>
                <p className="text-[9px] text-zinc-500 font-sans mt-0.5">Click map to launch standard external navigation prompts.</p>
              </div>

              <a
                href="https://maps.google.com/?q=Lower+Parel,+Mumbai,+Maharashtra"
                target="_blank"
                rel="noreferrer"
                className="relative z-10 self-end bg-zinc-950 hover:bg-orange-600 hover:text-black transition-colors text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg font-mono flex items-center gap-1 cursor-pointer"
              >
                <span>Navigate Terminal</span>
              </a>
            </div>

          </div>

          {/* R.H.S FEEDBACK FORM (7 Columns) */}
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 md:p-10 shadow-xs flex flex-col justify-center">
            
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider font-sans mb-1">Direct Message Form</h3>
                  <p className="text-xs text-zinc-400 font-light">Your transmission ticket is processed securely. Typical answer intervals average 4 hours.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 font-mono">Your Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Samuel J."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 py-2.5 px-3 rounded-xl text-xs font-sans focus:outline-none focus:bg-white transition-all text-zinc-900"
                    />
                  </div>
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 font-mono">Your Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. sam@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 py-2.5 px-3 rounded-xl text-xs font-sans focus:outline-none focus:bg-white transition-all text-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 font-mono">Contact Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 py-2.5 px-3 rounded-xl text-xs font-sans focus:outline-none focus:bg-white transition-all text-zinc-900"
                    />
                  </div>
                  {/* Subject */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 font-mono">Inquiry Topic</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 py-2.5 px-3 rounded-xl text-xs font-sans focus:outline-none focus:bg-white transition-all text-zinc-800 font-semibold"
                    >
                      <option value="Wardrobe Inquiry">Wardrobe Inquiry</option>
                      <option value="Sizing Swap Swap">Sizing Swap Request</option>
                      <option value="Cash On Delivery Logistics">Cash On Delivery Issue</option>
                      <option value="Bespoke Tailor Booking">Bespoke Mill Booking</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 font-mono">Stylist Message *</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your design specifications or logistics questions in detail here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 py-2.5 px-3 rounded-xl text-xs font-sans focus:outline-none focus:bg-white transition-all text-zinc-900 leading-relaxed font-medium"
                  />
                </div>

                {err && (
                  <p className="text-[11px] text-red-500 font-mono flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {err}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-zinc-950 hover:bg-[#F27D26] hover:text-black font-sans text-[10px] font-black uppercase tracking-widest text-white py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Transmitting secure ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Transmit Message Ticket</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-12 space-y-5 animate-scale-up">
                <div className="h-16 w-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200 animate-pulse">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-sans font-black uppercase text-zinc-950 tracking-tight leading-none">Ticket Received Successfully</h3>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                    Thank you for connecting with CLINZA. Our Mumbai showroom stylists have queued your query. We will reach out via your listed contact credentials within a moments notice.
                  </p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-zinc-950 hover:bg-orange-600 text-white font-sans text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
