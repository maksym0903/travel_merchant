<template>
  <view class="hotels-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('merchant.hotelsTitle')" />
      <view class="phone-inner">
        <!-- Search and Filter Bar -->
        <SearchBar
          v-model="searchQuery"
          :placeholder="t('merchant.searchHotels') || 'Search hotels...'"
          :filters="filters"
          v-model:activeFilter="activeFilter"
          :background-image="'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop&q=80&auto=format'"
        />

        <!-- Hotels List -->
        <view class="hotels-container">
          <!-- Loading state -->
          <view v-if="loadingHotels" class="empty-state">
            <text class="empty-title">{{ t('merchant.loading') }}</text>
          </view>

          <!-- Error state -->
          <view v-else-if="loadError" class="empty-state">
            <text class="empty-title">{{ loadError }}</text>
            <view class="btn btn-secondary" style="margin-top:12px;" @click="fetchHotels()">
              <text>{{ t('merchant.retry') }}</text>
            </view>
          </view>

          <!-- Empty state -->
          <view v-else-if="filteredHotels.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <text class="empty-title">{{ t('merchant.noHotels') }}</text>
            <text class="empty-desc">{{ t('merchant.noHotelsDesc') }}</text>
          </view>

          <view v-else class="hotels-grid">
            <view
              v-for="hotel in filteredHotels"
              :key="hotel.id"
              class="hotel-card"
              @click="viewHotelDetails(hotel)"
            >
              <!-- Left thumbnail -->
              <view class="hotel-thumb-wrap">
                <img
                  v-if="hotel.imageUrl"
                  :src="hotel.imageUrl"
                  class="hotel-thumb-img"
                />
                <view v-else class="hotel-thumb-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#cbd5e1;">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </view>
                <!-- Status badge -->
                <view class="hotel-status-badge" :class="hotel.status">
                  <text>{{ getStatusLabel(hotel.status) }}</text>
                </view>
              </view>

              <!-- Right info -->
              <view class="hotel-info">
                <!-- Name -->
                <text class="hotel-name">{{ hotel.name }}</text>

                <!-- City row -->
                <view class="hotel-meta-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:#94a3b8;">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <text class="hotel-meta-text">{{ hotel.city }}</text>
                  <!-- Star rating -->
                  <view v-if="hotel.starRating > 0" class="hotel-stars">
                    <text v-for="s in hotel.starRating" :key="s" class="star-icon">★</text>
                  </view>
                </view>

                <!-- Description -->
                <text v-if="hotel.description" class="hotel-desc">{{ hotel.description }}</text>

                <!-- Divider -->
                <view class="hotel-divider" />

                <!-- Footer: price + actions -->
                <view class="hotel-footer">
                  <view class="hotel-price">
                    <text class="price-symbol">¥</text>
                    <text class="price-amount">{{ Math.round(hotel.pricePerNight) }}</text>
                    <text class="price-suffix">/{{ t('merchant.night') || 'night' }}</text>
                  </view>
                  <view class="hotel-actions">
                    <view class="action-btn edit-btn" @click.stop="editHotel(hotel)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </view>
                    <view class="action-btn delete-btn" @click.stop="confirmDeleteHotel(hotel)">
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
        <view class="fab" @click="addHotel">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </view>
      </view>
    </view>
    <BottomTabBar />

    <!-- Create Hotel Drawer -->
    <view v-if="showCreateDrawer" class="drawer-overlay" @click="closeCreateDrawer">
      <view class="drawer-content" @click.stop>
        <!-- Drag Handle -->
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ t('merchant.createHotel') || 'Create Hotel' }}</text>
          <view class="drawer-close" @click="closeCreateDrawer">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color:#ef4444;">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <text class="category-title">{{ t('merchant.generalInfo') }}</text>
              </view>

              <!-- Hotel Name (required) -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.hotelName') || 'Hotel Name' }} *</text>
                <TextInput
                  v-model="newHotel.name"
                  type="text"
                  :placeholder="t('merchant.hotelNamePlaceholder') || 'e.g. Grand Hyatt Beijing'"
                />
                <text v-if="errors.name" class="form-error">{{ errors.name }}</text>
              </view>

              <!-- City (required) -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.city') || 'City' }} *</text>
                <TextInput
                  v-model="newHotel.city"
                  type="text"
                  :placeholder="t('merchant.cityPlaceholder') || 'e.g. Beijing'"
                />
                <text v-if="errors.city" class="form-error">{{ errors.city }}</text>
              </view>

              <!-- Address -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.addressLabel') || 'Address' }}</text>
                <TextInput
                  v-model="newHotel.address"
                  type="text"
                  :placeholder="t('merchant.addressPlaceholder') || 'Street address (optional)'"
                />
              </view>

              <!-- Star Rating -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.starRating') || 'Star Rating' }}</text>
                <view class="star-rating-select">
                  <view
                    v-for="rating in [1, 2, 3, 4, 5]"
                    :key="rating"
                    class="star-option"
                    :class="{ active: newHotel.starRating === rating }"
                    @click="newHotel.starRating = (newHotel.starRating === rating ? 0 : rating)"
                  >
                    <text>{{ rating }}★</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- Pricing (required) -->
            <view class="field-category">
              <view class="category-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color:#f97316;">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <text class="category-title">{{ t('merchant.pricing') || 'Pricing' }}</text>
              </view>

              <!-- Price per night (required) -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.pricePerNight') || 'Price per Night (¥)' }} *</text>
                <TextInput
                  :modelValue="newHotel.pricePerNight > 0 ? newHotel.pricePerNight.toString() : ''"
                  type="text"
                  :placeholder="t('merchant.pricePerNightPlaceholder') || 'e.g. 299'"
                  @update:modelValue="(val) => newHotel.pricePerNight = parseFloat(val) || 0"
                />
                <text v-if="errors.pricePerNight" class="form-error">{{ errors.pricePerNight }}</text>
              </view>
            </view>

            <!-- Description -->
            <view class="field-category">
              <view class="category-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color:#eab308;">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <text class="category-title">{{ t('merchant.description') }}</text>
              </view>
              <view class="form-group">
                <text class="form-label">{{ t('merchant.detailedDescription') || 'Description' }}</text>
                <TextArea
                  v-model="newHotel.description"
                  :placeholder="t('merchant.detailedDescriptionPlaceholder') || 'Describe your hotel...'"
                />
              </view>
            </view>

            <!-- Amenities -->
            <view class="field-category">
              <view class="category-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color:#6366f1;">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <text class="category-title">{{ t('merchant.amenities') || 'Amenities' }}</text>
              </view>
              <view class="amenities-grid">
                <view
                  v-for="item in availableAmenities"
                  :key="item.key"
                  class="amenity-item"
                  :class="{ active: newHotel.amenities.includes(item.key) }"
                  @click="toggleAmenity(item.key)"
                >
                  <text>{{ item.label }}</text>
                </view>
              </view>
            </view>

            <!-- Media -->
            <view class="field-category">
              <view class="category-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color:#ec4899;">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <text class="category-title">{{ t('merchant.media') }}</text>
              </view>

              <!-- Gallery Images -->
              <view class="form-group">
                <text class="form-label">{{ t('merchant.galleryImagesLabel') || 'Photos' }}</text>
                <view v-if="newHotel.galleryImages.length > 0" class="gallery-grid">
                  <view
                    v-for="(img, idx) in newHotel.galleryImages"
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
            <view class="btn btn-secondary" @click="closeCreateDrawer">
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
  getMerchantHotels,
  createMerchantHotel,
  type MerchantHotel,
  type HotelStatus,
} from "../../api/merchant";
import { uploadLogo, getFileUrl, getFilePathFromUploadResponse } from "../../api/uploadLogo";

