/**
 * Icon Generator Script
 * Generates PWA icons and notification badges using sharp
 *
 * Usage: node scripts/generate-icons.js
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ICON_DIR = path.join(process.cwd(), "public", "icons");
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const THEME_COLOR = "#16a34a"; // tailwind green-600

// Ensure directory exists
if (!fs.existsSync(ICON_DIR)) {
  fs.mkdirSync(ICON_DIR, { recursive: true });
}

// Base SVG template (Green background with FM text)
// A simple modern icon with rounded corners implied by maskable intent
const createBaseSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${THEME_COLOR}" rx="${size * 0.2}" ry="${size * 0.2}"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-weight="bold" 
    font-size="${size * 0.5}" 
    fill="white" 
    text-anchor="middle" 
    dy=".35em"
  >FM</text>
</svg>
`;

// Badge SVG template (Monochrome/Transparent for Android notification bar)
// Just the "FM" text outline or shape
const createBadgeSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-weight="bold" 
    font-size="${size * 0.6}" 
    fill="white" 
    text-anchor="middle" 
    dy=".35em"
  >FM</text>
</svg>
`;

async function generateIcons() {
  console.log("Generating icons...");

  // Generate main icons
  for (const size of SIZES) {
    const svg = createBaseSvg(size);
    const fileName = `icon-${size}x${size}.png`;
    const filePath = path.join(ICON_DIR, fileName);

    try {
      await sharp(Buffer.from(svg)).png().toFile(filePath);
      console.log(`Generated: ${fileName}`);
    } catch (error) {
      console.error(`Error generating ${fileName}:`, error);
    }
  }

  // Generate badge icon (small, maskable/monochrome)
  // Android uses small icons for status bar. Usually 24x24 to 96x96.
  // We'll generate a 72x72 and 96x96 version specifically for badge usage if needed,
  // or just rely on the main icon if not strictly monochrome.
  // However, the service worker references '/icons/badge-72x72.png'.

  // Badge should be white pixels on transparent background
  const badgeSize = 72;
  const badgeSvg = createBadgeSvg(badgeSize);
  const badgeFileName = `badge-${badgeSize}x${badgeSize}.png`;

  try {
    await sharp(Buffer.from(badgeSvg))
      .png()
      .toFile(path.join(ICON_DIR, badgeFileName));
    console.log(`Generated: ${badgeFileName}`);
  } catch (error) {
    console.error(`Error generating badge:`, error);
  }

  // Also generate a large badge just in case (e.g. 96x96)
  try {
    await sharp(Buffer.from(createBadgeSvg(96)))
      .png()
      .toFile(path.join(ICON_DIR, "badge-96x96.png"));
    console.log(`Generated: badge-96x96.png`);
  } catch (error) {
    console.error(`Error generating badge-96x96:`, error);
  }

  console.log("Icon generation complete!");
}

generateIcons().catch(console.error);
