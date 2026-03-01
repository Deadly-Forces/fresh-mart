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
    "vegetables": ["Green Giant", "Dole", "Earthbound Farm", "Ocean Mist", "Grimmway Farms", "Fresh Express", "Mann Packing", "Taylor Farms", "Local Farm", "Organic Valley"],
    "fruits": ["Chiquita", "Dole", "Del Monte", "Driscoll's", "Zespri", "Ocean Spray", "Sunkist", "Wonderful", "Local Orchard", "Sunview"],
    "dairy-eggs": ["Horizon Organic", "Chobani", "Tillamook", "Kraft", "Philadelphia", "Fage", "Vital Farms", "Eggland's Best", "Silk", "Oatly", "Cabot", "Sargento"],
    "bakery": ["Nature's Own", "Dave's Killer Bread", "Pepperidge Farm", "Thomas'", "Entenmann's", "Sara Lee", "Bimbo", "Oroweat", "Wonder", "King's Hawaiian"],
    "meat-seafood": ["Tyson", "Perdue", "Smithfield", "Oscar Mayer", "Applegate", "Hormel", "Butterball", "Gorton's", "SeaPak", "Omaha Steaks", "Jimmy Dean"],
    "snacks": ["Lay's", "Doritos", "Cheez-It", "Pringles", "Ritz", "Oreo", "Quaker", "Nabisco", "Planters", "Snyder's", "Cheetos", "Goldfish"],
    "beverages": ["Coca-Cola", "Pepsi", "Tropicana", "Simply", "Gatorade", "Starbucks", "Folgers", "Lipton", "LaCroix", "Dasani", "Aquafina", "Ocean Spray"],
    "personal-care": ["Dove", "Pantene", "Crest", "Colgate", "Gillette", "Old Spice", "Secret", "Olay", "Neutrogena", "Axe", "Tresemmé", "Head & Shoulders"],
    "household": ["Bounty", "Charmin", "Tide", "Dawn", "Glad", "Ziploc", "Clorox", "Hefty", "Windex", "Kleenex", "Cottonelle", "Cascade"],
    "baby-care": ["Huggies", "Pampers", "Gerber", "Enfamil", "Similac", "Johnson's", "Aveeno Baby", "Earth's Best", "WaterWipes", "Desitin", "Burt's Bees Baby", "Luvs"],
};

