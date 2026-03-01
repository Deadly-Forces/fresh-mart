import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-card overflow-hidden animate-pulse">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-8 rounded-button" />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function ProductDetailSkeleton() {
    return (
        <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-[52%]">
                <Skeleton className="aspect-square w-full rounded-card" />
                <div className="flex gap-3 mt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="w-20 h-20 rounded-button" />
                    ))}
                </div>
            </div>
            <div className="w-full lg:w-[48%] space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-pill" />
                    <Skeleton className="h-10 w-32 rounded-pill" />
                    <Skeleton className="h-10 w-32 rounded-pill" />
                </div>
                <Skeleton className="h-12 w-full rounded-button" />
                <Skeleton className="h-24 w-full rounded-card" />
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="bg-card border border-border rounded-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} className="px-4 py-3">
                                    <Skeleton className="h-3 w-16" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, r) => (
                            <tr key={r} className="border-b border-border">
                                {Array.from({ length: cols }).map((_, c) => (
                                    <td key={c} className="px-4 py-4">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function CategoryGridSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-card overflow-hidden">
                    <Skeleton className="w-full h-full" />
                </div>
            ))}
        </div>
    );
}

export function CartItemSkeleton() {
    return (
        <div className="flex gap-4 py-4 animate-pulse">
            <Skeleton className="w-20 h-20 rounded-button shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
                <div className="flex items-center justify-between mt-2">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>
        </div>
    );
}
