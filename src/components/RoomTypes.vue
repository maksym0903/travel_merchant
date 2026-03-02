<template>
  <view class="room-types">
    <view class="room-types-list">
      <view
        v-for="(room, index) in modelValue"
        :key="index"
        class="room-card"
      >
        <view class="room-card-header" @click="toggleRoom(index)">
          <view class="room-header-left">
            <text class="room-number">Room Type {{ index + 1 }}</text>
            <text class="room-name" v-if="room.name">{{ room.name }}</text>
          </view>
          <view class="room-header-actions">
            <view class="day-action-btn" @click.stop="duplicateRoom(index)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </view>
            <view class="day-action-btn" @click.stop="removeRoom(index)" v-if="modelValue.length > 1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </view>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="room-chevron" :class="{ expanded: expandedRooms.has(index) }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </view>
        </view>

        <view v-if="expandedRooms.has(index)" class="room-card-content">
          <!-- Room Fields -->
          <view class="room-section">
            <view class="room-section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="room-section-icon" style="color: #8b5cf6;">
                <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/>
                <path d="M9 22V12h6v10"/>
                <path d="M22 10V6a2 2 0 0 0-2-2h-4"/>
                <rect x="2" y="4" width="20" height="6" rx="1"/>
              </svg>
              <text class="room-section-title">Room Fields</text>
            </view>
            <view class="form-group">
              <text class="form-label">Room name</text>
              <TextInput
                :modelValue="room.name"
                type="text"
                placeholder="e.g., Standard, Deluxe"
                @update:modelValue="(val) => updateRoom(index, 'name', val)"
              />
            </view>
            <view class="form-row">
              <view class="form-group form-group-half">
                <text class="form-label">Max adults</text>
                <TextInput
                  :modelValue="room.maxAdults.toString()"
                  type="text"
                  placeholder="e.g., 2"
                  @update:modelValue="(val) => updateRoom(index, 'maxAdults', Number(val) || 0)"
                />
              </view>
              <view class="form-group form-group-half">
                <text class="form-label">Max children</text>
                <TextInput
                  :modelValue="room.maxChildren.toString()"
                  type="text"
                  placeholder="e.g., 1"
                  @update:modelValue="(val) => updateRoom(index, 'maxChildren', Number(val) || 0)"
                />
              </view>
            </view>
            <view class="form-group">
              <text class="form-label">Bed type</text>
              <TextInput
                :modelValue="room.bedType"
                type="text"
                placeholder="e.g., King, Queen, Twin"
                @update:modelValue="(val) => updateRoom(index, 'bedType', val)"
              />
            </view>
            <view class="form-group">
              <text class="form-label">Room size (m²)</text>
              <TextInput
                :modelValue="room.roomSize.toString()"
                type="text"
                placeholder="e.g., 25"
                @update:modelValue="(val) => updateRoom(index, 'roomSize', Number(val) || 0)"
              />
            </view>
            <view class="form-group">
              <text class="form-label">Room description</text>
              <TextArea
                :modelValue="room.description"
                placeholder="Room description and features"
                @update:modelValue="(val) => updateRoom(index, 'description', val)"
              />
            </view>
            <view class="form-group">
              <text class="form-label">Amenities</text>
              <view class="amenities-grid">
                <view
                  v-for="amenity in availableAmenities"
                  :key="amenity.key"
                  class="amenity-item"
                  :class="{ active: room.amenities.includes(amenity.key) }"
                  @click="toggleAmenity(index, amenity.key)"
                >
                  <text>{{ amenity.label }}</text>
                </view>
              </view>
            </view>
            <view class="form-group">
              <view class="toggle-group">
                <text class="form-label">Refundable</text>
                <view 
                  class="toggle-switch"
                  :class="{ active: room.refundable }"
                  @click="updateRoom(index, 'refundable', !room.refundable)"
                >
                  <view class="toggle-slider"></view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Add Room Button -->
    <view class="add-room-section">
      <view class="btn btn-secondary btn-add-room" @click="addRoom">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <text>Add Room Type</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TextInput from "./TextInput.vue";
import TextArea from "./TextArea.vue";

export interface RoomType {
  name: string;
  maxAdults: number;
  maxChildren: number;
  bedType: string;
  roomSize: number; // in m²
  description: string;
  amenities: string[];
  refundable: boolean;
}

const props = defineProps<{
  modelValue: RoomType[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: RoomType[]];
}>();

const expandedRooms = ref<Set<number>>(new Set());

const availableAmenities = [
  { key: "ac", label: "AC" },
  { key: "tv", label: "TV" },
  { key: "balcony", label: "Balcony" }
];

function toggleRoom(index: number) {
  if (expandedRooms.value.has(index)) {
    expandedRooms.value.delete(index);
  } else {
    expandedRooms.value.add(index);
  }
}

