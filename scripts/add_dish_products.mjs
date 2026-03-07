/**
 * Dish-Driven Product Gap Fill Script
 * 
 * Analyzes common dishes (Indian, Italian, Thai, Chinese, Baking, etc.)
 * and adds ~109 missing products across cooking-essentials, spices-seasonings,
 * and staples categories to enable customers to make complete meals.
 */
import fs from "fs";
import path from "path";

const productsPath = path.resolve(
  process.cwd(),
  "src/features/products/utils/products.json"
);

const existing = JSON.parse(fs.readFileSync(productsPath, "utf8"));
console.log(`Existing products: ${existing.length}`);

// Count existing per category
const counts = {};
existing.forEach((p) => {
  counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
});
console.log("Current counts:", counts);

const rand = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);
const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function makeProduct(name, categorySlug, price, comparePrice, unit) {
  const idx = counts[categorySlug] || 0;
  counts[categorySlug] = idx + 1;
  return {
    id: `prod-${categorySlug}-${idx}`,
    name,
    slug: slug(name),
    price,
    comparePrice: comparePrice || null,
    image: "/placeholder.svg",
    unit: unit || "pack",
    rating: rand(3.8, 4.9),
    reviewsCount: Math.floor(Math.random() * 200) + 10,
    categorySlug,
  };
}

