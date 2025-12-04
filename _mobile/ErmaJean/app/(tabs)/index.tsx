import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/libs/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Recipe, Profile, MealSlot } from '@/types/config';
import { Colors, Spacing, Typography, Shadows, BorderRadius, Layout } from '@/constants/design';
import { FadeInView, StaggeredList, AnimatedCard } from '@/components/animated';
import { Haptic } from '@/utils/haptics';
import { getMealPlans } from '@/services/mealPlanService';
import { formatDate, isToday } from '@/utils/dateUtils';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todaysMeals, setTodaysMeals] = useState<MealSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }

      // Fetch recent recipes
      const { data: recipesData } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (recipesData) {
        setRecipes(recipesData);
      }

      // Fetch today's meal plan
      const today = new Date();
      const todayStr = formatDate(today);
      const { data: mealsData } = await supabase
        .from('meal_plans')
        .select(`
          id,
          date,
          meal_type,
          recipe_id,
          recipes (
            recipe_name,
            total_time,
            calories
          )
        `)
        .eq('user_id', user?.id)
        .eq('date', todayStr);

      if (mealsData) {
        const meals: MealSlot[] = mealsData.map((plan: any) => ({
          date: plan.date,
          mealType: plan.meal_type,
          recipeId: plan.recipe_id,
          recipeName: plan.recipes?.recipe_name,
        }));
        setTodaysMeals(meals);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptic.refresh();
    await fetchData();
  };

  const handleSignOut = async () => {
    await Haptic.buttonPress();
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'Breakfast':
        return '🌅';
      case 'Lunch':
        return '☀️';
      case 'Dinner':
        return '🌙';
      default:
        return '🍽️';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.gradients.emerald}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <FadeInView duration={400}>
            <View style={styles.headerContainer}>
              <View style={styles.headerContent}>
                <Text style={styles.greetingText}>{getGreeting()},</Text>
                <Text style={styles.nameText}>
                  {profile?.name?.split(' ')[0] || 'Chef'}!
                </Text>
                {profile?.has_access && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>✨ Premium</Text>
                  </View>
                )}
              </View>
            </View>
          </FadeInView>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <FadeInView delay={200} duration={400}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <AnimatedCard
                style={styles.quickActionCard}
                onPress={async () => {
                  await Haptic.buttonPress();
                  router.push('/(tabs)/meal-plans');
                }}
                shadow="md"
              >
                <LinearGradient
                  colors={Colors.gradients.primary}
                  style={styles.quickActionGradient}
                >
                  <Text style={styles.quickActionIcon}>📅</Text>
                  <Text style={styles.quickActionText}>Meal Plans</Text>
                </LinearGradient>
              </AnimatedCard>

              <AnimatedCard
                style={styles.quickActionCard}
                onPress={async () => {
                  await Haptic.buttonPress();
                  router.push('/(tabs)/generate');
                }}
                shadow="md"
              >
                <LinearGradient
                  colors={Colors.gradients.secondary}
                  style={styles.quickActionGradient}
                >
                  <Text style={styles.quickActionIcon}>✨</Text>
                  <Text style={styles.quickActionText}>AI Generate</Text>
                </LinearGradient>
              </AnimatedCard>

              <AnimatedCard
                style={styles.quickActionCard}
                onPress={async () => {
                  await Haptic.buttonPress();
                  router.push('/(tabs)/recipes');
                }}
                shadow="md"
              >
                <LinearGradient
                  colors={Colors.gradients.ocean}
                  style={styles.quickActionGradient}
                >
                  <Text style={styles.quickActionIcon}>📖</Text>
                  <Text style={styles.quickActionText}>My Recipes</Text>
                </LinearGradient>
              </AnimatedCard>

              <AnimatedCard
                style={styles.quickActionCard}
                onPress={async () => {
                  await Haptic.buttonPress();
                  router.push('/(tabs)/profile');
                }}
                shadow="md"
              >
                <LinearGradient
                  colors={Colors.gradients.sunset}
                  style={styles.quickActionGradient}
                >
                  <Text style={styles.quickActionIcon}>👤</Text>
                  <Text style={styles.quickActionText}>Profile</Text>
                </LinearGradient>
              </AnimatedCard>
            </View>
          </View>
        </FadeInView>

        {/* Today's Meals */}
        {todaysMeals.length > 0 && (
          <FadeInView delay={300} duration={400}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Meals</Text>
                <TouchableOpacity
                  onPress={async () => {
                    await Haptic.buttonPress();
                    router.push('/(tabs)/meal-plans');
                  }}
                >
                  <Text style={styles.seeAllText}>View All →</Text>
                </TouchableOpacity>
              </View>
              <StaggeredList
                staggerDelay={80}
                itemDuration={300}
                style={styles.todaysMealsList}
              >
                {todaysMeals.map((meal, index) => (
                  <AnimatedCard
                    key={`${meal.date}-${meal.mealType}`}
                    style={styles.mealCard}
                    onPress={async () => {
                      await Haptic.cardTap();
                      if (meal.recipeId) {
                        router.push(`/recipe/${meal.recipeId}`);
                      }
                    }}
                    shadow="sm"
                  >
                    <View style={styles.mealCardContent}>
                      <View style={styles.mealIconContainer}>
                        <Text style={styles.mealIcon}>{getMealIcon(meal.mealType)}</Text>
                      </View>
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealType}>{meal.mealType}</Text>
                        <Text style={styles.mealRecipeName} numberOfLines={1}>
                          {meal.recipeName || 'No meal planned'}
                        </Text>
                      </View>
                      <Text style={styles.mealArrow}>›</Text>
                    </View>
                  </AnimatedCard>
                ))}
              </StaggeredList>
            </View>
          </FadeInView>
        )}

        {/* Recent Recipes */}
        <FadeInView delay={400} duration={400}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Recipes</Text>
              <TouchableOpacity
                onPress={async () => {
                  await Haptic.buttonPress();
                  router.push('/(tabs)/recipes');
                }}
              >
                <Text style={styles.seeAllText}>See All →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              <StaggeredList
                staggerDelay={100}
                itemDuration={400}
                style={styles.recipeList}
              >
                {recipes.map((item) => (
                  <AnimatedCard
                    key={item.id}
                    style={styles.recipeCard}
                    onPress={async () => {
                      await Haptic.cardTap();
                      router.push(`/recipe/${item.id}`);
                    }}
                    shadow="lg"
                  >
                    <View style={styles.recipeImageContainer}>
                      <LinearGradient
                        colors={Colors.gradients.primary}
                        style={styles.recipeImageGradient}
                      >
                        <Text style={styles.recipeEmoji}>🍳</Text>
                      </LinearGradient>
                    </View>
                    <Text style={styles.recipeName} numberOfLines={1}>
                      {item.recipe_name}
                    </Text>
                    <Text style={styles.recipeDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.recipeMeta}>
                      {item.total_time && (
                        <View style={styles.timeBadge}>
                          <Text style={styles.timeBadgeText}>⏱ {item.total_time}</Text>
                        </View>
                      )}
                      {item.calories && (
                        <View style={styles.caloriesBadge}>
                          <Text style={styles.caloriesBadgeText}>🔥 {item.calories} cal</Text>
                        </View>
                      )}
                    </View>
                  </AnimatedCard>
                ))}
              </StaggeredList>
            </ScrollView>
          </View>
        </FadeInView>

        {/* Stats Card */}
        <FadeInView delay={500} duration={400}>
          <View style={styles.section}>
            <AnimatedCard style={styles.statsCard} shadow="md">
              <LinearGradient
                colors={[Colors.primary[500], Colors.primary[600]]}
                style={styles.statsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statsContent}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{recipes.length}</Text>
                    <Text style={styles.statLabel}>Recipes</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{todaysMeals.length}</Text>
                    <Text style={styles.statLabel}>Today's Meals</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile?.has_access ? '∞' : '5'}</Text>
                    <Text style={styles.statLabel}>AI Recipes</Text>
                  </View>
                </View>
              </LinearGradient>
            </AnimatedCard>
          </View>
        </FadeInView>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  headerGradient: {
    paddingBottom: Spacing.xl,
  },
  headerSafeArea: {
    paddingHorizontal: Spacing.screenPadding,
  },
  headerContainer: {
    paddingTop: Spacing.md,
  },
  headerContent: {
    flexDirection: 'column',
  },
  greetingText: {
    ...Typography.styles.body,
    color: Colors.primary[50],
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  nameText: {
    ...Typography.styles.h1,
    color: Colors.background.primary,
    marginBottom: Spacing.xs,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.background.primary + '30',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  premiumBadgeText: {
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.styles.h4,
    color: Colors.text.primary,
  },
  seeAllText: {
    ...Typography.styles.body,
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.semibold,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickActionCard: {
    width: (width - Spacing.screenPadding * 2 - Spacing.md) / 2,
    height: 120,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  quickActionIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    ...Typography.styles.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.background.primary,
  },
  todaysMealsList: {
    gap: Spacing.sm,
  },
  mealCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  mealCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  mealRecipeName: {
    ...Typography.styles.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  mealArrow: {
    ...Typography.styles.h3,
    color: Colors.text.tertiary,
  },
  horizontalScroll: {
    paddingRight: Spacing.md,
  },
  recipeList: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  recipeCard: {
    width: 260,
    padding: Spacing.md,
    marginRight: Spacing.md,
  },
  recipeImageContainer: {
    height: 140,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  recipeImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeEmoji: {
    fontSize: 48,
  },
  recipeName: {
    ...Typography.styles.h5,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  recipeDescription: {
    ...Typography.styles.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  timeBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  timeBadgeText: {
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
  },
  caloriesBadge: {
    backgroundColor: Colors.warning.light + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  caloriesBadgeText: {
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.warning.dark,
  },
  statsCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: Spacing.lg,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...Typography.styles.h2,
    color: Colors.background.primary,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.styles.caption,
    color: Colors.primary[50],
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.background.primary + '30',
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
});
