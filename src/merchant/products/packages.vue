<template>
  <view class="packages-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('merchant.packagesTitle')" />
      <view class="phone-inner">
        <!-- Search and Filter Bar -->
        <SearchBar
          v-model="searchQuery"
          :placeholder="t('merchant.searchPackages')"
          :filters="filters"
          v-model:activeFilter="activeFilter"
          :background-image="'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=400&fit=crop&q=80&auto=format'"
        />

        <!-- Packages List -->
        <view class="packages-container">
          <!-- Loading state -->
          <view v-if="isLoading" class="empty-state">
            <text class="empty-title">{{ t('merchant.loadingPackages') }}</text>
          </view>

          <!-- Error state -->
          <view v-else-if="loadError" class="empty-state">
            <text class="empty-title">{{ loadError }}</text>
            <view class="btn btn-secondary" style="margin-top:12px;" @click="fetchPackages()">
              <text>{{ t('merchant.retry') }}</text>
            </view>
          </view>

          <!-- Empty state -->
          <view v-else-if="filteredPackages.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <text class="empty-title">{{ t('merchant.noPackages') }}</text>
            <text class="empty-desc">{{ t('merchant.noPackagesDesc') }}</text>
          </view>

          <view v-else class="packages-grid">
            <view
              v-for="pkg in filteredPackages"
              :key="pkg.id"
              class="package-card"
              @click="viewPackageDetails(pkg)"
            >
              <!-- Status badge -->
              <view class="pkg-status-badge" :class="pkg.status.toLowerCase()">
                <text>{{ getStatusLabel(pkg.status) }}</text>
              </view>

              <!-- Card body -->
              <view class="pkg-body">
                <!-- Name -->
                <text class="pkg-name">{{ pkg.name }}</text>

                <!-- Description -->
                <text v-if="pkg.description" class="pkg-desc">{{ pkg.description }}</text>

                <!-- Meta row: price + duration -->
                <view class="pkg-meta-row">
                  <view class="pkg-meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#ef4444;flex-shrink:0;">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <text class="pkg-meta-text">¥{{ pkg.price.toFixed(2) }}</text>
                  </view>
                  <view v-if="pkg.duration_days" class="pkg-meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#64748b;flex-shrink:0;">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <text class="pkg-meta-text">{{ pkg.duration_days }}D</text>
                  </view>
                  <view class="pkg-meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#64748b;flex-shrink:0;">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    <text class="pkg-meta-text">{{ pkg.booking_count }} {{ t('merchant.bookings') }}</text>
                  </view>
                </view>

                <view class="pkg-divider" />

                <!-- Footer: date + actions -->
                <view class="pkg-footer">
                  <text class="pkg-date">{{ formatDate(pkg.createdAt) }}</text>
                  <view class="pkg-actions">
                    <view class="action-btn edit-btn" @click.stop="openEditDrawer(pkg)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </view>
                    <view
                      v-if="pkg.status === 'DRAFT'"
                      class="action-btn publish-btn"
                      @click.stop="publishPackage(pkg)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- Floating Action Button -->
        <view class="fab" @click="openCreateDrawer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </view>
      </view>
    </view>
    <BottomTabBar />

    <!-- Create / Edit Package Drawer -->
    <view v-if="showDrawer" class="drawer-overlay" @click="closeDrawer">
      <view class="drawer-content" @click.stop>
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ editingPackage ? t('merchant.editPackage') : t('merchant.addPackage') }}</text>
          <view class="drawer-close" @click="closeDrawer">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>

        <view class="drawer-body">
          <!-- Basic Info -->
          <view class="field-category">
            <view class="category-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color:#ef4444;">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <text class="category-title">{{ t('merchant.generalInfo') }}</text>
            </view>

            <!-- Package Name -->
            <view class="form-group">
              <text class="form-label">{{ t('merchant.packageName') }} *</text>
              <TextInput
                v-model="form.name"
                type="text"
                :placeholder="t('merchant.packageNamePlaceholder')"
              />
              <text v-if="errors.name" class="form-error">{{ errors.name }}</text>
            </view>

            <!-- Price -->
            <view class="form-group">
              <text class="form-label">{{ t('merchant.packagePrice') }} *</text>
              <TextInput
                v-model="form.priceStr"
                type="text"
                :placeholder="t('merchant.packagePricePlaceholder')"
              />
              <text v-if="errors.price" class="form-error">{{ errors.price }}</text>
            </view>

            <!-- Duration (days) -->
            <view class="form-group">
              <text class="form-label">{{ t('merchant.packageDurationDays') }}</text>
              <TextInput
                v-model="form.durationStr"
                type="text"
                :placeholder="t('merchant.packageDurationPlaceholder')"
              />
            </view>
          </view>

          <!-- Description -->
          <view class="field-category">
            <view class="category-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color:#f97316;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <text class="category-title">{{ t('merchant.description') }}</text>
            </view>
            <view class="form-group">
              <text class="form-label">{{ t('merchant.packageDescription') }}</text>
              <TextArea
                v-model="form.description"
                :placeholder="t('merchant.packageDescriptionPlaceholder')"
              />
            </view>
          </view>

        </view>
        <view class="drawer-footer">
          <view class="drawer-actions">
            <view class="btn btn-secondary" @click="saveAsDraft" :class="{ loading: isSubmitting }">
              <text>{{ isSubmitting ? t('merchant.saving') : t('merchant.saveAsDraft') }}</text>
            </view>
            <view class="btn btn-primary" @click="submitPublished" :class="{ loading: isSubmitting }">
              <text>{{ isSubmitting ? t('merchant.submitting') : (editingPackage ? t('merchant.savePackage') : t('merchant.submitForReview')) }}</text>
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
import PageHead from "../../components/PageHead.vue";
import BottomTabBar from "../../components/BottomTabBar.vue";
import SearchBar from "../../components/SearchBar.vue";
import TextInput from "../../components/TextInput.vue";
import TextArea from "../../components/TextArea.vue";
import {
  getMerchantPackages,
  createMerchantPackage,
  updateMerchantPackage,
  publishMerchantPackage,
  type MerchantPackage,
  type PackageStatus,
} from "../../api/merchant";

