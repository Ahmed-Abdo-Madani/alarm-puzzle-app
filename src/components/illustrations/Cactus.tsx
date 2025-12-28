import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

interface CactusProps {
  size?: number;
  color?: string;
}

export const Cactus: React.FC<CactusProps> = ({ 
  size = 100, 
  color = colors.primary 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path 
        d="M50 90 V 20 C 50 10, 60 10, 60 20 V 50 H 70 V 35 C 70 30, 80 30, 80 35 V 55 C 80 60, 75 60, 70 60 H 60 V 90 H 50 Z M 40 90 V 60 H 30 C 25 60, 20 60, 20 55 V 40 C 20 35, 30 35, 30 40 V 50 H 40 V 90 H 50" 
        fill={color} 
      />
    </Svg>
  );
};
