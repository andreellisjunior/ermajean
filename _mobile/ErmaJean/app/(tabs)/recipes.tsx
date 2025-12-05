/**
 * Recipes Screen
 * Displays saved recipes with skeleton loading, improved card design, and pull-to-refresh
 * Requirements: 1.1, 1.4, 1.5, 7.1, 2.4, 2.5
 */

import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/libs/supabase';
import { useEffect, useState, useCallback } from 'react';
import { Recipe, RecipeInput, Profile } from '@/types/config';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AddRecipeFAB } from '@/components/AddRecipeFAB';
import { RecipeFormModal } from '@/components/RecipeFormModal';
import { createRecipe } from '@/services/recipeService';
import { getProfile } from '@/services/profileService';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '@/constants/design';
import { Haptic } from '@/utils/haptics';

// Plan limits based on config
const PLAN_LIMITS = {
  free: 3,
  monthly: 8,
  unlimited: null,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Skeleton Loading Component for recipe cards
function SkeletonCard({ index }: { index: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(300)}
      style={styles.skeletonCard}
    >
      <Animated.View style={[styles.skeletonImage, animatedStyle]} />
      <View style={styles.skeletonContent}>
        <Animated.View style={[styles.skeletonTitle, animatedStyle]} />
        <Animated.View style={[styles.skeletonDescription, animatedStyle]} />
        <View style={styles.skeletonMeta}>
          <Animated.View style={[styles.skeletonBadge, animatedStyle]} />
          <Animated.View style={[styles.skeletonBadge, animatedStyle]} />
        </View>
      </View>
    </Animated.View>
  );
}

