/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  History, 
  Search, 
  Filter, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  RefreshCw,
  Download
} from "lucide-react";
import { AutomationLog } from "../../../types/automation";

interface AutomationLogsModuleProps {
  logs: AutomationLog[];
  onRefreshLogs: () => void;
}

export default function AutomationLogsModule({
  logs,
  onRefreshLogs
}: AutomationLogsModuleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<"ALL" | "WHATSAPP" | "EMAIL">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.automationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChannel = channelFilter === "ALL" || log.channel === channelFilter;
    const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const exportLogsCsv = () => {
    const headers = "ID,Channel,Workflow,Recipient,Name,Status,Timestamp\n";
    const rows = filteredLogs.map(l => 
      `"${l.id}","${l.channel}","${l.automationName}","${l.recipient}","${l.recipientName}","${l.status}","${l.timestamp}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Clinza_Automation_Delivery_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <History className="h-5 w-5 text-orange-500" /> Dispatch & Delivery Logs Audit
          </h2>
          <p className="text-xs text-zinc-400">
            Audit history of automated message dispatches, open rates, and error diagnostics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshLogs}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono rounded-lg cursor-pointer transition flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportLogsCsv}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-lg shadow-orange-600/20"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search recipient, name or workflow..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Channel Filter */}
        <div>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as any)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Communication Channels</option>
            <option value="WHATSAPP">WhatsApp API Only</option>
            <option value="EMAIL">Email Gateway Only</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Delivery Statuses</option>
            <option value="DELIVERED">Delivered</option>
            <option value="READ">Read / Opened</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/60 font-mono text-[10px] uppercase text-zinc-400 border-b border-zinc-900">
              <tr>
                <th className="p-3.5">Log ID</th>
                <th className="p-3.5">Channel</th>
                <th className="p-3.5">Workflow / Template</th>
                <th className="p-3.5">Recipient Details</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No dispatch log records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition">
                    <td className="p-3.5 text-zinc-500 text-[10px]">{log.id}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        log.channel === "WHATSAPP" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      }`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-white font-sans">{log.automationName}</td>
                    <td className="p-3.5">
                      <span className="block font-bold text-white font-sans">{log.recipientName}</span>
                      <span className="text-[10px] text-zinc-400">{log.recipient}</span>
                    </td>
                    <td className="p-3.5">
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
                    <td className="p-3.5 text-zinc-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
