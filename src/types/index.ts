// ============================================================
// Shared TypeScript types for FreshMart
// ============================================================

// --- Orders ---

export type OrderStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  customer: string;
  phone?: string;
  items?: number;
  total: number;
  slot?: string;
  status: OrderStatus;
}

export interface UserOrderItem {
  id: string;
  quantity: number;
  price: number;
  product_snapshot: Record<string, unknown>; // More specific type than any
  product_id: string | null;
}

export interface UserOrder {
  id: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  items: UserOrderItem[];
  payment_method?: string;
  payment_status?: string;
}

// --- Products ---

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
}

// --- Dashboard ---

export interface KPI {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export interface LowStockItem {
  name: string;
  stock: number;
  threshold: number;
}

// --- Addresses ---

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

// --- Navigation ---

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// --- Notifications ---

export type NotificationType = "order_update" | "promo" | "system";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

// --- Onboarding ---

export interface OnboardingState {
  step: number;
  name: string;
  avatarUrl: string;
  countryCode: string;
  phone: string;
  address: {
    building: string;
    street: string;
    area: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  };
  dietaryPref: string;
  deliverySlot: string;
  notifications: boolean;
}

// --- Delivery ---

export interface DeliverySlot {
  id: string;
  label: string;
  time: string;
  available: boolean;
}

// --- Checkout ---

export interface OrderSummaryItem {
  name: string;
  qty: number;
  price: number;
}
