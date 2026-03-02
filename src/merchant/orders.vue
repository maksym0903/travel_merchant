<template>
  <view class="orders-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('nav.orders')" />
      <view class="phone-inner">
        <!-- Search and Filter Bar -->
        <SearchBar
          v-model="searchQuery"
          :placeholder="t('merchant.searchOrders')"
          :filters="filters"
          v-model:activeFilter="activeFilter"
        />

        <!-- Loading state -->
        <view v-if="isLoading && orders.length === 0" class="orders-container">
          <view class="empty-state">
            <view class="spinner" />
            <text class="empty-desc">{{ t('merchant.loading') }}</text>
          </view>
        </view>

        <!-- Error state -->
        <view v-else-if="loadError" class="orders-container">
          <view class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <text class="empty-title">{{ t('merchant.loadFailed') }}</text>
            <text class="empty-desc">{{ loadError }}</text>
            <view class="retry-btn" @click="loadOrders(1)">
              <text>{{ t('merchant.retry') }}</text>
            </view>
          </view>
        </view>

        <!-- Orders List -->
        <view class="orders-container">
          <view v-if="filteredOrders.length === 0 && !isLoading && !loadError" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <text class="empty-title">{{ t('merchant.noOrders') }}</text>
            <text class="empty-desc">{{ t('merchant.noOrdersDesc') }}</text>
          </view>

          <view v-else-if="filteredOrders.length > 0" class="orders-list">
            <view 
              v-for="order in filteredOrders" 
              :key="order.id"
              class="order-card"
            >
              <!-- Order Header -->
              <view class="order-header">
                <view class="order-id-section">
                  <text class="order-id-label">{{ t('merchant.orderId') }}</text>
                  <text class="order-id-value">#{{ order.id.slice(-8).toUpperCase() }}</text>
                </view>
                <view class="order-status-badge" :class="order.status.toLowerCase()">
                  <text>{{ getStatusLabel(order.status) }}</text>
                </view>
              </view>

              <!-- Order Info -->
              <view class="order-info">
                <!-- Items -->
                <view v-for="(item, i) in order.items" :key="i" class="order-row">
                  <view class="order-icon">
                    <text style="font-size: 16px;">{{ getItemTypeIcon(item.item_type) }}</text>
                  </view>
                  <text class="order-text">{{ item.title || item.item_type }}  ×{{ item.quantity }}</text>
                </view>
                <!-- Date -->
                <view class="order-row">
                  <view class="order-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </view>
                  <text class="order-text">{{ formatDate(order.createdAt) }}</text>
                </view>
                <!-- Amount -->
                <view class="order-row">
                  <view class="order-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </view>
                  <text class="order-amount">¥{{ order.total_amount.toFixed(2) }}</text>
                </view>
                <!-- Payment status -->
                <view class="order-row">
                  <view class="order-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </view>
                  <view class="payment-status" :class="order.payment_status.toLowerCase()">
                    <text>{{ getPaymentStatusLabel(order.payment_status) }}</text>
                  </view>
                </view>
              </view>

              <!-- Order Actions -->
              <view class="order-actions">
                <!-- Approve: when PAID (customer paid, awaiting merchant confirm) -->
                <view 
                  v-if="order.status === 'PAID'"
                  class="action-btn confirm-btn"
                  :class="{ loading: actionLoading === order.id + '_approve' }"
                  @click="confirmOrder(order)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <text>{{ t('merchant.confirmOrder') }}</text>
                </view>
                <!-- Reject: PENDING or PAID -->
                <view 
                  v-if="order.status === 'PENDING' || order.status === 'PAID'"
                  class="action-btn reject-btn"
                  :class="{ loading: actionLoading === order.id + '_reject' }"
                  @click="rejectOrder(order)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  <text>{{ t('merchant.rejectOrder') }}</text>
                </view>
                <!-- View details (always) -->
                <view 
                  class="action-btn view-btn"
                  @click="viewOrderDetails(order)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <text>{{ t('merchant.viewDetails') }}</text>
                </view>
                <!-- Follow-up notes: CONFIRMED or FULFILLED -->
                <view 
                  v-if="order.status === 'CONFIRMED' || order.status === 'FULFILLED'"
                  class="action-btn payment-btn"
                  @click="openFollowUp(order)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <text>{{ t('merchant.followUp') }}</text>
                </view>
              </view>
            </view>

            <!-- Load more -->
            <view v-if="hasMore" class="load-more-btn" @click="loadOrders(currentPage + 1)">
              <view v-if="isLoading" class="spinner-sm" />
              <text v-else>{{ t('merchant.loadMore') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <BottomTabBar />

    <!-- Order Detail Modal -->
    <view v-if="selectedOrder" class="modal-overlay" @click="closeOrderDetail">
      <view class="modal-content order-detail-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ t('merchant.orderDetail') }}</text>
          <view class="modal-close" @click="closeOrderDetail">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>

        <view class="modal-body">
          <!-- Order ID and Status -->
          <view class="detail-section">
            <view class="detail-row">
              <text class="detail-label">{{ t('merchant.orderId') }}</text>
              <text class="detail-value">#{{ selectedOrder.id.slice(-8).toUpperCase() }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">{{ t('merchant.orderStatus') }}</text>
              <view class="order-status-badge" :class="selectedOrder.status.toLowerCase()">
                <text>{{ getStatusLabel(selectedOrder.status) }}</text>
              </view>
            </view>
          </view>

          <!-- Order Items -->
          <view class="detail-section">
            <text class="detail-section-title">{{ t('merchant.orderItems') }}</text>
            <view v-for="(item, i) in selectedOrder.items" :key="i" class="detail-row">
              <text class="detail-label">{{ getItemTypeIcon(item.item_type) }} {{ item.item_type }}</text>
              <text class="detail-value">{{ item.title || '—' }}  ×{{ item.quantity }}  ·  ¥{{ item.unit_price }}</text>
            </view>
          </view>

          <!-- Payment Details -->
          <view class="detail-section">
            <text class="detail-section-title">{{ t('merchant.bookingDetails') }}</text>
            <view class="detail-row">
              <text class="detail-label">{{ t('merchant.totalAmount') }}</text>
              <text class="detail-value amount">¥{{ selectedOrder.total_amount.toFixed(2) }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">{{ t('merchant.paymentStatus') }}</text>
              <view class="payment-status" :class="selectedOrder.payment_status.toLowerCase()">
                <text>{{ getPaymentStatusLabel(selectedOrder.payment_status) }}</text>
              </view>
            </view>
            <view class="detail-row">
              <text class="detail-label">{{ t('merchant.paymentMethod') }}</text>
              <text class="detail-value">{{ selectedOrder.payment_method }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">{{ t('merchant.orderDate') }}</text>
              <text class="detail-value">{{ formatDate(selectedOrder.createdAt) }}</text>
            </view>
          </view>

          <!-- Customer Notes -->
          <view v-if="selectedOrder.notes" class="detail-section">
            <text class="detail-section-title">{{ t('merchant.specialRequests') }}</text>
            <text class="detail-text">{{ selectedOrder.notes }}</text>
          </view>

          <!-- Follow-up Notes -->
          <view v-if="selectedOrder.follow_up_notes" class="detail-section">
            <text class="detail-section-title">{{ t('merchant.followUpNotes') }}</text>
            <text class="detail-text follow-up-text">{{ selectedOrder.follow_up_notes }}</text>
          </view>
        </view>

        <view class="modal-footer">
          <view class="modal-actions">
            <view class="btn btn-secondary" @click="closeOrderDetail">
              <text>{{ t('merchant.close') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Follow-up Notes Modal -->
    <view v-if="followUpOrder" class="modal-overlay" @click="closeFollowUp">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ t('merchant.followUpNotes') }}</text>
          <view class="modal-close" @click="closeFollowUp">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>
        <view class="modal-body">
          <text class="detail-text" style="margin-bottom: 12px; display: block;">{{ t('merchant.followUpHint') }}</text>
          <textarea
            class="follow-up-textarea"
            v-model="followUpText"
            :placeholder="t('merchant.followUpPlaceholder')"
            maxlength="500"
          />
          <text style="font-size: 12px; color: #94a3b8; text-align: right; display: block; margin-top: 4px;">{{ followUpText.length }}/500</text>
        </view>
        <view class="modal-footer">
          <view class="modal-actions">
            <view class="btn btn-secondary" @click="closeFollowUp">
              <text>{{ t('merchant.cancel') }}</text>
            </view>
            <view
              class="btn btn-primary"
              :class="{ loading: savingFollowUp }"
              @click="saveFollowUp"
            >
              <text>{{ savingFollowUp ? t('merchant.saving') : t('merchant.save') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";
import SearchBar from "../components/SearchBar.vue";
import {
  getMerchantOrders,
  approveMerchantOrder,
  rejectMerchantOrder,
  updateOrderFollowUp,
  type MerchantOrder,
  type MerchantOrderStatus,
} from "../api/merchant";

const { t } = useI18n();

// ── State ─────────────────────────────────────────────────────────────────────

const orders        = ref<MerchantOrder[]>([]);
const isLoading     = ref(false);
const loadError     = ref<string | null>(null);
const currentPage   = ref(1);
const totalOrders   = ref(0);
const PAGE_SIZE     = 20;

const searchQuery   = ref("");
const activeFilter  = ref<MerchantOrderStatus | "all">("all");
const selectedOrder = ref<MerchantOrder | null>(null);
const actionLoading = ref<string | null>(null);

const followUpOrder  = ref<MerchantOrder | null>(null);
const followUpText   = ref("");
const savingFollowUp = ref(false);

// ── Computed ──────────────────────────────────────────────────────────────────

const hasMore = computed(() => orders.value.length < totalOrders.value);

const filters = computed(() => [
  { value: "all" as const,       label: t("merchant.allOrders") },
  { value: "PENDING" as const,   label: t("merchant.pending") },
  { value: "PAID" as const,      label: t("merchant.paid") },
  { value: "CONFIRMED" as const, label: t("merchant.confirmed") },
  { value: "FULFILLED" as const, label: t("merchant.fulfilled") },
  { value: "CANCELLED" as const, label: t("merchant.cancelled") },
  { value: "REFUNDED" as const,  label: t("merchant.refunded") },
]);

const filteredOrders = computed(() => {
  let list = orders.value;

  if (activeFilter.value !== "all") {
    list = list.filter(o => o.status === activeFilter.value);
  }

  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.items.some(it => (it.title ?? "").toLowerCase().includes(q))
    );
  }

  return list;
});

// ── API ───────────────────────────────────────────────────────────────────────

async function loadOrders(page: number) {
  isLoading.value = true;
  if (page === 1) loadError.value = null;
  try {
    const res = await getMerchantOrders(page, PAGE_SIZE);
    if (page === 1) {
      orders.value = res.data.items;
    } else {
      orders.value = [...orders.value, ...res.data.items];
    }
    totalOrders.value = res.data.total;
    currentPage.value = page;
  } catch (err: unknown) {
    loadError.value = err instanceof Error ? err.message : "Failed to load orders";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => loadOrders(1));

// ── Actions ───────────────────────────────────────────────────────────────────

function patchOrderInList(updated: MerchantOrder) {
  const idx = orders.value.findIndex(o => o.id === updated.id);
  if (idx > -1) orders.value[idx] = updated;
}

function confirmOrder(order: MerchantOrder) {
  uni.showModal({
    title: t("merchant.confirmOrderTitle"),
    content: t("merchant.confirmOrderMessage"),
    confirmText: t("merchant.confirm"),
    cancelText: t("merchant.cancel"),
    success: async (res) => {
      if (!res.confirm) return;
      actionLoading.value = order.id + "_approve";
      try {
        const updated = await approveMerchantOrder(order.id);
        patchOrderInList(updated);
        uni.showToast({ title: t("merchant.orderConfirmed"), icon: "success", duration: 2000 });
      } catch (err: unknown) {
        uni.showToast({ title: err instanceof Error ? err.message : t("merchant.actionFailed"), icon: "none", duration: 3000 });
      } finally {
        actionLoading.value = null;
      }
    },
  });
}

function rejectOrder(order: MerchantOrder) {
  uni.showModal({
    title: t("merchant.rejectOrderTitle"),
    content: t("merchant.rejectOrderMessage"),
    confirmText: t("merchant.confirm"),
    cancelText: t("merchant.cancel"),
    success: async (res) => {
      if (!res.confirm) return;
      actionLoading.value = order.id + "_reject";
      try {
        const updated = await rejectMerchantOrder(order.id);
        patchOrderInList(updated);
        uni.showToast({ title: t("merchant.orderRejected"), icon: "success", duration: 2000 });
      } catch (err: unknown) {
        uni.showToast({ title: err instanceof Error ? err.message : t("merchant.actionFailed"), icon: "none", duration: 3000 });
      } finally {
        actionLoading.value = null;
      }
    },
  });
}

function viewOrderDetails(order: MerchantOrder) {
  selectedOrder.value = order;
}

function closeOrderDetail() {
  selectedOrder.value = null;
}

function openFollowUp(order: MerchantOrder) {
  followUpOrder.value = order;
  followUpText.value = order.follow_up_notes ?? "";
}

function closeFollowUp() {
  followUpOrder.value = null;
  followUpText.value = "";
}

async function saveFollowUp() {
  if (!followUpOrder.value) return;
  savingFollowUp.value = true;
  try {
    const updated = await updateOrderFollowUp(followUpOrder.value.id, followUpText.value);
    patchOrderInList(updated);
    uni.showToast({ title: t("merchant.notesSaved"), icon: "success", duration: 2000 });
    closeFollowUp();
  } catch (err: unknown) {
    uni.showToast({ title: err instanceof Error ? err.message : t("merchant.actionFailed"), icon: "none", duration: 3000 });
  } finally {
    savingFollowUp.value = false;
  }
}

// ── Display helpers ───────────────────────────────────────────────────────────

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:   t("merchant.orderStatusPending"),
    PAID:      t("merchant.orderStatusPaid"),
    CONFIRMED: t("merchant.orderStatusConfirmed"),
    FULFILLED: t("merchant.orderStatusFulfilled"),
    CANCELLED: t("merchant.orderStatusCancelled"),
    REFUNDED:  t("merchant.orderStatusRefunded"),
  };
  return map[status] ?? status;
}

function getPaymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:            t("merchant.paymentPending"),
    PAID:               t("merchant.paymentPaid"),
    FAILED:             t("merchant.paymentFailed"),
    REFUNDED:           t("merchant.paymentRefunded"),
    PARTIALLY_REFUNDED: t("merchant.paymentPartialRefund"),
  };
  return map[status] ?? status;
}

function getItemTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    HOTEL:     "🏨",
    TICKET:    "🎟️",
    INSURANCE: "🛡️",
    PACKAGE:   "📦",
    COMPANION: "🧑‍🤝‍🧑",
  };
  return icons[type] ?? "📋";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return iso;
  }
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.orders-page {
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
  position: relative;
}

