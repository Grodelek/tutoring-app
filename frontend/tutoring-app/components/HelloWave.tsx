import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

export function HelloWave() {
  const rotationAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    rotationAnimation.setValue(0);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotationAnimation, {
          toValue: 25,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 4 }
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [rotationAnimation]);

  const rotate = rotationAnimation.interpolate({
    inputRange: [0, 25],
    outputRange: ['0deg', '25deg'],
  });

  return (
    <Animated.View style={[styles.wave, { transform: [{ rotate }] }]}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wave: {
    display: 'flex',
  },
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
