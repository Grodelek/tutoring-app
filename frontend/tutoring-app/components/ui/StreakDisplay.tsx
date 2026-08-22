import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, T } from '@/constants/theme';

const DAY_LABELS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'] as const;

interface StreakDisplayProps {
  streak: number;
  /** 7 booleans indexed Mon(0)–Sun(6) */
  completedDays: boolean[];
}

function useQuestFlicker() {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 380, easing: Easing.inOut(Easing.sin) }),
        withTiming(1,    { duration: 620, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 460, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.05, { duration: 640, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
}

export function StreakDisplay({ streak, completedDays }: StreakDisplayProps) {
  const flickerStyle = useQuestFlicker();

  return (
    <View>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.number}>{streak}</Text>
          <Text style={styles.label}>dni z rzędu</Text>
        </View>

        <Animated.View style={[styles.flameWrap, flickerStyle]}>
          <MaterialCommunityIcons name="fire" size={64} color={C.coral} />
        </Animated.View>
      </View>

      <View style={styles.daysRow}>
        {DAY_LABELS.map((day, i) => {
          const done = completedDays[i] ?? false;
          return (
            <View key={day} style={styles.dayCol}>
              {done ? (
                <LinearGradient
                  colors={['#FFA53D', '#FF6B4A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.tileDone}
                >
                  <MaterialCommunityIcons name="fire" size={14} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={styles.tileEmpty} />
              )}
              <Text style={styles.dayLabel}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  number: {
    color: C.coral,
    fontSize: 44,
    fontFamily: T.family.black,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  label: {
    color: C.textDim,
    fontSize: 13,
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    marginTop: 2,
  },
  flameWrap: {
    shadowColor: '#FF6B4A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.67,
    shadowRadius: 16,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tileDone: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C84A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  tileEmpty: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: C.bgDeep,
    borderWidth: 2,
    borderColor: C.border,
  },
  dayLabel: {
    color: C.textFaint,
    fontSize: 10,
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
  },
});
