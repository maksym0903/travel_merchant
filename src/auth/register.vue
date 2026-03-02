<template>
  <view class="register-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('register.title')" />
      <view class="phone-inner">
        <view class="register-inner">
          <view class="header">
            <text class="page-sub">{{ t('register.subtitle') }}</text>
          </view>

          <view class="form">
            <view class="field">
              <text class="label">{{ t('register.roleLabel') }}</text>
              <view class="role-options">
                <view
                  class="role-option"
                  :class="{ active: role === 'MERCHANT' }"
                  @click="role = 'MERCHANT'"
                >
                  <text class="role-text">{{ t('register.roleMerchant') }}</text>
                </view>
                <view
                  class="role-option"
                  :class="{ active: role === 'COMPANION' }"
                  @click="role = 'COMPANION'"
                >
                  <text class="role-text">{{ t('register.roleCompanion') }}</text>
                </view>
              </view>
            </view>
            <view class="field">
              <text class="label">{{ t('register.phoneLabel') }}</text>
              <PhoneNumberInput v-model="phone" :placeholder="t('register.phonePlaceholder')" default-country="CN" />
            </view>
            <view class="field">
              <text class="label">{{ t('register.passwordLabel') }}</text>
              <PasswordInput v-model="password" :placeholder="t('register.passwordPlaceholder')" />
            </view>
            <view class="field">
              <text class="label">{{ t('register.confirmPasswordLabel') }}</text>
              <PasswordInput v-model="confirmPassword" :placeholder="t('register.confirmPasswordPlaceholder')" />
            </view>
            <button class="btn btn-primary" :disabled="loading" @click="onSubmit">
              {{ loading ? t('register.submitting') : t('register.submit') }}
            </button>
          </view>

          <view class="footer-links">
            <text class="link" @click="goLogin">{{ t('register.goLogin') }}</text>
            <text class="link" @click="goBack">{{ t('register.back') }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { register as registerApi } from "../api/auth";
import type { RegisterRole } from "../api/auth";
import { ROUTES, verificationUrl } from "../routes";
import { showToast } from "../utils/toast";
import PageHead from "../components/PageHead.vue";
import PhoneNumberInput from "../components/PhoneNumberInput.vue";
import PasswordInput from "../components/PasswordInput.vue";

const { t } = useI18n();
const role = ref<RegisterRole>("MERCHANT");
const phone = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);

function goLogin() {
  uni.navigateTo({ url: ROUTES.LOGIN });
}

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: ROUTES.INDEX });
  }
}

async function onSubmit() {
  const p = phone.value.trim();
  const pw = password.value;
  if (!p) {
    showToast({ title: t("register.phoneRequired"), icon: "none" });
    return;
  }
  if (!pw) {
    showToast({ title: t("register.passwordRequired"), icon: "none" });
    return;
  }
  if (pw.length < 6) {
    showToast({ title: t("register.passwordMinLength"), icon: "none" });
    return;
  }
  if (pw !== confirmPassword.value) {
    showToast({ title: t("register.passwordMismatch"), icon: "none" });
    return;
  }
  loading.value = true;
  try {
    await registerApi({
      phone_number: p,
      password: pw,
      role: role.value,
    });
    showToast({ title: t("register.success"), icon: "success" });
    const url = verificationUrl(p);
    setTimeout(() => {
      uni.navigateTo({ url });
    }, 800);
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("register.errorGeneric");
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

.register-page {
  min-height: 100vh;
  height: 100vh;
  width: 100%;
  background: #f1f5f9;
  padding: 0;
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
  padding: 48rpx 32rpx 48rpx;
  box-sizing: border-box;
  background: #f8fafc;
  border: none;
  overflow: auto;
}

.register-inner {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .register-page {
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
  overflow-wrap: break-word;
  word-break: break-word;
}

.header {
  margin-bottom: 8rpx;
}

.role-options {
  display: flex;
  gap: 20rpx;
  margin-top: 12rpx;
}

.role-option {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e2e8f0;
  background: #f8fafc;
  text-align: center;
}

.role-option.active {
  border-color: #EF4444;
  background: rgba(14, 165, 233, 0.08);
}

.role-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
}

.role-option.active .role-text {
  color: #F97316;
}

.form {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
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

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #1e293b;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  box-sizing: border-box;
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
  box-shadow: 0 4rpx 14rpx rgba(14, 165, 233, 0.35);
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
