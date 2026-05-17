import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, T } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { XPBar } from '@/components/ui/XPBar';
import { ChipsRow, StatChipItem } from '@/components/ui/ChipsRow';

// ─── mock data (replace with real API later) ───────────────────────────────
const USER_INITIALS = 'AK';

const STAT_CHIPS: StatChipItem[] = [
  {
    icon: <MaterialCommunityIcons name="fire"            size={14} color={C.coral} />,
    count: 12,
    color: C.coral,
  },
  {
    icon: <MaterialCommunityIcons name="star-four-points" size={14} color={C.gold}  />,
    count: 248,
    color: C.gold,
  },
  {
    icon: <MaterialCommunityIcons name="heart"           size={14} color={C.green} />,
    count: 5,
    color: C.green,
  },
];

// ───────────────────────────────────────────────────────────────────────────

function hexAlpha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── 1. Górny wiersz: chipy + awatar ── */}
      <View style={styles.topRow}>
        <ChipsRow chips={STAT_CHIPS} style={styles.chipsRowFlex} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{USER_INITIALS}</Text>
        </View>
      </View>

      {/* ── 2. XP bar ── */}
      <XPBar level={7} xp={740} maxXp={1000} />

      {/* ── 3. Następna sesja ── */}
      <Card accent="info">
        <View style={styles.sessionRow}>
          <View style={styles.tutorAvatar}>
            <Text style={styles.tutorInitial}>M</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.tutorName}>Marta W.</Text>
            <Text style={styles.sessionMeta}>Chemia · 60 min · 18:00</Text>
          </View>
        </View>
        <Pressable style={styles.joinBtn}>
          <Text style={styles.joinBtnText}>Dołącz ➜</Text>
        </Pressable>
      </Card>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 14,
  },

  // ── top row ──
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  chipsRowFlex: {
    flex: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: hexAlpha(C.purple, 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 12,
    color: C.purple,
  },

  // ── next session card ──
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  tutorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: hexAlpha(C.teal, 0.18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorInitial: {
    fontFamily: T.family.black,
    fontWeight: '900',
    fontSize: 20,
    color: C.teal,
  },
  sessionInfo: {
    flex: 1,
    gap: 3,
  },
  tutorName: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 16,
    color: C.text,
  },
  sessionMeta: {
    fontFamily: T.family.medium,
    fontSize: 13,
    color: C.textDim,
  },
  joinBtn: {
    backgroundColor: C.teal,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#2E8AA3',
  },
  joinBtnText: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 15,
    color: '#fff',
  },

});
