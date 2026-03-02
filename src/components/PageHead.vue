<template>
  <view class="page-head-wrap">
    <view class="page-head app-font">
      <view class="page-head-inner">
        <view class="page-head-left">
          <view
            v-if="isLoggedIn"
            class="icon-btn"
            aria-label="Menu"
            :aria-expanded="menuOpen"
            @click="toggleMenu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </view>
          <view v-else class="icon-btn" aria-label="Home" @click="goHome">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </view>
        </view>
        <view v-if="menuOpen" class="menu-overlay" @click="menuOpen = false" />
        <view v-if="menuOpen" class="menu-dropdown">
          <view class="menu-item" @click="onHome">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <text>{{ t('common.home') }}</text>
          </view>
          <view class="menu-item" @click="onSettings">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <text>{{ t('nav.profile') }}</text>
          </view>
          <view class="menu-item" @click="onHelp">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <text>{{ t('common.help') }}</text>
          </view>
          <view class="menu-divider"></view>
          <view class="menu-item" @click="onLogout">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <text>{{ t('common.logout') }}</text>
          </view>
        </view>
        <view class="page-head-actions">
          <text
            class="lang-option"
            :class="{ active: locale === 'zh' }"
            @click="setLocale('zh')"
          >{{ t('common.langZh') }}</text>
          <text class="lang-divider">|</text>
          <text
            class="lang-option"
            :class="{ active: locale === 'en' }"
            @click="setLocale('en')"
          >{{ t('common.langEn') }}</text>
        </view>
      </view>
    </view>
    <view class="page-head-spacer" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { setLocale as setAppLocale } from "../i18n";
import { getAccessToken, clearAccessToken, clearRefreshToken } from "../api/auth";
import { ROUTES } from "../routes";

defineProps<{ title?: string }>();

const { t, locale } = useI18n();
const menuOpen = ref(false);
const isLoggedIn = computed(() => !!getAccessToken());

function setLocale(lang: "zh" | "en") {
  setAppLocale(lang);
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function goHome() {
  menuOpen.value = false;
  const pages = getCurrentPages();
  const current = pages.length > 0 ? (pages[pages.length - 1].route || "") : "";
  const isCompanionRoute = current.startsWith("companion/") || current.startsWith("/companion/");
  const url = getAccessToken()
    ? (isCompanionRoute ? ROUTES.COMPANION_DASHBOARD : ROUTES.DASHBOARD)
    : ROUTES.INDEX;
  uni.reLaunch({ url });
}

function onHome() {
  menuOpen.value = false;
  const pages = getCurrentPages();
  const current = pages.length > 0 ? (pages[pages.length - 1].route || "") : "";
  const isCompanionRoute = current.startsWith("companion/") || current.startsWith("/companion/");
  uni.reLaunch({ url: isCompanionRoute ? ROUTES.COMPANION_DASHBOARD : ROUTES.DASHBOARD });
}

function onSettings() {
  menuOpen.value = false;
  // Navigate to profile page for settings
  const pages = getCurrentPages();
  const current = pages.length > 0 ? (pages[pages.length - 1].route || "") : "";
  const isCompanionRoute = current.startsWith("companion/") || current.startsWith("/companion/");
  uni.navigateTo({ url: isCompanionRoute ? ROUTES.COMPANION_PROFILE : ROUTES.PROFILE });
}

function onHelp() {
  menuOpen.value = false;
  // Show help/support (placeholder - can be implemented later)
  uni.showToast({
    title: t("common.help"),
    icon: "none",
    duration: 2000,
  });
}

function onLogout() {
  menuOpen.value = false;
  clearAccessToken();
  clearRefreshToken();
  uni.reLaunch({ url: ROUTES.INDEX });
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Wrapper so header is positioned inside parent (e.g. phone-frame), not viewport */
.page-head-wrap {
  position: relative;
  width: 100%;
}

/* Mobile-sized header inside mobile area (absolute so it stays in container) */
.page-head {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: #F97316;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top, 0);
}

.page-head-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 12px;
  box-sizing: border-box;
}

.page-head-title {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.page-head-left {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.page-head-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0 -8px 0 0;
  color: #ffffff;
  -webkit-tap-highlight-color: transparent;
}

.icon-btn:active {
  color: rgba(255, 255, 255, 0.7);
}

.lang-option {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
}

.lang-option.active {
  color: #ffffff;
  font-weight: 600;
}

.lang-divider {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.page-head-spacer {
  height: 44px;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top, 0);
  box-sizing: content-box;
}

.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 9;
  background: transparent;
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 12px;
  z-index: 9999;
  min-width: 160px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 15px;
  color: #334155;
  -webkit-tap-highlight-color: transparent;
}

.menu-item:active {
  background: #f1f5f9;
}

.menu-item text {
  font-family: inherit;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}
</style>
