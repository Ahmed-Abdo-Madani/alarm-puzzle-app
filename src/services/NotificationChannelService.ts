import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from '../config/i18n';

export const ALARM_CHANNEL_ID = 'alarm-channel';

export const NotificationChannelService = {
  async configureChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
        name: i18n.t('notifications.channelName'),
        description: i18n.t('notifications.channelDescription'),
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF8C42',
        sound: 'default_alarm', // Android uses raw resource name without extension
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }
  },
};
