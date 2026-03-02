<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useRouter } from "vue-router";
import { getAccessToken, getRefreshToken, silentRefresh, forceLogout } from "./api/auth";

// How often (ms) to proactively refresh tokens in the background.
// Set slightly below the typical access-token TTL (e.g. 14 min for a 15 min token).
const PROACTIVE_REFRESH_INTERVAL_MS = 14 * 60 * 1_000;

let _refreshIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Silently refreshes the access token if the user is logged in.
 * Calls forceLogout() if the refresh token is gone or the server rejects it.
 */
async function tryProactiveRefresh(): Promise<void> {
  if (!getAccessToken()) return; // not logged in — nothing to refresh
  if (!getRefreshToken()) return; // no refresh token — let fetchWithAuth handle it on next request
  try {
    await silentRefresh();
  } catch {
    // Refresh failed — session is unrecoverable; force logout
    forceLogout();
  }
}

/** Start the background refresh interval (idempotent). */
function startRefreshInterval(): void {
  if (_refreshIntervalId !== null) return;
  _refreshIntervalId = setInterval(tryProactiveRefresh, PROACTIVE_REFRESH_INTERVAL_MS);
}

/** Stop the background refresh interval. */
function stopRefreshInterval(): void {
  if (_refreshIntervalId === null) return;
  clearInterval(_refreshIntervalId);
  _refreshIntervalId = null;
}

// Must be called during setup() so inject() works; only defined on H5.
let router: ReturnType<typeof useRouter> | undefined;
try {
  router = useRouter();
} catch {
  router = undefined;
}

// H5 only: register "/" as the index page so the app opens at "/" instead of "/pages/index/index"
function setupRootRoute() {
  // @ts-expect-error UNI_PLATFORM is set by uni-app
  if (typeof window === "undefined" || process.env.UNI_PLATFORM !== "h5" || !router) return;
  if (router.getRoutes().some((r) => r.path === "/")) return;
  router.addRoute({
    path: "/",
    name: "Home",
    component: () => import("./pages/index/index.vue"),
  });
  if (router.currentRoute.value.path === "/" && !router.currentRoute.value.matched.length) {
    router.replace("/");
  }
}

onLaunch(() => {
  setupRootRoute();
  // Start proactive token refresh as soon as the app is ready
  startRefreshInterval();
  console.log("App Launch");
});

onShow(() => {
  // App returned to foreground (tab regained focus, mini-program resumed, etc.)
  // Refresh immediately so the token is fresh before any API call is made.
  tryProactiveRefresh();
  // Restart the interval in case it was stopped while hidden
  startRefreshInterval();
  console.log("App Show");
});

onHide(() => {
  // App went to background — pause the interval to save resources
  stopRefreshInterval();
  console.log("App Hide");
});
</script>
<style></style>
