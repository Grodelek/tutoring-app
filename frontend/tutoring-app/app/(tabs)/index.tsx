import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerHeight={250}
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.fullImage}
          contentFit="cover"
        />
      }
    >
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title" style={styles.mainTitle}>
          Welcome to Skill Swap!
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          The platform connecting learners with teachers in your community
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.featureCard}>
        <ThemedText type="subtitle" style={styles.featureTitle}>
          🔁 Exchange Your Skills
        </ThemedText>
        <ThemedText>
          Have something to teach? Find people who can teach you what you need
          to learn. Our skill-for-skill system makes knowledge your currency.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.featureCard}>
        <ThemedText type="subtitle" style={styles.featureTitle}>
          📈 Track Your Progress
        </ThemedText>
        <ThemedText>
          Our system monitors your learning and teaching journey. Visualize your
          development over time and identify areas for improvement.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.featureCard}>
        <ThemedText type="subtitle" style={styles.featureTitle}>
          👥 Build Your Learning Network
        </ThemedText>
        <ThemedText>
          Connect with passionate learners in your area. Skill sharing isnt just
          about knowledge exchange - its about building meaningful
          relationships.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.ctaContainer}>
        <ThemedText style={styles.ctaText}>
          Ready to begin your journey? Create your profile now and discover the
          world of skill sharing in your community!
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  mainTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
  },
  featureCard: {
    backgroundColor: "rgba(161, 206, 220, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  featureTitle: {
    marginBottom: 8,
  },
  ctaContainer: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#A1CEDC",
    borderRadius: 12,
  },
  ctaText: {
    textAlign: "center",
    fontStyle: "italic",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
});
