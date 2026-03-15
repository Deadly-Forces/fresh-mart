import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const apply = process.argv.includes("--apply");

const CORRECTIONS = [
  {
    name: "Dabur Glucose Powder 500g",
    from: "cooking-essentials",
    to: "beverages",
    reason: "Drink powder belongs with beverages.",
  },
  {
    name: "Fresho Sugarcane Juice Pack 500ml",
    from: "fruits",
    to: "beverages",
    reason: "Ready-to-drink juice belongs with beverages.",
  },
  {
    name: "Fun Foods Baking Soda 100g",
    from: "bakery",
    to: "cooking-essentials",
    reason: "Baking soda is a cooking ingredient, not a bakery item.",
  },
  {
    name: "Weikfield Baking Soda 100g",
    from: "bakery",
    to: "cooking-essentials",
    reason: "Baking soda is a cooking ingredient, not a bakery item.",
  },
  {
    name: "Dr. Oetker FunFoods Mayonnaise 245g",
    from: "bakery",
    to: "cooking-essentials",
    reason: "Mayonnaise is a condiment, not a bakery item.",
  },
  {
    name: "Tata Sampann High Protein Unpolished Tur Dal 500g",
    from: "cooking-essentials",
    to: "staples",
    reason: "Tur dal belongs with staples.",
  },
  {
    name: "Patanjali Tomato Puree 200g",
    from: "spices-seasonings",
    to: "cooking-essentials",
    reason: "Tomato puree is a cooking base, not a spice.",
  },
  {
    name: "Suhana Medu Vada Mix 200g",
    from: "spices-seasonings",
    to: "staples",
    reason: "Ready mixes belong with staples.",
  },
  {
    name: "MTR Puliogare Powder 100g",
    from: "staples",
    to: "spices-seasonings",
    reason: "Seasoning powder belongs with spices and seasonings.",
  },
  {
    name: "MTR Bisibelebath Powder 100g",
    from: "staples",
    to: "spices-seasonings",
    reason: "Seasoning powder belongs with spices and seasonings.",
  },
  {
    name: "MTR Spiced Chutney Powder 200g",
    from: "cooking-essentials",
    to: "spices-seasonings",
    reason: "Chutney powder belongs with spices and seasonings.",
  },
  {
    name: "Mother Dairy Cow Ghee 500ml",
    from: "dairy-eggs",
    to: "cooking-essentials",
    reason: "This duplicate ghee listing should live with cooking fats.",
  },
  {
    name: "Patanjali Cow Ghee 1L",
    from: "dairy-eggs",
    to: "cooking-essentials",
    reason: "This duplicate ghee listing should live with cooking fats.",
  },
  {
    name: "Godrej Yummiez Veg Momos 10 pcs",
    from: "meat-seafood",
    to: "vegetables",
    reason: "Vegetarian frozen momos fit the vegetables frozen range.",
  },
];

function categorySlug(row) {
  return Array.isArray(row.categories)
    ? row.categories[0]?.slug ?? null
    : row.categories?.slug ?? null;
}

async function loadCategoryMap() {
  const { data, error } = await supabase.from("categories").select("id, slug");
  if (error) {
    throw error;
  }

  return new Map(data.map((row) => [row.slug, row.id]));
}

async function loadActiveProducts() {
  const all = [];
  const batchSize = 500;

  for (let from = 0; ; from += batchSize) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, category_id, categories(slug)")
      .eq("is_active", true)
      .range(from, from + batchSize - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    all.push(...data);

    if (data.length < batchSize) {
      break;
    }
  }

  return all;
}

async function main() {
  const categoryIds = await loadCategoryMap();
  const products = await loadActiveProducts();
  const updates = [];
  const alreadyCorrect = [];
  const missing = [];

  for (const correction of CORRECTIONS) {
    const matches = products.filter((product) => product.name === correction.name);
    const fromMatches = matches.filter(
      (product) =>
        categorySlug(product) === correction.from,
    );

    if (fromMatches.length === 0) {
      if (matches.some((product) => categorySlug(product) === correction.to)) {
        alreadyCorrect.push(correction);
        continue;
      }

      missing.push(correction);
      continue;
    }

    const targetCategoryId = categoryIds.get(correction.to);
    if (!targetCategoryId) {
      throw new Error(`Missing category slug: ${correction.to}`);
    }

    for (const match of fromMatches) {
      updates.push({
        id: match.id,
        name: match.name,
        slug: match.slug,
        from: correction.from,
        to: correction.to,
        reason: correction.reason,
        category_id: targetCategoryId,
      });
    }
  }

  console.log(`Mode: ${apply ? "apply" : "dry-run"}`);
  console.log(`Planned updates: ${updates.length}`);

  for (const update of updates) {
    console.log(
      `- ${update.name} | ${update.from} -> ${update.to} | ${update.slug}`,
    );
  }

  if (alreadyCorrect.length > 0) {
    console.log(`Already correct: ${alreadyCorrect.length}`);
    for (const correction of alreadyCorrect) {
      console.log(`= ${correction.name} | ${correction.to}`);
    }
  }

  if (missing.length > 0) {
    console.log(`Missing matches: ${missing.length}`);
    for (const correction of missing) {
      console.log(
        `! ${correction.name} | expected ${correction.from} -> ${correction.to}`,
      );
    }
  }

  if (!apply || updates.length === 0) {
    return;
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("products")
      .update({ category_id: update.category_id })
      .eq("id", update.id);

    if (error) {
      throw error;
    }
  }

  console.log(`Applied updates: ${updates.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
