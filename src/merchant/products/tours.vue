<template>
  <view class="tours-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('merchant.toursTitle')" />
      <view class="phone-inner">
        <!-- Search and Filter Bar -->
        <SearchBar
          v-model="searchQuery"
          :placeholder="t('merchant.searchTours')"
          :filters="filters"
          v-model:activeFilter="activeFilter"
          :background-image="'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop&q=80&auto=format'"
        />

        <!-- Tours List -->
        <view class="tours-container">
          <!-- Loading state -->
          <view v-if="loadingTours" class="empty-state">
            <text class="empty-title">{{ t('merchant.loading') }}</text>
          </view>

          <!-- Error state -->
          <view v-else-if="loadError" class="empty-state">
            <text class="empty-title">{{ loadError }}</text>
            <view class="btn btn-secondary" style="margin-top:12px;" @click="fetchTours()">
              <text>{{ t('merchant.retry') }}</text>
            </view>
          </view>

          <!-- Empty state -->
          <view v-else-if="filteredTours.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <text class="empty-title">{{ t('merchant.noTours') }}</text>
            <text class="empty-desc">{{ t('merchant.noToursDesc') }}</text>
          </view>

          <view v-else class="tours-grid">
            <view
              v-for="tour in filteredTours"
              :key="tour.id"
              class="tour-card"
              @click="viewTourDetails(tour)"
            >
              <!-- Left: cover image thumbnail -->
              <view class="tour-thumb-wrap">
                <img
                  v-if="tour.coverImage"
                  :src="tour.coverImage"
                  class="tour-thumb-img"
                />
                <!-- Placeholder when no image -->
                <view v-else class="tour-thumb-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#cbd5e1;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </view>
                <!-- Status badge on image -->
                <view class="tour-status-badge" :class="tour.status">
                  <text>{{ getStatusLabel(tour.status) }}</text>
                </view>
              </view>

              <!-- Right: info -->
              <view class="tour-info">
                <!-- Name -->
                <text class="tour-name">{{ tour.name }}</text>

                <!-- Region row -->
                <view class="tour-meta-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:#94a3b8;">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <text class="tour-meta-text">{{ tour.region || t('merchant.noRegion') }}</text>
                </view>

                <!-- Description (clamped to 1 line) -->
                <text v-if="tour.description" class="tour-desc">{{ tour.description }}</text>

                <!-- Divider -->
                <view class="tour-divider" />

                <!-- Footer: date + actions -->
                <view class="tour-footer">
                  <text class="tour-date">{{ formatDate(tour.createdAt) }}</text>
                  <view class="tour-actions">
                    <view class="action-btn edit-btn" @click.stop="editTour(tour)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </view>
                    <view class="action-btn delete-btn" @click.stop="confirmDeleteTour(tour)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- Floating Action Button -->
        <view class="fab" @click="addTour">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </view>
      </view>
    </view>
    <BottomTabBar />

    <!-- Create Tour Drawer -->
    <view v-if="showCreateModal" class="drawer-overlay" @click="closeCreateModal">
      <view class="drawer-content" @click.stop>
        <!-- Drag Handle -->
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ t('merchant.createTour') }}</text>
          <view class="drawer-close" @click="closeCreateModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>


        <view class="drawer-body">
          <view class="step-content">

            <!-- General Info -->
            <view class="field-category">
              <view class="category-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color: #ef4444;">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <text class="category-title">{{ t('merchant.generalInfo') }}</text>
              </view>

              <!-- Route Name (required) -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.tourName') }} *</text>
                <TextInput
                  v-model="newTour.name"
                  type="text"
                  :placeholder="t('merchant.tourNamePlaceholder')"
                />
                <text v-if="errors.name" class="form-error">{{ errors.name }}</text>
              </view>

              <!-- Region -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.destination') }}</text>
                <TextInput
                  v-model="newTour.region"
                  type="text"
                  :placeholder="t('merchant.destinationPlaceholder')"
                />
              </view>
            </view>

            <!-- Description -->
            <view class="field-category">
              <view class="category-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color: #f97316;">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <text class="category-title">{{ t('merchant.description') }}</text>
              </view>
              <view class="form-group">
                <text class="form-label">{{ t('merchant.detailedDescription') }}</text>
                <TextArea
                  v-model="newTour.description"
                  :placeholder="t('merchant.detailedDescriptionPlaceholder')"
                />
              </view>
            </view>

            <!-- Media -->
            <view class="field-category">
              <view class="category-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color: #eab308;">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <text class="category-title">{{ t('merchant.media') }}</text>
              </view>

              <!-- Cover Image -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.coverImageLabel') }}</text>
                <view v-if="newTour.coverImage" class="media-preview-wrap">
                  <img :src="newTour.coverImage" class="cover-preview-img" />
                  <view class="media-remove-btn" @click="newTour.coverImage = ''">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </view>
                </view>
                <view class="image-upload-btn" :class="{ uploading: uploadingCover }" @click="selectCoverImage">
                  <svg v-if="!uploadingCover" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <text>{{ uploadingCover ? t('merchant.uploading') : (newTour.coverImage ? t('merchant.changeImage') : t('merchant.uploadCoverImage')) }}</text>
                </view>
              </view>

              <!-- Gallery Images -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.galleryImagesLabel') }}</text>
                <view v-if="newTour.galleryImages.length > 0" class="gallery-grid">
                  <view
                    v-for="(img, idx) in newTour.galleryImages"
                    :key="idx"
                    class="gallery-thumb-wrap"
                  >
                    <img :src="img" class="gallery-thumb-img" />
                    <view class="media-remove-btn gallery-remove" @click="removeGalleryImage(idx)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </view>
                  </view>
                </view>
                <view class="image-upload-btn" :class="{ uploading: uploadingGallery }" @click="selectGalleryImages">
                  <svg v-if="!uploadingGallery" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <text>{{ uploadingGallery ? t('merchant.uploading') : t('merchant.uploadGalleryImages') }}</text>
                </view>
              </view>
            </view>

          </view>
        </view>

        <view class="drawer-footer">
          <view class="drawer-actions">
            <view class="btn btn-secondary" @click="closeCreateModal">
              <text>{{ t('merchant.cancel') }}</text>
            </view>
            <view class="drawer-actions-final">
              <view class="btn btn-secondary" @click="saveAsDraft" :class="{ loading: isSubmitting }">
                <text v-if="!isSubmitting">{{ t('merchant.saveAsDraft') }}</text>
                <text v-else>{{ t('merchant.saving') }}</text>
              </view>
              <view class="btn btn-primary" @click="submitForReview" :class="{ loading: isSubmitting }">
                <text v-if="!isSubmitting">{{ t('merchant.submitForReview') }}</text>
                <text v-else>{{ t('merchant.submitting') }}</text>
              </view>
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
import { getMerchantRoutes, createMerchantRoute, type MerchantRoute, type RouteStatus } from "../../api/merchant";
import { uploadLogo, getFileUrl, getFilePathFromUploadResponse } from "../../api/uploadLogo";

