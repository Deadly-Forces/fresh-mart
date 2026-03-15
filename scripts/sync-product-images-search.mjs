import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import sharp from "sharp";
import puppeteer from "puppeteer-core";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const PRODUCT_IMAGE_DIR = path.resolve(process.cwd(), "public", "product-images");
const REPORT_PATH = path.resolve(
  process.cwd(),
  process.env.PRODUCT_IMAGE_REPORT_PATH || path.join("tmp", "product-image-search-report.json"),
);
const EDGE_EXECUTABLE =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
const REQUEST_TIMEOUT_MS = Number(process.env.PRODUCT_IMAGE_TIMEOUT_MS || 20000);
const PLACEHOLDER_URLS = new Set([
  "/placeholder.svg",
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
const DOMAIN_SCORES = new Map([
  ["jiomart.com", 1.2],
  ["bigbasket.com", 1.15],
  ["blinkit.com", 1.05],
  ["zepto.com", 1.05],
  ["swiggy.com", 1.0],
  ["amazon.in", 0.95],
  ["flipkart.com", 0.9],
  ["aachifoods.com", 1.05],
  ["chingssecret.com", 1.05],
  ["true-elements.com", 1.0],
  ["mdhspices.com", 0.95],
  ["mdhmasalas.com", 0.95],
  ["jamoona.com", 0.85],
  ["shop.redmanshop.com", 0.85],
  ["snapdeal.com", 0.7],
  ["commercefoods.com", 0.75],
  ["meharshop.com", 0.75],
]);
const DISALLOWED_DOMAINS = ["youtube.com", "youtu.be", "pricehistory.app", "oooooya.com"];
const BLOCKED_OUTPUT_HASHES = new Set([
  "c71a998f3d44445c4722767c925389ce00932472",
  "45059343215ae7ce2b458d3569c7de386c2a8d4f",
  "1aeced7f220d026347f262060101524a5b48d88f",
  "f8880db31efa9af7d578869c25616c5e38eb6a33",
  "d1c4f88a03095d349dce2729ddc7a6b27751dd52",
  "7df5fb3eda49dfc8730e67ffc81a2e9a5ee7494e",
  "d8191861e3083267dbd4c9d4d6929b81ce1fd09c",
  "cd0607a79f72fb4f1465895dffd430e5adf6c1c2",
  "3f940418f1e28fc12ef58819f075066a4b1465ab",
  "554a4bdf709560125ff205db384dcd00ea9c2454",
  "e324c79156e0953145897c4b3f55fc88c4a817f1",
  "4d5fb16a78704b0c40c71619e6ec69665aac51d1",
  "3d1d91683cb259227d272885cb81ddf2a9f66c86",
  "5bccbfbfa04ff8f0ed18bb92bb199d3144b937a5",
]);
const BRAND_PREFIXES = [
  "fresho",
  "bb royal",
  "organic tattva",
  "pro nature",
  "24 mantra",
  "rajdhani",
  "mtr",
  "tata sampann",
  "daawat",
  "dawaat",
  "aachi",
  "mdh",
  "weikfield",
  "gits",
  "true elements",
  "happilo",
  "saffola",
  "ching's",
  "ching s",
  "nourishvitals",
  "eastern",
  "aashirvaad",
  "ashirvaad",
  "del monte",
  "funfoods",
  "veeba",
  "emami healthy tasty",
  "emami healthy & tasty",
  "kellogg's",
  "kelloggs",
  "maggi",
  "barilla",
  "wai wai",
  "nissin",
  "catch",
  "everest",
  "suhana",
  "urban platter",
  "badshah",
  "shan",
  "keya",
  "bedekar",
  "priya",
  "mother's recipe",
  "mothers recipe",
  "country delight",
  "dhampure",
  "tabasco",
  "kissan",
  "pillsbury",
  "sundrop",
  "annapurna",
  "tata tea",
  "tata salt",
  "sil",
  "klf",
  "bob's red mill",
  "bobs red mill",
  "queen",
  "zandu",
  "apis himalaya",
  "nature nate",
  "nature's nate",
  "amul",
  "akshayakalpa",
  "balaji wafers",
  "country delight",
  "english oven",
  "epigamia",
  "go",
  "godrej yummiez",
  "gowardhan",
  "havmor",
  "heritage",
  "itc kitchen of india",
  "licious",
  "milky mist",
  "mother dairy",
  "nutrela",
  "vicks",
];
const STOP_WORDS = new Set([
  "fresh",
  "premium",
  "value",
  "combo",
  "pack",
  "mix",
  "ready",
  "cook",
  "instant",
  "rich",
  "aroma",
  "flavour",
  "classic",
  "advanced",
  "whole",
  "powder",
]);
const CONFLICT_TOKENS = new Set([
  "pickle",
  "cookies",
  "cookie",
  "biscuits",
  "biscuit",
  "chips",
  "wafers",
  "snack",
  "snacks",
  "juice",
  "drink",
  "beverage",
  "syrup",
  "jam",
  "jelly",
  "sauce",
  "ketchup",
  "puree",
  "paste",
  "masala",
  "powder",
  "seasoning",
  "crisps",
  "candy",
  "supplement",
  "capsule",
  "capsules",
  "tablet",
  "tablets",
  "soap",
  "shampoo",
  "conditioner",
  "serum",
  "cream",
  "lotion",
]);
const FRESH_CATEGORY_SLUGS = new Set(["fruits", "vegetables"]);
const PRIORITY_SITES_BY_CATEGORY = new Map([
  ["fruits", ["bigbasket.com", "jiomart.com", "zepto.com"]],
  ["vegetables", ["bigbasket.com", "jiomart.com", "zepto.com"]],
  ["dairy-eggs", ["bigbasket.com", "jiomart.com", "amazon.in"]],
  ["meat-seafood", ["bigbasket.com", "amazon.in", "jiomart.com"]],
  ["bakery", ["bigbasket.com", "amazon.in", "jiomart.com"]],
  ["personal-care", ["amazon.in", "jiomart.com", "bigbasket.com"]],
]);
const RELAXED_BRAND_PREFIXES = new Set(["fresho", "organic tattva", "24 mantra", "pro nature", "imported"]);

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
const concurrency = Math.max(1, Number(getArg("--concurrency", "4")) || 4);
const slugFilter = new Set();
for (const slug of String(getArg("--slugs", ""))
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)) {
  slugFilter.add(slug);
}
const slugFilePath = getArg("--slugs-file", "");

async function loadSlugFile() {
  if (!slugFilePath) return;
  const content = await fs.readFile(path.resolve(process.cwd(), slugFilePath), "utf8");
  for (const line of content.split(/\r?\n/g)) {
    const slug = line.trim();
    if (slug) slugFilter.add(slug);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(value) {
  return String(value)
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
        !/^(kg|g|gm|ml|l|lt|pc|pcs|piece|pieces|dozen|pack|packs)$/.test(token) &&
        !/^\d+$/.test(token),
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

function sharedTokenCount(left, right) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let matches = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) matches += 1;
  }
  return matches;
}

function tokenCoverage(left, right) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let matches = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) matches += 1;
  }
  return matches / leftTokens.size;
}

