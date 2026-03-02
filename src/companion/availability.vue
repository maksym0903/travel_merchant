<template>
  <view class="companion-availability-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('companion.availabilityTitle')" />
      <view class="phone-inner">
        <view class="month-bar">
          <view class="month-btn" @click="prevMonth">
            <text>‹</text>
          </view>
          <view class="month-title">
            <text class="month-text">{{ monthLabel }}</text>
            <text class="month-sub">{{ t("companion.availability.tapToEdit") }}</text>
          </view>
          <view class="month-btn" @click="nextMonth">
            <text>›</text>
          </view>
        </view>

        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ t("merchant.loading") }}</text>
        </view>

        <view v-else class="calendar">
          <view class="weekdays">
            <text v-for="d in weekdayLabels" :key="d" class="weekday">{{ d }}</text>
          </view>
          <view class="grid">
            <view
              v-for="cell in cells"
              :key="cell.key"
              class="cell"
              :class="{ empty: !cell.date, today: cell.isToday }"
              @click="cell.date && openEditor(cell.date)"
            >
              <view v-if="cell.date" class="cell-inner" :class="dayClass(cell.date)">
                <text class="day-num">{{ cell.day }}</text>
                <view v-if="hasSlots(cell.date)" class="dot"></view>
              </view>
            </view>
          </view>

          <view class="legend">
            <view class="legend-item">
              <view class="legend-pill available"></view>
              <text class="legend-text">{{ t("companion.availability.available") }}</text>
            </view>
            <view class="legend-item">
              <view class="legend-pill blocked"></view>
              <text class="legend-text">{{ t("companion.availability.blocked") }}</text>
            </view>
            <view class="legend-item">
              <view class="legend-dot"></view>
              <text class="legend-text">{{ t("companion.availability.hasSlots") }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <BottomTabBar />

    <!-- Editor Drawer -->
    <view v-if="editorVisible" class="drawer-overlay" @click="closeEditor">
      <view class="drawer-content" @click.stop>
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">{{ editorDate }}</text>
          <view class="drawer-close" @click="closeEditor">
            <text>×</text>
          </view>
        </view>

        <view class="drawer-body">
          <view class="toggle-row">
            <text class="toggle-label">{{ t("companion.availability.status") }}</text>
            <view class="toggle-tabs">
              <view class="toggle-tab" :class="{ active: editorAvailable }" @click="editorAvailable = true">
                <text>{{ t("companion.availability.available") }}</text>
              </view>
              <view class="toggle-tab" :class="{ active: !editorAvailable }" @click="editorAvailable = false">
                <text>{{ t("companion.availability.blocked") }}</text>
              </view>
            </view>
          </view>

          <view class="slots">
            <text class="section-label">{{ t("companion.availability.timeSlots") }}</text>
            <view class="slot-grid">
              <view
                v-for="s in slotPresets"
                :key="s"
                class="slot-chip"
                :class="{ active: editorSlots.includes(s), disabled: !editorAvailable }"
                @click="toggleSlot(s)"
              >
                <text>{{ s }}</text>
              </view>
            </view>
            <view class="slots-hint">
              <text class="muted">{{ t("companion.availability.slotsHint") }}</text>
            </view>
          </view>

          <view class="note">
            <text class="section-label">{{ t("companion.availability.note") }}</text>
            <input
              class="note-input"
              type="text"
              :placeholder="t('companion.availability.notePlaceholder')"
              v-model="editorNote"
            />
          </view>
        </view>

        <view class="drawer-actions">
          <view class="btn secondary" @click="clearForDay">
            <text>{{ t("companion.availability.clear") }}</text>
          </view>
          <view class="btn primary" @click="save">
            <text>{{ saving ? t("companion.availability.saving") : t("companion.availability.save") }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getAccessToken } from "../api/auth";
import { getCompanionAvailability, updateCompanionAvailability, type AvailabilityDay } from "../api/companion";
import { ROUTES } from "../routes";
import { showToast } from "../utils/toast";
import PageHead from "../components/PageHead.vue";
import BottomTabBar from "../components/BottomTabBar.vue";

const { t } = useI18n();

const loading = ref(true);
const saving = ref(false);
const month = ref<string>(currentMonth());
const days = ref<AvailabilityDay[]>([]);

const editorVisible = ref(false);
const editorDate = ref("");
const editorAvailable = ref(true);
const editorSlots = ref<string[]>([]);
const editorNote = ref("");

const slotPresets = ["Full day", "Morning", "Afternoon", "Evening"];

function currentMonth(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const monthLabel = computed(() => {
  const [y, m] = month.value.split("-");
  return `${y}-${m}`;
});

const weekdayLabels = computed(() => [
  t("companion.availability.sun"),
  t("companion.availability.mon"),
  t("companion.availability.tue"),
  t("companion.availability.wed"),
  t("companion.availability.thu"),
  t("companion.availability.fri"),
  t("companion.availability.sat"),
]);

const dayMap = computed(() => {
  const map = new Map<string, AvailabilityDay>();
  for (const d of days.value) map.set(d.date, d);
  return map;
});

function isToday(date: string): boolean {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(
    2,
    "0"
  )}`;
  return date === today;
}

type Cell = { key: string; date: string | null; day: number | null; isToday: boolean };

const cells = computed<Cell[]>(() => {
  const [yStr, mStr] = month.value.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const firstDow = new Date(y, m - 1, 1).getDay(); // 0..6
  const daysInMonth = new Date(y, m, 0).getDate();

  const out: Cell[] = [];
  for (let i = 0; i < firstDow; i++) out.push({ key: `e-${i}`, date: null, day: null, isToday: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${month.value}-${String(d).padStart(2, "0")}`;
    out.push({ key: date, date, day: d, isToday: isToday(date) });
  }
  // Fill to full weeks
  while (out.length % 7 !== 0) out.push({ key: `t-${out.length}`, date: null, day: null, isToday: false });
  return out;
});