const { t } = useI18n();

const confirmDrawer = useConfirmDrawer();
const confirmDrawerTone = ref<"primary" | "danger">("danger");

// ── Hotel display interface — mirrors MerchantHotel from the API ─────────────
interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  starRating: number;
  pricePerNight: number;
  description: string;
  amenities: string[];
  imageUrl: string;
  galleryImages: string[];
  status: "draft" | "online" | "paused";
  createdAt: string;
  updatedAt: string;
}

/** Map API HotelStatus → local display status */
function mapStatus(apiStatus: HotelStatus): Hotel["status"] {
  switch (apiStatus) {
    case "PUBLISHED": return "online";
    case "PAUSED":    return "paused";
    case "DRAFT":
    default:          return "draft";
  }
}

/** Convert a MerchantHotel from the API into a Hotel card object */
function apiHotelToHotel(h: MerchantHotel): Hotel {
  return {
    id: h.id,
    name: h.name,
    city: h.city,
    address: h.address ?? "",
    starRating: h.star_rating ?? 0,
    pricePerNight: h.price_per_night,
    description: h.description ?? "",
    amenities: h.amenities ?? [],
    imageUrl: h.image_urls?.[0] ?? "",
    galleryImages: h.image_urls ?? [],
    status: mapStatus(h.status),
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  };
}