// ─── COOKING ESSENTIALS (42 new) ───
// Needed for: Thai curry, Kerala curry, pizza, pasta, baking, Chinese,
// breakfast, soups, desserts, street food, Japanese
const cookingEssentials = [
  // Thai/South Indian curries
  makeProduct("KLF Coconut Milk 400ml", "cooking-essentials", 99, 129, "can"),
  makeProduct("Dabur Coconut Cream 200ml", "cooking-essentials", 125, 149, "pack"),
  // Breakfast / Sandwiches
  makeProduct("Pintola Peanut Butter Creamy 350g", "cooking-essentials", 299, 349, "jar"),
  makeProduct("MyFitness Peanut Butter Crunchy 350g", "cooking-essentials", 319, 369, "jar"),
  makeProduct("Kissan Mixed Fruit Jam 500g", "cooking-essentials", 129, 155, "jar"),
  makeProduct("Kissan Strawberry Jam 500g", "cooking-essentials", 149, 179, "jar"),
  makeProduct("Stute Orange Marmalade 340g", "cooking-essentials", 159, 199, "jar"),
  // Baking (cookies, cakes, muffins)
  makeProduct("Morde Chocolate Chips 100g", "cooking-essentials", 199, 249, "pack"),
  makeProduct("Morde Dark Cooking Chocolate 200g", "cooking-essentials", 249, 299, "bar"),
  makeProduct("Morde White Chocolate Chips 100g", "cooking-essentials", 219, 265, "pack"),
  makeProduct("Bakersville Sprinkles Rainbow 100g", "cooking-essentials", 89, 119, "pack"),
  makeProduct("Weikfield Cream of Tartar 50g", "cooking-essentials", 149, 179, "pack"),
  // Frying / Breading (cutlets, patties)
  makeProduct("Urban Platter Bread Crumbs 200g", "cooking-essentials", 89, 109, "pack"),
  makeProduct("Urban Platter Panko Bread Crumbs 200g", "cooking-essentials", 149, 179, "pack"),
  // Pizza & Pasta sauces
  makeProduct("Del Monte Pizza Sauce 315g", "cooking-essentials", 99, 129, "bottle"),
  makeProduct("Del Monte Pasta Sauce Arrabiata 395g", "cooking-essentials", 149, 179, "bottle"),
  makeProduct("Barilla Pesto Sauce 190g", "cooking-essentials", 199, 249, "jar"),
  makeProduct("Ragu Alfredo Pasta Sauce 400g", "cooking-essentials", 179, 219, "jar"),
  // Asian sauces (Chinese, Thai, Japanese)
  makeProduct("Ching's Oyster Sauce 250g", "cooking-essentials", 159, 189, "bottle"),
  makeProduct("Kikkoman Teriyaki Sauce 250ml", "cooking-essentials", 179, 219, "bottle"),
  makeProduct("Lea & Perrins Worcestershire Sauce 150ml", "cooking-essentials", 129, 159, "bottle"),
  makeProduct("Tiparos Fish Sauce 200ml", "cooking-essentials", 139, 169, "bottle"),
  makeProduct("Ching's Sweet Chili Sauce 200g", "cooking-essentials", 129, 159, "bottle"),
  makeProduct("Kikkoman Mirin Rice Wine 150ml", "cooking-essentials", 249, 299, "bottle"),
  // Soups & Gravies
  makeProduct("Knorr Vegetable Stock Cubes 20g x4", "cooking-essentials", 79, 99, "pack"),
  makeProduct("Maggi Chicken Stock Cubes 20g x4", "cooking-essentials", 85, 105, "pack"),
  // Biryani & Desserts
  makeProduct("Dabur Rose Water 250ml", "cooking-essentials", 59, 75, "bottle"),
  makeProduct("Hamdard Kewra Water 100ml", "cooking-essentials", 49, 65, "bottle"),
  // Syrups
  makeProduct("Tate & Lyle Golden Syrup 325g", "cooking-essentials", 229, 279, "tin"),
  makeProduct("Maple Joe Pure Maple Syrup 250ml", "cooking-essentials", 399, 479, "bottle"),
  // Condensed/Evaporated Milk
  makeProduct("Nestle Milkmaid Condensed Milk 400g", "cooking-essentials", 95, 115, "tin"),
  makeProduct("Nestle Everyday Evaporated Milk 200ml", "cooking-essentials", 89, 109, "pack"),
  // Food Colors (biryani, sweets)
  makeProduct("Rajesh Masala Food Color Red 10g", "cooking-essentials", 29, 39, "pack"),
  makeProduct("Rajesh Masala Food Color Yellow 10g", "cooking-essentials", 29, 39, "pack"),
  makeProduct("Rajesh Masala Food Color Green 10g", "cooking-essentials", 29, 39, "pack"),
  // Thickening / Utility
  makeProduct("Weikfield Cornstarch 100g", "cooking-essentials", 49, 65, "pack"),
  makeProduct("Urban Platter Arrowroot Powder 200g", "cooking-essentials", 69, 89, "pack"),
  makeProduct("ReaLemon Lemon Juice 200ml", "cooking-essentials", 79, 99, "bottle"),
  makeProduct("Dabur Glucose Powder 500g", "cooking-essentials", 129, 155, "pack"),
  // Chutneys & Dips (ready-made)
  makeProduct("Ching's Green Chilli Sauce 200g", "cooking-essentials", 69, 85, "bottle"),
  makeProduct("Smith & Jones Mint Sauce 220g", "cooking-essentials", 69, 89, "bottle"),
  makeProduct("Nilon's Tamarind Chutney 180g", "cooking-essentials", 59, 75, "bottle"),
];

