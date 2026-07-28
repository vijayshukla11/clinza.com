/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ListOrdered, 
  Clock, 
  CheckCircle, 
  PackageCheck, 
  Truck, 
  Home, 
  XCircle, 
  RotateCcw, 
  RefreshCw,
  Search,
  Filter,
  Eye,
  Calendar,
  MapPin,
  CreditCard
} from "lucide-react";
import { Order, OrderStatus } from "../../../types";

interface OrdersModuleProps {
  orderList: Order[];
}

export default function OrdersModule({ orderList }: OrdersModuleProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Breakdown across status stages
  const statusCounts: Record<string, number> = {
    Pending: 0,
    Confirmed: 0,
    Packed: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
    Refunded: 0,
    Returned: 0
  };

  orderList.forEach(order => {
    const st = order.status || "Pending";
    if (statusCounts[st] !== undefined) {
      statusCounts[st] += 1;
    } else if (st === "Processing" as any) {
      statusCounts["Pending"] += 1;
    } else {
      statusCounts["Confirmed"] += 1;
    }
  });

  const totalOrders = orderList.length;

  // Filtered orders list
  const filteredOrders = orderList.filter(o => {
    const matchesStatus = selectedStatus === "ALL" || o.status === selectedStatus;
    const matchesSearch = searchTerm === "" || 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer?.phone || "").includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (st: string) => {
    switch (st) {
      case "Pending": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Confirmed": return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "Packed": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Shipped": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Delivered": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Refunded": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Returned": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default: return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  const statusIcons: Record<string, any> = {
    Pending: Clock,
    Confirmed: CheckCircle,
    Packed: PackageCheck,
    Shipped: Truck,
    Delivered: Home,
    Cancelled: XCircle,
    Refunded: RotateCcw,
    Returned: RefreshCw
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-indigo-400" /> Order Fulfillment Pipeline Matrix
          </h2>
          <p className="text-xs text-zinc-400">Real-time status breakdown across all order lifecycle states</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2.5 py-1 border border-indigo-500/20 rounded">
            {totalOrders} Total Orders Recorded
          </span>
        </div>
      </div>

      {/* 1. All 8 Order Status Pipeline Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {[
          { key: "Pending", label: "Pending", col: "text-amber-400 border-amber-500/30" },
          { key: "Confirmed", label: "Confirmed", col: "text-sky-400 border-sky-500/30" },
          { key: "Packed", label: "Packed", col: "text-indigo-400 border-indigo-500/30" },
          { key: "Shipped", label: "Shipped", col: "text-purple-400 border-purple-500/30" },
          { key: "Delivered", label: "Delivered", col: "text-emerald-400 border-emerald-500/30" },
          { key: "Cancelled", label: "Cancelled", col: "text-red-400 border-red-500/30" },
          { key: "Refunded", label: "Refunded", col: "text-rose-400 border-rose-500/30" },
          { key: "Returned", label: "Returned", col: "text-orange-400 border-orange-500/30" }
        ].map(item => {
          const Icon = statusIcons[item.key] || Clock;
          const count = statusCounts[item.key] || 0;
          const isSelected = selectedStatus === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setSelectedStatus(selectedStatus === item.key ? "ALL" : item.key)}
              className={`p-3 bg-zinc-950 border rounded-xl flex flex-col justify-between transition text-left cursor-pointer ${
                isSelected 
                  ? "border-orange-500 ring-2 ring-orange-500/20 bg-zinc-900" 
                  : "border-zinc-900 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 truncate">{item.label}</span>
                <Icon className={`h-3.5 w-3.5 ${item.col.split(" ")[0]}`} />
              </div>
              <p className={`text-xl font-black ${item.col.split(" ")[0]}`}>{count}</p>
              <span className="text-[8px] text-zinc-500 font-mono mt-1 block">
                {totalOrders > 0 ? `${Math.round((count / totalOrders) * 100)}% of total` : "0%"}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Pipeline Stage Distribution Visual Bar */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-zinc-400 font-bold uppercase">Order Lifecycle Distribution</span>
          <span className="text-zinc-500">{totalOrders} Total Orders</span>
        </div>

        <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden flex">
          {[
            { key: "Delivered", bg: "bg-emerald-500" },
            { key: "Shipped", bg: "bg-purple-500" },
            { key: "Packed", bg: "bg-indigo-500" },
            { key: "Confirmed", bg: "bg-sky-500" },
            { key: "Pending", bg: "bg-amber-500" },
            { key: "Returned", bg: "bg-orange-500" },
            { key: "Refunded", bg: "bg-rose-500" },
            { key: "Cancelled", bg: "bg-red-500" }
          ].map(st => {
            const pct = totalOrders > 0 ? ((statusCounts[st.key] || 0) / totalOrders) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div 
                key={st.key} 
                style={{ width: `${pct}%` }} 
                className={`${st.bg} h-full border-r border-zinc-950`} 
                title={`${st.key}: ${statusCounts[st.key]} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* 3. Orders Master Data Table */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {selectedStatus === "ALL" ? "All Orders Ledger" : `Filtered Status: ${selectedStatus}`}
          </h3>

          <div className="flex items-center gap-3">
            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search order ID, client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 font-sans"
              />
            </div>

            {selectedStatus !== "ALL" && (
              <button
                onClick={() => setSelectedStatus("ALL")}
                className="text-[10px] font-mono text-orange-400 hover:underline cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/60 font-mono text-[10px] uppercase text-zinc-400">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items Count</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status Badge</th>
                <th className="p-3">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-zinc-500 italic">
                    No orders match the selected filter query.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemCount = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1;
                  return (
                    <tr key={order.id} className="hover:bg-zinc-900/40 transition">
                      <td className="p-3 font-mono font-bold text-white">{order.id}</td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{order.customer?.name || "Guest User"}</span>
                        <span className="text-[10px] text-zinc-400 font-mono block">{order.customer?.email}</span>
                      </td>
                      <td className="p-3 font-mono text-zinc-300">{itemCount} items</td>
                      <td className="p-3 font-mono font-black text-emerald-400">
                        ₹{order.totalAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono text-zinc-400 text-[10px]">
                        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">COD</span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-zinc-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
