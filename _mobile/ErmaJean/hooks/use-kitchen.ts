import { designPreview, previewRecipes } from "@/utils/design-preview";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Recipe } from "@/types/config";
import { getRecipes } from "@/services/recipeService";
export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRecipes(designPreview ? previewRecipes : await getRecipes());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load recipes.");
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  return { recipes, loading, error, load };
}
