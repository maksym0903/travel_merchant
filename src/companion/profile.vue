<template>
  <view class="companion-profile-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('companion.profile.title')" />
      <view class="phone-inner">
        <!-- Loading -->
        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ t("merchant.loading") }}</text>
        </view>

        <view v-else-if="!profile" class="loading-container">
          <text class="loading-text">{{ t("companion.profile.noProfile") }}</text>
          <view class="btn btn-primary" style="margin-top:24rpx;max-width:240rpx" @click="openEditProfile">
            <text>{{ t("companion.profile.createProfile") }}</text>
          </view>
        </view>

        <view v-else class="profile-content">

          <!-- ── Hero card ──────────────────────────────────────────── -->
          <view class="hero-card">
            <!-- Avatar -->
            <view class="avatar-wrap" @click="openEditProfile">
              <view class="avatar">
                <img v-if="profile.avatar_url" :src="profile.avatar_url" class="avatar-img" />
                <text v-else class="avatar-initial">{{ avatarInitial }}</text>
              </view>
              <view class="avatar-edit-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </view>
            </view>
            <!-- Name + meta -->
            <view class="hero-info">
              <view class="hero-name-row">
                <text class="hero-name">{{ profile.display_name || t("companion.profile.unnamed") }}</text>
                <view class="status-badge" :class="statusBadgeClass">
                  <text class="badge-text">{{ statusLabel }}</text>
                </view>
              </view>
              <text v-if="profile.location" class="hero-location">📍 {{ profile.location }}</text>
              <!-- Language chips -->
              <view class="hero-tags" v-if="profile.languages.length > 0">
                <view v-for="lang in profile.languages" :key="lang" class="lang-tag">
                  <text>{{ lang }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- ── Stats row ──────────────────────────────────────────── -->
          <view class="stats-row">
            <view class="stat-item">
              <text class="stat-value">{{ profile.experience_years ?? 0 }}</text>
              <text class="stat-label">{{ t("companion.profile.yearsExp") }}</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-value">¥{{ profile.hourly_rate ?? 0 }}</text>
              <text class="stat-label">{{ t("companion.profile.hourlyRate") }}</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-value">{{ profile.daily_rate ? `¥${profile.daily_rate}` : "—" }}</text>
              <text class="stat-label">{{ t("companion.profile.dailyRate") }}</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-value">{{ profile.skills.length }}</text>
              <text class="stat-label">{{ t("companion.profile.skills") }}</text>
            </view>
          </view>

          <!-- ── About section ─────────────────────────────────────── -->
          <view class="section">
            <view class="section-header">
              <text class="section-title">{{ t("companion.profile.about") }}</text>
              <view class="section-action" @click="openEditProfile">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <text>{{ t("companion.profile.editProfile") }}</text>
              </view>
            </view>
            <view class="info-card">
              <!-- Bio -->
              <view class="info-row bio-row" v-if="profile.bio">
                <text class="info-label">{{ t("companion.profile.bio") }}</text>
                <text class="info-value bio-value">{{ profile.bio }}</text>
              </view>
              <!-- Contact Email -->
              <view class="info-row" v-if="profile.contact_email">
                <text class="info-label">{{ t("companion.profile.contactEmail") }}</text>
                <text class="info-value">{{ profile.contact_email }}</text>
              </view>
              <!-- Service Cities -->
              <view class="info-row" v-if="profile.service_cities.length > 0">
                <text class="info-label">{{ t("companion.profile.serviceCities") }}</text>
                <view class="chip-wrap">
                  <view v-for="city in profile.service_cities" :key="city" class="city-chip">
                    <text>{{ city }}</text>
                  </view>
                </view>
              </view>
              <!-- Empty state -->
              <view v-if="!profile.bio && !profile.contact_email && profile.service_cities.length === 0" class="info-empty">
                <text class="info-empty-text">{{ t("companion.profile.tapToEdit") }}</text>
              </view>
            </view>
          </view>

          <!-- ── Skills ─────────────────────────────────────────────── -->
          <view class="section" v-if="profile.skills.length > 0">
            <view class="section-header">
              <text class="section-title">{{ t("companion.profile.skills") }}</text>
            </view>
            <view class="chip-group">
              <view v-for="skill in profile.skills" :key="skill" class="skill-chip">
                <text>{{ skill.replace(/_/g, " ") }}</text>
              </view>
            </view>
          </view>

          <!-- ── Interests ──────────────────────────────────────────── -->
          <view class="section" v-if="profile.interests.length > 0">
            <view class="section-header">
              <text class="section-title">{{ t("companion.profile.interests") }}</text>
            </view>
            <view class="chip-group">
              <view v-for="interest in profile.interests" :key="interest" class="interest-chip">
                <text>{{ interest.replace(/_/g, " ") }}</text>
              </view>
            </view>
          </view>

          <!-- ── Portfolio ──────────────────────────────────────────── -->
          <view class="section" v-if="profile.portfolio_urls.length > 0">
            <view class="section-header">
              <text class="section-title">{{ t("companion.profile.portfolio") }}</text>
            </view>
            <view class="portfolio-grid">
              <view v-for="(url, idx) in profile.portfolio_urls" :key="idx" class="portfolio-item">
                <img :src="url" class="portfolio-img" />
              </view>
            </view>
          </view>

          <!-- ── Settings list ──────────────────────────────────────── -->
          <view class="section">
            <view class="section-header">
              <text class="section-title">{{ t("companion.profile.settings") }}</text>
            </view>
            <view class="settings-list">
              <view class="settings-item" @click="openEditProfile">
                <view class="settings-left">
                  <view class="settings-icon icon-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </view>
                  <text class="settings-label">{{ t("companion.profile.editProfile") }}</text>
                </view>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </view>

              <view class="settings-item" @click="openChangePassword">
                <view class="settings-left">
                  <view class="settings-icon icon-indigo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </view>
                  <text class="settings-label">{{ t("companion.profile.changePassword") }}</text>
                </view>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </view>

              <view class="settings-item danger-item" @click="confirmLogout">
                <view class="settings-left">
                  <view class="settings-icon icon-red">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </view>
                  <text class="settings-label red">{{ t("companion.profile.logout") }}</text>
                </view>
              </view>
            </view>
          </view>

        </view>
      </view>
    </view>
    <BottomTabBar />

    <!-- ════════════════════════════════════════════════════════════════
         Edit Profile Drawer
    ════════════════════════════════════════════════════════════════ -->
    <view v-if="showEditProfile" class="drawer-overlay" @click="showEditProfile = false">
      <view class="drawer" @click.stop>
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ t("companion.profile.editProfile") }}</text>
          <view class="drawer-close" @click="showEditProfile = false"><text>×</text></view>
        </view>
        <view class="drawer-body">

          <!-- Profile Image -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.profileImage") }}</text>
            <view class="avatar-upload-row">
              <view class="avatar-upload-preview" @click="selectProfileImage">
                <img v-if="editForm.avatar_url" :src="editForm.avatar_url" class="avatar-upload-img" />
                <view v-else class="avatar-upload-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#94a3b8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </view>
                <view v-if="uploadingAvatar" class="avatar-upload-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </view>
              </view>
              <view class="avatar-upload-info">
                <text class="avatar-upload-hint">{{ t("companion.profile.uploadProfileImage") }}</text>
                <view class="upload-small-btn" @click="selectProfileImage">
                  <text>{{ editForm.avatar_url ? t("companion.profile.changeProfileImage") : t("companion.profile.uploadProfileImage") }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- Display Name -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.displayName") }} *</text>
            <TextInput v-model="editForm.display_name" type="text" :placeholder="t('companion.profile.displayNamePlaceholder')" />
            <text v-if="editErrors.display_name" class="form-error">{{ editErrors.display_name }}</text>
          </view>

          <!-- Bio -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.bio") }}</text>
            <TextArea v-model="editForm.bio" :placeholder="t('companion.profile.bioPlaceholder')" />
          </view>

          <!-- Contact Email -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.contactEmail") }}</text>
            <TextInput v-model="editForm.contact_email" type="text" :placeholder="t('companion.profile.contactEmailPlaceholder')" />
          </view>

          <!-- Location -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.location") }}</text>
            <TextInput v-model="editForm.location" type="text" :placeholder="t('companion.profile.locationPlaceholder')" />
          </view>

          <!-- Service Cities -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.serviceCities") }}</text>
            <TextInput v-model="editForm.service_cities_str" type="text" :placeholder="t('companion.profile.serviceCitiesPlaceholder')" />
            <text class="form-hint">{{ t("companion.profile.separateByComma") }}</text>
          </view>

          <!-- Hourly Rate -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.hourlyRate") }} (¥)</text>
            <TextInput v-model="editForm.hourly_rate_str" type="text" :placeholder="t('companion.profile.hourlyRatePlaceholder')" />
          </view>

          <!-- Daily Rate -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.dailyRate") }} (¥)</text>
            <TextInput v-model="editForm.daily_rate_str" type="text" :placeholder="t('companion.profile.dailyRatePlaceholder')" />
          </view>

          <!-- Years of Experience -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.yearsExp") }}</text>
            <TextInput v-model="editForm.experience_years_str" type="text" :placeholder="t('companion.profile.yearsExpPlaceholder')" />
          </view>

          <!-- Languages -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.languages") }}</text>
            <view class="chip-selector">
              <view
                v-for="lang in allLanguages"
                :key="lang"
                class="sel-chip"
                :class="{ active: editForm.languages.includes(lang) }"
                @click="toggleLanguage(lang)"
              >
                <text>{{ lang }}</text>
              </view>
            </view>
          </view>

          <!-- Skills -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.skills") }}</text>
            <view class="chip-selector">
              <view
                v-for="skill in allSkills"
                :key="skill"
                class="sel-chip"
                :class="{ active: editForm.skills.includes(skill) }"
                @click="toggleSkill(skill)"
              >
                <text>{{ skill.replace(/_/g, " ") }}</text>
              </view>
            </view>
          </view>

          <!-- Interests -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.interests") }}</text>
            <view class="chip-selector">
              <view
                v-for="interest in allInterests"
                :key="interest"
                class="sel-chip"
                :class="{ active: editForm.interests.includes(interest) }"
                @click="toggleInterest(interest)"
              >
                <text>{{ interest.replace(/_/g, " ") }}</text>
              </view>
            </view>
          </view>

          <!-- Portfolio URLs -->
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.portfolioImages") }}</text>
            <view class="portfolio-upload-grid">
              <view
                v-for="(url, idx) in editForm.portfolio_urls"
                :key="idx"
                class="portfolio-thumb"
              >
                <img :src="url" class="portfolio-thumb-img" />
                <view class="portfolio-remove" @click="removePortfolioUrl(idx)">
                  <text>×</text>
                </view>
              </view>
              <view class="portfolio-add-btn" @click="addPortfolioImage" :class="{ uploading: uploadingPortfolio }">
                <svg v-if="!uploadingPortfolio" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              </view>
            </view>
          </view>

        </view>
        <view class="drawer-footer">
          <view class="btn btn-secondary" @click="showEditProfile = false"><text>{{ t("companion.profile.cancel") }}</text></view>
          <view class="btn btn-primary" :class="{ loading: saving }" @click="saveProfile">
            <text>{{ saving ? t("companion.profile.saving") : t("companion.profile.save") }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ════════════════════════════════════════════════════════════════
         Change Password Drawer
    ════════════════════════════════════════════════════════════════ -->
    <view v-if="showPasswordForm" class="drawer-overlay" @click="showPasswordForm = false">
      <view class="drawer" @click.stop>
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ t("companion.profile.changePassword") }}</text>
          <view class="drawer-close" @click="showPasswordForm = false"><text>×</text></view>
        </view>
        <view class="drawer-body">
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.currentPassword") }}</text>
            <TextInput v-model="pwForm.current_password" type="text" :placeholder="t('companion.profile.currentPasswordPlaceholder')" />
            <text v-if="pwErrors.current_password" class="form-error">{{ pwErrors.current_password }}</text>
          </view>
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.newPassword") }}</text>
            <TextInput v-model="pwForm.new_password" type="text" :placeholder="t('companion.profile.newPasswordPlaceholder')" />
            <text v-if="pwErrors.new_password" class="form-error">{{ pwErrors.new_password }}</text>
          </view>
          <view class="form-group">
            <text class="form-label">{{ t("companion.profile.confirmPassword") }}</text>
            <TextInput v-model="pwForm.confirm_password" type="text" :placeholder="t('companion.profile.confirmPasswordPlaceholder')" />
            <text v-if="pwErrors.confirm_password" class="form-error">{{ pwErrors.confirm_password }}</text>
          </view>
        </view>
        <view class="drawer-footer">
          <view class="btn btn-secondary" @click="showPasswordForm = false"><text>{{ t("companion.profile.cancel") }}</text></view>
          <view class="btn btn-primary" :class="{ loading: saving }" @click="savePassword">
            <text>{{ saving ? t("companion.profile.saving") : t("companion.profile.savePassword") }}</text>
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
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  getRealCompanionProfile,
  updateRealCompanionProfile,
  updateCompanionPassword,
  type RealCompanionProfile,
  type CompanionSkill,
  type CompanionLanguage,
  type CompanionInterest,
} from "../api/companion";
import { uploadLogo, getFileUrl, getFilePathFromUploadResponse } from "../api/uploadLogo";
import { getAccessToken, logoutApi } from "../api/auth";
import { ROUTES } from "../routes";
import { showToast } from "../utils/toast";
import { useConfirmDrawer } from "../utils/confirmDrawer";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";
import TextInput from "../components/TextInput.vue";
import TextArea from "../components/TextArea.vue";
import ConfirmDrawer from "../components/ConfirmDrawer.vue";

