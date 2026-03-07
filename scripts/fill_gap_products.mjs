// Fill remaining gap to exactly 200 per category
// cooking-essentials needs 8 more, spices-seasonings needs 14 more, staples needs 11 more

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const productsPath = join(__dirname, '..', 'src', 'features', 'products', 'utils', 'products.json');

const existing = JSON.parse(readFileSync(productsPath, 'utf-8'));
const existingNames = new Set(existing.map(p => p.name.toLowerCase()));
const existingSlugs = new Set(existing.map(p => p.slug));

// Get current counts per category
const counts = {};
existing.forEach(p => { counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1; });

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function makeProduct(cat, index, name, price, comparePrice, unit) {
  const slug = `${cat}-${slugify(name)}-${index}`;
  return {
    id: `prod-${cat}-${index}`,
    name,
    slug,
    price,
    comparePrice,
    image: '/placeholder.svg',
    unit,
    rating: +(3.8 + Math.random() * 1.2).toFixed(1),
    reviewsCount: Math.floor(30 + Math.random() * 200),
    categorySlug: cat,
  };
}

// Extra products for each category (more than needed to account for any duplicates)
const extras = {
  'cooking-essentials': [
    ['Sundrop Superlite Advanced Sunflower Oil 1L', 150, 180, 'L'],
    ['Emami Healthy & Tasty Rice Bran Oil 1L', 135, 162, 'L'],
    ['Mother Dairy Cow Ghee 1L', 550, 650, 'L'],
    ['Tata Tea Gold Honey Jar 250g', 165, 200, 'g'],
    ['Del Monte Sweet Corn Cream Style 420g', 85, 105, 'g'],
    ['Maggi Bhuna Masala 65g', 30, 38, 'g'],
    ['Veeba Mint Mayonnaise 250g', 89, 110, 'g'],
    ['Cremica Salsa Dip 200g', 85, 105, 'g'],
    ['Funfoods Pasta and Pizza Sauce 325g', 82, 100, 'g'],
    ['Wingreens Farms Achaari Dip 150g', 89, 110, 'g'],
  ],
  'spices-seasonings': [
    ['MDH Butter Chicken Masala 100g', 62, 76, 'g'],
    ['MDH Kadhahi Masala 100g', 55, 68, 'g'],
    ['MDH Loyalty Haldi Powder 500g', 85, 105, 'g'],
    ['Everest Pepper Coriander Powder 100g', 42, 52, 'g'],
    ['Everest Royal Garam Masala 200g', 125, 150, 'g'],
    ['Aachi Chicken 65 Masala 50g', 35, 44, 'g'],
    ['Aachi Kulambu Chilli Powder 100g', 42, 52, 'g'],
    ['Eastern Turmeric Powder 100g', 38, 48, 'g'],
    ['Eastern Chilli Powder 100g', 42, 52, 'g'],
    ['Eastern Garam Masala 100g', 52, 65, 'g'],
    ['Suhana Vada Pav Chutney Powder 100g', 38, 48, 'g'],
    ['Suhana Medu Vada Mix 200g', 65, 80, 'g'],
    ['Catch Turmeric Powder 500g', 95, 115, 'g'],
    ['Catch Coriander Cumin Powder 100g', 42, 52, 'g'],
    ['Urban Platter Harissa Seasoning 100g', 185, 220, 'g'],
    ['Urban Platter Garam Masala Premium 100g', 135, 165, 'g'],
  ],
  'staples': [
    ['bb Royal Suji (Semolina) Coarse 1kg', 52, 65, 'kg'],
    ['bb Royal Multi Millet Dosa Mix 500g', 85, 105, 'g'],
    ['bb Royal Ragi Vermicelli 180g', 32, 40, 'g'],
    ['bb Royal Barnyard Millet (Sanwa) 500g', 95, 115, 'g'],
    ['bb Royal Little Millet (Kutki) 500g', 88, 108, 'g'],
    ['bb Royal Foxtail Millet (Kangni) 500g', 92, 112, 'g'],
    ['bb Royal Kodo Millet 500g', 85, 105, 'g'],
    ['bb Royal Browntop Millet 500g', 98, 118, 'g'],
    ['Aashirvaad Instant Mix Ragi Dosa 200g', 55, 68, 'g'],
    ['Gits Instant Mix Medu Vada 200g', 52, 65, 'g'],
    ['Gits Rava Idli Mix 500g', 78, 95, 'g'],
    ['MTR Multigrain Dosa Mix 500g', 82, 100, 'g'],
    ['MTR Ready Mix Rava Upma 200g', 48, 60, 'g'],
  ],
};

const newProducts = [];

for (const [cat, items] of Object.entries(extras)) {
  const needed = 200 - (counts[cat] || 0);
  let added = 0;
  let idx = counts[cat] || 0;
  
  for (const [name, price, comparePrice, unit] of items) {
    if (added >= needed) break;
    
    if (existingNames.has(name.toLowerCase())) {
      console.log(`  SKIP (dup name): ${name}`);
      continue;
    }
    
    const product = makeProduct(cat, idx, name, price, comparePrice, unit);
    if (existingSlugs.has(product.slug)) {
      console.log(`  SKIP (dup slug): ${product.slug}`);
      continue;
    }
    
    newProducts.push(product);
    existingNames.add(name.toLowerCase());
    existingSlugs.add(product.slug);
    idx++;
    added++;
  }
  
  console.log(`${cat}: added ${added} more (needed ${needed})`);
}

const allProducts = [...existing, ...newProducts];
writeFileSync(productsPath, JSON.stringify(allProducts, null, 2));

// Final counts
const finalCounts = {};
allProducts.forEach(p => { finalCounts[p.categorySlug] = (finalCounts[p.categorySlug] || 0) + 1; });
console.log('\nFinal counts:');
Object.entries(finalCounts).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log(`  TOTAL: ${allProducts.length}`);

// Verify no duplicates
const allSlugs = allProducts.map(p => p.slug);
const uniqueSlugs = new Set(allSlugs);
console.log(`\nUnique slugs: ${uniqueSlugs.size} / ${allSlugs.length}`);
if (uniqueSlugs.size !== allSlugs.length) {
  console.error('ERROR: Duplicate slugs found!');
  process.exit(1);
} else {
  console.log('No duplicates found.');
}
