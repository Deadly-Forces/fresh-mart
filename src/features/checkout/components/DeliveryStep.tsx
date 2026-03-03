"use client";

import { Clock, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { deliverySlots } from "@/data";

interface DeliveryStepProps {
  selectedSlot: string;
  onSelect: (id: string) => void;
  isExpressDelivery: boolean;
  setIsExpressDelivery: (value: boolean) => void;
  substitutionPref: string;
  setSubstitutionPref: (value: string) => void;
}

export function DeliveryStep({
  selectedSlot,
  onSelect,
  isExpressDelivery,
  setIsExpressDelivery,
  substitutionPref,
  setSubstitutionPref,
}: DeliveryStepProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4">
      <div>
        <h2 className="font-heading text-2xl flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-primary" /> Choose Delivery Slot
        </h2>
        <div className="flex gap-2 mb-4">
          {["Today", "Tomorrow", "Day After"].map((day, i) => (
            <button
              key={day}
              className={`px-4 py-2 rounded-button text-sm font-medium border-2 transition-colors ${
                i === 1
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-foreground hover:border-primary/50"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <RadioGroup
          value={selectedSlot}
          onValueChange={onSelect}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {deliverySlots.map((slot) => (
            <div key={slot.id}>
              <RadioGroupItem
                value={slot.id}
                id={`slot-${slot.id}`}
                className="peer sr-only"
                disabled={!slot.available}
              />
              <Label
                htmlFor={`slot-${slot.id}`}
                className={`flex flex-col items-center p-4 rounded-card border-2 text-center cursor-pointer transition-colors ${
                  !slot.available
                    ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                    : "border-border bg-card peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary"
                }`}
              >
                <span className="font-medium text-base mb-1">{slot.label}</span>
                <span className="text-xs opacity-70">{slot.time}</span>
                {!slot.available && (
                  <span className="text-[10px] text-destructive uppercase font-bold mt-1">
                    Full
                  </span>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <div
          onClick={() => setIsExpressDelivery(!isExpressDelivery)}
          className={`p-4 rounded-card border-2 cursor-pointer transition-colors relative flex items-center gap-4 ${
            isExpressDelivery
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isExpressDelivery ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background/50"}`}
          >
            {isExpressDelivery && <Check className="w-3.5 h-3.5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-0.5 flex items-center gap-1.5">
              ⚡ Express Delivery
            </p>
            <p className="text-xs text-muted-foreground">
              Get your order in 2 hours for ₹49 extra
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border/40">
        <h3 className="font-heading text-lg font-semibold mb-4 text-foreground">
          Substitution Preferences
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          If an item becomes unavailable, what should we do?
        </p>

        <RadioGroup
          value={substitutionPref}
          onValueChange={setSubstitutionPref}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className="relative">
            <RadioGroupItem
              value="best_match"
              id="sub-best-match"
              className="peer sr-only"
            />
            <Label
              htmlFor="sub-best-match"
              className="flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-colors border-border bg-card hover:border-primary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
            >
              <span className="font-semibold text-sm mb-1 text-foreground">
                Best Match
              </span>
              <span className="text-xs text-muted-foreground">
                Replace with similar item
              </span>
            </Label>
          </div>
          <div className="relative">
            <RadioGroupItem
              value="call_me"
              id="sub-call-me"
              className="peer sr-only"
            />
            <Label
              htmlFor="sub-call-me"
              className="flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-colors border-border bg-card hover:border-primary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
            >
              <span className="font-semibold text-sm mb-1 text-foreground">
                Call Me
              </span>
              <span className="text-xs text-muted-foreground">
                Call to confirm substitute
              </span>
            </Label>
          </div>
          <div className="relative">
            <RadioGroupItem
              value="no_replace"
              id="sub-no-replace"
              className="peer sr-only"
            />
            <Label
              htmlFor="sub-no-replace"
              className="flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-colors border-border bg-card hover:border-primary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
            >
              <span className="font-semibold text-sm mb-1 text-foreground">
                Don't Replace
              </span>
              <span className="text-xs text-muted-foreground">
                Refund the missing item
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
