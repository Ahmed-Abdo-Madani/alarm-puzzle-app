import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { UserSettingsService } from '../services/UserSettingsService';
import { UserSettings } from '../types/user';
import { SnoozeSettings, PuzzleConfig, PuzzleType, DifficultyLevel } from '../types/alarm';
import { SettingsRow } from '../components/SettingsRow';
import { NumberPicker } from '../components/NumberPicker';
import { ChallengeConfigCard } from '../components/ChallengeConfigCard';
import { Text } from '../components/Text';
import { colors, spacing, typography } from '../theme';
import { flexRow, textAlign } from '../theme/styles';

export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSettings();
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const loadSettings = async () => {
    const userSettings = await UserSettingsService.getUserSettings();
    setSettings(userSettings);
    setLoading(false);
  };

  const handleSave = (newSettings: UserSettings, immediate = false) => {
    setSettings(newSettings);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (immediate) {
      UserSettingsService.updateUserSettings(newSettings);
    } else {
      saveTimeoutRef.current = setTimeout(() => {
        UserSettingsService.updateUserSettings(newSettings);
      }, 500);
    }
  };

  const handleLanguageChange = async (lang: 'en' | 'ar') => {
    if (!settings) return;
    const newSettings = { ...settings, language: lang };
    setSettings(newSettings);
    await UserSettingsService.setLanguage(lang);
  };

  const updateSnoozeSettings = (updates: Partial<SnoozeSettings>) => {
    if (!settings) return;
    const newSnoozeSettings = { ...settings.defaultSnoozeSettings, ...updates };
    const newSettings = { ...settings, defaultSnoozeSettings: newSnoozeSettings };
    handleSave(newSettings);
  };

  if (loading || !settings) {
    return <View style={styles.container} />;
  }

  const { defaultSnoozeSettings } = settings;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
      <View style={styles.card}>
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              settings.language === 'en' && styles.languageButtonActive,
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text
              style={[
                styles.languageText,
                settings.language === 'en' && styles.languageTextActive,
              ]}
            >
              {t('settings.english')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              settings.language === 'ar' && styles.languageButtonActive,
            ]}
            onPress={() => handleLanguageChange('ar')}
          >
            <Text
              style={[
                styles.languageText,
                settings.language === 'ar' && styles.languageTextActive,
              ]}
            >
              {t('settings.arabic')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('settings.snoozeSettings')}</Text>
      <View style={styles.card}>
        <SettingsRow
          title={t('settings.snoozeDuration')}
          description={t('settings.snoozeDurationDescription')}
          rightComponent={
            <NumberPicker
              value={defaultSnoozeSettings.duration}
              min={1}
              max={30}
              onChange={(val) => updateSnoozeSettings({ duration: val })}
              suffix={t('settings.minutes')}
            />
          }
        />

        <SettingsRow
          title={t('settings.maxSnoozeCount')}
          description={t('settings.maxSnoozeCountDescription')}
          rightComponent={
            <NumberPicker
              value={defaultSnoozeSettings.maxCount}
              min={1}
              max={10}
              onChange={(val) => updateSnoozeSettings({ maxCount: val })}
              suffix={t('settings.times')}
            />
          }
        />

        <SettingsRow
          title={t('settings.autoShorten')}
          description={t('settings.autoShortenDescription')}
          rightComponent={
            <Switch
              value={defaultSnoozeSettings.autoShorten}
              onValueChange={(val) => updateSnoozeSettings({ autoShorten: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          }
        />

        {defaultSnoozeSettings.autoShorten && (
          <SettingsRow
            title={t('settings.shortenBy')}
            description={t('settings.shortenByDescription')}
            rightComponent={
              <NumberPicker
                value={defaultSnoozeSettings.shortenBy}
                min={1}
                max={10}
                onChange={(val) => updateSnoozeSettings({ shortenBy: val })}
                suffix={t('settings.minutes')}
              />
            }
          />
        )}

        <SettingsRow
          title={t('settings.requireChallenge')}
          description={t('settings.requireChallengeDescription')}
          rightComponent={
            <Switch
              value={defaultSnoozeSettings.requireChallenge}
              onValueChange={(val) => {
                // If enabling, ensure there's a config
                const updates: Partial<SnoozeSettings> = { requireChallenge: val };
                if (val && !defaultSnoozeSettings.challengeConfig) {
                  updates.challengeConfig = {
                    type: PuzzleType.MATH,
                    difficulty: DifficultyLevel.EASY,
                    enabled: true,
                  };
                }
                updateSnoozeSettings(updates);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          }
        />

        {defaultSnoozeSettings.requireChallenge && (
          <>
            <View style={styles.challengeConfigContainer}>
              <ChallengeConfigCard
                title={t('challenges.snoozeChallenge')}
                config={defaultSnoozeSettings.challengeConfig}
                onChange={(config) => updateSnoozeSettings({ challengeConfig: config })}
              />
            </View>

            <SettingsRow
              title={t('settings.progressiveDifficulty')}
              description={t('settings.progressiveDifficultyDescription')}
              rightComponent={
                <Switch
                  value={defaultSnoozeSettings.progressiveDifficulty || false}
                  onValueChange={(val) => updateSnoozeSettings({ progressiveDifficulty: val })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              }
            />
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    ...textAlign(),
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  languageContainer: {
    ...flexRow(),
    padding: spacing.md,
  },
  languageButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  languageButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  languageText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  languageTextActive: {
    color: colors.surface,
  },
  challengeConfigContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
});
