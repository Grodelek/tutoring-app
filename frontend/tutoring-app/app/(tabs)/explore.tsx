import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";
import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#1a1a2e" }}
      headerImage={
        <IconSymbol
          size={280}
          color="#888"
          name="person.2.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Skill Swap</ThemedText>
      </ThemedView>
      <ThemedText style={styles.paragraph}>
        Welcome to <ThemedText style={styles.highlight}>Skill Swap</ThemedText>{" "}
        — a student-driven platform where you exchange skills and earn points.
      </ThemedText>

      <Collapsible title="How It Works">
        <ThemedText style={styles.paragraph}>
          Students offer services (like tutoring, design, or editing) and earn
          points from others. These points can then be used to request help in
          return. No money needed — just pure collaboration!
        </ThemedText>
      </Collapsible>

      <Collapsible title="Earn Points">
        <ThemedText style={styles.paragraph}>
          Every time you help someone, you receive points. More helpfulness =
          more credibility and influence in the community.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Post & Request Services">
        <ThemedText style={styles.paragraph}>
          Use the platform to list your services or request help from others.
          All activity is tracked with points and feedback.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Track Progress & History">
        <ThemedText style={styles.paragraph}>
          Access a dashboard to view completed swaps, points earned/spent, and
          peer feedback.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Join the Community">
        <ThemedText style={styles.paragraph}>
          Build your profile, connect with other students, and grow your network
          while improving your soft skills.
        </ThemedText>
        <ExternalLink href="https://example.com">
          <ThemedText type="link">Learn more on our site</ThemedText>
        </ExternalLink>
      </Collapsible>

      <Collapsible title="Mobile-first Design">
        <ThemedText style={styles.paragraph}>
          The app is optimized for Android, iOS, and web — making it easy to
          swap skills wherever you are.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText style={styles.paragraph}>
              Parallax header powered by our{" "}
              <ThemedText type="defaultSemiBold">custom ScrollView</ThemedText>{" "}
              for smooth UX.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#888",
    bottom: -70,
    left: -30,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  paragraph: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  highlight: {
    color: "#b29eff",
    fontWeight: "600",
  },
});
