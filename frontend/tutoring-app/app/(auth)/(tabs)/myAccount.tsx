import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle } from "react-native-svg";
import { useAuth } from "@/context/AuthContext";
import UploadPhoto from "@components/ui/UploadPhoto";
import useUpdateUserProfile from "@/hooks/MyAccount/useUpdateUserProfile";
import { getMyAccount, saveToBackend } from "@/api/userApi";
import { fetchMyBookings } from "@/api/offerApi";
import { C, T, R } from "@/constants/theme";

const XP_PER_LEVEL = 100;
const getLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
const getLevelProgress = (xp: number) => (xp % XP_PER_LEVEL) / XP_PER_LEVEL;

const RING_SIZE = 116;
const RING_CENTER = RING_SIZE / 2;
const RING_R = 54;
const RING_STROKE = 4;
const RING_CIRC = 2 * Math.PI * RING_R;


const MyAccount: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [user, setUser]               = useState<any>(null);
  const [username, setUsername]       = useState("");
  const [isEditing, setIsEditing]     = useState(false);
  const [password]                    = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [refreshing, setRefreshing]   = useState(false);
  const [lessonsCount, setLessonsCount] = useState<number | null>(null);
  const { setToken } = useAuth();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUser(), fetchLessons()]);
    setRefreshing(false);
  };

  const fetchUser = async () => {
    try {
      const userData = await getMyAccount();
      setUser(userData);
      setUsername(userData.username);
      setDescription(userData.description || "");
    } catch (error: any) {
      if (error?.status === 401) {
        await AsyncStorage.removeItem("jwtToken");
        setToken(null);
        Alert.alert("Sesja wygasła", "Zaloguj się ponownie.");
      }
    }
  };

  const fetchLessons = async () => {
    try {
      const bookings = await fetchMyBookings();
      setLessonsCount(bookings.filter(b => b.completed).length);
    } catch {}
  };

  const updateUserProfile = useUpdateUserProfile({
    user, username, password, description, setIsEditing, fetchUser,
  });

  const savePhotoToBackend = async (imageUrl: string) => {
    try {
      const response = await saveToBackend(imageUrl);
      if (!response.ok) {
        const errorText = await response.text();
        Alert.alert("Błąd", `Nie udało się zapisać zdjęcia: ${errorText}`);
        return;
      }
      await fetchUser();
    } catch (e: any) {
      Alert.alert("Błąd", e.message || "Nieznany błąd");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchLessons();
    }, [])
  );

  const xp       = user?.points ?? 0;
  const level    = getLevel(xp);
  const xpInLevel = xp % XP_PER_LEVEL;
  const initial  = user?.username?.charAt(0)?.toUpperCase() || "?";
  const filled   = RING_CIRC * getLevelProgress(xp);
  const empty    = RING_CIRC - filled;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.amber} />}
    >
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Profil</Text>
        <Pressable onPress={() => router.push("/(auth)/userSettings")} style={styles.settingsBtn}>
          <MaterialCommunityIcons name="cog-outline" size={22} color={C.textDim} />
        </Pressable>
      </View>

      {user ? (
        <>
          <View style={styles.avatarSection}>
            <View style={styles.ringWrap}>
              <Svg
                width={RING_SIZE}
                height={RING_SIZE}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              >
                <Circle
                  cx={RING_CENTER} cy={RING_CENTER} r={RING_R}
                  stroke={C.surface} strokeWidth={RING_STROKE} fill="none"
                />
                <Circle
                  cx={RING_CENTER} cy={RING_CENTER} r={RING_R}
                  stroke={C.gold} strokeWidth={RING_STROKE} fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${filled} ${empty}`}
                  transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
                />
              </Svg>

              <Pressable onPress={() => setModalVisible(true)} style={styles.avatarWrap}>
                {user.photoPath ? (
                  <Image source={{ uri: user.photoPath }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{initial}</Text>
                  </View>
                )}
                <View style={styles.cameraBtn}>
                  <MaterialCommunityIcons name="camera" size={14} color={C.bg} />
                </View>
              </Pressable>
            </View>

            <Text style={styles.username}>{user.username}</Text>

            <View style={styles.levelBadge}>
              <MaterialCommunityIcons name="shield-star" size={14} color={C.gold} />
              <Text style={styles.levelText}>Poziom {level}</Text>
              <Text style={styles.levelXp}>· {xpInLevel}/{XP_PER_LEVEL} XP</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: C.gold }]}>{xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: C.teal }]}>{lessonsCount ?? "—"}</Text>
              <Text style={styles.statLabel}>LEKCJI</Text>
            </View>
          </View>

          <View style={styles.hairline} />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>O mnie</Text>
            {isEditing ? (
              <>
                <Text style={styles.inputLabel}>Nazwa użytkownika</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  placeholder="Nowa nazwa"
                  placeholderTextColor={C.textFaint}
                  autoComplete="username"
                  autoCorrect={false}
                  onFocus={(e) => { if (Platform.OS === "web") e.currentTarget?.focus(); }}
                />
                <Text style={styles.inputLabel}>Opis</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Napisz coś o sobie…"
                  placeholderTextColor={C.textFaint}
                  autoComplete="off"
                  autoCorrect={false}
                  multiline
                  numberOfLines={4}
                  onFocus={(e) => { if (Platform.OS === "web") e.currentTarget?.focus(); }}
                />
                <Text style={styles.charCount}>{description.length}/160</Text>
                <View style={styles.actionsRow}>
                  <Pressable style={styles.btnSecondary} onPress={() => setIsEditing(false)}>
                    <Text style={styles.btnSecondaryText}>Anuluj</Text>
                  </Pressable>
                  <Pressable style={styles.btnPrimary} onPress={updateUserProfile}>
                    <Text style={styles.btnPrimaryText}>Zapisz</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.aboutText}>
                  {user.description || "Dodaj krótki opis, żeby inni wiedzieli, w czym możesz pomóc."}
                </Text>
                <Pressable style={styles.editLink} onPress={() => setIsEditing(true)}>
                  <MaterialCommunityIcons name="pencil-outline" size={15} color={C.amber} />
                  <Text style={styles.editLinkText}>Edytuj profil</Text>
                </Pressable>
              </>
            )}
          </View>
        </>
      ) : (
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Ładowanie…</Text>
        </View>
      )}

      <Modal visible={modalVisible && !!user?.photoPath} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
          {user?.photoPath && (
            <>
              <Image
                source={{ uri: user.photoPath }}
                style={styles.fullImg}
                resizeMode="contain"
              />
              <UploadPhoto onUploaded={savePhotoToBackend} />
            </>
          )}
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 24, gap: 28 },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pageTitle: { fontFamily: T.family.black, fontSize: 32, color: C.text, letterSpacing: -1 },
  settingsBtn: { padding: 4 },

  avatarSection: { alignItems: "center", gap: 12 },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2, borderColor: C.border,
  },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: C.surface, borderWidth: 2, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { fontFamily: T.family.black, fontSize: 38, color: C.purple },
  cameraBtn: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.amber, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: C.bg,
  },

  username: {
    fontFamily: T.family.extraBold, fontSize: 22,
    color: C.text, letterSpacing: -0.4,
  },
  levelBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: R.full, backgroundColor: C.surface,
    borderWidth: 1.5, borderColor: C.border,
  },
  levelText: {
    fontFamily: T.family.bold, fontSize: 13, color: C.gold,
  },
  levelXp: {
    fontFamily: T.family.medium, fontSize: 12, color: C.textDim,
    fontVariant: ["tabular-nums"] as const,
  },

  statsRow: { flexDirection: "row", alignItems: "center" },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statNum: {
    fontFamily: T.family.black, fontSize: 40,
    fontVariant: ["tabular-nums"] as const, letterSpacing: -1, lineHeight: 44,
  },
  statLabel: {
    fontFamily: T.family.black, fontSize: 10,
    letterSpacing: 1.5, textTransform: "uppercase", color: C.textDim,
  },
  statSep: { width: 1, height: 40, backgroundColor: C.border },

  hairline: { height: 1, backgroundColor: C.border, marginHorizontal: -24 },

  section: { gap: 16 },
  sectionLabel: {
    fontFamily: T.family.black, fontSize: 11,
    letterSpacing: 1.5, textTransform: "uppercase", color: C.textDim,
  },

  aboutText: { fontFamily: T.family.medium, fontSize: 15, color: C.textDim, lineHeight: 23 },
  editLink: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  editLinkText: { fontFamily: T.family.bold, fontSize: 14, color: C.amber },

  inputLabel: {
    fontFamily: T.family.bold, fontSize: 12, letterSpacing: 0.5,
    color: C.textDim, textTransform: "uppercase", marginBottom: -8,
  },
  input: {
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
    borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: T.family.medium, fontSize: 15, color: C.text,
  },
  inputMultiline: { minHeight: 90, textAlignVertical: "top" },
  charCount: {
    fontFamily: T.family.medium, fontSize: 12, color: C.textFaint,
    alignSelf: "flex-end", marginTop: -20,
  },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  btnPrimary: {
    flex: 1, backgroundColor: C.amber, borderRadius: R.full,
    paddingVertical: 13, alignItems: "center",
    borderBottomWidth: 3, borderBottomColor: C.amberDark,
  },
  btnPrimaryText: { fontFamily: T.family.extraBold, fontSize: 15, color: "#241608" },
  btnSecondary: {
    flex: 1, borderRadius: R.full, paddingVertical: 13, alignItems: "center",
    borderWidth: 1.5, borderColor: C.border,
  },
  btnSecondaryText: { fontFamily: T.family.bold, fontSize: 15, color: C.textDim },

  loadingWrap: { flex: 1, alignItems: "center", paddingTop: 80 },
  loadingText: { fontFamily: T.family.medium, fontSize: 15, color: C.textDim },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.88)", justifyContent: "center", alignItems: "center" },
  fullImg: { width: "85%", height: "50%", borderRadius: 16 },
});

export default MyAccount;
