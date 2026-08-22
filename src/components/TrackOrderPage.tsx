/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Truck, 
  Calendar, 
  User, 
  Package, 
  ShieldCheck, 
  ShoppingBag,
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  Check,
  CreditCard,
  Banknote,
  FileText,
  Clock,
  Printer,
  X
} from "lucide-react";
import { Order } from "../types";
import { getOrders, fetchOrderForTracking, getProducts } from "../utils";

export default function TrackOrderPage() {
  const location = useLocation();
  const [orderQuery, setOrderQuery] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Auto-search if query or active orders exists so users immediately see their order
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

  // Six defined progression states for the order lifecycle
  const steps = [
    { 
      number: "1",
      title: "PLACED", 
      key: "Placed", 
      desc: "Order received and recorded in CLINZA system.", 
      detail: "Central Depot accept logged",
      icon: ShoppingBag 
    },
    { 
      number: "2",
      title: "CONFIRMED", 
      key: "Confirmed", 
      desc: "Order verified and payment/COD clearance approved.", 
      detail: "Verification approved",
      icon: ShieldCheck 
    },
    { 
      number: "3",
      title: "PROCESSING", 
      key: "Processing", 
      desc: "Garments hand-inspected, steam-pressed & vacuum packed.", 
      detail: "Packaging applied",
      icon: Package 
    },
    { 
      number: "4",
      title: "SHIPPED", 
      key: "Shipped", 
      desc: "Consignment handed over to Shiprocket express carrier.", 
      detail: "Carrier transit booked",
      icon: Truck 
    },
    { 
      number: "5",
      title: "OUT FOR DELIVERY", 
      key: "Out for Delivery", 
      desc: "Courier executive is en route to your delivery address.", 
      detail: "Local pincode dispatch",
      icon: MapPin 
    },
    { 
      number: "6",
      title: "DELIVERED", 
      key: "Delivered", 
      desc: "Package safely handed over at your doorstep.", 
      detail: "Handover confirmed",
      icon: CheckCircle2 
    }
  ];

  // Helper to deduce step activation index from Supabase status
  const getStepIndex = (rawStatus?: string): number => {
    if (!rawStatus) return 0;
    const s = rawStatus.trim().toLowerCase().replace(/[\s_-]+/g, " ");
    
    if (s.includes("cancel")) return -1;
    if (s.includes("deliver")) return 5;
    if (s.includes("out for delivery") || s.includes("out_for_delivery")) return 4;
    if (s.includes("ship") || s.includes("dispatch") || s.includes("in transit") || s.includes("transit")) return 3;
    if (s.includes("process") || s.includes("pack") || s.includes("ready") || s.includes("fulfill")) return 2;
    if (s.includes("confirm") || s.includes("verif") || s.includes("accept")) return 1;
    if (s.includes("place") || s.includes("pend") || s.includes("creat") || s.includes("receiv")) return 0;

    return 0;
  };

  const getStatusSummary = (status?: string) => {
    const stepIdx = getStepIndex(status);
    if (stepIdx === -1) {
      return {
        badge: "Cancelled",
        badgeClass: "bg-red-50 text-red-700 border-red-200",
        headline: "YOUR ORDER HAS BEEN CANCELLED",
        subtitle: "This order has been cancelled and delivery has been terminated. Please contact CLINZA concierge support if you have any questions.",
        icon: AlertCircle,
        textColor: "text-red-700"
      };
    }
    
    switch (stepIdx) {
      case 0:
        return {
          badge: "Order Placed",
          badgeClass: "bg-zinc-100 text-zinc-900 border-zinc-200",
          headline: "YOUR ORDER HAS BEEN PLACED",
          subtitle: "We have received your order details. Our team is preparing your order for verification.",
          icon: ShoppingBag,
          textColor: "text-gray-900"
        };
      case 1:
        return {
          badge: "Confirmed",
          badgeClass: "bg-zinc-100 text-zinc-900 border-zinc-200",
          headline: "YOUR ORDER IS CONFIRMED",
          subtitle: "Your order has been confirmed and is now being prepared for processing.",
          icon: ShieldCheck,
          textColor: "text-gray-900"
        };
      case 2:
        return {
          badge: "Processing",
          badgeClass: "bg-zinc-100 text-zinc-900 border-zinc-200",
          headline: "YOUR ORDER IS BEING PROCESSED",
          subtitle: "Your garments are being hand-inspected, steam-pressed, and packed with care.",
          icon: Package,
          textColor: "text-gray-900"
        };
      case 3:
        return {
          badge: "In Transit",
          badgeClass: "bg-zinc-100 text-zinc-900 border-zinc-200",
          headline: "YOUR ORDER HAS BEEN SHIPPED",
          subtitle: "Your consignment is in transit with the carrier and is making its way to your destination hub.",
          icon: Truck,
          textColor: "text-gray-900"
        };
      case 4:
        return {
          badge: "Out for Delivery",
          badgeClass: "bg-zinc-100 text-zinc-900 border-zinc-200",
          headline: "YOUR ORDER IS OUT FOR DELIVERY",
          subtitle: "The delivery agent is in your area and will deliver your package to your doorstep today.",
          icon: MapPin,
          textColor: "text-gray-900"
        };
      case 5:
        return {
          badge: "Delivered",
          badgeClass: "bg-zinc-100 text-zinc-900 border-zinc-200",
          headline: "YOUR ORDER HAS BEEN DELIVERED",
          subtitle: "Your CLINZA package has been successfully delivered. We hope you love your new pieces!",
          icon: CheckCircle2,
          textColor: "text-gray-900"
        };
      default:
        return {
          badge: "In Progress",
          badgeClass: "bg-zinc-100 text-zinc-900 border-zinc-200",
          headline: "YOUR ORDER IS IN PROGRESS",
          subtitle: "Your order is being processed by CLINZA logistics.",
          icon: Package,
          textColor: "text-gray-900"
        };
    }
  };

  const currentStepIdx = activeOrder ? getStepIndex(activeOrder.status) : 0;
  const isDelivered = currentStepIdx >= 5;
  const statusInfo = activeOrder ? getStatusSummary(activeOrder.status) : null;

  const totalItemCount = activeOrder?.items 
    ? activeOrder.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0;

  const orderDateFormatted = activeOrder?.createdAt
    ? new Date(activeOrder.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : (activeOrder as any)?.date || "Recent Order";

  const allProducts = getProducts();

  const subtotal = activeOrder?.subtotal !== undefined && activeOrder.subtotal > 0
    ? activeOrder.subtotal
    : activeOrder?.items && activeOrder.items.length > 0
      ? activeOrder.items.reduce((sum, it) => {
          const itemPrice = it.price > 0 ? it.price : (allProducts.find(p => p.id === it.productId || p.name === it.name)?.price || 0);
          return sum + (itemPrice * (it.quantity || 1));
        }, 0)
      : activeOrder?.totalAmount || 0;

  const shippingFee = activeOrder?.shippingFee !== undefined ? activeOrder.shippingFee : (activeOrder?.shipping_fee !== undefined ? activeOrder.shipping_fee : 0);
  const discount = activeOrder?.discount !== undefined && activeOrder.discount > 0
    ? activeOrder.discount
    : Math.max(0, subtotal + shippingFee - (activeOrder?.totalAmount || (subtotal + shippingFee)));
  const finalTotal = activeOrder?.totalAmount && activeOrder.totalAmount > 0 
    ? activeOrder.totalAmount 
    : (subtotal - discount + shippingFee);

  return (
    <section id="clinza-track-order-page" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen text-left">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* TOP SEARCH BAR COMPONENT */}
        <div className="bg-white border border-gray-200/80 p-5 sm:p-6 rounded-2xl shadow-xs">
          <form onSubmit={handleTrackSubmit} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="track-order-input" className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-1.5 font-mono select-none">
                  ORDER NUMBER
                </label>
                <div className="relative">
                  <input
                    id="track-order-input"
                    type="text"
                    placeholder="CLNZA-2026-000001"
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    className="w-full bg-gray-50/70 border border-gray-200 py-3 pl-10 pr-4 rounded-xl text-xs font-semibold focus:outline-none focus:border-gray-900 text-gray-900 uppercase transition-colors"
                  />
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="track-contact-input" className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-1.5 font-mono select-none">
                  EMAIL OR PHONE NUMBER
                </label>
                <div className="relative">
                  <input
                    id="track-contact-input"
                    type="text"
                    placeholder="sastaelectronic6@gmail.com"
                    value={contactQuery}
                    onChange={(e) => setContactQuery(e.target.value)}
                    className="w-full bg-gray-50/70 border border-gray-200 py-3 pl-10 pr-4 rounded-xl text-xs font-semibold focus:outline-none focus:border-gray-900 text-gray-900 transition-colors"
                  />
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <button
              id="track-order-submit"
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-gray-950 hover:bg-black text-white font-sans text-xs font-bold uppercase tracking-wider h-11 px-8 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "TRACK ORDER"}
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-left animate-fade-in text-xs font-medium text-rose-900">
            <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* RESULTS CARD */}
        {activeOrder && statusInfo && (
          <div className="space-y-6">
            
            {/* 1. ORDER HEADER & STATUS TIMELINE CARD */}
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 sm:p-8 space-y-8 animate-slide-up">
              
              {/* Order Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-gray-950 uppercase">
                    ORDER #{activeOrder.id}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Placed on {orderDateFormatted}
                  </p>
                </div>
                <button 
                  id="track-view-invoice-btn"
                  onClick={() => setShowInvoiceModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-950 transition-colors self-start sm:self-center cursor-pointer group"
                >
                  <span>View Invoice</span>
                  <FileText className="h-4 w-4 text-gray-400 group-hover:text-gray-950 transition-colors" />
                </button>
              </div>

              {/* 6-Milestone Connected Timeline */}
              {activeOrder.status === "Cancelled" ? (
                <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-red-600 font-bold uppercase tracking-wider">Order Cancelled</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                    This order has been cancelled and delivery has been terminated.
                  </p>
                </div>
              ) : (
                <div className="relative py-2">
                  
                  {/* Desktop Horizontal Milestone Flow */}
                  <div className="hidden md:flex items-start justify-between relative">
                    
                    {/* Background & Active Progression Connecting Lines */}
                    {steps.map((st, idx) => {
                      if (idx === steps.length - 1) return null;
                      const isLineCompleted = isDelivered || idx < currentStepIdx;
                      const isLineActive = !isDelivered && idx === currentStepIdx;

                      return (
                        <div 
                          key={`line-${idx}`} 
                          className="absolute top-5 h-0.5 z-0"
                          style={{
                            left: `calc(${(idx / (steps.length - 1)) * 100}% + 24px)`,
                            width: `calc(${100 / (steps.length - 1)}% - 48px)`
                          }}
                        >
                          {isLineCompleted ? (
                            <div className="w-full h-full bg-gray-950 transition-all duration-500" />
                          ) : isLineActive ? (
                            <div className="relative w-full h-full bg-gray-200 overflow-hidden">
                              <svg className="w-full h-full" preserveAspectRatio="none">
                                <line 
                                  x1="0" 
                                  y1="1" 
                                  x2="100%" 
                                  y2="1" 
                                  stroke="#18181b" 
                                  strokeWidth="2" 
                                  strokeDasharray="4 4" 
                                  className="animate-connector-travel"
                                />
                              </svg>
                              <div className="animate-line-travel" />
                            </div>
                          ) : (
                            <div className="w-full h-full border-t-2 border-dashed border-gray-200" />
                          )}
                        </div>
                      );
                    })}

                    {/* Step Nodes */}
                    {steps.map((st, idx) => {
                      const isStepCompleted = isDelivered || idx < currentStepIdx;
                      const isStepCurrent = !isDelivered && idx === currentStepIdx;
                      const isStepFuture = !isDelivered && idx > currentStepIdx;
                      const StepIcon = st.icon;

                      return (
                        <div key={st.key} className="flex flex-col items-center text-center z-10 w-28">
                          
                          {/* Circle Icon Badge */}
                          <div className={`relative h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isStepCompleted
                              ? "bg-gray-950 text-white shadow-xs"
                              : isStepCurrent
                                ? "bg-gray-950 text-white animate-active-node scale-105 shadow-md ring-4 ring-gray-100"
                                : "bg-white border-2 border-gray-200 text-gray-400"
                          }`}>
                            {isStepCompleted ? (
                              <Check className="h-4 w-4 stroke-[2.5]" />
                            ) : (
                              <StepIcon className={`h-4 w-4 ${isStepCurrent ? "stroke-[2.2]" : "stroke-[1.5]"}`} />
                            )}
                          </div>

                          {/* Step Labels */}
                          <div className="mt-3.5 space-y-0.5">
                            <p className={`text-[11px] font-bold uppercase tracking-tight ${
                              isStepCompleted || isStepCurrent ? "text-gray-950" : "text-gray-400"
                            }`}>
                              {st.number}. {st.title}
                            </p>
                            <p className="text-[10px] font-medium leading-none">
                              {isStepCompleted ? (
                                <span className="text-gray-500 font-mono">Completed</span>
                              ) : isStepCurrent ? (
                                <span className="text-gray-950 font-bold font-mono">In Progress</span>
                              ) : (
                                <span className="text-gray-400 font-mono">Pending</span>
                              )}
                            </p>
                          </div>

                        </div>
                      );
                    })}

                  </div>

                  {/* Mobile Vertical Connected Flow */}
                  <div className="md:hidden relative space-y-6 pl-2">
                    
                    {/* Vertical connecting background track line */}
                    <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gray-200 z-0" />
                    
                    {/* Filled active vertical connector line */}
                    <div 
                      className="absolute left-[23px] top-4 w-0.5 bg-gray-950 z-0 transition-all duration-500"
                      style={{ 
                        height: isDelivered 
                          ? "calc(100% - 32px)" 
                          : `calc(${((Math.max(0, currentStepIdx)) / (steps.length - 1)) * 100}% - 16px)` 
                      }} 
                    />

                    {steps.map((st, idx) => {
                      const isStepCompleted = isDelivered || idx < currentStepIdx;
                      const isStepCurrent = !isDelivered && idx === currentStepIdx;
                      const StepIcon = st.icon;

                      return (
                        <div key={st.key} className="flex items-start gap-4 relative z-10">
                          
                          {/* Node Icon */}
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isStepCompleted
                              ? "bg-gray-950 text-white shadow-xs"
                              : isStepCurrent
                                ? "bg-gray-950 text-white animate-active-node scale-105 shadow-md ring-2 ring-gray-200"
                                : "bg-white border-2 border-gray-200 text-gray-400"
                          }`}>
                            {isStepCompleted ? (
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            ) : (
                              <StepIcon className={`h-3.5 w-3.5 ${isStepCurrent ? "stroke-[2.2]" : "stroke-[1.5]"}`} />
                            )}
                          </div>

                          {/* Node text */}
                          <div className="pt-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-xs font-bold uppercase tracking-tight ${
                                isStepCompleted || isStepCurrent ? "text-gray-950" : "text-gray-400"
                              }`}>
                                {st.number}. {st.title}
                              </p>
                              {isStepCurrent && (
                                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-200">
                                  In Progress
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 font-light mt-0.5">
                              {st.desc}
                            </p>
                          </div>

                        </div>
                      );
                    })}

                  </div>

                </div>
              )}

              {/* Dynamic Status Banner Card */}
              {activeOrder.status !== "Cancelled" && (
                <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-950 text-white flex items-center justify-center shadow-xs">
                        <statusInfo.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black font-sans text-gray-950 uppercase tracking-tight">
                        {statusInfo.headline}
                      </h3>
                      <p className="text-xs text-gray-600 font-light mt-0.5 max-w-xl leading-relaxed">
                        {statusInfo.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <a
                    href="#order-items-section"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("order-items-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-gray-950 hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shrink-0 cursor-pointer self-start sm:self-center shadow-xs"
                  >
                    ORDER DETAILS
                  </a>
                </div>
              )}

            </div>

            {/* 2. ORDER ITEMS & ORDER SUMMARY SECTION (PROMINENT AT TOP) */}
            {activeOrder.items && activeOrder.items.length > 0 && (
              <div id="order-items-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
                
                {/* Left Column: Order Items */}
                <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 sm:p-7 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-950 font-mono mb-5 border-b border-gray-100 pb-3">
                      ORDER ITEMS ({totalItemCount})
                    </h3>

                    <div className="divide-y divide-gray-100 space-y-4">
                      {activeOrder.items.map((it, idx) => (
                        <div key={idx} className="pt-4 first:pt-0 flex items-center gap-4">
                          
                          {/* Thumbnail with real it.image or neutral fallback */}
                          <div className="h-16 w-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {it.image ? (
                              <img 
                                src={it.image} 
                                alt={it.name} 
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <Package className="h-5 w-5 text-gray-400" />
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-950 uppercase tracking-tight truncate">
                              {it.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                              {it.color ? `${it.color} | ` : ""}Size: {it.size || "Standard"}
                            </p>
                            <p className="text-xs font-semibold text-gray-800 mt-1 font-mono">
                              ₹{(it.price > 0 ? it.price : (allProducts.find(p => p.id === it.productId || p.name === it.name)?.price || 0)).toLocaleString("en-IN")}.00 × {it.quantity || 1}
                            </p>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1 bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 sm:p-7 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-950 font-mono mb-5 border-b border-gray-100 pb-3">
                      ORDER SUMMARY
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>Subtotal</span>
                        <span className="font-mono text-gray-950">₹{subtotal.toLocaleString("en-IN")}.00</span>
                      </div>
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>Shipping</span>
                        <span className="font-mono text-gray-950">₹{shippingFee.toLocaleString("en-IN")}.00</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Discount {activeOrder.couponCode ? `(${activeOrder.couponCode})` : ""}</span>
                          <span className="font-mono">-₹{discount.toLocaleString("en-IN")}.00</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-950">Total</span>
                        <span className="text-base font-black text-gray-950 font-mono">
                          ₹{finalTotal.toLocaleString("en-IN")}.00
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Secure packaging badge */}
                  <div className="mt-6 bg-zinc-50 border border-zinc-200/70 rounded-xl p-3.5 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-gray-950 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-gray-950 uppercase tracking-tight">
                        Secure Packaging
                      </p>
                      <p className="text-[10px] text-gray-500 font-light leading-snug mt-0.5">
                        Your order is packed with care to reach you in perfect condition.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 3. SHIPPING & LOGISTICS DETAILS CARD */}
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 sm:p-7 animate-slide-up">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-950 font-mono mb-5 border-b border-gray-100 pb-3">
                SHIPPING DETAILS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                
                {/* Shipping Address */}
                <div className="space-y-1 text-gray-600">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono mb-2">
                    SHIPPING ADDRESS
                  </p>
                  <p className="font-bold text-gray-950 text-xs">
                    {activeOrder.customer?.name || "Customer"}
                  </p>
                  <p className="leading-relaxed">
                    {activeOrder.customer?.address || "Address"}
                  </p>
                  <p className="leading-relaxed">
                    {activeOrder.customer?.city ? `${activeOrder.customer.city}, ` : ""}
                    {activeOrder.customer?.state ? `${activeOrder.customer.state} - ` : ""}
                    {activeOrder.customer?.pincode || ""}
                  </p>
                  <p className="leading-relaxed">
                    {activeOrder.customer?.country || "India"}
                  </p>
                  {activeOrder.customer?.phone && (
                    <p className="font-mono text-gray-900 pt-1 font-semibold">
                      {activeOrder.customer.phone}
                    </p>
                  )}
                </div>

                {/* Shipping Method */}
                <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono mb-2">
                    SHIPPING METHOD
                  </p>
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-gray-950 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-950 text-xs">
                        Standard Delivery
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        2-4 Business Days
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1.5">
                        Carrier: {activeOrder.courierPartner || "Shiprocket Express"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono mb-2">
                    PAYMENT METHOD
                  </p>
                  <div className="flex items-start gap-3">
                    {activeOrder.paymentMethod === "COD" ? (
                      <Banknote className="h-5 w-5 text-gray-950 shrink-0 mt-0.5" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-gray-950 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold text-gray-950 text-xs">
                        {activeOrder.paymentMethod === "COD" ? "Cash on Delivery" : "Paid Online"}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {activeOrder.paymentMethod === "COD" ? "Pay at doorstep via cash or UPI" : "UPI / Credit / Debit Card"}
                      </p>
                      <span className="inline-block mt-2 text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 border border-zinc-200">
                        {activeOrder.paymentStatus || (activeOrder.paymentMethod === "COD" ? "Pending on Delivery" : "Paid")}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

      {/* Printable Invoice Modal */}
      {showInvoiceModal && activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-950">
                  CLINZA INVOICE
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  Order ID: {activeOrder.id}
                </p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-950 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] font-bold text-gray-400 font-mono uppercase">Billed To</p>
                <p className="font-bold text-gray-950 mt-1">{activeOrder.customer?.name}</p>
                <p className="text-gray-600">{activeOrder.customer?.address}</p>
                <p className="text-gray-600">{activeOrder.customer?.city}, {activeOrder.customer?.state} - {activeOrder.customer?.pincode}</p>
                <p className="text-gray-600">{activeOrder.customer?.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 font-mono uppercase">Order Details</p>
                <p className="text-gray-600 mt-1">Date: {orderDateFormatted}</p>
                <p className="text-gray-600">Payment: {activeOrder.paymentMethod || "COD"}</p>
                <p className="text-gray-600">Status: {activeOrder.status}</p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-[10px] font-mono uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeOrder.items?.map((it, idx) => {
                    const itPrice = it.price > 0 ? it.price : (allProducts.find(p => p.id === it.productId || p.name === it.name)?.price || 0);
                    return (
                      <tr key={idx}>
                        <td className="p-3">
                          <p className="font-bold text-gray-950">{it.name}</p>
                          <p className="text-[10px] text-gray-400">{it.size ? `Size: ${it.size}` : ""}</p>
                        </td>
                        <td className="p-3 text-center font-mono">{it.quantity || 1}</td>
                        <td className="p-3 text-right font-mono">₹{itPrice.toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right font-mono font-bold">₹{(itPrice * (it.quantity || 1)).toLocaleString("en-IN")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono text-gray-950">₹{subtotal.toLocaleString("en-IN")}.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-mono text-gray-950">₹{shippingFee.toLocaleString("en-IN")}.00</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount {activeOrder.couponCode ? `(${activeOrder.couponCode})` : ""}</span>
                  <span className="font-mono">-₹{discount.toLocaleString("en-IN")}.00</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-sm font-bold text-gray-950">
                <span>Grand Total</span>
                <span className="text-base font-black font-mono">₹{finalTotal.toLocaleString("en-IN")}.00</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                <Printer className="h-4 w-4" /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

