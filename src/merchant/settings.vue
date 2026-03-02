<template>
  <view class="settings-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('merchant.settingsTitle')" />
      <view class="phone-inner">
        <view class="settings-list">
          <!-- Company Info -->
          <view class="settings-item" @click="openCompanyInfo">
            <view class="settings-item-left">
              <view class="settings-icon company-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </view>
              <view class="settings-content">
                <text class="settings-title">{{ t('merchant.companyInfo') }}</text>
                <text class="settings-subtitle">Manage company information</text>
              </view>
            </view>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="settings-arrow">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </view>

          <!-- Verification Status -->
          <view class="settings-item" @click="openVerificationStatus">
            <view class="settings-item-left">
              <view class="settings-icon verification-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </view>
              <view class="settings-content">
                <text class="settings-title">{{ t('merchant.verificationStatus') }}</text>
                <view class="status-badge" :class="verificationStatus">
                  <text>{{ getVerificationStatusLabel(verificationStatus) }}</text>
                </view>
              </view>
            </view>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="settings-arrow">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </view>

          <!-- Bank Account -->
          <view class="settings-item" @click="openBankAccount">
            <view class="settings-item-left">
              <view class="settings-icon bank-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </view>
              <view class="settings-content">
                <text class="settings-title">{{ t('merchant.bankAccount') }}</text>
                <text class="settings-subtitle">{{ bankAccounts.length }} account(s) added</text>
              </view>
            </view>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="settings-arrow">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </view>

          <!-- Password -->
          <view class="settings-item" @click="openPassword">
            <view class="settings-item-left">
              <view class="settings-icon password-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </view>
              <view class="settings-content">
                <text class="settings-title">{{ t('merchant.password') }}</text>
                <text class="settings-subtitle">Change your password</text>
              </view>
            </view>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="settings-arrow">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </view>
        </view>
      </view>
    </view>
    <BottomTabBar />

    <!-- Company Info Drawer -->
    <view v-if="showCompanyInfoDrawer" class="drawer-overlay" @click="closeCompanyInfoDrawer">
      <view class="drawer-content" @click.stop>
        <!-- Drag Handle -->
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ t('merchant.companyInfo') }}</text>
          <view class="drawer-close" @click="closeCompanyInfoDrawer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>

        <view class="drawer-body">
          <view class="form-group">
            <text class="form-label">{{ t('merchant.companyName') }}</text>
            <input
              v-model="companyInfo.name"
              type="text"
              :placeholder="t('merchant.companyNamePlaceholder')"
              class="form-input"
            />
          </view>

          <view class="form-group">
            <text class="form-label">{{ t('merchant.taxId') }}</text>
            <input
              v-model="companyInfo.taxId"
              type="text"
              :placeholder="t('merchant.taxIdPlaceholder')"
              class="form-input"
            />
          </view>

          <view class="form-group">
            <text class="form-label">{{ t('merchant.businessLicense') }}</text>
            <input
              v-model="companyInfo.businessLicense"
              type="text"
              :placeholder="t('merchant.businessLicensePlaceholder')"
              class="form-input"
            />
          </view>

          <view class="form-group">
            <text class="form-label">{{ t('merchant.companyAddress') }}</text>
            <textarea
              v-model="companyInfo.address"
              :placeholder="t('merchant.companyAddressPlaceholder')"
              class="form-textarea"
              rows="3"
            />
          </view>

          <view class="form-group">
            <text class="form-label">{{ t('merchant.contactPerson') }}</text>
            <input
              v-model="companyInfo.contactPerson"
              type="text"
              :placeholder="t('merchant.contactPersonPlaceholder')"
              class="form-input"
            />
          </view>

          <view class="form-group">
            <text class="form-label">{{ t('merchant.contactPhone') }}</text>
            <input
              v-model="companyInfo.contactPhone"
              type="tel"
              :placeholder="t('merchant.contactPhonePlaceholder')"
              class="form-input"
            />
          </view>
        </view>

        <view class="drawer-footer">
          <view class="drawer-actions">
            <view class="btn btn-secondary" @click="closeCompanyInfoDrawer">
              <text>{{ t('merchant.cancel') }}</text>
            </view>
            <view class="btn btn-primary" @click="saveCompanyInfo" :class="{ loading: isSavingCompanyInfo }">
              <text v-if="!isSavingCompanyInfo">{{ t('merchant.saveCompanyInfo') }}</text>
              <text v-else>{{ t('merchant.savingCompanyInfo') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Verification Status Drawer -->
    <view v-if="showVerificationDrawer" class="drawer-overlay" @click="closeVerificationDrawer">
      <view class="drawer-content" @click.stop>
        <!-- Drag Handle -->
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ t('merchant.verificationStatus') }}</text>
          <view class="drawer-close" @click="closeVerificationDrawer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>

        <view class="drawer-body">
          <view class="verification-status-card">
            <view class="status-badge-large" :class="verificationStatus">
              <text>{{ getVerificationStatusLabel(verificationStatus) }}</text>
            </view>
            <text class="verification-description">
              {{ getVerificationDescription(verificationStatus) }}
            </text>
          </view>

          <view v-if="verificationStatus === 'not_submitted' || verificationStatus === 'rejected'" class="verification-actions">
            <view class="btn btn-primary" @click="submitVerification">
              <text>{{ verificationStatus === 'rejected' ? t('merchant.resubmitVerification') : t('merchant.submitVerification') }}</text>
            </view>
          </view>
        </view>

        <view class="drawer-footer">
          <view class="drawer-actions">
            <view class="btn btn-secondary" @click="closeVerificationDrawer">
              <text>{{ t('merchant.close') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Bank Account Drawer -->
    <view v-if="showBankAccountDrawer" class="drawer-overlay" @click="closeBankAccountDrawer">
      <view class="drawer-content" @click.stop>
        <!-- Drag Handle -->
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ t('merchant.bankAccount') }}</text>
          <view class="drawer-close" @click="closeBankAccountDrawer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>

        <view class="drawer-body">
          <view v-if="bankAccounts.length === 0" class="empty-state">
            <text class="empty-title">{{ t('merchant.noBankAccounts') }}</text>
            <text class="empty-desc">{{ t('merchant.noBankAccountsDesc') }}</text>
          </view>

          <view v-else class="bank-accounts-list">
            <view 
              v-for="(account, index) in bankAccounts" 
              :key="index"
              class="bank-account-item"
            >
              <view class="bank-account-info">
                <text class="bank-account-name">{{ account.bankName }}</text>
                <text class="bank-account-number">••••{{ account.accountNumber.slice(-4) }}</text>
              </view>
              <view class="bank-account-actions">
                <view class="action-icon" @click="editBankAccount(account, index)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </view>
                <view class="action-icon delete" @click="deleteBankAccount(index)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </view>
              </view>
            </view>
          </view>

          <view class="add-bank-button" @click="addNewBankAccount">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <text>{{ t('merchant.addBankAccount') }}</text>
          </view>
        </view>

        <view class="drawer-footer">
          <view class="drawer-actions">
            <view class="btn btn-secondary" @click="closeBankAccountDrawer">
              <text>{{ t('merchant.close') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Add/Edit Bank Account Drawer -->
    <view v-if="showBankAccountFormDrawer" class="drawer-overlay" @click="closeBankAccountFormDrawer">
      <view class="drawer-content" @click.stop>
        <!-- Drag Handle -->
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ editingBankIndex !== null ? t('merchant.editBankAccount') : t('merchant.addBankAccount') }}</text>
          <view class="drawer-close" @click="closeBankAccountFormDrawer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>

        <view class="drawer-body">
          <view class="form-group">
            <text class="form-label">{{ t('merchant.bankName') }}</text>
            <input
              v-model="bankAccountForm.bankName"
              type="text"
              placeholder="Enter bank name"
              class="form-input"
            />
          </view>

          <view class="form-group">
            <text class="form-label">{{ t('merchant.bankAccountName') }}</text>
            <input
              v-model="bankAccountForm.accountName"
              type="text"
              placeholder="Enter account holder name"
              class="form-input"
            />
          </view>

          <view class="form-group">
            <text class="form-label">{{ t('merchant.bankAccountNumber') }}</text>
            <input
              v-model="bankAccountForm.accountNumber"
              type="text"
              placeholder="Enter account number"
              class="form-input"
            />
          </view>

          <view class="form-group">
            <text class="form-label">{{ t('merchant.routingNumber') }}</text>
            <input
              v-model="bankAccountForm.routingNumber"
              type="text"
              placeholder="Enter routing number"
              class="form-input"
            />
          </view>

          <view class="form-group">
            <text class="form-label">{{ t('merchant.swiftCode') }}</text>
            <input
              v-model="bankAccountForm.swiftCode"
              type="text"
              placeholder="Enter SWIFT code (optional)"
              class="form-input"
            />
          </view>
        </view>

        <view class="drawer-footer">
          <view class="drawer-actions">
            <view class="btn btn-secondary" @click="closeBankAccountFormDrawer">
              <text>{{ t('merchant.cancel') }}</text>
            </view>
            <view class="btn btn-primary" @click="saveBankAccount">
              <text>{{ t('merchant.save') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Password Drawer -->
    <view v-if="showPasswordDrawer" class="drawer-overlay" @click="closePasswordDrawer">
      <view class="drawer-content" @click.stop>
        <!-- Drag Handle -->
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ t('merchant.changePassword') }}</text>
          <view class="drawer-close" @click="closePasswordDrawer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>

        <view class="drawer-body">
          <view class="form-group">
            <text class="form-label">{{ t('merchant.currentPassword') }}</text>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              :placeholder="t('merchant.currentPasswordPlaceholder')"
              class="form-input"
            />
            <text v-if="errors.currentPassword" class="form-error">{{ errors.currentPassword }}</text>
          </view>

          <view class="form-group">
            <text class="form-label">{{ t('merchant.newPassword') }}</text>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              :placeholder="t('merchant.newPasswordPlaceholder')"
              class="form-input"
            />
            <text v-if="errors.newPassword" class="form-error">{{ errors.newPassword }}</text>
          </view>

          <view class="form-group">
            <text class="form-label">{{ t('merchant.confirmNewPassword') }}</text>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              :placeholder="t('merchant.confirmNewPasswordPlaceholder')"
              class="form-input"
            />
            <text v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</text>
          </view>
        </view>

        <view class="drawer-footer">
          <view class="drawer-actions">
            <view class="btn btn-secondary" @click="closePasswordDrawer">
              <text>{{ t('merchant.cancel') }}</text>
            </view>
            <view class="btn btn-primary" @click="savePassword" :class="{ loading: isSavingPassword }">
              <text v-if="!isSavingPassword">{{ t('merchant.savePassword') }}</text>
              <text v-else>{{ t('merchant.savingPassword') }}</text>
            </view>
          </view>
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
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";
import ConfirmDrawer from "../components/ConfirmDrawer.vue";
import { useConfirmDrawer } from "../utils/confirmDrawer";

