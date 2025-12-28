import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

interface SlideInViewProps {
  children: React.ReactNode;
  from?: 'bottom' | 'top' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const SlideInView: React.FC<SlideInViewProps> = ({ 
  children, 
  from = 'bottom',
  distance = 100,
  duration = 500, 
  delay = 0,
  style 
}) => {
  const offset = useSharedValue(distance);
  const opacity = useSharedValue(0);

  useEffect(() => {
    offset.value = withDelay(delay, withSpring(0));
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, [delay, duration, offset, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    const transform = [];
    
    if (from === 'bottom') transform.push({ translateY: offset.value });
    if (from === 'top') transform.push({ translateY: -offset.value });
    if (from === 'left') transform.push({ translateX: -offset.value });
    if (from === 'right') transform.push({ translateX: offset.value });

    return {
      opacity: opacity.value,
      transform,
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
