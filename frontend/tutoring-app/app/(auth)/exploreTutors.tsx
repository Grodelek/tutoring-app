import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View,} from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useColorScheme} from "@/hooks/useColorScheme";
import {Colors} from "@/constants/Colors";
import {fetchTutors, TutorCard} from "@/api/tutorDiscoveryApi";
import {addFavoriteTutor} from "@/api/favoriteApi";
import {sendMessageToTutor} from "@/api/lessonApi";
import SwipeCards from "@components/SwipeCards";

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
  const [loading, setLoading] = useState(false);
  const currentCard = cards[0];

  const filters = useMemo(() => {
    const raw = rawFilters;
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }, [rawFilters]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const results = await fetchTutors(filters);
        setCards(results ?? []);
      } catch (e: any) {
        Alert.alert("Error", e.message || "Failed to load tutors");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  const handleSkip = useCallback(() => {
    setCards((prev) => prev.slice(1));
  }, []);

  const handleConnect = useCallback(async () => {
    const card = currentCard;
    if (!card) return;
    try {
      await addFavoriteTutor(card.tutorId);
      const conversation = await sendMessageToTutor(card.tutorId);

      const refreshed = await fetchTutors(filters);
      const nextCards = (refreshed ?? []).filter((c) => c.tutorId !== card.tutorId);
      setCards(nextCards);

      router.push({
        pathname: "/messages/[conversationId]",
        params: {
          conversationId: conversation.id,
          receiverId: card.tutorId,
        },
      });
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to connect with tutor");
      // If something failed, at least remove the card from the current deck.
      setCards((prev) => prev.slice(1));
    }
  }, [currentCard, router, filters]);

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
            <>
              <SwipeCards
                  cards={cards}
                  setCards={setCards}
                  onSkip={handleSkip}
                  onConnect={handleConnect}
                  getCardId={(c) => c.tutorId}
                  getImageUri={(c) => c.tutorPhotoPath}
                  getPlaceholderText={(c) => c.tutorUsername}
                  renderCard={(card) => (
                    <View style={styles.swipeCard}>
                      {card.tutorPhotoPath ? (
                        <Image
                          source={{ uri: card.tutorPhotoPath }}
                          style={styles.swipeCardImage}
                          resizeMode="cover"
                          pointerEvents="none"
                        />
                      ) : (
                        <View style={styles.swipeCardImagePlaceholder}>
                          <Text style={{ color: "#fff", fontSize: 18 }}>
                            {card.tutorUsername?.charAt(0)?.toUpperCase() || ":)"}
                          </Text>
                        </View>
                      )}
                      <View style={styles.swipeCardContent}>
                        <Text style={[styles.cardName, { color: themeColors.text }]}>
                          {card.tutorUsername}
                        </Text>
                        <Text
                          style={[
                            styles.cardSubject,
                            { color: themeColors.secondaryText },
                          ]}
                        >
                          {card.subject}
                        </Text>

                        <View style={styles.badgeRow}>
                          {card.tutorUserType && (
                            <View style={styles.metaBadge}>
                              <Text style={styles.metaBadgeText}>
                                {card.tutorUserType === "STUDENT"
                                  ? "Student tutor"
                                  : "Professional tutor"}
                              </Text>
                            </View>
                          )}
                          {card.tutorTeachingStyle && (
                            <View style={styles.metaBadge}>
                              <Text style={styles.metaBadgeText}>
                                {card.tutorTeachingStyle === "CASUAL"
                                  ? "Casual style"
                                  : card.tutorTeachingStyle === "PROFESSIONAL"
                                    ? "Professional style"
                                    : "Flexible style"}
                              </Text>
                            </View>
                          )}
                          {card.tutorAvailability && (
                            <View style={styles.metaBadge}>
                              <Text style={styles.metaBadgeText}>
                                {card.tutorAvailability}
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text
                          style={[styles.cardDescription, { color: themeColors.text }]}
                          numberOfLines={3}
                        >
                          {card.lessonDescription ||
                            card.tutorDescription ||
                            "No description yet"}
                        </Text>

                        <View style={styles.cardMetaRow}>
                          {card.price != null && (
                            <Text
                              style={{
                                color: themeColors.secondaryText,
                                fontSize: 14,
                              }}
                            >
                              Price: {card.price} PLN
                            </Text>
                          )}
                          <Text
                            style={{
                              color: themeColors.secondaryText,
                              fontSize: 14,
                            }}
                          >
                            Duration: {card.durationTime} min
                          </Text>
                        </View>

                        <Text
                          style={{
                            color: themeColors.secondaryText,
                            fontSize: 13,
                            marginTop: 4,
                          }}
                        >
                          Match score: {card.rating.toFixed(0)}
                        </Text>
                      </View>
                    </View>
                  )}
              />
            </>
        )}
      </View>
      <View style={styles.actionsRow}>
        <Pressable
            style={[styles.skipButton, { borderColor: themeColors.tint }]}
            onPress={handleSkip}
        >
          <Text style={[styles.skipButtonText, { color: themeColors.tint }]}>
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
  swipeCard: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  swipeCardImage: {
    width: "100%",
    height: 260,
  },
  swipeCardImagePlaceholder: {
    width: "100%",
    height: 260,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  swipeCardContent: {
    padding: 16,
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
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 10,
  },
  connectButtonText: {
    color: "#000",
    fontWeight: "600",
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

