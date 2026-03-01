"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserAddressesAction() {
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
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching addresses:", error);
            return { error: "Failed to fetch addresses." };
        }

        const allAddresses = addresses || [];

        return { addresses: allAddresses };
    } catch (err: any) {
        console.error("Error in getUserAddressesAction:", err);
        return { error: err.message || "An unexpected error occurred." };
    }
}

export async function addAddressAction(formData: FormData) {
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

        if (!city || !state || !pincode) {
            return { error: "City, state, and pincode are required." };
        }

        const { data: newAddress, error } = await supabase
            .from("addresses")
            .insert({
                user_id: user.id,
                label,
                building,
                street,
                area,
                landmark,
                city,
                state,
                pincode,
            })
            .select()
            .single();

        if (error) {
            console.error("Error adding address:", error);
            return { error: "Failed to add address." };
        }

        return { address: newAddress };
    } catch (err: any) {
        console.error("Error in addAddressAction:", err);
        return { error: err.message || "An unexpected error occurred." };
    }
}
