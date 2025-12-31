import { NativeModules, Platform, Linking } from 'react-native';

const { AlarmModule } = NativeModules;

export interface NativeAlarmService {
  scheduleAlarm: (alarmId: string, timestamp: number) => Promise<string>;
  cancelAlarm: (alarmId: string) => Promise<boolean>;
  dismissAlarmNotification: (alarmId: string) => Promise<boolean>;
  canScheduleExactAlarms: () => Promise<boolean>;
  openExactAlarmSettings: () => Promise<boolean>;
  getPendingAlarmId: () => Promise<string | null>;
  disableAlarmMode: () => Promise<boolean>;
}

const NativeAlarmServiceImpl: NativeAlarmService = {
  async scheduleAlarm(alarmId: string, timestamp: number): Promise<string> {
    if (Platform.OS === 'android' && AlarmModule) {
      return AlarmModule.scheduleAlarm(alarmId, timestamp);
    }
    throw new Error('Native alarm module not available');
  },

  async cancelAlarm(alarmId: string): Promise<boolean> {
    if (Platform.OS === 'android' && AlarmModule) {
      return AlarmModule.cancelAlarm(alarmId);
    }
    throw new Error('Native alarm module not available');
  },

  async dismissAlarmNotification(alarmId: string): Promise<boolean> {
    if (Platform.OS === 'android' && AlarmModule) {
      return AlarmModule.dismissAlarmNotification(alarmId);
    }
    return true; // No-op on iOS
  },

  async canScheduleExactAlarms(): Promise<boolean> {
    if (Platform.OS === 'android' && AlarmModule) {
      return AlarmModule.canScheduleExactAlarms();
    }
    return true; // iOS doesn't have this restriction
  },

  async openExactAlarmSettings(): Promise<boolean> {
    if (Platform.OS === 'android' && AlarmModule) {
      return AlarmModule.openExactAlarmSettings();
    }
    return false;
  },

  async getPendingAlarmId(): Promise<string | null> {
    if (Platform.OS === 'android' && AlarmModule) {
      return AlarmModule.getPendingAlarmId();
    }
    return null;
  },

  async disableAlarmMode(): Promise<boolean> {
    if (Platform.OS === 'android' && AlarmModule) {
      return AlarmModule.disableAlarmMode();
    }
    return true; // No-op on iOS
  },
};

export default NativeAlarmServiceImpl;

// Helper to check initial URL for alarm deep links
export async function getInitialAlarmId(): Promise<string | null> {
  try {
    // First check for pending alarm from native side
    const pendingId = await NativeAlarmServiceImpl.getPendingAlarmId();
    if (pendingId) {
      return pendingId;
    }

    // Then check Linking for deep links
    const url = await Linking.getInitialURL();
    if (url) {
      const match = url.match(/puzzlealarm:\/\/alarm\/(.+)/);
      if (match) {
        return match[1];
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting initial alarm ID:', error);
    return null;
  }
}

// Listen for alarm deep links
export function addAlarmLinkListener(callback: (alarmId: string) => void): () => void {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    const match = url.match(/puzzlealarm:\/\/alarm\/(.+)/);
    if (match) {
      callback(match[1]);
    }
  });

  return () => subscription.remove();
}