const { t } = useI18n();

// ── Tour display interface — mirrors MerchantRoute from the API ─────────────
interface Tour {
  id: string;
  name: string;
  region: string;
  description: string;
  coverImage: string;
  galleryImages: string[];
  status: "draft" | "online" | "paused";
  createdAt: string;
  updatedAt: string;
}

/** Map API RouteStatus → local display status */
function mapStatus(apiStatus: RouteStatus): Tour["status"] {
  switch (apiStatus) {
    case "PUBLISHED": return "online";
    case "PAUSED":    return "paused";
    case "DRAFT":
    default:          return "draft";
  }
}

/** Convert a MerchantRoute from the API into a Tour card object */
function routeToTour(r: MerchantRoute): Tour {
  return {
    id: r.id,
    name: r.name,
    region: r.region ?? "",
    description: r.description ?? "",
    coverImage: r.cover_image ?? "",
    galleryImages: r.image_urls ?? [],
    status: mapStatus(r.status),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// ── State ──────────────────────────────────────────────────────────────────
const tours = ref<Tour[]>([]);
const loadingTours = ref(false);
const loadError = ref("");

async function fetchTours() {
  loadingTours.value = true;
  loadError.value = "";
  try {
    const routes = await getMerchantRoutes();
    tours.value = routes.map(routeToTour);
  } catch (err: any) {
    loadError.value = err?.message ?? t("merchant.errorGeneric");
  } finally {
    loadingTours.value = false;
  }
}

onMounted(() => {
  fetchTours();
});

// ── Image upload state ──────────────────────────────────────────────────────
const uploadingCover = ref(false);
const uploadingGallery = ref(false);

/** Shared helper: fetch a tempFilePath blob → upload → return full URL */
async function uploadTempFile(tempFilePath: string): Promise<string> {
  // Convert uni temp path to a File (same pattern as profile.vue)
  const fileResponse = await fetch(tempFilePath);
  const blob = await fileResponse.blob();

  // Detect extension from path first, then MIME type
  const lastDot = tempFilePath.lastIndexOf(".");
  let extension = lastDot > 0 ? tempFilePath.substring(lastDot).toLowerCase() : "";
  const validImageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
  if (!extension || !validImageExts.includes(extension)) {
    const mimeMap: Record<string, string> = {
      "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png",
      "image/gif": ".gif", "image/webp": ".webp", "image/bmp": ".bmp",
    };
    extension = mimeMap[blob.type?.toLowerCase() ?? ""] || ".jpg";
  }

  const filename = `image${extension}`;
  const file = new File([blob], filename, { type: blob.type || "image/jpeg" });

  const res = await uploadLogo(file);
  const filePath = getFilePathFromUploadResponse(res);
  if (filePath) return getFileUrl(filePath);
  if (res.data?.url) return res.data.url as string;
  throw new Error("Upload response missing file path");
}

/** Pick & upload cover image — mirrors profile.vue selectLogo() */
function selectCoverImage() {
  if (uploadingCover.value) return;
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0];
      if (!tempFilePath) return;
      uploadingCover.value = true;
      try {
        newTour.value.coverImage = await uploadTempFile(tempFilePath);
      } catch (err: any) {
        uni.showToast({ title: err?.message ?? "Upload failed", icon: "none", duration: 2500 });
      } finally {
        uploadingCover.value = false;
      }
    },
  });
}

