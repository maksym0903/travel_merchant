/**
 * Companion API — Mocked APIs for companion/guide operations (Phase 1 core)
 * Includes: Dashboard, Bookings, Availability
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
// REAL COMPANION PROFILE TYPES (matching backend ICompanionProfile model)
// ============================================================================

export type CompanionSkill =
  | "PHOTOGRAPHY" | "VIDEOGRAPHY" | "LANGUAGES" | "OUTDOOR_LEADERSHIP"
  | "FIRST_AID" | "DRIVING" | "COOKING" | "CULTURAL_GUIDE" | "OTHER";

export type CompanionLanguage =
  | "MANDARIN" | "ENGLISH" | "JAPANESE" | "KOREAN" | "CANTONESE"
  | "FRENCH" | "GERMAN" | "SPANISH" | "OTHER";

export type CompanionInterest =
  | "HISTORY" | "CULTURE" | "PHOTOGRAPHY" | "HIKING" | "FOOD"
  | "NIGHTLIFE" | "SHOPPING" | "FAMILY" | "ADVENTURE" | "OTHER";

export type CompanionStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface RealCompanionProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  contact_email: string;
  skills: CompanionSkill[];
  languages: CompanionLanguage[];
  interests: CompanionInterest[];
  location: string;
  service_cities: string[];
  hourly_rate: number;
  daily_rate?: number;
  experience_years: number;
  portfolio_urls: string[];
  status: CompanionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRealCompanionProfilePayload {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  contact_email?: string;
  skills?: CompanionSkill[];
  languages?: CompanionLanguage[];
  interests?: CompanionInterest[];
  location?: string;
  service_cities?: string[];
  hourly_rate?: number;
  daily_rate?: number;
  experience_years?: number;
  portfolio_urls?: string[];
}

export type AvailabilityStatus = "AVAILABLE" | "BOOKED" | "UNAVAILABLE";

export interface RealAvailabilityItem {
  id: string;
  companion_id: string;
  date: string;
  status: AvailabilityStatus;
  slot_start?: string;
  slot_end?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityListResponse {
  items: RealAvailabilityItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type KycDocumentType = "ID_FRONT" | "ID_BACK" | "PASSPORT" | "DRIVING_LICENSE" | "OTHER";

export interface KycDocument {
  document_type: KycDocumentType;
  file_name: string;
}

export interface KycData {
  user_id: string;
  documents: KycDocument[];
}

// ============================================================================
// REAL COMPANION PROFILE API CALLS
// ============================================================================

/** GET /api/companion/profile */
export async function getRealCompanionProfile(
  _accessToken: string
): Promise<{ message: string; data: RealCompanionProfile }> {
  void _accessToken;
  const url = getUrl("/api/companion/profile");
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: RealCompanionProfile };
}

/** PATCH /api/companion/profile */
export async function updateRealCompanionProfile(
  _accessToken: string,
  payload: UpdateRealCompanionProfilePayload
): Promise<{ message: string; data: RealCompanionProfile }> {
  void _accessToken;
  const url = getUrl("/api/companion/profile");
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
  return data as { message: string; data: RealCompanionProfile };
}

/** GET /api/companion/kyc */
export async function getCompanionKyc(
  _accessToken: string
): Promise<{ message: string; data: KycData }> {
  void _accessToken;
  const url = getUrl("/api/companion/kyc");
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: KycData };
}

/** PATCH /api/companion/kyc */
export async function submitCompanionKyc(
  _accessToken: string,
  documents: KycDocument[]
): Promise<{ message: string; data: KycData }> {
  void _accessToken;
  const url = getUrl("/api/companion/kyc");
  const res = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documents }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: KycData };
}

/** GET /api/companion/availability */
export async function getRealCompanionAvailability(
  _accessToken: string,
  params?: { from?: string; to?: string; status?: AvailabilityStatus; page?: number; pageSize?: number }
): Promise<{ message: string; data: AvailabilityListResponse }> {
  void _accessToken;
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const url = getUrl(`/api/companion/availability${query.toString() ? `?${query.toString()}` : ""}`);
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: AvailabilityListResponse };
}

