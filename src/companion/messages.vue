<template>
  <view class="companion-messages-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('companion.messages.title')" />
      <view class="phone-inner">

        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ t("merchant.loading") }}</text>
        </view>

        <view v-else-if="conversations.length === 0" class="empty-state">
          <text class="empty-icon">💬</text>
          <text class="empty-title">{{ t("companion.messages.noConversations") }}</text>
          <text class="empty-desc">{{ t("companion.messages.noConversationsDesc") }}</text>
        </view>

        <view v-else class="conv-list">
          <view
            v-for="conv in conversations"
            :key="conv._id"
            class="conv-row"
            @click="openConversation(conv)"
          >
            <view class="conv-avatar">
              <text class="avatar-text">{{ getOtherParticipantInitial(conv) }}</text>
            </view>
            <view class="conv-info">
              <text class="conv-name">{{ getOtherParticipantLabel(conv) }}</text>
              <text class="conv-sub muted">{{ formatDate(conv.updatedAt) }}</text>
            </view>
            <view class="conv-arrow">
              <text>›</text>
            </view>
          </view>
        </view>

        <view v-if="canLoadMore" class="load-more" @click="loadMore">
          <text>{{ t("companion.messages.loadMore") }}</text>
        </view>
      </view>
    </view>

    <BottomTabBar />

    <!-- Chat overlay — rendered outside phone-frame so it can cover full height -->
    <view v-if="activeConv" class="chat-overlay">
      <view class="chat-frame">
        <!-- Header -->
        <view class="chat-header">
          <view class="chat-back" @click="closeConversation">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </view>
          <text class="chat-title">{{ getOtherParticipantLabel(activeConv) }}</text>
        </view>

        <!-- Messages area -->
        <view class="chat-messages" id="chat-scroll">
          <view v-if="loadingMessages" class="loading-container">
            <view class="loading-spinner"></view>
          </view>
          <view v-else-if="messages.length === 0" class="empty-state small">
            <text class="muted">{{ t("companion.messages.noMessages") }}</text>
          </view>
          <view v-else class="messages-list">
            <view
              v-for="msg in messages"
              :key="msg._id"
              class="msg-bubble"
              :class="msg.sender_id === myUserId ? 'mine' : 'theirs'"
            >
              <text class="msg-text">{{ msg.content }}</text>
              <text class="msg-time">{{ formatTime(msg.createdAt) }}</text>
            </view>
          </view>
        </view>

        <!-- Input row -->
        <view class="chat-input-row">
          <input
            class="chat-input"
            v-model="newMessage"
            :placeholder="t('companion.messages.inputPlaceholder')"
            @confirm="sendMessage"
          />
          <view class="send-btn" :class="{ disabled: sending || !newMessage.trim() }" @click="sendMessage">
            <svg v-if="!sending" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
            <text v-else class="send-dots">…</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getAccessToken, getMe } from "../api/auth";
import {
  getRealConversations,
  getRealMessages,
  sendRealMessage,
  type RealConversation,
  type RealMessage,
} from "../api/companion";
import { ROUTES } from "../routes";
import { showToast } from "../utils/toast";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";

const { t } = useI18n();

const loading = ref(true);
const conversations = ref<RealConversation[]>([]);
const page = ref(1);
const pageSize = 20;
const total = ref(0);
const myUserId = ref("");

const activeConv = ref<RealConversation | null>(null);
const messages = ref<RealMessage[]>([]);
const loadingMessages = ref(false);
const newMessage = ref("");
const sending = ref(false);

const canLoadMore = computed(() => conversations.value.length < total.value);

function getOtherParticipantLabel(conv: RealConversation): string {
  const other = conv.participants.find((p) => p._id !== myUserId.value);
  if (!other) return conv._id.slice(-6);
  return other.phone_number ?? other._id.slice(-6);
}

