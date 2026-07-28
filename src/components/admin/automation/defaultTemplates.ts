/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WhatsAppAutomationConfig, EmailAutomationConfig } from "../../../types/automation";

export const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppAutomationConfig[] = [
  {
    id: "welcome_message",
    name: "Welcome Message",
    description: "Greets new customers upon registration or first purchase with a brand introduction & 10% coupon.",
    enabled: true,
    templateName: "clinza_welcome_v1",
    language: "en_US",
    delayMinutes: 0,
    headerType: "IMAGE",
    headerMediaUrl: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    messageBody: "Welcome to CLINZA, {{Customer_Name}}! ✨\n\nThank you for joining our luxury apparel family. As a token of appreciation, enjoy 10% OFF your first order using code *WELCOME10* at checkout.\n\nExplore our latest summer linen and selvedge denim collection now!",
    footerText: "CLINZA Luxury Care • Unsubscribe reply STOP",
    buttons: [
      { type: "URL", text: "Shop New Arrivals", value: "https://clinza.in/collections/new-arrivals" },
      { type: "QUICK_REPLY", text: "Speak to Stylist", value: "TALK_TO_STYLIST" }
    ],
    category: "MARKETING",
    updatedAt: new Date().toISOString()
  },
  {
    id: "order_confirmation",
    name: "Order Confirmation",
    description: "Sent immediately after a new order is placed with item details & order ID.",
    enabled: true,
    templateName: "clinza_order_confirmed_v1",
    language: "en_US",
    delayMinutes: 0,
    headerType: "TEXT",
    headerText: "🛍️ ORDER CONFIRMED",
    messageBody: "Hi {{Customer_Name}},\n\nYour order *{{Order_Number}}* has been received! Total amount: *₹{{Amount}}*.\n\nItems:\n{{Product_Name}}\n\nWe are carefully tailoring and preparing your shipment. You can view real-time status anytime:",
    footerText: "Thank you for shopping with CLINZA",
    buttons: [
      { type: "URL", text: "Track Order Status", value: "{{Tracking_Link}}" }
    ],
    category: "UTILITY",
    updatedAt: new Date().toISOString()
  },
  {
    id: "payment_confirmation",
    name: "Payment Confirmation",
    description: "Notifies customer of successful online payment (UPI, Card, NetBanking).",
    enabled: true,
    templateName: "clinza_payment_success_v1",
    language: "en_US",
    delayMinutes: 0,
    headerType: "TEXT",
    headerText: "💳 PAYMENT RECEIVED",
    messageBody: "Dear {{Customer_Name}},\n\nPayment of *₹{{Amount}}* for Order *{{Order_Number}}* was successfully processed.\n\nTransaction Ref: {{Payment_Ref}}\nPayment Method: {{Payment_Method}}\n\nYour order is now moving to fulfillment.",
    footerText: "CLINZA Billing • GST Invoice Attached",
    buttons: [
      { type: "URL", text: "Download GST Invoice", value: "{{Invoice_Url}}" }
    ],
    category: "UTILITY",
    updatedAt: new Date().toISOString()
  },
  {
    id: "order_packed",
    name: "Order Packed",
    description: "Sent when order items are packed into luxury boxes and ready for dispatch.",
    enabled: true,
    templateName: "clinza_order_packed_v1",
    language: "en_US",
    delayMinutes: 0,
    headerType: "NONE",
    messageBody: "Great news, {{Customer_Name}}! 📦\n\nYour Order *{{Order_Number}}* has been packed in our eco-luxury garment packaging and is waiting for courier pickup.\n\nCourier: Bluedart Express\nAWB: {{AWB_Number}}",
    footerText: "CLINZA Logistics",
    buttons: [
      { type: "URL", text: "View Packing Slip", value: "{{Tracking_Link}}" }
    ],
    category: "UTILITY",
    updatedAt: new Date().toISOString()
  },
  {
    id: "order_shipped",
    name: "Order Shipped",
    description: "Dispatched when courier picks up the parcel with AWB tracking link.",
    enabled: true,
    templateName: "clinza_order_shipped_v1",
    language: "en_US",
    delayMinutes: 0,
    headerType: "TEXT",
    headerText: "🚚 SHIPMENT ON ITS WAY",
    messageBody: "Hello {{Customer_Name}},\n\nOrder *{{Order_Number}}* is on its way to your doorstep! 🚀\n\nCourier Partner: {{Courier_Name}}\nAWB Tracking No: *{{AWB_Number}}*\nExpected Delivery: {{Estimated_Date}}\n\nClick below to track live transit:",
    footerText: "CLINZA Dispatch Telemetry",
    buttons: [
      { type: "URL", text: "Track Package Live", value: "{{Tracking_Link}}" }
    ],
    category: "UTILITY",
    updatedAt: new Date().toISOString()
  },
  {
    id: "out_for_delivery",
    name: "Out for Delivery",
    description: "Alerts the customer on the delivery day that the courier agent is nearby.",
    enabled: true,
    templateName: "clinza_out_for_delivery_v1",
    language: "en_US",
    delayMinutes: 0,
    headerType: "TEXT",
    headerText: "📍 ARRIVING TODAY",
    messageBody: "Hi {{Customer_Name}},\n\nYour CLINZA parcel for Order *{{Order_Number}}* is OUT FOR DELIVERY today!\n\nDelivery Agent Phone: {{Agent_Phone}}\nOTP for verification: *{{Delivery_OTP}}*\n\nPlease keep cash ready if this is a COD order (Amount: ₹{{Amount}}).",
    footerText: "CLINZA Last-Mile Service",
    buttons: [
      { type: "PHONE_NUMBER", text: "Call Delivery Driver", value: "{{Agent_Phone}}" }
    ],
    category: "UTILITY",
    updatedAt: new Date().toISOString()
  },
  {
    id: "order_delivered",
    name: "Order Delivered",
    description: "Sent right after delivery confirmation to ensure satisfaction.",
    enabled: true,
    templateName: "clinza_order_delivered_v1",
    language: "en_US",
    delayMinutes: 0,
    headerType: "TEXT",
    headerText: "🎉 DELIVERED SUCCESSFULLY",
    messageBody: "Hello {{Customer_Name}},\n\nYour Order *{{Order_Number}}* has been delivered to your address! We hope you love the craftsmanship of your new garments.\n\nNeed a size exchange or return? We offer 7-day hassle-free door pickups.",
    footerText: "CLINZA Care Team",
    buttons: [
      { type: "URL", text: "Easy Returns / Exchanges", value: "https://clinza.in/returns" },
      { type: "QUICK_REPLY", text: "Rate Experience ⭐", value: "RATE_ORDER" }
    ],
    category: "UTILITY",
    updatedAt: new Date().toISOString()
  },
  {
    id: "cod_reminder",
    name: "COD Verification & Reminder",
    description: "Sent to COD customers before dispatch to confirm order address and cash availability.",
    enabled: true,
    templateName: "clinza_cod_verify_v1",
    language: "en_US",
    delayMinutes: 30,
    headerType: "NONE",
    messageBody: "Hi {{Customer_Name}},\n\nYour Cash on Delivery Order *{{Order_Number}}* (Total: ₹{{Amount}}) is pending dispatch confirmation.\n\nPlease confirm your delivery address:\n{{Delivery_Address}}\n\nReply YES to confirm dispatch or convert to online payment to get flat ₹100 instant cashback!",
    footerText: "CLINZA Fraud Prevention & Risk Control",
    buttons: [
      { type: "QUICK_REPLY", text: "✅ Confirm COD Order", value: "CONFIRM_COD" },
      { type: "URL", text: "Pay Online & Save ₹100", value: "https://clinza.in/pay-online?order={{Order_Number}}" }
    ],
    category: "UTILITY",
    updatedAt: new Date().toISOString()
  },
  {
    id: "abandoned_cart_reminder",
    name: "Abandoned Cart Recovery",
    description: "Triggered 15–60 minutes after a user leaves items in their checkout cart.",
    enabled: true,
    templateName: "clinza_cart_recovery_v1",
    language: "en_US",
    delayMinutes: 30,
    headerType: "IMAGE",
    headerMediaUrl: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    messageBody: "Hi {{Customer_Name}}, you left something stylish behind! 🛒\n\nYour cart contains: *{{Product_Name}}*\n\nItems in high demand sell out quickly. Complete your order now and enjoy *FREE Express Shipping* with code *FREESHIP*.",
    footerText: "CLINZA Shopping Assist",
    buttons: [
      { type: "URL", text: "Complete Checkout Now", value: "https://clinza.in/cart" }
    ],
    category: "MARKETING",
    updatedAt: new Date().toISOString()
  },
  {
    id: "review_request",
    name: "Review & Feedback Request",
    description: "Sent 3 days after delivery asking for product rating & photo review.",
    enabled: true,
    templateName: "clinza_review_ask_v1",
    language: "en_US",
    delayMinutes: 4320, // 3 days
    headerType: "NONE",
    messageBody: "Hi {{Customer_Name}}! How does your new apparel feel? ⭐\n\nShare a quick photo review of your *{{Product_Name}}* and earn *200 Clinza Loyalty Points* credited instantly to your account!",
    footerText: "CLINZA Community Reviews",
    buttons: [
      { type: "URL", text: "Write Photo Review", value: "https://clinza.in/review/{{Order_Number}}" }
    ],
    category: "MARKETING",
    updatedAt: new Date().toISOString()
  },
  {
    id: "back_in_stock",
    name: "Back In Stock Alert",
    description: "Alerts waitlisted customers when a previously sold-out size or product is replenished.",
    enabled: true,
    templateName: "clinza_back_in_stock_v1",
    language: "en_US",
    delayMinutes: 0,
    headerType: "TEXT",
    headerText: "🔥 BACK IN STOCK",
    messageBody: "Good news, {{Customer_Name}}!\n\nThe *{{Product_Name}}* you were eyeing is back in stock in Size *{{Size}}*.\n\nLimited quantities available. Grab yours before it sells out again!",
    footerText: "CLINZA Inventory Alert",
    buttons: [
      { type: "URL", text: "Buy Now Before Sold Out", value: "https://clinza.in/product/{{Product_Slug}}" }
    ],
    category: "MARKETING",
    updatedAt: new Date().toISOString()
  },
  {
    id: "promotional_broadcasts",
    name: "Promotional Broadcasts",
    description: "Mass campaign blast for festive sales, season launches, and exclusive member discounts.",
    enabled: false,
    templateName: "clinza_festive_sale_v1",
    language: "en_US",
    delayMinutes: 0,
    headerType: "IMAGE",
    headerMediaUrl: "https://vdtbquxxpikniarmjpai.supabase.co/storage/v1/object/public/products/slider/combo%20collection%20linen%20set.png",
    messageBody: "🌟 FESTIVE SEASON VIP SALE IS LIVE 🌟\n\nHi {{Customer_Name}}, enjoy up to *40% OFF* across our entire pure linen shirt & selvedge denim collection.\n\nUse VIP code: *FESTIVEVIP* at checkout.",
    footerText: "Valid till Sunday midnight • T&C Apply",
    buttons: [
      { type: "URL", text: "Shop Festive Sale", value: "https://clinza.in/collections/festive-sale" }
    ],
    category: "MARKETING",
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_EMAIL_TEMPLATES: EmailAutomationConfig[] = [
  {
    id: "welcome_email",
    name: "Welcome Email",
    description: "Delivered immediately upon signup introducing brand story and new customer voucher.",
    enabled: true,
    subject: "Welcome to CLINZA — Luxury Redefined (+ 10% Voucher)",
    previewText: "Your journey into refined artisanal menswear starts here.",
    senderName: "CLINZA Concierge",
    replyToEmail: "concierge@clinza.in",
    delayMinutes: 0,
    category: "RETENTION",
    updatedAt: new Date().toISOString(),
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px 20px; border-radius: 12px;">
  <div style="text-align: center; border-b: 1px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="font-family: Georgia, serif; letter-spacing: 4px; color: #F27D26; margin: 0;">CLINZA</h1>
    <p style="font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 2px;">Tailored Menswear & Luxury Apparel</p>
  </div>
  <h2>Welcome, {{Customer_Name}}!</h2>
  <p style="color: #ccc; line-height: 1.6;">Thank you for stepping into the world of CLINZA. We craft premium apparel built from sustainable European linen, Japanese selvedge denim, and precision tailoring.</p>
  <div style="background: #111; border: 1px dashed #F27D26; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
    <p style="margin: 0 0 10px 0; color: #aaa; text-transform: uppercase; font-size: 12px;">Your First Purchase Voucher</p>
    <span style="font-size: 24px; font-weight: bold; font-mono; color: #F27D26; letter-spacing: 3px;">WELCOME10</span>
    <p style="margin: 10px 0 0 0; font-size: 12px; color: #777;">Apply at checkout for 10% OFF on all items.</p>
  </div>
  <p style="text-align: center;">
    <a href="https://clinza.in" style="background: #F27D26; color: #fff; text-decoration: none; font-weight: bold; padding: 14px 28px; border-radius: 6px; display: inline-block;">Explore Collection</a>
  </p>
  <hr style="border-color: #222; margin-top: 40px;" />
  <p style="font-size: 11px; color: #666; text-align: center;">CLINZA Apparel Pvt Ltd • Mumbai, India • <a href="{{Unsubscribe_Url}}" style="color: #888;">Unsubscribe</a></p>
</div>`
  },
  {
    id: "order_confirmation",
    name: "Order Confirmation Email",
    description: "Sent right after order receipt with full line item details and delivery estimate.",
    enabled: true,
    subject: "Order Confirmed #{{Order_Number}} — CLINZA Apparel",
    previewText: "We have received your order and are preparing it for shipment.",
    senderName: "CLINZA Orders",
    replyToEmail: "orders@clinza.in",
    delayMinutes: 0,
    category: "TRANSACTIONAL",
    updatedAt: new Date().toISOString(),
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 32px; border-radius: 12px;">
  <div style="border-bottom: 2px solid #F27D26; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Order Receipt #{{Order_Number}}</h1>
    <p style="color: #F27D26; margin: 4px 0 0 0; font-size: 12px; font-weight: bold;">STATUS: CONFIRMED</p>
  </div>
  <p>Dear {{Customer_Name}},</p>
  <p style="color: #bbb;">Thank you for your order! We are currently assembling your garments with hand care.</p>
  
  <div style="background: #141414; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #fff; border-bottom: 1px solid #222; padding-bottom: 8px;">Order Summary</h3>
    <p style="margin: 8px 0; color: #ccc;">Order ID: <strong>{{Order_Number}}</strong></p>
    <p style="margin: 8px 0; color: #ccc;">Items: <strong>{{Product_Name}}</strong></p>
    <p style="margin: 8px 0; color: #4ade80; font-size: 18px; font-weight: bold;">Total Amount: ₹{{Amount}}</p>
    <p style="margin: 8px 0; color: #ccc;">Payment Mode: <strong>{{Payment_Method}}</strong></p>
  </div>

  <p style="text-align: center; margin-top: 30px;">
    <a href="{{Tracking_Link}}" style="background: #10b981; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Package Live</a>
  </p>
</div>`
  },
  {
    id: "invoice",
    name: "Tax Invoice & Bill",
    description: "Official GST invoice PDF document dispatch for corporate and retail records.",
    enabled: true,
    subject: "Tax Invoice for Order #{{Order_Number}} — CLINZA",
    previewText: "Find your official GST tax invoice attached.",
    senderName: "CLINZA Finance",
    replyToEmail: "billing@clinza.in",
    delayMinutes: 0,
    category: "TRANSACTIONAL",
    updatedAt: new Date().toISOString(),
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #111111; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
  <div style="display: flex; justify-between: space-between; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="margin:0; font-family: Georgia, serif;">CLINZA TAX INVOICE</h2>
    <span style="font-mono; font-size: 12px; color: #666;">GSTIN: 27AABCC1234F1Z9</span>
  </div>
  <p>Hello {{Customer_Name}},</p>
  <p>Please find details of your tax invoice for Order <strong>#{{Order_Number}}</strong> below.</p>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
    <tr style="background: #f3f4f6; text-align: left;">
      <th style="padding: 10px; border: 1px solid #ddd;">Description</th>
      <th style="padding: 10px; border: 1px solid #ddd;">Amount (INR)</th>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">{{Product_Name}}</td>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">₹{{Amount}}</td>
    </tr>
  </table>
  <p style="font-size: 12px; color: #666;">This is a computer-generated invoice requiring no physical signature.</p>
</div>`
  },
  {
    id: "shipping_update",
    name: "Shipping & Transit Update",
    description: "Notifies customer when parcel is picked up by carrier with tracking URL.",
    enabled: true,
    subject: "Shipped! Your parcel #{{Order_Number}} is in transit 🚚",
    previewText: "Your order has left our fulfillment hub.",
    senderName: "CLINZA Dispatch",
    replyToEmail: "support@clinza.in",
    delayMinutes: 0,
    category: "TRANSACTIONAL",
    updatedAt: new Date().toISOString(),
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 32px; border-radius: 12px;">
  <h2 style="color: #38bdf8;">Your Shipment is On Its Way! 🚀</h2>
  <p>Hi {{Customer_Name}},</p>
  <p>Order <strong>#{{Order_Number}}</strong> has been handed over to <strong>{{Courier_Name}}</strong>.</p>
  <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 4px 0;">AWB Tracking: <strong style="color: #38bdf8;">{{AWB_Number}}</strong></p>
    <p style="margin: 4px 0;">Estimated Delivery: <strong>{{Estimated_Date}}</strong></p>
  </div>
  <p><a href="{{Tracking_Link}}" style="background: #0284c7; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Courier Status</a></p>
</div>`
  },
  {
    id: "delivery_confirmation",
    name: "Delivery Confirmation Email",
    description: "Sent upon delivery completion with care instructions and exchange portal link.",
    enabled: true,
    subject: "Delivered: Order #{{Order_Number}} has arrived! 🎁",
    previewText: "Your package was delivered successfully.",
    senderName: "CLINZA Care",
    replyToEmail: "support@clinza.in",
    delayMinutes: 0,
    category: "TRANSACTIONAL",
    updatedAt: new Date().toISOString(),
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #052e16; color: #f0fdf4; padding: 32px; border-radius: 12px;">
  <h2 style="color: #4ade80;">Parcel Delivered Successfully! 🎉</h2>
  <p>Hi {{Customer_Name}},</p>
  <p>Your Order <strong>#{{Order_Number}}</strong> was delivered to your address. We hope you enjoy the fit and finish!</p>
  <p style="font-size: 13px; color: #bbf7d0;">Care Tip: Cold hand wash or dry clean for maximum linen fiber longevity.</p>
  <p><a href="https://clinza.in/returns" style="background: #16a34a; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Easy Returns & Exchanges</a></p>
</div>`
  },
  {
    id: "review_request",
    name: "Product Review Invitation",
    description: "Sent 3 days post-delivery encouraging customers to leave ratings and photo reviews.",
    enabled: true,
    subject: "How does your new CLINZA apparel feel? ⭐ Earn 200 Points",
    previewText: "Share your feedback and earn 200 reward points.",
    senderName: "CLINZA Reviews",
    replyToEmail: "reviews@clinza.in",
    delayMinutes: 4320,
    category: "RETENTION",
    updatedAt: new Date().toISOString(),
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #f4f4f5; padding: 32px; border-radius: 12px; text-align: center;">
  <h2 style="color: #fbbf24;">Rate Your Recent Purchase ⭐</h2>
  <p>Dear {{Customer_Name}},</p>
  <p style="color: #a1a1aa;">We hope you are loving your <strong>{{Product_Name}}</strong>. Your feedback inspires our artisanal craftsmen!</p>
  <div style="margin: 30px 0;">
    <a href="https://clinza.in/review/{{Order_Number}}" style="background: #f59e0b; color: #000; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 8px;">Leave a Review & Get 200 PTS</a>
  </div>
</div>`
  },
  {
    id: "abandoned_cart",
    name: "Abandoned Cart Email Workflow",
    description: "Dispatched 1 hour after checkout abandonment featuring dynamic cart items.",
    enabled: true,
    subject: "Your cart is waiting for you, {{Customer_Name}} 🛒",
    previewText: "Items in your cart are selling fast.",
    senderName: "CLINZA Assistant",
    replyToEmail: "support@clinza.in",
    delayMinutes: 60,
    category: "MARKETING",
    updatedAt: new Date().toISOString(),
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; padding: 32px; border-radius: 12px;">
  <h2 style="color: #F27D26;">Don't miss out on your selections!</h2>
  <p>Hi {{Customer_Name}}, you left <strong>{{Product_Name}}</strong> in your shopping cart.</p>
  <p style="color: #aaa;">Stock is limited. Finish your purchase now to secure your size and enjoy free shipping.</p>
  <div style="text-align: center; margin: 28px 0;">
    <a href="https://clinza.in/cart" style="background: #F27D26; color: #fff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px;">Return to My Cart</a>
  </div>
</div>`
  },
  {
    id: "wishlist_reminder",
    name: "Wishlist Price Drop & Reminder",
    description: "Sent when an item saved in the customer wishlist goes on sale.",
    enabled: true,
    subject: "Good news! Saved wishlist item is on special sale 🔥",
    previewText: "An item on your wishlist just dropped in price.",
    senderName: "CLINZA Alerts",
    replyToEmail: "alerts@clinza.in",
    delayMinutes: 0,
    category: "MARKETING",
    updatedAt: new Date().toISOString(),
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
  <h2 style="color: #ec4899;">Wishlist Price Drop Alert! 💖</h2>
  <p>Hi {{Customer_Name}},</p>
  <p>Great news! The <strong>{{Product_Name}}</strong> you saved in your wishlist is now available at a special price.</p>
  <p><a href="https://clinza.in/wishlist" style="background: #db2777; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Wishlist</a></p>
</div>`
  },
  {
    id: "back_in_stock",
    name: "Back In Stock Notification",
    description: "Triggered when a requested out-of-stock SKU becomes available again.",
    enabled: true,
    subject: "Back in stock! {{Product_Name}} is available again",
    previewText: "The item you requested is back in stock.",
    senderName: "CLINZA Inventory",
    replyToEmail: "notify@clinza.in",
    delayMinutes: 0,
    category: "RETENTION",
    updatedAt: new Date().toISOString(),
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #022c22; color: #ecfdf5; padding: 32px; border-radius: 12px;">
  <h2 style="color: #34d399;">Back in Stock Alert! 📦</h2>
  <p>Hi {{Customer_Name}},</p>
  <p>The <strong>{{Product_Name}}</strong> you subscribed to is now back in stock.</p>
  <p><a href="https://clinza.in/product/{{Product_Slug}}" style="background: #059669; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Order Before It Sells Out</a></p>
</div>`
  },
  {
    id: "birthday_offer",
    name: "Birthday Special Gift",
    description: "Automated birthday wish accompanied by an exclusive 20% discount coupon.",
    enabled: true,
    subject: "Happy Birthday {{Customer_Name}}! Here is your ₹500 Gift Card 🎂",
    previewText: "Celebrate your special day with a gift from CLINZA.",
    senderName: "CLINZA VIP Club",
    replyToEmail: "vip@clinza.in",
    delayMinutes: 0,
    category: "RETENTION",
    updatedAt: new Date().toISOString(),
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #2e1065; color: #f3e8ff; padding: 32px; border-radius: 12px; text-align: center;">
  <h1 style="color: #c084fc;">Happy Birthday, {{Customer_Name}}! 🎂</h1>
  <p>Wishing you a fabulous year ahead filled with elegance and style.</p>
  <div style="background: #3b0764; border: 2px dashed #a855f7; padding: 20px; margin: 24px 0; border-radius: 8px;">
    <p style="margin: 0 0 8px 0; font-size: 12px; color: #d8b4fe;">YOUR BIRTHDAY GIFT COUPON</p>
    <span style="font-size: 26px; font-weight: bold; color: #fff; letter-spacing: 2px;">BDAY500</span>
    <p style="margin: 8px 0 0 0; font-size: 12px; color: #c084fc;">Flat ₹500 OFF on orders above ₹2,000</p>
  </div>
  <a href="https://clinza.in" style="background: #9333ea; color: #fff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Claim Birthday Gift</a>
</div>`
  },
  {
    id: "winback_campaign",
    name: "Customer Win-Back Campaign",
    description: "Sent to inactive buyers after 90 days with a personalized re-engagement offer.",
    enabled: true,
    subject: "We miss you, {{Customer_Name}}! Here is 15% OFF to welcome you back",
    previewText: "It has been a while since your last visit.",
    senderName: "CLINZA Founder",
    replyToEmail: "founder@clinza.in",
    delayMinutes: 0,
    category: "RETENTION",
    updatedAt: new Date().toISOString(),
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
  <h2 style="color: #F27D26;">We miss you at CLINZA!</h2>
  <p>Dear {{Customer_Name}},</p>
  <p style="color: #ccc;">It's been a while since your last order. We've added fresh new linen arrivals and refined craftsmanship to our lineup.</p>
  <p style="color: #ccc;">Use code <strong style="color: #F27D26;">COMEBACK15</strong> for 15% OFF your next order.</p>
  <p style="text-align: center; margin-top: 24px;">
    <a href="https://clinza.in" style="background: #F27D26; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;">Explore What's New</a>
  </p>
</div>`
  }
];
