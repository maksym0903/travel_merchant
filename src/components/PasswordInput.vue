<template>
  <view class="password-field">
    <!-- #ifdef H5 -->
    <view ref="inputContainerRef" class="input-slot" />
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <input
      :value="inner"
      class="input"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
    />
    <!-- #endif -->
    <view class="eye-btn" role="button" :aria-label="visible ? t('common.hidePassword') : t('common.showPassword')" @click="toggleVisible">
      <!-- eye = show password, eye-off = hide password -->
      <view v-if="visible" class="icon-svg" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      </view>
      <view v-else class="icon-svg" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  { modelValue: "", placeholder: "", disabled: false }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const inner = ref(props.modelValue || "");
const visible = ref(false);

// H5: native input mounted into slot to avoid UniApp focus/typing issues
const inputContainerRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null);
let nativeInput: HTMLInputElement | null = null;

function getInputEl(): HTMLInputElement | null {
  if (nativeInput) return nativeInput;
  const container = inputContainerRef.value;
  const el = (container && (container as { $el?: HTMLElement }).$el) || (container as HTMLElement);
  return el?.querySelector?.(".input") ?? null;
}

function onNativeInput() {
  const el = getInputEl();
  if (!el) return;
  const val = el.value ?? "";
  inner.value = val;
  emit("update:modelValue", val);
}

function syncNativeInput() {
  const el = getInputEl();
  if (!el) return;
  el.type = visible.value ? "text" : "password";
  el.placeholder = props.placeholder ?? "";
  el.disabled = !!props.disabled;
  if (el.value !== inner.value) el.value = inner.value;
}

function toggleVisible() {
  visible.value = !visible.value;
  nextTick(syncNativeInput);
}

// #ifdef H5
onMounted(() => {
  nextTick(() => {
    const container = inputContainerRef.value;
    const el = (container && (container as { $el?: HTMLElement }).$el) || (container as HTMLElement);
    if (!el || !el.appendChild) return;
    const input = document.createElement("input");
    input.type = visible.value ? "text" : "password";
    input.placeholder = props.placeholder ?? "";
    input.disabled = !!props.disabled;
    input.value = inner.value;
    input.className = "input";
    input.addEventListener("input", onNativeInput);
    el.appendChild(input);
    nativeInput = input;
  });
});

onBeforeUnmount(() => {
  if (nativeInput && nativeInput.parentNode) {
    nativeInput.removeEventListener("input", onNativeInput);
    nativeInput.parentNode.removeChild(nativeInput);
  }
  nativeInput = null;
});

watch([() => props.placeholder, () => props.disabled, inner], syncNativeInput);
watch(visible, () => nextTick(syncNativeInput));
watch(inner, () => nextTick(syncNativeInput));
// #endif

watch(
  () => props.modelValue,
  (v) => {
    const next = v ?? "";
    if (inner.value !== next) inner.value = next;
  }
);

// Used by non-H5 template input
function onInput(e: Event) {
  const ev = e as Event & { detail?: { value?: string } };
  const val =
    (ev.detail?.value !== undefined ? ev.detail.value : (ev.target as HTMLInputElement)?.value) ?? "";
  inner.value = val;
  emit("update:modelValue", val);
}
</script>

<style scoped>
.password-field {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}
.password-field .input-slot {
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  box-sizing: border-box;
}
.password-field .input {
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0.75rem 2.75rem 0.75rem 1rem;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 1rem;
  color: #1e293b;
  position: relative;
  z-index: 0;
}
.password-field .input:focus {
  outline: none;
}
.eye-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  z-index: 1;
}
.icon-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}
.icon-svg svg {
  display: block;
}
</style>
