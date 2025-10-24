'use client';

import { addMealToPlanAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/Modal';
import { Recipe } from '@/types';
import { ChefHat, Clock, Search, Users } from 'lucide-react';
import { useState, useTransition } from 'react';

interface AddMealModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  date: string;
  mealType: string;
  recipes: Recipe[];
}

export default function AddMealModal({
  open,
  setOpen,
  date,
  mealType,
  recipes,
}: AddMealModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isPending, startTransition] = useTransition();

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
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Add {mealType} for {new Date(date).toLocaleDateString()}
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

        {/* Recipe List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
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

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? 'Adding...' : 'Add Meal'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
