import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Alert, StyleSheet, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConversationHistoryScreen: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    if (!userId) return;

    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) {
      Alert.alert('Błąd', 'Brak tokenu – użytkownik niezalogowany.');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.32:8090/api/conversation-history/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        const errorText = await response.text();
        Alert.alert('Błąd', `Nie udało się pobrać historii konwersacji: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert('Błąd', `Problem z połączeniem: ${error.message}`);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('userId').then((id) => {
      setUserId(id);
    });
  }, []);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historia Konwersacji</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Brak historii konwersacji.</Text>}
        renderItem={({ item }) => (
          <View style={styles.conversationItem}>
            <Text style={styles.conversationId}>ID: {item.id}</Text>
            <Text style={styles.users}>
              Użytkownicy: {item.user1Id} - {item.user2Id}
            </Text>
          </View>
        )}
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
  users: { color: '#ccc' },
  emptyText: { color: '#888', marginTop: 50, textAlign: 'center' },
});

export default ConversationHistoryScreen;
