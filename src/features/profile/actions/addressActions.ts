"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isValidUUID, rateLimit } from "@/lib/security";

const addressSchema = z.object({
    label: z.string().max(50).default("Home"),
    building: z.string().max(200).default(""),
    street: z.string().max(200).default(""),
    area: z.string().max(200).default(""),
    landmark: z.string().max(200).default(""),
    city: z.string().min(1, "City is required").max(100),
    state: z.string().min(1, "State is required").max(100),
    pincode: z.string().min(1, "Pincode is required").regex(/^\d{6}$/, "Pincode must be 6 digits"),
});

export async function getProfileAddressesAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "You must be logged in to view addresses." };
        }

        const { data: addresses, error } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", user.id)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching addresses:", error);
            return { error: "Failed to fetch addresses." };
        }

        return { addresses: addresses || [] };
    } catch (err: any) {
        console.error("Error in getProfileAddressesAction:", err);
        return { error: err.message || "An unexpected error occurred." };
    }
}

export async function addProfileAddressAction(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "You must be logged in to add an address." };
        }

        const label = formData.get("label")?.toString() || "Home";
        const building = formData.get("building")?.toString() || "";
        const street = formData.get("street")?.toString() || "";
        const area = formData.get("area")?.toString() || "";
        const landmark = formData.get("landmark")?.toString() || "";
        const city = formData.get("city")?.toString() || "";
        const state = formData.get("state")?.toString() || "";
        const pincode = formData.get("pincode")?.toString() || "";
        const isDefault = formData.get("is_default") === "true";

        const validated = addressSchema.safeParse({ label, building, street, area, landmark, city, state, pincode });
        if (!validated.success) {
            const firstError = validated.error.issues[0]?.message || "Invalid address data.";
            return { error: firstError };
        }

        // If setting as default, unset other defaults first
        if (isDefault) {
            await supabase
                .from("addresses")
                .update({ is_default: false })
                .eq("user_id", user.id);
        }

        const { data: newAddress, error } = await supabase
            .from("addresses")
            .insert({
                user_id: user.id,
                is_default: isDefault,
                ...validated.data,
            })
            .select()
            .single();

        if (error) {
            console.error("Error adding address:", error);
            return { error: "Failed to add address." };
        }

        revalidatePath("/profile");
        return { address: newAddress };
    } catch (err: any) {
        console.error("Error in addProfileAddressAction:", err);
        return { error: err.message || "An unexpected error occurred." };
    }
}

export async function updateProfileAddressAction(addressId: string, formData: FormData) {
    try {
        // Validate address ID
        if (!isValidUUID(addressId)) {
            return { error: "Invalid address ID." };
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "You must be logged in to update an address." };
        }

        const label = formData.get("label")?.toString() || "Home";
        const building = formData.get("building")?.toString() || "";
        const street = formData.get("street")?.toString() || "";
        const area = formData.get("area")?.toString() || "";
        const landmark = formData.get("landmark")?.toString() || "";
        const city = formData.get("city")?.toString() || "";
        const state = formData.get("state")?.toString() || "";
        const pincode = formData.get("pincode")?.toString() || "";

        const validated = addressSchema.safeParse({ label, building, street, area, landmark, city, state, pincode });
        if (!validated.success) {
            const firstError = validated.error.issues[0]?.message || "Invalid address data.";
            return { error: firstError };
        }

        const { data: updatedAddress, error } = await supabase
            .from("addresses")
            .update(validated.data)
            .eq("id", addressId)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating address:", error);
            return { error: "Failed to update address." };
        }

        revalidatePath("/profile");
        return { address: updatedAddress };
    } catch (err: any) {
        console.error("Error in updateProfileAddressAction:", err);
        return { error: err.message || "An unexpected error occurred." };
    }
}

export async function deleteAddressAction(addressId: string) {
    try {
        // Validate address ID
        if (!isValidUUID(addressId)) {
            return { error: "Invalid address ID." };
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "You must be logged in to delete an address." };
        }

        const { error } = await supabase
            .from("addresses")
            .delete()
            .eq("id", addressId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Error deleting address:", error);
            return { error: "Failed to delete address." };
        }

        revalidatePath("/profile");
        return { success: true };
    } catch (err: any) {
        console.error("Error in deleteAddressAction:", err);
        return { error: err.message || "An unexpected error occurred." };
    }
}

export async function setDefaultAddressAction(addressId: string) {
    try {
        // Validate address ID
        if (!isValidUUID(addressId)) {
            return { error: "Invalid address ID." };
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: "You must be logged in to set default address." };
        }

        // Unset all defaults first
        await supabase
            .from("addresses")
            .update({ is_default: false })
            .eq("user_id", user.id);

        // Set the new default
        const { error } = await supabase
            .from("addresses")
            .update({ is_default: true })
            .eq("id", addressId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Error setting default address:", error);
            return { error: "Failed to set default address." };
        }

        revalidatePath("/profile");
        return { success: true };
    } catch (err: any) {
        console.error("Error in setDefaultAddressAction:", err);
        return { error: err.message || "An unexpected error occurred." };
    }
}
