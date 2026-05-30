import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform as RNPlatform,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWebSocketMessages } from "@/hooks/useWebSocketMessages";
import { BASE_URL } from "@/config/baseUrl";
import { fetchLesson as fetchLessonFromApi, fetchLessonByTutor, fetchLessonsByTutorId } from "@/api/lessonApi";
import { sendOffer } from "@/api/offerApi";
import styles from "./styles/styles";

interface Message {
  id: string;
  senderId: string | UUID;
  receiverId?: string | UUID;
  content: string;
  timestamp: string;
  conversationId?: string | UUID;
  messageType: string;
  lessonId: string | UUID;
}
type UUID = string;

const getImageUri = (photoPath: string | null | undefined): string | null => {
  if (!photoPath) return null;
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) return photoPath;
  if (photoPath.startsWith("/")) return `${BASE_URL}${photoPath}`;
  return photoPath;
};

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { conversationId, receiverId, lessonId: lessonIdParam, scheduledTime, lessonId: scheduledLessonId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [Receiver, setReceiver] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useWebSocketMessages(conversationId, (incomingMessage) => {
    setMessages((prev) => [...prev, incomingMessage]);
  });

  useEffect(() => {
    AsyncStorage.getItem("userId").then((id) => { if (id) setUserId(id); });
    if (receiverId) fetchReceiver(receiverId.toString());
  }, [receiverId]);

  useEffect(() => {
    fetchMessages();
    if (lessonIdParam) fetchLesson(lessonIdParam.toString());
  }, [conversationId, lessonIdParam]);

  useEffect(() => {
    const maybeSendOffer = async () => {
      if (!scheduledTime || !scheduledLessonId || !userId || !receiverId) return;
      router.setParams({ scheduledTime: undefined as any, lessonId: undefined as any });
      try {
        await sendOffer({
          tutorId: receiverId.toString(),
          studentId: userId,
          lessonId: scheduledLessonId.toString(),
          sessionStartTime: scheduledTime.toString(),
        });
        Alert.alert("Zaplanowano", `Termin: ${new Date(scheduledTime.toString()).toLocaleString()}`);
      } catch (e: any) {
        Alert.alert("Błąd", e?.message || "Nie udało się wysłać propozycji");
      }
    };
    maybeSendOffer();
  }, [scheduledTime, scheduledLessonId, userId, receiverId]);

  const fetchLesson = async (id: string) => {
    try {
      const lessonData = await fetchLessonFromApi(id);
      setLesson(lessonData);
    } catch (error: any) {
      if (error.message === "Authentication token not found") {
        Alert.alert("Sesja wygasła", "Zaloguj się ponownie.");
        router.push("/login");
      }
    }
  };

  const fetchReceiver = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) { Alert.alert("Błąd", "Brak tokenu — zaloguj się ponownie."); return; }
      const response = await fetch(`${BASE_URL}/api/users/${id}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReceiver(data);
        setAvatarError(false);
      }
    } catch (error: any) {
      Alert.alert("Błąd połączenia", error.message);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) { Alert.alert("Błąd", "Brak tokenu — zaloguj się ponownie."); return; }
      const res = await fetch(`${BASE_URL}/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } else {
        if (res.status !== 404) {
          const errorText = await res.text();
          Alert.alert("Błąd", `Nie udało się załadować wiadomości: ${res.status} — ${errorText}`);
        }
        setMessages([]);
      }
    } catch (e: any) {
      setMessages([]);
      Alert.alert("Błąd", `Problem z połączeniem: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !conversationId) return;
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) { Alert.alert("Błąd", "Brak tokenu — zaloguj się ponownie."); return; }
      const res = await fetch(`${BASE_URL}/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ senderId: userId, receiverId, content: newMessage.trim() }),
      });
      if (res.ok) {
        const message = await res.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
      } else {
        Alert.alert("Błąd", "Nie udało się wysłać wiadomości");
      }
    } catch {
      Alert.alert("Błąd", "Problem z połączeniem");
    }
  };

  const chooseLesson = async () => {
    setShowLessonModal(true);
    setLoadingLessons(true);
    try {
      const lessons = receiverId
        ? await fetchLessonsByTutorId(receiverId.toString())
        : await fetchLessonByTutor();
      setAvailableLessons(lessons);
    } catch (error: any) {
      Alert.alert("Błąd", `Nie udało się załadować lekcji: ${error.message}`);
    } finally {
      setLoadingLessons(false);
    }
  };

  const startSession = (selectedLessonId: string) => {
    if (!conversationId || !receiverId) { Alert.alert("Błąd", "Brak danych konwersacji"); return; }
    setShowLessonModal(false);
    router.push({
      pathname: "/session/calendar" as any,
      params: {
        returnTo: "/messages/[conversationId]",
        returnParams: JSON.stringify({
          conversationId: conversationId.toString(),
          receiverId: receiverId.toString(),
          lessonId: selectedLessonId,
        }),
      },
    });
  };

  const handleDeleteSessionOffer = async (messageId: string) => {
    Alert.alert(
      "Usuń zaproszenie",
      "Na pewno chcesz usunąć tę propozycję?",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            const token = await AsyncStorage.getItem("jwtToken");
            if (!token) { Alert.alert("Błąd", "Brak tokenu."); return; }
            const res = await fetch(`${BASE_URL}/api/messages/${messageId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              Alert.alert("Usunięto", "Zaproszenie zostało usunięte.");
              fetchMessages();
            } else {
              Alert.alert("Błąd", "Nie udało się usunąć zaproszenia.");
            }
          },
        },
      ]
    );
  };

  if (!userId || !conversationId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#fff" }}>Ładowanie…</Text>
      </View>
    );
  }

  const initial = Receiver?.username?.[0]?.toUpperCase() ?? "?";
  const imageUri = getImageUri(Receiver?.photoPath);

  return (
    <KeyboardAvoidingView
      behavior={RNPlatform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={80}
      enabled={RNPlatform.OS !== "web"}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.push("/conversations")} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>

        <View style={styles.receiverInfo}>
          {Receiver && (
            <>
              {imageUri && !avatarError ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.avatar}
                  onError={() => setAvatarError(true)}
                  onLoad={() => setAvatarError(false)}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarPlaceholderText}>{initial}</Text>
                </View>
              )}
              <Text style={styles.receiverName}>{Receiver.username}</Text>
            </>
          )}
        </View>

        <Pressable style={styles.calendarBtn} onPress={chooseLesson}>
          <MaterialCommunityIcons name="calendar-plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* ── Message list ── */}
      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={fetchMessages}
        contentContainerStyle={{ paddingVertical: 12 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 32, alignItems: "center" }}>
              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: "rgba(255,255,255,0.38)" }}>
                Brak wiadomości — zacznij rozmowę!
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const isMyMessage = String(item.senderId) === String(userId);

          if (item.messageType === "INVITATION") {
            const isReceiver = String(item.receiverId) === String(userId);
            const lessonDetails =
              lesson?.id === item.lessonId
                ? lesson
                : availableLessons.find((l) => l.id === item.lessonId);
            const scheduledAt = lessonDetails?.startTime || lessonDetails?.scheduledTime || "—";
            const price = lessonDetails?.price ? `${lessonDetails.price} zł` : "—";
            const subject = lessonDetails?.subject || "—";
            const tutor = lessonDetails?.tutor?.username || "—";

            return (
              <View style={styles.invitationCard}>
                <View style={styles.invitationHeaderRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={20} color="#4FB8D9" />
                  <Text style={styles.invitationTitleStrong}>Propozycja sesji</Text>
                </View>
                <View style={styles.invitationDetailsBlock}>
                  <Text style={styles.invitationDetailStrong}>Przedmiot</Text>
                  <Text style={styles.invitationDetailValue}>{subject}</Text>
                </View>
                <View style={styles.invitationDetailsBlock}>
                  <Text style={styles.invitationDetailStrong}>Korepetytor</Text>
                  <Text style={styles.invitationDetailValue}>{tutor}</Text>
                </View>
                <View style={styles.invitationDetailsBlock}>
                  <Text style={styles.invitationDetailStrong}>Termin</Text>
                  <Text style={styles.invitationDetailValue}>{scheduledAt}</Text>
                </View>
                <View style={styles.invitationDetailsBlock}>
                  <Text style={styles.invitationDetailStrong}>Cena</Text>
                  <Text style={styles.invitationDetailValue}>{price}</Text>
                </View>
                {isReceiver && (
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                    <Pressable style={styles.declineButton}>
                      <Text style={styles.declineButtonText}>Odrzuć</Text>
                    </Pressable>
                    <Pressable style={styles.acceptButton}>
                      <Text style={styles.acceptButtonText}>Akceptuj</Text>
                    </Pressable>
                  </View>
                )}
                {isMyMessage && (
                  <Pressable
                    style={[styles.declineButton, { marginTop: 10 }]}
                    onPress={() => handleDeleteSessionOffer(String(item.id))}
                  >
                    <Text style={styles.declineButtonText}>Cofnij propozycję</Text>
                  </Pressable>
                )}
                <Text style={styles.timestamp}>
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </Text>
              </View>
            );
          }

          return (
            <View style={[styles.message, isMyMessage ? styles.myMessage : styles.otherMessage]}>
              <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
                {item.content}
              </Text>
              <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
                {item.timestamp
                  ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : ""}
              </Text>
            </View>
          );
        }}
      />

      {/* ── Input bar ── */}
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TextInput
          style={styles.input}
          placeholder="Napisz wiadomość…"
          placeholderTextColor="rgba(255,255,255,0.38)"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          autoComplete="off"
          autoCorrect={false}
          onFocus={(e) => { if (RNPlatform.OS === "web") e.currentTarget?.focus(); }}
        />
        <View style={styles.actionsRow}>
          <Pressable onPress={sendMessage} style={styles.sendButton}>
            <MaterialCommunityIcons name="send" size={20} color="#241608" />
          </Pressable>
        </View>
      </View>

      {/* ── Lesson picker modal ── */}
      <Modal
        visible={showLessonModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLessonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wybierz lekcję</Text>
              <Pressable onPress={() => setShowLessonModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {loadingLessons ? (
              <View style={styles.modalCenter}>
                <Text style={styles.modalText}>Ładowanie lekcji…</Text>
              </View>
            ) : availableLessons.length === 0 ? (
              <View style={styles.modalCenter}>
                <Text style={styles.modalText}>Brak dostępnych lekcji</Text>
              </View>
            ) : (
              <FlatList
                data={availableLessons}
                keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => {
                  const tutorImageUri = getImageUri(item.tutor?.photoPath);
                  return (
                    <Pressable
                      style={styles.lessonModalItem}
                      onPress={() => startSession(item.id)}
                    >
                      <View style={styles.lessonModalContent}>
                        {tutorImageUri ? (
                          <Image source={{ uri: tutorImageUri }} style={styles.lessonModalAvatar} />
                        ) : (
                          <View style={[styles.lessonModalAvatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarPlaceholderText}>
                              {item.tutor?.username?.[0]?.toUpperCase() || "?"}
                            </Text>
                          </View>
                        )}
                        <View style={styles.lessonModalInfo}>
                          <Text style={styles.lessonModalSubject}>{item.subject}</Text>
                          <Text style={styles.lessonModalTutor}>{item.tutor?.username || "Nieznany"}</Text>
                          <Text style={styles.lessonModalDescription} numberOfLines={2}>
                            {item.description}
                          </Text>
                          <Text style={styles.lessonModalDuration}>{item.durationTime} min</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
