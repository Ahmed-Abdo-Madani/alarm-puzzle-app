export type RootStackParamList = {
  Home: undefined;
  AlarmList: undefined;
  AlarmEdit: { alarmId?: string };
  Settings: undefined;
  AlarmRinging: { alarmId: string };
};