function getOtherParticipantInitial(conv: RealConversation): string {
  const label = getOtherParticipantLabel(conv);
  return label.charAt(0).toUpperCase();
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  if (diffDays === 1) return t("companion.messages.yesterday");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

async function openConversation(conv: RealConversation) {
  activeConv.value = conv;
  messages.value = [];
  loadingMessages.value = true;
  const token = getAccessToken() ?? "";
  try {
    const res = await getRealMessages(token, conv._id, { limit: 50 });
    messages.value = res.data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    loadingMessages.value = false;
  }
}

function closeConversation() {
  activeConv.value = null;
  messages.value = [];
  newMessage.value = "";
}

async function sendMessage() {
  if (!newMessage.value.trim() || !activeConv.value) return;
  const token = getAccessToken() ?? "";
  sending.value = true;
  try {
    const res = await sendRealMessage(token, activeConv.value._id, newMessage.value.trim());
    messages.value = [...messages.value, res.data];
    newMessage.value = "";
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    sending.value = false;
  }
}

async function loadConversations(append = false) {
  const token = getAccessToken();
  if (!token) { uni.reLaunch({ url: ROUTES.LOGIN }); return; }
  loading.value = true;
  try {
    const res = await getRealConversations(token, { page: page.value, pageSize });
    total.value = res.data.total;
    if (append) conversations.value = [...conversations.value, ...res.data.items];
    else conversations.value = res.data.items;
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (!canLoadMore.value) return;
  page.value += 1;
  await loadConversations(true);
}

onMounted(async () => {
  const token = getAccessToken();
  if (token) {
    try {
      const me = await getMe(token);
      myUserId.value = (me as { _id?: string; id?: string })._id ?? (me as { _id?: string; id?: string }).id ?? "";
    } catch {
      // ignore
    }
  }
  await loadConversations();
});
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.companion-messages-page {
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
  padding: 0;
  box-sizing: border-box;
  background: #f8fafc;
  overflow: auto;
}

@media (min-width: 768px) {
  .companion-messages-page {
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
  .chat-overlay { max-width: min(390px, 100vw); left: 50%; transform: translateX(-50%); }
}

/* Conversation list */
.conv-list {
  background: #ffffff;
}

.conv-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 28rpx;
  border-bottom: 1rpx solid #f3f4f6;
}

.conv-row:last-child { border-bottom: none; }

.conv-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a56db, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
}

.conv-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.conv-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #111827;
}

.conv-arrow {
  font-size: 40rpx;
  color: #d1d5db;
}

/* Loading / empty */
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 32rpx;
  gap: 16rpx;
}

.empty-state.small { padding: 32rpx; }

.empty-icon { font-size: 80rpx; }
.empty-title { font-size: 30rpx; font-weight: 600; color: #374151; }
.empty-desc { font-size: 26rpx; color: #9ca3af; text-align: center; }

.muted { color: #9ca3af; font-size: 24rpx; }

/* Load more */
.load-more {
  text-align: center;
  padding: 28rpx;
  color: #1a56db;
  font-size: 28rpx;
  font-weight: 500;
}

/* ─── Chat overlay ─────────────────────────────────────────── */
.chat-overlay {
  position: fixed;
  /* Mobile: full screen */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f1f5f9;
  z-index: 900;
  display: flex;
  flex-direction: column;
}

.chat-frame {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 28rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #e5e7eb;
  flex-shrink: 0;
}

.chat-back {
  color: #374151;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.chat-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
  flex: 1;
}

/* Scrollable messages */
.chat-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24rpx 20rpx;
  display: flex;
  flex-direction: column;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  flex: 1;
}

.msg-bubble {
  max-width: 72%;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.msg-bubble.mine {
  align-self: flex-end;
  align-items: flex-end;
}

.msg-bubble.theirs {
  align-self: flex-start;
  align-items: flex-start;
}

.msg-text {
  font-size: 28rpx;
  padding: 18rpx 24rpx;
  border-radius: 24rpx;
  line-height: 1.6;
  word-break: break-word;
}

.msg-bubble.mine .msg-text {
  background: #1a56db;
  color: #ffffff;
  border-bottom-right-radius: 6rpx;
}

.msg-bubble.theirs .msg-text {
  background: #ffffff;
  color: #111827;
  border-bottom-left-radius: 6rpx;
  box-shadow: 0 1rpx 4rpx rgba(0,0,0,0.06);
}

.msg-time {
  font-size: 20rpx;
  color: #9ca3af;
  padding: 0 4rpx;
}

/* Input row — always pinned at bottom */
.chat-input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 20rpx;
  padding-bottom: max(20rpx, env(safe-area-inset-bottom, 20rpx));
  background: #ffffff;
  border-top: 1rpx solid #e5e7eb;
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  min-height: 72rpx;
  background: #f3f4f6;
  border-radius: 40rpx;
  padding: 18rpx 28rpx;
  font-size: 28rpx;
  color: #111827;
  outline: none;
  border: none;
}

.send-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #1a56db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.15s;
}

.send-btn svg {
  color: #ffffff;
}

.send-dots {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 700;
}

.send-btn.disabled {
  background: #d1d5db;
  cursor: default;
}

/* ─── Desktop: constrain overlay to phone frame width ──────── */
@media (min-width: 768px) {
  .chat-overlay {
    left: 50%;
    transform: translateX(-50%);
    width: min(390px, 100vw);
    right: auto;
    border-radius: 0;
  }
}
</style>
