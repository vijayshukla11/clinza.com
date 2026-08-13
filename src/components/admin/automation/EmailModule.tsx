/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Mail, 
  Send, 
  Clock, 
  Code2, 
  Eye, 
  Save, 
  Play, 
  Sparkles, 
  Laptop, 
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { EmailAutomationConfig, SmtpSettings, AutomationLog } from "../../../types/automation";
import { defaultEmailAdapter } from "../../../services/automation/adapters";

interface EmailModuleProps {
  workflows: EmailAutomationConfig[];
  settings: SmtpSettings;
  onSaveWorkflow: (updated: EmailAutomationConfig) => void;
  onLogDispatch: (log: AutomationLog) => void;
}

const EMAIL_VARIABLES = [
  { tag: "{{Customer_Name}}", label: "Customer Full Name" },
  { tag: "{{Order_Number}}", label: "Order ID (e.g. CLI-9482)" },
  { tag: "{{Amount}}", label: "Order Total INR" },
  { tag: "{{Product_Name}}", label: "Product Title" },
  { tag: "{{Tracking_Link}}", label: "AWB Tracking URL" },
  { tag: "{{Courier_Name}}", label: "Courier Partner Name" },
  { tag: "{{AWB_Number}}", label: "AWB Tracking Code" },
  { tag: "{{Invoice_PDF}}", label: "Tax Invoice Attachment Link" },
  { tag: "{{Discount_Code}}", label: "Voucher Promo Code" },
  { tag: "{{Unsubscribe_Url}}", label: "Unsubscribe Opt-out Link" }
];

