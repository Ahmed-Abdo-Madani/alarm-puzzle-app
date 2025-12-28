import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PuzzleConfig, PuzzleType, DifficultyLevel } from '../types/alarm';
import { View } from './View';
import { Text } from './Text';
import { DifficultySelector } from './DifficultySelector';
import { colors, spacing } from '../theme';
import { flexRow, paddingHorizontal, textAlign } from '../theme/styles';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ChallengeConfigCardProps {
  title: string;
  config: PuzzleConfig | undefined;
  onChange: (config: PuzzleConfig | undefined) => void;
}

export const ChallengeConfigCard: React.FC<ChallengeConfigCardProps> = ({
  title,
  config,
  onChange,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleTypeSelect = (type: PuzzleType | null) => {
    if (type === null) {
      onChange(undefined);
    } else {
      onChange({
        type,
        difficulty: config?.difficulty || DifficultyLevel.MEDIUM,
        enabled: true,
      });
    }
  };

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    if (config) {
      onChange({
        ...config,
        difficulty,
      });
    }
  };

  const puzzleOptions = [
    { type: null, label: 'challenges.noneSelected', icon: '🚫' },
    { type: PuzzleType.MATH, label: 'puzzleTypes.math', icon: '🔢' },
    { type: PuzzleType.TYPING, label: 'puzzleTypes.typing', icon: '⌨️' },
    { type: PuzzleType.BARCODE, label: 'puzzleTypes.barcode', icon: '📷' },
    { type: PuzzleType.MEMORY, label: 'puzzleTypes.memory', icon: '🧠' },
  ];

  const selectedLabel = config ? `puzzleTypes.${config.type.toLowerCase()}` : 'challenges.noneSelected';

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {t(selectedLabel)}
            {config && ` • ${t(`challenges.${config.difficulty.toLowerCase()}`)}`}
          </Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>{t('challenges.selectChallenge')}</Text>
          <View style={styles.typesContainer}>
            {puzzleOptions.map((option) => {
              const isSelected = option.type === null ? !config : config?.type === option.type;
              return (
                <TouchableOpacity
                  key={option.type || 'none'}
                  style={[
                    styles.typeOption,
                    isSelected && styles.selectedTypeOption,
                  ]}
                  onPress={() => handleTypeSelect(option.type as PuzzleType | null)}
                >
                  <Text style={styles.typeIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.typeText,
                      isSelected && styles.selectedTypeText,
                    ]}
                  >
                    {t(option.label)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {config && (
            <DifficultySelector
              value={config.difficulty}
              onChange={handleDifficultyChange}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.md,
    ...flexRow(),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    ...textAlign(),
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    ...textAlign(),
  },
  expandIcon: {
    fontSize: 12,
    color: colors.textSecondary,
    ...paddingHorizontal(spacing.sm),
  },
  content: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    ...textAlign(),
  },
  typesContainer: {
    ...flexRow(),
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    width: '48%', // Approximately 2 columns
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...flexRow(),
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  selectedTypeOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeIcon: {
    fontSize: 20,
    marginEnd: spacing.sm,
  },
  typeText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    ...textAlign(),
  },
  selectedTypeText: {
    color: colors.surface,
    fontWeight: 'bold',
  },
});
