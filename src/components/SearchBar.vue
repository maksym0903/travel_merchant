<template>
  <view class="search-filter-bar" :style="backgroundStyle">
    <view class="search-box">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input 
        :value="modelValue" 
        type="text" 
        :placeholder="placeholder"
        class="search-input phone-input"
        @input="handleInput"
      />
    </view>
    <scroll-view 
      v-if="filters && filters.length > 0"
      class="filter-tabs" 
      scroll-x="true" 
      :show-scrollbar="false" 
      :enable-flex="true"
    >
      <view 
        v-for="filter in filters" 
        :key="filter.value"
        class="filter-tab"
        :class="{ active: activeFilter === filter.value }"
        @click="handleFilterClick(filter.value)"
      >
        <text>{{ filter.label }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Filter {
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    filters?: Filter[];
    activeFilter?: string;
    backgroundImage?: string;
  }>(),
  {
    modelValue: "",
    placeholder: "Search...",
    filters: () => [],
    activeFilter: "",
    backgroundImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop&q=80&auto=format",
  }
);

const backgroundStyle = computed(() => {
  if (props.backgroundImage) {
    return {
      backgroundImage: `linear-gradient(135deg, rgba(209, 250, 229, 0.85) 0%, rgba(167, 243, 208, 0.85) 50%, rgba(110, 231, 183, 0.85) 100%), url(${props.backgroundImage})`,
    };
  }
  return {};
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "update:activeFilter": [value: string];
  "filter-change": [value: string];
}>();

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}

function handleFilterClick(value: string) {
  emit("update:activeFilter", value);
  emit("filter-change", value);
}
</script>

<style scoped>
.search-filter-bar {
  position: sticky;
  top: 0;
  z-index: 5;
  background-size: cover;
  background-position: center;
  background-blend-mode: soft-light;
  padding: 100px 16px 10px 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;
  margin-bottom: 0;
  border: none;
  border-bottom: 1px solid rgba(239, 68, 68, 0.15);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 3px 8px;
  margin-bottom: 12px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.search-icon {
  color: #64748b;
  margin-right: 10px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none !important;
  background: transparent;
  font-size: 15px;
  color: #0f172a;
  outline: none;
  font-family: inherit;
  box-shadow: none !important;
}

.search-input::placeholder {
  color: #94a3b8;
}

.filter-tabs {
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  flex-shrink: 0;
  flex-grow: 0;
  padding: 4px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
  font-size: 8px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
  display: inline-block;
  margin-right: 6px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
}

.filter-tab:last-child {
  margin-right: 0;
}

.filter-tab.active {
  background: #EF4444;
  color: #ffffff;
}

.filter-tab text {
  font-family: inherit;
}
</style>
