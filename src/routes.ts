/**
 * Uni-app page paths (must match pages.json for Vue Router).
 * Index is exposed as "/" on H5 via a runtime route in App.vue; native uses pages.json path.
 */
declare const process: { env?: { UNI_PLATFORM?: string } };

const isH5 =
  typeof process !== "undefined" &&
  process.env?.UNI_PLATFORM === "h5";

export const ROUTES = {
  /** Landing / home (H5: "/", native: "/pages/index/index") */
  INDEX: isH5 ? "/" : "/pages/index/index",
  /** Login page (path auth/login in pages.json) */
  LOGIN: "/auth/login",
  /** Register page */
  REGISTER: "/auth/register",
  /** Phone verification page */
  VERIFICATION: "/auth/verification",
  /** Merchant profile (initial setup) */
  PROFILE: "/merchant/profile",
  /** Merchant dashboard */
  DASHBOARD: "/merchant/dashboard",
  /** Products Tours page */
  PRODUCTS_TOURS: "/merchant/products/tours",
  /** Products Tours Create page */
  PRODUCTS_TOURS_CREATE: "/merchant/products/tours/create",
  /** Products Hotels page */
  PRODUCTS_HOTELS: "/merchant/products/hotels",
  /** Products Tickets page */
  PRODUCTS_TICKETS: "/merchant/products/tickets",
  /** Products Insurance page */
  PRODUCTS_INSURANCE: "/merchant/products/insurance",
  /** Products Packages page */
  PRODUCTS_PACKAGES: "/merchant/products/packages",
  /** Orders page */
  ORDERS: "/merchant/orders",
  /** Order detail page */
  ORDER_DETAIL: "/merchant/orders/:id",
  /** Wallet page */
  WALLET: "/merchant/wallet",
  /** Wallet Transactions page */
  WALLET_TRANSACTIONS: "/merchant/wallet/transactions",
  /** Wallet Withdraw page */
  WALLET_WITHDRAW: "/merchant/wallet/withdraw",
  /** Settings page */
  SETTINGS: "/merchant/settings",
  /** Services page (Companion) */
  SERVICES: "/merchant/services",
  /** Earnings page (Companion) */
  EARNINGS: "/merchant/earnings",

  // ============================================================================
  // COMPANION (Phase 1 core)
  // ============================================================================
  /** Companion dashboard */
  COMPANION_DASHBOARD: "/companion/dashboard",
  /** Companion bookings */
  COMPANION_BOOKINGS: "/companion/bookings",
  /** Companion availability calendar */
  COMPANION_AVAILABILITY: "/companion/availability",
  /** Companion services & pricing */
  COMPANION_SERVICES: "/companion/services",
  /** Companion collaboration */
  COMPANION_COLLABORATION: "/companion/collaboration",
  /** Companion messages */
  COMPANION_MESSAGES: "/companion/messages",
  /** Companion wallet */
  COMPANION_WALLET: "/companion/wallet",
  /** Companion settings */
  COMPANION_SETTINGS: "/companion/settings",
  /** Companion profile */
  COMPANION_PROFILE: "/companion/profile",
} as const;

export function verificationUrl(phoneNumber: string): string {
  return `${ROUTES.VERIFICATION}?phone_number=${encodeURIComponent(phoneNumber)}`;
}
