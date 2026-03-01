"use client";

import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface OrderSummaryPanelProps {
    isExpressDelivery?: boolean;
}

export function OrderSummaryPanel({ isExpressDelivery = false }: OrderSummaryPanelProps) {
    const { items, getTotal } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full lg:w-[35%] lg:sticky lg:top-[140px] lg:self-start">
                <div className="bg-card border border-border rounded-card p-6 flex justify-center items-center min-h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    const subtotal = getTotal();
    const isFreeDelivery = subtotal >= 50;
    const deliveryFee = subtotal > 0 && !isFreeDelivery ? 4.99 : 0;
    const expressFee = isExpressDelivery ? 3.99 : 0;
    const total = subtotal + deliveryFee + expressFee;

    return (
        <div className="w-full lg:w-[35%] lg:sticky lg:top-[140px] lg:self-start">
            <div className="bg-card border border-border rounded-card p-6 space-y-4">
                <h3 className="font-heading text-xl">Order Summary</h3>
                <div className="space-y-3 text-sm divide-y divide-border max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.length === 0 ? (
                        <p className="text-muted-foreground italic py-2">Your cart is empty.</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex justify-between pt-3 first:pt-0 gap-4">
                                <span className="text-muted-foreground flex-1 break-words line-clamp-2">
                                    {item.name} × <span className="font-semibold text-foreground">{item.quantity}</span>
                                </span>
                                <span className="font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery</span>
                        {deliveryFee === 0 ? <span className="text-success">FREE</span> : <span>${deliveryFee.toFixed(2)}</span>}
                    </div>
                    {isExpressDelivery && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Express Fee</span>
                            <span>${expressFee.toFixed(2)}</span>
                        </div>
                    )}
                </div>
                <div className="border-t border-border pt-4 flex justify-between">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-lg text-primary">${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
