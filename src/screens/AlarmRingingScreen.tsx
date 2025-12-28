import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { colors, spacing } from '../theme';
import { flexRow, paddingHorizontal } from '../theme/styles';
import { RootStackParamList } from '../types/navigation';
import { Alarm } from '../types/alarm';
import { AlarmService } from '../services/AlarmService';
import AudioService from '../services/AudioService';
import SnoozeService from '../services/SnoozeService';
import { UserSettingsService } from '../services/UserSettingsService';
import { PuzzleContainer } from '../components/puzzles/PuzzleContainer';

import { heavyImpact } from '../utils/haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { DesertSun } from '../components/illustrations/DesertSun';

type AlarmRingingRouteProp = RouteProp<RootStackParamList, 'AlarmRinging'>;

export const AlarmRingingScreen = () => {
  const route = useRoute<AlarmRingingRouteProp>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { alarmId } = route.params;

  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [loading, setLoading] = useState(true);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [showDismissPuzzle, setShowDismissPuzzle] = useState(false);
  const [showSnoozePuzzle, setShowSnoozePuzzle] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ar'>('en');

  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1
    );
    pulseScale.value = withRepeat(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedSunStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  useEffect(() => {
    const init = async () => {
      try {
        await activateKeepAwakeAsync();
        const alarmData = await AlarmService.getAlarmById(alarmId);
        
        if (!alarmData) {
          setLoading(false);
          return;
        }

        setAlarm(alarmData);
        const count = await SnoozeService.getSnoozeCount(alarmId);
        setSnoozeCount(count);

        const settings = await UserSettingsService.getUserSettings();
        setCurrentLanguage(settings.language);

        // Load and play sound
        try {
          const soundUri = alarmData.settings.soundUri || require('../../assets/sounds/default_alarm.mp3');
          await AudioService.loadSound(soundUri);
          
          if (alarmData.settings.gradualVolume) {
            await AudioService.startGradualVolumeIncrease(alarmData.settings.volume, 30000);
          } else {
            await AudioService.playSound(alarmData.settings.volume);
          }
        } catch (error) {
          console.error('Failed to play sound', error);
          Alert.alert(t('common.error'), t('sound.loadError'));
        }
      } catch (error) {
        console.error('Error initializing ringing screen', error);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      AudioService.stopGradualVolumeIncrease();
      AudioService.stopSound();
      deactivateKeepAwake();
    };
  }, [alarmId, t]);

  const performSnooze = async () => {
    if (!alarm) return;

    try {
      if (SnoozeService.canSnooze(alarm, snoozeCount)) {
        const notificationId = await SnoozeService.snoozeAlarm(alarm, snoozeCount);
        await SnoozeService.incrementSnoozeCount(alarm.id);
        
        Alert.alert(t('ringing.snoozedFor', { minutes: alarm.snoozeSettings.duration }));
        
        await AudioService.stopSound();
        navigation.goBack();
      } else {
        Alert.alert(t('common.error'), 'Max snoozes reached');
      }
    } catch (error) {
      console.error('Snooze error', error);
      Alert.alert(t('common.error'), t('ringing.snoozeError'));
    }
  };

  const handleSnooze = async () => {
    heavyImpact();
    if (!alarm) return;

    if (alarm.snoozeSettings.requireChallenge && alarm.snoozeSettings.challengeConfig?.enabled) {
      setShowSnoozePuzzle(true);
    } else {
      await performSnooze();
    }
  };

  const performDismiss = async () => {
    if (!alarm) return;

    try {
      await AudioService.stopSound();
      await SnoozeService.resetSnoozeCount(alarm.id);

      if (alarm.repeatPattern === 'once') {
        await AlarmService.updateAlarm(alarm.id, { enabled: false });
      }

      navigation.goBack();
    } catch (error) {
      console.error('Dismiss error', error);
      Alert.alert(t('common.error'), t('ringing.dismissError'));
    }
  };

  const handleDismiss = async () => {
    heavyImpact();
    if (!alarm) return;

    if (alarm.settings.dismissChallenge?.enabled) {
      setShowDismissPuzzle(true);
    } else {
      await performDismiss();
    }
  };

  const onDismissPuzzleComplete = () => {
    setShowDismissPuzzle(false);
    performDismiss();
  };

  const onSnoozePuzzleComplete = () => {
    setShowSnoozePuzzle(false);
    performSnooze();
  };

  if (loading || !alarm) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (showDismissPuzzle && alarm.settings.dismissChallenge) {
    return (
      <PuzzleContainer 
        puzzleConfig={alarm.settings.dismissChallenge} 
        language={currentLanguage} 
        onComplete={onDismissPuzzleComplete} 
        onCancel={() => setShowDismissPuzzle(false)} 
      />
    );
  }

  if (showSnoozePuzzle && alarm.snoozeSettings.challengeConfig) {
    let config = alarm.snoozeSettings.challengeConfig;
    if (SnoozeService.shouldUseProgressiveDifficulty(alarm)) {
      config = SnoozeService.getProgressiveDifficulty(config, snoozeCount);
    }

    return (
      <PuzzleContainer 
        puzzleConfig={config} 
        language={currentLanguage} 
        onComplete={onSnoozePuzzleComplete} 
        onCancel={() => setShowSnoozePuzzle(false)} 
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.sunContainer, animatedSunStyle]}>
          <DesertSun size={200} color={colors.primary} />
        </Animated.View>
        <Text variant="h1" style={styles.timeText} accessibilityLabel={t('accessibility.alarmTime', { time: alarm.time })}>{alarm.time}</Text>
        <Text variant="h2" style={styles.labelText}>{alarm.label || t('alarm.title')}</Text>
        
        <Text style={styles.snoozeCountText}>
          {t('ringing.snoozeCount', { count: snoozeCount + 1, max: alarm.snoozeSettings.maxCount })}
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            tx="ringing.snooze"
            variant="secondary"
            onPress={handleSnooze}
            style={styles.snoozeButton}
            textStyle={styles.buttonText}
            accessibilityLabel={t('accessibility.snoozeButton', { duration: alarm.snoozeSettings.duration })}
            accessibilityHint={alarm.snoozeSettings.requireChallenge ? t('accessibility.challengeRequired', { action: 'snooze' }) : undefined}
          />
          
          <Animated.View style={animatedButtonStyle}>
            <Button
              tx="ringing.dismiss"
              variant="primary"
              onPress={handleDismiss}
              style={styles.dismissButton}
              textStyle={styles.buttonText}
              accessibilityLabel={t('accessibility.dismissButton')}
              accessibilityHint={alarm.settings.dismissChallenge?.enabled ? t('accessibility.challengeRequired', { action: 'dismiss' }) : undefined}
            />
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  sunContainer: {
    marginBottom: spacing.xl,
  },
  timeText: {
    fontSize: 64,
    marginBottom: spacing.md,
    color: colors.primary,
  },
  labelText: {
    marginBottom: spacing.md,
    color: colors.text,
  },
  snoozeCountText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.lg,
  },
  snoozeButton: {
    width: '100%',
    height: 60,
    marginBottom: spacing.md,
  },
  dismissButton: {
    width: '100%',
    height: 60,
    backgroundColor: colors.error,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
