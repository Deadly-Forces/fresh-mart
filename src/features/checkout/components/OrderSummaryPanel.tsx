"use client";

import { useCartStore } from "@/store/cartStore";
import { useEffect, useState, useCallback } from "react";
import { Loader2, Gift, Sparkles } from "lucide-react";
import {
  getAutoDiscountsAction,
  type AutoDiscount,
} from "@/features/checkout/actions/autoDiscountActions";

interface OrderSummaryPanelProps {
  isExpressDelivery?: boolean;
  onAutoDiscountChange?: (amount: number) => void;
}

export function OrderSummaryPanel({
  isExpressDelivery = false,
  onAutoDiscountChange,
}: OrderSummaryPanelProps) {
  const { items, getTotal, appliedPromo } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [autoDiscounts, setAutoDiscounts] = useState<AutoDiscount[]>([]);
  const [autoTotal, setAutoTotal] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getTotal();

  // Fetch auto-discounts when subtotal changes
  const fetchAutoDiscounts = useCallback(async () => {
    if (subtotal <= 0) {
      setAutoDiscounts([]);
      setAutoTotal(0);
      onAutoDiscountChange?.(0);
      return;
    }
    const result = await getAutoDiscountsAction(subtotal);
    setAutoDiscounts(result.discounts);
    setAutoTotal(result.totalDiscount);
    onAutoDiscountChange?.(result.totalDiscount);
  }, [subtotal, onAutoDiscountChange]);

  useEffect(() => {
    if (mounted) {
      fetchAutoDiscounts();
    }
  }, [mounted, fetchAutoDiscounts]);

  if (!mounted) {
    return (
      <div className="w-full lg:w-[35%] lg:sticky lg:top-[140px] lg:self-start">
        <div className="bg-card border border-border rounded-card p-6 flex justify-center items-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const isFreeDelivery = subtotal >= 499;
  const deliveryFee = subtotal > 0 && !isFreeDelivery ? 49 : 0;
  const expressFee = isExpressDelivery ? 49 : 0;
  const promoDiscount = appliedPromo?.discountAmount || 0;
  const totalDiscount = promoDiscount + autoTotal;
  const total = Math.max(0, subtotal + deliveryFee + expressFee - totalDiscount);

  return (
    <div className="w-full lg:w-[35%] lg:sticky lg:top-[140px] lg:self-start">
      <div className="bg-card border border-border rounded-card p-6 space-y-4">
        <h3 className="font-heading text-xl">Order Summary</h3>
        <div className="space-y-3 text-sm divide-y divide-border max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {items.length === 0 ? (
            <p className="text-muted-foreground italic py-2">
              Your cart is empty.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between pt-3 first:pt-0 gap-4"
              >
                <span className="text-muted-foreground flex-1 break-words line-clamp-2">
                  {item.name} ×{" "}
                  <span className="font-semibold text-foreground">
                    {item.quantity}
                  </span>
                </span>
                <span className="font-medium shrink-0">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            {deliveryFee === 0 ? (
              <span className="text-success">FREE</span>
            ) : (
              <span>₹{deliveryFee.toFixed(2)}</span>
            )}
          </div>
          {isExpressDelivery && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Express Fee</span>
              <span>₹{expressFee.toFixed(2)}</span>
            </div>
          )}

          {/* Auto Discounts */}
          {autoDiscounts.length > 0 && (
            <div className="pt-2 border-t border-border/30 space-y-1.5">
              {autoDiscounts.map((d) => (
                <div
                  key={d.key}
                  className="flex justify-between items-center text-emerald-600"
                >
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    {d.key === "first_order" ? (
                      <Gift className="w-3.5 h-3.5" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {d.label}
                  </span>
                  <span className="text-sm font-medium">-₹{d.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Manual Promo Discount */}
          {appliedPromo && (
            <div className="flex justify-between items-center text-emerald-600 font-medium pt-1">
              <span className="text-xs">Promo: {appliedPromo.code}</span>
              <span className="text-sm">-₹{promoDiscount.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="border-t border-border pt-4 flex justify-between">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-lg text-primary">
            ₹{total.toFixed(2)}
          </span>
        </div>
        {totalDiscount > 0 && (
          <p className="text-xs text-emerald-600 text-center font-medium">
            🎉 You're saving ₹{totalDiscount.toFixed(2)} on this order!
          </p>
        )}
      </div>
    </div>
  );
}
