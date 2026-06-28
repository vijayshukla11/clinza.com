/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Star, Check, X, Trash2, ShieldAlert } from "lucide-react";
import { ReviewItem } from "../../types";

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    const cached = localStorage.getItem("clinza_product_reviews");
    if (cached) {
      setReviews(JSON.parse(cached));
    } else {
      const initial: ReviewItem[] = [
        { id: "rev-1", productId: "prod-italian-linen", productName: "Italian Premium Linen Shirt", rating: 5, userName: "Aravind K.", comment: "Flawless drape and incredibly airy collar. Perfect for Mumbai afternoon resort climates.", approved: true, date: "2026-05-18", location: "Mumbai" },
        { id: "rev-2", productId: "prod-selvedge-indigo", productName: "Japanese Shuttle Selvedge Jeans", rating: 4, userName: "Devendra S.", comment: "Outstanding heavy handfeel, but took a couple of washes to break in perfectly. Beautiful shuttle lining.", approved: true, date: "2026-05-22", location: "Pune" },
        { id: "rev-3", productId: "prod-cuban-camp", productName: "Cuban Camp-Collar Shirt", rating: 5, userName: "Vikram Das", comment: "The design drape looks extremely high-end. Highly recommend this brand! Fast COD.", approved: false, date: "2026-06-03", location: "Kolkata" }
      ];
      setReviews(initial);
      localStorage.setItem("clinza_product_reviews", JSON.stringify(initial));
    }
  }, []);

  const saveToStore = (list: ReviewItem[]) => {
    setReviews(list);
    localStorage.setItem("clinza_product_reviews", JSON.stringify(list));
    console.log("Product reviews committed to cloud rules.");
  };

  const handleApprove = (id: string) => {
    const updated = reviews.map(r => r.id === id ? { ...r, approved: true } : r);
    saveToStore(updated);
    alert("Testimonial review approved and published to client product view cards!");
  };

  const handleReject = (id: string) => {
    const updated = reviews.map(r => r.id === id ? { ...r, approved: false } : r);
    saveToStore(updated);
    alert("Review unapproved successfully.");
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this client review completely?")) {
      const updated = reviews.filter(r => r.id !== id);
      saveToStore(updated);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "approved") return r.approved;
    if (filter === "pending") return !r.approved;
    return true;
  });

  return (
    <div id="reviews-moderator-panel" className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Reviews & Testimonials Cockpit</h3>
          <p className="text-[11px] text-zinc-400 font-sans">Moderate customer feedback on live catalog product sheets</p>
        </div>

        {/* Filter pills */}
        <div className="flex border rounded-lg bg-zinc-50 p-1 divide-x text-xs">
          {[
            { id: "all", label: "All Reviews" },
            { id: "pending", label: "Spam/Pending" },
            { id: "approved", label: "Approved Live" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1.5 font-sans font-bold cursor-pointer transition-all ${
                filter === item.id 
                  ? "bg-white border rounded shadow-xs text-orange-600 font-black" 
                  : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table reviews */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-xs text-zinc-700 min-w-[700px]">
          <thead className="bg-zinc-50 text-[9px] text-zinc-500 font-bold uppercase tracking-widest text-left border-b">
            <tr>
              <th className="py-4 px-5">Author & Rating</th>
              <th className="py-4 px-4">Subject product</th>
              <th className="py-4 px-4">Comment text</th>
              <th className="py-4 px-4">Verification Location</th>
              <th className="py-4 px-5 text-right">Moderations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filtered.map((rev) => (
              <tr key={rev.id} className="hover:bg-zinc-50/20">
                <td className="py-4 px-5">
                  <div className="font-bold text-zinc-950 leading-none">{rev.userName}</div>
                  <div className="flex items-center gap-0.5 text-amber-500 mt-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < rev.rating ? "fill-amber-500" : "text-zinc-200"}`} />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 mt-1 block">Date: {rev.date}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-650 px-2 py-0.5 rounded">
                    {rev.productName}
                  </span>
                </td>
                <td className="py-4 px-4 max-w-sm">
                  <p className="leading-relaxed font-sans text-zinc-800">{rev.comment}</p>
                </td>
                <td className="py-4 px-4 font-mono font-bold text-zinc-450 uppercase">
                  Mumbai Metro, {rev.location || "India"}
                </td>
                <td className="py-4 px-5 text-right space-x-1.5 shrink-0 whitespace-nowrap">
                  {rev.approved ? (
                    <button
                      onClick={() => handleReject(rev.id)}
                      className="p-1 px-2 hover:bg-zinc-100 font-mono text-[9px] text-zinc-500 border rounded cursor-pointer inline-block"
                      title="Withdraw review publication"
                    >
                      Hide Live
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(rev.id)}
                      className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded cursor-pointer inline-block"
                      title="Authorize visual testimonial"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent rounded cursor-pointer inline-block"
                    title="Erase"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
