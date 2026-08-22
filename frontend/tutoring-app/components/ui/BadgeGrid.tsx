import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, T } from '@/constants/theme';

export interface BadgeItem {
  id: string;
  name: string;
  /** Primary accent color, e.g. C.amber */
  color: string;
  /** Darker variant for border + shadow, e.g. C.amberDark */
  darkColor: string;
  unlocked: boolean;
  /** When provided, renders ×N label in bottom-right corner */
  level?: number;
}

interface BadgeGridProps {
  badges: BadgeItem[];
  style?: StyleProp<ViewStyle>;
}

function BadgeCell({ badge, style }: { badge: BadgeItem; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.cell, style]}>
      {badge.unlocked ? (
        // Outer wrapper carries the shadow so borderRadius can clip the gradient
        <View style={[styles.shadowWrap, { shadowColor: badge.darkColor }]}>
          <LinearGradient
            colors={[badge.color, badge.darkColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.badge, { borderColor: badge.darkColor }]}
          >
            <MaterialCommunityIcons name="trophy" size={26} color="#fff" />
          </LinearGradient>
          {badge.level !== undefined && (
            <View style={styles.levelTag}>
              <Text style={styles.levelText}>×{badge.level}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.badge, styles.badgeLocked]}>
          <MaterialCommunityIcons name="trophy-outline" size={26} color={C.textFaint} />
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>{badge.name}</Text>
    </View>
  );
}

export function BadgeGrid({ badges, style }: BadgeGridProps) {
  const rows: BadgeItem[][] = [];
  for (let i = 0; i < badges.length; i += 3) {
    rows.push(badges.slice(i, i + 3));
  }

  return (
    <View style={[styles.grid, style]}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((badge) => (
            <BadgeCell key={badge.id} badge={badge} style={styles.colFlex} />
          ))}
          {row.length < 3 &&
            Array.from({ length: 3 - row.length }, (_, i) => (
              <View key={`pad-${i}`} style={styles.colFlex} />
            ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  colFlex: {
    flex: 1,
  },
  cell: {
    alignItems: 'center',
    gap: 6,
  },
  // Outer shadow carrier — overflow visible so iOS shadow bleeds out
  shadowWrap: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  badgeLocked: {
    backgroundColor: C.bgDeep,
    borderColor: C.border,
    opacity: 0.4,
  },
  levelTag: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  levelText: {
    fontSize: 9,
    fontFamily: T.family.black,
    fontWeight: '900',
    color: C.bg,
  },
  name: {
    fontSize: 11,
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    color: C.textDim,
    textAlign: 'center',
  },
});
