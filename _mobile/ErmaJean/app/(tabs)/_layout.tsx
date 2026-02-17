import { Tabs } from 'expo-router';
import { View, Text, Platform, Animated, Pressable } from 'react-native';
import { ChefHat, Calendar, User } from 'lucide-react-native';
import { Colors } from '@/constants/design';
import { useRef, useEffect } from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 34 : 16, // Account for home indicator
          left: 16,
          right: 16,
          elevation: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Backdrop blur effect
          borderRadius: 25,
          height: 52,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          borderTopWidth: 0,
          paddingBottom: 0,
          paddingTop: 0,
          marginHorizontal:16,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          height: 48,
          width: 'auto',
          marginVertical: 8,
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
    </Tabs>
  );
}

function TabIcon({ icon: Icon, label, color, focused }: { icon: any, label: string, color: string, focused: boolean }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.05 : 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [focused]);

  return (
    <Animated.View 
      style={{ 
        transform: [{ scale: scaleAnim }],
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        minWidth: 70,
        height: '100%',
      }}
      className={`${focused ? 'bg-emerald-50 px-4 py-2 rounded-full' : 'px-4 py-2'}`}
    >
      <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
      <Text 
        numberOfLines={1}
        ellipsizeMode="clip"
        style={{ 
          textAlign: 'center',
          color: focused ? '#065f46' : '#a8a29e', // emerald-800 for focused, stone-400 for unfocused
          marginTop: 2,
          flexShrink: 0,
        }}
        className="text-[10px] font-bold"
      >
        {label}
      </Text>
    </Animated.View>
  )
}
