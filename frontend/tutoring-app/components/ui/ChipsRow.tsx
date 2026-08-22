import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { C, T } from '@/constants/theme';

/** Converts a #RRGGBB hex to rgba(..., alpha). Assumes clean 6-char hex. */
function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export interface StatChipItem {
  /** Any 14×14 renderable — typically <MaterialCommunityIcons size={14} color={color} /> */
  icon: React.ReactNode;
  count: number;
  /** Hex accent color, e.g. C.coral. Used for text and 33%-alpha border. */
  color: string;
}

interface ChipsRowProps {
  chips: StatChipItem[];
  style?: StyleProp<ViewStyle>;
}

function StatChip({ icon, count, color }: StatChipItem) {
  return (
    <View style={[styles.pill, { borderColor: hexAlpha(color, 0.33) }]}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={[styles.count, { color }]}>{count}</Text>
    </View>
  );
}

export function ChipsRow({ chips, style }: ChipsRowProps) {
  return (
    <View style={[styles.row, style]}>
      {chips.map((chip, i) => (
        <StatChip key={i} {...chip} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.surface,
    borderWidth: 1.5,
  },
  iconWrap: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 14,
  },
});
