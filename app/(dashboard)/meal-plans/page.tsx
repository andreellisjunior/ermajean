'use client';

import {
  clearWeekMealPlanAction,
  removeMealFromPlanAction,
} from '@/app/actions';
import BottomNavigation from '@/components/BottomNavigation';
import ProfileSettings from '@/components/ProfileSettings';
import AddMealModal from '@/components/ui/AddMealModal';
import MacroCounter from '@/components/ui/MacroCounter';
import RecipeModal from '@/components/ui/RecipeModal';
import ShoppingListModal from '@/components/ui/ShoppingListModal';
import { Button } from '@/components/ui/button';
import { Message } from '@/components/ui/form-message';
import { createClient } from '@/libs/supabase/client';
import { Recipe } from '@/types';
import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
  subDays,
} from 'date-fns';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Settings,
  ShoppingCart,
  Utensils,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

interface PlannedMeal {
  date: string;
  meal_type: string;
  recipe_name?: string;
  recipe_id?: string;
}

const getMealForSlot = (
  plannedMeals: PlannedMeal[],
  date: Date,
  meal: string
): PlannedMeal | undefined => {
  const dateString = format(date, 'yyyy-MM-dd');
  return plannedMeals.find(
    (m) => m.date === dateString && m.meal_type === meal
  );
};

const getMealIcon = (meal: string) => {
  switch (meal) {
    case 'Breakfast':
      return <Clock className="h-4 w-4" />;
    case 'Lunch':
      return <Utensils className="h-4 w-4" />;
    case 'Dinner':
      return <Utensils className="h-4 w-4" />;
    default:
      return <Utensils className="h-4 w-4" />;
  }
};

