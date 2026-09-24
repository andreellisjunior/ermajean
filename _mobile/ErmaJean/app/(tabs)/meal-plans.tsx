import { Image } from "expo-image";
import {
  designPreview,
  previewRecipes,
  previewImages,
} from "@/utils/design-preview";
import { useCallback, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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
  getDaysInWeek,
  getWeekStart,
  getWeekEnd,
  formatDate,
} from "@/utils/dateUtils";
import {
  getMealPlans,
  addMealToPlan,
  removeMealFromPlan,
  MealType,
} from "@/services/mealPlanService";
import { RecipeSelectionModal } from "@/components/RecipeSelectionModal";
import { useRecipes } from "@/hooks/use-kitchen";
import { MealSlot } from "@/types/config";
export default function Plan() {
  const { recipeId } = useLocalSearchParams<{ recipeId?: string }>();
  const { recipes } = useRecipes();
  const [week, setWeek] = useState(() => new Date());
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [selected, setSelected] = useState("");
  const [mealType, setMealType] = useState<MealType>("Dinner");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSlots(
        designPreview
          ? getDaysInWeek(week)
              .slice(0, 3)
              .map((day, i) => ({
                date: formatDate(day),
                mealType: "Dinner" as const,
                recipeId: previewRecipes[i].id,
                recipeName: previewRecipes[i].recipe_name,
              }))
          : await getMealPlans(getWeekStart(week), getWeekEnd(week)),
      );
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
  async function assign(date: string, id: string) {
    if (designPreview) {
      setError("Preview only — sign in to save a plan.");
      return;
    }
    try {
      await addMealToPlan(date, mealType, id);
      setSelected("");
      await load();
    } catch (e) {
      setError(String(e));
    }
  }
  return (
    <Page>
      <Title>This week, loosely.</Title>
      <Text style={S.body}>Plan a few. Leave room for life.</Text>
      {recipeId && <Text style={S.body}>Choose a day to add your recipe.</Text>}
      <View style={[S.row, { justifyContent: "space-between" }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous week"
          onPress={() =>
            setWeek(
              new Date(week.getFullYear(), week.getMonth(), week.getDate() - 7),
            )
          }
          style={{ width: 48, height: 48, justifyContent: "center" }}
        >
          <Text style={S.heading}>‹</Text>
        </Pressable>
        <Text
          style={[S.body, { fontWeight: "700", textAlign: "center", flex: 1 }]}
        >
          {getWeekStart(week).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
          })}{" "}
          – {getWeekEnd(week).getDate()}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next week"
          onPress={() =>
            setWeek(
              new Date(week.getFullYear(), week.getMonth(), week.getDate() + 7),
            )
          }
          style={{
            width: 48,
            height: 48,
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Text style={S.heading}>›</Text>
        </Pressable>
      </View>
      <View style={S.row}>
        {(["Breakfast", "Lunch", "Dinner"] as MealType[]).map((type) => (
          <Pressable
            accessibilityRole="radio"
            aria-checked={mealType === type}
            accessibilityState={{ checked: mealType === type }}
            key={type}
            onPress={() => setMealType(type)}
            style={{
              flex: 1,
              paddingVertical: 13,
              borderRadius: 24,
              alignItems: "center",
              backgroundColor: mealType === type ? C.green : C.sage,
            }}
          >
            <Text
              style={[S.small, { color: mealType === type ? C.white : C.ink }]}
            >
              {type}
            </Text>
          </Pressable>
        ))}
      </View>
      <Status {...{ loading, error, onRetry: load }} />
      {getDaysInWeek(week).map((day) => {
        const date = formatDate(day);
        const slot = slots.find(
          (s) => s.date === date && s.mealType === mealType,
        );
        return (
          <View key={date} style={[S.card, S.row]}>
            <View style={{ width: 35 }}>
              <Text style={[S.heading, { fontSize: 19 }]}>
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </Text>
              <Text style={S.small}>{day.getDate()}</Text>
            </View>
            {designPreview &&
              slot?.recipeId &&
              previewImages[slot.recipeId] && (
                <Image
                  source={previewImages[slot.recipeId]}
                  style={{ width: 58, height: 64, borderRadius: 12 }}
                  contentFit="cover"
                />
              )}
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                recipeId ? void assign(date, recipeId) : setSelected(date)
              }
              style={{ flex: 1, minHeight: 58, justifyContent: "center" }}
            >
              <Text style={[S.heading, { fontSize: 19 }]}>
                {slot?.recipeName || "+ Leave it open"}
              </Text>
              <Text style={S.small}>
                {slot ? "Tap to change dinner" : "Life happens. That’s okay."}
              </Text>
            </Pressable>
            {slot && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${slot.recipeName}`}
                style={{
                  minHeight: 48,
                  minWidth: 48,
                  justifyContent: "center",
                }}
                onPress={async () => {
                  try {
                    if (designPreview) {
                      setError("Preview only — no changes saved.");
                      return;
                    }
                    await removeMealFromPlan(date, mealType);
                    await load();
                  } catch (e) {
                    setError(String(e));
                  }
                }}
              >
                <Text style={[S.small, { color: C.tomato }]}>Remove</Text>
              </Pressable>
            )}
          </View>
        );
      })}
      <Tip>Make extra tonight. Tomorrow-you says thanks.</Tip>
      <Action
        label="Build shopping list"
        onPress={() =>
          router.push({
            pathname: "/(tabs)/shop",
            params: { week: formatDate(getWeekStart(week)) },
          })
        }
      />
      <RecipeSelectionModal
        visible={!!selected}
        onClose={() => setSelected("")}
        onSelect={(recipe) => void assign(selected, recipe.id)}
        recipes={recipes}
        date={selected}
        mealType={mealType}
      />
    </Page>
  );
}
