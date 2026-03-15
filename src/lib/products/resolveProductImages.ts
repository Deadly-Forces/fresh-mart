import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";
import { isPlaceholderProductImage } from "@/features/admin/constants/productImagePlaceholders";
import {
  getLocalProductImagePath,
  PRODUCT_IMAGE_PLACEHOLDER_PATH,
} from "@/lib/products/localProductImage";

const PRODUCT_IMAGE_DIR = path.join(process.cwd(), "public", "product-images");

let localProductImagesPromise: Promise<Map<string, string>> | null = null;

async function getLocalProductImages(): Promise<Map<string, string>> {
  if (!localProductImagesPromise) {
    localProductImagesPromise = (async () => {
      const localImages = new Map<string, string>();

      try {
        const entries = await readdir(PRODUCT_IMAGE_DIR, { withFileTypes: true });

        for (const entry of entries) {
          if (!entry.isFile()) continue;

          const parsed = path.parse(entry.name);
          if (!parsed.name) continue;

          localImages.set(parsed.name, `/product-images/${entry.name}`);
        }
      } catch {
        return new Map<string, string>();
      }

      return localImages;
    })();
  }

  return localProductImagesPromise;
}

function normalizeImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];

  return images
    .filter((image): image is string => typeof image === "string")
    .map((image) => image.trim())
    .filter(Boolean);
}

export async function resolveProductImages(
  slug: string | null | undefined,
  images: unknown,
): Promise<string[]> {
  const resolvedImages = new Set<string>();
  const localImages = await getLocalProductImages();

  const localImage = getLocalProductImagePath(slug, localImages);

  if (localImage) {
    resolvedImages.add(localImage);
  }

  for (const image of normalizeImages(images)) {
    if (isPlaceholderProductImage(image)) continue;
    resolvedImages.add(image);
  }

  if (resolvedImages.size === 0) {
    return [PRODUCT_IMAGE_PLACEHOLDER_PATH];
  }

  return Array.from(resolvedImages);
}

export async function resolveProductImage(
  slug: string | null | undefined,
  images: unknown,
): Promise<string> {
  const resolvedImages = await resolveProductImages(slug, images);
  return resolvedImages[0] ?? PRODUCT_IMAGE_PLACEHOLDER_PATH;
}