const { t } = useI18n();

const confirmDrawer = useConfirmDrawer();
const confirmDrawerTone = ref<"primary" | "danger">("danger");

const loading = ref(true);
const saving = ref(false);
const uploadingAvatar = ref(false);
const uploadingPortfolio = ref(false);
const profile = ref<RealCompanionProfile | null>(null);

// ── Enum options ──────────────────────────────────────────────────────────────
const allLanguages: CompanionLanguage[] = [
  "MANDARIN", "ENGLISH", "JAPANESE", "KOREAN", "CANTONESE",
  "FRENCH", "GERMAN", "SPANISH", "OTHER",
];

const allSkills: CompanionSkill[] = [
  "PHOTOGRAPHY", "VIDEOGRAPHY", "LANGUAGES", "OUTDOOR_LEADERSHIP",
  "FIRST_AID", "DRIVING", "COOKING", "CULTURAL_GUIDE", "OTHER",
];

const allInterests: CompanionInterest[] = [
  "HISTORY", "CULTURE", "PHOTOGRAPHY", "HIKING", "FOOD",
  "NIGHTLIFE", "SHOPPING", "FAMILY", "ADVENTURE", "OTHER",
];

// ── Drawers ──────────────────────────────────────────────────────────────────
const showEditProfile = ref(false);
const showPasswordForm = ref(false);