/** PATCH /api/companion/availability (upsert single day) */
export async function upsertCompanionAvailability(
  _accessToken: string,
  payload: { date: string; status?: AvailabilityStatus; slot_start?: string; slot_end?: string; notes?: string }
): Promise<{ message: string; data: RealAvailabilityItem }> {
  void _accessToken;
  const url = getUrl("/api/companion/availability");
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
  return data as { message: string; data: RealAvailabilityItem };
}

/** POST /api/companion/availability/bulk */
export async function bulkUpsertCompanionAvailability(
  _accessToken: string,
  items: Array<{ date: string; status?: AvailabilityStatus; slot_start?: string; slot_end?: string; notes?: string }>
): Promise<{ message: string; data: RealAvailabilityItem[] }> {
  void _accessToken;
  const url = getUrl("/api/companion/availability/bulk");
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: RealAvailabilityItem[] };
}

/** DELETE /api/companion/availability?date=YYYY-MM-DD */
export async function deleteCompanionAvailabilityDay(
  _accessToken: string,
  date: string
): Promise<{ message: string }> {
  void _accessToken;
  const url = getUrl(`/api/companion/availability?date=${encodeURIComponent(date)}`);
  const res = await fetchWithAuth(url, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string };
}

// ============================================================================
// REAL ORDERS (via /api/companion/orders)
// ============================================================================

export type RealOrderStatus = "PENDING" | "PAID" | "CONFIRMED" | "FULFILLED" | "CANCELLED";
export type RealPaymentStatus = "PENDING" | "PAID" | "FAILED";
export type RealWalletTxnType = "CREDIT" | "DEBIT";
export type RealWalletTxnSource = "ORDER" | "REFUND" | "WITHDRAWAL" | "ADJUSTMENT";

export interface RealOrderItem {
  item_type: string;
  ref_id: string;
  quantity: number;
  unit_price: number;
  title?: string;
}

