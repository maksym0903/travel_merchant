/**
 * Merchant API — Consolidated API for merchant-related operations
 * Includes: Profile, Dashboard, and Orders
 * Requires Authorization: Bearer <access_token>
 */

import { fetchWithAuth } from "./auth";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL as string) ?? "";

function getUrl(path: string): string {
  const base = API_BASE ? API_BASE.replace(/\/$/, "") : "";
  const full = base ? `${base}${path}` : path;
  return full.startsWith("http") ? full : `${window.location.origin}${full}`;
}

// ============================================================================
// MERCHANT PROFILE
// ============================================================================

export interface MerchantProfile {
  user_id: string;
  business_name: string;
  description: string;
  address: string;
  logo_url: string;
  contact_email: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MerchantProfileUpdate {
  business_name?: string;
  description?: string;
  address?: string;
  logo_url?: string;
  contact_email?: string;
}

/** GET /api/merchant/profile */
export async function getMerchantProfile(accessToken: string): Promise<MerchantProfile> {
  void accessToken; // token injected automatically by fetchWithAuth
  const url = getUrl("/api/merchant/profile");
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantProfile }).data;
}

/** PATCH /api/merchant/profile */
export async function updateMerchantProfile(
  accessToken: string,
  payload: MerchantProfileUpdate
): Promise<MerchantProfile> {
  void accessToken; // token injected automatically by fetchWithAuth
  const url = getUrl("/api/merchant/profile");
  const res = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantProfile }).data;
}

// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardSummary {
  today_revenue: number;
  month_revenue: number;
  total_orders: number;
  pending_orders: number;
  refund_amount: number;
  conversion_rate?: number; // Optional for later
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  order_count?: number;
}

export interface ProductPerformance {
  product_id: string;
  product_name: string;
  product_type: "TOUR" | "HOTEL" | "TICKET" | "INSURANCE";
  orders: number;
  revenue: number;
}

export interface RecentOrder {
  order_no: string;
  product_name: string;
  product_type: "TOUR" | "HOTEL" | "TICKET" | "INSURANCE";
  date: string;
  amount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED";
}

export interface OrderRequiringAttention {
  order_no: string;
  product_name: string;
  issue_type: "UNCONFIRMED_PAID" | "REFUND_REQUEST" | "TODAY_CHECKIN";
  date: string;
  amount: number;
  status: string;
  message: string;
}

/** GET /api/merchant/dashboard/summary */
export async function getDashboardSummary(accessToken: string): Promise<{ data: DashboardSummary }> {
  const url = getUrl("/api/merchant/dashboard/summary");
  
  // TODO: Replace with real API call
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          today_revenue: 1250.50,
          month_revenue: 28450.75,
          total_orders: 156,
          pending_orders: 8,
          refund_amount: 450.00,
          conversion_rate: 3.2
        }
      });
    }, 300);
  });
  
  /* Real API implementation (commented for future use):
  const res = await fetch(url, {
    method: "GET",
    headers: { 
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}` 
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { data: DashboardSummary };
  */
}

/** GET /api/merchant/dashboard/revenue?range=7d|30d */
export async function getDashboardRevenue(
  accessToken: string,
  range: "7d" | "30d" = "7d"
): Promise<{ data: RevenueDataPoint[] }> {
  const url = getUrl(`/api/merchant/dashboard/revenue?range=${range}`);
  
  // TODO: Replace with real API call
  // Generate mock data based on range
  return new Promise((resolve) => {
    setTimeout(() => {
      const days = range === "7d" ? 7 : 30;
      const data: RevenueDataPoint[] = [];
      const today = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        
        // Generate realistic revenue with some variation
        const baseRevenue = range === "7d" ? 800 : 600;
        const variation = Math.random() * 400 - 200;
        const revenue = Math.max(0, baseRevenue + variation);
        const orderCount = Math.floor(Math.random() * 5) + 2;
        
        data.push({
          date: dateStr,
          revenue: Math.round(revenue * 100) / 100,
          order_count: orderCount
        });
      }
      
      resolve({ data });
    }, 300);
  });
  
  /* Real API implementation (commented for future use):
  const res = await fetch(url, {
    method: "GET",
    headers: { 
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}` 
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { data: RevenueDataPoint[] };
  */
}

