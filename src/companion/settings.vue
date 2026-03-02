<template>
  <view class="companion-settings-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('companion.settingsTitle')" />
      <view class="phone-inner">
        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ t("merchant.loading") }}</text>
        </view>

        <view v-else class="content">
          <!-- Account Section -->
          <view class="section">
            <text class="section-title">{{ t("companion.settings.account") }}</text>
            <view class="menu-card">
              <view class="menu-item" @click="openPasswordDrawer">
                <view class="menu-item-left">
                  <text class="menu-icon">🔒</text>
                  <text class="menu-label">{{ t("companion.settings.changePassword") }}</text>
                </view>
                <text class="menu-arrow">›</text>
              </view>
              <view class="menu-divider"></view>
              <view class="menu-item" @click="goProfile">
                <view class="menu-item-left">
                  <text class="menu-icon">👤</text>
                  <text class="menu-label">{{ t("companion.settings.editProfile") }}</text>
                </view>
                <text class="menu-arrow">›</text>
              </view>
            </view>
          </view>

          <!-- Notifications Section -->
          <view class="section">
            <text class="section-title">{{ t("companion.settings.notifications") }}</text>
            <view class="menu-card">
              <view class="menu-item">
                <view class="menu-item-left">
                  <text class="menu-icon">🔔</text>
                  <text class="menu-label">{{ t("companion.settings.bookingAlerts") }}</text>
                </view>
                <view class="toggle" :class="{ on: notifBookings }" @click="notifBookings = !notifBookings">
                  <view class="toggle-thumb"></view>
                </view>
              </view>
              <view class="menu-divider"></view>
              <view class="menu-item">
                <view class="menu-item-left">
                  <text class="menu-icon">💬</text>
                  <text class="menu-label">{{ t("companion.settings.messageAlerts") }}</text>
                </view>
                <view class="toggle" :class="{ on: notifMessages }" @click="notifMessages = !notifMessages">
                  <view class="toggle-thumb"></view>
                </view>
              </view>
            </view>
          </view>

          <!-- Language & Display -->
          <view class="section">
            <text class="section-title">{{ t("companion.settings.display") }}</text>
            <view class="menu-card">
              <view class="menu-item">
                <view class="menu-item-left">
                  <text class="menu-icon">🌐</text>
                  <text class="menu-label">{{ t("companion.settings.language") }}</text>
                </view>
                <text class="menu-value">{{ currentLocale === "zh" ? "中文" : "English" }}</text>
              </view>
            </view>
          </view>

          <!-- About -->
          <view class="section">
            <text class="section-title">{{ t("companion.settings.about") }}</text>
            <view class="menu-card">
              <view class="menu-item">
                <view class="menu-item-left">
                  <text class="menu-icon">ℹ️</text>
                  <text class="menu-label">{{ t("companion.settings.version") }}</text>
                </view>
                <text class="menu-value">1.0.0</text>
              </view>
              <view class="menu-divider"></view>
              <view class="menu-item">
                <view class="menu-item-left">
                  <text class="menu-icon">📋</text>
                  <text class="menu-label">{{ t("companion.settings.terms") }}</text>
                </view>
                <text class="menu-arrow">›</text>
              </view>
              <view class="menu-divider"></view>
              <view class="menu-item">
                <view class="menu-item-left">
                  <text class="menu-icon">🛡</text>
                  <text class="menu-label">{{ t("companion.settings.privacy") }}</text>
                </view>
                <text class="menu-arrow">›</text>
              </view>
            </view>
          </view>

          <!-- Logout -->
          <view class="logout-btn" @click="confirmLogout">
            <text>{{ t("companion.settings.logout") }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Change Password Drawer -->
    <view v-if="passwordDrawerOpen" class="drawer-overlay" @click="passwordDrawerOpen = false"></view>
    <view v-if="passwordDrawerOpen" class="drawer">
      <view class="drawer-header">
        <text class="drawer-title">{{ t("companion.settings.changePassword") }}</text>
        <view class="drawer-close" @click="passwordDrawerOpen = false"><text>✕</text></view>
      </view>
      <view class="drawer-body">
        <view class="field">
          <text class="field-label">{{ t("companion.settings.currentPassword") }}</text>
          <input class="field-input" v-model="pwForm.current" type="password" :placeholder="t('companion.settings.currentPasswordPlaceholder')" />
        </view>
        <view class="field">
          <text class="field-label">{{ t("companion.settings.newPassword") }}</text>
          <input class="field-input" v-model="pwForm.newPw" type="password" :placeholder="t('companion.settings.newPasswordPlaceholder')" />
        </view>
        <view class="field">
          <text class="field-label">{{ t("companion.settings.confirmPassword") }}</text>
          <input class="field-input" v-model="pwForm.confirm" type="password" :placeholder="t('companion.settings.confirmPasswordPlaceholder')" />
        </view>
      </view>
      <view class="drawer-footer">
        <view class="btn-outline" @click="passwordDrawerOpen = false"><text>{{ t("companion.settings.cancel") }}</text></view>
        <view class="btn-primary" :class="{ disabled: savingPassword }" @click="savePassword">
          <text>{{ savingPassword ? t("companion.settings.saving") : t("companion.settings.save") }}</text>
        </view>
      </view>
    </view>

    <ConfirmDrawer
      :open="confirmDrawer.open"
      :title="confirmDrawer.title"
      :content="confirmDrawer.content"
      :confirmText="confirmDrawer.confirmText"
      :cancelText="confirmDrawer.cancelText"
      :tone="confirmDrawerTone"
      :loading="confirmDrawer.loading"
      @confirm="confirmDrawer.onConfirm"
      @cancel="confirmDrawer.onCancel"
    />

    <BottomTabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { getAccessToken, logoutApi } from "../api/auth";
import { ROUTES } from "../routes";
import { showToast } from "../utils/toast";
import { useConfirmDrawer } from "../utils/confirmDrawer";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";
import ConfirmDrawer from "../components/ConfirmDrawer.vue";

const { t, locale } = useI18n();
const currentLocale = locale;

const confirmDrawer = useConfirmDrawer();
const confirmDrawerTone = ref<"primary" | "danger">("danger");

const loading = ref(false);
const passwordDrawerOpen = ref(false);
const savingPassword = ref(false);
const notifBookings = ref(true);
const notifMessages = ref(true);

const pwForm = ref({ current: "", newPw: "", confirm: "" });

function openPasswordDrawer() {
  pwForm.value = { current: "", newPw: "", confirm: "" };
  passwordDrawerOpen.value = true;
}

function goProfile() {
  uni.reLaunch({ url: ROUTES.COMPANION_PROFILE });
}

async function savePassword() {
  if (!pwForm.value.current) {
    showToast({ title: t("companion.settings.currentPasswordRequired"), icon: "none" });
    return;
  }
  if (!pwForm.value.newPw || pwForm.value.newPw.length < 6) {
    showToast({ title: t("companion.settings.newPasswordMinLength"), icon: "none" });
    return;
  }
  if (pwForm.value.newPw !== pwForm.value.confirm) {
    showToast({ title: t("companion.settings.passwordMismatch"), icon: "none" });
    return;
  }
  savingPassword.value = true;
  try {
    await new Promise((r) => setTimeout(r, 600));
    showToast({ title: t("companion.settings.passwordChanged"), icon: "success" });
    passwordDrawerOpen.value = false;
  } catch {
    showToast({ title: t("companion.settings.passwordChangeError"), icon: "none" });
  } finally {
    savingPassword.value = false;
  }
}

async function confirmLogout() {
  confirmDrawerTone.value = "danger";
  const ok = await confirmDrawer.request({
    title: t("companion.settings.logout"),
    content: t("companion.settings.logoutConfirm"),
    confirmText: t("companion.settings.logout"),
    cancelText: t("companion.settings.cancel"),
  });
  if (!ok) return;
  await logoutApi();
  uni.reLaunch({ url: ROUTES.LOGIN });
}

onMounted(() => {
  const token = getAccessToken();
  if (!token) { uni.reLaunch({ url: ROUTES.LOGIN }); }
});
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.companion-settings-page {
  min-height: 100vh; height: 100vh; background: #f1f5f9; box-sizing: border-box; overflow: hidden; padding-bottom: 56px;
}
.phone-frame {
  width: 100%; height: 100%; min-height: 0; display: flex; flex-direction: column; margin: 0 auto; padding: 0; box-sizing: border-box;
}
.phone-inner {
  width: 100%; height: 100%; min-height: 0; flex: 1; margin: 0 auto; padding: 24rpx 24rpx 48rpx; box-sizing: border-box; background: #f8fafc; overflow: auto;
}
@media (min-width: 768px) {
  .companion-settings-page { padding: 32rpx 0 32rpx; display: flex; align-items: flex-start; justify-content: center; background: #e2e8f0; }
  .phone-frame { width: 100%; max-width: min(390px, 100vw); height: 100%; overflow: hidden; background: #ffffff; }
  .phone-inner { background: #f8fafc; }
}
.loading-container { padding: 64rpx 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.loading-spinner { width: 48rpx; height: 48rpx; border-radius: 999px; border: 6rpx solid #e2e8f0; border-top-color: #EF4444; animation: spin 1s linear infinite; margin-bottom: 16rpx; }
.loading-text { font-size: 26rpx; color: #64748b; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.content { padding-bottom: 24rpx; }
.section { margin-bottom: 24rpx; }
.section-title { display: block; font-size: 24rpx; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10rpx; padding: 0 4rpx; }
.menu-card { background: #ffffff; border: 1rpx solid #e2e8f0; border-radius: 16rpx; overflow: hidden; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04); }
.menu-item { display: flex; align-items: center; justify-content: space-between; padding: 24rpx 20rpx; }
.menu-item-left { display: flex; align-items: center; gap: 14rpx; }
.menu-icon { font-size: 32rpx; width: 36rpx; text-align: center; }
.menu-label { font-size: 28rpx; color: #0f172a; }
.menu-arrow { font-size: 32rpx; color: #94a3b8; }
.menu-value { font-size: 26rpx; color: #64748b; }
.menu-divider { height: 1rpx; background: #f1f5f9; margin: 0 20rpx; }
/* Toggle */
.toggle { width: 80rpx; height: 44rpx; border-radius: 999px; background: #e2e8f0; position: relative; transition: background 0.2s; }
.toggle.on { background: #EF4444; }
.toggle-thumb { position: absolute; top: 4rpx; left: 4rpx; width: 36rpx; height: 36rpx; border-radius: 999px; background: #ffffff; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.15); transition: left 0.2s; }
.toggle.on .toggle-thumb { left: 40rpx; }
/* Logout */
.logout-btn { background: #ffffff; border: 1rpx solid #fecaca; border-radius: 16rpx; padding: 28rpx; text-align: center; font-size: 28rpx; font-weight: 600; color: #dc2626; margin-top: 8rpx; }
/* Drawer */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; }
.drawer { position: fixed; bottom: 0; left: 0; right: 0; background: #ffffff; border-radius: 24rpx 24rpx 0 0; z-index: 201; padding: 0 0 env(safe-area-inset-bottom, 0); }
@media (min-width: 768px) { .drawer { max-width: min(390px, 100vw); left: 50%; transform: translateX(-50%); } }
.drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx 20rpx; border-bottom: 1rpx solid #f1f5f9; }
.drawer-title { font-size: 32rpx; font-weight: 700; color: #0f172a; }
.drawer-close { width: 56rpx; height: 56rpx; border-radius: 999px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 28rpx; color: #64748b; }
.drawer-body { padding: 24rpx 32rpx; display: flex; flex-direction: column; gap: 20rpx; }
.field { display: flex; flex-direction: column; gap: 8rpx; }
.field-label { font-size: 26rpx; font-weight: 500; color: #334155; }
.field-input { height: 80rpx; border: 1rpx solid #e2e8f0; border-radius: 12rpx; padding: 0 20rpx; font-size: 28rpx; color: #0f172a; background: #f8fafc; }
.drawer-footer { display: flex; gap: 16rpx; padding: 20rpx 32rpx 32rpx; }
.btn-outline { flex: 1; border: 1rpx solid #e2e8f0; color: #334155; border-radius: 12rpx; padding: 18rpx; font-size: 28rpx; font-weight: 500; text-align: center; }
.btn-primary { flex: 1; background: #EF4444; color: #ffffff; border-radius: 12rpx; padding: 18rpx; font-size: 28rpx; font-weight: 600; text-align: center; }
.btn-primary.disabled { opacity: 0.6; }
</style>