const { t } = useI18n();

const confirmDrawer = useConfirmDrawer();
const confirmDrawerTone = ref<"primary" | "danger">("danger");

// Verification status
const verificationStatus = ref<"pending" | "approved" | "rejected" | "under_review" | "not_submitted">("under_review");

// Drawers
const showCompanyInfoDrawer = ref(false);
const showVerificationDrawer = ref(false);
const showBankAccountDrawer = ref(false);
const showBankAccountFormDrawer = ref(false);
const showPasswordDrawer = ref(false);

// Company Info
const companyInfo = ref({
  name: "Travel Adventures Inc.",
  taxId: "TA-123456789",
  businessLicense: "BL-987654321",
  address: "123 Travel Street, New York, NY 10001",
  contactPerson: "John Doe",
  contactPhone: "+1 234-567-8900"
});
const isSavingCompanyInfo = ref(false);

// Bank Accounts
interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode?: string;
}

const bankAccounts = ref<BankAccount[]>([
  {
    bankName: "Chase Bank",
    accountName: "Travel Adventures Inc.",
    accountNumber: "1234567890",
    routingNumber: "021000021",
    swiftCode: "CHASUS33"
  }
]);

const bankAccountForm = ref<BankAccount>({
  bankName: "",
  accountName: "",
  accountNumber: "",
  routingNumber: "",
  swiftCode: ""
});
const editingBankIndex = ref<number | null>(null);

