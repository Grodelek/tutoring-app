import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchTutors, TutorCard } from "@/api/tutorDiscoveryApi";
import { getMyAccount } from "@/api/userApi";
import { BASE_URL } from "@/config/baseUrl";
import { addFavoriteTutor } from "@/api/favoriteApi";
import { sendMessageToTutor } from "@/api/lessonApi";
import SwipeCards from "@components/ui/SwipeCards";
import { Chip } from "@/components/ui/Chip";
import { MatchingAnimation } from "@/components/ui/MatchingAnimation";
import { C, T, R } from "@/constants/theme";



const BATCH_THRESHOLD = 2;
const HEADER_H = 220;
const CARD_H = 430;

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

function CardHeader({ initial, match, rating, photoPath }: {
  initial: string;
  match: number;
  rating: number;
  photoPath?: string | null;
}) {
  const [imgError, setImgError] = React.useState(false);
  const uri = photoPath
    ? photoPath.startsWith("http") ? photoPath : `${BASE_URL}${photoPath}`
    : null;
  const showPhoto = !!uri && !imgError;

  return (
    <View style={styles.cardHeader}>
      {showPhoto ? (
        <Image
          source={{ uri }}
          style={styles.avatar}
          onError={() => setImgError(true)}
        />
      ) : (
        <Text style={styles.initial}>{initial}</Text>
      )}

      <HeaderPill style={styles.pillTL}>
        <MaterialCommunityIcons name="star-four-points" size={11} color={C.gold} />
        <Text style={styles.matchText}>{match}% MATCH</Text>
      </HeaderPill>

      <HeaderPill style={styles.pillTR}>
        <MaterialCommunityIcons name="star" size={11} color={C.gold} />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </HeaderPill>
    </View>
  );
}

