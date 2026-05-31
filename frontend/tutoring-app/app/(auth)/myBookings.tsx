import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { C, T, R, S } from "@/constants/theme";
import { BASE_URL } from "@/config/baseUrl";
import { fetchMyBookings, confirmPayment, Offer } from "@/api/offerApi";

const getImageUri = (photoPath: string | null | undefined): string | null => {
  if (!photoPath) return null;
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) return photoPath;
  if (photoPath.startsWith("/")) return `${BASE_URL}${photoPath}`;
  return photoPath;
};

type Phase = "pending" | "upcoming" | "ongoing" | "toSettle" | "settled" | "declined";

function getPhase(offer: Offer): Phase {
  if (offer.status === "DECLINED") return "declined";
  if (offer.status === "PENDING") return "pending";
  if (offer.completed) return "settled";
  const start = offer.sessionStartTime ? new Date(offer.sessionStartTime) : null;
  const duration = offer.lesson?.durationTime ?? 0;
  const end = start ? new Date(start.getTime() + duration * 60000) : null;
  const now = new Date();
  if (start && now < start) return "upcoming";
  if (start && end && now >= start && now < end) return "ongoing";
  return "toSettle";
}

const PHASE_META: Record<Phase, { label: string; color: string }> = {
  pending: { label: "Oczekuje", color: C.teal },
  upcoming: { label: "Umówione", color: C.green },
  ongoing: { label: "Trwają", color: C.amber },
  toSettle: { label: "Do rozliczenia", color: C.amber },
  settled: { label: "Rozliczone", color: C.green },
  declined: { label: "Odrzucone", color: C.coral },
};

function whenLabel(offer: Offer): string {
  if (!offer.sessionStartTime) return "—";
  const start = new Date(offer.sessionStartTime);
  return start.toLocaleString("pl-PL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyBookingsScreen() {
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<Offer[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert("Błąd", e?.message || "Nie udało się pobrać zajęć.");
      setBookings([]);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleConfirm = async (offerId: string) => {
    try {
      const updated = await confirmPayment(offerId);
      Alert.alert(
        updated.completed ? "Rozliczono" : "Potwierdzono",
        updated.completed
          ? "Zajęcia rozliczone! +10 XP i +1 do streaka."
          : "Czekamy na potwierdzenie korepetytora."
      );
      load();
    } catch (e: any) {
      Alert.alert("Błąd", e?.message || "Nie udało się potwierdzić płatności.");
    }
  };

  const visible = bookings.filter((b) => b.status !== "DECLINED");

  const renderItem = ({ item }: { item: Offer }) => {
    const phase = getPhase(item);
    const meta = PHASE_META[phase];
    const photo = getImageUri(item.tutorPhotoPath);
    const initial = item.tutorUsername?.[0]?.toUpperCase() ?? "?";
    const canConfirm = phase === "toSettle" && !item.studentConfirmedPayment;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.subject}>{item.lesson?.subject ?? "Zajęcia"}</Text>
            <Text style={styles.tutor}>{item.tutorUsername}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: meta.color + "22", borderColor: meta.color }]}>
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="calendar-clock" size={16} color={C.textDim} />
          <Text style={styles.metaText}>{whenLabel(item)}</Text>
        </View>
        {item.lesson?.durationTime ? (
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="timer-outline" size={16} color={C.textDim} />
            <Text style={styles.metaText}>{item.lesson.durationTime} min</Text>
          </View>
        ) : null}
        {item.lesson?.price != null ? (
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="cash" size={16} color={C.textDim} />
            <Text style={styles.metaText}>{item.lesson.price} zł</Text>
          </View>
        ) : null}

        {phase === "toSettle" && (
          <Text style={styles.payInfo}>
            Ty: {item.studentConfirmedPayment ? "✅" : "⏳"}   •   Korepetytor: {item.tutorConfirmedPayment ? "✅" : "⏳"}
          </Text>
        )}

        {canConfirm && (
          <Pressable style={styles.payBtn} onPress={() => handleConfirm(item.id)}>
            <Text style={styles.payBtnText}>Płatność wykonana ✓</Text>
          </Pressable>
        )}

        {phase === "settled" && (
          <Text style={styles.settledText}>+10 XP • +1 🔥</Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moje zajęcia</Text>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.teal} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 16 },
          visible.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={48} color={C.border} />
            <Text style={styles.emptyTitle}>Brak umówionych zajęć</Text>
            <Text style={styles.emptyBody}>Znajdź korepetytora i umów się na sesję w czacie.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontFamily: T.family.black, fontWeight: "900", fontSize: 32, letterSpacing: -1, color: C.text },

  list: { paddingHorizontal: S.lg, paddingTop: S.md, gap: S.md },
  listEmpty: { flexGrow: 1, justifyContent: "center" },

  card: { backgroundColor: C.surface, borderRadius: R.lg, padding: S.lg, borderWidth: 1, borderColor: C.border, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: S.md },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: C.border },
  avatarPlaceholder: { backgroundColor: C.bgDeep, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontFamily: T.family.black, fontWeight: "900", fontSize: 18, color: C.purple },
  subject: { fontFamily: T.family.extraBold, fontWeight: T.weight.extraBold, fontSize: 16, color: C.text },
  tutor: { fontFamily: T.family.medium, fontSize: 13, color: C.teal, marginTop: 2 },

  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.full, borderWidth: 1 },
  badgeText: { fontFamily: T.family.extraBold, fontWeight: T.weight.extraBold, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { fontFamily: T.family.medium, fontSize: 13, color: C.textDim, textTransform: "capitalize" },

  payInfo: { fontFamily: T.family.medium, fontSize: 12, color: C.textDim, marginTop: 4 },
  payBtn: { backgroundColor: C.amber, paddingVertical: 11, borderRadius: R.full, alignItems: "center", marginTop: 8, borderBottomWidth: 3, borderBottomColor: C.amberDark },
  payBtnText: { fontFamily: T.family.extraBold, fontWeight: T.weight.extraBold, fontSize: 14, color: "#241608" },
  settledText: { fontFamily: T.family.bold, fontWeight: T.weight.bold, fontSize: 13, color: C.green, marginTop: 4 },

  emptyWrap: { alignItems: "center", gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: T.family.extraBold, fontWeight: T.weight.extraBold, fontSize: 18, color: C.text },
  emptyBody: { fontFamily: T.family.medium, fontSize: 14, color: C.textDim, textAlign: "center", lineHeight: 20 },
});
