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

export interface BonusRecipe {
  title: string;
  emoji: string;
  servings: number;
  desc: string;
  ingredients: string[];
  steps: string[];
}

export type MedGuideEntry = [title: string, text: string];

const flavors: [string, string[]][] = [
  ["Lemon Herb", ["lemon", "parsley", "garlic"]],
  ["Garlic Parmesan", ["garlic", "parmesan", "black pepper"]],
  ["Cinnamon Vanilla", ["cinnamon", "vanilla"]],
  ["Chocolate Almond", ["cocoa", "almond"]],
  ["Berry Yogurt", ["berries", "plain Greek yogurt"]],
  ["Roasted Pepper", ["red pepper", "smoked paprika"]],
  ["Apple Cinnamon", ["apple", "cinnamon"]],
  ["Coconut Lime", ["coconut", "lime"]],
  ["Mocha", ["cocoa", "espresso"]],
  ["Pumpkin Spice", ["pumpkin", "cinnamon", "nutmeg"]],
  ["Tomato Basil", ["tomato", "basil", "garlic"]],
  ["Mediterranean", ["olive oil", "oregano", "lemon"]],
  ["Ginger Sesame", ["ginger", "sesame", "tamari"]],
  ["Blueberry Lemon", ["blueberries", "lemon"]],
  ["Peanut Cocoa", ["peanut butter", "cocoa"]],
  ["Herbed Cheddar", ["cheddar", "chives", "black pepper"]],
  ["Strawberry Vanilla", ["strawberries", "vanilla"]],
  ["Mushroom Thyme", ["mushroom", "thyme", "garlic"]],
  ["Spiced Pecan", ["pecans", "cinnamon", "nutmeg"]],
  ["Orange Ginger", ["orange zest", "ginger"]],
];

const cfg: Record<
  string,
  {
    count: number;
    emoji: string;
    time: string;
    base: string[];
    steps: string[];
  }