// Password
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});
const isSavingPassword = ref(false);
const errors = ref<Record<string, string>>({});

function getVerificationStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return t("merchant.verificationPending");
    case "approved":
      return t("merchant.verificationApproved");
    case "rejected":
      return t("merchant.verificationRejected");
    case "under_review":
      return t("merchant.verificationUnderReview");
    case "not_submitted":
      return t("merchant.verificationNotSubmitted");
    default:
      return status;
  }
}

function getVerificationDescription(status: string): string {
  switch (status) {
    case "pending":
      return "Your verification request is pending review.";
    case "approved":
      return "Your account has been verified and approved.";
    case "rejected":
      return "Your verification request was rejected. Please resubmit with correct information.";
    case "under_review":
      return "Your verification documents are currently under review.";
    case "not_submitted":
      return "You haven't submitted verification documents yet.";
    default:
      return "";
  }
}

function openCompanyInfo() {
  showCompanyInfoDrawer.value = true;
}

function closeCompanyInfoDrawer() {
  showCompanyInfoDrawer.value = false;
}

function saveCompanyInfo() {
  isSavingCompanyInfo.value = true;
  setTimeout(() => {
    isSavingCompanyInfo.value = false;
    showCompanyInfoDrawer.value = false;
    uni.showToast({
      title: t("merchant.companyInfoSaved"),
      icon: "success",
      duration: 2000
    });
  }, 1000);
}

