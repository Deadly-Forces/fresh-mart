import { createClient } from "@/lib/supabase/server";
import { resolveProductImages } from "@/lib/products/resolveProductImages";

/** Shape expected by ProductGrid / ProductCard */
export interface MappedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image: string;
  images?: string[];
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
async function mapRow(p: any): Promise<MappedProduct> {
  let catSlug = "other";
  if (Array.isArray(p.categories) && p.categories.length > 0) {
    catSlug = p.categories[0].slug;
  } else if (p.categories && !Array.isArray(p.categories)) {
    catSlug = (p.categories as any).slug;
  }

  const images = await resolveProductImages(p.slug, p.images);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    comparePrice: p.compare_price ? Number(p.compare_price) : undefined,
    image: images[0] ?? "/placeholder.svg",
    images,
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
  slug: string,
): Promise<MappedProduct | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  return data ? await mapRow(data) : null;
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

  let query = supabase.from("products").select(columns).eq("is_active", true);

  if (needsCategoryFilter) {
    query = query.eq("categories.slug", opts!.categorySlug!);
  }

  if (opts?.featuredOnly) {
    query = query.eq("is_featured", true);
  }

  // If a small limit is specified, no batching needed
  if (opts?.limit) {
    const { data } = await query.limit(opts.limit);
    return Promise.all((data || []).map(mapRow));
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

  return Promise.all(all.map(mapRow));
}

/** Get category counts from all active products */
export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const counts: Record<string, number> = {};
  const BATCH = 1000;
  let from = 0;

  while (true) {
    const { data } = await supabase
      .from("products")
      .select("categories(slug)")
      .eq("is_active", true)
      .range(from, from + BATCH - 1);

    if (!data || data.length === 0) {
      break;
    }

    for (const product of data) {
      let categorySlug = "other";
      if (Array.isArray(product.categories) && product.categories.length > 0) {
        categorySlug = product.categories[0].slug;
      } else if (product.categories && !Array.isArray(product.categories)) {
        categorySlug = (product.categories as { slug?: string }).slug ?? "other";
      }

      counts[categorySlug] = (counts[categorySlug] || 0) + 1;
    }

    if (data.length < BATCH) {
      break;
    }

    from += BATCH;
  }

  return counts;
}

/** Fetch related products in the same category, excluding the given product */
export async function fetchRelatedProducts(
  categorySlug: string,
  excludeId: string,
  limit = 8,
): Promise<MappedProduct[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS_INNER)
    .eq("is_active", true)
    .eq("categories.slug", categorySlug)
    .neq("id", excludeId)
    .limit(limit);

  return Promise.all((data || []).map(mapRow));
}
