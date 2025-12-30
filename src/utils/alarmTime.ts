import { TFunction } from 'i18next';
import { Alarm, RepeatPattern } from '../types/alarm';

export const parseAlarmTime = (timeString: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time format');
  }
  return { hours, minutes };
};

export const formatAlarmTime = (hours: number, minutes: number): string => {
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time values');
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const getRepeatDaysArray = (pattern: RepeatPattern, customDays?: number[]): number[] => {
  switch (pattern) {
    case 'daily':
      return [0, 1, 2, 3, 4, 5, 6];
    case 'weekdays':
      return [1, 2, 3, 4, 5];
    case 'weekends':
      return [0, 6];
    case 'custom':
      return customDays || [];
    case 'once':
    default:
      return [];
  }
};

export const getNextOccurrence = (alarm: Alarm, fromDate: Date = new Date()): Date | null => {
  const { hours, minutes } = parseAlarmTime(alarm.time);
  const nextDate = new Date(fromDate);
  nextDate.setHours(hours, minutes, 0, 0);

  if (alarm.repeatPattern === 'once') {
    // If time has passed today, schedule for tomorrow
    if (nextDate <= fromDate) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    return nextDate;
  }

  const repeatDays = getRepeatDaysArray(alarm.repeatPattern, alarm.repeatDays);
  
  // If it's today and time hasn't passed, and today is in repeat days
  if (nextDate > fromDate && (alarm.repeatPattern === 'daily' || repeatDays.includes(fromDate.getDay()))) {
    return nextDate;
  }

  // Find next day
  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date(nextDate);
    checkDate.setDate(checkDate.getDate() + i);
    if (alarm.repeatPattern === 'daily' || repeatDays.includes(checkDate.getDay())) {
      return checkDate;
    }
  }

  return null;
};

export const isAlarmTimeInFuture = (timeString: string): boolean => {
  const { hours, minutes } = parseAlarmTime(timeString);
  const now = new Date();
  const alarmTime = new Date();
  alarmTime.setHours(hours, minutes, 0, 0);
  return alarmTime > now;
};

export const getRepeatLabel = (alarm: Alarm, t: TFunction): string => {
  switch (alarm.repeatPattern) {
    case 'once':
      return t('alarm.repeatOnce', 'Once');
    case 'daily':
      return t('alarm.repeatDaily', 'Every day');
    case 'weekdays':
      return t('alarm.repeatWeekdays', 'Weekdays');
    case 'weekends':
      return t('alarm.repeatWeekends', 'Weekends');
    case 'custom':
      if (!alarm.repeatDays || alarm.repeatDays.length === 0) return t('alarm.repeatOnce', 'Once');
      if (alarm.repeatDays.length === 7) return t('alarm.repeatDaily', 'Every day');
      
      const dayNames = [
        t('common.days.sun', 'Sun'),
        t('common.days.mon', 'Mon'),
        t('common.days.tue', 'Tue'),
        t('common.days.wed', 'Wed'),
        t('common.days.thu', 'Thu'),
        t('common.days.fri', 'Fri'),
        t('common.days.sat', 'Sat'),
      ];
      return alarm.repeatDays
        .sort((a, b) => a - b)
        .map(day => dayNames[day])
        .join(', ');
    default:
      return t('alarm.repeatOnce', 'Once');
  }
};

/**
 * Get the next N occurrences for a repeating alarm
 * Used for Android which doesn't support CALENDAR trigger type
 */
export const getNextOccurrencesForRepeating = (alarm: Alarm, count: number = 7): Date[] => {
  const occurrences: Date[] = [];
  const { hours, minutes } = parseAlarmTime(alarm.time);
  const now = new Date();
  
  if (alarm.repeatPattern === 'daily') {
    // For daily alarms, schedule next 'count' days
    for (let i = 0; i < count; i++) {
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + i);
      nextDate.setHours(hours, minutes, 0, 0);
      
      // Skip if this time has already passed today
      if (nextDate > now) {
        occurrences.push(nextDate);
      } else if (i === 0) {
        // If today's time passed, add tomorrow
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(hours, minutes, 0, 0);
        occurrences.push(tomorrow);
      }
    }
  } else {
    // For weekdays, weekends, custom patterns
    const repeatDays = getRepeatDaysArray(alarm.repeatPattern, alarm.repeatDays);
    
    if (repeatDays.length === 0) {
      // Fallback to next occurrence
      const next = getNextOccurrence(alarm);
      if (next) occurrences.push(next);
      return occurrences;
    }
    
    let daysChecked = 0;
    let currentDate = new Date(now);
    
    while (occurrences.length < count && daysChecked < 14) {
      currentDate = new Date(now);
      currentDate.setDate(now.getDate() + daysChecked);
      currentDate.setHours(hours, minutes, 0, 0);
      
      // Check if this day matches the repeat pattern
      if (repeatDays.includes(currentDate.getDay())) {
        // Only add if it's in the future
        if (currentDate > now) {
          occurrences.push(new Date(currentDate));
        }
      }
      
      daysChecked++;
    }
  }
  
  return occurrences;
};
