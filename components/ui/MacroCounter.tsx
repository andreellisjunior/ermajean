'use client';

import { DayMacros, MacroGoals, Recipe } from '@/types';
import { Activity, Flame, Wheat, Zap } from 'lucide-react';
import QuickMacroGoalsButton from './QuickMacroGoalsButton';

interface MacroCounterProps {
  date: string;
  plannedMeals: Array<{
    date: string;
    meal_type: string;
    recipe_name?: string;
    recipe_id?: string;
  }>;
  recipes: Recipe[];
  macroGoals?: MacroGoals;
  onOpenSettings?: () => void;
}

interface MacroDisplayProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
  target?: number;
}

const MacroDisplay = ({
  icon,
  label,
  value,
  unit,
  color,
  target,
}: MacroDisplayProps) => {
  const percentage = target ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
      <div className={`p-2 rounded-full ${color}`}>{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(value)}
            {unit}
            {target && (
              <span className="text-xs ml-1">
                / {target}
                {unit}
              </span>
            )}
          </span>
        </div>
        {target && (
          <div className="mt-1 w-full bg-muted rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${color.replace('bg-', 'bg-').replace('/10', '')}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default function MacroCounter({
  date,
  plannedMeals,
  recipes,
  macroGoals,
  onOpenSettings,
}: MacroCounterProps) {
  // Calculate daily macros from planned meals
  const calculateDayMacros = (): DayMacros => {
    const dayMeals = plannedMeals.filter((meal) => meal.date === date);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;

    dayMeals.forEach((meal) => {
      if (meal.recipe_id) {
        const recipe = recipes.find((r) => r.id === meal.recipe_id);
        if (recipe) {
          // Add nutritional values (defaulting to 0 if not available)
          // Note: These values are per serving as defined in the recipe
          totalCalories += recipe.calories || 0;
          totalProtein += recipe.protein || 0;
          totalCarbs += recipe.carbs || 0;
          totalFat += recipe.fat || 0;
          totalFiber += recipe.fiber || 0;
          totalSugar += recipe.sugar || 0;
          totalSodium += recipe.sodium || 0;
        }
      }
    });

    return {
      date,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      fiber: totalFiber,
      sugar: totalSugar,
      sodium: totalSodium,
    };
  };

  const dayMacros = calculateDayMacros();

  // Use user-specific goals or default targets
  const targets = macroGoals || {
    calories: 2000,
    protein: 150, // grams
    carbs: 250, // grams
    fat: 65, // grams
  };

  // Check if any meals are planned for this day
  const hasMeals = plannedMeals.some(
    (meal) => meal.date === date && meal.recipe_id
  );

  if (!hasMeals) {
    return (
      <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-dashed">
        <div className="text-center text-muted-foreground">
          <Activity className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Add meals to see macro breakdown</p>
        </div>
      </div>
    );
  }

  // Check if any recipes have nutritional data
  const dayMeals = plannedMeals.filter(
    (meal) => meal.date === date && meal.recipe_id
  );
  const recipesWithNutrition = dayMeals.filter((meal) => {
    const recipe = recipes.find((r) => r.id === meal.recipe_id);
    return recipe && recipe.calories && recipe.calories > 0;
  });

  const hasNutritionalData = recipesWithNutrition.length > 0;
  const missingNutritionCount = dayMeals.length - recipesWithNutrition.length;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-primary" />
        <h4 className="font-medium text-foreground">Daily Nutrition</h4>
        <p className="text-gray-500 text-xs">(All macros are estimated)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MacroDisplay
          icon={<Flame className="h-4 w-4 text-white" />}
          label="Calories"
          value={dayMacros.calories}
          unit=""
          color="bg-red-500/10 text-red-600"
          target={targets.calories}
        />

        <MacroDisplay
          icon={<Zap className="h-4 w-4 text-white" />}
          label="Protein"
          value={dayMacros.protein}
          unit="g"
          color="bg-blue-500/10 text-blue-600"
          target={targets.protein}
        />

        <MacroDisplay
          icon={<Wheat className="h-4 w-4 text-white" />}
          label="Carbs"
          value={dayMacros.carbs}
          unit="g"
          color="bg-green-500/10 text-green-600"
          target={targets.carbs}
        />

        <MacroDisplay
          icon={<Activity className="h-4 w-4 text-white" />}
          label="Fat"
          value={dayMacros.fat}
          unit="g"
          color="bg-yellow-500/10 text-yellow-600"
          target={targets.fat}
        />
      </div>

      {/* Additional nutrients without targets */}
      {/* {(dayMacros.fiber > 0 || dayMacros.sugar > 0 || dayMacros.sodium > 0) && (
        <div className="pt-2 border-t border-border">
          <div className="grid grid-cols-3 gap-2 text-xs">
            {dayMacros.fiber > 0 && (
              <div className="text-center">
                <div className="text-muted-foreground">Fiber</div>
                <div className="font-medium">
                  {Math.round(dayMacros.fiber)}g
                </div>
              </div>
            )}
            {dayMacros.sugar > 0 && (
              <div className="text-center">
                <div className="text-muted-foreground">Sugar</div>
                <div className="font-medium">
                  {Math.round(dayMacros.sugar)}g
                </div>
              </div>
            )}
            {dayMacros.sodium > 0 && (
              <div className="text-center">
                <div className="text-muted-foreground">Sodium</div>
                <div className="font-medium">
                  {Math.round(dayMacros.sodium)}mg
                </div>
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* Missing Nutrition Data Warning */}
      {missingNutritionCount > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Note:</span> {missingNutritionCount}{' '}
            recipe{missingNutritionCount > 1 ? 's' : ''}{' '}
            {missingNutritionCount > 1 ? "don't" : "doesn't"} have nutritional
            data yet. Open {missingNutritionCount > 1 ? 'them' : 'it'} and click
            "Generate Nutrition Info" to get accurate macro totals.
          </p>
        </div>
      )}

      {/* Quick Goals Access */}
      {onOpenSettings && (
        <QuickMacroGoalsButton
          macroGoals={macroGoals}
          onOpenSettings={onOpenSettings}
        />
      )}
    </div>
  );
}
