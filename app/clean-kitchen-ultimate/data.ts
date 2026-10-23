export interface Recipe {
  id: number;
  title: string;
  cat: string;
  level: string;
  time: string;
  emoji: string;
  servings: number;
  desc: string;
  ingredients: string[];
  steps: string[];
  note: string;
}

export type Bonus = [emoji: string, title: string, text: string];

const flavors: [string, string[]][] = [
  ["Lemon Herb", ["lemon", "parsley", "garlic"]],
  ["Garlic Parmesan", ["garlic", "parmesan", "black pepper"]],
  ["Mediterranean", ["olive oil", "oregano", "lemon"]],
  ["Tomato Basil", ["tomato", "basil", "garlic"]],
  ["Ginger Sesame", ["ginger", "sesame", "tamari"]],
  ["Smoky Paprika", ["smoked paprika", "garlic", "lemon"]],
  ["Coconut Lime", ["coconut", "lime"]],
  ["Rosemary Garlic", ["rosemary", "garlic", "olive oil"]],
  ["Chili Lime", ["lime", "mild chili seasoning"]],
  ["Mustard Herb", ["mustard", "vinegar", "herbs"]],
  ["Cinnamon Vanilla", ["cinnamon", "vanilla"]],
  ["Apple Cinnamon", ["apple", "cinnamon"]],
  ["Blueberry Lemon", ["blueberries", "lemon"]],
  ["Strawberry Vanilla", ["strawberries", "vanilla"]],
  ["Chocolate Almond", ["cocoa", "almond"]],
  ["Mocha", ["cocoa", "espresso"]],
  ["Pumpkin Spice", ["pumpkin", "cinnamon", "nutmeg"]],
  ["Spiced Pecan", ["pecans", "cinnamon", "nutmeg"]],
  ["Orange Ginger", ["orange zest", "ginger"]],
  ["Berry Yogurt", ["mixed berries", "plain Greek yogurt"]],
];
const styles = [
  "Classic",
  "Quick",
  "Family",
  "Fresh",
  "Weeknight",
  "Comfort",
  "Simple",
  "Prep-Friendly",
  "Weekend",
  "Everyday",
  "Light",
  "Homestyle",
  "Protein-Forward",
  "Fiber-Focused",
  "Freezer-Friendly",
  "Lunchbox",
  "30-Minute",
  "One-Bowl",
  "Budget-Friendly",
  "Chef's Pick",
];
const categoryConfig: Record<
  string,
  {
    emoji: string;
    time: string;
    servings: number;
    base: string[];
    steps: string[];
  }
