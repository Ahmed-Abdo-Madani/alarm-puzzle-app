import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../Text';
import { Button } from '../Button';
import { DifficultyLevel } from '../../types/alarm';
import { generateTypingPhrase, calculateTypingAccuracy } from '../../utils/puzzleGenerators';
import { colors, spacing } from '../../theme';
import { textAlign, paddingHorizontal } from '../../theme/styles';
import { notificationSuccess } from '../../utils/haptics';

interface TypingChallengeComponentProps {
  difficulty: DifficultyLevel;
  language: 'en' | 'ar';
  onComplete: () => void;
  onCancel?: () => void;
}

export const TypingChallengeComponent: React.FC<TypingChallengeComponentProps> = ({
  difficulty,
  language,
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [targetPhrase, setTargetPhrase] = useState('');
  const [userInput, setUserInput] = useState('');
  const [accuracy, setAccuracy] = useState(0);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setTargetPhrase(generateTypingPhrase(language, difficulty));
  }, [difficulty, language]);

  useEffect(() => {
    if (targetPhrase) {
      const acc = calculateTypingAccuracy(userInput, targetPhrase);
      setAccuracy(acc);
    }
  }, [userInput, targetPhrase]);

  const handleSubmit = () => {
    if (accuracy >= 90) {
      notificationSuccess();
      onComplete();
    } else {
      setShowError(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text tx="puzzles.typing.title" variant="h2" style={styles.title} />
      
      <View style={styles.targetContainer}>
        <Text style={[styles.targetText, { textAlign: language === 'ar' ? 'right' : 'left' }]}>
          {targetPhrase}
        </Text>
      </View>

      <TextInput
        style={[
          styles.input, 
          textAlign(),
          { textAlign: language === 'ar' ? 'right' : 'left' }
        ]}
        multiline
        placeholder={t('puzzles.typing.placeholder')}
        placeholderTextColor={colors.textSecondary}
        value={userInput}
        onChangeText={(text) => {
          setUserInput(text);
          setShowError(false);
        }}
        accessibilityLabel={t('accessibility.typingInput', { defaultValue: 'Type the displayed text' })}
      />

      <Text 
        tx="puzzles.typing.accuracy" 
        txOptions={{ percent: accuracy }} 
        style={[
          styles.accuracyText,
          { color: accuracy >= 90 ? colors.success : colors.textSecondary }
        ]} 
      />

      {showError && (
        <Text tx="puzzles.typing.tryAgain" color="error" style={styles.errorText} />
      )}

      <Button
        tx="puzzles.typing.submit"
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
  targetContainer: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  targetText: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 26,
  },
  input: {
    width: '100%',
    minHeight: 100,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    fontSize: 18,
    marginBottom: spacing.md,
    padding: spacing.md,
    color: colors.text,
    textAlignVertical: 'top',
  },
  accuracyText: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  errorText: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  cancelButton: {
    width: '100%',
  },
});
