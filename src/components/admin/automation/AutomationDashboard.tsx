/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Send, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  MousePointer, 
  DollarSign, 
  TrendingUp, 
  Smartphone, 
  Zap, 
  Layers,
  ArrowUpRight,
  Clock,
  ShieldCheck
} from "lucide-react";
import { AutomationAnalytics, AutomationLog } from "../../../types/automation";

interface AutomationDashboardProps {
  analytics: AutomationAnalytics;
  recentLogs: AutomationLog[];
  onNavigateToTab: (tab: "whatsapp" | "email" | "settings" | "logs") => void;
}

export default function AutomationDashboard({
  analytics,
  recentLogs,
  onNavigateToTab
}: AutomationDashboardProps) {
  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. TOP METRICS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* WhatsApp Sent */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Messages Sent</span>
            <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-white">{analytics.totalMessagesSent.toLocaleString()}</p>
          <span className="text-[9px] text-emerald-400/90 font-mono block mt-0.5">WhatsApp API</span>
        </div>

        {/* Emails Sent */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Emails Sent</span>
            <Mail className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <p className="text-xl font-black text-white">{analytics.totalEmailsSent.toLocaleString()}</p>
          <span className="text-[9px] text-indigo-400/90 font-mono block mt-0.5">SMTP & Resend</span>
        </div>

        {/* Delivery Success Rate */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-emerald-400">Success Rate</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-300">{analytics.deliverySuccessRate}%</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">Verified dispatches</span>
        </div>

        {/* Failed Messages */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-red-400">Failed Dispatches</span>
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
          </div>
          <p className="text-xl font-black text-red-300">{analytics.failedMessagesCount}</p>
          <span className="text-[9px] text-red-400/80 font-mono block mt-0.5">Network / Invalid no.</span>
        </div>

        {/* Open Rate */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Open Rate</span>
            <Eye className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <p className="text-xl font-black text-white">{analytics.openRate}%</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">Email & WA Read</span>
        </div>

        {/* Click Rate */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Click Rate (CTR)</span>
            <MousePointer className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white">{analytics.clickRate}%</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">Button CTA Clicks</span>
        </div>

        {/* Revenue from Automations */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl border-orange-500/20 bg-orange-500/5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-orange-400">Attributed Revenue</span>
            <DollarSign className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <p className="text-xl font-black text-orange-300">₹{analytics.revenueGenerated.toLocaleString("en-IN")}</p>
          <span className="text-[9px] text-orange-400/80 font-mono block mt-0.5">Cart & Promo Recovery</span>
        </div>
      </div>

      {/* 2. CHANNEL SUMMARY & QUICK TRIGGER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WhatsApp Channel Card */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4 hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">WhatsApp Business Automation</h3>
                <p className="text-[10px] font-mono text-zinc-400">Meta Cloud API & Twilio Gateway</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab("whatsapp")}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-lg transition cursor-pointer flex items-center gap-1 uppercase"
            >
              <span>Manage Templates</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-zinc-900/60 p-3 rounded-lg">
              <span className="text-[9px] text-zinc-500 uppercase block">Active Workflows</span>
              <span className="font-bold text-white text-sm">12 Enabled</span>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-lg">
              <span className="text-[9px] text-zinc-500 uppercase block">Avg Delivery</span>
              <span className="font-bold text-emerald-400 text-sm">&lt; 2.4s</span>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-lg">
              <span className="text-[9px] text-zinc-500 uppercase block">Read Rate</span>
              <span className="font-bold text-sky-400 text-sm">88.4%</span>
            </div>
          </div>
        </div>

        {/* Email Channel Card */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4 hover:border-indigo-500/30 transition">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Email Workflow Automation</h3>
                <p className="text-[10px] font-mono text-zinc-400">SMTP, Resend & AWS SES Engine</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab("email")}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold rounded-lg transition cursor-pointer flex items-center gap-1 uppercase"
            >
              <span>Manage Workflows</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-zinc-900/60 p-3 rounded-lg">
              <span className="text-[9px] text-zinc-500 uppercase block">Active Workflows</span>
              <span className="font-bold text-white text-sm">11 Enabled</span>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-lg">
              <span className="text-[9px] text-zinc-500 uppercase block">Avg Open Rate</span>
              <span className="font-bold text-indigo-400 text-sm">52.1%</span>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-lg">
              <span className="text-[9px] text-zinc-500 uppercase block">Click Rate</span>
              <span className="font-bold text-amber-400 text-sm">18.6%</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. RECENT DISPATCH LOGS TABLE */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" /> Real-time Dispatch Telemetry Feed
            </h3>
            <p className="text-xs text-zinc-400">Live delivery statuses across WhatsApp and Email automation channels</p>
          </div>
          <button
            onClick={() => onNavigateToTab("logs")}
            className="text-[10px] font-mono font-bold text-orange-400 hover:underline cursor-pointer uppercase"
          >
            View Full Logs Matrix &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/60 font-mono text-[10px] uppercase text-zinc-400">
              <tr>
                <th className="p-3">Channel</th>
                <th className="p-3">Workflow / Template</th>
                <th className="p-3">Recipient</th>
                <th className="p-3">Status</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {recentLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/40 transition">
                  <td className="p-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      log.channel === "WHATSAPP" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    }`}>
                      {log.channel}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{log.automationName}</td>
                  <td className="p-3 font-mono text-zinc-300">
                    <span className="block font-bold text-white">{log.recipientName}</span>
                    <span className="text-[10px] text-zinc-500">{log.recipient}</span>
                  </td>
                  <td className="p-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      log.status === "DELIVERED" || log.status === "READ" || log.status === "OPENED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : log.status === "SENT"
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-zinc-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