/** GET /api/merchant/dashboard/product-performance */
export async function getProductPerformance(
  accessToken: string
): Promise<{ data: ProductPerformance[] }> {
  const url = getUrl("/api/merchant/dashboard/product-performance");
  
  // TODO: Replace with real API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            product_id: "1",
            product_name: "Bali 7-Day Adventure Tour",
            product_type: "TOUR",
            orders: 45,
            revenue: 84600.00
          },
          {
            product_id: "2",
            product_name: "Tokyo Grand Hotel",
            product_type: "HOTEL",
            orders: 38,
            revenue: 68400.00
          },
          {
            product_id: "3",
            product_name: "Universal Studios Ticket",
            product_type: "TICKET",
            orders: 52,
            revenue: 52000.00
          },
          {
            product_id: "4",
            product_name: "Kyoto Cultural Experience",
            product_type: "TOUR",
            orders: 28,
            revenue: 50400.00
          },
          {
            product_id: "5",
            product_name: "Osaka Premium Hotel",
            product_type: "HOTEL",
            orders: 22,
            revenue: 39600.00
          },
          {
            product_id: "6",
            product_name: "Travel Insurance Premium",
            product_type: "INSURANCE",
            orders: 67,
            revenue: 13400.00
          }
        ]
      });
    }, 300);
  });
  
  /* Real API implementation (commented for future use):
  const res = await fetch(url, {
    method: "GET",
    headers: { 
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}` 
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { data: ProductPerformance[] };
  */
}

/** GET /api/merchant/dashboard/recent-orders */
export async function getRecentOrders(accessToken: string): Promise<{ data: RecentOrder[] }> {
  const url = getUrl("/api/merchant/dashboard/recent-orders");
  
  // TODO: Replace with real API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date();
      resolve({
        data: [
          {
            order_no: "ORD-2026-001234",
            product_name: "Bali 7-Day Adventure Tour",
            product_type: "TOUR",
            date: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            amount: 1880.00,
            status: "CONFIRMED"
          },
          {
            order_no: "ORD-2026-001233",
            product_name: "Tokyo Grand Hotel",
            product_type: "HOTEL",
            date: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
            amount: 1800.00,
            status: "PENDING"
          },
          {
            order_no: "ORD-2026-001232",
            product_name: "Universal Studios Ticket",
            product_type: "TICKET",
            date: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
            amount: 1000.00,
            status: "COMPLETED"
          },
          {
            order_no: "ORD-2026-001231",
            product_name: "Kyoto Cultural Experience",
            product_type: "TOUR",
            date: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
            amount: 1800.00,
            status: "CONFIRMED"
          },
          {
            order_no: "ORD-2026-001230",
            product_name: "Osaka Premium Hotel",
            product_type: "HOTEL",
            date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 1800.00,
            status: "COMPLETED"
          },
          {
            order_no: "ORD-2026-001229",
            product_name: "Travel Insurance Premium",
            product_type: "INSURANCE",
            date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 200.00,
            status: "COMPLETED"
          },
          {
            order_no: "ORD-2026-001228",
            product_name: "Bali 7-Day Adventure Tour",
            product_type: "TOUR",
            date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 1880.00,
            status: "REFUNDED"
          }
        ]
      });
    }, 300);
  });
  
  /* Real API implementation (commented for future use):
  const res = await fetch(url, {
    method: "GET",
    headers: { 
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}` 
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { data: RecentOrder[] };
  */
}

