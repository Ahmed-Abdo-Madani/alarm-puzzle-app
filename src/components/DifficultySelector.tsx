import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DifficultyLevel } from '../types/alarm';
import { View } from './View';
import { Text } from './Text';
import { colors, spacing } from '../theme';
import { flexRow } from '../theme/styles';

interface DifficultySelectorProps {
  value: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  const options = [
    { level: DifficultyLevel.EASY, label: 'challenges.easy' },
    { level: DifficultyLevel.MEDIUM, label: 'challenges.medium' },
    { level: DifficultyLevel.HARD, label: 'challenges.hard' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('challenges.difficulty')}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = value === option.level;
          return (
            <TouchableOpacity
              key={option.level}
              style={[
                styles.option,
                isSelected && styles.selectedOption,
              ]}
              onPress={() => onChange(option.level)}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText,
                ]}
              >
                {t(option.label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    ...flexRow(),
  },
  optionsContainer: {
    ...flexRow(),
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.surface,
    fontWeight: 'bold',
  },
});
