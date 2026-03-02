<template>
  <view class="insurance-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('merchant.insuranceTitle')" />
      <view class="phone-inner">
        <SearchBar
          v-model="searchQuery"
          :placeholder="t('merchant.searchInsurance')"
          :filters="filters"
          v-model:activeFilter="activeFilter"
          :background-image="'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=400&fit=crop'"
        />
        <view class="insurance-container">
          <view v-if="isLoading" class="empty-state">
            <text class="empty-title">{{ t('merchant.loading') }}</text>
          </view>
          <view v-else-if="loadError" class="empty-state">
            <text class="empty-title" style="color:#ef4444">{{ loadError }}</text>
            <view class="btn btn-primary" style="margin-top:16px" @click="fetchInsurances">
              <text>{{ t('merchant.retry') }}</text>
            </view>
          </view>
          <view v-else-if="filteredInsurance.length === 0" class="empty-state">
            <text class="empty-title">{{ t('merchant.noInsurance') }}</text>
            <text class="empty-desc">{{ t('merchant.noInsuranceDesc') }}</text>
          </view>
          <view v-else class="insurance-grid">
            <view v-for="ins in filteredInsurance" :key="ins.id" class="insurance-card" @click="viewInsuranceDetails(ins)">
              <view class="insurance-card-content">
                <view class="insurance-header">
                  <view class="insurance-title-row">
                    <text class="insurance-name">{{ ins.name }}</text>
                    <view class="insurance-status-badge" :class="ins.status">
                      <text>{{ getStatusLabel(ins.status) }}</text>
                    </view>
                  </view>
                  <text class="insurance-type">{{ getInsuranceTypeLabel(ins.insurance_type) }}</text>
                </view>
                <view class="insurance-details">
                  <view class="detail-row">
                    <text class="detail-text">{{ ins.validity_days }} days validity</text>
                  </view>
                  <view class="detail-row" v-if="ins.coverage_amount">
                    <text class="detail-text">Coverage: {{ ins.coverage_amount.toLocaleString() }}</text>
                  </view>
                  <view class="detail-row" v-if="ins.description">
                    <text class="detail-text">{{ ins.description }}</text>
                  </view>
                </view>
                <view class="insurance-footer">
                  <view class="insurance-price">
                    <text class="price-symbol">¥</text>
                    <text class="price-amount">{{ Math.round(ins.price) }}</text>
                    <text class="price-suffix">/policy</text>
                  </view>
                  <text class="insurance-date">{{ formatDate(ins.createdAt) }}</text>
                  <view class="insurance-actions">
                    <view class="action-btn edit-btn" @click.stop="editInsurance(ins)"><text>Edit</text></view>
                    <view class="action-btn delete-btn" @click.stop="confirmDeleteInsurance(ins)"><text>Del</text></view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="fab" @click="addInsurance">
          <text style="font-size:28px;color:#fff;line-height:1">+</text>
        </view>
      </view>
    </view>
    <BottomTabBar />
    <view v-if="showCreateDrawer" class="drawer-overlay" @click="closeCreateDrawer">
      <view class="drawer-content" @click.stop>
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ t('merchant.createInsurance') }}</text>
          <view class="drawer-close" @click="closeCreateDrawer"><text>✕</text></view>
        </view>
        <view class="drawer-body">
          <view class="field-category">
            <view class="category-header">
              <text class="category-title">{{ t('merchant.basicInformation') }}</text>
            </view>
            <view class="form-group">
              <text class="form-label">{{ t('merchant.insuranceName') }} *</text>
              <TextInput v-model="newInsurance.name" type="text" :placeholder="t('merchant.insuranceNamePlaceholder')" />
              <text v-if="errors.name" class="form-error">{{ errors.name }}</text>
            </view>
            <view class="form-group">
              <text class="form-label">{{ t('merchant.coverageType') }} *</text>
              <view class="type-options">
                <view
                  v-for="tp in insuranceTypeOptions"
                  :key="tp.value"
                  class="type-option"
                  :class="{ active: newInsurance.insurance_type === tp.value }"
                  @click="newInsurance.insurance_type = tp.value"
                >
                  <text>{{ tp.label }}</text>
                </view>
              </view>
              <text v-if="errors.insurance_type" class="form-error">{{ errors.insurance_type }}</text>
            </view>
            <view class="form-group">
              <text class="form-label">{{ t('merchant.shortDescription') }}</text>
              <TextArea v-model="newInsurance.description" :placeholder="t('merchant.shortDescriptionPlaceholder')" />
            </view>
          </view>
          <view class="field-category">
            <view class="category-header">
              <text class="category-title">Pricing &amp; Duration</text>
            </view>
            <view class="form-row">
              <view class="form-group form-group-half">
                <text class="form-label">Price (¥) *</text>
                <TextInput
                  :modelValue="newInsurance.price > 0 ? newInsurance.price.toString() : ''"
                  type="text"
                  placeholder="0"
                  @update:modelValue="(v) => newInsurance.price = parseFloat(v) || 0"
                />
                <text v-if="errors.price" class="form-error">{{ errors.price }}</text>
              </view>
              <view class="form-group form-group-half">
                <text class="form-label">Validity (days) *</text>
                <TextInput
                  :modelValue="newInsurance.validity_days > 0 ? newInsurance.validity_days.toString() : ''"
                  type="text"
                  placeholder="30"
                  @update:modelValue="(v) => newInsurance.validity_days = parseInt(v) || 0"
                />
                <text v-if="errors.validity_days" class="form-error">{{ errors.validity_days }}</text>
              </view>
            </view>
            <view class="form-group">
              <text class="form-label">{{ t('merchant.coverageAmountLabel') }}</text>
              <view class="amount-presets">
                <view
                  v-for="amt in coverageAmountPresets"
                  :key="amt"
                  class="amount-option"
                  :class="{ active: newInsurance.coverage_amount === amt }"
                  @click="newInsurance.coverage_amount = amt"
                >
                  <text>¥{{ amt.toLocaleString() }}</text>
                </view>
              </view>
              <view style="margin-top:12px">
                <text class="form-label">{{ t('merchant.customAmount') }}</text>
                <TextInput
                  :modelValue="customCoverageAmount"
                  type="text"
                  :placeholder="t('merchant.customAmountPlaceholder')"
                  @update:modelValue="handleCustomCoverageAmount"
                />
              </view>
            </view>
          </view>
        </view>
        <view class="drawer-footer">
          <view class="drawer-actions">
            <view class="btn btn-secondary" @click="saveAsDraft" :class="{ loading: isSubmitting }">
              <text>{{ isSubmitting ? t('merchant.saving') : t('merchant.saveAsDraft') }}</text>
            </view>
            <view class="btn btn-primary" @click="publishInsurance" :class="{ loading: isSubmitting }">
              <text>{{ isSubmitting ? t('merchant.publishing') : t('merchant.publish') }}</text>
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
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import PageHead from "../../components/PageHead.vue";
import BottomTabBar from "../../components/BottomTabBar.vue";
import SearchBar from "../../components/SearchBar.vue";
import TextInput from "../../components/TextInput.vue";
import TextArea from "../../components/TextArea.vue";
import ConfirmDrawer from "../../components/ConfirmDrawer.vue";
import { useConfirmDrawer } from "../../utils/confirmDrawer";
import {
  getMerchantInsurances,
  createMerchantInsurance,
  type MerchantInsurance,
  type InsuranceStatus,
  type InsuranceType,
} from "../../api/merchant";

