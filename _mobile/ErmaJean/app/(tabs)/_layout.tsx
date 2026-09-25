import { useWindowDimensions } from "react-native";
import { Tabs } from "expo-router/js-tabs";
import {
  Home,
  BookOpen,
  CalendarDays,
  ShoppingBasket,
} from "lucide-react-native";
import { C } from "@/components/redesign/ui";
export default function TabLayout() {
  const { fontScale } = useWindowDimensions();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.green,
        tabBarInactiveTintColor: C.ink,
        tabBarActiveBackgroundColor: C.sage,
        tabBarStyle: {
          backgroundColor: C.oat,
          borderTopColor: C.line,
          height: Math.max(84, 64 + fontScale * 14),
          paddingTop: 8,
          paddingBottom: 22,
        },
        tabBarItemStyle: { borderRadius: 24, marginHorizontal: 6 },
        tabBarLabelStyle: { fontFamily: "DMSans", fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Kitchen",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="meal-plans"
        options={{
          title: "Plan",
          tabBarIcon: ({ color }) => <CalendarDays color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color }) => <ShoppingBasket color={color} size={24} />,
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="generate" options={{ href: null }} />
    </Tabs>
  );
}
