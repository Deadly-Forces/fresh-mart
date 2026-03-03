const fs = require("fs");
const path = require("path");

const CATEGORIES = [
  { title: "Vegetables", slug: "vegetables" },
  { title: "Fruits", slug: "fruits" },
  { title: "Dairy & Eggs", slug: "dairy-eggs" },
  { title: "Bakery", slug: "bakery" },
  { title: "Meat & Seafood", slug: "meat-seafood" },
  { title: "Snacks", slug: "snacks" },
  { title: "Beverages", slug: "beverages" },
  { title: "Personal Care", slug: "personal-care" },
  { title: "Household", slug: "household" },
  { title: "Baby Care", slug: "baby-care" },
];

const BRANDS = {
  vegetables: [
    "Fresh Farm",
    "Organic India",
    "Nature's Basket",
    "24 Mantra",
    "Pro Nature",
    "Fresho",
    "BB Royal",
    "Safe Harvest",
    "Qualimax",
    "Kisan",
  ],
  fruits: [
    "Fresho",
    "Kimaye",
    "Dole",
    "Del Monte",
    "Natures Basket",
    "Farm Fresh",
    "Hapus King",
    "Fruit Basket",
    "INI Farms",
    "GreenBerry",
  ],
  "dairy-eggs": [
    "Amul",
    "Mother Dairy",
    "Nestle",
    "Britannia",
    "Milky Mist",
    "Parag",
    "Epigamia",
    "Country Delight",
    "Nandini",
    "Chitale",
    "Verka",
    "GO",
  ],
  bakery: [
    "Britannia",
    "Modern Bread",
    "Bonn",
    "English Oven",
    "Harvest Gold",
    "Theobroma",
    "WinGreens",
    "L'Exclusif",
    "Frontier",
    "The Baker's Dozen",
  ],
  "meat-seafood": [
    "Licious",
    "FreshToHome",
    "TenderCuts",
    "ZappFresh",
    "Star Meat",
    "Captain Fresh",
    "ITC Master Chef",
    "Prasuma",
    "Godrej Real Good",
    "Zorabian",
  ],
  snacks: [
    "Lay's",
    "Haldiram's",
    "Bingo",
    "Kurkure",
    "Parle",
    "Britannia",
    "Too Yumm",
    "Act II",
    "Balaji",
    "Bikaji",
    "Cornitos",
    "Crax",
  ],
  beverages: [
    "Coca-Cola",
    "Thums Up",
    "Tropicana",
    "Real",
    "Paper Boat",
    "Bisleri",
    "Tata Tea",
    "Nescafe",
    "Dabur",
    "Frooti",
    "Appy Fizz",
    "Raw Pressery",
  ],
  "personal-care": [
    "Dove",
    "Pantene",
    "Colgate",
    "Himalaya",
    "Nivea",
    "Garnier",
    "Biotique",
    "Mamaearth",
    "WOW",
    "Pears",
    "Medimix",
    "Park Avenue",
  ],
  household: [
    "Surf Excel",
    "Vim",
    "Harpic",
    "Lizol",
    "Scotch-Brite",
    "Godrej",
    "Prestige",
    "Swachh",
    "Pril",
    "Colin",
    "Odonil",
    "Nirma",
  ],
  "baby-care": [
    "Huggies",
    "Pampers",
    "Himalaya Baby",
    "Johnson's",
    "MamyPoko",
    "Cetaphil Baby",
    "Mamaearth Baby",
    "Dabur Baby",
    "Chicco",
    "Pigeon",
    "Sebamed Baby",
    "Luvlap",
  ],
};

