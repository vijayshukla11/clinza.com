/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  LogOut, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Printer, 
  RefreshCw, 
  Trash2, 
  Edit, 
  Plus, 
  ChevronRight, 
  Eye, 
  Undo2, 
  HelpCircle, 
  Settings, 
  Camera, 
  Lock,
  Loader2,
  Calendar,
  DollarSign
} from "lucide-react";
import { Order, Product, Address, OrderReturnRequest, ReturnExchangeItem } from "../types";
import { getOrders, getProducts } from "../utils";
import { logOutUser, supabase } from "../supabase";
import { AddressesService, OrderReturnsService, WishlistService, CustomersService } from "../services/supabaseService";

interface AccountPageProps {
  user: any;
  onLogout: () => void;
  setRoute: (route: string) => void;
}

export default function AccountPage({ user, onLogout, setRoute }: AccountPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [returns, setReturns] = useState<OrderReturnRequest[]>([]);
  
  // Navigation active tab
  const [activeSegment, setActiveSegment] = useState<"orders" | "returns" | "addresses" | "wishlist" | "profile">("orders");

  // Loading indicator states
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingReturns, setLoadingReturns] = useState(true);
  
  // Interactive modal / detail overlays
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [returningOrder, setReturningOrder] = useState<Order | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<Order | null>(null);

  // Addresses CRUD form states
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Return/Exchange request form states
  const [returnType, setReturnType] = useState<"return" | "exchange">("return");
  const [selectedReturnItems, setSelectedReturnItems] = useState<{ [productId: string]: boolean }>({});
  const [exchangeSelections, setExchangeSelections] = useState<{ [productId: string]: { size: string; color: string } }>({});
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnImageProof, setReturnImageProof] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Profile Form States
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState({ success: false, message: "" });

  // Load all user data on mount / session change
  useEffect(() => {
    if (!user) return;
    setProfileName(user.displayName || "");
    setProfilePhone(user.phone || "");

    const loadUserData = async () => {
      // 1. Fetch Orders
      setLoadingOrders(true);
      try {
        const allOrders = getOrders();
        const userOrders = allOrders.filter(
          (o) => o.customer.email.trim().toLowerCase() === user.email.trim().toLowerCase()
        );
        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
      } finally {
        setLoadingOrders(false);
      }

      // 2. Fetch Saved Addresses
      setLoadingAddresses(true);
      try {
        const savedAddrs = await AddressesService.getForUser(user.email);
        setAddresses(savedAddrs);
      } catch (err) {
        console.error("Failed to load addresses:", err);
      } finally {
        setLoadingAddresses(false);
      }

      // 3. Fetch Return requests
      setLoadingReturns(true);
      try {
        const userReturns = await OrderReturnsService.getForUser(user.email);
        setReturns(userReturns);
      } catch (err) {
        console.error("Failed to load return requests:", err);
      } finally {
        setLoadingReturns(false);
      }

      // 4. Fetch Wishlist Bookmarks
      try {
        const savedIds = localStorage.getItem("clinza_wishlist_db");
        if (savedIds) {
          const ids = JSON.parse(savedIds) as string[];
          const products = getProducts().filter(p => ids.includes(p.id));
          setWishlist(products);
        }
      } catch {}
    };

    loadUserData();
  }, [user]);

  const handleSignOut = async () => {
    await logOutUser();
    onLogout();
    setRoute("home");
  };

  // Addresses CRUD Methods
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName.trim() || !addrPhone.trim() || !addrLine.trim() || !addrCity.trim() || !addrState.trim() || !addrPincode.trim()) {
      alert("Please fill in all address parameters.");
      return;
    }

    const targetAddress: Address = {
      id: editingAddress?.id || `addr-${Date.now()}`,
      name: addrName.trim(),
      phone: addrPhone.trim(),
      addressLine: addrLine.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      pincode: addrPincode.trim(),
      isDefault: addrIsDefault
    };

    try {
      await AddressesService.save(user.email, targetAddress);
      
      // Reload lists
      const updated = await AddressesService.getForUser(user.email);
      setAddresses(updated);
      
      // Reset form
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
    } catch (err) {
      alert("Error saving your address protocols. Please verify connection.");
    }
  };

  const resetAddressForm = () => {
    setAddrName("");
    setAddrPhone("");
    setAddrLine("");
    setAddrCity("");
    setAddrState("");
    setAddrPincode("");
    setAddrIsDefault(false);
  };

  const handleEditAddressClick = (addr: Address) => {
    setEditingAddress(addr);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrLine(addr.addressLine);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddrIsDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery address?")) return;
    try {
      await AddressesService.delete(id);
      const updated = await AddressesService.getForUser(user.email);
      setAddresses(updated);
    } catch (err) {
      alert("Could not remove address protocol.");
    }
  };

  const handleSetDefaultAddress = async (addr: Address) => {
    try {
      const updatedAddr = { ...addr, isDefault: true };
      await AddressesService.save(user.email, updatedAddr);
      const updatedList = await AddressesService.getForUser(user.email);
      setAddresses(updatedList);
    } catch (err) {
      alert("Could not update default delivery protocols.");
    }
  };

  // Returns / Exchanges Submit
  const handleOpenReturnForm = (order: Order) => {
    setReturningOrder(order);
    setSelectedReturnItems({});
    setExchangeSelections({});
    setReturnReason("");
    setReturnDescription("");
    setReturnImageProof("");
  };

  const toggleItemForReturn = (productId: string) => {
    setSelectedReturnItems(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleExchangeAttrChange = (productId: string, attr: "size" | "color", val: string) => {
    setExchangeSelections(prev => ({
      ...prev,
      [productId]: {
        size: prev[productId]?.size || "M",
        color: prev[productId]?.color || "Default",
        [attr]: val
      }
    }));
  };

  const handleSubmitReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningOrder) return;

    // Filter items selected
    const returnItems: ReturnExchangeItem[] = returningOrder.items
      .filter(item => selectedReturnItems[item.productId])
      .map(item => {
        const exchangeDetail = exchangeSelections[item.productId];
        return {
          productId: item.productId,
          name: item.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          exchangeSize: returnType === "exchange" ? (exchangeDetail?.size || item.size) : undefined,
          exchangeColor: returnType === "exchange" ? (exchangeDetail?.color || item.color) : undefined
        };
      });

    if (returnItems.length === 0) {
      alert("Please select at least one garment item to Return or Exchange.");
      return;
    }
    if (!returnReason) {
      alert("Please select a valid reason for this request.");
      return;
    }

    setSubmittingReturn(true);

    try {
      const returnRequest: OrderReturnRequest = {
        id: `RET-${Date.now().toString().substring(6)}`,
        orderId: returningOrder.id,
        customerEmail: user.email,
        type: returnType,
        items: returnItems,
        reason: returnReason,
        description: returnDescription.trim(),
        imageProofUrl: returnImageProof.trim() || undefined,
        status: "Pending",
        createdAt: new Date().toISOString()
      };

      await OrderReturnsService.create(returnRequest);
      
      // Refresh return tickets list
      const updatedReturns = await OrderReturnsService.getForUser(user.email);
      setReturns(updatedReturns);

      alert(`Your ${returnType.toUpperCase()} request ticket has been filed successfully under ID: ${returnRequest.id}. Our concierge desk will review your details shortly.`);
      setReturningOrder(null);
      setActiveSegment("returns");
    } catch (err) {
      alert("Submission sequence failed. Verify your network coordinates.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Profile Update Function
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileStatus({ success: false, message: "" });

    try {
      // 1. Update Auth details if name changed
      if (profileName.trim() !== (user.displayName || "")) {
        const { error: nameError } = await supabase.auth.updateUser({
          data: { name: profileName.trim(), displayName: profileName.trim() }
        });
        if (nameError) throw nameError;
      }

      // 2. Update Password if provided
      if (profilePassword.trim()) {
        if (profilePassword.trim().length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        const { error: passError } = await supabase.auth.updateUser({
          password: profilePassword.trim()
        });
        if (passError) throw passError;
        setProfilePassword("");
      }

      // 3. Update customer CRM profile row
      const localProfile = await CustomersService.getById(user.id);
      if (localProfile) {
        await CustomersService.update(user.id, {
          name: profileName.trim(),
          phone: profilePhone.trim()
        });
      }

      setProfileStatus({ success: true, message: "Sartorial Profile configuration successfully calibrated!" });
    } catch (err: any) {
      setProfileStatus({ success: false, message: err?.message || "Calibration failure. Verify passwords or formats." });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Print Invoice Handler
  const handlePrintInvoice = (order: Order) => {
    setPrintingInvoice(order);
    setTimeout(() => {
      const invoiceDiv = document.getElementById("invoice-printable-zone");
      if (invoiceDiv) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>CLINZA Invoice #${order.id}</title>
                <style>
                  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1c1917; line-height: 1.5; }
                  .header { display: flex; justify-content: space-between; border-b: 2px solid #e7e5e4; padding-bottom: 20px; margin-bottom: 30px; }
                  .logo { font-size: 24px; font-weight: 900; letter-spacing: 0.15em; font-family: Georgia, serif; }
                  .title { font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em; color: #78716c; }
                  .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; font-size: 13px; }
                  .address-block { background: #fafaf9; border: 1px solid #e7e5e4; padding: 20px; border-radius: 8px; }
                  .address-title { font-weight: bold; text-transform: uppercase; font-size: 10px; tracking: 0.05em; color: #a8a29e; margin-bottom: 8px; }
                  table { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px; }
                  th { background: #f5f5f4; text-align: left; padding: 12px; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
                  td { padding: 12px; border-bottom: 1px solid #e7e5e4; }
                  .totals { float: right; width: 300px; font-size: 13px; }
                  .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
                  .grand-total { border-top: 2px solid #1c1917; font-weight: bold; font-size: 16px; padding-top: 12px; color: #f27d26; }
                  .footer-note { font-size: 11px; text-align: center; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 30px; margin-top: 60px; }
                  @media print {
                    body { padding: 0; }
                  }
                </style>
              </head>
              <body>
                ${invoiceDiv.innerHTML}
                <script>
                  window.onload = function() {
                    window.print();
                    window.close();
                  }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    }, 150);
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
                {profileName ? profileName.substring(0, 2) : user.email.substring(0, 2)}
              </div>
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#F27D26] uppercase font-mono">
                  Sartorial Resident
                </span>
                <h2 className="text-xl font-bold uppercase tracking-tight text-gray-950 truncate max-w-[200px]">
                  {profileName || "Clinza Resident"}
                </h2>
                <p className="text-gray-400 text-xs font-light truncate max-w-[200px]">{user.email}</p>
              </div>
            </div>

            {/* General client details */}
            <div className="border-t border-gray-100 pt-6 space-y-3.5 text-xs text-gray-650">
              <div className="flex justify-between">
                <span className="font-medium text-gray-450">Lector Code:</span>
                <span className="font-mono text-gray-900 font-bold uppercase">USR-{(user.id || "123").substring(0, 6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-450">Phone Contact:</span>
                <span className="text-gray-900 font-medium">{profilePhone || "Not configured"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-450">Access Scope:</span>
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
                onClick={() => setActiveSegment("returns")}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeSegment === "returns" 
                    ? "bg-zinc-950 text-white" 
                    : "bg-zinc-50 text-gray-650 hover:bg-zinc-100"
                }`}
              >
                <Undo2 className="h-4 w-4" /> Returns & Exchanges ({returns.length})
              </button>

              <button
                onClick={() => setActiveSegment("addresses")}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeSegment === "addresses" 
                    ? "bg-zinc-950 text-white" 
                    : "bg-zinc-50 text-gray-650 hover:bg-zinc-100"
                }`}
              >
                <MapPin className="h-4 w-4" /> Address Protocols ({addresses.length})
              </button>

              <button
                onClick={() => setActiveSegment("wishlist")}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeSegment === "wishlist" 
                    ? "bg-zinc-950 text-white" 
                    : "bg-zinc-50 text-gray-650 hover:bg-zinc-100"
                }`}
              >
                <Heart className="h-4 w-4" /> Wardrobe Wishlist ({wishlist.length})
              </button>

              <button
                onClick={() => setActiveSegment("profile")}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeSegment === "profile" 
                    ? "bg-zinc-950 text-white" 
                    : "bg-zinc-50 text-gray-650 hover:bg-zinc-100"
                }`}
              >
                <Settings className="h-4 w-4" /> Identity Settings
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
          
          {/* SEGMENT 1: ORDERED SHIPMENTS */}
          {activeSegment === "orders" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-950">
                  Tracking Ordered Coordinates ({orders.length})
                </h3>
                <p className="text-gray-450 text-xs">A comprehensive inventory ledger of your coordinates loomed through Cash on Delivery booking.</p>
              </div>

              {loadingOrders ? (
                <div className="text-center py-16">
                  <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500 text-xs font-mono uppercase">Retrieving your order ledger...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm bg-zinc-50/50 transition hover:shadow-md">
                      
                      {/* Order Top Bar */}
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
                              : ["Shipped", "Out For Delivery"].includes(order.status) ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="p-5 divide-y divide-gray-100">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 text-xs sm:text-sm">
                            <img 
                              src={it.image ? it.image : "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=100"} 
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

                      {/* Logistics Tracking Timeline (Animated / Interactive) */}
                      {viewingOrder?.id === order.id && (
                        <div className="px-5 pb-5 pt-2 bg-white border-t border-gray-100 space-y-4 animate-fade-in">
                          <h4 className="text-[10px] font-bold uppercase text-gray-400 font-mono tracking-wider">Logistics Dispatch Milestones:</h4>
                          
                          {/* Animated Timeline circles */}
                          <div className="relative pl-6 border-l border-[#F27D26]/20 space-y-4 py-1">
                            {order.trackingHistory?.map((step, sIdx) => (
                              <div key={sIdx} className="relative text-xs">
                                <span className="absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full bg-[#F27D26] border-2 border-white ring-1 ring-[#F27D26]/40 flex items-center justify-center">
                                  <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
                                </span>
                                <div className="space-y-0.5">
                                  <div className="flex gap-2 items-center">
                                    <span className="font-extrabold text-gray-950 uppercase font-mono tracking-tight text-[10px] bg-zinc-100 px-2 py-0.5 rounded-sm">{step.status}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">{new Date(step.timestamp).toLocaleString("en-IN")}</span>
                                  </div>
                                  <p className="text-gray-600 font-medium">{step.description}</p>
                                </div>
                              </div>
                            ))}
                            {(!order.trackingHistory || order.trackingHistory.length === 0) && (
                              <div className="text-gray-400 text-xs italic">Awaiting carrier dispatch synchronization.</div>
                            )}
                          </div>

                          {/* Courier partner details and deep-linking */}
                          {order.trackingNumber && (
                            <div className="p-3 bg-zinc-50 rounded-xl border border-gray-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-xs text-gray-650 font-mono">
                              <div>
                                <span className="text-gray-400 text-[10px] uppercase font-bold">Courier Dock Details:</span>
                                <p className="text-gray-900 font-extrabold">{order.courierPartner || "Shiprocket Express"}</p>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[10px] uppercase font-bold">AWB Docket:</span>
                                <p className="text-[#F27D26] font-bold uppercase tracking-widest">{order.trackingNumber}</p>
                              </div>
                              <a 
                                href={
                                  order.courierPartner?.toLowerCase().includes("delhivery") 
                                    ? `https://www.delhivery.com/track/share?awb=${order.trackingNumber}` 
                                    : `https://track.shiprocket.co/tracking/${order.trackingNumber}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#F27D26] text-white font-sans text-[10px] font-extrabold px-3 py-1.5 rounded uppercase tracking-wider hover:bg-zinc-950 transition"
                              >
                                Deep Track Docket ↗
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Total Amount & Tracking Actions */}
                      <div className="bg-zinc-50 border-t border-gray-100 px-5 py-4 flex flex-wrap justify-between items-center gap-3 text-xs">
                        <p className="text-gray-550">
                          Invoice Total: <strong className="font-black text-gray-950 font-sans">₹{order.totalAmount.toLocaleString("en-IN")} (COD)</strong>
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handlePrintInvoice(order)}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-3 py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Printer className="h-3.5 w-3.5" /> Invoice
                          </button>

                          {order.status === "Delivered" && (
                            <button
                              onClick={() => handleOpenReturnForm(order)}
                              className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#F27D26] px-3.5 py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Undo2 className="h-3.5 w-3.5" /> Return / Exchange
                            </button>
                          )}

                          <button
                            onClick={() => setViewingOrder(viewingOrder?.id === order.id ? null : order)}
                            className="bg-zinc-950 hover:bg-[#F27D26] text-white px-4 py-2 rounded-lg font-sans font-bold uppercase tracking-widest text-[10px] transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Truck className="h-3.5 w-3.5 animate-pulse" /> 
                            {viewingOrder?.id === order.id ? "Hide Track History" : "Live Track Shipment"}
                          </button>
                        </div>
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
          )}

          {/* SEGMENT 2: RETURNS & EXCHANGES TICKETS LIST */}
          {activeSegment === "returns" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-950">
                  Returns & Exchanges Tickets ({returns.length})
                </h3>
                <p className="text-gray-450 text-xs">Verify status coordinates and courier logs of active replacement requests.</p>
              </div>

              {loadingReturns ? (
                <div className="text-center py-16">
                  <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500 text-xs font-mono uppercase">Retrieving ticket history...</p>
                </div>
              ) : returns.length > 0 ? (
                <div className="space-y-5">
                  {returns.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-150 bg-zinc-50/20 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black tracking-widest text-[#F27D26] uppercase font-mono bg-orange-100/60 px-2 py-0.5 rounded">
                            {ticket.type} Ticket
                          </span>
                          <h4 className="text-sm font-bold uppercase tracking-tight text-gray-950 font-mono">
                            Ticket #{ticket.id}
                          </h4>
                          <p className="text-gray-400 text-[10px] font-mono">Linked to Order ID: <strong className="font-semibold text-gray-800">{ticket.orderId}</strong></p>
                        </div>
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono ${
                            ticket.status === "Refunded" || ticket.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : ticket.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700 animate-pulse"
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="space-y-2.5">
                        <p className="text-[10px] font-bold text-gray-400 font-mono uppercase">Ticket Garment Items:</p>
                        {ticket.items.map((it, idx) => (
                          <div key={idx} className="flex gap-3 text-xs items-center">
                            <img src={it.image} alt="" className="h-10 w-8 object-cover rounded bg-zinc-100 border border-gray-200" />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-gray-900 truncate uppercase">{it.name}</h5>
                              <p className="text-gray-500 text-[10px]">
                                Original Size: <strong>{it.size}</strong> • original Color: <strong>{it.color}</strong>
                              </p>
                              {ticket.type === "exchange" && (
                                <p className="text-[#F27D26] text-[10px] font-bold">
                                  → Exchange for size: <strong>{it.exchangeSize || "M"}</strong>, color: <strong>{it.exchangeColor || "Default"}</strong>
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-gray-700 font-bold">₹{it.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reason details */}
                      <div className="p-3.5 bg-white border border-gray-150 rounded-xl space-y-1.5 text-xs text-gray-650">
                        <p className="font-bold text-gray-800">Reason: <span className="font-medium text-gray-600">{ticket.reason}</span></p>
                        {ticket.description && (
                          <p className="italic text-gray-500 font-light font-sans">"{ticket.description}"</p>
                        )}
                        {ticket.imageProofUrl && (
                          <div className="pt-2">
                            <a href={ticket.imageProofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-[10px] flex items-center gap-1">
                              <Camera className="h-3.5 w-3.5" /> View Uploaded Proof Reference ↗
                            </a>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-gray-150">
                  <Undo2 className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                  <p className="text-gray-950 text-xs font-black uppercase tracking-wider mb-1">No Active Tickets</p>
                  <p className="text-gray-450 text-[11px] mb-4">You have not submitted any Return or Exchange tickets yet.</p>
                </div>
              )}
            </div>
          )}

          {/* SEGMENT 3: ADDRESS PROTOCOLS (SAVED ADDRESSES) */}
          {activeSegment === "addresses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-gray-950">
                    Address Protocols
                  </h3>
                  <p className="text-gray-450 text-xs">Manage your validated billing and shipping destination accounts.</p>
                </div>
                {!showAddressForm && (
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      resetAddressForm();
                      setShowAddressForm(true);
                    }}
                    className="bg-zinc-950 hover:bg-[#F27D26] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add Protocol
                  </button>
                )}
              </div>

              {/* Saved Address Book CRUD Form */}
              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="bg-zinc-50 border border-gray-150 rounded-2xl p-6 space-y-4 animate-fade-in text-xs">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                    <span className="font-bold uppercase tracking-wider text-gray-800 font-mono text-[10px]">
                      {editingAddress ? "EDIT SHIPPING PROTOCOL" : "NEW SHIPPING PROTOCOL"}
                    </span>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                        resetAddressForm();
                      }}
                      className="text-gray-400 hover:text-gray-900 font-extrabold uppercase font-mono text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500 font-mono">Recipient Full Name</label>
                      <input 
                        type="text"
                        placeholder="Sam Sterling"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500 font-mono">Contact Number</label>
                      <input 
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500 font-mono">Street Address / Locality</label>
                    <input 
                      type="text"
                      placeholder="Flat, Wing, Building Name, Link Road, Bandra West"
                      value={addrLine}
                      onChange={(e) => setAddrLine(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500 font-mono">City</label>
                      <input 
                        type="text"
                        placeholder="Mumbai"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500 font-mono">State</label>
                      <input 
                        type="text"
                        placeholder="Maharashtra"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500 font-mono">Pincode</label>
                      <input 
                        type="text"
                        placeholder="400050"
                        value={addrPincode}
                        onChange={(e) => setAddrPincode(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-900 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox"
                      id="addr-default-chk"
                      checked={addrIsDefault}
                      onChange={(e) => setAddrIsDefault(e.target.checked)}
                      className="h-4 w-4 text-[#F27D26] focus:ring-[#F27D26] border-gray-300 rounded"
                    />
                    <label htmlFor="addr-default-chk" className="text-gray-700 font-medium cursor-pointer">
                      Establish as Primary Delivery Destination (Default)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="bg-zinc-950 hover:bg-[#F27D26] text-white px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Confirm Shipping Coordinates <ChevronRight className="h-4 w-4" />
                  </button>
                </form>
              )}

              {/* Addresses List Display */}
              {loadingAddresses ? (
                <div className="text-center py-16">
                  <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500 text-xs font-mono uppercase">Syncing Address book...</p>
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className={`border rounded-2xl p-5 space-y-3 relative flex flex-col justify-between transition hover:shadow-md ${
                        addr.isDefault 
                          ? "border-[#F27D26] bg-orange-50/5" 
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-950 text-sm">{addr.name}</h4>
                          {addr.isDefault ? (
                            <span className="text-emerald-700 font-bold uppercase tracking-widest font-mono text-[9px] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              Primary
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetDefaultAddress(addr)}
                              className="text-gray-450 hover:text-[#F27D26] font-bold uppercase tracking-wider font-mono text-[8.5px] border border-gray-200 px-2 py-0.5 rounded"
                            >
                              Set Primary
                            </button>
                          )}
                        </div>
                        <p className="text-gray-650 leading-relaxed font-sans">{addr.addressLine}</p>
                        <p className="text-gray-650 leading-relaxed font-sans">
                          {addr.city}, {addr.state} - <strong className="font-bold text-gray-800 font-mono">{addr.pincode}</strong>
                        </p>
                        <p className="text-gray-400 font-mono pt-1">Phone: {addr.phone}</p>
                      </div>

                      <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-3 text-[10px] font-bold font-mono uppercase tracking-wider">
                        <button
                          onClick={() => handleEditAddressClick(addr)}
                          className="text-gray-600 hover:text-[#F27D26] flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-gray-150">
                  <MapPin className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-gray-950 text-xs font-bold uppercase tracking-wider mb-1">Pending Calibration</p>
                  <p className="text-gray-450 text-[11px] mb-4">No custom shipping addresses configured under this identity key.</p>
                </div>
              )}
            </div>
          )}

          {/* SEGMENT 4: WARDROBE WISHLIST */}
          {activeSegment === "wishlist" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-950">
                  Wardrobe Wishlist Bookmarks ({wishlist.length})
                </h3>
                <p className="text-gray-450 text-xs">A gallery of garment pieces you have flagged for eventual wardrobe acquisition.</p>
              </div>

              {wishlist.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {wishlist.map((prod) => (
                    <div key={prod.id} className="border border-gray-150 rounded-2xl overflow-hidden group bg-white transition hover:shadow-md text-xs relative">
                      <img 
                        src={prod.images ? prod.images[0] : "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=300"} 
                        alt={prod.name}
                        className="w-full h-44 object-cover object-top group-hover:scale-102 transition duration-300"
                      />
                      <div className="p-3.5 space-y-1.5 text-left">
                        <span className="text-[9px] font-black tracking-widest text-[#F27D26] uppercase font-mono">{prod.category}</span>
                        <h4 className="font-extrabold text-zinc-950 truncate uppercase text-[11px] leading-tight">{prod.name}</h4>
                        <p className="font-mono font-bold text-gray-900">₹{prod.price.toLocaleString("en-IN")}</p>
                        
                        <button
                          onClick={() => {
                            // Deep link to product detailed page
                            setRoute(`product/${prod.slug}`);
                          }}
                          className="w-full bg-zinc-950 hover:bg-[#F27D26] text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" /> Inspect Design
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-gray-150">
                  <Heart className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                  <p className="text-gray-950 text-xs font-black uppercase tracking-wider mb-1">Wishlist Empty</p>
                  <p className="text-gray-450 text-[11px] mb-4">Bookmarked garments will assemble here for priority checkout.</p>
                  <button
                    onClick={() => setRoute("collections/all")}
                    className="bg-gray-950 hover:bg-[#F27D26] text-white font-semibold uppercase tracking-wider text-[11px] px-6 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Browse Catalog Departments
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SEGMENT 5: IDENTITY SETTINGS (PROFILE EDIT & PASSWORDS) */}
          {activeSegment === "profile" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-950">
                  Identity Settings & Key Calibration
                </h3>
                <p className="text-gray-450 text-xs">Verify profile credentials and authenticate security passwords.</p>
              </div>

              {profileStatus.message && (
                <div className={`p-4 rounded-xl border text-xs leading-relaxed font-bold flex items-center gap-2 ${
                  profileStatus.success 
                    ? "bg-green-50 border-green-150 text-green-750" 
                    : "bg-red-50 border-red-150 text-red-750"
                }`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> {profileStatus.message}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500 font-mono">Profile Display Name</label>
                    <input 
                      type="text"
                      placeholder="Sam Sterling"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-950 font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500 font-mono">Security Registered Email (Locked)</label>
                    <input 
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-zinc-100 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none cursor-not-allowed text-gray-500 font-mono"
                    />
                    <span className="text-[9px] text-gray-400 font-mono block">* Managed via Supabase OAuth authorization rules.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500 font-mono">Contact Helpline Phone</label>
                    <input 
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-950 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500 font-mono">Update Access Password</label>
                    <input 
                      type="password"
                      placeholder="Enter new master key password..."
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      className="w-full bg-zinc-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-[#F27D26] text-gray-950 font-mono"
                      minLength={6}
                    />
                    <span className="text-[9px] text-gray-400 font-sans block">* Leave entirely blank to retain current access codes.</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="bg-zinc-950 hover:bg-[#F27D26] text-white px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {updatingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Calibrating Identity Parameters...
                    </>
                  ) : (
                    <>
                      Save Profile Calibration <ChevronRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* RETURN & EXCHANGE SUBMISSION MODAL POPUP */}
      {returningOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-left text-xs text-gray-700 animate-fade-in">
          <div className="bg-white rounded-3xl border max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3.5">
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#F27D26] uppercase font-mono block">Order Return & Exchange Portal</span>
                <h3 className="text-lg font-black uppercase text-gray-950 font-mono">
                  Order ID: {returningOrder.id}
                </h3>
              </div>
              <button 
                onClick={() => setReturningOrder(null)}
                className="h-8 w-8 bg-zinc-100 hover:bg-zinc-200 rounded-full flex items-center justify-center font-bold text-gray-700 cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReturnRequest} className="space-y-5">
              
              {/* Type Switcher */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 font-mono block">Action Type Required</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReturnType("return")}
                    className={`py-3 px-4 rounded-xl border text-center font-bold uppercase tracking-wider cursor-pointer transition ${
                      returnType === "return"
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-gray-200 bg-zinc-50 text-gray-650 hover:bg-zinc-100"
                    }`}
                  >
                    Return & Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnType("exchange")}
                    className={`py-3 px-4 rounded-xl border text-center font-bold uppercase tracking-wider cursor-pointer transition ${
                      returnType === "exchange"
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-gray-200 bg-zinc-50 text-gray-650 hover:bg-zinc-100"
                    }`}
                  >
                    Exchange Size / Color
                  </button>
                </div>
                <p className="text-gray-400 text-[10px] pt-1">
                  {returnType === "return" 
                    ? "* Standard pickup scheduled at default address. Refund disbursed upon product health verification."
                    : "* Swap clothing sizing or colors. Free replacement delivery scheduled once pickup resolves."
                  }
                </p>
              </div>

              {/* Items List Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500 font-mono block">Select Garment Items to Process:</label>
                <div className="divide-y border rounded-2xl bg-zinc-50/50 p-4 divide-gray-200 space-y-2.5">
                  {returningOrder.items.map((it) => {
                    const isChecked = !!selectedReturnItems[it.productId];
                    return (
                      <div key={it.productId} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            id={`ret-check-${it.productId}`}
                            checked={isChecked}
                            onChange={() => toggleItemForReturn(it.productId)}
                            className="h-4 w-4 text-[#F27D26] focus:ring-[#F27D26] border-gray-300 rounded cursor-pointer"
                          />
                          <img src={it.image} alt="" className="h-12 w-10 object-cover rounded bg-white border" />
                          <label htmlFor={`ret-check-${it.productId}`} className="flex-1 min-w-0 font-bold text-gray-900 cursor-pointer uppercase text-xs">
                            {it.name}
                            <span className="text-[10px] text-gray-500 font-medium font-sans block">
                              Size: {it.size} • Color: {it.color} • Qty: {it.quantity}
                            </span>
                          </label>
                        </div>

                        {/* Exchange Attributes Configuration options if selected */}
                        {isChecked && returnType === "exchange" && (
                          <div className="ml-7 grid grid-cols-2 gap-3 p-3 bg-white border border-gray-200 rounded-xl animate-fade-in text-xs">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-gray-400 font-mono block">Select New Size</label>
                              <select
                                value={exchangeSelections[it.productId]?.size || it.size}
                                onChange={(e) => handleExchangeAttrChange(it.productId, "size", e.target.value)}
                                className="w-full border rounded p-1.5 font-bold focus:outline-none text-zinc-800"
                              >
                                <option value="S">S - Athletic Regular</option>
                                <option value="M">M - Athletic Regular</option>
                                <option value="L">L - Athletic Regular</option>
                                <option value="XL">XL - Athletic Regular</option>
                                <option value="XXL">XXL - Athletic Regular</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-gray-400 font-mono block">Select New Color</label>
                              <input 
                                type="text"
                                placeholder="e.g. Indigo, Navy"
                                value={exchangeSelections[it.productId]?.color || it.color}
                                onChange={(e) => handleExchangeAttrChange(it.productId, "color", e.target.value)}
                                className="w-full border rounded p-1 font-semibold focus:outline-none text-zinc-800"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sizing swap / Reason codes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500 font-mono block">Select Principal Reason</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full border rounded-xl py-3 px-4 font-semibold text-gray-900 bg-zinc-50 focus:outline-none"
                    required
                  >
                    <option value="">-- SELECT REASON CODE --</option>
                    <option value="Sizing - Garment too Tight">Sizing - Garment too Tight</option>
                    <option value="Sizing - Garment too Loose">Sizing - Garment too Loose</option>
                    <option value="Quality - Defective Fabrics/Crease">Quality - Defective Fabrics/Crease</option>
                    <option value="Dispatch Error - Incorrect item received">Dispatch Error - Incorrect item received</option>
                    <option value="Vibe - Different from catalog pictures">Vibe - Different from catalog pictures</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-500 font-mono block">Supportive Image Proof URL (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. https://imgur.com/your-proof.jpg"
                    value={returnImageProof}
                    onChange={(e) => setReturnImageProof(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none text-gray-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 font-mono block">Detailed Description / Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Provide supporting details regarding fabric quality or custom courier pick-up requirements..."
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none text-gray-900 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReturn}
                className="w-full bg-zinc-950 hover:bg-[#F27D26] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {submittingReturn ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                    Submitting Concierge Ticket...
                  </>
                ) : (
                  <>
                    Submit Return/Exchange Coordinates
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* INVOICE HIDDEN Printable Zone (Rendered off-screen for print injection) */}
      <div className="hidden">
        {printingInvoice && (
          <div id="invoice-printable-zone">
            <div className="header">
              <div>
                <div className="logo">CLINZA</div>
                <div style={{ fontSize: "11px", color: "#78716c", marginTop: "4px" }}>Premium Apparel Ltd.</div>
                <div style={{ fontSize: "11px", color: "#78716c" }}>Mumbai, India</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="title">TAX INVOICE</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", marginTop: "8px" }}>Invoice ID: #{printingInvoice.id}</div>
                <div style={{ fontSize: "11px", color: "#78716c", marginTop: "2px" }}>
                  Date: {new Date(printingInvoice.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric", month: "short", day: "numeric"
                  })}
                </div>
              </div>
            </div>

            <div className="grid">
              <div className="address-block">
                <div className="address-title">Billing Details</div>
                <div style={{ fontWeight: "bold" }}>{printingInvoice.customer.name}</div>
                <div>{printingInvoice.customer.address}</div>
                <div>{printingInvoice.customer.city}, {printingInvoice.customer.state} - {printingInvoice.customer.pincode}</div>
                <div style={{ marginTop: "6px", fontFamily: "monospace", fontSize: "11px" }}>Email: {printingInvoice.customer.email}</div>
                <div style={{ fontFamily: "monospace", fontSize: "11px" }}>Phone: {printingInvoice.customer.phone}</div>
              </div>
              <div className="address-block">
                <div className="address-title">Shipping Coordinates</div>
                <div style={{ fontWeight: "bold" }}>{printingInvoice.customer.name}</div>
                <div>{printingInvoice.customer.address}</div>
                <div>{printingInvoice.customer.city}, {printingInvoice.customer.state} - {printingInvoice.customer.pincode}</div>
                <div style={{ marginTop: "6px", fontSize: "11px", color: "#78716c", fontWeight: "bold" }}>Payment Model: CASH ON DELIVERY (COD)</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>S.No</th>
                  <th style={{ width: "50%" }}>Garment Apparel Description</th>
                  <th style={{ width: "15%", textAlign: "right" }}>Price</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
                  <th style={{ width: "15%", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {printingInvoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                      {it.name}
                      <div style={{ fontSize: "10px", color: "#78716c", fontWeight: "normal", textTransform: "none", marginTop: "2px" }}>
                        Size: {it.size} | Color: {it.color}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace" }}>₹{it.price.toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "center" }}>{it.quantity}</td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: "bold" }}>₹{(it.price * it.quantity).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ width: "100%", display: "flow-root" }}>
              <div className="totals">
                <div className="totals-row">
                  <span>Subtotal:</span>
                  <span style={{ fontFamily: "monospace" }}>₹{(printingInvoice.totalAmount - (printingInvoice.totalAmount * 0.05)).toLocaleString("en-IN")}</span>
                </div>
                <div className="totals-row">
                  <span>GST (CGST @ 2.5% + SGST @ 2.5%):</span>
                  <span style={{ fontFamily: "monospace" }}>₹{(printingInvoice.totalAmount * 0.05).toLocaleString("en-IN")}</span>
                </div>
                <div className="totals-row grand-total">
                  <span>Grand Total (Paid via COD):</span>
                  <span style={{ fontFamily: "monospace" }}>₹{printingInvoice.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="footer-note">
              <p style={{ fontWeight: "bold" }}>Thank you for shopping at CLINZA Luxury Fashion!</p>
              <p>For any sizing alterations or query coordinates, contact concierge@clinza.com or WhatsApp +91 72085 72688.</p>
              <p style={{ fontSize: "9px", color: "#d6d3d1", marginTop: "12px" }}>This is a computer generated tax invoice. No physical seal or authorized signoff required.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