function addRoom() {
  const updated = [
    ...props.modelValue,
    {
      name: "",
      maxAdults: 2,
      maxChildren: 0,
      bedType: "",
      roomSize: 0,
      description: "",
      amenities: [],
      refundable: false
    }
  ];
  emit("update:modelValue", updated);
  // Auto-expand the new room
  expandedRooms.value.add(updated.length - 1);
}

function removeRoom(index: number) {
  const updated = props.modelValue.filter((_, i) => i !== index);
  emit("update:modelValue", updated);
  expandedRooms.value.delete(index);
  // Re-index expanded rooms
  const newExpanded = new Set<number>();
  expandedRooms.value.forEach((idx) => {
    if (idx < index) {
      newExpanded.add(idx);
    } else if (idx > index) {
      newExpanded.add(idx - 1);
    }
  });
  expandedRooms.value = newExpanded;
}

function duplicateRoom(index: number) {
  const room = props.modelValue[index];
  const duplicated = {
    ...room,
    name: `${room.name} (Copy)`
  };
  const updated = [
    ...props.modelValue.slice(0, index + 1),
    duplicated,
    ...props.modelValue.slice(index + 1)
  ];
  emit("update:modelValue", updated);
  expandedRooms.value.add(index + 1);
}

function updateRoom(index: number, key: keyof RoomType, value: string | number | string[] | boolean) {
  const updated = props.modelValue.map((room, i) =>
    i === index ? { ...room, [key]: value } : room
  );
  emit("update:modelValue", updated);
}

function toggleAmenity(index: number, amenityKey: string) {
  const room = props.modelValue[index];
  const amenities = room.amenities.includes(amenityKey)
    ? room.amenities.filter(a => a !== amenityKey)
    : [...room.amenities, amenityKey];
  updateRoom(index, "amenities", amenities);
}
</script>

<style scoped>
.room-types {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.room-types-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.room-card {
  background: #ffffff;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  overflow: hidden;
}

.room-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  cursor: pointer;
  transition: background 0.2s;
}

.room-card-header:active {
  background: #f8fafc;
}

.room-header-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.room-number {
  font-size: 26rpx;
  color: #64748b;
  font-weight: 500;
}

.room-name {
  font-size: 30rpx;
  color: #0f172a;
  font-weight: 600;
}

.room-header-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.day-action-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  color: #64748b;
  background: #f8fafc;
  transition: all 0.2s;
}

.day-action-btn:active {
  background: #e2e8f0;
  color: #0f172a;
}

.day-action-btn svg {
  width: 32rpx;
  height: 32rpx;
}

.room-chevron {
  width: 40rpx;
  height: 40rpx;
  color: #64748b;
  transition: transform 0.2s;
}

.room-chevron.expanded {
  transform: rotate(180deg);
}

.room-card-content {
  padding: 0 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.room-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #e2e8f0;
}

.room-section:first-child {
  border-top: none;
  padding-top: 0;
}

.room-section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.room-section-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.room-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-group-half {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
  margin-bottom: 12rpx;
}

.amenities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.amenity-item {
  padding: 16rpx 24rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  text-align: center;
  font-size: 26rpx;
  color: #475569;
  transition: all 0.2s;
  cursor: pointer;
}

.amenity-item.active {
  background: #EF4444;
  border-color: #EF4444;
  color: #ffffff;
}

.amenity-item:active {
  opacity: 0.8;
}

.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-switch {
  width: 100rpx;
  height: 56rpx;
  background: #cbd5e1;
  border-radius: 28rpx;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-switch.active {
  background: #EF4444;
}

.toggle-slider {
  width: 48rpx;
  height: 48rpx;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.2s;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(44rpx);
}

.add-room-section {
  margin-top: 24rpx;
}

.btn-add-room {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  background: #f8fafc;
  border: 2rpx dashed #cbd5e1;
  border-radius: 12rpx;
  color: #475569;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-add-room:active {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.btn-add-room svg {
  width: 40rpx;
  height: 40rpx;
}

.room-types :deep(.text-input-wrap input),
.room-types :deep(.text-input-native) {
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

.room-types :deep(.text-input-wrap input):focus,
.room-types :deep(.text-input-native):focus {
  outline: none;
  border-color: #EF4444;
}

.room-types :deep(.textarea-wrap textarea),
.room-types :deep(.textarea-native) {
  width: 100%;
  min-height: 160rpx;
  padding: 24rpx 28rpx;
  font-size: 30rpx;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12rpx;
  box-sizing: border-box;
  font-family: inherit;
  resize: none;
}

.room-types :deep(.textarea-wrap textarea):focus,
.room-types :deep(.textarea-native):focus {
  outline: none;
  border-color: #EF4444;
}
</style>
