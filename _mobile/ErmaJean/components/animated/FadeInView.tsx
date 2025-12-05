/**
 * FadeInView Component
 * 
 * A reusable animated component that fades in its children when mounted.
 * Supports customizable duration, delay, and easing.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { AnimationConfig } from '../../constants/design';

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  onAnimationComplete?: () => void;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  duration = AnimationConfig.timing.normal,
  delay = 0,
  style,
  onAnimationComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });

    return () => {
      animation.stop();
    };
  }, [fadeAnim, duration, delay, onAnimationComplete]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default FadeInView;
