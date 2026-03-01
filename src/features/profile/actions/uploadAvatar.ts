"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BUCKET_NAME = "avatars";

export async function uploadAvatarAction(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "You must be logged in to update your avatar." };
    }

    const file = formData.get("avatar") as File | null;
    if (!file || file.size === 0) {
        return { error: "No file provided." };
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        return { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image." };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        return { error: "File is too large. Maximum size is 2MB." };
    }


    // Determine file extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${user.id}/avatar.${ext}`;

    // Convert File to ArrayBuffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage (upsert to overwrite previous avatar)
    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type,
        });

    if (uploadError) {
        console.error("Avatar upload error:", JSON.stringify(uploadError, null, 2));
        return { error: `Failed to upload image: ${uploadError.message}` };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`; // Cache-bust

    // Update the profile's avatar_url
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

    if (updateError) {
        console.error("Profile avatar_url update error:", updateError);
        return { error: "Image uploaded but failed to update profile. Please try again." };
    }

    revalidatePath("/profile");
    revalidatePath("/");

    return { success: true, avatarUrl };
}