/** Pick & upload up to 9 gallery images — mirrors profile.vue pattern */
function selectGalleryImages() {
  if (uploadingGallery.value) return;
  uni.chooseImage({
    count: 9,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      const paths = res.tempFilePaths;
      if (!paths?.length) return;
      uploadingGallery.value = true;
      try {
        for (const tempFilePath of paths) {
          const url = await uploadTempFile(tempFilePath);
          if (url) newTour.value.galleryImages.push(url);
        }
      } catch (err: any) {
        uni.showToast({ title: err?.message ?? "Upload failed", icon: "none", duration: 2500 });
      } finally {
        uploadingGallery.value = false;
      }
    },
  });
}

/** Remove a gallery image by index */
function removeGalleryImage(index: number) {
  newTour.value.galleryImages.splice(index, 1);
}


const searchQuery = ref("");
const activeFilter = ref<"all" | "draft" | "online" | "paused">("all");
const showCreateModal = ref(false);
const isSubmitting = ref(false);

// Form state — fields match POST /api/merchant/routes exactly
const newTour = ref({
  name: "",
  region: "",
  description: "",
  coverImage: "",
  galleryImages: [] as string[],
});

const errors = ref<Record<string, string>>({});

async function saveAsDraft() {
  if (isSubmitting.value) return;
  if (!newTour.value.name.trim()) {
    errors.value.name = t("merchant.tourNameRequired");
    uni.showToast({ title: t("merchant.pleaseCompleteRequiredFields"), icon: "none", duration: 2000 });
    return;
  }
  isSubmitting.value = true;
  try {
    await createMerchantRoute({
      name: newTour.value.name.trim(),
      region: newTour.value.region.trim() || undefined,
      description: newTour.value.description.trim() || undefined,
      cover_image: newTour.value.coverImage || undefined,
      image_urls: newTour.value.galleryImages.length > 0 ? newTour.value.galleryImages : undefined,
      status: "DRAFT",
    });
    clearSavedDraft();
    showCreateModal.value = false;
    uni.showToast({ title: t("merchant.tourSavedAsDraft"), icon: "success", duration: 2000 });
    fetchTours();
  } catch (err: any) {
    uni.showToast({ title: err?.message ?? t("merchant.errorGeneric"), icon: "none", duration: 2500 });
  } finally {
    isSubmitting.value = false;
  }
}

