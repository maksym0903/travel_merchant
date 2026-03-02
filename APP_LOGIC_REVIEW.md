# Travel Merchant H5 App - Logic Review

## Executive Summary

This is a **uni-app** (Vue 3 + TypeScript) travel merchant management application built for H5 and multiple mini-program platforms. The app enables merchants to manage tours, hotels, tickets, insurance products, orders, analytics, and financial operations.

---

## 1. Architecture & Tech Stack

### Technology Stack
- **Framework**: uni-app 3.0 (Vue 3.5.28 + TypeScript)
- **Build Tool**: Vite 5.2.8
- **Styling**: Tailwind CSS 4.1.18 + Custom CSS
- **Internationalization**: vue-i18n 9.14.5 (English/Chinese)
- **State Management**: Local component state (no Pinia/Vuex)
- **Data Fetching**: Native fetch API + @tanstack/vue-query (available but not heavily used)
- **Platform Support**: H5, WeChat Mini Program, Alipay, Baidu, and others

### Application Structure
```
src/
├── api/              # API service layer
│   ├── auth.ts       # Authentication APIs
│   ├── merchant.ts   # Merchant profile APIs
│   ├── orders.ts     # Order management APIs
│   └── uploadLogo.ts # File upload APIs
├── auth/             # Authentication pages
├── merchant/         # Merchant feature pages
│   ├── dashboard.vue # ⚠️ Currently placeholder
│   ├── orders.vue    # Order management
│   ├── products/     # Product management (tours, hotels, tickets, insurance)
│   ├── analytics.vue # ⚠️ Currently placeholder
│   ├── wallet.vue    # Financial operations
│   └── ...
├── components/       # Reusable components
│   ├── BottomTabBar.vue
│   ├── PageHead.vue
│   ├── SearchBar.vue
│   ├── PricingConfiguration.vue
│   └── ScheduleInventory.vue
└── utils/            # Utility functions
```

---

## 2. Key Application Patterns

### 2.1 Authentication Flow

**Pattern**: Token-based authentication with localStorage
- **Token Storage**: `localStorage.getItem('access_token')`
- **API Pattern**: All authenticated requests use `Authorization: Bearer <token>`
- **User Role Detection**: Fetched from `/api/auth/me` endpoint
- **Role Types**: `MERCHANT` | `COMPANION`
- **Navigation Logic**:
  - After login → Check if merchant has `business_name`
  - If no business_name → Redirect to profile setup
  - If business_name exists → Redirect to dashboard

**Key Files**:
- `src/api/auth.ts` - Auth API functions
- `src/auth/login.vue` - Login page with role-based routing

### 2.2 Routing & Navigation

**Pattern**: uni-app native navigation + route constants
- **Route Definition**: `src/routes.ts` - Centralized route constants
- **Navigation Methods**: 
  - `uni.reLaunch()` - For major navigation (clears stack)
  - `uni.navigateTo()` - For detail pages
  - `uni.navigateBack()` - Go back
- **Bottom Tab Bar**: Role-based tabs (different for MERCHANT vs COMPANION)
- **Products Submenu**: Dropdown menu for Tours/Hotels/Tickets/Insurance

**Merchant Tabs**:
1. Dashboard (home)
2. Products (dropdown: Tours, Hotels, Tickets, Insurance)
3. Orders
4. Wallet
5. Analytics
6. Messages
7. Settings

**Companion Tabs**:
1. Dashboard
2. Orders
3. Services
4. Earnings

### 2.3 Component Architecture

**Pattern**: Vue 3 Composition API with `<script setup>`

**Common Components**:
- `PageHead` - Page header with title
- `BottomTabBar` - Role-aware bottom navigation
- `SearchBar` - Search + filter bar (used in tours, orders)
- `TextInput` / `TextArea` - Form inputs
- `PricingConfiguration` - Reusable pricing component
- `ScheduleInventory` - Schedule and inventory management

**Component Communication**:
- Props down, events up
- v-model for two-way binding
- Computed properties for derived state

### 2.4 Data Management

**Current State**: 
- **No global state management** (no Pinia/Vuex)
- Component-level reactive state using `ref()` and `computed()`
- Local storage for draft persistence (tours creation)
- API calls made directly in components

