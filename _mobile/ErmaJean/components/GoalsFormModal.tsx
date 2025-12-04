/**
 * GoalsFormModal Component
 * Form for editing macro goals (calorie, protein, carb, fat daily targets)
 * Requirements: 6.2
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MacroGoals } from '../types/config';

export interface GoalsFormModalProps {
  visible: boolean;
  onClose: () => void;
  currentGoals: MacroGoals;
  onSave: (goals: MacroGoals) => Promise<void>;
}

interface GoalInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  min?: number;
  max?: number;
}

function GoalInput({ label, value, onChange, unit, color, icon, min = 0, max = 10000 }: GoalInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (text: string) => {
    setInputValue(text);
    const numValue = parseInt(text) || 0;
    if (numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const increment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const step = label === 'Calories' ? 50 : 5;
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const decrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const step = label === 'Calories' ? 50 : 5;
    const newValue = Math.max(value - step, min);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  return (
    <View style={styles.goalInput}>
      <View style={styles.goalHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.goalLabel}>{label}</Text>
      </View>
      
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.stepButton}
          onPress={decrement}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={20} color="#6b7280" />
        </TouchableOpacity>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={handleChange}
            keyboardType="numeric"
            selectTextOnFocus
          />
          <Text style={styles.unit}>{unit}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.stepButton}
          onPress={increment}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function GoalsFormModal({ visible, onClose, currentGoals, onSave }: GoalsFormModalProps) {
  const [goals, setGoals] = useState<MacroGoals>(currentGoals);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setGoals(currentGoals);
  }, [currentGoals, visible]);

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);
    
    try {
      await onSave(goals);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error) {
      console.error('Error saving goals:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setGoals(currentGoals);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Goals</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              Set your daily nutritional targets to track your progress in meal planning.
            </Text>
          </View>

          {/* Goals Form */}
          <View style={styles.goalsContainer}>
            <GoalInput
              label="Calories"
              value={goals.calories}
              onChange={(v) => setGoals(prev => ({ ...prev, calories: v }))}
              unit=""
              color="#10b981"
              icon="flame-outline"
              min={500}
              max={10000}
            />
            
            <GoalInput
              label="Protein"
              value={goals.protein}
              onChange={(v) => setGoals(prev => ({ ...prev, protein: v }))}
              unit="g"
              color="#3b82f6"
              icon="fitness-outline"
              min={0}
              max={500}
            />
            
            <GoalInput
              label="Carbs"
              value={goals.carbs}
              onChange={(v) => setGoals(prev => ({ ...prev, carbs: v }))}
              unit="g"
              color="#f59e0b"
              icon="nutrition-outline"
              min={0}
              max={1000}
            />
            
            <GoalInput
              label="Fat"
              value={goals.fat}
              onChange={(v) => setGoals(prev => ({ ...prev, fat: v }))}
              unit="g"
              color="#8b5cf6"
              icon="water-outline"
              min={0}
              max={500}
            />
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsSection}>
            <Text style={styles.presetsTitle}>Quick Presets</Text>
            <View style={styles.presetsRow}>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setGoals({ calories: 1500, protein: 100, carbs: 150, fat: 50 });
                }}
              >
                <Text style={styles.presetText}>Weight Loss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setGoals({ calories: 2000, protein: 150, carbs: 200, fat: 65 });
                }}
              >
                <Text style={styles.presetText}>Maintenance</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setGoals({ calories: 2500, protein: 180, carbs: 300, fat: 80 });
                }}
              >
                <Text style={styles.presetText}>Muscle Gain</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  saveButton: {
    padding: 4,
    minWidth: 50,
    alignItems: 'flex-end',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  goalsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalInput: {
    gap: 10,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    minWidth: 80,
  },
  unit: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  presetsSection: {
    marginTop: 24,
  },
  presetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
});

export default GoalsFormModal;
