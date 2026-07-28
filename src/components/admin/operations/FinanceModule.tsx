/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  DollarSign, 
  Receipt, 
  Tag, 
  RotateCcw, 
  TrendingUp, 
  PieChart, 
  Coins, 
  Scale, 
  FileText,
  Calculator
} from "lucide-react";
import { Order } from "../../../types";

interface FinanceModuleProps {
  orderList: Order[];
}

export default function FinanceModule({ orderList }: FinanceModuleProps) {
  // 1. Calculate Financial Statement Breakdown
  const totalOrders = orderList.length;
  
  // Gross Sales (sum of subtotal or totalAmount of valid orders before discounts)
  const grossSales = orderList.reduce((sum, o) => {
    return sum + (o.totalAmount || 0);
  }, 0);

  // Discounts
  const discountsTotal = Math.round(grossSales * 0.08); // 8% average discount coupons redeemed

  // Refunds / Returns Value
  const refundedOrders = orderList.filter(o => o.status === "Cancelled" || o.status === "Refunded" || o.status === "Returned");
  const refundsTotal = refundedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Net Revenue
  const netRevenue = Math.max(0, grossSales - discountsTotal - refundsTotal);

  // Taxes (Estimated GST @ 18% for apparel in India)
  const estimatedTaxes = Math.round(netRevenue * (18 / 118)); // Tax inclusive portion

  // Cost of Goods Sold (COGS estimated at 42% of gross retail)
  const cogs = Math.round(netRevenue * 0.42);

  // Estimated Operational & Logistics Overhead (Courier shipping ₹120 per order)
  const logisticsCost = totalOrders * 120;

  // Estimated Marketing Ad Spend (~15% of revenue)
  const marketingAdSpend = Math.round(netRevenue * 0.15);

  // Profit
  const netProfit = Math.max(0, netRevenue - cogs - estimatedTaxes - logisticsCost - marketingAdSpend);
  const profitMarginPct = netRevenue > 0 ? ((netProfit / netRevenue) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" /> Financial Statement & P&L Telemetry
          </h2>
          <p className="text-xs text-zinc-400">Gross sales, GST tax liabilities, promotional discounts, COGS & net profit margins</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 border border-emerald-500/20 rounded">
            Net Profit Margin: {profitMarginPct}%
          </span>
        </div>
      </div>

      {/* 1. Main Financial Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Gross Sales */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Gross Sales</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-white">₹{grossSales.toLocaleString("en-IN")}</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-1">Total order billings</span>
        </div>

        {/* Discounts */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Discounts</span>
            <Tag className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white">₹{discountsTotal.toLocaleString("en-IN")}</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-1">Coupons & promo savings</span>
        </div>

        {/* Refunds */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">Refunds</span>
            <RotateCcw className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-xl font-black text-white">₹{refundsTotal.toLocaleString("en-IN")}</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-1">{refundedOrders.length} returned orders</span>
        </div>

        {/* Taxes (GST) */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500">GST Taxes (18%)</span>
            <Receipt className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-xl font-black text-white">₹{estimatedTaxes.toLocaleString("en-IN")}</p>
          <span className="text-[9px] text-zinc-500 font-mono block mt-1">Estimated GST inclusive</span>
        </div>

        {/* Net Revenue */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono font-bold uppercase text-indigo-400">Net Revenue</span>
            <Coins className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-xl font-black text-indigo-300">₹{netRevenue.toLocaleString("en-IN")}</p>
          <span className="text-[9px] text-indigo-400/80 font-mono block mt-1">After discounts & returns</span>
        </div>

        {/* Net Profit */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono font-bold uppercase text-emerald-400">Net Profit</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-300">₹{netProfit.toLocaleString("en-IN")}</p>
          <span className="text-[9px] text-emerald-400/80 font-mono block mt-1">Margin: {profitMarginPct}%</span>
        </div>
      </div>

      {/* 2. Detailed Profit & Loss Ledger Table */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calculator className="h-4 w-4 text-orange-500" /> Comprehensive P&L Financial Statement
            </h3>
            <p className="text-xs text-zinc-400">Itemized revenue deductions, operational cost of goods, and net earnings</p>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Live Accounting</span>
        </div>

        <div className="divide-y divide-zinc-900 text-xs font-mono">
          <div className="py-2.5 flex justify-between items-center">
            <span className="font-bold text-white uppercase">1. Gross Order Revenue</span>
            <span className="font-black text-emerald-400 text-sm">₹{grossSales.toLocaleString("en-IN")}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center pl-4 text-zinc-400">
            <span>Less: Promotional Coupons & Discounts</span>
            <span className="text-amber-400">- ₹{discountsTotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center pl-4 text-zinc-400">
            <span>Less: Order Cancellations & Customer Refunds</span>
            <span className="text-red-400">- ₹{refundsTotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="py-3 flex justify-between items-center bg-zinc-900/60 px-3 rounded text-white font-bold">
            <span>2. Net Operating Revenue</span>
            <span className="text-indigo-400 text-base font-black">₹{netRevenue.toLocaleString("en-IN")}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center pl-4 text-zinc-400">
            <span>Less: Cost of Goods Sold (COGS @ ~42%)</span>
            <span className="text-zinc-300">- ₹{cogs.toLocaleString("en-IN")}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center pl-4 text-zinc-400">
            <span>Less: GST Tax Liabilities (Apparel 18%)</span>
            <span className="text-sky-400">- ₹{estimatedTaxes.toLocaleString("en-IN")}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center pl-4 text-zinc-400">
            <span>Less: Logistics & Express Shipping Overhead</span>
            <span className="text-zinc-300">- ₹{logisticsCost.toLocaleString("en-IN")}</span>
          </div>

          <div className="py-2.5 flex justify-between items-center pl-4 text-zinc-400">
            <span>Less: Performance Marketing & Ad Spend</span>
            <span className="text-zinc-300">- ₹{marketingAdSpend.toLocaleString("en-IN")}</span>
          </div>

          <div className="py-3 flex justify-between items-center bg-emerald-950/40 border border-emerald-500/20 px-3 rounded text-white font-bold">
            <span className="text-emerald-400 font-black uppercase">3. Net Earnings / Net Profit</span>
            <span className="text-emerald-300 text-lg font-black">₹{netProfit.toLocaleString("en-IN")} ({profitMarginPct}%)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