const CATEGORY_ITEMS = {
    "vegetables": ["Baby Carrots 1lb", "Broccoli Crowns", "Baby Spinach 10oz", "Russet Potatoes 5lb", "Yellow Onions 3lb", "Roma Tomatoes 1lb", "Red Bell Peppers", "Romaine Hearts 3-pack", "English Cucumbers", "Chopped Kale 9oz", "Zucchini 2ct", "Green Cabbage"],
    "fruits": ["Premium Bananas", "Navel Oranges 3lb", "Strawberries 16oz", "Red Seedless Grapes", "Blueberries 1pint", "Honey Mangoes", "Pineapple Chunks", "Seedless Watermelon", "Meyer Lemons", "Yellow Peaches", "Bartlett Pears", "Raspberries 6oz"],
    "dairy-eggs": ["Whole Milk 1 Gallon", "Large Brown Eggs 12ct", "Mild Cheddar Cheese Block", "Unsalted Butter 16oz", "Greek Vanilla Yogurt 32oz", "Original Cream Cheese 8oz", "Light Sour Cream 16oz", "Shredded Mozzarella 8oz", "Unsweetened Almond Milk 64oz", "Original Oat Milk 64oz", "Sliced Provolone 8oz", "Cottage Cheese 16oz"],
    "bakery": ["100% Whole Wheat Bread", "Butter Croissants 4ct", "Everything Bagels 6ct", "French Baguette", "Blueberry Muffins 4ct", "Glazed Donuts 6ct", "White Sandwich Bread", "Whole Wheat Pita 6ct", "Hawaiian Sweet Rolls 12ct", "Chocolate Chip Cookies", "Fudge Brownies", "Pound Cake"],
    "meat-seafood": ["Boneless Skinless Chicken Breasts", "80/20 Ground Beef 1lb", "Farm Raised Salmon Fillet", "Center Cut Pork Chops", "Thick Cut Bacon 16oz", "Raw Extra Large Shrimp", "Oven Roasted Turkey Breast", "Ribeye Steak", "Italian Sausage", "Chunk Light Tuna", "Alaskan Cod Fillet", "Ground Turkey 93/7 1lb"],
    "snacks": ["Classic Potato Chips 8oz", "Nacho Cheese Tortilla Chips 9oz", "Baked Cheese Crackers", "Original Potato Crisps", "Buttery Round Crackers", "Chocolate Sandwich Cookies", "Chewy Granola Bars", "Mini Pretzel Twists", "Dry Roasted Peanuts 16oz", "Fruit Flavored Snacks", "White Cheddar Popcorn", "Beef Jerky Original"],
    "beverages": ["100% Orange Juice No Pulp 52oz", "Apple Juice 64oz", "Sparkling Water 8-Pack", "Cola 12-Pack Cans", "Medium Roast Ground Coffee 12oz", "Green Tea Bags 40ct", "Lemon Iced Tea 64oz", "Energy Drink 16oz", "Original Coconut Water 1L", "Classic Lemonade 52oz", "Diet Cola 2L", "Sports Drink Fruit Punch 28oz"],
    "personal-care": ["Moisturizing Body Wash 22oz", "Daily Moisture Shampoo 12oz", "Daily Moisture Conditioner 12oz", "Whitening Toothpaste 4oz", "Soft Bristles Toothbrush 2ct", "Antiperspirant Deodorant 2.6oz", "Daily Moisturizing Lotion 18oz", "Gentle Skin Cleanser 16oz", "Shaving Cream 7oz", "Disposable Razors 4-Pack", "Antiseptic Mouthwash 1L", "Bar Soap 6-Pack"],
    "household": ["Select-A-Size Paper Towels 6 Rolls", "Ultra Soft Toilet Paper 12 Mega Rolls", "Original Liquid Laundry Detergent", "Ultra Dishwashing Liquid 21oz", "Tall Kitchen Trash Bags 40ct", "Heavy Duty Scrub Sponges 3ct", "Glass and Surface Cleaner 26oz", "Multi-Surface Spray Cleaner", "Heavy Duty Aluminum Foil", "Storage Slider Bags Gallon", "Facial Tissues 3-Pack", "AA Alkaline Batteries 8-Pack"],
    "baby-care": ["Little Snugglers Diapers Size 1", "Swaddlers Diapers Size 3", "Sensitive Baby Wipes 3-Pack", "Infant Formula Powder", "Baby Oatmeal Cereal", "Tear-Free Baby Wash & Shampoo", "Daily Moisture Baby Lotion", "Maximum Strength Diaper Rash Paste", "Orthodontic Pacifiers 2-Pack", "Anti-Colic Baby Bottles 3-Pack", "Organic Puffs Apple & Broccoli", "Nursery Purified Water 1 Gallon"],
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
const usedNames = new Set();

CATEGORIES.forEach((category) => {
    const items = CATEGORY_ITEMS[category.slug] || ["Item"];
    const brands = BRANDS[category.slug] || ["Generic"];

    for (let i = 0; i < PRODUCTS_PER_CATEGORY; i++) {
        let seed = hashString(`${category.slug}-${i}`);
        let randomName = "";

        // Loop until we find a unique name
        while (true) {
            const brandInstance = brands[Math.floor(seededRandom(seed) * brands.length)];
            const itemInstance = items[Math.floor(seededRandom(seed + 1) * items.length)];
            randomName = `${brandInstance} ${itemInstance}`;

            if (!usedNames.has(randomName)) {
                usedNames.add(randomName);
                break;
            }
            // If duplicate, adjust seed deterministically to try another combination
            seed += 997;
        }
        const rating = 3.5 + (seededRandom(seed + 2) * 1.5);
        const reviewsCount = Math.floor(10 + seededRandom(seed + 3) * 500);
        const basePrice = 1.99 + seededRandom(seed + 4) * 20;

        const hasDiscount = seededRandom(seed + 5) > 0.7;
        let comparePrice;
        if (hasDiscount) {
            comparePrice = Number((basePrice * (1.2 + seededRandom(seed + 6) * 0.3)).toFixed(2));
        }

        const badges = ["New", "Organic", "Bestseller", "Sale", "Stock Up", null, null, null];
        const badge = badges[Math.floor(seededRandom(seed + 7) * badges.length)];

        products.push({
            id: `prod-${category.slug}-${i}`,
            name: randomName,
            slug: `${category.slug}-product-${i}`,
            price: Number(basePrice.toFixed(2)),
            comparePrice,
            image: "/placeholder.svg",
            unit: "each",
            rating: Number(rating.toFixed(1)),
            reviewsCount,
            badge: badge || undefined,
            categorySlug: category.slug,
        });
    }
});

const outPath = path.join(__dirname, "../src/features/products/utils/products.json");
fs.writeFileSync(outPath, JSON.stringify(products, null, 2));

console.log(`Successfully generated ${products.length} realistic brand products at ${outPath}`);
