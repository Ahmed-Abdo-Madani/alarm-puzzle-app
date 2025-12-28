import React from 'react';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RepeatPattern } from '../types/alarm';
import { Text } from './Text';
import { View } from './View';
import { colors, spacing } from '../theme';
import { flexRow, marginHorizontal } from '../theme/styles';

interface RepeatSelectorProps {
  repeatPattern: RepeatPattern;
  repeatDays?: number[];
  onChange: (pattern: RepeatPattern, days?: number[]) => void;
}

const REPEAT_OPTIONS: { label: string; value: RepeatPattern }[] = [
  { label: 'alarm.repeatOnce', value: 'once' },
  { label: 'alarm.repeatDaily', value: 'daily' },
  { label: 'alarm.repeatWeekdays', value: 'weekdays' },
  { label: 'alarm.repeatWeekends', value: 'weekends' },
  { label: 'alarm.repeatCustom', value: 'custom' },
];

const DAYS = [
  { label: 'common.days.sun', value: 0 },
  { label: 'common.days.mon', value: 1 },
  { label: 'common.days.tue', value: 2 },
  { label: 'common.days.wed', value: 3 },
  { label: 'common.days.thu', value: 4 },
  { label: 'common.days.fri', value: 5 },
  { label: 'common.days.sat', value: 6 },
];

export const RepeatSelector: React.FC<RepeatSelectorProps> = ({
  repeatPattern,
  repeatDays = [],
  onChange,
}) => {
  const { t } = useTranslation();

  const handlePatternChange = (pattern: RepeatPattern) => {
    if (pattern === 'custom') {
      onChange(pattern, repeatDays.length > 0 ? repeatDays : [new Date().getDay()]);
    } else {
      onChange(pattern);
    }
  };

  const toggleDay = (day: number) => {
    const newDays = repeatDays.includes(day)
      ? repeatDays.filter((d) => d !== day)
      : [...repeatDays, day].sort((a, b) => a - b);
    
    onChange('custom', newDays);
  };

  return (
    <RNView style={styles.container} accessibilityRole="radiogroup">
      {REPEAT_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            repeatPattern === option.value && styles.selectedOption,
          ]}
          onPress={() => handlePatternChange(option.value)}
          accessibilityRole="radio"
          accessibilityState={{ selected: repeatPattern === option.value }}
          accessibilityLabel={t(option.label)}
        >
          <Text
            tx={option.label}
            color={repeatPattern === option.value ? 'surface' : 'text'}
            variant="body"
          />
        </TouchableOpacity>
      ))}

      {repeatPattern === 'custom' && (
        <View row style={styles.daysContainer}>
          {DAYS.map((day) => {
            const isSelected = repeatDays.includes(day.value);
            return (
              <TouchableOpacity
                key={day.value}
                style={[
                  styles.dayButton,
                  isSelected && styles.selectedDayButton,
                ]}
                onPress={() => toggleDay(day.value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={t(day.label)}
              >
                <Text
                  tx={day.label}
                  variant="caption"
                  color={isSelected ? 'surface' : 'textSecondary'}
                  style={styles.dayText}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </RNView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderBottomColor: colors.primary,
  },
  daysContainer: {
    padding: spacing.sm,
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedDayButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  dayText: {
    fontWeight: 'bold',
  },
});