/** GET /api/merchant/dashboard/orders-requiring-attention */
export async function getOrdersRequiringAttention(
  accessToken: string
): Promise<{ data: OrderRequiringAttention[] }> {
  const url = getUrl("/api/merchant/dashboard/orders-requiring-attention");
  
  // TODO: Replace with real API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const today = new Date().toISOString().split("T")[0];
      resolve({
        data: [
          {
            order_no: "ORD-2026-001233",
            product_name: "Tokyo Grand Hotel",
            issue_type: "UNCONFIRMED_PAID",
            date: new Date().toISOString(),
            amount: 1800.00,
            status: "PENDING",
            message: "Payment received but order not confirmed"
          },
          {
            order_no: "ORD-2026-001220",
            product_name: "Bali 7-Day Adventure Tour",
            issue_type: "REFUND_REQUEST",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 1880.00,
            status: "PENDING",
            message: "Customer requested refund"
          },
          {
            order_no: "ORD-2026-001215",
            product_name: "Osaka Premium Hotel",
            issue_type: "TODAY_CHECKIN",
            date: today,
            amount: 1800.00,
            status: "CONFIRMED",
            message: "Check-in scheduled for today"
          },
          {
            order_no: "ORD-2026-001210",
            product_name: "Kyoto Cultural Experience",
            issue_type: "UNCONFIRMED_PAID",
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 1800.00,
            status: "PENDING",
            message: "Payment received but order not confirmed"
          }
        ]
      });
    }, 300);
  });
  
  /* Real API implementation (commented for future use):
  const res = await fetch(url, {
    method: "GET",
    headers: { 
      "Accept": "application/json",
      "Authorization": `Bearer ${accessToken}` 
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { data: OrderRequiringAttention[] };
  */
}

// ============================================================================
// ORDERS  (GET /api/merchant/orders)
// ============================================================================

/** Item inside an order — matches IOrderItem on the backend */
export type MerchantOrderItemType = "COMPANION" | "PACKAGE" | "HOTEL" | "TICKET" | "INSURANCE";

export interface MerchantOrderItem {
  item_type: MerchantOrderItemType;
  ref_id: string;
  quantity: number;
  unit_price: number;
  title?: string;
}

/** Full order as returned by GET /api/merchant/orders */
export type MerchantOrderStatus =
  | "PENDING"
  | "PAID"
  | "CONFIRMED"
  | "FULFILLED"
  | "CANCELLED"
  | "REFUNDED";

export type MerchantPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type MerchantPaymentMethod = "WECHAT" | "ALIPAY" | "CARD" | "WALLET";

export interface MerchantOrder {
  id: string;
  customer_id: string;
  companion_id?: string;
  itinerary_id?: string;
  items: MerchantOrderItem[];
  total_amount: number;
  status: MerchantOrderStatus;
  payment_method: MerchantPaymentMethod;
  payment_status: MerchantPaymentStatus;
  notes?: string;
  /** Internal after-sales notes — only visible to merchant/companion */
  follow_up_notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantOrdersListResponse {
  message: string;
  data: {
    items: MerchantOrder[];
    total: number;
    page: number;
    pageSize: number;
  };
}

/** GET /api/merchant/orders — paginated list of orders for this merchant */
export async function getMerchantOrders(
  page = 1,
  pageSize = 20
): Promise<MerchantOrdersListResponse> {
  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  const url = getUrl(`/api/merchant/orders?${qs}`);
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as MerchantOrdersListResponse;
}

/** GET /api/merchant/orders/:id — single order detail */
export async function getMerchantOrderById(orderId: string): Promise<MerchantOrder> {
  const url = getUrl(`/api/merchant/orders/${orderId}`);
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantOrder }).data;
}

/** PATCH /api/merchant/orders/:id/approve */
export async function approveMerchantOrder(orderId: string): Promise<MerchantOrder> {
  const url = getUrl(`/api/merchant/orders/${orderId}/approve`);
  const res = await fetchWithAuth(url, { method: "PATCH" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantOrder }).data;
}

/** PATCH /api/merchant/orders/:id/reject */
export async function rejectMerchantOrder(orderId: string): Promise<MerchantOrder> {
  const url = getUrl(`/api/merchant/orders/${orderId}/reject`);
  const res = await fetchWithAuth(url, { method: "PATCH" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantOrder }).data;
}

/** PATCH /api/merchant/orders/:id/follow-up — update internal notes */
export async function updateOrderFollowUp(orderId: string, notes: string): Promise<MerchantOrder> {
  const url = getUrl(`/api/merchant/orders/${orderId}/follow-up`);
  const res = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantOrder }).data;
}

// ============================================================================
// ROUTES (Tours)
// ============================================================================

/** Status values returned by the API */
export type RouteStatus = "DRAFT" | "PUBLISHED" | "PAUSED";