// ── Edit Profile form ────────────────────────────────────────────────────────
const editForm = ref({
  display_name: "",
  bio: "",
  avatar_url: "",
  contact_email: "",
  location: "",
  service_cities_str: "",
  hourly_rate_str: "",
  daily_rate_str: "",
  experience_years_str: "",
  languages: [] as CompanionLanguage[],
  skills: [] as CompanionSkill[],
  interests: [] as CompanionInterest[],
  portfolio_urls: [] as string[],
});
const editErrors = ref<Record<string, string>>({});

function toggleLanguage(lang: CompanionLanguage) {
  const idx = editForm.value.languages.indexOf(lang);
  if (idx >= 0) editForm.value.languages.splice(idx, 1);
  else editForm.value.languages.push(lang);
}

function toggleSkill(skill: CompanionSkill) {
  const idx = editForm.value.skills.indexOf(skill);
  if (idx >= 0) editForm.value.skills.splice(idx, 1);
  else editForm.value.skills.push(skill);
}

function toggleInterest(interest: CompanionInterest) {
  const idx = editForm.value.interests.indexOf(interest);
  if (idx >= 0) editForm.value.interests.splice(idx, 1);
  else editForm.value.interests.push(interest);
}

function removePortfolioUrl(idx: number) {
  editForm.value.portfolio_urls.splice(idx, 1);
}

