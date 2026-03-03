"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, AlertCircle } from "lucide-react";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import {
  fetchProductReviews,
  type ReviewWithProfile,
} from "@/lib/supabase/reviews";
import { createClient } from "@/lib/supabase/client";

interface ReviewsSectionProps {
  productId: string;
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<
    Record<number, number>
  >({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      const data = await fetchProductReviews(productId);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalCount(data.totalCount);
      setRatingBreakdown(data.ratingBreakdown);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();

    // Check login status
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, [loadReviews]);

  const approvedReviews = reviews.filter((r) => r.is_approved);
  const pendingReviews = reviews.filter((r) => !r.is_approved);

  const displayRating = averageRating || 0;

  return (
    <div>
      {/* Rating Breakdown */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="text-center md:text-left">
          <p className="text-5xl font-bold text-foreground mb-1">
            {displayRating}
          </p>
          <div className="flex gap-0.5 mb-1 justify-center md:justify-start">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(displayRating) ? "fill-warning text-warning" : "fill-muted text-muted"}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {totalCount} review{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex-1 space-y-2 max-w-sm">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingBreakdown[star] || 0;
            const percentage =
              totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">
                  {star}★
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full transition-all duration-500 w-progress"
                    ref={(el) => { if (el) el.style.setProperty('--progress', `${percentage}%`); }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Form */}
      <div className="mb-8">
        {isLoggedIn ? (
          <ReviewForm productId={productId} onReviewSubmitted={loadReviews} />
        ) : (
          <div className="border border-border rounded-card p-5 bg-secondary/30 text-center">
            <p className="text-sm text-muted-foreground">
              <a
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Log in
              </a>{" "}
              to write a review for this product.
            </p>
          </div>
        )}
      </div>

      {/* Pending reviews (shown to author only) */}
      {pendingReviews.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">
              Your pending review{pendingReviews.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="max-w-2xl border-l-2 border-warning/30 pl-4 opacity-80">
            {pendingReviews.map((review) => (
              <ReviewCard
                key={review.id}
                reviewerName={review.reviewer_name}
                rating={review.rating}
                date={new Date(review.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                comment={review.comment || ""}
                isVerified={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved Reviews */}
      <div className="max-w-2xl">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse py-5 border-b border-border"
              >
                <div className="h-4 bg-muted rounded w-32 mb-3" />
                <div className="h-3 bg-muted rounded w-24 mb-3" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : approvedReviews.length > 0 ? (
          approvedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              reviewerName={review.reviewer_name}
              rating={review.rating}
              date={new Date(review.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              comment={review.comment || ""}
              isVerified={true}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
}
