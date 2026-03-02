<template>
  <view class="landing app-font">
    <view class="phone-frame">
      <PageHead />
      <view class="phone-inner">
        <!-- Hero with photo -->
        <view class="hero">
          <image
            class="hero-img"
            src="https://images.unsplash.com/photo-1508807527931-3cbbddc336e6?w=800"
            mode="aspectFill"
          />
          <view class="hero-overlay" />
          <view class="hero-content">
            <view class="hero-badge">{{ t('landing.heroBadge') }}</view>
            <text class="hero-title">{{ t('landing.heroTitle') }}</text>
            <text class="hero-sub">{{ t('landing.heroSub') }}</text>
          </view>
        </view>

        <!-- Intro: for merchants & companions -->
        <view class="section">
          <text class="section-title">{{ t('landing.sectionIntroTitle') }}</text>
          <text class="section-desc">{{ t('landing.sectionIntroDesc') }}</text>
        </view>

        <!-- For Merchants & Companions -->
        <view class="section">
          <text class="section-title">{{ t('landing.sectionForTitle') }}</text>
          <view class="photo-card">
            <image
              class="photo-card-img"
              src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
              mode="aspectFill"
            />
            <view class="photo-card-body">
              <text class="photo-card-title">{{ t('landing.cardMerchantTitle') }}</text>
              <text class="photo-card-desc">{{ t('landing.cardMerchantDesc') }}</text>
            </view>
          </view>
          <view class="photo-card">
            <image
              class="photo-card-img"
              src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"
              mode="aspectFill"
            />
            <view class="photo-card-body">
              <text class="photo-card-title">{{ t('landing.cardGuideTitle') }}</text>
              <text class="photo-card-desc">{{ t('landing.cardGuideDesc') }}</text>
            </view>
          </view>
        </view>

        <!-- Trust & Safety -->
        <view class="section trust">
          <text class="section-title">{{ t('landing.sectionTrustTitle') }}</text>
          <view class="trust-list">
            <view class="trust-item">
              <text class="trust-icon">✓</text>
              <text class="trust-text">{{ t('landing.trust1') }}</text>
            </view>
            <view class="trust-item">
              <text class="trust-icon">✓</text>
              <text class="trust-text">{{ t('landing.trust2') }}</text>
            </view>
            <view class="trust-item">
              <text class="trust-icon">✓</text>
              <text class="trust-text">{{ t('landing.trust3') }}</text>
            </view>
          </view>
        </view>

        <!-- Bottom: Login/Logout & Join -->
        <view class="cta-section">
          <button class="btn btn-primary" @click="isLoggedIn ? handleLogout() : goLogin()">
            {{ isLoggedIn ? t('common.logout') : t('landing.ctaLogin') }}
          </button>
          <button v-if="!isLoggedIn" class="btn btn-outline" @click="goRegister">{{ t('landing.ctaJoin') }}</button>
        </view>

        <view class="footer">
          <text class="footer-text">{{ t('landing.footer') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useI18n } from "vue-i18n";
import { ROUTES } from "../../routes";
import { getAccessToken, clearAccessToken, clearRefreshToken } from "../../api/auth";
import { showToast } from "../../utils/toast";
import PageHead from "../../components/PageHead.vue";

const { t } = useI18n();
const isLoggedIn = ref(false);

function checkLoginStatus() {
  const token = getAccessToken();
  isLoggedIn.value = !!token;
}

onMounted(() => {
  checkLoginStatus();
});

onShow(() => {
  // Update login status when page is shown (e.g., after returning from login)
  checkLoginStatus();
});

function goRegister() {
  uni.navigateTo({ url: ROUTES.REGISTER });
}

function goLogin() {
  uni.navigateTo({ url: ROUTES.LOGIN });
}

function handleLogout() {
  clearAccessToken();
  clearRefreshToken();
  isLoggedIn.value = false;
  showToast({ title: t("common.logoutSuccess"), icon: "success" });
  // Reload the page to ensure clean state
  setTimeout(() => {
    uni.reLaunch({ url: ROUTES.INDEX });
  }, 500);
}
</script>

<style scoped>
/* Chinese app font stack: Noto Sans SC (loaded in index.html) + system fallbacks */
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.landing {
  min-height: 100vh;
  height: 100vh;
  padding-top: 0;
  background: #f1f5f9;
  box-sizing: border-box;
  overflow: hidden;
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
}

@media (min-width: 768px) {
  .landing {
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

/* Hero - light theme */
.hero {
  position: relative;
  width: 100%;
  height: 340rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
}

.hero-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #e2e8f0;
}

.hero-overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(248,250,252,0.92) 60%, #f8fafc 100%);
}

.hero-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 32rpx 28rpx 40rpx;
  text-align: center;
}

