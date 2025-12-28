import { AlarmSettings, SnoozeSettings } from './alarm';

export interface UserSettings {
  language: 'en' | 'ar';
  defaultSnoozeSettings: SnoozeSettings;
  defaultAlarmSettings: Partial<AlarmSettings>;
  theme?: 'light' | 'dark';
}
