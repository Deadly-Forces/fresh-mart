import { cn } from "@/lib/utils";

interface PriceDisplayProps {
    price: number;
    comparePrice?: number;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function PriceDisplay({
    price,
    comparePrice,
    className,
    size = "md",
}: PriceDisplayProps) {
    const savings = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            <span
                className={cn("font-semibold text-foreground", {
                    "text-sm": size === "sm",
                    "text-base": size === "md",
                    "text-xl": size === "lg",
                })}
            >
                ${price.toFixed(2)}
            </span>
            {comparePrice && comparePrice > price && (
                <>
                    <span
                        className={cn("text-muted-foreground line-through", {
                            "text-xs": size === "sm",
                            "text-sm": size === "md",
                            "text-base": size === "lg",
                        })}
                    >
                        ${comparePrice.toFixed(2)}
                    </span>
                    <span
                        className={cn(
                            "bg-primary/10 text-primary font-medium rounded-md px-1.5 py-0.5",
                            {
                                "text-[10px]": size === "sm",
                                "text-xs": size === "md" || size === "lg",
                            }
                        )}
                    >
                        {savings}% OFF
                    </span>
                </>
            )}
        </div>
    );
}