const { t } = useI18n();

// ── State ──────────────────────────────────────────────────────────────────
const packages = ref<MerchantPackage[]>([]);
const isLoading = ref(false);
const loadError = ref("");
const searchQuery = ref("");
const activeFilter = ref<"all" | "DRAFT" | "PUBLISHED" | "PAUSED">("all");
const showDrawer = ref(false);
const isSubmitting = ref(false);
const editingPackage = ref<MerchantPackage | null>(null);

// Form state
const form = ref({
  name: "",
  priceStr: "",
  durationStr: "",
  description: "",
});

const errors = ref<Record<string, string>>({});

// ── Fetch ──────────────────────────────────────────────────────────────────
async function fetchPackages() {
  isLoading.value = true;
  loadError.value = "";
  try {
    packages.value = await getMerchantPackages();
  } catch (err: any) {
    loadError.value = err?.message ?? t("merchant.loadPackagesError");
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchPackages();
});

// ── Filters ────────────────────────────────────────────────────────────────
const filters = computed(() => [
  { value: "all" as const,       label: t("merchant.allPackages") },
  { value: "PUBLISHED" as const, label: t("merchant.publishedPackages") },
  { value: "DRAFT" as const,     label: t("merchant.draftPackages") },
  { value: "PAUSED" as const,    label: t("merchant.pausedPackages") },
]);

