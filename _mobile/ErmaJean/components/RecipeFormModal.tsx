import { useEffect, useState } from "react";
import { Text, View, Pressable, Switch } from "react-native";
import { RecipeInput } from "@/types/config";
import { validateRecipeForm, ValidationErrors } from "@/utils/validation";
import { Haptic } from "@/utils/haptics";
import { Sheet } from "./redesign/sheet";
import { S, C, Field, Action } from "./redesign/ui";
export interface RecipeFormModalProps {
  visible: boolean;
  initialRecipe?: RecipeInput;
  onClose: () => void;
  onSubmit: (recipe: RecipeInput) => Promise<void>;
}
const blank: RecipeInput = {
  recipe_name: "",
  description: "",
  prep_time: "",
  cook_time: "",
  total_time: "",
  servings: "",
  difficulty_level: "Easy",
  course: "Dinner",
  ingredients: "",
  instructions: "",
};
const fields: {
  key: keyof RecipeInput;
  label: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  {
    key: "recipe_name",
    label: "Recipe name",
    placeholder: "Give this keeper a name",
  },
  {
    key: "description",
    label: "A little about it",
    placeholder: "Why is this one worth repeating?",
    multiline: true,
  },
  {
    key: "ingredients",
    label: "Ingredients",
    placeholder: "One ingredient per line, including quantities",
    multiline: true,
  },
  {
    key: "instructions",
    label: "Steps",
    placeholder: "One step per line. Keep it practical.",
    multiline: true,
  },
  { key: "prep_time", label: "Prep time", placeholder: "e.g. 10 min" },
  { key: "cook_time", label: "Cook time", placeholder: "e.g. 20 min" },
  { key: "total_time", label: "Total time", placeholder: "e.g. 30 min" },
  { key: "servings", label: "Servings", placeholder: "e.g. 4" },
];
const nutrition = [
  "calories",
  "protein",
  "carbs",
  "fat",
  "fiber",
  "sugar",
  "sodium",
] as const;
export function RecipeFormModal({
  visible,
  onClose,
  onSubmit,
  initialRecipe,
}: RecipeFormModalProps) {
  const [form, setForm] = useState<RecipeInput>(blank);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  useEffect(() => {
    if (visible) {
      setForm(initialRecipe || blank);
      setErrors({});
      setError("");
      setShowNutrition(initialRecipe?.calories != null);
    }
  }, [visible, initialRecipe]);
  function update(
    key: keyof RecipeInput,
    value: string | boolean | number | undefined,
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }
  async function save() {
    const found = validateRecipeForm(form);
    for (const key of nutrition) {
      if (
        form[key] !== undefined &&
        (!Number.isFinite(form[key]) || form[key]! < 0)
      )
        found[key] = "Enter a number of zero or more.";
    }
    if (Object.keys(found).length) {
      setErrors(found);
      setError("A few details need your attention below.");
      Haptic.error();
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit(form);
      Haptic.success();
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save your recipe. Try again.",
      );
      Haptic.error();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={initialRecipe ? "Edit your keeper" : "Add a keeper"}
      busy={busy}
    >
      <Text style={S.body}>
        Good dinners don’t need to be fancy. Just worth making again.
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={[S.body, { color: C.tomato }]}>
          {error}
        </Text>
      )}
      {fields.map(({ key, label, placeholder, multiline }) => (
        <View key={key} style={{ gap: 8 }}>
          <Text style={[S.body, { fontWeight: "700" }]}>{label}</Text>
          <Field
            accessibilityLabel={label}
            editable={!busy}
            value={String(form[key] ?? "")}
            onChangeText={(value) => update(key, value)}
            placeholder={placeholder}
            multiline={multiline}
          />
          {!!errors[key] && (
            <Text
              accessibilityRole="alert"
              style={[S.small, { color: C.tomato }]}
            >
              {errors[key]}
            </Text>
          )}
        </View>
      ))}
      {(
        [
          {
            key: "difficulty_level",
            label: "Difficulty",
            options: ["Easy", "Medium", "Hard"],
          },
          {
            key: "course",
            label: "Meal",
            options: [
              "Breakfast",
              "Lunch",
              "Dinner",
              "Snack",
              "Dessert",
              "Appetizer",
            ],
          },
        ] as const
      ).map((group) => (
        <View key={group.key} style={{ gap: 10 }}>
          <Text style={S.heading}>{group.label}</Text>
          <View style={[S.row, { flexWrap: "wrap" }]}>
            {group.options.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="radio"
                aria-checked={form[group.key] === option}
                accessibilityState={{
                  checked: form[group.key] === option,
                  disabled: busy,
                }}
                disabled={busy}
                onPress={() => update(group.key, option)}
                style={{
                  minHeight: 48,
                  padding: 13,
                  borderRadius: 24,
                  backgroundColor:
                    form[group.key] === option ? C.green : C.sage,
                }}
              >
                <Text
                  style={[
                    S.body,
                    { color: form[group.key] === option ? C.white : C.ink },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      <View style={[S.row, { justifyContent: "space-between" }]}>
        <Text style={[S.body, { flex: 1 }]}>Kid-friendly</Text>
        <Switch
          accessibilityLabel="Kid-friendly recipe"
          disabled={busy}
          value={!!form.is_kid_friendly}
          onValueChange={(value) => update("is_kid_friendly", value)}
          trackColor={{ true: C.green }}
        />
      </View>
      <Action
        secondary
        label={
          showNutrition
            ? "Hide nutrition fields"
            : "Add nutrition estimates (optional)"
        }
        onPress={() => setShowNutrition(!showNutrition)}
      />
      {showNutrition && (
        <>
          <Text style={S.small}>
            Use the recipe’s original serving basis. Estimates are a guide,
            never a score.
          </Text>
          {nutrition.map((key) => (
            <View key={key} style={{ gap: 6 }}>
              <Text style={S.body}>
                {key[0].toUpperCase() + key.slice(1)}
                {key === "calories"
                  ? " (kcal)"
                  : key === "sodium"
                    ? " (mg)"
                    : " (g)"}
              </Text>
              <Field
                accessibilityLabel={key}
                keyboardType="decimal-pad"
                value={form[key]?.toString() ?? ""}
                onChangeText={(value) =>
                  update(key, value === "" ? undefined : Number(value))
                }
              />
            </View>
          ))}
        </>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={[S.body, { color: C.tomato }]}>
          {error}
        </Text>
      )}
      <Action
        label={busy ? "Saving your keeper…" : "Save recipe"}
        disabled={busy}
        onPress={() => void save()}
      />
    </Sheet>
  );
}
export default RecipeFormModal;