function openVerificationStatus() {
  showVerificationDrawer.value = true;
}

function closeVerificationDrawer() {
  showVerificationDrawer.value = false;
}

function submitVerification() {
  verificationStatus.value = "pending";
  showVerificationDrawer.value = false;
  uni.showToast({
    title: t("merchant.submitVerification"),
    icon: "success",
    duration: 2000
  });
}

function openBankAccount() {
  showBankAccountDrawer.value = true;
}

function closeBankAccountDrawer() {
  showBankAccountDrawer.value = false;
}

function addNewBankAccount() {
  bankAccountForm.value = {
    bankName: "",
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: ""
  };
  editingBankIndex.value = null;
  showBankAccountFormDrawer.value = true;
}

function editBankAccount(account: BankAccount, index: number) {
  bankAccountForm.value = { ...account };
  editingBankIndex.value = index;
  showBankAccountFormDrawer.value = true;
}

function closeBankAccountFormDrawer() {
  showBankAccountFormDrawer.value = false;
  editingBankIndex.value = null;
}

function saveBankAccount() {
  if (editingBankIndex.value !== null) {
    bankAccounts.value[editingBankIndex.value] = { ...bankAccountForm.value };
  } else {
    bankAccounts.value.push({ ...bankAccountForm.value });
  }
  closeBankAccountFormDrawer();
  uni.showToast({
    title: t("merchant.bankAccountSaved"),
    icon: "success",
    duration: 2000
  });
}

async function deleteBankAccount(index: number) {
  confirmDrawerTone.value = "danger";
  const ok = await confirmDrawer.request({
    title: t("merchant.deleteBankAccount"),
    content: "Are you sure you want to delete this bank account?",
    confirmText: t("merchant.confirm"),
    cancelText: t("merchant.cancel"),
  });
  if (!ok) return;
  bankAccounts.value.splice(index, 1);
  uni.showToast({
    title: t("merchant.bankAccountDeleted"),
    icon: "success",
    duration: 2000
  });
}

function openPassword() {
  showPasswordDrawer.value = true;
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  };
  errors.value = {};
}

function closePasswordDrawer() {
  showPasswordDrawer.value = false;
  errors.value = {};
}

function validatePassword(): boolean {
  errors.value = {};

  if (!passwordForm.value.currentPassword) {
    errors.value.currentPassword = t("merchant.currentPasswordRequired");
    return false;
  }

  if (!passwordForm.value.newPassword) {
    errors.value.newPassword = t("merchant.newPasswordRequired");
    return false;
  }

  if (passwordForm.value.newPassword.length < 6) {
    errors.value.newPassword = t("merchant.newPasswordMinLength");
    return false;
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errors.value.confirmPassword = t("merchant.passwordMismatch");
    return false;
  }

  return true;
}

