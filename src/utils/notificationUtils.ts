import { Alarm } from '../types/alarm';
import { getNextOccurrence } from './alarmTime';

export const mapRepeatDaysToExpoFormat = (days: number[]): number[] => {
  // Expo uses 1-7 (Sunday-Saturday)
  // Our app uses 0-6 (Sunday-Saturday)
  return days.map(day => day + 1);
};

export const getAlarmTriggerTime = (alarm: Alarm): Date | null => {
  return getNextOccurrence(alarm);
};

export const shouldRescheduleAlarm = (oldAlarm: Alarm, newAlarm: Alarm): boolean => {
  return (
    oldAlarm.time !== newAlarm.time ||
    oldAlarm.repeatPattern !== newAlarm.repeatPattern ||
    JSON.stringify(oldAlarm.repeatDays) !== JSON.stringify(newAlarm.repeatDays)
  );
};

export const formatNotificationTime = (date: Date, language: string): string => {
  return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
