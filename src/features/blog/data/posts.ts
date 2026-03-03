export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  category: string;
  readTime: string;
  gradient: string;
  sections: BlogSection[];
}

export type BlogPostSummary = Omit<BlogPost, "sections">;

const blogPosts: BlogPost[] = [
  {
    slug: "weeknight-dinners-fresh-vegetables",
    title: "5 Easy Weeknight Dinners Using Fresh Vegetables",
    excerpt:
      "Turn fresh produce into quick dinners with prep-light ideas you can make in under 30 minutes.",
    author: "Chef Anjali",
    publishedAt: "2026-02-18",
    category: "Recipes",
    readTime: "6 min read",
    gradient: "from-emerald-500/10 to-green-500/5",
    sections: [
      {
        heading: "Start with one versatile base",
        paragraphs: [
          "A strong weeknight plan starts with one cooked base that can be reused. Roasted vegetables, sauteed onions and peppers, or a simple tomato sauce can become multiple meals.",
          "Cook one base on Sunday and split it into portions. This saves time and keeps each dinner different without repeating the full prep process.",
        ],
        bullets: [
          "Roast a tray of mixed vegetables at 425F for 25 minutes",
          "Cook 2 cups of rice or quinoa for bowl meals",
          "Keep one ready sauce such as pesto, marinara, or tahini",
        ],
      },
      {
        heading: "Use a simple dinner formula",
        paragraphs: [
          "Use the same formula each night: vegetable + protein + grain + sauce. This keeps shopping and cooking predictable.",
          "Rotate only one element per day. For example, keep the grain and sauce stable, then swap vegetables and protein for variety.",
        ],
      },
      {
        heading: "Keep cleanup low",
        paragraphs: [
          "Choose one-pan, one-pot, or sheet-pan recipes during weekdays. A reliable cleanup routine makes healthy cooking easier to sustain.",
          "Line sheet pans with parchment, pre-chop produce in batches, and use leftovers for lunch so nothing goes to waste.",
        ],
      },
    ],
  },
  {
    slug: "ultimate-guide-storing-fresh-fruit",
    title: "The Ultimate Guide to Storing Fresh Fruit",
    excerpt:
      "Simple storage rules that keep berries, apples, and bananas fresh for longer and reduce weekly waste.",
    author: "FreshMart Team",
    publishedAt: "2026-02-05",
    category: "Tips and Tricks",
    readTime: "5 min read",
    gradient: "from-blue-500/10 to-cyan-500/5",
    sections: [
      {
        heading: "Separate ripening fruits",
        paragraphs: [
          "Many fruits release ethylene gas that speeds ripening. Bananas, apples, and avocados can cause nearby produce to soften early.",
          "Store fast-ripening fruits together and keep sensitive fruits like berries separate in the refrigerator.",
        ],
        bullets: [
          "Counter: bananas, whole avocados, stone fruit",
          "Fridge: grapes, berries, cut fruit",
          "Separate apples from leafy greens to avoid early spoilage",
        ],
      },
      {
        heading: "Moisture control is critical",
        paragraphs: [
          "Too much moisture leads to mold, while too little dries fruit out. Use breathable containers and dry fruit before storing when needed.",
          "For berries, place a dry paper towel in the container and replace it every couple of days.",
        ],
      },
      {
        heading: "Plan your fruit order",
        paragraphs: [
          "Eat the most delicate fruit first. Build your week around a ripeness order so each item is used at peak quality.",
          "A simple sequence is berries first, then peaches or pears, then apples and citrus last.",
        ],
      },
    ],
  },
  {
    slug: "meet-the-farmer-sahyadri-orchards",
    title: "Meet the Farmer: Sahyadri Orchards",
    excerpt:
      "A closer look at one of our local orchard partners and how they grow apples with quality and consistency.",
    author: "Community Reporter",
    publishedAt: "2026-01-29",
    category: "Community",
    readTime: "7 min read",
    gradient: "from-amber-500/10 to-orange-500/5",
    sections: [
      {
        heading: "A farm built on long-term soil care",
        paragraphs: [
          "Sahyadri Orchards rotates ground cover between rows to protect the soil and improve water retention. This helps trees remain productive with fewer chemical inputs.",
          "Their team tracks tree health by block, which allows precise pruning and better yield quality at harvest.",
        ],
      },
      {
        heading: "Harvest and handling standards",
        paragraphs: [
          "Fruit is harvested in small batches and cooled quickly to preserve texture. Sorting happens the same day to reduce bruising and storage loss.",
          "By controlling post-harvest handling, the orchard keeps more apples market-ready and reduces waste.",
        ],
        bullets: [
          "Small-lot harvest windows",
          "Rapid cooling after picking",
          "Hand inspection before shipment",
        ],
      },
      {
        heading: "Why this matters for customers",
        paragraphs: [
          "Reliable local partners shorten transit times and improve consistency in flavor and freshness.",
          "When supply chains are tighter, customers get better produce and farmers keep more value in their local region.",
        ],
      },
    ],
  },
  {
    slug: "healthy-snacking-alternatives-kids",
    title: "Healthy Snacking Alternatives for Kids",
    excerpt:
      "Practical snack swaps that are easy to prep, kid-friendly, and balanced for energy after school.",
    author: "Nutritionist Priya",
    publishedAt: "2026-01-16",
    category: "Health",
    readTime: "6 min read",
    gradient: "from-purple-500/10 to-pink-500/5",
    sections: [
      {
        heading: "Build snacks with three parts",
        paragraphs: [
          "A balanced snack includes fiber, protein, and healthy fat. This combination supports stable energy better than sugar-heavy options.",
          "Start with fruit or vegetables, then add yogurt, cheese, nuts, or hummus based on dietary needs.",
        ],
      },
      {
        heading: "Use familiar formats",
        paragraphs: [
          "Kids are more likely to try healthy foods in familiar forms such as mini wraps, skewers, or dip trays.",
          "Keep portions small and repeat choices often. Familiarity helps reduce resistance over time.",
        ],
        bullets: [
          "Apple slices with peanut butter",
          "Whole grain crackers with cheese cubes",
          "Carrot sticks with hummus",
          "Frozen yogurt bark with berries",
        ],
      },
      {
        heading: "Make prep predictable",
        paragraphs: [
          "Prepare snack bins once or twice each week so choices are visible and quick.",
          "If healthy options are pre-portioned and front-facing, kids can choose independently with less friction.",
        ],
      },
    ],
  },
  {
    slug: "meal-prep-guide-fresh-produce",
    title: "A Practical Meal Prep Guide for Fresh Produce",
    excerpt:
      "How to prep vegetables and herbs once a week without losing texture, color, or flavor.",
    author: "FreshMart Kitchen",
    publishedAt: "2025-12-30",
    category: "Meal Prep",
    readTime: "8 min read",
    gradient: "from-teal-500/10 to-emerald-500/5",
    sections: [
      {
        heading: "Prep by shelf life",
        paragraphs: [
          "Group produce into short, medium, and long shelf-life categories so you use items in the right order.",
          "Leafy greens and berries go first, then peppers and cucumbers, followed by root vegetables and cabbage.",
        ],
      },
      {
        heading: "Match cuts to usage",
        paragraphs: [
          "Cut produce in formats that align with recipes. Sliced onions for stir-fry, diced peppers for omelets, and shredded carrots for bowls reduce weekday decision-making.",
          "Store each cut with a label that includes prep date and intended meals.",
        ],
        bullets: [
          "Use airtight containers for diced vegetables",
          "Store herbs upright in a glass with water",
          "Keep washed greens in breathable produce bags",
        ],
      },
      {
        heading: "Protect texture and flavor",
        paragraphs: [
          "Avoid salting or dressing produce during prep. Add seasoning during cooking to keep water content and crispness in check.",
          "If you batch roast vegetables, undercook slightly so reheating does not make them soft.",
        ],
      },
    ],
  },
  {
    slug: "winter-citrus-buyers-guide",
    title: "Winter Citrus Buyers Guide",
    excerpt:
      "Choose better oranges, mandarins, and grapefruits with quick checks for flavor and juiciness.",
    author: "Produce Specialist Ravi",
    publishedAt: "2025-12-12",
    category: "Seasonal Picks",
    readTime: "4 min read",
    gradient: "from-yellow-500/10 to-orange-500/5",
    sections: [
      {
        heading: "Know what to look for at a glance",
        paragraphs: [
          "Good citrus should feel heavy for its size and have a firm but slightly springy skin. Heavier fruit usually means more juice.",
          "Surface blemishes are often cosmetic, but soft spots can indicate internal breakdown.",
        ],
      },
      {
        heading: "Pick varieties for the use case",
        paragraphs: [
          "Mandarins are easy for snacking, navel oranges work well for segments, and grapefruits fit breakfast plates.",
          "For juicing, choose fruit with thin skin and higher weight.",
        ],
        bullets: [
          "Snacking: mandarins, seedless navels",
          "Juicing: valencia oranges, ruby grapefruit",
          "Salads: blood oranges, pink grapefruit",
        ],
      },
      {
        heading: "Store citrus the right way",
        paragraphs: [
          "Citrus can stay at room temperature for a few days, but refrigeration extends freshness significantly.",
          "Keep fruit dry and avoid sealed plastic bags to prevent moisture buildup.",
        ],
      },
    ],
  },
  {
    slug: "zero-waste-grocery-habits",
    title: "7 Zero-Waste Grocery Habits That Actually Stick",
    excerpt:
      "Low-effort habits that cut food waste and reduce repeat grocery spending over time.",
    author: "Sustainability Team",
    publishedAt: "2025-11-21",
    category: "Sustainability",
    readTime: "6 min read",
    gradient: "from-lime-500/10 to-emerald-500/5",
    sections: [
      {
        heading: "Plan around what you already have",
        paragraphs: [
          "Before each order, check the fridge and pantry and build meals around open ingredients first.",
          "A short inventory step prevents duplicate purchases and keeps older items moving.",
        ],
      },
      {
        heading: "Turn leftovers into components",
        paragraphs: [
          "Instead of storing full leftover meals, repurpose ingredients into components for bowls, wraps, and soups.",
          "Cooked vegetables, proteins, and grains are easier to reuse when kept separate.",
        ],
        bullets: [
          "Freeze bread ends for breadcrumbs",
          "Use herb stems in stocks or sauces",
          "Blend ripe fruit into smoothies or sauces",
        ],
      },
      {
        heading: "Create one weekly rescue meal",
        paragraphs: [
          "Set one day each week to cook with whatever is left. Stir-fries, fried rice, soups, and frittatas work especially well.",
          "A regular rescue meal closes the loop and makes lower waste a repeatable habit.",
        ],
      },
    ],
  },
  {
    slug: "smoothie-recipes-no-added-sugar",
    title: "4 Smoothie Recipes with No Added Sugar",
    excerpt:
      "Balanced smoothies that rely on fruit, vegetables, and dairy or plant proteins for flavor and satiety.",
    author: "Coach Meera",
    publishedAt: "2025-11-08",
    category: "Wellness",
    readTime: "5 min read",
    gradient: "from-sky-500/10 to-blue-500/5",
    sections: [
      {
        heading: "Build from a repeatable ratio",
        paragraphs: [
          "Use a simple ratio: 1 cup fruit, 1 cup greens or vegetables, 1 cup liquid, plus a protein or fat source.",
          "Frozen fruit creates thickness and natural sweetness without syrups.",
        ],
      },
      {
        heading: "Recipe ideas to rotate",
        paragraphs: [
          "Pick a few base combinations and rotate weekly. This keeps flavor variety high while maintaining consistent nutrition.",
        ],
        bullets: [
          "Berry spinach yogurt blend",
          "Mango carrot coconut blend",
          "Banana oats peanut blend",
          "Pineapple cucumber mint blend",
        ],
      },
      {
        heading: "Make it prep-friendly",
        paragraphs: [
          "Pre-portion smoothie bags with fruit and greens in the freezer. Blend with fresh liquid in the morning.",
          "For better texture, add ice only after blending if needed.",
        ],
      },
    ],
  },
  {
    slug: "pantry-staples-15-minute-meals",
    title: "Pantry Staples for 15-Minute Meals",
    excerpt:
      "A short pantry list that helps you assemble quick meals with fresh produce any day of the week.",
    author: "FreshMart Team",
    publishedAt: "2025-10-27",
    category: "Kitchen Basics",
    readTime: "5 min read",
    gradient: "from-rose-500/10 to-orange-500/5",
    sections: [
      {
        heading: "Keep core pantry categories stocked",
        paragraphs: [
          "Fast meals depend on a few dependable pantry categories: grains, proteins, sauces, and seasonings.",
          "When these are in place, fresh produce becomes easy to turn into complete dinners.",
        ],
        bullets: [
          "Grains: pasta, rice, couscous, oats",
          "Proteins: canned beans, lentils, tuna",
          "Flavor bases: garlic, onion, tomato paste",
          "Finishing: olive oil, vinegar, spice blends",
        ],
      },
      {
        heading: "Use two-step meal templates",
        paragraphs: [
          "A template system removes decision fatigue. Pick one pantry base and one fresh component, then finish with seasoning.",
          "Examples include pasta plus greens, rice plus vegetables, or beans plus tomatoes.",
        ],
      },
      {
        heading: "Restock by usage, not by habit",
        paragraphs: [
          "Track what you actually consume and refill those items first. This keeps spending focused and reduces stale inventory.",
          "A weekly restock list with quantities keeps your pantry functional without overbuying.",
        ],
      },
    ],
  },
];

function sortByPublishedDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function getAllBlogPosts(): BlogPost[] {
  return sortByPublishedDateDesc(blogPosts);
}

export function getBlogPostSummaries(): BlogPostSummary[] {
  return getAllBlogPosts().map(({ sections, ...summary }) => summary);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function formatBlogDate(dateValue: string): string {
  // Use UTC formatting so YYYY-MM-DD values render consistently across time zones.
  const utcDate = new Date(`${dateValue}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(utcDate);
}