// ── State ──────────────────────────────────────────────────────────────────
const hotels = ref<Hotel[]>([]);
const loadingHotels = ref(false);
const loadError = ref("");

async function fetchHotels() {
  loadingHotels.value = true;
  loadError.value = "";
  try {
    const apiHotels = await getMerchantHotels();
    hotels.value = apiHotels.map(apiHotelToHotel);
  } catch (err: any) {
    loadError.value = err?.message ?? t("merchant.errorGeneric");
  } finally {
    loadingHotels.value = false;
  }
}

onMounted(() => {
  fetchHotels();
});

// ── Image upload ────────────────────────────────────────────────────────────
const uploadingGallery = ref(false);

async function uploadTempFile(tempFilePath: string): Promise<string> {
  const fileResponse = await fetch(tempFilePath);
  const blob = await fileResponse.blob();
  const lastDot = tempFilePath.lastIndexOf(".");
  let extension = lastDot > 0 ? tempFilePath.substring(lastDot).toLowerCase() : "";
  const validImageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  if (!extension || !validImageExts.includes(extension)) {
    const mimeMap: Record<string, string> = {
      "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png",
      "image/gif": ".gif", "image/webp": ".webp", "image/bmp": ".bmp",
    };
    extension = mimeMap[blob.type?.toLowerCase() ?? ""] || ".jpg";
  }
  const file = new File([blob], `image${extension}`, { type: blob.type || "image/jpeg" });
  const res = await uploadLogo(file);
  const filePath = getFilePathFromUploadResponse(res);
  if (filePath) return getFileUrl(filePath);
  if (res.data?.url) return res.data.url as string;
  throw new Error("Upload response missing file path");
}

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
          if (url) newHotel.value.galleryImages.push(url);
        }
      } catch (err: any) {
        uni.showToast({ title: err?.message ?? "Upload failed", icon: "none", duration: 2500 });
      } finally {
        uploadingGallery.value = false;
      }
    },
  });
}

function removeGalleryImage(index: number) {
  newHotel.value.galleryImages.splice(index, 1);
}

// ── Available amenities ─────────────────────────────────────────────────────
const availableAmenities = [
  { key: "wifi",        label: "Free WiFi" },
  { key: "pool",        label: "Pool" },
  { key: "gym",         label: "Gym" },
  { key: "parking",     label: "Parking" },
  { key: "restaurant",  label: "Restaurant" },
  { key: "spa",         label: "Spa" },
  { key: "bar",         label: "Bar" },
  { key: "laundry",     label: "Laundry" },
];

function toggleAmenity(key: string) {
  const idx = newHotel.value.amenities.indexOf(key);
  if (idx > -1) newHotel.value.amenities.splice(idx, 1);
  else newHotel.value.amenities.push(key);
}

// ── Form state ──────────────────────────────────────────────────────────────
const searchQuery = ref("");
const activeFilter = ref<"all" | "draft" | "online" | "paused">("all");
const showCreateDrawer = ref(false);
const isSubmitting = ref(false);

const newHotel = ref({
  name: "",
  city: "",
  address: "",
  starRating: 0,
  pricePerNight: 0,
  description: "",
  amenities: [] as string[],
  galleryImages: [] as string[],
});

const errors = ref<Record<string, string>>({});

function validateForm(): boolean {
  errors.value = {};
  if (!newHotel.value.name.trim()) {
    errors.value.name = t("merchant.hotelNameRequired") || "Hotel name is required";
  }
  if (!newHotel.value.city.trim()) {
    errors.value.city = t("merchant.cityRequired") || "City is required";
  }
  if (newHotel.value.pricePerNight < 0) {
    errors.value.pricePerNight = "Price must be >= 0";
  }
  return Object.keys(errors.value).length === 0;
}

