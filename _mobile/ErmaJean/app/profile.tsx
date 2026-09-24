import { designPreview } from "@/utils/design-preview";
import { useEffect, useState } from "react";
import { Text, View, Linking } from "react-native";
import { router } from "expo-router";
import { Page, Title, S, Action, Tip, Status } from "@/components/redesign/ui";
import { getProfile, updateMacroGoals } from "@/services/profileService";
import { Profile } from "@/types/config";
import { GoalsFormModal } from "@/components/GoalsFormModal";
import { supabase } from "@/libs/supabase";
export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
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
          <Tip>A little structure. Plenty of room for real life.</Tip>
          <View style={S.card}>
            <Text style={S.body}>
              Subscription · {profile.has_access ? "Premium" : "Free"}
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
    </Page>
  );
}
