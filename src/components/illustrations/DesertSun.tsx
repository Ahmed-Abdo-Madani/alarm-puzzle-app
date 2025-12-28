import React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { colors } from '../../theme';

interface DesertSunProps {
  size?: number;
  color?: string;
}

export const DesertSun: React.FC<DesertSunProps> = ({ 
  size = 100, 
  color = colors.primary 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="25" fill={color} />
      <G stroke={color} strokeWidth="4" strokeLinecap="round">
        <Path d="M50 10 V20" />
        <Path d="M50 80 V90" />
        <Path d="M10 50 H20" />
        <Path d="M80 50 H90" />
        <Path d="M21.7 21.7 L28.8 28.8" />
        <Path d="M71.2 71.2 L78.3 78.3" />
        <Path d="M21.7 78.3 L28.8 71.2" />
        <Path d="M71.2 28.8 L78.3 21.7" />
      </G>
    </Svg>
  );
};
