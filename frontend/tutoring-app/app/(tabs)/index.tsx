import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  Image as RNImage,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const themeColors = useMemo(
      () => (colorScheme === "dark" ? Colors.dark : Colors.light),
      [colorScheme]
  );

  const handleGetStarted = () => {
    router.push("/register");
  };

  return (
      <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: themeColors.background },
          ]}
      >
        <View style={styles.heroSection}>
          <RNImage
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
          />
          <Text style={[styles.heroTitle, { color: themeColors.text }]}>
            Skill Swap
          </Text>
          <Text style={[styles.heroSubtitle, { color: themeColors.secondaryText }]}>
            Exchange knowledge with your community
          </Text>
        </View>

        <View
            style={[
              styles.sectionCard,
              { backgroundColor: themeColors.cardBackground },
            ]}
        >
          <Text style={[styles.featureTitle, { color: themeColors.text }]}>
            How it works
          </Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View
                  style={[styles.stepNumber, { backgroundColor: themeColors.tint }]}
              >
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.stepText, { color: themeColors.text }]}>
                Share your skills
              </Text>
            </View>
            <View style={styles.step}>
              <View
                  style={[styles.stepNumber, { backgroundColor: themeColors.tint }]}
              >
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: themeColors.text }]}>
                Find what you want to learn
              </Text>
            </View>
            <View style={styles.step}>
              <View
                  style={[styles.stepNumber, { backgroundColor: themeColors.tint }]}
              >
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: themeColors.text }]}>
                Connect and learn together
              </Text>
            </View>
          </View>
        </View>

        <View
            style={[
              styles.sectionCard,
              { backgroundColor: themeColors.cardBackground },
            ]}
        >
          <Text style={[styles.featureTitle, { color: themeColors.text }]}>
            Why join us?
          </Text>
          <View style={styles.benefitItem}>
            <Text style={[styles.benefitTitle, { color: themeColors.text }]}>
              Learn anything
            </Text>
            <Text style={[styles.benefitText, { color: themeColors.secondaryText }]}>
              From coding to cooking, find someone who knows what you want to learn
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={[styles.benefitTitle, { color: themeColors.text }]}>
              Teach your passion
            </Text>
            <Text style={[styles.benefitText, { color: themeColors.secondaryText }]}>
              Share your expertise and help others grow
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={[styles.benefitTitle, { color: themeColors.text }]}>
              Earn points
            </Text>
            <Text style={[styles.benefitText, { color: themeColors.secondaryText }]}>
              Build your reputation and track your progress
            </Text>
          </View>
        </View>

        <Pressable
            style={[styles.ctaButton, { backgroundColor: themeColors.tint }]}
            onPress={handleGetStarted}
        >
          <Text style={styles.ctaButtonText}>Get started</Text>
        </Pressable>

        <View style={styles.spacer} />
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 12,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  stepContainer: {
    gap: 12,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  stepText: {
    fontSize: 15,
    flex: 1,
  },
  benefitItem: {
    marginBottom: 14,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 16,
  },
  ctaButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  spacer: {
    height: 40,
  },
});