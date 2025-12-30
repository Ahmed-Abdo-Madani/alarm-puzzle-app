import { registerRootComponent } from 'expo';
import * as Notifications from 'expo-notifications';

import App from './App';

// Background notification handler - runs even when app is closed
Notifications.registerTaskAsync?.('BACKGROUND_NOTIFICATION_TASK');

// Set background notification handler to bring app to front
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isAlarm = notification.request.content.data?.isAlarm;
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.MAX,
    };
  },
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);