export interface RealOrder {
  _id: string;
  customer_id: string;
  companion_id?: string;
  itinerary_id?: string;
  items: RealOrderItem[];
  total_amount: number;
  status: RealOrderStatus;
  payment_method: string;
  payment_status: RealPaymentStatus;
  notes?: string;
  follow_up_notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealOrdersListResponse {
  message: string;
  data: {
    items: RealOrder[];
    total: number;
    page: number;
    pageSize: number;
  };
}

/** GET /api/companion/orders */
export async function getRealCompanionOrders(
  _accessToken: string,
  params?: { page?: number; pageSize?: number }
): Promise<RealOrdersListResponse> {
  void _accessToken;
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const url = getUrl(`/api/companion/orders${query.toString() ? `?${query.toString()}` : ""}`);
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as RealOrdersListResponse;
}

/** PATCH /api/companion/orders/:id/approve */
export async function approveCompanionOrder(
  _accessToken: string,
  orderId: string
): Promise<{ message: string; data: RealOrder }> {
  void _accessToken;
  const url = getUrl(`/api/companion/orders/${orderId}/approve`);
  const res = await fetchWithAuth(url, { method: "PATCH" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: RealOrder };
}

/** PATCH /api/companion/orders/:id/reject */
export async function rejectCompanionOrder(
  _accessToken: string,
  orderId: string
): Promise<{ message: string; data: RealOrder }> {
  void _accessToken;
  const url = getUrl(`/api/companion/orders/${orderId}/reject`);
  const res = await fetchWithAuth(url, { method: "PATCH" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: RealOrder };
}

// ============================================================================
// REAL WALLET (via /api/wallet/)
// ============================================================================

export interface RealWallet {
  _id: string;
  user_id: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealWalletTransaction {
  _id: string;
  user_id: string;
  type: RealWalletTxnType;
  source: RealWalletTxnSource;
  amount: number;
  balance_after?: number;
  description?: string;
  createdAt: string;
}

export interface RealTransactionsResponse {
  message: string;
  data: {
    items: RealWalletTransaction[];
    total: number;
    page: number;
    pageSize: number;
  };
}

/** GET /api/wallet/ */
export async function getRealWallet(
  _accessToken: string
): Promise<{ message: string; data: RealWallet }> {
  void _accessToken;
  const url = getUrl("/api/wallet/");
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: RealWallet };
}

/** GET /api/wallet/transactions */
export async function getRealWalletTransactions(
  _accessToken: string,
  params?: { page?: number; pageSize?: number }
): Promise<RealTransactionsResponse> {
  void _accessToken;
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const url = getUrl(`/api/wallet/transactions${query.toString() ? `?${query.toString()}` : ""}`);
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as RealTransactionsResponse;
}

/** POST /api/wallet/withdraw */
export async function requestRealWithdrawal(
  _accessToken: string,
  amount: number,
  description?: string
): Promise<{ message: string; data: RealWalletTransaction }> {
  void _accessToken;
  const url = getUrl("/api/wallet/withdraw");
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, description }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: RealWalletTransaction };
}

// ============================================================================
// REAL CHAT (via /api/chat/)
// ============================================================================

export interface RealConversationParticipant {
  _id: string;
  phone_number?: string;
}

export interface RealConversation {
  _id: string;
  participants: RealConversationParticipant[];
  order_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealConversationsResponse {
  message: string;
  data: {
    items: RealConversation[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface RealMessage {
  _id: string;
  conversation_id: string;
  sender_id: string;
  type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  content: string;
  createdAt: string;
}

/** GET /api/chat/conversations */
export async function getRealConversations(
  _accessToken: string,
  params?: { page?: number; pageSize?: number }
): Promise<RealConversationsResponse> {
  void _accessToken;
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const url = getUrl(`/api/chat/conversations${query.toString() ? `?${query.toString()}` : ""}`);
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as RealConversationsResponse;
}

/** GET /api/chat/conversations/:id/messages */
export async function getRealMessages(
  _accessToken: string,
  conversationId: string,
  params?: { limit?: number; before?: string }
): Promise<{ message: string; data: RealMessage[] }> {
  void _accessToken;
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.before) query.set("before", params.before);
  const url = getUrl(`/api/chat/conversations/${conversationId}/messages${query.toString() ? `?${query.toString()}` : ""}`);
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: RealMessage[] };
}

/** POST /api/chat/conversations/:id/messages */
export async function sendRealMessage(
  _accessToken: string,
  conversationId: string,
  content: string,
  type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" = "TEXT"
): Promise<{ message: string; data: RealMessage }> {
  void _accessToken;
  const url = getUrl(`/api/chat/conversations/${conversationId}/messages`);
  const res = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, type }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: RealMessage };
}

// ============================================================================
// DASHBOARD (Mock)
// ============================================================================

export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export interface CompanionNotification {
  id: string;
  title: string;
  content: string;
  created_at: string;
  level: "INFO" | "WARNING" | "ACTION_REQUIRED";
}

export interface CompanionEarningsSummary {
  today: number;
  month: number;
  pending: number;
  available_balance: number;
}

export interface CompanionDashboardSummary {
  todays_bookings: number;
  upcoming_bookings: number;
  pending_requests: number;
  earnings: CompanionEarningsSummary;
  verification_status: VerificationStatus;
  notifications: CompanionNotification[];
}

/** GET /api/companion/dashboard/summary */
export async function getCompanionDashboardSummary(
  accessToken: string
): Promise<{ data: CompanionDashboardSummary }> {
  const _url = getUrl("/api/companion/dashboard/summary");
  const _token = accessToken;

  // TODO: Replace with real API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          todays_bookings: 2,
          upcoming_bookings: 6,
          pending_requests: 3,
          earnings: {
            today: 680,
            month: 12680,
            pending: 920,
            available_balance: 3840,
          },
          verification_status: "PENDING",
          notifications: [
            {
              id: "n1",
              title: "New booking request",
              content: "You have a new pending booking request for tomorrow 10:00.",
              created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
              level: "ACTION_REQUIRED",
            },
            {
              id: "n2",
              title: "Verification in progress",
              content: "Your verification is under review. We'll notify you soon.",
              created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              level: "INFO",
            },
          ],
        },
      });
    }, 300);
  });
}

