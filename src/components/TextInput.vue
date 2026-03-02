<template>
  <!-- #ifdef H5 -->
  <view ref="containerRef" class="text-input-wrap" />
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <input
    :value="inner"
    class="input"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    @input="onInput"
  />
  <!-- #endif -->
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    type?: "text" | "email";
    placeholder?: string;
    disabled?: boolean;
    maxlength?: number;
  }>(),
  { modelValue: "", type: "text", placeholder: "", disabled: false, maxlength: undefined }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const inner = ref(props.modelValue || "");

// #ifdef H5
const containerRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null);
let nativeInput: HTMLInputElement | null = null;

function onNativeInput() {
  if (!nativeInput) return;
  const val = nativeInput.value ?? "";
  inner.value = val;
  emit("update:modelValue", val);
}

function syncNativeInput() {
  if (!nativeInput) return;
  nativeInput.type = props.type ?? "text";
  nativeInput.placeholder = props.placeholder ?? "";
  nativeInput.disabled = !!props.disabled;
  if (props.maxlength != null) nativeInput.maxLength = props.maxlength;
  if (nativeInput.value !== inner.value) nativeInput.value = inner.value;
}

onMounted(() => {
  nextTick(() => {
    const container = containerRef.value;
    const el = (container && (container as { $el?: HTMLElement }).$el) || (container as HTMLElement);
    if (!el?.appendChild) return;
    const input = document.createElement("input");
    input.type = props.type ?? "text";
    input.placeholder = props.placeholder ?? "";
    input.disabled = !!props.disabled;
    if (props.maxlength != null) input.maxLength = props.maxlength;
    input.value = inner.value;
    input.className = "input text-input-native";
    input.addEventListener("input", onNativeInput);
    el.appendChild(input);
    nativeInput = input;
  });
});

onBeforeUnmount(() => {
  if (nativeInput?.parentNode) {
    nativeInput.removeEventListener("input", onNativeInput);
    nativeInput.parentNode.removeChild(nativeInput);
  }
  nativeInput = null;
});

watch([() => props.placeholder, () => props.disabled, () => props.maxlength], syncNativeInput);
watch(inner, () => nextTick(syncNativeInput));
// #endif

watch(
  () => props.modelValue,
  (v) => {
    const next = v ?? "";
    if (inner.value !== next) inner.value = next;
  }
);

function onInput(e: Event) {
  const ev = e as Event & { detail?: { value?: string } };
  const val =
    (ev.detail?.value !== undefined ? ev.detail.value : (ev.target as HTMLInputElement)?.value) ?? "";
  inner.value = val;
  emit("update:modelValue", val);
}
</script>

<style scoped>
.text-input-wrap {
  width: 100%;
  display: flex;
}
.text-input-wrap :deep(.input),
.text-input-wrap :deep(.text-input-native) {
  flex: 1;
  width: 100%;
  min-width: 0;
}
.input {
  width: 100%;
  padding: 24rpx 28rpx;
  font-size: 30rpx;
  color: #1e293b;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  box-sizing: border-box;
  font-family: inherit;
}
</style>
