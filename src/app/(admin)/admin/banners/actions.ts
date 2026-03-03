"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBanner(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const imageUrl = (formData.get("image_url") as string) || "";
  const link = (formData.get("link") as string) || "/shop";
  const sortOrder = Number(formData.get("sort_order") || 0);
  const startsAt = (formData.get("starts_at") as string) || null;
  const endsAt = (formData.get("ends_at") as string) || null;

  const { error } = await supabase.from("banners").insert({
    title,
    image_url: imageUrl,
    link,
    sort_order: sortOrder,
    starts_at: startsAt || null,
    ends_at: endsAt || null,
    is_active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/banners");
  return { success: true };
}

export async function updateBanner(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const imageUrl = (formData.get("image_url") as string) || "";
  const link = (formData.get("link") as string) || "/shop";
  const sortOrder = Number(formData.get("sort_order") || 0);
  const startsAt = (formData.get("starts_at") as string) || null;
  const endsAt = (formData.get("ends_at") as string) || null;
  const isActive = formData.get("is_active") === "true";

  const { error } = await supabase
    .from("banners")
    .update({
      title,
      image_url: imageUrl,
      link,
      sort_order: sortOrder,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/banners");
  return { success: true };
}

export async function deleteBanner(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/banners");
  return { success: true };
}
