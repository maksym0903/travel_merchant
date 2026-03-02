/**
 * Auth API — integrated with api-server.
 *
 * Backend: api-server (travelling_app_china/api-server)
 *   - Routes: src/routes/auth.routes.ts  → POST /api/auth/register
 *   - Controller: src/controllers/auth.controller.ts → registerHandler
 *   - Service: src/services/auth.service.ts → registerAccount
 *
 * Request: { role, phone_number, password }
 *   - role: "MERCHANT" | "COMPANION" | "CUSTOMER" (NON_ADMIN_ROLES in api-server constants)
 *   - phone_number: digits only, 8–15 chars (requireValidPhone)
 * Success: 201 { message, data: { user_id } }
 * Errors: 400 (validation), 409 (phone already registered) → { message }
 */
const API_BASE = (import.meta.env?.VITE_API_BASE_URL as string) ?? "";

function getUrl(path: string): string {
  const base = API_BASE ? API_BASE.replace(/\/$/, "") : "";
  const full = base ? `${base}${path}` : path;
  return full.startsWith("http") ? full : `${window.location.origin}${full}`;
}

export type RegisterRole = "MERCHANT" | "COMPANION" | "CUSTOMER";

export interface RegisterPayload {
  phone_number: string;
  password: string;
  role: RegisterRole;
}

/** Matches api-server registerHandler response */
export interface RegisterResponse {
  message: string;
  data: { user_id: string };
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const url = getUrl("/api/auth/register");
  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Accept": "application/json",
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({
      phone_number: payload.phone_number.trim(),
      password: payload.password,
      role: payload.role,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as RegisterResponse;
}

/** POST /api/auth/verify-phone — submit 6-digit code to activate account */
export async function verifyPhone(phone_number: string, code: string): Promise<{ message: string; data: unknown }> {
  const url = getUrl("/api/auth/verify-phone");
  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Accept": "application/json",
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ phone_number: phone_number.trim(), code: String(code).trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: unknown };
}

/** Thrown by login() when response is not ok; status is 401 or 403 for redirect to verification */
export class AuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/** POST /api/auth/login — returns access_token and refresh_token */
export interface LoginResponse {
  message: string;
  data: { access_token: string; refresh_token: string };
}

export async function login(phone_number: string, password: string): Promise<LoginResponse> {
  const url = getUrl("/api/auth/login");
  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Accept": "application/json",
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ phone_number: phone_number.trim(), password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new AuthError(msg, res.status);
  }
  return data as LoginResponse;
}

/** Token storage keys for H5 */
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function setAccessToken(token: string): void {
  if (typeof localStorage !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken(): void {
  if (typeof localStorage !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  if (typeof localStorage !== "undefined") localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearRefreshToken(): void {
  if (typeof localStorage !== "undefined") localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** Clear all auth tokens and redirect to login */
export function forceLogout(): void {
  clearAccessToken();
  clearRefreshToken();
  // Redirect to login — works in both H5 and native
  uni.reLaunch({ url: "/auth/login" });
}

/** POST /api/auth/logout — invalidate server-side session, then clear local tokens */
export async function logoutApi(): Promise<void> {
  try {
    await fetchWithAuth(getUrl("/api/auth/logout"), { method: "POST" });
  } catch {
    // ignore errors — we still clear tokens locally
  }
  clearAccessToken();
  clearRefreshToken();
}

/** POST /api/auth/refresh — exchange refresh_token for a new access+refresh token pair */
export interface RefreshResponse {
  message: string;
  data: { access_token: string; refresh_token: string };
}

let _refreshPromise: Promise<string> | null = null;

/**
 * Silently refresh the access token using the stored refresh token.
 * Deduplicates concurrent refresh calls (only one in-flight at a time).
 * Returns the new access token, or throws if refresh fails.
 */
export async function silentRefresh(): Promise<string> {
  // Deduplicate: if a refresh is already in-flight, reuse it
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token available");

    const url = getUrl("/api/auth/refresh");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data as { message?: string }).message ?? `Refresh failed (${res.status})`;
      throw new AuthError(msg, res.status);
    }

    const { access_token, refresh_token } = (data as RefreshResponse).data;
    setAccessToken(access_token);
    setRefreshToken(refresh_token);
    return access_token;
  })().finally(() => {
    _refreshPromise = null;
  });

  return _refreshPromise;
}

/**
 * Authenticated fetch wrapper with automatic silent token refresh.
 *
 * - Injects `Authorization: Bearer <access_token>` header automatically.
 * - On 401 response: attempts one silent refresh, then retries the original request.
 * - If refresh fails (no refresh token, or server rejects it): calls forceLogout().
 *
 * Usage (replaces raw fetch in API functions):
 *   const res = await fetchWithAuth(url, { method: "GET" });
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken();

  const makeRequest = (token: string | null) => {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...options, headers });
  };

  let res = await makeRequest(accessToken);

  if (res.status === 401) {
    try {
      const newToken = await silentRefresh();
      res = await makeRequest(newToken);
    } catch {
      forceLogout();
      throw new AuthError("Session expired. Please log in again.", 401);
    }
  }

  return res;
}

/** Auth/me response from api-server */
export interface AuthMeProfile {
  business_name?: string;
  [key: string]: unknown;
}

export interface AuthMeResponse {
  message: string;
  data: {
    account: { role: string; [key: string]: unknown };
    profile: AuthMeProfile | null;
  };
}

/** GET /api/auth/me — returns account + profile (requires Authorization: Bearer token) */
export async function getMe(accessToken: string): Promise<AuthMeResponse> {
  const url = getUrl("/api/auth/me");
  // fetchWithAuth injects the stored token and handles silent refresh automatically.
  // The accessToken param is kept for API compatibility but the stored token takes precedence.
  void accessToken;
  const res = await fetchWithAuth(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as AuthMeResponse;
}

/** POST /api/auth/send-phone-code — resend 6-digit code to phone */
export async function sendPhoneCode(phone_number: string): Promise<{ message: string; data: { sent: boolean } }> {
  const url = getUrl("/api/auth/send-phone-code");
  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Accept": "application/json",
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ phone_number: phone_number.trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { message: string; data: { sent: boolean } };
}
