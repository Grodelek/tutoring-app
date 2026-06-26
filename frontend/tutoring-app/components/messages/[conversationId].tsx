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
import { fetchLessonByTutor, fetchLessonsByTutorId } from "@/api/lessonApi";
import { sendOffer, acceptOffer, declineOffer, confirmPayment } from "@/api/offerApi";
import { fetchUserById } from "@/api/userApi";
import { getMessages, sendMessage as sendMessageApi, deleteMessage } from "@/api/conversationApi";
import { C } from "@/constants/theme";
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
  const { conversationId, receiverId, scheduledTime, lessonId: scheduledLessonId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [Receiver, setReceiver] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
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
  }, [conversationId]);

  useEffect(() => {
    const maybeSendOffer = async () => {
      if (!scheduledTime || !scheduledLessonId || !userId || !receiverId) return;
      router.setParams({ scheduledTime: undefined as any, lessonId: undefined as any });
      try {
        await sendOffer({
          lessonId: scheduledLessonId.toString(),
          receiverId: receiverId.toString(),
          sessionStartTime: scheduledTime.toString(),
        });
        Alert.alert("Zaplanowano", `Termin: ${new Date(scheduledTime.toString()).toLocaleString()}`);
        fetchMessages();
      } catch (e: any) {
        Alert.alert("Błąd", e?.message || "Nie udało się wysłać propozycji");
      }
    };
    maybeSendOffer();
  }, [scheduledTime, scheduledLessonId, userId, receiverId]);

  const fetchReceiver = async (id: string) => {
    try {
      const data = await fetchUserById(id);
      setReceiver(data);
      setAvatarError(false);
    } catch (error: any) {
      Alert.alert("Błąd połączenia", error.message);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const data = await getMessages(conversationId.toString());
      setMessages(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setMessages([]);
      if (!e.message?.includes("404")) {
        Alert.alert("Błąd", `Problem z połączeniem: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !conversationId || isSending) return;
    const content = newMessage.trim();
    setNewMessage("");
    setIsSending(true);
    try {
      const message = await sendMessageApi({
        senderId: userId,
        receiverId: receiverId?.toString() ?? "",
        content,
      });
      setMessages((prev) => [...prev, message]);
    } catch {
      setNewMessage(content);
      Alert.alert("Błąd", "Nie udało się wysłać wiadomości");
    } finally {
      setIsSending(false);
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
            try {
              await deleteMessage(messageId);
              Alert.alert("Usunięto", "Zaproszenie zostało usunięte.");
              fetchMessages();
            } catch {
              Alert.alert("Błąd", "Nie udało się usunąć zaproszenia.");
            }
          },
        },
      ]
    );
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await acceptOffer(offerId);
      Alert.alert("Zaakceptowano", "Termin został potwierdzony.");
      fetchMessages();
    } catch (e: any) {
      Alert.alert("Błąd", e?.message || "Nie udało się zaakceptować.");
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    try {
      await declineOffer(offerId);
      fetchMessages();
    } catch (e: any) {
      Alert.alert("Błąd", e?.message || "Nie udało się odrzucić.");
    }
  };

  const handleConfirmPayment = async (offerId: string) => {
    try {
      const updated = await confirmPayment(offerId);
      if (updated.completed) {
        Alert.alert("Rozliczono!", "Zajęcia zakończone. +10 XP i +1 ukończona lekcja w profilu.");
      } else {
        Alert.alert("Potwierdzono", "Czekamy na potwierdzenie drugiej strony.");
      }
      fetchMessages();
    } catch (e: any) {
      Alert.alert("Błąd", e?.message || "Nie udało się potwierdzić płatności.");
    }
  };

  const handleProposeAnotherTime = (offerLessonId: string) => {
    if (!conversationId || !receiverId) { Alert.alert("Błąd", "Brak danych konwersacji"); return; }
    router.push({
      pathname: "/session/calendar" as any,
      params: {
        returnTo: "/messages/[conversationId]",
        returnParams: JSON.stringify({
          conversationId: conversationId.toString(),
          receiverId: receiverId.toString(),
          lessonId: offerLessonId,
        }),
      },
    });
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
            const offer = (item as any).offer;
            const offerLesson = offer?.lesson;
            const status = offer?.status ?? "PENDING";
            const sessionStart = offer?.sessionStartTime ? new Date(offer.sessionStartTime) : null;
            const duration = offerLesson?.durationTime ?? 0;
            const sessionEnd = sessionStart ? new Date(sessionStart.getTime() + duration * 60000) : null;
            const now = new Date();

            const scheduledAt = sessionStart
              ? sessionStart.toLocaleString("pl-PL", {
                  weekday: "short", day: "2-digit", month: "2-digit",
                  hour: "2-digit", minute: "2-digit",
                })
              : "—";
            const price = offerLesson?.price != null ? `${offerLesson.price} zł` : "—";
            const subject = offerLesson?.subject || "—";
            const tutor = offer?.tutorUsername || "—";

            const isStudentSide = offer && String(offer.studentId) === String(userId);
            const myConfirmed = isStudentSide ? offer?.studentConfirmedPayment : offer?.tutorConfirmedPayment;
            const otherConfirmed = isStudentSide ? offer?.tutorConfirmedPayment : offer?.studentConfirmedPayment;
            const otherLabel = isStudentSide ? "Korepetytor" : "Student";
            const sessionEnded = sessionEnd ? now >= sessionEnd : false;
            const isDeclined = status === "DECLINED";
            const isAccepted = status === "ACCEPTED";
            const isCompleted = offer?.completed === true;

            const steps = [
              { label: "Wysłano",    done: true,                        error: false },
              { label: "Akceptacja", done: isAccepted || isCompleted,   error: isDeclined },
              { label: "Sesja",      done: isAccepted && sessionEnded,  error: false },
              { label: "Rozliczono", done: isCompleted,                 error: false },
            ];

            return (
              <View style={styles.invitationCard}>
                {/* ── Header ── */}
                <View style={styles.invitationHeaderRow}>
                  <MaterialCommunityIcons name="calendar-clock" size={18} color={C.teal} />
                  <Text style={styles.invitationTitleStrong}>Propozycja sesji</Text>
                  {isCompleted && (
                    <View style={styles.invitationCompletedBadge}>
                      <Text style={styles.invitationCompletedBadgeText}>Zakończone</Text>
                    </View>
                  )}
                </View>

                {/* ── Stepper ── */}
                <View style={styles.stepperRow}>
                  {steps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <View style={styles.stepWrap}>
                        <View style={[
                          styles.stepCircle,
                          step.done && styles.stepCircleDone,
                          step.error && styles.stepCircleError,
                        ]}>
                          {step.done && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
                          {step.error && <MaterialCommunityIcons name="close" size={13} color="#fff" />}
                        </View>
                        <Text style={[
                          styles.stepLabel,
                          step.done && styles.stepLabelDone,
                          step.error && styles.stepLabelError,
                        ]}>{step.label}</Text>
                      </View>
                      {idx < steps.length - 1 && (
                        <View style={[
                          styles.stepLine,
                          step.done && !step.error && styles.stepLineDone,
                        ]} />
                      )}
                    </React.Fragment>
                  ))}
                </View>

                {/* ── Details ── */}
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
                  <Text style={styles.invitationDetailStrong}>Czas trwania</Text>
                  <Text style={styles.invitationDetailValue}>{duration ? `${duration} min` : "—"}</Text>
                </View>
                <View style={styles.invitationDetailsBlock}>
                  <Text style={styles.invitationDetailStrong}>Cena</Text>
                  <Text style={styles.invitationDetailValue}>{price}</Text>
                </View>

                <View style={styles.invitationDivider} />

                {/* ── PENDING — odbiorca decyduje ── */}
                {status === "PENDING" && isReceiver && offer && (
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Pressable style={styles.declineButton} onPress={() => handleDeclineOffer(String(offer.id))}>
                        <Text style={styles.declineButtonText}>Odrzuć</Text>
                      </Pressable>
                      <Pressable style={styles.acceptButton} onPress={() => handleAcceptOffer(String(offer.id))}>
                        <Text style={styles.acceptButtonText}>Akceptuj</Text>
                      </Pressable>
                    </View>
                    <Pressable style={styles.proposeButton} onPress={() => handleProposeAnotherTime(String(offerLesson?.id))}>
                      <Text style={styles.proposeButtonText}>Zaproponuj inny termin</Text>
                    </Pressable>
                  </View>
                )}

                {/* ── PENDING — nadawca czeka ── */}
                {status === "PENDING" && isMyMessage && (
                  <View style={{ gap: 8 }}>
                    <View style={styles.invitationStatusRow}>
                      <MaterialCommunityIcons name="clock-outline" size={14} color={C.teal} />
                      <Text style={[styles.statusLine, { color: C.teal }]}>Oczekuje na odpowiedź…</Text>
                    </View>
                    <Pressable style={styles.proposeButton} onPress={() => handleDeleteSessionOffer(String(item.id))}>
                      <Text style={styles.proposeButtonText}>Cofnij propozycję</Text>
                    </Pressable>
                  </View>
                )}

                {/* ── DECLINED ── */}
                {isDeclined && (
                  <View style={styles.invitationStatusRow}>
                    <MaterialCommunityIcons name="close-circle-outline" size={15} color={C.coral} />
                    <Text style={[styles.statusLine, { color: C.coral }]}>Propozycja odrzucona</Text>
                  </View>
                )}

                {/* ── ACCEPTED ── */}
                {isAccepted && offer && (
                  <View style={{ gap: 8 }}>
                    {isCompleted ? (
                      <View style={styles.invitationRewardBox}>
                        <MaterialCommunityIcons name="trophy-outline" size={16} color={C.gold} />
                        <Text style={styles.invitationRewardText}>+10 XP • +1 ukończona lekcja</Text>
                      </View>
                    ) : !sessionEnded ? (
                      <View style={styles.invitationStatusRow}>
                        <MaterialCommunityIcons name="check-circle-outline" size={15} color={C.green} />
                        <Text style={[styles.statusLine, { color: C.green }]}>
                          Zaakceptowano — płatność po zakończeniu zajęć
                        </Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.invitationStatusRow}>
                          <MaterialCommunityIcons name="cash-check" size={15} color={C.amber} />
                          <Text style={[styles.statusLine, { color: C.amber }]}>
                            Zajęcia skończone — potwierdź płatność
                          </Text>
                        </View>
                        <View style={styles.paymentConfirmRow}>
                          <View style={styles.paymentConfirmItem}>
                            <MaterialCommunityIcons
                              name={myConfirmed ? "check-circle" : "circle-outline"}
                              size={16}
                              color={myConfirmed ? C.green : C.textFaint}
                            />
                            <Text style={styles.paymentConfirmLabel}>Ty</Text>
                          </View>
                          <View style={styles.paymentConfirmItem}>
                            <MaterialCommunityIcons
                              name={otherConfirmed ? "check-circle" : "circle-outline"}
                              size={16}
                              color={otherConfirmed ? C.green : C.textFaint}
                            />
                            <Text style={styles.paymentConfirmLabel}>{otherLabel}</Text>
                          </View>
                        </View>
                        {!myConfirmed && (
                          <Pressable style={styles.paymentButton} onPress={() => handleConfirmPayment(String(offer.id))}>
                            <Text style={styles.paymentButtonText}>Płatność wykonana</Text>
                          </Pressable>
                        )}
                      </>
                    )}
                  </View>
                )}

                <Text style={[styles.timestamp, { marginTop: 6 }]}>
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
          <Pressable
            onPress={sendMessage}
            disabled={isSending}
            style={[styles.sendButton, isSending && { opacity: 0.45 }]}
          >
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
                <MaterialCommunityIcons name="close" size={18} color={C.textDim} />
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
