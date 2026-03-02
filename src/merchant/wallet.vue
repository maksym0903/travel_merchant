<template>
  <view class="wallet-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('merchant.walletTitle')" />
      <view class="phone-inner">
        <!-- Tabs -->
        <view class="wallet-tabs">
          <view 
            v-for="tab in tabs" 
            :key="tab.value"
            class="wallet-tab"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            <text>{{ tab.label }}</text>
          </view>
        </view>

        <!-- Balance Tab -->
        <view v-if="activeTab === 'balance'" class="wallet-content">
          <!-- Balance Card -->
          <view class="balance-card">
            <view class="balance-header">
              <text class="balance-label">{{ t('merchant.availableBalance') }}</text>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="balance-icon">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </view>
            <view class="balance-amount">
              <text class="currency">$</text>
              <text class="amount">{{ walletBalance.toFixed(2) }}</text>
            </view>
            <view class="balance-stats">
              <view class="stat-item">
                <text class="stat-label">{{ t('merchant.totalEarnings') }}</text>
                <text class="stat-value">${{ totalEarnings.toFixed(2) }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">{{ t('merchant.pendingAmount') }}</text>
                <text class="stat-value pending">${{ pendingAmount.toFixed(2) }}</text>
              </view>
              <view class="stat-item">
                <text class="stat-label">{{ t('merchant.withdrawnAmount') }}</text>
                <text class="stat-value">${{ withdrawnAmount.toFixed(2) }}</text>
              </view>
            </view>
          </view>

          <!-- Quick Actions -->
          <view class="quick-actions">
            <view class="action-card" @click="goToTransactions">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <text>{{ t('merchant.transactions') }}</text>
            </view>
            <view class="action-card" @click="activeTab = 'withdraw'">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <text>{{ t('merchant.withdraw') }}</text>
            </view>
          </view>

          <!-- Recent Transactions -->
          <view class="section">
            <view class="section-header">
              <text class="section-title">{{ t('merchant.recentTransactions') }}</text>
              <text class="section-link" @click="goToTransactions">{{ t('merchant.viewAllTransactions') }}</text>
            </view>
            <view v-if="recentTransactions.length === 0" class="empty-state">
              <text class="empty-text">{{ t('merchant.noTransactions') }}</text>
            </view>
            <view v-else class="transactions-list">
              <view 
                v-for="transaction in recentTransactions" 
                :key="transaction.id"
                class="transaction-item"
              >
                <view class="transaction-icon" :class="transaction.type">
                  <svg v-if="transaction.type === 'deposit'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <polyline points="19 12 12 19 5 12"/>
                  </svg>
                  <svg v-else-if="transaction.type === 'withdrawal'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </view>
                <view class="transaction-info">
                  <text class="transaction-type">{{ getTransactionTypeLabel(transaction.type) }}</text>
                  <text class="transaction-date">{{ formatDate(transaction.date) }}</text>
                </view>
                <view class="transaction-amount" :class="transaction.type">
                  <text v-if="transaction.type === 'deposit' || transaction.type === 'payment'">+</text>
                  <text v-else>-</text>
                  <text>${{ Math.abs(transaction.amount).toFixed(2) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- Transactions Tab -->
        <view v-if="activeTab === 'transactions'" class="wallet-content">
          <view class="section">
            <text class="section-title">{{ t('merchant.transactionHistory') }}</text>
            <view v-if="allTransactions.length === 0" class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <text class="empty-title">{{ t('merchant.noTransactions') }}</text>
              <text class="empty-desc">{{ t('merchant.noTransactionsDesc') }}</text>
            </view>
            <view v-else class="transactions-list">
              <view 
                v-for="transaction in allTransactions" 
                :key="transaction.id"
                class="transaction-item"
              >
                <view class="transaction-icon" :class="transaction.type">
                  <svg v-if="transaction.type === 'deposit'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <polyline points="19 12 12 19 5 12"/>
                  </svg>
                  <svg v-else-if="transaction.type === 'withdrawal'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </view>
                <view class="transaction-info">
                  <text class="transaction-type">{{ getTransactionTypeLabel(transaction.type) }}</text>
                  <text class="transaction-date">{{ formatDate(transaction.date) }}</text>
                  <text class="transaction-id">#{{ transaction.id }}</text>
                </view>
                <view class="transaction-amount" :class="transaction.type">
                  <text v-if="transaction.type === 'deposit' || transaction.type === 'payment'">+</text>
                  <text v-else>-</text>
                  <text>${{ Math.abs(transaction.amount).toFixed(2) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- Withdraw Tab -->
        <view v-if="activeTab === 'withdraw'" class="wallet-content">
          <view class="withdraw-section">
            <view class="withdraw-card">
              <text class="withdraw-title">{{ t('merchant.withdrawFunds') }}</text>
              
              <!-- Available Balance -->
              <view class="withdraw-balance">
                <text class="withdraw-balance-label">{{ t('merchant.availableBalance') }}</text>
                <text class="withdraw-balance-amount">${{ walletBalance.toFixed(2) }}</text>
              </view>

              <!-- Withdraw Amount -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.withdrawAmount') }}</text>
                <view class="amount-input-wrapper">
                  <text class="amount-symbol">$</text>
                  <input
                    v-model.number="withdrawAmount"
                    type="number"
                    :placeholder="t('merchant.withdrawAmountPlaceholder')"
                    class="amount-input"
                    min="10"
                    step="0.01"
                  />
                </view>
                <text v-if="errors.amount" class="form-error">{{ errors.amount }}</text>
              </view>

              <!-- Bank Account -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.withdrawTo') }}</text>
                <view class="bank-select" @click="selectBankAccount">
                  <text v-if="selectedBankAccount" class="bank-account-text">
                    {{ selectedBankAccount.bank }} ••••{{ selectedBankAccount.last4 }}
                  </text>
                  <text v-else class="bank-account-placeholder">{{ t('merchant.selectBankAccount') }}</text>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </view>
                <text v-if="errors.bankAccount" class="form-error">{{ errors.bankAccount }}</text>
                <text class="add-bank-link" @click="addBankAccount">{{ t('merchant.addBankAccount') }}</text>
              </view>

              <!-- Withdraw Button -->
              <view class="withdraw-button" @click="submitWithdraw" :class="{ loading: isWithdrawing, disabled: isWithdrawing }">
                <text v-if="!isWithdrawing">{{ t('merchant.withdrawButton') }}</text>
                <text v-else>{{ t('merchant.withdrawing') }}</text>
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
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";
import { ROUTES } from "../routes";

const { t } = useI18n();

// Wallet data
const walletBalance = ref(12547.89);
const totalEarnings = ref(18950.25);
const pendingAmount = ref(6402.36);
const withdrawnAmount = ref(6402.36);

// Tabs
const activeTab = ref<"balance" | "transactions" | "withdraw">("balance");
const tabs = computed(() => [
  { value: "balance" as const, label: t("merchant.balance") },
  { value: "transactions" as const, label: t("merchant.transactions") },
  { value: "withdraw" as const, label: t("merchant.withdraw") }
]);

// Transaction interface
interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "refund" | "payment";
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

// Mock transactions
const allTransactions: Transaction[] = [
  { id: "TXN-001", type: "deposit", amount: 2599.98, date: "2024-01-15", status: "completed" },
  { id: "TXN-002", type: "withdrawal", amount: -5000.00, date: "2024-01-05", status: "completed" },
  { id: "TXN-003", type: "payment", amount: 4999.98, date: "2023-12-20", status: "completed" },
  { id: "TXN-004", type: "refund", amount: -4399.98, date: "2023-12-10", status: "completed" }
];

const recentTransactions = computed(() => allTransactions.slice(0, 5));

// Withdraw form
const withdrawAmount = ref<number | null>(null);
const selectedBankAccount = ref<{ bank: string; last4: string } | null>({
  bank: "Chase Bank",
  last4: "1234"
});
const isWithdrawing = ref(false);
const errors = ref<Record<string, string>>({});

// Bank accounts (mock)
const bankAccounts = [
  { bank: "Chase Bank", last4: "1234" },
  { bank: "Bank of America", last4: "5678" }
];

function getTransactionTypeLabel(type: string): string {
  switch (type) {
    case "deposit":
      return t("merchant.transactionTypeDeposit");
    case "withdrawal":
      return t("merchant.transactionTypeWithdrawal");
    case "refund":
      return t("merchant.transactionTypeRefund");
    case "payment":
      return t("merchant.transactionTypePayment");
    default:
      return type;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function goToTransactions() {
  activeTab.value = "transactions";
}

function selectBankAccount() {
  // Show bank account selection (placeholder)
  uni.showActionSheet({
    itemList: bankAccounts.map(acc => `${acc.bank} ••••${acc.last4}`),
    success: (res) => {
      selectedBankAccount.value = bankAccounts[res.tapIndex];
      errors.value.bankAccount = "";
    }
  });
}

function addBankAccount() {
  uni.showToast({
    title: t("merchant.addBankAccount"),
    icon: "none",
    duration: 2000
  });
}

function validateWithdraw(): boolean {
  errors.value = {};

  if (!withdrawAmount.value || withdrawAmount.value <= 0) {
    errors.value.amount = t("merchant.withdrawAmountRequired");
    return false;
  }

  if (withdrawAmount.value < 10) {
    errors.value.amount = t("merchant.minWithdrawAmount");
    return false;
  }

  if (withdrawAmount.value > walletBalance.value) {
    errors.value.amount = t("merchant.insufficientBalance");
    return false;
  }

  if (!selectedBankAccount.value) {
    errors.value.bankAccount = t("merchant.bankAccountRequired");
    return false;
  }

  return true;
}

function submitWithdraw() {
  if (!validateWithdraw()) {
    return;
  }

  isWithdrawing.value = true;

  // Simulate API call
  setTimeout(() => {
    // Add withdrawal transaction
    allTransactions.unshift({
      id: `TXN-${Date.now()}`,
      type: "withdrawal",
      amount: -withdrawAmount.value!,
      date: new Date().toISOString().split('T')[0],
      status: "pending"
    });

    // Update balance
    walletBalance.value -= withdrawAmount.value!;
    pendingAmount.value += withdrawAmount.value!;

    isWithdrawing.value = false;
    withdrawAmount.value = null;

    uni.showToast({
      title: t("merchant.withdrawSuccess"),
      icon: "success",
      duration: 2000
    });
  }, 1500);
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.wallet-page {
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
  .wallet-page {
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

/* Tabs */
.wallet-tabs {
  display: flex;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 16px;
}

.wallet-tab {
  flex: 1;
  padding: 16px 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.wallet-tab.active {
  color: #EF4444;
  border-bottom-color: #EF4444;
}

.wallet-tab text {
  font-family: inherit;
}

/* Wallet Content */
.wallet-content {
  padding: 16px;
}

/* Balance Card */
.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  color: #ffffff;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
}

.balance-icon {
  width: 24px;
  height: 24px;
  opacity: 0.8;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  margin-bottom: 24px;
}

.currency {
  font-size: 24px;
  font-weight: 600;
  margin-right: 4px;
}

.amount {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.balance-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
}

.stat-value.pending {
  opacity: 0.9;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.action-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.action-card:active {
  transform: scale(0.98);
}

.action-card svg {
  width: 24px;
  height: 24px;
  color: #EF4444;
}

.action-card text {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

/* Section */
.section {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.section-link {
  font-size: 14px;
  color: #EF4444;
  font-weight: 500;
}

/* Transactions List */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.transaction-icon.deposit,
.transaction-icon.payment {
  background: #d1fae5;
  color: #F97316;
}

.transaction-icon.withdrawal {
  background: #fee2e2;
  color: #dc2626;
}

.transaction-icon.refund {
  background: #fef3c7;
  color: #d97706;
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-type {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
}

.transaction-date {
  font-size: 12px;
  color: #64748b;
}

.transaction-id {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.transaction-amount {
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.transaction-amount.deposit,
.transaction-amount.payment {
  color: #F97316;
}

.transaction-amount.withdrawal,
.transaction-amount.refund {
  color: #dc2626;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
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

.empty-text {
  font-size: 14px;
  color: #64748b;
  display: block;
}

/* Withdraw Section */
.withdraw-section {
  padding: 0;
}

.withdraw-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
}

.withdraw-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 24px;
  display: block;
}

.withdraw-balance {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.withdraw-balance-label {
  font-size: 14px;
  color: #64748b;
}

.withdraw-balance-amount {
  font-size: 24px;
  font-weight: 700;
  color: #EF4444;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 8px;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 16px;
  transition: border-color 0.2s;
}

.amount-input-wrapper:focus-within {
  border-color: #EF4444;
}

.amount-symbol {
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  margin-right: 8px;
}

.amount-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  padding: 14px 0;
  outline: none;
  font-family: inherit;
}

.bank-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.2s;
}

.bank-select:active {
  border-color: #EF4444;
}

.bank-account-text {
  font-size: 15px;
  font-weight: 500;
  color: #0f172a;
}

.bank-account-placeholder {
  font-size: 15px;
  color: #94a3b8;
}

.bank-select svg {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.add-bank-link {
  font-size: 13px;
  color: #EF4444;
  margin-top: 8px;
  display: block;
}

.form-error {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
}

.withdraw-button {
  width: 100%;
  padding: 16px;
  background: #EF4444;
  color: #ffffff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin-top: 8px;
  transition: all 0.2s;
}

.withdraw-button:active:not(.disabled) {
  background: #F97316;
}

.withdraw-button.loading {
  opacity: 0.7;
  pointer-events: none;
}

.withdraw-button.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.withdraw-button text {
  font-family: inherit;
}
</style>