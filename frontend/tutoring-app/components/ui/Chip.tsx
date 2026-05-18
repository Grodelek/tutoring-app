import React from 'react';
import { Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { C, R, T } from '@/constants/theme';
const DARK_TEXT_ON: Set<string> = new Set([C.amber, C.gold]);

const DARKER: Record<string, string> = {
  [C.amber]:  C.amberDark,
  [C.coral]:  C.coralDark,
  [C.gold]:   '#C9A020',
  [C.teal]:   '#2E8AA3',
  [C.purple]: '#7A5FCC',
  [C.green]:  C.greenDark,
};

interface ChipProps {
  label: string;
  color: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, color, active = false, onPress, style }: ChipProps) {
  if (active) {
    const shadowColor = DARKER[color] ?? color;
    const textColor = DARK_TEXT_ON.has(color) ? '#241608' : C.text;

    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.base,
          {
            backgroundColor:  color,
            borderTopColor:   color,
            borderLeftColor:  color,
            borderRightColor: color,
            borderBottomColor: shadowColor,
            borderTopWidth:    2,
            borderLeftWidth:   2,
            borderRightWidth:  2,
            borderBottomWidth: 5,
          },
          style,
        ]}
      >
        <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={[styles.base, styles.inactive, style]}>
      <Text style={[styles.label, styles.inactiveLabel]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: R.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  inactive: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: C.border,
  },
  label: {
    fontFamily:    T.family.bold,
    fontSize:      13,
    fontWeight:    T.weight.bold,
    letterSpacing: 0.3,
  },
  inactiveLabel: {
    color: C.textDim,
  },
});
