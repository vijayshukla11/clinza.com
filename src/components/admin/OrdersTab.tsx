/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Edit, 
  Eye, 
  ChevronLeft, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  DollarSign, 
  RefreshCw, 
  Truck, 
  Tag, 
  FolderPlus, 
  PlusCircle, 
  TrendingUp, 
  CheckCircle2 
} from "lucide-react";
import { Order } from "../../types";
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
  onUpdateStatus: (id: string, status: any) => void;
}

export default function OrdersTab({ orderList, onUpdateStatus }: OrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Tracking details state
  const [trackingNo, setTrackingNo] = useState("");
  const [courier, setCourier] = useState("Shiprocket Express");
  const [customNote, setCustomNote] = useState("");
  const [submittingTracking, setSubmittingTracking] = useState(false);

  const filteredOrders = orderList.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = o.id.toLowerCase().includes(q) || 
                          o.customer.name.toLowerCase().includes(q) || 
                          o.customer.phone.includes(q);
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
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

    // Call helper to save logistics, tracking, and details
    updateOrderTracking(
      selectedOrder.id,
      trackingNo.trim(),
      courier.trim(),
      selectedOrder.status,
      customNote.trim() ? customNote.trim() : undefined
    );

    // Refresh selectedOrder local state safely
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
    alert(`Logistics docket successfully saved! Tracking updates are now live on the customer's Track Order portal.`);
  };

  return (
    <div id="orders-dashboard-wrapper" className="space-y-6 text-left animate-fade-in">
      {!selectedOrder ? (
        <div className="space-y-4">
          
          {/* Header & Badges list */}
          <div className="flex flex-wrap border-b border-zinc-200 overflow-x-auto">
            {["All", ...ALL_STATUSES].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`py-3 px-4 text-[10px] font-mono font-bold uppercase border-b-2 tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st 
                    ? "border-orange-500 text-orange-600" 
                    : "border-transparent text-zinc-500 hover:text-zinc-950"
                }`}
              >
                {st} ({st === "All" ? orderList.length : orderList.filter(o => o.status === st).length})
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by order ID, customer name, phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md bg-white border border-zinc-250 py-2.5 px-4 rounded-xl text-xs font-sans focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Order lists */}
          <div className="bg-white border rounded-2xl overflow-x-auto shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <table className="w-full text-xs text-left text-zinc-700 min-w-[700px]">
              <thead className="bg-zinc-50 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="py-4 px-5">Order ID</th>
                  <th className="py-4 px-4">Billing Customer</th>
                  <th className="py-4 px-4">Payment Method</th>
                  <th className="py-4 px-4">Total Price</th>
                  <th className="py-4 px-4">Log Status</th>
                  <th className="py-4 px-5 text-right">View/Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-50/40">
                      <td className="py-4 px-5 font-mono text-zinc-900 font-bold uppercase text-[11px]">
                        #{o.id}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-zinc-950 leading-none">{o.customer.name}</div>
                        <span className="text-[10px] text-zinc-400 font-mono mt-1 block">Phone: {o.customer.phone}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-zinc-650 bg-zinc-100 font-bold font-mono px-2 py-0.5 rounded text-[10px]">
                          {o.paymentMethod || "COD"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-950">
                        ₹{o.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block text-[9px] font-mono font-bold uppercase px-3 py-1 rounded-full ${
                          ["Delivered", "Refunded"].includes(o.status) 
                            ? "bg-green-105 text-green-700 border border-green-200" 
                            : (["Cancelled"].includes(o.status) ? "bg-red-50 text-red-650" : "bg-orange-50 text-orange-705 border border-orange-200")
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleSelectOrder(o)}
                          className="px-3.5 py-1.5 border border-zinc-200 hover:border-zinc-500 font-bold text-zinc-700 rounded-lg bg-white cursor-pointer hover:bg-zinc-50 transition"
                        >
                          Details & Status
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 italic text-zinc-400">
                      No matching order logs compiled in selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* WORKSPACE COCKPIT OF INDIVIDUAL PURCHASE */
        <div className="bg-white border text-xs text-zinc-700 rounded-2xl p-6 space-y-6 shadow-xs">
          
          <div className="flex justify-between items-center border-b pb-3">
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-500 cursor-pointer hover:text-black transition"
            >
              <ChevronLeft className="h-4 w-4" /> Return to Summary
            </button>
            <span className="text-[10px] font-mono bg-orange-50 px-3 py-1 font-bold text-orange-650 uppercase tracking-widest">
              Live Logistics Control
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
            
            {/* L.H.S (8 columns) ORDER LINE-ITEMS */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Receipt metadata */}
              <div className="p-4 bg-zinc-50 rounded-xl space-y-2.5 border border-zinc-200">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Order Reference ID</span>
                  <span className="font-bold text-zinc-950 uppercase select-all">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Authorization Date</span>
                  <span className="text-zinc-650">{new Date(selectedOrder.createdAt).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px] border-t pt-2 border-zinc-200">
                  <span>Payment Model</span>
                  <span className="font-bold text-orange-600 uppercase tracking-wide">Cash on Delivery (COD)</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border rounded-xl overflow-hidden bg-white">
                <div className="bg-zinc-50 p-3.5 border-b font-mono text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Purchased Apparel Items ({selectedOrder.items.length})
                </div>
                <div className="divide-y divide-zinc-200">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-4 flex items-center justify-between text-xs hover:bg-zinc-50/20">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="h-14 w-10 object-cover rounded border bg-zinc-100" />
                        <div>
                          <h4 className="font-bold text-zinc-950 font-serif">{item.name}</h4>
                          <div className="text-[10px] text-zinc-550 font-mono mt-0.5 uppercase">
                            Size: {item.size || "M"} • Color: {item.color || "Indigo"} • Qty: {item.quantity} units
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-bold text-zinc-950">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Math values */}
                <div className="p-4 bg-zinc-50 border-t space-y-2.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>Retail Subtotal</span>
                    <span className="text-zinc-650">₹{(selectedOrder.totalAmount - (selectedOrder.totalAmount * 0.05)).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (Goods Services Tax @ 5%)</span>
                    <span className="text-zinc-650">₹{(selectedOrder.totalAmount * 0.05).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-2.5 text-xs text-zinc-950 font-black">
                    <span>Invoice Total (Cash on Delivery)</span>
                    <span className="text-orange-600">₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* TIMELINE LIST FOR VERIFICATION */}
              <div className="border border-zinc-200 rounded-xl bg-white p-5 space-y-4">
                <h3 className="text-[11px] font-black uppercase font-mono text-zinc-500 tracking-wider">
                  Live Dispatch Chronology ({selectedOrder.trackingHistory.length} status steps)
                </h3>
                <div className="space-y-4 relative pl-4 border-l border-zinc-200">
                  {selectedOrder.trackingHistory.map((step, sIdx) => (
                    <div key={sIdx} className="relative text-left pb-1">
                      {/* Circle Dot Marker */}
                      <span className="absolute -left-[20.5px] top-1.5 h-3 w-3 rounded-full bg-orange-500 border-2 border-white ring-1 ring-zinc-200" />
                      <div className="text-xs">
                        <span className="font-bold text-zinc-900 uppercase font-mono tracking-wider text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded-sm mr-2">{step.status}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{new Date(step.timestamp).toLocaleString("en-IN")}</span>
                        <p className="text-xs text-zinc-600 mt-1 font-sans">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* R.H.S (4 columns) SHIPPING INFO, LIVE TRACKING WRITER */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Shipping card */}
              <div className="p-5 border bg-zinc-50 border-zinc-200 rounded-xl space-y-4">
                <h3 className="text-[11px] font-black uppercase font-mono text-zinc-500 tracking-wider">
                  Shipping Delivery Address
                </h3>
                
                <div className="space-y-3.5 text-xs">
                  <div className="flex gap-2 text-zinc-700">
                    <User className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-zinc-950">{selectedOrder.customer.name}</span>
                      <span className="text-[11px] text-zinc-400 font-mono block">Email: {selectedOrder.customer.email || "No email"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 text-zinc-700">
                    <Phone className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                    <span className="font-mono text-zinc-850 font-bold">{selectedOrder.customer.phone}</span>
                  </div>

                  <div className="flex gap-2 text-zinc-700">
                    <MapPin className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                    <div className="text-[11px]">
                      <p className="leading-relaxed font-sans">{selectedOrder.customer.address}, {selectedOrder.customer.city}, {selectedOrder.customer.state} - <strong>{selectedOrder.customer.pincode}</strong></p>
                      <span className="text-[9px] font-mono font-bold text-zinc-400 block mt-2 uppercase">Locality verified COD delivery enabled</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status workflow dropdown */}
              <div className="p-5 border border-zinc-200 bg-white rounded-xl space-y-3.5">
                <h3 className="text-[10px] font-black uppercase text-zinc-650 font-mono tracking-widest flex items-center gap-1.5 border-b pb-2">
                  <RefreshCw className="h-4 w-4 text-zinc-500" /> Action: Change Status State
                </h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 font-mono">Select Order Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const value = e.target.value;
                      onUpdateStatus(selectedOrder.id, value);
                      
                      // Inject local timeline reflection
                      const updatedHist = [
                        ...selectedOrder.trackingHistory,
                        {
                          status: value as any,
                          timestamp: new Date().toISOString(),
                          description: `Order advanced status state to ${value}.`
                        }
                      ];
                      
                      setSelectedOrder({ 
                        ...selectedOrder, 
                        status: value as any,
                        trackingHistory: updatedHist
                      });
                      alert(`Logistics advanced to state: "${value}"`);
                    }}
                    className="w-full border rounded-lg p-2.5 font-bold font-sans text-xs bg-white text-zinc-800 focus:outline-none focus:border-zinc-900"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TRACKING AND COURIER MANAGEMENT FORM */}
              <form onSubmit={handleSaveTrackingDetails} className="p-5 border border-orange-200 bg-orange-50/5 rounded-xl space-y-4">
                <h3 className="text-[10px] font-black uppercase text-orange-650 font-mono tracking-widest flex items-center gap-1.5 border-b border-orange-100 pb-2">
                  <Truck className="h-4 w-4" /> Live Tracking Credentials
                </h3>

                {/* Courier Partner Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 font-mono">Courier Partner</label>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full border rounded-lg p-2 font-semibold font-sans text-xs bg-white text-zinc-800 focus:outline-none focus:border-orange-500"
                  >
                    <option value="Shiprocket Express">Shiprocket Express</option>
                    <option value="Delhivery Logistics">Delhivery Logistics</option>
                    <option value="Blue Dart Airways">Blue Dart Airways</option>
                    <option value="DTDC Express Courier">DTDC Express Courier</option>
                    <option value="Indiapost Registered Parcel">IndiaPost Registered Parcel</option>
                  </select>
                </div>

                {/* Tracking Docket Code */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 font-mono">Tracking Docket Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SR-91827-IND-A"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    className="w-full border rounded-lg p-2 font-semibold font-mono text-xs bg-white text-zinc-800 focus:outline-none focus:border-orange-500 uppercase"
                  />
                </div>

                {/* Timeline update note */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 font-mono">Instant Dispatch Log Update</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Package dispatched from Mumbai Main Airport Corridor."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full border rounded-lg p-2 font-medium font-sans text-xs bg-white text-zinc-850 focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[9px] text-zinc-400 font-sans block mt-1 leading-tight">
                    * Proposes a new event directly to the user's tracker widget timeline. Only add if there is a real status dispatch update.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submittingTracking}
                  className="w-full bg-zinc-950 hover:bg-orange-600 hover:text-black text-white font-sans text-[10px] font-black uppercase tracking-widest py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FolderPlus className="h-4.5 w-4.5" /> Save Docket Updates
                </button>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
