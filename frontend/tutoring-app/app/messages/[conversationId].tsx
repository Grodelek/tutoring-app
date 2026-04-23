import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform as RNPlatform,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWebSocketMessages } from "@/hooks/useWebSocketMessages";
import { BASE_URL } from "@/config/baseUrl";
import {fetchLesson as fetchLessonFromApi, fetchLessonByTutor, fetchLessonsByTutorId} from "@/api/lessonApi";
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

  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }

  if (photoPath.startsWith("/")) {
    return `${BASE_URL}${photoPath}`;
  }

  return photoPath;
};

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { conversationId, receiverId, lessonId: lessonIdParam, scheduledTime, lessonId: scheduledLessonId } = useLocalSearchParams();
  const router = useRouter();
  const [Receiver, setReceiver] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  useWebSocketMessages(conversationId, (incomingMessage) => {
    setMessages((prev) => [...prev, incomingMessage]);
  });

  useEffect(() => {
    const initializeUser = async () => {
      const id = await AsyncStorage.getItem("userId");
      if (id) setUserId(id);
    };
    initializeUser();
    if (receiverId) fetchReceiver(receiverId.toString());
  }, [receiverId]);

  useEffect(() => {
    fetchMessages();
    if (lessonIdParam) {
      fetchLesson(lessonIdParam.toString());
    }
  }, [conversationId, lessonIdParam]);

  useEffect(() => {
    const maybeSendOffer = async () => {
      if (!scheduledTime || !scheduledLessonId) return;
      if (!userId || !receiverId) return;

      router.setParams({ scheduledTime: undefined as any, lessonId: undefined as any });

      try {
        await sendOffer({
          tutorId: receiverId.toString(),
          studentId: userId,
          lessonId: scheduledLessonId.toString(),
          sessionStartTime: scheduledTime.toString(),
        });

        Alert.alert("Offer sent", `Scheduled: ${new Date(scheduledTime.toString()).toLocaleString()}`);
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to send offer");
      }
    };
    maybeSendOffer();
  }, [scheduledTime, scheduledLessonId, userId, receiverId]);

  const fetchLesson = async (id: string) => {
    try {
      const lessonData = await fetchLessonFromApi(id);
      setLesson(lessonData);
      setLessonId(id);
    } catch (error: any) {
      console.error("Error fetching lesson:", error);
      if (error.message === "Authentication token not found") {
        Alert.alert("Session expired", "Please log in again.");
        router.push("/login");
        return;
      }
      console.log("Lesson not found or error:", error.message);
    }
  };

  const fetchReceiver = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        Alert.alert("Error", "Missing token – user not logged in.");
        return;
      }
      const response = await fetch(`${BASE_URL}/api/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReceiver(data);
        setStudentId(data.id);
        setAvatarError(false);
      } else {
        const errorText = await response.text();
        Alert.alert("Error", `Failed to fetch user: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert("Error", `Connection error: ${error.message}`);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        Alert.alert("Error", "Missing token – user not logged in.");
        return;
      }
      const res = await fetch(
        `${BASE_URL}/api/messages/${conversationId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched messages:", data);
        const messagesArray = Array.isArray(data) ? data : [];
        setMessages(messagesArray);
        if (messagesArray.length === 0) {
          console.log("No messages found for conversation:", conversationId);
        }
      } else {
        const errorText = await res.text();
        console.error(`Failed to fetch messages: ${res.status} - ${errorText}`);
        setMessages([]);
        if (res.status !== 404) {
          Alert.alert("Error", `Cannot fetch messages: ${res.status} - ${errorText}`);
        }
      }
    } catch (e: any) {
      console.error("Error fetching messages:", e);
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
      if (!token) {
        Alert.alert("Error", "Missing token – user not logged in.");
        return;
      }
      const res = await fetch(`${BASE_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId: userId,
          receiverId: receiverId,
          content: newMessage.trim(),
        }),
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

  if (!userId || !conversationId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </View>
    );
  }

  const chooseLesson = async () => {
    setShowLessonModal(true);
    setLoadingLessons(true);
    try {
      const lessons = receiverId
        ? await fetchLessonsByTutorId(receiverId.toString())
        : await fetchLessonByTutor();
      setAvailableLessons(lessons);
    } catch (error: any) {
      console.error("Error fetching lessons:", error);
      Alert.alert("Error", `Cannot load lessons: ${error.message}`);
    } finally {
      setLoadingLessons(false);
    }
  };

  const startSession = (selectedLessonId: string) => {
    if (!conversationId || !receiverId) {
      Alert.alert("Error", "Missing conversation/receiver");
      return;
    }
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

  const handleDeleteSessionoffer = async () => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
      Alert.alert("Error", "Missing token – user not logged in.");
      return;
    }
    //TODO add endpoint on backend
    const res = await fetch(`${BASE_URL}/api/messages/offer`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });
  };

  if (!userId || !conversationId) {
    return (
        <View style={styles.loadingContainer}>
          <Text style={{ color: "#fff" }}>Loading...</Text>
        </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={RNPlatform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={80}
      enabled={RNPlatform.OS !== "web"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/conversations")}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.receiverInfo}>
          {Receiver && (
            <>
              {(() => {
                const imageUri = getImageUri(Receiver.photoPath);
                return imageUri && !avatarError ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.avatar}
                    onError={(e) => {
                      console.error("Error loading avatar:", e.nativeEvent.error);
                      console.error("Failed URI:", imageUri);
                      setAvatarError(true);
                    }}
                    onLoad={() => {
                      setAvatarError(false);
                    }}
                  />
                ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarPlaceholderText}>
                    {Receiver.username?.[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
              );
              })()}
              <Text style={styles.receiverName}>{Receiver.username}</Text>
            </>
          )}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={messages}
          keyExtractor={(item) => String(item.id)}
          refreshing={loading}
          onRefresh={fetchMessages}
          contentContainerStyle={{ paddingVertical: 10 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            !loading ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: "#888" }}>No messages</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isMyMessage = String(item.senderId) === String(userId);
            if (item.messageType === "INVITATION") {
              console.log('RENDER INVITATION CARD:', item);
              const isReceiver = String(item.receiverId) === String(userId);
              let lessonDetails = null;
              if (lesson && lesson.id === item.lessonId) {
                lessonDetails = lesson;
              } else if (availableLessons && Array.isArray(availableLessons)) {
                lessonDetails = availableLessons.find(l => l.id === item.lessonId);
              }
              const scheduledTime = lessonDetails?.startTime || lessonDetails?.scheduledTime || "-";
              const price = lessonDetails?.price ? `$${lessonDetails.price}` : "-";
              const subject = lessonDetails?.subject || "-";
              const tutor = lessonDetails?.tutor?.username || "-";
              return (
                  <View style={[
                    styles.invitationCard,
                  ]}>
                    <View style={styles.invitationHeaderRow}>
                      <Text style={styles.invitationEmoji}>📅</Text>
                      <Text style={styles.invitationTitleStrong}>Pending invitation</Text>
                    </View>
                    <View style={styles.invitationDetailsBlock}>
                      <Text style={styles.invitationDetailStrong}>Subject:</Text>
                      <Text style={styles.invitationDetailValue}>{subject}</Text>
                    </View>
                    <View style={styles.invitationDetailsBlock}>
                      <Text style={styles.invitationDetailStrong}>Tutor:</Text>
                      <Text style={styles.invitationDetailValue}>{tutor}</Text>
                    </View>
                    <View style={styles.invitationDetailsBlock}>
                      <Text style={styles.invitationDetailStrong}>Scheduled for:</Text>
                      <Text style={styles.invitationDetailValue}>{scheduledTime}</Text>
                    </View>
                    <View style={styles.invitationDetailsBlock}>
                      <Text style={styles.invitationDetailStrong}>Price:</Text>
                      <Text style={styles.invitationDetailValue}>{price}</Text>
                    </View>
                    {isReceiver && (
                        <>
                          <TouchableOpacity style={styles.acceptButton}>Decline</TouchableOpacity><TouchableOpacity
                            style={styles.acceptButton}
                            onPress={async () => {
                              try {
                                const token = await AsyncStorage.getItem("jwtToken");
                                if (!token) throw new Error("No token");
                                const res = await fetch(`${BASE_URL}/api/lessons/${item.lessonId}/status`, {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({status: "STARTED"}),
                                });
                                if (!res.ok) throw new Error("Failed to accept invitation");
                                Alert.alert("Success", "Invitation accepted");
                                fetchMessages();
                              } catch (e: any) {
                                Alert.alert("Error", e.message);
                              }
                            }}
                        >
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity></>
                    )}
                    {isMyMessage && (
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={async () => {
                          try {
                            const token = await AsyncStorage.getItem("jwtToken");
                            if (!token) throw new Error("No token");
                            const res = await fetch(`${BASE_URL}/api/messages/${item.id}`, {
                              method: "DELETE",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            });
                            if (!res.ok) throw new Error("Failed to remove invitation");
                            Alert.alert("Removed", "Invitation has been removed.");
                            fetchMessages();
                          } catch (e: any) {
                            Alert.alert("Error", e.message);
                          }
                        }}
                      >
                        <Text style={styles.declineButtonText} onPress={async() => {
                          Alert.alert(
                              "Confirm Deletion",
                              "You sure you want to delete session?",
                              [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: () => handleDeleteSessionoffer() },
                              ]
                          );
                        }}>Remove invitation</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={styles.timestamp}>
                      {item.timestamp
                          ? new Date(item.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : ""}
                    </Text>
                  </View>
              );
            }
            return (
              <View
                style={[
                  styles.message,
                  isMyMessage ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.timestamp}>
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Text>
              </View>
            );
          }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write message..."
            placeholderTextColor="#888"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            autoComplete="off"
            autoCorrect={false}
            onFocus={(e) => {
              if (RNPlatform.OS === 'web') {
                e.currentTarget?.focus();
              }
            }}
          />
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={chooseLesson} style={styles.sessionStartButton}>
              <Text style={styles.sendText}>Start Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={showLessonModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLessonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a Lesson</Text>
              <TouchableOpacity
                onPress={() => setShowLessonModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingLessons ? (
              <View style={styles.modalCenter}>
                <Text style={styles.modalText}>Loading lessons...</Text>
              </View>
            ) : availableLessons.length === 0 ? (
              <View style={styles.modalCenter}>
                <Text style={styles.modalText}>No lessons available</Text>
              </View>
            ) : (
              <FlatList
                data={availableLessons}
                keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.lessonModalItem}
                    onPress={() => startSession(item.id)}
                  >
                    <View style={styles.lessonModalContent}>
                      {(() => {
                        const tutorImageUri = getImageUri(item.tutor?.photoPath);
                        return tutorImageUri ? (
                          <Image
                            source={{ uri: tutorImageUri }}
                            style={styles.lessonModalAvatar}
                            onError={(e) => {
                              console.error("Error loading tutor avatar:", e.nativeEvent.error);
                              console.error("Failed URI:", tutorImageUri);
                            }}
                          />
                        ) : (
                        <View style={[styles.lessonModalAvatar, styles.avatarPlaceholder]}>
                          <Text style={styles.avatarPlaceholderText}>
                            {item.tutor?.username?.[0]?.toUpperCase() || "?"}
                          </Text>
                        </View>
                      );
                      })()}
                      <View style={styles.lessonModalInfo}>
                        <Text style={styles.lessonModalSubject}>{item.subject}</Text>
                        <Text style={styles.lessonModalTutor}>
                          Tutor: {item.tutor?.username || "Unknown"}
                        </Text>
                        <Text style={styles.lessonModalDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                        <Text style={styles.lessonModalDuration}>
                          Duration: {item.durationTime} minutes
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
export default ChatScreen;
