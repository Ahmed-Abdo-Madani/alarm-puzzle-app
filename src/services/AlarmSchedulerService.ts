import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '../types/alarm';
import { getNextOccurrence, getNextOccurrencesForRepeating } from '../utils/alarmTime';
import i18n from '../config/i18n';
import { ALARM_CHANNEL_ID } from './NotificationChannelService';
import NativeAlarmService from './NativeAlarmService';

export const AlarmSchedulerService = {
  async scheduleAlarm(alarm: Alarm): Promise<string[]> {
    if (!alarm.enabled) return [];

    const notificationIds: string[] = [];

    if (alarm.repeatPattern === 'once') {
      const nextOccurrence = getNextOccurrence(alarm);
      if (!nextOccurrence) return [];
      
      // Use native AlarmManager for reliable wake-up on Android
      if (Platform.OS === 'android') {
        try {
          await NativeAlarmService.scheduleAlarm(alarm.id, nextOccurrence.getTime());
          notificationIds.push(alarm.id);
        } catch (error) {
          console.error('Native alarm scheduling failed, falling back to notifications:', error);
          // Fallback to expo-notifications
          const content = this.createNotificationContent(alarm);
          const id = await Notifications.scheduleNotificationAsync({
            content,
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nextOccurrence },
          });
          notificationIds.push(id);
        }
      } else {
        // iOS uses expo-notifications
        const content = this.createNotificationContent(alarm);
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nextOccurrence },
        });
        notificationIds.push(id);
      }
    } else {
      // For repeating alarms, schedule the next 7 occurrences
      const occurrences = getNextOccurrencesForRepeating(alarm, 7);
      
      for (let i = 0; i < occurrences.length; i++) {
        const occurrence = occurrences[i];
        const uniqueId = `${alarm.id}_${i}`;
        
        if (Platform.OS === 'android') {
          try {
            await NativeAlarmService.scheduleAlarm(uniqueId, occurrence.getTime());
            notificationIds.push(uniqueId);
          } catch (error) {
            console.error('Native alarm scheduling failed:', error);
          }
        } else {
          const content = this.createNotificationContent(alarm);
          const id = await Notifications.scheduleNotificationAsync({
            content,
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: occurrence },
          });
          notificationIds.push(id);
        }
      }
    }

    return notificationIds;
  },

  async cancelAlarm(alarm: Alarm): Promise<void> {
    if (alarm.notificationIds && alarm.notificationIds.length > 0) {
      for (const id of alarm.notificationIds) {
        if (Platform.OS === 'android') {
          try {
            await NativeAlarmService.cancelAlarm(id);
          } catch (error) {
            console.error('Failed to cancel native alarm:', error);
          }
        }
        // Also cancel any expo notifications
        try {
          await Notifications.cancelScheduledNotificationAsync(id);
        } catch (error) {
          // Ignore - notification may not exist
        }
      }
    }
  },

  async rescheduleAlarm(alarm: Alarm): Promise<string[]> {
    await this.cancelAlarm(alarm);
    return this.scheduleAlarm(alarm);
  },

  async cancelAllAlarms(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  },

  createNotificationContent(alarm: Alarm): Notifications.NotificationContentInput {
    return {
      title: i18n.t('notifications.alarmTitle', { label: alarm.label || i18n.t('alarm.newAlarm') }),
      body: i18n.t('notifications.alarmBody'),
      sound: 'default_alarm', // Android uses raw resource name without extension
      priority: Notifications.AndroidNotificationPriority.MAX,
      sticky: true,
      autoDismiss: false,
      data: { 
        alarmId: alarm.id,
        isAlarm: true,
      },
      categoryIdentifier: 'alarm',
      ...(Platform.OS === 'android' && {
        channelId: ALARM_CHANNEL_ID,
      }),
    };
  },

  parseTime(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    return { hours, minutes };
  },
};
