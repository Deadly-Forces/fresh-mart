"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/lib/supabase/reviews";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Review must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitReview({
        productId,
        rating,
        comment,
      });

      if (result.success) {
        toast.success("Review submitted! It will appear once approved.");
        setRating(0);
        setComment("");
        onReviewSubmitted?.();
      } else {
        toast.error(result.error || "Failed to submit review.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border rounded-card p-5 bg-card/50 space-y-4"
    >
      <h3 className="font-heading text-lg font-semibold">Write a Review</h3>

      {/* Star Rating */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Your Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "w-7 h-7 transition-colors",
                  (hoveredRating || rating) >= star
                    ? "fill-warning text-warning"
                    : "fill-muted text-muted",
                )}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-muted-foreground ml-2 self-center">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor="review-comment"
          className="text-sm font-medium text-foreground mb-2 block"
        >
          Your Review
        </label>
        <Textarea
          id="review-comment"
          placeholder="Tell others what you think about this product (min 10 characters)..."
          value={comment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setComment(e.target.value)
          }
          rows={4}
          maxLength={1000}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {comment.length}/1000
        </p>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
        className="rounded-pill"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
