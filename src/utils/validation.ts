import { Alarm, AlarmSettings, SnoozeSettings } from '../types/alarm';
import { getNextOccurrence } from './alarmTime';

export const validateAlarmTime = (timeString: string): boolean => {
  const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeString);
};

export const validateSnoozeSettings = (settings: SnoozeSettings): boolean => {
  if (settings.challengeConfig && settings.challengeConfig.enabled) {
    if (!settings.challengeConfig.type || !settings.challengeConfig.difficulty) {
      return false;
    }
  }
  return (
    settings.duration > 0 &&
    settings.duration <= 60 &&
    settings.maxCount > 0 &&
    settings.maxCount <= 10 &&
    settings.shortenBy >= 0 &&
    settings.shortenBy < settings.duration
  );
};

export const validateAlarmSettings = (settings: AlarmSettings): boolean => {
  if (settings.dismissChallenge && settings.dismissChallenge.enabled) {
    if (!settings.dismissChallenge.type || !settings.dismissChallenge.difficulty) {
      return false;
    }
  }
  const soundUriStr = typeof settings.soundUri === 'string' ? settings.soundUri : String(settings.soundUri);
  return (
    settings.volume >= 0 &&
    settings.volume <= 1 &&
    soundUriStr.length > 0 &&
    settings.soundName.length > 0
  );
};

export const validateAlarm = (alarm: Partial<Alarm>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!alarm.time || !validateAlarmTime(alarm.time)) {
    errors.push('alarm.validation.invalidTime');
  }

  if (!alarm.label || alarm.label.trim().length === 0) {
    errors.push('alarm.validation.nameRequired');
  }

  if (!alarm.repeatPattern) {
    errors.push('alarm.validation.repeatRequired');
  }

  if (alarm.repeatPattern === 'custom' && (!alarm.repeatDays || alarm.repeatDays.length === 0)) {
    errors.push('alarm.validation.selectDay');
  }

  if (alarm.settings && !validateAlarmSettings(alarm.settings)) {
    errors.push('alarm.validation.invalidSettings');
  }

  if (alarm.snoozeSettings && !validateSnoozeSettings(alarm.snoozeSettings)) {
    errors.push('alarm.validation.invalidSnooze');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
