import Link from "next/link";
import { Search, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isPlaceholderProductImage } from "@/features/admin/constants/productImagePlaceholders";
import { ProductImageReviewClient } from "./ProductImageReviewClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminProductImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params?.q === "string" ? params.q.trim() : "";
  const showAll = params?.all === "1";
  const placeholderOnly = !showAll;
  const pageRaw = typeof params?.page === "string" ? params.page : "1";
  const requestedPage = Math.max(1, parseInt(pageRaw, 10) || 1);

  const supabase = await createClient();
  let productsQuery = supabase
    .from("products")
    .select("id, name, images, categories(name,slug)")
    .order("created_at", { ascending: false });

  if (q) {
    productsQuery = productsQuery.ilike("name", `%${q}%`);
  }

  const { data } = await productsQuery.limit(2600);

  const allProducts = (data ?? []).map((product: any) => {
    const imageUrl = product.images?.[0] || null;
    return {
      id: product.id,
      name: product.name,
      category: product.categories?.name || "Uncategorized",
      categorySlug: product.categories?.slug || null,
      imageUrl,
      isPlaceholder: isPlaceholderProductImage(imageUrl),
    };
  });

  const filteredProducts = placeholderOnly
    ? allProducts.filter((product) => product.isPlaceholder)
    : allProducts;

  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const products = filteredProducts.slice(from, to);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <ImageIcon className="h-6 w-6 text-primary" />
            Product Image Review
          </h1>
          <p className="text-sm text-muted-foreground">
            Search by product name, open candidate sources in the browser, then
            paste the correct image URL and save it.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Showing {totalProducts} {placeholderOnly ? "placeholder-image" : ""}
            {placeholderOnly ? " " : ""}products.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-sm text-primary hover:underline"
        >
          Back to Products
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search products for image review..."
            className="h-10 pl-9"
          />
          {showAll && <input type="hidden" name="all" value="1" />}
        </form>

        <div className="flex gap-2">
          {placeholderOnly ? (
            <Link href={q ? `/admin/products/images?q=${encodeURIComponent(q)}&all=1` : "/admin/products/images?all=1"}>
              <Button variant="outline" size="sm">
                Show All Products
              </Button>
            </Link>
          ) : (
            <Link href={q ? `/admin/products/images?q=${encodeURIComponent(q)}` : "/admin/products/images"}>
              <Button variant="outline" size="sm">
                Placeholder Only
              </Button>
            </Link>
          )}
        </div>
      </div>

      <ProductImageReviewClient
        products={products}
        currentPage={currentPage}
        totalPages={totalPages}
        placeholderOnly={placeholderOnly}
      />
    </div>
  );
}
