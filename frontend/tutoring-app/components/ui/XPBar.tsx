import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, R, T } from '@/constants/theme';

interface XPBarProps {
  level: number;
  xp: number;
  maxXp: number;
  compact?: boolean;
}

function Inner({ level, xp, maxXp }: Omit<XPBarProps, 'compact'>) {
  const pct = Math.min(Math.max(xp / maxXp, 0), 1);

  return (
    <View style={styles.row}>
      <LinearGradient
        colors={['#FFA53D', '#FF6B4A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.levelCircle}
      >
        <Text style={styles.levelText}>{level}</Text>
      </LinearGradient>

      <View style={styles.trackOuter}>
        <View style={styles.track}>
          <LinearGradient
            colors={['#FFA53D', '#FFD15C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: `${pct * 100}%` as `${number}%` }]}
          />
        </View>
      </View>

      <Text style={styles.xpText}>
        {xp}/{maxXp}
      </Text>
    </View>
  );
}

export function XPBar({ level, xp, maxXp, compact = false }: XPBarProps) {
  if (compact) return <Inner level={level} xp={xp} maxXp={maxXp} />;

  return (
    <View style={styles.pill}>
      <Inner level={level} xp={xp} maxXp={maxXp} />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    color: '#241608',
    fontFamily: T.family.black,
    fontWeight: '900',
    fontSize: 13,
  },
  trackOuter: {
    flex: 1,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
    // glow on iOS
    shadowColor: '#FFA53D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.53,
    shadowRadius: 8,
  },
  xpText: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 12,
    color: C.amber,
    fontVariant: ['tabular-nums'],
  },
});
