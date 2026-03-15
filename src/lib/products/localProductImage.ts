export const PRODUCT_IMAGE_PLACEHOLDER_PATH = "/placeholder.svg";

type ProductImageLookup = ReadonlyMap<string, string> | Readonly<Record<string, string>>;

function normalizeProductImageSlug(slug: string | null | undefined): string | null {
  if (typeof slug !== "string") return null;

  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return null;

  return normalizedSlug;
}

function stripTrailingNumericSuffix(value: string): string {
  return value.replace(/-\d+$/, "");
}

export function getLocalProductImageCandidates(
  slug: string | null | undefined,
): string[] {
  const normalizedSlug = normalizeProductImageSlug(slug);
  if (!normalizedSlug) return [];

  const segments = normalizedSlug.split("-").filter(Boolean);
  const candidates = new Set<string>([
    normalizedSlug,
    stripTrailingNumericSuffix(normalizedSlug),
  ]);

  for (let startIndex = 1; startIndex < segments.length - 1; startIndex += 1) {
    const suffix = segments.slice(startIndex).join("-");
    if (!suffix) continue;

    candidates.add(suffix);
    candidates.add(stripTrailingNumericSuffix(suffix));
  }

  return Array.from(candidates).filter(Boolean);
}

export function getLocalProductImagePath(
  slug: string | null | undefined,
  lookup?: ProductImageLookup,
): string | null {
  if (!lookup) return null;

  for (const candidate of getLocalProductImageCandidates(slug)) {
    if (lookup instanceof Map) {
      const resolvedPath = lookup.get(candidate);
      if (resolvedPath) return resolvedPath;
      continue;
    }

    const resolvedPath = lookup[candidate];
    if (resolvedPath) return resolvedPath;
  }

  return null;
}
