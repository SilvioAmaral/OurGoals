import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { STATIC, font, radius } from '../theme';

const LABELS = ['Not for us', 'Curious about it', 'Okay with it', 'Really want it', "Can't wait!!"];

interface Props {
  value: number | null;
  onChange: (v: number) => void;
  large?: boolean;
}

export function RatingPills({ value, onChange, large = false }: Props) {
  const h = large ? 52 : 34;
  const fs = large ? 18 : 14;
  const br = large ? 12 : 9;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(n => {
        const selected = value === n;
        const bg = selected ? STATIC.rating[n - 1] : STATIC.track;
        const textColor = selected && n >= 4 ? '#fff' : STATIC.textPrimary;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={[styles.pill, { height: h, borderRadius: br, backgroundColor: bg }]}
          >
            <Text style={{ fontFamily: font.sansBold, fontSize: fs, color: textColor }}>{n}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ratingLabel(value: number) {
  return LABELS[value - 1] ?? '';
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  pill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
