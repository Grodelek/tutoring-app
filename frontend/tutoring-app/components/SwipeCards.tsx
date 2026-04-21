import React, { useMemo, useRef } from "react";
import {
  Animated,
  View,
  Image,
  PanResponder,
  Dimensions,
  StyleSheet,
  Text,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type CardId = string | number;

type SwipeCardsProps<TCard> = {
  cards: TCard[];
  setCards: React.Dispatch<React.SetStateAction<TCard[]>>;
  onSkip?: (cardId: CardId) => void;
  onConnect?: (cardId: CardId) => void;
  getCardId?: (card: TCard) => CardId;
  getImageUri?: (card: TCard) => string | null | undefined;
  getPlaceholderText?: (card: TCard) => string | null | undefined;
  renderCard?: (card: TCard) => React.ReactNode;
};

const SwipeCards = <TCard,>({
  cards,
  setCards,
  onSkip,
  onConnect,
  getCardId,
  getImageUri,
  getPlaceholderText,
  renderCard,
}: SwipeCardsProps<TCard>) => {
  const swipe = useRef(new Animated.ValueXY()).current;
  const swipeThreshold = SCREEN_WIDTH * 0.25;

  const rotate = swipe.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-12deg", "0deg", "12deg"],
    extrapolate: "clamp",
  });

  const nextCardScale = swipe.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [1, 0.96, 1],
    extrapolate: "clamp",
  });

  const nextCardTranslateY = swipe.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0, 10, 0],
    extrapolate: "clamp",
  });

  const animateOffscreen = (direction: "left" | "right", cardId: CardId) => {
    const toX = direction === "right" ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;

    Animated.timing(swipe, {
      toValue: { x: toX, y: 0 },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      swipe.setValue({ x: 0, y: 0 });
      setCards((prev) => prev.slice(1));

      if (direction === "right") onConnect?.(cardId);
      else onSkip?.(cardId);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: Animated.event([null, { dx: swipe.x, dy: swipe.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          const topCard = cards[0];
          if (!topCard) return;

          const id =
            getCardId?.(topCard) ?? ((topCard as any)?.id as CardId | undefined);
          if (id == null) return;

          if (gesture.dx > swipeThreshold) {
            animateOffscreen("right", id);
            return;
          }

          if (gesture.dx < -swipeThreshold) {
            animateOffscreen("left", id);
            return;
          }

          Animated.spring(swipe, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 6,
            tension: 80,
          }).start();
        },
      }),
    [cards, swipeThreshold]
  );

  const visibleCards = cards.slice(0, 3);

  return (
    <View style={styles.container}>
      {visibleCards
        .map((card, index) => {
          const isTop = index === 0;
          const isSecond = index === 1;
          const imageUri =
            getImageUri?.(card) ?? ((card as any)?.url as string | undefined);
          const placeholder =
            getPlaceholderText?.(card) ??
            ((card as any)?.title as string | undefined) ??
            "";

          return (
            <Animated.View
              key={String(getCardId?.(card) ?? (card as any)?.id ?? index)}
              style={[
                styles.card,
                isTop
                  ? {
                      transform: [
                        { translateX: swipe.x },
                        { translateY: swipe.y },
                        { rotate },
                      ],
                    }
                  : isSecond
                    ? {
                        transform: [
                          { scale: nextCardScale },
                          { translateY: nextCardTranslateY },
                        ],
                      }
                    : undefined,
              ]}
              {...(isTop ? panResponder.panHandlers : undefined)}
            >
              {renderCard ? (
                renderCard(card)
              ) : imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.cardImage}
                    pointerEvents="none"
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderText} numberOfLines={2}>
                      {placeholder || "No photo"}
                    </Text>
                  </View>
                )}
            </Animated.View>
          );
        })
        .reverse()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  cardImage: {
    width: "100%",
    height: 260,
  },
  placeholder: {
    width: "100%",
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
    paddingHorizontal: 16,
  },
  placeholderText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
});

export default SwipeCards;