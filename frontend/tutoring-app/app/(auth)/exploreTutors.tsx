import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchTutors, TutorCard } from "@/api/tutorDiscoveryApi";
import { addFavoriteTutor } from "@/api/favoriteApi";
import { sendMessageToTutor } from "@/api/lessonApi";
import SwipeCards from "@components/ui/SwipeCards";
import { Chip } from "@/components/ui/Chip";
import { C, T, R } from "@/constants/theme";

// ─── helpers ─────────────────────────────────────────────────────────────────

const HEADER_H = 220;
const CARD_H = 430; // total card height including content

function hexAlpha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function styleLabel(s?: string | null) {
  if (s === "PROFESSIONAL") return "Pro";
  if (s === "CASUAL") return "Casual";
  return "Flex";
}

function availLabel(a?: string | null) {
  if (a === "EVENING_ONLY") return "Wieczorami";
  if (a === "WEEKDAYS_ONLY") return "W tygodniu";
  if (a === "WEEKENDS_ONLY") return "Weekendy";
  if (a === "FLEXIBLE") return "Elastycznie";
  return null;
}


function HeaderPill({
  style: pillStyle,
  children,
}: {
  style: object;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.pill, pillStyle]}>
      {children}
    </View>
  );
}

function CardHeader({ initial, match, rating }: { initial: string; match: number; rating: number }) {
  return (
    <LinearGradient
      colors={["#FFA53D", "#FF6B4A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardHeader}
    >
      <Svg style={StyleSheet.absoluteFillObject}>
        <Defs>
          <RadialGradient id="glare" cx="30%" cy="30%" r="60%">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0"   />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glare)" />
      </Svg>

      <Text style={styles.initial}>{initial}</Text>

      <HeaderPill style={styles.pillTL}>
        <MaterialCommunityIcons name="star-four-points" size={11} color={C.gold} />
        <Text style={styles.matchText}>{match}% MATCH</Text>
      </HeaderPill>

      <HeaderPill style={styles.pillTR}>
        <MaterialCommunityIcons name="star" size={11} color={C.gold} />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </HeaderPill>

    </LinearGradient>
  );
}

function TutorQuestCard({ card }: { card: TutorCard }) {
  const initial  = (card.tutorUsername || "?").charAt(0).toUpperCase();
  const match    = Math.round(Math.min(Math.max(card.rating, 0), 100));
  const avail    = availLabel(card.tutorAvailability);
  const chipStyle = styleLabel(card.tutorTeachingStyle);

  return (
    // outer: carries diffuse shadow (no overflow so shadow bleeds)
    <View style={styles.cardOuter}>
      {/* inner: clips gradient + content to rounded corners */}
      <View style={styles.cardInner}>
        <CardHeader initial={initial} match={match} rating={card.rating} />

        <View style={styles.cardBody}>
          {/* Name + price row */}
          <View style={styles.bodyTop}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.tutorName} numberOfLines={1}>
                {card.tutorUsername}
              </Text>
              <Text style={styles.tutorSub} numberOfLines={1}>
                {card.subject}
                {card.lessonDescription ? ` · ${card.lessonDescription}` : ""}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.price}>
                {card.price != null ? `${card.price} zł` : "—"}
              </Text>
              <Text style={styles.priceSub}>za {card.durationTime} min</Text>
            </View>
          </View>

          {/* Chips */}
          <View style={styles.chipsRow}>
            <Chip label={chipStyle} color={C.amber} active />
            {avail && <Chip label={avail} color={C.amber} />}
            <Chip label="5+ lat" color={C.teal} />
          </View>

          {/* Description */}
          {!!(card.tutorDescription || card.lessonDescription) && (
            <Text style={styles.description} numberOfLines={3}>
              {card.tutorDescription || card.lessonDescription}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── screen ───────────────────────────────────────────────────────────────────

const ExploreTutors: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const rawFilters = useMemo(() => {
    const raw = Array.isArray(params.filters) ? params.filters[0] : params.filters as string | undefined;
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
  }, [params.filters]);

  const [cards, setCards]     = useState<TutorCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [seen, setSeen]       = useState(0);
  const currentCard = cards[0];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const results = await fetchTutors(rawFilters);
        setCards(results ?? []);
      } catch (e: any) {
        Alert.alert("Błąd", e.message || "Nie udało się załadować tutorów");
      } finally {
        setLoading(false);
      }
    })();
  }, [rawFilters]);

  const handleSkip = useCallback(() => {
    setCards((p) => p.slice(1));
    setSeen((n) => n + 1);
  }, []);

  const handleConnect = useCallback(async () => {
    const card = currentCard;
    if (!card) return;
    try {
      await addFavoriteTutor(card.tutorId);
      const conv = await sendMessageToTutor(card.tutorId);
      const fresh = await fetchTutors(rawFilters);
      setCards((fresh ?? []).filter((c) => c.tutorId !== card.tutorId));
      setSeen((n) => n + 1);
      router.push({
        pathname: "/(auth)/matchCelebration",
        params: {
          tutorName:      card.tutorUsername,
          subject:        card.subject ?? "",
          availability:   availLabel(card.tutorAvailability),
          price:          card.price != null ? String(card.price) : "",
          conversationId: String(conv.id),
        },
      });
    } catch (e: any) {
      Alert.alert("Błąd", e.message || "Nie udało się połączyć");
      setCards((p) => p.slice(1));
    }
  }, [currentCard, router, rawFilters]);

  const total   = cards.length + seen;
  const current = seen + 1;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── 1. Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Misje</Text>
          <Text style={styles.headerSub}>
            Karta {current} z {total || "?"} · +10 XP za odkrycie
          </Text>
        </View>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/explore/explorePreferences",
              params: params.filters ? { filters: params.filters } : {},
            })
          }
          style={styles.filtersBtn}
        >
          <MaterialCommunityIcons name="tune-variant" size={15} color={C.textDim} />
          <Text style={styles.filtersBtnText}>Filtry</Text>
        </Pressable>
      </View>

      {/* ── 2. Card stack ── */}
      <View style={styles.deckArea}>
        {loading && cards.length === 0 ? (
          <ActivityIndicator color={C.amber} size="large" />
        ) : cards.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Brak tutorów. Zmień filtry!</Text>
          </View>
        ) : (
          <SwipeCards
            cards={cards}
            setCards={setCards}
            onSkip={handleSkip}
            onConnect={handleConnect}
            getCardId={(c) => c.tutorId}
            containerHeight={CARD_H}
            renderCard={(card) => <TutorQuestCard card={card} />}
          />
        )}
      </View>
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable onPress={handleSkip} style={styles.actionClose}>
          <MaterialCommunityIcons name="close" size={26} color={C.textDim} />
        </Pressable>

        <Pressable onPress={handleConnect} style={styles.connectBtn}>
          <MaterialCommunityIcons name="heart" size={18} color="#fff" />
          <Text style={styles.connectText}>Połącz</Text>
        </Pressable>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 24,
    letterSpacing: -0.5,
    color: C.text,
  },
  headerSub: {
    fontFamily: T.family.medium,
    fontWeight: "600",
    fontSize: 12,
    color: C.textDim,
    marginTop: 2,
  },
  filtersBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: C.border,
  },
  filtersBtnText: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 13,
    color: C.textDim,
  },

  // ── deck ──
  deckArea: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 15,
    color: C.textDim,
  },

  // ── tutor card outer (shadow carrier, NO overflow: hidden) ──
  cardOuter: {
    borderRadius: 24,
    // diffuse black shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
  },
  // inner clips gradient + content
  cardInner: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: C.surface,
    // amber border + hard bottom shadow
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 8,
    borderTopColor:    "rgba(255,165,61,0.33)",
    borderLeftColor:   "rgba(255,165,61,0.33)",
    borderRightColor:  "rgba(255,165,61,0.33)",
    borderBottomColor: "#C97A1A",
  },

  // card header (gradient zone)
  cardHeader: {
    height: HEADER_H,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 92,
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },

  // overlay pills
  pill: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: R.full,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  pillTL: { top: 12, left: 12 },
  pillTR: { top: 12, right: 12 },
  pillBL: { bottom: 12, left: 12, backgroundColor: "rgba(0,0,0,0.4)" },
  matchText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 12,
    color: C.gold,
  },
  ratingText: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 12,
    color: C.gold,
  },
  levelText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#fff",
  },

  // card body
  cardBody: {
    padding: 14,
    paddingHorizontal: 18,
    gap: 8,
  },
  bodyTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tutorName: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 20,
    color: C.text,
    letterSpacing: -0.3,
  },
  tutorSub: {
    fontFamily: T.family.medium,
    fontWeight: "600",
    fontSize: 13,
    color: C.textDim,
    marginTop: 2,
  },
  price: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 18,
    color: C.amber,
  },
  priceSub: {
    fontFamily: T.family.medium,
    fontSize: 11,
    color: C.textDim,
    marginTop: 1,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  description: {
    fontFamily: T.family.medium,
    fontSize: 13,
    lineHeight: 13 * 1.5,
    color: C.textDim,
  },

  // ── action row ──
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionClose: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 5,
    borderTopColor: C.border,
    borderLeftColor: C.border,
    borderRightColor: C.border,
    borderBottomColor: C.bgDeep,
  },
  actionStar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 5,
    borderTopColor: "rgba(255,209,92,0.33)",    // gold@33%
    borderLeftColor: "rgba(255,209,92,0.33)",
    borderRightColor: "rgba(255,209,92,0.33)",
    borderBottomColor: C.bgDeep,
  },
  connectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 60,
    borderRadius: 16,
    backgroundColor: C.coral,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 5,
    borderTopColor: C.coral,
    borderLeftColor: C.coral,
    borderRightColor: C.coral,
    borderBottomColor: C.coralDark,
  },
  connectText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 16,
    color: "#fff",
  },
});

export default ExploreTutors;
