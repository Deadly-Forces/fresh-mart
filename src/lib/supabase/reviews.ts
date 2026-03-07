"use server";

import { createClient } from "@/lib/supabase/server";
import {
  stripHtml,
  sanitizeString,
  isValidUUID,
  rateLimit,
} from "@/lib/security";

export interface ReviewWithProfile {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  images: string[] | null;
  is_approved: boolean;
  created_at: string;
  reviewer_name: string;
}

/** Fetch approved reviews for a product (plus the current user's own pending reviews) */
export async function fetchProductReviews(productId: string): Promise<{
  reviews: ReviewWithProfile[];
  averageRating: number;
  totalCount: number;
  ratingBreakdown: Record<number, number>;
}> {
  if (!isValidUUID(productId)) {
    return {
      reviews: [],
      averageRating: 0,
      totalCount: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const supabase = await createClient();

  // RLS already filters: approved reviews visible to everyone, own reviews visible to author
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return {
      reviews: [],
      averageRating: 0,
      totalCount: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const reviews = data || [];

  // Fetch profile names for all reviewers
  const userIds = [...new Set(reviews.map((r) => r.user_id).filter(Boolean))] as string[];
  let profileMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);
    profileMap = Object.fromEntries(
      (profiles || []).map((p) => [p.id, p.name || "Anonymous"]),
    );
  }

  const mapped: ReviewWithProfile[] = reviews.map((r) => ({
    ...r,
    user_id: r.user_id || "",
    product_id: r.product_id || "",
    rating: r.rating || 0,
    created_at: r.created_at || new Date().toISOString(),
    is_approved: r.is_approved || false,
    reviewer_name: profileMap[r.user_id || ""] || "Anonymous",
  }));

  // Only count approved reviews for stats
  const approvedReviews = reviews.filter((r) => r.is_approved);
  const totalCount = approvedReviews.length;
  const averageRating =
    totalCount > 0
      ? Math.round(
        (approvedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalCount) *
        10,
      ) / 10
      : 0;

  const ratingBreakdown: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  for (const r of approvedReviews) {
    const rating = r.rating || 0;
    ratingBreakdown[rating] = (ratingBreakdown[rating] || 0) + 1;
  }

  return { reviews: mapped, averageRating, totalCount, ratingBreakdown };
}

/** Submit a new review */
export async function submitReview(data: {
  productId: string;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in to submit a review.",
    };
  }

  // Rate limit: 5 reviews per minute per user
  if (!rateLimit(`review:${user.id}`, 5, 60_000)) {
    return {
      success: false,
      error: "Too many reviews submitted. Please wait.",
    };
  }

  // Validate product ID format
  if (!isValidUUID(data.productId)) {
    return { success: false, error: "Invalid product." };
  }

  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5." };
  }

  if (!data.comment || data.comment.trim().length < 10) {
    return {
      success: false,
      error: "Review comment must be at least 10 characters.",
    };
  }

  // Sanitize the comment: strip HTML tags and limit length
  const sanitizedComment = sanitizeString(stripHtml(data.comment), 2000);
  if (!sanitizedComment || sanitizedComment.length < 10) {
    return {
      success: false,
      error:
        "Review comment must be at least 10 characters after sanitization.",
    };
  }

  // Check for duplicate review
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", data.productId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: "You have already reviewed this product." };
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    product_id: data.productId,
    rating: data.rating,
    comment: sanitizedComment,
    is_approved: false,
  });

  if (error) {
    console.error("Error submitting review:", error);
    return {
      success: false,
      error: "Failed to submit review. Please try again.",
    };
  }

  return { success: true };
}

/** Helper: verify the current user is an admin */
async function requireAdmin(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { supabase, error: "Admin access required" };
  }

  return { supabase };
}

/** Admin: Fetch all reviews with product + user info */
export async function fetchAllReviews(
  filter?: "all" | "pending" | "approved" | "rejected",
): Promise<
  Array<{
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
  }>
> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) {
    console.error("Admin auth failed for fetchAllReviews:", authError);
    return [];
  }

  let query = supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter === "pending") {
    query = query.eq("is_approved", false);
  } else if (filter === "approved") {
    query = query.eq("is_approved", true);
  }

  const { data: reviews, error } = await query;

  if (error) {
    console.error("Error fetching all reviews:", error);
    return [];
  }

  if (!reviews || reviews.length === 0) return [];

  // Fetch profiles
  const userIds = [...new Set(reviews.map((r) => r.user_id).filter(Boolean))] as string[];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in("id", userIds);
  const profileMap = Object.fromEntries(
    (profiles || []).map((p) => [
      p.id,
      { name: p.name || "Anonymous", email: p.email },
    ]),
  );

  // Fetch product names
  const productIds = [...new Set(reviews.map((r) => r.product_id).filter(Boolean))] as string[];
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);
  const productMap = Object.fromEntries(
    (products || []).map((p) => [p.id, p.name]),
  );

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating || 0,
    comment: r.comment,
    is_approved: r.is_approved || false,
    created_at: r.created_at || new Date().toISOString(),
    product_name: productMap[r.product_id || ""] || "Unknown Product",
    product_id: r.product_id || "",
    reviewer_name: profileMap[r.user_id || ""]?.name || "Anonymous",
    reviewer_email: profileMap[r.user_id || ""]?.email || null,
    user_id: r.user_id || "",
  }));
}

/** Admin: Approve a review */
export async function approveReview(
  reviewId: string,
): Promise<{ success: boolean; error?: string }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) {
    return { success: false, error: authError };
  }

  if (!isValidUUID(reviewId)) {
    return { success: false, error: "Invalid review ID." };
  }

  const { error } = await supabase
    .from("reviews")
    .update({ is_approved: true })
    .eq("id", reviewId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/** Admin: Delete a review */
export async function deleteReview(
  reviewId: string,
): Promise<{ success: boolean; error?: string }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) {
    return { success: false, error: authError };
  }

  if (!isValidUUID(reviewId)) {
    return { success: false, error: "Invalid review ID." };
  }

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
