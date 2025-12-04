/**
 * AddRecipeFAB Component
 * Floating action button with expandable menu for AI generate and manual add options
 * Requirements: 7.1
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Haptic } from '@/utils/haptics';
import { Colors, Shadows, BorderRadius } from '@/constants/design';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface AddRecipeFABProps {
  onAIGenerate: () => void;
  onManualAdd: () => void;
  recipeCount?: number;
  planType?: 'free' | 'monthly' | 'unlimited';
  planLimit?: number | null;
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress: () => void;
  color: string;
  index: number;
  isExpanded: boolean;
}

function MenuItem({ icon, label, sublabel, onPress, color, index, isExpanded }: MenuItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = withSpring(isExpanded ? 0 : 20, { damping: 15 });
    const opacity = withTiming(isExpanded ? 1 : 0, { duration: 150 });
    const scale = withSpring(isExpanded ? 1 : 0.8, { damping: 15 });
    
    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  }, [isExpanded]);

  return (
    <Animated.View style={[styles.menuItem, animatedStyle]}>
      <TouchableOpacity
        style={styles.menuItemButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        activeOpacity={0.8}
      >
        <View style={[styles.menuItemIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={22} color="#fff" />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemLabel}>{label}</Text>
          {sublabel && <Text style={styles.menuItemSublabel}>{sublabel}</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function AddRecipeFAB({
  onAIGenerate,
  onManualAdd,
  recipeCount = 0,
  planType = 'free',
  planLimit = null,
}: AddRecipeFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useSharedValue(0);

  const toggleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExpanded(!isExpanded);
    rotation.value = withSpring(isExpanded ? 0 : 45, { damping: 15 });
  };

  const closeMenu = () => {
    setIsExpanded(false);
    rotation.value = withSpring(0, { damping: 15 });
  };

  const handleAIGenerate = () => {
    closeMenu();
    onAIGenerate();
  };

  const handleManualAdd = () => {
    closeMenu();
    onManualAdd();
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isExpanded ? 1 : 0, { duration: 200 }),
    pointerEvents: isExpanded ? 'auto' : 'none',
  }));

  // Calculate remaining recipes for display
  const getRemainingText = () => {
    if (planType === 'unlimited' || planLimit === null) {
      return 'Unlimited';
    }
    const remaining = Math.max(0, planLimit - recipeCount);
    return `${remaining} remaining`;
  };

  return (
    <>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
        <Pressable style={styles.overlayPressable} onPress={closeMenu} />
      </Animated.View>

      {/* Menu Container */}
      <View style={styles.container}>
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuItem
            icon="sparkles"
            label="Generate with AI"
            sublabel={planType !== 'unlimited' ? getRemainingText() : undefined}
            onPress={handleAIGenerate}
            color="#8b5cf6"
            index={1}
            isExpanded={isExpanded}
          />
          <MenuItem
            icon="create-outline"
            label="Add Manually"
            onPress={handleManualAdd}
            color="#3b82f6"
            index={0}
            isExpanded={isExpanded}
          />
        </View>

        {/* FAB Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={toggleMenu}
          activeOpacity={0.9}
        >
          <Animated.View style={fabAnimatedStyle}>
            <Ionicons name="add" size={28} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}


const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 998,
  },
  overlayPressable: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  menuContainer: {
    marginBottom: 16,
    gap: 12,
  },
  menuItem: {
    alignItems: 'flex-end',
  },
  menuItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 10,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    marginRight: 4,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuItemSublabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default AddRecipeFAB;
