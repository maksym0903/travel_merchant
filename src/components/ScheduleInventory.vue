<template>
  <view class="schedule-inventory">
    <!-- Hotel Mode: Calendar-based Inventory -->
    <template v-if="mode === 'hotel'">
      <view class="info-section">
        <text class="info-text">Hotel inventory is calendar-based.</text>
        <text class="info-text">For each room:</text>
      </view>

      <view class="field-category">
        <view class="category-header">
          <text class="category-title">Room Inventory</text>
        </view>
        
        <view class="inventory-table">
          <view class="table-header">
            <text class="table-cell">Date</text>
            <text class="table-cell">Total</text>
            <text class="table-cell">Available</text>
            <text class="table-cell">Blocked</text>
            <text class="table-cell-actions"></text>
          </view>
          <view
            v-for="(item, index) in modelValue.roomInventory"
            :key="index"
            class="table-row"
          >
            <view class="table-cell">
              <TextInput
                :modelValue="item.date"
                type="text"
                placeholder="YYYY-MM-DD"
                @update:modelValue="(val) => updateRoomInventory(index, 'date', val)"
              />
            </view>
            <view class="table-cell">
              <TextInput
                :modelValue="item.totalRooms.toString()"
                type="text"
                placeholder="0"
                @update:modelValue="(val) => updateRoomInventory(index, 'totalRooms', Number(val) || 0)"
              />
            </view>
            <view class="table-cell">
              <TextInput
                :modelValue="item.availableRooms.toString()"
                type="text"
                placeholder="0"
                @update:modelValue="(val) => updateRoomInventory(index, 'availableRooms', Number(val) || 0)"
              />
            </view>
            <view class="table-cell">
              <TextInput
                :modelValue="item.blockedRooms.toString()"
                type="text"
                placeholder="0"
                @update:modelValue="(val) => updateRoomInventory(index, 'blockedRooms', Number(val) || 0)"
              />
            </view>
            <view class="table-cell-actions">
              <view class="day-action-btn" @click="removeRoomInventory(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </view>
            </view>
          </view>
        </view>
        
        <view class="btn btn-small" @click="addRoomInventory" style="margin-top: 24rpx;">
          <text>+ Add Date</text>
        </view>

        <view class="important-note">
          <text class="note-title">Important:</text>
          <text class="note-text">Inventory is room-level, NOT hotel-level.</text>
        </view>
      </view>
    </template>

    <!-- Ticket Mode: Date + Time Slot Inventory -->
    <template v-else-if="mode === 'ticket'">
      <view class="info-section">
        <text class="info-text">Ticket inventory can be:</text>
        <view class="info-list">
          <text class="info-list-item">• Option A — Date-based only: "100 tickets per day"</text>
          <text class="info-list-item">• Option B — Date + Time Slot: "09:00 → 50 seats", "13:00 → 50 seats", "18:00 → 30 seats"</text>
        </view>
      </view>

      <view class="field-category">
        <view class="category-header">
          <text class="category-title">Ticket Inventory</text>
        </view>
        
        <view class="inventory-table">
          <view class="table-header">
            <text class="table-cell">Date</text>
            <text class="table-cell">Time Slot</text>
            <text class="table-cell">Total</text>
            <text class="table-cell">Remaining</text>
            <text class="table-cell">Deadline</text>
            <text class="table-cell-actions"></text>
          </view>
          <view
            v-for="(item, index) in (modelValue.timeSlotInventory || [])"
            :key="index"
            class="table-row"
          >
            <view class="table-cell">
              <TextInput
                :modelValue="item.date"
                type="text"
                placeholder="YYYY-MM-DD"
                @update:modelValue="(val) => updateTicketInventory(index, 'date', val)"
              />
            </view>
            <view class="table-cell">
              <TextInput
                :modelValue="item.timeSlot || ''"
                type="text"
                placeholder="e.g., 09:00"
                @update:modelValue="(val) => updateTicketInventory(index, 'timeSlot', val)"
              />
            </view>
            <view class="table-cell">
              <TextInput
                :modelValue="item.totalQuantity.toString()"
                type="text"
                placeholder="0"
                @update:modelValue="(val) => updateTicketInventory(index, 'totalQuantity', Number(val) || 0)"
              />
            </view>
            <view class="table-cell">
              <TextInput
                :modelValue="item.remainingQuantity.toString()"
                type="text"
                placeholder="0"
                @update:modelValue="(val) => updateTicketInventory(index, 'remainingQuantity', Number(val) || 0)"
              />
            </view>
            <view class="table-cell">
              <TextInput
                :modelValue="(item.bookingDeadline || 0).toString()"
                type="text"
                placeholder="Days"
                @update:modelValue="(val) => updateTicketInventory(index, 'bookingDeadline', Number(val) || 0)"
              />
            </view>
            <view class="table-cell-actions">
              <view class="day-action-btn" @click="removeTicketInventory(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </view>
            </view>
          </view>
        </view>
        
        <view class="btn btn-small" @click="addTicketInventory" style="margin-top: 24rpx;">
          <text>+ Add Inventory Entry</text>
        </view>

        <view class="important-note">
          <text class="note-title">Inventory Fields:</text>
          <text class="note-text">Date • Time slot (optional) • Total quantity • Remaining quantity • Booking deadline (optional)</text>
        </view>
      </view>
    </template>

    <!-- Tour Mode: Departure Setup -->
    <template v-else>
    <!-- Departure Setup -->
    <view class="field-category">
      <view class="category-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color: #EF4444;">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <text class="category-title">Departure Setup</text>
      </view>
      <text class="category-subtitle">Add departure date:</text>
      
      <view class="departure-list">
          <view
            v-for="(departure, index) in (modelValue.departures || [])"
            :key="index"
            class="departure-item"
          >
          <view class="departure-item-header">
            <text class="departure-item-title">Departure {{ index + 1 }}</text>
            <view class="day-action-btn" @click="removeDeparture(index)" v-if="(modelValue.departures || []).length > 1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">Date *</text>
            <TextInput
              :modelValue="departure.date"
              type="text"
              placeholder="YYYY-MM-DD"
              @update:modelValue="(val) => updateDeparture(index, 'date', val)"
            />
          </view>
          <view class="form-row">
            <view class="form-group form-group-half">
              <text class="form-label">Minimum Group Size</text>
              <TextInput
                :modelValue="departure.minGroupSize.toString()"
                type="text"
                placeholder="e.g., 2"
                @update:modelValue="(val) => updateDeparture(index, 'minGroupSize', Number(val) || 0)"
              />
            </view>
            <view class="form-group form-group-half">
              <text class="form-label">Maximum Group Size</text>
              <TextInput
                :modelValue="departure.maxGroupSize.toString()"
                type="text"
                placeholder="e.g., 20"
                @update:modelValue="(val) => updateDeparture(index, 'maxGroupSize', Number(val) || 0)"
              />
            </view>
          </view>
          <view class="form-group">
            <view class="toggle-group">
              <text class="form-label">Auto-cancel toggle</text>
              <view class="toggle-switch" :class="{ active: departure.autoCancel }" @click="updateDeparture(index, 'autoCancel', !departure.autoCancel)">
                <view class="toggle-slider"></view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="btn btn-small" @click="addDeparture" style="margin-top: 24rpx;">
        <text>+ Add Departure</text>
      </view>
    </view>

    <!-- Inventory Control -->
    <view class="field-category">
      <view class="category-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color: #d97706;">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
        <text class="category-title">Inventory Control</text>
      </view>
          <view class="form-group">
        <text class="form-label">Total Seats</text>
        <TextInput
          :modelValue="(modelValue.inventory?.totalSeats || 0).toString()"
          type="text"
          placeholder="e.g., 50"
          @update:modelValue="(val) => updateInventory('totalSeats', Number(val) || 0)"
        />
      </view>
      <view class="form-group">
        <text class="form-label">Remaining Seats (auto-calculated)</text>
        <view class="readonly-field">
          <text>{{ remainingSeats }}</text>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">Booking Deadline (days before departure)</text>
        <TextInput
          :modelValue="(modelValue.inventory?.bookingDeadline || 3).toString()"
          type="text"
          placeholder="e.g., 3"
          @update:modelValue="(val) => updateInventory('bookingDeadline', Number(val) || 3)"
        />
      </view>
    </view>

    <!-- Optional Advanced -->
    <view class="field-category">
      <view class="category-header">
        <text class="category-title">Optional Advanced</text>
      </view>
      <view class="form-row">
        <view class="form-group form-group-half">
          <text class="form-label">Early Bird Discount (%)</text>
          <TextInput
            :modelValue="(modelValue.advanced?.earlyBirdDiscount || 0).toString()"
            type="text"
            placeholder="e.g., 10"
            @update:modelValue="(val) => updateAdvanced('earlyBirdDiscount', Number(val) || 0)"
          />
        </view>
        <view class="form-group form-group-half">
          <text class="form-label">Last-minute Discount (%)</text>
          <TextInput
            :modelValue="(modelValue.advanced?.lastMinuteDiscount || 0).toString()"
            type="text"
            placeholder="e.g., 15"
            @update:modelValue="(val) => updateAdvanced('lastMinuteDiscount', Number(val) || 0)"
          />
        </view>
      </view>
    </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, withDefaults } from "vue";
