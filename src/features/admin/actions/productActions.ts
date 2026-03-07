"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";
import {
  rateLimit,
  isValidUUID,
  sanitizeString,
  stripHtml,
} from "@/lib/security";
import { z } from "zod";

// Validation schemas
const productUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.number().positive().max(100000).optional(),
  compare_price: z.number().positive().max(100000).nullable().optional(),
  stock: z.number().int().min(0).max(1000000).optional(),
  is_active: z.boolean().optional(),
  description: z.string().max(5000).optional(),
  unit: z.string().max(50).optional(),
});

const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  is_active: z.boolean().optional(),
  image_url: z.string().url().max(500).nullable().optional(),
});

const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "packed",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

/** Verify that the current user is authenticated and has admin role */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  // Rate limit: 100 admin actions per minute per user
  if (!rateLimit(`admin:${user.id}`, 100, 60_000)) {
    throw new Error("Too many requests. Please slow down.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Forbidden: Admin access required.");
  }

  return { supabase, user };
}

export async function updateProductAction(
  productId: string,
  data: {
    name?: string;
    price?: number;
    compare_price?: number | null;
    stock?: number;
    is_active?: boolean;
    description?: string;
    unit?: string;
  },
) {
  try {
    // Validate product ID
    if (!isValidUUID(productId)) {
      return { error: "Invalid product ID." };
    }

    // Validate input data
    const validation = productUpdateSchema.safeParse(data);
    if (!validation.success) {
      return {
        error: validation.error.issues[0]?.message || "Invalid product data.",
      };
    }

    const { supabase } = await requireAdmin();

    // Sanitize text fields
    const sanitizedData = {
      ...validation.data,
      name: validation.data.name
        ? (sanitizeString(validation.data.name, 200) ?? undefined)
        : undefined,
      description: validation.data.description
        ? stripHtml(validation.data.description)
        : undefined,
      unit: validation.data.unit
        ? (sanitizeString(validation.data.unit, 50) ?? undefined)
        : undefined,
    };

    const { error } = await supabase
      .from("products")
      .update(sanitizedData)
      .eq("id", productId);

    if (error) {
      console.error("Error updating product:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    revalidatePath("/shop");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    // Validate product ID
    if (!isValidUUID(productId)) {
      return { error: "Invalid product ID." };
    }

    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/dashboard");
    revalidatePath("/shop");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function updateProductStockAction(
  productId: string,
  newStock: number,
) {
  try {
    // Validate product ID
    if (!isValidUUID(productId)) {
      return { error: "Invalid product ID." };
    }

    // Validate stock value
    if (!Number.isInteger(newStock) || newStock < 0 || newStock > 1000000) {
      return { error: "Invalid stock value." };
    }

    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", productId);

    if (error) {
      console.error("Error updating stock:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

// Validation schema for creating a product
const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(5000).optional(),
  price: z.number().positive("Price must be positive").max(100000),
  compare_price: z.number().positive().max(100000).nullable().optional(),
  stock: z.number().int().min(0).max(1000000),
  unit: z.string().max(50).optional(),
  category_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean(),
  images: z.array(z.string().url().max(1000)).max(10).optional(),
});

export async function createProductAction(data: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_price?: number | null;
  stock: number;
  unit?: string;
  category_id?: string | null;
  is_active: boolean;
  images?: string[];
}) {
  try {
    const validation = productCreateSchema.safeParse(data);
    if (!validation.success) {
      return {
        error: validation.error.issues[0]?.message || "Invalid product data.",
      };
    }

    const { supabase } = await requireAdmin();

    const sanitizedData = {
      name: sanitizeString(validation.data.name, 200)!,
      slug: validation.data.slug,
      description: validation.data.description
        ? stripHtml(validation.data.description)
        : null,
      price: validation.data.price,
      compare_price: validation.data.compare_price ?? null,
      stock: validation.data.stock,
      unit: validation.data.unit
        ? (sanitizeString(validation.data.unit, 50) ?? null)
        : null,
      category_id: validation.data.category_id ?? null,
      is_active: validation.data.is_active,
      images: validation.data.images ?? [],
    };

    const { error } = await supabase.from("products").insert(sanitizedData);

    if (error) {
      console.error("Error creating product:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/dashboard");
    revalidatePath("/shop");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function updateProductImagesAction(
  productId: string,
  images: string[],
) {
  try {
    if (!isValidUUID(productId)) {
      return { error: "Invalid product ID." };
    }

    // Validate each URL
    const urlSchema = z.array(z.string().url().max(1000)).max(10);
    const validation = urlSchema.safeParse(images);
    if (!validation.success) {
      return { error: "Invalid image URLs." };
    }

    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("products")
      .update({ images: validation.data })
      .eq("id", productId);

    if (error) {
      console.error("Error updating product images:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function updateUserRoleAction(
  userId: string,
  role: "customer" | "admin" | "delivery",
) {
  try {
    if (!isValidUUID(userId)) {
      return { error: "Invalid user ID." };
    }

    const roleSchema = z.enum(["customer", "admin", "delivery"]);
    const validation = roleSchema.safeParse(role);
    if (!validation.success) {
      return { error: "Invalid role." };
    }

    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("profiles")
      .update({ role: validation.data })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user role:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  data: {
    name?: string;
    slug?: string;
    is_active?: boolean;
    image_url?: string | null;
  },
) {
  try {
    // Validate category ID
    if (!isValidUUID(categoryId)) {
      return { error: "Invalid category ID." };
    }

    // Validate input data
    const validation = categoryUpdateSchema.safeParse(data);
    if (!validation.success) {
      return {
        error: validation.error.issues[0]?.message || "Invalid category data.",
      };
    }

    const { supabase } = await requireAdmin();

    // Sanitize text fields
    const sanitizedData = {
      ...validation.data,
      name: validation.data.name
        ? (sanitizeString(validation.data.name, 100) ?? undefined)
        : undefined,
      slug: validation.data.slug
        ? (sanitizeString(validation.data.slug, 100)?.toLowerCase() ??
          undefined)
        : undefined,
    };

    const { error } = await supabase
      .from("categories")
      .update(sanitizedData)
      .eq("id", categoryId);

    if (error) {
      console.error("Error updating category:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    // Validate category ID
    if (!isValidUUID(categoryId)) {
      return { error: "Invalid category ID." };
    }

    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.error("Error deleting category:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: Database["public"]["Enums"]["order_status"],
) {
  try {
    // Validate order ID
    if (!isValidUUID(orderId)) {
      return { error: "Invalid order ID." };
    }

    // Validate status
    const statusValidation = orderStatusSchema.safeParse(status);
    if (!statusValidation.success) {
      return { error: "Invalid order status." };
    }

    const { supabase } = await requireAdmin();

    // Fetch user_id before updating so we can send notifications
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    const { error } = await supabase
      .from("orders")
      .update({ status: statusValidation.data })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status:", error);
      return { error: error.message };
    }

    // Send in-app + push notification to the customer
    const userId = order?.user_id;
    if (userId) {
      const statusTitles: Record<string, string> = {
        confirmed: "Order Confirmed! 🎉",
        packed: "Order Packed 📦",
        processing: "Order Processing",
        out_for_delivery: "Out for Delivery! 🚴",
        delivered: "Order Delivered! ✅",
        cancelled: "Order Cancelled",
      };
      const statusMessages: Record<string, string> = {
        confirmed: `Your order #${orderId.slice(0, 8).toUpperCase()} has been confirmed and is being prepared.`,
        packed: `Your order #${orderId.slice(0, 8).toUpperCase()} has been packed and is ready for dispatch.`,
        processing: `Your order #${orderId.slice(0, 8).toUpperCase()} is being processed.`,
        out_for_delivery: `Your order #${orderId.slice(0, 8).toUpperCase()} is out for delivery.`,
        delivered: `Your order #${orderId.slice(0, 8).toUpperCase()} has been delivered. Enjoy!`,
        cancelled: `Your order #${orderId.slice(0, 8).toUpperCase()} has been cancelled. Refund will be processed.`,
      };

      const title = statusTitles[statusValidation.data];
      if (title) {
        // Insert in-app notification (non-blocking)
        supabase
          .from("notifications")
          .insert({
            user_id: userId,
            type: "order_update" as const,
            title,
            message: statusMessages[statusValidation.data] ?? null,
          })
          .then(({ error: notifErr }) => {
            if (notifErr)
              console.error("Error inserting notification:", notifErr);
          });

        // Send push notification (non-blocking)
        const pushStatusMap: Record<string, string> = {
          confirmed: "confirmed",
          packed: "picked",
          out_for_delivery: "out_for_delivery",
          delivered: "delivered",
          cancelled: "cancelled",
        };
        const pushStatus = pushStatusMap[statusValidation.data];
        if (pushStatus) {
          import("@/lib/push/actions").then(({ sendOrderNotification }) =>
            sendOrderNotification(
              orderId,
              userId,
              pushStatus as
                | "confirmed"
                | "picked"
                | "out_for_delivery"
                | "delivered"
                | "cancelled",
            ).catch((err) => console.error("Push notification error:", err)),
          );
        }
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/analytics");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

const notificationTypeSchema = z.enum(["order_update", "promo", "system"]);

/**
 * Admin action: Send a notification to a specific user or broadcast to all users
 */
export async function sendAdminNotificationAction(data: {
  title: string;
  message: string;
  type: "order_update" | "promo" | "system";
  userId?: string; // If omitted, broadcast to all users
}) {
  try {
    const titleVal = sanitizeString(stripHtml(data.title));
    const messageVal = sanitizeString(stripHtml(data.message)) ?? "";
    if (!titleVal || titleVal.length > 200)
      return { error: "Title is required (max 200 chars)." };
    if (messageVal && messageVal.length > 1000)
      return { error: "Message too long (max 1000 chars)." };

    const typeVal = notificationTypeSchema.safeParse(data.type);
    if (!typeVal.success) return { error: "Invalid notification type." };

    if (data.userId && !isValidUUID(data.userId))
      return { error: "Invalid user ID." };

    const { supabase } = await requireAdmin();

    if (data.userId) {
      // Send to specific user
      const { error } = await supabase.from("notifications").insert({
        user_id: data.userId,
        type: typeVal.data,
        title: titleVal,
        message: messageVal,
      });
      if (error) return { error: error.message };

      // Also send push notification if promo type
      if (typeVal.data === "promo") {
        import("@/lib/push/actions").then(({ sendPromoNotification }) =>
          sendPromoNotification({
            title: titleVal,
            body: messageVal,
            tag: `admin-${Date.now()}`,
          }).catch((err) => console.error("Push error:", err)),
        );
      }

      return { success: true, count: 1 };
    } else {
      // Broadcast to all users
      const { data: users, error: usersErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer");

      if (usersErr) return { error: usersErr.message };
      if (!users || users.length === 0) return { error: "No users found." };

      const rows = users.map((u) => ({
        user_id: u.id,
        type: typeVal.data,
        title: titleVal,
        message: messageVal,
      }));

      const { error } = await supabase.from("notifications").insert(rows);
      if (error) return { error: error.message };

      // Also send push notification for promo broadcasts
      if (typeVal.data === "promo" || typeVal.data === "system") {
        import("@/lib/push/actions").then(({ sendPromoNotification }) =>
          sendPromoNotification({
            title: titleVal,
            body: messageVal,
            tag: `admin-broadcast-${Date.now()}`,
          }).catch((err) => console.error("Push error:", err)),
        );
      }

      revalidatePath("/admin/notifications");
      return { success: true, count: users.length };
    }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}