**Data Flow**:
```
Component → API Call → Update Local State → Re-render
```

**API Pattern**:
```typescript
// Standard API function structure
export async function getOrders(
  accessToken: string,
  filters?: OrderFilters
): Promise<OrdersResponse> {
  const url = getUrl("/api/orders");
  // ... fetch logic
  return data as OrdersResponse;
}
```

**Mock Data**: 
- Tours page uses mock data for development
- Mock tour IDs tracked: `["1", "2", "3", "4"]`
- Mock data updates on locale change

---

## 3. Business Logic Deep Dive

### 3.1 Tours Management (`tours.vue`)

**Key Features**:
1. **Tour Listing**: Grid view with search and status filters
2. **Tour Creation**: 5-step wizard with auto-save
3. **Status Management**: draft → submitted → online/rejected
4. **Local Storage**: Auto-saves draft data per step

**Tour Creation Flow**:
```
Step 1: Basic Info (name, destination, duration, description, media, policies)
  ↓ Auto-save to localStorage
Step 2: Itinerary Builder (day-by-day structure with activities, hotels, meals, transport)
  ↓ Auto-save to localStorage
Step 3: Pricing Configuration (base pricing, tier pricing, seasonal pricing, commission)
  ↓ Auto-save to localStorage
Step 4: Schedule & Inventory (departure dates, seat management)
  ↓ Auto-save to localStorage
Step 5: Review & Submit (validation checks, final submission)
  ↓ Submit → Status: "submitted" → Goes to review
```

**Tour Statuses**:
- `draft` - Work in progress
- `submitted` - Awaiting platform review
- `online` - Approved and live
- `rejected` - Rejected by platform

**Validation Logic**:
- Step 5 validates: departure dates, pricing, itinerary days, images
- Cannot submit if validation fails
- Merchant cannot edit while "under review"

**Auto-Save Mechanism**:
- Debounced auto-save (1 second after last change)
- Saves to localStorage keys: `tour_basic`, `tour_itinerary`, `tour_pricing`, `tour_departures`
- Loads saved draft when reopening create modal
- Clears saved draft after successful submit

### 3.2 Orders Management (`orders.vue`)

**Key Features**:
1. **Order Listing**: Searchable, filterable list
2. **Order Statuses**: pending, confirmed, cancelled, completed, refunded
3. **Payment Statuses**: pending, paid, refunded, failed
4. **Order Actions**: Confirm, Reject, View Details, View Payment, Download Voucher

**Order Data Structure**:
```typescript
interface Order {
  order_no: string;
  product_type: "HOTEL" | "TICKET" | "TOUR";
  merchant_id: string;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
  items?: OrderItem[];
  customer_name?: string;
}
```

**Filtering**:
- By order number (search)
- By product type
- By date range
- By order status
- By payment status

### 3.3 Pricing & Commission Model

**Commission Structure**:
- Platform commission: 10% (configurable via `platformCommission` ref)
- Display shows: Customer price, Commission amount, Merchant income
- Formula: `merchantIncome = customerPrice - (customerPrice * commissionRate / 100)`

**Pricing Types**:
1. **Base Pricing**: Adult, Child, Single Supplement
2. **Tier Pricing**: Group size-based pricing (min/max group size)
3. **Seasonal Pricing**: Date range pricing

---

## 4. UI/UX Patterns

### 4.1 Layout Structure

**Standard Page Layout**:
```vue
<view class="page app-font">
  <view class="phone-frame">
    <PageHead :title="..." />
    <view class="phone-inner">
      <!-- Page Content -->
    </view>
  </view>
  <BottomTabBar />
</view>
```

**Responsive Design**:
- Mobile-first design
- Desktop: Max width 390px, centered
- Uses `rpx` units (responsive pixels) for scaling

### 4.2 Color Scheme

**Primary Colors**:
- Primary Green: `#10b981` (success, active states)
- Error Red: `#ef4444`
- Warning Orange: `#f59e0b`
- Background: `#f8fafc` (light gray)
- Text: `#1e293b` (dark gray)

