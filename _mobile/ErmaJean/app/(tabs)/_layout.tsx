import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { ChefHat, Calendar, User, Search } from 'lucide-react-native';
import { Colors } from '@/constants/design';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 25 : 16,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopWidth: 0,
          paddingBottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#065f46',
        tabBarInactiveTintColor: '#a8a29e',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={ChefHat} label="Recipes" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="meal-plans"
        options={{
          title: 'Meal Plans',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Calendar} label="Plan" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={User} label="Profile" color={color} focused={focused} />
          ),
        }}
      />

      {/* Hide other tabs from navigation */}
      <Tabs.Screen name="generate" options={{ href: null }} />
      <Tabs.Screen name="recipes" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

function TabIcon({ icon: Icon, label, color, focused }: { icon: any, label: string, color: string, focused: boolean }) {
  return (
    <View className={`items-center justify-center top-3 ${focused ? 'bg-emerald-50 px-4 py-2 rounded-full' : ''}`}>
      <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
      {focused && (
        <Text className="text-[10px] font-bold text-emerald-800 mt-1">{label}</Text>
      )}
    </View>
  )
}
