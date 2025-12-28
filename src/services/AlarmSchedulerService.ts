import * as Notifications from 'expo-notifications';
import { Alarm } from '../types/alarm';
import { getNextOccurrence } from '../utils/alarmTime';
import { mapRepeatDaysToExpoFormat } from '../utils/notificationUtils';
import i18n from '../config/i18n';
import { ALARM_CHANNEL_ID } from './NotificationChannelService';

export const AlarmSchedulerService = {
  async scheduleAlarm(alarm: Alarm): Promise<string[]> {
    if (!alarm.enabled) return [];

    const nextOccurrence = getNextOccurrence(alarm);
    if (!nextOccurrence) return [];

    const content = this.createNotificationContent(alarm);
    const { hours, minutes } = this.parseTime(alarm.time);
    const notificationIds: string[] = [];

    if (alarm.repeatPattern === 'once') {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { date: nextOccurrence },
      });
      notificationIds.push(id);
    } else if (alarm.repeatPattern === 'daily') {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { hour: hours, minute: minutes, repeats: true },
      });
      notificationIds.push(id);
    } else {
      // Handle weekdays, weekends, custom
      let daysToSchedule: number[] = [];
      if (alarm.repeatPattern === 'weekdays') {
        daysToSchedule = [2, 3, 4, 5, 6]; // Mon-Fri (Expo 1-7)
      } else if (alarm.repeatPattern === 'weekends') {
        daysToSchedule = [1, 7]; // Sun, Sat (Expo 1-7)
      } else if (alarm.repeatPattern === 'custom' && alarm.repeatDays) {
        daysToSchedule = mapRepeatDaysToExpoFormat(alarm.repeatDays);
      }

      for (const day of daysToSchedule) {
        const id = await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            weekday: day,
            hour: hours,
            minute: minutes,
            repeats: true,
          },
        });
        notificationIds.push(id);
      }
    }

    return notificationIds;
  },

  async cancelAlarm(alarm: Alarm): Promise<void> {
    if (alarm.notificationIds && alarm.notificationIds.length > 0) {
      await Promise.all(alarm.notificationIds.map(id => Notifications.cancelScheduledNotificationAsync(id)));
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
      sound: 'default-alarm.mp3', // This should match the sound in app.json
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { alarmId: alarm.id },
      categoryIdentifier: 'alarm',
      android: {
        channelId: ALARM_CHANNEL_ID,
      },
    };
  },

  parseTime(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    return { hours, minutes };
  },
};
