export const metadata = { robots: { index: false, follow: false } };
import Workspace from "@/components/redesign/Workspace";
import { WorkspaceData } from "@/components/redesign/workspace-data";
import { notFound } from "next/navigation";
const recipes = [
  {
    id: "demo-chicken",
    recipe_name: "One-pan chicken & rice",
    description: "Big flavor. One pan. You’re welcome.",
    total_time: "30 min",
    prep_time: "10 min",
    cook_time: "20 min",
    servings: "4",
    difficulty_level: "Easy",
    course: "Dinner",
    ingredients:
      "4 boneless chicken thighs\n1 cup white rice\n2 cups chicken stock\n2 cups spinach\n1 small onion, diced\n1 tbsp olive oil",
    instructions:
      "Season the chicken and brown it in oil in a large pan.\nAdd the onion and rice. Stir in the stock and bring to a simmer.\nCover and cook until the rice is tender and the chicken is cooked through.\nStir in the spinach and serve.",
    calories: 480,
    protein: 35,
    carbs: 46,
    fat: 17,
  },
  {
    id: "demo-pasta",
    recipe_name: "Lemon garlic chicken pasta",
    description: "A little lemon. A lot of flavor.",
    total_time: "25 min",
    prep_time: "10 min",
    cook_time: "15 min",
    servings: "4",
    difficulty_level: "Easy",
    course: "Dinner",
    ingredients: "300 g pasta\n2 chicken breasts\n1 lemon",
    instructions:
      "Cook the pasta.\nCook the chicken and combine with lemon and pasta.",
  },
  {
    id: "demo-bowl",
    recipe_name: "Chickpea power bowls",
    description: "Fresh, filling, and full of flavor.",
    total_time: "15 min",
    prep_time: "10 min",
    cook_time: "5 min",
    servings: "2",
    difficulty_level: "Easy",
    course: "Lunch",
    ingredients: "1 can chickpeas\n2 cups spinach",
    instructions:
      "Warm the chickpeas.\nServe with spinach and your favorite dressing.",
  },
  {
    id: "demo-tacos",
    recipe_name: "Sheet pan chicken tacos",
    description: "A weeknight keeper.",
    total_time: "30 min",
    prep_time: "10 min",
    cook_time: "20 min",
    servings: "4",
    difficulty_level: "Easy",
    course: "Dinner",
    ingredients: "8 tortillas\n2 chicken breasts\n2 bell peppers",
    instructions:
      "Cook the chicken and peppers.\nFill warm tortillas and serve.",
  },
];
export default function Page({ params }: { params: { screen: string } }) {
  if (!["kitchen", "recipes", "recipe", "plan", "shop"].includes(params.screen))
    notFound();
  const data: WorkspaceData = {
    preview: true,
    userId: "preview",
    profile: { name: "Jordan", email: "", has_access: false },
    recipes,
    meals: [
      {
        id: "m1",
        date: "2026-09-21",
        meal_type: "Dinner",
        recipe_id: "demo-chicken",
      },
      {
        id: "m2",
        date: "2026-09-23",
        meal_type: "Dinner",
        recipe_id: "demo-bowl",
      },
      {
        id: "m3",
        date: "2026-09-25",
        meal_type: "Dinner",
        recipe_id: "demo-pasta",
      },
    ],
  };
  return (
    <Workspace
      view={params.screen as "kitchen" | "recipes" | "recipe" | "plan" | "shop"}
      data={data}
      recipeId="demo-chicken"
    />
  );
}
