<template>
  <view class="companion-wallet-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('companion.wallet.title')" />
      <view class="phone-inner">

        <!-- Balance card -->
        <view v-if="loadingWallet" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ t("merchant.loading") }}</text>
        </view>

        <view v-else class="balance-card">
          <text class="balance-label">{{ t("companion.wallet.balance") }}</text>
          <text class="balance-amount">{{ formatCurrency(wallet?.balance ?? 0, wallet?.currency) }}</text>
          <view class="withdraw-btn" @click="openWithdraw">
            <text>{{ t("companion.wallet.withdraw") }}</text>
          </view>
        </view>

        <!-- Transactions -->
        <view class="section-head">
          <text class="section-title">{{ t("companion.wallet.transactions") }}</text>
        </view>

        <view v-if="loadingTxns" class="loading-container">
          <view class="loading-spinner"></view>
        </view>

        <view v-else-if="transactions.length === 0" class="empty-state">
          <text class="empty-title">{{ t("companion.wallet.noTransactions") }}</text>
        </view>

        <view v-else class="txn-list">
          <view v-for="txn in transactions" :key="txn._id" class="txn-row">
            <view class="txn-left">
              <view class="txn-icon" :class="txn.type.toLowerCase()">
                <text>{{ txn.type === "CREDIT" ? "+" : "−" }}</text>
              </view>
              <view class="txn-info">
                <text class="txn-source">{{ sourceLabel(txn.source) }}</text>
                <text class="txn-desc muted">{{ txn.description || formatDate(txn.createdAt) }}</text>
              </view>
            </view>
            <view class="txn-right">
              <text class="txn-amount" :class="txn.type.toLowerCase()">
                {{ txn.type === "CREDIT" ? "+" : "−" }}{{ formatCurrency(txn.amount) }}
              </text>
              <text class="txn-balance muted" v-if="txn.balance_after != null">
                {{ t("companion.wallet.balanceAfter") }}: {{ formatCurrency(txn.balance_after) }}
              </text>
            </view>
          </view>
        </view>

        <view v-if="canLoadMore" class="load-more" @click="loadMoreTxns">
          <text>{{ t("companion.wallet.loadMore") }}</text>
        </view>
      </view>
    </view>

    <!-- Withdraw drawer -->
    <view v-if="showWithdrawDrawer" class="drawer-overlay" @click.self="closeWithdraw">
      <view class="drawer">
        <view class="drawer-header">
          <text class="drawer-title">{{ t("companion.wallet.withdrawTitle") }}</text>
          <view class="drawer-close" @click="closeWithdraw"><text>✕</text></view>
        </view>
        <view class="drawer-body">
          <text class="field-label">{{ t("companion.wallet.withdrawAmount") }}</text>
          <input
            class="field-input"
            type="digit"
            v-model="withdrawAmount"
            :placeholder="t('companion.wallet.withdrawAmountPlaceholder')"
          />
          <text class="field-label mt">{{ t("companion.wallet.withdrawDesc") }}</text>
          <input
            class="field-input"
            type="text"
            v-model="withdrawDesc"
            :placeholder="t('companion.wallet.withdrawDescPlaceholder')"
          />
          <view class="drawer-footer">
            <view class="btn-cancel" @click="closeWithdraw"><text>{{ t("companion.wallet.cancel") }}</text></view>
            <view class="btn-submit" :class="{ disabled: withdrawing }" @click="submitWithdraw">
              <text>{{ withdrawing ? t("companion.wallet.withdrawing") : t("companion.wallet.withdrawSubmit") }}</text>
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
  getRealWallet,
  getRealWalletTransactions,
  requestRealWithdrawal,
  type RealWallet,
  type RealWalletTransaction,
  type RealWalletTxnSource,
} from "../api/companion";
import { ROUTES } from "../routes";
import { showToast } from "../utils/toast";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";

const { t } = useI18n();

const loadingWallet = ref(true);
const loadingTxns = ref(true);
const wallet = ref<RealWallet | null>(null);
const transactions = ref<RealWalletTransaction[]>([]);
const page = ref(1);
const pageSize = 20;
const total = ref(0);

const showWithdrawDrawer = ref(false);
const withdrawAmount = ref("");
const withdrawDesc = ref("");
const withdrawing = ref(false);

const canLoadMore = computed(() => transactions.value.length < total.value);

function formatCurrency(v: number, currency?: string): string {
  const symbol = currency === "USD" ? "$" : "¥";
  return `${symbol}${Number(v || 0).toFixed(2)}`;
}

function formatDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sourceLabel(s: RealWalletTxnSource): string {
  const map: Record<RealWalletTxnSource, string> = {
    ORDER: t("companion.wallet.sourceOrder"),
    REFUND: t("companion.wallet.sourceRefund"),
    WITHDRAWAL: t("companion.wallet.sourceWithdrawal"),
    ADJUSTMENT: t("companion.wallet.sourceAdjustment"),
  };
  return map[s] ?? s;
}

