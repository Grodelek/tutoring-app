import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { C, T, R } from "@/constants/theme";
import { Card } from "@/components/ui/Card";
import { Wispa } from "@/components/ui/Wispa";
import { WispaGuide } from "@/components/ui/WispaGuide";


const USER_NAME   = "Artur";
const STREAK      = 12;
const XP_TOTAL    = 248;
const CONNECTIONS = 5;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: 48 },
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetSub}>Dzień dobry</Text>
            <Text style={styles.greetName}>{USER_NAME}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {USER_NAME.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* ── Wispa hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <Wispa size={160} floating />
        </View>

        {/* ── Stat numbers — bare, no boxes ── */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: C.coral }]}>{STREAK}</Text>
            <Text style={styles.statLabel}>STREAK</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: C.gold }]}>{XP_TOTAL}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: C.green }]}>{CONNECTIONS}</Text>
            <Text style={styles.statLabel}>POŁĄCZ.</Text>
          </View>
        </View>

        {/* ── XP progress bar — compact, no pill wrapper ── */}
        <XPBar level={7} xp={740} maxXp={1000} compact />

        {/* ── Session card — the one elevated card ── */}
        <Card accent="info" style={styles.sessionCard}>
          <Text style={styles.microLabel}>NASTĘPNA SESJA</Text>
          <View style={styles.sessionRow}>
            <View style={styles.tutorDot}>
              <Text style={styles.tutorInitial}>M</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tutorName}>Marta W.</Text>
              <Text style={styles.sessionMeta}>Chemia · 60 min · 18:00</Text>
            </View>
          </View>
          <Pressable style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>Dołącz ➜</Text>
          </Pressable>
        </Card>

        {/* ── Text-only quick action ── */}
        <Pressable style={styles.exploreRow}>
          <Text style={styles.exploreText}>Znajdź korepetytora</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color={C.coral} />
        </Pressable>

      </ScrollView>

      <WispaGuide
        messages={[
          "Cześć! Jestem Wispa — pomogę ci się rozejrzeć ✨",
          "Tu widzisz swój streak i XP zebrany z lekcji.",
          "Kliknij Explore na dole, żeby znaleźć korepetytora.",
          "Gdybyś gdzieś utknął — szukaj mnie w prawym dolnym rogu!",
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingHorizontal: 24,
    gap: 28,
  },

  // header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  greetSub: {
    fontFamily: T.family.medium,
    fontSize: 14,
    color: C.textDim,
    letterSpacing: 0.2,
  },
  greetName: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 32,
    color: C.text,
    letterSpacing: -1,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  avatarText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 15,
    color: C.purple,
  },

  // hero
  hero: {
    alignItems: "center",
    marginVertical: -4,
  },
  heroGlow: {
    position: "absolute",
    top: "25%",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: C.purple,
    opacity: 0.07,
  },

  // bare stat numbers
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statNum: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 44,
    fontVariant: ["tabular-nums"] as any,
    letterSpacing: -1,
    lineHeight: 48,
  },
  statLabel: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: C.textDim,
  },
  statSep: {
    width: 1,
    height: 44,
    backgroundColor: C.border,
  },

  // session card
  sessionCard: {
    backgroundColor: C.surface,
    borderColor: C.border,
    gap: 14,
  },
  microLabel: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: C.teal,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  tutorDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.bgDeep,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tutorInitial: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 20,
    color: C.teal,
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
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: C.teal,
    borderRadius: R.md,
    paddingVertical: 13,
    alignItems: "center",
    // 3D button shadow
    borderBottomWidth: 4,
    borderBottomColor: "#2E8AA3",
  },
  joinBtnText: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 15,
    color: "#fff",
  },

  // text-only quick action
  exploreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },
  exploreText: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 15,
    color: C.coral,
  },
});