const { t } = useI18n();

const confirmDrawer = useConfirmDrawer();
const confirmDrawerTone = ref<"primary" | "danger">("danger");

interface Insurance {
  id: string;
  name: string;
  description?: string;
  insurance_type: InsuranceType;
  coverage_amount?: number;
  validity_days: number;
  price: number;
  stock_quantity?: number | null;
  status: "draft" | "published" | "paused";
  createdAt: string;
  updatedAt: string;
}

function mapStatus(s: InsuranceStatus): Insurance["status"] {
  if (s === "PUBLISHED") return "published";
  if (s === "PAUSED") return "paused";
  return "draft";
}

function apiToInsurance(i: MerchantInsurance): Insurance {
  return {
    id: i.id,
    name: i.name,
    description: i.description,
    insurance_type: i.insurance_type,
    coverage_amount: i.coverage_amount,
    validity_days: i.validity_days,
    price: i.price,
    stock_quantity: i.stock_quantity,
    status: mapStatus(i.status),
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  };
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}

function getInsuranceTypeLabel(type: InsuranceType): string {
  if (type === "TRAVEL_ACCIDENT") return "Travel Accident";
  if (type === "MEDICAL") return "Medical";
  if (type === "TRIP_CANCELLATION") return "Trip Cancellation";
  return type;
}

