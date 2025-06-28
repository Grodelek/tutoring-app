import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  Alert,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConversationHistoryScreen: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchConversationHistory = async () => {
    if (!userId) {
      console.warn('⚠️ userId is null or undefined');
      return;
    }

    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) {
      Alert.alert('Błąd', 'Brak tokenu – użytkownik niezalogowany.');
      return;
    }

    try {
      console.log('🔄 Fetching conversation history for userId:', userId);
      const response = await fetch(
        `http://192.168.1.32:8090/api/conversation-history/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Received conversation data:', data);
        const conversationsList = data;

        if (!Array.isArray(conversationsList)) {
          console.warn('⚠️ conversationList nie jest tablicą:', conversationsList);
          setConversations([]);
          return;
        }

        const filtered = conversationsList.filter(
          (conv) => conv.user1Id === userId);

        setConversations(filtered);
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        Alert.alert('Błąd', `Nie udało się pobrać historii konwersacji: ${errorText}`);
      }
    } catch (error: any) {
      console.error('❌ Network or server error:', error);
      Alert.alert('Błąd', `Problem z połączeniem: ${error.message}`);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('userId').then((id) => {
      console.log('ℹ️ Loaded userId from storage:', id);
      setUserId(id);
    });
  }, []);

  useEffect(() => {
    if (userId) {
      fetchConversationHistory();
    }
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversationHistory();
    setRefreshing(false);
  };

  const handlePressConversation = (item: any) => {
    console.log('🧪 Pressed conversation:', item);

    if (!item?.id || !item?.user1Id || !item?.user2Id || !userId) {
      console.warn('⚠️ Missing data in conversation item:', item);
      return;
    }

    const conversationId = String(item.id);
    const receiverId =
      String(item.user1Id) === String(userId)
        ? String(item.user2Id)
        : String(item.user1Id);

    console.log(`➡️ Navigating to conversationId: ${conversationId}, receiverId: ${receiverId}`);

    router.push({
      pathname: '/messages/[conversationId]',
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
        ListEmptyComponent={
          <Text style={styles.emptyText}>Brak historii konwersacji.</Text>
        }
       
renderItem={({ item }) => {
  if (!item?.user1Id || !item?.user2Id) {
    console.warn('⚠️ Pominięto rozmowę z brakującym userId:', item);
    return null;
  }

  const isUser1 = item.user1Id === userId;

  const otherUsername =
    isUser1
    ? item.user2Username || item.user2Id
    : item.user1Username || item.user1Id;


  return (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handlePressConversation(item)}
    >
      <Text style={styles.conversationId}>Rozmówca: {otherUsername}</Text>
    </TouchableOpacity>
  );
}}

      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#121212' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#fff' },
  conversationItem: {
    backgroundColor: '#222',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
  },
  conversationId: { color: '#BB86FC', fontWeight: '700', marginBottom: 5 },
  emptyText: { color: '#888', marginTop: 50, textAlign: 'center' },
});

export default ConversationHistoryScreen;

