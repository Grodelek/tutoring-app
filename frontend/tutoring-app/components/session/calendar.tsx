import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { C, T, R, S } from "@/constants/theme";

type Params = {
  returnTo?: string;
  returnParams?: string;
};

const HOUR_SLOTS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const MINUTE_STEP = 5;

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const toLocalIso = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;

const parseReturnParams = (raw?: string): Record<string, any> => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export default function CalendarScreen() {
  const { returnTo, returnParams } = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();

  const now = useMemo(() => new Date(), []);
  const initialDay = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);

  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [hour, setHour] = useState<number | null>(null);
  const [minute, setMinute] = useState<number>(0);

  const selectedDate = useMemo(() => {
    if (hour == null) return null;
    const d = new Date(initialDay);
    d.setDate(d.getDate() + selectedDayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  }, [hour, minute, initialDay, selectedDayOffset]);

  const dayLabel = useMemo(() => {
    const d = new Date(initialDay);
    d.setDate(d.getDate() + selectedDayOffset);
    return d.toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, [initialDay, selectedDayOffset]);

  const isHourDisabled = (h: number) => {
    const d = new Date(initialDay);
    d.setDate(d.getDate() + selectedDayOffset);
    d.setHours(h, 59, 0, 0);
    return d.getTime() < Date.now() + 5 * 60 * 1000;
  };

  const handleHourPress = (h: number) => {
    setHour(h);
    setMinute(0);
  };

  const adjustMinute = (delta: number) => {
    setMinute((m) => Math.min(55, Math.max(0, m + delta)));
  };

  const confirm = () => {
    if (!selectedDate) {
      Alert.alert("Wybierz godzinę", "Zaznacz dostępną godzinę.");
      return;
    }
    if (selectedDate.getTime() < Date.now() + 5 * 60 * 1000) {
      Alert.alert("Nieprawidłowa godzina", "Wybierz termin co najmniej 5 minut w przyszłości.");
      return;
    }
    const params = {
      ...parseReturnParams(typeof returnParams === "string" ? returnParams : undefined),
      scheduledTime: toLocalIso(selectedDate),
    };
    if (typeof returnTo === "string" && returnTo.length > 0) {
      router.replace({ pathname: returnTo as any, params });
    } else {
      router.setParams(params);
      router.back();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Wybierz termin</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.navBtn, selectedDayOffset <= 0 && styles.btnDisabled]}
              disabled={selectedDayOffset <= 0}
              onPress={() => setSelectedDayOffset((v) => Math.max(0, v - 1))}
            >
              <MaterialCommunityIcons name="chevron-left" size={22} color={C.text} />
            </TouchableOpacity>
            <View style={styles.dayBox}>
              <Text style={styles.dayText}>{dayLabel}</Text>
            </View>
            <TouchableOpacity style={styles.navBtn} onPress={() => setSelectedDayOffset((v) => v + 1)}>
              <MaterialCommunityIcons name="chevron-right" size={22} color={C.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Godzina</Text>
          <View style={styles.slotsWrap}>
            {HOUR_SLOTS.map((h) => {
              const disabled = isHourDisabled(h);
              const active = hour === h;
              return (
                <TouchableOpacity
                  key={h}
                  disabled={disabled}
                  onPress={() => handleHourPress(h)}
                  style={[styles.slot, active && styles.slotActive, disabled && styles.slotDisabled]}
                >
                  <Text style={[styles.slotText, active && styles.slotTextActive, disabled && styles.slotTextDisabled]}>
                    {pad2(h)}:00
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {hour != null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minuta</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepBtn, minute === 0 && styles.btnDisabled]}
                disabled={minute === 0}
                onPress={() => adjustMinute(-MINUTE_STEP)}
              >
                <MaterialCommunityIcons name="minus" size={20} color={C.text} />
              </TouchableOpacity>
              <View style={styles.timeDisplay}>
                <Text style={styles.timeText}>
                  {pad2(hour)}:{pad2(minute)}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.stepBtn, minute === 55 && styles.btnDisabled]}
                disabled={minute === 55}
                onPress={() => adjustMinute(MINUTE_STEP)}
              >
                <MaterialCommunityIcons name="plus" size={20} color={C.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wybrany termin</Text>
          <Text style={styles.selectedText}>
            {selectedDate ? selectedDate.toLocaleString("pl-PL") : "Nie wybrano godziny"}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={[styles.wideBtn, styles.secondaryBtn]} onPress={() => router.back()}>
          <Text style={styles.secondaryBtnText}>Anuluj</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.wideBtn, styles.primaryBtn, !selectedDate && styles.btnDisabled]}
          disabled={!selectedDate}
          onPress={confirm}
        >
          <Text style={styles.primaryBtnText}>Potwierdź</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, paddingHorizontal: S.lg },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.md },
  iconBtn: { padding: 4, width: 32 },
  title: { color: C.text, fontFamily: T.family.extraBold, fontSize: T.size.h3, letterSpacing: T.tracking.h3 },

  section: { backgroundColor: C.surface, padding: S.lg, borderRadius: R.lg, marginBottom: S.md, borderWidth: 1, borderColor: C.border },
  sectionTitle: { color: C.textDim, fontFamily: T.family.black, fontSize: T.size.micro, letterSpacing: T.tracking.micro, textTransform: "uppercase", marginBottom: S.md },

  row: { flexDirection: "row", alignItems: "center", gap: S.sm },
  navBtn: { backgroundColor: C.surfaceUp, padding: 10, borderRadius: R.md, borderWidth: 1, borderColor: C.border },
  btnDisabled: { opacity: 0.35 },
  dayBox: { flex: 1, paddingVertical: 12, paddingHorizontal: S.md, borderRadius: R.md, backgroundColor: C.bgDeep, alignItems: "center" },
  dayText: { color: C.text, fontFamily: T.family.bold, fontSize: T.size.bodyLg, textTransform: "capitalize" },

  slotsWrap: { flexDirection: "row", flexWrap: "wrap", gap: S.sm },
  slot: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: R.md, backgroundColor: C.bgDeep, borderWidth: 1.5, borderColor: C.border, minWidth: 64, alignItems: "center" },
  slotActive: { backgroundColor: C.teal, borderColor: C.teal },
  slotDisabled: { opacity: 0.3 },
  slotText: { color: C.text, fontFamily: T.family.bold, fontSize: T.size.body },
  slotTextActive: { color: "#fff" },
  slotTextDisabled: { color: C.textFaint },

  stepperRow: { flexDirection: "row", alignItems: "center", gap: S.md },
  stepBtn: { backgroundColor: C.surfaceUp, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: C.border },
  timeDisplay: { flex: 1, alignItems: "center", paddingVertical: 12, backgroundColor: C.bgDeep, borderRadius: R.md },
  timeText: { color: C.teal, fontFamily: T.family.extraBold, fontSize: T.size.h3, letterSpacing: T.tracking.h3 },

  selectedText: { color: C.text, fontFamily: T.family.bold, fontSize: T.size.bodyLg },

  bottomRow: { flexDirection: "row", gap: S.sm, paddingTop: S.sm },
  wideBtn: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: R.full },
  primaryBtn: { backgroundColor: C.amber, borderBottomWidth: 3, borderBottomColor: C.amberDark },
  primaryBtnText: { color: "#241608", fontFamily: T.family.extraBold, fontSize: T.size.bodyLg },
  secondaryBtn: { backgroundColor: C.surfaceUp, borderWidth: 1.5, borderColor: C.border },
  secondaryBtnText: { color: C.text, fontFamily: T.family.bold, fontSize: T.size.bodyLg },
});
