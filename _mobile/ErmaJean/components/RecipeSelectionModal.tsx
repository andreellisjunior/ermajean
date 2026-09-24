import { useCallback, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Recipe } from "@/types/config";
import { filterRecipes } from "@/utils/recipeSearch";
import { Haptic } from "@/utils/haptics";
import { Sheet } from "./redesign/sheet";
import { S, C, Field, Action } from "./redesign/ui";
export interface RecipeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  recipes: Recipe[];
  mealType: "Breakfast" | "Lunch" | "Dinner";
  date: string;
}
export function RecipeSelectionModal({
  visible,
  onClose,
  onSelect,
  recipes,
  mealType,
  date,
}: RecipeSelectionModalProps) {
  const [query, setQuery] = useState("");
  const close = () => {
    setQuery("");
    onClose();
  };
  const filtered = useMemo(
    () =>
      filterRecipes(recipes, query).sort(
        (a, b) =>
          Number(b.course?.toLowerCase() === mealType.toLowerCase()) -
            Number(a.course?.toLowerCase() === mealType.toLowerCase()) ||
          a.recipe_name.localeCompare(b.recipe_name),
      ),
    [recipes, query, mealType],
  );
  const choose = useCallback(
    (recipe: Recipe) => {
      Haptic.selection();
      onSelect(recipe);
      setQuery("");
      onClose();
    },
    [onSelect, onClose],
  );
  const renderRecipe = useCallback(
    ({ item }: { item: Recipe }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Choose ${item.recipe_name}`}
        onPress={() => choose(item)}
        style={[S.card, { marginBottom: 12, minHeight: 80 }]}
      >
        <Text style={S.heading}>{item.recipe_name}</Text>
        <Text style={S.small}>
          {item.total_time} · Serves {item.servings}
        </Text>
      </Pressable>
    ),
    [choose],
  );
  return (
    <Sheet
      visible={visible}
      onClose={close}
      title="Pick a keeper"
      scroll={false}
    >
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipe}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 22,
          paddingBottom: 40,
          maxWidth: 620,
          width: "100%",
          alignSelf: "center",
        }}
        ListHeaderComponent={
          <View style={{ gap: 16, marginBottom: 22 }}>
            <Text style={S.body}>
              {mealType}
              {date
                ? ` · ${new Date(date + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`
                : ""}
            </Text>
            <Field
              accessibilityLabel="Search your recipes"
              value={query}
              onChangeText={setQuery}
              placeholder="Search your recipes"
              autoCapitalize="none"
            />
          </View>
        }
        ListEmptyComponent={
          <View style={[S.card, { backgroundColor: C.sage }]}>
            <Text style={S.heading}>
              {query ? "No matches yet." : "Your recipe box is waiting."}
            </Text>
            <Text style={S.body}>
              {query
                ? "Try another ingredient or recipe name."
                : "Add a keeper in Recipes, then come back to plan dinner."}
            </Text>
            <Action
              secondary
              label={query ? "Clear search" : "Back to my week"}
              onPress={query ? () => setQuery("") : close}
            />
          </View>
        }
      />
    </Sheet>
  );
}
export default RecipeSelectionModal;
