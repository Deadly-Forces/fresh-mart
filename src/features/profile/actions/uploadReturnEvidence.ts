"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BUCKET_NAME = "return-evidence";

export async function uploadReturnEvidenceAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to upload evidence." };
  }

  if (!rateLimit(`return-evidence:${user.id}`, 10, 60_000)) {
    return { error: "Too many upload attempts. Please wait a moment." };
  }

  const file = formData.get("evidence") as File | null;
  if (!file || file.size === 0) {
    return { error: "No evidence file was provided." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      error: "Please upload a JPEG, PNG, WebP, or GIF image.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Evidence image is too large. Maximum size is 5MB." };
  }

  const extensionMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const extension = extensionMap[file.type] || "jpg";
  const filePath = `${user.id}/${randomUUID()}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Return evidence upload error:", uploadError);
    return { error: `Failed to upload image: ${uploadError.message}` };
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return { success: true, imageUrl: urlData.publicUrl };
}