async function submitForReview() {
  if (isSubmitting.value) return;
  if (!validateForm()) {
    uni.showToast({ title: t("merchant.pleaseCompleteRequiredFields"), icon: "none", duration: 2000 });
    return;
  }
  isSubmitting.value = true;
  try {
    await createMerchantRoute({
      name: newTour.value.name.trim(),
      region: newTour.value.region.trim() || undefined,
      description: newTour.value.description.trim() || undefined,
      cover_image: newTour.value.coverImage || undefined,
      image_urls: newTour.value.galleryImages.length > 0 ? newTour.value.galleryImages : undefined,
      status: "PUBLISHED",
    });
    clearSavedDraft();
    showCreateModal.value = false;
    uni.showToast({ title: t("merchant.tourSubmittedForReview"), icon: "success", duration: 2000 });
    fetchTours();
  } catch (err: any) {
    uni.showToast({ title: err?.message ?? t("merchant.errorGeneric"), icon: "none", duration: 2500 });
  } finally {
    isSubmitting.value = false;
  }
}


const filters = computed(() => [
  { value: "all" as const,     label: t("merchant.allTours") },
  { value: "online" as const,  label: t("merchant.onlineTours") },
  { value: "draft" as const,   label: t("merchant.draftTours") },
  { value: "paused" as const,  label: t("merchant.unpublishedTours") },
]);

const filteredTours = computed(() => {
  let result = tours.value;

  if (activeFilter.value !== "all") {
    result = result.filter(tour => tour.status === activeFilter.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(tour =>
      tour.name.toLowerCase().includes(query) ||
      tour.region.toLowerCase().includes(query) ||
      tour.description.toLowerCase().includes(query)
    );
  }

  return result;
});

function getStatusLabel(status: string): string {
  switch (status) {
    case "draft":   return t("merchant.tourStatusDraft");
    case "online":  return t("merchant.tourStatusOnline");
    case "paused":  return t("merchant.tourStatusUnpublished");
    default:        return status;
  }
}

/** Format an ISO date string to a short readable date */
function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function viewTourDetails(tour: Tour) {
  // Placeholder for viewing tour details
  uni.showToast({
    title: tour.name,
    icon: "none",
    duration: 2000
  });
}

function addTour() {
  loadSavedDraft();
  if (!localStorage.getItem("tour_draft")) {
    newTour.value = { name: "", region: "", description: "", coverImage: "", galleryImages: [] };
  }
  errors.value = {};
  showCreateModal.value = true;
}


function closeCreateModal() {
  autoSaveDraft();
  showCreateModal.value = false;
  errors.value = {};
}

// Auto-save unsent form data to localStorage so it survives a close
function autoSaveDraft() {
  try {
    localStorage.setItem("tour_draft", JSON.stringify({
      name: newTour.value.name,
      region: newTour.value.region,
      description: newTour.value.description,
      coverImage: newTour.value.coverImage,
      galleryImages: newTour.value.galleryImages,
    }));
  } catch (error) {
    console.error("Auto-save failed:", error);
  }
}

function loadSavedDraft() {
  try {
    const saved = localStorage.getItem("tour_draft");
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(newTour.value, data);
    }
  } catch (error) {
    console.error("Load saved draft failed:", error);
  }
}

function clearSavedDraft() {
  localStorage.removeItem("tour_draft");
}

function validateForm(): boolean {
  errors.value = {};
  if (!newTour.value.name.trim()) {
    errors.value.name = t("merchant.tourNameRequired");
  }
  return Object.keys(errors.value).length === 0;
}


function editTour(tour: Tour) {
  uni.showToast({
    title: `${t("merchant.editTour")}: ${tour.name}`,
    icon: "none",
    duration: 2000
  });
}

function confirmDeleteTour(tour: Tour) {
  uni.showModal({
    title: t("merchant.deleteTour"),
    content: t("merchant.deleteTourConfirm"),
    confirmText: t("merchant.confirm"),
    cancelText: t("merchant.cancel"),
    success: (res) => {
      if (res.confirm) {
        deleteTour(tour);
      }
    }
  });
}

