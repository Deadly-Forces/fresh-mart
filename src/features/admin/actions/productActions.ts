"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

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
    }
) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("products")
            .update(data)
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
        const supabase = await createClient();

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

export async function updateProductStockAction(productId: string, newStock: number) {
    try {
        const supabase = await createClient();

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

export async function updateCategoryAction(
    categoryId: string,
    data: {
        name?: string;
        slug?: string;
        is_active?: boolean;
        image_url?: string | null;
    }
) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("categories")
            .update(data)
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
        const supabase = await createClient();

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

export async function updateOrderStatusAction(orderId: string, status: Database["public"]["Enums"]["order_status"]) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("orders")
            .update({ status })
            .eq("id", orderId);

        if (error) {
            console.error("Error updating order status:", error);
            return { error: error.message };
        }

        revalidatePath("/admin/orders");
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/analytics");
        return { success: true };
    } catch (err: any) {
        return { error: err.message || "An unexpected error occurred." };
    }
}
