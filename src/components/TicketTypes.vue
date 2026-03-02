<template>
  <view class="ticket-types">
    <view class="ticket-types-list">
      <view
        v-for="(ticketType, index) in modelValue"
        :key="index"
        class="ticket-card"
      >
        <view class="ticket-card-header" @click="toggleTicket(index)">
          <view class="ticket-header-left">
            <text class="ticket-number">Ticket Type {{ index + 1 }}</text>
            <text class="ticket-name" v-if="ticketType.name">{{ ticketType.name }}</text>
          </view>
          <view class="ticket-header-actions">
            <view class="day-action-btn" @click.stop="duplicateTicket(index)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </view>
            <view class="day-action-btn" @click.stop="removeTicket(index)" v-if="modelValue.length > 1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </view>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ticket-chevron" :class="{ expanded: expandedTickets.has(index) }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </view>
        </view>

        <view v-if="expandedTickets.has(index)" class="ticket-card-content">
          <!-- Ticket Type Fields -->
          <view class="ticket-section">
            <view class="ticket-section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ticket-section-icon" style="color: #ec4899;">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <text class="ticket-section-title">Ticket Type Fields</text>
            </view>
            <view class="form-group">
              <text class="form-label">Ticket name *</text>
              <TextInput
                :modelValue="ticketType.name"
                type="text"
                placeholder="e.g., Adult Ticket, Child Ticket, VIP Ticket"
                @update:modelValue="(val) => updateTicket(index, 'name', val)"
              />
            </view>
            <view class="form-group">
              <text class="form-label">Description</text>
              <TextArea
                :modelValue="ticketType.description"
                placeholder="Ticket description and details"
                @update:modelValue="(val) => updateTicket(index, 'description', val)"
              />
            </view>
            <view class="form-group">
              <text class="form-label">Age restriction</text>
              <TextInput
                :modelValue="ticketType.ageRestriction"
                type="text"
                placeholder="e.g., 18+, 12-17, Under 12"
                @update:modelValue="(val) => updateTicket(index, 'ageRestriction', val)"
              />
            </view>
            <view class="form-group">
              <text class="form-label">Validity type</text>
              <view class="validity-type-select">
                <view
                  v-for="type in validityTypes"
                  :key="type.value"
                  class="validity-option"
                  :class="{ active: ticketType.validityType === type.value }"
                  @click="updateTicket(index, 'validityType', type.value)"
                >
                  <text>{{ type.label }}</text>
                </view>
              </view>
              <view v-if="ticketType.validityType === 'fixed_date'" class="form-group" style="margin-top: 24rpx;">
                <text class="form-label">Fixed date</text>
                <TextInput
                  :modelValue="ticketType.fixedDate"
                  type="text"
                  placeholder="e.g., 2024-12-25"
                  @update:modelValue="(val) => updateTicket(index, 'fixedDate', val)"
                />
              </view>
              <view v-if="ticketType.validityType === 'date_range'" class="form-row" style="margin-top: 24rpx;">
                <view class="form-group form-group-half">
                  <text class="form-label">Start date</text>
                  <TextInput
                    :modelValue="ticketType.startDate"
                    type="text"
                    placeholder="e.g., 2024-01-01"
                    @update:modelValue="(val) => updateTicket(index, 'startDate', val)"
                  />
                </view>
                <view class="form-group form-group-half">
                  <text class="form-label">End date</text>
                  <TextInput
                    :modelValue="ticketType.endDate"
                    type="text"
                    placeholder="e.g., 2024-12-31"
                    @update:modelValue="(val) => updateTicket(index, 'endDate', val)"
                  />
                </view>
              </view>
            </view>
            <view class="form-group">
              <view class="toggle-group">
                <text class="form-label">Refundable</text>
                <view 
                  class="toggle-switch"
                  :class="{ active: ticketType.refundable }"
                  @click="updateTicket(index, 'refundable', !ticketType.refundable)"
                >
                  <view class="toggle-slider"></view>
                </view>
              </view>
            </view>
            <view class="form-group">
              <view class="toggle-group">
                <text class="form-label">Real-name required</text>
                <view 
                  class="toggle-switch"
                  :class="{ active: ticketType.realNameRequired }"
                  @click="updateTicket(index, 'realNameRequired', !ticketType.realNameRequired)"
                >
                  <view class="toggle-slider"></view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Add Ticket Type Button -->
    <view class="add-ticket-section">
      <view class="btn btn-secondary btn-add-ticket" @click="addTicket">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <text>Add Ticket Type</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TextInput from "./TextInput.vue";
import TextArea from "./TextArea.vue";

import { type PricingData } from "./PricingConfiguration.vue";
import { type ScheduleInventoryData } from "./ScheduleInventory.vue";

export interface TicketType {
  name: string;
  description: string;
  ageRestriction: string;
  validityType: 'fixed_date' | 'date_range' | '';
  fixedDate: string;
  startDate: string;
  endDate: string;
  refundable: boolean;
  realNameRequired: boolean;
  pricing?: PricingData;
  inventory?: ScheduleInventoryData;
}

