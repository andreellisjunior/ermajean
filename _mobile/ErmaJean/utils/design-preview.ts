import { Recipe } from "@/types/config";
/** Local visual review only. Never enabled in production builds. */
export const designPreview =
  __DEV__ && process.env.EXPO_PUBLIC_DESIGN_PREVIEW === "true";
export const previewRecipes: Recipe[] = [
  {
    id: "preview-chicken",
    recipe_name: "One-pan chicken & rice",
    description: "Big flavor. One pan. Dinner, handled.",
    total_time: "20 min",
    prep_time: "5 min",
    cook_time: "15 min",
    servings: "4",
    difficulty_level: "Easy",
    course: "Dinner",
    ingredients: "1 lb chicken\n1 cup white rice\n2 cups spinach",
    instructions:
      "Season the chicken.\nWarm oil in a pan. Add the seasoned chicken and turn halfway through browning.\nAdd rice and stock. Cover and cook until rice is tender and chicken is safely cooked through.\nFold in spinach and serve.",
    calories: 520,
    protein: 34,
  },
  {
    id: "preview-pasta",
    recipe_name: "Lemon garlic chicken pasta",
    description: "A good shortcut worth keeping.",
    total_time: "25 min",
    prep_time: "10 min",
    cook_time: "15 min",
    servings: "4",
    difficulty_level: "Easy",
    course: "Dinner",
    ingredients: "Chicken\nPasta\nLemon",
    instructions: "Cook pasta.\nCook chicken thoroughly.\nCombine and season.",
  },
  {
    id: "preview-chickpea",
    recipe_name: "Chickpea power bowls",
    description: "Fresh. Fast. Flexible.",
    total_time: "15 min",
    prep_time: "10 min",
    cook_time: "5 min",
    servings: "2",
    difficulty_level: "Easy",
    course: "Dinner",
    ingredients: "Chickpeas\nSpinach\nRice",
    instructions: "Warm chickpeas.\nBuild your bowls.",
  },
];
export const previewImages: Record<string, number> = {
  "preview-chicken": require("@/assets/redesign/chicken-rice.png"),
  "preview-pasta": require("@/assets/redesign/chicken-pasta.png"),
  "preview-chickpea": require("@/assets/redesign/chickpea-bowl.png"),
};
