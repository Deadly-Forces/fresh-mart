"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ProfileStep } from "@/features/onboarding/components/ProfileStep";
import { OnboardingAddressStep } from "@/features/onboarding/components/AddressStep";
import { PreferencesStep } from "@/features/onboarding/components/PreferencesStep";
import type { OnboardingState } from "@/types";
import type { Database } from "@/lib/supabase/types";

type DietaryPref = Database["public"]["Enums"]["dietary_pref"];

const INITIAL_STATE: OnboardingState = {
  step: 1,
  name: "",
  avatarUrl: "",
  countryCode: "+91",
  phone: "",
  address: {
    building: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  },
  dietaryPref: "veg",
  deliverySlot: "morning",
  notifications: true,
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("freshmart_onboarding");
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch {}
    } else {
      // Pre-fill name from auth if available (use getSession to avoid lock contention)
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          const user = session?.user;
          if (user?.user_metadata?.full_name) {
            setState((s) => ({
              ...s,
              name: user.user_metadata.full_name,
              avatarUrl: user.user_metadata.avatar_url || "",
            }));
          }
        })
        .catch(() => {});
    }
  }, [supabase.auth]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("freshmart_onboarding", JSON.stringify(state));
    }
  }, [state, isClient]);

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const updateAddress = (
    field: keyof OnboardingState["address"],
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleNext = async () => {
    if (state.step < 3) {
      updateState({ step: state.step + 1 });
      return;
    }

    // Step 3 -> finish onboarding
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        name: state.name,
        phone: state.phone,
        avatar_url: state.avatarUrl,
        dietary_preference: (state.dietaryPref || null) as DietaryPref | null,
        is_onboarded: true,
      });
      if (profileError) throw profileError;

      // Save address
      const { error: addrError } = await supabase.from("addresses").insert({
        user_id: user.id,
        label: "Home",
        building: state.address.building,
        street: state.address.street,
        area: state.address.area,
        landmark: state.address.landmark,
        city: state.address.city,
        state: state.address.state,
        pincode: state.address.pincode,
        is_default: true,
      });
      if (addrError) throw addrError;

      localStorage.removeItem("freshmart_onboarding");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error(
        "Error saving onboarding:",
        error,
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      );
      alert(
        "Failed to save onboarding: " +
          (error?.message || JSON.stringify(error)),
      );
      // also remove the old console.error
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-[560px] p-6 sm:p-10 rounded-card shadow-modal">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border z-0" />
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${
                state.step >= step
                  ? "bg-success text-white"
                  : "bg-muted text-muted-foreground border-2 border-border"
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Form Area */}
        <div className="min-h-[320px]">
          {state.step === 1 && (
            <ProfileStep state={state} onUpdate={updateState} />
          )}
          {state.step === 2 && (
            <OnboardingAddressStep
              state={state}
              onUpdate={updateState}
              onUpdateAddress={updateAddress}
            />
          )}
          {state.step === 3 && (
            <PreferencesStep state={state} onUpdate={updateState} />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          {state.step > 1 ? (
            <Button
              variant="ghost"
              onClick={() => updateState({ step: state.step - 1 })}
              className="px-6 text-muted-foreground"
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            onClick={handleNext}
            disabled={
              isLoading ||
              (state.step === 1 && !state.name) ||
              (state.step === 2 && (!state.phone || !state.address.street))
            }
            className="px-8 min-w-[140px]"
          >
            {isLoading
              ? "Saving..."
              : state.step === 3
                ? "Complete Setup"
                : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