**Status Colors**:
- Draft: Yellow (`rgba(251, 191, 36, 0.9)`)
- Submitted: Blue (`rgba(59, 130, 246, 0.9)`)
- Online: Green (`rgba(16, 185, 129, 0.9)`)
- Rejected: Red (`rgba(239, 68, 68, 0.9)`)

### 4.3 Component Patterns

**Cards**: White background, rounded corners (12px), subtle shadows
**Buttons**: 
- Primary: Green background, white text
- Secondary: Light gray background, dark text
- Action buttons: Icon + text, smaller size

**Forms**:
- Label above input
- Error messages below input (red text, light red background)
- Inputs: Light gray background, border on focus

**Modals/Drawers**:
- Bottom drawer pattern (slides up from bottom)
- Overlay with backdrop
- Drag handle for mobile UX

---

## 5. API Integration Patterns

### 5.1 API Base Configuration

**Pattern**: Environment-based API URL
```typescript
const API_BASE = (import.meta.env?.VITE_API_BASE_URL as string) ?? "";
function getUrl(path: string): string {
  const base = API_BASE ? API_BASE.replace(/\/$/, "") : "";
  return base ? `${base}${path}` : path;
}
```

### 5.2 Authentication Headers

**Pattern**: Bearer token in Authorization header
```typescript
headers: { Authorization: `Bearer ${accessToken}` }
```

### 5.3 Error Handling

**Pattern**: Try-catch with user-friendly messages
```typescript
try {
  const data = await apiCall();
  // Handle success
} catch (e) {
  const msg = e instanceof Error ? e.message : "Generic error";
  uni.showToast({ title: msg, icon: "none" });
}
```

### 5.4 API Endpoints (Identified)

**Auth**:
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/send-phone-code`

**Merchant**:
- `GET /api/merchant/profile`
- `PATCH /api/merchant/profile`

**Orders**:
- `GET /api/orders` (with query params for filtering)
- `GET /api/orders/:order_no`

---

## 6. Internationalization (i18n)

**Setup**: vue-i18n with English and Chinese locales
**Files**: `src/locales/en.json`, `src/locales/zh.json`
**Usage**: `const { t } = useI18n(); t('merchant.toursTitle')`
**Locale Switching**: Watched in tours.vue to update mock data translations

---

## 7. Current Gaps & Recommendations

### 7.1 Missing Features

1. **Dashboard Page** ⚠️ - Currently just a placeholder
2. **Analytics Page** ⚠️ - Currently just a placeholder
3. **Real API Integration** - Many pages use mock data
4. **Global State Management** - No centralized state (may need for dashboard)
5. **Error Boundaries** - No global error handling
6. **Loading States** - Inconsistent loading indicators

### 7.2 Technical Debt

1. **No State Management**: Consider Pinia for shared state (user, merchant profile, etc.)
2. **Direct API Calls**: Consider service layer or composables
3. **Mock Data**: Need to replace with real API calls
4. **Type Safety**: Some `any` types in interfaces
5. **Error Handling**: Inconsistent across components

---

## 8. Dashboard Design Recommendations

### 8.1 Dashboard Data Requirements

Based on the app logic, the dashboard should display:

1. **Overview Metrics** (Key Stats)**
   - Total Orders (today, this week, this month)
   - Total Revenue (today, this week, this month)
   - Active Products (online tours/hotels/tickets)
   - Pending Orders (awaiting confirmation)

2. **Order Status Summary**
   - Pending orders count
   - Confirmed orders count
   - Completed orders count
   - Cancelled/Refunded orders count

3. **Product Status Summary**
   - Draft products count
   - Submitted products count (under review)
   - Online products count
   - Rejected products count

4. **Financial Summary**
   - Total Earnings (from wallet)
   - Pending Payouts
   - Commission Paid
   - Recent Transactions

5. **Recent Activity**
   - Recent Orders (last 5-10)
   - Recent Messages/Notifications
   - Product Status Changes

6. **Quick Actions**
   - Create New Tour
   - View Pending Orders
   - Check Wallet Balance
   - View Analytics

### 8.2 Dashboard API Endpoints Needed

```typescript
// Suggested API endpoints
GET /api/merchant/dashboard/stats
  - Returns: orders_count, revenue, products_count, etc.

