<template>
  <view v-if="open" class="confirm-drawer__overlay" @click.self="emitCancel">
    <view class="confirm-drawer__panel" @click.stop>
      <view class="confirm-drawer__handle" />
      <view class="confirm-drawer__header">
        <text class="confirm-drawer__title">{{ title }}</text>
        <view class="confirm-drawer__close" :class="{ disabled: loading }" @click="emitCancel">
          <text>✕</text>
        </view>
      </view>

      <view class="confirm-drawer__body">
        <text class="confirm-drawer__content">{{ content }}</text>
      </view>

      <view class="confirm-drawer__footer">
        <view class="confirm-drawer__actions">
          <view class="btn btn-secondary" :class="{ disabled: loading }" @click="emitCancel">
            <text>{{ cancelText }}</text>
          </view>
          <view class="btn" :class="[tone === 'danger' ? 'btn-danger' : 'btn-primary', { disabled: loading }]" @click="emitConfirm">
            <text>{{ confirmText }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
type Props = {
  open: boolean;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "primary" | "danger";
  loading?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  confirmText: "Confirm",
  cancelText: "Cancel",
  tone: "primary",
  loading: false,
});

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

function emitCancel(): void {
  if (props.loading) return;
  emit("cancel");
}

function emitConfirm(): void {
  if (props.loading) return;
  emit("confirm");
}
</script>

<style scoped>
.confirm-drawer__overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.confirm-drawer__panel {
  width: 100%;
  max-width: min(390px, 100vw);
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: translateY(0);
  animation: confirmDrawerSlideUp 0.22s ease-out;
}

@keyframes confirmDrawerSlideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.confirm-drawer__handle {
  width: 48px;
  height: 5px;
  border-radius: 999px;
  background: #e2e8f0;
  margin: 10px auto 0;
}

.confirm-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid #e2e8f0;
}

.confirm-drawer__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.confirm-drawer__close {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.confirm-drawer__close:active {
  background: #f1f5f9;
  color: #0f172a;
}

.confirm-drawer__body {
  padding: 16px 18px 10px;
}

.confirm-drawer__content {
  display: block;
  font-size: 14px;
  color: #334155;
  line-height: 1.55;
  white-space: pre-wrap;
}

.confirm-drawer__footer {
  padding: 14px 18px 18px;
  border-top: 1px solid #e2e8f0;
}

.confirm-drawer__actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 14px 16px;
  border-radius: 12px;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn.disabled {
  opacity: 0.55;
  pointer-events: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
}

.btn-secondary:active {
  background: #e2e8f0;
}

.btn-danger {
  background: #ef4444;
  color: #ffffff;
}

.btn-danger:active {
  background: #dc2626;
}

.btn-primary {
  background: #d97706;
  color: #ffffff;
}

.btn-primary:active {
  background: #b45309;
}

@media (min-width: 768px) {
  .confirm-drawer__overlay {
    align-items: center;
  }
  .confirm-drawer__panel {
    border-radius: 24px;
    max-width: 440px;
  }
}
</style>

