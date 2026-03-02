<template>
  <!-- #ifdef H5 -->
  <view ref="containerRef" class="textarea-wrap" />
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <textarea
    :value="inner"
    class="textarea"
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
    placeholder?: string;
    disabled?: boolean;
    maxlength?: number;
  }>(),
  { modelValue: "", placeholder: "", disabled: false, maxlength: undefined }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const inner = ref(props.modelValue || "");

// #ifdef H5
const containerRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null);
let nativeTextarea: HTMLTextAreaElement | null = null;

function onNativeInput() {
  if (!nativeTextarea) return;
  const val = nativeTextarea.value ?? "";
  inner.value = val;
  emit("update:modelValue", val);
}

function syncNativeInput() {
  if (!nativeTextarea) return;
  nativeTextarea.placeholder = props.placeholder ?? "";
  nativeTextarea.disabled = !!props.disabled;
  if (props.maxlength != null) nativeTextarea.maxLength = props.maxlength;
  if (nativeTextarea.value !== inner.value) nativeTextarea.value = inner.value;
}

onMounted(() => {
  nextTick(() => {
    const container = containerRef.value;
    const el = (container && (container as { $el?: HTMLElement }).$el) || (container as HTMLElement);
    if (!el?.appendChild) return;
    const textarea = document.createElement("textarea");
    textarea.placeholder = props.placeholder ?? "";
    textarea.disabled = !!props.disabled;
    if (props.maxlength != null) textarea.maxLength = props.maxlength;
    textarea.value = inner.value;
    textarea.className = "textarea textarea-native";
    textarea.addEventListener("input", onNativeInput);
    el.appendChild(textarea);
    nativeTextarea = textarea;
  });
});

onBeforeUnmount(() => {
  if (nativeTextarea?.parentNode) {
    nativeTextarea.removeEventListener("input", onNativeInput);
    nativeTextarea.parentNode.removeChild(nativeTextarea);
  }
  nativeTextarea = null;
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
    (ev.detail?.value !== undefined ? ev.detail.value : (ev.target as HTMLTextAreaElement)?.value) ?? "";
  inner.value = val;
  emit("update:modelValue", val);
}
</script>

<style scoped>
.textarea-wrap {
  width: 100%;
  display: flex;
}
.textarea-wrap :deep(.textarea),
.textarea-wrap :deep(.textarea-native) {
  flex: 1;
  width: 100%;
  min-width: 0;
}
.textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 24rpx 28rpx;
  font-size: 30rpx;
  color: #1e293b;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  box-sizing: border-box;
  font-family: inherit;
  resize: none;
}
</style>
