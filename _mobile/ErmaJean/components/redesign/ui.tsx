import { designPreview, previewImages } from "@/utils/design-preview";
import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  TextInputProps,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight, ChefHat } from "lucide-react-native";
import { Haptic } from "@/utils/haptics";
import { Recipe } from "@/types/config";
export const C = {
  oat: "#F7F3E8",
  green: "#244638",
  ink: "#123B33",
  tomato: "#B84732",
  sage: "#DEE6D8",
  butter: "#EADBA7",
  muted: "#62716A",
  line: "#DDDCCF",
  white: "#FFFCF4",
};
export const S = StyleSheet.create({
  body: { fontFamily: "DMSans", fontSize: 16, lineHeight: 24, color: C.ink },
  title: {
    fontFamily: "Fraunces",
    fontWeight: "900",
    fontSize: 42,
    lineHeight: 44,
    letterSpacing: -1.7,
    color: C.ink,
  },
  heading: {
    fontFamily: "Fraunces",
    fontWeight: "800",
    fontSize: 25,
    lineHeight: 29,
    letterSpacing: -0.6,
    color: C.ink,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 18,
    backgroundColor: C.white,
    padding: 16,
    gap: 10,
  },
  input: {
    fontFamily: "DMSans",
    fontSize: 16,
    color: C.ink,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 24,
    minHeight: 50,
    paddingHorizontal: 18,
    backgroundColor: C.white,
  },
  small: { fontFamily: "DMSans", fontSize: 13, color: C.muted, lineHeight: 19 },
});
export function Page({
  children,
  back,
  header = true,
}: {
  children: React.ReactNode;
  back?: string;
  header?: boolean;
}) {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: C.oat }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 22,
          paddingBottom: 36,
          gap: 20,
          maxWidth: 620,
          width: "100%",
          alignSelf: "center",
        }}
      >
        {back ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/(tabs)")
            }
            style={[S.row, { minHeight: 48 }]}
          >
            <ArrowLeft color={C.ink} />
            <Text style={S.body}>{back}</Text>
          </Pressable>
        ) : header ? (
          <Brand />
        ) : null}
        {designPreview && (
          <Text style={[S.small, { color: C.tomato }]}>
            DESIGN PREVIEW · Illustrative sample data
          </Text>
        )}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Brand() {
  return (
    <View style={[S.row, { justifyContent: "space-between" }]}>
      <View>
        <Text style={[S.heading, { fontSize: 32, lineHeight: 36 }]}>
          ermajean<Text style={{ color: C.tomato }}>●</Text>
        </Text>
        <Text
          style={[S.small, { fontSize: 9, letterSpacing: 2, color: C.ink }]}
        >
          GOOD FOOD. REAL LIFE.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Your profile"
        onPress={() => router.push("/profile")}
        style={{
          height: 48,
          width: 48,
          borderRadius: 24,
          backgroundColor: C.sage,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={[S.body, { fontWeight: "700" }]}>You</Text>
      </Pressable>
    </View>
  );
}
export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={S.title}>{children}</Text>;
}
export function Action({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        Haptic.buttonPress();
        onPress();
      }}
      style={({ pressed }) => ({
        minHeight: 52,
        borderRadius: 28,
        backgroundColor: secondary ? "transparent" : C.tomato,
        borderWidth: 1,
        borderColor: secondary ? C.green : C.tomato,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={[
          S.body,
          { fontWeight: "700", color: secondary ? C.ink : C.white },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={C.muted}
      {...props}
      style={[
        S.input,
        props.multiline
          ? { minHeight: 100, paddingTop: 14, textAlignVertical: "top" }
          : null,
        props.style,
      ]}
    />
  );
}
export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={[
        S.row,
        { backgroundColor: C.butter, borderRadius: 18, padding: 12 },
      ]}
    >
      <Image
        source={require("@/assets/redesign/ermajean.png")}
        style={{ height: 78, width: 72 }}
        contentFit="contain"
      />
      <View style={{ flex: 1 }}>
        <Text style={[S.heading, { fontSize: 18 }]}>ErmaJean’s tip</Text>
        <Text style={S.body}>{children}</Text>
      </View>
    </View>
  );
}
export function Status({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  if (loading)
    return <ActivityIndicator color={C.green} style={{ padding: 24 }} />;
  if (error)
    return (
      <View style={S.card}>
        <Text accessibilityRole="alert" style={S.body}>
          {error}
        </Text>
        <Action label="Try again" secondary onPress={onRetry} />
      </View>
    );
  return null;
}
export function RecipeCard({
  recipe,
  compact = false,
}: {
  recipe: Recipe;
  compact?: boolean;
}) {
  const image = designPreview
    ? previewImages[recipe.id]
    : (recipe as Recipe & { image_url?: string }).image_url;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/recipe/${recipe.id}`)}
      style={{ flex: 1, gap: 7 }}
    >
      {image ? (
        <Image
          source={typeof image === "string" ? { uri: image } : image}
          style={{ height: compact ? 112 : 210, borderRadius: 16 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            height: compact ? 112 : 180,
            borderRadius: 16,
            backgroundColor: C.sage,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <ChefHat size={42} color={C.green} />
          <Text style={S.small}>Your recipe</Text>
        </View>
      )}
      <Text style={[S.heading, { fontSize: compact ? 19 : 25 }]}>
        {recipe.recipe_name}
      </Text>
      <Text style={S.small}>
        {recipe.total_time} · Serves {recipe.servings}
      </Text>
      {!compact && (
        <View style={S.row}>
          <Text style={[S.body, { color: C.tomato, fontWeight: "700" }]}>
            See recipe
          </Text>
          <ArrowRight color={C.tomato} size={18} />
        </View>
      )}
    </Pressable>
  );
}
