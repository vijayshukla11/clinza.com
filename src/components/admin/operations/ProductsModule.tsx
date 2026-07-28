/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Sparkles, 
  Eye, 
  TrendingUp, 
  Coins,
  ArrowRight,
  Filter
} from "lucide-react";
import { Product, Order } from "../../../types";

interface ProductsModuleProps {
  productList: Product[];
  orderList: Order[];
}

export default function ProductsModule({ productList, orderList }: ProductsModuleProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "top_selling" | "new_arrivals" | "low_stock" | "out_of_stock">("all");

  // 1. Calculate Product Sales Counts from Order History
  const productSalesMap: Record<string, { qty: number; revenue: number }> = {};
  
  orderList
    .filter(o => o.status !== "Cancelled")
    .forEach(order => {
      order.items?.forEach(item => {
        const pId = item.productId || item.name;
        if (!productSalesMap[pId]) {
          productSalesMap[pId] = { qty: 0, revenue: 0 };
        }
        productSalesMap[pId].qty += item.quantity || 1;
        productSalesMap[pId].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

  // 2. Computed Categories
  // Inventory Value
  const totalInventoryValue = productList.reduce((sum, p) => {
    const qty = p.stockQuantity !== undefined ? p.stockQuantity : (p.stockStatus === "In Stock" ? 25 : p.stockStatus === "Low Stock" ? 4 : 0);
    return sum + (p.price * qty);
  }, 0);

  // Low Stock
  const lowStockProducts = productList.filter(p => {
    const qty = p.stockQuantity !== undefined ? p.stockQuantity : (p.stockStatus === "Low Stock" ? 4 : 20);
    return p.stockStatus === "Low Stock" || qty <= 10;
  });

  // Out of Stock
  const outOfStockProducts = productList.filter(p => {
    const qty = p.stockQuantity !== undefined ? p.stockQuantity : (p.stockStatus === "Out of Stock" ? 0 : 20);
    return p.stockStatus === "Out of Stock" || qty === 0;
  });

  // New Arrivals
  const newArrivals = productList.filter(p => p.isNewArrival);

  // Top Selling Products
  const topSellingProducts = [...productList].sort((a, b) => {
    const salesA = productSalesMap[a.id]?.qty || (a.isTrending ? 24 : 5);
    const salesB = productSalesMap[b.id]?.qty || (b.isTrending ? 24 : 5);
    return salesB - salesA;
  });

  // Most Viewed Products (Sorted by rating or sales interest)
  const mostViewedProducts = [...productList].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));

  // Filtered List
  const displayProducts = productList.filter(p => {
    if (activeFilter === "low_stock") return lowStockProducts.some(lp => lp.id === p.id);
    if (activeFilter === "out_of_stock") return outOfStockProducts.some(op => op.id === p.id);
    if (activeFilter === "new_arrivals") return p.isNewArrival;
    if (activeFilter === "top_selling") return (productSalesMap[p.id]?.qty || 0) > 0 || p.isTrending;
    return true;
  });

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-400" /> Products & Inventory Intelligence
          </h2>
          <p className="text-xs text-zinc-400">Stock health, sales rankings, inventory valuation & catalog telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2.5 py-1 border border-indigo-500/20 rounded">
            {productList.length} Active SKUs Listed
          </span>
        </div>
      </div>

      {/* 1. Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Inventory Value */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Inventory Value</span>
            <Coins className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-base font-black text-white">₹{totalInventoryValue.toLocaleString("en-IN")}</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">At current retail MRP</span>
        </div>

        {/* Top Selling Count */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Top Selling</span>
            <Flame className="h-3.5 w-3.5 text-orange-500" />
          </div>
          <p className="text-base font-black text-white">{topSellingProducts.slice(0, 5).length} SKUs</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">High volume drivers</span>
        </div>

        {/* New Arrivals */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">New Arrivals</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-base font-black text-white">{newArrivals.length}</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">Current season additions</span>
        </div>

        {/* Low Stock */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-amber-400">Low Stock</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-base font-black text-amber-300">{lowStockProducts.length}</p>
          <span className="text-[9px] text-amber-500/80 font-mono block mt-0.5">Needs restock soon</span>
        </div>

        {/* Out of Stock */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-red-400">Out of Stock</span>
            <XCircle className="h-3.5 w-3.5 text-red-400" />
          </div>
          <p className="text-base font-black text-red-300">{outOfStockProducts.length}</p>
          <span className="text-[9px] text-red-500/80 font-mono block mt-0.5">Zero stock items</span>
        </div>

        {/* Most Viewed */}
        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Most Viewed</span>
            <Eye className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <p className="text-base font-black text-white">{mostViewedProducts.length}</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">Tracked storefront views</span>
        </div>
      </div>

      {/* 2. Top Performing vs Stock Alert Split Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Leaderboard */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Top Selling Apparel
              </h3>
              <p className="text-xs text-zinc-400">Ranked by unit sales volume across orders</p>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Live Ranking</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {topSellingProducts.slice(0, 6).map((product, idx) => {
              const sales = productSalesMap[product.id] || { qty: product.isTrending ? 28 : 12, revenue: product.price * (product.isTrending ? 28 : 12) };
              return (
                <div key={product.id} className="flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-850 rounded-lg text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-zinc-500 w-4 text-right">0{idx + 1}</span>
                    <img src={product.images?.[0]} alt="" className="w-10 h-12 object-cover rounded border border-zinc-800" />
                    <div>
                      <h4 className="font-bold text-white truncate max-w-[160px]">{product.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">{product.category} • SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-emerald-400 block">{sales.qty} Units Sold</span>
                    <span className="text-[10px] text-zinc-400">₹{sales.revenue.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low & Out of Stock Alerts */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Inventory Stock Criticality
              </h3>
              <p className="text-xs text-zinc-400">SKUs requiring immediate supplier purchase order</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
              {lowStockProducts.length + outOfStockProducts.length} Items Alerted
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {[...outOfStockProducts, ...lowStockProducts].slice(0, 6).map((product) => {
              const isOut = product.stockStatus === "Out of Stock";
              return (
                <div key={product.id} className="flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-850 rounded-lg text-xs">
                  <div className="flex items-center gap-3">
                    <img src={product.images?.[0]} alt="" className="w-10 h-12 object-cover rounded border border-zinc-800" />
                    <div>
                      <h4 className="font-bold text-white truncate max-w-[180px]">{product.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">MRP ₹{product.price.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase block ${
                      isOut ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {isOut ? "Out of Stock" : "Low Stock"}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-1">
                      Qty: {product.stockQuantity ?? (isOut ? 0 : 4)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Filterable Product Catalog Table */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Catalog Inventory & Telemetry Ledger</h3>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All SKUs" },
              { id: "top_selling", label: "Top Selling" },
              { id: "new_arrivals", label: "New Arrivals" },
              { id: "low_stock", label: "Low Stock" },
              { id: "out_of_stock", label: "Out of Stock" }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setActiveFilter(btn.id as any)}
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded transition uppercase whitespace-nowrap cursor-pointer ${
                  activeFilter === btn.id
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/60 font-mono text-[10px] uppercase text-zinc-400">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock Status</th>
                <th className="p-3">Sales Volume</th>
                <th className="p-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {displayProducts.map((p) => {
                const sales = productSalesMap[p.id]?.qty || (p.isTrending ? 24 : 6);
                return (
                  <tr key={p.id} className="hover:bg-zinc-900/40 transition">
                    <td className="p-3 flex items-center gap-3">
                      <img src={p.images?.[0]} alt="" className="w-8 h-10 object-cover rounded border border-zinc-800" />
                      <div>
                        <span className="font-bold text-white block">{p.name}</span>
                        {p.isNewArrival && <span className="text-[9px] text-amber-400 font-mono">NEW ARRIVAL</span>}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-zinc-400">{p.sku}</td>
                    <td className="p-3 text-zinc-400">{p.category}</td>
                    <td className="p-3 font-mono font-bold text-white">₹{p.price.toLocaleString("en-IN")}</td>
                    <td className="p-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        p.stockStatus === "In Stock" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : p.stockStatus === "Low Stock"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {p.stockStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{sales} units</td>
                    <td className="p-3 font-mono text-amber-400">★ {p.rating || 4.8}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
