import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Path, Ellipse, Circle, Polygon, Rect } from "react-native-svg";

interface WispaProps {
  size?: number;
  floating?: boolean;
}

export function Wispa({ size = 96, floating = true }: WispaProps) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!floating) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -6,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [floating, translateY]);

  return (
    <Animated.View style={floating ? { transform: [{ translateY }] } : undefined}>
      <Svg viewBox="0 0 100 110" width={size} height={size * 1.1}>

        {/* ── mortarboard hat (rendered first = below body) ── */}
        {/* skullcap */}
        <Path
          d="M30 22 C30 14 70 14 70 22 L70 28 L30 28 Z"
          fill="#241A47"
          stroke="#120D26"
          strokeWidth="1"
        />
        {/* flat board */}
        <Polygon
          points="14,22 50,12 86,22 50,32"
          fill="#241A47"
          stroke="#120D26"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* golden button */}
        <Circle cx="50" cy="22" r="2" fill="#FFD15C" />
        {/* tassel cord */}
        <Path
          d="M50 22 Q66 24 72 30"
          stroke="#FFD15C"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        {/* tassel body */}
        <Rect x="69" y="28" width="6" height="9" rx="1" fill="#FFD15C" />
        {/* tassel fringe */}
        <Path
          d="M69 36 L70 40 M71 36 L72 41 M73 36 L74 40 M75 36 L75 39"
          stroke="#FFD15C"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* ── ghost body (Y+16 from original) ── */}
        <Path
          d="M50 30 C72 30 86 46 86 64 L86 100 L80 92 L72 104 L62 92 L50 104 L38 92 L28 104 L20 92 L14 100 L14 64 C14 46 28 30 50 30 Z"
          fill="#D5C7FF"
        />
        {/* highlight */}
        <Ellipse cx="34" cy="46" rx="11" ry="6" fill="#F2EDFF" opacity="0.7" />
        {/* arms */}
        <Ellipse cx="12" cy="68" rx="6" ry="11" fill="#D5C7FF" />
        <Ellipse cx="88" cy="68" rx="6" ry="11" fill="#D5C7FF" />
        {/* cheeks */}
        <Circle cx="32" cy="72" r="4" fill="#FF8DBF" opacity="0.55" />
        <Circle cx="68" cy="72" r="4" fill="#FF8DBF" opacity="0.55" />
        {/* eyes */}
        <Ellipse cx="42" cy="62" rx="6" ry="7" fill="#1A1335" />
        <Ellipse cx="58" cy="62" rx="6" ry="7" fill="#1A1335" />
        <Circle cx="43.5" cy="60" r="2.2" fill="#fff" />
        <Circle cx="59.5" cy="60" r="2.2" fill="#fff" />
        {/* smile */}
        <Path d="M44 76 Q50 82 56 76 Q50 80 44 76 Z" fill="#1A1335" />

      </Svg>
    </Animated.View>
  );
}
