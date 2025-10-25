'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NutritionFormProps {
  showNutrition?: boolean;
}

export default function NutritionForm({
  showNutrition = false,
}: NutritionFormProps) {
  if (!showNutrition) return null;

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <h4 className="font-medium text-foreground mb-3">
          Nutritional Information (per serving)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calories">Calories</Label>
            <Input
              name="calories"
              type="number"
              placeholder="0"
              min="0"
              step="1"
            />
          </div>
          <div>
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              name="protein"
              type="number"
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              name="carbs"
              type="number"
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="fat">Fat (g)</Label>
            <Input
              name="fat"
              type="number"
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="fiber">Fiber (g)</Label>
            <Input
              name="fiber"
              type="number"
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="sugar">Sugar (g)</Label>
            <Input
              name="sugar"
              type="number"
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="sodium">Sodium (mg)</Label>
            <Input
              name="sodium"
              type="number"
              placeholder="0"
              min="0"
              step="1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