// Enhanced Recipe Card Component
function RecipeCard({ item, index }: { item: Recipe; index: number }) {
  const handlePress = async () => {
    await Haptic.cardTap();
    router.push(`/recipe/${item.id}`);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400).springify()}>
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Recipe Image Placeholder */}
        <View style={styles.imageContainer}>
          <LinearGradient
            colors={['#d6d3d1', '#a8a29e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.imagePlaceholder}
          >
            <Text style={styles.imageEmoji}>🥘</Text>
          </LinearGradient>
          {/* Course Badge */}
          {item.course && (
            <View style={styles.courseBadge}>
              <Text style={styles.courseBadgeText}>{item.course}</Text>
            </View>
          )}
        </View>

        {/* Recipe Content */}
        <View style={styles.cardContent}>
          <Text style={styles.recipeName} numberOfLines={1}>
            {item.recipe_name}
          </Text>
          <Text style={styles.recipeDescription} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Meta Info Row */}
          <View style={styles.metaRow}>
            {item.total_time && (
              <View style={styles.metaBadge}>
                <Ionicons name="time-outline" size={12} color="#6b7280" />
                <Text style={styles.metaText}>{item.total_time}</Text>
              </View>
            )}
            {item.calories && (
              <View style={styles.metaBadge}>
                <Ionicons name="flame-outline" size={12} color="#6b7280" />
                <Text style={styles.metaText}>{item.calories} cal</Text>
              </View>
            )}
            {item.difficulty_level && (
              <View style={[styles.metaBadge, styles.difficultyBadge]}>
                <Text style={styles.difficultyText}>{item.difficulty_level}</Text>
              </View>
            )}
          </View>

          {/* Macro Summary */}
          {(item.protein || item.carbs || item.fat) && (
            <View style={styles.macroRow}>
              {item.protein && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{item.protein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
              )}
              {item.carbs && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{item.carbs}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
              )}
              {item.fat && (
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{item.fat}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Arrow Indicator */}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="restaurant-outline" size={48} color="#d1d5db" />
      </View>
      <Text style={styles.emptyTitle}>No recipes yet</Text>
      <Text style={styles.emptySubtitle}>
        Start by generating a recipe with AI or adding one manually
      </Text>
    </View>
  );
}

// Upgrade Modal Component (Requirements 2.4, 2.5)
function UpgradeModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.upgradeOverlay}>
        <View style={styles.upgradeModal}>
          <View style={styles.upgradeIconContainer}>
            <Ionicons name="sparkles" size={32} color="#8b5cf6" />
          </View>
          <Text style={styles.upgradeTitle}>Recipe Limit Reached</Text>
          <Text style={styles.upgradeDescription}>
            You've used all your AI recipe generations. Upgrade to continue creating delicious recipes!
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={async () => {
              await Haptic.buttonPress();
              onClose();
              // Navigate to profile for upgrade
              router.push('/(tabs)/profile');
            }}
          >
            <Text style={styles.upgradeButtonText}>View Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.upgradeCancelButton}
            onPress={onClose}
          >
            <Text style={styles.upgradeCancelText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // FAB and modal state (Requirements 7.1, 2.4, 2.5)
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recipeUsageCount, setRecipeUsageCount] = useState(0);

  useEffect(() => {
    fetchRecipes();
    fetchProfile();
  }, []);
  
  // Fetch user profile for plan info (Requirements 2.4, 2.5)
  const fetchProfile = async () => {
    try {
      const profileData = await getProfile();
      setProfile(profileData);
      
      // Fetch recipe usage count
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { count } = await supabase
          .from('recipes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.user.id)
          .not('ai_generated', 'is', null);
        
        setRecipeUsageCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  // Determine plan type from profile
  const getPlanType = (): 'free' | 'monthly' | 'unlimited' => {
    if (!profile) return 'free';
    if (!profile.has_access) return 'free';
    // Check price_id to determine plan type
    if (profile.price_id === 'price_1QWp6pEl9PRnOeq5BdPuTmWU') return 'unlimited'; // Yearly
    if (profile.price_id === 'price_1S1vPoEl9PRnOeq5lBf7pBbo') return 'monthly';
    return 'free';
  };
  
  const planType = getPlanType();
  const planLimit = PLAN_LIMITS[planType];
  
  // Handle AI Generate button press (Requirements 2.4, 2.5)
  const handleAIGenerate = () => {
    // Check plan limits
    if (planLimit !== null && recipeUsageCount >= planLimit) {
      setShowUpgradeModal(true);
      return;
    }
    // Navigate to generate screen
    router.push('/(tabs)/generate');
  };
  
  // Handle Manual Add button press (Requirement 7.1)
  const handleManualAdd = () => {
    setShowRecipeForm(true);
  };
  
  // Handle recipe form submission (Requirement 7.1)
  const handleRecipeSubmit = async (recipeInput: RecipeInput) => {
    try {
      await createRecipe(recipeInput);
      await fetchRecipes();
      Alert.alert('Success', 'Recipe added successfully!');
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (search) {
      const filtered = recipes.filter(
        (r) =>
          r.recipe_name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipes);
    }
  }, [search, recipes]);

  const fetchRecipes = async () => {
    try {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setRecipes(data);
        setFilteredRecipes(data);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh handler (Requirement 1.4)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptic.refresh();
    await fetchRecipes();
    setRefreshing(false);
  }, []);

  const clearSearch = async () => {
    setSearch('');
    await Haptic.light();
  };

  // Render skeleton loading placeholders (Requirement 1.5)
  const renderSkeletonList = () => (
    <View style={styles.listContainer}>
      {[0, 1, 2, 3, 4].map((index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </View>
  );

  const renderItem = ({ item, index }: { item: Recipe; index: number }) => (
    <RecipeCard item={item} index={index} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recipes</Text>
        <View style={styles.headerRow}>
          <Text style={styles.headerSubtitle}>
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} saved
          </Text>
          {/* Show remaining AI recipes for non-unlimited plans (Requirement 2.5) */}
          {planLimit !== null && (
            <View style={styles.remainingBadge}>
              <Ionicons name="sparkles" size={12} color="#8b5cf6" />
              <Text style={styles.remainingText}>
                {Math.max(0, planLimit - recipeUsageCount)} AI left
              </Text>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={16} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9ca3af"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        renderSkeletonList()
      ) : filteredRecipes.length === 0 && search === '' ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10b981"
              colors={['#10b981']}
            />
          }
          ListEmptyComponent={
            search !== '' ? (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={32} color="#d1d5db" />
                <Text style={styles.noResultsText}>
                  No recipes found for "{search}"
                </Text>
              </View>
            ) : null
          }
        />
      )}
      
      {/* Add Recipe FAB (Requirement 7.1) */}
      <AddRecipeFAB
        onAIGenerate={handleAIGenerate}
        onManualAdd={handleManualAdd}
        recipeCount={recipeUsageCount}
        planType={planType}
        planLimit={planLimit}
      />
      
      {/* Recipe Form Modal (Requirement 7.1) */}
      <RecipeFormModal
        visible={showRecipeForm}
        onClose={() => setShowRecipeForm(false)}
        onSubmit={handleRecipeSubmit}
      />
      
      {/* Upgrade Modal (Requirements 2.4, 2.5) */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 2,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  // Skeleton styles
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  skeletonImage: {
    height: 140,
    backgroundColor: '#e5e7eb',
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '70%',
    marginBottom: 8,
  },
  skeletonDescription: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '90%',
    marginBottom: 12,
  },
  skeletonMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonBadge: {
    height: 24,
    width: 60,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  // Recipe card styles
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24, // Changed from 16 to use gap-6 spacing
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f5f5f4', // Added subtle border: border-stone-100
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Changed from 0.08 to shadow-md
    shadowRadius: 8, // Changed from 12 for shadow-md
    elevation: 3,
    flexDirection: 'row',
  },
  imageContainer: {
    width: 100,
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  imageEmoji: {
    fontSize: 36,
  },
  courseBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  courseBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 19, // Changed to leading-relaxed (1.625 * 13 ≈ 21, but keeping proportional)
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Changed to bg-white/90 for backdrop-blur-md effect
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, // Added shadow-sm
    shadowRadius: 2,
    elevation: 1,
  },
  metaText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  difficultyBadge: {
    backgroundColor: '#fef3c7',
  },
  difficultyText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '500',
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  macroLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // No results styles
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  // Header row styles
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  remainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  // Upgrade modal styles
  upgradeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  upgradeModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  upgradeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradeDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  upgradeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  upgradeCancelButton: {
    paddingVertical: 10,
  },
  upgradeCancelText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