.hero-badge {
  display: inline-block;
  padding: 10rpx 28rpx;
  background: rgba(255, 255, 255, 0.95);
  color: #475569;
  font-size: 24rpx;
  font-weight: 500;
  letter-spacing: 0.5rpx;
  border-radius: 999rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.hero-title {
  display: block;
  font-size: 44rpx;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.35;
  margin-bottom: 18rpx;
  letter-spacing: 1rpx;
}

.hero-sub {
  display: block;
  font-size: 28rpx;
  font-weight: 400;
  color: #475569;
  line-height: 1.6;
  letter-spacing: 0.2rpx;
}

/* Section */
.section {
  margin-bottom: 48rpx;
  padding: 0 28rpx;
}

.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20rpx;
  padding: 0 4rpx;
  letter-spacing: 0.5rpx;
  line-height: 1.4;
}

.section-desc {
  display: block;
  font-size: 28rpx;
  font-weight: 400;
  color: #64748b;
  line-height: 1.65;
  letter-spacing: 0.2rpx;
}

/* Photo card - light theme */
.photo-card {
  border-radius: 20rpx;
  overflow: hidden;
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.photo-card-img {
  width: 100%;
  height: 240rpx;
  display: block;
  background: #e2e8f0;
}

.photo-card-body {
  padding: 24rpx 28rpx;
}

.photo-card-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12rpx;
  letter-spacing: 0.3rpx;
  line-height: 1.4;
}

.photo-card-desc {
  display: block;
  font-size: 27rpx;
  font-weight: 400;
  color: #64748b;
  line-height: 1.6;
  letter-spacing: 0.2rpx;
}

/* Trust & Safety */
.section.trust {
  padding-left: 32rpx;
  padding-right: 32rpx;
  box-sizing: border-box;
}

.trust {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 40rpx;
  margin-left: 28rpx;
  margin-right: 28rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.trust-list {
  margin-top: 16rpx;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.trust-item:last-child {
  border-bottom: none;
}

.trust-icon {
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  background: #EF4444;
  color: #fff;
  border-radius: 50%;
  font-size: 24rpx;
  font-weight: 700;
}

.trust-text {
  font-size: 28rpx;
  font-weight: 400;
  color: #475569;
  line-height: 1.5;
  letter-spacing: 0.2rpx;
}

/* CTA - light theme primary */
.cta-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 40rpx 28rpx 32rpx;
}

.btn {
  width: 100%;
  padding: 30rpx 32rpx;
  font-size: 32rpx;
  font-weight: 500;
  letter-spacing: 0.5rpx;
  border-radius: 16rpx;
  border: none;
  text-align: center;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
  color: #fff;
  box-shadow: 0 4rpx 14rpx rgba(239, 68, 68, 0.35);
}

.btn-outline {
  background: transparent;
  color: #F97316;
  border: 2rpx solid #EF4444;
}

.footer {
  text-align: center;
  padding: 24rpx 28rpx;
}

.footer-text {
  font-size: 24rpx;
  font-weight: 400;
  color: #94a3b8;
  letter-spacing: 0.2rpx;
}
</style>
