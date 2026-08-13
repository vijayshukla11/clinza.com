/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Plus, 
  Minus, 
  History, 
  Warehouse, 
  RefreshCw, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Edit,
  Boxes,
  ShieldCheck,
  FileSpreadsheet
} from "lucide-react";
import { Product, Order, InventoryLogItem } from "../../types";
import { InventoryService } from "../../services/supabaseService";

interface InventoryTabProps {
  productList: Product[];
  orderList: Order[];
  onRefresh?: () => void;
}

export default function InventoryTab({ productList, orderList, onRefresh }: InventoryTabProps) {
  const [subTab, setSubTab] = useState<"catalog" | "logs">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("All");
  
  // Stock adjustment modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjType, setAdjType] = useState<"add" | "deduct" | "set">("add");
  const [adjAmount, setAdjAmount] = useState<number>(10);
  const [adjReason, setAdjReason] = useState<string>("Supplier Restock");
  const [adjWarehouse, setAdjWarehouse] = useState<string>("Main Hub - Bay A1");
  const [submitting, setSubmitting] = useState(false);

  // Inventory logs state
  const [logs, setLogs] = useState<InventoryLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Load logs when logs tab opens or product changes
  useEffect(() => {
    async function loadInventoryLogs() {
      setLogsLoading(true);
      const data = await InventoryService.getLogs();
      setLogs(data);
      setLogsLoading(false);
    }
    loadInventoryLogs();
  }, [subTab]);

  // Compute reserved units from active orders (Pending, Confirmed, Packed)
  const reservedMap: Record<string, number> = {};
  orderList
    .filter(o => o.status === "Pending" || o.status === "Confirmed" || o.status === "Packed")
    .forEach(order => {
      (order.items || []).forEach(item => {
        if (item.productId) {
          reservedMap[item.productId] = (reservedMap[item.productId] || 0) + item.quantity;
        }
      });
    });

  // Calculate KPIs
  const totalItems = productList.length;
  
  const totalCurrentStock = productList.reduce((sum, p) => {
    const qty = (p as any).stockQuantity !== undefined 
      ? (p as any).stockQuantity 
      : (p.stockStatus === "Out of Stock" ? 0 : 50);
    return sum + qty;
  }, 0);

  const totalReservedStock = Object.values(reservedMap).reduce((sum, val) => sum + val, 0);

  const lowStockProducts = productList.filter(p => {
    const qty = (p as any).stockQuantity !== undefined ? (p as any).stockQuantity : (p.stockStatus === "Out of Stock" ? 0 : 50);
    return (qty > 0 && qty <= 10) || p.stockStatus === "Low Stock";
  });

  const outOfStockProducts = productList.filter(p => {
    const qty = (p as any).stockQuantity !== undefined ? (p as any).stockQuantity : (p.stockStatus === "Out of Stock" ? 0 : 50);
    return qty === 0 || p.stockStatus === "Out of Stock";
  });

  // Filter products
  const filteredProducts = productList.filter(p => {
    const q = searchQuery.toLowerCase();
    const sku = (p.sku || `SKU-${p.id.slice(0, 6)}`).toLowerCase();
    const nameMatches = p.name.toLowerCase().includes(q) || sku.includes(q) || (p.category || "").toLowerCase().includes(q);

    const qty = (p as any).stockQuantity !== undefined ? (p as any).stockQuantity : (p.stockStatus === "Out of Stock" ? 0 : 50);
    const status = qty === 0 ? "Out of Stock" : (qty <= 10 ? "Low Stock" : "In Stock");

    const matchesFilter = stockFilter === "All" || status === stockFilter;

    return nameMatches && matchesFilter;
  });

  // Open adjustment modal
  const handleOpenAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjType("add");
    setAdjAmount(10);
    setAdjReason("Supplier Restock");
    setAdjWarehouse("Main Hub - Bay A1");
  };

  // Submit Stock Adjustment
  const handlePerformAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    const currentQty = (selectedProduct as any).stockQuantity !== undefined 
      ? (selectedProduct as any).stockQuantity 
      : (selectedProduct.stockStatus === "Out of Stock" ? 0 : 50);

    let newQty = currentQty;
    if (adjType === "add") {
      newQty = currentQty + Math.abs(adjAmount);
    } else if (adjType === "deduct") {
      newQty = Math.max(0, currentQty - Math.abs(adjAmount));
    } else if (adjType === "set") {
      newQty = Math.max(0, Math.abs(adjAmount));
    }

    try {
      await InventoryService.updateStock(
        selectedProduct.id,
        newQty,
        adjReason,
        "sastaelectronic6@gmail.com",
        adjWarehouse
      );

      if (onRefresh) onRefresh();

      setSelectedProduct(null);
      
      // Refresh logs if viewing
      const updatedLogs = await InventoryService.getLogs();
      setLogs(updatedLogs);
    } catch (err) {
      console.error("Stock adjustment failed:", err);
      alert("Error updating stock quantity.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="inventory-management-wrapper" className="space-y-6 text-left animate-fade-in font-sans">
      
      {/* HEADER & SUB-TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-base font-black text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
            <Boxes className="h-5 w-5 text-zinc-900" /> Inventory & Stock Control
          </h2>
          <p className="text-xs text-zinc-500 font-sans">Real-time stock quantities, warehouse allocations, and stock audit logs.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab("catalog")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
              subTab === "catalog"
                ? "bg-zinc-900 text-white shadow-2xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <Package className="h-3.5 w-3.5 inline mr-1" /> Inventory Catalog
          </button>
          <button
            onClick={() => setSubTab("logs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
              subTab === "logs"
                ? "bg-zinc-900 text-white shadow-2xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <History className="h-3.5 w-3.5 inline mr-1" /> Stock Audit Logs ({logs.length})
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Card 1: Total Current Stock */}
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Current Available Stock</span>
            <Package className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-zinc-900 font-mono">{totalCurrentStock} <span className="text-xs font-normal text-zinc-500">units</span></div>
          <p className="text-[10px] text-zinc-500">Across {totalItems} SKUs</p>
        </div>

        {/* Card 2: Reserved Stock */}
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Reserved Units</span>
            <Warehouse className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-indigo-600 font-mono">{totalReservedStock} <span className="text-xs font-normal text-zinc-500">units</span></div>
          <p className="text-[10px] text-zinc-500">Allocated in open orders</p>
        </div>

        {/* Card 3: Low Stock Alert */}
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Low Stock Alert</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 font-mono">{lowStockProducts.length} <span className="text-xs font-normal text-zinc-500">SKUs</span></div>
          <p className="text-[10px] text-zinc-500">At or below 10 units</p>
        </div>

        {/* Card 4: Out of Stock */}
        <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Out of Stock</span>
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-xl font-black text-red-600 font-mono">{outOfStockProducts.length} <span className="text-xs font-normal text-zinc-500">SKUs</span></div>
          <p className="text-[10px] text-zinc-500">Zero inventory remaining</p>
        </div>

      </div>

      {/* STOCK ALERTS BANNER IF LOW / OUT OF STOCK ITEMS EXIST */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Stock Attention Required:</span> {outOfStockProducts.length} product(s) out of stock and {lowStockProducts.length} product(s) running low.
            </div>
          </div>
          <button
            onClick={() => setStockFilter("Low Stock")}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-mono font-bold uppercase cursor-pointer"
          >
            View Low Stock SKUs
          </button>
        </div>
      )}

      {/* MAIN TAB CONTENT */}
      {subTab === "catalog" ? (
        <div className="space-y-4">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search SKU, product name, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-250 pl-9 pr-4 py-2 rounded-lg text-xs font-sans focus:outline-none focus:border-zinc-900 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-zinc-500 font-mono font-bold text-[10px] uppercase">Status:</span>
              {["All", "In Stock", "Low Stock", "Out of Stock"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStockFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase whitespace-nowrap transition cursor-pointer ${
                    stockFilter === st
                      ? "bg-zinc-900 text-white shadow-2xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

          </div>

          {/* INVENTORY CATALOG TABLE */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-x-auto shadow-2xs">
            <table className="w-full text-xs text-left text-zinc-700 min-w-[800px]">
              <thead className="bg-zinc-50 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3.5 px-5">Product SKU</th>
                  <th className="py-3.5 px-4">Product Apparel</th>
                  <th className="py-3.5 px-4">Warehouse</th>
                  <th className="py-3.5 px-4 text-center">In Stock</th>
                  <th className="py-3.5 px-4 text-center">Reserved</th>
                  <th className="py-3.5 px-4 text-center">Available</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-5 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => {
                    const sku = p.sku || `CLNZA-${p.id.slice(0, 6).toUpperCase()}`;
                    const qty = (p as any).stockQuantity !== undefined ? (p as any).stockQuantity : (p.stockStatus === "Out of Stock" ? 0 : 50);
                    const reserved = reservedMap[p.id] || 0;
                    const available = Math.max(0, qty - reserved);

                    const statusTag = qty === 0 
                      ? "Out of Stock" 
                      : (qty <= 10 ? "Low Stock" : "In Stock");

                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/60 transition">
                        <td className="py-4 px-5 font-mono text-zinc-900 font-bold text-[11px]">
                          {sku}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img src={p.images?.[0] || "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"} alt="" className="h-10 w-8 object-cover rounded border border-zinc-200 bg-zinc-100" />
                            <div>
                              <div className="font-bold text-zinc-950">{p.name}</div>
                              <span className="text-[10px] text-zinc-400 font-mono block">Category: {p.category || p.collection} • ₹{p.price.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-zinc-600 text-[11px] font-mono">
                          Main Hub - Bay A1
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-zinc-950 text-sm">
                          {qty}
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-indigo-600 font-bold">
                          {reserved}
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-emerald-600 font-bold text-sm">
                          {available}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-full ${
                            statusTag === "In Stock"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : statusTag === "Low Stock"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            {statusTag}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleOpenAdjustModal(p)}
                            className="px-3 py-1.5 border border-zinc-250 hover:border-zinc-900 font-bold text-zinc-800 rounded-lg bg-white cursor-pointer hover:bg-zinc-50 transition"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 italic text-zinc-400">
                      No products matching inventory search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        /* STOCK AUDIT LOGS SUB-VIEW */
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-xs font-bold font-mono uppercase text-zinc-700 tracking-wider">
              Stock Activity & Audit Log Trail
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              Total Recorded Logs: {logs.length}
            </span>
          </div>

          {logsLoading ? (
            <div className="text-center py-12 text-zinc-400 font-mono text-xs">
              Loading inventory audit logs from database...
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[700px]">
                <thead className="bg-zinc-50 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Product / SKU</th>
                    <th className="py-3 px-4">Admin User</th>
                    <th className="py-3 px-4 text-center">Previous</th>
                    <th className="py-3 px-4 text-center">Change</th>
                    <th className="py-3 px-4 text-center">New Stock</th>
                    <th className="py-3 px-4">Reason & Warehouse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 font-mono">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4 text-zinc-500 text-[10px]">
                        {new Date(log.date).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 font-sans font-bold text-zinc-900">
                        {log.productName}
                        <span className="block text-[10px] text-zinc-400 font-mono font-normal">{log.sku}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 text-[11px] font-sans">
                        {log.user}
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-500">
                        {log.previousStock}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className={log.changeAmount > 0 ? "text-emerald-600" : (log.changeAmount < 0 ? "text-red-600" : "text-zinc-500")}>
                          {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-zinc-950">
                        {log.newStock}
                      </td>
                      <td className="py-3 px-4 font-sans text-zinc-700 text-[11px]">
                        <span className="font-bold block">{log.reason}</span>
                        <span className="text-[10px] text-zinc-400 font-mono block">{log.warehouse || "Main Hub"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-12 italic text-zinc-400 text-xs">
              No stock audit logs recorded yet. Perform a manual stock adjustment to create the first log entry.
            </p>
          )}
        </div>
      )}

      {/* MANUAL STOCK ADJUSTMENT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 text-zinc-900 shadow-2xl relative animate-fade-in">
            
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider font-mono text-zinc-950 flex items-center gap-2">
                <Boxes className="h-4 w-4 text-zinc-900" /> Manual Stock Adjustment
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-zinc-400 hover:text-zinc-900 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Product Overview */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-3">
              <img src={selectedProduct.images?.[0] || ""} alt="" className="h-12 w-10 object-cover rounded border border-zinc-200 bg-white" />
              <div>
                <h4 className="font-bold text-xs text-zinc-950">{selectedProduct.name}</h4>
                <p className="text-[10px] font-mono text-zinc-500">
                  SKU: {selectedProduct.sku || `CLNZA-${selectedProduct.id.slice(0, 6).toUpperCase()}`}
                </p>
                <p className="text-[10px] font-mono font-bold text-zinc-700 mt-0.5">
                  Current Stock: {(selectedProduct as any).stockQuantity !== undefined ? (selectedProduct as any).stockQuantity : 50} units
                </p>
              </div>
            </div>

            {/* Adjustment Form */}
            <form onSubmit={handlePerformAdjustment} className="space-y-4 text-xs font-sans">
              
              {/* Type Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 font-mono">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjType("add")}
                    className={`py-2 text-[11px] font-bold rounded-lg border text-center cursor-pointer transition ${
                      adjType === "add" ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-zinc-50 border-zinc-200 text-zinc-600"
                    }`}
                  >
                    + Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType("deduct")}
                    className={`py-2 text-[11px] font-bold rounded-lg border text-center cursor-pointer transition ${
                      adjType === "deduct" ? "bg-red-50 border-red-500 text-red-800" : "bg-zinc-50 border-zinc-200 text-zinc-600"
                    }`}
                  >
                    - Deduct Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType("set")}
                    className={`py-2 text-[11px] font-bold rounded-lg border text-center cursor-pointer transition ${
                      adjType === "set" ? "bg-indigo-50 border-indigo-500 text-indigo-800" : "bg-zinc-50 border-zinc-200 text-zinc-600"
                    }`}
                  >
                    Set Exact Qty
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 font-mono">
                  {adjType === "set" ? "Target Exact Quantity" : "Quantity Amount"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(Number(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-250 p-2.5 rounded-lg text-sm font-mono font-bold text-zinc-900 focus:outline-none focus:border-zinc-900"
                  required
                />
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 font-mono">Reason for Adjustment</label>
                <select
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-250 p-2.5 rounded-lg text-xs font-sans text-zinc-800 focus:outline-none focus:border-zinc-900"
                >
                  <option value="Supplier Restock">Supplier Restock Shipment</option>
                  <option value="Inventory Count Audit">Physical Inventory Audit Sync</option>
                  <option value="Damaged / Written Off">Damaged / Written Off Goods</option>
                  <option value="Customer Return Restock">Customer Return Restock</option>
                  <option value="Promotional Sample">Promotional Sample / Display</option>
                  <option value="Other Manual Sync">Other Manual Sync</option>
                </select>
              </div>

              {/* Warehouse Location */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 font-mono">Warehouse Allocation</label>
                <select
                  value={adjWarehouse}
                  onChange={(e) => setAdjWarehouse(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-250 p-2.5 rounded-lg text-xs font-sans text-zinc-800 focus:outline-none focus:border-zinc-900"
                >
                  <option value="Main Hub - Bay A1">Main Hub - Bay A1 (Mumbai)</option>
                  <option value="Fulfillment Hub - Bay B2">Fulfillment Hub - Bay B2 (Delhi)</option>
                  <option value="Sartorial Studio - Shelf C3">Sartorial Studio - Shelf C3 (Bengaluru)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-2.5 border border-zinc-250 text-zinc-700 font-bold text-xs rounded-lg cursor-pointer hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg cursor-pointer transition shadow-2xs"
                >
                  {submitting ? "Saving..." : "Confirm & Save Audit Log"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
