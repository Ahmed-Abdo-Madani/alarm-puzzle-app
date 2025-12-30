import React from 'react';
import { StyleSheet, TouchableOpacity, Switch, View as RNView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Alarm } from '../types/alarm';
import { Text } from './Text';
import { View } from './View';
import { colors, spacing } from '../theme';
import { flexRow, paddingHorizontal, marginHorizontal } from '../theme/styles';
import { getRepeatLabel, parseAlarmTime } from '../utils/alarmTime';
import { mediumImpact } from '../utils/haptics';

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onPress: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Convert 24h time to 12h format with AM/PM
const formatTime12h = (time: string): { time: string; period: string } => {
  const { hours, minutes } = parseAlarmTime(time);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return {
    time: `${hours12}:${minutes.toString().padStart(2, '0')}`,
    period,
  };
};

export const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onToggle, onPress, onDelete }) => {
  const { t } = useTranslation();
  const repeatLabel = getRepeatLabel(alarm, t);
  const { time: formattedTime, period } = formatTime12h(alarm.time);
  
  // Check if alarm has puzzle challenge enabled
  const hasPuzzle = alarm.settings?.dismissChallenge?.enabled || alarm.snoozeSettings?.challengeConfig?.enabled;

  const handleToggle = () => {
    mediumImpact();
    onToggle(alarm.id);
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(alarm.id)}
      style={[styles.container, !alarm.enabled && styles.containerDisabled]}
      activeOpacity={0.7}
    >
      {/* Top row: puzzle icon + repeat pattern */}
      <RNView style={styles.topRow}>
        <RNView style={styles.topRowLeft}>
          {hasPuzzle && (
            <RNView style={styles.puzzleIndicator}>
              <Text style={styles.puzzleIcon}>✦</Text>
            </RNView>
          )}
          <Text 
            variant="caption" 
            color={alarm.enabled ? 'text' : 'textSecondary'}
            style={styles.repeatText}
          >
            {repeatLabel}
          </Text>
        </RNView>
      </RNView>
      
      {/* Main row: time + toggle */}
      <View row style={styles.content}>
        <RNView style={styles.timeContainer}>
          <RNView style={styles.timeRow}>
            <Text
              style={[styles.time, !alarm.enabled && styles.timeDisabled]}
            >
              {formattedTime}
            </Text>
            <Text style={[styles.period, !alarm.enabled && styles.periodDisabled]}>
              {period}
            </Text>
          </RNView>
          {alarm.label ? (
            <Text variant="caption" color="textSecondary" numberOfLines={1} style={styles.label}>
              {alarm.label}
            </Text>
          ) : null}
        </RNView>

        <Switch
          value={alarm.enabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: colors.secondary }}
          thumbColor={alarm.enabled ? colors.surface : '#f4f3f4'}
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
    borderRadius: 20,
    marginBottom: spacing.sm,
    ...marginHorizontal(spacing.md),
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...paddingHorizontal(spacing.md),
    marginBottom: spacing.xs,
  },
  topRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  puzzleIndicator: {
    marginRight: spacing.xs,
  },
  puzzleIcon: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  repeatText: {
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    ...paddingHorizontal(spacing.md),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  time: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.text,
    letterSpacing: -1,
  },
  timeDisabled: {
    color: colors.textSecondary,
  },
  period: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.text,
    marginLeft: spacing.xs,
  },
  periodDisabled: {
    color: colors.textSecondary,
  },
  label: {
    marginTop: spacing.xs,
  },
});
