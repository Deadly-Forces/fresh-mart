import { openrouter, defaultModel } from "@/lib/openrouter";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

// ── Local ingredient cache for common dishes (instant, no LLM call) ──
const DISH_CACHE: Record<string, string[]> = {
  "biryani": ["chicken", "onion", "tomato", "yogurt", "ginger", "garlic", "coriander", "mint", "green chilli", "rice", "cooking oil", "biryani masala", "salt", "turmeric"],
  "chicken biryani": ["chicken", "onion", "tomato", "yogurt", "ginger", "garlic", "coriander", "mint", "green chilli", "rice", "cooking oil", "biryani masala", "salt", "turmeric"],
  "veg biryani": ["onion", "tomato", "carrot", "capsicum", "green pea", "yogurt", "ginger", "garlic", "coriander", "mint", "green chilli", "rice", "cooking oil", "biryani masala", "salt", "turmeric"],
  "mutton biryani": ["mutton", "onion", "tomato", "yogurt", "ginger", "garlic", "coriander", "mint", "green chilli", "rice", "cooking oil", "biryani masala", "salt", "turmeric"],
  "egg biryani": ["egg", "onion", "tomato", "yogurt", "ginger", "garlic", "coriander", "mint", "green chilli", "rice", "cooking oil", "biryani masala", "salt", "turmeric"],
  "pulao": ["rice", "onion", "carrot", "green pea", "capsicum", "ginger", "garlic", "cumin", "bay leaf", "cooking oil", "salt", "coriander"],
  "fried rice": ["rice", "onion", "carrot", "capsicum", "spring onion", "garlic", "soy sauce", "cooking oil", "salt", "black pepper", "egg"],
  "jeera rice": ["rice", "cumin", "ghee", "bay leaf", "salt", "water"],
  "lemon rice": ["rice", "lemon", "peanut", "mustard seed", "curry leaf", "turmeric", "green chilli", "cooking oil", "salt"],
  "pasta": ["pasta", "tomato", "onion", "garlic", "capsicum", "cheese", "olive oil", "salt", "oregano"],
  "white sauce pasta": ["pasta", "milk", "butter", "flour", "cheese", "garlic", "mushroom", "capsicum", "salt", "black pepper"],
  "red sauce pasta": ["pasta", "tomato", "onion", "garlic", "capsicum", "olive oil", "oregano", "chilli flake", "salt", "basil"],
  "maggi": ["maggi noodle", "water", "cooking oil"],
  "noodles": ["noodle", "onion", "capsicum", "carrot", "cabbage", "spring onion", "garlic", "soy sauce", "cooking oil", "salt", "vinegar"],
  "chow mein": ["noodle", "onion", "capsicum", "carrot", "cabbage", "spring onion", "garlic", "soy sauce", "cooking oil", "salt", "vinegar"],
  "manchurian": ["cabbage", "carrot", "capsicum", "onion", "garlic", "ginger", "soy sauce", "cornflour", "cooking oil", "salt", "spring onion", "vinegar"],
  "french fries": ["potato", "cooking oil", "salt"],
  "omelette": ["egg", "onion", "green chilli", "coriander", "salt", "cooking oil", "black pepper"],
  "scrambled egg": ["egg", "onion", "tomato", "green chilli", "butter", "salt", "black pepper"],
  "boiled egg": ["egg", "salt", "water"],
  "egg curry": ["egg", "onion", "tomato", "ginger", "garlic", "green chilli", "turmeric", "red chilli powder", "coriander", "cooking oil", "salt"],
  "butter chicken": ["chicken", "butter", "tomato", "onion", "garlic", "ginger", "cream", "cashew", "red chilli powder", "garam masala", "turmeric", "salt", "coriander", "cooking oil"],
  "chicken curry": ["chicken", "onion", "tomato", "ginger", "garlic", "green chilli", "turmeric", "red chilli powder", "coriander powder", "garam masala", "cooking oil", "salt", "coriander"],
  "chicken tikka": ["chicken", "yogurt", "ginger", "garlic", "red chilli powder", "turmeric", "garam masala", "lemon", "cooking oil", "salt"],
  "tandoori chicken": ["chicken", "yogurt", "ginger", "garlic", "red chilli powder", "turmeric", "garam masala", "lemon", "cooking oil", "salt", "kasuri methi"],
  "chicken 65": ["chicken", "ginger", "garlic", "red chilli powder", "cornflour", "yogurt", "curry leaf", "cooking oil", "salt", "lemon"],
  "fish curry": ["fish", "onion", "tomato", "ginger", "garlic", "turmeric", "red chilli powder", "coconut milk", "curry leaf", "cooking oil", "salt"],
  "fish fry": ["fish", "turmeric", "red chilli powder", "ginger", "garlic", "lemon", "salt", "cooking oil", "rice flour"],
  "prawn curry": ["prawn", "onion", "tomato", "ginger", "garlic", "turmeric", "red chilli powder", "coconut milk", "curry leaf", "cooking oil", "salt"],
  "mutton curry": ["mutton", "onion", "tomato", "ginger", "garlic", "green chilli", "turmeric", "red chilli powder", "garam masala", "coriander", "cooking oil", "salt"],
  "keema": ["minced meat", "onion", "tomato", "ginger", "garlic", "green pea", "green chilli", "turmeric", "red chilli powder", "garam masala", "coriander", "cooking oil", "salt"],
  "dal": ["toor dal", "onion", "tomato", "garlic", "green chilli", "turmeric", "red chilli powder", "cumin", "mustard seed", "curry leaf", "ghee", "salt", "coriander"],
  "dal tadka": ["toor dal", "onion", "tomato", "garlic", "green chilli", "turmeric", "red chilli powder", "cumin", "mustard seed", "curry leaf", "ghee", "salt", "coriander"],
  "dal makhani": ["urad dal", "rajma", "butter", "cream", "tomato", "onion", "ginger", "garlic", "red chilli powder", "garam masala", "salt"],
  "rajma": ["rajma", "onion", "tomato", "ginger", "garlic", "green chilli", "turmeric", "red chilli powder", "garam masala", "cooking oil", "salt", "coriander"],
  "chole": ["chickpea", "onion", "tomato", "ginger", "garlic", "green chilli", "chole masala", "turmeric", "cooking oil", "salt", "coriander"],
  "chana masala": ["chickpea", "onion", "tomato", "ginger", "garlic", "green chilli", "chole masala", "turmeric", "cooking oil", "salt", "coriander"],
  "aloo gobi": ["potato", "cauliflower", "onion", "tomato", "ginger", "garlic", "green chilli", "turmeric", "red chilli powder", "cumin", "coriander", "cooking oil", "salt"],
  "aloo matar": ["potato", "green pea", "onion", "tomato", "ginger", "garlic", "green chilli", "turmeric", "red chilli powder", "garam masala", "coriander", "cooking oil", "salt"],
  "palak paneer": ["paneer", "spinach", "onion", "tomato", "ginger", "garlic", "green chilli", "cream", "cumin", "garam masala", "cooking oil", "salt"],
  "shahi paneer": ["paneer", "onion", "tomato", "cashew", "cream", "ginger", "garlic", "red chilli powder", "garam masala", "turmeric", "cooking oil", "salt", "coriander"],
  "paneer butter masala": ["paneer", "butter", "tomato", "onion", "cashew", "cream", "ginger", "garlic", "red chilli powder", "garam masala", "turmeric", "salt", "coriander", "cooking oil"],
  "paneer tikka": ["paneer", "capsicum", "onion", "yogurt", "ginger", "garlic", "red chilli powder", "garam masala", "lemon", "cooking oil", "salt"],
  "matar paneer": ["paneer", "green pea", "onion", "tomato", "ginger", "garlic", "green chilli", "turmeric", "garam masala", "cream", "cooking oil", "salt", "coriander"],
  "malai kofta": ["paneer", "potato", "onion", "tomato", "cashew", "cream", "ginger", "garlic", "garam masala", "turmeric", "cooking oil", "salt", "coriander"],
  "kadai paneer": ["paneer", "capsicum", "onion", "tomato", "ginger", "garlic", "coriander seed", "red chilli", "garam masala", "cooking oil", "salt", "coriander"],
  "bhindi masala": ["okra", "onion", "tomato", "green chilli", "turmeric", "red chilli powder", "coriander powder", "cumin", "cooking oil", "salt"],
  "baingan bharta": ["eggplant", "onion", "tomato", "ginger", "garlic", "green chilli", "turmeric", "red chilli powder", "cumin", "cooking oil", "salt", "coriander"],
  "aloo paratha": ["potato", "wheat flour", "green chilli", "ginger", "coriander", "cumin", "salt", "ghee"],
  "gobi paratha": ["cauliflower", "wheat flour", "green chilli", "ginger", "coriander", "cumin", "salt", "ghee"],
  "paneer paratha": ["paneer", "wheat flour", "green chilli", "ginger", "coriander", "cumin", "salt", "ghee"],
  "roti": ["wheat flour", "salt", "water", "ghee"],
  "chapati": ["wheat flour", "salt", "water", "ghee"],
  "naan": ["flour", "yogurt", "baking powder", "sugar", "salt", "cooking oil", "butter"],
  "puri": ["wheat flour", "salt", "cooking oil"],
  "paratha": ["wheat flour", "salt", "ghee", "cooking oil"],
  "dosa": ["rice", "urad dal", "salt", "cooking oil"],
  "idli": ["rice", "urad dal", "salt"],
  "vada": ["urad dal", "onion", "green chilli", "ginger", "curry leaf", "salt", "cooking oil"],
  "upma": ["rava", "onion", "green chilli", "mustard seed", "curry leaf", "cashew", "cooking oil", "salt", "water"],
  "poha": ["poha", "onion", "green chilli", "mustard seed", "curry leaf", "peanut", "turmeric", "cooking oil", "salt", "lemon"],
  "uttapam": ["rice", "urad dal", "onion", "tomato", "capsicum", "green chilli", "coriander", "salt", "cooking oil"],
  "sambar": ["toor dal", "onion", "tomato", "drumstick", "eggplant", "carrot", "sambar powder", "tamarind", "mustard seed", "curry leaf", "cooking oil", "salt", "turmeric"],
  "rasam": ["tomato", "tamarind", "rasam powder", "mustard seed", "curry leaf", "garlic", "coriander", "cooking oil", "salt"],
  "samosa": ["potato", "green pea", "flour", "cumin", "coriander", "green chilli", "garam masala", "cooking oil", "salt"],
  "pakora": ["gram flour", "onion", "potato", "spinach", "green chilli", "cumin", "turmeric", "salt", "cooking oil"],
  "bhaji": ["gram flour", "onion", "green chilli", "cumin", "turmeric", "coriander", "salt", "cooking oil"],
  "pav bhaji": ["potato", "capsicum", "cauliflower", "green pea", "tomato", "onion", "butter", "pav bhaji masala", "pav", "salt", "coriander", "lemon"],
  "sandwich": ["bread", "tomato", "cucumber", "onion", "capsicum", "cheese", "butter", "salt", "black pepper"],
  "pizza": ["pizza base", "tomato", "capsicum", "onion", "mushroom", "olive", "cheese", "oregano", "salt"],
  "burger": ["burger bun", "potato", "onion", "tomato", "lettuce", "cheese", "cooking oil", "salt", "black pepper"],
  "wrap": ["tortilla", "chicken", "onion", "capsicum", "tomato", "lettuce", "cheese", "mayonnaise", "salt"],
  "momos": ["flour", "chicken", "onion", "garlic", "ginger", "soy sauce", "spring onion", "salt", "black pepper", "cooking oil"],
  "veg momos": ["flour", "cabbage", "carrot", "onion", "garlic", "ginger", "soy sauce", "spring onion", "salt", "black pepper"],
  "spring roll": ["spring roll sheet", "cabbage", "carrot", "capsicum", "onion", "soy sauce", "garlic", "cooking oil", "salt"],
  "korma": ["chicken", "onion", "yogurt", "cashew", "cream", "ginger", "garlic", "garam masala", "turmeric", "cooking oil", "salt", "coriander"],
  "chicken korma": ["chicken", "onion", "yogurt", "cashew", "cream", "ginger", "garlic", "garam masala", "turmeric", "cooking oil", "salt", "coriander"],
  "dum aloo": ["potato", "yogurt", "onion", "tomato", "ginger", "garlic", "red chilli powder", "garam masala", "turmeric", "cooking oil", "salt", "coriander"],
  "chilli chicken": ["chicken", "onion", "capsicum", "garlic", "ginger", "soy sauce", "green chilli", "cornflour", "vinegar", "cooking oil", "salt", "spring onion"],
  "gobi manchurian": ["cauliflower", "onion", "capsicum", "garlic", "ginger", "soy sauce", "cornflour", "vinegar", "cooking oil", "salt", "spring onion"],
  "hakka noodles": ["noodle", "onion", "capsicum", "carrot", "cabbage", "spring onion", "garlic", "soy sauce", "vinegar", "cooking oil", "salt"],
  "schezwan fried rice": ["rice", "onion", "capsicum", "carrot", "spring onion", "garlic", "schezwan sauce", "soy sauce", "cooking oil", "salt"],
  "soup": ["onion", "tomato", "carrot", "garlic", "ginger", "salt", "black pepper", "butter", "coriander"],
  "tomato soup": ["tomato", "onion", "garlic", "butter", "cream", "salt", "black pepper", "basil"],
  "sweet corn soup": ["corn", "onion", "garlic", "cornflour", "soy sauce", "salt", "black pepper", "spring onion"],
  "raita": ["yogurt", "onion", "tomato", "cucumber", "coriander", "cumin", "salt"],
  "salad": ["cucumber", "tomato", "onion", "carrot", "lettuce", "lemon", "salt", "black pepper"],
  "smoothie": ["banana", "milk", "yogurt", "honey", "ice"],
  "milkshake": ["milk", "banana", "sugar", "ice cream"],
  "lassi": ["yogurt", "sugar", "cardamom", "ice"],
  "mango lassi": ["mango", "yogurt", "sugar", "cardamom", "ice"],
  "chai": ["milk", "tea", "sugar", "ginger", "cardamom"],
  "masala chai": ["milk", "tea", "sugar", "ginger", "cardamom", "clove", "cinnamon"],
  "coffee": ["milk", "coffee", "sugar"],
  "kheer": ["milk", "rice", "sugar", "cardamom", "cashew", "raisin", "saffron"],
  "gulab jamun": ["milk powder", "flour", "ghee", "sugar", "cardamom", "rose water"],
  "halwa": ["rava", "ghee", "sugar", "cardamom", "cashew", "raisin", "milk"],
  "gajar halwa": ["carrot", "milk", "sugar", "ghee", "cardamom", "cashew", "raisin"],
  "ladoo": ["gram flour", "ghee", "sugar", "cardamom", "cashew"],
  "jalebi": ["flour", "yogurt", "sugar", "saffron", "cooking oil", "cardamom"],
  "cake": ["flour", "sugar", "egg", "butter", "milk", "baking powder", "vanilla essence"],
  "pancake": ["flour", "milk", "egg", "sugar", "butter", "baking powder"],
  "dahi vada": ["urad dal", "yogurt", "tamarind", "cumin", "red chilli powder", "coriander", "salt", "cooking oil"],
  "pani puri": ["rava", "potato", "chickpea", "onion", "coriander", "mint", "green chilli", "tamarind", "salt", "cumin"],
};