const insuranceList = ref<Insurance[]>([]);
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const searchQuery = ref("");
const activeFilter = ref<"all" | "draft" | "published" | "paused">("all");

async function fetchInsurances() {
  isLoading.value = true;
  loadError.value = null;
  try {
    const raw = await getMerchantInsurances();
    insuranceList.value = raw.map(apiToInsurance);
  } catch (err: any) {
    loadError.value = err?.message ?? t("merchant.errorGeneric");
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => { fetchInsurances(); });

const filters = computed(() => [
  { value: "all" as const,       label: t("merchant.allInsurance") },
  { value: "published" as const, label: "Published" },
  { value: "draft" as const,     label: t("merchant.draftInsurance") },
  { value: "paused" as const,    label: "Paused" },
]);

const filteredInsurance = computed(() => {
  let r = insuranceList.value;
  if (activeFilter.value !== "all") r = r.filter(i => i.status === activeFilter.value);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    r = r.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.description ?? "").toLowerCase().includes(q) ||
      getInsuranceTypeLabel(i.insurance_type).toLowerCase().includes(q)
    );
  }
  return r;
});

function getStatusLabel(status: string): string {
  if (status === "published") return t("merchant.active") || "Published";
  if (status === "paused") return t("merchant.suspended") || "Paused";
  return t("merchant.draft");
}

const insuranceTypeOptions: { value: InsuranceType; label: string }[] = [
  { value: "TRAVEL_ACCIDENT",   label: "Travel Accident" },
  { value: "MEDICAL",           label: "Medical" },
  { value: "TRIP_CANCELLATION", label: "Trip Cancellation" },
];
const coverageAmountPresets = [50000, 100000, 200000, 500000];

const showCreateDrawer = ref(false);
const isSubmitting = ref(false);
const errors = ref<Record<string, string>>({});
const customCoverageAmount = ref("");

const newInsurance = ref({
  name: "",
  description: "",
  insurance_type: "TRAVEL_ACCIDENT" as InsuranceType,
  coverage_amount: 0,
  validity_days: 0,
  price: 0,
});

function handleCustomCoverageAmount(val: string) {
  customCoverageAmount.value = val;
  const n = parseFloat(val);
  if (!isNaN(n) && n > 0) newInsurance.value.coverage_amount = n;
}

function resetForm() {
  newInsurance.value = {
    name: "",
    description: "",
    insurance_type: "TRAVEL_ACCIDENT",
    coverage_amount: 0,
    validity_days: 0,
    price: 0,
  };
  customCoverageAmount.value = "";
  errors.value = {};
}

function addInsurance() { resetForm(); showCreateDrawer.value = true; }
function closeCreateDrawer() { showCreateDrawer.value = false; errors.value = {}; }

function validateForm(): boolean {
  errors.value = {};
  if (!newInsurance.value.name.trim()) errors.value.name = "Insurance name is required";
  if (!newInsurance.value.insurance_type) errors.value.insurance_type = "Insurance type is required";
  if (newInsurance.value.validity_days < 1) errors.value.validity_days = "Validity days must be at least 1";
  if (newInsurance.value.price < 0) errors.value.price = "Price must be 0 or greater";
  return Object.keys(errors.value).length === 0;
}

