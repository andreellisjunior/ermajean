import { designPreview } from "@/utils/design-preview";
import { useCallback, useState } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Page,
  Title,
  S,
  C,
  Action,
  Tip,
  Status,
  Field,
} from "@/components/redesign/ui";
import { getRecipes } from "@/services/recipeService";
import { getMealPlans } from "@/services/mealPlanService";
import { getWeekStart, getWeekEnd } from "@/utils/dateUtils";
import {
  aggregateIngredients,
  formatShoppingList,
} from "@/utils/shoppingListUtils";
import { ShoppingListItem } from "@/types/config";
import { supabase } from "@/libs/supabase";
export default function Shop() {
  const { week } = useLocalSearchParams<{ week?: string }>();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [key, setKey] = useState("");
  const [bought, setBought] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const date = week ? new Date(week + "T12:00:00") : new Date();
      if (designPreview) {
        setItems([
          {
            id: "preview-spinach",
            ingredient: "Spinach",
            quantity: "1",
            unit: "bag",
            category: "Produce",
            checked: false,
          },
          {
            id: "preview-peppers",
            ingredient: "Bell peppers",
            quantity: "2",
            unit: "",
            category: "Produce",
            checked: false,
          },
          {
            id: "preview-chicken",
            ingredient: "Chicken",
            quantity: "2",
            unit: "lb",
            category: "Meat & Seafood",
            checked: false,
          },
          {
            id: "preview-rice",
            ingredient: "Rice",
            quantity: "1",
            unit: "bag",
            category: "Pantry",
            checked: false,
          },
        ]);
        setCount(3);
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw Error("Please sign in to build your list.");
      const storageKey = `shop:${data.user.id}:${getWeekStart(date).toISOString().slice(0, 10)}`;
      setKey(storageKey);
      const [recipes, meals, saved] = await Promise.all([
        getRecipes(),
        getMealPlans(getWeekStart(date), getWeekEnd(date)),
        AsyncStorage.getItem(storageKey),
      ]);
      const previous: ShoppingListItem[] = saved ? JSON.parse(saved) : [];
      const list = aggregateIngredients(
        meals,
        new Map(recipes.map((r) => [r.id, r])),
      );
      setItems([
        ...list.map((item) => ({
          ...item,
          checked:
            previous.find((p) => p.ingredient === item.ingredient)?.checked ||
            false,
        })),
        ...previous.filter((p) => p.id.startsWith("manual:")),
      ]);
      setCount(meals.length);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [week]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  async function update(next: ShoppingListItem[]) {
    setItems(next);
    if (designPreview) return;
    try {
      await AsyncStorage.setItem(key, JSON.stringify(next));
    } catch {
      setError("Could not save this list on your device. Try again.");
    }
  }
  const visible = items.filter((i) => i.checked === bought);
  return (
    <Page>
      <Title>Check the fridge{"\n"}first, boss.</Title>
      <Tip>You might have dinner halfway handled.</Tip>
      <View
        style={[S.row, { backgroundColor: C.sage, borderRadius: 28, gap: 0 }]}
      >
        {[false, true].map((value) => (
          <Pressable
            key={String(value)}
            onPress={() => setBought(value)}
            style={{
              flex: 1,
              minHeight: 50,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 28,
              backgroundColor: bought === value ? C.tomato : "transparent",
            }}
          >
            <Text
              style={[S.body, { color: bought === value ? C.white : C.ink }]}
            >
              {value ? "Got it" : "To buy"} (
              {items.filter((i) => i.checked === value).length})
            </Text>
          </Pressable>
        ))}
      </View>
      <Status {...{ loading, error, onRetry: load }} />
      {Array.from(new Set(visible.map((i) => i.category))).map((category) => (
        <View
          key={category}
          style={{
            borderWidth: 1,
            borderColor: C.line,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <Text
            style={[
              S.body,
              { padding: 12, backgroundColor: C.sage, fontWeight: "700" },
            ]}
          >
            {category}
          </Text>
          {visible
            .filter((i) => i.category === category)
            .map((item) => (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.checked }}
                key={item.id}
                onPress={() =>
                  void update(
                    items.map((i) =>
                      i.id === item.id ? { ...i, checked: !i.checked } : i,
                    ),
                  )
                }
                style={[
                  S.row,
                  {
                    padding: 16,
                    minHeight: 60,
                    borderTopColor: C.line,
                    borderTopWidth: 1,
                  },
                ]}
              >
                <Text style={[S.body, { fontSize: 24 }]}>
                  {item.checked ? "☑" : "□"}
                </Text>
                <Text style={[S.body, { flex: 1 }]}>{item.ingredient}</Text>
                <Text style={S.small}>
                  {item.quantity} {item.unit}
                </Text>
              </Pressable>
            ))}
        </View>
      ))}
      {!loading && !visible.length && (
        <Text style={S.body}>
          {bought
            ? "Check off items as you go."
            : "All clear. Add meals to your plan or write an item below."}
        </Text>
      )}
      {adding && (
        <Field
          placeholder="e.g. Spinach, 1 bag"
          accessibilityLabel="Shopping item"
          value={newItem}
          onChangeText={setNewItem}
        />
      )}
      <Action
        secondary
        label={adding ? "Save item" : "+ Add an item"}
        onPress={() => {
          if (!adding) {
            setAdding(true);
            return;
          }
          if (!newItem.trim()) return;
          void update([
            ...items,
            {
              id: `manual:${Date.now()}`,
              ingredient: newItem.trim(),
              quantity: "",
              unit: "",
              category: "Other",
              checked: false,
            },
          ]);
          setNewItem("");
          setAdding(false);
        }}
      />
      <Text style={[S.small, { textAlign: "center" }]}>
        From {count} planned meals · Saved on this device
      </Text>
      <Action
        label="Share list"
        disabled={!items.length}
        onPress={() => {
          void Share.share({ message: formatShoppingList(items) }).catch(() =>
            setError("Could not share your list. Try again."),
          );
        }}
      />
    </Page>
  );
}
