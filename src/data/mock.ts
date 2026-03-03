import { DollarSign, ShoppingCart, Users, AlertTriangle } from "lucide-react";
import type {
  Order,
  Product,
  KPI,
  LowStockItem,
  Address,
  OrderStatus,
  DeliverySlot,
  OrderSummaryItem,
} from "@/types";

// ============================================================
// Admin Dashboard
// ============================================================

export const kpis: KPI[] = [
  {
    label: "Total Revenue",
    value: "₹10,42,600",
    change: "+12.5%",
    up: true,
    icon: DollarSign,
  },
  {
    label: "Orders Today",
    value: "48",
    change: "+8.2%",
    up: true,
    icon: ShoppingCart,
  },
  {
    label: "Total Customers",
    value: "1,234",
    change: "+5.1%",
    up: true,
    icon: Users,
  },
  {
    label: "Pending Orders",
    value: "7",
    change: "-2",
    up: false,
    icon: AlertTriangle,
  },
];

export const recentOrders: Order[] = [
  { id: "FM-001234", customer: "Priyanka S.", total: 3612, status: "pending" },
  { id: "FM-001233", customer: "Rajesh K.", total: 2464, status: "confirmed" },
  {
    id: "FM-001232",
    customer: "Meera J.",
    total: 5525,
    status: "out_for_delivery",
  },
  { id: "FM-001231", customer: "Amit V.", total: 1317, status: "delivered" },
  { id: "FM-001230", customer: "Sneha R.", total: 2822, status: "confirmed" },
];

export const lowStock: LowStockItem[] = [
  { name: "Fresho Palak (Spinach) 250g", stock: 3, threshold: 10 },
  { name: "Amul Taaza Toned Milk 1L", stock: 5, threshold: 15 },
  { name: "Fresho Rawas (Indian Salmon) 250g", stock: 2, threshold: 8 },
  { name: "Fresho Methi (Fenugreek Leaves) 250g", stock: 4, threshold: 12 },
];

// ============================================================
// Admin Products
// ============================================================

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Fresho Banana Robusta 6 pcs",
    category: "Fruits",
    price: 46,
    stock: 45,
    active: true,
  },
  {
    id: "2",
    name: "Fresho Capsicum Green (Shimla Mirch) 500g",
    category: "Vegetables",
    price: 58,
    stock: 23,
    active: true,
  },
  {
    id: "3",
    name: "Amul Gold Full Cream Milk 1L",
    category: "Dairy Eggs",
    price: 68,
    stock: 5,
    active: true,
  },
  {
    id: "4",
    name: "Harvest Gold Brown Bread 400g",
    category: "Bakery",
    price: 45,
    stock: 30,
    active: false,
  },
  {
    id: "5",
    name: "Fresho Rawas (Indian Salmon) Fillet 250g",
    category: "Meat Seafood",
    price: 399,
    stock: 2,
    active: true,
  },
  {
    id: "6",
    name: "Fresho Palak (Spinach) 250g",
    category: "Vegetables",
    price: 26,
    stock: 67,
    active: true,
  },
];

// ============================================================
// Admin Orders
// ============================================================

export const statusTabs: (OrderStatus | "all")[] = [
  "all",
  "processing",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export const mockOrders: Order[] = [
  {
    id: "FM-001234",
    customer: "Priyanka S.",
    phone: "+91 98765-43210",
    items: 3,
    total: 3612,
    slot: "Morning",
    status: "pending",
  },
  {
    id: "FM-001233",
    customer: "Rajesh K.",
    phone: "+91 98765-43211",
    items: 5,
    total: 2464,
    slot: "Afternoon",
    status: "confirmed",
  },
  {
    id: "FM-001232",
    customer: "Meera J.",
    phone: "+91 98765-43212",
    items: 2,
    total: 5525,
    slot: "Morning",
    status: "out_for_delivery",
  },
  {
    id: "FM-001231",
    customer: "Amit V.",
    phone: "+91 98765-43213",
    items: 7,
    total: 1317,
    slot: "Evening",
    status: "delivered",
  },
  {
    id: "FM-001230",
    customer: "Sneha R.",
    phone: "+91 98765-43214",
    items: 4,
    total: 2822,
    slot: "Morning",
    status: "cancelled",
  },
];

// ============================================================
// Checkout
// ============================================================

export const savedAddresses: Address[] = [
  {
    id: "1",
    label: "Home",
    street: "42-B, Green Valley Apartments, Sector 15",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122001",
  },
  {
    id: "2",
    label: "Work",
    street: "Tower B, 3rd Floor, Cyber Hub",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
  },
];

export const deliverySlots: DeliverySlot[] = [
  { id: "morning", label: "Morning", time: "8 AM – 12 PM", available: true },
  {
    id: "afternoon",
    label: "Afternoon",
    time: "12 PM – 4 PM",
    available: true,
  },
  { id: "evening", label: "Evening", time: "4 PM – 8 PM", available: false },
];

export const orderSummaryItems: OrderSummaryItem[] = [
  { name: "Fresho Banana Robusta 6 pcs", qty: 2, price: 92 },
  { name: "Fresho Rawas (Indian Salmon) Fillet 250g", qty: 1, price: 399 },
  { name: "Amul Gold Full Cream Milk 1L", qty: 1, price: 68 },
];
