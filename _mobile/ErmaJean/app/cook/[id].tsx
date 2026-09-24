import { designPreview, previewRecipes } from "@/utils/design-preview";
import { useEffect, useState } from "react";
import { View, Text, AppState } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
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
import { getRecipeById } from "@/services/recipeService";
export default function Cook() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [steps, setSteps] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [minutes, setMinutes] = useState("5");
  const [remaining, setRemaining] = useState(300);
  const [deadline, setDeadline] = useState<number | null>(null);
  async function load() {
    try {
      const recipe = designPreview
        ? previewRecipes.find((r) => r.id === id)
        : await getRecipeById(id);
      if (!recipe) throw Error("Recipe not found.");
      setSteps(recipe.instructions.split("\n").filter(Boolean));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [id]);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) setDeadline(null);
    };
    const timer = setInterval(tick, 500);
    const listener = AppState.addEventListener("change", tick);
    tick();
    return () => {
      clearInterval(timer);
      listener.remove();
    };
  }, [deadline]);
  return (
    <Page back="Recipe">
      <Title>Alright,{"\n"}let’s cook.</Title>
      <Status {...{ loading, error, onRetry: load }} />
      {!!steps.length && (
        <>
          <Text style={S.body}>
            Step {step + 1} of {steps.length}
          </Text>
          <View style={S.row}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i <= step ? C.tomato : C.line,
                }}
              />
            ))}
          </View>
          <Text
            style={[
              S.heading,
              { fontSize: 30, lineHeight: 38, marginVertical: 18 },
            ]}
          >
            {steps[step].replace(/^\d+[.)]\s*/, "")}
          </Text>
          <View style={S.card}>
            <Text style={S.small}>YOUR KITCHEN TIMER</Text>
            <Text
              accessibilityLiveRegion="polite"
              style={[
                S.title,
                { textAlign: "center", fontVariant: ["tabular-nums"] },
              ]}
            >
              {String(Math.floor(remaining / 60)).padStart(2, "0")}:
              {String(remaining % 60).padStart(2, "0")}
            </Text>
            {!deadline && (
              <Field
                accessibilityLabel="Timer minutes"
                keyboardType="number-pad"
                value={minutes}
                onChangeText={(v) => {
                  setMinutes(v);
                  setRemaining(Math.max(0, Math.min(180, Number(v) || 0)) * 60);
                }}
              />
            )}
            <Action
              label={
                deadline
                  ? "Pause timer"
                  : remaining === 0
                    ? "Set a timer"
                    : "Start timer"
              }
              disabled={!remaining && !deadline}
              onPress={() =>
                setDeadline(deadline ? null : Date.now() + remaining * 1000)
              }
            />
            <Text style={S.small}>
              Timer runs in this screen. Keep the app open for the countdown; no
              background alarm.
            </Text>
          </View>
          <Tip>Take it one step at a time. You’ve got dinner handled.</Tip>
          <View style={S.row}>
            <View style={{ flex: 1 }}>
              <Action
                secondary
                label="Previous"
                disabled={step === 0}
                onPress={() => setStep(step - 1)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Action
                label={step === steps.length - 1 ? "All done" : "Next step"}
                onPress={() =>
                  step === steps.length - 1 ? router.back() : setStep(step + 1)
                }
              />
            </View>
          </View>
        </>
      )}
    </Page>
  );
}
