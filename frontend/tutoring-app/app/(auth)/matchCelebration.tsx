import React, { useEffect } from "react";
import { DimensionValue, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
  G,
} from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { C, T, R } from "@/constants/theme";

const { width: SW, height: SH } = Dimensions.get("window");

const RAY_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);

function RayBurst() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.12, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, animStyle]} pointerEvents="none">
      <Svg width={SW} height={SH} viewBox="0 0 200 200">
        <G>
          {RAY_ANGLES.map((deg) => (
            <Rect
              key={deg}
              x="98"
              y="30"
              width="4"
              height="60"
              rx="2"
              fill="#FFD15C"
              transform={`rotate(${deg}, 100, 100)`}
            />
          ))}
        </G>
      </Svg>
    </Animated.View>
  );
}

interface ConfettiProps {
  color: string;
  size: number;
  top?: DimensionValue;
  bottom?: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
  rotate: number;
  delay: number;
  translateDir?: "up" | "down";
}

function ConfettiDot({ color, size, top, bottom, left, right, rotate, delay, translateDir = "up" }: ConfettiProps) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    const target = translateDir === "up" ? -10 : 10;
    bounce.value = withDelay(delay,
      withRepeat(withSequence(
        withTiming(target, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0,      { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ), -1, false),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }, { rotate: `${rotate}deg` }],
  }));

  return (
    <View
      style={{ position: "absolute", top, bottom, left, right }}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          { width: size, height: size, borderRadius: size * 0.35, backgroundColor: color },
          animStyle,
        ]}
      />
    </View>
  );
}

function AvatarBubble({
  letter,
  color,
  shadowColor,
  translateY,
}: {
  letter: string;
  color: string;
  shadowColor: string;
  translateY: SharedValue<number>;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.avatarOuter,
        { shadowColor },
        animStyle,
      ]}
    >
      <View style={[styles.avatarCircle, { backgroundColor: color }]}>
        <Text style={styles.avatarLetter}>{letter}</Text>
      </View>
    </Animated.View>
  );
}

