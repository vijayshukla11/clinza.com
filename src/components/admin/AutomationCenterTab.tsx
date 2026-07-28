/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Bot, 
  LayoutDashboard, 
  Smartphone, 
  Mail, 
  Settings, 
  History, 
  Zap, 
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { 
  WhatsAppAutomationConfig, 
  EmailAutomationConfig, 
  AutomationGlobalSettings, 
  AutomationLog, 
  AutomationAnalytics 
} from "../../types/automation";
import { DEFAULT_WHATSAPP_TEMPLATES, DEFAULT_EMAIL_TEMPLATES } from "./automation/defaultTemplates";
import AutomationDashboard from "./automation/AutomationDashboard";
import WhatsAppModule from "./automation/WhatsAppModule";
import EmailModule from "./automation/EmailModule";
import AutomationSettingsModule from "./automation/AutomationSettingsModule";
import AutomationLogsModule from "./automation/AutomationLogsModule";

type SubTab = "dashboard" | "whatsapp" | "email" | "settings" | "logs";

const DEFAULT_GLOBAL_SETTINGS: AutomationGlobalSettings = {
  whatsApp: {
    provider: "META_CLOUD_API",
    phoneNumberId: "10984820194829",
    wabaId: "39201948291048",
    accessToken: "EAAG_CLINZA_PERMANENT_META_TOKEN_PROD",
    businessPhoneNumber: "+91 98765 43210",
    webhookVerifyToken: "clinza_verify_secret_2026",
    sandboxMode: true
  },
  smtp: {
    provider: "RESEND",
    host: "smtp.resend.com",
    port: 587,
    username: "resend",
    password: "re_Clinza_Secure_ApiKey_2026",
    secure: true,
    fromName: "CLINZA Concierge",
    fromEmail: "concierge@clinza.in",
    replyToEmail: "support@clinza.in"
  },
  quietHours: {
    enabled: true,
    startTime: "22:00",
    endTime: "08:00",
    timezone: "Asia/Kolkata"
  },
  retryPolicy: {
    maxAttempts: 3,
    backoffMinutes: 15
  },
  defaultLanguage: "en_IN",
  fallbackChannelEnabled: true
};

const INITIAL_MOCK_LOGS: AutomationLog[] = [
  {
    id: "log_wa_101",
    channel: "WHATSAPP",
    automationId: "order_confirmation",
    automationName: "Order Confirmation",
    recipient: "+91 98765 43210",
    recipientName: "Rahul Sharma",
    status: "READ",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    id: "log_email_102",
    channel: "EMAIL",
    automationId: "welcome_email",
    automationName: "Welcome Email",
    recipient: "rahul.s@example.com",
    recipientName: "Rahul Sharma",
    status: "OPENED",
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString()
  },
  {
    id: "log_wa_103",
    channel: "WHATSAPP",
    automationId: "out_for_delivery",
    automationName: "Out for Delivery",
    recipient: "+91 99887 76655",
    recipientName: "Priya Mehta",
    status: "DELIVERED",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: "log_email_104",
    channel: "EMAIL",
    automationId: "invoice",
    automationName: "Tax Invoice & Bill",
    recipient: "priya.m@example.com",
    recipientName: "Priya Mehta",
    status: "DELIVERED",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: "log_wa_105",
    channel: "WHATSAPP",
    automationId: "abandoned_cart_reminder",
    automationName: "Abandoned Cart Recovery",
    recipient: "+91 91234 56789",
    recipientName: "Anand Verma",
    status: "READ",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  }
];

