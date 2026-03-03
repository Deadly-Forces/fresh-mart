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
  { id: "FM-001234", customer: "Sarah M.", total: 3612, status: "pending" },
  { id: "FM-001233", customer: "James K.", total: 2464, status: "confirmed" },
  {
    id: "FM-001232",
    customer: "Priyanka S.",
    total: 5525,
    status: "out_for_delivery",
  },
  { id: "FM-001231", customer: "Mike R.", total: 1317, status: "delivered" },
  { id: "FM-001230", customer: "Emily W.", total: 2822, status: "confirmed" },
];

export const lowStock: LowStockItem[] = [
  { name: "Organic Bananas", stock: 3, threshold: 10 },
  { name: "Whole Milk 1L", stock: 5, threshold: 15 },
  { name: "Atlantic Salmon", stock: 2, threshold: 8 },
  { name: "Baby Spinach", stock: 4, threshold: 12 },
];

// ============================================================
// Admin Products
// ============================================================

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Fresh Organic Bananas 1 dozen",
    category: "Fruits",
    price: 50,
    stock: 45,
    active: true,
  },
  {
    id: "2",
    name: "Shimla Mirch (Capsicum) 500g",
    category: "Vegetables",
    price: 60,
    stock: 23,
    active: true,
  },
  {
    id: "3",
    name: "Amul Full Cream Milk 1L",
    category: "Dairy",
    price: 68,
    stock: 5,
    active: true,
  },
  {
    id: "4",
    name: "Brown Bread 400g",
    category: "Bakery",
    price: 45,
    stock: 30,
    active: false,
  },
  {
    id: "5",
    name: "Salmon Fillet 250g",
    category: "Meat & Seafood",
    price: 550,
    stock: 2,
    active: true,
  },
  {
    id: "6",
    name: "Palak (Spinach) 250g",
    category: "Vegetables",
    price: 25,
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
    customer: "Sarah M.",
    phone: "+91 98765-43210",
    items: 3,
    total: 3612,
    slot: "Morning",
    status: "pending",
  },
  {
    id: "FM-001233",
    customer: "James K.",
    phone: "+91 98765-43211",
    items: 5,
    total: 2464,
    slot: "Afternoon",
    status: "confirmed",
  },
  {
    id: "FM-001232",
    customer: "Priyanka S.",
    phone: "+91 98765-43212",
    items: 2,
    total: 5525,
    slot: "Morning",
    status: "out_for_delivery",
  },
  {
    id: "FM-001231",
    customer: "Mike R.",
    phone: "+91 98765-43213",
    items: 7,
    total: 1317,
    slot: "Evening",
    status: "delivered",
  },
  {
    id: "FM-001230",
    customer: "Emily W.",
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
    street: "123 Oak Street",
    city: "Springfield",
    state: "IL",
    pincode: "62704",
  },
  {
    id: "2",
    label: "Work",
    street: "456 Elm Avenue, Suite 200",
    city: "Springfield",
    state: "IL",
    pincode: "62701",
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
  { name: "Organic Bananas 1 dozen", qty: 2, price: 100 },
  { name: "Salmon Fillet 250g", qty: 1, price: 550 },
  { name: "Amul Full Cream Milk 1L", qty: 1, price: 68 },
];
