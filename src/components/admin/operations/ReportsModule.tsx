/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  Store, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Clock
} from "lucide-react";
import { Order, Product } from "../../../types";
import { DashboardFilterState, DateRangeOption, StoreFilterOption } from "./types";

interface ReportsModuleProps {
  orderList: Order[];
  productList: Product[];
  filterState: DashboardFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<DashboardFilterState>>;
}

export default function ReportsModule({ 
  orderList, 
  productList, 
  filterState, 
  setFilterState 
}: ReportsModuleProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  // 1. CSV Generator
  const handleExportCSV = () => {
    setDownloading("csv");
    setTimeout(() => {
      const headers = ["Order ID", "Customer Name", "Customer Email", "Customer Phone", "City", "Total Amount (INR)", "Payment Method", "Status", "Order Date"];
      const rows = orderList.map(o => [
        o.id,
        `"${o.customer?.name || 'Guest'}"`,
        o.customer?.email || '',
        o.customer?.phone || '',
        `"${o.customer?.city || ''}"`,
        o.totalAmount || 0,
        o.paymentMethod || 'COD',
        o.status || 'Pending',
        `"${new Date(o.createdAt).toLocaleString()}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `clinza_business_operations_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(null);
    }, 400);
  };

  // 2. Excel Generator (.tsv / formatted csv)
  const handleExportExcel = () => {
    setDownloading("excel");
    setTimeout(() => {
      const headers = ["Order ID\tCustomer Name\tCustomer Email\tPhone\tCity\tTotal Amount\tPayment Method\tStatus\tCreated At"];
      const rows = orderList.map(o => 
        `${o.id}\t${o.customer?.name || 'Guest'}\t${o.customer?.email || ''}\t${o.customer?.phone || ''}\t${o.customer?.city || ''}\t${o.totalAmount}\t${o.paymentMethod || 'COD'}\t${o.status}\t${new Date(o.createdAt).toISOString()}`
      );

      const excelContent = "data:application/vnd.ms-excel;charset=utf-8," + encodeURIComponent([headers.join("\n"), ...rows].join("\n"));
      const link = document.createElement("a");
      link.setAttribute("href", excelContent);
      link.setAttribute("download", `clinza_business_analytics_${new Date().toISOString().slice(0, 10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(null);
    }, 400);
  };

  // 3. PDF Generator / Printable view
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-amber-400" /> Export Center & Global Report Filters
          </h2>
          <p className="text-xs text-zinc-400">Download formatted CSV, Excel spreadsheets & generate PDF executive summaries</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 border border-amber-500/20 rounded">
            Report Engine Active
          </span>
        </div>
      </div>

      {/* 1. Global Date Range & Store Filters Controller */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Filter className="h-4 w-4 text-orange-500" /> Active Report Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Range Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold uppercase text-zinc-400 block">
              Date Range Selection
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "week", label: "This Week (7D)" },
                { id: "month", label: "This Month" },
                { id: "last30", label: "Last 30 Days" },
                { id: "year", label: "Year to Date" }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterState(prev => ({ ...prev, dateRange: opt.id as DateRangeOption }))}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase border transition cursor-pointer text-center ${
                    filterState.dateRange === opt.id
                      ? "bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Store Filter Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold uppercase text-zinc-400 block">
              Storefront / Sales Channel Filter
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "all", label: "All Sales Channels" },
                { id: "shopify", label: "Shopify Main Webstore" },
                { id: "mobile_app", label: "iOS & Android App" },
                { id: "b2b", label: "B2B Wholesale Channel" }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterState(prev => ({ ...prev, storeFilter: opt.id as StoreFilterOption }))}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase border transition cursor-pointer text-center ${
                    filterState.storeFilter === opt.id
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Download Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CSV Export Card */}
        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition">
          <div className="space-y-2">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Export CSV Format</h3>
            <p className="text-xs text-zinc-400">Standard comma-separated value file containing raw order, customer, and transaction telemetry.</p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={downloading === "csv"}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold uppercase text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            {downloading === "csv" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading === "csv" ? "Generating CSV..." : "Download CSV Report"}
          </button>
        </div>

        {/* Excel Export Card */}
        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition">
          <div className="space-y-2">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg w-fit">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Export Excel (.xls)</h3>
            <p className="text-xs text-zinc-400">Pre-formatted spreadsheet workbook with tab-delimited columns for Microsoft Excel & Google Sheets.</p>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={downloading === "excel"}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold uppercase text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            {downloading === "excel" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            {downloading === "excel" ? "Generating Excel..." : "Download Excel Workbook"}
          </button>
        </div>

        {/* PDF Print View Card */}
        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition">
          <div className="space-y-2">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg w-fit">
              <Printer className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Generate PDF Summary</h3>
            <p className="text-xs text-zinc-400">Triggers browser native print manager formatted specifically for PDF executive summaries.</p>
          </div>
          <button
            onClick={handleExportPDF}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold uppercase text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>

      </div>

    </div>
  );
}
