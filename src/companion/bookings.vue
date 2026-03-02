<template>
  <view class="companion-bookings-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('companion.bookingsTitle')" />
      <view class="phone-inner">
        <SearchBar
          v-model="keyword"
          :placeholder="t('companion.bookings.searchPlaceholder')"
          :filters="statusFilters"
          v-model:activeFilter="activeStatusFilter"
          :backgroundImage="''"
          @filter-change="handleStatusChange"
        />

        <view class="filters-row">
          <view class="reset-btn" @click="resetFilters">
            <text>{{ t("companion.bookings.reset") }}</text>
          </view>
        </view>

        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ t("merchant.loading") }}</text>
        </view>

        <view v-else class="list-wrap">
          <view v-if="bookings.length === 0" class="empty-state">
            <text class="empty-title">{{ t("companion.bookings.noBookings") }}</text>
            <text class="empty-desc">{{ t("companion.bookings.noBookingsDesc") }}</text>
          </view>

          <view v-else class="bookings-list">
            <view v-for="b in filteredBookings" :key="b._id" class="booking-card">
              <view class="card-top">
                <view class="title-col">
                  <text class="customer">
                    {{ b.items.length > 0 ? (b.items[0].title || b.items[0].item_type) : t("companion.bookings.order") }}
                  </text>
                  <text class="meta muted">
                    {{ b.items.length }} {{ t("companion.bookings.items") }} · {{ formatDateTime(b.createdAt) }}
                  </text>
                </view>
                <view class="badges">
                  <view class="badge pay" :class="b.payment_status.toLowerCase()">
                    <text>{{ paymentLabel(b.payment_status) }}</text>
                  </view>
                  <view class="badge status" :class="b.status.toLowerCase()">
                    <text>{{ statusLabel(b.status) }}</text>
                  </view>
                </view>
              </view>

              <view class="card-mid">
                <view class="info-row">
                  <text class="info-label">{{ t("companion.bookings.date") }}</text>
                  <text class="info-value">{{ formatDateTime(b.createdAt) }}</text>
                </view>
                <view class="info-row">
                  <text class="info-label">{{ t("companion.bookings.price") }}</text>
                  <text class="info-value price">{{ formatCurrency(b.total_amount) }}</text>
                </view>
                <view v-if="b.notes" class="note">
                  <text class="note-text">{{ b.notes }}</text>
                </view>
              </view>

              <view class="card-actions">
                <view v-if="b.status === 'PENDING'" class="action-btn reject" @click="reject(b)">
                  <text>{{ t("companion.bookings.reject") }}</text>
                </view>
                <view v-if="b.status === 'PENDING'" class="action-btn accept" @click="accept(b)">
                  <text>{{ t("companion.bookings.accept") }}</text>
                </view>
                <view class="action-btn view" @click="toggleExpand(b._id)">
                  <text>{{ expandedId === b._id ? t("companion.bookings.hide") : t("companion.bookings.view") }}</text>
                </view>
              </view>

              <view v-if="expandedId === b._id" class="expand">
                <view class="expand-row">
                  <text class="expand-label">{{ t("companion.bookings.bookingId") }}</text>
                  <text class="expand-value">#{{ b._id }}</text>
                </view>
                <view class="expand-row">
                  <text class="expand-label">{{ t("companion.bookings.paymentMethod") }}</text>
                  <text class="expand-value">{{ b.payment_method }}</text>
                </view>
                <view v-for="item in b.items" :key="item.ref_id" class="expand-row">
                  <text class="expand-label">{{ item.item_type }}</text>
                  <text class="expand-value">{{ item.title || item.ref_id }} × {{ item.quantity }} · {{ formatCurrency(item.unit_price) }}</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="canLoadMore" class="load-more" @click="loadMore">
            <text>{{ t("companion.bookings.loadMore") }}</text>
          </view>
        </view>
      </view>
    </view>
    <BottomTabBar />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useI18n } from "vue-i18n";