> = {
  Breakfast: {
    count: 55,
    emoji: "🍳",
    time: "20–30 min",
    base: [
      "2 large eggs",
      "1/2 cup plain Greek yogurt",
      "1/2 cup rolled oats",
      "1 tbsp chia seeds",
      "Pinch of salt",
    ],
    steps: [
      "Combine the base ingredients until evenly mixed.",
      "Fold in the flavor ingredients.",
      "Cook or bake until set and lightly golden.",
      "Rest for 5 minutes before serving.",
    ],
  },
  Breads: {
    count: 55,
    emoji: "🍞",
    time: "40–55 min",
    base: [
      "1 1/2 cups almond flour",
      "1/2 cup finely ground oats",
      "2 tsp baking powder",
      "2 large eggs",
      "3/4 cup plain Greek yogurt",
      "2 tbsp olive oil",
      "Pinch of salt",
    ],
    steps: [
      "Heat oven to 350°F (175°C).",
      "Whisk dry ingredients.",
      "Whisk eggs, yogurt and oil separately.",
      "Combine gently and fold in flavor ingredients.",
      "Transfer to a lined loaf or small baking pan.",
      "Bake until the center is set, then cool before slicing.",
    ],
  },
  "Main Dishes": {
    count: 80,
    emoji: "🥗",
    time: "25–35 min",
    base: [
      "4 oz lean protein of choice",
      "1 cup non-starchy vegetables",
      "1/2 cup beans, lentils, or whole grain",
      "1 tbsp olive oil",
      "Salt and pepper to taste",
    ],
    steps: [
      "Prepare the protein and vegetables.",
      "Add the flavor ingredients and seasoning.",
      "Cook until the protein is done and vegetables are tender-crisp.",
      "Serve with the measured whole-food carbohydrate portion.",
    ],
  },
  Desserts: {
    count: 80,
    emoji: "🍰",
    time: "30–45 min",
    base: [
      "1 cup almond flour",
      "2 large eggs",
      "1/2 cup plain Greek yogurt",
      "Baking sweetener to taste",
      "1 tsp vanilla",
    ],
    steps: [
      "Heat oven to 350°F (175°C) when baking is required.",
      "Mix dry ingredients.",
      "Whisk wet ingredients separately.",
      "Combine gently and fold in flavor ingredients.",
      "Bake or chill until set, depending on the recipe.",
      "Cool before portioning.",
    ],
  },
  Snacks: {
    count: 45,
    emoji: "🥜",
    time: "10–15 min",
    base: [
      "1/2 cup nuts or seeds",
      "1/2 cup plain Greek yogurt or cottage cheese",
      "1 tbsp chia or ground flax",
      "Pinch of salt",
    ],
    steps: [
      "Combine the base ingredients.",
      "Add the flavor ingredients.",
      "Portion into small servings.",
      "Chill or serve immediately as noted.",
    ],
  },
  "Soups & Bowls": {
    count: 35,
    emoji: "🥣",
    time: "30–40 min",
    base: [
      "1 cup low-sodium broth",
      "1 cup non-starchy vegetables",
      "1/2 cup beans or lentils",
      "3 oz lean protein",
      "1 tsp olive oil",
    ],
    steps: [
      "Warm the oil and aromatics.",
      "Add vegetables and cook briefly.",
      "Add broth, protein and beans or lentils.",
      "Simmer until tender and season to taste.",
    ],
  },
  Drinks: {
    count: 25,
    emoji: "🥤",
    time: "5 min",
    base: [
      "1 cup unsweetened milk or fortified alternative",
      "1/2 cup ice",
      "1 tbsp chia seeds or ground flax",
      "Sweetener to taste if desired",
    ],
    steps: [
      "Add all ingredients to a blender.",
      "Blend until smooth.",
      "Taste and adjust flavor without over-sweetening.",
      "Serve immediately.",
    ],
  },
  Sides: {
    count: 25,
    emoji: "🥦",
    time: "15–25 min",
    base: [
      "2 cups non-starchy vegetables",
      "1 tbsp olive oil",
      "1 tsp vinegar or lemon juice",
      "Salt and pepper to taste",
    ],
    steps: [
      "Prepare the vegetables.",
      "Add the flavor ingredients.",
      "Roast, sauté, steam or toss as appropriate.",
      "Season and serve.",
    ],
  },
};

export const CATEGORIES = Object.keys(cfg);

const singular: Record<string, string> = {
  Breakfast: "Breakfast",
  Breads: "Bread",
  "Main Dishes": "Plate",
  Desserts: "Dessert",
  Snacks: "Snack",
  "Soups & Bowls": "Bowl",
  Drinks: "Drink",
  Sides: "Side",
};
const suffixes = [
  "",
  "Classic",
  "Family",
  "Quick",
  "Weeknight",
  "Fresh",
  "Comfort",
  "Simple",
];
const notes = [
  "Pair the portion with protein, fiber, and vegetables when appropriate.",
  "Sweetener strength varies by brand; follow the package conversion.",
  "For more predictable portions, measure the finished recipe before serving.",
  "Choose unsweetened ingredients whenever possible.",
  "If you manage diabetes, fit the carbohydrate portion to your individual care plan.",
  "Let baked recipes cool before slicing for the cleanest texture.",
];

export const recipes: Recipe[] = [];
let id = 1;
Object.entries(cfg).forEach(([cat, c]) => {
  for (let i = 0; i < c.count; i++) {
    const f = flavors[i % flavors.length];
    const cycle = Math.floor(i / flavors.length);
    const suffix = suffixes[cycle] || "Variation " + (cycle + 1);
    const title = f[0] + " " + singular[cat] + (suffix ? " — " + suffix : "");
    recipes.push({
      id: id++,
      title,
      cat,
      level: "Easy",
      time: c.time,
      emoji: c.emoji,
      servings: 4,
      desc:
        "A " +
        f[0].toLowerCase() +
        " " +
        singular[cat].toLowerCase() +
        " built around protein, fiber, and measured portions.",
      ingredients: [...c.base, ...f[1].map((x) => "Flavor: " + x)],
      steps: [...c.steps],
      note: notes[i % notes.length],
    });
  }
});

