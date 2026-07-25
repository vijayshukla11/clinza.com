/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Eye, 
  ChevronLeft, 
  User, 
  Phone, 
  MapPin, 
  DollarSign, 
  RefreshCw, 
  Truck, 
  Printer,
  FileText,
  Search,
  Filter,
  ShoppingBag,
  Clock,
  PackageCheck,
  AlertTriangle,
  MessageSquare,
  Plus,
  CheckCircle2,
  XCircle,
  Tag
} from "lucide-react";
import { Order, Product } from "../../types";
import { updateOrderTracking } from "../../utils";

const ALL_STATUSES = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded"
];

interface OrdersTabProps {
  orderList: Order[];
  productList?: Product[];
  onUpdateStatus: (id: string, status: any) => void;
}

export default function OrdersTab({ orderList, productList = [], onUpdateStatus }: OrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Tracking details state
  const [trackingNo, setTrackingNo] = useState("");
  const [courier, setCourier] = useState("Shiprocket Express");
  const [customNote, setCustomNote] = useState("");
  const [submittingTracking, setSubmittingTracking] = useState(false);

  // New admin note state
  const [adminNoteText, setAdminNoteText] = useState("");

  // -------------------------------------------------------------
  // COMPUTED DASHBOARD METRICS (PHASE 10 REQUIREMENT)
  // -------------------------------------------------------------
  const todayStr = new Date().toDateString();
  const todayOrders = orderList.filter(o => new Date(o.createdAt).toDateString() === todayStr);
  const todayOrdersCount = todayOrders.length;
  const todayOrdersRevenue = todayOrders.reduce((sum, o) => sum + (o.status !== "Cancelled" ? o.totalAmount : 0), 0);

  const pendingOrdersCount = orderList.filter(o => o.status === "Pending" || o.status === "Confirmed" || o.status === "Packed").length;

  const totalRevenue = orderList
    .filter(o => o.status !== "Cancelled" && o.status !== "Refunded")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalUnitsSold = orderList
    .filter(o => o.status !== "Cancelled")
    .reduce((total, o) => total + (o.items ? o.items.reduce((iSum, item) => iSum + item.quantity, 0) : 0), 0);

  const lowStockCount = productList.filter(p => 
    p.stockStatus === "Low Stock" || 
    p.stockStatus === "Out of Stock" || 
    ((p as any).stockQuantity !== undefined && (p as any).stockQuantity <= 10)
  ).length;

  // Filtered orders
  const filteredOrders = orderList.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      o.id.toLowerCase().includes(q) || 
      o.customer.name.toLowerCase().includes(q) || 
      o.customer.phone.includes(q) ||
      o.customer.email.toLowerCase().includes(q) ||
      o.customer.city.toLowerCase().includes(q);
    
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    const matchesPayment = paymentFilter === "All" || 
      (paymentFilter === "Paid" && (o.paymentStatus === "Paid" || o.status === "Delivered")) ||
      (paymentFilter === "Pending" && (o.paymentStatus === "Pending" && o.status !== "Delivered")) ||
      (paymentFilter === "Refunded" && o.paymentStatus === "Refunded");

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNo(order.trackingNumber || "");
    setCourier(order.courierPartner || "Shiprocket Express");
    setCustomNote("");
  };

  const handleSaveTrackingDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmittingTracking(true);

    updateOrderTracking(
      selectedOrder.id,
      trackingNo.trim(),
      courier.trim(),
      selectedOrder.status,
      customNote.trim() ? customNote.trim() : undefined
    );

    const updatedOrder = {
      ...selectedOrder,
      trackingNumber: trackingNo.trim(),
      courierPartner: courier.trim(),
    };
    
    if (customNote.trim()) {
      updatedOrder.trackingHistory = [
        ...selectedOrder.trackingHistory,
        {
          status: selectedOrder.status,
          timestamp: new Date().toISOString(),
          description: customNote.trim()
        }
      ];
    }
    
    setSelectedOrder(updatedOrder);
    setCustomNote("");
    setSubmittingTracking(false);
  };

  const handleAddAdminNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !adminNoteText.trim()) return;

    const newNote = {
      id: "note-" + Date.now(),
      user: "Admin",
      text: adminNoteText.trim(),
      date: new Date().toISOString()
    };

    const updatedNotes = [...(selectedOrder.notes || []), newNote];
    const updatedOrder = { ...selectedOrder, notes: updatedNotes };

    setSelectedOrder(updatedOrder);
    setAdminNoteText("");
  };

  return (
    <div id="orders-dashboard-wrapper" className="space-y-6 text-left animate-fade-in font-sans">
      
      {!selectedOrder ? (
        <div className="space-y-6">
          
          {/* 1. TOP 5 DASHBOARD CARDS (PHASE 10 CORE METRICS) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            
            {/* Card 1: Today's Orders */}
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Today's Orders</span>
                <Clock className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-xl font-black text-zinc-900 font-mono">{todayOrdersCount}</div>
              <p className="text-[10px] text-zinc-500">Value: ₹{todayOrdersRevenue.toLocaleString("en-IN")}</p>
            </div>

            {/* Card 2: Pending Orders */}
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Pending Orders</span>
                <PackageCheck className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-xl font-black text-amber-600 font-mono">{pendingOrdersCount}</div>
              <p className="text-[10px] text-zinc-500">Requires fulfillment</p>
            </div>

            {/* Card 3: Revenue */}
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Total Revenue</span>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-emerald-600 font-mono">₹{totalRevenue.toLocaleString("en-IN")}</div>
              <p className="text-[10px] text-zinc-500">Cumulative sales</p>
            </div>

            {/* Card 4: Units Sold */}
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Units Sold</span>
                <ShoppingBag className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-xl font-black text-zinc-900 font-mono">{totalUnitsSold}</div>
              <p className="text-[10px] text-zinc-500">Apparel items shipped</p>
            </div>

            {/* Card 5: Low Stock Products */}
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Low Stock Alert</span>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div className="text-xl font-black text-red-600 font-mono">{lowStockCount}</div>
              <p className="text-[10px] text-zinc-500">Products need restock</p>
            </div>

          </div>

          {/* 2. FILTERS & SEARCH BAR */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 shadow-2xs">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by order #, customer, phone, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-250 pl-9 pr-4 py-2 rounded-lg text-xs font-sans focus:outline-none focus:border-zinc-900 focus:bg-white"
                />
              </div>

              {/* Payment Status Dropdown */}
              <div className="flex items-center gap-2 text-xs w-full md:w-auto">
                <span className="text-zinc-500 font-mono font-bold text-[10px] uppercase">Payment:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="border border-zinc-200 bg-zinc-50 py-1.5 px-3 rounded-lg text-xs font-medium focus:outline-none focus:border-zinc-900"
                >
                  <option value="All">All Payment States</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending (COD)</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

            </div>

            {/* Status Tabs */}
            <div className="flex border-t border-zinc-100 pt-3 overflow-x-auto gap-1">
              {["All", ...ALL_STATUSES].map((st) => {
                const count = st === "All" ? orderList.length : orderList.filter(o => o.status === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold uppercase whitespace-nowrap cursor-pointer transition ${
                      statusFilter === st
                        ? "bg-zinc-900 text-white shadow-2xs"
                        : "bg-zinc-50 text-zinc-600 hover:bg-zinc-150"
                    }`}
                  >
                    {st} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. ORDERS TABLE */}
          <div className="bg-white border rounded-2xl overflow-x-auto shadow-2xs">
            <table className="w-full text-xs text-left text-zinc-700 min-w-[750px]">
              <thead className="bg-zinc-50 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => {
                    const isPaid = o.paymentStatus === "Paid" || o.status === "Delivered";
                    return (
                      <tr key={o.id} className="hover:bg-zinc-50/60 transition">
                        <td className="py-4 px-5 font-mono text-zinc-950 font-bold uppercase text-[11px]">
                          #{o.id}
                        </td>
                        <td className="py-4 px-4 text-zinc-500 text-[11px] font-mono">
                          {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-zinc-950">{o.customer.name}</div>
                          <span className="text-[10px] text-zinc-400 font-mono block">{o.customer.phone} • {o.customer.city}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                            isPaid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {o.paymentMethod || "COD"} • {isPaid ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-zinc-950 font-mono">
                          ₹{o.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-full ${
                            ["Delivered"].includes(o.status) 
                              ? "bg-green-100 text-green-800 border border-green-200" 
                              : ["Cancelled", "Returned", "Refunded"].includes(o.status)
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => handleSelectOrder(o)}
                            className="px-3 py-1.5 border border-zinc-250 hover:border-zinc-900 font-bold text-zinc-800 rounded-lg bg-white cursor-pointer hover:bg-zinc-50 transition"
                          >
                            Manage Order
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 italic text-zinc-400">
                      No orders found matching your search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        /* SINGLE ORDER DETAILED VIEW & INVOICE WORKFLOW */
        <div className="bg-white border border-zinc-200 text-xs text-zinc-700 rounded-2xl p-6 space-y-6 shadow-2xs">
          
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-600 cursor-pointer hover:text-black transition"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Orders
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
              >
                <Printer className="h-3.5 w-3.5" /> Print Tax Invoice
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* L.H.S (8 Columns): Order Items, Invoice Summary & Timeline */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Order Header Metadata */}
              <div className="p-4 bg-zinc-50 rounded-xl space-y-2 border border-zinc-200">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-zinc-500">Order Number</span>
                  <span className="font-bold text-zinc-950 uppercase">#{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-zinc-500">Order Date</span>
                  <span className="text-zinc-800">{new Date(selectedOrder.createdAt).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-mono text-xs border-t pt-2 border-zinc-200">
                  <span className="text-zinc-500">Payment Status</span>
                  <span className="font-bold text-emerald-600 uppercase">
                    {selectedOrder.paymentMethod} • {selectedOrder.status === "Delivered" ? "Paid" : (selectedOrder.paymentStatus || "Pending COD")}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                <div className="bg-zinc-50 p-3 border-b font-mono text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                  Ordered Items ({selectedOrder.items ? selectedOrder.items.length : 0})
                </div>
                <div className="divide-y divide-zinc-150">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className="p-4 flex items-center justify-between text-xs hover:bg-zinc-50/50">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="h-14 w-11 object-cover rounded border border-zinc-200 bg-zinc-100" />
                        <div>
                          <h4 className="font-bold text-zinc-950">{item.name}</h4>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            SKU: {item.productId?.slice(0, 8).toUpperCase() || "CLNZA-SKU"} • Size: {item.size || "M"} • Color: {item.color || "Standard"}
                          </div>
                          <span className="text-[10px] text-zinc-600 font-mono">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="text-right font-bold text-zinc-950 font-mono">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-zinc-50 border-t border-zinc-200 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Items Subtotal</span>
                    <span>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Shipping Fee</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm text-zinc-950 font-black">
                    <span>Grand Total</span>
                    <span className="text-zinc-950">₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="border border-zinc-200 rounded-xl bg-white p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase font-mono text-zinc-700 tracking-wider">
                  Order Status Timeline ({selectedOrder.trackingHistory ? selectedOrder.trackingHistory.length : 0} events)
                </h3>
                <div className="space-y-4 relative pl-4 border-l-2 border-zinc-200">
                  {(selectedOrder.trackingHistory || []).map((step, sIdx) => (
                    <div key={sIdx} className="relative text-left">
                      <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-zinc-900 border-2 border-white" />
                      <div className="text-xs">
                        <span className="font-bold text-zinc-900 uppercase font-mono text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded mr-2">{step.status}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{new Date(step.timestamp).toLocaleString("en-IN")}</span>
                        <p className="text-xs text-zinc-600 mt-1 font-sans">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Administrative Internal Notes */}
              <div className="border border-zinc-200 rounded-xl bg-white p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase font-mono text-zinc-700 tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-zinc-500" /> Internal Administrative Notes
                </h3>

                {selectedOrder.notes && selectedOrder.notes.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.notes.map((n) => (
                      <div key={n.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                          <span className="font-bold text-zinc-800">{n.user}</span>
                          <span>{new Date(n.date).toLocaleString("en-IN")}</span>
                        </div>
                        <p className="text-zinc-700">{n.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No administrative notes attached to this order yet.</p>
                )}

                {/* Add Note Form */}
                <form onSubmit={handleAddAdminNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add an internal note (e.g., Customer requested gift packaging...)"
                    value={adminNoteText}
                    onChange={(e) => setAdminNoteText(e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-250 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-zinc-900"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 cursor-pointer"
                  >
                    Add Note
                  </button>
                </form>
              </div>

            </div>

            {/* R.H.S (4 Columns): Customer Info, Status Selector, Logistics Tracking */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Customer Details */}
              <div className="p-5 border bg-zinc-50 border-zinc-200 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase font-mono text-zinc-500 tracking-wider">
                  Customer & Shipping Address
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2 text-zinc-800">
                    <User className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-zinc-950">{selectedOrder.customer.name}</span>
                      <span className="text-[11px] text-zinc-500 font-mono block">{selectedOrder.customer.email || "No email"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 text-zinc-800">
                    <Phone className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span className="font-mono text-zinc-800 font-bold">{selectedOrder.customer.phone}</span>
                  </div>
                  <div className="flex gap-2 text-zinc-800">
                    <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="leading-relaxed text-zinc-700">
                        {selectedOrder.customer.address}, {selectedOrder.customer.city}, {selectedOrder.customer.state} - <strong>{selectedOrder.customer.pincode}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="p-5 border border-zinc-200 bg-white rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase text-zinc-700 font-mono tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="h-4 w-4 text-zinc-500" /> Update Order Status
                </h3>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 font-mono">Current Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const value = e.target.value as any;
                      onUpdateStatus(selectedOrder.id, value);
                      
                      const updatedHist = [
                        ...(selectedOrder.trackingHistory || []),
                        {
                          status: value,
                          timestamp: new Date().toISOString(),
                          description: `Order status changed to ${value}.`
                        }
                      ];
                      
                      setSelectedOrder({ 
                        ...selectedOrder, 
                        status: value,
                        trackingHistory: updatedHist
                      });
                    }}
                    className="w-full border rounded-lg p-2.5 font-bold text-xs bg-white text-zinc-900 focus:outline-none focus:border-zinc-900"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Courier & Tracking Form */}
              <form onSubmit={handleSaveTrackingDetails} className="p-5 border border-zinc-200 bg-zinc-50 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase text-zinc-700 font-mono tracking-wider flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-zinc-500" /> Courier & Dispatch Details
                </h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 font-mono">Courier Partner</label>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full border rounded-lg p-2 font-medium text-xs bg-white text-zinc-800 focus:outline-none focus:border-zinc-900"
                  >
                    <option value="Shiprocket Express">Shiprocket Express</option>
                    <option value="Delhivery Logistics">Delhivery Logistics</option>
                    <option value="Blue Dart Airways">Blue Dart Airways</option>
                    <option value="DTDC Express Courier">DTDC Express Courier</option>
                    <option value="IndiaPost Parcel">IndiaPost Parcel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 font-mono">Tracking Docket #</label>
                  <input
                    type="text"
                    placeholder="e.g. SR-881293-IN"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    className="w-full border rounded-lg p-2 font-mono text-xs bg-white text-zinc-800 focus:outline-none focus:border-zinc-900 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 font-mono">Update Note for Customer</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Package dispatched from Mumbai Hub."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full border rounded-lg p-2 font-sans text-xs bg-white text-zinc-800 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingTracking}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg transition cursor-pointer"
                >
                  Save Dispatch Info
                </button>
              </form>

            </div>

          </div>

        </div>
      )}

      {/* 4. CLINZA TAX INVOICE PRINT MODAL */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 space-y-6 text-zinc-900 shadow-2xl relative my-8">
            
            {/* Modal Actions */}
            <div className="flex justify-between items-center border-b pb-4 print:hidden">
              <span className="font-mono text-xs font-bold text-zinc-500 uppercase">Tax Invoice Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-zinc-800"
                >
                  <Printer className="h-4 w-4" /> Print / Download PDF
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-3 py-2 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-bold cursor-pointer hover:bg-zinc-50"
                >
                  Close
                </button>
              </div>
            </div>

            {/* TAX INVOICE CONTENT (PRINTABLE) */}
            <div id="printable-tax-invoice" className="space-y-6 font-sans">
              
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h1 className="text-2xl font-black tracking-widest font-serif text-zinc-950">CLINZA</h1>
                  <p className="text-[10px] text-zinc-500 font-mono">LUXURY APPAREL & SARTORIAL WARDROBE</p>
                  <p className="text-[10px] text-zinc-500 mt-1">108 Fashion Avenue, Worli, Mumbai, MH - 400018</p>
                  <p className="text-[10px] text-zinc-500 font-mono">GSTIN: 27AAAAA0000A1Z5 | Support: care@clinza.com</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400 block">TAX INVOICE</span>
                  <span className="text-sm font-black font-mono text-zinc-950 block">INV-{selectedOrder.id}</span>
                  <span className="text-[10px] text-zinc-500 font-mono block">Date: {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div>
                  <h4 className="font-bold text-zinc-500 font-mono text-[10px] uppercase mb-1">Billed & Shipped To:</h4>
                  <p className="font-bold text-zinc-950">{selectedOrder.customer.name}</p>
                  <p className="text-zinc-600">{selectedOrder.customer.address}</p>
                  <p className="text-zinc-600">{selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.pincode}</p>
                  <p className="text-zinc-600 font-mono mt-1">Phone: {selectedOrder.customer.phone}</p>
                </div>
                <div>
                  <h4 className="font-bold text-zinc-500 font-mono text-[10px] uppercase mb-1">Payment Details:</h4>
                  <p className="text-zinc-800"><strong className="text-zinc-950">Method:</strong> {selectedOrder.paymentMethod} (Cash on Delivery)</p>
                  <p className="text-zinc-800"><strong className="text-zinc-950">Status:</strong> {selectedOrder.status === "Delivered" ? "Paid" : "Pending COD Collection"}</p>
                  <p className="text-zinc-800"><strong className="text-zinc-950">Place of Supply:</strong> {selectedOrder.customer.state}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-300 bg-zinc-100 text-[10px] font-mono font-bold uppercase text-zinc-600">
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-zinc-950">{item.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">Size: {item.size || "M"} | Color: {item.color || "Standard"}</div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">₹{item.price.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Breakdown */}
              <div className="border-t border-zinc-200 pt-3 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Shipping</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>GST Included</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-900 pt-2 text-sm font-black text-zinc-950">
                    <span>Total Payable</span>
                    <span>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="border-t border-dashed border-zinc-300 pt-4 text-center text-[10px] text-zinc-500 font-mono space-y-1">
                <p>Thank you for choosing CLINZA Luxury Wardrobe. Computer generated invoice — no physical signature required.</p>
                <p>For return policies or customer care, visit clinza.com/returns</p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