import TextInput from "./TextInput.vue";

export interface Departure {
  date: string;
  minGroupSize: number;
  maxGroupSize: number;
  autoCancel: boolean;
}

export interface Inventory {
  totalSeats: number;
  bookingDeadline: number;
}

export interface AdvancedOptions {
  earlyBirdDiscount: number;
  lastMinuteDiscount: number;
}

export interface RoomInventoryItem {
  date: string;
  totalRooms: number;
  availableRooms: number;
  blockedRooms: number;
}

export interface TicketInventoryItem {
  date: string;
  timeSlot?: string; // Optional: e.g., "09:00", "13:00", "18:00"
  totalQuantity: number;
  remainingQuantity: number;
  bookingDeadline?: number; // Optional: days before
}

export interface ScheduleInventoryData {
  departures?: Departure[];
  inventory?: Inventory;
  advanced?: AdvancedOptions;
  roomInventory?: RoomInventoryItem[];
  timeSlotInventory?: TicketInventoryItem[];
}

const props = withDefaults(
  defineProps<{
    modelValue: ScheduleInventoryData;
    mode?: 'tour' | 'hotel' | 'ticket';
  }>(),
  {
    mode: 'tour'
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: ScheduleInventoryData];
}>();

const remainingSeats = computed(() => {
  // This would calculate based on bookings, for now just return total
  return props.modelValue.inventory?.totalSeats || 0;
});