function openEditProfile() {
  const p = profile.value;
  editForm.value = {
    display_name: p?.display_name ?? "",
    bio: p?.bio ?? "",
    avatar_url: p?.avatar_url ?? "",
    contact_email: p?.contact_email ?? "",
    location: p?.location ?? "",
    service_cities_str: (p?.service_cities ?? []).join(", "),
    hourly_rate_str: p?.hourly_rate != null ? String(p.hourly_rate) : "",
    daily_rate_str: p?.daily_rate != null ? String(p.daily_rate) : "",
    experience_years_str: p?.experience_years != null ? String(p.experience_years) : "",
    languages: [...(p?.languages ?? [])],
    skills: [...(p?.skills ?? [])],
    interests: [...(p?.interests ?? [])],
    portfolio_urls: [...(p?.portfolio_urls ?? [])],
  };
  editErrors.value = {};
  showEditProfile.value = true;
}

/** Pick & upload profile image */
function selectProfileImage() {
  if (uploadingAvatar.value) return;
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0];
      if (!tempFilePath) return;
      uploadingAvatar.value = true;
      try {
        const fileResponse = await fetch(tempFilePath);
        const blob = await fileResponse.blob();
        const lastDot = tempFilePath.lastIndexOf(".");
        const extension = lastDot > 0 ? tempFilePath.substring(lastDot).toLowerCase() : ".jpg";
        const file = new File([blob], `avatar${extension}`, { type: blob.type || "image/jpeg" });
        const uploadRes = await uploadLogo(file);
        const filePath = getFilePathFromUploadResponse(uploadRes);
        editForm.value.avatar_url = filePath
          ? getFileUrl(filePath)
          : (uploadRes.data?.url as string | undefined) ?? "";
      } catch (err: any) {
        uni.showToast({ title: err?.message ?? t("merchant.logoUploadError"), icon: "none", duration: 2500 });
      } finally {
        uploadingAvatar.value = false;
      }
    },
  });
}

