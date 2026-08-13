/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, MapPin, Truck, Calendar, User, Package, ShieldCheck, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { Order } from "../types";
import { getOrders, fetchOrderForTracking } from "../utils";

export default function TrackOrderPage() {
  const location = useLocation();
  const [orderQuery, setOrderQuery] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-search if query or active orders exists so users immediately see a sample
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderIdParam = params.get("orderId") || (location.state as any)?.orderId;
    const contactParam = params.get("contact") || params.get("email") || params.get("phone") || (location.state as any)?.contact || (location.state as any)?.email;

    if (orderIdParam) {
      setOrderQuery(orderIdParam.toUpperCase());
      if (contactParam) setContactQuery(contactParam);
      setLoading(true);
      setErrorMsg(null);
      const list = getOrders();
      const matched = list.find(o => 
        (o.id.toLowerCase() === orderIdParam.toLowerCase() || o.id.toLowerCase().replace(/[^a-z0-9]/g, "").includes(orderIdParam.toLowerCase())) &&
        (contactParam ? (o.customer?.email?.toLowerCase() === contactParam.toLowerCase() || o.customer?.phone?.includes(contactParam)) : true)
      );
      if (matched && contactParam) {
        setActiveOrder(matched);
        setSearchAttempted(true);
        setLoading(false);
      } else if (contactParam) {
        fetchOrderForTracking(orderIdParam, contactParam).then(found => {
          if (found) {
            setActiveOrder(found);
          } else {
            setActiveOrder(null);
            setErrorMsg(`No active order found with sequence "${orderIdParam}" and contact "${contactParam}". Please check your details.`);
          }
        }).catch(() => {
          setErrorMsg("Error communicating with servers.");
        }).finally(() => {
          setSearchAttempted(true);
          setLoading(false);
        });
      } else {
        setLoading(false);
        setErrorMsg(`Please enter your registered Email or Phone Number to track order "${orderIdParam}".`);
      }
    } else {
      const list = getOrders();
      if (list.length > 0) {
        setOrderQuery(list[0].id);
        if (list[0].customer?.email) {
          setContactQuery(list[0].customer.email);
        }
        setActiveOrder(list[0]);
      }
    }
  }, [location]);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);
    setErrorMsg(null);

    const code = orderQuery.trim();
    const contact = contactQuery.trim();

    if (!code || !contact) {
      setErrorMsg("Please enter both your CLINZA Order Number (e.g., CLI-2026-000001) and registered Email or Phone Number.");
      return;
    }

    setLoading(true);
    try {
      const found = await fetchOrderForTracking(code, contact);
      if (found) {
        setActiveOrder(found);
      } else {
        const list = getOrders();
        const fallbackLocal = list.find(o => 
          (o.id.toLowerCase() === code.toLowerCase() || o.id.toLowerCase().replace(/[^a-z0-9]/g, "").includes(code.toLowerCase())) &&
          (o.customer?.email?.toLowerCase() === contact.toLowerCase() || o.customer?.phone?.includes(contact))
        );
        if (fallbackLocal) {
          setActiveOrder(fallbackLocal);
        } else {
          setActiveOrder(null);
          setErrorMsg(`No active order found matching code "${code}" and contact "${contact}". Please check your details.`);
        }
      }
    } catch (err) {
      setErrorMsg("Failed to sync status check with central database servers. Proceeding with offline logs.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Order Placed", key: "Placed", desc: "Clinza concierge accepted order." },
    { title: "Ready for Dispatch", key: "Ready for Dispatch", desc: "Linen fabrics vacuum packed for hygiene." },
    { title: "Dispatched", key: "Dispatched", desc: "Transferred to Shiprocket express hub." },
    { title: "Out for Delivery", key: "Out for Delivery", desc: "Couriers scanning pincode destination." },
    { title: "Delivered", key: "Delivered", desc: "Delivered safely at doorstep." }
  ];

  // Helper to deduce step activation index
  const getStepIndex = (status: string) => {
    if (status === "Cancelled") return -1;
    return steps.findIndex(s => s.key === status);
  };

  const currentStepIdx = activeOrder ? getStepIndex(activeOrder.status) : 0;

  return (
    <section id="clinza-track-order-page" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen text-left">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h1 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-gray-950 uppercase mb-2">
            Order Tracking Terminal
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-sans font-light leading-relaxed">
            Integrated live with <strong className="text-gray-900 font-bold">Shiprocket Express Courier Services</strong>. Real-time delivery status for standard COD payloads.
          </p>
        </div>

        {/* INPUT FORM BLOCK */}
        <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs mb-8 flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 text-left w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="track-order-input" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 font-mono select-none">
                Order Number
              </label>
              <div className="relative">
                <input
                  id="track-order-input"
                  type="text"
                  placeholder="e.g. CLI-2026-000001"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-250 py-3.5 pl-11 pr-4 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 text-gray-900 uppercase"
                />
                <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="track-contact-input" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 font-mono select-none">
                Email or Phone Number
              </label>
              <div className="relative">
                <input
                  id="track-contact-input"
                  type="text"
                  placeholder="e.g. name@example.com or phone"
                  value={contactQuery}
                  onChange={(e) => setContactQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-250 py-3.5 pl-11 pr-4 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 text-gray-900"
                />
                <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-400" />
              </div>
            </div>
          </div>
          <button
            id="track-order-submit"
            onClick={handleTrackSubmit}
            disabled={loading}
            className="w-full md:w-auto bg-gray-950 hover:bg-orange-600 text-white font-sans text-xs font-bold uppercase tracking-wider h-11 px-8 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Track Cargo"}
          </button>
        </div>

        {errorMsg && (
          <div className="bg-orange-600/5 border border-orange-600/10 rounded-xl p-4 flex items-start gap-3 text-left mb-8 animate-fade-in text-xs font-medium text-orange-900">
            <RefreshCw className="h-4.5 w-4.5 text-orange-650 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* RESULTS GRAPHICAL PROGRESS */}
        {activeOrder && (
          <div className="bg-white border border-gray-150 rounded-2xl shadow-xs overflow-hidden divide-y divide-gray-100 animate-slide-up">
            
            {/* Header segment */}
            <div className="p-6 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black tracking-widest text-orange-650 uppercase font-mono mb-1">
                  SHIPROCKET WAYBILL : CLZ-AIR-827
                </p>
                <h3 className="text-base font-black text-gray-900 uppercase">
                  ORDER {activeOrder.id}
                </h3>
              </div>
              <div className="flex flex-col sm:items-end text-left sm:text-right">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                  activeOrder.status === "Delivered" ? "bg-green-100 text-green-700" :
                  activeOrder.status === "Cancelled" ? "bg-red-100 text-red-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  Status: {activeOrder.status}
                </span>
                <span className="text-[10.5px] text-gray-500 font-mono mt-1">
                  Placed on: {activeOrder.date}
                </span>
              </div>
            </div>

            {/* Shiprocket status checkpoints timeline */}
            <div className="p-6 md:p-8">
              {activeOrder.status === "Cancelled" ? (
                <div className="text-center py-6">
                  <p className="text-xs text-red-500 font-bold uppercase tracking-widest">Order Cancelled</p>
                  <p className="text-xs text-gray-500 font-light mt-1 max-w-sm mx-auto">This payload transaction was cancelled and delivery was terminated by the merchant or user.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Connecting line */}
                  <div className="absolute left-[15px] sm:left-1/2 top-4 bottom-4 w-1 bg-gray-100 -translate-x-1/2 hidden sm:block" />
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100 sm:hidden" />
                  
                  {/* Active connection highlighting */}
                  <div
                    className="absolute left-[15px] sm:left-1/2 top-4 w-1 bg-orange-650 -translate-x-1/2 hidden sm:block transition-all duration-700"
                    style={{ height: `${(currentStepIdx / (steps.length - 1)) * 90}%` }}
                  />
                  <div
                    className="absolute left-[15px] top-4 w-0.5 bg-orange-655 sm:hidden transition-all duration-700"
                    style={{ height: `${(currentStepIdx / (steps.length - 1)) * 90}%` }}
                  />

                  {/* Nodes */}
                  <div className="space-y-8 relative z-10">
                    {steps.map((st, sIdx) => {
                      const isCompleted = sIdx <= currentStepIdx;
                      const isCurrent = sIdx === currentStepIdx;

                      return (
                        <div key={st.key} className="flex flex-col sm:flex-row items-start sm:items-center text-left">
                          
                          {/* Circle Icon Badge */}
                          <div className={`h-8.5 w-8.5 rounded-full border-4 flex items-center justify-center shrink-0 text-white transition-all ${
                            isCompleted
                              ? isCurrent
                                ? "bg-orange-600 border-orange-100 scale-110"
                                : "bg-gray-950 border-gray-100"
                              : "bg-white border-gray-100 text-gray-300"
                          }`}>
                            <Package className={`h-3.5 w-3.5 ${isCompleted ? "stroke-[3.5]" : ""}`} />
                          </div>

                          {/* Left text panel (Desktop) */}
                          <div className="sm:w-1/2 sm:text-right sm:pr-8 mt-2 sm:mt-0 order-2 sm:order-1 flex flex-col sm:items-end">
                            <p className={`text-xs font-bold uppercase tracking-tight ${
                              isCompleted ? "text-gray-900" : "text-gray-300"
                            }`}>
                              {st.title}
                            </p>
                            <p className="text-[11px] text-gray-500 font-light mt-0.5 leading-tight">{st.desc}</p>
                          </div>

                          {/* Right placeholder gap (Desktop spacer spacer) */}
                          <div className="sm:w-1/2 sm:pl-8 order-3 hidden sm:block text-xs font-mono text-gray-400">
                            {isCompleted && sIdx === 0 && `Hub accept logged • India`}
                            {isCompleted && sIdx === 1 && `Quality scanned • Vacuum cases sealed`}
                            {isCompleted && sIdx === 2 && `Carrier dispatch flight booked • Shiprocket`}
                            {isCompleted && sIdx === 3 && `Couriers dispatched to destination`}
                            {isCompleted && sIdx === 4 && `Signature matching audit complete`}
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>

            {/* Estimated delivery & agent information block */}
            <div className="p-6 bg-zinc-50 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-650 font-sans">
              
              {/* Estimated deliver date */}
              <div className="flex gap-3 items-start">
                <Calendar className="h-5 w-5 text-orange-605 shrink-0" />
                <div>
                  <p className="font-extrabold text-gray-900 uppercase text-[9px] tracking-wider mb-1">Estimated Arrival</p>
                  <p className="font-semibold text-gray-800">In 3-5 Working Days</p>
                  <p className="text-[10px] text-gray-500 font-serif">Subject to standard metro clearing.</p>
                </div>
              </div>

              {/* Courier Agent Details */}
              <div className="flex gap-3 items-start">
                <Truck className="h-5 w-5 text-orange-605 shrink-0" />
                <div>
                  <p className="font-extrabold text-gray-900 uppercase text-[9px] tracking-wider mb-1">Carrier Network</p>
                  <p className="font-semibold text-gray-800">Shiprocket Express Blue Dart</p>
                  <p className="text-[10px] text-gray-500 leading-tight">Docket: #SR-91827-IND-A</p>
                </div>
              </div>

              {/* Destination address */}
              <div className="flex gap-3 items-start">
                <MapPin className="h-5 w-5 text-orange-605 shrink-0" />
                <div>
                  <p className="font-extrabold text-gray-900 uppercase text-[9px] tracking-wider mb-1">Deliver Destination</p>
                  <p className="font-semibold text-gray-800 truncate max-w-[200px]">{activeOrder.customer.city}, {activeOrder.customer.state}</p>
                  <p className="text-[10px] text-gray-550 leading-tight block">{activeOrder.customer.pincode}</p>
                </div>
              </div>

            </div>

            {/* Product items inside the tracked package */}
            <div className="p-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-450 mb-3 border-b border-gray-50 pb-2">
                Package Contents
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {activeOrder.items.map((it, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center border border-gray-150 p-2 rounded-xl">
                    <img src={it.image} alt="" className="h-10 w-8.5 rounded object-cover bg-gray-50 shrink-0 border border-gray-100" />
                    <div className="truncate text-left">
                      <p className="font-bold text-gray-900 truncate text-[11px] leading-tight">{it.name}</p>
                      <p className="text-[9px] text-gray-400 font-mono tracking-wide leading-none mt-1">SIZE {it.size} • QTY {it.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
