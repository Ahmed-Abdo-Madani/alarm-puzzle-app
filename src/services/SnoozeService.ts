import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { StorageService } from './StorageService';
import { Alarm, PuzzleConfig, DifficultyLevel } from '../types/alarm';
import NativeAlarmService from './NativeAlarmService';

class SnoozeService {
  async snoozeAlarm(alarm: Alarm, snoozeCount: number): Promise<string> {
    const { duration, autoShorten, shortenBy } = alarm.snoozeSettings;
    let snoozeDuration = duration;

    if (autoShorten) {
      snoozeDuration = Math.max(1, duration - (snoozeCount * shortenBy));
    }

    const triggerTime = Date.now() + snoozeDuration * 60 * 1000;
    const snoozeId = `${alarm.id}_snooze`;

    // Use native AlarmManager on Android for reliable wake-up
    if (Platform.OS === 'android') {
      try {
        await NativeAlarmService.scheduleAlarm(snoozeId, triggerTime);
        return snoozeId;
      } catch (error) {
        console.error('Native snooze scheduling failed, falling back to notifications:', error);
      }
    }

    // Fallback to expo-notifications
    const triggerDate = new Date(triggerTime);
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || 'Alarm',
        body: 'Snoozed alarm',
        data: { alarmId: alarm.id, isSnoozed: true, snoozeCount: snoozeCount + 1 },
        sound: 'default-alarm.mp3',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });

    return notificationId;
  }

  async getSnoozeCount(alarmId: string): Promise<number> {
    const count = await StorageService.getItem<number>(`snooze_count_${alarmId}`);
    return count || 0;
  }

  async incrementSnoozeCount(alarmId: string): Promise<void> {
    const currentCount = await this.getSnoozeCount(alarmId);
    await StorageService.setItem(`snooze_count_${alarmId}`, currentCount + 1);
  }

  async resetSnoozeCount(alarmId: string): Promise<void> {
    await StorageService.removeItem(`snooze_count_${alarmId}`);
  }

  canSnooze(alarm: Alarm, currentCount: number): boolean {
    return currentCount < alarm.snoozeSettings.maxCount;
  }

  getProgressiveDifficulty(baseConfig: PuzzleConfig, snoozeCount: number): PuzzleConfig {
    if (snoozeCount === 0) {
      return baseConfig;
    }

    const difficulties = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD];
    let currentLevelIndex = difficulties.indexOf(baseConfig.difficulty);
    
    // If difficulty not found (shouldn't happen), default to EASY
    if (currentLevelIndex === -1) currentLevelIndex = 0;

    // Increase difficulty based on snooze count
    // For each snooze, increase by 1 level
    const newLevelIndex = Math.min(currentLevelIndex + snoozeCount, difficulties.length - 1);
    
    return {
      ...baseConfig,
      difficulty: difficulties[newLevelIndex],
    };
  }

  shouldUseProgressiveDifficulty(alarm: Alarm): boolean {
    return !!alarm.snoozeSettings.progressiveDifficulty;
  }
}

export default new SnoozeService();
