import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const lightImpact = async () => {
  if (isWeb) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.warn('Haptics not available', error);
  }
};

export const mediumImpact = async () => {
  if (isWeb) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.warn('Haptics not available', error);
  }
};

export const heavyImpact = async () => {
  if (isWeb) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.warn('Haptics not available', error);
  }
};

export const notificationSuccess = async () => {
  if (isWeb) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.warn('Haptics not available', error);
  }
};

export const notificationWarning = async () => {
  if (isWeb) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.warn('Haptics not available', error);
  }
};

export const notificationError = async () => {
  if (isWeb) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.warn('Haptics not available', error);
  }
};
