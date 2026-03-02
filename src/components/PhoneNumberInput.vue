<template>
  <!-- #ifdef H5 -->
  <view class="phone-input-wrap">
    <view class="phone-row">
      <view class="country-wrap">
        <select v-model="selectedCountry" class="country-select" @change="onCountryChange">
          <option v-for="c in countryList" :key="c.iso2" :value="c.iso2">{{ c.dial }}</option>
        </select>
      </view>
      <view ref="phoneInputContainerRef" class="phone-input-slot" />
    </view>
  </view>
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <input
    v-model="fallbackValue"
    class="input"
    type="tel"
    :placeholder="placeholder"
    @input="onFallbackInput"
  />
  <!-- #endif -->
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
// #ifdef H5
import {
  getCountryCallingCode,
  formatIncompletePhoneNumber,
  getExampleNumber,
  type CountryCode,
} from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";
// #endif

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultCountry?: string;
    placeholder?: string;
  }>(),
  { modelValue: "", defaultCountry: "CN", placeholder: "" }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

function toDigitsOnly(val: string): string {
  return (val || "").replace(/\D/g, "");
}

// #ifdef H5
const COUNTRY_LIST: { iso2: CountryCode; name: string; dial: string }[] = [
  { iso2: "CN", name: "China", dial: "+86" },
  { iso2: "HK", name: "Hong Kong", dial: "+852" },
  { iso2: "TW", name: "Taiwan", dial: "+886" },
  { iso2: "US", name: "United States", dial: "+1" },
  { iso2: "GB", name: "United Kingdom", dial: "+44" },
  { iso2: "JP", name: "Japan", dial: "+81" },
  { iso2: "KR", name: "South Korea", dial: "+82" },
  { iso2: "SG", name: "Singapore", dial: "+65" },
  { iso2: "AU", name: "Australia", dial: "+61" },
  { iso2: "MY", name: "Malaysia", dial: "+60" },
  { iso2: "TH", name: "Thailand", dial: "+66" },
  { iso2: "VN", name: "Vietnam", dial: "+84" },
  { iso2: "IN", name: "India", dial: "+91" },
  { iso2: "DE", name: "Germany", dial: "+49" },
  { iso2: "FR", name: "France", dial: "+33" },
];

const phoneInputContainerRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null);
let nativePhoneInput: HTMLInputElement | null = null;
const selectedCountry = ref<string>(props.defaultCountry?.toUpperCase() || "CN");
const nationalDigits = ref("");

const countryList = computed(() =>
  COUNTRY_LIST.map((c) => ({
    ...c,
    dial: `+${getCountryCallingCode(c.iso2)}`,
  }))
);

const placeholderFormat = computed(() => {
  try {
    const country = selectedCountry.value as CountryCode;
    const ex = getExampleNumber(country, examples);
    return ex ? ex.formatNational() : props.placeholder;
  } catch {
    return props.placeholder;
  }
});

const displayNumber = computed(() => {
  if (!nationalDigits.value) return "";
  try {
    return formatIncompletePhoneNumber(nationalDigits.value, selectedCountry.value as CountryCode);
  } catch {
    return nationalDigits.value;
  }
});

function getPhoneInputEl(): HTMLInputElement | null {
  if (nativePhoneInput) return nativePhoneInput;
  const container = phoneInputContainerRef.value;
  const el = (container && (container as { $el?: HTMLElement }).$el) || (container as HTMLElement);
  return el?.querySelector?.(".phone-input") ?? null;
}

function onCountryChange() {
  emitValue();
}

function onNativePhoneInput() {
  const el = getPhoneInputEl();
  if (!el) return;
  const digits = toDigitsOnly(el.value ?? "");
  nationalDigits.value = digits;
  emitValue();
}

function emitValue() {
  const code = getCountryCallingCode(selectedCountry.value as CountryCode);
  const full = nationalDigits.value ? `${code}${nationalDigits.value}` : "";
  emit("update:modelValue", full);
}

function syncFromModelValue(v: string) {
  const d = toDigitsOnly(v || "");
  if (d === "") {
    nationalDigits.value = "";
    nextTick(() => {
      const el = getPhoneInputEl();
      if (el) el.value = "";
    });
    return;
  }
  const code = getCountryCallingCode(selectedCountry.value as CountryCode);
  if (d === code || d.startsWith(code)) {
    nationalDigits.value = d.slice(code.length);
  } else {
    nationalDigits.value = d;
  }
  nextTick(() => {
    const el = getPhoneInputEl();
    if (!el) return;
    const formatted =
      nationalDigits.value &&
      formatIncompletePhoneNumber(nationalDigits.value, selectedCountry.value as CountryCode);
    el.value = formatted ?? nationalDigits.value ?? "";
  });
}

watch(() => props.modelValue, syncFromModelValue, { immediate: true });

onMounted(() => {
  nextTick(() => {
    const container = phoneInputContainerRef.value;
    const el = (container && (container as { $el?: HTMLElement }).$el) || (container as HTMLElement);
    if (!el || !el.appendChild) return;
    const input = document.createElement("input");
    input.type = "tel";
    input.inputMode = "numeric";
    input.className = "phone-input";
    input.placeholder = placeholderFormat.value;
    input.addEventListener("input", onNativePhoneInput);
    el.appendChild(input);
    nativePhoneInput = input;
    syncFromModelValue(props.modelValue || "");
  });
});

onBeforeUnmount(() => {
  if (nativePhoneInput && nativePhoneInput.parentNode) {
    nativePhoneInput.removeEventListener("input", onNativePhoneInput);
    nativePhoneInput.parentNode.removeChild(nativePhoneInput);
  }
  nativePhoneInput = null;
});

watch(placeholderFormat, (p) => {
  const el = getPhoneInputEl();
  if (el) el.placeholder = p;
});
// #endif

// #ifndef H5
const fallbackValue = ref(props.modelValue || "");
watch(
  () => props.modelValue,
  (v) => {
    fallbackValue.value = v || "";
  }
);
function onFallbackInput(e: Event) {
  const t = (e.target as HTMLInputElement)?.value ?? "";
  emit("update:modelValue", toDigitsOnly(t));
}
// #endif
</script>

<style scoped>
/* #ifdef H5 */
.phone-input-wrap {
  width: 100%;
  pointer-events: none;
}
.phone-row {
  display: flex;
  align-items: stretch;
  min-height: 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f8fafc;
  pointer-events: none;
}
.phone-row .country-wrap,
.phone-row .phone-input-slot,
.phone-row .phone-input {
  pointer-events: auto;
}
.phone-input-slot {
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  background: #f8fafc;
  padding-left: 1rem;
  box-sizing: border-box;
}
.phone-row:focus-within {
  outline: none;
  box-shadow: none;
}
.country-wrap {
  flex-shrink: 0;
}
.country-select {
  height: 100%;
  min-height: 2.75rem;
  padding: 0 1rem;
  border: none;
  border-right: 1px solid #e2e8f0;
  background: #f1f5f9;
  font-size: 1rem;
  color: #1e293b;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 1.5rem;
}
.phone-input {
  flex: 1;
  min-width: 0;
  width: 100%;
  min-height: 2.75rem;
  padding: 0.75rem 1rem 0.75rem 0;
  border: none;
  background: #f8fafc;
  font-size: 1rem;
  color: #1e293b;
  cursor: text;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
}
.phone-input:focus {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}
/* #endif */
/* #ifndef H5 */
.input {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
  font-size: 1rem;
}
/* #endif */
</style>