function stripQuantity(value) {
  return String(value)
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
      return String(value).slice(prefix.length).trim();
    }
  }
  return String(value).trim();
}

function extractParenTerms(value) {
  return [...String(value).matchAll(/\(([^)]+)\)/g)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

function canonicalizeProductText(value) {
  return stripBrandPrefix(stripQuantity(String(value || "")))
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getBrandPrefix(value) {
  const normalized = normalizeText(value);
  for (const prefix of BRAND_PREFIXES) {
    if (normalized.startsWith(`${prefix} `)) return prefix;
  }
  return null;
}

function textContainsBrand(text, brand) {
  if (!brand) return true;
  const textTokens = new Set(tokenize(text));
  return tokenize(brand).every((token) => textTokens.has(token));
}

function normalizeQuantityUnit(unit) {
  const lowered = String(unit || "").toLowerCase();
  if (["kg", "kilogram", "kilograms"].includes(lowered)) return "g";
  if (["g", "gm", "gram", "grams"].includes(lowered)) return "g";
  if (["l", "lt", "litre", "liter", "litres", "liters"].includes(lowered)) return "ml";
  if (["ml"].includes(lowered)) return "ml";
  if (["pc", "pcs", "piece", "pieces", "pack", "packs", "tablet", "tablets", "tab", "tabs"].includes(lowered)) {
    return lowered;
  }
  return lowered;
}

function normalizeQuantityValue(value, unit) {
  const numeric = Number(value);
  const normalizedUnit = normalizeQuantityUnit(unit);
  if (!Number.isFinite(numeric)) return null;
  if (normalizedUnit === "g" && String(unit || "").toLowerCase() === "kg") return numeric * 1000;
  if (normalizedUnit === "ml" && ["l", "lt", "litre", "liter", "litres", "liters"].includes(String(unit || "").toLowerCase())) {
    return numeric * 1000;
  }
  return numeric;
}

function extractQuantitySignatures(value) {
  return [...String(value || "").matchAll(/\b(\d+(?:\.\d+)?)\s*(kg|g|gm|gram|grams|ml|l|lt|litre|liter|litres|liters|pc|pcs|piece|pieces|pack|packs|tablet|tablets|tab|tabs)\b/gi)]
    .map((match) => {
      const unit = normalizeQuantityUnit(match[2]);
      const amount = normalizeQuantityValue(match[1], match[2]);
      return amount === null ? null : `${amount}:${unit}`;
    })
    .filter(Boolean);
}

function quantitiesCompatible(left, right) {
  const leftQuantities = extractQuantitySignatures(left);
  const rightQuantities = extractQuantitySignatures(right);
  if (leftQuantities.length === 0 || rightQuantities.length === 0) return true;
  return leftQuantities.some((quantity) => rightQuantities.includes(quantity));
}

function quantitiesExplicitlyMatch(left, right) {
  const leftQuantities = extractQuantitySignatures(left);
  const rightQuantities = extractQuantitySignatures(right);
  if (leftQuantities.length === 0 || rightQuantities.length === 0) return false;
  return leftQuantities.some((quantity) => rightQuantities.includes(quantity));
}

function hasConflictingFormTokens(productText, candidateText) {
  const productTokens = new Set(tokenize(productText));
  const candidateTokens = new Set(tokenize(candidateText));

  for (const token of candidateTokens) {
    if (CONFLICT_TOKENS.has(token) && !productTokens.has(token)) {
      return true;
    }
  }

  return false;
}

function buildSearchQueries(product) {
  const noSize = stripQuantity(product.name);
  const noBrand = stripBrandPrefix(noSize);
  const aliases = extractParenTerms(noSize).map((term) => stripBrandPrefix(stripQuantity(term)));
  const tail = tokenize(noBrand).slice(-4).join(" ").trim();
  return Array.from(
    new Set([product.name, noSize, noBrand, ...aliases, tail].map((item) => item?.trim()).filter(Boolean)),
  ).slice(0, 4);
}

function buildSiteSearchQueries(product, query) {
  const prioritySites = PRIORITY_SITES_BY_CATEGORY.get(product.categorySlug) || [];
  const noBrand = stripBrandPrefix(stripQuantity(product.name));
  const baseTerms = Array.from(new Set([query, product.name, noBrand].map((value) => value?.trim()).filter(Boolean)));
  const siteQueries = [];

  for (const site of prioritySites) {
    for (const term of baseTerms) {
      siteQueries.push(`site:${site} ${term}`);
    }
  }

  if (FRESH_CATEGORY_SLUGS.has(product.categorySlug)) {
    siteQueries.push(`site:bigbasket.com ${noBrand}`);
    siteQueries.push(`site:jiomart.com ${noBrand}`);
  }

  return Array.from(new Set(siteQueries));
}

function canRelaxBrandRequirement(product, brandPrefix) {
  return FRESH_CATEGORY_SLUGS.has(product.categorySlug) && RELAXED_BRAND_PREFIXES.has(brandPrefix || "");
}

function isPlaceholderImage(imageUrl) {
  if (!imageUrl) return true;
  if (PLACEHOLDER_URLS.has(imageUrl)) return true;
  if (/jamoona\.com\/.*\/products\//i.test(imageUrl)) return true;
  return false;
}

function getLocalImagePath(slug) {
  return `/product-images/${slug}.jpg`;
}

function decodeBingUrl(href) {
  try {
    const parsed = new URL(href);
    const encoded = parsed.searchParams.get("u");
    if (encoded?.startsWith("a1")) {
      const base64 = encoded.slice(2);
      const padded = base64 + "=".repeat((4 - (base64.length % 4 || 4)) % 4);
      return Buffer.from(padded, "base64").toString("utf8");
    }
  } catch {}
  return href;
}

function normalizeUrl(url) {
  if (!url) return null;
  let value = String(url).replace(/&amp;/g, "&").trim();
  if (value.startsWith("//")) value = `https:${value}`;
  if (/^https:\/[^/]/i.test(value)) value = value.replace(/^https:\//i, "https://");
  if (/^http:\/[^/]/i.test(value)) value = value.replace(/^http:\//i, "http://");
  return value;
}

function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function getDomainScore(url) {
  const hostname = getHostname(url);
  if (!hostname) return 0.55;
  for (const [domain, score] of DOMAIN_SCORES.entries()) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) return score;
  }
  return 0.55;
}

function isDisallowedDomain(url) {
  const hostname = getHostname(url);
  if (!hostname) return true;
  return DISALLOWED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function isLikelyProductPage(url, title) {
  const lowered = `${url} ${title}`.toLowerCase();
  if (
    lowered.includes("/search") ||
    lowered.includes("/stores/") ||
    lowered.includes("/collections/") ||
    lowered.includes("/category/") ||
    lowered.includes("/categories/") ||
    lowered.includes("/brands/") ||
    lowered.includes("/brand/") ||
    lowered.includes("/browse/") ||
    lowered.includes("/shop/") ||
    lowered.includes("/pb/")
  ) {
    return false;
  }
  return (
    lowered.includes("/products/") ||
    lowered.includes("/product/") ||
    lowered.includes("/p/") ||
    lowered.includes("/pd/") ||
    lowered.includes("/prn/") ||
    lowered.includes("/dp/") ||
    lowered.includes("buy ")
  );
}

function isLikelyProductImage(url) {
  const value = normalizeUrl(url);
  if (!value || !/^https?:/i.test(value)) return false;
  if (/logo|icon|sprite|placeholder|avatar|badge|\.svg|\.woff2?|\.ttf|\.css|\.js/i.test(value)) return false;
  if (/csminstrumentation|amazon-adsystem|fls-na\.amazon|analytics|pixel|beacon/i.test(value)) return false;
  if (/dmart\.in\/product\//i.test(value)) return false;

  const hasImageExtension = /(\.jpg|\.jpeg|\.png|\.webp|\.avif)(\?|$)/i.test(value);
  if (hasImageExtension) return true;

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    const pathValue = parsed.pathname.toLowerCase();
    const hostLooksImageish = /cloudfront\.net$|amazonaws\.com$|m\.media-amazon\.com$|images[-.]|imgix|cdn|static|media|bbassets|jiomart/i.test(host);
    const pathLooksImageish = /\/images?\/|\/media\/|\/uploads?\/|\/products?\/|\/catalog\//i.test(pathValue);
    if (hostLooksImageish && pathLooksImageish) return true;
  } catch {}

  return false;
}

function isSupportedImageContentType(contentType) {
  if (!contentType) return true;
  const lowered = contentType.toLowerCase();
  return lowered.startsWith("image/") && !lowered.includes("svg");
}

async function fetchText(url, referer) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      "accept-language": "en-US,en;q=0.9",
      ...(referer ? { referer } : {}),
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Request failed with ${response.status} for ${url}`);
  return response.text();
}

async function fetchBuffer(url, referer) {
  let attempt = 0;
  while (attempt < 3) {
    attempt += 1;
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": USER_AGENT,
          "accept-language": "en-US,en;q=0.9",
          ...(referer ? { referer } : {}),
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (response.status === 429 && attempt < 3) {
        await sleep(700 * attempt);
        continue;
      }
      if (!response.ok) throw new Error(`Image download failed with ${response.status} for ${url}`);
      const contentType = response.headers.get("content-type") || "";
      if (!isSupportedImageContentType(contentType)) {
        throw new Error(`Unsupported content type ${contentType || "unknown"} for ${url}`);
      }
      return { buffer: Buffer.from(await response.arrayBuffer()), contentType };
    } catch (error) {
      if (attempt >= 3) throw error;
      await sleep(700 * attempt);
    }
  }
  throw new Error(`Image download failed for ${url}`);
}

function extractMetaImage(html) {
  return normalizeUrl(
    html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1] ||
      html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i)?.[1] ||
      html.match(/"image"\s*:\s*"([^"]+)"/i)?.[1] ||
      null,
  );
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMetaText(html, key) {
  return decodeHtmlEntities(
    html.match(new RegExp(`<meta[^>]+property="${key}"[^>]+content="([^"]+)"`, "i"))?.[1] ||
      html.match(new RegExp(`<meta[^>]+name="${key}"[^>]+content="([^"]+)"`, "i"))?.[1] ||
      "",
  );
}