// Normalize query to match cache keys
function extractDishName(query: string): string {
  return query
    .toLowerCase()
    .replace(/\b(ingredients?|for|of|to make|to cook|make|cook|needed for|required for|recipe|how to|prepare|what do i need)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// In-memory LLM response cache (survives across requests within the same server instance)
const llmCache = new Map<string, { ingredients: string[]; isRecipe: boolean }>();

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return new Response("Query is required", { status: 400 });
    }

    const dishName = extractDishName(query);

    // 1. Check local dish cache (instant)
    if (DISH_CACHE[dishName]) {
      return Response.json({
        products: DISH_CACHE[dishName],
        isRecipe: true,
      });
    }

    // 2. Check LLM response cache (instant for repeat queries)
    const cacheKey = dishName || query.toLowerCase().trim();
    const cached = llmCache.get(cacheKey);
    if (cached) {
      return Response.json({
        products: cached.ingredients,
        isRecipe: cached.isRecipe,
      });
    }

    // 3. Fall back to LLM call for unknown dishes
    const { object } = await generateObject({
      model: openrouter(defaultModel),
      schema: z.object({
        ingredients: z
          .array(z.string())
          .describe(
            "All ingredients needed for this dish. Use SINGULAR form. Max 15.",
          ),
        isRecipe: z
          .boolean()
          .describe(
            "True if the user is asking for a recipe or dish ingredients.",
          ),
      }),
      prompt: `User query: "${query}"

You are a grocery shopping assistant. List ALL ingredients needed for this dish.

RULES:
- List ONLY ingredients this specific dish actually needs. Do NOT add unrelated items.
- Use SINGULAR form: potato, tomato, onion (not potatoes, tomatoes, onions)
- Use Indian grocery names: capsicum (not bell pepper), coriander (not cilantro)
- Include everything: fresh produce, dairy, meat, AND pantry items like oil, salt, spices, rice, flour
- Maximum 15 ingredients

EXAMPLES:
- "french fries" → ["potato", "cooking oil", "salt"]
- "omelette" → ["egg", "onion", "green chilli", "coriander", "salt", "cooking oil", "black pepper"]
- "biryani" → ["chicken", "onion", "tomato", "yogurt", "ginger", "garlic", "coriander", "mint", "green chilli", "rice", "cooking oil", "biryani masala", "salt", "turmeric"]
- "pasta" → ["pasta", "tomato", "onion", "garlic", "capsicum", "cheese", "olive oil", "salt", "oregano"]`,
    });

    // Cache the LLM response for future requests
    llmCache.set(cacheKey, {
      ingredients: object.ingredients,
      isRecipe: object.isRecipe,
    });

    // Return in the format the frontend expects
    return Response.json({
      products: object.ingredients,
      isRecipe: object.isRecipe,
    });
  } catch (error) {
    console.error("Error generating search terms:", error);
    return new Response("Failed to generate search terms", { status: 500 });
  }
}