function TutorQuestCard({ card }: { card: TutorCard }) {
  const initial   = (card.tutorUsername || "?").charAt(0).toUpperCase();
  const match     = Math.round(Math.min(Math.max(card.rating, 0), 100));
  const avail     = availLabel(card.tutorAvailability);
  const chipStyle = styleLabel(card.tutorTeachingStyle);

  const flipAnim  = useRef(new Animated.Value(0)).current;
  const isFlipped = useRef(false);

  const handleFlip = () => {
    isFlipped.current = !isFlipped.current;
    Animated.timing(flipAnim, {
      toValue: isFlipped.current ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const frontStyle = {
    transform: [
      { perspective: 1200 },
      { rotateY: flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) },
    ],
    backfaceVisibility: "hidden" as const,
  };

  const backStyle = {
    transform: [
      { perspective: 1200 },
      { rotateY: flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] }) },
    ],
    backfaceVisibility: "hidden" as const,
  };

  return (
    <View style={styles.cardOuter}>
      {/* Front */}
      <Animated.View style={[styles.cardInner, frontStyle]}>
        <CardHeader initial={initial} match={match} rating={card.rating} photoPath={card.tutorPhotoPath} />

        <Pressable onPress={handleFlip} style={styles.infoBtn} hitSlop={8}>
          <MaterialCommunityIcons name="information-outline" size={18} color={C.textDim} />
        </Pressable>

        <View style={styles.cardBody}>
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

          <View style={styles.chipsRow}>
            <Chip label={chipStyle} color={C.amber} active />
            {avail && <Chip label={avail} color={C.amber} />}
            <Chip label="5+ lat" color={C.teal} />
          </View>

          {!!(card.tutorDescription || card.lessonDescription) && (
            <Text style={styles.description} numberOfLines={3}>
              {card.tutorDescription || card.lessonDescription}
            </Text>
          )}
        </View>
      </Animated.View>

      {/* Back */}
      <Animated.View style={[styles.cardInner, styles.cardBack, backStyle]}>
        <Pressable onPress={handleFlip} style={styles.infoBtn} hitSlop={8}>
          <MaterialCommunityIcons name="close-circle-outline" size={18} color={C.textDim} />
        </Pressable>

        <View style={styles.cardBody}>
          <Text style={styles.tutorName}>{card.tutorUsername}</Text>
          <Text style={styles.tutorSub}>{card.subject}</Text>

          <View style={[styles.chipsRow, { marginTop: 4 }]}>
            <Chip label={chipStyle} color={C.amber} active />
            {avail && <Chip label={avail} color={C.amber} />}
          </View>

          <View style={styles.backRow}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={C.textDim} />
            <Text style={styles.backLabel}>Czas lekcji</Text>
            <Text style={styles.backValue}>{card.durationTime} min</Text>
          </View>

          <View style={styles.backRow}>
            <MaterialCommunityIcons name="currency-usd" size={14} color={C.textDim} />
            <Text style={styles.backLabel}>Cena</Text>
            <Text style={styles.backValue}>{card.price != null ? `${card.price} zł` : "—"}</Text>
          </View>

          <View style={styles.backRow}>
            <MaterialCommunityIcons name="star" size={14} color={C.gold} />
            <Text style={styles.backLabel}>Ocena</Text>
            <Text style={styles.backValue}>{card.rating.toFixed(1)}</Text>
          </View>

          {!!card.tutorDescription && (
            <>
              <Text style={[styles.backLabel, { marginTop: 10 }]}>O tutorze</Text>
              <Text style={styles.description}>
                {card.tutorDescription}
              </Text>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}


const ExploreTutors: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const rawFilters = useMemo(() => {
    const raw = Array.isArray(params.filters) ? params.filters[0] : params.filters as string | undefined;
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }, [params.filters]);

  const [savedFilters, setSavedFilters] = useState<any>(null);
  const [prefsLoaded,  setPrefsLoaded]  = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("tutorPreferences").then(raw => {
      if (raw) { try { setSavedFilters(JSON.parse(raw)); } catch {} }
      setPrefsLoaded(true);
    });
  }, []);

  const activeFilters = rawFilters ?? savedFilters;
  const hasFilters    = prefsLoaded && activeFilters !== null;

  const [cards, setCards]           = useState<TutorCard[]>([]);
  const [loading, setLoading]       = useState(false);
  const [seen, setSeen]             = useState(0);
  const [allExhausted, setAllExhausted] = useState(false);
  const [showMatchAnim, setShowMatchAnim] = useState(false);
  const [studentInitial, setStudentInitial] = useState("S");
  const [studentPhotoUri, setStudentPhotoUri] = useState<string | null>(null);
  const matchDataRef = useRef<{ tutorName: string; tutorInitial: string; tutorPhotoUri?: string | null; conversationId?: string; receiverId: string } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("savedEmail").then(email => {
      if (email) setStudentInitial(email.charAt(0).toUpperCase());
    });
    getMyAccount().then(me => {
      if (me.photoPath) setStudentPhotoUri(me.photoPath);
    }).catch(() => {});
  }, []);

  const shownIdsRef  = useRef(new Set<string>());
  const fetchingRef  = useRef(false);
  const currentCard  = cards[0];

  const fetchBatch = useCallback(async (isInitial: boolean) => {
    if (fetchingRef.current || !activeFilters) return;
    fetchingRef.current = true;
    if (isInitial) setLoading(true);
    try {
      const results = await fetchTutors(activeFilters);
      const fresh = (results ?? []).filter(c => !shownIdsRef.current.has(c.tutorId));
      if (fresh.length === 0) {
        if (!isInitial) setAllExhausted(true);
      } else {
        fresh.forEach(c => shownIdsRef.current.add(c.tutorId));
        if (isInitial) {
          setCards(fresh);
        } else {
          setCards(prev => [...prev, ...fresh]);
        }
      }
    } catch (e: any) {
      Alert.alert("Błąd", e.message || "Nie udało się załadować tutorów");
    } finally {
      fetchingRef.current = false;
      if (isInitial) setLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    if (!hasFilters) return;
    shownIdsRef.current.clear();
    setAllExhausted(false);
    setSeen(0);
    setCards([]);
    fetchBatch(true);
  }, [hasFilters, fetchBatch]);

  useEffect(() => {
    if (!hasFilters || loading || allExhausted || fetchingRef.current) return;
    if (cards.length <= BATCH_THRESHOLD) {
      fetchBatch(false);
    }
  }, [cards.length, hasFilters, loading, allExhausted, fetchBatch]);

  const handleSkip = useCallback(() => {
    if (!currentCard) return;
    setCards(p => p.slice(1));
    setSeen(n => n + 1);
  }, [currentCard]);

  const handleConnect = useCallback(async () => {
    const card = currentCard;
    if (!card) return;
    try {
      await addFavoriteTutor(card.tutorId);
      const conversation = await sendMessageToTutor(card.tutorId);
      const conversationId = conversation?.conversationId ?? conversation?.id;
      matchDataRef.current = {
        tutorName: card.tutorUsername ?? "",
        tutorInitial: (card.tutorUsername ?? "T").charAt(0),
        tutorPhotoUri: card.tutorPhotoPath ?? null,
        conversationId: conversationId ? String(conversationId) : undefined,
        receiverId: card.tutorId,
      };
      setCards(p => p.slice(1));
      setSeen(n => n + 1);
      setShowMatchAnim(true);
    } catch (e: any) {
      Alert.alert("Błąd", e.message || "Nie udało się połączyć");
      setCards(p => p.slice(1));
    }
  }, [currentCard]);

  const handleMatchAnimComplete = () => {
    setShowMatchAnim(false);
    const data = matchDataRef.current;
    router.push({
      pathname: "/(auth)/matchCelebration" as any,
      params: {
        conversationId: data?.conversationId ?? "",
        receiverId: data?.receiverId ?? "",
        tutorName: data?.tutorName ?? "",
      },
    });
  };

  const total   = cards.length + seen;
  const current = seen + 1;

  if (!prefsLoaded) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={C.amber} size="large" />
      </View>
    );
  }

  if (!hasFilters) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Misje</Text>
        </View>
        <View style={styles.emptyFullScreen}>
          <MaterialCommunityIcons name="filter-variant-remove" size={72} color={C.border} />
          <Text style={styles.emptyTitle}>Brak aktywnych filtrów</Text>
          <Text style={styles.emptySub}>
            Ustaw preferencje, aby znaleźć idealnego korepetytora
          </Text>
          <Pressable
            onPress={() => router.push("/(auth)/explorePreferences" as any)}
            style={styles.emptyBtn}
          >
            <MaterialCommunityIcons name="tune-variant" size={16} color="#241608" />
            <Text style={styles.emptyBtnText}>Ustaw filtry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
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
              pathname: "/explorePreferences",
              params: params.filters ? { filters: params.filters } : {},
            } as any)
          }
          style={styles.filtersBtn}
        >
          <MaterialCommunityIcons name="tune-variant" size={15} color={C.textDim} />
          <Text style={styles.filtersBtnText}>Filtry</Text>
        </Pressable>
      </View>

      <View style={styles.deckArea}>
        {loading ? (
          <ActivityIndicator color={C.amber} size="large" />
        ) : allExhausted && cards.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-check" size={56} color={C.border} />
            <Text style={styles.emptyTitle}>Widziałeś wszystkich!</Text>
            <Text style={styles.emptySub}>Zmień filtry, aby zobaczyć nowych tutorów</Text>
            <Pressable
              onPress={() => router.push({
                pathname: "/(auth)/explorePreferences",
                params: params.filters ? { filters: params.filters } : {},
              } as any)}
              style={styles.emptyBtn}
            >
              <Text style={styles.emptyBtnText}>Zmień filtry</Text>
            </Pressable>
          </View>
        ) : cards.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-remove" size={56} color={C.border} />
            <Text style={styles.emptyTitle}>Brak tutorów</Text>
            <Text style={styles.emptySub}>Spróbuj zmienić filtry</Text>
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

      {cards.length > 0 && (
        <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable onPress={handleSkip} style={styles.actionClose}>
            <MaterialCommunityIcons name="close" size={26} color={C.textDim} />
          </Pressable>
          <Pressable onPress={handleConnect} style={styles.connectBtn}>
            <MaterialCommunityIcons name="heart" size={18} color="#fff" />
            <Text style={styles.connectText}>Połącz</Text>
          </Pressable>
        </View>
      )}

      <MatchingAnimation
        visible={showMatchAnim}
        student={{ initial: studentInitial, color: C.purple, photoUri: studentPhotoUri }}
        tutor={{ initial: matchDataRef.current?.tutorInitial ?? "T", color: C.teal, photoUri: matchDataRef.current?.tutorPhotoUri }}
        onComplete={handleMatchAnimComplete}
      />
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
    fontWeight: T.weight.medium,
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

  deckArea: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyFullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 12,
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 20,
    color: C.text,
    textAlign: "center",
  },
  emptySub: {
    fontFamily: T.family.medium,
    fontSize: 14,
    color: C.textDim,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: R.full,
    backgroundColor: C.amber,
    borderBottomWidth: 4,
    borderBottomColor: C.amberDark,
  },
  emptyBtnText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 15,
    color: "#241608",
  },

  cardOuter: {
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
  },
  cardInner: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderBottomWidth: 8,
    borderBottomColor: C.bgDeep,
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 16,
    justifyContent: "flex-start",
  },
  infoBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backLabel: {
    flex: 1,
    fontFamily: T.family.medium,
    fontSize: 13,
    color: C.textDim,
  },
  backValue: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 13,
    color: C.text,
  },

  cardHeader: {
    height: HEADER_H,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bgDeep,
  },
  initial: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 92,
    color: C.purple,
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  pill: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: R.full,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  pillTL: { top: 12, left: 12 },
  pillTR: { top: 12, right: 12 },
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
    fontWeight: T.weight.medium,
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
    borderTopColor: "rgba(255,209,92,0.33)",
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
