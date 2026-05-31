import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@components/ui/Card";
import { Chip } from "@components/ui/Chip";
import { C, T, R } from "@/constants/theme";
import { fetchTutors } from "@/api/tutorDiscoveryApi";
import { getFavoriteTutors } from "@/api/favoriteApi";

const PREFERENCES_KEY = "tutorPreferences";
const PRICE_MIN = 20;
const PRICE_MAX = 300;
const HANDLE_W  = 24;
const SUBJECTS = [
  "Polski",
  "Matematyka",
  "J.Angielski",
  "J.Rosyjski",
  "J.Niemiecki",
  "J.Hiszpański",
  "Biologia",
  "Chemia",
  "Fizyka",
  "Geografia",
  "Historia",
  "WOS",
  "Informatyka",
  "Przyroda",
  "Filozofia",
  "Muzyka",
  "Plastyka",
  "Technika",
  "WF",
  "Egzamin 8-klasisty",
  "Matura podstawowa",
  "Matura rozszerzona",
];

interface SliderProps {
  minVal: number;
  maxVal: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}

function PriceSlider({ minVal, maxVal, onChangeMin, onChangeMax }: SliderProps) {
  const trackWRef   = useRef(0);
  const startMinRef = useRef(0);
  const startMaxRef = useRef(0);
  const minPosRef   = useRef(0);
  const maxPosRef   = useRef(0);
  const [minPos, setMinPos] = useState(0);
  const [maxPos, setMaxPos] = useState(0);
  const pxRange = () => Math.max(1, trackWRef.current - HANDLE_W);

  const valToPos = (v: number) =>
    ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * pxRange();

  const posToVal = (p: number) =>
    Math.round((p / pxRange()) * (PRICE_MAX - PRICE_MIN) + PRICE_MIN);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackWRef.current = w;
    const mn = valToPos(minVal);
    const mx = valToPos(maxVal);
    minPosRef.current = mn;
    maxPosRef.current = mx;
    setMinPos(mn);
    setMaxPos(mx);
  };

  const { PanResponder: RNPan } = require("react-native");
  const minPan = useRef(
    RNPan.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { startMinRef.current = minPosRef.current; },
      onPanResponderMove: (_: any, g: any) => {
        const newP = Math.max(0, Math.min(maxPosRef.current - HANDLE_W, startMinRef.current + g.dx));
        minPosRef.current = newP;
        setMinPos(newP);
        onChangeMin(posToVal(newP));
      },
    })
  ).current;

  const maxPan = useRef(
    RNPan.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { startMaxRef.current = maxPosRef.current; },
      onPanResponderMove: (_: any, g: any) => {
        const newP = Math.max(minPosRef.current + HANDLE_W, Math.min(pxRange(), startMaxRef.current + g.dx));
        maxPosRef.current = newP;
        setMaxPos(newP);
        onChangeMax(posToVal(newP));
      },
    })
  ).current;

  const fillLeft  = minPos + HANDLE_W / 2;
  const fillWidth = Math.max(0, maxPos - minPos);

  return (
    <View onLayout={onLayout} style={styles.sliderWrap}>
      <View style={styles.trackBg} />
      {trackWRef.current > 0 && (
        <LinearGradient
          colors={["#FFA53D", "#FF6B4A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.trackFill, { left: fillLeft, width: fillWidth }]}
        />
      )}
      <View
        {...minPan.panHandlers}
        style={[styles.handle, styles.handleAmber, { left: minPos }]}
      />
      <View
        {...maxPan.panHandlers}
        style={[styles.handle, styles.handleCoral, { left: maxPos }]}
      />
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <Text style={styles.cardLabel}>{title}</Text>
      {children}
    </Card>
  );
}

const ExplorePreferences: React.FC = () => {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [subject,         setSubject]         = useState<string | null>(null);
  const [inputText,       setInputText]       = useState("");
  const [dropdownMounted, setDropdownMounted] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const [minPrice,    setMinPrice]    = useState(40);
  const [maxPrice,    setMaxPrice]    = useState(120);
  const [teachStyle,  setTeachStyle]  = useState<string | null>(null);
  const [userType,    setUserType]    = useState<string | null>(null);
  const [avail,       setAvail]       = useState<string | null>(null);
  const [matchCount,    setMatchCount]    = useState<number | null>(null);
  const [connectedIds,  setConnectedIds]  = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
        if (!raw) return;
        const s = JSON.parse(raw);
        if (s.subject) { setSubject(s.subject); setInputText(s.subject); }
        if (s.minPrice != null)      setMinPrice(Number(s.minPrice));
        if (s.maxPrice != null)      setMaxPrice(Number(s.maxPrice));
        if (s.preferredTeachingStyle) setTeachStyle(s.preferredTeachingStyle);
        if (s.preferredUserType)      setUserType(s.preferredUserType);
        if (s.preferredAvailability)  setAvail(s.preferredAvailability);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    getFavoriteTutors().then(favs => {
      setConnectedIds(new Set(favs.map(f => f.tutorId)));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setMatchCount(null);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await fetchTutors({
          subject: subject || null,
          minPrice,
          maxPrice,
          preferredTeachingStyle: teachStyle as any,
          preferredUserType: userType as any,
          preferredAvailability: avail,
        });
        const fresh = (results ?? []).filter(c => !connectedIds.has(c.tutorId));
        setMatchCount(fresh.length);
      } catch {
        setMatchCount(null);
      }
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [subject, minPrice, maxPrice, teachStyle, userType, avail, connectedIds]);

  const filteredSubjects = SUBJECTS.filter((s) =>
    s.toLowerCase().includes(inputText.toLowerCase())
  );

  const openDropdown = () => {
    setDropdownMounted(true);
    Animated.spring(dropdownAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 280,
      friction: 22,
    }).start();
  };

  const closeDropdown = () => {
    Animated.timing(dropdownAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => setDropdownMounted(false));
  };

  const selectSubject = (s: string) => {
    setSubject(s);
    setInputText(s);
    closeDropdown();
  };

  const clearSubject = () => {
    setSubject(null);
    setInputText("");
    openDropdown();
  };

  const handleSearch = useCallback(async () => {
    const filters = {
      subject: subject || null,
      minPrice,
      maxPrice,
      preferredTeachingStyle: teachStyle,
      preferredUserType:       userType,
      preferredAvailability:   avail,
    };
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(filters));
    router.push({
      pathname: "/(auth)/exploreTutors",
      params:   { filters: JSON.stringify(filters) },
    });
  }, [subject, minPrice, maxPrice, teachStyle, userType, avail, router]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable onPress={() => router.back()} style={{ padding: 16, width: 10}}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
      </Pressable>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionCard title="Przedmiot">
          <View style={[styles.inputBar, subject ? styles.inputBarConfirmed : null]}>
            <MaterialCommunityIcons
              name={subject ? "check-circle" : "magnify"}
              size={18}
              color={subject ? C.amber : C.textDim}
            />
            <TextInput
              value={inputText}
              onChangeText={(text: string) => {
                setInputText(text);
                setSubject(null);
                openDropdown();
              }}
              onFocus={openDropdown}
              onBlur={() => setTimeout(closeDropdown, 150)}
              placeholder="Wpisz lub wybierz przedmiot…"
              placeholderTextColor={C.textFaint}
              style={styles.inputText}
              returnKeyType="done"
            />
            {(inputText.length > 0) && (
              <Pressable onPress={clearSubject} hitSlop={8}>
                <MaterialCommunityIcons name="close-circle" size={18} color={C.textDim} />
              </Pressable>
            )}
          </View>

          {dropdownMounted && (
            <Animated.View
              style={[
                styles.dropdown,
                {
                  opacity: dropdownAnim,
                  transform: [{
                    translateY: dropdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  }],
                },
              ]}
            >
              {filteredSubjects.length > 0 ? (
                <ScrollView
                  keyboardShouldPersistTaps="always"
                  nestedScrollEnabled
                  style={{ maxHeight: 172 }}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredSubjects.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => selectSubject(s)}
                      style={[
                        styles.dropdownItem,
                        subject === s && styles.dropdownItemActive,
                      ]}
                    >
                      <Text style={[styles.dropdownText, subject === s && styles.dropdownTextActive]}>
                        {s}
                      </Text>
                      {subject === s && (
                        <MaterialCommunityIcons name="check" size={16} color={C.amber} />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.dropdownEmpty}>Brak wyników</Text>
              )}
            </Animated.View>
          )}
        </SectionCard>

        <SectionCard title="Cena / godz.">
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Zakres</Text>
            <Text style={styles.priceValue}>{minPrice} – {maxPrice} zł</Text>
          </View>
          <PriceSlider
            minVal={minPrice}
            maxVal={maxPrice}
            onChangeMin={setMinPrice}
            onChangeMax={setMaxPrice}
          />
        </SectionCard>

        <SectionCard title="Styl nauczania">
          <View style={styles.chipRow}>
            {([ ["Luźny", "CASUAL"], ["Profesjonalny", "PROFESSIONAL"], ["Elastyczny", "FLEXIBLE"] ] as const).map(
              ([label, val]) => (
                <Chip
                  key={val}
                  label={label}
                  color={C.amber}
                  active={teachStyle === val}
                  onPress={() => setTeachStyle(teachStyle === val ? null : val)}
                />
              )
            )}
          </View>
        </SectionCard>

        <SectionCard title="Typ korepetytora">
          <View style={styles.chipRow}>
            {([ ["Student", "STUDENT"], ["Profesjonalny", "TUTOR"] ] as const).map(
              ([label, val]) => (
                <Chip
                  key={val}
                  label={label}
                  color={C.teal}
                  active={userType === val}
                  onPress={() => setUserType(userType === val ? null : val)}
                />
              )
            )}
          </View>
        </SectionCard>

        <SectionCard title="Dostępność">
          <View style={styles.chipRow}>
            {([ ["Dni robocze", "WEEKDAYS_ONLY"], ["Wieczory", "EVENING_ONLY"], ["Weekendy", "WEEKENDS_ONLY"], ["Elastyczny", "FLEXIBLE"] ] as const).map(
              ([label, val]) => (
                <Chip
                  key={val}
                  label={label}
                  color={C.coral}
                  active={avail === val}
                  onPress={() => setAvail(avail === val ? null : val)}
                />
              )
            )}
          </View>
        </SectionCard>

        <Pressable onPress={handleSearch} style={styles.ctaBtn}>
          <Text style={styles.ctaText}>
            {matchCount === null
              ? "Szukam dopasowań…"
              : matchCount === 0
              ? "Brak dopasowań"
              : `Pokaż ${matchCount} dopasowań`}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },

  cardLabel: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: C.textDim,
    marginBottom: 12,
  },

  // subject input
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.bgDeep,
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputBarConfirmed: {
    borderColor: C.amber,
  },
  inputText: {
    flex: 1,
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 15,
    color: C.text,
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: C.bgDeep,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  dropdownItemActive: {
    backgroundColor: C.amber + "18",
  },
  dropdownText: {
    fontFamily: T.family.medium,
    fontSize: 15,
    color: C.text,
  },
  dropdownTextActive: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    color: C.amber,
  },
  dropdownEmpty: {
    fontFamily: T.family.medium,
    fontSize: 14,
    color: C.textDim,
    textAlign: "center",
    paddingVertical: 14,
  },

  // price row
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontFamily: T.family.medium,
    fontSize: 13,
    color: C.textDim,
  },
  priceValue: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 16,
    color: C.amber,
  },

  // slider
  sliderWrap: {
    height: 40,
    justifyContent: "center",
  },
  trackBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.bgDeep,
    borderWidth: 1,
    borderColor: C.border,
  },
  trackFill: {
    position: "absolute",
    height: 6,
    borderRadius: 3,
    top: 17, // (40 - 6) / 2
  },
  handle: {
    position: "absolute",
    width: HANDLE_W,
    height: HANDLE_W,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    top: 8, // (40 - 24) / 2
  },
  handleAmber: {
    backgroundColor: C.amber,
    shadowColor: "#C97A1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  handleCoral: {
    backgroundColor: C.coral,
    shadowColor: "#C84A2E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },

  // chips
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // CTA
  ctaBtn: {
    backgroundColor: C.amber,
    borderRadius: R.full,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 4,
    borderBottomColor: C.amberDark,
  },
  ctaText: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 16,
    color: "#241608",
  },
});

export default ExplorePreferences;
