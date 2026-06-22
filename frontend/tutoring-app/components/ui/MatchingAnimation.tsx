import React, { useEffect, useRef } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, View } from "react-native";
import { C, T } from "@/constants/theme";

interface AvatarConfig {
  initial: string;
  color: string;
}

interface Props {
  visible: boolean;
  student: AvatarConfig;
  tutor: AvatarConfig;
  onComplete: () => void;
}

const BURST_COLORS = [C.gold, C.purple, C.teal, C.coral, C.green, C.amber, "#ffffff", C.gold, C.purple, C.teal, C.coral, C.green];
const NUM_DOTS = 12;
const HOLD_MS = 650;
const BG = "rgba(18,13,38,0.94)";
const SW = 280, SH = 120;
const ORB = 64;

export function MatchingAnimation({ visible, student, tutor, onComplete }: Props) {
  const leftX   = useRef(new Animated.Value(-170)).current;
  const rightX  = useRef(new Animated.Value( 170)).current;
  const ring    = useRef(new Animated.Value(0.1)).current;
  const ringOp  = useRef(new Animated.Value(0)).current;
  const labelOp = useRef(new Animated.Value(0)).current;
  const wrapOp  = useRef(new Animated.Value(0)).current;

  const dots = useRef(
    Array.from({ length: NUM_DOTS }, (_, i) => {
      const angle = (Math.PI * 2 * i) / NUM_DOTS;
      const r = 52 + (i % 4) * 14;
      return {
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        op: new Animated.Value(0),
        tx: Math.cos(angle) * r,
        ty: Math.sin(angle) * r,
      };
    })
  ).current;

  useEffect(() => {
    if (!visible) return;

    leftX.setValue(-170); rightX.setValue(170);
    ring.setValue(0.1);   ringOp.setValue(0);
    labelOp.setValue(0);  wrapOp.setValue(0);
    dots.forEach(d => { d.x.setValue(0); d.y.setValue(0); d.op.setValue(0); });

    Animated.timing(wrapOp, { toValue: 1, duration: 250, useNativeDriver: true }).start();

    Animated.parallel([
      Animated.timing(leftX,  { toValue: -42, duration: 820, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(rightX, { toValue:  42, duration: 820, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(ring,   { toValue: 1,   duration: 460, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(ringOp, { toValue: 0.75, duration: 160, useNativeDriver: true }),
          Animated.timing(ringOp, { toValue: 0,    duration: 300, useNativeDriver: true }),
        ]),
        ...dots.map(d => Animated.parallel([
          Animated.timing(d.op, { toValue: 1, duration: 120, useNativeDriver: true }),
          Animated.timing(d.x,  { toValue: d.tx, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(d.y,  { toValue: d.ty, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(220),
            Animated.timing(d.op, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ])),
        Animated.sequence([
          Animated.delay(260),
          Animated.timing(labelOp, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(wrapOp, { toValue: 0, duration: 280, useNativeDriver: true })
            .start(() => onComplete());
        }, HOLD_MS);
      });
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: wrapOp }]}>
        <View style={[styles.stage, { width: SW, height: SH }]}>
          <Animated.View style={[styles.ring, { opacity: ringOp, transform: [{ scale: ring }] }]} />

          {dots.map((d, i) => (
            <Animated.View key={i} style={[styles.dot, {
              backgroundColor: BURST_COLORS[i % BURST_COLORS.length],
              opacity: d.op,
              transform: [{ translateX: d.x }, { translateY: d.y }],
            }]} />
          ))}

          <Animated.View style={[styles.orb, { transform: [{ translateX: leftX }] }]}>
            <View style={[styles.orbInner, { backgroundColor: student.color }]}>
              <Text style={styles.orbInitial}>{student.initial.toUpperCase()}</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.orb, { transform: [{ translateX: rightX }] }]}>
            <View style={[styles.orbInner, { backgroundColor: tutor.color }]}>
              <Text style={styles.orbInitial}>{tutor.initial.toUpperCase()}</Text>
            </View>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.label, { opacity: labelOp }]}>
          Znaleziono dopasowanie!
        </Animated.Text>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  stage: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    left: (SW - 100) / 2,
    top:  (SH - 100) / 2,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: C.teal,
  },
  dot: {
    position: "absolute",
    left: (SW - 10) / 2,
    top:  (SH - 10) / 2,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  orb: {
    position: "absolute",
    left: (SW - ORB) / 2,
    top:  (SH - ORB) / 2,
  },
  orbInner: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.18)",
  },
  orbInitial: {
    fontFamily: T.family.black,
    fontSize: 26,
    color: "#fff",
  },
  label: {
    fontFamily: T.family.extraBold,
    fontSize: 22,
    letterSpacing: -0.7,
    color: C.text,
    textAlign: "center",
  },
});
