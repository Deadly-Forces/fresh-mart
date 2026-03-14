export const PRODUCT_IMAGE_PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80",
  "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
  "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
  "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
  "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
] as const;

export function isPlaceholderProductImage(imageUrl: string | null | undefined) {
  if (!imageUrl) return true;
  if (imageUrl === "/placeholder.svg") return true;
  if (/jamoona\.com\/.*\/products\//i.test(imageUrl)) return true;
  return PRODUCT_IMAGE_PLACEHOLDERS.includes(
    imageUrl as (typeof PRODUCT_IMAGE_PLACEHOLDERS)[number],
  );
}

