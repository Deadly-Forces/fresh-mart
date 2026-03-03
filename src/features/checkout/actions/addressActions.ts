"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().max(50).default("Home"),
  building: z.string().max(200).default(""),
  street: z.string().max(200).default(""),
  area: z.string().max(200).default(""),
  landmark: z.string().max(200).default(""),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Pincode must be 6 digits"),
});

export async function getUserAddressesAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    const validated = addressSchema.safeParse({
      label,
      building,
      street,
      area,
      landmark,
      city,
      state,
      pincode,
    });
    if (!validated.success) {
      const firstError =
        validated.error.issues[0]?.message || "Invalid address data.";
      return { error: firstError };
    }

    const { data: newAddress, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        ...validated.data,
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
