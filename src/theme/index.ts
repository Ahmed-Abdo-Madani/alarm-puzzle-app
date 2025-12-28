import { I18nManager } from 'react-native';

export const colors = {
  primary: '#FF8C42',      // Desert orange
  secondary: '#FFB84D',    // Light orange
  background: '#FFF8F0',   // Cream
  surface: '#FFFFFF',
  text: '#2C2C2C',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#D32F2F',
  success: '#388E3C',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const fontFamily = I18nManager.isRTL ? 'Cairo_400Regular' : undefined;
const fontFamilyBold = I18nManager.isRTL ? 'Cairo_700Bold' : undefined;

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    fontFamily: fontFamilyBold,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    fontFamily: fontFamilyBold,
  },
  body: {
    fontSize: 16,
    fontFamily,
  },
  caption: {
    fontSize: 12,
    fontFamily,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
};

