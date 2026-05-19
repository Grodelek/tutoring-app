import React, { useMemo, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

type Params = {
  returnTo?: string;
  returnParams?: string;
};

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const toLocalIso = (d: Date) => {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;
};

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

  const now = useMemo(() => new Date(), []);
  const initialDay = useMemo(() => {
	const d = new Date(now);
	d.setHours(0, 0, 0, 0);
	return d;
  }, [now]);

  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [hour, setHour] = useState<number>(Math.min(20, Math.max(8, now.getHours() + 1)));
  const [minute, setMinute] = useState<number>(0);

  const selectedDate = useMemo(() => {
	const d = new Date(initialDay);
	d.setDate(d.getDate() + selectedDayOffset);
	d.setHours(hour, minute, 0, 0);
	return d;
  }, [hour, initialDay, minute, selectedDayOffset]);

  const dayLabel = useMemo(() => {
	const d = new Date(initialDay);
	d.setDate(d.getDate() + selectedDayOffset);
	return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit" });
  }, [initialDay, selectedDayOffset]);

  const goBackWithTime = () => {
	if (selectedDate.getTime() < Date.now() + 5 * 60 * 1000) {
	  Alert.alert("Invalid time", "Choose a time at least 5 minutes in the future.");
	  return;
	}

	const params = {
	  ...parseReturnParams(typeof returnParams === "string" ? returnParams : undefined),
	  scheduledTime: toLocalIso(selectedDate),
	};

	if (typeof returnTo === "string" && returnTo.length > 0) {
	  router.replace({ pathname: returnTo as any, params });
	} else {
	  // If no returnTo, push params to current route then go back
	  router.setParams(params);
	  router.back();
	}
  };

  return (
	<View style={styles.container}>
	  <Text style={styles.title}>Pick date & time</Text>

	  <View style={styles.section}>
		<Text style={styles.sectionTitle}>Day</Text>
		<View style={styles.row}>
		  <TouchableOpacity
			style={[styles.btn, selectedDayOffset <= 0 && styles.btnDisabled]}
			disabled={selectedDayOffset <= 0}
			onPress={() => setSelectedDayOffset((v) => Math.max(0, v - 1))}
		  >
			<Text style={styles.btnText}>Prev</Text>
		  </TouchableOpacity>
		  <View style={styles.valueBox}>
			<Text style={styles.valueText}>{dayLabel}</Text>
		  </View>
		  <TouchableOpacity style={styles.btn} onPress={() => setSelectedDayOffset((v) => v + 1)}>
			<Text style={styles.btnText}>Next</Text>
		  </TouchableOpacity>
		</View>
	  </View>

	  <View style={styles.section}>
		<Text style={styles.sectionTitle}>Time</Text>
		<View style={styles.row}>
		  <View style={styles.timeGroup}>
			<Text style={styles.label}>Hour</Text>
			<View style={styles.row}>
			  <TouchableOpacity style={styles.btnSmall} onPress={() => setHour((h) => (h + 23) % 24)}>
				<Text style={styles.btnText}>-</Text>
			  </TouchableOpacity>
			  <View style={styles.valueBoxSmall}>
				<Text style={styles.valueText}>{pad2(hour)}</Text>
			  </View>
			  <TouchableOpacity style={styles.btnSmall} onPress={() => setHour((h) => (h + 1) % 24)}>
				<Text style={styles.btnText}>+</Text>
			  </TouchableOpacity>
			</View>
		  </View>

		  <View style={styles.timeGroup}>
			<Text style={styles.label}>Minute</Text>
			<View style={styles.row}>
			  <TouchableOpacity style={styles.btnSmall} onPress={() => setMinute((m) => (m + 55) % 60)}>
				<Text style={styles.btnText}>-</Text>
			  </TouchableOpacity>
			  <View style={styles.valueBoxSmall}>
				<Text style={styles.valueText}>{pad2(minute)}</Text>
			  </View>
			  <TouchableOpacity style={styles.btnSmall} onPress={() => setMinute((m) => (m + 5) % 60)}>
				<Text style={styles.btnText}>+</Text>
			  </TouchableOpacity>
			</View>
			<Text style={styles.hint}>Step: 5 min</Text>
		  </View>
		</View>
	  </View>

	  <View style={styles.section}>
		<Text style={styles.sectionTitle}>Selected</Text>
		<Text style={styles.selectedText}>{selectedDate.toLocaleString()}</Text>
		<Text style={styles.selectedSubText}>Will be sent as: {toLocalIso(selectedDate)}</Text>
	  </View>

	  <View style={styles.bottomRow}>
		<TouchableOpacity style={[styles.btnWide, styles.btnSecondary]} onPress={() => router.back()}>
		  <Text style={styles.btnText}>Cancel</Text>
		</TouchableOpacity>
		<TouchableOpacity style={[styles.btnWide, styles.btnPrimary]} onPress={goBackWithTime}>
		  <Text style={styles.btnText}>Confirm</Text>
		</TouchableOpacity>
	  </View>
	  {Platform.OS === "web" && <Text style={styles.webHint}>Web note: this is a simple picker (no native date picker).</Text>}
	</View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f10", padding: 16 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  section: { backgroundColor: "#1a1a1d", padding: 12, borderRadius: 12, marginBottom: 12 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  btn: { backgroundColor: "#2d2d32", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  btnDisabled: { opacity: 0.4 },
  btnSmall: { backgroundColor: "#2d2d32", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "700" },
  btnWide: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12 },
  btnPrimary: { backgroundColor: "#4CAF50" },
  btnSecondary: { backgroundColor: "#2d2d32" },
  valueBox: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#111114" },
  valueBoxSmall: { minWidth: 54, alignItems: "center", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "#111114" },
  valueText: { color: "#fff" },
  selectedText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  selectedSubText: { color: "#b5b5b5", marginTop: 6 },
  timeGroup: { flex: 1 },
  label: { color: "#b5b5b5", marginBottom: 6 },
  hint: { color: "#8d8d8d", marginTop: 6, fontSize: 12 },
  bottomRow: { flexDirection: "row", gap: 10, marginTop: "auto" },
  webHint: { color: "#777", fontSize: 12, marginTop: 10 },
});
