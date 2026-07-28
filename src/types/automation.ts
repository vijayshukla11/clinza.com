/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WhatsAppTemplateId = 
  | "welcome_message"
  | "order_confirmation"
  | "payment_confirmation"
  | "order_packed"
  | "order_shipped"
  | "out_for_delivery"
  | "order_delivered"
  | "cod_reminder"
  | "abandoned_cart_reminder"
  | "review_request"
  | "back_in_stock"
  | "promotional_broadcasts";

export interface WhatsAppAutomationConfig {
  id: WhatsAppTemplateId;
  name: string;
  description: string;
  enabled: boolean;
  templateName: string;
  language: string; // e.g. 'en_US', 'hi_IN'
  delayMinutes: number; // 0 for immediate
  headerType: "NONE" | "TEXT" | "IMAGE" | "DOCUMENT";
  headerText?: string;
  headerMediaUrl?: string;
  messageBody: string; // Dynamic template text with {{variables}}
  footerText?: string;
  buttons?: { type: "URL" | "PHONE_NUMBER" | "QUICK_REPLY"; text: string; value: string }[];
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  updatedAt: string;
}

export type EmailWorkflowId = 
  | "welcome_email"
  | "order_confirmation"
  | "invoice"
  | "shipping_update"
  | "delivery_confirmation"
  | "review_request"
  | "abandoned_cart"
  | "wishlist_reminder"
  | "back_in_stock"
  | "birthday_offer"
  | "winback_campaign";

export interface EmailAutomationConfig {
  id: EmailWorkflowId;
  name: string;
  description: string;
  enabled: boolean;
  subject: string;
  previewText: string;
  senderName: string;
  replyToEmail: string;
  delayMinutes: number;
  htmlTemplate: string;
  plainTextBody?: string;
  category: "TRANSACTIONAL" | "MARKETING" | "RETENTION";
  updatedAt: string;
}

export interface AutomationLog {
  id: string;
  channel: "WHATSAPP" | "EMAIL";
  automationId: string;
  automationName: string;
  recipient: string;
  recipientName: string;
  status: "QUEUED" | "SENT" | "DELIVERED" | "READ" | "OPENED" | "CLICKED" | "FAILED";
  errorDetails?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AutomationAnalytics {
  totalMessagesSent: number;
  totalEmailsSent: number;
  deliverySuccessRate: number; // percentage
  failedMessagesCount: number;
  openRate: number; // percentage
  clickRate: number; // percentage
  revenueGenerated: number; // in INR
}

export interface WhatsAppSettings {
  provider: "META_CLOUD_API" | "TWILIO" | "WATI" | "GUPSHUP";
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  businessPhoneNumber: string;
  webhookVerifyToken: string;
  sandboxMode: boolean;
}

export interface SmtpSettings {
  provider: "SMTP" | "RESEND" | "SENDGRID" | "AWS_SES";
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
}

export interface AutomationGlobalSettings {
  whatsApp: WhatsAppSettings;
  smtp: SmtpSettings;
  quietHours: {
    enabled: boolean;
    startTime: string; // e.g. "22:00"
    endTime: string;   // e.g. "08:00"
    timezone: string;
  };
  retryPolicy: {
    maxAttempts: number;
    backoffMinutes: number;
  };
  defaultLanguage: string;
  fallbackChannelEnabled: boolean;
}