function addDeparture() {
  const updated = {
    ...props.modelValue,
    departures: [
      ...(props.modelValue.departures || []),
      {
        date: "",
        minGroupSize: 0,
        maxGroupSize: 0,
        autoCancel: false
      }
    ]
  };
  emit("update:modelValue", updated);
}

function removeDeparture(index: number) {
  const updated = {
    ...props.modelValue,
    departures: (props.modelValue.departures || []).filter((_, i) => i !== index)
  };
  emit("update:modelValue", updated);
}

function updateDeparture(index: number, key: keyof Departure, value: string | number | boolean) {
  const updated = {
    ...props.modelValue,
    departures: (props.modelValue.departures || []).map((dep, i) =>
      i === index ? { ...dep, [key]: value } : dep
    )
  };
  emit("update:modelValue", updated);
}

function updateInventory(key: keyof Inventory, value: number) {
  const updated = {
    ...props.modelValue,
    inventory: {
      ...(props.modelValue.inventory || { totalSeats: 0, bookingDeadline: 3 }),
      [key]: value
    }
  };
  emit("update:modelValue", updated);
}

function updateAdvanced(key: keyof AdvancedOptions, value: number) {
  const updated = {
    ...props.modelValue,
    advanced: {
      ...(props.modelValue.advanced || { earlyBirdDiscount: 0, lastMinuteDiscount: 0 }),
      [key]: value
    }
  };
  emit("update:modelValue", updated);
}

function addRoomInventory() {
  const updated = {
    ...props.modelValue,
    roomInventory: [
      ...(props.modelValue.roomInventory || []),
      {
        date: "",
        totalRooms: 0,
        availableRooms: 0,
        blockedRooms: 0
      }
    ]
  };
  emit("update:modelValue", updated);
}

function removeRoomInventory(index: number) {
  const updated = {
    ...props.modelValue,
    roomInventory: (props.modelValue.roomInventory || []).filter((_, i) => i !== index)
  };
  emit("update:modelValue", updated);
}

