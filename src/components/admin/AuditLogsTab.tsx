import React, { useState, useEffect } from "react";
import { AdminAuditLogService } from "../../services/supabaseService";
import { ShieldAlert, RefreshCw, Search, Terminal, Calendar } from "lucide-react";

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    const data = await AdminAuditLogService.getLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.admin_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.admin_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.affected_record?.toLowerCase().includes(search.toLowerCase());

    const matchesAction = filterAction === "all" || log.action?.toLowerCase().includes(filterAction.toLowerCase());

    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("delete")) return "bg-red-500/10 text-red-400 border-red-500/20";
    if (act.includes("create") || act.includes("save")) return "bg-green-500/10 text-green-400 border-green-500/20";
    if (act.includes("update") || act.includes("change")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (act.includes("failed")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (act.includes("login")) return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    if (act.includes("logout")) return "bg-zinc-500/10 text-zinc-400 border-zinc-550/20";
    return "bg-zinc-500/10 text-zinc-400 border-zinc-800";
  };

  return (
    <div id="admin-audit-logs-panel" className="space-y-6 font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-orange-500" />
            Security Audit Logs Ledger
          </h2>
          <p className="text-[11px] text-zinc-500 font-light mt-1">
            Real-time trace of administrative transactions, state modifications, and authentication attempts.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[10px] font-mono uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin text-orange-500" : ""}`} />
          Reload logs
        </button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#070707] border border-zinc-900 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono uppercase text-zinc-500">Total Recorded Entries</h4>
            <span className="text-xl font-bold font-mono text-white">{logs.length}</span>
          </div>
        </div>
        <div className="bg-[#070707] border border-zinc-900 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono uppercase text-zinc-500">Success Clearance Logins</h4>
            <span className="text-xl font-bold font-mono text-white">
              {logs.filter(l => l.action?.toLowerCase() === "login").length}
            </span>
          </div>
        </div>
        <div className="bg-[#070707] border border-zinc-900 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono uppercase text-zinc-500">Unauthorized Rejections</h4>
            <span className="text-xl font-bold font-mono text-white">
              {logs.filter(l => l.action?.toLowerCase().includes("failed")).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#070707] border border-zinc-900 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by staff email, name, action, or affected record..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-500 font-bold"
        >
          <option value="all">All Operations Types</option>
          <option value="login">Authentication (Login/Logout)</option>
          <option value="product">Products Catalog Management</option>
          <option value="order">Order Fulfillment Board</option>
          <option value="blog">Editorial CMS Activities</option>
          <option value="failed">Security Rejections & Warning</option>
        </select>
      </div>

      {/* Logs Table Area */}
      <div className="bg-[#070707] border border-zinc-900 rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 text-center text-zinc-550 font-mono text-[10px] uppercase tracking-widest flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
            Querying Secure Ledger Logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center text-zinc-550 font-mono text-xs">
            No matching security logs found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Staff User</th>
                  <th className="py-3 px-4">Role Clearance</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Affected Record / Resource</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-[11px] font-sans">
                {filteredLogs.map((log) => {
                  const timestamp = log.created_at 
                    ? new Date(log.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })
                    : "N/A";
                  return (
                    <tr key={log.id} className="hover:bg-zinc-950/40 transition">
                      <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-zinc-650" />
                          {timestamp}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{log.admin_name || "Unknown"}</div>
                        <div className="font-mono text-[10px] text-zinc-550">{log.admin_email}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                          {log.admin_email === "sastaelectronic6@gmail.com" ? "Super Admin" : "Staff"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-black border rounded-md ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-[10px]">
                        {log.affected_record || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
