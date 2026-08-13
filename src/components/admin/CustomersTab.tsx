/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  User, 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus, 
  Award, 
  CreditCard, 
  Gift, 
  Mail, 
  Phone, 
  MapPin, 
  Heart, 
  ListOrdered, 
  Clock, 
  FileText, 
  Ban, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Share2, 
  Tag as TagIcon, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Eye, 
  Edit3, 
  UserX, 
  UserCheck, 
  Send, 
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  Copy,
  Check
} from "lucide-react";
import { 
  CustomerProfile, 
  Order, 
  Product, 
  Address, 
  CustomerNote, 
  CustomerTimelineItem, 
  MarketingConsent, 
  SupportRequestItem 
} from "../../types";
import { CustomersService } from "../../services/supabaseService";

interface CustomersTabProps {
  orderList?: Order[];
  productList?: Product[];
}

const PRESET_TAGS = [
  "VIP",
  "Wholesale",
  "Retail",
  "High Value",
  "First Order",
  "Repeat Customer",
  "Inactive"
];

export default function CustomersTab({ orderList = [], productList = [] }: CustomersTabProps) {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCust, setSelectedCust] = useState<CustomerProfile | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [tagFilter, setTagFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"spend" | "orders" | "date" | "name">("spend");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Detail Sub-Tab
  const [detailTab, setDetailTab] = useState<"overview" | "addresses" | "orders" | "loyalty" | "timeline" | "support">("overview");

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockReasonText, setBlockReasonText] = useState("");

  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState("");

  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");

  // Point & Credit adjustments
  const [pointAdjAmount, setPointAdjAmount] = useState<number>(100);
  const [creditAdjAmount, setCreditAdjAmount] = useState<number>(250);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load Customers
  useEffect(() => {
    loadCustomersData();
  }, []);

  const loadCustomersData = async () => {
    setLoading(true);
    try {
      const data = await CustomersService.getAll();
      if (data && data.length > 0) {
        setCustomers(enrichCustomersWithDefaults(data));
      } else {
        const initial = getInitialMockCustomers();
        setCustomers(initial);
        localStorage.setItem("clinza_customers", JSON.stringify(initial));
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
      const initial = getInitialMockCustomers();
      setCustomers(initial);
    } finally {
      setLoading(false);
    }
  };

  // Helper to enrich default fields
  const enrichCustomersWithDefaults = (list: CustomerProfile[]): CustomerProfile[] => {
    return list.map(c => {
      // Calculate orders and total spend from orders prop if matching email
      const custOrders = orderList.filter(o => 
        o.customer?.email?.toLowerCase() === c.email.toLowerCase() ||
        o.customer?.phone === c.phone
      );

      const totalOrders = Math.max(c.totalOrders || 0, custOrders.length);
      const computedSpend = custOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalSpend = Math.max(c.totalSpend || 0, computedSpend);
      const avgOrderValue = totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 0;
      
      const lastOrder = custOrders.length > 0 ? custOrders[0].createdAt : c.lastOrderDate;

      // Determine default tags
      let tags = c.tags && c.tags.length > 0 ? [...c.tags] : ["Retail"];
      if (totalSpend >= 10000 && !tags.includes("VIP")) tags.push("VIP");
      if (totalSpend >= 5000 && !tags.includes("High Value")) tags.push("High Value");
      if (totalOrders > 1 && !tags.includes("Repeat Customer")) tags.push("Repeat Customer");
      if (totalOrders === 1 && !tags.includes("First Order")) tags.push("First Order");

      return {
        ...c,
        status: c.status || (c.isBlocked ? "Blocked" : "Active"),
        tags: Array.from(new Set(tags)),
        totalOrders,
        totalSpend,
        avgOrderValue,
        lastOrderDate: lastOrder,
        createdAt: c.createdAt || new Date(Date.now() - 30 * 86400000).toISOString(),
        rewardPoints: c.rewardPoints ?? Math.floor(totalSpend * 0.1),
        storeCredit: c.storeCredit ?? 0,
        referralCode: c.referralCode || `CLINZA-${c.name ? c.name.slice(0, 3).toUpperCase() : "REF"}-${Math.floor(1000 + Math.random() * 9000)}`,
        marketingConsent: c.marketingConsent || {
          emailOptIn: true,
          smsOptIn: true,
          whatsappOptIn: true,
          newsletter: true
        },
        shippingAddresses: c.shippingAddresses || (c.addressBook.length > 0 ? [{
          id: "addr-1",
          name: c.name,
          phone: c.phone,
          addressLine: c.addressBook[0],
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400050",
          isDefault: true
        }] : []),
        billingAddresses: c.billingAddresses || [],
        notes: c.notes || [],
        timeline: c.timeline || [
          {
            id: "tl-1",
            type: "login",
            title: "Account Registered",
            description: "Customer created their profile via online store.",
            timestamp: c.createdAt || new Date().toISOString()
          }
        ],
        supportRequests: c.supportRequests || [],
        couponHistory: c.couponHistory || []
      };
    });
  };

  // Default Mock Data generator
  const getInitialMockCustomers = (): CustomerProfile[] => {
    return [
      {
        id: "cust-1",
        name: "Priyanshu Sharma",
        email: "priyanshu@gmail.com",
        phone: "+91 98845 23301",
        status: "Active",
        tags: ["VIP", "High Value", "Repeat Customer"],
        createdAt: new Date().toISOString(),
        lastOrderDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        totalOrders: 4,
        totalSpend: 14499,
        avgOrderValue: 3624,
        addressBook: ["Sector 12, H-402, Malviya Nagar, New Delhi - 110017"],
        shippingAddresses: [{
          id: "sa-1",
          name: "Priyanshu Sharma",
          phone: "+91 98845 23301",
          addressLine: "Sector 12, H-402, Malviya Nagar",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110017",
          isDefault: true
        }],
        wishlist: ["prod-italian-linen", "prod-selvedge-indigo"],
        rewardPoints: 1450,
        storeCredit: 500,
        referralCode: "CLINZA-PRI-4820",
        marketingConsent: { emailOptIn: true, smsOptIn: true, whatsappOptIn: true, newsletter: true },
        notes: [{ id: "n-1", user: "Admin", text: "Prefers Italian Linen L size shirts. High responsiveness to WhatsApp promos.", date: "2026-07-20T10:00:00Z" }],
        supportRequests: [{ id: "sup-1", subject: "Sizing inquiry for Cuban collar", status: "Resolved", date: "2026-07-15", priority: "Low" }]
      },
      {
        id: "cust-2",
        name: "Tanya Sen",
        email: "tanya.styling@outlook.com",
        phone: "+91 88201 15420",
        status: "Active",
        tags: ["VIP", "Repeat Customer"],
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        lastOrderDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        totalOrders: 3,
        totalSpend: 12900,
        avgOrderValue: 4300,
        addressBook: ["Bunglow 4C, Carter Road, Bandra West, Mumbai - 400050"],
        shippingAddresses: [{
          id: "sa-2",
          name: "Tanya Sen",
          phone: "+91 88201 15420",
          addressLine: "Bunglow 4C, Carter Road, Bandra West",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400050",
          isDefault: true
        }],
        wishlist: ["prod-cuban-camp"],
        rewardPoints: 1290,
        storeCredit: 0,
        referralCode: "CLINZA-TAN-9102",
        marketingConsent: { emailOptIn: true, smsOptIn: false, whatsappOptIn: true, newsletter: true },
        notes: [],
        supportRequests: []
      },
      {
        id: "cust-3",
        name: "Rohan Roy",
        email: "rohan.roy8@gmail.com",
        phone: "+91 94330 45781",
        status: "Active",
        tags: ["First Order", "Retail"],
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        lastOrderDate: new Date().toISOString(),
        totalOrders: 1,
        totalSpend: 3999,
        avgOrderValue: 3999,
        addressBook: ["A-42, Salt Lake, Block CL, Kolkata - 700091"],
        shippingAddresses: [],
        wishlist: [],
        rewardPoints: 400,
        storeCredit: 0,
        referralCode: "CLINZA-ROH-3321",
        marketingConsent: { emailOptIn: true, smsOptIn: true, whatsappOptIn: true, newsletter: false },
        notes: [],
        supportRequests: [{ id: "sup-2", subject: "Track delivery update", status: "Pending", date: "2026-07-22", priority: "Medium" }]
      }
    ];
  };

  // Save Customer Update
  const saveCustomerProfileUpdate = async (updated: CustomerProfile) => {
    try {
      await CustomersService.update(updated.id, updated);
      setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
      if (selectedCust?.id === updated.id) {
        setSelectedCust(updated);
      }
    } catch (err) {
      console.error("Error saving customer update:", err);
      alert("Failed to update customer profile.");
    }
  };

  // KPIs
  const totalCustomers = customers.length;
  const todayStr = new Date().toISOString().split("T")[0];
  const newCustomersToday = customers.filter(c => (c.createdAt || "").startsWith(todayStr)).length;
  const returningCustomers = customers.filter(c => (c.totalOrders || 0) > 1).length;
  
  const totalStoreSpend = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
  const totalStoreOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const avgOrderValueOverall = totalStoreOrders > 0 ? Math.round(totalStoreSpend / totalStoreOrders) : 0;
  
  const pendingSupportRequests = customers.reduce((sum, c) => {
    return sum + (c.supportRequests || []).filter(s => s.status === "Pending").length;
  }, 0);

  // Filtered Directory List
  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    const tagMatch = (c.tags || []).some(t => t.toLowerCase().includes(q));
    const matchesSearch = nameMatch || tagMatch;

    const matchesStatus = statusFilter === "All" || c.status === statusFilter || (statusFilter === "Blocked" && c.isBlocked);
    const matchesTag = tagFilter === "All" || (c.tags || []).includes(tagFilter);

    return matchesSearch && matchesStatus && matchesTag;
  }).sort((a, b) => {
    if (sortBy === "spend") return (b.totalSpend || 0) - (a.totalSpend || 0);
    if (sortBy === "orders") return (b.totalOrders || 0) - (a.totalOrders || 0);
    if (sortBy === "date") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    return a.name.localeCompare(b.name);
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Export CSV
  const handleExportCSV = (singleCustomer?: CustomerProfile) => {
    const targetList = singleCustomer ? [singleCustomer] : filteredCustomers;
    if (targetList.length === 0) {
      alert("No customer records to export.");
      return;
    }

    const headers = ["ID", "Name", "Email", "Phone", "Status", "Tags", "Total Orders", "Total Spend (INR)", "AOV", "Reward Points", "Store Credit", "Referral Code", "Joined Date"];
    const rows = targetList.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.email,
      c.phone,
      c.status || "Active",
      `"${(c.tags || []).join(", ")}"`,
      c.totalOrders || 0,
      c.totalSpend || 0,
      c.avgOrderValue || 0,
      c.rewardPoints || 0,
      c.storeCredit || 0,
      c.referralCode || "",
      new Date(c.createdAt || Date.now()).toLocaleDateString("en-IN")
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clinza_customers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Note Handler
  const handleAddNote = () => {
    if (!selectedCust || !noteText.trim()) return;

    const newNote: CustomerNote = {
      id: "n-" + Date.now(),
      user: "Admin",
      text: noteText.trim(),
      date: new Date().toISOString()
    };

    const updatedTimeline: CustomerTimelineItem[] = [
      {
        id: "tl-" + Date.now(),
        type: "note",
        title: "Admin Note Added",
        description: noteText.trim(),
        timestamp: new Date().toISOString()
      },
      ...(selectedCust.timeline || [])
    ];

    const updated: CustomerProfile = {
      ...selectedCust,
      notes: [newNote, ...(selectedCust.notes || [])],
      timeline: updatedTimeline
    };

    saveCustomerProfileUpdate(updated);
    setNoteText("");
    setIsNoteModalOpen(false);
  };

  // Block / Unblock Handler
  const handleToggleBlock = () => {
    if (!selectedCust) return;

    const willBlock = !selectedCust.isBlocked;
    const updatedStatus = willBlock ? "Blocked" : "Active";

    const updatedTimeline: CustomerTimelineItem[] = [
      {
        id: "tl-" + Date.now(),
        type: "status",
        title: willBlock ? "Account Blocked" : "Account Unblocked",
        description: willBlock ? `Reason: ${blockReasonText || "Admin policy enforcement"}` : "Customer account re-activated.",
        timestamp: new Date().toISOString()
      },
      ...(selectedCust.timeline || [])
    ];

    const updated: CustomerProfile = {
      ...selectedCust,
      isBlocked: willBlock,
      blockReason: willBlock ? blockReasonText : "",
      status: updatedStatus,
      timeline: updatedTimeline
    };

    saveCustomerProfileUpdate(updated);
    setIsBlockModalOpen(false);
    setBlockReasonText("");
  };

  // Add/Remove Tag Handler
  const handleToggleTag = (tag: string) => {
    if (!selectedCust) return;
    const currentTags = selectedCust.tags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    saveCustomerProfileUpdate({ ...selectedCust, tags: updatedTags });
  };

  // Add Custom Tag
  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || !customTagInput.trim()) return;
    const tag = customTagInput.trim();
    if (!(selectedCust.tags || []).includes(tag)) {
      saveCustomerProfileUpdate({ ...selectedCust, tags: [...(selectedCust.tags || []), tag] });
    }
    setCustomTagInput("");
    setIsAddTagOpen(false);
  };

  // Adjust Loyalty Points
  const handleAdjustPoints = (type: "add" | "deduct") => {
    if (!selectedCust) return;
    const currentPts = selectedCust.rewardPoints || 0;
    const amount = Math.abs(pointAdjAmount);
    const newPts = type === "add" ? currentPts + amount : Math.max(0, currentPts - amount);

    const updatedTimeline: CustomerTimelineItem[] = [
      {
        id: "tl-" + Date.now(),
        type: "loyalty",
        title: type === "add" ? `+${amount} Reward Points Awarded` : `-${amount} Reward Points Deducted`,
        description: `Loyalty points balance adjusted by Admin to ${newPts} pts.`,
        timestamp: new Date().toISOString()
      },
      ...(selectedCust.timeline || [])
    ];

    saveCustomerProfileUpdate({
      ...selectedCust,
      rewardPoints: newPts,
      timeline: updatedTimeline
    });
  };

  // Adjust Store Credit
  const handleAdjustStoreCredit = (type: "add" | "deduct") => {
    if (!selectedCust) return;
    const currentCredit = selectedCust.storeCredit || 0;
    const amount = Math.abs(creditAdjAmount);
    const newCredit = type === "add" ? currentCredit + amount : Math.max(0, currentCredit - amount);

    const updatedTimeline: CustomerTimelineItem[] = [
      {
        id: "tl-" + Date.now(),
        type: "loyalty",
        title: type === "add" ? `+₹${amount} Store Credit Added` : `-₹${amount} Store Credit Used/Removed`,
        description: `Store credit balance updated to ₹${newCredit}.`,
        timestamp: new Date().toISOString()
      },
      ...(selectedCust.timeline || [])
    ];

    saveCustomerProfileUpdate({
      ...selectedCust,
      storeCredit: newCredit,
      timeline: updatedTimeline
    });
  };

  // Merge Customers
  const handleMergeCustomers = () => {
    if (!selectedCust || !mergeTargetId) return;
    const target = customers.find(c => c.id === mergeTargetId);
    if (!target) {
      alert("Target customer not found.");
      return;
    }

    if (target.id === selectedCust.id) {
      alert("Cannot merge customer with themselves.");
      return;
    }

    const mergedSpend = (selectedCust.totalSpend || 0) + (target.totalSpend || 0);
    const mergedOrders = (selectedCust.totalOrders || 0) + (target.totalOrders || 0);
    const mergedAddresses = Array.from(new Set([...(selectedCust.addressBook || []), ...(target.addressBook || [])]));
    const mergedTags = Array.from(new Set([...(selectedCust.tags || []), ...(target.tags || []), "Merged Account"]));
    const mergedPoints = (selectedCust.rewardPoints || 0) + (target.rewardPoints || 0);
    const mergedCredit = (selectedCust.storeCredit || 0) + (target.storeCredit || 0);
    const mergedNotes = [...(selectedCust.notes || []), ...(target.notes || [])];

    const updatedPrimary: CustomerProfile = {
      ...selectedCust,
      totalSpend: mergedSpend,
      totalOrders: mergedOrders,
      avgOrderValue: mergedOrders > 0 ? Math.round(mergedSpend / mergedOrders) : 0,
      addressBook: mergedAddresses,
      tags: mergedTags,
      rewardPoints: mergedPoints,
      storeCredit: mergedCredit,
      notes: mergedNotes,
      timeline: [
        {
          id: "tl-" + Date.now(),
          type: "status",
          title: "Account Merged",
          description: `Merged duplicate account ${target.email} into primary profile.`,
          timestamp: new Date().toISOString()
        },
        ...(selectedCust.timeline || [])
      ]
    };

    // Remove target customer and update primary
    CustomersService.delete(target.id);
    saveCustomerProfileUpdate(updatedPrimary);

    setIsMergeModalOpen(false);
    setMergeTargetId("");
    alert(`Successfully merged ${target.name} (${target.email}) into ${selectedCust.name}.`);
  };

  // Toggle Marketing Consent
  const handleToggleConsent = (key: keyof MarketingConsent) => {
    if (!selectedCust) return;
    const currentConsent = selectedCust.marketingConsent || {
      emailOptIn: true,
      smsOptIn: true,
      whatsappOptIn: true,
      newsletter: true
    };

    const updatedConsent = {
      ...currentConsent,
      [key]: !currentConsent[key]
    };

    saveCustomerProfileUpdate({ ...selectedCust, marketingConsent: updatedConsent });
  };

  return (
    <div id="customer-crm-dashboard-wrapper" className="space-y-6 text-left font-sans animate-fade-in">
      
      {/* DIRECTORY VIEW OR DETAIL VIEW */}
      {!selectedCust ? (
        <div className="space-y-6">
          
          {/* HEADER & TOP ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <div>
              <h2 className="text-base font-black text-zinc-950 uppercase tracking-wider font-mono flex items-center gap-2">
                <Users className="h-5 w-5 text-zinc-900" /> Customer CRM & Loyalty Engine
              </h2>
              <p className="text-xs text-zinc-500 font-sans">Shopify-grade buyer profiles, spending history, tags, support requests, and reward points.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV()}
                className="px-3.5 py-2 border border-zinc-250 hover:border-zinc-900 bg-white text-zinc-800 rounded-lg text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* DASHBOARD KPI METRICS */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            
            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Total Customers</span>
              <div className="text-xl font-black text-zinc-900 font-mono">{totalCustomers}</div>
              <p className="text-[10px] text-zinc-500">Active CRM profiles</p>
            </div>

            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 block">New Today</span>
              <div className="text-xl font-black text-emerald-600 font-mono">+{newCustomersToday}</div>
              <p className="text-[10px] text-zinc-500">Joined in last 24h</p>
            </div>

            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 block">Returning Buyers</span>
              <div className="text-xl font-black text-indigo-600 font-mono">{returningCustomers}</div>
              <p className="text-[10px] text-zinc-500">&gt;1 orders placed</p>
            </div>

            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Average Order Value</span>
              <div className="text-xl font-black text-zinc-900 font-mono">₹{avgOrderValueOverall.toLocaleString("en-IN")}</div>
              <p className="text-[10px] text-zinc-500">Across all orders</p>
            </div>

            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 block">Lifetime Revenue</span>
              <div className="text-xl font-black text-orange-600 font-mono">₹{totalStoreSpend.toLocaleString("en-IN")}</div>
              <p className="text-[10px] text-zinc-500">Combined spending</p>
            </div>

            <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 block">Pending Tickets</span>
              <div className="text-xl font-black text-amber-600 font-mono">{pendingSupportRequests}</div>
              <p className="text-[10px] text-zinc-500">Support requests</p>
            </div>

          </div>

          {/* SEARCH, FILTERS & SORT BAR */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search name, email, phone, tag..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-zinc-50 border border-zinc-250 pl-9 pr-4 py-2 rounded-lg text-xs font-sans focus:outline-none focus:border-zinc-900 focus:bg-white"
              />
            </div>

            {/* Filters Group */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-zinc-50 border border-zinc-250 py-1.5 px-3 rounded-lg text-xs font-sans font-bold text-zinc-800 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Tag Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Tag:</span>
                <select
                  value={tagFilter}
                  onChange={(e) => {
                    setTagFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-zinc-50 border border-zinc-250 py-1.5 px-3 rounded-lg text-xs font-sans font-bold text-zinc-800 focus:outline-none"
                >
                  <option value="All">All Tags</option>
                  {PRESET_TAGS.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-zinc-50 border border-zinc-250 py-1.5 px-3 rounded-lg text-xs font-sans font-bold text-zinc-800 focus:outline-none"
                >
                  <option value="spend">Total Spend (High-Low)</option>
                  <option value="orders">Total Orders (High-Low)</option>
                  <option value="date">Newest Member</option>
                  <option value="name">Customer Name (A-Z)</option>
                </select>
              </div>

            </div>

          </div>

          {/* CUSTOMERS DIRECTORY TABLE */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-x-auto shadow-2xs">
            <table className="w-full text-xs text-left text-zinc-700 min-w-[900px]">
              <thead className="bg-zinc-50 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3.5 px-5">Customer Profile</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4 text-right">Total Spend</th>
                  <th className="py-3.5 px-4">Last Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400 font-mono text-xs">
                      Loading Customer Directory from Supabase...
                    </td>
                  </tr>
                ) : paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((c) => {
                    const initials = c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "CU";
                    const isBlocked = c.isBlocked || c.status === "Blocked";

                    return (
                      <tr key={c.id} className="hover:bg-zinc-50/60 transition">
                        
                        {/* Customer Name */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                              isBlocked 
                                ? "bg-red-100 text-red-700 border-red-200" 
                                : "bg-orange-100/70 text-orange-700 border-orange-200"
                            }`}>
                              {initials}
                            </div>
                            <div>
                              <button
                                onClick={() => setSelectedCust(c)}
                                className="font-bold text-zinc-950 hover:text-orange-600 text-sm font-serif text-left cursor-pointer transition block"
                              >
                                {c.name}
                              </button>
                              <span className="text-[10px] text-zinc-400 font-mono block">UID: {c.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email & Phone */}
                        <td className="py-4 px-4 font-mono text-[11px]">
                          <div className="text-zinc-900 font-bold">{c.email}</div>
                          <div className="text-zinc-400">{c.phone}</div>
                        </td>

                        {/* Orders */}
                        <td className="py-4 px-4 text-center font-mono font-bold text-zinc-900">
                          {c.totalOrders || 0}
                        </td>

                        {/* Total Spend */}
                        <td className="py-4 px-4 text-right font-mono font-black text-zinc-950 text-sm">
                          ₹{(c.totalSpend || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Last Order */}
                        <td className="py-4 px-4 font-mono text-[11px] text-zinc-500">
                          {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "No orders yet"}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={`inline-block text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            isBlocked
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : c.status === "Inactive"
                              ? "bg-zinc-100 text-zinc-600 border border-zinc-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {isBlocked ? "Blocked" : (c.status || "Active")}
                          </span>
                        </td>

                        {/* Tags */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {(c.tags || []).slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-[9px] font-mono font-bold uppercase bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                                {tag}
                              </span>
                            ))}
                            {(c.tags || []).length > 3 && (
                              <span className="text-[9px] font-mono text-zinc-400">+{c.tags.length - 3}</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => setSelectedCust(c)}
                            className="px-3 py-1.5 border border-zinc-250 hover:border-zinc-900 bg-white font-bold text-zinc-800 rounded-lg text-xs cursor-pointer hover:bg-zinc-50 transition"
                          >
                            View Profile
                          </button>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center italic text-zinc-400">
                      No customer records matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION FOOTER */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-zinc-150 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} buyers
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 border border-zinc-250 rounded hover:bg-zinc-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-zinc-900">Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 border border-zinc-250 rounded hover:bg-zinc-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* CUSTOMER PROFILE DETAILED CRM VIEW */
        <div className="space-y-6">
          
          {/* TOP BACK BAR & ACTION BUTTONS */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedCust(null)}
                className="p-2 border border-zinc-250 hover:border-zinc-900 rounded-xl bg-white text-zinc-800 transition cursor-pointer"
                title="Back to directory"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-lg border ${
                  selectedCust.isBlocked 
                    ? "bg-red-100 text-red-700 border-red-200" 
                    : "bg-orange-100 text-orange-700 border-orange-200"
                }`}>
                  {selectedCust.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-serif text-zinc-950">{selectedCust.name}</h3>
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                      selectedCust.isBlocked
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {selectedCust.isBlocked ? "Blocked" : (selectedCust.status || "Active")}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono flex items-center gap-3 mt-0.5">
                    <span>{selectedCust.email}</span>
                    <span>•</span>
                    <span>{selectedCust.phone}</span>
                    <span>•</span>
                    <span>Joined {new Date(selectedCust.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="px-3 py-1.5 border border-zinc-250 hover:border-zinc-900 text-zinc-800 bg-white rounded-lg text-xs font-mono font-bold uppercase cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" /> Add Note
              </button>

              <button
                onClick={() => setIsBlockModalOpen(true)}
                className={`px-3 py-1.5 border rounded-lg text-xs font-mono font-bold uppercase cursor-pointer flex items-center gap-1.5 ${
                  selectedCust.isBlocked 
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100" 
                    : "bg-red-50 border-red-300 text-red-800 hover:bg-red-100"
                }`}
              >
                {selectedCust.isBlocked ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                {selectedCust.isBlocked ? "Unblock Account" : "Block Customer"}
              </button>

              <button
                onClick={() => setIsMergeModalOpen(true)}
                className="px-3 py-1.5 border border-zinc-250 hover:border-zinc-900 text-zinc-800 bg-white rounded-lg text-xs font-mono font-bold uppercase cursor-pointer flex items-center gap-1.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Merge Account
              </button>

              <button
                onClick={() => handleExportCSV(selectedCust)}
                className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-mono font-bold uppercase cursor-pointer flex items-center gap-1.5 shadow-2xs hover:bg-zinc-800"
              >
                <Download className="h-3.5 w-3.5" /> Export Profile
              </button>
            </div>

          </div>

          {/* TAGS BAR & ADD TAG BUTTON */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase flex items-center gap-1">
                <TagIcon className="h-3.5 w-3.5" /> Customer Tags:
              </span>
              {(selectedCust.tags || []).map((t) => (
                <span
                  key={t}
                  onClick={() => handleToggleTag(t)}
                  title="Click to remove tag"
                  className="px-2.5 py-1 bg-white border border-zinc-250 rounded-lg text-xs font-mono font-bold text-zinc-800 flex items-center gap-1.5 cursor-pointer hover:border-red-400 hover:text-red-600 transition"
                >
                  {t} <span className="text-zinc-400 hover:text-red-600">✕</span>
                </span>
              ))}
            </div>

            <button
              onClick={() => setIsAddTagOpen(true)}
              className="text-[11px] font-mono font-bold text-orange-600 hover:underline uppercase cursor-pointer flex items-center gap-1 shrink-0"
            >
              + Assign Tag
            </button>
          </div>

          {/* SUB-TABS NAVIGATION */}
          <div className="flex border-b border-zinc-200 gap-2 overflow-x-auto">
            {[
              { id: "overview", label: "Overview & Analytics", icon: Users },
              { id: "addresses", label: "Addresses", icon: MapPin },
              { id: "orders", label: `Order History (${(orderList.filter(o => o.customer?.email?.toLowerCase() === selectedCust.email.toLowerCase())).length})`, icon: ListOrdered },
              { id: "loyalty", label: "Loyalty & Rewards", icon: Award },
              { id: "timeline", label: `Timeline & Notes (${(selectedCust.notes || []).length})`, icon: Clock },
              { id: "support", label: `Support Tickets (${(selectedCust.supportRequests || []).length})`, icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = detailTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id as any)}
                  className={`py-3 px-4 text-xs font-mono font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-zinc-950 text-zinc-950 bg-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* SUB-TAB 1: OVERVIEW & ANALYTICS */}
          {detailTab === "overview" && (
            <div className="space-y-6">
              
              {/* METRIC CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Lifetime Revenue</span>
                  <div className="text-2xl font-black text-zinc-950 font-mono">₹{(selectedCust.totalSpend || 0).toLocaleString("en-IN")}</div>
                  <span className="text-[10px] text-zinc-500">across {selectedCust.totalOrders || 0} completed orders</span>
                </div>

                <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Average Order Value</span>
                  <div className="text-2xl font-black text-indigo-600 font-mono">₹{(selectedCust.avgOrderValue || 0).toLocaleString("en-IN")}</div>
                  <span className="text-[10px] text-zinc-500">AOV benchmark</span>
                </div>

                <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-orange-600">Reward Points Balance</span>
                  <div className="text-2xl font-black text-orange-600 font-mono">{selectedCust.rewardPoints || 0} pts</div>
                  <span className="text-[10px] text-zinc-500">Tier: {selectedCust.rewardPoints && selectedCust.rewardPoints > 1000 ? "Gold VIP" : "Standard"}</span>
                </div>

                <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-600">Store Credit Balance</span>
                  <div className="text-2xl font-black text-emerald-600 font-mono">₹{(selectedCust.storeCredit || 0).toLocaleString("en-IN")}</div>
                  <span className="text-[10px] text-zinc-500">Available for checkout</span>
                </div>

              </div>

              {/* MARKETING CONSENT & PREFERENCES */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold font-mono uppercase text-zinc-900 tracking-wider flex items-center gap-2">
                  <Mail className="h-4 w-4 text-zinc-700" /> Marketing & Communication Preferences
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { key: "emailOptIn", label: "Email Opt-In", desc: "Promotional newsletters & style guides" },
                    { key: "smsOptIn", label: "SMS Opt-In", desc: "Dispatch SMS & flash sale alerts" },
                    { key: "whatsappOptIn", label: "WhatsApp Opt-In", desc: "Order updates & VIP concierge" },
                    { key: "newsletter", label: "Editorial Newsletter", desc: "Weekly fashion edits subscription" }
                  ].map(item => {
                    const consent = selectedCust.marketingConsent || { emailOptIn: true, smsOptIn: true, whatsappOptIn: true, newsletter: true };
                    const isSubscribed = consent[item.key as keyof MarketingConsent];

                    return (
                      <div key={item.key} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-xs text-zinc-950">{item.label}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
                        </div>
                        <button
                          onClick={() => handleToggleConsent(item.key as keyof MarketingConsent)}
                          className={`w-10 h-5 rounded-full p-0.5 transition cursor-pointer shrink-0 ${
                            isSubscribed ? "bg-emerald-600" : "bg-zinc-300"
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-xs transform transition ${
                            isSubscribed ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* WISHLIST PREVIEW */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold font-mono uppercase text-zinc-900 tracking-wider flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" /> Active Customer Wishlist ({(selectedCust.wishlist || []).length})
                </h4>

                {(selectedCust.wishlist || []).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(selectedCust.wishlist || []).map((sku, idx) => {
                      const matchedProd = productList.find(p => p.id === sku || p.slug === sku);
                      return (
                        <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-3">
                          <img 
                            src={matchedProd?.images?.[0] || "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png"} 
                            alt="" 
                            className="h-12 w-10 object-cover rounded border border-zinc-200 bg-white"
                          />
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs text-zinc-950 truncate">{matchedProd?.name || sku.replace("prod-", "CLINZA ").toUpperCase()}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">₹{(matchedProd?.price || 2999).toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No products saved in wishlist.</p>
                )}
              </div>

            </div>
          )}

          {/* SUB-TAB 2: ADDRESSES */}
          {detailTab === "addresses" && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 shadow-2xs">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-xs font-bold font-mono uppercase text-zinc-900 tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-700" /> Saved Customer Addresses
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedCust.shippingAddresses || []).length > 0 ? (
                  selectedCust.shippingAddresses!.map((addr, idx) => (
                    <div key={idx} className="p-4 bg-zinc-50 border border-zinc-250 rounded-xl space-y-2 relative">
                      {addr.isDefault && (
                        <span className="absolute top-3 right-3 text-[9px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                          Default Shipping
                        </span>
                      )}
                      <div className="font-bold text-xs text-zinc-950">{addr.name} ({addr.phone})</div>
                      <div className="text-xs text-zinc-600 leading-relaxed font-sans">{addr.addressLine}</div>
                      <div className="text-xs font-mono text-zinc-500">{addr.city}, {addr.state} - {addr.pincode}</div>
                    </div>
                  ))
                ) : (selectedCust.addressBook || []).length > 0 ? (
                  selectedCust.addressBook.map((addrStr, idx) => (
                    <div key={idx} className="p-4 bg-zinc-50 border border-zinc-250 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">Saved Address #{idx + 1}</span>
                      <div className="text-xs text-zinc-800 leading-relaxed font-sans">{addrStr}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-zinc-400 col-span-2">No saved address records found for this buyer.</p>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: ORDER HISTORY */}
          {detailTab === "orders" && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-2xs">
              <h4 className="text-xs font-bold font-mono uppercase text-zinc-900 tracking-wider flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-zinc-700" /> Apparel Order History
              </h4>

              {(() => {
                const custOrders = orderList.filter(o => 
                  o.customer?.email?.toLowerCase() === selectedCust.email.toLowerCase() ||
                  o.customer?.phone === selectedCust.phone
                );

                if (custOrders.length === 0) {
                  return (
                    <p className="text-xs text-zinc-400 italic py-6 text-center">
                      No online store orders linked to email ({selectedCust.email}).
                    </p>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left min-w-[700px]">
                      <thead className="bg-zinc-50 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b">
                        <tr>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Items Purchased</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                          <th className="py-3 px-4">Order Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-150">
                        {custOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-zinc-50/50">
                            <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">
                              {ord.id}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-zinc-500">
                              {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 font-sans text-zinc-800">
                              {(ord.items || []).map((i, idx) => (
                                <span key={idx} className="block text-[11px]">
                                  • {i.name} ({i.size}, {i.color}) x{i.quantity}
                                </span>
                              ))}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-950">
                              ₹{ord.totalAmount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-block text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-zinc-100 text-zinc-800 border border-zinc-250">
                                {ord.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SUB-TAB 4: LOYALTY & REWARDS */}
          {detailTab === "loyalty" && (
            <div className="space-y-6">
              
              {/* POINTS & CREDITS CONTROLS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Reward Points Box */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="text-xs font-bold font-mono uppercase text-orange-600 flex items-center gap-2">
                      <Award className="h-4 w-4" /> Reward Points Engine
                    </h4>
                    <span className="text-xl font-black font-mono text-zinc-950">{selectedCust.rewardPoints || 0} pts</span>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400">Manual Points Adjustment</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={pointAdjAmount}
                        onChange={(e) => setPointAdjAmount(Number(e.target.value))}
                        className="w-28 bg-zinc-50 border border-zinc-250 p-2 rounded-lg font-mono font-bold text-xs"
                      />
                      <button
                        onClick={() => handleAdjustPoints("add")}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                      >
                        + Award Points
                      </button>
                      <button
                        onClick={() => handleAdjustPoints("deduct")}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                      >
                        - Deduct
                      </button>
                    </div>
                  </div>
                </div>

                {/* Store Credit Box */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="text-xs font-bold font-mono uppercase text-emerald-600 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Store Credit Wallet
                    </h4>
                    <span className="text-xl font-black font-mono text-zinc-950">₹{(selectedCust.storeCredit || 0).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400">Manual Credit Adjustment</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={creditAdjAmount}
                        onChange={(e) => setCreditAdjAmount(Number(e.target.value))}
                        className="w-28 bg-zinc-50 border border-zinc-250 p-2 rounded-lg font-mono font-bold text-xs"
                      />
                      <button
                        onClick={() => handleAdjustStoreCredit("add")}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                      >
                        + Add Credit
                      </button>
                      <button
                        onClick={() => handleAdjustStoreCredit("deduct")}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                      >
                        - Deduct
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* REFERRAL CODE & LINK */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 shadow-2xs">
                <h4 className="text-xs font-bold font-mono uppercase text-zinc-900 flex items-center gap-2">
                  <Gift className="h-4 w-4 text-purple-600" /> Customer Referral System
                </h4>
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Unique Referral Code</span>
                    <span className="text-base font-black font-mono text-zinc-950">{selectedCust.referralCode}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCust.referralCode || "");
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-4 py-2 border border-zinc-250 hover:border-zinc-900 bg-white font-mono font-bold text-xs text-zinc-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedCode ? "Copied Code!" : "Copy Referral Code"}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SUB-TAB 5: TIMELINE & NOTES */}
          {detailTab === "timeline" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Admin Notes */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="text-xs font-bold font-mono uppercase text-zinc-900 tracking-wider">Internal Admin Notes</h4>
                  <button
                    onClick={() => setIsNoteModalOpen(true)}
                    className="text-[11px] font-mono font-bold text-orange-600 hover:underline uppercase cursor-pointer"
                  >
                    + Add Note
                  </button>
                </div>

                {(selectedCust.notes || []).length > 0 ? (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {selectedCust.notes!.map((note) => (
                      <div key={note.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                          <span className="font-bold text-zinc-700">{note.user}</span>
                          <span>{new Date(note.date).toLocaleString("en-IN")}</span>
                        </div>
                        <p className="text-xs text-zinc-800 leading-relaxed font-sans">{note.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic py-6 text-center">No internal admin notes recorded yet.</p>
                )}
              </div>

              {/* Activity Timeline */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold font-mono uppercase text-zinc-900 tracking-wider border-b pb-3">
                  Customer Activity Audit Log
                </h4>

                <div className="space-y-4 relative pl-4 border-l border-zinc-200">
                  {(selectedCust.timeline || []).map((tl) => (
                    <div key={tl.id} className="relative space-y-1">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-900 border-2 border-white" />
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span className="font-bold text-zinc-950 uppercase">{tl.title}</span>
                        <span>{new Date(tl.timestamp).toLocaleDateString("en-IN")}</span>
                      </div>
                      <p className="text-xs text-zinc-600 font-sans">{tl.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SUB-TAB 6: SUPPORT TICKETS */}
          {detailTab === "support" && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-2xs">
              <h4 className="text-xs font-bold font-mono uppercase text-zinc-900 tracking-wider flex items-center gap-2 border-b pb-3">
                <MessageSquare className="h-4 w-4 text-zinc-700" /> Customer Support Log
              </h4>

              {(selectedCust.supportRequests || []).length > 0 ? (
                <div className="space-y-3">
                  {selectedCust.supportRequests!.map((sup) => (
                    <div key={sup.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-xs text-zinc-950">{sup.subject}</div>
                        <div className="text-[10px] font-mono text-zinc-400 mt-0.5">Submitted on {sup.date}</div>
                      </div>
                      <select
                        value={sup.status}
                        onChange={(e) => {
                          const updatedSupport = selectedCust.supportRequests!.map(s => s.id === sup.id ? { ...s, status: e.target.value as any } : s);
                          saveCustomerProfileUpdate({ ...selectedCust, supportRequests: updatedSupport });
                        }}
                        className="bg-white border border-zinc-250 py-1 px-3 rounded-lg text-xs font-mono font-bold"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic py-6 text-center">No active or historic support tickets.</p>
              )}
            </div>
          )}

        </div>
      )}

      {/* MODAL 1: ADD NOTE */}
      {isNoteModalOpen && selectedCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-zinc-900 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-xs uppercase font-mono tracking-wider">Add Internal Admin Note</h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 font-bold text-base cursor-pointer">✕</button>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Customer Note Text</label>
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write internal notes about size preferences, call history, or special requests..."
                className="w-full bg-zinc-50 border border-zinc-250 p-3 rounded-xl text-xs focus:outline-none focus:border-zinc-900 font-sans"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 border text-xs font-bold rounded-lg cursor-pointer">Cancel</button>
              <button onClick={handleAddNote} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg cursor-pointer">Save Note</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BLOCK / UNBLOCK */}
      {isBlockModalOpen && selectedCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-zinc-900 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-xs uppercase font-mono tracking-wider">
                {selectedCust.isBlocked ? "Unblock Customer Account" : "Block Customer Account"}
              </h3>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 font-bold text-base cursor-pointer">✕</button>
            </div>
            {!selectedCust.isBlocked && (
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Reason for Blocking</label>
                <input
                  type="text"
                  value={blockReasonText}
                  onChange={(e) => setBlockReasonText(e.target.value)}
                  placeholder="e.g. Excessive COD non-acceptance, fraudulent returns..."
                  className="w-full bg-zinc-50 border border-zinc-250 p-2.5 rounded-lg text-xs"
                />
              </div>
            )}
            <p className="text-xs text-zinc-600 font-sans">
              {selectedCust.isBlocked 
                ? "Unblocking will restore normal checkout and account access for this customer." 
                : "Blocking will restrict checkout capability for this customer profile across the store."}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsBlockModalOpen(false)} className="px-4 py-2 border text-xs font-bold rounded-lg cursor-pointer">Cancel</button>
              <button 
                onClick={handleToggleBlock} 
                className={`px-4 py-2 text-white text-xs font-bold rounded-lg cursor-pointer ${
                  selectedCust.isBlocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirm {selectedCust.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MERGE ACCOUNTS */}
      {isMergeModalOpen && selectedCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-zinc-900 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-xs uppercase font-mono tracking-wider">Merge Duplicate Customer Account</h3>
              <button onClick={() => setIsMergeModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 font-bold text-base cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-sans">
              Select duplicate customer profile to merge into <span className="font-bold text-zinc-950">{selectedCust.name}</span>. Total spending, addresses, notes, and reward points will be combined.
            </p>
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Target Customer Profile</label>
              <select
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-250 p-2.5 rounded-lg text-xs font-sans font-bold"
              >
                <option value="">-- Select Duplicate Account --</option>
                {customers.filter(c => c.id !== selectedCust.id).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email}) - Spend: ₹{c.totalSpend}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsMergeModalOpen(false)} className="px-4 py-2 border text-xs font-bold rounded-lg cursor-pointer">Cancel</button>
              <button 
                disabled={!mergeTargetId}
                onClick={handleMergeCustomers} 
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Merge Profiles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ASSIGN CUSTOM TAG */}
      {isAddTagOpen && selectedCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 text-zinc-900 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-xs uppercase font-mono tracking-wider">Assign Customer Tag</h3>
              <button onClick={() => setIsAddTagOpen(false)} className="text-zinc-400 hover:text-zinc-900 font-bold text-base cursor-pointer">✕</button>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400">Preset Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAGS.map(pt => {
                  const isAssigned = (selectedCust.tags || []).includes(pt);
                  return (
                    <button
                      key={pt}
                      onClick={() => handleToggleTag(pt)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg cursor-pointer transition ${
                        isAssigned 
                          ? "bg-zinc-900 text-white" 
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      }`}
                    >
                      {isAssigned ? `✓ ${pt}` : pt}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleAddCustomTag} className="space-y-3 border-t pt-3">
              <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400">Or Custom Tag</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Influencer, Stylist..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  className="flex-1 bg-zinc-50 border border-zinc-250 p-2 rounded-lg text-xs"
                />
                <button type="submit" className="px-3 py-2 bg-zinc-900 text-white font-bold text-xs rounded-lg cursor-pointer">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
