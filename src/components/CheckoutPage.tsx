/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck, Mail, MapPin, Phone, User, Landmark, HelpCircle } from "lucide-react";
import { Order, CartItem } from "../types";
import { createOrder } from "../utils";

interface CheckoutPageProps {
  cart: CartItem[];
  checkoutSummary: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    appliedCoupon: string | null;
  };
  setRoute: (route: string) => void;
  onOrderSuccess: (order: Order) => void;
}

export default function CheckoutPage({
  cart,
  checkoutSummary,
  setRoute,
  onOrderSuccess
}: CheckoutPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Maharashtra",
    country: "India",
    pincode: ""
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const indianStates = [
    "Andhra Pradesh", "Karnataka", "Kerala", "Tamil Nadu", "Telangana",
    "Maharashtra", "Gujarat", "Rajasthan", "Madhya Pradesh", "Goa",
    "Delhi", "Haryana", "Punjab", "Uttar Pradesh", "West Bengal"
  ];

  const handleInputChange = (e: React.ChangeEventHTMLInputElement | React.ChangeEventHTMLSelectElement) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error
    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Full Customer Name is required.";
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s\-]/g, ""))) {
      errors.phone = "Provide a valid 10-digit Indian phone number.";
    }
    if (!formData.email.trim()) {
      errors.email = "Email mailbox address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Provide a correct email syntax (e.g. name@domain.com).";
    }
    if (!formData.address.trim()) errors.address = "Detailed delivery address is required.";
    if (!formData.city.trim()) errors.city = "City is required.";
    if (!formData.pincode.trim()) {
      errors.pincode = "Postal pincode is required.";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = "Indian Pincodes must be exactly 6 digits.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrderSubmit = (e: React.FormEventHTML) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsPlacingOrder(true);

    // Simulate luxury packing delays
    setTimeout(() => {
      try {
        const orderItems = cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          image: item.product.images[0]
        }));

        const orderDraftInfo = {
          customer: {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state,
            country: formData.country,
            pincode: formData.pincode.trim()
          },
          items: orderItems,
          totalAmount: checkoutSummary.total,
          paymentMethod: "COD" as const
        };

        const finalizedOrder = createOrder(orderDraftInfo);
        onOrderSuccess(finalizedOrder);
      } catch (err) {
        console.error(err);
        setFormErrors({ submit: "Failed to store order in database context." });
      } finally {
        setIsPlacingOrder(false);
      }
    }, 1200);
  };

  return (
    <section id="clinza-checkout-page" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen text-left">
      <div className="max-w-7xl mx-auto">
        
        {/* BACK BUTTON */}
        <button
          id="checkout-back-btn"
          onClick={() => setRoute("cart")}
          className="group flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest text-zinc-500 hover:text-gray-950 uppercase mb-8 focus:outline-none cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
          Review Shopping Bag
        </button>

        <h1 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-gray-950 uppercase mb-10 select-none">
          COD Delivery Desk
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SHIPPING ADDRESS FORM (7 Columns) */}
          <form id="checkout-form" onSubmit={handlePlaceOrderSubmit} className="lg:col-span-7 bg-white border border-gray-150 p-6 md:p-8 rounded-2xl shadow-xs space-y-6">
            <h3 className="text-sm font-bold tracking-wider text-gray-900 uppercase border-b border-gray-100 pb-3 flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-orange-600" /> Customer Information & Shipping address
            </h3>

            {/* FULL NAME */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-450 mb-1.5 font-mono select-none">
                Customer Name
              </label>
              <div className="relative">
                <input
                  id="checkout-name-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Samarth Nair"
                  className={`w-full bg-gray-50 border py-3.5 pl-11 pr-4 rounded-xl text-xs font-semibold focus:outline-none placeholder-gray-450 text-gray-800 ${
                    formErrors.name ? "border-red-500 focus:border-red-500" : "border-gray-250 focus:border-orange-500"
                  }`}
                />
                <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-450" />
              </div>
              {formErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1.5">{formErrors.name}</p>}
            </div>

            {/* PHONE & EMAIL TWOS-ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-450 mb-1.5 font-mono select-none">
                  Mobile Number (India)
                </label>
                <div className="relative">
                  <input
                    id="checkout-phone-input"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit number e.g. 9812345678"
                    className={`w-full bg-gray-50 border py-3.5 pl-11 pr-4 rounded-xl text-xs font-semibold focus:outline-none placeholder-gray-450 text-gray-800 ${
                      formErrors.phone ? "border-red-500" : "border-gray-250 focus:border-orange-500"
                    }`}
                  />
                  <Phone className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-450" />
                </div>
                {formErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1.5">{formErrors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-450 mb-1.5 font-mono select-none">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="checkout-email-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. sam@gmail.com"
                    className={`w-full bg-gray-50 border py-3.5 pl-11 pr-4 rounded-xl text-xs font-semibold focus:outline-none placeholder-gray-450 text-gray-800 ${
                      formErrors.email ? "border-red-500" : "border-gray-250 focus:border-orange-500"
                    }`}
                  />
                  <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-gray-450" />
                </div>
                {formErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1.5">{formErrors.email}</p>}
              </div>
            </div>

            {/* DETAILED STREET ADDRESS */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-450 mb-1.5 font-mono select-none">
                Street Address / Apartment, Suit
              </label>
              <textarea
                id="checkout-address-input"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Apartment building, sector, landmarks and street coordinates detailed."
                className={`w-full bg-gray-50 border p-4 rounded-xl text-xs font-semibold focus:outline-none placeholder-gray-450 text-gray-800 ${
                  formErrors.address ? "border-red-500" : "border-gray-250 focus:border-orange-500"
                }`}
              />
              {formErrors.address && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.address}</p>}
            </div>

            {/* CITY & STATE & PINCODE ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-450 mb-1.5 font-mono select-none">
                  Town / City
                </label>
                <input
                  id="checkout-city-input"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Mumbai"
                  className={`w-full bg-gray-50 border py-3.5 px-4 rounded-xl text-xs font-semibold focus:outline-none placeholder-gray-450 text-gray-800 ${
                    formErrors.city ? "border-red-500" : "border-gray-250 focus:border-orange-500"
                  }`}
                />
                {formErrors.city && <p className="text-[10px] text-red-500 font-bold mt-1.5">{formErrors.city}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-450 mb-1.5 font-mono select-none">
                  State / Territory
                </label>
                <select
                  id="checkout-state-select"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-250 py-3.5 px-4 rounded-xl text-xs font-semibold focus:outline-none text-gray-800 focus:border-orange-500"
                >
                  {indianStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-450 mb-1.5 font-mono select-none">
                  6-Digit Pincode
                </label>
                <input
                  id="checkout-pincode-input"
                  type="text"
                  name="pincode"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 400001"
                  className={`w-full bg-gray-50 border py-3.5 px-4 rounded-xl text-xs font-semibold focus:outline-none placeholder-gray-450 text-gray-800 ${
                    formErrors.pincode ? "border-red-500" : "border-gray-250 focus:border-orange-500"
                  }`}
                />
                {formErrors.pincode && <p className="text-[10px] text-red-500 font-bold mt-1.5">{formErrors.pincode}</p>}
              </div>
            </div>

            {/* ORDER FAILURE ERRORS */}
            {formErrors.submit && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs font-bold font-sans">
                {formErrors.submit}
              </div>
            )}
          </form>

          {/* RIGHT: BILLING MATRIX ORDER REVEAL (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* IN BAG ITEMS */}
            <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs">
              <h3 className="text-xs font-extrabold tracking-widest text-gray-400 uppercase mb-4 select-none">
                Items in wardrobe ({cart.reduce((s, c) => s + c.quantity, 0)})
              </h3>

              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto mb-4 border-b border-gray-100 pb-3">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-3 py-3 items-center">
                    <img src={item.product.images[0]} alt="" className="h-12 w-9 rounded object-cover bg-gray-50 shrink-0 border border-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate leading-tight">{item.product.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono tracking-wider mt-0.5">SIZE {item.selectedSize} • QTY {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-950 font-serif">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              {/* PAYMENT OPTION METHOD */}
              <div className="bg-orange-600/5 border border-orange-600/15 p-4 rounded-xl mb-4 text-left">
                <span className="text-[9px] font-black font-mono tracking-widest text-orange-650 uppercase bg-orange-600/10 px-2 py-0.5 rounded">
                  Eligible Method
                </span>
                <p className="text-xs font-extrabold text-gray-900 mt-1.5 flex items-center gap-1">
                  Cash On Delivery Only (COD)
                </p>
                <p className="text-[10px] text-gray-500 leading-normal mt-1">
                  Pay directly to our delivery executive in cash or via scanning India Unified Payments Interface (UPI) codes at your doorstep. No prepayment risk whatsoever!
                </p>
              </div>

              {/* MATH SUMMARY */}
              <div className="space-y-2.5 pb-4 border-t border-gray-150 pt-4 text-xs font-sans font-medium text-gray-650">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span>₹{checkoutSummary.subtotal.toLocaleString("en-IN")}</span>
                </div>
                {checkoutSummary.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Coupon Savings</span>
                    <span>- ₹{checkoutSummary.discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>standard textile GST (5%)</span>
                  <span>₹{checkoutSummary.tax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold">
                  <span>COD Delivery Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 text-gray-950">
                  <span className="font-bold uppercase text-[10px] tracking-wider">Total</span>
                  <span className="text-xl font-black font-serif">₹{checkoutSummary.total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* PLACE ORDER */}
              <button
                id="checkout-submit-order"
                onClick={handlePlaceOrderSubmit}
                disabled={isPlacingOrder}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-350 disabled:cursor-not-allowed text-white font-sans text-xs font-extrabold uppercase tracking-[0.25em] py-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-550/20"
              >
                {isPlacingOrder ? "Processing..." : "Place COD Order Now"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
