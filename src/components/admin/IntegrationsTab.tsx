/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sliders, CheckCircle2, AlertCircle, Info, RefreshCw, Layers } from "lucide-react";

export default function IntegrationsTab() {
  const [form, setForm] = useState({
    ga4Id: "G-CLZ9876543",
    gscMeta: "gsc-verification-meta-hash-112233",
    merchantFeedUrl: "https://clinza-applet-run.app/api/feeds/merchant.xml",
    gtmContainerId: "GTM-CLNZ44A",
    metaPixelId: "6472891045"
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("clinza_pixel_integrations");
    if (cached) {
      setForm(JSON.parse(cached));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("clinza_pixel_integrations", JSON.stringify(form));
      setSaving(false);
      alert("Integration triggers successfully committed! Live pixels and site tracking updated.");
    }, 800);
  };

  return (
    <div id="google-integrations-panel" className="space-y-6 text-left animate-fade-in text-xs font-sans">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* LHS */}
        <div className="md:col-span-7">
          <form onSubmit={handleSave} className="bg-white border rounded-2xl p-6 space-y-5 shadow-xs">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Google & Pixels Integrations</h3>
              <p className="text-[11px] text-zinc-400">Sync with Search engines, analytical dashboards and ad platforms</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Google Analytics 4 Tracking Measure (GA4 ID)</label>
                <input
                  type="text"
                  placeholder="e.g. G-XXXXXXXXXX"
                  value={form.ga4Id}
                  onChange={(e) => setForm({ ...form, ga4Id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-mono bg-white focus:outline-none focus:border-orange-500 text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Google Search Console HTML Verification Meta Hash</label>
                <input
                  type="text"
                  placeholder="e.g. google-site-verification=..."
                  value={form.gscMeta}
                  onChange={(e) => setForm({ ...form, gscMeta: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-mono bg-white focus:outline-none focus:border-orange-500 text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Google Merchant Center Products XML Feed URL</label>
                <input
                  type="text"
                  value={form.merchantFeedUrl}
                  onChange={(e) => setForm({ ...form, merchantFeedUrl: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-[10.5px] font-mono bg-white focus:outline-none focus:border-orange-500 text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Google Tag Manager Container (GTM ID)</label>
                <input
                  type="text"
                  placeholder="e.g. GTM-XXXXXX"
                  value={form.gtmContainerId}
                  onChange={(e) => setForm({ ...form, gtmContainerId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-mono bg-white focus:outline-none focus:border-orange-500 text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Meta Pixel Conversion Tracker ID (Facebook Ads)</label>
                <input
                  type="text"
                  placeholder="e.g. Facebook Pixel ID"
                  value={form.metaPixelId}
                  onChange={(e) => setForm({ ...form, metaPixelId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-xs font-mono bg-white focus:outline-none focus:border-orange-500 text-zinc-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow cursor-pointer text-center flex items-center justify-center gap-1.5 transition"
            >
              {saving ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : "Authorize Tracking Pixels"}
            </button>
          </form>
        </div>

        {/* RHS SEO SYSTEM STATUS STATUS */}
        <div className="md:col-span-5 space-y-6 text-zinc-700">
          
          <div className="p-5 border bg-white rounded-2xl shadow-xs space-y-4">
            <h3 className="text-[11px] font-black font-mono uppercase text-zinc-400 tracking-wider">
              Automated SEO Robots Status
            </h3>
            
            <div className="space-y-3 font-sans">
              <div className="flex gap-2 text-zinc-700">
                <CheckCircle2 className="h-4.5 w-4.5 text-green-500 shrink-0" />
                <div>
                  <span className="font-bold block text-zinc-950">Dynamic Sitemap XML</span>
                  <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">Sitemaps index generated with 24 indices syncing product slugs, categories, and editorial journals automatically.</p>
                </div>
              </div>

              <div className="flex gap-2 text-zinc-700">
                <CheckCircle2 className="h-4.5 w-4.5 text-green-500 shrink-0" />
                <div>
                  <span className="font-bold block text-zinc-950">Structured LD Schema</span>
                  <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">Microdata payloads automatically inject breadcrumbs and products pricing values directly into index markup.</p>
                </div>
              </div>

              <div className="flex gap-2 text-zinc-700">
                <CheckCircle2 className="h-4.5 w-4.5 text-green-500 shrink-0" />
                <div>
                  <span className="font-bold block text-zinc-950">Robots.txt & Meta Tags</span>
                  <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">Fully compliant with search indexing crawlers. Open Graph and Twitter Card tags automatically computed.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-50/20 border border-orange-100 rounded-2xl flex gap-2">
            <Info className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-[10.5px] leading-relaxed text-zinc-550 font-sans">
              All pixel identifiers set up here launch concurrently on both client storefront views and backend checkout endpoints. Secure verification.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