/** Single route (tour) as returned by GET /api/merchant/routes */
export interface MerchantRoute {
  id: string;
  merchant_id: string;
  name: string;
  description: string;
  region?: string;
  cover_image: string;
  image_urls: string[];
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RoutesResponse {
  message: string;
  data: MerchantRoute[];
}

/** GET /api/merchant/routes — list all routes owned by the authenticated merchant */
export async function getMerchantRoutes(): Promise<MerchantRoute[]> {
  const url = getUrl("/api/merchant/routes");
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as RoutesResponse).data;
}

export interface CreateRoutePayload {
  name: string;
  description?: string;
  cover_image?: string;
  image_urls?: string[];
  region?: string;
  /** Omit to default to DRAFT; pass "PUBLISHED" to publish immediately */
  status?: "DRAFT" | "PUBLISHED" | "PAUSED";
}

/** POST /api/merchant/routes — create a new route */
export async function createMerchantRoute(payload: CreateRoutePayload): Promise<MerchantRoute> {
  const url = getUrl("/api/merchant/routes");
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { message?: string }).message ??
      (data as { error?: string }).error ??
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantRoute }).data;
}

// ============================================================================
// HOTELS
// ============================================================================

/** Status values returned by the API */
export type HotelStatus = "DRAFT" | "PUBLISHED" | "PAUSED";

/** Single hotel as returned by GET /api/merchant/hotels */
export interface MerchantHotel {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  city: string;
  address?: string;
  star_rating?: number;
  amenities?: string[];
  price_per_night: number;
  image_urls?: string[];
  stock_quantity?: number | null;
  status: HotelStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HotelsResponse {
  message: string;
  data: MerchantHotel[];
}

/** GET /api/merchant/hotels — list all hotels owned by the authenticated merchant */
export async function getMerchantHotels(): Promise<MerchantHotel[]> {
  const url = getUrl("/api/merchant/hotels");
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as HotelsResponse).data;
}

export interface CreateHotelPayload {
  /** Required */
  name: string;
  /** Required */
  city: string;
  /** Required, must be >= 0 */
  price_per_night: number;
  description?: string;
  address?: string;
  star_rating?: number;
  amenities?: string[];
  image_urls?: string[];
  status?: "DRAFT" | "PUBLISHED";
}

/** POST /api/merchant/hotels — create a new hotel */
export async function createMerchantHotel(payload: CreateHotelPayload): Promise<MerchantHotel> {
  const url = getUrl("/api/merchant/hotels");
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { message?: string }).message ??
      (data as { error?: string }).error ??
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantHotel }).data;
}

// ============================================================================
// TICKETS (Attraction Tickets)
// ============================================================================

/** Status values returned by the API for attraction tickets */
export type TicketStatus = "DRAFT" | "PUBLISHED" | "PAUSED";

/** Ticket type enum values supported by the API */
export type TicketType = "ADULT" | "CHILD" | "SENIOR" | "FAMILY";

/** Single attraction ticket as returned by GET /api/merchant/tickets */
export interface MerchantTicket {
  id: string;
  merchant_id: string;
  attraction_name: string;
  description?: string;
  location?: string;
  ticket_type: TicketType;
  price: number;
  validity_days?: number;
  stock_quantity?: number | null;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TicketsResponse {
  message: string;
  data: MerchantTicket[];
}

/** Payload for POST /api/merchant/tickets */
export interface CreateTicketPayload {
  attraction_name: string;
  price: number;
  description?: string;
  location?: string;
  ticket_type?: TicketType;
  validity_days?: number;
  status?: "DRAFT" | "PUBLISHED" | "PAUSED";
}

/** GET /api/merchant/tickets — list all attraction tickets owned by the authenticated merchant */
export async function getMerchantTickets(): Promise<MerchantTicket[]> {
  const url = getUrl("/api/merchant/tickets");
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as TicketsResponse).data;
}

/** POST /api/merchant/tickets — create a new attraction ticket */
export async function createMerchantTicket(payload: CreateTicketPayload): Promise<MerchantTicket> {
  const url = getUrl("/api/merchant/tickets");
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { message?: string }).message ??
      (data as { error?: string }).error ??
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantTicket }).data;
}

