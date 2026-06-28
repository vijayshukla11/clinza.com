/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Users, User, ArrowRight, Eye, Phone, MapPin, Heart, ListOrdered } from "lucide-react";
import { CustomerProfile } from "../../types";

export default function CustomersTab() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedCust, setSelectedCust] = useState<CustomerProfile | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const cached = localStorage.getItem("clinza_customers");
    if (cached) {
      setCustomers(JSON.parse(cached));
    } else {
      const initial: CustomerProfile[] = [
        { id: "cust-1", name: "Priyanshu Sharma", email: "priyanshu@gmail.com", phone: "+91 98845 23301", addressBook: ["Sector 12, H-402, Malviya Nagar, New Delhi - 110017"], totalSpend: 8499, wishlist: ["prod-italian-linen", "prod-selvedge-indigo"] },
        { id: "cust-2", name: "Tanya Sen", email: "tanya.styling@outlook.com", phone: "+91 88201 15420", addressBook: ["Bunglow 4C, Carter Road, Bandra West, Mumbai - 400050"], totalSpend: 12900, wishlist: ["prod-cuban-camp"] },
        { id: "cust-3", name: "Rohan Roy", email: "rohan.roy8@gmail.com", phone: "+91 94330 45781", addressBook: ["A-42, Salt Lake, Block CL, Kolkata - 700091"], totalSpend: 3999, wishlist: [] }
      ];
      setCustomers(initial);
      localStorage.setItem("clinza_customers", JSON.stringify(initial));
    }
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div id="customers-crm-wrapper" className="space-y-6 text-left animate-fade-in">
      {!selectedCust ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Customer CRM Directory</h3>
            <p className="text-[11px] text-zinc-400 font-sans">Track buyer spending, wishlists and addresses</p>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search customers by name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md bg-white border border-zinc-250 py-2.5 px-4 rounded-xl text-xs font-sans focus:outline-none"
            />
          </div>

          <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-zinc-700 min-w-[700px]">
              <thead className="bg-zinc-50 border-b text-[9px] text-zinc-500 font-bold uppercase tracking-widest text-left">
                <tr>
                  <th className="py-4 px-5">Customer Index</th>
                  <th className="py-4 px-4">Email Coordinates</th>
                  <th className="py-4 px-4">Address Count</th>
                  <th className="py-4 px-4">Cumulate Spending</th>
                  <th className="py-4 px-5 text-right">View file</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/20">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-150 flex items-center justify-center font-bold text-zinc-700 font-mono">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-950 font-serif text-sm">{c.name}</h4>
                          <span className="text-[10px] text-zinc-400 font-mono">{c.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-zinc-650">
                      {c.email}
                    </td>
                    <td className="py-4 px-4 text-zinc-500 font-bold">
                      {c.addressBook.length} Saved Addresses
                    </td>
                    <td className="py-4 px-4 font-bold text-zinc-950 font-sans text-xs">
                      ₹{c.totalSpend.toLocaleString("en-IN")} Spent
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedCust(c)}
                        className="p-1 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded border cursor-pointer inline-block"
                        title="View profile metrics"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CUSTOMER PROFILE DETAIL INJECT */
        <div className="bg-white border rounded-2xl p-6 space-y-6 shadow-xs text-xs">
          
          <div className="flex justify-between items-center border-b pb-3">
            <button
              onClick={() => setSelectedCust(null)}
              className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-zinc-500 cursor-pointer"
            >
              <ArrowRight className="h-4 w-4 rotate-180" /> CRM Directory
            </button>
            <span className="text-[10px] font-mono bg-zinc-100 text-zinc-500 px-3 py-1 uppercase font-bold">Customer Profile metrics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 font-sans">
            
            {/* LHS */}
            <div className="md:col-span-4 space-y-6">
              <div className="p-6 bg-zinc-50 rounded-xl space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100/60 text-orange-600 flex items-center justify-center font-bold text-2xl mx-auto border border-orange-200">
                  {selectedCust.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-serif font-bold text-zinc-950 leading-tight">{selectedCust.name}</h4>
                  <span className="text-[10px] font-mono text-zinc-400">UID: {selectedCust.id}</span>
                </div>
                
                <div className="pt-2 text-left divide-y text-[11px] font-mono text-zinc-650">
                  <div className="py-2.5 flex justify-between">
                    <span>Contact</span>
                    <span className="font-bold text-zinc-950">{selectedCust.phone}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span>Email</span>
                    <span className="font-bold text-zinc-950">{selectedCust.email}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span>Loyalty Index</span>
                    <span className="font-bold text-orange-600 uppercase">Premium Member</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RHS */}
            <div className="md:col-span-8 space-y-6">
              {/* Addresses */}
              <div className="p-5 border rounded-xl space-y-3 bg-white">
                <h3 className="text-[11px] font-black uppercase text-zinc-400 font-mono tracking-widest flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Address Logs
                </h3>
                {selectedCust.addressBook.map((addr, idx) => (
                  <p key={idx} className="p-3 bg-zinc-50 rounded-lg border leading-relaxed text-zinc-700 font-sans">
                    {addr}
                  </p>
                ))}
              </div>

              {/* Wishlisted & logs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 border rounded-xl space-y-3 bg-white">
                  <h4 className="text-[11px] font-black uppercase text-zinc-400 font-mono tracking-widest flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" /> Active Wishlist
                  </h4>
                  {selectedCust.wishlist.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedCust.wishlist.map((w, idx) => (
                        <li key={idx} className="p-2 border rounded bg-zinc-50 font-mono text-[10px] text-zinc-600">
                          {w.replace("prod-", "CLINZA SKU #").toUpperCase()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-zinc-400 text-[11px]">Wishlist is currently empty.</p>
                  )}
                </div>

                <div className="p-5 border rounded-xl space-y-3 bg-white">
                  <h4 className="text-[11px] font-black uppercase text-zinc-400 font-mono tracking-widest flex items-center gap-1.5">
                    <ListOrdered className="h-4 w-4 text-indigo-500" /> Spending value
                  </h4>
                  <div className="bg-zinc-50 border p-4 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold block mb-1">Lifetime spending value</span>
                    <p className="text-2xl font-black text-zinc-950 font-sans">₹{selectedCust.totalSpend.toLocaleString("en-IN")}</p>
                    <span className="text-[9px] text-emerald-600 font-mono font-bold block mt-1.5 uppercase">Simulated checkout safe COD limits</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
