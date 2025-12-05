/**
 * RecipeFormModal Component
 * Form for manual recipe entry with all recipe fields and optional nutrition section
 * Requirements: 7.2, 7.5
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RecipeInput } from '../types/config';
import { validateRecipeForm, ValidationErrors } from '../utils/validation';

export interface RecipeFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (recipe: RecipeInput) => Promise<void>;
}

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];
const COURSE_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer'];

const initialFormState: RecipeInput = {
  recipe_name: '',
  description: '',
  prep_time: '',
  cook_time: '',
  total_time: '',
  servings: '',
  difficulty_level: 'Medium',
  course: 'Dinner',
  ingredients: '',
  instructions: '',
  calories: undefined,
  protein: undefined,
  carbs: undefined,
  fat: undefined,
  fiber: undefined,
  sugar: undefined,
  sodium: undefined,
};

export function RecipeFormModal({ visible, onClose, onSubmit }: RecipeFormModalProps) {
  const [form, setForm] = useState<RecipeInput>(initialFormState);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showNutrition, setShowNutrition] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof RecipeInput, value: string | number | undefined) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const validationErrors = validateRecipeForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(form);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setForm(initialFormState);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error submitting recipe:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(initialFormState);
    setErrors({});
    setShowNutrition(false);
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
          <Text style={styles.title}>Add Recipe</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.saveButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Recipe Name *</Text>
              <TextInput
                style={[styles.input, errors.recipe_name && styles.inputError]}
                value={form.recipe_name}
                onChangeText={(v) => updateField('recipe_name', v)}
                placeholder="Enter recipe name"
                placeholderTextColor="#9ca3af"
              />
              {errors.recipe_name && (
                <Text style={styles.errorText}>{errors.recipe_name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                value={form.description}
                onChangeText={(v) => updateField('description', v)}
                placeholder="Brief description of the recipe"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
            </View>
          </View>


          {/* Time & Servings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time & Servings</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Prep Time</Text>
                <TextInput
                  style={styles.input}
                  value={form.prep_time}
                  onChangeText={(v) => updateField('prep_time', v)}
                  placeholder="e.g., 15 mins"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Cook Time</Text>
                <TextInput
                  style={styles.input}
                  value={form.cook_time}
                  onChangeText={(v) => updateField('cook_time', v)}
                  placeholder="e.g., 30 mins"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Total Time</Text>
                <TextInput
                  style={styles.input}
                  value={form.total_time}
                  onChangeText={(v) => updateField('total_time', v)}
                  placeholder="e.g., 45 mins"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Servings</Text>
                <TextInput
                  style={styles.input}
                  value={form.servings}
                  onChangeText={(v) => updateField('servings', v)}
                  placeholder="e.g., 4"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Category Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.optionsRow}>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      form.difficulty_level === option && styles.optionButtonSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateField('difficulty_level', option);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        form.difficulty_level === option && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Course</Text>
              <View style={styles.optionsRow}>
                {COURSE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      form.course === option && styles.optionButtonSelected,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateField('course', option);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        form.course === option && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Ingredients & Instructions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recipe Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ingredients *</Text>
              <TextInput
                style={[styles.input, styles.largeTextArea, errors.ingredients && styles.inputError]}
                value={form.ingredients}
                onChangeText={(v) => updateField('ingredients', v)}
                placeholder="Enter each ingredient on a new line"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={6}
              />
              {errors.ingredients && (
                <Text style={styles.errorText}>{errors.ingredients}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instructions *</Text>
              <TextInput
                style={[styles.input, styles.largeTextArea, errors.instructions && styles.inputError]}
                value={form.instructions}
                onChangeText={(v) => updateField('instructions', v)}
                placeholder="Enter each step on a new line"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={6}
              />
              {errors.instructions && (
                <Text style={styles.errorText}>{errors.instructions}</Text>
              )}
            </View>
          </View>


          {/* Nutrition Section (Optional) */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.nutritionToggle}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowNutrition(!showNutrition);
              }}
            >
              <View style={styles.nutritionToggleLeft}>
                <Ionicons
                  name={showNutrition ? 'chevron-down' : 'chevron-forward'}
                  size={20}
                  color="#6b7280"
                />
                <Text style={styles.sectionTitle}>Nutrition (Optional)</Text>
              </View>
              <Text style={styles.optionalBadge}>Optional</Text>
            </TouchableOpacity>

            {showNutrition && (
              <View style={styles.nutritionGrid}>
                <View style={[styles.inputGroup, styles.thirdWidth]}>
                  <Text style={styles.smallLabel}>Calories</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={form.calories?.toString() || ''}
                    onChangeText={(v) => updateField('calories', v ? parseInt(v) : undefined)}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, styles.thirdWidth]}>
                  <Text style={styles.smallLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={form.protein?.toString() || ''}
                    onChangeText={(v) => updateField('protein', v ? parseInt(v) : undefined)}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, styles.thirdWidth]}>
                  <Text style={styles.smallLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={form.carbs?.toString() || ''}
                    onChangeText={(v) => updateField('carbs', v ? parseInt(v) : undefined)}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, styles.thirdWidth]}>
                  <Text style={styles.smallLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={form.fat?.toString() || ''}
                    onChangeText={(v) => updateField('fat', v ? parseInt(v) : undefined)}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, styles.thirdWidth]}>
                  <Text style={styles.smallLabel}>Fiber (g)</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={form.fiber?.toString() || ''}
                    onChangeText={(v) => updateField('fiber', v ? parseInt(v) : undefined)}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, styles.thirdWidth]}>
                  <Text style={styles.smallLabel}>Sugar (g)</Text>
                  <TextInput
                    style={styles.smallInput}
                    value={form.sugar?.toString() || ''}
                    onChangeText={(v) => updateField('sugar', v ? parseInt(v) : undefined)}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Bottom padding for scroll */}
          <View style={{ height: 40 }} />
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2937',
  },
  smallInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1f2937',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  largeTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  thirdWidth: {
    width: '30%',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionButtonSelected: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  optionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#059669',
  },
  nutritionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nutritionToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionalBadge: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
});

export default RecipeFormModal;