const filteredPackages = computed(() => {
  let result = packages.value;

  if (activeFilter.value !== "all") {
    result = result.filter(pkg => pkg.status === activeFilter.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(pkg =>
      pkg.name.toLowerCase().includes(query) ||
      (pkg.description ?? "").toLowerCase().includes(query)
    );
  }

  return result;
});

// ── Status helpers ─────────────────────────────────────────────────────────
function getStatusLabel(status: PackageStatus): string {
  switch (status) {
    case "PUBLISHED": return t("merchant.packageStatusActive");
    case "PAUSED":    return t("merchant.packageStatusInactive");
    case "DRAFT":
    default:          return t("merchant.packageStatusDraft");
  }
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

// ── Drawer ─────────────────────────────────────────────────────────────────
function openCreateDrawer() {
  editingPackage.value = null;
  form.value = { name: "", priceStr: "", durationStr: "", description: "" };
  errors.value = {};
  showDrawer.value = true;
}

function openEditDrawer(pkg: MerchantPackage) {
  editingPackage.value = pkg;
  form.value = {
    name: pkg.name,
    priceStr: String(pkg.price),
    durationStr: pkg.duration_days != null ? String(pkg.duration_days) : "",
    description: pkg.description ?? "",
  };
  errors.value = {};
  showDrawer.value = true;
}

function closeDrawer() {
  showDrawer.value = false;
  editingPackage.value = null;
  errors.value = {};
}

// ── Validation ─────────────────────────────────────────────────────────────
function validateForm(): boolean {
  errors.value = {};
  if (!form.value.name.trim()) {
    errors.value.name = t("merchant.packageNameRequired");
  }
  const price = parseFloat(form.value.priceStr);
  if (isNaN(price) || price < 0) {
    errors.value.price = t("merchant.packagePriceInvalid");
  }
  return Object.keys(errors.value).length === 0;
}

function buildPayload(status: PackageStatus) {
  const price = parseFloat(form.value.priceStr);
  const duration_days = form.value.durationStr ? parseInt(form.value.durationStr, 10) : undefined;
  return {
    name: form.value.name.trim(),
    price,
    description: form.value.description.trim() || undefined,
    duration_days: duration_days && !isNaN(duration_days) ? duration_days : undefined,
    status,
  };
}

// ── Save as Draft ──────────────────────────────────────────────────────────
async function saveAsDraft() {
  if (isSubmitting.value || !validateForm()) {
    if (Object.keys(errors.value).length > 0) {
      uni.showToast({ title: t("merchant.pleaseCompleteRequiredFields"), icon: "none", duration: 2000 });
    }
    return;
  }
  isSubmitting.value = true;
  try {
    if (editingPackage.value) {
      await updateMerchantPackage(editingPackage.value.id, buildPayload("DRAFT"));
    } else {
      await createMerchantPackage(buildPayload("DRAFT"));
    }
    closeDrawer();
    uni.showToast({ title: t("merchant.tourSavedAsDraft"), icon: "success", duration: 2000 });
    fetchPackages();
  } catch (err: any) {
    uni.showToast({ title: err?.message ?? t("merchant.errorGeneric"), icon: "none", duration: 2500 });
  } finally {
    isSubmitting.value = false;
  }
}

// ── Submit as Published ────────────────────────────────────────────────────
async function submitPublished() {
  if (isSubmitting.value || !validateForm()) {
    if (Object.keys(errors.value).length > 0) {
      uni.showToast({ title: t("merchant.pleaseCompleteRequiredFields"), icon: "none", duration: 2000 });
    }
    return;
  }
  isSubmitting.value = true;
  try {
    if (editingPackage.value) {
      await updateMerchantPackage(editingPackage.value.id, buildPayload("PUBLISHED"));
    } else {
      await createMerchantPackage(buildPayload("PUBLISHED"));
    }
    closeDrawer();
    uni.showToast({ title: t("merchant.packageSaved"), icon: "success", duration: 2000 });
    fetchPackages();
  } catch (err: any) {
    uni.showToast({ title: err?.message ?? t("merchant.errorGeneric"), icon: "none", duration: 2500 });
  } finally {
    isSubmitting.value = false;
  }
}

// ── Publish draft ──────────────────────────────────────────────────────────
async function publishPackage(pkg: MerchantPackage) {
  try {
    await publishMerchantPackage(pkg.id);
    uni.showToast({ title: t("merchant.packageSaved"), icon: "success", duration: 2000 });
    fetchPackages();
  } catch (err: any) {
    uni.showToast({ title: err?.message ?? t("merchant.errorGeneric"), icon: "none", duration: 2500 });
  }
}

function viewPackageDetails(pkg: MerchantPackage) {
  uni.showToast({ title: pkg.name, icon: "none", duration: 2000 });
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.packages-page {
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
  .packages-page {
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

  .drawer-content {
    height: 85vh;
    max-height: 85vh;
  }
}

/* Packages Container */
.packages-container {
  padding: 16px;
}

.packages-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Package Card ─────────────────────────────────────────────────────────── */
.package-card {
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0,0,0,0.04);
  position: relative;
  transition: box-shadow 0.2s, transform 0.15s;
}

.package-card:active {
  transform: scale(0.985);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Status badge — top-right */
.pkg-status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  z-index: 1;
}

.pkg-status-badge text {
  font-family: inherit;
}

.pkg-status-badge.draft {
  background: rgba(245, 158, 11, 0.92);
  color: #ffffff;
}

.pkg-status-badge.published {
  background: rgba(22, 163, 74, 0.92);
  color: #ffffff;
}

.pkg-status-badge.paused {
  background: rgba(71, 85, 105, 0.88);
  color: #ffffff;
}

/* Card body */
.pkg-body {
  padding: 14px 14px 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pkg-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding-right: 60px; /* space for badge */
}

.pkg-desc {
  font-size: 12.5px;
  color: #64748b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Meta row */
.pkg-meta-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.pkg-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pkg-meta-text {
  font-size: 12px;
  color: #64748b;
}

.pkg-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 0;
}

/* Footer */
.pkg-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pkg-date {
  font-size: 11px;
  color: #94a3b8;
}

.pkg-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.edit-btn {
  background: #f1f5f9;
  color: #475569;
}

.edit-btn:active {
  background: #e2e8f0;
}

.publish-btn {
  background: #dcfce7;
  color: #16a34a;
}

.publish-btn:active {
  background: #bbf7d0;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 10px;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 8px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #475569;
}

.empty-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #ef4444;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  cursor: pointer;
  z-index: 50;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.fab svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
}

@media (min-width: 768px) {
  .fab {
    right: calc(50% - min(390px, 100vw) / 2 + 20px);
  }
}

/* ── Drawer ──────────────────────────────────────────────────────────────── */
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
  from { opacity: 0; }
  to   { opacity: 1; }
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
  position: relative;
  z-index: 1001;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.drawer-handle {
  width: 80rpx;
  height: 8rpx;
  background: #cbd5e1;
  border-radius: 4rpx;
  margin: 16rpx auto 0;
  flex-shrink: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx 32rpx;
  border-bottom: 1rpx solid #e2e8f0;
  flex-shrink: 0;
}

.drawer-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #0f172a;
}

.drawer-close {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  border-radius: 16rpx;
  transition: all 0.2s;
}

.drawer-close:active {
  background: #f1f5f9;
  color: #0f172a;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 40rpx 32rpx;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}

/* Field category */
.field-category {
  margin-bottom: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  border: 1rpx solid #e2e8f0;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.category-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.category-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

/* Form */
.form-group {
  margin-bottom: 28rpx;
}

.form-group:last-child {
  margin-bottom: 0;
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

/* Style TextInput / TextArea internals to match other drawers */
.drawer-body :deep(.input),
.drawer-body :deep(.text-input-native),
.drawer-body :deep(.textarea),
.drawer-body :deep(.textarea-native) {
  width: 100%;
  padding: 24rpx 28rpx;
  font-size: 30rpx;
  color: #1e293b;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  box-sizing: border-box;
  font-family: inherit;
}

.drawer-body :deep(.input):focus,
.drawer-body :deep(.text-input-native):focus,
.drawer-body :deep(.textarea):focus,
.drawer-body :deep(.textarea-native):focus {
  outline: none;
  border-color: #ef4444;
}

.drawer-body :deep(.textarea),
.drawer-body :deep(.textarea-native) {
  min-height: 160rpx;
  resize: none;
}

/* Drawer footer + action buttons */
.drawer-footer {
  flex-shrink: 0;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #e2e8f0;
  background: #ffffff;
}

.drawer-actions {
  display: flex;
  gap: 20rpx;
}

.btn {
  flex: 1;
  padding: 28rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 28rpx;
  font-weight: 600;
  transition: opacity 0.15s;
}

.btn.loading {
  opacity: 0.6;
  pointer-events: none;
}

.btn text {
  font-family: inherit;
  font-weight: 600;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1rpx solid #e2e8f0;
}

.btn-secondary:active {
  background: #e2e8f0;
}

.btn-primary {
  background: #ef4444;
  color: #ffffff;
}

.btn-primary:active {
  background: #dc2626;
}
</style>