GET /api/merchant/dashboard/recent-orders
  - Returns: Last N orders

GET /api/merchant/dashboard/recent-activity
  - Returns: Recent events/notifications
```

### 8.3 Dashboard Component Structure

```vue
<template>
  <view class="dashboard-page">
    <PageHead :title="t('merchant.dashboardTitle')" />
    
    <!-- Stats Cards Grid -->
    <view class="stats-grid">
      <StatCard 
        v-for="stat in stats" 
        :key="stat.id"
        :title="stat.title"
        :value="stat.value"
        :change="stat.change"
        :icon="stat.icon"
      />
    </view>
    
    <!-- Order Summary -->
    <OrderSummaryCard :orders="recentOrders" />
    
    <!-- Product Status Summary -->
    <ProductStatusCard :products="productStatus" />
    
    <!-- Financial Summary -->
    <FinancialSummaryCard :financial="financialData" />
    
    <!-- Quick Actions -->
    <QuickActionsCard />
  </view>
</template>
```

### 8.4 Dashboard State Management

**Option 1: Component State (Current Pattern)**
```typescript
const stats = ref<DashboardStats | null>(null);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    stats.value = await fetchDashboardStats();
  } finally {
    loading.value = false;
  }
});
```

**Option 2: Composable (Recommended)**
```typescript
// composables/useDashboard.ts
export function useDashboard() {
  const stats = ref<DashboardStats | null>(null);
  const loading = ref(false);
  
  async function fetchStats() {
    loading.value = true;
    try {
      stats.value = await getDashboardStats(getAccessToken()!);
    } finally {
      loading.value = false;
    }
  }
  
  return { stats, loading, fetchStats };
}
```

**Option 3: Pinia Store (For Complex State)**
```typescript
// stores/dashboard.ts
export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: null as DashboardStats | null,
    loading: false,
  }),
  actions: {
    async fetchStats() {
      this.loading = true;
      this.stats = await getDashboardStats(getAccessToken()!);
      this.loading = false;
    }
  }
});
```

### 8.5 Dashboard UI Recommendations

1. **Card-Based Layout**: Use cards for each section (stats, orders, products, etc.)
2. **Responsive Grid**: 2 columns on mobile, 3-4 on tablet
3. **Loading States**: Skeleton loaders or spinners
4. **Empty States**: Friendly messages when no data
5. **Refresh**: Pull-to-refresh or refresh button
6. **Date Filters**: Quick filters (Today, This Week, This Month, Custom Range)
7. **Charts**: Consider simple charts for revenue trends (if analytics API available)

---

## 9. Implementation Checklist for Dashboard

- [ ] Create dashboard API endpoint or mock data structure
- [ ] Design dashboard component structure
- [ ] Implement stat cards component
- [ ] Implement order summary component
- [ ] Implement product status component
- [ ] Implement financial summary component
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add pull-to-refresh
- [ ] Add date range filters
- [ ] Add navigation to detail pages
- [ ] Test with real/mock data
- [ ] Add i18n translations
- [ ] Responsive design testing

---

## 10. Key Takeaways for Dashboard Development

1. **Follow Existing Patterns**: Use same layout structure, component patterns, and styling
2. **API Integration**: Create dashboard-specific API functions in `src/api/`
3. **State Management**: Start with component state, upgrade to composable if needed
4. **Data Aggregation**: Dashboard needs aggregated data from multiple sources (orders, products, wallet)
5. **Performance**: Consider caching dashboard data, refresh on page show
6. **User Experience**: Show most important info first, allow drill-down to detail pages
7. **Mobile-First**: Design for mobile, ensure touch-friendly interactions

---

## Conclusion

The application follows a consistent pattern with Vue 3 Composition API, component-based architecture, and role-based navigation. The dashboard should integrate seamlessly with existing patterns while providing merchants with a comprehensive overview of their business operations.

**Next Steps**: 
1. Define dashboard requirements (what data to show)
2. Design dashboard API endpoints
3. Implement dashboard components following existing patterns
4. Add real-time updates or refresh mechanism
5. Test with various data scenarios
