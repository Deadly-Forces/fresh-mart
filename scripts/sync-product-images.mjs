import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const PRODUCT_IMAGE_DIR = path.resolve(
  process.cwd(),
  "public",
  "product-images",
);
const REPORT_PATH = path.resolve(
  process.cwd(),
  "tmp",
  "product-image-sync-report.json",
);
const USER_AGENT = "fresh-mart-product-image-sync/1.0";
const REQUEST_TIMEOUT_MS = Number(process.env.PRODUCT_IMAGE_TIMEOUT_MS || 8000);
const PLACEHOLDER_URLS = new Set([
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
  "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
  "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80",
  "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
  "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80",
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
  "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
]);
const FRESH_CATEGORIES = new Set([
  "vegetables",
  "fruits",
  "meat-seafood",
  "bakery",
  "dairy-eggs",
]);
const BEAUTY_CATEGORIES = new Set(["personal-care", "baby-care"]);
const PRODUCT_CATEGORIES = new Set(["household"]);
const BRAND_PREFIXES = [
  "tata sampann",
  "daawat",
  "aachi",
  "mdh",
  "weikfield",
  "gits",
  "true elements",
  "happilo",
  "saffola",
  "ching s",
  "ching's",
  "nourishvitals",
  "emami healthy tasty",
  "funfoods",
  "fresho",
  "organic tattva",
  "pro nature",
  "24 mantra",
  "mcain",
  "mccain",
  "safal",
  "itc masterchef",
  "mother dairy",
  "birds eye",
  "rajdhani",
  "mtr",
  "bb royal",
  "eastern",
  "aashirvaad",
  "fortune",
  "india gate",
  "tata",
  "amul",
  "britannia",
  "parle",
  "sunfeast",
  "kelloggs",
  "nestle",
  "nescafe",
  "bru",
  "dove",
  "lux",
  "pears",
  "lifebuoy",
  "vim",
  "surf excel",
  "rin",
  "comfort",
  "wheel",
  "harpic",
  "dettol",
  "johnsons",
  "himalaya",
  "pampers",
  "huggies",
  "dabur",
  "patanjali",
  "colgate",
  "closeup",
  "sensodyne",
  "head and shoulders",
  "pantene",
  "clinic plus",
  "tresemme",
  "nivea",
  "vaseline",
  "ponds",
  "garnier",
  "loreal",
];
const STOP_WORDS = new Set([
  "fresh",
  "premium",
  "organic",
  "pack",
  "cut",
  "sliced",
  "chopped",
  "diced",
  "grated",
  "mix",
  "kit",
  "ready",
  "cook",
  "to",
  "value",
  "combo",
]);
const WIKIPEDIA_REJECT_TOKENS = [
  "disambiguation",
  "list of",
  "category:",
  "template:",
  "logo",
  "flag",
];
const COMMONS_REJECT_TOKENS = [
  "logo",
  "icon",
  "diagram",
  "map",
  "coat of arms",
  "svg",
  "vector",
];

function getArg(name, fallback = undefined) {
  const exact = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (!exact) return fallback;
  return exact.slice(name.length + 1);
}

function hasFlag(name) {
  return process.argv.includes(name);
}

const limit = Number(getArg("--limit", "0")) || 0;
const offset = Number(getArg("--offset", "0")) || 0;
const force = hasFlag("--force");
const useFacts = hasFlag("--use-facts");
const concurrency = Math.max(1, Number(getArg("--concurrency", "2")) || 2);

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .filter(
      (token) =>
        token &&
        token.length > 1 &&
        !STOP_WORDS.has(token) &&
        !/^\d+$/.test(token) &&
        !/^(kg|g|gm|ml|l|lt|pc|pcs|piece|pieces|dozen|pack|packs)$/.test(
          token,
        ),
    );
}

function tokenScore(left, right) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let matches = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) matches += 1;
  }

  return matches / Math.max(leftTokens.size, rightTokens.size);
}

