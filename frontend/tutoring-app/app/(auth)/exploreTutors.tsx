import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { searchTutors, TutorCard } from "@/api/tutorDiscoveryApi";
import { addFavoriteTutor } from "@/api/favoriteApi";
import { sendMessageToTutor } from "@/api/lessonApi";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const ExploreTutors: React.FC = () => {
  const colorScheme = useColorScheme();
  const themeColors = useMemo(
    () => (colorScheme === "dark" ? Colors.dark : Colors.light),
    [colorScheme]
  );
  const router = useRouter();
  const params = useLocalSearchParams();

  const rawFiltersParam = params.filters;
  const rawFilters = Array.isArray(rawFiltersParam)
    ? rawFiltersParam[0]
    : (rawFiltersParam as string | undefined);

  const [cards, setCards] = useState<TutorCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentCard = cards[currentIndex];

  const swipe = useRef(new Animated.ValueXY()).current;
  const swipeThreshold = SCREEN_WIDTH * 0.25;

  const resetPosition = () => {
    Animated.spring(swipe, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const raw = rawFilters;
        let parsed: any = null;
        if (raw) {
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = null;
          }
        }
        const filters = parsed ?? {};
        const results = await searchTutors(filters);
        setCards(results ?? []);
        setCurrentIndex(0);
        swipe.setValue({ x: 0, y: 0 });
      } catch (e: any) {
        Alert.alert("Error", e.message || "Failed to load tutors");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rawFilters, swipe]);

  const handleSkip = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next > cards.length ? cards.length : next;
    });
    resetPosition();
  }, [cards.length]);

  const handleConnect = useCallback(async () => {
    const card = cards[currentIndex];
    if (!card) return;

    try {
      await addFavoriteTutor(card.tutorId);
      const conversation = await sendMessageToTutor(card.tutorId);

      router.push({
        pathname: "/messages/[conversationId]",
        params: {
          conversationId: conversation.id,
          receiverId: card.tutorId,
        },
      });
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to connect with tutor");
    } finally {
      resetPosition();
    }
  }, [cards, currentIndex, router]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: swipe.x, dy: swipe.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > swipeThreshold) {
          Animated.timing(swipe, {
            toValue: { x: 400, y: gesture.dy },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            swipe.setValue({ x: 0, y: 0 });
            handleConnect();
          });
        } else if (gesture.dx < -swipeThreshold) {
          Animated.timing(swipe, {
            toValue: { x: -400, y: gesture.dy },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            swipe.setValue({ x: 0, y: 0 });
            handleSkip();
          });
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const headerRight = (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/explore/explorePreferences",
          params: rawFilters ? { filters: rawFilters } : {},
        })
      }
      style={styles.filtersButton}
    >
      <Text style={styles.filtersButtonText}>Edit filters</Text>
    </Pressable>
  );

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: themeColors.text }]}>Explore</Text>
        {headerRight}
      </View>
      <Text style={[styles.subtitle, { color: themeColors.secondaryText }]}>
        Swipe right to accept, left to decline.
      </Text>

      <View style={styles.deckWrapper}>
        {loading && !currentCard ? (
          <ActivityIndicator color={themeColors.tint} />
        ) : !currentCard ? (
          <Text style={{ color: themeColors.secondaryText }}>
            No tutors found. Edit filters to search again.
          </Text>
        ) : (
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: themeColors.cardBackground },
              {
                transform: [
                  { translateX: swipe.x },
                  { translateY: swipe.y },
                  {
                    rotate: swipe.x.interpolate({
                      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                      outputRange: ["-15deg", "0deg", "15deg"],
                    }),
                  },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Animated.Text
              style={[
                styles.badge,
                styles.badgeLeft,
                {
                  opacity: swipe.x.interpolate({
                    inputRange: [-150, -50],
                    outputRange: [1, 0],
                    extrapolate: "clamp",
                  }),
                  transform: [
                    {
                      rotate: "-15deg",
                    },
                  ],
                },
              ]}
            >
              Decline
            </Animated.Text>
            <Animated.Text
              style={[
                styles.badge,
                styles.badgeRight,
                {
                  opacity: swipe.x.interpolate({
                    inputRange: [50, 150],
                    outputRange: [0, 1],
                    extrapolate: "clamp",
                  }),
                  transform: [
                    {
                      rotate: "15deg",
                    },
                  ],
                },
              ]}
            >
              Accept
            </Animated.Text>
            {currentCard.tutorPhotoPath ? (
              <Image
                source={{ uri: currentCard.tutorPhotoPath }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={{ color: "#fff", fontSize: 18 }}>
                  {currentCard.tutorUsername?.charAt(0)?.toUpperCase() || ":)"}
                </Text>
              </View>
            )}

            <Text style={[styles.cardName, { color: themeColors.text }]}>
              {currentCard.tutorUsername}
            </Text>
            <Text
              style={[styles.cardSubject, { color: themeColors.secondaryText }]}
            >
              {currentCard.subject}
            </Text>
            <View style={styles.badgeRow}>
              {currentCard.tutorUserType && (
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {currentCard.tutorUserType === "STUDENT"
                      ? "Student tutor"
                      : "Professional tutor"}
                  </Text>
                </View>
              )}
              {currentCard.tutorTeachingStyle && (
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {currentCard.tutorTeachingStyle === "CASUAL"
                      ? "Casual style"
                      : currentCard.tutorTeachingStyle === "PROFESSIONAL"
                      ? "Professional style"
                      : "Flexible style"}
                  </Text>
                </View>
              )}
              {currentCard.tutorAvailability && (
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {currentCard.tutorAvailability}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.cardDescription, { color: themeColors.text }]}
              numberOfLines={3}
            >
              {currentCard.lessonDescription ||
                currentCard.tutorDescription ||
                "No description yet"}
            </Text>
            <View style={styles.cardMetaRow}>
              {currentCard.price != null && (
                <Text
                  style={{ color: themeColors.secondaryText, fontSize: 14 }}
                >
                  Price: {currentCard.price} PLN
                </Text>
              )}
              <Text
                style={{ color: themeColors.secondaryText, fontSize: 14 }}
              >
                Duration: {currentCard.durationTime} min
              </Text>
            </View>
            <Text
              style={{
                color: themeColors.secondaryText,
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Match score: {currentCard.rating.toFixed(0)}
            </Text>

            <View style={styles.actionsRow}>
              <Pressable
                style={[styles.skipButton, { borderColor: themeColors.tint }]}
                onPress={handleSkip}
              >
                <Text
                  style={[styles.skipButtonText, { color: themeColors.tint }]}
                >
                  Skip
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.connectButton,
                  { backgroundColor: themeColors.tint },
                ]}
                onPress={handleConnect}
              >
                <Text style={styles.connectButtonText}>Connect</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  deckWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 16,
    minHeight: SCREEN_HEIGHT * 0.45,
  },
  avatar: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  cardName: {
    fontSize: 20,
    fontWeight: "700",
  },
  cardSubject: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  metaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#333",
  },
  metaBadgeText: {
    color: "#eee",
    fontSize: 11,
  },
  cardMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 10,
  },
  skipButtonText: {
    fontWeight: "600",
  },
  connectButton: {
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 10,
  },
  connectButtonText: {
    color: "#000",
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "700",
    fontSize: 14,
  },
  badgeLeft: {
    left: 16,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    color: "#fff",
  },
  badgeRight: {
    right: 16,
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    color: "#fff",
  },
  filtersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#555",
  },
  filtersButtonText: {
    color: "#ccc",
    fontSize: 12,
  },
});

export default ExploreTutors;

