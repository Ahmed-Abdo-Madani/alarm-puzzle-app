import { I18nManager } from 'react-native';

export const paddingHorizontal = (value: number) => ({
  paddingStart: value,
  paddingEnd: value,
});

export const marginHorizontal = (value: number) => ({
  marginStart: value,
  marginEnd: value,
});

export const flexRow = () => ({
  flexDirection: (I18nManager.isRTL ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
});

export const textAlign = () => ({
  textAlign: (I18nManager.isRTL ? 'right' : 'left') as 'left' | 'right',
});

export const commonStyles = {
  get row() { return flexRow(); },
  get text() { return textAlign(); },
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0', // colors.background
  },
};