function RewardPill({
  icon,
  label,
  color,
  delay,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  color: string;
  delay: number;
}) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 260 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <View style={[styles.rewardPill, { borderColor: `${color}55` }]}>
        <MaterialCommunityIcons name={icon} size={14} color={color} />
        <Text style={[styles.rewardText, { color }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

function MatchCelebration(){
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    tutorName?: string;
    subject?: string;
    availability?: string;
    price?: string;
    conversationId?: string;
  }>();

  const tutorName      = params.tutorName     ?? "Jan";
  const subject        = params.subject       ?? "Chemia";
  const availability   = params.availability  ?? "Wieczorami";
  const price          = params.price         ?? "105";
  const conversationId = params.conversationId ?? "";

  const bounceA = useSharedValue(0);
  const bounceB = useSharedValue(0);
  const wiggle = useSharedValue(0);

  useEffect(() => {
    bounceA.value = withRepeat(withSequence(
      withTiming(-8, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      withTiming(0,  { duration: 800, easing: Easing.inOut(Easing.sin) }),
    ), -1, false);

    bounceB.value = withRepeat(withSequence(
      withTiming(8,  { duration: 800, easing: Easing.inOut(Easing.sin) }),
      withTiming(0,  { duration: 800, easing: Easing.inOut(Easing.sin) }),
    ), -1, false);

    wiggle.value = withRepeat(withSequence(
      withTiming(-4, { duration: 600, easing: Easing.inOut(Easing.sin) }),
      withTiming(4,  { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      withTiming(0,  { duration: 600, easing: Easing.inOut(Easing.sin) }),
    ), -1, false);
  }, []);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-8 + wiggle.value}deg` }],
  }));

  const handleMessage = () => {
    if (conversationId) {
      router.push({ pathname: "/messages/[conversationId]", params: { conversationId } });
    } else {
      router.push("/(auth)/conversations");
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg width={SW} height={SH}>
          <Defs>
            <RadialGradient
              id="bgGlow"
              cx={SW * 0.5}
              cy={SH * 0.35}
              r={SW * 0.75}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0"    stopColor="#FFA53D" stopOpacity="0.27" />
              <Stop offset="0.6"  stopColor={C.bg}   stopOpacity="1"    />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SW} height={SH} fill="url(#bgGlow)" />
        </Svg>
      </View>

      <RayBurst />

      <ConfettiDot color={C.coral}  size={12} top="14%" left="8%"   rotate={15}  delay={0}   translateDir="down" />
      <ConfettiDot color={C.gold}   size={10} top="10%" right="14%" rotate={-20} delay={120} translateDir="up" />
      <ConfettiDot color={C.purple} size={14} top="28%" right="6%"  rotate={30}  delay={240} translateDir="down" />
      <ConfettiDot color={C.teal}   size={11} bottom="38%" left="5%"  rotate={-10} delay={80}  translateDir="up" />
      <ConfettiDot color={C.green}  size={10} bottom="30%" right="8%" rotate={25}  delay={180} translateDir="down" />
      <ConfettiDot color={C.amber}  size={13} top="22%" left="30%"  rotate={-5}  delay={60}  translateDir="up" />

      <View style={styles.content}>
        <View style={styles.avatarRow}>
          <AvatarBubble
            letter="M"
            color={C.amber}
            shadowColor={C.amber}
            translateY={bounceA}
          />

          <Animated.View style={heartStyle}>
            <View style={styles.heartShadow}>
              <LinearGradient
                colors={[C.coral, C.amber]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heart}
              >
                <MaterialCommunityIcons name="heart" size={28} color="#fff" />
              </LinearGradient>
            </View>
          </Animated.View>

          <AvatarBubble
            letter={tutorName.charAt(0).toUpperCase()}
            color={C.coral}
            shadowColor={C.coral}
            translateY={bounceB}
          />
        </View>

        <Text style={styles.matchLabel}>✦ MATCH ✦</Text>

        <Text style={styles.headline}>To dopasowanie!</Text>

        <Text style={styles.subcopy}>
          Ty i {tutorName} macie wspólne plany.{"\n"}
          {subject} · {availability} · {price} zł / godz.
        </Text>

        <View style={styles.rewardRow}>
          <RewardPill icon="star-four-points" label="+50 XP"  color={C.gold}   delay={0} />
          <RewardPill icon="fire"             label="Streak +1" color={C.coral}  delay={150} />
          <RewardPill icon="trophy"           label="Odznaka" color={C.purple} delay={300} />
        </View>

        <View style={styles.ctaRow}>
          <Pressable onPress={handleMessage} style={styles.ctaCoral}>
            <MaterialCommunityIcons name="chat" size={18} color="#fff" />
            <Text style={styles.ctaCoralText}>Napisz wiadomość</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/(auth)/home")} style={styles.ctaOutline}>
            <Text style={styles.ctaOutlineText}>Kontynuuj</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 28,
    gap: 16,
    width: "100%",
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarOuter: {
    borderRadius: 46,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarLetter: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 36,
    color: "#fff",
  },

  heartShadow: {
    borderRadius: 18,
    shadowColor: C.coralDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  heart: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  matchLabel: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: C.gold,
  },
  headline: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 38,
    letterSpacing: -1.2,
    color: C.text,
    textAlign: "center",
  },
  subcopy: {
    fontFamily: T.family.medium,
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 22,
    color: C.textDim,
    textAlign: "center",
  },

  rewardRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  rewardPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: R.full,
    backgroundColor: C.surface,
    borderWidth: 1.5,
  },
  rewardText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 13,
  },

  ctaRow: {
    width: "100%",
    gap: 10,
    marginTop: 4,
  },
  ctaCoral: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.coral,
    borderRadius: R.full,
    paddingVertical: 15,
    borderBottomWidth: 4,
    borderBottomColor: C.coralDark,
  },
  ctaCoralText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 16,
    color: "#fff",
  },
  ctaOutline: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: R.full,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: C.border,
  },
  ctaOutlineText: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 16,
    color: C.textDim,
  },
});

export default MatchCelebration;
