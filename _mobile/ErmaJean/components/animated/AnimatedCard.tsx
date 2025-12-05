/**
 * AnimatedCard Component
 * 
 * A pressable card component with smooth scale and opacity animations.
 * Provides visual feedback on press with haptic feedback support.
 */

import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  ViewStyle,
  StyleProp,
  PressableProps,
} from 'react-native';
import { Haptic } from '../../utils/haptics';
import { Shadows, BorderRadius, Colors } from '../../constants/design';

interface AnimatedCardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  enableHaptic?: boolean;
  scaleValue?: number;
  shadow?: keyof typeof Shadows;
  borderRadius?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  onPress,
  enableHaptic = true,
  scaleValue = 0.97,
  shadow = 'md',
  borderRadius = BorderRadius.lg,
  ...pressableProps
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (enableHaptic) {
      Haptic.cardTap();
    }

    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      ...AnimationConfig.spring.snappy,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...AnimationConfig.spring.snappy,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      {...pressableProps}
    >
      <Animated.View
        style={[
          {
            backgroundColor: Colors.background.primary,
            borderRadius,
            ...Shadows[shadow],
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

// Import AnimationConfig for spring configuration
import { AnimationConfig } from '../../constants/design';

export default AnimatedCard;