export default function AutomationCenterTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("dashboard");

  // Load state from localStorage or initial defaults
  const [whatsAppTemplates, setWhatsAppTemplates] = useState<WhatsAppAutomationConfig[]>(() => {
    const saved = localStorage.getItem("clinza_wa_templates");
    return saved ? JSON.parse(saved) : DEFAULT_WHATSAPP_TEMPLATES;
  });

  const [emailWorkflows, setEmailWorkflows] = useState<EmailAutomationConfig[]>(() => {
    const saved = localStorage.getItem("clinza_email_workflows");
    return saved ? JSON.parse(saved) : DEFAULT_EMAIL_TEMPLATES;
  });

  const [globalSettings, setGlobalSettings] = useState<AutomationGlobalSettings>(() => {
    const saved = localStorage.getItem("clinza_automation_settings");
    return saved ? JSON.parse(saved) : DEFAULT_GLOBAL_SETTINGS;
  });

  const [logs, setLogs] = useState<AutomationLog[]>(() => {
    const saved = localStorage.getItem("clinza_automation_logs");
    return saved ? JSON.parse(saved) : INITIAL_MOCK_LOGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("clinza_wa_templates", JSON.stringify(whatsAppTemplates));
  }, [whatsAppTemplates]);

  useEffect(() => {
    localStorage.setItem("clinza_email_workflows", JSON.stringify(emailWorkflows));
  }, [emailWorkflows]);

  useEffect(() => {
    localStorage.setItem("clinza_automation_settings", JSON.stringify(globalSettings));
  }, [globalSettings]);

  useEffect(() => {
    localStorage.setItem("clinza_automation_logs", JSON.stringify(logs));
  }, [logs]);

  // Handlers
  const handleSaveWaTemplate = (updated: WhatsAppAutomationConfig) => {
    setWhatsAppTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleSaveEmailWorkflow = (updated: EmailAutomationConfig) => {
    setEmailWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  const handleSaveGlobalSettings = (updated: AutomationGlobalSettings) => {
    setGlobalSettings(updated);
  };

  const handleLogDispatch = (log: AutomationLog) => {
    setLogs(prev => [log, ...prev]);
  };

  // Compute analytics from current state & logs
  const analytics: AutomationAnalytics = {
    totalMessagesSent: 14820 + logs.filter(l => l.channel === "WHATSAPP").length,
    totalEmailsSent: 28940 + logs.filter(l => l.channel === "EMAIL").length,
    deliverySuccessRate: 98.4,
    failedMessagesCount: 18,
    openRate: 64.8,
    clickRate: 28.2,
    revenueGenerated: 428900
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. TOP MODULE HEADER */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white uppercase tracking-tight">Customer Communication Center</h1>
              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                Automation Center
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Omnichannel customer messaging engine • Meta WhatsApp Business API & SMTP Gateway
            </p>
          </div>
        </div>

        {/* API STATUS BADGES */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">WhatsApp API: Active</span>
          </div>

          <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="font-bold">Resend Gateway: Connected</span>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TAB BAR */}
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeSubTab === "dashboard"
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard & Analytics</span>
        </button>

        <button
          onClick={() => setActiveSubTab("whatsapp")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeSubTab === "whatsapp"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span>WhatsApp Automations (12)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("email")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeSubTab === "email"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Email Workflows (11)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("settings")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeSubTab === "settings"
              ? "bg-zinc-800 text-white shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>API Credentials & Settings</span>
        </button>

        <button
          onClick={() => setActiveSubTab("logs")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeSubTab === "logs"
              ? "bg-zinc-800 text-white shadow-md"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Delivery Logs</span>
        </button>
      </div>

      {/* 3. TAB CONTENT VIEWS */}
      <div>
        {activeSubTab === "dashboard" && (
          <AutomationDashboard
            analytics={analytics}
            recentLogs={logs}
            onNavigateToTab={(tab) => setActiveSubTab(tab as SubTab)}
          />
        )}

        {activeSubTab === "whatsapp" && (
          <WhatsAppModule
            templates={whatsAppTemplates}
            settings={globalSettings.whatsApp}
            onSaveTemplate={handleSaveWaTemplate}
            onLogDispatch={handleLogDispatch}
          />
        )}

        {activeSubTab === "email" && (
          <EmailModule
            workflows={emailWorkflows}
            settings={globalSettings.smtp}
            onSaveWorkflow={handleSaveEmailWorkflow}
            onLogDispatch={handleLogDispatch}
          />
        )}

        {activeSubTab === "settings" && (
          <AutomationSettingsModule
            settings={globalSettings}
            onSaveSettings={handleSaveGlobalSettings}
          />
        )}

        {activeSubTab === "logs" && (
          <AutomationLogsModule
            logs={logs}
            onRefreshLogs={() => {
              const saved = localStorage.getItem("clinza_automation_logs");
              if (saved) setLogs(JSON.parse(saved));
            }}
          />
        )}
      </div>

    </div>
  );
}
