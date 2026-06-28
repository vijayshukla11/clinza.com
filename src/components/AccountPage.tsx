/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, ShoppingBag, Heart, LogOut, MapPin, Truck, ShieldAlert, Sparkles } from "lucide-react";
import { Order, Product } from "../types";
import { getOrders, getProducts } from "../utils";
import { logOutUser } from "../supabase";

interface AccountPageProps {
  user: any;
  onLogout: () => void;
  setRoute: (route: string) => void;
}

export default function AccountPage({ user, onLogout, setRoute }: AccountPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [activeSegment, setActiveSegment] = useState<"orders" | "addresses">("orders");

  useEffect(() => {
    // Read local or cloud order databases
    const allOrders = getOrders();
    const userOrders = allOrders.filter(
      (o) => o.customer.email.trim().toLowerCase() === user.email.trim().toLowerCase()
    );
    setOrders(userOrders);

    // Read wishlist database matching profile
    try {
      const savedIds = localStorage.getItem("clinza_wishlist_db");
      if (savedIds) {
        const ids = JSON.parse(savedIds) as string[];
        const products = getProducts().filter(p => ids.includes(p.id));
        setWishlist(products);
      }
    } catch {}
  }, [user]);

  const handleSignOut = async () => {
    await logOutUser();
    onLogout();
    setRoute("home");
  };

  return (
    <div id="account-page-container" className="bg-zinc-50 min-h-screen py-24 px-4 sm:px-6 lg:px-8 text-left font-sans animate-fade-in">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDE BAR / IDENTITY DETAILS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Identity badge */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-zinc-950 text-white rounded-full flex items-center justify-center font-bold text-lg uppercase shadow-inner">
                {user.displayName ? user.displayName.substring(0, 2) : user.email.substring(0, 2)}
              </div>
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#F27D26] uppercase font-mono">
                  Sartorial Resident
                </span>
                <h2 className="text-xl font-bold uppercase tracking-tight text-gray-950">
                  {user.displayName || "Clinza Resident"}
                </h2>
                <p className="text-gray-400 text-xs font-light">{user.email}</p>
              </div>
            </div>

            {/* General client details */}
            <div className="border-t border-gray-100 pt-6 space-y-3.5 text-xs text-gray-650">
              <div className="flex justify-between">
                <span className="font-medium text-gray-450">Lector Code:</span>
                <span className="font-mono text-gray-900 font-bold uppercase">USR-{(user.id || "123").substring(0, 6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-450">Phone contact:</span>
                <span className="text-gray-900 font-medium">{user.phone || "Not configured"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-450">Access scope:</span>
                <span className="text-emerald-700 font-bold uppercase font-mono tracking-wider">Active Customer</span>
              </div>
            </div>

            {/* NAVIGATION RAIL LIST BUTTONS */}
            <div className="space-y-2 border-t border-gray-100 pt-6">
              <button
                onClick={() => setActiveSegment("orders")}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeSegment === "orders" 
                    ? "bg-zinc-950 text-white" 
                    : "bg-zinc-50 text-gray-650 hover:bg-zinc-100"
                }`}
              >
                <ShoppingBag className="h-4 w-4" /> Ordered Shipments ({orders.length})
              </button>
              <button
                onClick={() => setActiveSegment("addresses")}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeSegment === "addresses" 
                    ? "bg-zinc-950 text-white" 
                    : "bg-zinc-50 text-gray-650 hover:bg-zinc-100"
                }`}
              >
                <MapPin className="h-4 w-4" /> Address Protocols
              </button>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full border border-red-200 bg-red-50/20 hover:bg-red-50 text-red-600 rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <LogOut className="h-4 w-4" /> Release Secure Key
            </button>

          </div>
        </div>

        {/* CONTENT VIEWPORT */}
        <div className="lg:col-span-8 bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm">
          {activeSegment === "orders" ? (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-950">
                  Tracking Ordered Coordinates ({orders.length})
                </h3>
                <p className="text-gray-450 text-xs">A comprehensive inventory ledger of your coordinates loomed through Cash on Delivery booking.</p>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm bg-zinc-50/50">
                      
                      {/* Order top bar */}
                      <div className="bg-zinc-50 border-b border-gray-150 px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                        <div className="space-y-1">
                          <p className="text-gray-450 font-medium">Order Number</p>
                          <p className="font-extrabold text-[#F27D26] uppercase font-mono tracking-wider">{order.id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-450 font-medium">Date Booked</p>
                          <p className="font-bold text-gray-800">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric", month: "short", day: "numeric"
                            })}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono ${
                            order.status === "Delivered" 
                              ? "bg-green-100 text-green-700" 
                              : (order.status === "Shipped" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700")
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="p-5 divide-y divide-gray-100">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 text-xs sm:text-sm">
                            <img 
                              src={it.images ? it.images[0] : "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=100"} 
                              alt={it.name}
                              className="h-14 w-11 object-cover rounded bg-gray-100 border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-950 truncate uppercase">{it.name}</h4>
                              <p className="text-gray-400 text-[11px] font-light">
                                Size: <strong className="font-semibold text-gray-800">{it.size}</strong> • Color: <strong className="font-semibold text-gray-800">{it.color}</strong> • Qty: <strong className="font-semibold text-gray-800">{it.quantity}</strong>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold text-gray-900">₹{(it.price * it.quantity).toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total Amount & Tracking Actions */}
                      <div className="bg-zinc-50 border-t border-gray-100 px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <p className="text-gray-550">
                          Total Amount Paid: <strong className="font-black text-gray-950 font-sans">₹{order.totalAmount.toLocaleString("en-IN")} (COD)</strong>
                        </p>
                        <button
                          onClick={() => setRoute("track-order")}
                          className="bg-zinc-950 hover:bg-[#F27D26] text-white px-4 py-2 rounded-lg font-sans font-bold uppercase tracking-widest text-[10px] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Truck className="h-3.5 w-3.5" /> Live Track Shipment
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-gray-150">
                  <ShoppingBag className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                  <p className="text-gray-950 text-xs font-black uppercase tracking-wider mb-1">No Orders Logged</p>
                  <p className="text-gray-450 text-[11px] mb-4">You have not booked any classic coordinates under this account ledger yet.</p>
                  <button
                    onClick={() => setRoute("collections/all")}
                    className="bg-gray-950 hover:bg-[#F27D26] text-white font-semibold uppercase tracking-wider text-[11px] px-6 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Assemble First Wardrobe
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-950">
                  Address Protocols
                </h3>
                <p className="text-gray-450 text-xs">A listing of validated shipping protocols linked to your profile billing accounts.</p>
              </div>

              {user.phone ? (
                <div className="bg-zinc-50 border border-gray-150 rounded-2xl p-5 space-y-2 text-xs">
                  <div className="flex justify-between font-bold border-b border-gray-150 pb-2">
                    <span className="text-gray-950 uppercase tracking-widest font-mono text-[10px]">Primary Delivery Destination</span>
                    <span className="text-emerald-700 uppercase tracking-widest font-mono text-[9px]">✔ Validated Address</span>
                  </div>
                  <p className="text-gray-800 text-sm font-semibold">{user.displayName || "Sam Sterling"}</p>
                  <p className="text-gray-500 font-light">{user.address || "Bandra West, Link Road"}</p>
                  <p className="text-gray-500 font-light">{user.city || "Mumbai"}, {user.state || "Maharashtra"} - {user.zip || "400050"}</p>
                  <p className="text-gray-400 font-mono">Contact: {user.phone}</p>
                </div>
              ) : (
                <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-gray-150">
                  <MapPin className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-gray-950 text-xs font-bold uppercase tracking-wider mb-1">Pending Calibration</p>
                  <p className="text-gray-450 text-[11px] mb-4">Calibrate your shipping address during your next seamless Cash on Delivery checkouts.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
