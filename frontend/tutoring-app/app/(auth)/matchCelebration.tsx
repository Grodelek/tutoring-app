import React from "react";
import { StyleSheet, Text, View } from "react-native";

function MatchCelebration() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>MatchCelebration</Text>
      <Text style={styles.subtitle}>
        Ten ekran jest chwilowo wyłączony (problem z Reanimated na Twoim środowisku).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
  },
});

export default MatchCelebration;
