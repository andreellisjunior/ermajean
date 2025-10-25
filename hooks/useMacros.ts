import { useCallback, useState } from 'react';

interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface UseMacrosReturn {
  macros: MacroData | null;
  loading: boolean;
  error: string | null;
  fetchMacros: (recipeId: string, servings: number) => Promise<void>;
}

export const useMacros = (): UseMacrosReturn => {
  const [macros, setMacros] = useState<MacroData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMacros = useCallback(
    async (recipeId: string, servings: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/recipes/macros', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ recipeId, servings }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP ${response.status}: Failed to fetch macros`
          );
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setMacros(data);
      } catch (err) {
        console.error('Macro fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setMacros(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { macros, loading, error, fetchMacros };
};
