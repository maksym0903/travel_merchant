<template>
  <view v-if="isLoggedIn" class="bottom-tab-bar-wrapper app-font">
    <!-- Companion More Dropdown Menu -->
    <view v-if="showCompanionMoreDropdown" class="products-dropdown-overlay" @click="showCompanionMoreDropdown = false"></view>
    <view v-if="showCompanionMoreDropdown" class="products-dropdown companion-more-dropdown">
      <view
        v-for="item in companionMoreItems"
        :key="item.route"
        class="dropdown-item"
        :class="{ active: currentRoute === item.route }"
        @click="navigateToCompanionMore(item.route)"
      >
        <text class="dropdown-label">{{ item.label }}</text>
      </view>
    </view>

    <!-- Products Dropdown Menu -->
    <view v-if="showProductsDropdown" class="products-dropdown-overlay" @click="closeProductsDropdown"></view>
    <view v-if="showProductsDropdown" class="products-dropdown">
      <view 
        class="dropdown-item" 
        :class="{ active: isProductsRoute(ROUTES.PRODUCTS_TOURS) }"
        @click="navigateToProduct(ROUTES.PRODUCTS_TOURS)"
      >
        <text class="dropdown-label">{{ t('merchant.tours') }}</text>
      </view>
      <view 
        class="dropdown-item" 
        :class="{ active: isProductsRoute(ROUTES.PRODUCTS_HOTELS) }"
        @click="navigateToProduct(ROUTES.PRODUCTS_HOTELS)"
      >
        <text class="dropdown-label">{{ t('merchant.hotels') }}</text>
      </view>
      <view 
        class="dropdown-item" 
        :class="{ active: isProductsRoute(ROUTES.PRODUCTS_TICKETS) }"
        @click="navigateToProduct(ROUTES.PRODUCTS_TICKETS)"
      >
        <text class="dropdown-label">{{ t('merchant.tickets') }}</text>
      </view>
      <view 
        class="dropdown-item" 
        :class="{ active: isProductsRoute(ROUTES.PRODUCTS_INSURANCE) }"
        @click="navigateToProduct(ROUTES.PRODUCTS_INSURANCE)"
      >
        <text class="dropdown-label">{{ t('merchant.insurance') }}</text>
      </view>
      <view 
        class="dropdown-item" 
        :class="{ active: isProductsRoute(ROUTES.PRODUCTS_PACKAGES) }"
        @click="navigateToProduct(ROUTES.PRODUCTS_PACKAGES)"
      >
        <text class="dropdown-label">{{ t('merchant.packages') }}</text>
      </view>
    </view>
    
    <view class="bottom-tab-bar app-font">
      <view 
        class="tab-item" 
        :class="{ active: isTabActive(tab) }" 
        v-for="tab in visibleTabs" 
        :key="tab.route" 
        @click="handleTabClick(tab)"
      >
      <view class="tab-icon">
        <svg v-if="tab.icon === 'home'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <svg v-else-if="tab.icon === 'products'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        <svg v-else-if="tab.icon === 'orders'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <svg v-else-if="tab.icon === 'services'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else-if="tab.icon === 'earnings'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        <svg v-else-if="tab.icon === 'wallet'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        <svg v-else-if="tab.icon === 'settings'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <svg v-else-if="tab.icon === 'bookings'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <svg v-else-if="tab.icon === 'calendar'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <svg v-else-if="tab.icon === 'collaboration'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <svg v-else-if="tab.icon === 'messages'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <svg v-else-if="tab.icon === 'more'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="19" cy="12" r="1"/>
          <circle cx="5" cy="12" r="1"/>
        </svg>
        <view v-if="tab.badge && tab.badge > 0" class="tab-badge">{{ tab.badge > 99 ? '99+' : tab.badge }}</view>
      </view>
      <text class="tab-label">{{ tab.label }}</text>
    </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useI18n } from "vue-i18n";
import { getAccessToken } from "../api/auth";
import { getMe } from "../api/auth";
import { ROUTES } from "../routes";

const { t } = useI18n();
const isLoggedIn = computed(() => !!getAccessToken());
const userRole = ref<"MERCHANT" | "COMPANION" | null>(null);
const currentRoute = ref("");
const showProductsDropdown = ref(false);
const showCompanionMoreDropdown = ref(false);

function updateCurrentRoute() {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1];
    const route = currentPage.route || "";
    // Normalize route to match ROUTES format (with leading slash)
    currentRoute.value = route.startsWith("/") ? route : "/" + route;
  }
}

// Fetch user role on mount
onMounted(async () => {
  const token = getAccessToken();
  if (token) {
    try {
      const me = await getMe(token);
      userRole.value = (me.data.account?.role as "MERCHANT" | "COMPANION") || null;
    } catch {
      userRole.value = null;
    }
  }
  updateCurrentRoute();
});

// Update route when page is shown
onShow(() => {
  updateCurrentRoute();
});

