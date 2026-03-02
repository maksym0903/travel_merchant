<template>
  <view class="profile-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('merchant.profileTitle')" />
      <view class="phone-inner">
        <view class="profile-inner">
          <view class="header">
            <text class="page-sub">{{ t('merchant.profileSubtitle') }}</text>
          </view>

          <view v-if="loading" class="loading-state">
            <text class="loading-text">{{ t('merchant.loading') }}</text>
          </view>

          <view v-else class="form">
            <view class="field">
              <text class="label">{{ t('merchant.logo') }}</text>
              <view class="logo-upload">
                <view class="logo-preview" @click="selectLogo">
                  <image
                    v-if="logoUrl"
                    :src="logoUrl"
                    mode="aspectFit"
                    class="logo-image"
                  />
                  <view v-else class="logo-placeholder">
                    <text class="logo-placeholder-text">{{ t('merchant.logoPlaceholder') }}</text>
                  </view>
                  <view v-if="logoUploading" class="logo-overlay">
                    <text class="logo-uploading-text">{{ t('merchant.logoUploading') }}</text>
                  </view>
                </view>
              </view>
            </view>
            <view class="field">
              <text class="label">{{ t('merchant.businessName') }} *</text>
              <TextInput
                v-model="businessName"
                type="text"
                :placeholder="t('merchant.businessNamePlaceholder')"
              />
            </view>
            <view class="field">
              <text class="label">{{ t('merchant.description') }}</text>
              <TextArea
                v-model="description"
                :placeholder="t('merchant.descriptionPlaceholder')"
                :maxlength="500"
              />
            </view>
            <view class="field">
              <text class="label">{{ t('merchant.address') }}</text>
              <TextInput
                v-model="address"
                type="text"
                :placeholder="t('merchant.addressPlaceholder')"
              />
            </view>
            <view class="field">
              <text class="label">{{ t('merchant.contactEmail') }}</text>
              <TextInput
                v-model="contactEmail"
                type="email"
                :placeholder="t('merchant.contactEmailPlaceholder')"
              />
            </view>
            <button class="btn btn-primary" :disabled="submitting" @click="onSubmit">
              {{ submitting ? t('merchant.submitting') : t('merchant.save') }}
            </button>
          </view>

          <view class="footer-links">
            <text class="link" @click="goDashboard">{{ t('merchant.skipToDashboard') }}</text>
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
import { getMerchantProfile, updateMerchantProfile } from "../api/merchant";
import { uploadLogo, getFilePathFromUploadResponse, getFileUrl } from "../api/uploadLogo";
import { ROUTES } from "../routes";
import { showToast } from "../utils/toast";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";
import TextInput from "../components/TextInput.vue";
import TextArea from "../components/TextArea.vue";

const { t } = useI18n();
const businessName = ref("");
const description = ref("");
const address = ref("");
const contactEmail = ref("");
const logoUrl = ref("");
const loading = ref(true);
const submitting = ref(false);
const logoUploading = ref(false);

onMounted(async () => {
  const token = getAccessToken();
  if (!token) {
    uni.reLaunch({ url: ROUTES.LOGIN });
    return;
  }
  try {
    const profile = await getMerchantProfile(token);
    businessName.value = profile.business_name ?? "";
    description.value = profile.description ?? "";
    address.value = profile.address ?? "";
    contactEmail.value = profile.contact_email ?? "";
    logoUrl.value = profile.logo_url ?? "";
  } catch {
    showToast({ title: t("merchant.loadError"), icon: "none" });
  } finally {
    loading.value = false;
  }
});

function selectLogo() {
  if (logoUploading.value) return;
  
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0];
      if (!tempFilePath) return;
      
      // Convert to File for upload - preserve original format
      try {
        const fileResponse = await fetch(tempFilePath);
        const blob = await fileResponse.blob();
        // Detect file extension from tempFilePath or blob type
        const lastDot = tempFilePath.lastIndexOf(".");
        let extension = lastDot > 0 ? tempFilePath.substring(lastDot).toLowerCase() : "";
        // If no extension in path, try to get from MIME type
        if (!extension && blob.type) {
          const mimeMap: Record<string, string> = {
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/png": ".png",
            "image/gif": ".gif",
            "image/webp": ".webp",
            "image/bmp": ".bmp",
          };
          extension = mimeMap[blob.type.toLowerCase()] || ".jpg";
        }
        const filename = `logo${extension || ".jpg"}`;
        const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
        
        await handleLogoUpload(file);
      } catch (error) {
        // Fallback: use uni.uploadFile for better compatibility
        handleLogoUploadUni(tempFilePath);
      }
    },
    fail: () => {
      // User cancelled or error
    },
  });
}

