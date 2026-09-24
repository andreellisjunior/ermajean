import { SafeAreaView } from "react-native-safe-area-context";
import { Recipe } from "@/types/config";
import { designPreview } from "@/utils/design-preview";
import { useCallback, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import {
  Brand,
  Title,
  S,
  C,
  Field,
  Action,
  RecipeCard,
  Status,
  Tip,
} from "@/components/redesign/ui";
import { useRecipes } from "@/hooks/use-kitchen";
import { RecipeFormModal } from "@/components/RecipeFormModal";
import { createRecipe } from "@/services/recipeService";
export default function Recipes() {
  const { recipes, loading, error, load } = useRecipes();
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState(false);
  const [adding, setAdding] = useState(false);
  const filtered = recipes.filter(
    (r) =>
      (r.recipe_name + " " + r.ingredients)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!quick ||
        (!/hour|hr|h\b/i.test(r.total_time) && parseInt(r.total_time) <= 30)),
  );
  const renderRecipe = useCallback(
    ({ item }: { item: Recipe }) => (
      <View style={{ flex: 1, maxWidth: "50%", padding: 6 }}>
        <RecipeCard compact recipe={item} />
      </View>
    ),
    [],
  );
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: C.oat }}
      edges={["top", "left", "right"]}
    >
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipe}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 30,
          maxWidth: 620,
          width: "100%",
          alignSelf: "center",
        }}
        ListHeaderComponent={
          <View style={{ gap: 20, padding: 6, paddingBottom: 20 }}>
            <Brand />
            {designPreview && (
              <Text style={[S.small, { color: C.tomato }]}>
                DESIGN PREVIEW · Illustrative sample data
              </Text>
            )}
            <Title>The keepers.</Title>
            <Text style={S.body}>Good dinners worth repeating.</Text>
            <Field
              accessibilityLabel="Search your recipes"
              placeholder="Search your recipes"
              value={query}
              onChangeText={setQuery}
            />
            <View style={S.row}>
              {[false, true].map((value) => (
                <Pressable
                  key={String(value)}
                  onPress={() => setQuick(value)}
                  style={{
                    padding: 14,
                    borderRadius: 24,
                    backgroundColor: quick === value ? C.green : C.sage,
                  }}
                >
                  <Text
                    style={[
                      S.body,
                      { color: quick === value ? C.white : C.ink },
                    ]}
                  >
                    {value ? "Quick" : "All"}
                  </Text>
                </Pressable>
              ))}
              <View style={{ flex: 1 }}>
                <Action label="+ Add recipe" onPress={() => setAdding(true)} />
              </View>
            </View>
            <Status {...{ loading, error, onRetry: load }} />
            {!loading && !error && !filtered.length && (
              <Text style={S.body}>
                {query
                  ? "No matches. Try another ingredient."
                  : "A little empty in here. Save your first good dinner."}
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={{ padding: 6, paddingTop: 20 }}>
            <Tip>A good shortcut is worth keeping.</Tip>
          </View>
        }
      />
      <RecipeFormModal
        visible={adding}
        onClose={() => setAdding(false)}
        onSubmit={async (recipe) => {
          if (designPreview)
            throw Error("Preview only — sign in to save recipes.");
          await createRecipe(recipe);
          setAdding(false);
          await load();
        }}
      />
    </SafeAreaView>
  );
}
