import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { AlarmListScreen } from '../screens/AlarmListScreen';
import { AlarmEditScreen } from '../screens/AlarmEditScreen';
import { AlarmRingingScreen } from '../screens/AlarmRingingScreen';
import { TestScreen } from '../screens/TestScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme';

const TabNavigator = createBottomTabNavigator({
  screens: {
    AlarmList: {
      screen: AlarmListScreen,
      options: {
        title: 'Alarms',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>⏰</Text>
        ),
      },
    },
    Settings: {
      screen: SettingsScreen,
      options: {
        title: 'Settings',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>⚙️</Text>
        ),
      },
    },
    Test: {
      screen: TestScreen,
      options: {
        title: 'Test',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>🧪</Text>
        ),
      },
    },
  },
  screenOptions: {
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerTintColor: colors.surface,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
  },
});

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Tabs',
  screens: {
    Tabs: {
      screen: TabNavigator,
      options: {
        headerShown: false,
      },
    },
    AlarmEdit: {
      screen: AlarmEditScreen,
      options: {
        presentation: 'modal',
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.surface,
      },
    },
    AlarmRinging: {
      screen: AlarmRingingScreen,
      options: {
        presentation: 'fullScreenModal',
        headerShown: false,
        gestureEnabled: false,
        animation: 'fade',
      },
    },
  },
});

export const RootNavigator = createStaticNavigation(RootStack);
