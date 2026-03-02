<template>
  <view class="companion-services-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('companion.servicesTitle')" />
      <view class="phone-inner">

        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ t("merchant.loading") }}</text>
        </view>

        <template v-else>
          <!-- Pricing card -->
          <view class="section-card">
            <view class="section-header">
              <text class="section-title">{{ t("companion.services.pricing") }}</text>
              <view class="edit-btn" @click="openEditPricing">
                <text>{{ t("companion.services.edit") }}</text>
              </view>
            </view>
            <view class="pricing-row">
              <view class="pricing-item">
                <text class="pricing-label">{{ t("companion.services.perHour") }}</text>
                <text class="pricing-value">{{ profile?.hourly_rate ? formatCurrency(profile.hourly_rate) + '/h' : '—' }}</text>
              </view>
              <view class="pricing-divider"></view>
              <view class="pricing-item">
                <text class="pricing-label">{{ t("companion.services.perDay") }}</text>
                <text class="pricing-value">{{ profile?.daily_rate ? formatCurrency(profile.daily_rate) + '/d' : '—' }}</text>
              </view>
            </view>
          </view>

          <!-- Skills card -->
          <view class="section-card">
            <view class="section-header">
              <text class="section-title">{{ t("companion.services.skills") }}</text>
              <view class="edit-btn" @click="openEditSkills">
                <text>{{ t("companion.services.edit") }}</text>
              </view>
            </view>
            <view v-if="!profile?.skills?.length" class="empty-inline">
              <text class="muted">{{ t("companion.services.noSkills") }}</text>
            </view>
            <view v-else class="tags-wrap">
              <view v-for="skill in profile.skills" :key="skill" class="tag skill">
                <text>{{ skillLabel(skill) }}</text>
              </view>
            </view>
          </view>

          <!-- Languages card -->
          <view class="section-card">
            <view class="section-header">
              <text class="section-title">{{ t("companion.services.languages") }}</text>
              <view class="edit-btn" @click="openEditLanguages">
                <text>{{ t("companion.services.edit") }}</text>
              </view>
            </view>
            <view v-if="!profile?.languages?.length" class="empty-inline">
              <text class="muted">{{ t("companion.services.noLanguages") }}</text>
            </view>
            <view v-else class="tags-wrap">
              <view v-for="lang in profile.languages" :key="lang" class="tag lang">
                <text>{{ langLabel(lang) }}</text>
              </view>
            </view>
          </view>

          <!-- Portfolio -->
          <view class="section-card">
            <view class="section-header">
              <text class="section-title">{{ t("companion.services.portfolio") }}</text>
            </view>
            <view v-if="!profile?.portfolio_urls?.length" class="empty-inline">
              <text class="muted">{{ t("companion.services.noPortfolio") }}</text>
            </view>
            <view v-else class="portfolio-list">
              <view v-for="url in profile.portfolio_urls" :key="url" class="portfolio-item">
                <text class="portfolio-url">{{ url }}</text>
              </view>
            </view>
          </view>
        </template>
      </view>
    </view>

    <!-- Edit Pricing Drawer -->
    <view v-if="showPricingDrawer" class="drawer-overlay" @click.self="closePricingDrawer">
      <view class="drawer">
        <view class="drawer-header">
          <text class="drawer-title">{{ t("companion.services.editPricing") }}</text>
          <view class="drawer-close" @click="closePricingDrawer"><text>✕</text></view>
        </view>
        <view class="drawer-body">
          <text class="field-label">{{ t("companion.services.perHour") }} (¥)</text>
          <input class="field-input" type="digit" v-model="editHourlyRate" :placeholder="t('companion.services.pricePlaceholder')" />
          <text class="field-label mt">{{ t("companion.services.perDay") }} (¥)</text>
          <input class="field-input" type="digit" v-model="editDailyRate" :placeholder="t('companion.services.pricePlaceholder')" />
        </view>
        <view class="drawer-footer">
          <view class="btn-cancel" @click="closePricingDrawer"><text>{{ t("companion.services.cancel") }}</text></view>
          <view class="btn-submit" :class="{ disabled: saving }" @click="savePricing">
            <text>{{ saving ? t("companion.services.saving") : t("companion.services.save") }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Edit Skills Drawer -->
    <view v-if="showSkillsDrawer" class="drawer-overlay" @click.self="closeSkillsDrawer">
      <view class="drawer">
        <view class="drawer-header">
          <text class="drawer-title">{{ t("companion.services.editSkills") }}</text>
          <view class="drawer-close" @click="closeSkillsDrawer"><text>✕</text></view>
        </view>
        <view class="drawer-body">
          <view class="checkbox-grid">
            <view
              v-for="skill in allSkills"
              :key="skill"
              class="checkbox-item"
              :class="{ selected: editSkills.includes(skill) }"
              @click="toggleSkill(skill)"
            >
              <text>{{ skillLabel(skill) }}</text>
            </view>
          </view>
        </view>
        <view class="drawer-footer">
          <view class="btn-cancel" @click="closeSkillsDrawer"><text>{{ t("companion.services.cancel") }}</text></view>
          <view class="btn-submit" :class="{ disabled: saving }" @click="saveSkills">
            <text>{{ saving ? t("companion.services.saving") : t("companion.services.save") }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Edit Languages Drawer -->
    <view v-if="showLangsDrawer" class="drawer-overlay" @click.self="closeLangsDrawer">
      <view class="drawer">
        <view class="drawer-header">
          <text class="drawer-title">{{ t("companion.services.editLanguages") }}</text>
          <view class="drawer-close" @click="closeLangsDrawer"><text>✕</text></view>
        </view>
        <view class="drawer-body">
          <view class="checkbox-grid">
            <view
              v-for="lang in allLanguages"
              :key="lang"
              class="checkbox-item"
              :class="{ selected: editLanguages.includes(lang) }"
              @click="toggleLang(lang)"
            >
              <text>{{ langLabel(lang) }}</text>
            </view>
          </view>
        </view>
        <view class="drawer-footer">
          <view class="btn-cancel" @click="closeLangsDrawer"><text>{{ t("companion.services.cancel") }}</text></view>
          <view class="btn-submit" :class="{ disabled: saving }" @click="saveLanguages">
            <text>{{ saving ? t("companion.services.saving") : t("companion.services.save") }}</text>
          </view>
        </view>
      </view>
    </view>

    <BottomTabBar />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getAccessToken } from "../api/auth";
import {
  getRealCompanionProfile,
  updateRealCompanionProfile,
  type RealCompanionProfile,
  type CompanionSkill,
  type CompanionLanguage,
} from "../api/companion";
import { ROUTES } from "../routes";
import { showToast } from "../utils/toast";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";

const { t } = useI18n();

const loading = ref(true);
const saving = ref(false);
const profile = ref<RealCompanionProfile | null>(null);

// Pricing drawer
const showPricingDrawer = ref(false);
const editHourlyRate = ref("");
const editDailyRate = ref("");

// Skills drawer
const showSkillsDrawer = ref(false);
const editSkills = ref<CompanionSkill[]>([]);

// Languages drawer
const showLangsDrawer = ref(false);
const editLanguages = ref<CompanionLanguage[]>([]);

const allSkills: CompanionSkill[] = [
  "PHOTOGRAPHY", "VIDEOGRAPHY", "LANGUAGES", "OUTDOOR_LEADERSHIP",
  "FIRST_AID", "DRIVING", "COOKING", "CULTURAL_GUIDE", "OTHER",
];

const allLanguages: CompanionLanguage[] = [
  "MANDARIN", "ENGLISH", "JAPANESE", "KOREAN", "CANTONESE",
  "FRENCH", "GERMAN", "SPANISH", "OTHER",
];

function formatCurrency(v: number): string {
  return `¥${Number(v).toFixed(0)}`;
}

function skillLabel(s: CompanionSkill): string {
  const map: Record<CompanionSkill, string> = {
    PHOTOGRAPHY: t("companion.services.skill.photography"),
    VIDEOGRAPHY: t("companion.services.skill.videography"),
    LANGUAGES: t("companion.services.skill.languages"),
    OUTDOOR_LEADERSHIP: t("companion.services.skill.outdoorLeadership"),
    FIRST_AID: t("companion.services.skill.firstAid"),
    DRIVING: t("companion.services.skill.driving"),
    COOKING: t("companion.services.skill.cooking"),
    CULTURAL_GUIDE: t("companion.services.skill.culturalGuide"),
    OTHER: t("companion.services.skill.other"),
  };
  return map[s] ?? s;
}

function langLabel(l: CompanionLanguage): string {
  const map: Record<CompanionLanguage, string> = {
    MANDARIN: t("companion.services.lang.mandarin"),
    ENGLISH: t("companion.services.lang.english"),
    JAPANESE: t("companion.services.lang.japanese"),
    KOREAN: t("companion.services.lang.korean"),
    CANTONESE: t("companion.services.lang.cantonese"),
    FRENCH: t("companion.services.lang.french"),
    GERMAN: t("companion.services.lang.german"),
    SPANISH: t("companion.services.lang.spanish"),
    OTHER: t("companion.services.lang.other"),
  };
  return map[l] ?? l;
}

// Pricing
function openEditPricing() {
  editHourlyRate.value = profile.value?.hourly_rate ? String(profile.value.hourly_rate) : "";
  editDailyRate.value = profile.value?.daily_rate ? String(profile.value.daily_rate) : "";
  showPricingDrawer.value = true;
}

function closePricingDrawer() { showPricingDrawer.value = false; }

async function savePricing() {
  const token = getAccessToken() ?? "";
  const hourly = parseFloat(editHourlyRate.value);
  if (!hourly || hourly <= 0) {
    showToast({ title: t("companion.services.priceRequired"), icon: "none" });
    return;
  }
  saving.value = true;
  try {
    const res = await updateRealCompanionProfile(token, {
      hourly_rate: hourly,
      daily_rate: editDailyRate.value ? parseFloat(editDailyRate.value) : undefined,
    });
    profile.value = res.data;
    showToast({ title: t("companion.services.saved"), icon: "success" });
    closePricingDrawer();
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    saving.value = false;
  }
}

// Skills
function openEditSkills() {
  editSkills.value = [...(profile.value?.skills ?? [])];
  showSkillsDrawer.value = true;
}

function closeSkillsDrawer() { showSkillsDrawer.value = false; }

function toggleSkill(s: CompanionSkill) {
  const idx = editSkills.value.indexOf(s);
  if (idx >= 0) editSkills.value.splice(idx, 1);
  else editSkills.value.push(s);
}

async function saveSkills() {
  const token = getAccessToken() ?? "";
  saving.value = true;
  try {
    const res = await updateRealCompanionProfile(token, { skills: editSkills.value });
    profile.value = res.data;
    showToast({ title: t("companion.services.saved"), icon: "success" });
    closeSkillsDrawer();
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    saving.value = false;
  }
}

// Languages
function openEditLanguages() {
  editLanguages.value = [...(profile.value?.languages ?? [])];
  showLangsDrawer.value = true;
}

function closeLangsDrawer() { showLangsDrawer.value = false; }

function toggleLang(l: CompanionLanguage) {
  const idx = editLanguages.value.indexOf(l);
  if (idx >= 0) editLanguages.value.splice(idx, 1);
  else editLanguages.value.push(l);
}

async function saveLanguages() {
  const token = getAccessToken() ?? "";
  saving.value = true;
  try {
    const res = await updateRealCompanionProfile(token, { languages: editLanguages.value });
    profile.value = res.data;
    showToast({ title: t("companion.services.saved"), icon: "success" });
    closeLangsDrawer();
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  const token = getAccessToken();
  if (!token) { uni.reLaunch({ url: ROUTES.LOGIN }); return; }
  loading.value = true;
  try {
    const res = await getRealCompanionProfile(token);
    profile.value = res.data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.companion-services-page {
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
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

@media (min-width: 768px) {
  .companion-services-page {
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
}

/* Section card */
.section-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
}

.edit-btn {
  background: #eff6ff;
  border-radius: 20rpx;
  padding: 8rpx 24rpx;
}

.edit-btn text {
  font-size: 24rpx;
  font-weight: 600;
  color: #1a56db;
}

/* Pricing */
.pricing-row {
  display: flex;
  align-items: center;
  gap: 0;
}

.pricing-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.pricing-divider {
  width: 1rpx;
  height: 60rpx;
  background: #e5e7eb;
}

.pricing-label {
  font-size: 24rpx;
  color: #9ca3af;
}

.pricing-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #111827;
}

/* Tags */
.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag {
  border-radius: 20rpx;
  padding: 10rpx 24rpx;
}

.tag text {
  font-size: 24rpx;
  font-weight: 500;
}

.tag.skill {
  background: #eff6ff;
}

.tag.skill text { color: #1a56db; }

.tag.lang {
  background: #f0fdf4;
}

.tag.lang text { color: #16a34a; }

/* Empty inline */
.empty-inline {
  padding: 8rpx 0;
}

.muted { color: #9ca3af; font-size: 26rpx; }

/* Portfolio */
.portfolio-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.portfolio-item {
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
}

.portfolio-url {
  font-size: 24rpx;
  color: #1a56db;
  word-break: break-all;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx;
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

/* ─── Drawer ──────────────────────────────────────────────── */
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
  to { opacity: 1; }
}

.drawer {
  width: 100%;
  max-width: min(390px, 100vw);
  max-height: 85vh;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  position: relative;
  z-index: 1001;
  touch-action: pan-y;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 20rpx;
  border-bottom: 1rpx solid #f3f4f6;
  flex-shrink: 0;
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
  flex: 1;
  min-height: 0;
  padding: 28rpx 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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

/* Checkbox grid */
.checkbox-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.checkbox-item {
  border: 2rpx solid #e5e7eb;
  border-radius: 20rpx;
  padding: 14rpx 28rpx;
  background: #f9fafb;
}

.checkbox-item text {
  font-size: 26rpx;
  color: #374151;
}

.checkbox-item.selected {
  background: #eff6ff;
  border-color: #1a56db;
}

.checkbox-item.selected text { color: #1a56db; font-weight: 600; }

.drawer-footer {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 32rpx;
  padding-bottom: max(20rpx, env(safe-area-inset-bottom, 20rpx));
  border-top: 1rpx solid #f3f4f6;
  background: #ffffff;
  flex-shrink: 0;
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