function stripQuantity(value) {
  return value
    .replace(
      /\b\d+(?:\.\d+)?\s*(?:kg|g|gm|grams?|ml|l|lt|litre|liter|pc|pcs|pieces?|dozen|pack|packs)\b/gi,
      " ",
    )
    .replace(/\b\d+\s*x\s*\d+\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripBrandPrefix(value) {
  const normalized = normalizeText(value);
  for (const prefix of BRAND_PREFIXES) {
    if (normalized.startsWith(`${prefix} `)) {
      return value.slice(prefix.length).trim();
    }
  }
  return value.trim();
}

function extractParenTerms(value) {
  return [...value.matchAll(/\(([^)]+)\)/g)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

function classifyFactsBaseUrl(categorySlug) {
  if (BEAUTY_CATEGORIES.has(categorySlug)) {
    return "https://world.openbeautyfacts.org";
  }

  if (PRODUCT_CATEGORIES.has(categorySlug)) {
    return "https://world.openproductsfacts.org";
  }

  return "https://world.openfoodfacts.org";
}

function shouldUseFactsFirst(categorySlug) {
  return !FRESH_CATEGORIES.has(categorySlug);
}

function buildQueryContext(product) {
  const noSize = stripQuantity(product.name);
  const parenTerms = extractParenTerms(noSize);
  const withoutParens = noSize
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const stripped = stripBrandPrefix(withoutParens);
  const aliasQueries = parenTerms.map((term) =>
    stripBrandPrefix(stripQuantity(term)),
  );
  const tailQuery = tokenize(stripped || withoutParens || noSize)
    .slice(-4)
    .join(" ")
    .trim();
  const categoryHint =
    product.categorySlug === "beverages"
      ? "drink"
      : product.categorySlug === "household"
        ? "cleaning product"
        : product.categorySlug === "personal-care" ||
            product.categorySlug === "baby-care"
          ? "toiletry"
          : product.categorySlug === "vegetables"
            ? "vegetable"
            : product.categorySlug === "fruits"
              ? "fruit"
              : product.categorySlug === "bakery"
                ? "bread"
                : "food";

  const genericQuery =
    aliasQueries.find(Boolean) ||
    stripped ||
    withoutParens ||
    noSize ||
    product.name;

  const factsQueries = Array.from(
    new Set(
      [noSize, withoutParens, stripped, genericQuery]
        .map((item) => item?.trim())
        .filter(Boolean),
    ),
  ).slice(0, 3);

  const knowledgeQueries = Array.from(
    new Set(
      [
        genericQuery,
        `${genericQuery} ${categoryHint}`.trim(),
        tailQuery,
        ...aliasQueries,
      ]
        .map((item) => item?.trim())
        .filter(Boolean),
    ),
  ).slice(0, 3);

  const signatureBase = shouldUseFactsFirst(product.categorySlug)
    ? normalizeText(noSize)
    : normalizeText(genericQuery);

  return {
    factsQueries,
    knowledgeQueries,
    signature: `${product.categorySlug}:${signatureBase}`,
  };
}

function isCurrentImageLocal(imageUrl) {
  return typeof imageUrl === "string" && imageUrl.startsWith("/product-images/");
}

function isPlaceholderImage(imageUrl) {
  if (!imageUrl) return true;
  if (imageUrl === "/placeholder.svg") return true;
  if (PLACEHOLDER_URLS.has(imageUrl)) return true;
  return /jamoona\.com\/.*\/products\//i.test(imageUrl);
}

function getLocalImagePath(slug) {
  return `/product-images/${slug}.jpg`;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} for ${url}`);
  }
  return response.json();
}

async function fetchBuffer(url) {
  let attempt = 0;

  while (attempt < 3) {
    attempt += 1;

    try {
      const response = await fetch(url, {
        headers: { "user-agent": USER_AGENT },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.status === 429 && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
        continue;
      }

      if (!response.ok) {
        throw new Error(`Image download failed with ${response.status} for ${url}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      if (attempt >= 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
    }
  }

  throw new Error(`Image download failed for ${url}`);
}

async function searchFacts(query, baseUrl, product) {
  const url = new URL(`${baseUrl}/cgi/search.pl`);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "6");
  url.searchParams.set(
    "fields",
    "product_name,brands,image_front_url,image_url",
  );

  const payload = await fetchJson(url.toString());
  const products = Array.isArray(payload.products) ? payload.products : [];
  let best = null;

  for (const candidate of products) {
    const imageUrl = candidate.image_front_url || candidate.image_url;
    if (!imageUrl) continue;
    const title = `${candidate.brands || ""} ${candidate.product_name || ""}`.trim();
    const score =
      tokenScore(product.name, title) * 0.85 + tokenScore(query, title) * 0.15;

    if (!best || score > best.score) {
      best = {
        score,
        source: baseUrl.includes("openbeautyfacts")
          ? "openbeautyfacts"
          : baseUrl.includes("openproductsfacts")
            ? "openproductsfacts"
            : "openfoodfacts",
        query,
        imageUrl,
      };
    }
  }

  return best && best.score >= 0.35 ? best : null;
}