// ─── SPICES & SEASONINGS (35 new) ───
// Needed for: Dal tadka (hing!), tandoori, kadai, fish curry, pickles,
// biryani, South Indian, Maharashtrian, chaat, street food
const spicesSeasonings = [
  // CRITICAL — used in almost every dal
  makeProduct("LG Hing (Asafoetida) Powder 50g", "spices-seasonings", 99, 129, "pack"),
  // Dish-specific masalas
  makeProduct("MDH Tandoori Masala 100g", "spices-seasonings", 65, 85, "pack"),
  makeProduct("Everest Kadai Masala 100g", "spices-seasonings", 69, 89, "pack"),
  makeProduct("Everest Fish Masala 50g", "spices-seasonings", 65, 85, "pack"),
  makeProduct("MDH Paneer Masala 100g", "spices-seasonings", 65, 85, "pack"),
  makeProduct("MDH Egg Curry Masala 100g", "spices-seasonings", 59, 79, "pack"),
  makeProduct("MDH Chicken Masala 100g", "spices-seasonings", 75, 95, "pack"),
  makeProduct("Everest Chana Masala 100g", "spices-seasonings", 59, 79, "pack"),
  makeProduct("Everest Rasam Powder 100g", "spices-seasonings", 59, 79, "pack"),
  makeProduct("MTR Coconut Chutney Powder 100g", "spices-seasonings", 69, 89, "pack"),
  // Pickles (essential with every Indian meal)
  makeProduct("Mother's Recipe Mango Pickle 300g", "spices-seasonings", 89, 109, "jar"),
  makeProduct("Mother's Recipe Mixed Pickle 300g", "spices-seasonings", 95, 119, "jar"),
  makeProduct("Priya Lime Pickle 300g", "spices-seasonings", 85, 105, "jar"),
  makeProduct("Priya Garlic Pickle 300g", "spices-seasonings", 99, 125, "jar"),
  // Whole spices for biryani/pulao
  makeProduct("Catch Black Cardamom 25g", "spices-seasonings", 149, 179, "pack"),
  makeProduct("Catch Mace Javitri 10g", "spices-seasonings", 189, 229, "pack"),
  makeProduct("Catch Shahi Jeera (Caraway Seeds) 50g", "spices-seasonings", 129, 159, "pack"),
  makeProduct("Catch Nigella Seeds (Kalonji) 100g", "spices-seasonings", 59, 79, "pack"),
  // Seeds
  makeProduct("Catch White Sesame Seeds 100g", "spices-seasonings", 69, 89, "pack"),
  makeProduct("Catch Black Sesame Seeds 100g", "spices-seasonings", 79, 99, "pack"),
  // Powders for chaat/chutneys
  makeProduct("Everest Amchur (Dry Mango) Powder 100g", "spices-seasonings", 55, 69, "pack"),
  makeProduct("Catch Anardana Powder 100g", "spices-seasonings", 79, 99, "pack"),
  makeProduct("MDH Pickle Masala (Achar) 100g", "spices-seasonings", 59, 79, "pack"),
  makeProduct("MDH Pani Puri Masala 100g", "spices-seasonings", 49, 65, "pack"),
  makeProduct("Catch Jaljeera Powder 100g", "spices-seasonings", 45, 59, "pack"),
  // Whole dried chillies
  makeProduct("Whole Dried Red Chillies 100g", "spices-seasonings", 69, 89, "pack"),
  makeProduct("Kashmiri Dried Red Chillies 100g", "spices-seasonings", 149, 179, "pack"),
  // Regional masalas (Maharashtrian, Kolhapuri, Pahadi, etc.)
  makeProduct("Everest Curry Powder 100g", "spices-seasonings", 65, 85, "pack"),
  makeProduct("Bedekar Goda Masala 100g", "spices-seasonings", 79, 99, "pack"),
  makeProduct("Everest Kolhapuri Masala 100g", "spices-seasonings", 85, 109, "pack"),
  makeProduct("Pahadi Masala Blend 100g", "spices-seasonings", 89, 109, "pack"),
  makeProduct("MDH Achari Masala 100g", "spices-seasonings", 69, 89, "pack"),
  makeProduct("Jeeravan Powder (Indori) 100g", "spices-seasonings", 55, 69, "pack"),
  // South Indian
  makeProduct("MTR Puliogare Paste 200g", "spices-seasonings", 89, 109, "pack"),
  makeProduct("MTR Bisibelebath Paste 200g", "spices-seasonings", 89, 109, "pack"),
];