/** Pick & upload portfolio image */
function addPortfolioImage() {
  if (uploadingPortfolio.value) return;
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0];
      if (!tempFilePath) return;
      uploadingPortfolio.value = true;
      try {
        const fileResponse = await fetch(tempFilePath);
        const blob = await fileResponse.blob();
        const lastDot = tempFilePath.lastIndexOf(".");
        const extension = lastDot > 0 ? tempFilePath.substring(lastDot).toLowerCase() : ".jpg";
        const file = new File([blob], `portfolio${extension}`, { type: blob.type || "image/jpeg" });
        const uploadRes = await uploadLogo(file);
        const filePath = getFilePathFromUploadResponse(uploadRes);
        const url = filePath
          ? getFileUrl(filePath)
          : (uploadRes.data?.url as string | undefined) ?? "";
        if (url) editForm.value.portfolio_urls.push(url);
      } catch (err: any) {
        uni.showToast({ title: err?.message ?? t("merchant.logoUploadError"), icon: "none", duration: 2500 });
      } finally {
        uploadingPortfolio.value = false;
      }
    },
  });
}

async function saveProfile() {
  editErrors.value = {};
  if (!editForm.value.display_name.trim()) {
    editErrors.value.display_name = t("companion.profile.displayNameRequired");
    return;
  }
  const token = getAccessToken();
  if (!token) { uni.reLaunch({ url: ROUTES.LOGIN }); return; }

  saving.value = true;
  try {
    const hourlyRate = parseFloat(editForm.value.hourly_rate_str);
    const dailyRate = parseFloat(editForm.value.daily_rate_str);
    const expYears = parseInt(editForm.value.experience_years_str, 10);
    const serviceCities = editForm.value.service_cities_str
      .split(",").map((s) => s.trim()).filter(Boolean);

    const res = await updateRealCompanionProfile(token, {
      display_name: editForm.value.display_name.trim(),
      bio: editForm.value.bio.trim() || undefined,
      avatar_url: editForm.value.avatar_url || undefined,
      contact_email: editForm.value.contact_email.trim() || undefined,
      location: editForm.value.location.trim() || undefined,
      service_cities: serviceCities.length > 0 ? serviceCities : undefined,
      hourly_rate: !isNaN(hourlyRate) && hourlyRate >= 0 ? hourlyRate : undefined,
      daily_rate: !isNaN(dailyRate) && dailyRate >= 0 ? dailyRate : undefined,
      experience_years: !isNaN(expYears) && expYears >= 0 ? expYears : undefined,
      languages: editForm.value.languages.length > 0 ? editForm.value.languages : undefined,
      skills: editForm.value.skills.length > 0 ? editForm.value.skills : undefined,
      interests: editForm.value.interests.length > 0 ? editForm.value.interests : undefined,
      portfolio_urls: editForm.value.portfolio_urls.length > 0 ? editForm.value.portfolio_urls : undefined,
    });
    profile.value = res.data;
    showEditProfile.value = false;
    showToast({ title: t("companion.profile.saved"), icon: "success" });
  } catch (err: any) {
    showToast({ title: err?.message ?? t("companion.profile.saveError"), icon: "none" });
  } finally {
    saving.value = false;
  }
}

