import React from 'react';
import { StyleSheet, TouchableOpacity, Switch, View as RNView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Alarm } from '../types/alarm';
import { Text } from './Text';
import { View } from './View';
import { colors, spacing } from '../theme';
import { flexRow, paddingHorizontal, marginHorizontal } from '../theme/styles';
import { getRepeatLabel } from '../utils/alarmTime';
import { mediumImpact } from '../utils/haptics';

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onPress: (id: string) => void;
}

export const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onToggle, onPress }) => {
  const { t } = useTranslation();
  const repeatLabel = getRepeatLabel(alarm, t);

  const handleToggle = () => {
    mediumImpact();
    onToggle(alarm.id);
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(alarm.id)}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View row style={styles.content}>
        <RNView style={styles.timeContainer}>
          <Text
            variant="h1"
            color={alarm.enabled ? 'text' : 'textSecondary'}
            style={styles.time}
          >
            {alarm.time}
          </Text>
          <RNView style={styles.labelContainer}>
            {alarm.label ? (
              <Text variant="body" color="textSecondary" numberOfLines={1}>
                {alarm.label}
              </Text>
            ) : null}
            <Text variant="caption" color="textSecondary">
              {repeatLabel}
            </Text>
          </RNView>
        </RNView>

        <Switch
          value={alarm.enabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: colors.secondary }}
          thumbColor={alarm.enabled ? colors.primary : '#f4f3f4'}
          ios_backgroundColor={colors.border}
          accessibilityLabel={t('accessibility.toggleAlarm', { time: alarm.time, label: alarm.label || '' })}
          accessibilityHint={t('accessibility.toggleHint')}
          accessibilityRole="switch"
          accessibilityState={{ checked: alarm.enabled }}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    ...marginHorizontal(spacing.md),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  content: {
    ...paddingHorizontal(spacing.md),
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flex: 1,
  },
  time: {
    marginBottom: spacing.xs,
  },
  labelContainer: {
    // Additional styling if needed
  },
});
