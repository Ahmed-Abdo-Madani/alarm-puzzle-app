import React from 'react';
import { Modal, View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PuzzleType } from '../../types/alarm';
import { Text } from '../Text';
import { Button } from '../Button';
import { SlideInView } from '../animations/SlideInView';
import { colors, spacing } from '../../theme';
import { DesertSun } from '../illustrations/DesertSun';
import { Cactus } from '../illustrations/Cactus';

interface PuzzleOnboardingModalProps {
  visible: boolean;
  puzzleType: PuzzleType;
  onClose: () => void;
}

export const PuzzleOnboardingModal: React.FC<PuzzleOnboardingModalProps> = ({
  visible,
  puzzleType,
  onClose,
}) => {
  const { t } = useTranslation();

  const getContent = () => {
    switch (puzzleType) {
      case PuzzleType.MATH:
        return {
          title: 'onboarding.mathTitle',
          description: 'onboarding.mathDescription',
          Illustration: DesertSun,
        };
      case PuzzleType.TYPING:
        return {
          title: 'onboarding.typingTitle',
          description: 'onboarding.typingDescription',
          Illustration: Cactus,
        };
      case PuzzleType.BARCODE:
        return {
          title: 'onboarding.barcodeTitle',
          description: 'onboarding.barcodeDescription',
          Illustration: DesertSun, // Placeholder
        };
      case PuzzleType.MEMORY:
        return {
          title: 'onboarding.memoryTitle',
          description: 'onboarding.memoryDescription',
          Illustration: Cactus, // Placeholder
        };
      default:
        return {
          title: '',
          description: '',
          Illustration: DesertSun,
        };
    }
  };

  const { title, description, Illustration } = getContent();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <SlideInView style={styles.container} from="bottom" duration={400}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.illustrationContainer}>
              <Illustration size={120} color={colors.primary} />
            </View>
            
            <Text tx={title} variant="h2" style={styles.title} />
            <Text tx={description} style={styles.description} />
            
            <Button
              tx="onboarding.gotIt"
              onPress={onClose}
              style={styles.button}
            />
          </ScrollView>
        </SlideInView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  illustrationContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  button: {
    width: '100%',
  },
});
