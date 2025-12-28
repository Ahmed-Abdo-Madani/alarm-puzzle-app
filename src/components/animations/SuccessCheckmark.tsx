import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withDelay, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { colors } from '../../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const SuccessCheckmark = ({ size = 100, color = colors.success }: { size?: number, color?: string }) => {
  const progress = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 400, easing: Easing.back(1.5) });
    progress.value = withDelay(400, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: 100 * (1 - progress.value),
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="45" fill={color} />
        <AnimatedPath
          d="M30 50 L45 65 L70 35"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray="100"
          animatedProps={animatedProps}
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