import SearchBar from "../components/SearchBar.vue";
import { getAccessToken } from "../api/auth";
import {
  getRealCompanionOrders,
  approveCompanionOrder,
  rejectCompanionOrder,
  type RealOrder,
  type RealOrderStatus,
} from "../api/companion";
import { ROUTES } from "../routes";
import { showToast } from "../utils/toast";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";

const { t } = useI18n();

type StatusFilterValue = "ALL" | RealOrderStatus;

const loading = ref(true);
const keyword = ref("");
const activeStatusFilter = ref<StatusFilterValue>("ALL");

const bookings = ref<RealOrder[]>([]);
const expandedId = ref<string>("");
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

const statusFilters = computed(() => [
  { label: t("companion.bookings.all"), value: "ALL" },
  { label: t("companion.bookingStatus.pending"), value: "PENDING" },
  { label: t("companion.bookingStatus.confirmed"), value: "CONFIRMED" },
  { label: t("companion.bookingStatus.paid"), value: "PAID" },
  { label: t("companion.bookingStatus.fulfilled"), value: "FULFILLED" },
  { label: t("companion.bookingStatus.cancelled"), value: "CANCELLED" },
]);

const filteredBookings = computed(() => {
  let list = bookings.value;
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase();
    list = list.filter(
      (b) =>
        b._id.toLowerCase().includes(kw) ||
        b.items.some((i) => (i.title ?? "").toLowerCase().includes(kw))
    );
  }
  return list;
});

const canLoadMore = computed(() => bookings.value.length < total.value);

function formatCurrency(v: number): string {
  return `¥${Number(v || 0).toFixed(2)}`;
}

function formatDateTime(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
}

function statusLabel(s: RealOrderStatus): string {
  const map: Record<RealOrderStatus, string> = {
    PENDING: t("companion.bookingStatus.pending"),
    PAID: t("companion.bookingStatus.paid"),
    CONFIRMED: t("companion.bookingStatus.confirmed"),
    FULFILLED: t("companion.bookingStatus.fulfilled"),
    CANCELLED: t("companion.bookingStatus.cancelled"),
  };
  return map[s] ?? s;
}

function paymentLabel(s: string): string {
  const map: Record<string, string> = {
    PENDING: t("companion.paymentStatus.pending"),
    PAID: t("companion.paymentStatus.paid"),
    FAILED: t("companion.paymentStatus.failed"),
  };
  return map[s] ?? s;
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? "" : id;
}

