import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

const PREFERENCES_KEY = "tutorPreferences";

const ExplorePreferences: React.FC = () => {
  const colorScheme = useColorScheme();
  const themeColors = useMemo(
    () => (colorScheme === "dark" ? Colors.dark : Colors.light),
    [colorScheme]
  );
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("4");
  const [priceImportance, setPriceImportance] = useState("3");
  const [preferredTeachingStyle, setPreferredTeachingStyle] = useState<string | null>(null);
  const [preferredUserType, setPreferredUserType] = useState<string | null>(null);
  const [preferredAvailability, setPreferredAvailability] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (saved.subject) setSubject(String(saved.subject));
        if (saved.minPrice != null) setMinPrice(String(saved.minPrice));
        if (saved.maxPrice != null) setMaxPrice(String(saved.maxPrice));
        if (saved.minRating != null) setMinRating(String(saved.minRating));
        if (saved.priceImportance != null) setPriceImportance(String(saved.priceImportance));
        if (saved.preferredTeachingStyle) setPreferredTeachingStyle(saved.preferredTeachingStyle);
        if (saved.preferredUserType) setPreferredUserType(saved.preferredUserType);
        if (saved.preferredAvailability) setPreferredAvailability(saved.preferredAvailability);
      } catch {
      }
    };
    loadPreferences();
  }, []);

  const redirectToExplore = () => {
    router.push({
      pathname: "/(auth)/exploreTutors",
    });
  }

  const handleStartSwiping = useCallback(async () => {
    try {
      setLoading(true);
       const filters = {
        subject: subject.trim() || null,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        minRating: minRating ? Number(minRating) : null,
        priceImportance: priceImportance ? Number(priceImportance) : null,
        preferredTeachingStyle,
        preferredUserType,
        preferredAvailability,
       };

      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(filters));

      router.push({
        pathname: "/(auth)/exploreTutors",
        params: { filters: JSON.stringify(filters) },
      });
    } finally {
      setLoading(false);
    }
  }, [subject, minPrice, maxPrice, minRating, priceImportance, preferredTeachingStyle, preferredUserType, preferredAvailability, router]);

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Find tutor</Text>
      <Text style={[styles.subtitle, { color: themeColors.secondaryText }]}>
        Set your preferences and then swipe through the best matches.
      </Text>

      <View
        style={[
          styles.filtersCard,
          { backgroundColor: themeColors.cardBackground },
        ]}
      >
        <Text style={[styles.label, { color: themeColors.secondaryText }]}>Subject</Text>
        <TextInput
          placeholder="e.g. Math, English"
          placeholderTextColor={themeColors.placeholder}
          style={[
            styles.input,
            {
              backgroundColor: themeColors.inputBackground,
              borderColor: themeColors.inputBorder,
              color: themeColors.text,
            },
          ]}
          value={subject}
          onChangeText={setSubject}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={[styles.label, { color: themeColors.secondaryText }]}>Min price</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={themeColors.placeholder}
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.inputBackground,
                  borderColor: themeColors.inputBorder,
                  color: themeColors.text,
                },
              ]}
              value={minPrice}
              onChangeText={setMinPrice}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={[styles.label, { color: themeColors.secondaryText }]}>Max price</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="100"
              placeholderTextColor={themeColors.placeholder}
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.inputBackground,
                  borderColor: themeColors.inputBorder,
                  color: themeColors.text,
                },
              ]}
              value={maxPrice}
              onChangeText={setMaxPrice}
            />
          </View>
        </View>

        <Text style={[styles.label, { color: themeColors.secondaryText }]}>Minimal rating (1-5)</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="4"
          placeholderTextColor={themeColors.placeholder}
          style={[
            styles.input,
            {
              backgroundColor: themeColors.inputBackground,
              borderColor: themeColors.inputBorder,
              color: themeColors.text,
            },
          ]}
          value={minRating}
          onChangeText={setMinRating}
        />

        <Text style={[styles.label, { color: themeColors.secondaryText }]}>Price importance (1-5)</Text>
        <TextInput
          keyboardType="numeric"
          placeholder="3"
          placeholderTextColor={themeColors.placeholder}
          style={[
            styles.input,
            {
              backgroundColor: themeColors.inputBackground,
              borderColor: themeColors.inputBorder,
              color: themeColors.text,
            },
          ]}
          value={priceImportance}
          onChangeText={setPriceImportance}
        />

        {/* Teaching style preference */}
        <Text style={[styles.label, { color: themeColors.secondaryText }]}>Teaching style</Text>
        <View style={styles.chipRow}>
          {[
            { label: "Casual", value: "CASUAL" },
            { label: "Professional", value: "PROFESSIONAL" },
            { label: "Flexible", value: "FLEXIBLE" },
          ].map((option) => {
            const selected = preferredTeachingStyle === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() =>
                  setPreferredTeachingStyle(selected ? null : option.value)
                }
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? themeColors.tint
                      : themeColors.inputBackground,
                    borderColor: selected
                      ? themeColors.tint
                      : themeColors.inputBorder,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selected ? "#000" : themeColors.text,
                    fontSize: 12,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tutor type preference */}
        <Text style={[styles.label, { color: themeColors.secondaryText }]}>Tutor type</Text>
        <View style={styles.chipRow}>
          {[
            { label: "Student", value: "STUDENT" },
            { label: "Professional", value: "TUTOR" },
          ].map((option) => {
            const selected = preferredUserType === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() =>
                  setPreferredUserType(selected ? null : option.value)
                }
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? themeColors.tint
                      : themeColors.inputBackground,
                    borderColor: selected
                      ? themeColors.tint
                      : themeColors.inputBorder,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selected ? "#000" : themeColors.text,
                    fontSize: 12,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Availability preference */}
        <Text style={[styles.label, { color: themeColors.secondaryText }]}>Availability</Text>
        <View style={styles.chipRow}>
          {[
            { label: "Weekdays", value: "WEEKDAYS" },
            { label: "Evenings", value: "EVENINGS" },
            { label: "Weekends", value: "WEEKENDS" },
          ].map((option) => {
            const selected = preferredAvailability === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() =>
                  setPreferredAvailability(selected ? null : option.value)
                }
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? themeColors.tint
                      : themeColors.inputBackground,
                    borderColor: selected
                      ? themeColors.tint
                      : themeColors.inputBorder,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selected ? "#000" : themeColors.text,
                    fontSize: 12,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.searchButton, { backgroundColor: themeColors.tint }]}
          onPress={handleStartSwiping}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.searchButtonText}>Start swiping</Text>
          )}
        </Pressable>
        <Pressable
            style={[styles.searchButton, { backgroundColor: themeColors.tint}]}
            onPress={redirectToExplore}
            disabled={loading}
        >
          {loading ? (
              <ActivityIndicator color="#000" />
          ) : (
              <Text style={styles.searchButtonText}>Back</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  filtersCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  searchButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  searchButtonText: {
    color: "#000",
    fontWeight: "600",
  },
});

export default ExplorePreferences;

