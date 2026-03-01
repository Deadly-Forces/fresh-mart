"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";

export function CartButton() {
    const items = useCartStore((state) => state.items);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    return (
        <Link href="/cart">
            <Button variant="default" size="sm" className="relative gap-1.5 h-9 px-3.5 text-sm font-semibold rounded-lg">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>

                {mounted && itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-background">
                        {itemCount > 99 ? '99+' : itemCount}
                    </span>
                )}
            </Button>
        </Link>
    );
}
