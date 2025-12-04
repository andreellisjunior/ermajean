/**
 * StaggeredList Component
 * 
 * A list component that animates its children with a staggered fade-in effect.
 * Each item appears sequentially with a configurable delay between items.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle, StyleProp } from 'react-native';
import { AnimationConfig } from '../../constants/design';

interface StaggeredListProps {
  children: React.ReactNode;
  staggerDelay?: number;
  itemDuration?: number;
  initialDelay?: number;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = AnimationConfig.stagger.normal,
  itemDuration = AnimationConfig.timing.normal,
  initialDelay = 0,
  style,
  itemStyle,
}) => {
  const childrenArray = React.Children.toArray(children);
  const animatedValues = useRef(
    childrenArray.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((animValue, index) =>
      Animated.timing(animValue, {
        toValue: 1,
        duration: itemDuration,
        delay: initialDelay + index * staggerDelay,
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [animatedValues, staggerDelay, itemDuration, initialDelay]);

  return (
    <View style={style}>
      {childrenArray.map((child, index) => (
        <Animated.View
          key={index}
          style={[
            itemStyle,
            {
              opacity: animatedValues[index],
              transform: [
                {
                  translateY: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {child}
        </Animated.View>
      ))}
    </View>
  );
};

export default StaggeredList;