const CATEGORY_ITEMS = {
  vegetables: [
    "Baby Carrots 500g",
    "Broccoli 1pc",
    "Palak (Spinach) 250g",
    "Aloo (Potatoes) 1kg",
    "Pyaaz (Onions) 1kg",
    "Tamatar (Tomatoes) 500g",
    "Shimla Mirch (Capsicum) 500g",
    "Cucumber (Kheera) 500g",
    "Methi (Fenugreek) 250g",
    "Bhindi (Okra) 500g",
    "Turai (Ridge Gourd) 500g",
    "Patta Gobi (Cabbage) 1pc",
  ],
  fruits: [
    "Kela (Bananas) 1 dozen",
    "Santra (Oranges) 1kg",
    "Strawberries 200g",
    "Angoor (Grapes) 500g",
    "Blueberries 125g",
    "Alphonso Mango 1kg",
    "Ananas (Pineapple) 1pc",
    "Tarbooz (Watermelon) 1pc",
    "Nimbu (Lemons) 500g",
    "Aadu (Peach) 500g",
    "Nashpati (Pears) 500g",
    "Apple (Seb) 1kg",
  ],
  "dairy-eggs": [
    "Full Cream Milk 1L",
    "Eggs 12pcs",
    "Cheese Block 200g",
    "Butter 500g",
    "Dahi (Curd) 400g",
    "Paneer 200g",
    "Cream 200ml",
    "Shredded Cheese 200g",
    "Chaach (Buttermilk) 1L",
    "Lassi 200ml",
    "Ghee 500ml",
    "Flavoured Yogurt 100g",
  ],
  bakery: [
    "Brown Bread 400g",
    "Butter Croissant 4pcs",
    "Pav (Bread Rolls) 6pcs",
    "French Baguette 1pc",
    "Muffins 4pcs",
    "Khari Biscuit 200g",
    "White Bread 400g",
    "Whole Wheat Rusk 300g",
    "Dinner Rolls 6pcs",
    "Cookies 200g",
    "Cake Slice 1pc",
    "Puff Pastry 4pcs",
  ],
  "meat-seafood": [
    "Chicken Breast 500g",
    "Mutton Curry Cut 500g",
    "Salmon Fillet 250g",
    "Chicken Drumsticks 500g",
    "Prawns (Jhinga) 500g",
    "Surmai (Kingfish) 500g",
    "Rohu Fish 1kg",
    "Chicken Keema 500g",
    "Seekh Kebab 500g",
    "Pomfret 500g",
    "Rawas (Indian Salmon) 500g",
    "Eggs 30pcs Tray",
  ],
  snacks: [
    "Potato Chips 130g",
    "Namkeen Mixture 400g",
    "Cheese Crackers 120g",
    "Aloo Bhujia 400g",
    "Monaco Biscuit 200g",
    "Cream Biscuits 120g",
    "Granola Bar 6pcs",
    "Khakhra 200g",
    "Roasted Peanuts 200g",
    "Fruit Snacks 200g",
    "Makhana (Fox Nuts) 100g",
    "Mathri 250g",
  ],
  beverages: [
    "Orange Juice 1L",
    "Mango Juice 1L",
    "Soda 750ml",
    "Cola 2L",
    "Filter Coffee 200g",
    "Green Tea 25 bags",
    "Iced Tea 400ml",
    "Energy Drink 250ml",
    "Coconut Water 1L",
    "Nimbu Pani (Lemonade) 1L",
    "Aam Panna 750ml",
    "Packaged Water 1L",
  ],
  "personal-care": [
    "Body Wash 250ml",
    "Shampoo 340ml",
    "Conditioner 180ml",
    "Toothpaste 150g",
    "Toothbrush 2pcs",
    "Deodorant 150ml",
    "Body Lotion 400ml",
    "Face Wash 150ml",
    "Shaving Cream 70g",
    "Razor Cartridge 4pcs",
    "Mouthwash 250ml",
    "Bathing Soap 4pcs",
  ],
  household: [
    "Kitchen Towel 2 Rolls",
    "Toilet Paper 10 Rolls",
    "Liquid Detergent 1L",
    "Dishwash Liquid 750ml",
    "Garbage Bags 30pcs",
    "Scrub Pad 3pcs",
    "Glass Cleaner 500ml",
    "Floor Cleaner 1L",
    "Aluminium Foil 9m",
    "Zip Lock Bags 25pcs",
    "Tissue Box 100 pulls",
    "AA Batteries 4pcs",
  ],
  "baby-care": [
    "Baby Diapers Small 46pcs",
    "Baby Diapers Large 34pcs",
    "Baby Wipes 72pcs",
    "Infant Formula 400g",
    "Baby Cereal 300g",
    "Baby Wash 200ml",
    "Baby Lotion 200ml",
    "Diaper Rash Cream 50g",
    "Baby Pacifier 2pcs",
    "Baby Feeding Bottle 250ml",
    "Baby Puffs Snack 40g",
    "Gripe Water 130ml",
  ],
};

