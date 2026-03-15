import fs from "fs/promises";
import path from "path";

const AUDIT_PATH = path.resolve(process.cwd(), "tmp", "product-image-audit.json");
const OUTPUT_PATH = path.resolve(process.cwd(), "tmp", "visual-repair-slugs.txt");
const INCLUDE_GROUP_INDICES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
const EXTRA_FILES = [
  "household-syska-led-tube-light-22w-163.jpg",
  "baby-care-pigeon-silicone-nipple-m-98.jpg",
  "baby-care-pigeon-silicone-nipple-s-97.jpg",
  "baby-care-pigeon-training-cup-200ml-184.jpg",
  "cooking-essentials-weikfield-dessert-gel-agar-agar-25g-157.jpg",
  "cooking-essentials-weikfield-gelatin-powder-25g-189.jpg",
];

function toSlug(file) {
  return file.replace(/\.jpg$/i, "");
}

async function main() {
  const audit = JSON.parse(await fs.readFile(AUDIT_PATH, "utf8"));
  const slugs = new Set(EXTRA_FILES.map(toSlug));

  for (const [index, group] of (audit.suspiciousDuplicates || []).entries()) {
    const groupIndex = index + 1;
    if (!INCLUDE_GROUP_INDICES.has(groupIndex)) continue;
    for (const file of group.files || []) {
      slugs.add(toSlug(file));
    }
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  const ordered = [...slugs].sort();
  await fs.writeFile(OUTPUT_PATH, `${ordered.join("\n")}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        outputPath: OUTPUT_PATH,
        slugCount: ordered.length,
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
