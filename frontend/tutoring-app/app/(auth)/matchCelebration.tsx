import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { C, R, S, T } from "@/constants/theme";
import { Wispa } from "@/components/ui/Wispa";

type Params = { conversationId?: string; receiverId?: string; tutorName?: string };

const SPARKLES = [
  { left: "8%",  top: "6%",  size: 14, delay: 0,    color: C.gold },
  { left: "78%", top: "4%",  size: 10, delay: 400,  color: C.purple },
  { left: "90%", top: "18%", size: 16, delay: 800,  color: C.teal },
  { left: "4%",  top: "28%", size: 10, delay: 200,  color: C.amber },
  { left: "65%", top: "10%", size: 12, delay: 600,  color: C.gold },
  { left: "30%", top: "3%",  size: 8,  delay: 1000, color: C.coral },
  { left: "85%", top: "38%", size: 10, delay: 300,  color: C.green },
  { left: "12%", top: "50%", size: 8,  delay: 700,  color: C.purple },
  { left: "50%", top: "2%",  size: 12, delay: 500,  color: C.teal },
  { left: "92%", top: "55%", size: 8,  delay: 150,  color: C.gold },
] as const;

function Sparkle({ left, top, size, delay, color }: typeof SPARKLES[number]) {
  const op    = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(op,    { toValue: 1,   duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1,   duration: 700, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(op,    { toValue: 0,   duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.3, duration: 700, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.delay(800),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left,
        top,
        opacity: op,
        transform: [{ scale }],
      }}
    >
      <MaterialCommunityIcons name="star-four-points" size={size} color={color} />
    </Animated.View>
  );
}

export default function MatchCelebration() {
  const { conversationId, receiverId, tutorName } = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();

  const wrapOp   = useRef(new Animated.Value(0)).current;
  const wispaY   = useRef(new Animated.Value(-50)).current;
  const wispaOp  = useRef(new Animated.Value(0)).current;
  const titleOp  = useRef(new Animated.Value(0)).current;
  const titleY   = useRef(new Animated.Value(24)).current;
  const bubbleOp = useRef(new Animated.Value(0)).current;
  const bubbleY  = useRef(new Animated.Value(30)).current;
  const btnOp    = useRef(new Animated.Value(0)).current;
  const btnY     = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(wrapOp, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(wispaOp, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(wispaY,  { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(titleOp, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(titleY,  { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(bubbleOp, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(bubbleY,  { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(btnOp, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(btnY,  { toValue: 0, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const goToChat = () => {
    if (conversationId && receiverId) {
      router.replace({
        pathname: "/(auth)/messages/[conversationId]" as any,
        params: { conversationId, receiverId },
      });
    } else {
      router.replace("/(auth)/conversations" as any);
    }
  };

  const tutorLabel = tutorName ?? "korepetytorem";

  return (
    <Animated.View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24), opacity: wrapOp }]}>
      {SPARKLES.map((s, i) => <Sparkle key={i} {...s} />)}

      <Animated.View style={{ opacity: wispaOp, transform: [{ translateY: wispaY }], alignItems: "center" }}>
        <Wispa size={130} floating />
      </Animated.View>

      <Animated.View style={[styles.titleBlock, { opacity: titleOp, transform: [{ translateY: titleY }] }]}>
        <Text style={styles.congrats}>Gratulacje!</Text>
        <Text style={styles.subtitle}>
          Połączyłeś się z{"\n"}<Text style={styles.tutorName}>{tutorLabel}</Text>
        </Text>
      </Animated.View>

      <Animated.View style={[styles.bubble, { opacity: bubbleOp, transform: [{ translateY: bubbleY }] }]}>
        <View style={styles.bubbleAccent} />
        <View style={styles.bubbleInner}>
          <MaterialCommunityIcons name="creation" size={18} color={C.purple} style={{ marginTop: 2 }} />
          <Text style={styles.bubbleText}>
            Sprawdź jakie inne zajęcia prowadzi Twój korepetytor — kliknij{" "}
            <MaterialCommunityIcons name="calendar-plus" size={14} color={C.teal} />
            {" "}w górnym rogu czatu, żeby zarezerwować kolejne lekcje!
          </Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.btnWrap, { opacity: btnOp, transform: [{ translateY: btnY }] }]}>
        <TouchableOpacity style={styles.ctaBtn} onPress={goToChat} activeOpacity={0.85}>
          <MaterialCommunityIcons name="message-text" size={18} color="#241608" />
          <Text style={styles.ctaText}>Idź do czatu</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: S.xl,
    paddingHorizontal: S.xl,
    overflow: "hidden",
  },
  titleBlock: {
    alignItems: "center",
    gap: S.sm,
  },
  congrats: {
    fontFamily: T.family.black,
    fontSize: 42,
    letterSpacing: -1.5,
    color: C.gold,
  },
  subtitle: {
    fontFamily: T.family.medium,
    fontSize: T.size.bodyLg,
    color: C.textDim,
    textAlign: "center",
    lineHeight: 24,
  },
  tutorName: {
    fontFamily: T.family.extraBold,
    color: C.text,
  },
  bubble: {
    width: "100%",
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1.5,
    borderColor: C.purple,
    overflow: "hidden",
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  bubbleAccent: {
    height: 3,
    backgroundColor: C.purple,
    borderRadius: R.full,
  },
  bubbleInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: S.sm,
    padding: S.lg,
  },
  bubbleText: {
    flex: 1,
    fontFamily: T.family.medium,
    fontSize: T.size.body,
    color: C.text,
    lineHeight: 22,
  },
  btnWrap: {
    width: "100%",
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: S.sm,
    backgroundColor: C.amber,
    borderRadius: R.full,
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: C.amberDark,
  },
  ctaText: {
    fontFamily: T.family.extraBold,
    fontSize: T.size.bodyLg,
    color: "#241608",
  },
});
