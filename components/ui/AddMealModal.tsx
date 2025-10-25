'use client';

import {
  addAIRecipeModalAction,
  addMealToPlanAction,
  addNewRecipeModalAction,
} from '@/app/actions';
import AddNewRecipe from '@/components/ui/AddNewRecipe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/Modal';
import NutritionForm from '@/components/ui/NutritionForm';
import { Textarea } from '@/components/ui/textarea';
import { Recipe } from '@/types';
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'react-toastify';

interface AddMealModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  date: string;
  mealType: string;
  recipes: Recipe[];
  profiles: { location?: string; has_access: boolean; price_id?: string }[];
  recipeCount: number;
  onRecipeCreated: () => Promise<void>;
}

export default function AddMealModal({
  open,
  setOpen,
  date,
  mealType,
  recipes,
  profiles,
  recipeCount,
  onRecipeCreated,
}: AddMealModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [createMode, setCreateMode] = useState<'manual' | 'ai' | null>(null);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const recipeListRef = useRef<HTMLDivElement>(null);

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMeal = () => {
    if (!selectedRecipe) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('recipeId', selectedRecipe.id);
      formData.append('date', date);
      formData.append('mealType', mealType);

      await addMealToPlanAction(formData);
      setOpen(false);
      setSelectedRecipe(null);
      setSearchTerm('');
    });
  };

  return (
    <Modal open={open} setOpen={setOpen} height="h-[80vh]">
      <div className="space-y-4 flex flex-col h-full">
        <h2 className="text-xl font-semibold">
          Add {mealType} for {new Date(date + 'T00:00:00').toLocaleDateString()}
        </h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* Create New Recipe Options */}
        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-gray-600 mb-3">
            Don't see what you're looking for?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-sm"
              onClick={() => {
                setShowCreateRecipe(true);
                setCreateMode('manual');
              }}
            >
              <ChefHat className="h-4 w-4" />
              Create Recipe
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-sm bg-gradient-to-r from-purple-50 to-teal-50 border-purple-200"
              onClick={() => {
                setShowCreateRecipe(true);
                setCreateMode('ai');
              }}
            >
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
          </div>
        </div>

        {/* Recipe List */}
        <div ref={recipeListRef} className="overflow-y-auto space-y-2">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? 'No recipes found matching your search.'
                : 'No recipes available.'}
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRecipe?.id === recipe.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {recipe.recipe_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.total_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.servings} servings
                      </div>
                      <div className="flex items-center gap-1">
                        <ChefHat className="h-3 w-3" />
                        {recipe.course}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recipe Creation Form */}
        {showCreateRecipe && (
          <div className="absolute inset-0 bg-white z-10 p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateRecipe(false);
                  setCreateMode(null);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Recipes
              </Button>
            </div>

            <h3 className="text-lg font-semibold mb-4">
              {createMode === 'ai'
                ? 'Generate Recipe with AI'
                : 'Create New Recipe'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                setIsCreatingRecipe(true);

                try {
                  let result;
                  if (createMode === 'ai') {
                    result = await addAIRecipeModalAction(formData);
                  } else {
                    result = await addNewRecipeModalAction(formData);
                  }

                  if (result.success) {
                    toast.success(result.message);

                    // Close the create recipe form first
                    setShowCreateRecipe(false);
                    setCreateMode(null);

                    // Update the recipe list
                    await onRecipeCreated();

                    // Clear search term to show all recipes including the new one
                    setSearchTerm('');

                    // Scroll to top of recipe list to show the new recipe
                    setTimeout(() => {
                      recipeListRef.current?.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                      });
                    }, 100);
                  } else {
                    toast.error(result.message);
                  }
                } catch (error) {
                  toast.error('Failed to create recipe');
                } finally {
                  setIsCreatingRecipe(false);
                }
              }}
              className="space-y-4"
            >
              {createMode === 'ai' ? (
                // AI Recipe Form
                <>
                  <div>
                    <Label htmlFor="taste">What do you have taste for?</Label>
                    <Input
                      name="taste"
                      placeholder="Balanced chicken meal with a lot of veggies"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ingredients">
                      Available ingredients (optional)
                    </Label>
                    <Input
                      name="ingredients"
                      placeholder="Chicken, broccoli, rice, salt, pepper, garlic, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="serving">How many are eating?</Label>
                    <Input
                      name="serving"
                      placeholder="5 people, just me"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalTime">
                      How much total time do you have?
                    </Label>
                    <Input
                      name="totalTime"
                      placeholder="1 hour?, 2 hours?, 30 min.?"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="restrictions">
                      Dietary restrictions (optional)
                    </Label>
                    <Input
                      name="restrictions"
                      placeholder="Vegan, keto, gluten-free, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="course">Which course is this meal?</Label>
                    <Input name="course" value={mealType} readOnly />
                  </div>
                  <Input
                    type="hidden"
                    name="location"
                    value={profiles[0]?.location ?? 'USA'}
                  />
                </>
              ) : (
                // Manual Recipe Form
                <>
                  <div>
                    <Label htmlFor="recipeName">Recipe Name</Label>
                    <Input
                      name="recipeName"
                      placeholder="Recipe Name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc">Description</Label>
                    <Input name="desc" placeholder="Description" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prepTime">Prep Time</Label>
                      <Input name="prepTime" placeholder="15 min" required />
                    </div>
                    <div>
                      <Label htmlFor="cookTime">Cook Time</Label>
                      <Input name="cookTime" placeholder="30 min" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estTotalTime">Total Time</Label>
                      <Input
                        name="estTotalTime"
                        placeholder="45 min"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="servings">Servings</Label>
                      <Input
                        name="servings"
                        placeholder="4 servings"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="level">Difficulty</Label>
                      <select
                        name="level"
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select difficulty</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        <option value="Yes Chef!">Yes Chef!</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="course">Course</Label>
                      <select
                        name="course"
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value={mealType}>{mealType}</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ingredients">Ingredients</Label>
                    <Textarea
                      name="ingredients"
                      placeholder="List all ingredients"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      name="instructions"
                      placeholder="List your instructions"
                      required
                    />
                  </div>

                  {/* Nutrition Toggle */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="nutrition-toggle"
                      checked={showNutrition}
                      onChange={(e) => setShowNutrition(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="nutrition-toggle" className="text-sm">
                      Add nutritional information (optional)
                    </Label>
                  </div>

                  {/* Nutrition Form */}
                  <NutritionForm showNutrition={showNutrition} />
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateRecipe(false);
                    setCreateMode(null);
                  }}
                  disabled={isCreatingRecipe}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingRecipe}>
                  {isCreatingRecipe
                    ? 'Creating...'
                    : createMode === 'ai'
                      ? 'Generate Recipe'
                      : 'Create Recipe'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Actions */}
        {!showCreateRecipe && (
          <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedRecipe(null);
                setSearchTerm('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMeal}
              disabled={!selectedRecipe || isPending}
            >
              {isPending ? 'Adding...' : 'Add Meal'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