function savePassword() {
  if (!validatePassword()) {
    return;
  }

  isSavingPassword.value = true;
  setTimeout(() => {
    isSavingPassword.value = false;
    showPasswordDrawer.value = false;
    uni.showToast({
      title: t("merchant.passwordChanged"),
      icon: "success",
      duration: 2000
    });
  }, 1000);
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.settings-page {
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
  .settings-page {
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

/* Settings List */
.settings-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-item {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.settings-item:active {
  transform: scale(0.98);
}

.settings-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.settings-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.company-icon {
  background: #dbeafe;
  color: #2563eb;
}

.verification-icon {
  background: #d1fae5;
  color: #F97316;
}

.bank-icon {
  background: #fef3c7;
  color: #d97706;
}

.password-icon {
  background: #e0e7ff;
  color: #6366f1;
}

.settings-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.settings-subtitle {
  font-size: 13px;
  color: #64748b;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 4px;
  display: inline-block;
  width: fit-content;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.approved {
  background: #d1fae5;
  color: #F97316;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.under_review {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.not_submitted {
  background: #f3f4f6;
  color: #6b7280;
}

.settings-arrow {
  color: #94a3b8;
  flex-shrink: 0;
}

/* Drawer Styles */
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
  pointer-events: auto;
  touch-action: none;
}

.drawer-overlay > * {
  pointer-events: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.drawer-content {
  width: 100%;
  max-width: min(390px, 100vw);
  height: 90vh;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
  pointer-events: auto !important;
  position: relative;
  z-index: 1001;
  touch-action: pan-y;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.drawer-handle {
  width: 40px;
  height: 4px;
  background: #cbd5e1;
  border-radius: 2px;
  margin: 8px auto 0;
  flex-shrink: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.drawer-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}

.drawer-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s;
}

.drawer-close:active {
  background: #f1f5f9;
  color: #0f172a;
}

.drawer-close svg {
  width: 20px;
  height: 20px;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
}

.drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

.drawer-actions {
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
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
}

.btn-secondary:active {
  background: #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-primary:active:not(.loading) {
  background: linear-gradient(135deg, #DC2626 0%, #EA580C 100%);
  box-shadow: 0 1px 4px rgba(220, 38, 38, 0.4);
}

.btn-primary.loading {
  opacity: 0.7;
  pointer-events: none;
}

.btn text {
  font-family: inherit;
}

/* Form Styles */
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

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  color: #0f172a;
  background: #ffffff;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #DC2626;
}

.form-textarea {
  resize: none;
  min-height: 80px;
}

.form-error {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
}

/* Verification Status Card */
.verification-status-card {
  text-align: center;
  padding: 32px 20px;
}

.status-badge-large {
  padding: 12px 24px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 16px;
}

.status-badge-large.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge-large.approved {
  background: #d1fae5;
  color: #F97316;
}

.status-badge-large.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge-large.under_review {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge-large.not_submitted {
  background: #f3f4f6;
  color: #6b7280;
}

.verification-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  display: block;
}

.verification-actions {
  margin-top: 24px;
}

/* Bank Accounts */
.bank-accounts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.bank-account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.bank-account-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.bank-account-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.bank-account-number {
  font-size: 13px;
  color: #64748b;
}

.bank-account-actions {
  display: flex;
  gap: 12px;
}

.action-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #DC2626;
  border-radius: 8px;
  transition: all 0.2s;
}

.action-icon:active {
  background: #eff6ff;
}

.action-icon.delete {
  color: #ef4444;
}

.action-icon.delete:active {
  background: #fef2f2;
}

.add-bank-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  color: #DC2626;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
}

.add-bank-button:active {
  background: #f1f5f9;
  border-color: #DC2626;
}

.add-bank-button svg {
  width: 20px;
  height: 20px;
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

@media (min-width: 768px) {
  .drawer-overlay {
    align-items: center;
  }

  .drawer-content {
    max-height: 85vh;
    border-radius: 24px;
    max-width: min(390px, 100vw);
  }
}
</style>