function hasSlots(date: string): boolean {
  const d = dayMap.value.get(date);
  return (d?.time_slots?.length ?? 0) > 0;
}

function dayClass(date: string): string {
  const d = dayMap.value.get(date);
  if (!d) return "unknown";
  if (!d.is_available) return "blocked";
  return "available";
}

function prevMonth() {
  const [yStr, mStr] = month.value.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() - 1);
  month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  fetchMonth();
}

function nextMonth() {
  const [yStr, mStr] = month.value.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() + 1);
  month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  fetchMonth();
}

async function fetchMonth() {
  const token = getAccessToken();
  if (!token) {
    uni.reLaunch({ url: ROUTES.LOGIN });
    return;
  }

  loading.value = true;
  try {
    const res = await getCompanionAvailability(token, month.value);
    days.value = res.data.days;
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    loading.value = false;
  }
}

function openEditor(date: string) {
  const d = dayMap.value.get(date);
  editorDate.value = date;
  editorAvailable.value = d?.is_available ?? true;
  editorSlots.value = [...(d?.time_slots ?? (editorAvailable.value ? ["Full day"] : []))];
  editorNote.value = d?.note ?? "";
  editorVisible.value = true;
}

function closeEditor() {
  if (saving.value) return;
  editorVisible.value = false;
}

function toggleSlot(slot: string) {
  if (!editorAvailable.value) return;
  const set = new Set(editorSlots.value);
  if (set.has(slot)) set.delete(slot);
  else set.add(slot);
  editorSlots.value = [...set];
}

function clearForDay() {
  editorAvailable.value = false;
  editorSlots.value = [];
  editorNote.value = "";
}

async function save() {
  const token = getAccessToken();
  if (!token) {
    uni.reLaunch({ url: ROUTES.LOGIN });
    return;
  }
  if (!editorDate.value) return;

  saving.value = true;
  try {
    const payload = {
      date: editorDate.value,
      is_available: editorAvailable.value,
      time_slots: editorAvailable.value ? editorSlots.value : [],
      note: editorNote.value.trim() || undefined,
    };
    await updateCompanionAvailability(token, payload);

    // Update local state
    const idx = days.value.findIndex((d) => d.date === editorDate.value);
    const next: AvailabilityDay = {
      date: editorDate.value,
      is_available: payload.is_available,
      time_slots: payload.time_slots ?? [],
      note: payload.note,
    };
    if (idx >= 0) days.value[idx] = next;
    else days.value = [...days.value, next];

    showToast({ title: t("companion.availability.saved"), icon: "success" });
    editorVisible.value = false;
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("merchant.errorGeneric");
    showToast({ title: msg, icon: "none" });
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchMonth();
});
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.companion-availability-page {
  min-height: 100vh;
  height: 100vh;
  padding-top: 0;
  background: #f1f5f9;
  box-sizing: border-box;
  overflow: hidden;
  padding-bottom: 56px;
}

.phone-frame {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  border: none;
}

.phone-inner {
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
  margin: 0 auto;
  padding: 16rpx 16rpx 48rpx;
  box-sizing: border-box;
  background: #f8fafc;
  border: none;
  overflow: auto;
}

