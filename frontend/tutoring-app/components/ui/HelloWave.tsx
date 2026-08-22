import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function HelloWave() {
  const rotationAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    rotationAnimation.setValue(0);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotationAnimation, { toValue: 25, duration: 150, useNativeDriver: true }),
        Animated.timing(rotationAnimation, { toValue: 0,  duration: 150, useNativeDriver: true }),
      ]),
      { iterations: 4 }
    );

    animation.start();
    return () => animation.stop();
  }, [rotationAnimation]);

  const rotate = rotationAnimation.interpolate({
    inputRange: [0, 25],
    outputRange: ['0deg', '25deg'],
  });

  return (
    <Animated.View style={[styles.wave, { transform: [{ rotate }] }]}>
      <View style={styles.icon}>
        <MaterialCommunityIcons name="hand-wave" size={28} color="#fff" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wave: {
    display: 'flex',
  },
  icon: {
    marginTop: -6,
  },
});