// ============================================================================
// BOOKINGS (Mock)
// ============================================================================

export type CompanionBookingStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "IN_SERVICE"
  | "COMPLETED"
  | "CANCELLED";

export type CompanionPaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";

export interface CompanionBooking {
  id: string;
  customer_name: string;
  merchant_name?: string;
  service_type: string;
  city: string;
  start_time: string; // ISO string
  duration_hours: number;
  price: number;
  payment_status: CompanionPaymentStatus;
  status: CompanionBookingStatus;
  note?: string;
}

export interface CompanionBookingsFilters {
  status?: CompanionBookingStatus;
  keyword?: string;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}

export interface CompanionBookingsResponse {
  data: CompanionBooking[];
  total: number;
  page: number;
  limit: number;
}

function createMockBookings(): CompanionBooking[] {
  const now = new Date();
  const hoursFromNow = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
  return [
    {
      id: "b1",
      customer_name: "Li Hua",
      merchant_name: "Bali Adventures Co.",
      service_type: "Guide (City Tour)",
      city: "Shanghai",
      start_time: hoursFromNow(3),
      duration_hours: 4,
      price: 520,
      payment_status: "PAID",
      status: "PENDING_CONFIRMATION",
      note: "Customer prefers English.",
    },
    {
      id: "b2",
      customer_name: "Wang Wei",
      service_type: "Translator (Business)",
      city: "Beijing",
      start_time: hoursFromNow(26),
      duration_hours: 8,
      price: 1200,
      payment_status: "PAID",
      status: "CONFIRMED",
    },
    {
      id: "b3",
      customer_name: "Alice",
      service_type: "Assistant (Shopping)",
      city: "Guangzhou",
      start_time: hoursFromNow(-2),
      duration_hours: 3,
      price: 360,
      payment_status: "PAID",
      status: "IN_SERVICE",
    },
    {
      id: "b4",
      customer_name: "Bob",
      merchant_name: "Tokyo Grand Hotel",
      service_type: "Guide (Multi-day)",
      city: "Tokyo",
      start_time: hoursFromNow(-48),
      duration_hours: 24,
      price: 2600,
      payment_status: "PAID",
      status: "COMPLETED",
    },
    {
      id: "b5",
      customer_name: "Chen Jie",
      service_type: "Guide (Airport Pickup)",
      city: "Shenzhen",
      start_time: hoursFromNow(-72),
      duration_hours: 2,
      price: 220,
      payment_status: "REFUNDED",
      status: "CANCELLED",
      note: "Customer cancelled due to flight delay.",
    },
    {
      id: "b6",
      customer_name: "Zhang Min",
      service_type: "Translator (Medical)",
      city: "Hangzhou",
      start_time: hoursFromNow(60),
      duration_hours: 6,
      price: 980,
      payment_status: "PAID",
      status: "PENDING_CONFIRMATION",
    },
    {
      id: "b7",
      customer_name: "Sophia",
      service_type: "Guide (Museum)",
      city: "Nanjing",
      start_time: hoursFromNow(100),
      duration_hours: 5,
      price: 640,
      payment_status: "PENDING",
      status: "PENDING_CONFIRMATION",
    },
  ];
}

