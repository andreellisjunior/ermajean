"use client";

import { updateMacroGoalsModalAction } from "@/app/actions";
import { MacroGoals } from "@/types";
import { Activity, Flame, Wheat, Zap } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

interface MacroGoalsFormProps {
  currentGoals?: MacroGoals;
  preview?: boolean;
  onClose?: () => void;
  onSave?: () => void;
}

export default function MacroGoalsForm({
  currentGoals,
  preview = false,
  onClose,
  onSave,
}: MacroGoalsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const defaultGoals = {
    calories: currentGoals?.calories || 2000,
    protein: currentGoals?.protein || 150,
    carbs: currentGoals?.carbs || 250,
    fat: currentGoals?.fat || 65,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Your daily fuel</h3>
      </div>

      <p className="text-sm text-gray-600">
        Set optional targets that support your energy and routine. These are
        personal goals, not a scorecard.
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          if (preview) {
            setError("Preview only. Your goals have not changed.");
            return;
          }
          setError("");
          setIsSubmitting(true);

          startTransition(async () => {
            try {
              const result = await updateMacroGoalsModalAction(formData);

              if (result.success) {
                toast.success(result.message);
                onSave?.(); // Call the refresh callback
                onClose?.();
              } else {
                setError(result.message);
              }
            } catch (error) {
              setError(
                "Your goals could not be saved. Try again; your entries are still here.",
              );
            } finally {
              setIsSubmitting(false);
            }
          });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calorieGoal" className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500" />
              Daily Calories
            </Label>
            <Input
              name="calorieGoal"
              type="number"
              min={0}
              step={1}
              placeholder="2000"
              defaultValue={defaultGoals.calories}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proteinGoal" className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Protein (grams)
            </Label>
            <Input
              name="proteinGoal"
              type="number"
              min={0}
              step={1}
              placeholder="150"
              defaultValue={defaultGoals.protein}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carbGoal" className="flex items-center gap-2">
              <Wheat className="h-4 w-4 text-green-500" />
              Carbs (grams)
            </Label>
            <Input
              name="carbGoal"
              type="number"
              min={0}
              step={1}
              placeholder="250"
              defaultValue={defaultGoals.carbs}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fatGoal" className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-yellow-500" />
              Fat (grams)
            </Label>
            <Input
              name="fatGoal"
              type="number"
              min={0}
              step={1}
              placeholder="65"
              defaultValue={defaultGoals.fat}
              required
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Quick Reference</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              • <strong>Calories:</strong> Total energy intake per day
            </p>
            <p>
              • <strong>Protein:</strong> Muscle building and repair (4 cal/g)
            </p>
            <p>
              • <strong>Carbs:</strong> Primary energy source (4 cal/g)
            </p>
            <p>
              • <strong>Fat:</strong> Essential nutrients and energy (9 cal/g)
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="ej-dialog-error">
            {error}
          </p>
        )}
        <div className="flex gap-3 pt-4">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Goals"}
          </Button>
        </div>
      </form>
    </div>
  );
}
