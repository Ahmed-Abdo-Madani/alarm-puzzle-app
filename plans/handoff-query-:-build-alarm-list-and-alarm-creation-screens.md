I have the following user query that I want you to help me with. Please implement the requested functionality following best practices.

Alarm Management UI:
`AlarmListScreen`: alarms list, toggles, time/weekday labels (`image-2.png`).
`AlarmEditScreen`: time picker, repeat selector, name input, save/preview (`image-3.png`).
FAB for new alarms, navigation between screens.
Desert theme styles; **use `useTranslation()`, `t('key')` for text, RTL styles (`paddingStart/End`, `flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'`).