function deleteTour(tour: Tour) {
  // Optimistic removal from local list
  const index = tours.value.findIndex(t => t.id === tour.id);
  if (index > -1) {
    tours.value.splice(index, 1);
  }
  uni.showToast({
    title: t("merchant.tourDeleted"),
    icon: "success",
    duration: 2000
  });
  // Re-sync with server
  fetchTours();
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.tours-page {
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
  .tours-page {
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

/* Search and Filter Bar */


/* Tours Container */
.tours-container {
  padding: 16px;
}

.tours-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* ── Tour Card — horizontal list style (like hotel listing) ─────────────── */
.tour-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  transition: box-shadow 0.2s, transform 0.15s;
  margin-bottom: 10px;
}

.tour-card:active {
  transform: scale(0.985);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Left thumbnail */
.tour-thumb-wrap {
  position: relative;
  width: 110px;
  min-width: 110px;
  flex-shrink: 0;
  background: #f1f5f9;
  overflow: hidden;
  border-radius: 12px 0 0 12px;
}

.tour-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tour-thumb-placeholder {
  width: 100%;
  height: 100%;
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

/* Status badge — bottom-left of thumbnail */
.tour-status-badge {
  position: absolute;
  bottom: 7px;
  left: 7px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.tour-status-badge text {
  font-family: inherit;
}

.tour-status-badge.draft {
  background: rgba(245, 158, 11, 0.92);
  color: #ffffff;
}

.tour-status-badge.online {
  background: rgba(22, 163, 74, 0.92);
  color: #ffffff;
}

.tour-status-badge.paused {
  background: rgba(71, 85, 105, 0.88);
  color: #ffffff;
}

/* Right info panel */
.tour-info {
  flex: 1;
  min-width: 0;
  padding: 11px 12px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tour-name {
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Region row */
.tour-meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 1px;
}

.tour-meta-text {
  font-size: 11.5px;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Description */
.tour-desc {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

/* Thin divider */
.tour-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 0 2px;
}

/* Footer */
.tour-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.tour-date {
  font-size: 10.5px;
  color: #94a3b8;
  font-weight: 400;
}

.tour-actions {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.edit-btn {
  background: #fff7ed;
  color: #f97316;
}

.edit-btn:active {
  background: #ffedd5;
}

.delete-btn {
  background: #fef2f2;
  color: #ef4444;
}

.delete-btn:active {
  background: #fee2e2;
}

.action-btn svg {
  width: 13px;
  height: 13px;
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

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #e09c07;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
  z-index: 10;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
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
}

/* Stepper UI */
.stepper-container {
  padding: 32rpx;
  background: #f8fafc;
  border-bottom: 1rpx solid #e2e8f0;
}

.stepper {
  display: flex;
  align-items: center;
  overflow-x: auto;
  gap: 8rpx;
  -webkit-overflow-scrolling: touch;
}

.stepper::-webkit-scrollbar {
  display: none;
}

.stepper-step {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.stepper-step-content {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stepper-step-label {
  font-size: 24rpx;
  font-weight: 500;
  color: #94a3b8;
  white-space: nowrap;
  transition: color 0.2s;
}

.stepper-step.active .stepper-step-label {
  color: #EF4444;
  font-weight: 600;
}

.stepper-step.completed .stepper-step-label {
  color: #EF4444;
}

.stepper-step.clickable {
  cursor: pointer;
}

.stepper-step.clickable:active {
  opacity: 0.7;
}

.progress-bar-container {
  margin-bottom: 24rpx;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background: #e2e8f0;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #EF4444 0%, #F97316 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-text {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
}

.auto-save-indicator {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: #64748b;
}

.auto-save-indicator.saved {
  color: #EF4444;
}

.auto-save-indicator svg {
  width: 28rpx;
  height: 28rpx;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.stepper-arrow {
  font-size: 24rpx;
  color: #cbd5e1;
  margin: 0 4rpx;
  flex-shrink: 0;
}

.stepper-step.active ~ .stepper-step .stepper-arrow {
  color: #cbd5e1;
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

.drawer-close svg {
  width: 40rpx;
  height: 40rpx;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 40rpx 32rpx;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
  height: 100%;
}

.step-content {
  animation: fadeIn 0.2s ease-out;
}

.step-header {
  margin-bottom: 40rpx;
}

.step-header-title {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.step-indicator {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #e2e8f0;
  flex-shrink: 0;
}

.step-indicator.active {
  background: #EF4444;
}

.step-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.step-subtitle {
  font-size: 26rpx;
  color: #64748b;
  margin-left: 40rpx;
  line-height: 1.5;
}

.field-category {
  margin-bottom: 48rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  border: 1rpx solid #e2e8f0;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.category-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.category-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

/* ── Media Upload UI ─────────────────────────────────────────────────────── */
.image-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.image-upload-btn:active {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.image-upload-btn.uploading {
  opacity: 0.7;
  pointer-events: none;
}

.image-upload-btn svg {
  flex-shrink: 0;
}

/* Cover image preview */
.media-preview-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px;
}

.cover-preview-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

/* Gallery grid */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.gallery-thumb-wrap {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.gallery-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Remove button overlay */
.media-remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.65);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 2;
  flex-shrink: 0;
}

.media-remove-btn:active {
  background: rgba(239, 68, 68, 0.85);
}

.gallery-remove {
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
}

/* Video preview row */
.video-preview-wrap {
  border-radius: 10px;
}

.video-preview-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #334155;
}

/* Keep old placeholder in case used elsewhere */
.image-upload-placeholder {
  padding: 40rpx;
  background: #f8fafc;
  border: 2rpx dashed #cbd5e1;
  border-radius: 12rpx;
  text-align: center;
  color: #94a3b8;
  font-size: 26rpx;
}

/* Itinerary Builder Styles */
.itinerary-days {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.itinerary-day-card {
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  overflow: hidden;
  transition: all 0.2s;
}

.day-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background: #f8fafc;
  cursor: pointer;
  transition: background 0.2s;
}

.day-card-header:active {
  background: #f1f5f9;
}

.day-header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.day-number {
  font-size: 28rpx;
  font-weight: 600;
  color: #EF4444;
  min-width: 80rpx;
}

.day-title-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #1e293b;
  flex: 1;
}

.day-header-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.day-action-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  color: #64748b;
  background: #ffffff;
  transition: all 0.2s;
}

.day-action-btn:active {
  background: #f1f5f9;
  color: #0f172a;
}

.day-action-btn svg {
  width: 32rpx;
  height: 32rpx;
}

.day-chevron {
  width: 40rpx;
  height: 40rpx;
  color: #64748b;
  transition: transform 0.2s;
}

.day-chevron.expanded {
  transform: rotate(180deg);
}

.day-card-content {
  padding: 32rpx;
  border-top: 1rpx solid #e2e8f0;
}

.day-section {
  margin-bottom: 40rpx;
  padding-bottom: 40rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.day-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.day-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.day-section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 24rpx;
  display: block;
}

.day-section-header .day-section-title {
  margin-bottom: 0;
}

.btn-small {
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  border-radius: 8rpx;
  background: #EF4444;
  color: #ffffff;
}

.activity-item {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.activity-item:last-child {
  margin-bottom: 0;
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.activity-number {
  font-size: 26rpx;
  font-weight: 600;
  color: #475569;
}

.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.toggle-switch {
  width: 88rpx;
  height: 48rpx;
  background: #cbd5e1;
  border-radius: 24rpx;
  position: relative;
  transition: background 0.2s;
  cursor: pointer;
}

.toggle-switch.active {
  background: #EF4444;
}

.toggle-slider {
  width: 40rpx;
  height: 40rpx;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.2s;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(40rpx);
}

.star-rating {
  display: flex;
  gap: 8rpx;
  margin-top: 12rpx;
}

.star {
  color: #cbd5e1;
  cursor: pointer;
  transition: color 0.2s;
}

.star.active {
  color: #fbbf24;
}

.meals-group {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.meal-toggle {
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 26rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 2rpx solid transparent;
}

.meal-toggle.active {
  background: #EF4444;
  color: #ffffff;
  border-color: #EF4444;
}

.transport-options {
  display: flex;
  gap: 16rpx;
  margin-top: 12rpx;
}

.transport-option {
  flex: 1;
  padding: 20rpx;
  border-radius: 8rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 26rpx;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2rpx solid transparent;
}

.transport-option.active {
  background: #EF4444;
  color: #ffffff;
  border-color: #EF4444;
}

.add-day-section {
  margin-top: 32rpx;
  display: flex;
  justify-content: center;
}

.btn-add-day {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 48rpx;
  background: #f1f5f9;
  color: #EF4444;
  border: 2rpx dashed #cbd5e1;
}

.btn-add-day svg {
  width: 40rpx;
  height: 40rpx;
}

/* Pricing Configuration Styles */
.tier-pricing-list,
.seasonal-pricing-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.tier-item,
.seasonal-item {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1rpx solid #e2e8f0;
}

.tier-item-header,
.seasonal-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.tier-item-title,
.seasonal-item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.commission-display {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 32rpx;
  border: 1rpx solid #e2e8f0;
}

.commission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
}

.commission-item:last-child {
  border-bottom: none;
}

.commission-item.commission-total {
  margin-top: 16rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #EF4444;
  border-bottom: none;
}

.commission-label {
  font-size: 28rpx;
  color: #475569;
  font-weight: 500;
}

.commission-value {
  font-size: 28rpx;
  font-weight: 600;
}

.commission-percent {
  color: #ef4444;
}

.commission-positive {
  color: #EF4444;
}

.commission-negative {
  color: #ef4444;
}

/* Schedule & Inventory Styles */
.category-subtitle {
  font-size: 26rpx;
  color: #64748b;
  margin-bottom: 24rpx;
  display: block;
}

.departure-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.departure-item {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1rpx solid #e2e8f0;
}

.departure-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.departure-item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.readonly-field {
  padding: 24rpx 28rpx;
  background: #f1f5f9;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 30rpx;
  color: #475569;
  font-weight: 500;
}

/* Review & Submit Styles */
.review-summary-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.review-summary-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #f8fafc;
  border-radius: 8rpx;
}

.review-summary-check {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ffffff;
}

.review-summary-check.valid {
  background: #EF4444;
}

.review-summary-label {
  font-size: 28rpx;
  color: #1e293b;
}

.validation-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.validation-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  border-radius: 8rpx;
  background: #f8fafc;
}

.validation-item.valid {
  background: #f0fdf4;
}

.validation-item.invalid {
  background: #fef2f2;
}

.validation-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.validation-item.valid .validation-icon {
  color: #EF4444;
}

.validation-item.invalid .validation-icon {
  color: #ef4444;
}

.validation-label {
  font-size: 28rpx;
  color: #1e293b;
}

.status-flow-box {
  background: #1e293b;
  border-radius: 12rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.status-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.status-badge {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #ffffff;
}

.status-draft {
  background: #EF4444;
}

.status-submitted {
  background: #EF4444;
}

.status-review {
  background: #f59e0b;
}

.status-arrow {
  font-size: 32rpx;
  color: #64748b;
}

.status-note {
  font-size: 24rpx;
  color: #64748b;
  font-style: italic;
}

.drawer-actions-final {
  display: flex;
  gap: 24rpx;
  width: 100%;
}

.drawer-actions-final .btn {
  flex: 1;
}

.btn.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.step-placeholder {
  padding: 40rpx 0;
  text-align: center;
  color: #94a3b8;
  font-size: 28rpx;
}

.review-section {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.review-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.review-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.review-value {
  font-size: 28rpx;
  color: #1e293b;
  text-align: right;
  flex: 1;
  word-break: break-word;
}

.drawer-subtitle {
  font-size: 28rpx;
  color: #64748b;
  margin-bottom: 32rpx;
  display: block;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 32rpx;
}

.form-group:last-of-type {
  margin-bottom: 40rpx;
}

.form-group-half {
  flex: 1;
}

.form-group-third {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
  margin-bottom: 12rpx;
}

/* Match profile page input styles */
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
  pointer-events: auto !important;
  -webkit-user-select: text !important;
  user-select: text !important;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.drawer-body :deep(.text-input-wrap input):focus,
.drawer-body :deep(.text-input-native):focus,
.drawer-body :deep(.textarea-wrap textarea):focus,
.drawer-body :deep(.textarea-native):focus {
  outline: none;
  border-color: #EF4444;
}

.drawer-body :deep(.textarea-wrap textarea),
.drawer-body :deep(.textarea-native) {
  min-height: 160rpx;
  resize: none;
}

.form-error {
  display: block;
  font-size: 24rpx;
  color: #ef4444;
  margin-top: 12rpx;
  padding: 12rpx 16rpx;
  background: #fef2f2;
  border-left: 4rpx solid #ef4444;
  border-radius: 4rpx;
}

.gradient-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.gradient-option {
  aspect-ratio: 1;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.gradient-option.active {
  border-color: #EF4444;
  box-shadow: 0 0 0 6rpx rgba(14, 165, 233, 0.1);
}

.gradient-check {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  color: #ffffff;
}

.drawer-footer {
  padding: 32rpx;
  border-top: 1rpx solid #e2e8f0;
  background: #ffffff;
}

.drawer-actions {
  display: flex;
  gap: 24rpx;
}

.btn {
  flex: 1;
  padding: 30rpx 32rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
  letter-spacing: 0.5rpx;
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

.btn-primary:active {
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

@media (min-width: 768px) {
  .drawer-content {
    height: 85vh;
    max-height: 85vh;
    border-radius: 24px 24px 0 0;
  }
}
</style>