// ============================================================================
// INSURANCE
// ============================================================================

/** Status values returned by the API for insurance products */
export type InsuranceStatus = "DRAFT" | "PUBLISHED" | "PAUSED";

/** Insurance type enum values supported by the API */
export type InsuranceType = "TRAVEL_ACCIDENT" | "MEDICAL" | "TRIP_CANCELLATION";

/** Single insurance product as returned by GET /api/merchant/insurance */
export interface MerchantInsurance {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  insurance_type: InsuranceType;
  coverage_amount?: number;
  validity_days: number;
  price: number;
  stock_quantity?: number | null;
  status: InsuranceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceListResponse {
  message: string;
  data: MerchantInsurance[];
}

/** Payload for POST /api/merchant/insurance */
export interface CreateInsurancePayload {
  /** Required */
  name: string;
  /** Required — must be one of TRAVEL_ACCIDENT | MEDICAL | TRIP_CANCELLATION */
  insurance_type: InsuranceType;
  /** Required, must be >= 1 */
  validity_days: number;
  /** Required, must be >= 0 */
  price: number;
  description?: string;
  coverage_amount?: number;
  status?: "DRAFT" | "PUBLISHED" | "PAUSED";
}

/** GET /api/merchant/insurance — list all insurance products owned by the authenticated merchant */
export async function getMerchantInsurances(): Promise<MerchantInsurance[]> {
  const url = getUrl("/api/merchant/insurance");
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as InsuranceListResponse).data;
}

/** POST /api/merchant/insurance — create a new insurance product */
export async function createMerchantInsurance(payload: CreateInsurancePayload): Promise<MerchantInsurance> {
  const url = getUrl("/api/merchant/insurance");
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { message?: string }).message ??
      (data as { error?: string }).error ??
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantInsurance }).data;
}

// ============================================================================
// PACKAGES
// ============================================================================

/** Status values for packages (same as other products) */
export type PackageStatus = "DRAFT" | "PUBLISHED" | "PAUSED";

/** Single package as returned by GET /api/merchant/packages */
export interface MerchantPackage {
  id: string;
  merchant_id: string;
  route_id?: string;
  name: string;
  description?: string;
  status: PackageStatus;
  price: number;
  duration_days?: number;
  booking_count: number;
  stock_quantity?: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload for POST /api/merchant/packages */
export interface CreatePackagePayload {
  /** Required */
  name: string;
  /** Required, must be >= 0 */
  price: number;
  description?: string;
  route_id?: string;
  duration_days?: number;
  status?: PackageStatus;
}

/** Payload for PATCH /api/merchant/packages/:id */
export interface UpdatePackagePayload {
  name?: string;
  price?: number;
  description?: string;
  route_id?: string;
  duration_days?: number;
  status?: PackageStatus;
  stock_quantity?: number | null;
}

/** GET /api/merchant/packages — list packages, optionally filtered by status */
export async function getMerchantPackages(status?: PackageStatus): Promise<MerchantPackage[]> {
  const url = getUrl(`/api/merchant/packages${status ? `?status=${status}` : ""}`);
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantPackage[] }).data;
}

/** POST /api/merchant/packages — create a new package */
export async function createMerchantPackage(payload: CreatePackagePayload): Promise<MerchantPackage> {
  const url = getUrl("/api/merchant/packages");
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { message?: string }).message ??
      (data as { error?: string }).error ??
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantPackage }).data;
}

/** PATCH /api/merchant/packages/:id — update a package */
export async function updateMerchantPackage(id: string, payload: UpdatePackagePayload): Promise<MerchantPackage> {
  const url = getUrl(`/api/merchant/packages/${id}`);
  const res = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { message?: string }).message ??
      (data as { error?: string }).error ??
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantPackage }).data;
}

/** POST /api/merchant/packages/:id/publish — publish a package */
export async function publishMerchantPackage(id: string): Promise<MerchantPackage> {
  const url = getUrl(`/api/merchant/packages/${id}/publish`);
  const res = await fetchWithAuth(url, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { message?: string }).message ??
      (data as { error?: string }).error ??
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (data as { data: MerchantPackage }).data;
}
