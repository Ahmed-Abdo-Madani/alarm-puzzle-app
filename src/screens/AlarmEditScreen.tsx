import React, { useState, useEffect, useLayoutEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { FadeInView } from '../components/animations/FadeInView';
import { mediumImpact } from '../utils/haptics';

// ...

export const AlarmEditScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { t } = useTranslation();
  const alarmId = route.params?.alarmId;

  const [time, setTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    let h = now.getHours();
    let m = minutes;
    if (m >= 60) {
      m = 0;
      h += 1;
    }
    return formatAlarmTime(h % 24, m);
  });
  const [label, setLabel] = useState('');
  const [repeatPattern, setRepeatPattern] = useState<RepeatPattern>('once');
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [settings, setSettings] = useState<AlarmSettings>(DEFAULT_SETTINGS);
  const [snoozeSettings, setSnoozeSettings] = useState<SnoozeSettings>(DEFAULT_SNOOZE);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(!!alarmId);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (alarmId) {
      loadAlarm();
    }
    return () => {
      AudioService.stopSound();
    };
  }, [alarmId]);

  const loadAlarm = async () => {
    try {
      const alarm = await AlarmService.getAlarmById(alarmId!);
      if (alarm) {
        setTime(alarm.time);
        setLabel(alarm.label);
        setRepeatPattern(alarm.repeatPattern);
        setRepeatDays(alarm.repeatDays || []);
        setSettings(alarm.settings);
        setSnoozeSettings(alarm.snoozeSettings);
      }
    } catch (error) {
      console.error('Failed to load alarm:', error);
      Alert.alert(t('common.error'), t('alarm.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    const alarmData: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'> = {
      time,
      label: label.trim() || t('alarm.newAlarm'),
      enabled: true,
      repeatPattern,
      repeatDays,
      settings,
      snoozeSettings,
    };

    const validation = validateAlarm(alarmData);
    if (!validation.valid) {
      Alert.alert(t('common.error'), t(validation.errors[0]));
      return;
    }

    setIsSaving(true);
    try {
      if (alarmId) {
        await AlarmService.updateAlarm(alarmId, alarmData);
      } else {
        await AlarmService.createAlarm(alarmData);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save alarm:', error);
      Alert.alert(t('common.error'), t('alarm.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    mediumImpact();
    if (isPreviewing) {
      await AudioService.stopSound();
      setIsPreviewing(false);
    } else {
      try {
        await AudioService.loadSound(settings.soundUri);
        
        Alert.alert(
          t('alarm.preview'),
          `${t('alarm.time')}: ${time}\n${t('alarm.repeat')}: ${t(`alarm.repeat${repeatPattern.charAt(0).toUpperCase() + repeatPattern.slice(1)}`)}`,
          [
            {
              text: t('sound.stopPreview'),
              onPress: async () => {
                await AudioService.stopSound();
                setIsPreviewing(false);
              }
            }
          ]
        );

        if (settings.gradualVolume) {
          await AudioService.startGradualVolumeIncrease(settings.volume, 5000);
        } else {
          await AudioService.playSound(settings.volume);
        }
        setIsPreviewing(true);
      } catch (error) {
        console.error('Preview error', error);
        Alert.alert(t('common.error'), t('sound.previewError'));
      }
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: alarmId ? t('alarm.editAlarm') : t('alarm.newAlarm'),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text color="primary" tx="common.cancel" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text color="primary" tx="common.save" style={{ fontWeight: 'bold' }} />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, alarmId, t, handleSave, isSaving]);

  if (loading) return null;

  return (
    <FadeInView style={styles.container} duration={500}>
      <ScrollView contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.timeSection}
        onPress={() => setShowTimePicker(true)}
      >
        <Text variant="h1" color="primary" style={styles.timeText}>
          {time}
        </Text>
      </TouchableOpacity>

      <RNView style={styles.section}>
        <Text variant="body" tx="alarm.label" style={styles.sectionTitle} />
        <TextInput
          style={[styles.input, textAlign()]}
          value={label}
          onChangeText={setLabel}
          placeholder={t('alarm.label')}
          placeholderTextColor={colors.textSecondary}
        />
      </RNView>

      <RNView style={styles.section}>
        <Text variant="body" tx="alarm.repeat" style={styles.sectionTitle} />
        <RepeatSelector
          repeatPattern={repeatPattern}
          repeatDays={repeatDays}
          onChange={(pattern, days) => {
            setRepeatPattern(pattern);
            setRepeatDays(days || []);
          }}
        />
      </RNView>

      <RNView style={styles.section}>
        <ChallengeConfigCard
          title={t('challenges.dismissChallenge')}
          config={settings.dismissChallenge}
          onChange={(config) => setSettings({ ...settings, dismissChallenge: config })}
        />
        
        <ChallengeConfigCard
          title={t('challenges.snoozeChallenge')}
          config={snoozeSettings.challengeConfig}
          onChange={(config) => setSnoozeSettings({ ...snoozeSettings, challengeConfig: config })}
        />
        
        <SoundPickerComponent
          soundUri={settings.soundUri}
          soundName={settings.soundName}
          onChange={(uri, name) => setSettings({ ...settings, soundUri: uri, soundName: name })}
        />

        <RNView style={styles.settingRow}>
          <RNView style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('sound.gradualVolume')}</Text>
            <Text style={styles.settingDescription}>{t('sound.gradualVolumeDescription')}</Text>
          </RNView>
          <Switch
            value={settings.gradualVolume}
            onValueChange={(value) => setSettings({ ...settings, gradualVolume: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </RNView>
      </RNView>

      <Button
        tx={isPreviewing ? 'sound.stopPreview' : 'alarm.preview'}
        variant="outline"
        onPress={handlePreview}
        style={styles.previewButton}
      />

      {time ? (
        <TimePickerModal
          visible={showTimePicker}
          initialTime={time}
          onConfirm={(newTime) => {
            setTime(newTime);
            setShowTimePicker(false);
          }}
          onCancel={() => setShowTimePicker(false)}
        />
      ) : null}
    </ScrollView>
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  timeSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  timeText: {
    fontSize: 64,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
    ...paddingHorizontal(spacing.xs),
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewButton: {
    marginTop: spacing.xl,
  },
  settingRow: {
    ...flexRow(),
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
    ...textAlign(),
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    ...textAlign(),
  },
});