function updateRoomInventory(index: number, key: keyof RoomInventoryItem, value: string | number) {
  const updated = {
    ...props.modelValue,
    roomInventory: (props.modelValue.roomInventory || []).map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    )
  };
  emit("update:modelValue", updated);
}

function addTicketInventory() {
  const updated = {
    ...props.modelValue,
    timeSlotInventory: [
      ...(props.modelValue.timeSlotInventory || []),
      {
        date: "",
        timeSlot: "",
        totalQuantity: 0,
        remainingQuantity: 0,
        bookingDeadline: 0
      }
    ]
  };
  emit("update:modelValue", updated);
}

function removeTicketInventory(index: number) {
  const updated = {
    ...props.modelValue,
    timeSlotInventory: (props.modelValue.timeSlotInventory || []).filter((_, i) => i !== index)
  };
  emit("update:modelValue", updated);
}

function updateTicketInventory(index: number, key: keyof TicketInventoryItem, value: string | number) {
  const updated = {
    ...props.modelValue,
    timeSlotInventory: (props.modelValue.timeSlotInventory || []).map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    )
  };
  emit("update:modelValue", updated);
}
</script>

<style scoped>
.field-category {
  margin-bottom: 48rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  border: 1rpx solid #e2e8f0;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.category-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.category-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.category-subtitle {
  font-size: 26rpx;
  color: #64748b;
  margin-bottom: 24rpx;
  display: block;
}

.form-group {
  margin-bottom: 32rpx;
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

.departure-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.departure-item {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1rpx solid #e2e8f0;
}

.departure-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.departure-item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.day-action-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  color: #64748b;
  background: #ffffff;
  transition: all 0.2s;
}

.day-action-btn:active {
  background: #f1f5f9;
  color: #0f172a;
}

.day-action-btn svg {
  width: 32rpx;
  height: 32rpx;
}

.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.toggle-switch {
  width: 88rpx;
  height: 48rpx;
  background: #cbd5e1;
  border-radius: 24rpx;
  position: relative;
  transition: background 0.2s;
  cursor: pointer;
}

.toggle-switch.active {
  background: #EF4444;
}

.toggle-slider {
  width: 40rpx;
  height: 40rpx;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.2s;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(40rpx);
}

.readonly-field {
  padding: 24rpx 28rpx;
  background: #f1f5f9;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  font-size: 30rpx;
  color: #475569;
  font-weight: 500;
}

.btn-small {
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  border-radius: 8rpx;
  background: #EF4444;
  color: #ffffff;
  text-align: center;
}

.schedule-inventory :deep(.text-input-wrap input),
.schedule-inventory :deep(.text-input-native) {
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

.schedule-inventory :deep(.text-input-wrap input):focus,
.schedule-inventory :deep(.text-input-native):focus {
  outline: none;
  border-color: #EF4444;
}

.info-section {
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #f8fafc;
  border-radius: 12rpx;
}

.info-text {
  display: block;
  font-size: 28rpx;
  color: #0f172a;
  margin-bottom: 8rpx;
}

.info-list {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-list-item {
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.5;
  display: block;
}

.inventory-table {
  width: 100%;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #f1f5f9;
  border-bottom: 1rpx solid #e2e8f0;
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid #e2e8f0;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  flex: 1;
  padding: 16rpx;
  font-size: 26rpx;
  color: #0f172a;
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
}

.table-cell:first-child {
  min-width: 140rpx;
  flex: 0 0 140rpx;
}

.table-cell:nth-child(2) {
  min-width: 120rpx;
  flex: 0 0 120rpx;
}

.table-header .table-cell {
  font-weight: 600;
  color: #475569;
}

.table-cell-actions {
  width: 80rpx;
  padding: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-row .table-cell :deep(.text-input-wrap),
.table-row .table-cell :deep(.text-input-native) {
  width: 100%;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  background: #ffffff;
}

.important-note {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #fef3c7;
  border-left: 4rpx solid #f59e0b;
  border-radius: 8rpx;
}

.note-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8rpx;
}

.note-text {
  display: block;
  font-size: 26rpx;
  color: #78350f;
}
</style>
