<template>
  <view class="login-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('login.title')" />
      <view class="phone-inner">
        <view class="login-inner">
          <view class="header">
            <text class="page-sub">{{ t('login.subtitle') }}</text>
          </view>

          <view class="form">
            <view class="field">
              <text class="label">{{ t('login.phoneLabel') }}</text>
              <PhoneNumberInput v-model="phone" :placeholder="t('login.phonePlaceholder')" default-country="CN" />
            </view>
            <view class="field">
              <text class="label">{{ t('login.passwordLabel') }}</text>
              <PasswordInput v-model="password" :placeholder="t('login.passwordPlaceholder')" />
            </view>
            <button class="btn btn-primary" :disabled="loading" @click="onSubmit">
              {{ loading ? t('login.submitting') : t('login.submit') }}
            </button>
          </view>

          <view class="footer-links">
            <text class="link" @click="goRegister">{{ t('login.goRegister') }}</text>
            <text class="link" @click="goBack">{{ t('login.back') }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { login as loginApi, getMe, setAccessToken, setRefreshToken, AuthError } from "../api/auth";
import { ROUTES, verificationUrl } from "../routes";
import { showToast } from "../utils/toast";
import PageHead from "../components/PageHead.vue";
import PhoneNumberInput from "../components/PhoneNumberInput.vue";
import PasswordInput from "../components/PasswordInput.vue";

const { t } = useI18n();
const phone = ref("");
const password = ref("");
const loading = ref(false);

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: ROUTES.INDEX });
  }
}

function goRegister() {
  uni.navigateTo({ url: ROUTES.REGISTER });
}

async function onSubmit() {
  const p = phone.value.trim();
  const pw = password.value;
  if (!p) {
    showToast({ title: t("login.phoneRequired"), icon: "none" });
    return;
  }
  if (!pw) {
    showToast({ title: t("login.passwordRequired"), icon: "none" });
    return;
  }
  loading.value = true;
  try {
    const loginRes = await loginApi(p, pw);
    const token = loginRes.data.access_token;
    setAccessToken(token);
    setRefreshToken(loginRes.data.refresh_token);
    showToast({ title: t("login.success"), icon: "success" });
    setTimeout(async () => {
      try {
        const me = await getMe(token);
        const role = me.data.account?.role;
        const profile = me.data.profile as { business_name?: string } | null;
        const hasBusinessName = profile?.business_name?.trim();
        if (role === "MERCHANT" && !hasBusinessName) {
          uni.reLaunch({ url: ROUTES.PROFILE });
        } else if (role === "MERCHANT" && hasBusinessName) {
          uni.reLaunch({ url: ROUTES.DASHBOARD });
        } else if (role === "COMPANION") {
          uni.reLaunch({ url: ROUTES.COMPANION_DASHBOARD });
        } else {
          uni.reLaunch({ url: ROUTES.INDEX });
        }
      } catch {
        uni.reLaunch({ url: ROUTES.INDEX });
      }
    }, 800);
  } catch (e) {
    if (e instanceof AuthError && (e.status === 401 || e.status === 403)) {
      const url = verificationUrl(p);
      uni.reLaunch({ url });
      return;
    }
    const msg = e instanceof Error ? e.message : t("login.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.login-page {
  min-height: 100vh;
  height: 100vh;
  width: 100%;
  background: #f1f5f9;
  padding: 0;
  box-sizing: border-box;
  overflow-x: hidden;
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
  padding: 48rpx 32rpx 48rpx;
  box-sizing: border-box;
  background: #f8fafc;
  border: none;
  overflow: auto;
}

.login-inner {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .login-page {
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
    background: #f8fafc;
  }
}

.header {
  margin-bottom: 8rpx;
}

.page-title {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12rpx;
  letter-spacing: 0.5rpx;
}

.page-sub {
  display: block;
  font-size: 28rpx;
  color: #64748b;
  margin-bottom: 48rpx;
  line-height: 1.5;
}

.form {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.field {
  margin-bottom: 32rpx;
}

.field:last-of-type {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
  margin-bottom: 12rpx;
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

.btn-primary:disabled {
  opacity: 0.7;
}

.footer-links {
  margin-top: 40rpx;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16rpx;
}

.link {
  font-size: 28rpx;
  color: #EF4444;
  padding: 16rpx;
}
</style>
