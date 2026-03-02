<template>
  <view class="companion-collaboration-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('companion.collaborationTitle')" />
      <view class="phone-inner">
        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ t("merchant.loading") }}</text>
        </view>

        <view v-else class="content">
          <!-- Merchant Partners -->
          <view class="section">
            <view class="section-header">
              <text class="section-title">{{ t("companion.collaboration.merchantPartners") }}</text>
            </view>

            <view v-if="partners.length === 0" class="empty-state">
              <text class="empty-icon">🤝</text>
              <text class="empty-title">{{ t("companion.collaboration.noPartners") }}</text>
              <text class="empty-desc">{{ t("companion.collaboration.noPartnersDesc") }}</text>
            </view>

            <view v-else class="partner-list">
              <view v-for="p in partners" :key="p.id" class="partner-card">
                <view class="partner-avatar">
                  <text class="partner-initial">{{ p.name.charAt(0).toUpperCase() }}</text>
                </view>
                <view class="partner-info">
                  <text class="partner-name">{{ p.name }}</text>
                  <text class="partner-meta">{{ p.city }} · {{ p.tours_count }} {{ t("companion.collaboration.tours") }}</text>
                </view>
                <view class="partner-badge" :class="p.status.toLowerCase()">
                  <text>{{ statusLabel(p.status) }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- Invitations -->
          <view class="section">
            <view class="section-header">
              <text class="section-title">{{ t("companion.collaboration.invitations") }}</text>
            </view>
            <view v-if="invitations.length === 0" class="empty-state">
              <text class="empty-title">{{ t("companion.collaboration.noInvitations") }}</text>
            </view>
            <view v-else class="invitation-list">
              <view v-for="inv in invitations" :key="inv.id" class="invitation-card">
                <view class="inv-info">
                  <text class="inv-merchant">{{ inv.merchant_name }}</text>
                  <text class="inv-tour">{{ inv.tour_name }}</text>
                  <text class="inv-date">{{ inv.date }}</text>
                </view>
                <view class="inv-actions">
                  <view class="btn-small-outline" @click="rejectInvitation(inv.id)">
                    <text>{{ t("companion.collaboration.reject") }}</text>
                  </view>
                  <view class="btn-small-primary" @click="acceptInvitation(inv.id)">
                    <text>{{ t("companion.collaboration.accept") }}</text>
                  </view>
                </view>
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
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { getAccessToken } from "../api/auth";
import { ROUTES } from "../routes";
import { showToast } from "../utils/toast";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";

const { t } = useI18n();

interface Partner {
  id: string;
  name: string;
  city: string;
  tours_count: number;
  status: "ACTIVE" | "PENDING" | "INACTIVE";
}

interface Invitation {
  id: string;
  merchant_name: string;
  tour_name: string;
  date: string;
}

const loading = ref(true);
const partners = ref<Partner[]>([]);
const invitations = ref<Invitation[]>([]);

function statusLabel(s: string): string {
  if (s === "ACTIVE") return t("companion.collaboration.statusActive");
  if (s === "PENDING") return t("companion.collaboration.statusPending");
  return t("companion.collaboration.statusInactive");
}

async function acceptInvitation(id: string) {
  invitations.value = invitations.value.filter((i) => i.id !== id);
  showToast({ title: t("companion.collaboration.accepted"), icon: "success" });
}

async function rejectInvitation(id: string) {
  invitations.value = invitations.value.filter((i) => i.id !== id);
  showToast({ title: t("companion.collaboration.rejected"), icon: "none" });
}

onMounted(async () => {
  const token = getAccessToken();
  if (!token) { uni.reLaunch({ url: ROUTES.LOGIN }); return; }
  loading.value = false;
  // Mock data
  partners.value = [
    { id: "1", name: "Shanghai Travels Co.", city: "Shanghai", tours_count: 12, status: "ACTIVE" },
    { id: "2", name: "Beijing Adventure Tours", city: "Beijing", tours_count: 5, status: "PENDING" },
  ];
  invitations.value = [
    { id: "inv1", merchant_name: "Yunnan Explorer", tour_name: "Lijiang Ancient Town Tour", date: "2026-03-15" },
  ];
});
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.companion-collaboration-page {
  min-height: 100vh; height: 100vh; background: #f1f5f9; box-sizing: border-box; overflow: hidden; padding-bottom: 56px;
}
.phone-frame {
  width: 100%; height: 100%; min-height: 0; display: flex; flex-direction: column; margin: 0 auto; padding: 0; box-sizing: border-box;
}
.phone-inner {
  width: 100%; height: 100%; min-height: 0; flex: 1; margin: 0 auto; padding: 24rpx 24rpx 48rpx; box-sizing: border-box; background: #f8fafc; overflow: auto;
}
@media (min-width: 768px) {
  .companion-collaboration-page { padding: 32rpx 0 32rpx; display: flex; align-items: flex-start; justify-content: center; background: #e2e8f0; }
  .phone-frame { width: 100%; max-width: min(390px, 100vw); height: 100%; overflow: hidden; background: #ffffff; }
  .phone-inner { background: #f8fafc; }
}
.loading-container { padding: 64rpx 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.loading-spinner { width: 48rpx; height: 48rpx; border-radius: 999px; border: 6rpx solid #e2e8f0; border-top-color: #EF4444; animation: spin 1s linear infinite; margin-bottom: 16rpx; }
.loading-text { font-size: 26rpx; color: #64748b; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.content { padding-bottom: 24rpx; }
.section { margin-bottom: 24rpx; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #0f172a; }
.empty-state { background: #ffffff; border: 1rpx dashed #e2e8f0; border-radius: 16rpx; padding: 48rpx 32rpx; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12rpx; }
.empty-icon { font-size: 48rpx; }
.empty-title { font-size: 28rpx; font-weight: 600; color: #334155; }
.empty-desc { font-size: 24rpx; color: #94a3b8; }
.partner-list { display: flex; flex-direction: column; gap: 14rpx; }
.partner-card { background: #ffffff; border: 1rpx solid #e2e8f0; border-radius: 16rpx; padding: 20rpx; display: flex; align-items: center; gap: 16rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04); }
.partner-avatar { width: 72rpx; height: 72rpx; border-radius: 999px; background: linear-gradient(135deg, #EF4444, #f97316); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.partner-initial { font-size: 32rpx; font-weight: 700; color: #ffffff; }
.partner-info { flex: 1; min-width: 0; }
.partner-name { display: block; font-size: 28rpx; font-weight: 600; color: #0f172a; margin-bottom: 4rpx; }
.partner-meta { display: block; font-size: 24rpx; color: #64748b; }
.partner-badge { padding: 6rpx 14rpx; border-radius: 999px; font-size: 22rpx; }
.partner-badge.active { background: #f0fdf4; color: #16a34a; }
.partner-badge.pending { background: #fffbeb; color: #d97706; }
.partner-badge.inactive { background: #f1f5f9; color: #64748b; }
.invitation-list { display: flex; flex-direction: column; gap: 14rpx; }
.invitation-card { background: #ffffff; border: 1rpx solid #e2e8f0; border-radius: 16rpx; padding: 20rpx; box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04); }
.inv-info { margin-bottom: 16rpx; }
.inv-merchant { display: block; font-size: 26rpx; font-weight: 600; color: #0f172a; margin-bottom: 4rpx; }
.inv-tour { display: block; font-size: 26rpx; color: #334155; margin-bottom: 4rpx; }
.inv-date { display: block; font-size: 24rpx; color: #64748b; }
.inv-actions { display: flex; gap: 12rpx; }
.btn-small-outline { flex: 1; border: 1rpx solid #e2e8f0; color: #334155; border-radius: 10rpx; padding: 14rpx; font-size: 26rpx; text-align: center; }
.btn-small-primary { flex: 1; background: #EF4444; color: #ffffff; border-radius: 10rpx; padding: 14rpx; font-size: 26rpx; font-weight: 600; text-align: center; }
</style>