@media (min-width: 768px) {
  .orders-page {
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

/* Orders Container */
.orders-container {
  padding: 16px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Order Card */
.order-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.order-id-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-id-label {
  font-size: 12px;
  color: #64748b;
}

.order-id-value {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.order-status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.order-status-badge.pending   { background: #fef3c7; color: #d97706; }
.order-status-badge.paid      { background: #dbeafe; color: #2563eb; }
.order-status-badge.confirmed { background: #dbeafe; color: #2563eb; }
.order-status-badge.fulfilled { background: #dcfce7; color: #16a34a; }
.order-status-badge.cancelled { background: #f3f4f6; color: #6b7280; }
.order-status-badge.refunded  { background: #fee2e2; color: #dc2626; }

.order-status-badge text {
  font-family: inherit;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.order-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
}

.order-icon svg {
  width: 16px;
  height: 16px;
}

.order-text {
  font-size: 14px;
  color: #334155;
  flex: 1;
}

.order-amount {
  font-size: 18px;
  font-weight: 700;
  color: #f0ad4e;
}

.order-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn.loading {
  opacity: 0.5;
  pointer-events: none;
}

.confirm-btn { background: #dbeafe; color: #2563eb; }
.confirm-btn:active { background: #bfdbfe; }

.reject-btn { background: #fee2e2; color: #dc2626; }
.reject-btn:active { background: #fecaca; }

.view-btn { background: #f1f5f9; color: #475569; }
.view-btn:active { background: #e2e8f0; }

.payment-btn { background: #fef3c7; color: #d97706; }
.payment-btn:active { background: #fde68a; }

.action-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.action-btn text {
  font-family: inherit;
  white-space: nowrap;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
  display: block;
}

.empty-desc {
  font-size: 14px;
  color: #64748b;
  display: block;
}

.retry-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: #d97706;
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.retry-btn text { font-family: inherit; }

/* Load more */
.load-more-btn {
  padding: 14px;
  text-align: center;
  background: #ffffff;
  border-radius: 12px;
  color: #d97706;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.load-more-btn text { font-family: inherit; }

/* Spinners */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #d97706;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #d97706;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Payment status inline badge */
.payment-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.payment-status.pending            { background: #fef3c7; color: #d97706; }
.payment-status.paid               { background: #d1fae5; color: #059669; }
.payment-status.failed             { background: #fee2e2; color: #dc2626; }
.payment-status.refunded           { background: #fee2e2; color: #dc2626; }
.payment-status.partially_refunded { background: #ffedd5; color: #ea580c; }

.payment-status text { font-family: inherit; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.modal-content {
  width: 100%;
  max-width: min(390px, 100vw);
  max-height: 90vh;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.order-detail-modal {
  max-height: 85vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s;
}

.modal-close:active {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-close svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
  display: block;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #64748b;
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  text-align: right;
  flex: 1;
  margin-left: 16px;
}

.detail-value.amount {
  font-size: 18px;
  font-weight: 700;
  color: #f0ad4e;
}

.detail-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
  display: block;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.follow-up-text {
  background: #fffbeb;
  color: #92400e;
}

/* Follow-up textarea */
.follow-up-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #0f172a;
  font-family: inherit;
  box-sizing: border-box;
  resize: none;
}

.follow-up-textarea:focus {
  border-color: #d97706;
  outline: none;
}

.payment-status text {
  font-family: inherit;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s;
  border: none;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn.loading {
  opacity: 0.5;
  pointer-events: none;
}

.btn-secondary { background: #f1f5f9; color: #334155; }
.btn-secondary:active { background: #e2e8f0; }

.btn-primary { background: #d97706; color: #ffffff; }
.btn-primary:active { background: #b45309; }

.btn text { font-family: inherit; }

@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }

  .modal-content {
    max-height: 85vh;
    border-radius: 24px;
    max-width: 500px;
  }
}
</style>
