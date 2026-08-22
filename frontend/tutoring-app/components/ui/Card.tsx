import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { C, R } from '@/constants/theme';

type AccentVariant = 'info' | 'streak' | 'league' | 'main';

const ACCENT_COLOR: Record<AccentVariant, string> = {
  info:   C.teal,
  streak: C.coral,
  league: C.purple,
  main:   C.amber,
};

interface CardProps {
  children: React.ReactNode;
  accent?: AccentVariant;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, accent, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {accent && (
        <View style={[styles.accentBar, { backgroundColor: ACCENT_COLOR[accent] }]} />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: R.lg,
    borderWidth: 1.5,
    padding: 18,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});