/** GET /api/companion/bookings */
export async function getCompanionBookings(
  accessToken: string,
  filters?: CompanionBookingsFilters
): Promise<CompanionBookingsResponse> {
  const _url = getUrl("/api/companion/bookings");
  const _token = accessToken;

  const all = createMockBookings();
  const keyword = filters?.keyword?.trim().toLowerCase();
  const status = filters?.status;
  const limit = filters?.limit ?? 20;
  const page = filters?.page ?? 1;

  let filtered = all;
  if (status) filtered = filtered.filter((b) => b.status === status);
  if (keyword) {
    filtered = filtered.filter((b) => {
      return (
        b.customer_name.toLowerCase().includes(keyword) ||
        (b.merchant_name?.toLowerCase().includes(keyword) ?? false) ||
        b.service_type.toLowerCase().includes(keyword) ||
        b.city.toLowerCase().includes(keyword)
      );
    });
  }

  // Date filtering (YYYY-MM-DD) by start_time local date
  const dateFrom = filters?.date_from;
  const dateTo = filters?.date_to;
  if (dateFrom || dateTo) {
    filtered = filtered.filter((b) => {
      const d = b.start_time.slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }

  // Sort newest first by start_time
  filtered = [...filtered].sort((a, b) => (a.start_time < b.start_time ? 1 : -1));

  const total = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = filtered.slice(start, end);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, total, page, limit });
    }, 300);
  });
}

// ============================================================================
// AVAILABILITY (Mock)
// ============================================================================

export interface AvailabilityDay {
  date: string; // YYYY-MM-DD
  is_available: boolean;
  time_slots: string[]; // e.g. ["Morning", "Afternoon"] or ["Full day"]
  note?: string;
}

export interface AvailabilityMonthResponse {
  month: string; // YYYY-MM
  days: AvailabilityDay[];
}

export interface UpdateAvailabilityPayload {
  date: string; // YYYY-MM-DD
  is_available: boolean;
  time_slots?: string[];
  note?: string;
}

