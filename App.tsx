import 'react-native-reanimated';
import './src/config/i18n';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, I18nManager, Alert, View, ActivityIndicator } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import i18n from './src/config/i18n';
import { setupRTL } from './src/utils/rtl';
import { RootNavigator } from './src/navigation/RootNavigator';
import { UserSettingsService } from './src/services/UserSettingsService';
import { NotificationPermissionService } from './src/services/NotificationPermissionService';
import { NotificationChannelService } from './src/services/NotificationChannelService';
import { BackgroundTaskService } from './src/services/BackgroundTaskService';
import { AlarmService } from './src/services/AlarmService';
import { navigationRef, navigate } from './src/navigation/navigationRef';
import { useAppFonts } from './src/config/fonts';
import { theme } from './src/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    const initApp = async () => {
      try {
        const settings = await UserSettingsService.getUserSettings();
        if (settings.language !== i18n.language) {
          await i18n.changeLanguage(settings.language);
        }
        setupRTL();

        // Initialize notifications
        await NotificationChannelService.configureChannels();
        const { granted } = await NotificationPermissionService.requestPermissions();
        
        if (!granted) {
          Alert.alert(
            i18n.t('notifications.permissionDeniedTitle'),
            i18n.t('notifications.permissionDenied')
          );
        }

        await BackgroundTaskService.registerTasks();
        
        // Reschedule active alarms
        await AlarmService.rescheduleActiveAlarms();
      } catch (error) {

        console.error('Failed to initialize app settings:', error);
        setupRTL(); // Fallback to default RTL setup
      }
    };

    initApp();

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const alarmId = response.notification.request.content.data.alarmId as string;
      if (alarmId) {
        console.log('Navigating to ringing screen for alarm:', alarmId);
        navigate('AlarmRinging', { alarmId });
      }
    });

    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      const alarmId = notification.request.content.data.alarmId as string;
      if (alarmId) {
        navigate('AlarmRinging', { alarmId });
      }
    });

    return () => {
      subscription.remove();
      foregroundSubscription.remove();
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <RootNavigator ref={navigationRef} />
      <StatusBar style="auto" />
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',

    alignItems: 'center',
    justifyContent: 'center',
  },
});
