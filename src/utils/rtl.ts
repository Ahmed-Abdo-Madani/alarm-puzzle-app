import { I18nManager } from 'react-native';
import i18n from '../config/i18n';

export const setupRTL = () => {
  I18nManager.allowRTL(true);
  const currentLanguage = i18n.language;
  const shouldBeRTL = currentLanguage === 'ar';
  
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
  }
};

export const getFlexDirection = () => (I18nManager.isRTL ? 'row-reverse' : 'row');
export const getTextAlign = () => (I18nManager.isRTL ? 'right' : 'left');
