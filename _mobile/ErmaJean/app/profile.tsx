import {getEntitlements,Entitlements} from '@/services/entitlementService';
import { useKitchenPreferences } from "@/hooks/use-kitchen-preferences";
import { Sheet } from "@/components/redesign/sheet";
import { designPreview } from "@/utils/design-preview";
import { useEffect, useState } from "react";
import { Text, View, Linking, Switch, Platform } from "react-native";
import { router } from "expo-router";
import {
  Page,
  Title,
  S,
  C,
  Field,
  Action,
  Tip,
  Status,
} from "@/components/redesign/ui";
import { getProfile, updateMacroGoals } from "@/services/profileService";
import { Profile } from "@/types/config";
import { GoalsFormModal } from "@/components/GoalsFormModal";
import { supabase } from "@/libs/supabase";
export default function ProfileScreen() {
  const {
    preferences,
    save: savePreferences,
    error: preferenceError,
  } = useKitchenPreferences();
  const [settings, setSettings] = useState<"dietary" | "notifications" | null>(
    null,
  );
  const [dietary, setDietary] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [entitlements,setEntitlements]=useState<Entitlements|null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      if(!designPreview)void getEntitlements().then(setEntitlements).catch(()=>setEntitlements(null));
      setProfile(
        designPreview
          ? {
              name: "Jordan",
              email: "Design preview",
              has_access: false,
              protein_goal: 100,
            }
          : await getProfile(),
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <Page back="Kitchen">
      <Title>Your kitchen.{"\n"}Your pace.</Title>
      <Status {...{ loading, error, onRetry: load }} />
      {profile && (
        <>
          <View style={S.card}>
            <Text style={S.heading}>{profile.name || "Your account"}</Text>
            <Text style={S.body}>{profile.email}</Text>
          </View>
          <Text style={S.heading}>Fuel for your day</Text>
          {!!preferenceError && (
            <Text
              accessibilityRole="alert"
              style={[S.body, { color: C.tomato }]}
            >
              {preferenceError}
            </Text>
          )}
          <View style={[S.card, S.row]}>
            <Text style={[S.body, { flex: 1 }]}>Show nutrition estimates</Text>
            <Switch
              accessibilityLabel="Show nutrition estimates on this device"
              value={preferences.nutrition}
              trackColor={{ true: C.green }}
              onValueChange={(value) =>
                void savePreferences({
                  ...preferences,
                  nutrition: value,
                }).catch((e) => setError(String(e)))
              }
            />
          </View>
          <View style={S.card}>
            <Text style={S.body}>
              Protein goal: {profile.protein_goal ?? "Not set"}
              {profile.protein_goal ? "g" : ""}
            </Text>
            <Text style={S.small}>
              Set what works for you. Nutrition estimates are a guide, never a
              score.
            </Text>
            <Action
              secondary
              label="Edit nutrition goals"
              onPress={() => setEditing(true)}
            />
          </View>
          <Action
            secondary
            label="Dietary preferences"
            onPress={() => {
              setDietary(preferences.dietary);
              setSettingsError("");
              setSettings("dietary");
            }}
          />
          <Action
            secondary
            label="Notifications"
            onPress={() => setSettings("notifications")}
          />
          <Tip>A little structure. Plenty of room for real life.</Tip>
          <View style={S.card}>
            <Text style={S.body}>
              Subscription · {designPreview?"Free":entitlements?.plan??"Unavailable"}
            </Text>
            <Action
              secondary
              label="Manage on the website"
              onPress={() =>
                void Linking.openURL("https://ermajean.com/dashboard")
              }
            />
          </View>
          <Action
            secondary
            label="Help & support"
            onPress={() => void Linking.openURL("mailto:support@ermajean.com")}
          />
          <Action
            secondary
            label="Privacy"
            onPress={() =>
              void Linking.openURL("https://ermajean.com/privacy-policy")
            }
          />
          <Action
            secondary
            label="Sign out"
            onPress={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) setError(error.message);
              else router.replace("/(auth)/sign-in");
            }}
          />
          <GoalsFormModal
            visible={editing}
            onClose={() => setEditing(false)}
            currentGoals={{
              calories: profile.calorie_goal ?? 2000,
              protein: profile.protein_goal ?? 100,
              carbs: profile.carb_goal ?? 250,
              fat: profile.fat_goal ?? 65,
            }}
            onSave={async (goals) => {
              if (designPreview)
                throw Error("Preview only — no changes saved.");
              setProfile(await updateMacroGoals(goals));
              setEditing(false);
            }}
          />
        </>
      )}
      <Sheet
        visible={!!settings}
        onClose={() => setSettings(null)}
        title={
          settings === "dietary" ? "Your kitchen preferences" : "Notifications"
        }
      >
        {settings === "dietary" ? (
          <>
            <Text style={S.body}>
              Add preferences to prefill your next dinner request. Check every
              AI suggestion for allergens.
            </Text>
            <Field
              multiline
              accessibilityLabel="Dietary preferences"
              value={dietary}
              onChangeText={setDietary}
              placeholder="No dairy, mild spice…"
            />
            <Text style={S.small}>Saved on this device for your account.</Text>
            {!!settingsError && (
              <Text
                accessibilityRole="alert"
                style={[S.body, { color: C.tomato }]}
              >
                {settingsError}
              </Text>
            )}
            <Action
              label="Save preferences"
              onPress={async () => {
                try {
                  await savePreferences({
                    ...preferences,
                    dietary: dietary.trim(),
                  });
                  setSettings(null);
                } catch (e) {
                  setSettingsError(String(e));
                }
              }}
            />
          </>
        ) : (
          <>
            <Text style={S.body}>
              Control ErmaJean notifications in your device settings. Reminder
              scheduling is not available in this version.
            </Text>
            {Platform.OS !== "web" && (
              <Action
                label="Open device settings"
                onPress={() => void Linking.openSettings()}
              />
            )}
            <Action secondary label="Done" onPress={() => setSettings(null)} />
          </>
        )}
      </Sheet>
    </Page>
  );
}
