/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, CheckCheck, Phone, Video, MoreVertical, Send, ShieldCheck } from "lucide-react";
import { WhatsAppAutomationConfig } from "../../../types/automation";

interface WhatsAppPreviewProps {
  config: WhatsAppAutomationConfig;
  sampleVariables?: Record<string, string>;
}

export default function WhatsAppPreview({ config, sampleVariables }: WhatsAppPreviewProps) {
  // Replace template {{variables}} with sample data
  const replaceVars = (str: string) => {
    let result = str;
    const defaults: Record<string, string> = {
      Customer_Name: "Rahul Sharma",
      Order_Number: "CLI-9482",
      Amount: "4,299",
      Product_Name: "Pure Italian Linen Shirt - Olive",
      Tracking_Link: "https://www.clinza.in/track/CLI-9482",
      Payment_Method: "UPI / GPay",
      AWB_Number: "BD-8829104",
      Courier_Name: "Bluedart Express",
      Estimated_Date: "28th July",
      Delivery_OTP: "8492",
      Agent_Phone: "+91 98765 43210",
      Invoice_Url: "https://www.clinza.in/invoice/CLI-9482",
      Payment_Ref: "TXN-9981244",
      Delivery_Address: "402 Royal Heights, Bandra West, Mumbai 400050",
      Discount_Code: "WELCOME10",
      Product_Slug: "pure-italian-linen-shirt-olive",
      Size: "L",
      ...sampleVariables
    };

    Object.entries(defaults).forEach(([key, val]) => {
      result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), val);
    });

    return result;
  };

  const processedBody = replaceVars(config.messageBody || "");

  return (
    <div className="w-full max-w-[340px] mx-auto bg-zinc-900 rounded-[32px] p-3 border-4 border-zinc-800 shadow-2xl font-sans text-xs">
      {/* Phone Notch / Speaker */}
      <div className="w-28 h-4 bg-zinc-950 mx-auto rounded-b-xl mb-2 flex items-center justify-center">
        <div className="w-10 h-1 bg-zinc-800 rounded-full"></div>
      </div>

      {/* WhatsApp Header */}
      <div className="bg-[#075e54] text-white px-3 py-2 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center font-bold text-[10px] text-white border border-orange-400">
            C
          </div>
          <div>
            <h4 className="font-bold text-[11px] leading-tight flex items-center gap-1">
              CLINZA Official <ShieldCheck className="h-3 w-3 text-emerald-300 fill-emerald-400/20" />
            </h4>
            <span className="text-[9px] text-emerald-200 block">WhatsApp Business Account</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-200">
          <Phone className="h-3.5 w-3.5" />
          <Video className="h-3.5 w-3.5" />
          <MoreVertical className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* WhatsApp Chat Wall */}
      <div className="bg-[#0b141a] p-3 min-h-[360px] max-h-[420px] overflow-y-auto space-y-2.5 rounded-b-xl border-t border-zinc-800/50">
        
        {/* Date Divider */}
        <div className="text-center my-1">
          <span className="bg-[#182229] text-[9px] font-mono text-zinc-400 px-2 py-0.5 rounded-md shadow-sm uppercase">
            Today
          </span>
        </div>

        {/* Business Message Bubble */}
        <div className="bg-[#202c33] text-zinc-100 p-3 rounded-2xl rounded-tl-xs max-w-[92%] shadow-md border border-zinc-800/80 text-left font-sans text-[11px] space-y-2">
          
          {/* Header Image if present */}
          {config.headerType === "IMAGE" && config.headerMediaUrl && (
            <div className="rounded-lg overflow-hidden border border-zinc-700/60 mb-2">
              <img src={config.headerMediaUrl} alt="Header" className="w-full h-28 object-cover" />
            </div>
          )}

          {/* Header Text */}
          {config.headerType === "TEXT" && config.headerText && (
            <div className="font-bold text-emerald-400 border-b border-zinc-700/50 pb-1 text-[11px]">
              {replaceVars(config.headerText)}
            </div>
          )}

          {/* Body Text */}
          <div className="whitespace-pre-wrap leading-relaxed text-zinc-200 font-normal">
            {processedBody}
          </div>

          {/* Footer Text */}
          {config.footerText && (
            <div className="text-[9px] text-zinc-400 pt-1 border-t border-zinc-800">
              {replaceVars(config.footerText)}
            </div>
          )}

          {/* Timestamp & Double Checkmark */}
          <div className="flex items-center justify-end gap-1 text-[8px] text-zinc-400 font-mono mt-1">
            <span>12:45 PM</span>
            <CheckCheck className="h-3 w-3 text-sky-400" />
          </div>
        </div>

        {/* WhatsApp Template Interactive Buttons */}
        {config.buttons && config.buttons.length > 0 && (
          <div className="space-y-1.5 max-w-[92%]">
            {config.buttons.map((btn, idx) => (
              <div 
                key={idx}
                className="bg-[#202c33] hover:bg-[#2a3942] text-sky-400 border border-zinc-800 py-1.5 px-3 rounded-xl text-center font-bold text-[10px] shadow-sm flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <span>{btn.text}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