function extractTitleText(html) {
  return decodeHtmlEntities(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "");
}

function extractHeadingText(html) {
  return decodeHtmlEntities(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, " ") || "");
}

function parseJsonLdBlocks(html) {
  const blocks = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  const objects = [];

  for (const block of blocks) {
    const cleaned = block.replace(/^\s*<!--/, "").replace(/-->\s*$/, "").trim();
    try {
      objects.push(JSON.parse(cleaned));
    } catch {}
  }

  return objects;
}

function walkStructuredData(value, visitor) {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const item of value) walkStructuredData(item, visitor);
    return;
  }
  if (typeof value !== "object") return;

  visitor(value);
  for (const nested of Object.values(value)) {
    walkStructuredData(nested, visitor);
  }
}

function hasProductSchemaType(value) {
  const types = Array.isArray(value) ? value : [value];
  return types.some((type) => /product/i.test(String(type || "")));
}

function extractStructuredProductData(html) {
  const names = [];
  const images = [];

  for (const block of parseJsonLdBlocks(html)) {
    walkStructuredData(block, (node) => {
      if (!hasProductSchemaType(node?.["@type"])) return;

      if (node.name) {
        names.push(decodeHtmlEntities(node.name));
      }

      const imageValues = Array.isArray(node.image) ? node.image : [node.image];
      for (const imageValue of imageValues) {
        const url = typeof imageValue === "string" ? imageValue : imageValue?.url;
        const normalized = normalizeUrl(url);
        if (normalized) images.push(normalized);
      }
    });
  }

  return {
    names: Array.from(new Set(names.filter(Boolean))),
    images: Array.from(new Set(images.filter(Boolean))),
  };
}

