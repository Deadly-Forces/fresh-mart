"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator, type Step } from "@/components/ui/StepIndicator";
import { AddressStep } from "@/features/checkout/components/AddressStep";
import { DeliveryStep } from "@/features/checkout/components/DeliveryStep";
import { PaymentStep } from "@/features/checkout/components/PaymentStep";
import { OrderSummaryPanel } from "@/features/checkout/components/OrderSummaryPanel";
import { useCartStore } from "@/store/cartStore";
import { placeOrderAction } from "@/features/checkout/actions/orderActions";
import { getUserAddressesAction } from "@/features/checkout/actions/addressActions";
import { checkServiceability } from "@/utils/serviceability";
import { toast } from "sonner";

const steps: Step[] = [
    { id: "address", label: "Address" },
    { id: "delivery", label: "Delivery Slot" },
    { id: "payment", label: "Payment" },
];

export default function CheckoutPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("morning");
    const [isExpressDelivery, setIsExpressDelivery] = useState(false);
    const [substitutionPref, setSubstitutionPref] = useState("best_match");
    const [paymentMethod, setPaymentMethod] = useState("cod");

    // Order state
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const { items, getTotal, clearCart, appliedPromo } = useCartStore();

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error("Please select a delivery address.");
            setCurrentStep(0);
            return;
        }

        // Just an extra safety check in case they bypassed the UI
        try {
            const { addresses } = await getUserAddressesAction();
            const addr = addresses?.find(a => a.id === selectedAddress);
            if (addr && !checkServiceability(addr.pincode)) {
                toast.error("The selected address is outside our delivery zone.");
                setCurrentStep(0);
                return;
            }
        } catch {
            // ignore error
        }

        if (items.length === 0) {
            toast.error("Your cart is empty!");
            return;
        }

        startTransition(async () => {
            const formattedItems = items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                image: item.image,
            }));

            const cartTotal = getTotal();
            const isFreeDelivery = cartTotal >= 50;
            const deliveryFee = cartTotal > 0 && !isFreeDelivery ? 4.99 : 0;
            const expressFee = isExpressDelivery ? 3.99 : 0;
            const finalTotal = cartTotal + deliveryFee + expressFee;

            const result = await placeOrderAction(
                selectedAddress,
                selectedSlot,
                paymentMethod,
                finalTotal,
                formattedItems,
                substitutionPref,
                appliedPromo?.code,
                appliedPromo?.discountAmount
            );

            if (result.error) {
                toast.error(result.error);
            } else if (result.success && result.orderId) {
                setPlacedOrderId(result.orderId);
                setOrderPlaced(true);
                clearCart();
            }
        });
    };

    if (orderPlaced) {
        return (
            <div className="container mx-auto px-4 max-w-7xl py-16 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/15 to-emerald-500/15 flex items-center justify-center mx-auto mb-6 animate-in zoom-in-50 border border-primary/10">
                        <CheckCircle className="w-14 h-14 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
                    <p className="text-muted-foreground mb-2">Order ID: #{placedOrderId?.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground mb-8">
                        Estimated delivery: {selectedSlot === "morning" ? "Morning (8AM - 11AM)" : selectedSlot === "afternoon" ? "Afternoon (12PM - 4PM)" : selectedSlot === "evening" ? "Evening (5PM - 9PM)" : "Flexible"}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/profile">
                            <Button className="gap-2 rounded-xl h-11 bg-gradient-to-r from-primary to-emerald-500 hover:shadow-glow transition-all duration-300">
                                Track Order <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="outline" className="rounded-xl h-11 border-primary/20 text-primary hover:bg-primary/5">Continue Shopping</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 max-w-7xl py-6">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <StepIndicator steps={steps} currentStepIndex={currentStep} className="max-w-md mx-auto mb-10" />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Steps */}
                <div className="flex-1">
                    {currentStep === 0 && (
                        <AddressStep selectedAddress={selectedAddress} onSelect={setSelectedAddress} />
                    )}
                    {currentStep === 1 && (
                        <DeliveryStep
                            selectedSlot={selectedSlot}
                            onSelect={setSelectedSlot}
                            isExpressDelivery={isExpressDelivery}
                            setIsExpressDelivery={setIsExpressDelivery}
                            substitutionPref={substitutionPref}
                            setSubstitutionPref={setSubstitutionPref}
                        />
                    )}
                    {currentStep === 2 && (
                        <PaymentStep paymentMethod={paymentMethod} onSelect={setPaymentMethod} />
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/40">
                        {currentStep > 0 ? (
                            <Button variant="ghost" onClick={() => setCurrentStep(currentStep - 1)} className="gap-2 rounded-xl" disabled={isPending}>
                                <ArrowLeft className="w-4 h-4" /> Back
                            </Button>
                        ) : (
                            <div />
                        )}
                        {currentStep < 2 ? (
                            <Button onClick={() => setCurrentStep(currentStep + 1)} className="gap-2 px-6 rounded-xl h-11 bg-gradient-to-r from-primary to-emerald-500 hover:shadow-glow transition-all duration-300" disabled={isPending}>
                                Continue <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handlePlaceOrder}
                                className="gap-2 px-8 bg-gradient-to-r from-primary to-emerald-500 hover:shadow-glow text-white h-12 text-base rounded-xl transition-all duration-300"
                                disabled={isPending || items.length === 0}
                            >
                                {isPending ? (
                                    <>
                                        Processing <Loader2 className="w-4 h-4 animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        Place Order <CheckCircle className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Right: Order Summary */}
                <OrderSummaryPanel isExpressDelivery={isExpressDelivery} />
            </div>
        </div>
    );
}
