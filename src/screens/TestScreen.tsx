import React from 'react';
import { StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { View } from '../components/View';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { colors, spacing } from '../theme';
import RNRestart from 'react-native-restart';

export const TestScreen = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = async () => {
    const newLng = i18n.language === 'en' ? 'ar' : 'en';
    await i18n.changeLanguage(newLng);
    
    const shouldBeRTL = newLng === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
      // Restart is required for RTL changes to take effect in many cases
      setTimeout(() => {
        RNRestart.Restart();
      }, 100);
    }
  };

  return (
    <View style={styles.container} padding="md">
      <Text variant="h1" tx="alarm.title" style={styles.title} />
      
      <View row style={styles.rowExample} margin="md">
        <View style={styles.box} />
        <Text style={styles.rowText}>This is a row example</Text>
      </View>

      <Text variant="body" style={styles.description}>
        Current Language: {i18n.language.toUpperCase()}
      </Text>
      <Text variant="body" style={styles.description}>
        Is RTL: {I18nManager.isRTL ? 'Yes' : 'No'}
      </Text>

      <Button
        tx="common.edit"
        onPress={toggleLanguage}
        style={styles.button}
        text={`Switch to ${i18n.language === 'en' ? 'Arabic' : 'English'}`}
      />
      
      <View style={styles.footer}>
        <Text variant="caption">Desert Theme - Puzzle Alarm 2025</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing.lg,
    color: colors.primary,
  },
  rowExample: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  box: {
    width: 40,
    height: 40,
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  rowText: {
    marginStart: spacing.md,
    flex: 1,
  },
  description: {
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
