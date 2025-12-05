/**
 * MealSlot Component
 * Displays a meal slot with swipe-to-delete gesture, recipe display, and empty state
 * Requirements: 3.2, 3.4
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../types/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DELETE_THRESHOLD = -80;

export interface MealSlotProps {
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  recipe?: Recipe;
  onPress: () => void;
  onDelete: () => void;
}

const MEAL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Breakfast: 'sunny-outline',
  Lunch: 'restaurant-outline',
  Dinner: 'moon-outline',
};

export function MealSlot({ date, mealType, recipe, onPress, onDelete }: MealSlotProps) {
  const translateX = useSharedValue(0);
  const isDeleting = useSharedValue(false);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDelete();
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Only allow left swipe (negative values)
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, DELETE_THRESHOLD - 20);
      }
    })
    .onEnd((event) => {
      if (event.translationX < DELETE_THRESHOLD) {
        // Trigger delete
        isDeleting.value = true;
        translateX.value = withSpring(-SCREEN_WIDTH, { damping: 20 });
        runOnJS(handleDelete)();
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 20 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteButtonStyle = useAnimatedStyle(() => ({
    opacity: Math.min(Math.abs(translateX.value) / Math.abs(DELETE_THRESHOLD), 1),
  }));

  return (
    <View style={styles.container}>
      {/* Delete action background */}
      <Animated.View style={[styles.deleteAction, deleteButtonStyle]}>
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>

      {/* Main content */}
      <GestureDetector gesture={recipe ? panGesture : Gesture.Pan()}>
        <Animated.View style={[styles.slotContainer, animatedStyle]}>
          <TouchableOpacity
            style={[styles.slot, recipe ? styles.filledSlot : styles.emptySlot]}
            onPress={() => {
              triggerHaptic();
              onPress();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.mealTypeContainer}>
              <Ionicons
                name={MEAL_ICONS[mealType]}
                size={16}
                color={recipe ? '#10b981' : '#9ca3af'}
              />
              <Text style={[styles.mealType, recipe && styles.filledMealType]}>
                {mealType}
              </Text>
            </View>

            {recipe ? (
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeName} numberOfLines={1}>
                  {recipe.recipe_name}
                </Text>
                {recipe.calories && (
                  <Text style={styles.recipeCalories}>
                    {recipe.calories} cal
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="add-circle-outline" size={20} color="#9ca3af" />
                <Text style={styles.emptyText}>Add meal</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 4,
    overflow: 'hidden',
    borderRadius: 12,
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4,
  },
  deleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  slotContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minHeight: 56,
  },
  emptySlot: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  filledSlot: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1fae5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    gap: 6,
  },
  mealType: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
  },
  filledMealType: {
    color: '#10b981',
  },
  recipeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  recipeCalories: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default MealSlot;
