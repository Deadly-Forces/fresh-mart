"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ExternalLink,
  ImageIcon,
  Save,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProductImagesAction } from "@/features/admin/actions/productActions";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  categorySlug: string | null;
  imageUrl: string | null;
  isPlaceholder: boolean;
};

function buildSearchLinks(product: ProductRow) {
  const query = encodeURIComponent(
    `${product.name} ${product.category !== "Uncategorized" ? product.category : ""}`.trim(),
  );

  return {
    google: `https://www.google.com/search?tbm=isch&q=${query}`,
    openverse: `https://openverse.org/search/image?q=${query}`,
    wikimedia: `https://commons.wikimedia.org/w/index.php?search=${query}&title=Special:MediaSearch&go=Go&type=image`,
    openfoodfacts: `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process`,
  };
}

function ProductImageCard({ product }: { product: ProductRow }) {
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const links = buildSearchLinks(product);

  const handleSave = () => {
    const trimmed = imageUrl.trim();
    setFeedback(null);

    startTransition(async () => {
      const result = await updateProductImagesAction(
        product.id,
        trimmed ? [trimmed] : [],
      );

      if (result.error) {
        setFeedback(result.error);
        return;
      }

      setFeedback("Saved");
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-secondary">
            {imageUrl ? (
              // Arbitrary review URLs may come from any host, so use a plain img here.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-base font-semibold text-foreground">
              {product.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">{product.category}</p>
              {product.isPlaceholder && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  <AlertCircle className="h-3 w-3" />
                  Placeholder
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href={`/admin/products/${product.id}`}
                className="text-xs text-primary hover:underline"
              >
                Edit Product
              </Link>
              {product.imageUrl && (
                <a
                  href={product.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Current Image
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:max-w-xl">
          <div className="mb-3 flex flex-wrap gap-2">
            <a href={links.google} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Search className="h-3.5 w-3.5" /> Google Images
              </Button>
            </a>
            <a href={links.openverse} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" /> Openverse
              </Button>
            </a>
            <a href={links.wikimedia} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" /> Wikimedia
              </Button>
            </a>
            <a href={links.openfoodfacts} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" /> Open Food Facts
              </Button>
            </a>
          </div>

          <div className="flex gap-2">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste the correct image URL"
              className="h-10"
            />
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="gap-1.5 shrink-0"
            >
              <Save className="h-3.5 w-3.5" />
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
          {feedback && (
            <p className="mt-2 text-xs text-muted-foreground">{feedback}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductImageReviewClient({
  products,
  currentPage,
  totalPages,
  placeholderOnly,
}: {
  products: ProductRow[];
  currentPage: number;
  totalPages: number;
  placeholderOnly: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    if (placeholderOnly) params.delete("all");
    router.push(`/admin/products/images?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          No products found for image review.
        </div>
      ) : (
        products.map((product) => (
          <ProductImageCard key={product.id} product={product} />
        ))
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="gap-1.5"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="gap-1.5"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
