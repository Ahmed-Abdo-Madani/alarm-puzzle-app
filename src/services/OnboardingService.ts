import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingState } from '../types/onboarding';
import { PuzzleType } from '../types/alarm';

const ONBOARDING_KEY = '@puzzle_alarm_onboarding';

const defaultState: OnboardingState = {
  hasSeenMathPuzzle: false,
  hasSeenTypingPuzzle: false,
  hasSeenBarcodePuzzle: false,
  hasSeenMemoryPuzzle: false,
  hasSeenAlarmSetup: false,
};

export const OnboardingService = {
  getOnboardingState: async (): Promise<OnboardingState> => {
    try {
      const jsonValue = await AsyncStorage.getItem(ONBOARDING_KEY);
      return jsonValue != null ? { ...defaultState, ...JSON.parse(jsonValue) } : defaultState;
    } catch (e) {
      console.error('Failed to get onboarding state', e);
      return defaultState;
    }
  },

  markPuzzleAsSeen: async (puzzleType: PuzzleType) => {
    try {
      const currentState = await OnboardingService.getOnboardingState();
      let newState = { ...currentState };

      switch (puzzleType) {
        case PuzzleType.MATH:
          newState.hasSeenMathPuzzle = true;
          break;
        case PuzzleType.TYPING:
          newState.hasSeenTypingPuzzle = true;
          break;
        case PuzzleType.BARCODE:
          newState.hasSeenBarcodePuzzle = true;
          break;
        case PuzzleType.MEMORY:
          newState.hasSeenMemoryPuzzle = true;
          break;
      }

      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to mark puzzle as seen', e);
    }
  },

  markAlarmSetupAsSeen: async () => {
    try {
      const currentState = await OnboardingService.getOnboardingState();
      const newState = { ...currentState, hasSeenAlarmSetup: true };
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to mark alarm setup as seen', e);
    }
  },

  resetOnboarding: async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch (e) {
      console.error('Failed to reset onboarding', e);
    }
  },
};
