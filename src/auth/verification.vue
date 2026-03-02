<template>
  <view class="verify-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('verification.title')" />
      <view class="phone-inner">
        <view class="verify-inner">
          <view class="header">
            <text class="page-sub">{{ t('verification.subtitle', { phone: maskedPhone }) }}</text>
          </view>

          <view class="form">
            <view class="field">
              <text class="label">{{ t('verification.codeLabel') }}</text>
              <!-- #ifdef H5 -->
              <view ref="codeContainerRef" class="code-input-slot" />
              <!-- #endif -->
              <!-- #ifndef H5 -->
              <input
                v-model="code"
                class="code-input"
                type="tel"
                inputmode="numeric"
                maxlength="6"
                :placeholder="t('verification.codePlaceholder')"
              />
              <!-- #endif -->
            </view>
            <button class="btn btn-primary" :disabled="loading || !isCodeComplete" @click="onSubmit">
              {{ loading ? t('verification.submitting') : t('verification.submit') }}
            </button>
            <view class="resend-row">
              <text
                class="resend-link"
                :class="{ disabled: resendCooldown > 0 }"
                @click="onResend"
              >
                {{ resendCooldown > 0 ? t('verification.resendIn', { seconds: resendCooldown }) : t('verification.resend') }}
              </text>
            </view>
          </view>

          <view class="footer-links">
            <text class="link" @click="goBack">{{ t('verification.back') }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { ROUTES } from "../routes";
import { showToast } from "../utils/toast";
import { useI18n } from "vue-i18n";
import { verifyPhone, sendPhoneCode } from "../api/auth";
import PageHead from "../components/PageHead.vue";

const { t } = useI18n();

const phoneNumber = ref("");
const code = ref("");
const loading = ref(false);
const resendCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

// #ifdef H5
const codeContainerRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null);
let nativeCodeInput: HTMLInputElement | null = null;

function getCodeInputEl(): HTMLInputElement | null {
  if (nativeCodeInput) return nativeCodeInput;
  const container = codeContainerRef.value;
  const el = (container && (container as { $el?: HTMLElement }).$el) || (container as HTMLElement);
  return el?.querySelector?.(".code-input") ?? null;
}

function onNativeCodeInput() {
  const el = getCodeInputEl();
  if (!el) return;
  const val = (el.value ?? "").replace(/\D/g, "").slice(0, 6);
  el.value = val;
  code.value = val;
}

onMounted(() => {
  readPhoneFromUrl();
  nextTick(() => {
    const container = codeContainerRef.value;
    const el = (container && (container as { $el?: HTMLElement }).$el) || (container as HTMLElement);
    if (!el || !el.appendChild) return;
    const input = document.createElement("input");
    input.type = "tel";
    input.inputMode = "numeric";
    input.maxLength = 6;
    input.placeholder = t("verification.codePlaceholder");
    input.className = "code-input";
    input.value = code.value;
    input.addEventListener("input", onNativeCodeInput);
    el.appendChild(input);
    nativeCodeInput = input;
  });
});

onBeforeUnmount(() => {
  if (nativeCodeInput && nativeCodeInput.parentNode) {
    nativeCodeInput.removeEventListener("input", onNativeCodeInput);
    nativeCodeInput.parentNode.removeChild(nativeCodeInput);
  }
  nativeCodeInput = null;
});
// #endif

onLoad((query?: { phone_number?: string }) => {
  const p = query?.phone_number ?? "";
  if (p) phoneNumber.value = p;
});

// H5: read phone_number from URL on mount (navigateTo query)
function readPhoneFromUrl() {
  if (typeof window === "undefined") return;
  const q = new URLSearchParams(window.location.search);
  const p = q.get("phone_number");
  if (p && !phoneNumber.value) phoneNumber.value = p;
}

const maskedPhone = computed(() => {
  const p = phoneNumber.value;
  if (!p || p.length < 4) return "***";
  return "*".repeat(Math.min(p.length - 4, 6)) + p.slice(-4);
});

const isCodeComplete = computed(() => code.value.length === 6);

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: ROUTES.INDEX });
  }
}

function startResendCooldown() {
  resendCooldown.value = 60;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    resendCooldown.value -= 1;
    if (resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

async function onResend() {
  if (resendCooldown.value > 0 || !phoneNumber.value) return;
  try {
    await sendPhoneCode(phoneNumber.value);
    showToast({ title: t("verification.codeSent"), icon: "success" });
    startResendCooldown();
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("verification.errorGeneric");
    showToast({ title: msg, icon: "none" });
  }
}

async function onSubmit() {
  if (!isCodeComplete.value || !phoneNumber.value) return;
  loading.value = true;
  try {
    await verifyPhone(phoneNumber.value, code.value);
    showToast({ title: t("verification.success"), icon: "success" });
    setTimeout(() => {
      uni.reLaunch({ url: ROUTES.LOGIN });
    }, 1500);
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("verification.errorGeneric");
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

.verify-page {
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

.verify-inner {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0;
  box-sizing: border-box;
}

.header {
  margin-bottom: 8rpx;
}

@media (min-width: 768px) {
  .verify-page {
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

.page-sub {
  display: block;
  font-size: 28rpx;
  color: #64748b;
  margin-bottom: 48rpx;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: break-word;
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

.label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
  margin-bottom: 12rpx;
}

.code-input-slot {
  display: flex;
  width: 100%;
  min-height: 2.75rem;
  box-sizing: border-box;
}

.code-input {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.75rem 1rem;
  font-size: 1.5rem;
  letter-spacing: 0.4em;
  text-align: center;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-sizing: border-box;
}

.code-input:focus {
  outline: none;
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

.btn-primary[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

.resend-row {
  text-align: center;
  margin-top: 24rpx;
}

.resend-link {
  font-size: 28rpx;
  color: #EF4444;
  padding: 16rpx;
}

.resend-link.disabled {
  color: #94a3b8;
  cursor: not-allowed;
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
