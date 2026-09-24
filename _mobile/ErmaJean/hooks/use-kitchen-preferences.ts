import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/libs/supabase";
import { designPreview } from "@/utils/design-preview";
type Preferences = { nutrition: boolean; dietary: string };
const defaults: Preferences = { nutrition: true, dietary: "" };
export function useKitchenPreferences() {
  const [preferences, setPreferences] = useState(defaults);
  const [error, setError] = useState("");
  const [key, setKey] = useState("");
  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        try {
          if (designPreview) return;
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;
          const storageKey = `kitchen-preferences:${user.id}`;
          const value = await AsyncStorage.getItem(storageKey);
          if (active) {
            setKey(storageKey);
            if (value) setPreferences({ ...defaults, ...JSON.parse(value) });
          }
        } catch {
          if (active) setError("Your device preferences could not be loaded.");
        }
      }
      void load();
      return () => {
        active = false;
      };
    }, []),
  );
  async function save(next: Preferences) {
    if (!designPreview) {
      if (!key) throw Error("Preferences are still loading. Try again.");
      await AsyncStorage.setItem(key, JSON.stringify(next));
    }
    setPreferences(next);
    setError("");
  }
  return { preferences, save, error };
}