async function searchWikipedia(query) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "0");
  url.searchParams.set("gsrlimit", "4");
  url.searchParams.set("prop", "pageimages");
  url.searchParams.set("piprop", "thumbnail");
  url.searchParams.set("pithumbsize", "1200");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const payload = await fetchJson(url.toString());
  const pages = Object.values(payload.query?.pages || {});
  let best = null;

  for (const page of pages) {
    const title = String(page.title || "");
    const lowered = title.toLowerCase();
    if (WIKIPEDIA_REJECT_TOKENS.some((token) => lowered.includes(token))) {
      continue;
    }
    const imageUrl = page.thumbnail?.source;
    if (!imageUrl) continue;
    const score = tokenScore(query, title);
    if (!best || score > best.score) {
      best = {
        score,
        source: "wikipedia",
        query,
        imageUrl,
      };
    }
  }

  return best && best.score >= 0.2 ? best : null;
}

async function searchWikimediaCommons(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", `${query} filetype:bitmap`);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "5");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url");
  url.searchParams.set("iiurlwidth", "1200");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const payload = await fetchJson(url.toString());
  const pages = Object.values(payload.query?.pages || {});
  let best = null;

  for (const page of pages) {
    const title = String(page.title || "");
    const lowered = title.toLowerCase();
    if (COMMONS_REJECT_TOKENS.some((token) => lowered.includes(token))) {
      continue;
    }
    const info = Array.isArray(page.imageinfo) ? page.imageinfo[0] : null;
    const imageUrl = info?.thumburl || info?.url;
    if (!imageUrl) continue;
    const cleanedTitle = title.replace(/^File:/i, "");
    const score = tokenScore(query, cleanedTitle);
    if (!best || score > best.score) {
      best = {
        score,
        source: "wikimedia-commons",
        query,
        imageUrl,
      };
    }
  }

  return best && best.score >= 0.15 ? best : null;
}

const queryCache = new Map();
const signatureCache = new Map();
let reportWriteQueue = Promise.resolve();

async function cachedSearch(key, fn) {
  if (!queryCache.has(key)) {
    queryCache.set(key, fn());
  }
  return queryCache.get(key);
}

function queueReportWrite(report) {
  reportWriteQueue = reportWriteQueue.then(() =>
    fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2)),
  );
  return reportWriteQueue;
}

async function resolveImageSource(product) {
  const context = buildQueryContext(product);
  if (signatureCache.has(context.signature)) {
    return {
      ...signatureCache.get(context.signature),
      reused: true,
      signature: context.signature,
    };
  }

  const baseUrl = classifyFactsBaseUrl(product.categorySlug);
  const wikiStep = async () => {
    for (const query of context.knowledgeQueries) {
      const result = await cachedSearch(`wiki:${query}`, () =>
        searchWikipedia(query),
      );
      if (result) return result;
    }
    return null;
  };
  const commonsStep = async () => {
    for (const query of context.knowledgeQueries) {
      const result = await cachedSearch(`commons:${query}`, () =>
        searchWikimediaCommons(query),
      );
      if (result) return result;
    }
    return null;
  };
  const factsStep = async () => {
    for (const query of context.factsQueries) {
      const result = await cachedSearch(
        `facts:${baseUrl}:${query}`,
        () => searchFacts(query, baseUrl, product),
      );
      if (result) return result;
    }
    return null;
  };
  const searchSteps = useFacts
    ? shouldUseFactsFirst(product.categorySlug)
      ? [factsStep, wikiStep, commonsStep]
      : [wikiStep, commonsStep, factsStep]
    : [wikiStep, commonsStep];

  for (const step of searchSteps) {
    const result = await step();
    if (result) {
      signatureCache.set(context.signature, result);
      return { ...result, reused: false, signature: context.signature };
    }
  }

  return null;
}

