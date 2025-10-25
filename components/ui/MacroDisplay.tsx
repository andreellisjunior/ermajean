'use client';
import { useMacros } from '@/hooks/useMacros';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';

interface MacroDisplayProps {
  recipeId: string;
  servings: string;
  readOnly?: boolean;
  existingMacros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

const MacroDisplay = ({
  recipeId,
  servings,
  readOnly = false,
  existingMacros,
}: MacroDisplayProps) => {
  const { macros, loading, error, fetchMacros } = useMacros();
  const [showMacros, setShowMacros] = useState(false);

  // Check if we have existing nutritional data
  const hasExistingData =
    existingMacros && existingMacros.calories && existingMacros.calories > 0;

  const handleGenerateMacros = async () => {
    setShowMacros(true);
    // Always request macros for 1 serving - the API will calculate per serving
    await fetchMacros(recipeId, 1);
  };

  const handleRegenerateMacros = async () => {
    // Always request macros for 1 serving - the API will calculate per serving
    await fetchMacros(recipeId, 1);
  };

  // Use generated macros if available (from API call), otherwise use existing macros
  // Note: Both macros and existingMacros are already per serving, so no calculation needed
  const displayMacros = macros || (hasExistingData ? existingMacros : null);

  // If we have existing data or newly generated data, show it
  if (hasExistingData || macros) {
    return (
      <div className="mt-4">
        <hr className="mb-4" />
        <div className="text-left flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Nutrition Information</h3>
            <p className="text-gray-500 text-xs">(All macros are estimated)</p>
          </div>
          <p className="text-sm text-gray-600">
            Per 1 serving{' '}
            <span className="text-muted-foreground">
              (Recipe makes {servings} servings)
            </span>
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold text-blue-800">Calories</p>
              <p className="text-xl font-bold text-blue-900">
                {displayMacros?.calories}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-semibold text-green-800">Protein</p>
              <p className="text-xl font-bold text-green-900">
                {displayMacros?.protein}g
              </p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="font-semibold text-yellow-800">Carbs</p>
              <p className="text-xl font-bold text-yellow-900">
                {displayMacros?.carbs}g
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="font-semibold text-purple-800">Fat</p>
              <p className="text-xl font-bold text-purple-900">
                {displayMacros?.fat}g
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div className="text-center">
              <p className="font-medium">Fiber</p>
              <p>{displayMacros?.fiber}g</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Sugar</p>
              <p>{displayMacros?.sugar}g</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Sodium</p>
              <p>{displayMacros?.sodium}mg</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!showMacros) {
    // Don't show generate button on read-only pages (like public share pages)
    if (readOnly) {
      return null;
    }

    return (
      <div className="mt-4">
        <Button
          onClick={handleGenerateMacros}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Macros...
            </>
          ) : (
            'Generate Nutrition Info'
          )}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-4 p-4 border rounded-lg">
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Generating nutrition information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 border rounded-lg bg-red-50">
        <p className="text-red-600 text-sm">Error: {error}</p>
        <Button
          onClick={handleGenerateMacros}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!displayMacros) return null;

  return (
    <div className="mt-4">
      <hr className="mb-4" />
      <div className="text-left flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nutrition Information</h3>
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-xs">(All macros are estimated)</p>
            {!readOnly && (
              <Button
                onClick={handleRegenerateMacros}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Per 1 serving{' '}
          <span className="text-muted-foreground">
            (Recipe makes {servings} servings)
          </span>
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold text-blue-800">Calories</p>
            <p className="text-xl font-bold text-blue-900">
              {displayMacros.calories}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="font-semibold text-green-800">Protein</p>
            <p className="text-xl font-bold text-green-900">
              {displayMacros.protein}g
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="font-semibold text-yellow-800">Carbs</p>
            <p className="text-xl font-bold text-yellow-900">
              {displayMacros.carbs}g
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="font-semibold text-purple-800">Fat</p>
            <p className="text-xl font-bold text-purple-900">
              {displayMacros.fat}g
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="text-center">
            <p className="font-medium">Fiber</p>
            <p>{displayMacros.fiber}g</p>
          </div>
          <div className="text-center">
            <p className="font-medium">Sugar</p>
            <p>{displayMacros.sugar}g</p>
          </div>
          <div className="text-center">
            <p className="font-medium">Sodium</p>
            <p>{displayMacros.sodium}mg</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroDisplay;
