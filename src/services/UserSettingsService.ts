import i18n from '../config/i18n';
import { UserSettings } from '../types/user';
import { StorageService, USER_SETTINGS_KEY } from './StorageService';
import { setupRTL } from '../utils/rtl';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  language: 'en',
  defaultSnoozeSettings: {
    duration: 5,
    maxCount: 3,
    requireChallenge: false,
    autoShorten: false,
    shortenBy: 1,
    progressiveDifficulty: false,
  },
  defaultAlarmSettings: {
    soundUri: 'default_sound.mp3',
    soundName: 'Default Sound',
    vibrate: true,
    volume: 0.8,
    gradualVolume: false,
  },
};

export const UserSettingsService = {
  async getUserSettings(): Promise<UserSettings> {
    const settings = await StorageService.getItem<UserSettings>(USER_SETTINGS_KEY);
    if (!settings) return DEFAULT_USER_SETTINGS;
    
    // Merge with defaults to handle missing properties
    return {
      ...DEFAULT_USER_SETTINGS,
      ...settings,
    };
  },

  async updateUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const currentSettings = await this.getUserSettings();
    const updatedSettings: UserSettings = {
      ...currentSettings,
      ...updates,
      defaultSnoozeSettings: updates.defaultSnoozeSettings
        ? { ...currentSettings.defaultSnoozeSettings, ...updates.defaultSnoozeSettings }
        : currentSettings.defaultSnoozeSettings,
      defaultAlarmSettings: updates.defaultAlarmSettings
        ? { ...currentSettings.defaultAlarmSettings, ...updates.defaultAlarmSettings }
        : currentSettings.defaultAlarmSettings,
    };

    await StorageService.setItem(USER_SETTINGS_KEY, updatedSettings);

    if (updates.language) {
      await i18n.changeLanguage(updates.language);
      setupRTL();
    }

    return updatedSettings;
  },

  async setLanguage(language: 'en' | 'ar'): Promise<void> {
    await this.updateUserSettings({ language });
  },

  async resetToDefaults(): Promise<UserSettings> {
    await StorageService.setItem(USER_SETTINGS_KEY, DEFAULT_USER_SETTINGS);
    return DEFAULT_USER_SETTINGS;
  },
};