async function saveImageFile(imageUrl, slug) {
  const localFsPath = path.join(PRODUCT_IMAGE_DIR, `${slug}.jpg`);
  const buffer = await fetchBuffer(imageUrl);

  const output = await sharp(buffer)
    .rotate()
    .resize(900, 900, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();

  await fs.writeFile(localFsPath, output);
  return localFsPath;
}

async function updateProductImage(productId, imagePath) {
  const { error } = await supabase
    .from("products")
    .update({ images: [imagePath] })
    .eq("id", productId);

  if (error) throw error;
}

async function fetchAllProducts() {
  const allProducts = [];
  const batchSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,slug,images,categories(slug)")
      .order("created_at", { ascending: false })
      .range(from, from + batchSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      const categorySlug = Array.isArray(row.categories)
        ? row.categories[0]?.slug || "uncategorized"
        : row.categories?.slug || "uncategorized";

      allProducts.push({
        id: row.id,
        name: row.name,
        slug: row.slug,
        categorySlug,
        currentImage: row.images?.[0] || null,
      });
    }

    if (data.length < batchSize) break;
    from += batchSize;
  }

  return allProducts;
}

async function processProduct(product, index, total, report, localSignatureFiles) {
  const progress = `[${index + 1}/${total}]`;

  try {
    const localDbPath = getLocalImagePath(product.slug);
    const localFsPath = path.join(PRODUCT_IMAGE_DIR, `${product.slug}.jpg`);
    const resolved = await resolveImageSource(product);

    if (!resolved) {
      report.failed.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        reason: "no-source-found",
      });
      console.log(`${progress} fail ${product.slug} no source found`);
      return;
    }

    if (localSignatureFiles.has(resolved.signature)) {
      await fs.copyFile(localSignatureFiles.get(resolved.signature), localFsPath);
    } else {
      const sourcePath = await saveImageFile(resolved.imageUrl, product.slug);
      localSignatureFiles.set(resolved.signature, sourcePath);
    }

    await updateProductImage(product.id, localDbPath);
    report.updated.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      categorySlug: product.categorySlug,
      localPath: localDbPath,
      source: resolved.source,
      query: resolved.query,
      reused: resolved.reused,
    });
    console.log(
      `${progress} ok ${product.slug} <- ${resolved.source} (${resolved.query})`,
    );
  } catch (error) {
    report.failed.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      reason: error instanceof Error ? error.message : String(error),
    });
    console.log(`${progress} fail ${product.slug} ${String(error)}`);
  } finally {
    await queueReportWrite(report);
  }
}

async function main() {
  await fs.mkdir(PRODUCT_IMAGE_DIR, { recursive: true });
  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });

  const products = await fetchAllProducts();
  const candidates = products.filter((product) => {
    if (force) return true;
    if (isCurrentImageLocal(product.currentImage)) return false;
    return isPlaceholderImage(product.currentImage) || !product.currentImage;
  });
  const selected = candidates.slice(offset, limit ? offset + limit : undefined);
  const report = {
    startedAt: new Date().toISOString(),
    totalProducts: products.length,
    candidateProducts: candidates.length,
    selectedProducts: selected.length,
    updated: [],
    skipped: [],
    failed: [],
  };
  const localSignatureFiles = new Map();
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= selected.length) return;
      await processProduct(
        selected[index],
        index,
        selected.length,
        report,
        localSignatureFiles,
      );
    }
  }

  const workerCount = Math.min(concurrency, Math.max(selected.length, 1));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  await reportWriteQueue;

  report.finishedAt = new Date().toISOString();
  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(
    JSON.stringify(
      {
        totalProducts: report.totalProducts,
        candidateProducts: report.candidateProducts,
        selectedProducts: report.selectedProducts,
        updated: report.updated.length,
        skipped: report.skipped.length,
        failed: report.failed.length,
        reportPath: REPORT_PATH,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
