import React, { useMemo, useRef } from "react";
import { Animated, View, PanResponder, Dimensions, StyleSheet } from "react-native";

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
  /** Height of the card stack container (default 400) */
  containerHeight?: number;
};

const SwipeCards = <TCard,>({
  cards,
  setCards,
  onSkip,
  onConnect,
  getCardId,
  renderCard,
  containerHeight = 400,
}: SwipeCardsProps<TCard>) => {
  const swipe = useRef(new Animated.ValueXY()).current;
  const swipeThreshold = SCREEN_WIDTH * 0.25;

  const rotate = swipe.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-13deg", "-1deg", "11deg"],
    extrapolate: "clamp",
  });

  const secondScale = swipe.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [1, 0.97, 1],
    extrapolate: "clamp",
  });
  const secondTranslateY = swipe.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0, 10, 0],
    extrapolate: "clamp",
  });

  const thirdScale = swipe.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.97, 0.94, 0.97],
    extrapolate: "clamp",
  });
  const thirdTranslateY = swipe.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [10, 20, 10],
    extrapolate: "clamp",
  });

  const animateOffscreen = (direction: "left" | "right", cardId: CardId) => {
    const toX = direction === "right" ? SCREEN_WIDTH * 1.3 : -SCREEN_WIDTH * 1.3;
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
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: Animated.event(
          [null, { dx: swipe.x, dy: swipe.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (_, gesture) => {
          const top = cards[0];
          if (!top) return;
          const id = getCardId?.(top) ?? ((top as any)?.id as CardId);
          if (id == null) return;

          if (gesture.dx > swipeThreshold) { animateOffscreen("right", id); return; }
          if (gesture.dx < -swipeThreshold) { animateOffscreen("left", id);  return; }

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

  const visible = cards.slice(0, 3);

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {[...visible].reverse().map((card, reversedIndex) => {
        const index = visible.length - 1 - reversedIndex;
        const isTop    = index === 0;
        const isSecond = index === 1;
        const isThird  = index === 2;

        const transform = isTop
          ? [{ translateX: swipe.x }, { translateY: swipe.y }, { rotate }]
          : isSecond
            ? [{ scale: secondScale }, { translateY: secondTranslateY }]
            : isThird
              ? [{ scale: thirdScale }, { translateY: thirdTranslateY }]
              : undefined;

        return (
          <Animated.View
            key={String(getCardId?.(card) ?? (card as any)?.id ?? index)}
            style={[styles.card, transform ? { transform } : undefined]}
            {...(isTop ? panResponder.panHandlers : undefined)}
          >
            {renderCard?.(card)}
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: "100%",
  },
});

export default SwipeCards;
