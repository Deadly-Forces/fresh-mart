import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  Image as ImageIcon,
  BarChart3,
  MessageSquare,
  Navigation2,
  ListChecks,
} from "lucide-react";
import type { NavItem } from "@/types";

// Admin sidebar navigation items
export const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/picker", label: "Picker", icon: ListChecks },
  { href: "/admin/rider", label: "Rider", icon: Navigation2 },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];