async function saveAsDraft() {
  if (isSubmitting.value) return;
  if (!newHotel.value.name.trim()) {
    errors.value.name = t("merchant.hotelNameRequired") || "Hotel name is required";
    uni.showToast({ title: t("merchant.pleaseCompleteRequiredFields"), icon: "none", duration: 2000 });
    return;
  }
  if (!newHotel.value.city.trim()) {
    errors.value.city = t("merchant.cityRequired") || "City is required";
    uni.showToast({ title: t("merchant.pleaseCompleteRequiredFields"), icon: "none", duration: 2000 });
    return;
  }
  isSubmitting.value = true;
  try {
    await createMerchantHotel({
      name: newHotel.value.name.trim(),
      city: newHotel.value.city.trim(),
      price_per_night: newHotel.value.pricePerNight >= 0 ? newHotel.value.pricePerNight : 0,
      address: newHotel.value.address.trim() || undefined,
      star_rating: newHotel.value.starRating > 0 ? newHotel.value.starRating : undefined,
      description: newHotel.value.description.trim() || undefined,
      amenities: newHotel.value.amenities.length > 0 ? newHotel.value.amenities : undefined,
      image_urls: newHotel.value.galleryImages.length > 0 ? newHotel.value.galleryImages : undefined,
      status: "DRAFT",
    });
    clearSavedDraft();
    showCreateDrawer.value = false;
    uni.showToast({ title: t("merchant.hotelSavedAsDraft"), icon: "success", duration: 2000 });
    fetchHotels();
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
    await createMerchantHotel({
      name: newHotel.value.name.trim(),
      city: newHotel.value.city.trim(),
      price_per_night: newHotel.value.pricePerNight >= 0 ? newHotel.value.pricePerNight : 0,
      address: newHotel.value.address.trim() || undefined,
      star_rating: newHotel.value.starRating > 0 ? newHotel.value.starRating : undefined,
      description: newHotel.value.description.trim() || undefined,
      amenities: newHotel.value.amenities.length > 0 ? newHotel.value.amenities : undefined,
      image_urls: newHotel.value.galleryImages.length > 0 ? newHotel.value.galleryImages : undefined,
      status: "PUBLISHED",
    });
    clearSavedDraft();
    showCreateDrawer.value = false;
    uni.showToast({ title: t("merchant.hotelSubmittedForReview"), icon: "success", duration: 2000 });
    fetchHotels();
  } catch (err: any) {
    uni.showToast({ title: err?.message ?? t("merchant.errorGeneric"), icon: "none", duration: 2500 });
  } finally {
    isSubmitting.value = false;
  }
}

// ── Draft persistence ───────────────────────────────────────────────────────
function autoSaveDraft() {
  try {
    localStorage.setItem("hotel_draft", JSON.stringify({
      name: newHotel.value.name,
      city: newHotel.value.city,
      address: newHotel.value.address,
      starRating: newHotel.value.starRating,
      pricePerNight: newHotel.value.pricePerNight,
      description: newHotel.value.description,
      amenities: newHotel.value.amenities,
      galleryImages: newHotel.value.galleryImages,
    }));
  } catch (e) { /* ignore */ }
}

function loadSavedDraft() {
  try {
    const saved = localStorage.getItem("hotel_draft");
    if (saved) Object.assign(newHotel.value, JSON.parse(saved));
  } catch (e) { /* ignore */ }
}

function clearSavedDraft() {
  localStorage.removeItem("hotel_draft");
}

// ── Filters & search ────────────────────────────────────────────────────────
const filters = computed(() => [
  { value: "all" as const,    label: t("merchant.allHotels") },
  { value: "online" as const, label: t("merchant.onlineTours") },
  { value: "draft" as const,  label: t("merchant.draftTours") },
  { value: "paused" as const, label: t("merchant.unpublishedTours") },
]);

const filteredHotels = computed(() => {
  let result = hotels.value;
  if (activeFilter.value !== "all") {
    result = result.filter(h => h.status === activeFilter.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q)
    );
  }
  return result;
});

function getStatusLabel(status: string): string {
  switch (status) {
    case "draft":  return t("merchant.tourStatusDraft");
    case "online": return t("merchant.tourStatusOnline");
    case "paused": return t("merchant.tourStatusUnpublished");
    default:       return status;
  }
}

// ── Actions ─────────────────────────────────────────────────────────────────
function viewHotelDetails(hotel: Hotel) {
  uni.showToast({ title: hotel.name, icon: "none", duration: 2000 });
}

function addHotel() {
  loadSavedDraft();
  if (!localStorage.getItem("hotel_draft")) {
    newHotel.value = {
      name: "", city: "", address: "", starRating: 0,
      pricePerNight: 0, description: "", amenities: [], galleryImages: [],
    };
  }
  errors.value = {};
  showCreateDrawer.value = true;
}

function closeCreateDrawer() {
  autoSaveDraft();
  showCreateDrawer.value = false;
  errors.value = {};
}

function editHotel(hotel: Hotel) {
  uni.showToast({ title: `${t("merchant.editHotel") || "Edit"}: ${hotel.name}`, icon: "none", duration: 2000 });
}