// ── Password ─────────────────────────────────────────────────────────────────
const pwForm = ref({ current_password: "", new_password: "", confirm_password: "" });
const pwErrors = ref<Record<string, string>>({});

function openChangePassword() {
  pwForm.value = { current_password: "", new_password: "", confirm_password: "" };
  pwErrors.value = {};
  showPasswordForm.value = true;
}

async function savePassword() {
  pwErrors.value = {};
  if (!pwForm.value.current_password) {
    pwErrors.value.current_password = t("companion.profile.currentPasswordRequired");
    return;
  }
  if (!pwForm.value.new_password) {
    pwErrors.value.new_password = t("companion.profile.newPasswordRequired");
    return;
  }
  if (pwForm.value.new_password.length < 6) {
    pwErrors.value.new_password = t("companion.profile.newPasswordMinLength");
    return;
  }
  if (pwForm.value.new_password !== pwForm.value.confirm_password) {
    pwErrors.value.confirm_password = t("companion.profile.passwordMismatch");
    return;
  }
  const token = getAccessToken();
  if (!token) { uni.reLaunch({ url: ROUTES.LOGIN }); return; }

  saving.value = true;
  try {
    await updateCompanionPassword(token, {
      current_password: pwForm.value.current_password,
      new_password: pwForm.value.new_password,
    });
    showPasswordForm.value = false;
    showToast({ title: t("companion.profile.passwordChanged"), icon: "success" });
  } catch {
    showToast({ title: t("companion.profile.passwordChangeError"), icon: "none" });
  } finally {
    saving.value = false;
  }
}

// ── Logout ───────────────────────────────────────────────────────────────────
async function confirmLogout() {
  confirmDrawerTone.value = "danger";
  const ok = await confirmDrawer.request({
    title: t("companion.profile.logout"),
    content: t("companion.profile.logoutConfirm"),
    confirmText: t("companion.profile.logout"),
    cancelText: t("companion.profile.cancel"),
  });
  if (!ok) return;
  await logoutApi();
  uni.reLaunch({ url: ROUTES.INDEX });
}

// ── Computed ─────────────────────────────────────────────────────────────────
const avatarInitial = computed(() => {
  const name = profile.value?.display_name ?? "";
  return name.charAt(0).toUpperCase() || "?";
});

const statusLabel = computed(() => {
  const s = profile.value?.status;
  if (s === "APPROVED") return t("companion.status.approved");
  if (s === "PENDING") return t("companion.status.pending");
  if (s === "REJECTED") return t("companion.status.rejected");
  if (s === "SUSPENDED") return t("companion.status.suspended");
  return t("companion.status.pending");
});

const statusBadgeClass = computed(() => {
  const s = profile.value?.status;
  if (s === "APPROVED") return "badge-ok";
  if (s === "PENDING") return "badge-pending";
  if (s === "REJECTED") return "badge-bad";
  if (s === "SUSPENDED") return "badge-bad";
  return "badge-pending";
});

