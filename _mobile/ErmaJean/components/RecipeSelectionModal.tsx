/**
 * RecipeSelectionModal Component
 * Modal for selecting recipes when adding to meal plan
 * Requirements: 3.2
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Recipe } from '../types/config';
import { filterRecipes } from '../utils/recipeSearch';

export interface RecipeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  recipes: Recipe[];
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  date: string;
}

interface RecipeItemProps {
  recipe: Recipe;
  onSelect: () => void;
}

function RecipeItem({ recipe, onSelect }: RecipeItemProps) {
  return (
    <TouchableOpacity
      style={styles.recipeItem}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.recipeContent}>
        <Text style={styles.recipeName} numberOfLines={1}>
          {recipe.recipe_name}
        </Text>
        <View style={styles.recipeDetails}>
          {recipe.total_time && (
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color="#6b7280" />
              <Text style={styles.detailText}>{recipe.total_time}</Text>
            </View>
          )}
          {recipe.calories && (
            <View style={styles.detailItem}>
              <Ionicons name="flame-outline" size={14} color="#6b7280" />
              <Text style={styles.detailText}>{recipe.calories} cal</Text>
            </View>
          )}
          {recipe.course && (
            <View style={styles.courseBadge}>
              <Text style={styles.courseText}>{recipe.course}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );
}

export function RecipeSelectionModal({
  visible,
  onClose,
  onSelect,
  recipes,
  mealType,
  date,
}: RecipeSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) {
      return recipes;
    }
    return filterRecipes(recipes, searchQuery);
  }, [recipes, searchQuery]);

  // Sort recipes - prioritize matching course type
  const sortedRecipes = useMemo(() => {
    return [...filteredRecipes].sort((a, b) => {
      // Prioritize recipes matching the meal type
      const aMatchesMealType = a.course?.toLowerCase() === mealType.toLowerCase();
      const bMatchesMealType = b.course?.toLowerCase() === mealType.toLowerCase();
      
      if (aMatchesMealType && !bMatchesMealType) return -1;
      if (!aMatchesMealType && bMatchesMealType) return 1;
      
      // Then sort alphabetically
      return a.recipe_name.localeCompare(b.recipe_name);
    });
  }, [filteredRecipes, mealType]);

  const handleSelect = (recipe: Recipe) => {
    onSelect(recipe);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Select Recipe</Text>
            <Text style={styles.subtitle}>
              {mealType} • {formatDate(date)}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search recipes..."
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Recipe List */}
        <FlatList
          data={sortedRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeItem recipe={item} onSelect={() => handleSelect(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No recipes found' : 'No recipes yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add some recipes to get started'}
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recipeContent: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
  },
  courseBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  courseText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#059669',
  },
  separator: {
    height: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default RecipeSelectionModal;