async function confirmDeleteHotel(hotel: Hotel) {
  confirmDrawerTone.value = "danger";
  const ok = await confirmDrawer.request({
    title: t("merchant.deleteHotel"),
    content: t("merchant.deleteHotelConfirm", { name: hotel.name }),
    confirmText: t("merchant.confirm"),
    cancelText: t("merchant.cancel"),
  });
  if (!ok) return;
  deleteHotel(hotel);
}

function deleteHotel(hotel: Hotel) {
  const idx = hotels.value.findIndex(h => h.id === hotel.id);
  if (idx > -1) hotels.value.splice(idx, 1);
  uni.showToast({ title: t("merchant.hotelDeleted"), icon: "success", duration: 2000 });
  fetchHotels();
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.hotels-page {
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
  .hotels-page {
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

/* Hotels Container */
.hotels-container {
  padding: 16px;
}

.hotels-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* ── Hotel Card — horizontal list style ─────────────────────────────────── */
.hotel-card {
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

.hotel-card:active {
  transform: scale(0.985);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Left thumbnail */
.hotel-thumb-wrap {
  position: relative;
  width: 110px;
  min-width: 110px;
  flex-shrink: 0;
  background: #f1f5f9;
  overflow: hidden;
  border-radius: 12px 0 0 12px;
}

.hotel-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hotel-thumb-placeholder {
  width: 100%;
  height: 100%;
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

/* Status badge — bottom-left of thumbnail */
.hotel-status-badge {
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

.hotel-status-badge text {
  font-family: inherit;
}

.hotel-status-badge.draft {
  background: rgba(245, 158, 11, 0.92);
  color: #ffffff;
}

.hotel-status-badge.online {
  background: rgba(22, 163, 74, 0.92);
  color: #ffffff;
}

.hotel-status-badge.paused {
  background: rgba(71, 85, 105, 0.88);
  color: #ffffff;
}

/* Right info panel */
.hotel-info {
  flex: 1;
  min-width: 0;
  padding: 11px 12px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hotel-name {
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* City + stars row */
.hotel-meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 1px;
}

.hotel-meta-text {
  font-size: 11.5px;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hotel-stars {
  display: flex;
  gap: 1px;
  margin-left: 4px;
}

.star-icon {
  font-size: 10px;
  color: #f59e0b;
  line-height: 1;
}

/* Description */
.hotel-desc {
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
.hotel-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 0 2px;
}

/* Footer */
.hotel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.hotel-price {
  display: flex;
  align-items: baseline;
  color: #ef4444;
  line-height: 1;
  gap: 1px;
}

.price-symbol {
  font-size: 12px;
  font-weight: 600;
}

.price-amount {
  font-size: 17px;
  font-weight: 700;
}

.price-suffix {
  font-size: 11px;
  font-weight: 400;
  color: #94a3b8;
  margin-left: 2px;
}

.hotel-actions {
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

/* Drawer */
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
  pointer-events: auto !important;
  position: relative;
  z-index: 1001;
  touch-action: pan-y;
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

/* Star rating selector */
.star-rating-select {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
  flex-wrap: wrap;
}

.star-option {
  flex: 1;
  min-width: 52rpx;
  padding: 14rpx 10rpx;
  border-radius: 8rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 24rpx;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2rpx solid transparent;
}

.star-option.active {
  background: #f59e0b;
  color: #ffffff;
  border-color: #f59e0b;
}

.star-option:active {
  opacity: 0.8;
}

/* Amenities grid */
.amenities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.amenity-item {
  padding: 16rpx 20rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 10rpx;
  text-align: center;
  font-size: 26rpx;
  color: #475569;
  transition: all 0.2s;
  cursor: pointer;
}

.amenity-item.active {
  background: #EF4444;
  border-color: #EF4444;
  color: #ffffff;
}

.amenity-item:active {
  opacity: 0.8;
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

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Form */
.form-group {
  margin-bottom: 32rpx;
}

.form-group:last-of-type {
  margin-bottom: 40rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
  margin-bottom: 12rpx;
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

/* Footer / Buttons */
.drawer-footer {
  padding: 32rpx;
  border-top: 1rpx solid #e2e8f0;
  background: #ffffff;
}

.drawer-actions {
  display: flex;
  gap: 24rpx;
}

.drawer-actions-final {
  display: flex;
  gap: 24rpx;
  width: 100%;
}

.drawer-actions-final .btn {
  flex: 1;
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

.btn-primary.loading,
.btn.disabled {
  opacity: 0.5;
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
