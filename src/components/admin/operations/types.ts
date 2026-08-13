/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DateRangeOption = "today" | "yesterday" | "week" | "month" | "last30" | "year" | "custom";
export type StoreFilterOption = "all" | "shopify" | "mobile_app" | "b2b";

export interface DashboardFilterState {
  dateRange: DateRangeOption;
  storeFilter: StoreFilterOption;
  customStartDate?: string;
  customEndDate?: string;
}

export interface CampaignData {
  id: string;
  platform: "Google Ads" | "Meta Ads" | "Influencer" | "Email";
  name: string;
  spend: number;
  revenue: number;
  orders: number;
  clicks: number;
  impressions: number;
  ctr: number; // %
  cpc: number; // ₹
  cac: number; // ₹
  roas: number; // multiplier e.g. 4.2
}