// Merchant tabs
const merchantTabs = computed(() => [
  { route: ROUTES.DASHBOARD, icon: "home", label: t("nav.dashboard"), badge: 0, isProducts: false },
  { route: ROUTES.PRODUCTS_TOURS, icon: "products", label: t("nav.products"), badge: 0, isProducts: true },
  { route: ROUTES.ORDERS, icon: "orders", label: t("nav.orders"), badge: 0, isProducts: false },
  { route: ROUTES.WALLET, icon: "wallet", label: t("nav.wallet"), badge: 0, isProducts: false },
  { route: ROUTES.SETTINGS, icon: "settings", label: t("nav.settings"), badge: 0, isProducts: false },
]);

// Companion tabs — 5 primary + "More" dropdown
const companionTabs = computed(() => [
  { route: ROUTES.COMPANION_DASHBOARD, icon: "home", label: t("nav.dashboard"), badge: 0, isCompanionMore: false },
  { route: ROUTES.COMPANION_BOOKINGS, icon: "bookings", label: t("nav.bookings"), badge: 0, isCompanionMore: false },
  { route: ROUTES.COMPANION_AVAILABILITY, icon: "calendar", label: t("nav.availability"), badge: 0, isCompanionMore: false },
  { route: ROUTES.COMPANION_MESSAGES, icon: "messages", label: t("nav.messages"), badge: 0, isCompanionMore: false },
  { route: "more", icon: "more", label: t("nav.more"), badge: 0, isCompanionMore: true },
]);

// Companion "More" dropdown items
const companionMoreItems = computed(() => [
  { route: ROUTES.COMPANION_SERVICES, label: t("nav.services") },
  { route: ROUTES.COMPANION_COLLABORATION, label: t("nav.collaboration") },
  { route: ROUTES.COMPANION_WALLET, label: t("nav.wallet") },
  { route: ROUTES.COMPANION_SETTINGS, label: t("nav.settings") },
]);

const isCompanionMoreRoute = computed(() =>
  companionMoreItems.value.some((item) => item.route === currentRoute.value)
);

const visibleTabs = computed(() => {
  if (userRole.value === "MERCHANT") return merchantTabs.value;
  if (userRole.value === "COMPANION") return companionTabs.value;
  return []; // Show nothing if role not loaded
});

function isTabActive(tab: { route: string; isProducts?: boolean; isCompanionMore?: boolean }): boolean {
  if (tab.isProducts) return isProductsRoute(tab.route);
  if (tab.isCompanionMore) return isCompanionMoreRoute.value;
  return currentRoute.value === tab.route;
}

function isProductsRoute(route: string): boolean {
  // Check if current route is any products submenu
  return currentRoute.value === ROUTES.PRODUCTS_TOURS ||
         currentRoute.value === ROUTES.PRODUCTS_HOTELS ||
         currentRoute.value === ROUTES.PRODUCTS_TICKETS ||
         currentRoute.value === ROUTES.PRODUCTS_INSURANCE ||
         currentRoute.value === ROUTES.PRODUCTS_PACKAGES;
}

function handleTabClick(tab: { route: string; icon: string; isProducts?: boolean; isCompanionMore?: boolean }) {
  if (tab.isProducts) {
    showCompanionMoreDropdown.value = false;
    showProductsDropdown.value = !showProductsDropdown.value;
  } else if (tab.isCompanionMore) {
    showProductsDropdown.value = false;
    showCompanionMoreDropdown.value = !showCompanionMoreDropdown.value;
  } else {
    showProductsDropdown.value = false;
    showCompanionMoreDropdown.value = false;
    navigateTo(tab.route);
  }
}

function navigateToCompanionMore(route: string) {
  showCompanionMoreDropdown.value = false;
  navigateTo(route);
}

function navigateToProduct(route: string) {
  showProductsDropdown.value = false;
  navigateTo(route);
}

function closeProductsDropdown() {
  showProductsDropdown.value = false;
}

function navigateTo(route: string) {
  // Normalize route for comparison
  const normalizedRoute = route.startsWith("/") ? route : "/" + route;
  if (currentRoute.value === normalizedRoute) return;
  // Use reLaunch for navigation to ensure clean state
  uni.reLaunch({ url: route });
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.bottom-tab-bar-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.products-dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: transparent;
}

.products-dropdown {
  position: fixed;
  bottom: 56px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 101;
  min-width: 140px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
  padding: 8px 0;
  margin-bottom: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  font-size: 14px;
  color: #334155;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:active {
  background: #f1f5f9;
}

.dropdown-item.active {
  background: #f0fdf4;
  color: #EF4444;
}

.dropdown-label {
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
}

.bottom-tab-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 4px;
  color: #64748b;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  min-width: 0;
}

.tab-item:active {
  opacity: 0.7;
}

.tab-item.active {
  color: #EF4444;
}

.tab-icon {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.tab-icon svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
}

.tab-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border: 2px solid #ffffff;
}

.tab-label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

@media (min-width: 768px) {
  .bottom-tab-bar-wrapper {
    max-width: min(390px, 100vw);
    left: 50%;
    transform: translateX(-50%);
  }
  
  .products-dropdown {
    left: auto;
    transform: none;
    /* Position relative to Products tab - approximately 1/7 of width */
    margin-left: calc((min(390px, 100vw) / 7) * 1 - 70px);
  }
}
</style>
