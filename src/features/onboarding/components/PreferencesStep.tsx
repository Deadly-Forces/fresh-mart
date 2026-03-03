"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { OnboardingState } from "@/types";

interface PreferencesStepProps {
  state: OnboardingState;
  onUpdate: (updates: Partial<OnboardingState>) => void;
}

export function PreferencesStep({ state, onUpdate }: PreferencesStepProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <div>
        <h2 className="font-heading text-3xl mb-2">Almost there!</h2>
        <p className="text-muted-foreground font-body">
          Personalize your FreshMart experience.
        </p>
      </div>

      <div className="space-y-4">
        <Label>Dietary Preference</Label>
        <RadioGroup
          value={state.dietaryPref}
          onValueChange={(v) => onUpdate({ dietaryPref: v })}
          className="grid grid-cols-3 gap-3"
        >
          {["veg", "non-veg", "vegan"].map((pref) => (
            <div key={pref}>
              <RadioGroupItem value={pref} id={pref} className="peer sr-only" />
              <Label
                htmlFor={pref}
                className="flex flex-col items-center justify-center rounded-button border-2 border-border bg-card p-4 hover:bg-secondary hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer text-center capitalize"
              >
                {pref.replace("-", " ")}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4 pt-4">
        <Label>Preferred Delivery Slot</Label>
        <RadioGroup
          value={state.deliverySlot}
          onValueChange={(v) => onUpdate({ deliverySlot: v })}
          className="grid grid-cols-1 gap-3"
        >
          {[
            { id: "morning", label: "Morning (8 AM - 12 PM)" },
            { id: "afternoon", label: "Afternoon (12 PM - 4 PM)" },
            { id: "evening", label: "Evening (4 PM - 8 PM)" },
          ].map((slot) => (
            <div key={slot.id}>
              <RadioGroupItem
                value={slot.id}
                id={slot.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={slot.id}
                className="flex items-center justify-between rounded-button border-2 border-border bg-card px-4 py-3 hover:bg-secondary hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span>{slot.label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
