import React, { useRef, useEffect } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { STATIC } from '../theme';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ value, onChange }: Props) {
  const theme = useTheme();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 20] });
  const trackColor = anim.interpolate({ inputRange: [0, 1], outputRange: [STATIC.track, theme.accent] });

  return (
    <Pressable onPress={() => onChange(!value)}>
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 44, height: 26, borderRadius: 13 },
  knob: {
    position: 'absolute',
    top: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
