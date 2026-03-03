"use client";

import { useState } from "react";
import { Star, Check, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveReview, deleteReview } from "@/lib/supabase/reviews";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  product_name: string;
  product_id: string;
  reviewer_name: string;
  reviewer_email: string | null;
  user_id: string;
}

type FilterTab = "all" | "pending" | "approved";

export function ReviewModerationClient({
  initialReviews,
}: {
  initialReviews: ReviewItem[];
}) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  const filteredReviews = reviews.filter((r) => {
    // Tab filter
    if (filter === "pending" && r.is_approved) return false;
    if (filter === "approved" && !r.is_approved) return false;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      return (
        r.product_name.toLowerCase().includes(q) ||
        r.reviewer_name.toLowerCase().includes(q) ||
        (r.comment || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;

  const handleApprove = async (id: string) => {
    setProcessing((prev) => new Set(prev).add(id));
    const result = await approveReview(id);
    if (result.success) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: true } : r)),
      );
      toast.success("Review approved");
    } else {
      toast.error(result.error || "Failed to approve review");
    }
    setProcessing((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this review? This cannot be undone.",
      )
    )
      return;

    setProcessing((prev) => new Set(prev).add(id));
    const result = await deleteReview(id);
    if (result.success) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } else {
      toast.error(result.error || "Failed to delete review");
    }
    setProcessing((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: reviews.length },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "approved", label: "Approved", count: approvedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-card p-4">
          <p className="text-sm text-muted-foreground">Total Reviews</p>
          <p className="text-2xl font-bold">{reviews.length}</p>
        </div>
        <div className="bg-card border border-warning/30 rounded-card p-4">
          <p className="text-sm text-warning">Pending Approval</p>
          <p className="text-2xl font-bold text-warning">{pendingCount}</p>
        </div>
        <div className="bg-card border border-success/30 rounded-card p-4">
          <p className="text-sm text-success">Approved</p>
          <p className="text-2xl font-bold text-success">{approvedCount}</p>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-pill text-xs font-medium border transition-colors capitalize",
                filter === tab.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary",
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by product, reviewer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-card border border-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Product
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Reviewer
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Rating
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Comment
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs">
                  Date
                </th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {search
                      ? "No reviews match your search."
                      : "No reviews found."}
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr
                    key={review.id}
                    className={cn(
                      "border-b border-border hover:bg-secondary/20 transition-colors",
                      !review.is_approved && "bg-warning/5",
                    )}
                  >
                    <td
                      className="px-4 py-3 font-medium max-w-[180px] truncate"
                      title={review.product_name}
                    >
                      {review.product_name}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{review.reviewer_name}</p>
                        {review.reviewer_email && (
                          <p className="text-xs text-muted-foreground">
                            {review.reviewer_email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3.5 h-3.5",
                              i < review.rating
                                ? "fill-warning text-warning"
                                : "fill-muted text-muted",
                            )}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[300px]">
                      <p
                        className="truncate text-foreground/80"
                        title={review.comment || ""}
                      >
                        {review.comment || (
                          <span className="text-muted-foreground italic">
                            No comment
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {review.is_approved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                          <Filter className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!review.is_approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(review.id)}
                            disabled={processing.has(review.id)}
                            className="h-8 text-xs text-success border-success/30 hover:bg-success/10"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(review.id)}
                          disabled={processing.has(review.id)}
                          className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
