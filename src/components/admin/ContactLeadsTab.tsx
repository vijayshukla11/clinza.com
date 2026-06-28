/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MessageSquare, Calendar, Mail, Phone, Trash2, Edit, Plus, FileSpreadsheet, RefreshCw, X, Check } from "lucide-react";
import { getContactMessagesFromCloud, supabase } from "../../supabase";

interface ContactLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
}

export default function ContactLeadsTab() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);

  // Modal Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await getContactMessagesFromCloud();
      if (data && data.length > 0) {
        setLeads(data);
      } else {
        // Fallback demo leads mimicking a luxury clothing store's CRM
        const demo: ContactLead[] = [
          {
            id: "lead-1",
            name: "Anjali Mehta",
            email: "anjali.mehta@google.com",
            phone: "+91 72085 72688",
            message: "Hello Clinza, I wanted to inquire if the French Normandy Linen Shirt is available in size XL in white. I need to place a bulk order of 25 shirts for our corporate executive retreat.",
            created_at: new Date(Date.now() - 3600000 * 4).toISOString()
          },
          {
            id: "lead-2",
            name: "Kabir Malhotra",
            email: "kabir.malhotra@yahoo.com",
            phone: "+91 88001 22993",
            message: "I ordered a pair of Selvedge Indigo Jeans last Monday but haven't received my tracking link. Please assist with my shipping coords.",
            created_at: new Date(Date.now() - 3600000 * 25).toISOString()
          },
          {
            id: "lead-3",
            name: "Meera Sen",
            email: "meera.sen@gmail.com",
            phone: "+91 94220 11559",
            message: "Do you have offline trial studio locations or stockists in South Mumbai? I am a designer looking to collaborate with Clinza's textile architecture project.",
            created_at: new Date(Date.now() - 3600000 * 48).toISOString()
          }
        ];
        setLeads(demo);
      }
    } catch (err) {
      console.error("Failed to load contact leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to delete lead message from ${email}?`)) {
      return;
    }
    setLeads(prev => prev.filter(l => l.id !== id));
    try {
      await supabase.from("contact_messages").delete().eq("id", id);
    } catch (e) {
      console.warn("Soft deleted from local state only", e);
    }
    if (selectedLead?.id === id) {
      setSelectedLead(null);
    }
  };

  const handleOpenCreate = () => {
    setFormMode("create");
    setFormData({ name: "", email: "", phone: "", message: "" });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (lead: ContactLead) => {
    setFormMode("edit");
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || "",
      message: lead.message
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Name, Email and Message are required fields.");
      return;
    }

    if (formMode === "create") {
      const newLead: ContactLead = {
        id: `lead-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        created_at: new Date().toISOString()
      };
      setLeads(prev => [newLead, ...prev]);
      setSelectedLead(newLead);
      try {
        await supabase.from("contact_messages").insert([{
          id: newLead.id,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          message: newLead.message
        }]);
      } catch (err) {
        console.warn("Saved to local memory state only", err);
      }
    } else {
      if (!selectedLead) return;
      const updatedList = leads.map(l => {
        if (l.id === selectedLead.id) {
          const updated: ContactLead = {
            ...l,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message
          };
          setSelectedLead(updated);
          return updated;
        }
        return l;
      });
      setLeads(updatedList);
      try {
        await supabase.from("contact_messages").update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }).eq("id", selectedLead.id);
      } catch (err) {
        console.warn("Synced edit locally only", err);
      }
    }

    setIsFormOpen(false);
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Message", "Created At"];
    const rows = leads.map(lead => [
      lead.id,
      lead.name,
      lead.email,
      lead.phone || "",
      lead.message.replace(/"/g, '""'),
      lead.created_at
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clinza_contact_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="contact-leads-wrapper" className="space-y-6 text-left animate-fade-in text-xs font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-500 font-mono">Contact Form Leads</h3>
          <p className="text-[11px] text-zinc-400 font-sans">View buyer queries, custom textile questions, and pre-sales leads</p>
        </div>
        
        {/* ACTION BUTTONS: CREATE & EXPORT */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-black text-white hover:bg-orange-600 hover:text-black rounded-lg flex items-center gap-1.5 cursor-pointer text-[10px] font-mono tracking-wider uppercase font-bold transition-all border border-transparent shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Lead
          </button>
          
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 cursor-pointer text-[10px] font-mono tracking-wider uppercase font-bold transition-all border border-emerald-500 shadow-xs"
            title="Download CSV database dump"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Export CSV
          </button>

          <button
            onClick={loadLeads}
            disabled={loading}
            className="px-3 py-2 bg-zinc-100 border border-zinc-200 text-zinc-650 hover:bg-zinc-200 rounded-lg flex items-center gap-1.5 cursor-pointer text-[10px] font-mono tracking-wider uppercase font-bold"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of leads (7 columns space) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-zinc-700">
              <thead className="bg-zinc-50 border-b text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                <tr>
                  <th className="py-4 px-5 text-left">Sender Info</th>
                  <th className="py-4 px-4 text-left">Phone</th>
                  <th className="py-4 px-4 text-left">Message</th>
                  <th className="py-4 px-4 text-left">Submitted</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {leads.map((lead, idx) => (
                  <tr
                    key={lead.id || idx}
                    className={`hover:bg-zinc-50/40 cursor-pointer ${selectedLead?.id === lead.id ? "bg-orange-50/25 border-l-2 border-l-orange-500" : ""}`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="py-4 px-5">
                      <div>
                        <h4 className="font-bold text-zinc-950 font-serif text-sm leading-tight">{lead.name}</h4>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{lead.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-600 text-[10px]">
                      {lead.phone || <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="py-4 px-4 max-w-[150px] truncate text-zinc-500 mt-1 block">
                      {lead.message}
                    </td>
                    <td className="py-4 px-4 text-zinc-400 font-serif text-[10px]">
                      {new Date(lead.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="p-1.5 text-zinc-400 hover:text-orange-600 hover:bg-orange-50 rounded border border-transparent transition cursor-pointer"
                          title="Edit Lead"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteLead(lead.id, lead.email)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded border border-transparent transition cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-400 font-mono">
                      No customer leads logged in this ledger yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Lead Detailed View (5 columns space) */}
        <div className="lg:col-span-5">
          {selectedLead ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-sm text-xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-950" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-zinc-950">{selectedLead.name}</h3>
                    <span className="text-[10px] font-mono text-zinc-400">Incoming Contact Lead</span>
                  </div>
                  <span className="text-[9px] bg-zinc-100 text-zinc-800 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-zinc-200">
                    Active Lead
                  </span>
                </div>

                <div className="space-y-2.5 border-y border-zinc-100 py-4 font-sans text-zinc-700">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                    <a href={`mailto:${selectedLead.email}`} className="hover:underline font-mono font-bold text-zinc-950">
                      {selectedLead.email}
                    </a>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                      <a href={`tel:${selectedLead.phone.replace(/[\s\(\)\-\+]/g, "")}`} className="hover:underline font-mono text-zinc-950 font-bold">
                        {selectedLead.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span className="font-serif">
                      {new Date(selectedLead.created_at).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-zinc-400 font-mono">Client Message Log:</h4>
                  <div className="bg-zinc-50 border rounded-xl p-4 leading-relaxed font-sans text-zinc-800 text-xs italic">
                    "{selectedLead.message}"
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-2 border-t border-zinc-100 mt-4">
                <button
                  onClick={() => handleOpenEdit(selectedLead)}
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-lg text-center text-[10px] uppercase font-black tracking-widest transition duration-300 flex items-center justify-center gap-1 border border-zinc-200"
                >
                  <Edit className="h-3 w-3" /> Edit Lead
                </button>
                <button
                  onClick={() => deleteLead(selectedLead.id, selectedLead.email)}
                  className="px-4 py-2.5 border border-red-200 hover:border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition flex items-center justify-center"
                  title="Delete Record"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-10 text-center text-zinc-400 text-xs flex flex-col items-center justify-center h-full min-h-[300px]">
              <MessageSquare className="h-8 w-8 text-zinc-300 mb-2.5" />
              <p className="font-mono font-medium max-w-[200px] mx-auto text-zinc-500">Select any contact query card on the left to read customer messages, view info, or compose responses.</p>
            </div>
          )}
        </div>
      </div>

      {/* FORM MODAL (CREATE / EDIT) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[150] flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl text-xs relative">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-950"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-serif font-bold text-sm text-zinc-950">
              {formMode === "create" ? "Create CRM Prospect" : "Edit Lead Record Information"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-zinc-500">Client Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priyanshu Mehta"
                  className="w-full border border-zinc-250 p-2.5 font-sans rounded-lg focus:border-zinc-950 focus:outline-none text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-zinc-500">Client Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. client@domain.com"
                  className="w-full border border-zinc-250 p-2.5 font-sans rounded-lg focus:border-zinc-950 focus:outline-none text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-zinc-500">Client Phone (Optional)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 72085 72688"
                  className="w-full border border-zinc-250 p-2.5 font-sans rounded-lg focus:border-zinc-950 focus:outline-none text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-zinc-500">Inquiry Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write the presales query or design collaboration details..."
                  className="w-full border border-zinc-250 p-2.5 font-sans rounded-lg focus:border-zinc-950 focus:outline-none text-[11px] resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 border text-zinc-950 font-bold uppercase rounded-lg text-center font-mono tracking-widest text-[9px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-zinc-950 hover:bg-orange-600 hover:text-black text-white font-bold uppercase rounded-lg text-center font-mono tracking-widest text-[9px]"
                >
                  Commit Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
