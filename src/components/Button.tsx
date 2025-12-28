import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '../theme';
import { paddingHorizontal } from '../theme/styles';

import { lightImpact } from '../utils/haptics';

interface ButtonProps {
  tx?: string;
  text?: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
  tx,
  text,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const backgroundColor = variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.secondary : 'transparent';
  const borderColor = variant === 'outline' ? colors.primary : 'transparent';
  const borderWidth = variant === 'outline' ? 1 : 0;
  const textColor = variant === 'outline' ? colors.primary : colors.surface;

  const handlePress = () => {
    lightImpact();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.base,
        { backgroundColor, borderColor, borderWidth },
        paddingHorizontal(spacing.md),
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || text}
      accessibilityHint={accessibilityHint}
    >
      <Text
        tx={tx}
        style={[styles.text, { color: textColor }, textStyle]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  text: {
    fontWeight: '600',
  },
});
