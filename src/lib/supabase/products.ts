import { createClient } from "@/lib/supabase/server";

/** Shape expected by ProductGrid / ProductCard */
export interface MappedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image: string;
  unit?: string;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  categorySlug?: string;
  brand?: string;
  stock?: number;
}

const PRODUCT_COLUMNS =
  "id, name, slug, price, compare_price, images, unit, stock, tags, is_featured, categories(slug)";

const PRODUCT_COLUMNS_INNER =
  "id, name, slug, price, compare_price, images, unit, stock, tags, is_featured, categories!inner(slug)";

/** Map a raw Supabase product row to MappedProduct */
function mapRow(p: any): MappedProduct {
  let catSlug = "other";
  if (Array.isArray(p.categories) && p.categories.length > 0) {
    catSlug = p.categories[0].slug;
  } else if (p.categories && !Array.isArray(p.categories)) {
    catSlug = (p.categories as any).slug;
  }

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    comparePrice: p.compare_price ? Number(p.compare_price) : undefined,
    image: p.images?.[0] || "/placeholder.svg",
    unit: p.unit ?? undefined,
    categorySlug: catSlug,
    stock: p.stock ?? undefined,
    brand: p.brand || "",
    badge: p.tags?.[0] || "",
    rating: 4.0,
  };
}

/** Fetch a single product by slug */
export async function fetchProductBySlug(
  slug: string
): Promise<MappedProduct | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  return data ? mapRow(data) : null;
}

/**
 * Fetch products with optional filters.
 * Uses paginated batching internally to avoid Supabase max_rows limits.
 */
export async function fetchProducts(opts?: {
  categorySlug?: string;
  limit?: number;
  featuredOnly?: boolean;
}): Promise<MappedProduct[]> {
  const supabase = await createClient();

  // Use inner join when we need to filter by category slug
  const needsCategoryFilter = opts?.categorySlug && opts.categorySlug !== "all";
  const columns = needsCategoryFilter ? PRODUCT_COLUMNS_INNER : PRODUCT_COLUMNS;

  let query = supabase
    .from("products")
    .select(columns)
    .eq("is_active", true);

  if (needsCategoryFilter) {
    query = query.eq("categories.slug", opts!.categorySlug!);
  }

  if (opts?.featuredOnly) {
    query = query.eq("is_featured", true);
  }

  // If a small limit is specified, no batching needed
  if (opts?.limit) {
    const { data } = await query.limit(opts.limit);
    return (data || []).map(mapRow);
  }

  // Paginated fetch to avoid max_rows cap
  const BATCH = 1000;
  const all: any[] = [];
  let from = 0;
  let more = true;

  while (more) {
    const { data: batch } = await query.range(from, from + BATCH - 1);
    if (batch && batch.length > 0) {
      all.push(...batch);
      from += BATCH;
      more = batch.length === BATCH;
    } else {
      more = false;
    }
  }

  return all.map(mapRow);
}

/** Get category counts from all active products */
export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const products = await fetchProducts();
  const counts: Record<string, number> = {};
  for (const p of products) {
    const cat = p.categorySlug ?? "other";
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return counts;
}
