/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Settings, 
  Smartphone, 
  Mail, 
  Key, 
  Moon, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Zap, 
  Globe, 
  ShieldCheck,
  Server
} from "lucide-react";
import { AutomationGlobalSettings } from "../../../types/automation";
import { defaultWhatsAppAdapter, defaultEmailAdapter } from "../../../services/automation/adapters";

interface AutomationSettingsModuleProps {
  settings: AutomationGlobalSettings;
  onSaveSettings: (updated: AutomationGlobalSettings) => void;
}

export default function AutomationSettingsModule({
  settings,
  onSaveSettings
}: AutomationSettingsModuleProps) {
  const [draft, setDraft] = useState<AutomationGlobalSettings>(settings);
  const [testingWa, setTestingWa] = useState(false);
  const [waTestResult, setWaTestResult] = useState<{ success?: boolean; msg?: string } | null>(null);

  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success?: boolean; msg?: string } | null>(null);

  const handleSave = () => {
    onSaveSettings(draft);
    alert("Automation Center API credentials & global parameters saved successfully!");
  };

  const handleTestWhatsAppConn = async () => {
    setTestingWa(true);
    setWaTestResult(null);

    const res = await defaultWhatsAppAdapter.testConnection(draft.whatsApp);
    setTestingWa(false);

    if (res.success) {
      setWaTestResult({
        success: true,
        msg: `WhatsApp Provider (${draft.whatsApp.provider}) Connected & Authenticated!`
      });
    } else {
      setWaTestResult({
        success: false,
        msg: res.error || "Failed to verify WhatsApp API credentials."
      });
    }
  };

  const handleTestSmtpConn = async () => {
    setTestingSmtp(true);
    setSmtpTestResult(null);

    const res = await defaultEmailAdapter.testSmtpConnection(draft.smtp);
    setTestingSmtp(false);

    if (res.success) {
      setSmtpTestResult({
        success: true,
        msg: `Email Gateway (${draft.smtp.provider}) Handshake Verified!`
      });
    } else {
      setSmtpTestResult({
        success: false,
        msg: res.error || "Failed to connect to SMTP Host."
      });
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-500" /> Automation Gateway Credentials & Settings
          </h2>
          <p className="text-xs text-zinc-400">
            Configure Meta WhatsApp API keys, SMTP servers, retry policies, and quiet hours
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-lg shadow-orange-600/20 self-start sm:self-auto uppercase"
        >
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. WHATSAPP API CREDENTIALS */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Smartphone className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-white text-sm">WhatsApp Business Gateway</h3>
            </div>

            <button
              onClick={handleTestWhatsAppConn}
              disabled={testingWa}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold rounded cursor-pointer transition"
            >
              {testingWa ? "Testing API..." : "Test Connection"}
            </button>
          </div>

          {waTestResult && (
            <div className={`p-3 rounded-lg text-xs font-mono ${
              waTestResult.success ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "bg-red-500/10 text-red-300 border border-red-500/30"
            }`}>
              {waTestResult.msg}
            </div>
          )}

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Integration Provider</label>
              <select
                value={draft.whatsApp.provider}
                onChange={(e) => setDraft({
                  ...draft,
                  whatsApp: { ...draft.whatsApp, provider: e.target.value as any }
                })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="META_CLOUD_API">Meta WhatsApp Cloud API (Official Direct)</option>
                <option value="TWILIO">Twilio WhatsApp API</option>
                <option value="WATI">WATI WhatsApp Gateway</option>
                <option value="GUPSHUP">Gupshup Enterprise API</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Phone Number ID</label>
                <input
                  type="text"
                  value={draft.whatsApp.phoneNumberId}
                  onChange={(e) => setDraft({
                    ...draft,
                    whatsApp: { ...draft.whatsApp, phoneNumberId: e.target.value }
                  })}
                  placeholder="e.g. 10984820194829"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">WABA Account ID</label>
                <input
                  type="text"
                  value={draft.whatsApp.wabaId}
                  onChange={(e) => setDraft({
                    ...draft,
                    whatsApp: { ...draft.whatsApp, wabaId: e.target.value }
                  })}
                  placeholder="e.g. 39201948291048"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Permanent Access Token</label>
              <input
                type="password"
                value={draft.whatsApp.accessToken}
                onChange={(e) => setDraft({
                  ...draft,
                  whatsApp: { ...draft.whatsApp, accessToken: e.target.value }
                })}
                placeholder="EAAG....."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Business Phone Number</label>
                <input
                  type="text"
                  value={draft.whatsApp.businessPhoneNumber}
                  onChange={(e) => setDraft({
                    ...draft,
                    whatsApp: { ...draft.whatsApp, businessPhoneNumber: e.target.value }
                  })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Webhook Verify Token</label>
                <input
                  type="text"
                  value={draft.whatsApp.webhookVerifyToken}
                  onChange={(e) => setDraft({
                    ...draft,
                    whatsApp: { ...draft.whatsApp, webhookVerifyToken: e.target.value }
                  })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-900">
              <span className="text-zinc-400 text-[11px]">Sandbox / Demo Telemetry Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.whatsApp.sandboxMode}
                  onChange={(e) => setDraft({
                    ...draft,
                    whatsApp: { ...draft.whatsApp, sandboxMode: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 2. SMTP & EMAIL PROVIDER SETTINGS */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Mail className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-white text-sm">SMTP & Email Gateway</h3>
            </div>

            <button
              onClick={handleTestSmtpConn}
              disabled={testingSmtp}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono font-bold rounded cursor-pointer transition"
            >
              {testingSmtp ? "Testing SMTP..." : "Test Gateway"}
            </button>
          </div>

          {smtpTestResult && (
            <div className={`p-3 rounded-lg text-xs font-mono ${
              smtpTestResult.success ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "bg-red-500/10 text-red-300 border border-red-500/30"
            }`}>
              {smtpTestResult.msg}
            </div>
          )}

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">Email Service Provider</label>
              <select
                value={draft.smtp.provider}
                onChange={(e) => setDraft({
                  ...draft,
                  smtp: { ...draft.smtp, provider: e.target.value as any }
                })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="RESEND">Resend Email API (Recommended)</option>
                <option value="SMTP">Custom SMTP Gateway (Gmail / Zoho)</option>
                <option value="SENDGRID">SendGrid API</option>
                <option value="AWS_SES">Amazon SES Service</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={draft.smtp.host}
                  onChange={(e) => setDraft({
                    ...draft,
                    smtp: { ...draft.smtp, host: e.target.value }
                  })}
                  placeholder="smtp.resend.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Port & Security</label>
                <input
                  type="number"
                  value={draft.smtp.port}
                  onChange={(e) => setDraft({
                    ...draft,
                    smtp: { ...draft.smtp, port: Number(e.target.value) }
                  })}
                  placeholder="587"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Username / Access Key</label>
                <input
                  type="text"
                  value={draft.smtp.username}
                  onChange={(e) => setDraft({
                    ...draft,
                    smtp: { ...draft.smtp, username: e.target.value }
                  })}
                  placeholder="resend"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Password / API Key</label>
                <input
                  type="password"
                  value={draft.smtp.password}
                  onChange={(e) => setDraft({
                    ...draft,
                    smtp: { ...draft.smtp, password: e.target.value }
                  })}
                  placeholder="re_xxxxxxxx"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Sender Display Name</label>
                <input
                  type="text"
                  value={draft.smtp.fromName}
                  onChange={(e) => setDraft({
                    ...draft,
                    smtp: { ...draft.smtp, fromName: e.target.value }
                  })}
                  placeholder="CLINZA Concierge"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">From Sender Email</label>
                <input
                  type="email"
                  value={draft.smtp.fromEmail}
                  onChange={(e) => setDraft({
                    ...draft,
                    smtp: { ...draft.smtp, fromEmail: e.target.value }
                  })}
                  placeholder="concierge@clinza.in"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. QUIET HOURS & POLICY CONTROL */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Moon className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Quiet Hours & Night Policy</h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Enable Night Quiet Hours</span>
                <span className="text-[10px] text-zinc-400">Hold promotional broadcasts during sleeping hours</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.quietHours.enabled}
                  onChange={(e) => setDraft({
                    ...draft,
                    quietHours: { ...draft.quietHours, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Start Hour</label>
                <input
                  type="time"
                  value={draft.quietHours.startTime}
                  onChange={(e) => setDraft({
                    ...draft,
                    quietHours: { ...draft.quietHours, startTime: e.target.value }
                  })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">End Hour</label>
                <input
                  type="time"
                  value={draft.quietHours.endTime}
                  onChange={(e) => setDraft({
                    ...draft,
                    quietHours: { ...draft.quietHours, endTime: e.target.value }
                  })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Timezone</label>
                <select
                  value={draft.quietHours.timezone}
                  onChange={(e) => setDraft({
                    ...draft,
                    quietHours: { ...draft.quietHours, timezone: e.target.value }
                  })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Asia/Kolkata">IST (UTC+05:30)</option>
                  <option value="UTC">UTC Universal</option>
                  <option value="America/New_York">EST (UTC-05:00)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 4. RETRY POLICY & FALLBACK */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <RotateCcw className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Retry Policy & Multi-Channel Fallback</h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Max Retry Attempts</label>
                <input
                  type="number"
                  value={draft.retryPolicy.maxAttempts}
                  onChange={(e) => setDraft({
                    ...draft,
                    retryPolicy: { ...draft.retryPolicy, maxAttempts: Number(e.target.value) }
                  })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Backoff Minutes</label>
                <input
                  type="number"
                  value={draft.retryPolicy.backoffMinutes}
                  onChange={(e) => setDraft({
                    ...draft,
                    retryPolicy: { ...draft.retryPolicy, backoffMinutes: Number(e.target.value) }
                  })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <div>
                <span className="font-bold text-white block">Email Fallback Channel</span>
                <span className="text-[10px] text-zinc-400">If WhatsApp delivery fails, dispatch email automatically</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.fallbackChannelEnabled}
                  onChange={(e) => setDraft({ ...draft, fallbackChannelEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
