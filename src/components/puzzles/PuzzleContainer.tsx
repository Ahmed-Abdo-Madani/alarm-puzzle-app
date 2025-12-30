import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text } from '../Text';
import { Button } from '../Button';
import { PuzzleConfig, PuzzleType } from '../../types/alarm';
import { MathPuzzleComponent } from './MathPuzzleComponent';
import { TypingChallengeComponent } from './TypingChallengeComponent';
// import { BarcodeScannerComponent } from './BarcodeScannerComponent';
import { MemoryGameComponent } from './MemoryGameComponent';
import { colors, spacing } from '../../theme';
import { OnboardingService } from '../../services/OnboardingService';
import { PuzzleOnboardingModal } from '../onboarding/PuzzleOnboardingModal';
import { SuccessCheckmark } from '../animations/SuccessCheckmark';
import { notificationSuccess } from '../../utils/haptics';

interface PuzzleContainerProps {
  puzzleConfig: PuzzleConfig;
  language: 'en' | 'ar';
  onComplete: () => void;
  onCancel?: () => void;
}

export const PuzzleContainer: React.FC<PuzzleContainerProps> = ({
  puzzleConfig,
  language,
  onComplete,
  onCancel,
}) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const state = await OnboardingService.getOnboardingState();
      let hasSeen = false;
      switch (puzzleConfig.type) {
        case PuzzleType.MATH: hasSeen = state.hasSeenMathPuzzle; break;
        case PuzzleType.TYPING: hasSeen = state.hasSeenTypingPuzzle; break;
        case PuzzleType.BARCODE: hasSeen = state.hasSeenBarcodePuzzle; break;
        case PuzzleType.MEMORY: hasSeen = state.hasSeenMemoryPuzzle; break;
      }
      
      if (!hasSeen) {
        setShowOnboarding(true);
      }
    };
    checkOnboarding();
  }, [puzzleConfig.type]);

  const handleOnboardingClose = async () => {
    await OnboardingService.markPuzzleAsSeen(puzzleConfig.type);
    setShowOnboarding(false);
  };

  const handleComplete = () => {
    notificationSuccess();
    setIsSuccess(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const renderPuzzle = () => {
    switch (puzzleConfig.type) {
      case PuzzleType.MATH:
        return (
          <MathPuzzleComponent
            difficulty={puzzleConfig.difficulty}
            onComplete={handleComplete}
            onCancel={onCancel}
          />
        );
      case PuzzleType.TYPING:
        return (
          <TypingChallengeComponent
            difficulty={puzzleConfig.difficulty}
            language={language}
            onComplete={handleComplete}
            onCancel={onCancel}
          />
        );
      case PuzzleType.BARCODE:
        return (
            <View><Text>Barcode Scanner Disabled</Text><Button text="Complete" onPress={handleComplete} /></View>
        //   <BarcodeScannerComponent
        //     onComplete={handleComplete}
        //     onCancel={onCancel}
        //   />
        );
      case PuzzleType.MEMORY:
        return (
          <MemoryGameComponent
            difficulty={puzzleConfig.difficulty}
            onComplete={handleComplete}
            onCancel={onCancel}
          />
        );
      default:
        return (
          <View style={styles.errorContainer}>
            <Text>Unknown puzzle type</Text>
            {onCancel && (
              <Button tx="common.cancel" onPress={onCancel} />
            )}
          </View>
        );
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <SuccessCheckmark />
        <Text tx="common.success" variant="h2" style={styles.successText} />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <PuzzleOnboardingModal
        visible={showOnboarding}
        puzzleType={puzzleConfig.type}
        onClose={handleOnboardingClose}
      />
    );
  }

  // Barcode scanner and Memory game need full screen without scrollview
  if (puzzleConfig.type === PuzzleType.BARCODE || puzzleConfig.type === PuzzleType.MEMORY) {
    return (
      <SafeAreaView style={puzzleConfig.type === PuzzleType.BARCODE ? styles.fullScreenContainer : styles.safeArea}>
        <View style={styles.header}>
          <Text tx="puzzles.title" variant="h1" style={styles.title} />
        </View>
        {renderPuzzle()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text tx="puzzles.title" variant="h1" style={styles.title} />
        </View>
        
        <View style={styles.puzzleWrapper}>
          {renderPuzzle()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: colors.primary,
  },
  puzzleWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  successText: {
    marginTop: spacing.lg,
    color: colors.success,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