> = {
  Breakfast: {
    emoji: "🍳",
    time: "15–25 min",
    servings: 2,
    base: [
      "2 large eggs",
      "1/2 cup plain Greek yogurt",
      "1/2 cup rolled oats",
      "1 tbsp chia seeds",
      "Pinch of salt",
    ],
    steps: [
      "Combine the base ingredients.",
      "Fold in flavor ingredients.",
      "Cook or bake until set.",
      "Rest 5 minutes and serve.",
    ],
  },
  Breads: {
    emoji: "🍞",
    time: "40–55 min",
    servings: 8,
    base: [
      "1 1/2 cups almond flour",
      "1/2 cup finely ground oats",
      "2 tsp baking powder",
      "2 large eggs",
      "3/4 cup plain Greek yogurt",
      "2 tbsp olive oil",
    ],
    steps: [
      "Heat oven to 350°F (175°C).",
      "Whisk dry ingredients.",
      "Whisk wet ingredients.",
      "Combine gently.",
      "Bake until set and cool before slicing.",
    ],
  },
  Lunches: {
    emoji: "🥙",
    time: "20–30 min",
    servings: 2,
    base: [
      "6 oz lean protein",
      "2 cups non-starchy vegetables",
      "1 cup beans, lentils, or whole grain",
      "1 tbsp olive oil",
    ],
    steps: [
      "Prepare protein and vegetables.",
      "Add flavor ingredients.",
      "Cook until done.",
      "Divide into two portions.",
    ],
  },
  Dinners: {
    emoji: "🍽️",
    time: "30–45 min",
    servings: 4,
    base: [
      "1 lb lean protein",
      "4 cups vegetables",
      "2 cups beans, lentils, or whole grain",
      "1 1/2 tbsp olive oil",
    ],
    steps: [
      "Prepare ingredients.",
      "Season.",
      "Cook until done.",
      "Divide into four portions.",
    ],
  },
  "Air Fryer": {
    emoji: "♨️",
    time: "15–25 min",
    servings: 4,
    base: ["1 lb lean protein or vegetables", "1 tbsp olive oil", "Salt and pepper"],
    steps: [
      "Preheat if needed.",
      "Season ingredients.",
      "Arrange in a single layer.",
      "Air fry until browned and cooked through.",
    ],
  },
  "Slow Cooker": {
    emoji: "🥘",
    time: "4–7 hr",
    servings: 6,
    base: [
      "1 1/2 lb lean protein or beans",
      "4 cups vegetables",
      "2 cups low-sodium broth",
      "1 tbsp olive oil",
    ],
    steps: [
      "Add ingredients to slow cooker.",
      "Add flavor ingredients.",
      "Cook on low until tender.",
      "Adjust seasoning and serve.",
    ],
  },
  "One-Pot & Sheet Pan": {
    emoji: "🍲",
    time: "25–40 min",
    servings: 4,
    base: [
      "1 lb lean protein",
      "4 cups vegetables",
      "1 cup whole grain or beans",
      "1 tbsp olive oil",
    ],
    steps: [
      "Prepare ingredients.",
      "Add to one pot or sheet pan.",
      "Season.",
      "Cook until done.",
    ],
  },
  Snacks: {
    emoji: "🥜",
    time: "10–15 min",
    servings: 4,
    base: [
      "1/2 cup nuts or seeds",
      "1 cup plain Greek yogurt or cottage cheese",
      "1 tbsp chia or ground flax",
    ],
    steps: ["Combine ingredients.", "Add flavor ingredients.", "Portion.", "Chill or serve."],
  },
  "Soups & Salads": {
    emoji: "🥣",
    time: "20–35 min",
    servings: 4,
    base: [
      "4 cups non-starchy vegetables",
      "2 cups low-sodium broth or leafy greens",
      "1 cup beans or lentils",
      "8 oz lean protein",
      "1 tbsp olive oil",
    ],
    steps: [
      "Prepare ingredients.",
      "Add flavor ingredients.",
      "Simmer or toss.",
      "Divide into four portions.",
    ],
  },
  "Drinks & Smoothies": {
    emoji: "🥤",
    time: "5 min",
    servings: 2,
    base: [
      "2 cups unsweetened milk or fortified alternative",
      "1 cup ice",
      "2 tbsp chia or ground flax",
    ],
    steps: ["Add to blender.", "Blend smooth.", "Taste and adjust.", "Serve immediately."],
  },
};

export const CATEGORIES = Object.keys(categoryConfig);

export const recipes: Recipe[] = [];
let recipeId = 1;
Object.entries(categoryConfig).forEach(([cat, cfg]) => {
  flavors.forEach((flavor) => {
    styles.forEach((style) => {
      recipes.push({
        id: recipeId++,
        title: `${flavor[0]} ${cat} — ${style}`,
        cat,
        level: style === "Weekend" || style === "Chef's Pick" ? "Medium" : "Easy",
        time: cfg.time,
        emoji: cfg.emoji,
        servings: cfg.servings,
        desc: `A ${flavor[0].toLowerCase()} ${cat.toLowerCase()} recipe idea with a ${style.toLowerCase()} approach.`,
        ingredients: [...cfg.base, ...flavor[1].map((x) => "Flavor: " + x)],
        steps: [...cfg.steps],
        note: "Adjust ingredient brands, seasoning and portions to fit your household.",
      });
    });
  });
});

export const bonuses: Bonus[] = [
  ["♨️", "Air Fryer Master Guide", "Timing, texture tips, batch cooking and reheating."],
  ["👨‍👩‍👧‍👦", "Family Meals Guide", "Scaling meals and reducing extra cooking."],
  ["⏱️", "20-Minute Meals", "Faster meal-building strategies."],
  ["❄️", "Freezer Meals Guide", "Freezing, labeling and reheating basics."],
  ["🔁", "Ingredient Substitution Guide", "Common kitchen substitutions and cautions."],
  ["🥫", "Pantry Essentials Guide", "Starter staples for everyday cooking."],
  ["🍳", "30-Day Breakfast Plan", "A month of rotating breakfast ideas."],
  ["🍽️", "30-Day Dinner Plan", "A month of organized dinner ideas."],
  ["🎉", "Holiday Recipe Collection", "Special-occasion meal ideas."],
  ["🍴", "Eating Out Guide", "Planning and portion-awareness tips."],
];
