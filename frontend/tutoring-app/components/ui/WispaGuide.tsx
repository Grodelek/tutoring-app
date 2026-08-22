import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Wispa } from "./Wispa";
import { C, R, T } from "@/constants/theme";

const STORAGE_KEY = "wispaGuideDismissed";

interface WispaGuideProps {
  messages: string[];
}

export function WispaGuide({ messages }: WispaGuideProps) {
  const [visible, setVisible]   = useState(false);
  const [index, setIndex]       = useState(0);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    (async () => {
      const dismissed = await AsyncStorage.getItem(STORAGE_KEY);
      if (dismissed === "true") return;
      setVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    })();
  }, [fadeAnim, slideAnim]);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 24,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      setVisible(false);
      await AsyncStorage.setItem(STORAGE_KEY, "true");
    });
  }, [fadeAnim, slideAnim]);

  const handleNext = useCallback(() => {
    if (index >= messages.length - 1) {
      dismiss();
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, messages.length, dismiss]);

  if (!visible) return null;

  const isLast = index === messages.length - 1;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.row}>
        {/* Speech bubble */}
        <View style={styles.bubble}>
          <Text style={styles.message}>{messages[index]}</Text>
          <Pressable onPress={handleNext} style={styles.nextBtn}>
            <Text style={styles.nextText}>{isLast ? "Rozumiem!" : "Dalej →"}</Text>
          </Pressable>
        </View>

        {/* Caret pointing right toward Wispa */}
        <View style={styles.caret} />

        {/* Ghost mascot */}
        <Wispa size={72} floating />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    right: 12,
    zIndex: 50,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  // speech bubble
  bubble: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    maxWidth: 210,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 12,
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    fontFamily: T.family.medium,
    fontSize: 14,
    color: C.text,
    lineHeight: 21,
  },
  nextBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: C.purple,
    borderRadius: R.full,
    borderBottomWidth: 3,
    borderBottomColor: "#7952D9",
  },
  nextText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 13,
    color: "#fff",
  },

  // right-pointing triangle (border trick)
  caret: {
    width: 0,
    height: 0,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderLeftWidth: 11,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: C.surface,
    marginBottom: 28, // align with middle of bubble
  },
});
