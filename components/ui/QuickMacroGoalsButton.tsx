'use client';

import { MacroGoals } from '@/types';
import { Settings } from 'lucide-react';
import { Button } from './button';

interface QuickMacroGoalsButtonProps {
  macroGoals?: MacroGoals;
  onOpenSettings: () => void;
}

export default function QuickMacroGoalsButton({
  macroGoals,
  onOpenSettings,
}: QuickMacroGoalsButtonProps) {
  const isUsingDefaults =
    !macroGoals ||
    (macroGoals.calories === 2000 &&
      macroGoals.protein === 150 &&
      macroGoals.carbs === 250 &&
      macroGoals.fat === 65);

  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
      <div className="text-xs text-muted-foreground">
        {isUsingDefaults ? (
          <span className="text-amber-600">
            Using default goals • Set your personal targets
          </span>
        ) : (
          <span>
            Daily Goals: {macroGoals?.calories || 2000} cal •{' '}
            {macroGoals?.protein || 150}g protein
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenSettings}
        className={`h-6 px-2 text-xs ${
          isUsingDefaults
            ? 'text-amber-600 hover:text-amber-700 font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Settings className="h-3 w-3 mr-1" />
        {isUsingDefaults ? 'Set Goals' : 'Edit'}
      </Button>
    </div>
  );
}
