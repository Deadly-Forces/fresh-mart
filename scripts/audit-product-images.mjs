import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const PRODUCT_IMAGE_DIR = path.resolve(process.cwd(), "public", "product-images");
const REPORT_PATH = path.resolve(process.cwd(), "tmp", "product-image-audit.json");

function isJpg(file) {
  return file.toLowerCase().endsWith(".jpg");
}

function getCategoryKey(file) {
  return file.split("-").slice(0, 2).join("-");
}

function isLikelyBrokenImage(stats) {
  const { entropy, sharpness, mean } = stats;
  const maxDiff = Math.max(...mean) - Math.min(...mean);

  return (
    entropy < 0.15 ||
    (entropy < 0.7 && sharpness < 0.25) ||
    (entropy < 1.2 && maxDiff < 1.5 && (mean[0] > 250 || mean[0] < 5))
  );
}

async function inspectImage(file) {
  const filePath = path.join(PRODUCT_IMAGE_DIR, file);
  const buffer = fs.readFileSync(filePath);
  const image = sharp(buffer);
  const [metadata, stats] = await Promise.all([image.metadata(), image.stats()]);

  return {
    file,
    size: buffer.length,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    entropy: Number((stats.entropy ?? 0).toFixed(3)),
    sharpness: Number((stats.sharpness ?? 0).toFixed(3)),
    mean: stats.channels.map((channel) => Number(channel.mean.toFixed(1))),
    hash: crypto.createHash("sha1").update(buffer).digest("hex"),
  };
}

async function main() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });

  const files = fs.readdirSync(PRODUCT_IMAGE_DIR).filter(isJpg);
  const inspected = [];

  for (const file of files) {
    try {
      inspected.push(await inspectImage(file));
    } catch (error) {
      inspected.push({
        file,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const broken = inspected
    .filter((item) => !item.error)
    .filter((item) =>
      isLikelyBrokenImage({
        entropy: item.entropy,
        sharpness: item.sharpness,
        mean: item.mean,
      }),
    )
    .sort((left, right) => left.entropy - right.entropy);

  const duplicateMap = new Map();
  for (const item of inspected) {
    if (item.error) continue;
    if (!duplicateMap.has(item.hash)) duplicateMap.set(item.hash, []);
    duplicateMap.get(item.hash).push(item.file);
  }

  const suspiciousDuplicates = [...duplicateMap.values()]
    .filter((group) => group.length > 1)
    .map((group) => ({
      count: group.length,
      files: group,
      categories: [...new Set(group.map(getCategoryKey))],
    }))
    .filter((group) => group.categories.length > 1 || group.count >= 5)
    .sort((left, right) => right.count - left.count);

  const report = {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    brokenCount: broken.length,
    broken,
    suspiciousDuplicateGroupCount: suspiciousDuplicates.length,
    suspiciousDuplicates,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    totalFiles: report.totalFiles,
    brokenCount: report.brokenCount,
    suspiciousDuplicateGroupCount: report.suspiciousDuplicateGroupCount,
    reportPath: REPORT_PATH,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
