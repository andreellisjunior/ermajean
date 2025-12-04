/**
 * MacroCounter Component
 * Displays progress bars for calories, protein, carbs, fat against goals
 * Requirements: 3.6
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MacroGoals, DayMacros } from '../types/config';

export interface MacroCounterProps {
  currentMacros: DayMacros | { calories: number; protein: number; carbs: number; fat: number };
  macroGoals?: MacroGoals;
  compact?: boolean;
}

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit: string;
  compact?: boolean;
}

function MacroBar({ label, current, goal, color, unit, compact }: MacroBarProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const isOverGoal = current > goal && goal > 0;

  return (
    <View style={[styles.macroItem, compact && styles.macroItemCompact]}>
      <View style={styles.macroHeader}>
        <Text style={[styles.macroLabel, compact && styles.macroLabelCompact]}>
          {label}
        </Text>
        <Text style={[styles.macroValue, compact && styles.macroValueCompact]}>
          <Text style={[styles.currentValue, isOverGoal && styles.overGoalValue]}>
            {Math.round(current)}
          </Text>
          {goal > 0 && (
            <Text style={styles.goalValue}>/{goal}{unit}</Text>
          )}
        </Text>
      </View>
      <View style={[styles.progressBarContainer, compact && styles.progressBarContainerCompact]}>
        <View
          style={[
            styles.progressBar,
            { width: `${percentage}%`, backgroundColor: isOverGoal ? '#ef4444' : color },
          ]}
        />
      </View>
    </View>
  );
}

export function MacroCounter({ currentMacros, macroGoals, compact = false }: MacroCounterProps) {
  const goals = macroGoals || { calories: 2000, protein: 150, carbs: 250, fat: 65 };

  const macros = [
    {
      label: 'Calories',
      current: currentMacros.calories || 0,
      goal: goals.calories,
      color: '#10b981',
      unit: '',
    },
    {
      label: 'Protein',
      current: currentMacros.protein || 0,
      goal: goals.protein,
      color: '#3b82f6',
      unit: 'g',
    },
    {
      label: 'Carbs',
      current: currentMacros.carbs || 0,
      goal: goals.carbs,
      color: '#f59e0b',
      unit: 'g',
    },
    {
      label: 'Fat',
      current: currentMacros.fat || 0,
      goal: goals.fat,
      color: '#8b5cf6',
      unit: 'g',
    },
  ];

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {!compact && (
        <Text style={styles.title}>Daily Macros</Text>
      )}
      <View style={[styles.macrosGrid, compact && styles.macrosGridCompact]}>
        {macros.map((macro) => (
          <MacroBar
            key={macro.label}
            label={macro.label}
            current={macro.current}
            goal={macro.goal}
            color={macro.color}
            unit={macro.unit}
            compact={compact}
          />
        ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  containerCompact: {
    padding: 12,
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  macrosGrid: {
    gap: 12,
  },
  macrosGridCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  macroItem: {
    flex: 1,
  },
  macroItemCompact: {
    width: '48%',
    minWidth: 140,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  macroLabelCompact: {
    fontSize: 11,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  macroValueCompact: {
    fontSize: 11,
  },
  currentValue: {
    color: '#1f2937',
  },
  overGoalValue: {
    color: '#ef4444',
  },
  goalValue: {
    color: '#9ca3af',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarContainerCompact: {
    height: 4,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default MacroCounter;
