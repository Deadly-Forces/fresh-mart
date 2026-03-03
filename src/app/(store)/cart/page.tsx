"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { validatePromoCodeAction } from "@/features/checkout/actions/promoActions";
import { toast } from "sonner";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getTotal,
    clearCart,
    appliedPromo,
    applyPromo,
    removePromo,
  } = useCartStore();
  const [promoInput, setPromoInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = subtotal >= 499 ? 0 : 49;
  const discount = appliedPromo?.discountAmount || 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-24 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mb-6 border border-primary/10">
          <ShoppingBag className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Your cart is empty
        </h1>
        <p className="text-muted-foreground text-sm mb-8 max-w-sm">
          Looks like you haven&apos;t added anything yet. Start exploring our
          fresh collection.
        </p>
        <Link href="/shop">
          <Button
            size="lg"
            className="h-12 px-8 rounded-xl font-medium text-sm bg-gradient-to-r from-primary to-emerald-500 hover:shadow-glow transition-all duration-300"
          >
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-destructive gap-2 text-sm hover:bg-destructive/10 rounded-xl px-3 h-9"
          onClick={clearCart}
        >
          <Trash2 className="w-4 h-4" /> Clear
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/15 hover:shadow-soft transition-all duration-300"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/40 to-secondary/10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="object-contain p-2 w-full h-full mix-blend-multiply"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium text-foreground leading-tight">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-colors shrink-0"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {item.unit && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.unit}
                    </p>
                  )}
                </div>

                <div className="flex items-end justify-between mt-3 gap-4">
                  <div className="flex items-center border border-border/60 rounded-lg h-8 px-0.5 bg-background">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-[380px] lg:sticky lg:top-[100px] lg:self-start">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/10 to-emerald-500/10 rounded-[1.25rem] blur-sm" />
            <div className="relative bg-card border border-border/50 rounded-2xl p-6 shadow-aesthetic">
              <h3 className="text-lg font-bold text-foreground mb-5">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span
                    className={`font-medium ${deliveryFee === 0 ? "text-primary" : "text-foreground"}`}
                  >
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-center text-emerald-600 font-medium pt-2 border-t border-border/30">
                    <span className="flex items-center gap-2">
                      Discount ({appliedPromo.code})
                    </span>
                    <span>-₹{appliedPromo.discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Coupon */}
              <div className="py-5">
                {!appliedPromo ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Discount code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="h-10 rounded-xl bg-background/80 border-border/50 text-sm"
                      disabled={isApplyingPromo}
                    />
                    <Button
                      variant="outline"
                      className="h-10 shrink-0 rounded-xl px-4 text-xs font-medium border-primary/20 text-primary hover:bg-primary/5"
                      onClick={async () => {
                        if (!promoInput.trim()) return;
                        setIsApplyingPromo(true);
                        try {
                          const res = await validatePromoCodeAction(
                            promoInput,
                            subtotal,
                          );
                          if (res.error) {
                            toast.error(res.error);
                          } else if (res.success && res.promo) {
                            applyPromo(res.promo);
                            setPromoInput("");
                            toast.success(
                              `Promo code applied! Saved ₹${res.promo.discountAmount}`,
                            );
                          }
                        } finally {
                          setIsApplyingPromo(false);
                        }
                      }}
                      disabled={isApplyingPromo || !promoInput.trim()}
                    >
                      {isApplyingPromo ? "..." : "Apply"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold text-sm tracking-wide uppercase px-2 py-1 bg-emerald-500/20 rounded-md">
                        {appliedPromo.code}
                      </span>
                      <span className="text-xs text-emerald-600/80 font-medium">
                        Applied
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      onClick={() => {
                        removePromo();
                        toast.success("Promo code removed.");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Free delivery progress */}
              {subtotal < 499 && (
                <div className="bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-xl p-3.5 mb-5 border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-2 text-center">
                    Add{" "}
                    <span className="font-semibold text-primary">
                      ₹{(499 - subtotal).toFixed(2)}
                    </span>{" "}
                    more for free delivery
                  </p>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                      ref={(el) => {
                        if (el)
                          el.style.width = `${Math.min((subtotal / 499) * 100, 100)}%`;
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-border/50 pt-5">
                <div className="flex justify-between items-center mb-5">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
                <Link href="/checkout">
                  <Button className="w-full h-12 text-sm font-medium rounded-xl group bg-gradient-to-r from-primary to-emerald-500 hover:shadow-glow transition-all duration-300">
                    Checkout
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>

              <p className="text-center text-[11px] text-muted-foreground mt-4">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
