import React from 'react';
import { View as RNView, ViewProps as RNViewProps, StyleSheet } from 'react-native';
import { flexRow } from '../theme/styles';
import { spacing } from '../theme';

interface ViewProps extends RNViewProps {
  row?: boolean;
  padding?: keyof typeof spacing;
  margin?: keyof typeof spacing;
}

export const View: React.FC<ViewProps> = ({
  row,
  padding,
  margin,
  style,
  ...rest
}) => {
  return (
    <RNView
      style={[
        row && flexRow(),
        padding && { padding: spacing[padding] },
        margin && { margin: spacing[margin] },
        style,
      ]}
      {...rest}
    />
  );
};
