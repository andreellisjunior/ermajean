/**
 * Shopping List Utility Functions
 * Requirements: 4.1, 4.2, 4.4
 */

import { Recipe, MealSlot, ShoppingListItem } from "../types/config";

/**
 * Parsed ingredient structure
 */
export interface ParsedIngredient {
  quantity: number;
  quantityKnown: boolean;
  unit: string;
  name: string;
  original: string;
}

/**
 * Ingredient categories for grouping
 */
export const INGREDIENT_CATEGORIES = {
  PRODUCE: "Produce",
  MEAT_SEAFOOD: "Meat & Seafood",
  DAIRY: "Dairy",
  BAKERY: "Bakery",
  PANTRY: "Pantry",
  FROZEN: "Frozen",
  BEVERAGES: "Beverages",
  SPICES: "Spices & Seasonings",
  OTHER: "Other",
} as const;

export type IngredientCategory =
  (typeof INGREDIENT_CATEGORIES)[keyof typeof INGREDIENT_CATEGORIES];

/**
 * Keywords for categorizing ingredients
 */
const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
  [INGREDIENT_CATEGORIES.PRODUCE]: [
    "apple",
    "banana",
    "orange",
    "lemon",
    "lime",
    "tomato",
    "potato",
    "onion",
    "garlic",
    "carrot",
    "celery",
    "lettuce",
    "spinach",
    "kale",
    "broccoli",
    "cauliflower",
    "pepper",
    "cucumber",
    "zucchini",
    "squash",
    "mushroom",
    "avocado",
    "berry",
    "strawberry",
    "blueberry",
    "raspberry",
    "grape",
    "melon",
    "watermelon",
    "pineapple",
    "mango",
    "peach",
    "pear",
    "plum",
    "cherry",
    "ginger",
    "cilantro",
    "parsley",
    "basil",
    "mint",
    "thyme",
    "rosemary",
    "dill",
    "scallion",
    "leek",
    "shallot",
    "cabbage",
    "corn",
    "asparagus",
    "green bean",
    "pea",
    "beet",
    "radish",
    "turnip",
    "eggplant",
    "artichoke",
    "fennel",
    "bok choy",
    "arugula",
    "watercress",
    "endive",
    "radicchio",
    "fresh",
    "vegetable",
    "fruit",
    "salad",
    "greens",
    "herb",
  ],
  [INGREDIENT_CATEGORIES.MEAT_SEAFOOD]: [
    "chicken",
    "beef",
    "pork",
    "lamb",
    "turkey",
    "duck",
    "bacon",
    "ham",
    "sausage",
    "steak",
    "ground",
    "fish",
    "salmon",
    "tuna",
    "shrimp",
    "crab",
    "lobster",
    "scallop",
    "mussel",
    "clam",
    "oyster",
    "cod",
    "tilapia",
    "halibut",
    "trout",
    "sardine",
    "anchovy",
    "prosciutto",
    "pancetta",
    "chorizo",
    "meat",
    "seafood",
    "poultry",
    "veal",
    "brisket",
    "ribs",
    "wing",
    "thigh",
    "breast",
    "drumstick",
    "filet",
    "loin",
  ],
  [INGREDIENT_CATEGORIES.DAIRY]: [
    "milk",
    "cheese",
    "butter",
    "cream",
    "yogurt",
    "sour cream",
    "egg",
    "cottage cheese",
    "ricotta",
    "mozzarella",
    "cheddar",
    "parmesan",
    "feta",
    "goat cheese",
    "brie",
    "camembert",
    "gouda",
    "swiss",
    "provolone",
    "cream cheese",
    "mascarpone",
    "half and half",
    "whipping cream",
    "heavy cream",
    "buttermilk",
    "kefir",
    "ghee",
  ],
  [INGREDIENT_CATEGORIES.BAKERY]: [
    "bread",
    "roll",
    "bun",
    "bagel",
    "croissant",
    "muffin",
    "tortilla",
    "pita",
    "naan",
    "flatbread",
    "baguette",
    "ciabatta",
    "sourdough",
    "brioche",
    "english muffin",
    "crouton",
    "breadcrumb",
    "panko",
  ],
  [INGREDIENT_CATEGORIES.PANTRY]: [
    "flour",
    "sugar",
    "salt",
    "oil",
    "olive oil",
    "vegetable oil",
    "canola oil",
    "coconut oil",
    "sesame oil",
    "vinegar",
    "soy sauce",
    "rice",
    "pasta",
    "noodle",
    "bean",
    "lentil",
    "chickpea",
    "quinoa",
    "oat",
    "cereal",
    "granola",
    "nut",
    "almond",
    "walnut",
    "pecan",
    "cashew",
    "peanut",
    "seed",
    "honey",
    "maple syrup",
    "molasses",
    "jam",
    "jelly",
    "peanut butter",
    "almond butter",
    "tahini",
    "tomato sauce",
    "tomato paste",
    "broth",
    "stock",
    "bouillon",
    "canned",
    "dried",
    "baking powder",
    "baking soda",
    "yeast",
    "cornstarch",
    "cocoa",
    "chocolate",
    "vanilla",
    "extract",
    "mustard",
    "ketchup",
    "mayonnaise",
    "hot sauce",
    "worcestershire",
    "coconut milk",
    "condensed milk",
    "evaporated milk",
  ],
  [INGREDIENT_CATEGORIES.FROZEN]: [
    "frozen",
    "ice cream",
    "sorbet",
    "gelato",
    "popsicle",
  ],
  [INGREDIENT_CATEGORIES.BEVERAGES]: [
    "juice",
    "coffee",
    "tea",
    "wine",
    "beer",
    "soda",
    "water",
    "sparkling",
    "tonic",
    "liquor",
    "vodka",
    "rum",
    "whiskey",
    "gin",
    "brandy",
    "vermouth",
    "sake",
    "mirin",
  ],
  [INGREDIENT_CATEGORIES.SPICES]: [
    "pepper",
    "paprika",
    "cumin",
    "coriander",
    "turmeric",
    "cinnamon",
    "nutmeg",
    "clove",
    "cardamom",
    "ginger powder",
    "garlic powder",
    "onion powder",
    "chili powder",
    "cayenne",
    "oregano",
    "basil dried",
    "thyme dried",
    "rosemary dried",
    "bay leaf",
    "sage",
    "tarragon",
    "marjoram",
    "allspice",
    "curry",
    "garam masala",
    "five spice",
    "italian seasoning",
    "herbs de provence",
    "old bay",
    "seasoning",
    "spice",
    "dried herb",
  ],
  [INGREDIENT_CATEGORIES.OTHER]: [],
};

