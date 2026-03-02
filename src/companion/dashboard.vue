<template>
  <view class="companion-dashboard-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('nav.dashboard')" />
      <view class="phone-inner">
        <!-- Loading -->
        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ t("merchant.loading") }}</text>
        </view>

        <!-- Content -->
        <view v-else class="dashboard-content">
          <!-- KPI cards -->
          <view class="section">
            <view class="kpi-grid">
              <view class="kpi-card" @click="uni.reLaunch({ url: ROUTES.COMPANION_BOOKINGS })">
                <text class="kpi-label">{{ t("companion.dashboard.totalOrders") }}</text>
                <text class="kpi-value">{{ totalOrders }}</text>
              </view>
              <view class="kpi-card" @click="uni.reLaunch({ url: ROUTES.COMPANION_BOOKINGS })">
                <text class="kpi-label">{{ t("companion.dashboard.pendingRequests") }}</text>
                <text class="kpi-value">{{ pendingOrders }}</text>
              </view>
              <view class="kpi-card">
                <text class="kpi-label">{{ t("companion.dashboard.availableBalance") }}</text>
                <text class="kpi-value">{{ formatCurrency(wallet?.balance ?? 0) }}</text>
              </view>
              <view class="kpi-card">
                <text class="kpi-label">{{ t("companion.dashboard.experienceYears") }}</text>
                <text class="kpi-value">{{ profile?.experience_years ?? '—' }}</text>
              </view>
            </view>
          </view>

          <!-- Verification -->
          <view class="section">
            <view class="section-header">
              <text class="section-title">{{ t("companion.dashboard.verificationStatus") }}</text>
            </view>
            <view class="card">
              <view class="row">
                <text class="muted">{{ t("companion.dashboard.status") }}</text>
                <view class="badge" :class="verificationBadgeClass">
                  <text>{{ verificationLabel }}</text>
                </view>
              </view>
              <view class="divider"></view>
              <view class="row">
                <text class="muted">{{ t("companion.dashboard.availableBalance") }}</text>
                <text class="strong">{{ formatCurrency(wallet?.balance ?? 0) }}</text>
              </view>
              <view class="row">
                <text class="muted">{{ t("companion.dashboard.hourlyRate") }}</text>
                <text class="strong">{{ profile?.hourly_rate ? formatCurrency(profile.hourly_rate) + '/h' : '—' }}</text>
              </view>
            </view>
          </view>

          <!-- Quick links -->
          <view class="section">
            <view class="section-header">
              <text class="section-title">{{ t("companion.dashboard.quickActions") }}</text>
            </view>
            <view class="actions-grid">
              <view class="action-card" @click="goProfile()">
                <text class="action-title">{{ t("nav.profile") }}</text>
                <text class="action-sub">{{ t("companion.dashboard.quickProfile") }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <BottomTabBar />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getAccessToken } from "../api/auth";
import {
  getRealCompanionProfile,
  getRealCompanionOrders,
  getRealWallet,
  type RealCompanionProfile,
  type RealWallet,
  type CompanionStatus,
} from "../api/companion";
import { ROUTES } from "../routes";
import { showToast } from "../utils/toast";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";

const { t } = useI18n();

const loading = ref(true);
const profile = ref<RealCompanionProfile | null>(null);
const wallet = ref<RealWallet | null>(null);
const totalOrders = ref(0);
const pendingOrders = ref(0);

function formatCurrency(v: number): string {
  return `¥${Number(v || 0).toFixed(2)}`;
}

function goProfile() {
  uni.reLaunch({ url: ROUTES.COMPANION_PROFILE });
}

const verificationLabel = computed(() => {
  const s = profile.value?.status as CompanionStatus | undefined;
  if (s === "APPROVED") return t("companion.verification.verified");
  if (s === "PENDING") return t("companion.verification.pending");
  if (s === "REJECTED") return t("companion.verification.rejected");
  if (s === "SUSPENDED") return t("companion.verification.suspended");
  return t("companion.verification.unverified");
});

const verificationBadgeClass = computed(() => {
  const s = profile.value?.status;
  if (s === "APPROVED") return "ok";
  if (s === "PENDING") return "pending";
  if (s === "REJECTED" || s === "SUSPENDED") return "bad";
  return "neutral";
});

