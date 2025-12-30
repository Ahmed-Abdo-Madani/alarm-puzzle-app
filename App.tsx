// import 'react-native-reanimated';
import './src/config/i18n';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, I18nManager, Alert, View, ActivityIndicator, Platform, Linking } from 'react-native';
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
import { getInitialAlarmId, addAlarmLinkListener } from './src/services/NativeAlarmService';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isAlarm = notification.request.content.data?.isAlarm;
    
    // For alarms, navigate immediately to ringing screen
    if (isAlarm) {
      const alarmId = notification.request.content.data.alarmId as string;
      if (alarmId) {
        // Small delay to ensure navigation is ready
        setTimeout(() => {
          navigate('AlarmRinging', { alarmId });
        }, 100);
      }
    }
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.MAX,
    };
  },
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
        
        // Check if app was launched from alarm
        const initialAlarmId = await getInitialAlarmId();
        if (initialAlarmId) {
          // Extract the base alarm ID (remove the occurrence suffix like _0, _1, etc.)
          const baseAlarmId = initialAlarmId.includes('_') 
            ? initialAlarmId.substring(0, initialAlarmId.lastIndexOf('_'))
            : initialAlarmId;
          console.log('App launched from alarm:', baseAlarmId);
          setTimeout(() => {
            navigate('AlarmRinging', { alarmId: baseAlarmId });
          }, 500);
        }
      } catch (error) {

        console.error('Failed to initialize app settings:', error);
        setupRTL(); // Fallback to default RTL setup
      }
    };

    initApp();

    // Listen for alarm deep links
    const removeAlarmListener = addAlarmLinkListener((alarmId) => {
      const baseAlarmId = alarmId.includes('_') 
        ? alarmId.substring(0, alarmId.lastIndexOf('_'))
        : alarmId;
      console.log('Received alarm deep link:', baseAlarmId);
      navigate('AlarmRinging', { alarmId: baseAlarmId });
    });

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
      removeAlarmListener();
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
