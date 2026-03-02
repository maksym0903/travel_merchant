<template>
  <view class="dashboard-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('merchant.dashboardTitle')" />
      <view class="phone-inner">
        <!-- Loading State -->
        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ t('merchant.loading') }}</text>
        </view>

        <!-- Dashboard Content -->
        <view v-else class="dashboard-content">
          <!-- 1. Top Statistic Cards (Core KPIs) -->
          <view class="section stats-section">
            <view class="stats-grid">
              <view 
                v-for="stat in stats" 
                :key="stat.id"
                class="stat-card"
              >
                <view class="stat-header">
                  <view class="stat-icon" :style="{ background: stat.iconBg }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path :d="stat.iconPath" />
                    </svg>
                  </view>
                  <text class="stat-label">{{ stat.label }}</text>
                </view>
                <text class="stat-value">{{ formatCurrency(stat.value) }}</text>
                <text v-if="stat.change !== undefined" class="stat-change" :class="{ positive: stat.change > 0, negative: stat.change < 0 }">
                  {{ stat.change > 0 ? '+' : '' }}{{ stat.change.toFixed(1) }}%
                </text>
              </view>
            </view>
          </view>

          <!-- 2. Revenue Chart -->
          <view class="section chart-section">
            <view class="section-header">
              <text class="section-title">{{ t('merchant.revenueChart') }}</text>
              <view class="chart-range-toggle">
                <view 
                  class="range-btn" 
                  :class="{ active: revenueRange === '7d' }"
                  @click="revenueRange = '7d'; fetchRevenueData()"
                >
                  <text>{{ t('merchant.days7') }}</text>
                </view>
                <view 
                  class="range-btn" 
                  :class="{ active: revenueRange === '30d' }"
                  @click="revenueRange = '30d'; fetchRevenueData()"
                >
                  <text>{{ t('merchant.days30') }}</text>
                </view>
              </view>
            </view>
            <view class="chart-container">
              <view v-if="revenueData.length === 0" class="chart-empty">
                <text>{{ t('merchant.noData') }}</text>
              </view>
              <view v-else class="chart-wrapper">
                <!-- Simple Line Chart Visualization -->
                <view class="chart-area">
                  <view class="chart-bars">
                    <view 
                      v-for="(point, index) in revenueData" 
                      :key="index"
                      class="chart-bar-container"
                    >
                      <view class="chart-bar-wrapper">
                        <view 
                          class="chart-bar" 
                          :style="{ height: `${(point.revenue / maxRevenue) * 100}%` }"
                        ></view>
                      </view>
                      <text class="chart-label">{{ formatChartDate(point.date) }}</text>
                    </view>
                  </view>
                  <view class="chart-legend">
                    <view class="legend-item">
                      <view class="legend-color" style="background: #EF4444;"></view>
                      <text>{{ t('merchant.revenue') }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 3. Product Performance Section -->
          <view class="section performance-section">
            <view class="section-header">
              <text class="section-title">{{ t('merchant.productPerformance') }}</text>
              <text class="section-subtitle">{{ t('merchant.productPerformanceDesc') }}</text>
            </view>
            <view class="performance-table">
              <view class="table-header">
                <text class="table-col-product">{{ t('merchant.product') }}</text>
                <text class="table-col-type">{{ t('merchant.type') }}</text>
                <text class="table-col-orders">{{ t('merchant.orders') }}</text>
                <text class="table-col-revenue">{{ t('merchant.revenue') }}</text>
              </view>
              <view v-if="productPerformance.length === 0" class="table-empty">
                <text>{{ t('merchant.noProducts') }}</text>
              </view>
              <view v-else class="table-body">
                <view 
                  v-for="(product, index) in productPerformance" 
                  :key="product.product_id"
                  class="table-row"
                  :class="{ 'last-row': index === productPerformance.length - 1 }"
                >
                  <text class="table-col-product product-name">{{ product.product_name }}</text>
                  <view class="table-col-type">
                    <view class="product-type-badge" :class="product.product_type.toLowerCase()">
                      <text>{{ getProductTypeLabel(product.product_type) }}</text>
                    </view>
                  </view>
                  <text class="table-col-orders">{{ product.orders }}</text>
                  <text class="table-col-revenue revenue-value">{{ formatCurrency(product.revenue) }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 4. Recent Orders -->
          <view class="section orders-section">
            <view class="section-header">
              <text class="section-title">{{ t('merchant.recentOrders') }}</text>
              <view class="section-action" @click="navigateToOrders">
                <text>{{ t('merchant.viewAll') }}</text>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </view>
            </view>
            <view v-if="recentOrders.length === 0" class="empty-state">
              <text class="empty-text">{{ t('merchant.noOrders') }}</text>
            </view>
            <view v-else class="orders-list">
              <view 
                v-for="order in recentOrders" 
                :key="order.order_no"
                class="order-item"
                @click="viewOrderDetail(order.order_no)"
              >
                <view class="order-item-header">
                  <text class="order-no">#{{ order.order_no }}</text>
                  <view class="order-status-badge" :class="order.status.toLowerCase()">
                    <text>{{ getStatusLabel(order.status) }}</text>
                  </view>
                </view>
                <view class="order-item-body">
                  <text class="order-product">{{ order.product_name }}</text>
                  <view class="order-meta">
                    <text class="order-date">{{ formatDate(order.date) }}</text>
                    <text class="order-amount">{{ formatCurrency(order.amount) }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 5. Orders Requiring Attention -->
          <view v-if="ordersRequiringAttention.length > 0" class="section attention-section">
            <view class="section-header">
              <text class="section-title">{{ t('merchant.ordersRequiringAttention') }}</text>
              <text class="section-subtitle important">{{ t('merchant.attentionDesc') }}</text>
            </view>
            <view class="attention-list">
              <view 
                v-for="order in ordersRequiringAttention" 
                :key="order.order_no"
                class="attention-item"
                :class="order.issue_type.toLowerCase().replace('_', '-')"
                @click="handleAttentionOrder(order)"
              >
                <view class="attention-icon">
                  <svg v-if="order.issue_type === 'UNCONFIRMED_PAID'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <svg v-else-if="order.issue_type === 'REFUND_REQUEST'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </view>
                <view class="attention-content">
                  <view class="attention-header">
                    <text class="attention-order-no">#{{ order.order_no }}</text>
                    <text class="attention-amount">{{ formatCurrency(order.amount) }}</text>
                  </view>
                  <text class="attention-product">{{ order.product_name }}</text>
                  <text class="attention-message">{{ getIssueMessage(order.issue_type) }}</text>
                </view>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="attention-arrow">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </view>
            </view>
          </view>

          <!-- 6. Quick Actions -->
          <view class="section actions-section">
            <view class="section-header">
              <text class="section-title">{{ t('merchant.quickActions') }}</text>
            </view>
            <view class="actions-grid">
              <view class="action-card" @click="navigateToCreateTour">
                <view class="action-icon" style="background: #fef3c7; color: #f59e0b;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                </view>
                <text class="action-label">{{ t('merchant.createTour') }}</text>
              </view>
              <view class="action-card" @click="navigateToOrders">
                <view class="action-icon" style="background: #dbeafe; color: #3b82f6;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </view>
                <text class="action-label">{{ t('merchant.viewOrders') }}</text>
              </view>
              <view class="action-card" @click="navigateToWallet">
                <view class="action-icon" style="background: #FFEDD5; color: #F97316;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </view>
                <text class="action-label">{{ t('merchant.viewWallet') }}</text>
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
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { onShow } from "@dcloudio/uni-app";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";
import { getAccessToken } from "../api/auth";
import {
  getDashboardSummary,
  getDashboardRevenue,
  getProductPerformance,
  getRecentOrders,
  getOrdersRequiringAttention,
  type DashboardSummary as DashboardSummaryType,
  type RevenueDataPoint,
  type ProductPerformance,
  type RecentOrder,
  type OrderRequiringAttention
} from "../api/merchant";
import { ROUTES } from "../routes";

const { t } = useI18n();

// State
const loading = ref(true);
const summary = ref<DashboardSummaryType | null>(null);
const revenueData = ref<RevenueDataPoint[]>([]);
const productPerformance = ref<ProductPerformance[]>([]);
const recentOrders = ref<RecentOrder[]>([]);
const ordersRequiringAttention = ref<OrderRequiringAttention[]>([]);
const revenueRange = ref<"7d" | "30d">("7d");

// Computed stats for cards
const stats = computed(() => {
  if (!summary.value) return [];
  
  return [
    {
      id: "today_revenue",
      label: t("merchant.todayRevenue"),
      value: summary.value.today_revenue,
      iconPath: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
      iconBg: "rgba(239, 68, 68, 0.1)",
      change: 12.5
    },
    {
      id: "month_revenue",
      label: t("merchant.monthRevenue"),
      value: summary.value.month_revenue,
      iconPath: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
      iconBg: "rgba(59, 130, 246, 0.1)",
      change: 8.3
    },
    {
      id: "total_orders",
      label: t("merchant.totalOrders"),
      value: summary.value.total_orders,
      iconPath: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
      iconBg: "rgba(139, 92, 246, 0.1)",
      change: undefined
    },
    {
      id: "pending_orders",
      label: t("merchant.pendingOrders"),
      value: summary.value.pending_orders,
      iconPath: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
      iconBg: "rgba(245, 158, 11, 0.1)",
      change: undefined
    },
    {
      id: "refund_amount",
      label: t("merchant.refundAmount"),
      value: summary.value.refund_amount,
      iconPath: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
      iconBg: "rgba(239, 68, 68, 0.1)",
      change: -5.2
    }
  ];
});

const maxRevenue = computed(() => {
  if (revenueData.value.length === 0) return 1;
  return Math.max(...revenueData.value.map(d => d.revenue));
});

// Fetch functions
async function fetchDashboardData() {
  const token = getAccessToken();
  if (!token) {
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    
    // Fetch all data in parallel
    const [summaryRes, revenueRes, performanceRes, ordersRes, attentionRes] = await Promise.all([
      getDashboardSummary(token),
      getDashboardRevenue(token, revenueRange.value),
      getProductPerformance(token),
      getRecentOrders(token),
      getOrdersRequiringAttention(token)
    ]);

    summary.value = summaryRes.data;
    revenueData.value = revenueRes.data;
    productPerformance.value = performanceRes.data;
    recentOrders.value = ordersRes.data;
    ordersRequiringAttention.value = attentionRes.data;
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    uni.showToast({
      title: t("merchant.loadError"),
      icon: "none",
      duration: 2000
    });
  } finally {
    loading.value = false;
  }
}

async function fetchRevenueData() {
  const token = getAccessToken();
  if (!token) return;

  try {
    const res = await getDashboardRevenue(token, revenueRange.value);
    revenueData.value = res.data;
  } catch (error) {
    console.error("Failed to fetch revenue data:", error);
  }
}

// Format functions
function formatCurrency(amount: number): string {
  // Display all amounts in Chinese Yuan
  return `¥${amount.toFixed(2)}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return t("merchant.justNow");
  if (diffMins < 60) return `${diffMins}${t("merchant.minutesAgo")}`;
  if (diffHours < 24) return `${diffHours}${t("merchant.hoursAgo")}`;
  if (diffDays < 7) return `${diffDays}${t("merchant.daysAgo")}`;
  
  return date.toLocaleDateString();
}

function formatChartDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

function getProductTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    TOUR: t("merchant.tours"),
    HOTEL: t("merchant.hotels"),
    TICKET: t("merchant.tickets"),
    INSURANCE: t("merchant.insurance")
  };
  return labels[type] || type;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: t("merchant.pending"),
    CONFIRMED: t("merchant.confirmed"),
    CANCELLED: t("merchant.cancelled"),
    COMPLETED: t("merchant.completed"),
    REFUNDED: t("merchant.refunded")
  };
  return labels[status] || status;
}

function getIssueMessage(issueType: string): string {
  const messages: Record<string, string> = {
    UNCONFIRMED_PAID: t("merchant.issueUnconfirmedPaid"),
    REFUND_REQUEST: t("merchant.issueRefundRequest"),
    TODAY_CHECKIN: t("merchant.issueTodayCheckin")
  };
  return messages[issueType] || "";
}

// Navigation functions
function navigateToOrders() {
  uni.navigateTo({ url: ROUTES.ORDERS });
}

function navigateToCreateTour() {
  uni.navigateTo({ url: ROUTES.PRODUCTS_TOURS });
}

function navigateToWallet() {
  uni.navigateTo({ url: ROUTES.WALLET });
}

function viewOrderDetail(orderNo: string) {
  // Navigate to order detail page
  uni.navigateTo({ url: `${ROUTES.ORDERS}?order_no=${orderNo}` });
}

function handleAttentionOrder(order: OrderRequiringAttention) {
  viewOrderDetail(order.order_no);
}

// Lifecycle
onMounted(() => {
  fetchDashboardData();
});

onShow(() => {
  // Refresh data when page is shown
  fetchDashboardData();
});
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.dashboard-page {
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
  .dashboard-page {
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

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx;
  min-height: 400rpx;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #e2e8f0;
  border-top-color: #EF4444;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #64748b;
}

/* Dashboard Content */
.dashboard-content {
  padding: 16px;
}

.section {
  margin-bottom: 24px;
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.section-subtitle {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

.section-subtitle.important {
  color: #ef4444;
  font-weight: 500;
}

.section-action {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #EF4444;
  font-size: 14px;
  font-weight: 500;
}

/* Stats Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #EF4444;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  display: block;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: #EF4444;
}

.stat-change.negative {
  color: #ef4444;
}

/* Chart Section */
.chart-range-toggle {
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
}

.range-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
}

.range-btn.active {
  background: #EF4444;
  color: #ffffff;
}

.chart-container {
  margin-top: 16px;
}

.chart-empty {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-size: 14px;
}

.chart-wrapper {
  padding: 16px 0;
}

.chart-area {
  position: relative;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  gap: 8px;
  padding: 0 8px;
}

.chart-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart-bar {
  width: 100%;
  max-width: 32px;
  background: linear-gradient(180deg, #EF4444 0%, #F97316 100%);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
}

.chart-label {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 8px;
  text-align: center;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* Product Performance Table */
.performance-table {
  margin-top: 16px;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 2px solid #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
}

.table-row.last-row {
  border-bottom: none;
}

.table-col-product {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.product-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-col-type {
  display: flex;
  align-items: center;
}

.product-type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.product-type-badge.tour {
  background: #fef3c7;
  color: #f59e0b;
}

.product-type-badge.hotel {
  background: #dbeafe;
  color: #3b82f6;
}

.product-type-badge.ticket {
  background: #d1fae5;
  color: #EF4444;
}

.product-type-badge.insurance {
  background: #e9d5ff;
  color: #8b5cf6;
}

.table-col-orders {
  font-size: 14px;
  color: #475569;
  text-align: center;
}

.table-col-revenue {
  font-size: 14px;
  font-weight: 600;
  color: #EF4444;
  text-align: right;
}

.table-empty {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-size: 14px;
}

/* Recent Orders */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.order-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.order-item:active {
  background: #f1f5f9;
  transform: scale(0.98);
}

.order-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-no {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.order-status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.order-status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.order-status-badge.confirmed {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.order-status-badge.completed {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.order-status-badge.refunded {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.order-item-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-product {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.order-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-date {
  font-size: 12px;
  color: #64748b;
}

.order-amount {
  font-size: 14px;
  font-weight: 600;
  color: #EF4444;
}

/* Orders Requiring Attention */
.attention-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.attention-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.attention-item:active {
  background: #fee2e2;
  transform: scale(0.98);
}

.attention-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.attention-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attention-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.attention-order-no {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.attention-amount {
  font-size: 14px;
  font-weight: 600;
  color: #ef4444;
}

.attention-product {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

.attention-message {
  font-size: 12px;
  color: #64748b;
}

.attention-arrow {
  color: #94a3b8;
  flex-shrink: 0;
}

/* Quick Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.action-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.action-card:active {
  background: #f1f5f9;
  transform: scale(0.98);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-label {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  text-align: center;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
}
</style>