// ── Load ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  const token = getAccessToken();
  if (!token) { uni.reLaunch({ url: ROUTES.LOGIN }); return; }
  try {
    const res = await getRealCompanionProfile(token);
    profile.value = res.data;
  } catch (err: any) {
    // 404 means profile not yet created — show create prompt
    if (!err?.message?.includes("404")) {
      showToast({ title: t("merchant.errorGeneric"), icon: "none" });
    }
    profile.value = null;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Page shell ─────────────────────────────────────────────────────────── */
.companion-profile-page {
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
  box-sizing: border-box;
}

.phone-inner {
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 0 0 48rpx;
  box-sizing: border-box;
  background: #f8fafc;
  overflow: auto;
}

@media (min-width: 768px) {
  .companion-profile-page {
    padding: 32rpx 0 32rpx;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    background: #e2e8f0;
  }
  .phone-frame {
    max-width: min(390px, 100vw);
    height: 100%;
    background: #ffffff;
  }
  .phone-inner { background: #f8fafc; }
}

/* ── Loading ────────────────────────────────────────────────────────────── */
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
.loading-text { font-size: 26rpx; color: #64748b; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ── Content ────────────────────────────────────────────────────────────── */
.profile-content { padding-bottom: 24rpx; }

/* ── Hero card ──────────────────────────────────────────────────────────── */
.hero-card {
  margin: 24rpx 24rpx 0;
  background: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.25);
}

/* Avatar */
.avatar-wrap {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  border: 3rpx solid rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 999px;
}

.avatar-initial {
  font-size: 38rpx;
  font-weight: 800;
  color: #ffffff;
}

.avatar-edit-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28rpx;
  height: 28rpx;
  border-radius: 999px;
  background: #ffffff;
  border: 2rpx solid rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #EF4444;
}

/* Hero info */
.hero-info { flex: 1; min-width: 0; }

.hero-name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 4rpx;
  flex-wrap: wrap;
}

.hero-name {
  font-size: 32rpx;
  font-weight: 800;
  color: #ffffff;
}

