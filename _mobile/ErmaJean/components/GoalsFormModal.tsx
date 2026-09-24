import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { MacroGoals } from "@/types/config";
import { validateGoalsForm } from "@/utils/validation";
import { Sheet } from "./redesign/sheet";
import { S, C, Field, Action, Tip } from "./redesign/ui";
import { Haptic } from "@/utils/haptics";
export interface GoalsFormModalProps {
  visible: boolean;
  onClose: () => void;
  currentGoals: MacroGoals;
  onSave: (goals: MacroGoals) => Promise<void>;
}
const fields = [
  ["calories", "Energy", "kcal"],
  ["protein", "Protein", "g"],
  ["carbs", "Carbs", "g"],
  ["fat", "Fat", "g"],
] as const;
export function GoalsFormModal({
  visible,
  onClose,
  currentGoals,
  onSave,
}: GoalsFormModalProps) {
  const [values, setValues] = useState<Record<keyof MacroGoals, string>>({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (visible) {
      setValues({
        calories: String(currentGoals.calories),
        protein: String(currentGoals.protein),
        carbs: String(currentGoals.carbs),
        fat: String(currentGoals.fat),
      });
      setError("");
    }
  }, [
    visible,
    currentGoals.calories,
    currentGoals.protein,
    currentGoals.carbs,
    currentGoals.fat,
  ]);
  async function save() {
    const goals = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, Number(value)]),
    ) as unknown as MacroGoals;
    if (
      Object.values(values).some(
        (value) => !value.trim() || !Number.isFinite(Number(value)),
      )
    ) {
      setError("Enter a number for each goal.");
      return;
    }
    const result = validateGoalsForm(goals);
    if (!result.isValid) {
      setError(result.errors.map((e) => e.message).join("\n"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave(goals);
      Haptic.success();
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save your goals. Your changes are here; try again.",
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
      title="Fuel for your day"
      busy={busy}
    >
      <Text style={S.body}>
        Set what works for you. A little structure, plenty of room for real
        life.
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={[S.body, { color: C.tomato }]}>
          {error}
        </Text>
      )}
      {fields.map(([key, label, unit]) => (
        <View key={key} style={S.card}>
          <Text style={S.heading}>{label}</Text>
          <View style={S.row}>
            <View style={{ flex: 1 }}>
              <Field
                editable={!busy}
                accessibilityLabel={`${label} daily goal in ${unit}`}
                keyboardType="number-pad"
                value={values[key]}
                onChangeText={(value) =>
                  setValues((prev) => ({ ...prev, [key]: value }))
                }
              />
            </View>
            <Text style={S.body}>{unit}</Text>
          </View>
        </View>
      ))}
      <Tip>These are your goals. Adjust them when life changes.</Tip>
      {!!error && (
        <Text accessibilityRole="alert" style={[S.body, { color: C.tomato }]}>
          {error}
        </Text>
      )}
      <Action
        label={busy ? "Saving…" : "Save my goals"}
        disabled={busy}
        onPress={() => void save()}
      />
    </Sheet>
  );
}
export default GoalsFormModal;
