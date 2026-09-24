import { View, Text } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Page,
  Title,
  C,
  S,
  Action,
  RecipeCard,
  Status,
} from "@/components/redesign/ui";
import { useRecipes } from "@/hooks/use-kitchen";
export default function Kitchen() {
  const { recipes, loading, error, load } = useRecipes();
  return (
    <Page>
      <Title>Hey, what’s{"\n"}for dinner?</Title>
      <View
        style={{
          backgroundColor: C.sage,
          borderRadius: 20,
          padding: 18,
          minHeight: 170,
          overflow: "hidden",
        }}
      >
        <View style={{ width: "68%", gap: 18, zIndex: 1 }}>
          <Text style={[S.heading, { fontSize: 23 }]}>
            Got a few ingredients? I’ve got ideas.
          </Text>
          <Action
            label="Find my dinner →"
            onPress={() => router.push("/generate-modal")}
          />
        </View>
        <Image
          source={require("@/assets/redesign/ermajean.png")}
          style={{
            position: "absolute",
            right: -18,
            bottom: 0,
            width: 155,
            height: 190,
          }}
          contentFit="contain"
        />
      </View>
      <Text style={S.heading}>Tonight, handled.</Text>
      <Status {...{ loading, error, onRetry: load }} />
      {recipes[0] ? (
        <RecipeCard recipe={recipes[0]} />
      ) : !loading && !error ? (
        <View style={S.card}>
          <Text style={S.body}>
            Your next good dinner starts with what you have. Find an idea or add
            a recipe you already love.
          </Text>
          <Action
            label="Add your first keeper"
            secondary
            onPress={() => router.push("/(tabs)/recipes")}
          />
        </View>
      ) : null}
      <View style={[S.row, { justifyContent: "space-between" }]}>
        <Text style={S.heading}>Your keepers</Text>
        <Text
          accessibilityRole="link"
          onPress={() => router.push("/(tabs)/recipes")}
          style={S.body}
        >
          See all →
        </Text>
      </View>
      <View style={[S.row, { alignItems: "flex-start" }]}>
        {recipes.slice(1, 3).map((recipe) => (
          <RecipeCard compact key={recipe.id} recipe={recipe} />
        ))}
      </View>
    </Page>
  );
}