async function saveAsDraft() {
  if (isSubmitting.value || !validateForm()) return;
  isSubmitting.value = true;
  try {
    await createMerchantInsurance({
      name: newInsurance.value.name.trim(),
      insurance_type: newInsurance.value.insurance_type,
      validity_days: newInsurance.value.validity_days,
      price: newInsurance.value.price,
      description: newInsurance.value.description.trim() || undefined,
      coverage_amount: newInsurance.value.coverage_amount > 0 ? newInsurance.value.coverage_amount : undefined,
      status: "DRAFT",
    });
    showCreateDrawer.value = false;
    uni.showToast({ title: "Saved as draft", icon: "success", duration: 2000 });
    await fetchInsurances();
  } catch (err: any) {
    uni.showToast({ title: err?.message ?? t("merchant.errorGeneric"), icon: "none", duration: 3000 });
  } finally {
    isSubmitting.value = false;
  }
}

async function publishInsurance() {
  if (isSubmitting.value || !validateForm()) return;
  isSubmitting.value = true;
  try {
    await createMerchantInsurance({
      name: newInsurance.value.name.trim(),
      insurance_type: newInsurance.value.insurance_type,
      validity_days: newInsurance.value.validity_days,
      price: newInsurance.value.price,
      description: newInsurance.value.description.trim() || undefined,
      coverage_amount: newInsurance.value.coverage_amount > 0 ? newInsurance.value.coverage_amount : undefined,
      status: "PUBLISHED",
    });
    showCreateDrawer.value = false;
    uni.showToast({ title: "Published!", icon: "success", duration: 2000 });
    await fetchInsurances();
  } catch (err: any) {
    uni.showToast({ title: err?.message ?? t("merchant.errorGeneric"), icon: "none", duration: 3000 });
  } finally {
    isSubmitting.value = false;
  }
}