async function accept(b: RealOrder) {
  const token = getAccessToken() ?? "";
  try {
    const res = await approveCompanionOrder(token, b._id);
    const idx = bookings.value.findIndex((x) => x._id === b._id);
    if (idx >= 0) bookings.value[idx] = res.data;
    showToast({ title: t("companion.bookings.accepted"), icon: "success" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  }
}

async function reject(b: RealOrder) {
  const token = getAccessToken() ?? "";
  try {
    const res = await rejectCompanionOrder(token, b._id);
    const idx = bookings.value.findIndex((x) => x._id === b._id);
    if (idx >= 0) bookings.value[idx] = res.data;
    showToast({ title: t("companion.bookings.rejected"), icon: "success" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  }
}

function handleStatusChange() {
  page.value = 1;
  fetchBookings();
}

function resetFilters() {
  keyword.value = "";
  activeStatusFilter.value = "ALL";
  page.value = 1;
  fetchBookings();
}

async function fetchBookings(append = false) {
  const token = getAccessToken();
  if (!token) {
    uni.reLaunch({ url: ROUTES.LOGIN });
    return;
  }

  loading.value = true;
  try {
    const res = await getRealCompanionOrders(token, {
      page: page.value,
      pageSize: pageSize.value,
    });
    total.value = res.data.total;
    const items = res.data.items;
    // client-side status filter since backend doesn't support query param
    const filtered =
      activeStatusFilter.value === "ALL"
        ? items
        : items.filter((o) => o.status === activeStatusFilter.value);
    if (append) bookings.value = [...bookings.value, ...filtered];
    else bookings.value = filtered;
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (!canLoadMore.value) return;
  page.value += 1;
  await fetchBookings(true);
}

onLoad((options) => {
  const status = (options?.status as string | undefined)?.trim();
  const allowed = new Set(["PENDING", "PAID", "CONFIRMED", "FULFILLED", "CANCELLED"]);
  if (status && allowed.has(status)) activeStatusFilter.value = status as RealOrderStatus;
});

onMounted(() => {
  fetchBookings();
});
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.companion-bookings-page {
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
  padding: 0 0 48rpx;
  box-sizing: border-box;
  background: #f8fafc;
  border: none;
  overflow: auto;
}

@media (min-width: 768px) {
  .companion-bookings-page {
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

.filters-row {
  padding: 16rpx 16rpx 8rpx;
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
  flex-wrap: wrap;
  background: #f8fafc;
}

.date-filter {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.date-label {
  font-size: 22rpx;
  color: #64748b;
}

.date-pill {
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  border-radius: 999px;
  padding: 10rpx 14rpx;
  font-size: 24rpx;
  color: #0f172a;
}

.reset-btn {
  margin-left: auto;
  padding: 10rpx 14rpx;
  border-radius: 999px;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  font-size: 24rpx;
  color: #EF4444;
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

.list-wrap {
  padding: 16rpx 16rpx 24rpx;
}

.empty-state {
  background: #ffffff;
  border: 1rpx dashed #e2e8f0;
  border-radius: 16rpx;
  padding: 32rpx 20rpx;
  text-align: center;
}

.empty-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8rpx;
}

.empty-desc {
  display: block;
  font-size: 24rpx;
  color: #94a3b8;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.booking-card {
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  border-radius: 18rpx;
  padding: 18rpx 18rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.title-col {
  min-width: 0;
  flex: 1;
}

.customer {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6rpx;
}

.meta {
  display: block;
  line-height: 1.35;
}

.muted {
  color: #64748b;
  font-size: 24rpx;
}

.badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
  flex-shrink: 0;
}

.badge {
  padding: 6rpx 10rpx;
  border-radius: 999px;
  font-size: 22rpx;
  border: 1rpx solid #e2e8f0;
  background: #f1f5f9;
  color: #334155;
  white-space: nowrap;
}

.badge.status.pending_confirmation {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.badge.status.confirmed {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.badge.status.in_service {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.badge.status.completed {
  background: #f1f5f9;
  color: #334155;
  border-color: #e2e8f0;
}

.badge.status.cancelled {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.badge.pay.paid {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.badge.pay.pending {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.badge.pay.refunded {
  background: #f1f5f9;
  color: #334155;
  border-color: #e2e8f0;
}

.badge.pay.failed {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.card-mid {
  margin-top: 14rpx;
  border-top: 1rpx solid #f1f5f9;
  padding-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.info-label {
  font-size: 24rpx;
  color: #64748b;
}

.info-value {
  font-size: 24rpx;
  color: #0f172a;
  font-weight: 600;
}

.info-value.price {
  font-weight: 700;
}

.note {
  margin-top: 6rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 10rpx 12rpx;
}

.note-text {
  font-size: 24rpx;
  color: #475569;
}

.card-actions {
  margin-top: 14rpx;
  display: flex;
  gap: 10rpx;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 12rpx;
  border-radius: 14rpx;
  border: 1rpx solid #e2e8f0;
  font-size: 26rpx;
  font-weight: 600;
}

.action-btn.accept {
  background: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
  color: #ffffff;
  border: none;
}

.action-btn.reject {
  background: #ffffff;
  color: #b91c1c;
  border-color: #fecaca;
}

.action-btn.view {
  background: #ffffff;
  color: #334155;
}

.expand {
  margin-top: 14rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 14rpx;
  padding: 12rpx 12rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.expand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.expand-label {
  font-size: 24rpx;
  color: #64748b;
}

.expand-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #0f172a;
}

.load-more {
  margin-top: 18rpx;
  text-align: center;
  padding: 18rpx 12rpx;
  border-radius: 14rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  color: #EF4444;
  font-size: 26rpx;
  font-weight: 600;
}
</style>