async function load() {
  const token = getAccessToken();
  if (!token) {
    uni.reLaunch({ url: ROUTES.LOGIN });
    return;
  }

  loading.value = true;
  try {
    const [profileRes, ordersRes, walletRes] = await Promise.allSettled([
      getRealCompanionProfile(token),
      getRealCompanionOrders(token, { pageSize: 100 }),
      getRealWallet(token),
    ]);

    if (profileRes.status === "fulfilled") profile.value = profileRes.value.data;
    if (ordersRes.status === "fulfilled") {
      const items = ordersRes.value.data.items;
      totalOrders.value = ordersRes.value.data.total;
      pendingOrders.value = items.filter((o) => o.status === "PENDING").length;
    }
    if (walletRes.status === "fulfilled") wallet.value = walletRes.value.data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  load();
});
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.companion-dashboard-page {
  min-height: 100vh;
  height: 100vh;
  padding-top: 0;
  background: #f1f5f9;
  box-sizing: border-box;
  overflow: hidden;
  padding-bottom: 56px;
}

.phone-frame {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  border: none;
}

.phone-inner {
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
  margin: 0 auto;
  padding: 24rpx 24rpx 48rpx;
  box-sizing: border-box;
  background: #f8fafc;
  border: none;
  overflow: auto;
}

@media (min-width: 768px) {
  .companion-dashboard-page {
    padding: 32rpx 0 32rpx;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    background: #e2e8f0;
  }

  .phone-frame {
    width: 100%;
    max-width: min(390px, 100vw);
    height: 100%;
    min-height: 0;
    border-radius: 0;
    box-shadow: none;
    overflow: hidden;
    background: #ffffff;
    border: none;
  }

  .phone-inner {
    border: none;
    border-radius: 0;
    min-height: 0;
    background: #f8fafc;
  }
}

.placeholder {
  text-align: center;
  padding: 48rpx 32rpx;
}

.placeholder-text {
  display: block;
  font-size: 28rpx;
  color: #64748b;
}

.loading-container {
  padding: 64rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border-radius: 999px;
  border: 6rpx solid #e2e8f0;
  border-top-color: #EF4444;
  animation: spin 1s linear infinite;
  margin-bottom: 16rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #64748b;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.dashboard-content {
  padding-bottom: 24rpx;
}

.section {
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.section-action {
  font-size: 24rpx;
  color: #EF4444;
  padding: 8rpx 0;
}

.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.kpi-card {
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 20rpx 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.kpi-label {
  display: block;
  font-size: 24rpx;
  color: #64748b;
  margin-bottom: 8rpx;
}

.kpi-value {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #0f172a;
}

.card {
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 18rpx 18rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 8rpx 0;
}

.divider {
  height: 1rpx;
  background: #e2e8f0;
  margin: 12rpx 0;
}

.muted {
  color: #64748b;
  font-size: 24rpx;
}

.small {
  font-size: 22rpx;
}

.strong {
  color: #0f172a;
  font-size: 26rpx;
  font-weight: 600;
}

.badge {
  padding: 8rpx 12rpx;
  border-radius: 999px;
  font-size: 22rpx;
  border: 1rpx solid transparent;
}

.badge.ok {
  color: #16a34a;
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.badge.pending {
  color: #d97706;
  background: #fffbeb;
  border-color: #fde68a;
}

.badge.bad {
  color: #dc2626;
  background: #fef2f2;
  border-color: #fecaca;
}

.badge.neutral {
  color: #334155;
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.empty-state {
  background: #ffffff;
  border: 1rpx dashed #e2e8f0;
  border-radius: 16rpx;
  padding: 28rpx 20rpx;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #94a3b8;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.list-item {
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 18rpx 18rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
}

.item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 6rpx;
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  font-size: 26rpx;
  font-weight: 700;
  color: #0f172a;
}

.item-sub {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  flex-wrap: wrap;
}

.pill {
  padding: 6rpx 10rpx;
  border-radius: 999px;
  font-size: 22rpx;
  background: #f1f5f9;
  color: #334155;
  border: 1rpx solid #e2e8f0;
}

.pill.pending_confirmation {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.pill.confirmed {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.pill.in_service {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.pill.completed {
  background: #f1f5f9;
  color: #334155;
  border-color: #e2e8f0;
}

.pill.cancelled {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.action-card {
  background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%);
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 20rpx 18rpx;
}

.action-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6rpx;
}

.action-sub {
  display: block;
  font-size: 24rpx;
  color: #64748b;
}
</style>

