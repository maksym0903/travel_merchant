<template>
  <view class="tickets-page app-font">
    <view class="phone-frame">
      <PageHead :title="t('merchant.ticketsTitle')" />
      <view class="phone-inner">
        <!-- Search and Filter Bar -->
        <SearchBar
          v-model="searchQuery"
          :placeholder="t('merchant.searchTickets') || 'Search tickets...'"
          :filters="filters"
          v-model:activeFilter="activeFilter"
          :background-image="'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=400&fit=crop&q=80&auto=format'"
        />

        <!-- Tickets List -->
        <view class="tickets-container">
          <!-- Loading state -->
          <view v-if="isLoading" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner empty-icon">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <text class="empty-title">{{ t('merchant.loading') }}</text>
          </view>

          <!-- Error state -->
          <view v-else-if="loadError" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon" style="color:#ef4444">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <text class="empty-title">{{ loadError }}</text>
            <view class="btn btn-primary" style="margin-top:16px;max-width:160px" @click="fetchTickets">
              <text>{{ t('merchant.retry') }}</text>
            </view>
          </view>

          <!-- Empty state -->
          <view v-else-if="filteredTickets.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <text class="empty-title">{{ t('merchant.noTickets') }}</text>
            <text class="empty-desc">{{ t('merchant.noTicketsDesc') }}</text>
          </view>

          <!-- Ticket Cards -->
          <view v-else class="tickets-grid">
            <view
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              class="ticket-card"
            >
              <!-- Horizontal layout: left image, right info -->
              <view class="ticket-card-inner">
                <!-- Left: Thumbnail -->
                <view class="ticket-thumb">
                  <view class="ticket-thumb-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#94a3b8">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                  </view>
                  <!-- Status badge on image -->
                  <view class="ticket-status-badge" :class="ticket.status">
                    <text>{{ getStatusLabel(ticket.status) }}</text>
                  </view>
                </view>

                <!-- Right: Info -->
                <view class="ticket-info">
                  <text class="ticket-name">{{ ticket.attraction_name }}</text>

                  <!-- Location -->
                  <view class="ticket-location" v-if="ticket.location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <text class="location-text">{{ ticket.location }}</text>
                  </view>

                  <!-- Ticket Type & Validity -->
                  <view class="ticket-meta">
                    <view class="meta-chip">
                      <text>{{ ticket.ticket_type }}</text>
                    </view>
                    <view class="meta-chip" v-if="ticket.validity_days">
                      <text>{{ ticket.validity_days }}d valid</text>
                    </view>
                  </view>

                  <!-- Description -->
                  <text class="ticket-desc" v-if="ticket.description">{{ ticket.description }}</text>

                  <!-- Footer: price + date + actions -->
                  <view class="ticket-footer">
                    <view class="ticket-price-col">
                      <text class="price-symbol">¥</text>
                      <text class="price-amount">{{ Math.round(ticket.price) }}</text>
                      <text class="price-suffix">/ticket</text>
                    </view>
                    <view class="ticket-date">
                      <text>{{ formatDate(ticket.createdAt) }}</text>
                    </view>
                    <view class="ticket-actions">
                      <view class="action-btn edit-btn" @click.stop="editTicket(ticket)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </view>
                      <view class="action-btn delete-btn" @click.stop="confirmDeleteTicket(ticket)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- Floating Action Button -->
        <view class="fab" @click="addTicket">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </view>
      </view>
    </view>
    <BottomTabBar />

    <!-- Create Ticket Drawer -->
    <view v-if="showCreateModal" class="drawer-overlay" @click="closeCreateModal">
      <view class="drawer-content" @click.stop>
        <view class="drawer-handle"></view>
        <view class="drawer-header">
          <text class="drawer-title">Create Ticket</text>
          <view class="drawer-close" @click="closeCreateModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </view>
        </view>

        <view class="drawer-body">
          <!-- Basic Info -->
          <view class="field-section">
            <view class="form-group">
              <text class="form-label">Attraction Name *</text>
              <TextInput
                v-model="newTicket.attraction_name"
                type="text"
                placeholder="e.g. Great Wall of China"
              />
              <text v-if="errors.attraction_name" class="form-error">{{ errors.attraction_name }}</text>
            </view>

            <view class="form-group">
              <text class="form-label">Location</text>
              <TextInput
                v-model="newTicket.location"
                type="text"
                placeholder="e.g. Beijing, China"
              />
            </view>

            <view class="form-group">
              <text class="form-label">Description</text>
              <TextArea
                v-model="newTicket.description"
                placeholder="Describe the attraction and what the ticket includes..."
              />
            </view>
          </view>

          <!-- Ticket Details -->
          <view class="field-section">
            <view class="section-header">
              <text class="section-title">Ticket Details</text>
            </view>

            <view class="form-group">
              <text class="form-label">Ticket Type</text>
              <view class="type-options">
                <view
                  v-for="type in ticketTypeOptions"
                  :key="type.value"
                  class="type-option"
                  :class="{ active: newTicket.ticket_type === type.value }"
                  @click="newTicket.ticket_type = type.value"
                >
                  <text>{{ type.label }}</text>
                </view>
              </view>
            </view>

            <view class="form-row">
              <view class="form-group form-group-half">
                <text class="form-label">Price (¥) *</text>
                <TextInput
                  :modelValue="newTicket.price > 0 ? newTicket.price.toString() : ''"
                  type="text"
                  placeholder="0"
                  @update:modelValue="(v) => newTicket.price = parseFloat(v) || 0"
                />
                <text v-if="errors.price" class="form-error">{{ errors.price }}</text>
              </view>
              <view class="form-group form-group-half">
                <text class="form-label">Validity (days)</text>
                <TextInput
                  :modelValue="newTicket.validity_days > 0 ? newTicket.validity_days.toString() : ''"
                  type="text"
                  placeholder="e.g. 1"
                  @update:modelValue="(v) => newTicket.validity_days = parseInt(v) || 0"
                />
              </view>
            </view>
          </view>
        </view>

        <view class="drawer-footer">
          <view class="drawer-actions">
            <view class="btn btn-secondary" @click="saveAsDraft" :class="{ loading: isSubmitting }">
              <text v-if="!isSubmitting">{{ t('merchant.saveAsDraft') }}</text>
              <text v-else>{{ t('merchant.saving') }}</text>
            </view>
            <view class="btn btn-primary" @click="submitForReview" :class="{ loading: isSubmitting }">
              <text v-if="!isSubmitting">{{ t('merchant.submitForReview') }}</text>
              <text v-else>{{ t('merchant.submitting') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import PageHead from "../../components/PageHead.vue";
import BottomTabBar from "../../components/BottomTabBar.vue";
import SearchBar from "../../components/SearchBar.vue";
import TextInput from "../../components/TextInput.vue";
import TextArea from "../../components/TextArea.vue";
import {
  getMerchantTickets,
  createMerchantTicket,
  type MerchantTicket,
  type TicketStatus,
  type TicketType,
} from "../../api/merchant";

const { t } = useI18n();

// ── Ticket display interface ──────────────────────────────────────────────────
interface Ticket {
  id: string;
  attraction_name: string;
  description?: string;
  location?: string;
  ticket_type: TicketType;
  price: number;
  validity_days?: number;
  stock_quantity?: number | null;
  status: "draft" | "published" | "paused";
  createdAt: string;
  updatedAt: string;
}

function mapStatus(apiStatus: TicketStatus): Ticket["status"] {
  switch (apiStatus) {
    case "PUBLISHED": return "published";
    case "PAUSED":    return "paused";
    case "DRAFT":
    default:          return "draft";
  }
}

function apiTicketToTicket(t: MerchantTicket): Ticket {
  return {
    id: t.id,
    attraction_name: t.attraction_name,
    description: t.description,
    location: t.location,
    ticket_type: t.ticket_type,
    price: t.price,
    validity_days: t.validity_days,
    stock_quantity: t.stock_quantity,
    status: mapStatus(t.status),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

// ── State ─────────────────────────────────────────────────────────────────────
const tickets = ref<Ticket[]>([]);
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const searchQuery = ref("");
const activeFilter = ref<"all" | "draft" | "published" | "paused">("all");

// ── Fetch from API ────────────────────────────────────────────────────────────
async function fetchTickets() {
  isLoading.value = true;
  loadError.value = null;
  try {
    const raw = await getMerchantTickets();
    tickets.value = raw.map(apiTicketToTicket);
  } catch (err: any) {
    loadError.value = err?.message ?? t("merchant.errorGeneric");
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchTickets();
});

// ── Filters ───────────────────────────────────────────────────────────────────
const filters = computed(() => [
  { value: "all" as const,       label: t("merchant.allTickets") || "All" },
  { value: "published" as const, label: t("merchant.published") || "Published" },
  { value: "draft" as const,     label: t("merchant.draft") || "Draft" },
  { value: "paused" as const,    label: t("merchant.paused") || "Paused" },
]);

const filteredTickets = computed(() => {
  let result = tickets.value;

  if (activeFilter.value !== "all") {
    result = result.filter(ticket => ticket.status === activeFilter.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(ticket =>
      ticket.attraction_name.toLowerCase().includes(query) ||
      (ticket.location ?? "").toLowerCase().includes(query) ||
      (ticket.description ?? "").toLowerCase().includes(query)
    );
  }

  return result;
});

function getStatusLabel(status: string): string {
  switch (status) {
    case "published": return "Published";
    case "paused":    return "Paused";
    case "draft":
    default:          return "Draft";
  }
}

// ── Ticket type options ───────────────────────────────────────────────────────
const ticketTypeOptions: { value: TicketType; label: string }[] = [
  { value: "ADULT",  label: "Adult" },
  { value: "CHILD",  label: "Child" },
  { value: "SENIOR", label: "Senior" },
  { value: "FAMILY", label: "Family" },
];

// ── Create Drawer ─────────────────────────────────────────────────────────────
const showCreateModal = ref(false);
const isSubmitting = ref(false);
const errors = ref<Record<string, string>>({});

const newTicket = ref({
  attraction_name: "",
  location: "",
  description: "",
  ticket_type: "ADULT" as TicketType,
  price: 0,
  validity_days: 0,
});

function addTicket() {
  newTicket.value = {
    attraction_name: "",
    location: "",
    description: "",
    ticket_type: "ADULT",
    price: 0,
    validity_days: 0,
  };
  errors.value = {};
  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
  errors.value = {};
}

function validateForm(): boolean {
  errors.value = {};
  if (!newTicket.value.attraction_name.trim()) {
    errors.value.attraction_name = "Attraction name is required";
  }
  if (typeof newTicket.value.price !== "number" || newTicket.value.price < 0) {
    errors.value.price = "Price must be 0 or greater";
  }
  return Object.keys(errors.value).length === 0;
}

async function saveAsDraft() {
  if (isSubmitting.value) return;
  if (!validateForm()) {
    uni.showToast({ title: t("merchant.pleaseCompleteRequiredFields"), icon: "none", duration: 2000 });
    return;
  }

  isSubmitting.value = true;
  try {
    await createMerchantTicket({
      attraction_name: newTicket.value.attraction_name.trim(),
      price: newTicket.value.price,
      description: newTicket.value.description.trim() || undefined,
      location: newTicket.value.location.trim() || undefined,
      ticket_type: newTicket.value.ticket_type,
      validity_days: newTicket.value.validity_days > 0 ? newTicket.value.validity_days : undefined,
      status: "DRAFT",
    });
    showCreateModal.value = false;
    uni.showToast({ title: t("merchant.ticketSavedAsDraft") || "Saved as draft", icon: "success", duration: 2000 });
    await fetchTickets();
  } catch (err: any) {
    uni.showToast({ title: err?.message ?? t("merchant.errorGeneric"), icon: "none", duration: 3000 });
  } finally {
    isSubmitting.value = false;
  }
}

async function submitForReview() {
  if (isSubmitting.value) return;
  if (!validateForm()) {
    uni.showToast({ title: t("merchant.pleaseCompleteRequiredFields"), icon: "none", duration: 2000 });
    return;
  }

  isSubmitting.value = true;
  try {
    await createMerchantTicket({
      attraction_name: newTicket.value.attraction_name.trim(),
      price: newTicket.value.price,
      description: newTicket.value.description.trim() || undefined,
      location: newTicket.value.location.trim() || undefined,
      ticket_type: newTicket.value.ticket_type,
      validity_days: newTicket.value.validity_days > 0 ? newTicket.value.validity_days : undefined,
      status: "PUBLISHED",
    });
    showCreateModal.value = false;
    uni.showToast({ title: t("merchant.ticketSubmittedForReview") || "Published!", icon: "success", duration: 2000 });
    await fetchTickets();
  } catch (err: any) {
    uni.showToast({ title: err?.message ?? t("merchant.errorGeneric"), icon: "none", duration: 3000 });
  } finally {
    isSubmitting.value = false;
  }
}

function editTicket(ticket: Ticket) {
  uni.showToast({ title: `Edit: ${ticket.attraction_name}`, icon: "none", duration: 2000 });
}

function confirmDeleteTicket(ticket: Ticket) {
  uni.showModal({
    title: t("merchant.deleteTicket"),
    content: t("merchant.deleteTicketConfirm", { name: ticket.attraction_name }),
    success: (res) => {
      if (res.confirm) {
        tickets.value = tickets.value.filter(tk => tk.id !== ticket.id);
        uni.showToast({ title: t("merchant.ticketDeleted"), icon: "success", duration: 2000 });
        fetchTickets();
      }
    }
  });
}
</script>

<style scoped>
.app-font {
  font-family: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.tickets-page {
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
  padding: 0 0 48rpx;
  box-sizing: border-box;
  background: #f8fafc;
  border: none;
  overflow: auto;
  position: relative;
}

@media (min-width: 768px) {
  .tickets-page {
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

/* Tickets Container */
.tickets-container {
  padding: 16px;
}

.tickets-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Ticket Card — horizontal layout */
.ticket-card {
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.ticket-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.ticket-card-inner {
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 120px;
}

/* Left thumbnail */
.ticket-thumb {
  width: 100px;
  min-width: 100px;
  position: relative;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ticket-thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Status badge on thumbnail */
.ticket-status-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}

.ticket-status-badge.draft {
  background: rgba(251, 191, 36, 0.92);
  color: #ffffff;
}

.ticket-status-badge.published {
  background: rgba(34, 197, 94, 0.92);
  color: #ffffff;
}

.ticket-status-badge.paused {
  background: rgba(100, 116, 139, 0.92);
  color: #ffffff;
}

.ticket-status-badge text {
  font-family: inherit;
}

/* Right info */
.ticket-info {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.ticket-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  margin-bottom: 4px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ticket-location {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
}

.location-text {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

.ticket-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.meta-chip {
  background: #f1f5f9;
  border-radius: 6px;
  padding: 2px 8px;
}

.meta-chip text {
  font-size: 11px;
  color: #475569;
  font-weight: 500;
  font-family: inherit;
}

.ticket-desc {
  font-size: 12px;
  color: #666666;
  line-height: 1.4;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}

/* Footer */
.ticket-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 6px;
  border-top: 1px solid #f1f5f9;
}

.ticket-price-col {
  display: flex;
  align-items: baseline;
  color: #e09c07;
  line-height: 1;
  flex-shrink: 0;
}

.price-symbol {
  font-size: 12px;
  font-weight: 600;
  margin-right: 1px;
}

.price-amount {
  font-size: 18px;
  font-weight: 700;
  margin-right: 2px;
}

.price-suffix {
  font-size: 11px;
  font-weight: 500;
  color: #999999;
}

.ticket-date {
  flex: 1;
}

.ticket-date text {
  font-size: 11px;
  color: #94a3b8;
  font-family: inherit;
}

.ticket-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.edit-btn {
  background: #FFEDD5;
  color: #F97316;
}

.edit-btn:active {
  background: #FED7AA;
}

.delete-btn {
  background: #fef2f2;
  color: #ef4444;
}

.delete-btn:active {
  background: #fee2e2;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
  display: block;
}

.empty-desc {
  font-size: 14px;
  color: #64748b;
  display: block;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #e09c07;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(224, 156, 7, 0.4);
  z-index: 10;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(224, 156, 7, 0.3);
}

.fab svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
}

@media (min-width: 768px) {
  .fab {
    right: calc(50% - min(390px, 100vw) / 2 + 20px);
  }
}

/* Drawer */
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.drawer-content {
  width: 100%;
  max-width: min(390px, 100vw);
  height: 85vh;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
  position: relative;
  z-index: 1001;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.drawer-handle {
  width: 80rpx;
  height: 8rpx;
  background: #cbd5e1;
  border-radius: 4rpx;
  margin: 16rpx auto 0;
  flex-shrink: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx 32rpx;
  border-bottom: 1rpx solid #e2e8f0;
  flex-shrink: 0;
}

.drawer-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #0f172a;
}

.drawer-close {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  border-radius: 16rpx;
}

.drawer-close:active {
  background: #f1f5f9;
}

.drawer-close svg {
  width: 40rpx;
  height: 40rpx;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 40rpx 32rpx;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}

/* Field Sections */
.field-section {
  margin-bottom: 32rpx;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  border: 1rpx solid #e2e8f0;
}

.section-header {
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.form-group {
  margin-bottom: 28rpx;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group-half {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 20rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #475569;
  margin-bottom: 12rpx;
}

.form-error {
  display: block;
  font-size: 24rpx;
  color: #ef4444;
  margin-top: 8rpx;
  padding: 10rpx 14rpx;
  background: #fef2f2;
  border-left: 4rpx solid #ef4444;
  border-radius: 4rpx;
}

.drawer-body :deep(.text-input-wrap input),
.drawer-body :deep(.text-input-native),
.drawer-body :deep(.textarea-wrap textarea),
.drawer-body :deep(.textarea-native) {
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

.drawer-body :deep(.text-input-wrap input):focus,
.drawer-body :deep(.text-input-native):focus,
.drawer-body :deep(.textarea-wrap textarea):focus,
.drawer-body :deep(.textarea-native):focus {
  outline: none;
  border-color: #e09c07;
}

.drawer-body :deep(.textarea-wrap textarea),
.drawer-body :deep(.textarea-native) {
  min-height: 120rpx;
  resize: none;
}

/* Ticket Type Options */
.type-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
  margin-top: 8rpx;
}

.type-option {
  padding: 16rpx 20rpx;
  border-radius: 10rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.type-option text {
  font-size: 26rpx;
  color: #475569;
  font-weight: 500;
  font-family: inherit;
}

.type-option.active {
  background: #fef3c7;
  border-color: #e09c07;
}

.type-option.active text {
  color: #92400e;
  font-weight: 600;
}

.type-option:active {
  opacity: 0.8;
}

/* Drawer Footer */
.drawer-footer {
  padding: 32rpx;
  border-top: 1rpx solid #e2e8f0;
  background: #ffffff;
  flex-shrink: 0;
}

.drawer-actions {
  display: flex;
  gap: 24rpx;
}

.btn {
  flex: 1;
  padding: 30rpx 32rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s;
  border: none;
  font-family: inherit;
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
}

.btn-secondary:active {
  background: #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #e09c07 0%, #f59e0b 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(224, 156, 7, 0.3);
}

.btn-primary:active {
  background: linear-gradient(135deg, #b45309 0%, #d97706 100%);
}

.btn-primary.loading,
.btn-secondary.loading {
  opacity: 0.5;
  pointer-events: none;
}

.btn text {
  font-family: inherit;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