export const metabolic: BonusRecipe[] = Array.from({ length: 24 }, (_, i) => {
  const f = flavors[(i + 3) % flavors.length];
  return {
    title: f[0] + " High-Protein Bowl",
    emoji: "⭐",
    servings: 2,
    desc: "A protein- and fiber-forward meal idea built around measured portions and everyday ingredients.",
    ingredients: [
      "4 oz lean protein",
      "1 cup non-starchy vegetables",
      "1/2 cup beans or lentils",
      "1 tbsp olive oil",
      ...f[1].map((x) => "Flavor: " + x),
    ],
    steps: [
      "Cook the protein.",
      "Prepare the vegetables.",
      "Add beans or lentils.",
      "Finish with the flavor ingredients and portion into a bowl.",
    ],
  };
});

export const medGuide: MedGuideEntry[] = [
  [
    "Before changing any medication",
    "Do not stop, reduce, or replace a prescribed medicine because of a recipe, supplement, tea, or online guide. Speak with the prescriber or pharmacist first.",
  ],
  [
    "Glucose-lowering medicines",
    "Some medicines can increase the risk of low blood sugar when meals, carbohydrate intake, exercise, or weight change. Ask your clinician how your plan should be adjusted.",
  ],
  [
    "Blood thinners",
    "Certain foods, herbs, and supplements can interact with anticoagulant or antiplatelet medicines. Consistency and professional guidance matter.",
  ],
  [
    "Blood-pressure medicines",
    "Some supplements, salt substitutes, and herbal products can affect blood pressure or potassium. Check before combining them.",
  ],
  [
    "Kidney or liver conditions",
    "Herbal products and supplements may need extra caution because clearance and dosing can change.",
  ],
  [
    "Stimulants and weight-loss products",
    "Products marketed for energy or weight loss can affect heart rate, blood pressure, sleep, or medication response.",
  ],
  [
    "What to ask your pharmacist",
    "Bring a complete list of prescriptions, OTC medicines, vitamins, teas, herbs, and supplements and ask about interactions and timing.",
  ],
  [
    "Emergency warning",
    "Seek urgent medical help for severe allergic reactions, fainting, chest pain, confusion, or symptoms of severe low blood sugar.",
  ],
];

export const goldenTea = {
  ingredients: [
    "1 cup unsweetened milk or fortified alternative",
    "1/2 tsp ground turmeric",
    "1/4 tsp ground cinnamon",
    "Small pinch of ground ginger",
    "Tiny pinch of black pepper",
    "Sweetener to taste, optional",
  ],
  steps: [
    "Warm the milk gently without boiling.",
    "Whisk in turmeric, cinnamon, ginger, and black pepper.",
    "Simmer very gently for 2–3 minutes.",
    "Taste and add a small amount of sweetener if desired.",
    "Serve warm.",
  ],
  note: "This is a culinary tea recipe, not a treatment for diabetes or any medical condition. Check with a clinician or pharmacist if you use medications or supplements that may interact with herbs or spices.",
};

export const shopping: Record<string, string[]> = {
  Protein: [
    "Eggs",
    "Chicken breast",
    "Lean turkey",
    "Plain Greek yogurt",
    "Cottage cheese",
    "Tuna or salmon",
    "Beans",
    "Lentils",
  ],
  "High-Fiber Pantry": [
    "Rolled oats",
    "Chia seeds",
    "Ground flax",
    "Almond flour",
    "Whole grains",
    "Nuts",
    "Seeds",
  ],
  Produce: [
    "Leafy greens",
    "Broccoli",
    "Cauliflower",
    "Peppers",
    "Tomatoes",
    "Berries",
    "Lemons",
    "Mushrooms",
  ],
  "Flavor & Basics": [
    "Olive oil",
    "Garlic",
    "Cinnamon",
    "Ginger",
    "Turmeric",
    "Vanilla",
    "Unsweetened cocoa",
    "Low-sodium broth",
  ],
};