// ─── STAPLES (32 new) ───
// Needed for: Millet rotis, health bowls, fasting food,
// snack toppings, Thai/Chinese noodles, baking extras
const staples = [
  // Millet flours (healthy rotis)
  makeProduct("24 Mantra Ragi Flour 500g", "staples", 79, 99, "pack"),
  makeProduct("24 Mantra Jowar Flour 500g", "staples", 69, 89, "pack"),
  makeProduct("24 Mantra Bajra Flour 500g", "staples", 65, 85, "pack"),
  makeProduct("Sattu Flour (Roasted Gram) 500g", "staples", 89, 109, "pack"),
  makeProduct("Rajgira Kuttu Atta (Buckwheat) 500g", "staples", 99, 125, "pack"),
  makeProduct("Singhara Atta (Water Chestnut) 200g", "staples", 119, 149, "pack"),
  // Coconut / Tamarind
  makeProduct("KLF Desiccated Coconut 100g", "staples", 99, 119, "pack"),
  makeProduct("Maggi Tamarind Block 200g", "staples", 49, 65, "pack"),
  // Super Seeds (smoothies, salad, baking)
  makeProduct("True Elements Quinoa 500g", "staples", 299, 369, "pack"),
  makeProduct("True Elements Chia Seeds 200g", "staples", 249, 299, "pack"),
  makeProduct("True Elements Flax Seeds 200g", "staples", 169, 199, "pack"),
  makeProduct("True Elements Pumpkin Seeds 200g", "staples", 199, 249, "pack"),
  makeProduct("True Elements Sunflower Seeds 200g", "staples", 149, 179, "pack"),
  makeProduct("True Elements Watermelon Seeds 200g", "staples", 179, 219, "pack"),
  // Special noodles/pasta
  makeProduct("San Remo Lasagna Sheets 250g", "staples", 199, 249, "pack"),
  makeProduct("Ching's Egg Noodles 200g", "staples", 49, 65, "pack"),
  makeProduct("Thai Kitchen Rice Noodles 200g", "staples", 89, 109, "pack"),
  makeProduct("Glass Noodles (Bean Thread) 100g", "staples", 99, 125, "pack"),
  // Fasting foods (Navratri, Ekadashi)
  makeProduct("Sabudana (Sago/Tapioca Pearls) 500g", "staples", 69, 85, "pack"),
  makeProduct("Makhana (Fox Nuts) 100g", "staples", 199, 249, "pack"),
  // Puffed / Flattened (Chaat, snack bases)
  makeProduct("MRM Murmura (Puffed Rice) 500g", "staples", 35, 45, "pack"),
  makeProduct("Haldiram's Sev 200g", "staples", 55, 69, "pack"),
  // Papad (accompaniment to every meal)
  makeProduct("Lijjat Urad Papad 200g", "staples", 69, 85, "pack"),
  makeProduct("Lijjat Moong Papad 200g", "staples", 65, 79, "pack"),
  makeProduct("MTR Appalam 200g", "staples", 49, 65, "pack"),
  makeProduct("Fryums Star Shape 200g", "staples", 45, 59, "pack"),
  // Healthy Rice varieties
  makeProduct("24 Mantra Red Rice 1kg", "staples", 149, 179, "kg"),
  makeProduct("Organic Bamboo Rice 500g", "staples", 249, 299, "pack"),
  // Fine rava / baby food
  makeProduct("Aashirvaad Rava Fine 500g", "staples", 55, 69, "pack"),
  makeProduct("Sprouted Ragi Malt 200g", "staples", 129, 159, "pack"),
  // Ready Chivda
  makeProduct("Haldiram's Cornflakes Chivda 200g", "staples", 89, 109, "pack"),
  // Mixed Millet
  makeProduct("Multi Millet Flour Mix 500g", "staples", 119, 149, "pack"),
];

const newProducts = [...cookingEssentials, ...spicesSeasonings, ...staples];

console.log(`\nNew products to add: ${newProducts.length}`);
console.log(
  `  cooking-essentials: ${cookingEssentials.length}`,
  `\n  spices-seasonings: ${spicesSeasonings.length}`,
  `\n  staples: ${staples.length}`
);

// Check for duplicate slugs
const existingSlugs = new Set(existing.map((p) => p.slug));
const dupes = newProducts.filter((p) => existingSlugs.has(p.slug));
if (dupes.length > 0) {
  console.warn(`\nWARNING: ${dupes.length} duplicate slugs found, will skip:`);
  dupes.forEach((d) => console.warn(`  - ${d.name} (${d.slug})`));
}

const toAdd = newProducts.filter((p) => !existingSlugs.has(p.slug));
const updated = [...existing, ...toAdd];

fs.writeFileSync(productsPath, JSON.stringify(updated, null, 2));
console.log(
  `\nDone! Added ${toAdd.length} new products. Total: ${updated.length}`
);