/**
 * Common unit conversions for aggregation
 */
const UNIT_ALIASES: Record<string, string> = {
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tbsps: "tbsp",
  tbs: "tbsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tsps: "tsp",
  cup: "cup",
  cups: "cup",
  ounce: "oz",
  ounces: "oz",
  pound: "lb",
  pounds: "lb",
  lbs: "lb",
  gram: "g",
  grams: "g",
  kilogram: "kg",
  kilograms: "kg",
  milliliter: "ml",
  milliliters: "ml",
  liter: "l",
  liters: "l",
  piece: "piece",
  pieces: "piece",
  slice: "slice",
  slices: "slice",
  clove: "clove",
  cloves: "clove",
  can: "can",
  cans: "can",
  bunch: "bunch",
  bunches: "bunch",
  head: "head",
  heads: "head",
  stalk: "stalk",
  stalks: "stalk",
  sprig: "sprig",
  sprigs: "sprig",
  pinch: "pinch",
  pinches: "pinch",
  dash: "dash",
  dashes: "dash",
  handful: "handful",
  handfuls: "handful",
  package: "package",
  packages: "package",
  pkg: "package",
  jar: "jar",
  jars: "jar",
  bottle: "bottle",
  bottles: "bottle",
  bag: "bag",
  bags: "bag",
  box: "box",
  boxes: "box",
  container: "container",
  containers: "container",
  large: "large",
  medium: "medium",
  small: "small",
};

/**
 * Parses a single ingredient string into structured data
 * Handles formats like "2 cups flour", "1/2 tsp salt", "3 large eggs"
 *
 * @param ingredientStr - Raw ingredient string
 * @returns ParsedIngredient object
 */
export function parseIngredient(ingredientStr: string): ParsedIngredient {
  const original = ingredientStr.trim();
  const fractions: Record<string, string> = {
    "½": "1/2",
    "¼": "1/4",
    "¾": "3/4",
    "⅓": "1/3",
    "⅔": "2/3",
    "⅛": "1/8",
    "⅜": "3/8",
    "⅝": "5/8",
    "⅞": "7/8",
  };
  const normalized = original
    .replace(/(\d)([½¼¾⅓⅔⅛⅜⅝⅞])/g, "$1 $2")
    .replace(/[½¼¾⅓⅔⅛⅜⅝⅞]/g, (v) => fractions[v])
    .toLowerCase();
  // Ambiguous ranges and malformed fractions retain their complete label.
  const match = normalized.match(
    /^(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.\d+|\d+)\s+(.+)$/,
  );
  if (!match)
    return {
      quantity: 0,
      quantityKnown: false,
      unit: "",
      name: original,
      original,
    };
  const quantity = match[1].split(/\s+/).reduce((sum, part) => {
    const [n, d] = part.split("/").map(Number);
    return sum + (d === undefined ? n : n / d);
  }, 0);
  if (!Number.isFinite(quantity))
    return {
      quantity: 0,
      quantityKnown: false,
      unit: "",
      name: original,
      original,
    };
  const words = match[2].split(/\s+/);
  const candidate = words[0].replace(/\.$/, "");
  const unit =
    UNIT_ALIASES[candidate] ||
    (Object.values(UNIT_ALIASES).includes(candidate) ? candidate : "");
  if (unit) words.shift();
  return {
    quantity,
    quantityKnown: true,
    unit,
    name: words.join(" ") || original,
    original,
  };
}

/**
 * Categorizes an ingredient based on its name
 *
 * @param ingredientName - Name of the ingredient
 * @returns Category string
 */
