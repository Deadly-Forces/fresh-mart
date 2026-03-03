"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCoupon(formData: FormData) {
  const supabase = await createClient();
  const code = formData.get("code") as string;
  const type = formData.get("type") as "flat" | "percentage";
  const value = Number(formData.get("value"));
  const minOrder = Number(formData.get("min_order") || 0);
  const maxUses = formData.get("max_uses")
    ? Number(formData.get("max_uses"))
    : null;
  const expiresAt = (formData.get("expires_at") as string) || null;

  const { error } = await supabase.from("coupons").insert({
    code: code.toUpperCase(),
    type,
    value,
    min_order: minOrder,
    max_uses: maxUses,
    expires_at: expiresAt || null,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCoupon(id: string, formData: FormData) {
  const supabase = await createClient();
  const code = formData.get("code") as string;
  const type = formData.get("type") as "flat" | "percentage";
  const value = Number(formData.get("value"));
  const minOrder = Number(formData.get("min_order") || 0);
  const maxUses = formData.get("max_uses")
    ? Number(formData.get("max_uses"))
    : null;
  const expiresAt = (formData.get("expires_at") as string) || null;
  const isActive = formData.get("is_active") === "true";

  const { error } = await supabase
    .from("coupons")
    .update({
      code: code.toUpperCase(),
      type,
      value,
      min_order: minOrder,
      max_uses: maxUses,
      expires_at: expiresAt || null,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCoupon(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true };
}
