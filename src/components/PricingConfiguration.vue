<template>
  <view class="pricing-configuration">
    <!-- Hotel Mode: Base Pricing -->
    <template v-if="mode === 'hotel'">
      <view class="info-section">
        <text class="info-text">Hotel pricing is usually:</text>
        <text class="info-bullet">• Price per night</text>
        <text class="info-bullet">• Per room</text>
      </view>

      <view class="divider"></view>

      <view class="field-category">
        <view class="category-header">
          <text class="category-title">Pricing Rules</text>
        </view>

        <!-- Base Price -->
        <view class="pricing-rule-section">
          <text class="rule-title">Base Price:</text>
          <view class="form-row">
            <view class="form-group form-group-half">
              <text class="form-label">Price per night</text>
              <TextInput
                :modelValue="modelValue.basePricing.pricePerNight.toString()"
                type="text"
                placeholder="e.g., 150"
                @update:modelValue="(val) => updateBasePricing('pricePerNight', Number(val) || 0)"
              />
            </view>
            <view class="form-group form-group-half">
              <text class="form-label">Currency</text>
              <TextInput
                :modelValue="modelValue.basePricing.currency"
                type="text"
                placeholder="e.g., EUR"
                @update:modelValue="(val) => updateBasePricing('currency', val)"
              />
            </view>
          </view>
        </view>

        <!-- Weekend Price -->
        <view class="pricing-rule-section">
          <text class="rule-title">Weekend Price:</text>
          <view class="form-group">
            <text class="form-label">Friday / Saturday different price</text>
            <TextInput
              :modelValue="modelValue.weekendPrice.toString()"
              type="text"
              placeholder="e.g., 200"
              @update:modelValue="(val) => updateWeekendPrice(Number(val) || 0)"
            />
          </view>
        </view>

        <!-- Seasonal Price -->
        <view class="pricing-rule-section">
          <text class="rule-title">Seasonal Price:</text>
          <view class="seasonal-pricing-list">
            <view
              v-for="(season, index) in modelValue.seasonalPricing"
              :key="index"
              class="seasonal-item"
            >
              <view class="seasonal-item-header">
                <text class="seasonal-item-title">Season {{ index + 1 }}</text>
                <view class="day-action-btn" @click="removeSeason(index)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </view>
              </view>
              <view class="form-row">
                <view class="form-group form-group-half">
                  <text class="form-label">Start Date</text>
                  <TextInput
                    :modelValue="season.startDate"
                    type="text"
                    placeholder="e.g., June 1"
                    @update:modelValue="(val) => updateSeason(index, 'startDate', val)"
                  />
                </view>
                <view class="form-group form-group-half">
                  <text class="form-label">End Date</text>
                  <TextInput
                    :modelValue="season.endDate"
                    type="text"
                    placeholder="e.g., Aug 31"
                    @update:modelValue="(val) => updateSeason(index, 'endDate', val)"
                  />
                </view>
              </view>
              <view class="form-group">
                <text class="form-label">Price</text>
                <TextInput
                  :modelValue="season.price.toString()"
                  type="text"
                  placeholder="e.g., 200"
                  @update:modelValue="(val) => updateSeason(index, 'price', Number(val) || 0)"
                />
              </view>
            </view>
          </view>
          <view class="btn btn-small" @click="addSeason" style="margin-top: 24rpx;">
            <text>+ Add Season</text>
          </view>
        </view>

        <!-- Extra Guest Fee -->
        <view class="pricing-rule-section">
          <text class="rule-title">Extra Guest Fee:</text>
          <view class="form-group">
            <text class="form-label">Optional:</text>
            <TextInput
              :modelValue="modelValue.extraGuestFee.toString()"
              type="text"
              placeholder="e.g., 30"
              @update:modelValue="(val) => updateExtraGuestFee(Number(val) || 0)"
            />
            <text class="form-hint">+€30 per extra guest</text>
          </view>
        </view>
      </view>
    </template>

    <!-- Tour Mode: Base Pricing -->
    <template v-else>
      <view class="field-category">
        <view class="category-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color: #EF4444;">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <text class="category-title">Base Pricing</text>
        </view>
        <view class="form-row">
          <view class="form-group form-group-half">
            <text class="form-label">Adult Price *</text>
            <TextInput
              :modelValue="modelValue.basePricing.adultPrice.toString()"
              type="text"
              placeholder="e.g., 500"
              @update:modelValue="(val) => updateBasePricing('adultPrice', Number(val) || 0)"
            />
          </view>
          <view class="form-group form-group-half">
            <text class="form-label">Child Price</text>
            <TextInput
              :modelValue="modelValue.basePricing.childPrice.toString()"
              type="text"
              placeholder="e.g., 300"
              @update:modelValue="(val) => updateBasePricing('childPrice', Number(val) || 0)"
            />
          </view>
        </view>
        <view class="form-row">
          <view class="form-group form-group-half">
            <text class="form-label">Single Supplement</text>
            <TextInput
              :modelValue="modelValue.basePricing.singleSupplement.toString()"
              type="text"
              placeholder="e.g., 100"
              @update:modelValue="(val) => updateBasePricing('singleSupplement', Number(val) || 0)"
            />
          </view>
          <view class="form-group form-group-half">
            <text class="form-label">Currency</text>
            <TextInput
              :modelValue="modelValue.basePricing.currency"
              type="text"
              placeholder="e.g., USD"
              @update:modelValue="(val) => updateBasePricing('currency', val)"
            />
          </view>
        </view>
      </view>

      <!-- Tour Mode: Tier Pricing (Optional) -->
      <view v-if="mode === 'tour'" class="field-category">
        <view class="category-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color: #EF4444;">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <text class="category-title">Tier Pricing (Optional)</text>
        </view>
      <view class="tier-pricing-list">
        <view
          v-for="(tier, index) in modelValue.tierPricing"
          :key="index"
          class="tier-item"
        >
          <view class="tier-item-header">
            <text class="tier-item-title">Tier {{ index + 1 }}</text>
            <view class="day-action-btn" @click="removeTier(index)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </view>
          </view>
          <view class="form-row">
            <view class="form-group form-group-third">
              <text class="form-label">Min Group Size</text>
              <TextInput
                :modelValue="tier.minGroupSize.toString()"
                type="text"
                placeholder="e.g., 1"
                @update:modelValue="(val) => updateTier(index, 'minGroupSize', Number(val) || 0)"
              />
            </view>
            <view class="form-group form-group-third">
              <text class="form-label">Max Group Size</text>
              <TextInput
                :modelValue="tier.maxGroupSize.toString()"
                type="text"
                placeholder="e.g., 2"
                @update:modelValue="(val) => updateTier(index, 'maxGroupSize', Number(val) || 0)"
              />
            </view>
            <view class="form-group form-group-third">
              <text class="form-label">Price</text>
              <TextInput
                :modelValue="tier.price.toString()"
                type="text"
                placeholder="e.g., 500"
                @update:modelValue="(val) => updateTier(index, 'price', Number(val) || 0)"
              />
            </view>
          </view>
        </view>
      </view>
        <view class="btn btn-small" @click="addTier" style="margin-top: 24rpx;">
          <text>+ Add Tier</text>
        </view>
      </view>

      <!-- Tour Mode: Seasonal Pricing -->
      <view v-if="mode === 'tour'" class="field-category">
        <view class="category-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color: #f59e0b;">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <text class="category-title">Seasonal Pricing</text>
        </view>
      <view class="seasonal-pricing-list">
        <view
          v-for="(season, index) in modelValue.seasonalPricing"
          :key="index"
          class="seasonal-item"
        >
          <view class="seasonal-item-header">
            <text class="seasonal-item-title">Season {{ index + 1 }}</text>
            <view class="day-action-btn" @click="removeSeason(index)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </view>
          </view>
          <view class="form-row">
            <view class="form-group form-group-half">
              <text class="form-label">Start Date</text>
              <TextInput
                :modelValue="season.startDate"
                type="text"
                placeholder="YYYY-MM-DD"
                @update:modelValue="(val) => updateSeason(index, 'startDate', val)"
              />
            </view>
            <view class="form-group form-group-half">
              <text class="form-label">End Date</text>
              <TextInput
                :modelValue="season.endDate"
                type="text"
                placeholder="YYYY-MM-DD"
                @update:modelValue="(val) => updateSeason(index, 'endDate', val)"
              />
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">Special Price</text>
            <TextInput
              :modelValue="season.price.toString()"
              type="text"
              placeholder="e.g., 600"
              @update:modelValue="(val) => updateSeason(index, 'price', Number(val) || 0)"
            />
          </view>
        </view>
      </view>
        <view class="btn btn-small" @click="addSeason" style="margin-top: 24rpx;">
          <text>+ Add Season</text>
        </view>
      </view>
    </template>

    <!-- Commission Display (Read-only) -->
    <view class="field-category" v-if="showCommission">
      <view class="category-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="category-icon" style="color: #64748b;">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <text class="category-title">Commission Display (Read-only)</text>
      </view>
      <view class="commission-display">
        <view class="commission-item">
          <text class="commission-label">Platform Commission:</text>
          <text class="commission-value commission-percent">{{ commissionRate }}%</text>
        </view>
        <view class="commission-item">
          <text class="commission-label">Selling Price:</text>
          <text class="commission-value commission-positive">{{ formatCurrency(displayPrice) }}</text>
        </view>
        <view class="commission-item">
          <text class="commission-label">Commission Amount:</text>
          <text class="commission-value commission-negative">-{{ formatCurrency(commissionAmount) }}</text>
        </view>
        <view class="commission-item commission-total">
          <text class="commission-label">You Receive:</text>
          <text class="commission-value commission-positive">{{ formatCurrency(merchantIncome) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import TextInput from "./TextInput.vue";

export interface BasePricing {
  adultPrice?: number;
  childPrice?: number;
  singleSupplement?: number;
  pricePerNight?: number;
  pricePerTicket?: number;
  currency: string;
}

export interface TierPricing {
  minGroupSize: number;
  maxGroupSize: number;
  price: number;
}

export interface SeasonalPricing {
  startDate: string;
  endDate: string;
  price: number;
}

export interface PricingData {
  basePricing: BasePricing;
  tierPricing?: TierPricing[];
  seasonalPricing: SeasonalPricing[];
  weekendPrice?: number;
  extraGuestFee?: number;
}

const props = withDefaults(
  defineProps<{
    modelValue: PricingData;
    commissionRate?: number;
    showCommission?: boolean;
    mode?: 'tour' | 'hotel' | 'ticket';
  }>(),
  {
    commissionRate: 10,
    showCommission: true,
    mode: 'tour'
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: PricingData];
}>();

const displayPrice = computed(() => {
  if (props.mode === 'hotel') {
    return props.modelValue.basePricing.pricePerNight || 0;
  }
  return props.modelValue.basePricing.adultPrice || 0;
});

const commissionAmount = computed(() => {
  return (displayPrice.value * props.commissionRate) / 100;
});

const merchantIncome = computed(() => {
  return displayPrice.value - commissionAmount.value;
});

function formatCurrency(amount: number): string {
  const currency = props.modelValue.basePricing.currency || "USD";
  return `${currency} ${amount.toFixed(2)}`;
}

function updateBasePricing(key: keyof BasePricing, value: number | string) {
  const updated = {
    ...props.modelValue,
    basePricing: {
      ...props.modelValue.basePricing,
      [key]: value
    }
  };
  emit("update:modelValue", updated);
}

function addTier() {
  const updated = {
    ...props.modelValue,
    tierPricing: [
      ...props.modelValue.tierPricing,
      {
        minGroupSize: 0,
        maxGroupSize: 0,
        price: 0
      }
    ]
  };
  emit("update:modelValue", updated);
}

function removeTier(index: number) {
  const updated = {
    ...props.modelValue,
    tierPricing: props.modelValue.tierPricing.filter((_, i) => i !== index)
  };
  emit("update:modelValue", updated);
}

function updateTier(index: number, key: keyof TierPricing, value: number) {
  const updated = {
    ...props.modelValue,
    tierPricing: props.modelValue.tierPricing.map((tier, i) =>
      i === index ? { ...tier, [key]: value } : tier
    )
  };
  emit("update:modelValue", updated);
}

function addSeason() {
  const updated = {
    ...props.modelValue,
    seasonalPricing: [
      ...props.modelValue.seasonalPricing,
      {
        startDate: "",
        endDate: "",
        price: 0
      }
    ]
  };
  emit("update:modelValue", updated);
}

function removeSeason(index: number) {
  const updated = {
    ...props.modelValue,
    seasonalPricing: props.modelValue.seasonalPricing.filter((_, i) => i !== index)
  };
  emit("update:modelValue", updated);
}

function updateSeason(index: number, key: keyof SeasonalPricing, value: string | number) {
  const updated = {
    ...props.modelValue,
    seasonalPricing: props.modelValue.seasonalPricing.map((season, i) =>
      i === index ? { ...season, [key]: value } : season
    )
  };
  emit("update:modelValue", updated);
}

function updateWeekendPrice(value: number) {
  const updated = {
    ...props.modelValue,
    weekendPrice: value
  };
  emit("update:modelValue", updated);
}

function updateExtraGuestFee(value: number) {
  const updated = {
    ...props.modelValue,
    extraGuestFee: value
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

.form-group {
  margin-bottom: 32rpx;
}

.form-group-half {
  flex: 1;
}

.form-group-third {
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

.tier-pricing-list,
.seasonal-pricing-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.tier-item,
.seasonal-item {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1rpx solid #e2e8f0;
}

.tier-item-header,
.seasonal-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.tier-item-title,
.seasonal-item-title {
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

.btn-small {
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  border-radius: 8rpx;
  background: #EF4444;
  color: #ffffff;
  text-align: center;
}

.commission-display {
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 32rpx;
  border: 1rpx solid #e2e8f0;
}

.commission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
}

.commission-item:last-child {
  border-bottom: none;
}

.commission-item.commission-total {
  margin-top: 16rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #EF4444;
  border-bottom: none;
}

.commission-label {
  font-size: 28rpx;
  color: #475569;
  font-weight: 500;
}

.commission-value {
  font-size: 28rpx;
  font-weight: 600;
}

.commission-percent {
  color: #ef4444;
}

.commission-positive {
  color: #EF4444;
}

.commission-negative {
  color: #ef4444;
}

.pricing-configuration :deep(.text-input-wrap input),
.pricing-configuration :deep(.text-input-native) {
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

.pricing-configuration :deep(.text-input-wrap input):focus,
.pricing-configuration :deep(.text-input-native):focus {
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
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12rpx;
}

.info-bullet {
  display: block;
  font-size: 26rpx;
  color: #64748b;
  margin-left: 24rpx;
  margin-bottom: 8rpx;
}

.divider {
  height: 1rpx;
  background: #e2e8f0;
  margin: 32rpx 0;
}

.pricing-rule-section {
  margin-bottom: 32rpx;
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.pricing-rule-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.rule-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 16rpx;
}

.form-hint {
  display: block;
  font-size: 24rpx;
  color: #94a3b8;
  margin-top: 8rpx;
}
</style>