export default function MealPlansPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [shoppingListModalOpen, setShoppingListModalOpen] = useState(false);
  const [weekSelectorOpen, setWeekSelectorOpen] = useState(false);
  const [profiles, setProfiles] = useState<
    | {
        name: string;
        email: string;
        location?: string;
        has_access: boolean;
        price_id?: string;
        calorie_goal?: number;
        protein_goal?: number;
        carb_goal?: number;
        fat_goal?: number;
      }[]
    | null
  >(null);
  const [macroGoals, setMacroGoals] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const currentWeekString = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  const handlePrev = () => setCurrentDate(subDays(currentDate, 7));
  const handleNext = () => setCurrentDate(addDays(currentDate, 7));
  const handleToday = () => setCurrentDate(new Date());

  // Generate week options (8 weeks back, current week, 8 weeks forward)
  const generateWeekOptions = () => {
    const options = [];
    const today = new Date();

    // Add past weeks (8 weeks back)
    for (let i = 8; i >= 1; i--) {
      const weekDate = subDays(today, i * 7);
      const weekStartDate = startOfWeek(weekDate, { weekStartsOn: 1 });
      const weekEndDate = endOfWeek(weekDate, { weekStartsOn: 1 });
      options.push({
        date: weekDate,
        label: `${format(weekStartDate, 'MMM d')} - ${format(weekEndDate, 'MMM d, yyyy')}`,
        isCurrentWeek: false,
        isPast: true,
      });
    }

    // Add current week
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
    options.push({
      date: today,
      label: `${format(currentWeekStart, 'MMM d')} - ${format(currentWeekEnd, 'MMM d, yyyy')} (This Week)`,
      isCurrentWeek: true,
      isPast: false,
    });

    // Add future weeks (8 weeks forward)
    for (let i = 1; i <= 8; i++) {
      const weekDate = addDays(today, i * 7);
      const weekStartDate = startOfWeek(weekDate, { weekStartsOn: 1 });
      const weekEndDate = endOfWeek(weekDate, { weekStartsOn: 1 });
      options.push({
        date: weekDate,
        label: `${format(weekStartDate, 'MMM d')} - ${format(weekEndDate, 'MMM d, yyyy')}`,
        isCurrentWeek: false,
        isPast: false,
      });
    }

    return options;
  };

  const weekOptions = generateWeekOptions();

  const handleWeekSelect = (selectedDate: Date) => {
    setCurrentDate(selectedDate);
    setWeekSelectorOpen(false);
  };

  // Handle keyboard navigation for week selector
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setWeekSelectorOpen(false);
    }
  };

  const handleAddMeal = (date: Date, mealType: string) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setSelectedMealType(mealType);
    setModalOpen(true);
  };

  const handleRemoveMeal = async (date: Date, mealType: string) => {
    const formData = new FormData();
    formData.append('date', format(date, 'yyyy-MM-dd'));
    formData.append('mealType', mealType);
    await removeMealFromPlanAction(formData);
    fetchMealPlans();
  };

  const handleClearWeek = async () => {
    const formData = new FormData();
    formData.append('weekStart', format(weekStart, 'yyyy-MM-dd'));
    formData.append('weekEnd', format(weekEnd, 'yyyy-MM-dd'));
    await clearWeekMealPlanAction(formData);
    fetchMealPlans();
  };

  const handleViewRecipe = (recipeId: string) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (recipe) {
      setSelectedRecipe(recipe);
      setRecipeModalOpen(true);
    }
  };

  const fetchMealPlans = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('meal_plans')
        .select(
          `
          date,
          meal_type,
          recipes (
            id,
            recipe_name
          )
        `
        )
        .eq('user_id', user.id)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));

      if (data) {
        const formattedMeals = data.map((meal: any) => ({
          date: meal.date,
          meal_type: meal.meal_type,
          recipe_name: meal.recipes?.recipe_name,
          recipe_id: meal.recipes?.id,
        }));
        setPlannedMeals(formattedMeals);
      }
    }
  };

  const fetchRecipes = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('recipes')
        .select(
          'id,recipe_name,description,prep_time,cook_time,total_time,servings,difficulty_level,course,ingredients,instructions,est_cost,est_savings,calories,protein,carbs,fat,fiber,sugar,sodium'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setRecipes(data);
      }
    }
  };

  const fetchProfiles = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select(
          'name, email, location, has_access, price_id, calorie_goal, protein_goal, carb_goal, fat_goal'
        )
        .eq('id', user.id)
        .single();

      if (data) {
        setProfiles([data]);
        setMacroGoals({
          calories: data.calorie_goal || 2000,
          protein: data.protein_goal || 150,
          carbs: data.carb_goal || 250,
          fat: data.fat_goal || 65,
        });
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMealPlans(), fetchRecipes(), fetchProfiles()]);
      setLoading(false);
    };
    loadData();
  }, [currentDate]);

  // Refresh meal plans when modal closes
  useEffect(() => {
    if (!modalOpen) {
      fetchMealPlans();
    }
  }, [modalOpen]);

  // Refresh profiles when profile modal closes (to update macro goals)
  useEffect(() => {
    if (!profileModalOpen) {
      fetchProfiles();
    }
  }, [profileModalOpen]);

  // Close week selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (weekSelectorOpen && !target.closest('.week-selector')) {
        setWeekSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [weekSelectorOpen]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4 relative">
        <h1 className="text-4xl font-bold text-foreground">
          Weekly Meal Planner
        </h1>
        <p className="text-muted-foreground text-lg">
          Plan your meals for a healthier week
        </p>
      </div>

      {/* Week Navigation */}
      <div className="bg-card rounded-xl p-6 border shadow-sm space-y-4">
        {/* Week Selector */}
        <div className="flex items-center justify-center">
          <div className="relative week-selector">
            <Button
              variant="outline"
              onClick={() => setWeekSelectorOpen(!weekSelectorOpen)}
              onKeyDown={handleKeyDown}
              className="flex items-center gap-2 min-w-[280px] justify-between"
            >
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{currentWeekString}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${weekSelectorOpen ? 'rotate-180' : ''}`}
              />
            </Button>

            {weekSelectorOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {weekOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleWeekSelect(option.date)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-b-0 ${
                      option.isCurrentWeek
                        ? 'bg-primary/10 text-primary font-semibold border-l-4 border-l-primary'
                        : option.isPast
                          ? 'text-gray-600'
                          : 'text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Week
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="text-muted-foreground hover:text-foreground"
          >
            Go to This Week
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            Next Week
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Meal Planning Grid */}
      <div className="space-y-6">
        {daysInWeek.map((day) => (
          <div
            key={day.toISOString()}
            className={`bg-card rounded-xl border shadow-sm overflow-hidden ${
              isToday(day) ? 'ring-2 ring-primary ring-opacity-50' : ''
            }`}
          >
            {/* Day Header */}
            <div
              className={`px-6 py-4 border-b ${
                isToday(day) ? 'bg-primary/5' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      isToday(day) ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {format(day, 'EEEE')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(day, 'MMMM d, yyyy')}
                  </p>
                </div>
                {isToday(day) && (
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Today
                  </span>
                )}
              </div>
            </div>

            {/* Meals for the day */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mealTypes.map((meal) => {
                  const plannedMeal = getMealForSlot(plannedMeals, day, meal);

                  return (
                    <div
                      key={meal}
                      className="bg-background rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {getMealIcon(meal)}
                        <h4 className="font-medium text-foreground">{meal}</h4>
                      </div>

                      {plannedMeal ? (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-foreground">
                            {plannedMeal.recipe_name}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() =>
                                handleViewRecipe(plannedMeal.recipe_id!)
                              }
                            >
                              View Recipe
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground"
                              onClick={() => handleRemoveMeal(day, meal)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            No meal planned
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center gap-2 text-xs"
                            onClick={() => handleAddMeal(day, meal)}
                          >
                            <Plus className="h-3 w-3" />
                            Add Meal
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Macro Counter */}
              <MacroCounter
                date={format(day, 'yyyy-MM-dd')}
                plannedMeals={plannedMeals}
                recipes={recipes}
                macroGoals={macroGoals || undefined}
                onOpenSettings={() => setProfileModalOpen(true)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center py-8">
        <Button
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          onClick={() => setShoppingListModalOpen(true)}
        >
          <ShoppingCart className="h-4 w-4" />
          Generate Shopping List
        </Button>
      </div>

      {/* Add Meal Modal */}
      <AddMealModal
        open={modalOpen}
        setOpen={setModalOpen}
        date={selectedDate}
        mealType={selectedMealType}
        recipes={recipes}
        profiles={[{ location: 'USA', has_access: false, price_id: undefined }]}
        recipeCount={recipes.length}
        onRecipeCreated={fetchRecipes}
      />

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          open={recipeModalOpen}
          setOpen={setRecipeModalOpen}
          searchParams={{} as Message}
          profiles={[]}
        />
      )}

      {/* Profile Settings Modal */}
      {profiles && (
        <ProfileSettings
          open={profileModalOpen}
          setOpen={setProfileModalOpen}
          profile={profiles}
        />
      )}

      {/* Shopping List Modal */}
      <ShoppingListModal
        open={shoppingListModalOpen}
        setOpen={setShoppingListModalOpen}
        weekStart={weekStart}
        weekEnd={weekEnd}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading meal plans...</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation profile={profiles} />
    </div>
  );
}
