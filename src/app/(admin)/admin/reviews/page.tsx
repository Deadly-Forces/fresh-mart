import { fetchAllReviews } from "@/lib/supabase/reviews";
import { ReviewModerationClient } from "./ReviewModerationClient";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await fetchAllReviews();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Review Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve or reject customer reviews before they appear on product
            pages.
          </p>
        </div>
        <AutoRefresh intervalMs={30000} tables={["reviews"]} />
      </div>

      <ReviewModerationClient initialReviews={reviews} />
    </div>
  );
}