const props = defineProps<{
  modelValue: TicketType[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: TicketType[]];
}>();

const expandedTickets = ref<Set<number>>(new Set());

const validityTypes = [
  { value: 'fixed_date', label: 'Fixed date' },
  { value: 'date_range', label: 'Date range' }
];

function toggleTicket(index: number) {
  if (expandedTickets.value.has(index)) {
    expandedTickets.value.delete(index);
  } else {
    expandedTickets.value.add(index);
  }
}

function addTicket() {
  const updated = [
    ...props.modelValue,
    {
      name: "",
      description: "",
      ageRestriction: "",
      validityType: '' as const,
      fixedDate: "",
      startDate: "",
      endDate: "",
      refundable: false,
      realNameRequired: false
    }
  ];
  emit("update:modelValue", updated);
  // Auto-expand the new ticket type
  expandedTickets.value.add(updated.length - 1);
}

function removeTicket(index: number) {
  const updated = props.modelValue.filter((_, i) => i !== index);
  emit("update:modelValue", updated);
  expandedTickets.value.delete(index);
  // Re-index expanded tickets
  const newExpanded = new Set<number>();
  expandedTickets.value.forEach((idx) => {
    if (idx < index) {
      newExpanded.add(idx);
    } else if (idx > index) {
      newExpanded.add(idx - 1);
    }
  });
  expandedTickets.value = newExpanded;
}

function duplicateTicket(index: number) {
  const ticketType = props.modelValue[index];
  // Remove ALL existing "(Copy)" patterns and numbers from the name
  const baseName = ticketType.name.replace(/\s*\(Copy(?:\s+\d+)?\)\s*/g, '').trim();
  // Use simple numbering: "Ticket Name 2", "Ticket Name 3", etc.
  let copyNumber = 2;
  let newName = `${baseName} ${copyNumber}`;
  while (props.modelValue.some(t => t.name === newName)) {
    copyNumber++;
    newName = `${baseName} ${copyNumber}`;
  }
  
  const duplicated = {
    ...ticketType,
    name: newName,
    // Reset pricing and inventory for the duplicate
    pricing: undefined,
    inventory: undefined
  };
  const updated = [
    ...props.modelValue.slice(0, index + 1),
    duplicated,
    ...props.modelValue.slice(index + 1)
  ];
  emit("update:modelValue", updated);
  expandedTickets.value.add(index + 1);
}

function updateTicket(index: number, key: keyof TicketType, value: string | boolean) {
  const updated = props.modelValue.map((ticket, i) =>
    i === index ? { ...ticket, [key]: value } : ticket
  );
  emit("update:modelValue", updated);
}
</script>

<style scoped>
.ticket-types {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.ticket-types-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.ticket-card {
  background: #ffffff;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  overflow: hidden;
}

.ticket-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  cursor: pointer;
  transition: background 0.2s;
}

.ticket-card-header:active {
  background: #f8fafc;
}

.ticket-header-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.ticket-number {
  font-size: 26rpx;
  color: #64748b;
  font-weight: 500;
}

.ticket-name {
  font-size: 30rpx;
  color: #0f172a;
  font-weight: 600;
}

.ticket-header-actions {
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

.ticket-chevron {
  width: 40rpx;
  height: 40rpx;
  color: #64748b;
  transition: transform 0.2s;
}

.ticket-chevron.expanded {
  transform: rotate(180deg);
}

.ticket-card-content {
  padding: 0 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.ticket-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #e2e8f0;
}

.ticket-section:first-child {
  border-top: none;
  padding-top: 0;
}

.ticket-section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.ticket-section-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.ticket-section-title {
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

.validity-type-select {
  display: flex;
  gap: 16rpx;
  margin-top: 12rpx;
}

.validity-option {
  flex: 1;
  padding: 16rpx 24rpx;
  border-radius: 8rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 26rpx;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2rpx solid transparent;
}

.validity-option.active {
  background: #EF4444;
  color: #ffffff;
  border-color: #EF4444;
}

.validity-option:active {
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

.add-ticket-section {
  margin-top: 24rpx;
}

.btn-add-ticket {
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

.btn-add-ticket:active {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.btn-add-ticket svg {
  width: 40rpx;
  height: 40rpx;
}

.ticket-types :deep(.text-input-wrap input),
.ticket-types :deep(.text-input-native) {
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

.ticket-types :deep(.text-input-wrap input):focus,
.ticket-types :deep(.text-input-native):focus {
  outline: none;
  border-color: #EF4444;
}

.ticket-types :deep(.textarea-wrap textarea),
.ticket-types :deep(.textarea-native) {
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

.ticket-types :deep(.textarea-wrap textarea):focus,
.ticket-types :deep(.textarea-native):focus {
  outline: none;
  border-color: #EF4444;
}
</style>
