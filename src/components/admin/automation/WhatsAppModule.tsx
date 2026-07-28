/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Smartphone, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Plus, 
  Eye, 
  Save, 
  Sparkles, 
  Tag, 
  AlertCircle,
  Play,
  RotateCcw
} from "lucide-react";
import { WhatsAppAutomationConfig, WhatsAppSettings, AutomationLog } from "../../../types/automation";
import WhatsAppPreview from "./WhatsAppPreview";
import { defaultWhatsAppAdapter } from "../../../services/automation/adapters";

interface WhatsAppModuleProps {
  templates: WhatsAppAutomationConfig[];
  settings: WhatsAppSettings;
  onSaveTemplate: (updated: WhatsAppAutomationConfig) => void;
  onLogDispatch: (log: AutomationLog) => void;
}

const AVAILABLE_VARIABLES = [
  { tag: "{{Customer_Name}}", label: "Customer Full Name" },
  { tag: "{{Order_Number}}", label: "Order ID (e.g. CLI-9482)" },
  { tag: "{{Amount}}", label: "Order Total INR" },
  { tag: "{{Product_Name}}", label: "Product Title" },
  { tag: "{{Tracking_Link}}", label: "AWB Tracking URL" },
  { tag: "{{Courier_Name}}", label: "Courier Partner Name" },
  { tag: "{{AWB_Number}}", label: "AWB Tracking Code" },
  { tag: "{{Delivery_OTP}}", label: "Delivery Verification OTP" },
  { tag: "{{Agent_Phone}}", label: "Driver Contact No" },
  { tag: "{{Discount_Code}}", label: "Promo / Voucher Coupon" }
];

