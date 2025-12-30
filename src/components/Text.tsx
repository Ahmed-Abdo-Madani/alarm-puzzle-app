import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { textAlign } from '../theme/styles';
import { colors, typography } from '../theme';

interface TextProps extends RNTextProps {
  tx?: string;
  txOptions?: Record<string, unknown>;
  variant?: keyof typeof typography;
  color?: keyof typeof colors;
}

export const Text: React.FC<TextProps> = ({
  tx,
  txOptions,
  variant = 'body',
  color = 'text',
  style,
  children,
  ...rest
}) => {
  const { t } = useTranslation();
  const i18nText = tx ? t(tx, txOptions as Record<string, string>) : children;

  const content = i18nText || children;

  return (
    <RNText
      style={[
        styles.base,
        typography[variant],
        { color: colors[color] },
        textAlign(),
        style,
      ]}
      {...rest}
    >
      {content}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    // Removed writingDirection: 'ltr' to allow RTL rendering
  },
});
