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
import { useRouter } from "expo-router";
import { C, T, R } from "@/constants/theme";
import { Wispa } from "@/components/ui/Wispa";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const FEATURES: { icon: IconName; color: string; title: string; desc: string }[] = [
  {
    icon: "compass",
    color: C.coral,
    title: "Odkryj tutorów",
    desc: "Swipe przez dopasowanych korepetytorów jak karty.",
  },
  {
    icon: "star-four-points",
    color: C.gold,
    title: "Zbieraj XP",
    desc: "Każda sesja to punkty, streak i odznaki.",
  },
  {
    icon: "message-text",
    color: C.teal,
    title: "Czatuj od razu",
    desc: "Napisz do tutora zaraz po dopasowaniu.",
  },
  {
    icon: "trophy",
    color: C.purple,
    title: "Rywalizuj",
    desc: "Tabela wyników motywuje do nauki każdego dnia.",
  },
];

function hexAlpha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router  = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.glow} />
          <Wispa size={148} floating />
          <Text style={styles.heroTitle}>
            Witaj w{" "}
            <Text style={styles.heroAccent}>Skill Swap</Text>!
          </Text>
          <Text style={styles.heroSub}>
            Dopasowani tutorzy, umawianie sesji — wszystko w jednym miejscu.
          </Text>
        </View>

        {/* ── CTA buttons ── */}
        <View style={styles.ctaRow}>
          <Pressable
            style={styles.ctaPrimary}
            onPress={() => router.push("/(tabs)/register")}
          >
            <MaterialCommunityIcons name="account-plus" size={18} color="#241608" />
            <Text style={styles.ctaPrimaryText}>Zacznij przygodę</Text>
          </Pressable>
          <Pressable
            style={styles.ctaSecondary}
            onPress={() => router.push("/(tabs)/login")}
          >
            <Text style={styles.ctaSecondaryText}>Zaloguj się</Text>
          </Pressable>
        </View>

        {/* ── Features ── */}
        <Text style={styles.sectionLabel}>Dlaczego QuestLearn?</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: hexAlpha(f.color, 0.15) }]}>
                <MaterialCommunityIcons name={f.icon} size={22} color={f.color} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* ── Bottom nudge ── */}
        <View style={styles.nudge}>
          <Text style={styles.nudgeText}>
            Dołącz do{" "}
            <Text style={{ color: C.amber, fontFamily: T.family.bold }}>
              2 000+
            </Text>{" "}
            uczniów i zacznij dziś.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },

  // hero
  hero: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  glow: {
    position: "absolute",
    top: "20%",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: C.purple,
    opacity: 0.07,
  },
  heroTitle: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 28,
    color: C.text,
    textAlign: "center",
    letterSpacing: -0.6,
    marginTop: 6,
  },
  heroAccent: {
    color: C.amber,
  },
  heroSub: {
    fontFamily: T.family.medium,
    fontSize: 15,
    color: C.textDim,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },

  // cta
  ctaRow: {
    gap: 10,
  },
  ctaPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.amber,
    borderRadius: R.full,
    paddingVertical: 16,
    borderBottomWidth: 4,
    borderBottomColor: C.amberDark,
  },
  ctaPrimaryText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 16,
    color: "#241608",
  },
  ctaSecondary: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: R.full,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  ctaSecondaryText: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 15,
    color: C.textDim,
  },

  // features
  sectionLabel: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: C.textDim,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featureCard: {
    width: "48%",
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 16,
    gap: 8,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: R.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 14,
    color: C.text,
  },
  featureDesc: {
    fontFamily: T.family.medium,
    fontSize: 12,
    color: C.textDim,
    lineHeight: 17,
  },

  // bottom nudge
  nudge: {
    alignItems: "center",
    paddingVertical: 8,
  },
  nudgeText: {
    fontFamily: T.family.medium,
    fontSize: 14,
    color: C.textDim,
    textAlign: "center",
  },
});
