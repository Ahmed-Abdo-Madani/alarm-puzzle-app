import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { flexRow, textAlign } from '../theme/styles';

interface SettingsRowProps {
  title: string;
  description?: string;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  title,
  description,
  rightComponent,
  onPress,
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={[styles.container, style]} onPress={onPress} disabled={!onPress}>
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        {rightComponent && <View style={styles.rightComponent}>{rightComponent}</View>}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  contentContainer: {
    ...flexRow(),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginEnd: spacing.md,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    ...textAlign(),
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    ...textAlign(),
  },
  rightComponent: {
    justifyContent: 'center',
  },
});
