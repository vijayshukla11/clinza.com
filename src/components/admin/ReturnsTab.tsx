/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  Mail, 
  Inbox, 
  CheckCircle, 
  XCircle, 
  Truck, 
  CornerUpLeft, 
  FileText,
  Camera
} from "lucide-react";
import { OrderReturnRequest } from "../../types";
import { OrderReturnsService } from "../../services/supabaseService";

export default function ReturnsTab() {
  const [tickets, setTickets] = useState<OrderReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "return" | "exchange">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const allTickets = await OrderReturnsService.getAll();
      setTickets(allTickets);
    } catch (err) {
      console.error("Failed to load return tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: any) => {
    setUpdatingId(ticketId);
    try {
      await OrderReturnsService.updateStatus(ticketId, newStatus);
      // Reload tickets
      const updated = await OrderReturnsService.getAll();
      setTickets(updated);
    } catch (err) {
      alert("Failed to update return ticket coordinates.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter & Search logic
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" ? true : ticket.type === typeFilter;
    const matchesStatus = statusFilter === "all" ? true : ticket.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div id="admin-returns-tab-container" className="space-y-6 text-left text-zinc-300 font-sans">
      
      {/* Header coordinates */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white font-mono">Returns & Exchanges Board</h2>
          <p className="text-xs text-zinc-500 font-sans">Review, authorize, and schedule courier pickups for premium wardrobe items.</p>
        </div>
        <button
          onClick={loadTickets}
          className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Board
        </button>
      </div>

      {/* Control Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by Ticket ID, Order ID, or Customer email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-bold"
          >
            <option value="all">ALL REQUEST TYPES</option>
            <option value="return">RETURN ONLY</option>
            <option value="exchange">EXCHANGE ONLY</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-bold"
          >
            <option value="all">ALL STATUSES</option>
            <option value="Pending">PENDING APPROVAL</option>
            <option value="Approved">APPROVED</option>
            <option value="Pickup Scheduled">PICKUP SCHEDULED</option>
            <option value="Completed">COMPLETED / RESOLVED</option>
            <option value="Refunded">REFUNDED</option>
            <option value="Rejected">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Tickets Feed */}
      {loading ? (
        <div className="text-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-3xl">
          <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-2" />
          <p className="text-zinc-500 text-xs font-mono uppercase">Syncing returns register...</p>
        </div>
      ) : filteredTickets.length > 0 ? (
        <div className="space-y-6">
          {filteredTickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className={`border rounded-2xl p-6 bg-zinc-950/60 transition hover:border-zinc-800 space-y-5 ${
                ticket.status === "Pending" 
                  ? "border-orange-500/30" 
                  : "border-zinc-900"
              }`}
            >
              
              {/* Ticket Top bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-900/60 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#F27D26] uppercase">
                      Ticket #{ticket.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-black tracking-widest uppercase font-mono ${
                      ticket.type === "return" ? "bg-red-950 text-red-400" : "bg-blue-950 text-blue-400"
                    }`}>
                      {ticket.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Filed: {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email: <strong className="font-bold text-zinc-300 font-mono select-all">{ticket.customerEmail}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-550 uppercase font-mono">Set Status:</span>
                  <select
                    value={ticket.status}
                    disabled={updatingId === ticket.id}
                    onChange={(e) => handleUpdateStatus(ticket.id, e.target.value as any)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs font-bold text-white focus:outline-none focus:border-orange-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Pickup Scheduled">Pickup Scheduled</option>
                    <option value="Completed">Completed / Swapped</option>
                    <option value="Refunded">Refunded</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Items Table details */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-black tracking-wider text-zinc-550 font-mono uppercase">Ticket Garments:</h4>
                <div className="space-y-2">
                  {ticket.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-zinc-900/20 border border-zinc-900/60 rounded-xl p-3 text-xs">
                      <img src={it.image} alt="" className="h-10 w-8 object-cover rounded bg-zinc-900" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-extrabold text-white uppercase tracking-tight truncate">{it.name}</h5>
                        <p className="text-zinc-500 text-[11px]">
                          Original: size <strong>{it.size}</strong> • color <strong>{it.color}</strong> • qty <strong>{it.quantity}</strong>
                        </p>
                        {ticket.type === "exchange" && (
                          <p className="text-orange-400 font-bold text-[10px] pt-0.5">
                            → Swap for: size <strong>{it.exchangeSize || "M"}</strong>, color <strong>{it.exchangeColor || "Default"}</strong>
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[11px] font-bold text-zinc-400">₹{it.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Justification details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 space-y-1.5">
                  <span className="text-[9px] font-bold text-zinc-500 font-mono uppercase block">Return Code Reason</span>
                  <p className="text-white font-extrabold">{ticket.reason}</p>
                  {ticket.description && (
                    <p className="text-zinc-400 font-light italic leading-relaxed pt-1 font-sans">"{ticket.description}"</p>
                  )}
                </div>

                <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 font-mono uppercase block">Verification Reference</span>
                    <p className="text-zinc-400 text-[11px] pt-1 leading-normal font-mono">Linked Order ID: <span className="text-white font-bold uppercase tracking-wider">{ticket.orderId}</span></p>
                  </div>
                  {ticket.imageProofUrl ? (
                    <div className="pt-2">
                      <a 
                        href={ticket.imageProofUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-orange-400 hover:underline font-mono text-[10px] inline-flex items-center gap-1"
                      >
                        <Camera className="h-4 w-4" /> View Client Uploaded Proof Reference ↗
                      </a>
                    </div>
                  ) : (
                    <span className="text-zinc-550 text-[10px] italic">No image reference upload filed.</span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/10 border border-zinc-900 rounded-3xl">
          <Inbox className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <h4 className="text-zinc-300 font-bold uppercase tracking-wider text-xs mb-1">No return tickets matched</h4>
          <p className="text-zinc-550 text-xs">Either there are no return tickets in database, or they do not match filter conditions.</p>
        </div>
      )}

    </div>
  );
}
