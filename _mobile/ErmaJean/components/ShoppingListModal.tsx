/**
 * ShoppingListModal Component
 * Modal for viewing and managing shopping list with grouped items, checkboxes, and share functionality
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Haptic } from '@/utils/haptics';
import { Recipe, MealSlot, ShoppingListItem } from '../types/config';
import { aggregateIngredients, formatShoppingList, INGREDIENT_CATEGORIES } from '../utils/shoppingListUtils';

export interface ShoppingListModalProps {
  visible: boolean;
  onClose: () => void;
  meals: MealSlot[];
  recipes: Map<string, Recipe>;
}

interface CategorySectionProps {
  category: string;
  items: ShoppingListItem[];
  onToggleItem: (id: string) => void;
}

function CategorySection({ category, items, onToggleItem }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);
  const checkedCount = items.filter(item => item.checked).length;

  return (
    <View style={styles.categorySection}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryTitleContainer}>
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-forward'}
            size={18}
            color="#6b7280"
          />
          <Text style={styles.categoryTitle}>{category}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {checkedCount}/{items.length}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.itemsList}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemRow}
              onPress={async () => {
                await Haptic.toggle();
                onToggleItem(item.id);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                {item.checked && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <View style={styles.itemContent}>
                <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                  {item.ingredient}
                </Text>
                <Text style={[styles.itemQuantity, item.checked && styles.itemQuantityChecked]}>
                  {item.quantity} {item.unit}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}


export function ShoppingListModal({ visible, onClose, meals, recipes }: ShoppingListModalProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Generate shopping list from meals
  const shoppingItems = useMemo(() => {
    const items = aggregateIngredients(meals, recipes);
    // Apply checked state
    return items.map(item => ({
      ...item,
      checked: checkedItems.has(item.id),
    }));
  }, [meals, recipes, checkedItems]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups = new Map<string, ShoppingListItem[]>();
    
    for (const item of shoppingItems) {
      const categoryItems = groups.get(item.category) || [];
      categoryItems.push(item);
      groups.set(item.category, categoryItems);
    }
    
    // Sort by predefined category order
    const categoryOrder = Object.values(INGREDIENT_CATEGORIES);
    return Array.from(groups.entries()).sort(
      ([a], [b]) => categoryOrder.indexOf(a as any) - categoryOrder.indexOf(b as any)
    );
  }, [shoppingItems]);

  const handleToggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleShare = async () => {
    await Haptic.buttonPress();
    const formattedList = formatShoppingList(shoppingItems);
    
    try {
      await Share.share({
        message: formattedList,
        title: 'Shopping List',
      });
    } catch (error) {
      console.error('Error sharing shopping list:', error);
    }
  };

  const handleClearChecked = async () => {
    await Haptic.success();
    setCheckedItems(new Set());
  };

  const totalItems = shoppingItems.length;
  const checkedCount = checkedItems.size;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Shopping List</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#10b981" />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        {totalItems > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {checkedCount} of {totalItems} items
              </Text>
              {checkedCount > 0 && (
                <TouchableOpacity onPress={handleClearChecked}>
                  <Text style={styles.clearText}>Clear checked</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(checkedCount / totalItems) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {totalItems === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No items yet</Text>
              <Text style={styles.emptySubtitle}>
                Add meals to your plan to generate a shopping list
              </Text>
            </View>
          ) : (
            groupedItems.map(([category, items]) => (
              <CategorySection
                key={category}
                category={category}
                items={items}
                onToggleItem={handleToggleItem}
              />
            ))
          )}
        </ScrollView>
      </View>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  shareButton: {
    padding: 4,
  },
  progressContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
  },
  clearText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categorySection: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryHeader: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  itemsList: {
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    color: '#1f2937',
    flex: 1,
  },
  itemNameChecked: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  itemQuantityChecked: {
    color: '#d1d5db',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default ShoppingListModal;