/** GET /api/companion/availability?month=YYYY-MM */
export async function getCompanionAvailability(
  accessToken: string,
  month: string
): Promise<{ data: AvailabilityMonthResponse }> {
  const _url = getUrl(`/api/companion/availability?month=${encodeURIComponent(month)}`);
  const _token = accessToken;

  const [yStr, mStr] = month.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const daysInMonth = new Date(y, m, 0).getDate();

  const days: AvailabilityDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${month}-${String(d).padStart(2, "0")}`;
    const dow = new Date(y, m - 1, d).getDay(); // 0 Sun .. 6 Sat
    const weekend = dow === 0 || dow === 6;
    const is_available = !weekend;
    days.push({
      date,
      is_available,
      time_slots: is_available ? ["Full day"] : [],
    });
  }

  // Add a few variations
  if (days.length >= 10) {
    days[2] = { ...days[2], is_available: false, time_slots: [], note: "Personal" };
    days[6] = { ...days[6], is_available: true, time_slots: ["Morning"], note: "Only morning" };
    days[9] = { ...days[9], is_available: true, time_slots: ["Afternoon"] };
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: { month, days } }), 300);
  });
}

/** PATCH /api/companion/availability */
export async function updateCompanionAvailability(
  accessToken: string,
  payload: UpdateAvailabilityPayload
): Promise<{ success: true }> {
  const _url = getUrl("/api/companion/availability");
  const _token = accessToken;
  const _payload = payload;

  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 250);
  });
}

// ============================================================================
// PROFILE (Mock)
// ============================================================================

export interface CompanionServiceItem {
  id: string;
  name: string;
  price_per_hour: number;
  description?: string;
}

export interface CompanionBankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string; // masked except last 4
}

export interface CompanionProfile {
  id: string;
  display_name: string;
  phone_number: string;
  avatar_url?: string;
  gender?: "male" | "female" | "other";
  years_of_experience?: number;
  intro_video_url?: string;
  bio?: string;
  languages: string[];
  service_cities: string[];
  rating: number;           // 0–5
  review_count: number;
  completed_bookings: number;
  verification_status: VerificationStatus;
  services: CompanionServiceItem[];
  bank_accounts: CompanionBankAccount[];
}

export interface UpdateCompanionProfilePayload {
  display_name?: string;
  gender?: "male" | "female" | "other";
  years_of_experience?: number;
  bio?: string;
  languages?: string[];
  service_cities?: string[];
  avatar_url?: string;
  intro_video_url?: string;
}

export interface UpdateCompanionServicePayload {
  id?: string; // omit for new
  name: string;
  price_per_hour: number;
  description?: string;
}

export interface UpdateCompanionPasswordPayload {
  current_password: string;
  new_password: string;
}

export interface AddBankAccountPayload {
  bank_name: string;
  account_name: string;
  account_number: string;
}

const _mockProfile: CompanionProfile = {
  id: "cp1",
  display_name: "Li Mei",
  phone_number: "138****8888",
  gender: "female",
  years_of_experience: 5,
  bio: "Professional bilingual guide with 5+ years experience in Shanghai and Beijing. Specialised in cultural tours and business translation.",
  languages: ["Chinese", "English", "Japanese"],
  service_cities: ["Shanghai", "Beijing", "Hangzhou"],
  rating: 4.8,
  review_count: 126,
  completed_bookings: 143,
  verification_status: "PENDING",
  services: [
    { id: "s1", name: "City Tour Guide", price_per_hour: 150, description: "Full or half-day city sightseeing" },
    { id: "s2", name: "Business Translator", price_per_hour: 280, description: "Meetings, negotiations, conferences" },
    { id: "s3", name: "Airport Transfer Assist", price_per_hour: 120 },
  ],
  bank_accounts: [
    { id: "ba1", bank_name: "China Construction Bank", account_name: "Li Mei", account_number: "****5678" },
  ],
};

/** GET /api/companion/profile */
export async function getCompanionProfile(
  accessToken: string
): Promise<{ data: CompanionProfile }> {
  const _url = getUrl("/api/companion/profile");
  const _token = accessToken;

  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: { ..._mockProfile } }), 300);
  });
}

/** PATCH /api/companion/profile */
export async function updateCompanionProfile(
  accessToken: string,
  payload: UpdateCompanionProfilePayload
): Promise<{ data: CompanionProfile }> {
  const _url = getUrl("/api/companion/profile");
  const _token = accessToken;
  Object.assign(_mockProfile, payload);
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: { ..._mockProfile } }), 300);
  });
}

/** PATCH /api/companion/profile/password */
export async function updateCompanionPassword(
  accessToken: string,
  payload: UpdateCompanionPasswordPayload
): Promise<{ success: true }> {
  const _url = getUrl("/api/companion/profile/password");
  const _token = accessToken;
  const _payload = payload;
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 400);
  });
}

/** POST /api/companion/profile/bank-accounts */
export async function addCompanionBankAccount(
  accessToken: string,
  payload: AddBankAccountPayload
): Promise<{ data: CompanionBankAccount }> {
  const _url = getUrl("/api/companion/profile/bank-accounts");
  const _token = accessToken;
  const newAccount: CompanionBankAccount = {
    id: `ba${Date.now()}`,
    bank_name: payload.bank_name,
    account_name: payload.account_name,
    account_number: `****${payload.account_number.slice(-4)}`,
  };
  _mockProfile.bank_accounts.push(newAccount);
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: newAccount }), 300);
  });
}

/** DELETE /api/companion/profile/bank-accounts/:id */
export async function deleteCompanionBankAccount(
  accessToken: string,
  accountId: string
): Promise<{ success: true }> {
  const _url = getUrl(`/api/companion/profile/bank-accounts/${accountId}`);
  const _token = accessToken;
  _mockProfile.bank_accounts = _mockProfile.bank_accounts.filter((a) => a.id !== accountId);
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 250);
  });
}

