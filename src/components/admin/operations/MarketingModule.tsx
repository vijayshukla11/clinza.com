/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  MousePointer, 
  Coins, 
  UserPlus, 
  DollarSign, 
  Sparkles,
  ExternalLink,
  Layers
} from "lucide-react";
import { CampaignData } from "./types";

export default function MarketingModule() {
  // Live / Dynamic Marketing Campaigns Performance Ledger
  const campaigns: CampaignData[] = [
    {
      id: "camp-01",
      platform: "Meta Ads",
      name: "Clinza Summer Linen '26 - Retargeting",
      spend: 42000,
      revenue: 198000,
      orders: 54,
      clicks: 8400,
      impressions: 142000,
      ctr: 5.9,
      cpc: 5.0,
      cac: 777,
      roas: 4.7
    },
    {
      id: "camp-02",
      platform: "Google Ads",
      name: "Search - Selvedge Jeans & Shirts High Intent",
      spend: 38000,
      revenue: 162000,
      orders: 42,
      clicks: 2900,
      impressions: 48000,
      ctr: 6.0,
      cpc: 13.1,
      cac: 904,
      roas: 4.26
    },
    {
      id: "camp-03",
      platform: "Meta Ads",
      name: "Instagram Advantage+ Catalog Sales",
      spend: 29000,
      revenue: 118000,
      orders: 31,
      clicks: 6100,
      impressions: 105000,
      ctr: 5.8,
      cpc: 4.75,
      cac: 935,
      roas: 4.06
    },
    {
      id: "camp-04",
      platform: "Google Ads",
      name: "Performance Max - Apparel Catalog",
      spend: 22000,
      revenue: 84000,
      orders: 22,
      clicks: 1800,
      impressions: 39000,
      ctr: 4.6,
      cpc: 12.2,
      cac: 1000,
      roas: 3.81
    },
    {
      id: "camp-05",
      platform: "Influencer",
      name: "Mumbai Men's Style Ambassador Collab",
      spend: 15000,
      revenue: 68000,
      orders: 19,
      clicks: 4200,
      impressions: 88000,
      ctr: 4.7,
      cpc: 3.57,
      cac: 789,
      roas: 4.53
    }
  ];

  // Aggregate Platform Specific Calculations
  const metaCampaigns = campaigns.filter(c => c.platform === "Meta Ads");
  const googleCampaigns = campaigns.filter(c => c.platform === "Google Ads");

  const metaSpend = metaCampaigns.reduce((s, c) => s + c.spend, 0);
  const metaRevenue = metaCampaigns.reduce((s, c) => s + c.revenue, 0);
  const metaRoas = metaSpend > 0 ? (metaRevenue / metaSpend).toFixed(2) : "0";

  const googleSpend = googleCampaigns.reduce((s, c) => s + c.spend, 0);
  const googleRevenue = googleCampaigns.reduce((s, c) => s + c.revenue, 0);
  const googleRoas = googleSpend > 0 ? (googleRevenue / googleSpend).toFixed(2) : "0";

  // Overall Marketing Stats
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const totalOrders = campaigns.reduce((s, c) => s + c.orders, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);

  const overallRoas = (totalRevenue / totalSpend).toFixed(2);
  const avgCtr = ((totalClicks / totalImpressions) * 100).toFixed(2);
  const avgCpc = (totalSpend / totalClicks).toFixed(2);
  const avgCac = Math.round(totalSpend / totalOrders);

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-sky-400" /> Marketing & Campaign ROAS Telemetry
          </h2>
          <p className="text-xs text-zinc-400">Ad acquisition performance across Google Ads, Meta Ads & Campaign attribution</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 px-2.5 py-1 border border-sky-500/20 rounded">
            Overall ROAS: {overallRoas}x
          </span>
        </div>
      </div>

      {/* 1. Google Ads vs Meta Ads Primary Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Google Ads Card */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold font-mono text-sm">
                G
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Google Ads Channel</h3>
                <p className="text-[10px] text-zinc-400 font-mono">Search & Performance Max Campaigns</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
              ROAS {googleRoas}x
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-mono">
            <div>
              <span className="text-[9px] uppercase text-zinc-500 block">Ad Spend</span>
              <span className="text-base font-bold text-white">₹{googleSpend.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-zinc-500 block">Attributed Revenue</span>
              <span className="text-base font-bold text-emerald-400">₹{googleRevenue.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-zinc-500 block">Active Campaigns</span>
              <span className="text-base font-bold text-zinc-300">{googleCampaigns.length}</span>
            </div>
          </div>
        </div>

        {/* Meta Ads Card */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden group hover:border-sky-500/40 transition">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold font-mono text-sm">
                M
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Meta Ads Channel</h3>
                <p className="text-[10px] text-zinc-400 font-mono">Instagram & Facebook Retargeting</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20">
              ROAS {metaRoas}x
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-mono">
            <div>
              <span className="text-[9px] uppercase text-zinc-500 block">Ad Spend</span>
              <span className="text-base font-bold text-white">₹{metaSpend.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-zinc-500 block">Attributed Revenue</span>
              <span className="text-base font-bold text-emerald-400">₹{metaRevenue.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-zinc-500 block">Active Campaigns</span>
              <span className="text-base font-bold text-zinc-300">{metaCampaigns.length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Key Acquisition Efficiency Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Campaign ROAS */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Blended ROAS</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{overallRoas}x</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-1">₹{totalRevenue.toLocaleString("en-IN")} revenue</span>
        </div>

        {/* CTR */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Click-Through Rate (CTR)</span>
            <MousePointer className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white">{avgCtr}%</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-1">{totalClicks.toLocaleString()} total clicks</span>
        </div>

        {/* CPC */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Cost Per Click (CPC)</span>
            <Coins className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">₹{avgCpc}</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-1">Cost per site visitor</span>
        </div>

        {/* CAC */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Acquisition Cost (CAC)</span>
            <UserPlus className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">₹{avgCac}</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-1">Per paying customer</span>
        </div>
      </div>

      {/* 3. Revenue by Campaign Table */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange-500" /> Revenue & Attribution By Campaign
            </h3>
            <p className="text-xs text-zinc-400">Detailed campaign attribution ledger and efficiency breakdown</p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">{campaigns.length} Active Campaigns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/60 font-mono text-[10px] uppercase text-zinc-400">
              <tr>
                <th className="p-3">Platform</th>
                <th className="p-3">Campaign Name</th>
                <th className="p-3">Ad Spend</th>
                <th className="p-3">Attributed Revenue</th>
                <th className="p-3">Orders</th>
                <th className="p-3">CTR %</th>
                <th className="p-3">CPC</th>
                <th className="p-3">CAC</th>
                <th className="p-3">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-900/40 transition">
                  <td className="p-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      c.platform === "Meta Ads"
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                        : c.platform === "Google Ads"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}>
                      {c.platform}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{c.name}</td>
                  <td className="p-3 font-mono font-bold text-white">₹{c.spend.toLocaleString("en-IN")}</td>
                  <td className="p-3 font-mono font-black text-emerald-400">₹{c.revenue.toLocaleString("en-IN")}</td>
                  <td className="p-3 font-mono text-zinc-300">{c.orders} orders</td>
                  <td className="p-3 font-mono text-zinc-400">{c.ctr}%</td>
                  <td className="p-3 font-mono text-zinc-400">₹{c.cpc}</td>
                  <td className="p-3 font-mono text-zinc-400">₹{c.cac}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{c.roas}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
