import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  Alert,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "@/config/baseUrl";

const ConversationHistoryScreen: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchConversationHistory = async (uid: string, token: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/conversation/${uid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const filtered = Array.isArray(data)
          ? data.filter((conv) => conv.user1Id === uid || conv.user2Id === uid)
          : [];

        setConversations(filtered);
      } else {
        const errorText = await response.text();
        Alert.alert("Error", `Cannot fetch conversation history: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert("Error", `Problem with connection: ${error.message}`);
    }
  };

  const loadAndFetch = useCallback(async () => {
    try {
      const [uid, token] = await Promise.all([
        AsyncStorage.getItem("userId"),
        AsyncStorage.getItem("jwtToken"),
      ]);

      if (uid && token) {
        setUserId(uid);
        await fetchConversationHistory(uid, token);
      }
    } catch (error: any) {
      Alert.alert("Error", `Problem loading user data: ${error.message}`);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAndFetch();
    }, [loadAndFetch]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      const token = await AsyncStorage.getItem("jwtToken");
      if (token) {
        await fetchConversationHistory(userId, token);
      }
    }
    setRefreshing(false);
  };

  const handlePressConversation = (item: any) => {
    if (!item?.id || !item?.user1Id || !item?.user2Id || !userId) {
      return;
    }

    const conversationId = String(item.id);
    const receiverId =
      String(item.user1Id) === String(userId)
        ? String(item.user2Id)
        : String(item.user1Id);
    router.push({
      pathname: "/messages/[conversationId]",
      params: {
        conversationId,
        receiverId,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historia Konwersacji</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => String(item.id || Math.random())}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Brak historii konwersacji.</Text>
        }
        renderItem={({ item }) => {
          if (!item?.user1Id || !item?.user2Id) {
            return null;
          }

          const isUser1 = item.user1Id === userId;
          const otherUsername = isUser1
            ? item.user2Username || item.user2Id
            : item.user1Username || item.user1Id;

          return (
            <TouchableOpacity
              style={styles.conversationItem}
              onPress={() => handlePressConversation(item)}
            >
              <Text style={styles.conversationId}>
                Rozmówca: {otherUsername}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#fff" },
  conversationItem: {
    backgroundColor: "#222",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
  },
  conversationId: { color: "#BB86FC", fontWeight: "700", marginBottom: 5 },
  emptyText: { color: "#888", marginTop: 50, textAlign: "center" },
});

export default ConversationHistoryScreen;
