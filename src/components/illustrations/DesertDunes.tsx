import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../../theme';

interface DesertDunesProps {
  width?: number;
  height?: number;
  color?: string;
}

export const DesertDunes: React.FC<DesertDunesProps> = ({ 
  width = 300, 
  height = 100,
  color = colors.secondary 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 300 100" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="1" />
          <Stop offset="1" stopColor={color} stopOpacity="0.5" />
        </LinearGradient>
      </Defs>
      <Path 
        d="M0 50 C 50 20, 100 80, 150 50 C 200 20, 250 80, 300 50 V 100 H 0 Z" 
        fill="url(#grad)" 
      />
    </Svg>
  );
};