async function handleLogoUpload(file: File) {
  const token = getAccessToken();
  if (!token) {
    uni.reLaunch({ url: ROUTES.LOGIN });
    return;
  }
  
  logoUploading.value = true;
  try {
    const response = await uploadLogo(file);
    // Get the file path from upload response (e.g., "550e8400-e29b-41d4-a716-446655440000.jpg")
    const filePath = getFilePathFromUploadResponse(response);
    
    if (!filePath) {
      throw new Error("Upload response missing file path");
    }
    
    // Construct full URL using GET /files/{path}
    const fullUrl = getFileUrl(filePath);
    
    // Update profile with new logo URL
    const profile = await updateMerchantProfile(token, {
      logo_url: fullUrl,
    });
    
    logoUrl.value = profile.logo_url ?? fullUrl;
    showToast({ title: t("merchant.logoUploadSuccess"), icon: "success" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.logoUploadError");
    showToast({ title: msg, icon: "none" });
  } finally {
    logoUploading.value = false;
  }
}

function handleLogoUploadUni(tempFilePath: string) {
  const token = getAccessToken();
  if (!token) {
    uni.reLaunch({ url: ROUTES.LOGIN });
    return;
  }
  
  logoUploading.value = true;
  
  // Get upload URL
  const CDN_BASE = (import.meta.env?.VITE_CDN_BASE_URL as string) ?? "";
  const base = CDN_BASE ? CDN_BASE.replace(/\/$/, "") : "";
  const uploadUrl = base ? `${base}/upload` : "/upload";
  
  // Generate UUID filename with proper extension
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  // Extract extension from tempFilePath - preserve original format (jpg, png, webp, etc.)
  const lastDot = tempFilePath.lastIndexOf(".");
  let extension = lastDot > 0 ? tempFilePath.substring(lastDot).toLowerCase() : "";
  // Common image extensions - if not found, default to .jpg
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
  if (!extension || !validExtensions.includes(extension)) {
    extension = ".jpg";
  }
  const filename = `${uuid}${extension}`;
  
  uni.uploadFile({
    url: uploadUrl,
    filePath: tempFilePath,
    name: "file",
    fileName: filename,
    header: {
      Authorization: `Bearer ${token}`,
    },
    success: async (uploadRes) => {
      try {
        const data = typeof uploadRes.data === "string" ? JSON.parse(uploadRes.data) : uploadRes.data;
        // Try different possible response formats
        const uploadedUrl = 
          data.data?.url || 
          data.data?.filename ||
          data.url ||
          data.filename ||
          (typeof data === "string" ? data : null);
        
        if (!uploadedUrl) {
          throw new Error("Upload response missing URL");
        }
        
        // Construct full URL if needed
        const CDN_BASE = (import.meta.env?.VITE_CDN_BASE_URL as string) ?? "";
        const fullUrl = uploadedUrl.startsWith("http") 
          ? uploadedUrl 
          : CDN_BASE 
            ? `${CDN_BASE.replace(/\/$/, "")}/${uploadedUrl.replace(/^\//, "")}`
            : uploadedUrl;
        
        // Update profile with new logo URL
        const profile = await updateMerchantProfile(token, {
          logo_url: fullUrl,
        });
        
        logoUrl.value = profile.logo_url ?? fullUrl;
        showToast({ title: t("merchant.logoUploadSuccess"), icon: "success" });
      } catch (e) {
        const msg = e instanceof Error ? e.message : t("merchant.logoUploadError");
        showToast({ title: msg, icon: "none" });
      } finally {
        logoUploading.value = false;
      }
    },
    fail: () => {
      showToast({ title: t("merchant.logoUploadError"), icon: "none" });
      logoUploading.value = false;
    },
  });
}

function goDashboard() {
  uni.reLaunch({ url: ROUTES.DASHBOARD });
}

async function onSubmit() {
  const name = businessName.value.trim();
  if (!name) {
    showToast({ title: t("merchant.businessNameRequired"), icon: "none" });
    return;
  }
  const token = getAccessToken();
  if (!token) {
    uni.reLaunch({ url: ROUTES.LOGIN });
    return;
  }
  submitting.value = true;
  try {
    await updateMerchantProfile(token, {
      business_name: name,
      description: description.value.trim() || undefined,
      address: address.value.trim() || undefined,
      contact_email: contactEmail.value.trim() || undefined,
      logo_url: logoUrl.value || undefined,
    });
    showToast({ title: t("merchant.saved"), icon: "success" });
    setTimeout(() => {
      uni.reLaunch({ url: ROUTES.DASHBOARD });
    }, 600);
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.saveError");
    showToast({ title: msg, icon: "none" });
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.profile-page {
  min-height: 100vh;
  height: 100vh;
  width: 100%;
  background: #f1f5f9;
  padding: 0;
  padding-bottom: 56px;
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

.profile-inner {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0;
  box-sizing: border-box;
}

.header {
  margin-bottom: 8rpx;
}

.page-sub {
  display: block;
  font-size: 28rpx;
  color: #64748b;
  margin-bottom: 32rpx;
  line-height: 1.5;
}

.loading-state {
  text-align: center;
  padding: 80rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #64748b;
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

/* Profile form inputs: border, border-radius, padding */
.form :deep(.text-input-wrap input),
.form :deep(.text-input-native),
.form :deep(.textarea-wrap textarea),
.form :deep(.textarea-native) {
  width: 100%;
  padding: 24rpx 28rpx;
  font-size: 30rpx;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12rpx;
  box-sizing: border-box;
  font-family: inherit;
}

.form :deep(.textarea-wrap textarea),
.form :deep(.textarea-native) {
  min-height: 160rpx;
  resize: none;
}

.logo-upload {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-preview {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  border: 2rpx dashed #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
}

.logo-placeholder-text {
  font-size: 24rpx;
  color: #94a3b8;
  text-align: center;
}

.logo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-uploading-text {
  font-size: 24rpx;
  color: #fff;
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
}

.link {
  font-size: 28rpx;
  color: #EF4444;
  padding: 16rpx;
}

@media (min-width: 768px) {
  .profile-page {
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

  .phone-inner {
    border: none;
    border-radius: 0;
    background: #f8fafc;
  }
}
</style>