function extractPageNameSignals(html) {
  return Array.from(
    new Set(
      [
        extractMetaText(html, "og:title"),
        extractMetaText(html, "twitter:title"),
        extractTitleText(html),
        extractHeadingText(html),
        ...extractStructuredProductData(html).names,
      ].filter(Boolean),
    ),
  ).slice(0, 12);
}

function extractAmazonImages(html) {
  const matches = [
    ...html.matchAll(/https?:\/\/m\.media-amazon\.com\/images\/I\/[^"'\s<>\\]+/gi),
    ...html.matchAll(/https?:\/\/images[-a-z0-9.]*amazon\.com\/images\/I\/[^"'\s<>\\]+/gi),
    ...html.matchAll(/"hiRes"\s*:\s*"([^"]+)"/gi),
    ...html.matchAll(/"large"\s*:\s*"([^"]+)"/gi),
    ...html.matchAll(/"mainUrl"\s*:\s*"([^"]+)"/gi),
  ]
    .map((match) => normalizeUrl(match[1] || match[0]))
    .filter(Boolean)
    .filter((url) => isLikelyProductImage(url));

  return Array.from(new Set(matches));
}

function extractBigBasketImages(html) {
  const matches = [...html.matchAll(/https?:\/\/www\.bbassets\.com\/media\/uploads\/p\/(?:s|m|l|xl|xxl)\/[^\s"'<>]+/gi)]
    .map((match) => normalizeUrl(match[0]))
    .filter(Boolean)
    .filter((url) => isLikelyProductImage(url));
  const unique = Array.from(new Set(matches));
  const preferredSizes = ["/xxl/", "/xl/", "/l/", "/m/", "/s/"];
  const sorted = [];
  for (const size of preferredSizes) {
    for (const url of unique) {
      if (url.includes(size) && !sorted.includes(url)) sorted.push(url);
    }
  }
  for (const url of unique) {
    if (!sorted.includes(url)) sorted.push(url);
  }
  return sorted;
}

function upgradeJioMartImage(url) {
  return normalizeUrl(String(url).replace("/150x150/", "/original/").replace("/420x420/", "/original/"));
}

function domainReferer(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}/`;
  } catch {
    return undefined;
  }
}

const searchCache = new Map();
const pageCache = new Map();
let reportWriteQueue = Promise.resolve();
let browserPromise;

function queueReportWrite(report) {
  reportWriteQueue = reportWriteQueue.then(() => fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2)));
  return reportWriteQueue;
}

function isRetriableBrowserError(error) {
  const message = String(error?.message || error || "");
  return /(Target closed|Connection closed|Session closed|Protocol error|Browser has disconnected|Execution context was destroyed|Navigating frame was detached|Cannot find context with specified id|Attempted to use detached Frame)/i.test(message);
}

async function resetBrowser() {
  const activePromise = browserPromise;
  browserPromise = undefined;
  if (!activePromise) return;

  try {
    const browser = await activePromise;
    if (browser?.connected) {
      await browser.close().catch(() => {});
    }
  } catch {}
}

async function getBrowser() {
  if (browserPromise) {
    try {
      const existing = await browserPromise;
      if (existing?.connected) return existing;
    } catch {}
    browserPromise = undefined;
  }

  browserPromise = puppeteer
    .launch({
      executablePath: EDGE_EXECUTABLE,
      headless: "new",
      args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
      defaultViewport: { width: 1365, height: 900 },
    })
    .then((browser) => {
      browser.on("disconnected", () => {
        if (browserPromise) browserPromise = undefined;
      });
      return browser;
    })
    .catch((error) => {
      browserPromise = undefined;
      throw error;
    });

  return browserPromise;
}

async function withBrowserPage(task, attempt = 0) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(USER_AGENT);
    await page.setExtraHTTPHeaders({ "accept-language": "en-US,en;q=0.9" });
    return await task(page);
  } catch (error) {
    if (attempt === 0 && isRetriableBrowserError(error)) {
      await resetBrowser();
      return withBrowserPage(task, attempt + 1);
    }
    throw error;
  } finally {
    try {
      if (!page.isClosed()) {
        await page.close();
      }
    } catch {}
  }
}

async function searchBing(query) {
  const cacheKey = `bing:${query}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  const task = withBrowserPage(async (page) => {
    await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: "domcontentloaded",
      timeout: REQUEST_TIMEOUT_MS,
    });
    await sleep(1000);
    const results = await page.evaluate(() =>
      Array.from(document.querySelectorAll("li.b_algo h2 a"))
        .slice(0, 10)
        .map((anchor) => ({ href: anchor.href, title: (anchor.textContent || "").trim() })),
    );
    return results
      .map((result) => ({ url: decodeBingUrl(result.href), title: result.title }))
      .filter((result) => /^https?:/i.test(result.url))
      .filter((result) => !isDisallowedDomain(result.url));
  }).catch((error) => {
    searchCache.delete(cacheKey);
    throw error;
  });

  searchCache.set(cacheKey, task);
  return task;
}

function isLikelyBrokenImageStats(stats) {
  const { entropy, sharpness, mean } = stats;
  const maxDiff = Math.max(...mean) - Math.min(...mean);

  return (
    entropy < 0.15 ||
    (entropy < 0.7 && sharpness < 0.25) ||
    (entropy < 1.2 && maxDiff < 1.5 && (mean[0] > 250 || mean[0] < 5))
  );
}

async function validateOutputImage(buffer) {
  const image = sharp(buffer);
  const [metadata, stats] = await Promise.all([image.metadata(), image.stats()]);
  const mean = stats.channels.map((channel) => Number(channel.mean.toFixed(1)));
  const entropy = Number((stats.entropy ?? 0).toFixed(3));
  const sharpness = Number((stats.sharpness ?? 0).toFixed(3));
  const hash = crypto.createHash("sha1").update(buffer).digest("hex");

  if (BLOCKED_OUTPUT_HASHES.has(hash)) {
    throw new Error(`Blocked bad image hash ${hash}`);
  }

  if (
    isLikelyBrokenImageStats({
      entropy,
      sharpness,
      mean,
    })
  ) {
    throw new Error(
      `Rejected broken/loading-like image entropy=${entropy} sharpness=${sharpness} mean=${mean.join("/")}`,
    );
  }

  return {
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    hash,
  };
}

async function searchBingImages(query) {
  const cacheKey = `bing-images:${query}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  const task = withBrowserPage(async (page) => {
    await page.goto(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`, {
      waitUntil: "domcontentloaded",
      timeout: REQUEST_TIMEOUT_MS,
    });
    await sleep(1000);
    const results = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a.iusc"))
        .slice(0, 18)
        .map((anchor) => ({
          metadata: anchor.getAttribute("m"),
          label: anchor.getAttribute("aria-label") || anchor.getAttribute("title") || "",
        })),
    );

    return results
      .map((result) => {
        try {
          const parsed = JSON.parse(result.metadata || "{}");
          return {
            pageUrl: parsed.purl || "",
            imageUrl: parsed.murl || "",
            title: parsed.t || result.label || "",
            description: parsed.desc || "",
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .map((result) => ({
        ...result,
        pageUrl: normalizeUrl(result.pageUrl),
        imageUrl: normalizeUrl(result.imageUrl),
      }))
      .filter((result) => result.pageUrl && result.imageUrl)
      .filter((result) => !isDisallowedDomain(result.pageUrl))
      .filter((result) => isLikelyProductImage(result.imageUrl));
  }).catch((error) => {
    searchCache.delete(cacheKey);
    throw error;
  });

  searchCache.set(cacheKey, task);
  return task;
}

async function extractImageCandidatesFromProductPage(pageUrl) {
  if (pageCache.has(pageUrl)) return pageCache.get(pageUrl);

  const task = (async () => {
    const html = await fetchText(pageUrl, domainReferer(pageUrl));
    const structured = extractStructuredProductData(html);
    const pageSignals = extractPageNameSignals(html);
    const candidates = [];
    const pushCandidate = (rawUrl) => {
      const imageUrl = normalizeUrl(rawUrl);
      if (!isLikelyProductImage(imageUrl)) return;
      if (!candidates.includes(imageUrl)) candidates.push(imageUrl);
    };

    for (const imageUrl of structured.images) pushCandidate(imageUrl);

    if (/jiomart\.com/i.test(pageUrl)) {
      const meta = extractMetaImage(html);
      if (meta) pushCandidate(upgradeJioMartImage(meta));
    }

    if (/bigbasket\.com/i.test(pageUrl)) {
      for (const imageUrl of extractBigBasketImages(html)) pushCandidate(imageUrl);
    }

    if (/amazon\./i.test(pageUrl)) {
      for (const imageUrl of extractAmazonImages(html)) pushCandidate(imageUrl);
    }

    pushCandidate(extractMetaImage(html));

    if (candidates.length < 4) {
      const genericUrls = [...html.matchAll(/https?:\/\/[^\s"'<>]+/gi)]
        .map((match) => normalizeUrl(match[0]))
        .filter((url) => isLikelyProductImage(url));
      for (const imageUrl of genericUrls) pushCandidate(imageUrl);
    }

    return {
      pageSignals,
      images: candidates.slice(0, 12).map((imageUrl) => ({
        pageUrl,
        imageUrl,
        referer: domainReferer(pageUrl),
      })),
    };
  })().catch(() => []);

  pageCache.set(pageUrl, task);
  return task;
}

function evaluatePageMatch(product, result, pageSignals) {
  const productCore = canonicalizeProductText(product.name);
  const brandPrefix = getBrandPrefix(product.name);
  const signals = [
    { source: "search-title", text: result.title },
    { source: "search-url", text: result.url },
    ...pageSignals.map((text, index) => ({ source: `page-signal-${index + 1}`, text })),
  ].filter((entry) => entry.text);
  const hasConflictingForm =
    signals.some((signal) => hasConflictingFormTokens(product.name, signal.text)) ||
    hasConflictingFormTokens(product.name, result.title) ||
    hasConflictingFormTokens(product.name, result.url);
  const signalsWithExplicitQuantities = signals.filter((signal) => extractQuantitySignatures(signal.text).length > 0);
  const hasConflictingExplicitQuantity =
    extractQuantitySignatures(product.name).length > 0 &&
    signalsWithExplicitQuantities.length > 0 &&
    !signalsWithExplicitQuantities.some((signal) => quantitiesExplicitlyMatch(product.name, signal.text));

  const requiredShared = Math.min(
    2,
    Math.max(1, new Set(tokenize(productCore)).size ? new Set(tokenize(productCore)).size - 1 : 1),
  );
  const trustedDomain = getDomainScore(result.url) >= 0.95;
  const brandRequirementRelaxed = canRelaxBrandRequirement(product, brandPrefix);
  let bestMatch = {
    source: null,
    text: null,
    score: 0,
    coverage: 0,
    sharedTokens: 0,
    brandMatched: false,
    quantityCompatible: true,
  };

  for (const signal of signals) {
    const candidateCore = canonicalizeProductText(signal.text);
    const coverage = tokenCoverage(productCore, candidateCore);
    const score = tokenScore(productCore, candidateCore);
    const sharedTokens = sharedTokenCount(productCore, candidateCore);
    const brandMatched = textContainsBrand(signal.text, brandPrefix);
    const quantityCompatible = quantitiesCompatible(product.name, signal.text);

    if (
      Number(brandMatched) > Number(bestMatch.brandMatched) ||
      (brandMatched === bestMatch.brandMatched &&
        Number(quantityCompatible) > Number(bestMatch.quantityCompatible)) ||
      coverage > bestMatch.coverage ||
      (coverage === bestMatch.coverage && sharedTokens > bestMatch.sharedTokens) ||
      (coverage === bestMatch.coverage && sharedTokens === bestMatch.sharedTokens && score > bestMatch.score)
    ) {
      bestMatch = {
        source: signal.source,
        text: signal.text,
        score,
        coverage,
        sharedTokens,
        brandMatched,
        quantityCompatible,
      };
    }
  }

  const brandRequirementSatisfied =
    bestMatch.brandMatched ||
    (brandRequirementRelaxed &&
      bestMatch.quantityCompatible &&
      bestMatch.sharedTokens >= requiredShared &&
      (bestMatch.coverage >= 0.8 || (trustedDomain && bestMatch.coverage >= 0.67 && bestMatch.score >= 0.5)));

  const accept =
    !hasConflictingForm &&
    !hasConflictingExplicitQuantity &&
    brandRequirementSatisfied &&
    bestMatch.quantityCompatible &&
    (bestMatch.coverage >= 0.999 && bestMatch.sharedTokens >= requiredShared) ||
    (!hasConflictingForm &&
      !hasConflictingExplicitQuantity &&
      brandRequirementSatisfied &&
      bestMatch.quantityCompatible &&
      bestMatch.coverage >= 0.8 &&
      bestMatch.sharedTokens >= requiredShared &&
      (trustedDomain || bestMatch.score >= 0.6)) ||
    (!hasConflictingForm &&
      !hasConflictingExplicitQuantity &&
      brandRequirementSatisfied &&
      bestMatch.quantityCompatible &&
      bestMatch.coverage >= 0.67 &&
      bestMatch.sharedTokens >= requiredShared + 1 &&
      trustedDomain &&
      bestMatch.score >= 0.5);

  return {
    ...bestMatch,
    accept,
  };
}

function evaluateImageSearchMatch(product, result) {
  return evaluatePageMatch(
    product,
    { title: result.title || "", url: result.pageUrl || "" },
    [result.description || ""],
  );
}

async function resolveImageCandidates(product) {
  const queries = buildSearchQueries(product);
  const candidates = [];
  const seen = new Set();

  for (const query of queries) {
    const candidateQueries = [query, `${query} buy online`, ...buildSiteSearchQueries(product, query)];
    let searchResults = [];

    for (const candidateQuery of candidateQueries) {
      const results = await searchBing(candidateQuery);
      for (const result of results) {
        if (!searchResults.some((existing) => existing.url === result.url)) {
          searchResults.push(result);
        }
      }
      if (searchResults.length >= 12) break;
    }

    const ranked = searchResults
      .map((result) => ({
        ...result,
        score:
          tokenScore(product.name, result.title) * 2.5 +
          getDomainScore(result.url) +
          tokenScore(query, result.url),
      }))
      .filter((result) => isLikelyProductPage(result.url, result.title))
      .sort((left, right) => right.score - left.score)
      .slice(0, 8);

    for (const result of ranked) {
      const extractedPage = await extractImageCandidatesFromProductPage(result.url);
      if (!extractedPage?.images?.length) continue;

      const match = evaluatePageMatch(product, result, extractedPage.pageSignals || []);
      if (!match.accept) continue;

      for (const extracted of extractedPage.images) {
        const key = `${result.url}::${extracted.imageUrl}`;
        if (seen.has(key)) continue;
        seen.add(key);
        candidates.push({
          source: new URL(result.url).hostname.replace(/^www\./, ""),
          query,
          pageUrl: result.url,
          imageUrl: extracted.imageUrl,
          referer: extracted.referer,
          matchedBy: match.source,
          matchedText: match.text,
          matchCoverage: match.coverage,
          matchScore: match.score,
        });
        if (candidates.length >= 16) return candidates;
      }
    }

    if (candidates.length > 0) continue;

    for (const candidateQuery of candidateQueries) {
      const imageResults = await searchBingImages(candidateQuery);
      for (const imageResult of imageResults) {
        const match = evaluateImageSearchMatch(product, imageResult);
        if (!match.accept) continue;

        const key = `${imageResult.pageUrl}::${imageResult.imageUrl}`;
        if (seen.has(key)) continue;
        seen.add(key);
        candidates.push({
          source: getHostname(imageResult.pageUrl) || "bing-images",
          query: candidateQuery,
          pageUrl: imageResult.pageUrl,
          imageUrl: imageResult.imageUrl,
          referer: domainReferer(imageResult.pageUrl),
          matchedBy: match.source || "bing-image",
          matchedText: match.text || imageResult.title,
          matchCoverage: match.coverage,
          matchScore: match.score,
        });
        if (candidates.length >= 16) return candidates;
      }
    }
  }

  return candidates;
}

async function saveImageFile(imageUrl, slug, referer) {
  const localFsPath = path.join(PRODUCT_IMAGE_DIR, `${slug}.jpg`);
  const { buffer } = await fetchBuffer(imageUrl, referer);
  const output = await sharp(buffer)
    .rotate()
    .resize(900, 900, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  await validateOutputImage(output);
  await fs.writeFile(localFsPath, output);
  return localFsPath;
}

async function updateProductImage(productId, imagePath) {
  const { error } = await supabase.from("products").update({ images: [imagePath] }).eq("id", productId);
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

async function processProduct(product, index, total, report) {
  const progress = `[${index + 1}/${total}]`;
  try {
    const resolvedCandidates = await resolveImageCandidates(product);
    if (resolvedCandidates.length === 0) {
      report.failed.push({ id: product.id, slug: product.slug, name: product.name, reason: "no-source-found" });
      console.log(`${progress} fail ${product.slug} no source found`);
      return;
    }

    const localDbPath = getLocalImagePath(product.slug);
    let lastError = null;

    for (const candidate of resolvedCandidates) {
      try {
        await saveImageFile(candidate.imageUrl, product.slug, candidate.referer);
        await updateProductImage(product.id, localDbPath);
        report.updated.push({
          id: product.id,
          slug: product.slug,
          name: product.name,
          categorySlug: product.categorySlug,
          localPath: localDbPath,
          source: candidate.source,
          query: candidate.query,
          pageUrl: candidate.pageUrl,
          imageUrl: candidate.imageUrl,
          matchedBy: candidate.matchedBy,
          matchedText: candidate.matchedText,
          matchCoverage: candidate.matchCoverage,
          matchScore: candidate.matchScore,
        });
        console.log(`${progress} ok ${product.slug} <- ${candidate.source}`);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    report.failed.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      reason: lastError instanceof Error ? lastError.message : String(lastError || "no-usable-image"),
    });
    console.log(`${progress} fail ${product.slug} ${String(lastError || "no usable image")}`);
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
  await loadSlugFile();

  const products = await fetchAllProducts();
  const candidates = products.filter((product) => {
    if (slugFilter.size > 0 && !slugFilter.has(product.slug)) return false;
    return force ? true : isPlaceholderImage(product.currentImage);
  });
  const selected = candidates.slice(offset, limit ? offset + limit : undefined);
  const report = {
    startedAt: new Date().toISOString(),
    totalProducts: products.length,
    candidateProducts: candidates.length,
    selectedProducts: selected.length,
    updated: [],
    failed: [],
  };
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= selected.length) return;
      await processProduct(selected[index], index, selected.length, report);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, Math.max(selected.length, 1)) }, () => worker()),
  );
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
        failed: report.failed.length,
        reportPath: REPORT_PATH,
      },
      null,
      2,
    ),
  );

  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
  }
}

main().catch(async (error) => {
  console.error(error);
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
  }
  process.exit(1);
});