export default function EmailModule({
  workflows,
  settings,
  onSaveWorkflow,
  onLogDispatch
}: EmailModuleProps) {
  const [selectedId, setSelectedId] = useState<string>(workflows[0]?.id || "welcome_email");
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("concierge@clinza.in");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; msg?: string } | null>(null);

  const activeWorkflow = workflows.find((w) => w.id === selectedId) || workflows[0];
  const [draft, setDraft] = useState<EmailAutomationConfig>(activeWorkflow);

  React.useEffect(() => {
    const current = workflows.find((w) => w.id === selectedId) || workflows[0];
    if (current) {
      setDraft(current);
    }
  }, [selectedId, workflows]);

  const handleInsertVariable = (varTag: string) => {
    setDraft((prev) => ({
      ...prev,
      htmlTemplate: prev.htmlTemplate + `\n${varTag}`
    }));
  };

  const handleSave = () => {
    onSaveWorkflow(draft);
    alert(`Email Workflow '${draft.name}' saved successfully!`);
  };

  const handleTestSend = async () => {
    if (!testEmailAddress.trim() || !testEmailAddress.includes("@")) {
      alert("Please enter a valid destination email address.");
      return;
    }

    setSendingTest(true);
    setTestResult(null);

    const result = await defaultEmailAdapter.sendEmail(
      {
        toEmail: testEmailAddress,
        subject: `[TEST] ${draft.subject}`,
        htmlBody: draft.htmlTemplate,
        replyTo: draft.replyToEmail
      },
      settings
    );

    setSendingTest(false);
    if (result.success) {
      setTestResult({
        success: true,
        msg: `Test email dispatched via ${settings.provider}! Message ID: ${result.messageId}`
      });

      onLogDispatch({
        id: `log_email_${Date.now()}`,
        channel: "EMAIL",
        automationId: draft.id,
        automationName: draft.name,
        recipient: testEmailAddress,
        recipientName: "Test Recipient",
        status: "DELIVERED",
        timestamp: new Date().toISOString()
      });
    } else {
      setTestResult({
        success: false,
        msg: result.error || "Failed to dispatch test email."
      });
    }
  };

  // Process HTML for preview with default variable values
  const getProcessedHtml = () => {
    let processed = draft.htmlTemplate || "";
    const defaults: Record<string, string> = {
      Customer_Name: "Rahul Sharma",
      Order_Number: "CLI-9482",
      Amount: "4,299",
      Product_Name: "Pure Italian Linen Shirt - Olive",
      Tracking_Link: "https://www.clinza.in/track/CLI-9482",
      Courier_Name: "Bluedart Express",
      AWB_Number: "BD-8829104",
      Estimated_Date: "28th July",
      Invoice_PDF: "https://www.clinza.in/invoice/CLI-9482.pdf",
      Discount_Code: "WELCOME10",
      Unsubscribe_Url: "https://www.clinza.in/unsubscribe"
    };

    Object.entries(defaults).forEach(([key, val]) => {
      processed = processed.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), val);
    });

    return processed;
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-400" /> Email Workflow Automation
          </h2>
          <p className="text-xs text-zinc-400">
            Design transactional emails, HTML notifications, and automated retention campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTestModalOpen(true)}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-indigo-400" />
            <span>Test Send Email</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <Save className="h-4 w-4" />
            <span>Save Workflow</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* L.H.S: WORKFLOW SELECTOR LIST (3 cols) */}
        <div className="lg:col-span-3 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-2 max-h-[720px] overflow-y-auto">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 px-2 block mb-2">
            11 Standard Email Workflows ({workflows.filter(w => w.enabled).length} Active)
          </span>

          {workflows.map((wf) => {
            const isSelected = wf.id === selectedId;
            return (
              <button
                key={wf.id}
                onClick={() => setSelectedId(wf.id)}
                className={`w-full text-left p-3 rounded-xl transition cursor-pointer flex items-center justify-between gap-2 border ${
                  isSelected 
                    ? "bg-indigo-950/40 border-indigo-500/50 text-white shadow-md shadow-indigo-950/30" 
                    : "bg-zinc-900/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                <div className="truncate space-y-1">
                  <span className="font-bold text-xs truncate block">{wf.name}</span>
                  <p className="text-[10px] text-zinc-400 truncate">{wf.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      wf.enabled ? "bg-indigo-400 shadow-sm shadow-indigo-400" : "bg-zinc-700"
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
              <span className="text-[9px] font-mono font-bold uppercase text-indigo-400">
                Type: {draft.category}
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
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Workflow Parameters */}
          <div className="space-y-4 text-xs font-mono">
            
            {/* Subject Line & Preview Text */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Email Subject Line</label>
              <input
                type="text"
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-sans focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Preheader / Preview Text</label>
              <input
                type="text"
                value={draft.previewText}
                onChange={(e) => setDraft({ ...draft, previewText: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-sans text-[11px] focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Sender Name & Reply-To */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Sender Name</label>
                <input
                  type="text"
                  value={draft.senderName}
                  onChange={(e) => setDraft({ ...draft, senderName: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-sans focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Reply-To Email</label>
                <input
                  type="text"
                  value={draft.replyToEmail}
                  onChange={(e) => setDraft({ ...draft, replyToEmail: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Trigger Delay Offset */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-indigo-400" /> Dispatch Trigger Delay Offset
              </label>
              <select
                value={draft.delayMinutes}
                onChange={(e) => setDraft({ ...draft, delayMinutes: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={0}>Immediate (0 min - Realtime Event)</option>
                <option value={15}>15 Minutes Delay</option>
                <option value={60}>1 Hour Delay (Cart Recovery)</option>
                <option value={1440}>24 Hours Delay</option>
                <option value={4320}>3 Days Delay (Review Request)</option>
              </select>
            </div>

            {/* Variable Tags */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Dynamic Email Template Variables</label>
              <div className="flex flex-wrap gap-1.5">
                {EMAIL_VARIABLES.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => handleInsertVariable(v.tag)}
                    className="px-2 py-1 bg-zinc-900 hover:bg-indigo-950 hover:text-indigo-300 border border-zinc-800 text-zinc-400 rounded text-[10px] transition cursor-pointer"
                    title={v.label}
                  >
                    + {v.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Editor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-zinc-400 uppercase">HTML & Responsive Email Code</label>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setEditorMode("visual")}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      editorMode === "visual" ? "bg-indigo-600 text-white font-bold" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    Visual Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("html")}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      editorMode === "html" ? "bg-indigo-600 text-white font-bold" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    Raw Source
                  </button>
                </div>
              </div>

              <textarea
                rows={11}
                value={draft.htmlTemplate}
                onChange={(e) => setDraft({ ...draft, htmlTemplate: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px] leading-relaxed"
              />
            </div>

          </div>
        </div>

        {/* R.H.S: LIVE DESKTOP / MOBILE EMAIL PREVIEW (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">
              Live HTML Email Canvas Preview
            </span>

            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg">
              <button
                onClick={() => setPreviewViewport("desktop")}
                className={`p-1 rounded cursor-pointer ${
                  previewViewport === "desktop" ? "bg-indigo-600 text-white" : "text-zinc-500"
                }`}
                title="Desktop View"
              >
                <Laptop className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPreviewViewport("mobile")}
                className={`p-1 rounded cursor-pointer ${
                  previewViewport === "mobile" ? "bg-indigo-600 text-white" : "text-zinc-500"
                }`}
                title="Mobile View"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div
            className={`mx-auto bg-white rounded-xl overflow-hidden shadow-2xl transition-all border border-zinc-800 ${
              previewViewport === "mobile" ? "max-w-[320px] h-[480px]" : "w-full h-[540px]"
            }`}
          >
            <iframe
              title="Email Live Preview"
              srcDoc={getProcessedHtml()}
              className="w-full h-full border-0"
            />
          </div>
        </div>

      </div>

      {/* TEST SEND EMAIL MODAL */}
      {testModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-indigo-400" /> Test Dispatch: {draft.name}
              </h3>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-zinc-500 hover:text-white cursor-pointer font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Dispatch a live HTML test email via your configured Gateway ({settings.provider}).
            </p>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Target Email Address</label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="concierge@clinza.in"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-lg cursor-pointer transition flex items-center gap-1.5"
              >
                {sendingTest ? "Sending Email..." : "Send Test Email"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