function viewInsuranceDetails(ins: Insurance) {
  uni.showToast({ title: ins.name, icon: "none", duration: 2000 });
}
function editInsurance(ins: Insurance) {
  uni.showToast({ title: "Edit: " + ins.name, icon: "none", duration: 2000 });
}
async function confirmDeleteInsurance(ins: Insurance) {
  confirmDrawerTone.value = "danger";
  const ok = await confirmDrawer.request({
    title: t("merchant.deleteInsurance"),
    content: t("merchant.deleteInsuranceConfirm", { name: ins.name }),
    confirmText: t("merchant.confirm"),
    cancelText: t("merchant.cancel"),
  });
  if (!ok) return;
  insuranceList.value = insuranceList.value.filter(i => i.id !== ins.id);
  uni.showToast({ title: t("merchant.insuranceDeleted"), icon: "success", duration: 2000 });
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.insurance-page {
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
  .insurance-page {
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
.insurance-container { padding: 16px; }
.insurance-grid { display: flex; flex-direction: column; gap: 12px; }
.insurance-card { background: #fef9e7; border-radius: 12px; border: 1px solid #fde68a; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.insurance-card-content { padding: 16px; }
.insurance-header { margin-bottom: 10px; }
.insurance-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.insurance-name { font-size: 16px; font-weight: 600; color: #1a1a1a; flex: 1; margin-right: 8px; }
.insurance-status-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.insurance-status-badge text { font-family: inherit; }
.insurance-status-badge.draft { background: rgba(251,191,36,0.15); color: #b45309; }
.insurance-status-badge.published { background: rgba(34,197,94,0.15); color: #15803d; }
.insurance-status-badge.paused { background: rgba(100,116,139,0.15); color: #475569; }
.insurance-type { font-size: 13px; color: #64748b; font-weight: 500; }
.insurance-details { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
.detail-row { display: flex; align-items: center; }
.detail-text { font-size: 13px; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.insurance-footer { display: flex; align-items: center; gap: 8px; padding-top: 10px; border-top: 1px solid #f1f5f9; }
.insurance-price { display: flex; align-items: baseline; color: #e09c07; line-height: 1; flex-shrink: 0; }
.price-symbol { font-size: 12px; font-weight: 600; }
.price-amount { font-size: 18px; font-weight: 700; }
.price-suffix { font-size: 11px; color: #999; margin-left: 2px; }
.insurance-date { flex: 1; font-size: 11px; color: #94a3b8; }
.insurance-actions { display: flex; gap: 6px; }
.action-btn { width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.action-btn text { font-family: inherit; }
.edit-btn { background: #FFEDD5; color: #F97316; }
.delete-btn { background: #fef2f2; color: #ef4444; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 32px; text-align: center; }
.empty-title { font-size: 18px; font-weight: 600; color: #334155; margin-bottom: 8px; display: block; }
.empty-desc { font-size: 14px; color: #64748b; display: block; }
.fab { position: fixed; bottom: 80px; right: 20px; width: 56px; height: 56px; border-radius: 28px; background: #e09c07; color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(224,156,7,0.4); z-index: 10; }

@media (min-width: 768px) {
  .fab {
    right: calc(50% - min(390px, 100vw) / 2 + 20px);
  }
}
.drawer-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; justify-content: center; }
.drawer-content { width: 100%; max-width: min(390px,100vw); height: 90vh; background: #fff; border-radius: 24px 24px 0 0; display: flex; flex-direction: column; overflow: hidden; }

@media (min-width: 768px) {
  .drawer-content {
    height: 85vh;
    max-height: 85vh;
  }
}
.drawer-handle { width: 80rpx; height: 8rpx; background: #cbd5e1; border-radius: 4rpx; margin: 16rpx auto 0; flex-shrink: 0; }
.drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 24rpx 32rpx 32rpx; border-bottom: 1rpx solid #e2e8f0; flex-shrink: 0; }
.drawer-title { font-size: 36rpx; font-weight: 600; color: #0f172a; }
.drawer-close { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; color: #64748b; border-radius: 16rpx; }
.drawer-close text { font-family: inherit; }
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 40rpx 32rpx;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}

.field-category {
  margin-bottom: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  border: 1rpx solid #e2e8f0;
}

.category-header {
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.category-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.form-group {
  margin-bottom: 28rpx;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group-half { flex: 1; }

.form-row {
  display: flex;
  gap: 20rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
  margin-bottom: 12rpx;
}

.form-error {
  display: block;
  font-size: 24rpx;
  color: #ef4444;
  margin-top: 8rpx;
  padding: 10rpx 14rpx;
  background: #fef2f2;
  border-left: 4rpx solid #ef4444;
  border-radius: 4rpx;
}

.drawer-body :deep(.text-input-wrap input),
.drawer-body :deep(.text-input-native),
.drawer-body :deep(.textarea-wrap textarea),
.drawer-body :deep(.textarea-native) {
  width: 100%;
  padding: 24rpx 28rpx;
  font-size: 30rpx;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12rpx;
  box-sizing: border-box;
  font-family: inherit;
}

.drawer-body :deep(.text-input-wrap input):focus,
.drawer-body :deep(.text-input-native):focus,
.drawer-body :deep(.textarea-wrap textarea):focus,
.drawer-body :deep(.textarea-native):focus {
  outline: none;
  border-color: #e09c07;
}

.drawer-body :deep(.textarea-wrap textarea),
.drawer-body :deep(.textarea-native) {
  min-height: 120rpx;
  resize: none;
}

.type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 8rpx;
}

.type-option {
  padding: 16rpx 20rpx;
  border-radius: 10rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  color: #64748b;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.2s;
}

.type-option text { font-family: inherit; }

.type-option.active {
  background: #fef3c7;
  border-color: #e09c07;
  color: #92400e;
}

.amount-presets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
  margin-top: 8rpx;
}

.amount-option {
  padding: 20rpx;
  border-radius: 10rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  color: #64748b;
  font-size: 26rpx;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s;
}

.amount-option text { font-family: inherit; }

.amount-option.active {
  background: #fef3c7;
  border-color: #e09c07;
  color: #92400e;
}
.drawer-footer { padding: 32rpx; border-top: 1rpx solid #e2e8f0; background: #fff; flex-shrink: 0; }
.drawer-actions { display: flex; gap: 24rpx; }
.btn { flex: 1; padding: 30rpx 32rpx; border-radius: 16rpx; font-size: 32rpx; font-weight: 500; text-align: center; border: none; font-family: inherit; }
.btn text { font-family: inherit; }
.btn-secondary { background: #f1f5f9; color: #334155; }
.btn-primary { background: linear-gradient(135deg, #EF4444 0%, #F97316 100%); color: #fff; box-shadow: 0 2px 8px rgba(239,68,68,0.3); }
.btn-primary.loading, .btn-secondary.loading { opacity: 0.5; pointer-events: none; }
</style>