@media (min-width: 768px) {
  .companion-availability-page {
    padding: 32rpx 0 32rpx;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    background: #e2e8f0;
  }

  .phone-frame {
    width: 100%;
    max-width: min(390px, 100vw);
    height: 100%;
    min-height: 0;
    border-radius: 0;
    box-shadow: none;
    overflow: hidden;
    background: #ffffff;
    border: none;
  }

  .phone-inner {
    border: none;
    border-radius: 0;
    min-height: 0;
    background: #f8fafc;
  }
}

.month-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  padding: 12rpx 6rpx 16rpx;
}

.month-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #0f172a;
}

.month-title {
  flex: 1;
  text-align: center;
}

.month-text {
  display: block;
  font-size: 30rpx;
  font-weight: 800;
  color: #0f172a;
}

.month-sub {
  display: block;
  font-size: 22rpx;
  color: #64748b;
  margin-top: 4rpx;
}

.loading-container {
  padding: 64rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border-radius: 999px;
  border: 6rpx solid #e2e8f0;
  border-top-color: #EF4444;
  animation: spin 1s linear infinite;
  margin-bottom: 16rpx;
}

.loading-text {
  font-size: 26rpx;
  color: #64748b;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.calendar {
  padding-bottom: 18rpx;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
  margin-bottom: 10rpx;
}

.weekday {
  text-align: center;
  font-size: 22rpx;
  color: #64748b;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
}

.cell {
  aspect-ratio: 1 / 1;
}

.cell.empty {
  opacity: 0;
}

.cell-inner {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cell-inner.available {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.cell-inner.blocked {
  background: #fef2f2;
  border-color: #fecaca;
}

.cell.today .cell-inner {
  outline: 3rpx solid rgba(239, 68, 68, 0.35);
}

.day-num {
  font-size: 26rpx;
  font-weight: 700;
  color: #0f172a;
}

.dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 999px;
  background: #EF4444;
  position: absolute;
  bottom: 10rpx;
  right: 10rpx;
}

.legend {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx 18rpx;
  align-items: center;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-pill {
  width: 22rpx;
  height: 12rpx;
  border-radius: 999px;
  border: 1rpx solid #e2e8f0;
}

.legend-pill.available {
  background: #bbf7d0;
  border-color: #86efac;
}

.legend-pill.blocked {
  background: #fecaca;
  border-color: #fca5a5;
}

.legend-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 999px;
  background: #EF4444;
}

.legend-text {
  font-size: 22rpx;
  color: #64748b;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.drawer-content {
  width: 100%;
  max-width: min(390px, 100vw);
  background: #ffffff;
  border-radius: 20rpx 20rpx 0 0;
  border: 1rpx solid #e2e8f0;
  padding: 18rpx 16rpx 16rpx;
}

.drawer-handle {
  width: 56rpx;
  height: 10rpx;
  border-radius: 999px;
  background: #e2e8f0;
  margin: 4rpx auto 10rpx;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 10rpx;
}

.drawer-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #0f172a;
}

.drawer-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #334155;
}

.drawer-body {
  padding: 6rpx 0 10rpx;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 14rpx;
}

.toggle-label {
  font-size: 24rpx;
  color: #64748b;
}

.toggle-tabs {
  display: flex;
  gap: 8rpx;
}

.toggle-tab {
  padding: 10rpx 12rpx;
  border-radius: 999px;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  font-size: 24rpx;
  color: #334155;
}

.toggle-tab.active {
  border-color: rgba(239, 68, 68, 0.35);
  background: #fff7ed;
  color: #EF4444;
}

.slots,
.note {
  margin-top: 12rpx;
}

.section-label {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10rpx;
}

.slot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10rpx;
}

.slot-chip {
  text-align: center;
  padding: 14rpx 12rpx;
  border-radius: 14rpx;
  border: 1rpx solid #e2e8f0;
  background: #ffffff;
  font-size: 24rpx;
  color: #334155;
}

.slot-chip.active {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;
}

.slot-chip.disabled {
  opacity: 0.5;
}

.slots-hint {
  margin-top: 8rpx;
}

.muted {
  font-size: 22rpx;
  color: #64748b;
}

.note-input {
  width: 100%;
  box-sizing: border-box;
  border: 1rpx solid #e2e8f0;
  border-radius: 14rpx;
  padding: 16rpx 14rpx;
  font-size: 24rpx;
  background: #ffffff;
  color: #0f172a;
}

.drawer-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
}

.btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 12rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 700;
}

.btn.secondary {
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  color: #334155;
}

.btn.primary {
  background: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
  color: #ffffff;
  border: none;
}
</style>

