import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchLessonsByTutorId, Lesson } from "@/api/lessonApi";
import { C, T, R } from "@/constants/theme";
import { Card } from "@/components/ui/Card";

function statusLabel(s: string | null) {
  if (s === "ACTIVE") return "Aktywne";
  if (s === "COMPLETED") return "Zakończone";
  if (s === "CANCELLED") return "Anulowane";
  if (s === "PENDING") return "Oczekujące";
  return "Aktywne";
}

function statusColor(s: string | null) {
  if (s === "COMPLETED") return C.teal;
  if (s === "CANCELLED") return C.coral;
  return C.green;
}

function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.subject} numberOfLines={1}>{lesson.subject}</Text>
          {!!lesson.description && (
            <Text style={styles.desc} numberOfLines={2}>{lesson.description}</Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={styles.price}>
            {lesson.price != null ? `${lesson.price} zł` : "—"}
          </Text>
          <Text style={styles.duration}>{lesson.durationTime} min</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={[styles.statusPill, { backgroundColor: statusColor(lesson.status) + "22" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor(lesson.status) }]} />
          <Text style={[styles.statusText, { color: statusColor(lesson.status) }]}>
            {statusLabel(lesson.status)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const TutorDashboard: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [lessons, setLessons]     = useState<Lesson[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLessons = useCallback(async (isRefresh = false) => {
    const tutorId = await AsyncStorage.getItem("userId");
    if (!tutorId) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await fetchLessonsByTutorId(tutorId);
      setLessons(data ?? []);
    } catch {
      setLessons([]);
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  }, []);

  useEffect(() => { loadLessons(); }, [loadLessons]);

  const active    = lessons.filter(l => !l.status || l.status === "ACTIVE" || l.status === "PENDING");
  const completed = lessons.filter(l => l.status === "COMPLETED" || l.status === "CANCELLED");

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSub}>
            {loading ? "Ładowanie…" : `${active.length} aktywnych ogłoszeń`}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(auth)/createPost" as any)}
          style={styles.addBtn}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#241608" />
          <Text style={styles.addBtnText}>Nowe</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={C.amber} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom, 24) }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadLessons(true)}
              tintColor={C.amber}
            />
          }
        >
          {lessons.length === 0 ? (
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="briefcase-off-outline" size={64} color={C.border} />
              <Text style={styles.emptyTitle}>Brak ogłoszeń</Text>
              <Text style={styles.emptySub}>
                Dodaj pierwsze ogłoszenie, aby studenci mogli Cię znaleźć
              </Text>
              <Pressable
                onPress={() => router.push("/(auth)/createPost" as any)}
                style={styles.emptyBtn}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#241608" />
                <Text style={styles.emptyBtnText}>Dodaj ogłoszenie</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {active.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Aktywne</Text>
                  {active.map(l => <LessonCard key={l.id} lesson={l} />)}
                </>
              )}
              {completed.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Archiwum</Text>
                  {completed.map(l => <LessonCard key={l.id} lesson={l} />)}
                </>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 24,
    letterSpacing: -0.5,
    color: C.text,
  },
  headerSub: {
    fontFamily: T.family.medium,
    fontSize: 12,
    color: C.textDim,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: R.full,
    backgroundColor: C.amber,
    borderBottomWidth: 3,
    borderBottomColor: C.amberDark,
  },
  addBtnText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 13,
    color: "#241608",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 10,
  },
  sectionLabel: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: C.textDim,
    marginTop: 8,
    marginBottom: 2,
  },

  card: {
    backgroundColor: C.surface,
    borderColor: C.border,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  subject: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 17,
    color: C.text,
    letterSpacing: -0.3,
  },
  desc: {
    fontFamily: T.family.medium,
    fontSize: 13,
    color: C.textDim,
    marginTop: 3,
    lineHeight: 18,
  },
  price: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 16,
    color: C.amber,
  },
  duration: {
    fontFamily: T.family.medium,
    fontSize: 11,
    color: C.textDim,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: R.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 12,
  },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 20,
    color: C.text,
    textAlign: "center",
  },
  emptySub: {
    fontFamily: T.family.medium,
    fontSize: 14,
    color: C.textDim,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: R.full,
    backgroundColor: C.amber,
    borderBottomWidth: 4,
    borderBottomColor: C.amberDark,
  },
  emptyBtnText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 15,
    color: "#241608",
  },
});

export default TutorDashboard;
