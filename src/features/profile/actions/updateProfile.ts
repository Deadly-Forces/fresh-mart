"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type DietaryPref = Database["public"]["Enums"]["dietary_pref"];

export async function updateProfileAction(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "You must be logged in to update your profile." };
    }

    // Extract address data
    const building = formData.get("address.building") as string;
    const street = formData.get("address.street") as string;
    const area = formData.get("address.area") as string;
    const landmark = formData.get("address.landmark") as string;
    const city = formData.get("address.city") as string;
    const state = formData.get("address.state") as string;
    const pincode = formData.get("address.pincode") as string;

    const address = (building || street || area || landmark || city || state || pincode) ? {
        building,
        street,
        area,
        landmark,
        city,
        state,
        pincode,
    } : null;

    // Prepare update payload for profiles
    const profileUpdates = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        country_code: formData.get("country_code") as string,
        dietary_preference: (formData.get("dietary_pref") as string || null) as DietaryPref | null,
        delivery_slot: formData.get("delivery_slot") as string,
        updated_at: new Date().toISOString(),
    };

    // Remove empty strings and replace with null where appropriate
    for (const key in profileUpdates) {
        if (profileUpdates[key as keyof typeof profileUpdates] === "") {
            // @ts-expect-error - setting profile fields to null when empty string
            profileUpdates[key as keyof typeof profileUpdates] = null;
        }
    }

    const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", user.id);

    if (profileError) {
        console.error("Error updating profile:", profileError);
        return { error: "Failed to update profile. Please try again." };
    }

    if (address) {
        // Find existing default address
        const { data: existingAddress } = await supabase
            .from("addresses")
            .select("id")
            .eq("user_id", user.id)
            .eq("is_default", true)
            .maybeSingle();

        if (existingAddress) {
            const { error: addressError } = await supabase
                .from("addresses")
                .update(address)
                .eq("id", existingAddress.id);
            if (addressError) console.error("Error updating address:", addressError);
        } else {
            const { error: addressError } = await supabase
                .from("addresses")
                .insert({
                    user_id: user.id,
                    label: "Home",
                    is_default: true,
                    ...address
                });
            if (addressError) console.error("Error inserting address:", addressError);
        }
    }

    revalidatePath("/profile");
    revalidatePath("/"); // Update any navbar specific cached states

    return { success: true };
}