export function categorizeIngredient(
  ingredientName: string,
): IngredientCategory {
  const lowerName = ingredientName.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === INGREDIENT_CATEGORIES.OTHER) continue;

    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category as IngredientCategory;
      }
    }
  }

  return INGREDIENT_CATEGORIES.OTHER;
}

/**
 * Generates a unique key for an ingredient to enable aggregation
 */
function getIngredientKey(parsed: ParsedIngredient): string {
  return `${parsed.name.toLowerCase()}|${parsed.unit.toLowerCase()}`;
}

/**
 * Aggregates ingredients from all recipes in a meal plan
 * Combines duplicate ingredients and sums quantities
 * Requirements: 4.1, 4.2
 *
 * @param meals - Array of meal slots for the period
 * @param recipes - Map of recipe IDs to Recipe objects
 * @returns Array of ShoppingListItem objects grouped by category
 */
export function aggregateIngredients(
  meals: MealSlot[],
  recipes: Map<string, Recipe>,
): ShoppingListItem[] {
  // Map to aggregate ingredients: key -> { parsed, totalQuantity }
  const aggregated = new Map<
    string,
    { parsed: ParsedIngredient; totalQuantity: number }
  >();

  // Process each meal
  for (const meal of meals) {
    if (!meal.recipeId) continue;

    const recipe = recipes.get(meal.recipeId);
    if (!recipe || !recipe.ingredients) continue;

    // Split ingredients by newline or bullet points
    const ingredientLines = recipe.ingredients
      .split(/[\n\r]+|•|·|‣|⁃/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.match(/^[-*]\s*$/));

    for (const line of ingredientLines) {
      // Skip empty lines or section headers
      if (!line || line.endsWith(":")) continue;

      // Remove leading bullets/dashes
      const cleanedLine = line.replace(/^[-*•·‣⁃]\s*/, "").trim();
      if (!cleanedLine) continue;

      const parsed = parseIngredient(cleanedLine);
      const key = getIngredientKey(parsed);

      const existing = aggregated.get(key);
      if (existing) {
        existing.totalQuantity += parsed.quantity;
      } else {
        aggregated.set(key, { parsed, totalQuantity: parsed.quantity });
      }
    }
  }

  // Convert to ShoppingListItem array
  const items: ShoppingListItem[] = [];
  let idCounter = 1;

  for (const { parsed, totalQuantity } of aggregated.values()) {
    const category = categorizeIngredient(parsed.name);

    // Format quantity nicely
    let quantityStr: string;
    if (Number.isInteger(totalQuantity)) {
      quantityStr = totalQuantity.toString();
    } else {
      // Round to 2 decimal places and remove trailing zeros
      quantityStr = totalQuantity.toFixed(2).replace(/\.?0+$/, "");
    }

    items.push({
      id: `item-${idCounter++}`,
      ingredient: parsed.name,
      quantity: parsed.quantityKnown ? quantityStr : "",
      unit: parsed.unit,
      category,
      checked: false,
    });
  }

  // Sort by category, then by ingredient name
  items.sort((a, b) => {
    const categoryOrder = Object.values(INGREDIENT_CATEGORIES);
    const categoryCompare =
      categoryOrder.indexOf(a.category as IngredientCategory) -
      categoryOrder.indexOf(b.category as IngredientCategory);
    if (categoryCompare !== 0) return categoryCompare;
    return a.ingredient.localeCompare(b.ingredient);
  });

  return items;
}

/**
 * Formats a shopping list as a text string for sharing
 * Groups items by category with headers
 * Requirements: 4.4
 *
 * @param items - Array of ShoppingListItem objects
 * @returns Formatted text string
 */
export function formatShoppingList(items: ShoppingListItem[]): string {
  if (items.length === 0) {
    return "Shopping List\n\nNo items in your shopping list.";
  }

  // Group items by category
  const grouped = new Map<string, ShoppingListItem[]>();

  for (const item of items) {
    const categoryItems = grouped.get(item.category) || [];
    categoryItems.push(item);
    grouped.set(item.category, categoryItems);
  }

  // Build formatted string
  const lines: string[] = ["🛒 Shopping List", ""];

  // Sort categories by predefined order
  const categoryOrder = Object.values(INGREDIENT_CATEGORIES);
  const sortedCategories = Array.from(grouped.keys()).sort(
    (a, b) =>
      categoryOrder.indexOf(a as IngredientCategory) -
      categoryOrder.indexOf(b as IngredientCategory),
  );

  for (const category of sortedCategories) {
    const categoryItems = grouped.get(category) || [];
    if (categoryItems.length === 0) continue;

    lines.push(`📦 ${category}`);
    lines.push("─".repeat(20));

    for (const item of categoryItems) {
      const checkbox = item.checked ? "☑" : "☐";
      const quantityUnit = item.unit
        ? `${item.quantity} ${item.unit}`
        : item.quantity;
      lines.push(`${checkbox} ${quantityUnit} ${item.ingredient}`);
    }

    lines.push("");
  }

  return lines.join("\n").trim();
}
