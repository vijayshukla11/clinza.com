/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag, Percent } from "lucide-react";
import { Coupon } from "../../types";

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editorMode, setEditorMode] = useState<"list" | "form">("list");
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [form, setForm] = useState({
    id: "",
    code: "",
    type: "percentage" as "percentage" | "flat" | "free_shipping",
    value: 10,
    minCartValue: 999,
    expiryDate: ""
  });

  useEffect(() => {
    const cached = localStorage.getItem("clinza_marketing_coupons");
    if (cached) {
      setCoupons(JSON.parse(cached));
    } else {
      const initial: Coupon[] = [
        { id: "cop-1", code: "CLINZA20", type: "percentage", value: 20, minCartValue: 1499, expiryDate: "2026-07-31" },
        { id: "cop-2", code: "FREETRAVEL", type: "free_shipping", value: 0, minCartValue: 999, expiryDate: "2026-08-15" },
        { id: "cop-3", code: "SARTORIAL500", type: "flat", value: 500, minCartValue: 4999, expiryDate: "2026-09-30" }
      ];
      setCoupons(initial);
      localStorage.setItem("clinza_marketing_coupons", JSON.stringify(initial));
    }
  }, []);

  const saveToStore = (list: Coupon[]) => {
    setCoupons(list);
    localStorage.setItem("clinza_marketing_coupons", JSON.stringify(list));
    console.log("Coupons lists sync completed.");
  };

  const handleOpenForm = (cop: Coupon | null) => {
    if (cop) {
      setEditingCoupon(cop);
      setForm({ ...cop });
    } else {
      setEditingCoupon(null);
      setForm({
        id: `cop-${Date.now()}`,
        code: "",
        type: "percentage",
        value: 10,
        minCartValue: 999,
        expiryDate: "2026-08-31"
      });
    }
    setEditorMode("form");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      alert("Promotional coupon code is required!");
      return;
    }

    let updated: Coupon[];
    const uppercaseCode = form.code.trim().toUpperCase().replace(/\s+/g,"");
    const payload = { ...form, code: uppercaseCode };

    if (editingCoupon) {
      updated = coupons.map(c => c.id === payload.id ? payload : c);
    } else {
      updated = [...coupons, payload];
    }

    saveToStore(updated);
    setEditorMode("list");
    setEditingCoupon(null);
    alert(`Coupon code "${uppercaseCode}" has been created!`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this marketing campaign coupon code?")) {
      const updated = coupons.filter(c => c.id !== id);
      saveToStore(updated);
    }
  };

  return (
    <div id="coupons-manager-panel" className="space-y-6 text-left animate-fade-in">
      {editorMode === "list" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Coupons & Campaigns Marketing</h3>
              <p className="text-[11px] text-zinc-400 font-sans">Formulate cart discount incentives for seasonal campaigns</p>
            </div>
            <button
              onClick={() => handleOpenForm(null)}
              className="bg-zinc-900 hover:bg-zinc-850 text-white font-sans text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Create Coupon Code
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-700">
            {coupons.map((c) => (
              <div key={c.id} className="bg-white border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs border-dashed">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-mono font-black uppercase bg-orange-100 text-orange-700 tracking-wider px-3 py-1 border border-orange-200">
                      {c.code}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 font-semibold mb-1">Expiry: {c.expiryDate}</span>
                  </div>
                  
                  <div className="pt-2 font-serif text-[15px] font-black text-zinc-950">
                    {c.type === "percentage" ? (
                      <span>Flat {c.value}% reduction catalog wide</span>
                    ) : (
                      c.type === "flat" ? <span>Deduct flat ₹{c.value} from total cart value</span> : <span>Free delivery on active orders</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">Cart values condition: Must exceed ₹{c.minCartValue.toLocaleString("en-IN")}</p>
                </div>

                <div className="flex justify-between items-center border-t border-dashed pt-3">
                  <span className="text-[9px] font-mono text-zinc-450 uppercase font-black tracking-widest bg-zinc-100 px-2 py-0.5 rounded-full">
                    Type: {c.type}
                  </span>
                  <div className="space-x-1 flex">
                    <button
                      onClick={() => handleOpenForm(c)}
                      className="p-1 text-blue-600 hover:bg-zinc-50 rounded cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1 text-red-600 hover:bg-zinc-50 rounded cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-3 text-xs">
            <button
              type="button"
              onClick={() => setEditorMode("list")}
              className="flex items-center gap-1 font-mono font-black uppercase text-zinc-400 cursor-pointer"
            >
              Cancel back
            </button>
            <span className="text-[10px] uppercase bg-zinc-100 font-mono px-3 py-1 text-zinc-650 font-bold">Campaign Code Builder</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Campaign Coupon Code</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full border rounded-lg p-2.5 font-mono font-bold focus:outline-none focus:border-orange-500 bg-white"
                placeholder="e.g. SARTORIAL10"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Deduction Method</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full border rounded-lg p-2.5 font-semibold focus:outline-none focus:border-orange-500 bg-white"
              >
                <option value="percentage">Percentage Discount (% Off)</option>
                <option value="flat">Flat Surcharge Cut (₹ Flat-Off)</option>
                <option value="free_shipping">Free Shipping Exemption</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Discount Magnitude / Value</label>
              <input
                type="number"
                required
                disabled={form.type === "free_shipping"}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full border rounded-lg p-2.5 focus:outline-none bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Min Order Threshold (₹)</label>
              <input
                type="number"
                required
                value={form.minCartValue}
                onChange={(e) => setForm({ ...form, minCartValue: Number(e.target.value) })}
                className="w-full border rounded-lg p-2.5 focus:outline-none bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Expiry Date</label>
              <input
                type="date"
                required
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full border rounded-lg p-2 focus:outline-none bg-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow cursor-pointer text-center"
          >
            Launch Campaign Campaign
          </button>
        </form>
      )}
    </div>
  );
}
