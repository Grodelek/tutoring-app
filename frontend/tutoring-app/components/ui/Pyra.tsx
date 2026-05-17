import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Circle,
  Path,
  Ellipse,
} from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export type PyraAnimation = 'questFlicker' | 'questBounce' | 'questWiggle';

interface PyraProps {
  size?: number;
  animation?: PyraAnimation;
  style?: StyleProp<ViewStyle>;
}

export function Pyra({ size = 110, animation, style }: PyraProps) {
  const h = Math.round(size * 1.1);

  const scale      = useSharedValue(1);
  const rotateDeg  = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(rotateDeg);
    cancelAnimation(translateY);
    scale.value      = 1;
    rotateDeg.value  = 0;
    translateY.value = 0;

    switch (animation) {
      case 'questFlicker':
        // 2.4 s: scale 1 → 1.04 → 1, rotate 0 → 1deg → 0
        scale.value = withRepeat(
          withSequence(
            withTiming(1.04, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
            withTiming(1,    { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          ),
          -1, false,
        );
        rotateDeg.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          ),
          -1, false,
        );
        break;

      case 'questBounce':
        // 1.6 s: translateY 0 → -8 → 0
        translateY.value = withRepeat(
          withSequence(
            withTiming(-8, { duration: 800, easing: Easing.inOut(Easing.sin) }),
            withTiming(0,  { duration: 800, easing: Easing.inOut(Easing.sin) }),
          ),
          -1, false,
        );
        break;

      case 'questWiggle':
        // 2.4 s: rotate 0 → -4deg → +4deg → 0
        rotateDeg.value = withRepeat(
          withSequence(
            withTiming(-4, { duration:  600, easing: Easing.inOut(Easing.sin) }),
            withTiming( 4, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
            withTiming( 0, { duration:  600, easing: Easing.inOut(Easing.sin) }),
          ),
          -1, false,
        );
        break;
    }
  }, [animation]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotateDeg.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[{ width: size, height: h }, animStyle, style]}>
      <Svg width={size} height={h} viewBox="0 0 100 110">
        <Defs>
          {/* pyraOuter: top → bottom, gold → amber → coral */}
          <LinearGradient id="pyraOuter" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"   stopColor="#FFD15C" />
            <Stop offset="0.5" stopColor="#FFA53D" />
            <Stop offset="1"   stopColor="#FF6B4A" />
          </LinearGradient>

          {/* pyraInner: pale gold → amber */}
          <LinearGradient id="pyraInner" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFEBA8" />
            <Stop offset="1" stopColor="#FFA53D" />
          </LinearGradient>

          {/* pyraGlow: radial, gold→coral→transparent */}
          <RadialGradient
            id="pyraGlow"
            cx="50" cy="60" r="50"
            fx="50" fy="60"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0"   stopColor="#FFD15C" stopOpacity="0.7" />
            <Stop offset="1"   stopColor="#FF6B4A" stopOpacity="0"   />
          </RadialGradient>
        </Defs>

        {/* 1 — Glow halo */}
        <Circle cx="50" cy="60" r="50" fill="url(#pyraGlow)" />

        {/* 2 — Outer flame body */}
        <Path
          d="M50 6 C58 22 76 28 76 52 C76 76 64 96 50 96 C36 96 24 76 24 52 C24 28 42 22 50 6 Z"
          fill="url(#pyraOuter)"
        />

        {/* 3 — Inner highlight (lighter core) */}
        <Path
          d="M50 28 C54 38 64 46 64 60 C64 76 58 88 50 88 C42 88 36 76 36 60 C36 46 46 38 50 28 Z"
          fill="url(#pyraInner)"
          opacity="0.7"
        />

        {/* 4 — Face base circle */}
        <Circle cx="50" cy="64" r="22" fill="#FFA53D" />

        {/* 5 — Cheeks */}
        <Circle cx="33" cy="68" r="4" fill="#FF6B4A" opacity="0.5" />
        <Circle cx="67" cy="68" r="4" fill="#FF6B4A" opacity="0.5" />

        {/* 6 — Eyes (pupils) */}
        <Ellipse cx="42" cy="60" rx="6" ry="7" fill="#1A1335" />
        <Ellipse cx="58" cy="60" rx="6" ry="7" fill="#1A1335" />

        {/* 7 — Eye shine */}
        <Circle cx="44" cy="57" r="2" fill="#ffffff" />
        <Circle cx="60" cy="57" r="2" fill="#ffffff" />

        {/* 8 — Smile */}
        <Path
          d="M44 72 Q50 78 56 72"
          stroke="#1A1335"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />

        {/* 9 — Sparkles (4-point stars) */}
        {/* gold — top right */}
        <Path
          d="M75 17 L77 20 L80 22 L77 24 L75 27 L73 24 L70 22 L73 20 Z"
          fill="#FFD15C"
        />
        {/* amber — left side */}
        <Path
          d="M18 38 L19.5 40.5 L22 42 L19.5 43.5 L18 46 L16.5 43.5 L14 42 L16.5 40.5 Z"
          fill="#FFA53D"
        />
        {/* coral — right side */}
        <Path
          d="M81 53 L82.5 55.5 L85 57 L82.5 58.5 L81 61 L79.5 58.5 L77 57 L79.5 55.5 Z"
          fill="#FF6B4A"
        />
      </Svg>
    </Animated.View>
  );
}
