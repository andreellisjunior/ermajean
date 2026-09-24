import { useKitchenPreferences } from "@/hooks/use-kitchen-preferences";
import { UpgradeSheet } from "@/components/redesign/upgrade-sheet";
import { isAxiosError } from "axios";
import { designPreview } from "@/utils/design-preview";
import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import {
  Page,
  Title,
  S,
  C,
  Action,
  Tip,
  Field,
} from "@/components/redesign/ui";
import apiClient from "@/libs/api";
import { createRecipe } from "@/services/recipeService";
import { RecipeInput } from "@/types/config";
export default function Generate() {
  const { preferences: defaults } = useKitchenPreferences();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [time, setTime] = useState(20);
  const [servings, setServings] = useState(4);
  const [preferences, setPreferences] = useState("");
  const [busy, setBusy] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<RecipeInput[]>([]);
  useEffect(() => {
    setPreferences(defaults.dietary);
  }, [defaults.dietary]);
  async function generate() {
    if (designPreview) {
      setError("Preview only — sign in to generate a real dinner.");
      return;
    }
    const all = [
      ...ingredients,
      ...input
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    ];
    if (!all.length) {
      setError("Add an ingredient and we’ll work with it.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const response = await apiClient.post("/generate-recipe", {
        ingredients: all,
        taste: "",
        total_time: `${time} minutes`,
        serving: String(servings),
        course: "Dinner",
        restrictions: preferences.split(",").filter(Boolean),
      });
      if (!Array.isArray(response) || !response.length)
        throw Error("No recipes came back. Try a different combination.");
      setDrafts(response);
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 403) setUpgrade(true);
      setError(
        e instanceof Error ? e.message : "Could not find dinner. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function save(draft: RecipeInput) {
    setBusy(true);
    setError("");
    try {
      const recipe = await createRecipe(draft);
      router.replace(`/recipe/${recipe.id}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page back="Kitchen">
      <Title>What are we{"\n"}working with?</Title>
      <Tip>Start with what needs using.</Tip>
      <Text style={S.heading}>Ingredients</Text>
      <Field
        value={input}
        onChangeText={setInput}
        placeholder="Add an ingredient"
        accessibilityLabel="Ingredient"
        onSubmitEditing={() => {
          if (input.trim()) {
            setIngredients([...ingredients, input.trim()]);
            setInput("");
          }
        }}
      />
      <Action
        secondary
        label="+ Add ingredient"
        onPress={() => {
          if (input.trim()) {
            setIngredients([...ingredients, input.trim()]);
            setInput("");
          }
        }}
      />
      <View style={[S.row, { flexWrap: "wrap" }]}>
        {ingredients.map((ingredient, i) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${ingredient}`}
            key={`${ingredient}-${i}`}
            onPress={() =>
              setIngredients(ingredients.filter((_, n) => n !== i))
            }
            style={{
              padding: 12,
              backgroundColor: C.sage,
              borderRadius: 24,
              minHeight: 48,
            }}
          >
            <Text style={S.body}>{ingredient} ×</Text>
          </Pressable>
        ))}
      </View>
      <Text style={S.heading}>Time</Text>
      <View style={S.row}>
        {[15, 20, 30].map((value) => (
          <Pressable
            accessibilityRole="radio"
            aria-checked={time === value}
            accessibilityState={{ checked: time === value }}
            key={value}
            onPress={() => setTime(value)}
            style={{
              flex: 1,
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 24,
              backgroundColor: time === value ? C.green : C.sage,
            }}
          >
            <Text style={[S.body, { color: time === value ? C.white : C.ink }]}>
              {value} min
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={S.heading}>Servings</Text>
      <View style={S.row}>
        <Action
          label="−"
          secondary
          disabled={servings === 1}
          onPress={() => setServings(servings - 1)}
        />
        <Text style={S.heading}>{servings}</Text>
        <Action
          label="+"
          secondary
          disabled={servings === 12}
          onPress={() => setServings(servings + 1)}
        />
      </View>
      <Text style={S.heading}>Preferences</Text>
      <Field
        value={preferences}
        onChangeText={setPreferences}
        placeholder="No dairy, mild spice…"
        accessibilityLabel="Dietary preferences"
      />
      <Text style={S.small}>
        AI suggestions · Check ingredients and cooking instructions before
        cooking.
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={[S.body, { color: C.tomato }]}>
          {error}
        </Text>
      )}
      <Action
        label={busy ? "Working on it…" : "Find my dinner →"}
        disabled={busy}
        onPress={() => void generate()}
      />
      {drafts.map((draft, i) => (
        <View key={i} style={S.card}>
          <Text style={S.small}>AI DRAFT</Text>
          <Text style={S.heading}>{draft.recipe_name}</Text>
          <Text style={S.body}>{draft.description}</Text>
          <Text style={S.small}>
            {draft.total_time} · Serves {draft.servings}
          </Text>
          <Text style={S.body}>{draft.ingredients}</Text>
          <Text style={S.body}>{draft.instructions}</Text>
          <Action
            label="Save this keeper"
            disabled={busy}
            onPress={() => void save(draft)}
          />
        </View>
      ))}
      <UpgradeSheet visible={upgrade} onClose={() => setUpgrade(false)} />
    </Page>
  );
}
