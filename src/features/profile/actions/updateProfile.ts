"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";
import { z } from "zod";

type DietaryPref = Database["public"]["Enums"]["dietary_pref"];

const profileSchema = z.object({
  name: z.string().max(100).nullable(),
  phone: z
    .string()
    .max(20)
    .regex(/^[\d+\-() ]*$/, "Invalid phone number format")
    .nullable(),
  country_code: z.string().max(5).nullable(),
  dietary_pref: z.string().max(50).nullable(),
  delivery_slot: z.string().max(50).nullable(),
});

const addressFieldSchema = z.object({
  building: z.string().max(200).nullable(),
  street: z.string().max(200).nullable(),
  area: z.string().max(200).nullable(),
  landmark: z.string().max(200).nullable(),
  city: z.string().max(100).nullable(),
  state: z.string().max(100).nullable(),
  pincode: z
    .string()
    .regex(/^(\d{6})?$/, "Pincode must be 6 digits")
    .nullable(),
});

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  // Validate address fields
  const addressValidation = addressFieldSchema.safeParse({
    building: building || null,
    street: street || null,
    area: area || null,
    landmark: landmark || null,
    city: city || null,
    state: state || null,
    pincode: pincode || null,
  });
  if (!addressValidation.success) {
    const firstError =
      addressValidation.error.issues[0]?.message || "Invalid address data.";
    return { error: firstError };
  }

  const address =
    building || street || area || landmark || city || state || pincode
      ? {
          building,
          street,
          area,
          landmark,
          city,
          state,
          pincode,
        }
      : null;

  // Prepare and validate update payload for profiles
  const rawProfile = {
    name: (formData.get("name") as string) || null,
    phone: (formData.get("phone") as string) || null,
    country_code: (formData.get("country_code") as string) || null,
    dietary_pref: (formData.get("dietary_pref") as string) || null,
    delivery_slot: (formData.get("delivery_slot") as string) || null,
  };

  const profileValidation = profileSchema.safeParse(rawProfile);
  if (!profileValidation.success) {
    const firstError =
      profileValidation.error.issues[0]?.message || "Invalid profile data.";
    return { error: firstError };
  }

  const profileUpdates = {
    name: profileValidation.data.name,
    phone: profileValidation.data.phone,
    country_code: profileValidation.data.country_code,
    dietary_preference: (profileValidation.data.dietary_pref ||
      null) as DietaryPref | null,
    delivery_slot: profileValidation.data.delivery_slot,
    updated_at: new Date().toISOString(),
  };

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
      const { error: addressError } = await supabase.from("addresses").insert({
        user_id: user.id,
        label: "Home",
        is_default: true,
        ...address,
      });
      if (addressError) console.error("Error inserting address:", addressError);
    }
  }

  revalidatePath("/profile");
  revalidatePath("/"); // Update any navbar specific cached states

  return { success: true };
}