// Realistic Indian market prices (₹) for each item — based on 2025 Indian grocery market rates
const ITEM_PRICES = {
  vegetables: {
    "Baby Carrots 500g": 45,
    "Broccoli 1pc": 55,
    "Palak (Spinach) 250g": 25,
    "Aloo (Potatoes) 1kg": 40,
    "Pyaaz (Onions) 1kg": 35,
    "Tamatar (Tomatoes) 500g": 30,
    "Shimla Mirch (Capsicum) 500g": 60,
    "Cucumber (Kheera) 500g": 25,
    "Methi (Fenugreek) 250g": 20,
    "Bhindi (Okra) 500g": 40,
    "Turai (Ridge Gourd) 500g": 35,
    "Patta Gobi (Cabbage) 1pc": 30,
  },
  fruits: {
    "Kela (Bananas) 1 dozen": 50,
    "Santra (Oranges) 1kg": 80,
    "Strawberries 200g": 120,
    "Angoor (Grapes) 500g": 75,
    "Blueberries 125g": 250,
    "Alphonso Mango 1kg": 350,
    "Ananas (Pineapple) 1pc": 60,
    "Tarbooz (Watermelon) 1pc": 50,
    "Nimbu (Lemons) 500g": 40,
    "Aadu (Peach) 500g": 120,
    "Nashpati (Pears) 500g": 100,
    "Apple (Seb) 1kg": 160,
  },
  "dairy-eggs": {
    "Full Cream Milk 1L": 68,
    "Eggs 12pcs": 84,
    "Cheese Block 200g": 120,
    "Butter 500g": 275,
    "Dahi (Curd) 400g": 50,
    "Paneer 200g": 90,
    "Cream 200ml": 65,
    "Shredded Cheese 200g": 140,
    "Chaach (Buttermilk) 1L": 40,
    "Lassi 200ml": 30,
    "Ghee 500ml": 350,
    "Flavoured Yogurt 100g": 40,
  },
  bakery: {
    "Brown Bread 400g": 45,
    "Butter Croissant 4pcs": 120,
    "Pav (Bread Rolls) 6pcs": 30,
    "French Baguette 1pc": 80,
    "Muffins 4pcs": 150,
    "Khari Biscuit 200g": 50,
    "White Bread 400g": 40,
    "Whole Wheat Rusk 300g": 60,
    "Dinner Rolls 6pcs": 55,
    "Cookies 200g": 75,
    "Cake Slice 1pc": 90,
    "Puff Pastry 4pcs": 65,
  },
  "meat-seafood": {
    "Chicken Breast 500g": 200,
    "Mutton Curry Cut 500g": 450,
    "Salmon Fillet 250g": 550,
    "Chicken Drumsticks 500g": 160,
    "Prawns (Jhinga) 500g": 400,
    "Surmai (Kingfish) 500g": 500,
    "Rohu Fish 1kg": 250,
    "Chicken Keema 500g": 220,
    "Seekh Kebab 500g": 350,
    "Pomfret 500g": 600,
    "Rawas (Indian Salmon) 500g": 480,
    "Eggs 30pcs Tray": 195,
  },
  snacks: {
    "Potato Chips 130g": 40,
    "Namkeen Mixture 400g": 120,
    "Cheese Crackers 120g": 45,
    "Aloo Bhujia 400g": 110,
    "Monaco Biscuit 200g": 40,
    "Cream Biscuits 120g": 30,
    "Granola Bar 6pcs": 250,
    "Khakhra 200g": 70,
    "Roasted Peanuts 200g": 60,
    "Fruit Snacks 200g": 80,
    "Makhana (Fox Nuts) 100g": 120,
    "Mathri 250g": 75,
  },
  beverages: {
    "Orange Juice 1L": 120,
    "Mango Juice 1L": 99,
    "Soda 750ml": 40,
    "Cola 2L": 95,
    "Filter Coffee 200g": 220,
    "Green Tea 25 bags": 160,
    "Iced Tea 400ml": 50,
    "Energy Drink 250ml": 125,
    "Coconut Water 1L": 60,
    "Nimbu Pani (Lemonade) 1L": 55,
    "Aam Panna 750ml": 70,
    "Packaged Water 1L": 20,
  },
  "personal-care": {
    "Body Wash 250ml": 225,
    "Shampoo 340ml": 250,
    "Conditioner 180ml": 199,
    "Toothpaste 150g": 99,
    "Toothbrush 2pcs": 80,
    "Deodorant 150ml": 199,
    "Body Lotion 400ml": 299,
    "Face Wash 150ml": 175,
    "Shaving Cream 70g": 85,
    "Razor Cartridge 4pcs": 350,
    "Mouthwash 250ml": 110,
    "Bathing Soap 4pcs": 160,
  },
  household: {
    "Kitchen Towel 2 Rolls": 120,
    "Toilet Paper 10 Rolls": 350,
    "Liquid Detergent 1L": 199,
    "Dishwash Liquid 750ml": 130,
    "Garbage Bags 30pcs": 99,
    "Scrub Pad 3pcs": 60,
    "Glass Cleaner 500ml": 130,
    "Floor Cleaner 1L": 175,
    "Aluminium Foil 9m": 85,
    "Zip Lock Bags 25pcs": 99,
    "Tissue Box 100 pulls": 75,
    "AA Batteries 4pcs": 120,
  },
  "baby-care": {
    "Baby Diapers Small 46pcs": 699,
    "Baby Diapers Large 34pcs": 799,
    "Baby Wipes 72pcs": 199,
    "Infant Formula 400g": 599,
    "Baby Cereal 300g": 250,
    "Baby Wash 200ml": 199,
    "Baby Lotion 200ml": 175,
    "Diaper Rash Cream 50g": 199,
    "Baby Pacifier 2pcs": 250,
    "Baby Feeding Bottle 250ml": 349,
    "Baby Puffs Snack 40g": 199,
    "Gripe Water 130ml": 120,
  },
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const products = [];
const PRODUCTS_PER_CATEGORY = 200;
const MODIFIERS = [
  "Premium",
  "Classic",
  "Organic",
  "Value Pack",
  "Family Size",
  "Mini",
  "Extra Fresh",
  "Select",
  "Natural",
  "Original",
  "Lite",
  "Jumbo",
  "Deluxe",
  "Choice",
  "Harvest",
  "Farm Fresh",
  "Hand-Picked",
  "Sun-Ripened",
];

const usedNames = new Set();

CATEGORIES.forEach((category) => {
  const items = CATEGORY_ITEMS[category.slug] || ["Item"];
  const brands = BRANDS[category.slug] || ["Generic"];

  for (let i = 0; i < PRODUCTS_PER_CATEGORY; i++) {
    let seed = hashString(`${category.slug}-${i}`);
    let randomName = "";
    let attempts = 0;

    // Loop until we find a unique name
    while (true) {
      const brandInstance =
        brands[Math.floor(seededRandom(seed) * brands.length)];
      const itemInstance =
        items[Math.floor(seededRandom(seed + 1) * items.length)];
      // Add a modifier after exhausting base combos to ensure uniqueness
      if (attempts > 0) {
        const mod =
          MODIFIERS[Math.floor(seededRandom(seed + 10) * MODIFIERS.length)];
        randomName = `${brandInstance} ${mod} ${itemInstance}`;
      } else {
        randomName = `${brandInstance} ${itemInstance}`;
      }

      if (!usedNames.has(randomName)) {
        usedNames.add(randomName);
        break;
      }
      // If duplicate, adjust seed deterministically to try another combination
      seed += 997;
      attempts++;
    }
    const rating = 3.5 + seededRandom(seed + 2) * 1.5;
    const reviewsCount = Math.floor(10 + seededRandom(seed + 3) * 500);

    // Look up the real Indian market price for this item, with ±10% brand variance
    const itemInstance =
      items[Math.floor(seededRandom(seed + 1) * items.length)];
    const realPrice =
      (ITEM_PRICES[category.slug] &&
        ITEM_PRICES[category.slug][itemInstance]) ||
      99;
    const brandVariance = 0.9 + seededRandom(seed + 4) * 0.2; // 0.90x to 1.10x
    const basePrice = Math.round(realPrice * brandVariance);

    // Every product gets an offer (compare_price always set) — MRP is 5-20% higher
    const discountPct = 0.05 + seededRandom(seed + 5) * 0.15; // 5%-20% off
    const comparePrice = Math.round(basePrice / (1 - discountPct));

    const badges = [
      "New",
      "Organic",
      "Bestseller",
      "Sale",
      "Fresh",
      null,
      null,
      null,
    ];
    const badge = badges[Math.floor(seededRandom(seed + 7) * badges.length)];

    products.push({
      id: `prod-${category.slug}-${i}`,
      name: randomName,
      slug: `${category.slug}-product-${i}`,
      price: basePrice,
      comparePrice: comparePrice,
      image: "/placeholder.svg",
      unit: "each",
      rating: Number(rating.toFixed(1)),
      reviewsCount,
      badge: badge || undefined,
      categorySlug: category.slug,
    });
  }
});

const outPath = path.join(
  __dirname,
  "../src/features/products/utils/products.json",
);
fs.writeFileSync(outPath, JSON.stringify(products, null, 2));

console.log(
  `Successfully generated ${products.length} realistic brand products at ${outPath}`,
);
