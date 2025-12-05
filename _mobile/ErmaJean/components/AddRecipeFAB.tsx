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
  Platform,
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
        onPress={async () => {
          await Haptic.light();
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
  const [isPressed, setIsPressed] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const toggleMenu = async () => {
    await Haptic.buttonPress();
    setIsExpanded(!isExpanded);
    rotation.value = withSpring(isExpanded ? 0 : 90, { damping: 15 }); // Changed to 90deg rotation
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

  const handlePressIn = () => {
    setIsPressed(true);
    scale.value = withSpring(0.9, { damping: 15 }); // active:scale-90
  };

  const handlePressOut = () => {
    setIsPressed(false);
    scale.value = withSpring(1, { damping: 15 });
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
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
      <View style={styles.container} pointerEvents="box-none">
        {/* Menu Items */}
        <View style={styles.menuContainer} pointerEvents="box-none">
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
        <Animated.View style={fabAnimatedStyle}>
          <TouchableOpacity
            style={styles.fab}
            onPress={toggleMenu}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
}


const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 998,
    elevation: 998,
  },
  overlayPressable: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 118 : 100, // Tab bar bottom + height + spacing
    right: 24,
    alignItems: 'flex-end',
    zIndex: 1000,
    elevation: 1000,
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
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#064e3b',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});

export default AddRecipeFAB;
