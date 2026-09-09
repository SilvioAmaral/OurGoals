import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { font, STATIC } from '../theme';

interface Props {
  percent: number;
  size: number;
  stroke: number;
  color: string;
  labelSize?: number;
  label?: string;
}

export function ProgressRing({ percent, size, stroke, color, labelSize = 10, label }: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={STATIC.track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2} originY={size / 2}
        />
      </Svg>
      <Text style={{ fontFamily: font.serif, fontSize: labelSize, fontWeight: '700', color: STATIC.textPrimary }}>
        {percent}%
      </Text>
      {label && (
        <Text style={{ fontFamily: font.sans, fontSize: 10, color: STATIC.textMuted, marginTop: 2 }}>
          {label}
        </Text>
      )}
    </View>
  );
}
