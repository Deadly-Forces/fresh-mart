import { ProductGridSkeleton } from "@/components/ui/skeletons";

export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="w-full h-[400px] bg-secondary/50" />

      {/* Trust Bar Skeleton */}
      <div className="border-y border-border/50 py-5">
        <div className="container mx-auto px-4 max-w-7xl flex gap-8 justify-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-2 w-28 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories & Products Skeleton */}
      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="h-6 w-40 bg-muted rounded mb-8" />
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}
