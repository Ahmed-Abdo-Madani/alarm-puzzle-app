import React from 'react';
import { StyleSheet, TouchableOpacity, I18nManager, Platform } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '../theme';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = '+',
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    [I18nManager.isRTL ? 'left' : 'right']: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  icon: {
    fontSize: 32,
    color: colors.surface,
    lineHeight: Platform.OS === 'ios' ? 36 : 40,
    fontWeight: '300',
  },
});
