import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { supabase } from "@/libs/supabase";
import { designPreview } from "@/utils/design-preview";
import { Action, Field, S, Status } from "./ui";
type Note = { id: number; title: string; note: string };
export function RecipeNotes({ recipeId }: { recipeId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    if (designPreview) return;
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw Error("Please sign in to view notes.");
      const { data, error } = await supabase
        .from("notes")
        .select("id,title,note")
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setNotes(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load notes.");
    } finally {
      setLoading(false);
    }
  }, [recipeId]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <View style={{ gap: 14 }}>
      <Status loading={loading} error={error} onRetry={load} />
      {notes.map((note) => (
        <View key={note.id} style={S.card}>
          {!!note.title && <Text style={S.heading}>{note.title}</Text>}
          <Text style={S.body}>{note.note}</Text>
        </View>
      ))}
      {!notes.length && !loading && (
        <Text style={S.body}>
          Your tweaks, swaps, and “next time” ideas go here.
        </Text>
      )}
      <Field
        multiline
        accessibilityLabel="Recipe note"
        value={draft}
        onChangeText={setDraft}
        placeholder="What worked? What would you change?"
      />
      <Action
        secondary
        label={saving ? "Saving…" : "Save note"}
        disabled={saving || !draft.trim()}
        onPress={async () => {
          if (designPreview) {
            setError("Preview only — sign in to save notes.");
            return;
          }
          setSaving(true);
          setError("");
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw Error("Please sign in to save a note.");
            const { error } = await supabase
              .from("notes")
              .insert({
                user_id: user.id,
                recipe_id: recipeId,
                title: "Kitchen note",
                note: draft.trim(),
              });
            if (error) throw error;
            setDraft("");
            await load();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save note.");
          } finally {
            setSaving(false);
          }
        }}
      />
    </View>
  );
}
