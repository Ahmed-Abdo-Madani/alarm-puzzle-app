# Contributing to Puzzle Alarm

## Coding Standards

- **TypeScript**: Use strict mode. Define types for all props and state.
- **Linting**: Follow ESLint and Prettier rules. Run `npm run lint` before committing.
- **Components**: Use the base components in `src/components/` which are already RTL-aware.
- **i18n**: All user-facing strings must be added to `src/locales/en.json` and `src/locales/ar.json`. Use camelCase for keys.

## RTL Guidelines

When creating new layouts:
1. Use `flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'` for horizontal layouts.
2. Use `textAlign: I18nManager.isRTL ? 'right' : 'left'` for text alignment.
3. Prefer logical properties (`paddingStart`, `borderTopEndRadius`, etc.).
4. Test all changes in both English (LTR) and Arabic (RTL) modes.

## Component Template

```tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from './View';
import { Text } from './Text';
import { spacing } from '../theme';

export const MyComponent = () => {
  return (
    <View padding="md">
      <Text tx="common.save" variant="h2" />
    </View>
  );
};
```
