import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../Text';
import { Button } from '../Button';
import { DifficultyLevel } from '../../types/alarm';
import { generateMathProblem, MathProblem } from '../../utils/puzzleGenerators';
import { colors, spacing } from '../../theme';
import { textAlign, paddingHorizontal } from '../../theme/styles';
import { notificationSuccess, notificationError } from '../../utils/haptics';

interface MathPuzzleComponentProps {
  difficulty: DifficultyLevel;
  onComplete: () => void;
  onCancel?: () => void;
}

export const MathPuzzleComponent: React.FC<MathPuzzleComponentProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setProblem(generateMathProblem(difficulty));
  }, [difficulty]);

  const handleSubmit = () => {
    if (!problem) return;

    const answer = parseInt(userAnswer, 10);
    if (answer === problem.answer) {
      notificationSuccess();
      onComplete();
    } else {
      notificationError();
      setShowError(true);
      setUserAnswer('');
    }
  };

  if (!problem) return null;

  return (
    <View style={styles.container}>
      <Text tx="puzzles.math.title" variant="h2" style={styles.title} />
      
      <View style={styles.problemContainer}>
        <Text style={styles.problemText}>{problem.question}</Text>
      </View>

      <TextInput
        style={[styles.input, textAlign()]}
        keyboardType="numeric"
        placeholder={t('puzzles.math.placeholder')}
        placeholderTextColor={colors.textSecondary}
        value={userAnswer}
        onChangeText={(text) => {
          setUserAnswer(text);
          setShowError(false);
        }}
        accessibilityLabel={t('accessibility.mathInput', { defaultValue: 'Enter answer to math problem' })}
      />

      {showError && (
        <Text tx="puzzles.math.incorrect" color="error" style={styles.errorText} />
      )}

      <Button
        tx="puzzles.math.submit"
        onPress={handleSubmit}
        style={styles.button}
      />
      
      {onCancel && (
        <Button
          tx="common.cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.cancelButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  problemContainer: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  problemText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    fontSize: 24,
    marginBottom: spacing.md,
    ...paddingHorizontal(spacing.md),
    color: colors.text,
  },
  errorText: {
    marginBottom: spacing.md,
  },
  button: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  cancelButton: {
    width: '100%',
  },
});
