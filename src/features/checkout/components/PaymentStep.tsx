"use client";

import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentStepProps {
    paymentMethod: string;
    onSelect: (method: string) => void;
}

export function PaymentStep({ paymentMethod, onSelect }: PaymentStepProps) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <h2 className="font-heading text-2xl flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Payment Method
            </h2>
            <RadioGroup value={paymentMethod} onValueChange={onSelect} className="space-y-3">
                <div>
                    <RadioGroupItem value="cod" id="pay-cod" className="peer sr-only" />
                    <Label
                        htmlFor="pay-cod"
                        className="flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-colors border-border bg-card hover:border-primary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
                    >
                        <span className="font-semibold text-sm mb-1 text-foreground">💵 Cash on Delivery</span>
                        <span className="text-xs text-muted-foreground">Pay with cash or UPI when your order arrives.</span>
                    </Label>
                </div>
            </RadioGroup>
        </div>
    );
}
