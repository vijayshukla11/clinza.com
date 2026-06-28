/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Trash2, ShoppingBag, ArrowRight, Tag, Percent, ArrowLeft, RefreshCw } from "lucide-react";
import { CartItem } from "../types";

interface CartPageProps {
  cart: CartItem[];
  onUpdateQty: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  setRoute: (route: string) => void;
  onCheckout: (subtotal: number, discount: number, tax: number, total: number, appliedCoupon: string | null) => void;
}

export default function CartPage({
  cart,
  onUpdateQty,
  onRemoveItem,
  setRoute,
  onCheckout
}: CartPageProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ status: "success" | "error"; text: string } | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Math totals calculation
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const baseForTax = subtotal - discountAmount;
  const standardGST = Math.round(baseForTax * 0.05); // Standard textile GST 5%
  const shippingCharge = baseForTax > 1500 ? 0 : 150; // Free shipping over ₹1500
  const grandTotal = baseForTax + standardGST + shippingCharge;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMsg({ status: "error", text: "Please enter a valid coupon code." });
      return;
    }
    
    if (code === "CLINZA10") {
      setDiscountPercent(10);
      setAppliedCoupon("CLINZA10");
      setCouponMsg({ status: "success", text: "CLINZA10 applied successfully! Enjoy 10% off your wardrobe order." });
    } else if (code === "LUXURY20") {
      if (subtotal < 4000) {
        setCouponMsg({ status: "error", text: "Code LUXURY20 is applicable only on orders above ₹4,000." });
        return;
      }
      setDiscountPercent(20);
      setAppliedCoupon("LUXURY20");
      setCouponMsg({ status: "success", text: "LUXURY20 applied! Premium 20% savings credited." });
    } else {
      setCouponMsg({ status: "error", text: "That coupon code was not found or is expired." });
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountPercent(0);
    setAppliedCoupon(null);
    setCouponMsg(null);
    setCouponCode("");
  };

  const handleProceedToCheckout = () => {
    onCheckout(subtotal, discountAmount, standardGST, grandTotal, appliedCoupon);
  };

  if (cart.length === 0) {
    return (
      <section id="empty-cart-view" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-[70vh] flex flex-col items-center justify-center">
        <div className="max-w-md text-center p-8 bg-white rounded-2xl border border-gray-150 shadow-sm flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-orange-600/5 text-orange-600 flex items-center justify-center mb-6">
            <ShoppingBag className="h-6 w-6 stroke-[2]" />
          </div>
          <h3 className="text-lg font-sans font-black uppercase tracking-tight text-gray-900 mb-2">
            Your Shopping Bag is Completely Empty
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm font-sans mb-8">
            Take a look around our premium shirts, unwashed selvedge raw denims, and handcrafted suede boots to build your look.
          </p>
          <button
            id="empty-cart-shop-btn"
            onClick={() => setRoute("collections/all")}
            className="w-full bg-gray-950 hover:bg-orange-600 text-white font-sans text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Explore Wardrobe
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="clinza-cart-page" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen text-left">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3.5xl font-sans font-black tracking-tight text-gray-950 uppercase mb-8">
          Your Shopping Bag ({cart.length} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: LIST OF CART ITEMS (8 Columns) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item, idx) => (
              <div
                id={`cart-item-${idx}`}
                key={`${item.product.id}-${idx}`}
                className="bg-white border border-gray-150 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row gap-5 items-stretch relative shadow-xs"
              >
                {/* Product Image */}
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-28 w-20 object-cover rounded-lg bg-gray-50 self-center sm:self-auto shrink-0 border border-gray-100"
                />

                {/* Info and Actions */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <h3
                        id={`cart-item-name-${idx}`}
                        onClick={() => setRoute(`product/${item.product.slug}`)}
                        className="text-gray-950 hover:text-orange-600 text-xs sm:text-sm font-bold tracking-tight text-left cursor-pointer transition-colors leading-tight"
                      >
                        {item.product.name}
                      </h3>
                      {/* Price subtotal */}
                      <span className="text-sm font-black text-gray-950 font-serif">
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-[10px] sm:text-xs font-bold text-gray-550 mb-3 uppercase tracking-wider font-mono">
                      <span>Color: <strong className="text-gray-800">{item.selectedColor}</strong></span>
                      <span>Size: <strong className="text-gray-800">{item.selectedSize}</strong></span>
                      <span>Unit Price: ₹{item.product.price.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Qty edit & deletion */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-9 w-24">
                      <button
                        id={`qty-dec-${idx}`}
                        onClick={() => onUpdateQty(idx, Math.max(1, item.quantity - 1))}
                        className="w-8 text-center text-sm font-black text-gray-650 hover:bg-gray-150 cursor-pointer focus:outline-none"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-mono text-xs font-bold text-gray-900 leading-none">
                        {item.quantity}
                      </span>
                      <button
                        id={`qty-inc-${idx}`}
                        onClick={() => onUpdateQty(idx, item.quantity + 1)}
                        className="w-8 text-center text-xs font-black text-gray-650 hover:bg-gray-150 cursor-pointer focus:outline-none"
                      >
                        +
                      </button>
                    </div>

                    <button
                      id={`cart-remove-${idx}`}
                      onClick={() => onRemoveItem(idx)}
                      className="text-red-500 hover:text-red-750 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>

              </div>
            ))}

            {/* CONTINUE GARDEMENT LINK */}
            <button
              id="cart-continue-shopping"
              onClick={() => setRoute("collections/all")}
              className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-orange-600 font-mono transition-colors focus:outline-none cursor-pointer pt-3"
            >
              <ArrowLeft className="h-4.5 w-4.5" /> Continue Dressing
            </button>
          </div>

          {/* RIGHT: ORDER SUMMARY PANEL & COUPONS (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* COUPON INPUT */}
            <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs">
              <h3 className="text-xs font-extrabold tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-1.5">
                <Tag className="h-4.5 w-4.5 text-orange-600" /> Apply Corporate Coupon
              </h3>
              
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    id="cart-coupon-input"
                    type="text"
                    placeholder="CLINZA10, LUXURY20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border bg-gray-50 border-gray-250 py-2 px-3.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-orange-500 uppercase text-gray-800 placeholder-gray-450"
                  />
                  <button
                    id="cart-coupon-apply"
                    onClick={handleApplyCoupon}
                    className="bg-gray-950 hover:bg-orange-600 text-white font-sans text-xs font-bold uppercase tracking-wider px-4.5 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/20 p-2.5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs font-black text-green-755 font-mono">{appliedCoupon} Active</p>
                      <p className="text-[10px] text-green-600 font-medium">Coupon applied successfully</p>
                    </div>
                  </div>
                  <button
                    id="cart-coupon-remove"
                    onClick={handleRemoveCoupon}
                    className="text-[10px] text-red-500 font-bold uppercase hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {couponMsg && (
                <p className={`text-[11px] font-medium leading-normal mt-3 ${
                  couponMsg.status === "success" ? "text-green-600" : "text-red-500"
                }`}>
                  {couponMsg.text}
                </p>
              )}

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5">
                <p className="text-[11px] text-gray-450 uppercase font-black tracking-widest font-mono">Available Coupons:</p>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-gray-700 font-medium font-sans">
                    • <strong>CLINZA10</strong>: 10% Off orders.
                  </span>
                  <span className="text-[11px] text-gray-700 font-medium font-sans">
                    • <strong>LUXURY20</strong>: 20% Off orders above ₹4,000.
                  </span>
                </div>
              </div>
            </div>

            {/* ORDER SUMMARY MATH */}
            <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs">
              <h3 className="text-xs font-extrabold tracking-widest text-gray-400 uppercase mb-4 select-none">
                Order Summary
              </h3>

              <div className="space-y-3 pb-4 border-b border-gray-150 text-xs text-gray-650 font-sans font-medium">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount Credit ({discountPercent}%)</span>
                    <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Standard Integrated GST (5%)</span>
                  <span>₹{standardGST.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Cash delivery Shipping</span>
                  {shippingCharge === 0 ? (
                    <span className="text-green-600 font-bold uppercase text-[10px] tracking-wider bg-green-50 px-2 py-0.5 rounded">Free</span>
                  ) : (
                    <span>₹{shippingCharge.toLocaleString("en-IN")}</span>
                  )}
                </div>
              </div>

              {/* GRAND TOTAL */}
              <div className="flex justify-between items-baseline pt-4 pb-6 select-none">
                <span className="text-xs font-black uppercase tracking-wider text-gray-900">Grand Total</span>
                <span className="text-xl font-black text-gray-950 font-serif">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* SUBMIT */}
              <button
                id="cart-proceed-checkout"
                onClick={handleProceedToCheckout}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-sans text-xs font-extrabold uppercase tracking-[0.25em] py-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-550/20"
              >
                Checkout orders <ArrowRight className="h-4.5 w-4.5" />
              </button>

              <p className="text-[10px] text-gray-450 italic text-center block mt-3">
                Secure Cash On Delivery eligibility active. Standard terms apply.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