export default function WhatsAppModule({
  templates,
  settings,
  onSaveTemplate,
  onLogDispatch
}: WhatsAppModuleProps) {
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id || "welcome_message");
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState("9876543210");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; msg?: string } | null>(null);

  const activeTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  // Local draft state for active template
  const [draft, setDraft] = useState<WhatsAppAutomationConfig>(activeTemplate);

  // Sync draft when template changes
  React.useEffect(() => {
    const current = templates.find((t) => t.id === selectedId) || templates[0];
    if (current) {
      setDraft(current);
    }
  }, [selectedId, templates]);

  const handleInsertVariable = (varTag: string) => {
    setDraft((prev) => ({
      ...prev,
      messageBody: prev.messageBody + " " + varTag
    }));
  };

  const handleSave = () => {
    onSaveTemplate(draft);
    alert(`WhatsApp Automation '${draft.name}' configuration saved successfully!`);
  };

  const handleTestSend = async () => {
    if (!testPhoneNumber.trim()) {
      alert("Please enter a valid target mobile phone number.");
      return;
    }

    setSendingTest(true);
    setTestResult(null);

    const result = await defaultWhatsAppAdapter.sendTemplateMessage(
      {
        toPhoneNumber: testPhoneNumber,
        templateName: draft.templateName,
        languageCode: draft.language,
        variables: {
          Customer_Name: "Rahul Sharma",
          Order_Number: "CLI-9482",
          Amount: "4,299",
          Product_Name: "Pure Italian Linen Shirt",
          Tracking_Link: "https://clinza.in/track/CLI-9482"
        },
        headerImageUrl: draft.headerMediaUrl
      },
      settings
    );

    setSendingTest(false);
    if (result.success) {
      setTestResult({
        success: true,
        msg: `Test message dispatched successfully! Message ID: ${result.messageId}`
      });

      // Log dispatch
      onLogDispatch({
        id: `log_wa_${Date.now()}`,
        channel: "WHATSAPP",
        automationId: draft.id,
        automationName: draft.name,
        recipient: testPhoneNumber,
        recipientName: "Test Target",
        status: "DELIVERED",
        timestamp: new Date().toISOString()
      });
    } else {
      setTestResult({
        success: false,
        msg: result.error || "Failed to dispatch WhatsApp test message."
      });
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-400" /> WhatsApp Automation Workflows
          </h2>
          <p className="text-xs text-zinc-400">
            Configure automated customer engagement triggers powered by Meta WhatsApp Cloud API
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTestModalOpen(true)}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-emerald-400" />
            <span>Test Send Trigger</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <Save className="h-4 w-4" />
            <span>Save Workflow</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* L.H.S: WORKFLOW SELECTOR LIST (3 cols) */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-2 max-h-[720px] overflow-y-auto">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 px-2 block mb-2">
            12 Standard Trigger Automations ({templates.filter(t => t.enabled).length} Active)
          </span>

          {templates.map((tpl) => {
            const isSelected = tpl.id === selectedId;
            return (
              <button
                key={tpl.id}
                onClick={() => setSelectedId(tpl.id)}
                className={`w-full text-left p-3 rounded-xl transition cursor-pointer flex items-center justify-between gap-2 border ${
                  isSelected 
                    ? "bg-emerald-950/40 border-emerald-500/50 text-white shadow-md shadow-emerald-950/30" 
                    : "bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                <div className="truncate space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs truncate">{tpl.name}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">{tpl.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      tpl.enabled ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-zinc-700"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* MIDDLE: EDITOR PANEL (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-5">
          
          {/* Header & Enable Toggle */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase text-emerald-400">
                Category: {draft.category}
              </span>
              <h3 className="font-bold text-white text-base">{draft.name}</h3>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Configuration Form */}
          <div className="space-y-4 text-xs font-mono">
            
            {/* Meta Template ID & Language */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Meta Template ID</label>
                <input
                  type="text"
                  value={draft.templateName}
                  onChange={(e) => setDraft({ ...draft, templateName: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Language Code</label>
                <select
                  value={draft.language}
                  onChange={(e) => setDraft({ ...draft, language: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="en_US">English (en_US)</option>
                  <option value="hi_IN">Hindi (hi_IN)</option>
                  <option value="en_IN">English India (en_IN)</option>
                </select>
              </div>
            </div>

            {/* Delay Offset Configuration */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-400" /> Trigger Delay Offset
              </label>
              <select
                value={draft.delayMinutes}
                onChange={(e) => setDraft({ ...draft, delayMinutes: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={0}>Immediate (0 min - Realtime Event)</option>
                <option value={15}>15 Minutes Delay</option>
                <option value={30}>30 Minutes Delay (Cart Recovery)</option>
                <option value={60}>1 Hour Delay</option>
                <option value={1440}>24 Hours Delay</option>
                <option value={4320}>3 Days Delay (Review Request)</option>
              </select>
            </div>

            {/* Header Type & Image URL */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Header Type</label>
                <select
                  value={draft.headerType}
                  onChange={(e) => setDraft({ ...draft, headerType: e.target.value as any })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="NONE">None</option>
                  <option value="TEXT">Text Title</option>
                  <option value="IMAGE">Image Media Banner</option>
                </select>
              </div>

              {draft.headerType === "TEXT" && (
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Header Title</label>
                  <input
                    type="text"
                    value={draft.headerText || ""}
                    onChange={(e) => setDraft({ ...draft, headerText: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {draft.headerType === "IMAGE" && (
                <div>
                  <label className="block text-[10px] text-zinc-400 uppercase mb-1">Media Image URL</label>
                  <input
                    type="text"
                    value={draft.headerMediaUrl || ""}
                    onChange={(e) => setDraft({ ...draft, headerMediaUrl: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-[10px]"
                  />
                </div>
              )}
            </div>

            {/* Variable Tag Inserter */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Quick Variable Insertion Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_VARIABLES.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => handleInsertVariable(v.tag)}
                    className="px-2 py-1 bg-zinc-900 hover:bg-emerald-950 hover:text-emerald-300 border border-zinc-800 text-zinc-400 rounded text-[10px] transition cursor-pointer"
                    title={v.label}
                  >
                    + {v.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Editor */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Template Message Body Text</label>
              <textarea
                rows={7}
                value={draft.messageBody}
                onChange={(e) => setDraft({ ...draft, messageBody: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 font-sans text-xs leading-relaxed"
              />
            </div>

            {/* Footer Text */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Footer Legal Text</label>
              <input
                type="text"
                value={draft.footerText || ""}
                onChange={(e) => setDraft({ ...draft, footerText: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

          </div>
        </div>

        {/* R.H.S: LIVE SMARTPHONE PREVIEW (3 cols) */}
        <div className="lg:col-span-3 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block text-center">
            📱 Real-time Smartphone Live WhatsApp Preview
          </span>
          <WhatsAppPreview config={draft} />
        </div>

      </div>

      {/* TEST SEND MODAL */}
      {testModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-emerald-400" /> Test Dispatch: {draft.name}
              </h3>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-zinc-500 hover:text-white cursor-pointer font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Send a real test WhatsApp message to verify template rendering and variable substitution.
            </p>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Recipient Mobile Number (with country code)</label>
              <input
                type="text"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder="e.g. 919876543210"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg text-xs font-mono ${
                testResult.success ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "bg-red-500/10 text-red-300 border border-red-500/30"
              }`}>
                {testResult.msg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-mono rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleTestSend}
                disabled={sendingTest}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg cursor-pointer transition flex items-center gap-1.5"
              >
                {sendingTest ? "Sending API Call..." : "Execute Test Send"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
