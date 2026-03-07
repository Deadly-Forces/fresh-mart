import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  // 0. Delete dependent rows first to avoid FK constraint errors
  console.log("Deleting order_items (FK dependency)...");
  const { error: delOiErr } = await supabase
    .from("order_items")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (delOiErr) {
    console.error("Error deleting order_items:", delOiErr);
  } else {
    console.log("Order items deleted.");
  }

  console.log("Deleting all existing products...");
  const { error: delProdErr } = await supabase
    .from("products")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (delProdErr) {
    console.error("Error deleting old products:", delProdErr);
  } else {
    console.log("Old products deleted.");
  }

  // Also delete old categories so they get recreated cleanly
  console.log("Deleting all existing categories...");
  const { error: delCatErr } = await supabase
    .from("categories")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (delCatErr) {
    console.error("Error deleting old categories:", delCatErr);
  } else {
    console.log("Old categories deleted.");
  }

  console.log("Reading products.json...");
  const data = fs.readFileSync(
    path.resolve(process.cwd(), "src/features/products/utils/products.json"),
    "utf8",
  );
  const products = JSON.parse(data);

  console.log(`Loaded ${products.length} products.`);

  // 1. Extract unique categories
  const categorySlugs = new Set();
  const categoryMap = new Map(); // slug -> id

  for (const p of products) {
    if (p.categorySlug) categorySlugs.add(p.categorySlug);
  }

  console.log(`Found ${categorySlugs.size} unique categories.`);

  // 2. Insert Categories
  for (const slug of Array.from(categorySlugs)) {
    const name = slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    // Check if exists
    const { data: existingCat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingCat) {
      categoryMap.set(slug, existingCat.id);
    } else {
      const { data: newCat, error } = await supabase
        .from("categories")
        .insert({
          name: name,
          slug: slug,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting category:", slug, error);
      } else {
        categoryMap.set(slug, newCat.id);
        console.log(`Created category: ${name}`);
      }
    }
  }

  // 3. Insert Products
  console.log("Inserting products...");

  // Create an array of product data to insert
  const productsToInsert = products.map((p) => {
    // Generate an image URL based on category since mock data just uses placeholder
    let imageUrl =
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80";
    if (p.categorySlug === "fruits")
      imageUrl =
        "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80";
    if (p.categorySlug === "vegetables")
      imageUrl =
        "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80";
    if (p.categorySlug === "dairy-eggs")
      imageUrl =
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80";
    if (p.categorySlug === "meat-seafood")
      imageUrl =
        "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80";
    if (p.categorySlug === "bakery")
      imageUrl =
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80";
    if (p.categorySlug === "cooking-essentials")
      imageUrl =
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80";
    if (p.categorySlug === "spices-seasonings")
      imageUrl =
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80";
    if (p.categorySlug === "staples")
      imageUrl =
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80";

    return {
      name: p.name,
      slug: p.slug,
      price: p.price,
      compare_price: p.comparePrice || null,
      images: [imageUrl],
      stock: 200,
      category_id: categoryMap.get(p.categorySlug) || null,
      unit: p.unit || "unit",
      is_active: true,
    };
  });

  // Insert all products (200 per category = ~2000 total)
  const batchToInsert = productsToInsert;

  // Insert in chunks of 100
  const chunkSize = 100;
  for (let i = 0; i < batchToInsert.length; i += chunkSize) {
    const chunk = batchToInsert.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("products")
      .upsert(chunk, { onConflict: "slug" });

    if (error) {
      console.error(`Error inserting chunk ${i} - ${i + chunk.length}:`, error);
    } else {
      console.log(`Inserted products ${i} to ${i + chunk.length}`);
    }
  }

  console.log("Done seeding!");
}

seed().catch(console.error);