function openWithdraw() {
  withdrawAmount.value = "";
  withdrawDesc.value = "";
  showWithdrawDrawer.value = true;
}

function closeWithdraw() {
  showWithdrawDrawer.value = false;
}

async function submitWithdraw() {
  const amount = parseFloat(withdrawAmount.value);
  if (!amount || amount <= 0) {
    showToast({ title: t("companion.wallet.amountRequired"), icon: "none" });
    return;
  }
  if (wallet.value && amount > wallet.value.balance) {
    showToast({ title: t("companion.wallet.insufficientBalance"), icon: "none" });
    return;
  }
  const token = getAccessToken() ?? "";
  withdrawing.value = true;
  try {
    await requestRealWithdrawal(token, amount, withdrawDesc.value || undefined);
    showToast({ title: t("companion.wallet.withdrawSuccess"), icon: "success" });
    closeWithdraw();
    await loadWallet();
    await loadTransactions();
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    withdrawing.value = false;
  }
}

async function loadWallet() {
  const token = getAccessToken();
  if (!token) { uni.reLaunch({ url: ROUTES.LOGIN }); return; }
  loadingWallet.value = true;
  try {
    const res = await getRealWallet(token);
    wallet.value = res.data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    loadingWallet.value = false;
  }
}

async function loadTransactions(append = false) {
  const token = getAccessToken();
  if (!token) return;
  loadingTxns.value = true;
  try {
    const res = await getRealWalletTransactions(token, { page: page.value, pageSize });
    total.value = res.data.total;
    if (append) transactions.value = [...transactions.value, ...res.data.items];
    else transactions.value = res.data.items;
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    loadingTxns.value = false;
  }
}

async function loadMoreTxns() {
  if (!canLoadMore.value) return;
  page.value += 1;
  await loadTransactions(true);
}

onMounted(async () => {
  await Promise.all([loadWallet(), loadTransactions()]);
});
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.companion-wallet-page {
  min-height: 100vh;
  height: 100vh;
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
  overflow: auto;
}

@media (min-width: 768px) {
  .companion-wallet-page {
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
  }
  .phone-inner { background: #f8fafc; }
  .drawer { max-width: min(390px, 100vw); left: 50%; transform: translateX(-50%); }
}

/* Balance card */
.balance-card {
  background: linear-gradient(135deg, #1a56db, #6366f1);
  border-radius: 24rpx;
  padding: 40rpx 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 32rpx;
}

.balance-label {
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
}

.balance-amount {
  font-size: 64rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -1rpx;
}

.withdraw-btn {
  margin-top: 16rpx;
  background: rgba(255,255,255,0.2);
  border: 1rpx solid rgba(255,255,255,0.4);
  border-radius: 40rpx;
  padding: 16rpx 48rpx;
}

.withdraw-btn text {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

/* Section */
.section-head {
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #374151;
}

/* Transaction list */
.txn-list {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.txn-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 28rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.txn-row:last-child {
  border-bottom: none;
}

.txn-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.txn-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.txn-icon.credit {
  background: #dcfce7;
}

.txn-icon.credit text {
  color: #16a34a;
  font-size: 32rpx;
  font-weight: 700;
}

.txn-icon.debit {
  background: #fee2e2;
}

.txn-icon.debit text {
  color: #dc2626;
  font-size: 32rpx;
  font-weight: 700;
}

.txn-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.txn-source {
  font-size: 28rpx;
  font-weight: 500;
  color: #111827;
}

.txn-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.txn-amount {
  font-size: 30rpx;
  font-weight: 700;
}

.txn-amount.credit { color: #16a34a; }
.txn-amount.debit { color: #dc2626; }

.txn-balance {
  font-size: 22rpx;
}

.muted { color: #9ca3af; font-size: 24rpx; }

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx;
  gap: 16rpx;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #e5e7eb;
  border-top-color: #1a56db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-text { font-size: 26rpx; color: #9ca3af; }

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 32rpx;
  gap: 12rpx;
  background: #ffffff;
  border-radius: 20rpx;
}

.empty-title { font-size: 28rpx; color: #6b7280; font-weight: 500; }

/* Load more */
.load-more {
  text-align: center;
  padding: 28rpx;
  color: #1a56db;
  font-size: 28rpx;
  font-weight: 500;
}

/* Drawer */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
}

.drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  z-index: 1001;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 20rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.drawer-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
}

.drawer-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-close text { font-size: 28rpx; color: #6b7280; }

.drawer-body {
  padding: 28rpx 32rpx 48rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.field-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #374151;
}

.field-label.mt { margin-top: 16rpx; }

.field-input {
  background: #f9fafb;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  padding: 24rpx 20rpx;
  font-size: 28rpx;
  color: #111827;
}

.drawer-footer {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.btn-cancel {
  flex: 1;
  padding: 28rpx;
  background: #f3f4f6;
  border-radius: 16rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #374151;
}

.btn-submit {
  flex: 2;
  padding: 28rpx;
  background: #1a56db;
  border-radius: 16rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

.btn-submit.disabled { opacity: 0.6; }
</style>
