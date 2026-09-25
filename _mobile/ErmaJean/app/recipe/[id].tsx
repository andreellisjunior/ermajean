import { useKitchenPreferences } from "@/hooks/use-kitchen-preferences";
import { UpgradeSheet } from "@/components/redesign/upgrade-sheet";
import { isAxiosError } from "axios";
import { RecipeFormModal } from "@/components/RecipeFormModal";
import { RecipeNotes } from "@/components/redesign/recipe-notes";
import apiClient from "@/libs/api";
import { Image } from "expo-image";
import {
  designPreview,
  previewRecipes,
  previewImages,
} from "@/utils/design-preview";
import { useEffect, useState } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Page,
  Title,
  S,
  C,
  Action,
  Tip,
  Status,
} from "@/components/redesign/ui";
import {
  getRecipeById,
  deleteRecipe,
  updateRecipe,
} from "@/services/recipeService";
import { Recipe } from "@/types/config";
export default function RecipeDetail() {
  const { preferences } = useKitchenPreferences();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState("Ingredients");
  const [checked, setChecked] = useState<number[]>([]);
  const [upgrade, setUpgrade] = useState(false);
  const [nutritionBusy, setNutritionBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = designPreview
        ? previewRecipes.find((r) => r.id === id)
        : await getRecipeById(id);
      if (!data) throw Error("This recipe could not be found.");
      setRecipe(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [id]);
  return (
    <Page back="Back">
      <Status {...{ loading, error, onRetry: load }} />
      {recipe && (
        <>
          {designPreview && previewImages[id] && (
            <Image
              source={previewImages[id]}
              style={{ height: 230, borderRadius: 18 }}
              contentFit="cover"
            />
          )}
          <Text style={S.small}>YOUR KEEPER</Text>
          <Title>{recipe.recipe_name}</Title>
          <Text style={S.body}>{recipe.description}</Text>
          <Text style={S.body}>
            {recipe.total_time} · {recipe.difficulty_level} · Serves{" "}
            {recipe.servings}
          </Text>
          <View style={S.row}>
            {["Ingredients", "Steps", "Notes"].map((value) => (
              <Pressable
                key={value}
                onPress={() => setTab(value)}
                style={{
                  flex: 1,
                  minHeight: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottomWidth: 2,
                  borderColor: tab === value ? C.green : C.line,
                }}
              >
                <Text style={S.body}>{value}</Text>
              </Pressable>
            ))}
          </View>
          {tab !== "Notes" &&
            (tab === "Ingredients" ? recipe.ingredients : recipe.instructions)
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <Pressable
                  key={i}
                  accessibilityRole={
                    tab === "Ingredients" ? "checkbox" : undefined
                  }
                  accessibilityState={
                    tab === "Ingredients"
                      ? { checked: checked.includes(i) }
                      : undefined
                  }
                  onPress={() =>
                    tab === "Ingredients" &&
                    setChecked(
                      checked.includes(i)
                        ? checked.filter((n) => n !== i)
                        : [...checked, i],
                    )
                  }
                  style={[S.row, { minHeight: 48, alignItems: "flex-start" }]}
                >
                  <Text style={S.body}>
                    {tab === "Ingredients"
                      ? checked.includes(i)
                        ? "☑"
                        : "□"
                      : `${i + 1}.`}
                  </Text>
                  <Text
                    style={[
                      S.body,
                      {
                        flex: 1,
                        textDecorationLine:
                          tab === "Ingredients" && checked.includes(i)
                            ? "line-through"
                            : "none",
                      },
                    ]}
                  >
                    {line}
                  </Text>
                </Pressable>
              ))}
          {tab === "Notes" && <RecipeNotes recipeId={id} />}
          <Action
            secondary
            label="Edit recipe"
            onPress={() => setEditing(true)}
          />
          <RecipeFormModal
            visible={editing}
            initialRecipe={recipe}
            onClose={() => setEditing(false)}
            onSubmit={async (input) => {
              if (designPreview)
                throw Error("Preview only — no changes saved.");
              setRecipe(await updateRecipe(id, input));
              setEditing(false);
            }}
          />
          <Tip>
            Read it through, get your ingredients ready, then make it your own.
          </Tip>
          {preferences.nutrition && recipe.calories != null && (
            <Text style={S.small}>
              Estimated per serving: {recipe.calories} kcal ·{" "}
              {recipe.protein ?? "—"}g protein. Check the recipe’s serving
              basis.
            </Text>
          )}
          {preferences.nutrition && recipe.calories == null && (
            <Action
              secondary
              label={nutritionBusy ? "Estimating…" : "Estimate nutrition"}
              disabled={nutritionBusy || designPreview}
              onPress={async () => {
                setNutritionBusy(true);
                try {
                  const estimates = await apiClient.post<
                    never,
                    Partial<Recipe>
                  >("/recipes/macros", {
                    recipeId: id,
                    servings: recipe.servings,
                  });
                  setRecipe({ ...recipe, ...estimates });
                } catch (e) {
                  if (isAxiosError(e) && e.response?.status === 403)
                    setUpgrade(true);
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Could not estimate nutrition.",
                  );
                } finally {
                  setNutritionBusy(false);
                }
              }}
            />
          )}
          <Action
            label="Let’s cook"
            onPress={() => router.push(`/cook/${id}`)}
          />
          <Action
            secondary
            label="Add to plan"
            onPress={() =>
              router.push({
                pathname: "/(tabs)/meal-plans",
                params: { recipeId: id },
              })
            }
          />
          <Action
            secondary
            label="Share recipe"
            onPress={() =>
              void Share.share({
                message: `${recipe.recipe_name}\n\n${recipe.ingredients}\n\n${recipe.instructions}`,
              })
            }
          />
          <Pressable
            style={{ minHeight: 48, justifyContent: "center" }}
            onPress={() => setConfirm(!confirm)}
          >
            <Text style={[S.small, { textAlign: "center", color: C.tomato }]}>
              Delete recipe
            </Text>
          </Pressable>
          {confirm && (
            <View style={S.card}>
              <Text style={S.body}>Delete this keeper permanently?</Text>
              <Action
                label="Yes, delete recipe"
                onPress={async () => {
                  try {
                    if (designPreview) {
                      setError("Preview only — no changes saved.");
                      return;
                    }
                    await deleteRecipe(id);
                    router.replace("/(tabs)/recipes");
                  } catch (e) {
                    setError(String(e));
                  }
                }}
              />
              <Action
                secondary
                label="Keep it"
                onPress={() => setConfirm(false)}
              />
            </View>
          )}
        </>
      )}
      <UpgradeSheet visible={upgrade} onClose={() => setUpgrade(false)} />
    </Page>
  );
}
