import React, { useState, useEffect, useMemo } from "react";
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
import { useColorScheme } from "@/hooks/useColorScheme";
import useUpdateUserProfile from "@/hooks/MyAccount/useUpdateUserProfile";
import { getMyAccount, saveToBackend } from "@/api/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import UploadPhoto from "@components/UploadPhoto";
import { Colors } from "@/constants/Colors";

const MyAccount: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { setToken } = useAuth();
  const colorScheme = useColorScheme();

  const themeColors = useMemo(
    () => (colorScheme === "dark" ? Colors.dark : Colors.light),
    [colorScheme]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
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
        Alert.alert("Session expired", "Please sign in again.");
      } else {
        Alert.alert("Error", `Connection error: ${error.message}`);
      }
    }
  };

  const updateUserProfile = useUpdateUserProfile({
    user,
    username,
    password,
    description,
    setIsEditing,
    fetchUser,
  });

   const savePhotoToBackend = async (imageUrl: string) => {
     try {
       const response = await saveToBackend(imageUrl);
       if (!response.ok) {
         const errorText = await response.text();
         Alert.alert("Error", `Failed to save photo: ${errorText}`);
         return;
       }
       await fetchUser();
       Alert.alert("Success", "Profile photo updated!");
     } catch (e: any) {
       console.log(e);
       Alert.alert(
         "Error",
         `Failed to save photo: ${e.message || "Unknown error"}`
       );
     }
   };

    useEffect(() => {
    fetchUser();
  }, []);

   const weeklyProgress = useMemo(
    () => {
      const total = user?.points ?? 0;
      const base = Math.max(5, Math.floor((total || 0) / 10));
      return [base + 5, base + 2, base + 8, base + 4, base + 6, base + 3, base + 1];
    },
    [user?.points]
  );

  const maxProgress = Math.max(...weeklyProgress, 1);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {user ? (
        <View style={styles.contentWrapper}>
          <View
            style={[
              styles.headerCard,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <Pressable onPress={() => setModalVisible(true)}>
              {user.photoPath ? (
                <Image source={{ uri: user.photoPath }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user.username?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}
            </Pressable>
            <Text style={[styles.userName, { color: themeColors.text }]}>
              {user.username}
            </Text>
            <Text style={[styles.userSub, { color: themeColors.secondaryText }]}>
              Joined user
            </Text>

            <View style={styles.headerXpPill}>
              <Text style={styles.headerXpText}>{user.points ?? 0} XP</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Stats
            </Text>
            <View style={styles.statsRow}>
              <View style={[styles.statChip, { backgroundColor: themeColors.chipBackground }]}>
                <Text style={styles.statLabel}>XP</Text>
                <Text style={styles.statValue}>{user.points ?? 0}</Text>
              </View>
              <View style={[styles.statChip, { backgroundColor: themeColors.chipBackground }]}>
                <Text style={styles.statLabel}>Lessons</Text>
                <Text style={styles.statValue}>0</Text>
              </View>
              <View style={[styles.statChip, { backgroundColor: themeColors.chipBackground }]}>
                <Text style={styles.statLabel}>Streak</Text>
                <Text style={styles.statValue}>0 days</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Weekly progress
            </Text>
            <View style={styles.progressChart}>
              {weeklyProgress.map((value, index) => {
                const heightPercent = (value / maxProgress) * 100;
                const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
                return (
                  <View key={index} style={styles.progressItem}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          height: `${Math.max(20, heightPercent)}%`,
                          backgroundColor: themeColors.tint,
                        },
                      ]}
                    />
                    <Text style={[styles.progressLabel, { color: themeColors.secondaryText }]}>
                      {dayLabels[index]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              About me
            </Text>
            {isEditing ? (
              <>
                <Text style={[styles.inputLabel, { color: themeColors.secondaryText }]}>Username</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      color: themeColors.text,
                      borderColor: themeColors.inputBorder,
                    },
                  ]}
                  placeholder="New username"
                  placeholderTextColor={themeColors.placeholder}
                  autoComplete="username"
                  autoCorrect={false}
                  onFocus={(e) => {
                    if (Platform.OS === "web") {
                      e.currentTarget?.focus();
                    }
                  }}
                />
                <Text style={[styles.inputLabel, { color: themeColors.secondaryText }]}>Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  style={[
                    styles.input,
                    styles.inputMultiline,
                    {
                      backgroundColor: themeColors.inputBackground,
                      color: themeColors.text,
                      borderColor: themeColors.inputBorder,
                    },
                  ]}
                  placeholder="Tell others about your interests and what you teach."
                  placeholderTextColor={themeColors.placeholder}
                  autoComplete="off"
                  autoCorrect={false}
                  multiline
                  numberOfLines={4}
                  onFocus={(e) => {
                    if (Platform.OS === "web") {
                      e.currentTarget?.focus();
                    }
                  }}
                />
                <Text style={[styles.charCount, { color: themeColors.secondaryText }]}>
                  {description.length}/160
                </Text>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={[styles.buttonSecondary, { borderColor: themeColors.tint }]}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={[styles.buttonSecondaryText, { color: themeColors.tint }]}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.buttonPrimary, { backgroundColor: themeColors.tint }]}
                    onPress={updateUserProfile}
                  >
                    <Text style={styles.buttonPrimaryText}>Save changes</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.aboutText, { color: themeColors.text }]}>
                  {user.description || "Add a short description so others know what you're great at."}
                </Text>
                <Pressable
                  style={[styles.buttonPrimary, { backgroundColor: themeColors.tint }]}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.buttonPrimaryText}>Edit profile</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      ) : (
        <Text style={[styles.userText, { color: themeColors.text }]}>Loading user data...</Text>
      )}
      <Modal
        visible={modalVisible && !!user?.photoPath}
        transparent
        animationType="fade"
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        >
           {user?.photoPath ? (
             <>
               <Image
                 source={{ uri: user.photoPath }}
                 style={styles.fullScreenImage}
                 resizeMode="contain"
               />
               <UploadPhoto onUploaded={savePhotoToBackend} />
             </>
           ) : (
             <Text style={{ color: "white" }}>No photo available</Text>
           )}
        </Pressable>
      </Modal>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  contentWrapper: {
    gap: 16,
  },
  headerCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 4,
  },
  userText: {
    fontSize: 16,
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
  },
  userSub: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    borderWidth: 1,
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
    alignSelf: "center",
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
    alignSelf: "center",
    borderWidth: 3,
    borderColor: "#444",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },
  headerXpPill: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  headerXpText: {
    color: "#fff",
    fontWeight: "600",
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#9BA1A6",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
    color: "#ECEDEE",
  },
  progressChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
  },
  progressItem: {
    flex: 1,
    alignItems: "center",
  },
  progressBar: {
    width: 14,
    borderRadius: 999,
  },
  progressLabel: {
    marginTop: 6,
    fontSize: 12,
  },
  aboutText: {
    marginBottom: 16,
    fontSize: 15,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 4,
    marginTop: 4,
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  buttonPrimary: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonPrimaryText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 15,
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonSecondaryText: {
    fontWeight: "600",
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "85%",
    height: "50%",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#c678dd",
  },
});

export default MyAccount;
