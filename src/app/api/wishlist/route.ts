import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security";

/**
 * GET /api/wishlist — Fetch all wishlist items for the authenticated user,
 * joined with product details.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("wishlist")
      .select(
        `
        product_id,
        created_at,
        products:product_id (
          id,
          name,
          slug,
          price,
          compare_price,
          images,
          unit,
          stock,
          category_id,
          categories:category_id ( slug )
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform into WishlistProduct shape
    const items = (data ?? [])
      .map((row: Record<string, unknown>) => {
        const p = row.products as Record<string, unknown> | null;
        if (!p) return null;
        const cat = p.categories as { slug: string } | null;
        const images = p.images as string[] | null;
        return {
          id: p.id as string,
          name: p.name as string,
          slug: p.slug as string,
          price: Number(p.price),
          comparePrice: p.compare_price ? Number(p.compare_price) : undefined,
          image: images?.[0] ?? "",
          unit: (p.unit as string) ?? undefined,
          stock: p.stock != null ? Number(p.stock) : undefined,
          categorySlug: cat?.slug ?? undefined,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/wishlist — Add a product to the wishlist.
 * Body: { productId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!rateLimit(`wishlist-add:${user.id}`, 30, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const productId = body?.productId;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("wishlist")
      .upsert(
        { user_id: user.id, product_id: productId },
        { onConflict: "user_id,product_id" },
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/wishlist — Remove a product from the wishlist.
 * Body: { productId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!rateLimit(`wishlist-remove:${user.id}`, 30, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const productId = body?.productId;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