.status-badge {
  padding: 4rpx 12rpx;
  border-radius: 999px;
  font-size: 20rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.badge-text { font-size: 20rpx; }
.badge-ok    { background: rgba(255,255,255,0.9); color: #16a34a; }
.badge-pending { background: rgba(255,255,255,0.9); color: #d97706; }
.badge-bad   { background: rgba(255,255,255,0.9); color: #dc2626; }

.hero-location {
  display: block;
  font-size: 24rpx;
  color: rgba(255,255,255,0.85);
  margin-bottom: 10rpx;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.lang-tag {
  padding: 5rpx 12rpx;
  border-radius: 999px;
  background: rgba(255,255,255,0.2);
  border: 1rpx solid rgba(255,255,255,0.3);
  font-size: 22rpx;
  color: #ffffff;
}

/* ── Stats row ──────────────────────────────────────────────────────────── */
.stats-row {
  margin: 16rpx 24rpx 0;
  background: #ffffff;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  padding: 20rpx 0;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: #0f172a;
}

.stat-label {
  display: block;
  font-size: 19rpx;
  color: #64748b;
  margin-top: 3rpx;
}

.stat-divider {
  width: 1rpx;
  height: 36rpx;
  background: #e2e8f0;
}

/* ── Section ────────────────────────────────────────────────────────────── */
.section {
  margin: 20rpx 24rpx 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #0f172a;
}

.section-action {
  display: flex;
  align-items: center;
  gap: 5rpx;
  font-size: 24rpx;
  color: #EF4444;
  padding: 6rpx 0;
}

/* ── Info card ──────────────────────────────────────────────────────────── */
.info-card {
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 4rpx 0;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
  overflow: hidden;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f1f5f9;
  gap: 12rpx;
}

.info-row:last-child { border-bottom: none; }

.info-label {
  font-size: 24rpx;
  color: #94a3b8;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 130rpx;
  padding-top: 2rpx;
}

.info-value {
  font-size: 26rpx;
  color: #0f172a;
  flex: 1;
  line-height: 1.5;
}

.bio-value {
  color: #475569;
  font-size: 25rpx;
  line-height: 1.6;
}

.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  flex: 1;
}

.city-chip {
  padding: 5rpx 12rpx;
  background: #f1f5f9;
  border: 1rpx solid #e2e8f0;
  border-radius: 999px;
  font-size: 22rpx;
  color: #334155;
}

.info-empty {
  padding: 24rpx 20rpx;
  text-align: center;
}

.info-empty-text {
  font-size: 24rpx;
  color: #94a3b8;
}

/* ── Chip groups (skills / interests) ───────────────────────────────────── */
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.skill-chip {
  padding: 8rpx 18rpx;
  background: #dbeafe;
  border: 1rpx solid #bfdbfe;
  border-radius: 999px;
  font-size: 24rpx;
  color: #1d4ed8;
  font-weight: 500;
}

.interest-chip {
  padding: 8rpx 18rpx;
  background: #fef3c7;
  border: 1rpx solid #fde68a;
  border-radius: 999px;
  font-size: 24rpx;
  color: #92400e;
  font-weight: 500;
}

/* ── Portfolio grid ─────────────────────────────────────────────────────── */
.portfolio-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.portfolio-item {
  width: calc(33.33% - 8rpx);
  aspect-ratio: 1;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #e2e8f0;
}

.portfolio-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Settings list ──────────────────────────────────────────────────────── */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.settings-item {
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 18rpx 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}

.settings-item:active { opacity: 0.8; }

.settings-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.settings-icon {
  width: 44rpx;
  height: 44rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-blue   { background: #dbeafe; color: #2563eb; }
.icon-indigo { background: #e0e7ff; color: #6366f1; }
.icon-red    { background: #fee2e2; color: #dc2626; }

.settings-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.settings-label.red { color: #dc2626; }
.danger-item { border-color: #fecaca; }

/* ── Drawers ────────────────────────────────────────────────────────────── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.drawer {
  width: 100%;
  max-width: min(390px, 100vw);
  max-height: 90vh;
  background: #ffffff;
  border-radius: 20rpx 20rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-handle {
  width: 48rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: #cbd5e1;
  margin: 12rpx auto 0;
  flex-shrink: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx 16rpx;
  border-bottom: 1rpx solid #e2e8f0;
  flex-shrink: 0;
}

.drawer-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #0f172a;
}

.drawer-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #334155;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx 24rpx;
  -webkit-overflow-scrolling: touch;
}

.drawer-footer {
  padding: 16rpx 24rpx;
  border-top: 1rpx solid #e2e8f0;
  display: flex;
  gap: 12rpx;
  flex-shrink: 0;
  background: #ffffff;
}

.btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 12rpx;
  border-radius: 14rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
  border: 1rpx solid #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
  color: #ffffff;
}

.btn-primary.loading { opacity: 0.65; }

/* ── Form ───────────────────────────────────────────────────────────────── */
.form-group { margin-bottom: 28rpx; }

.form-group:last-child { margin-bottom: 0; }

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #334155;
  margin-bottom: 12rpx;
}

.form-hint {
  display: block;
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 8rpx;
}

.form-error {
  display: block;
  font-size: 22rpx;
  color: #ef4444;
  margin-top: 6rpx;
}

/* TextInput / TextArea deep styling — matches other drawers */
.drawer-body :deep(.text-input-wrap input),
.drawer-body :deep(.text-input-native),
.drawer-body :deep(.textarea-wrap textarea),
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

.drawer-body :deep(.text-input-wrap input):focus,
.drawer-body :deep(.text-input-native):focus,
.drawer-body :deep(.textarea-wrap textarea):focus,
.drawer-body :deep(.textarea-native):focus {
  outline: none;
  border-color: #EF4444;
}

.drawer-body :deep(.textarea-wrap textarea),
.drawer-body :deep(.textarea-native) {
  min-height: 120rpx;
  resize: none;
}

/* Avatar upload */
.avatar-upload-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar-upload-preview {
  width: 96rpx;
  height: 96rpx;
  border-radius: 999px;
  border: 2rpx dashed #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
}

.avatar-upload-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 999px;
}

.avatar-upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}

.avatar-upload-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.avatar-upload-hint {
  font-size: 24rpx;
  color: #94a3b8;
}

.upload-small-btn {
  display: inline-flex;
  align-items: center;
  padding: 10rpx 18rpx;
  background: #f1f5f9;
  border: 1rpx solid #e2e8f0;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: #334155;
  font-weight: 600;
  width: fit-content;
}

/* Multi-select chip selector */
.chip-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.sel-chip {
  padding: 10rpx 18rpx;
  border-radius: 999px;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  font-size: 24rpx;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.sel-chip.active {
  background: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
  border-color: transparent;
  color: #ffffff;
  font-weight: 700;
}

/* Portfolio upload grid */
.portfolio-upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.portfolio-thumb {
  width: 90rpx;
  height: 90rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
  border: 1rpx solid #e2e8f0;
}

.portfolio-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.portfolio-remove {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 999px;
  background: rgba(0,0,0,0.55);
  color: #ffffff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.portfolio-add-btn {
  width: 90rpx;
  height: 90rpx;
  border-radius: 12rpx;
  border: 2rpx dashed #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
}

.portfolio-add-btn.uploading { opacity: 0.6; }

/* Spinner animation */
@keyframes spin-anim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spinner { animation: spin-anim 1s linear infinite; }
</style>
