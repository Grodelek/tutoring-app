import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, FlatList, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { conversationId } = useLocalSearchParams();

  // Pobieramy userId z AsyncStorage przy starcie komponentu
  useEffect(() => {
    AsyncStorage.getItem('userId').then(setUserId);
  }, []);

  const fetchMessages = async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const res = await fetch(`http://192.168.1.32:8090/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        Alert.alert('Błąd', 'Nie udało się pobrać wiadomości');
      }
    } catch {
      Alert.alert('Błąd', 'Problem z połączeniem');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !conversationId) return;
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const res = await fetch('http://192.168.1.32:8090/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
          senderId: userId,
          content: newMessage.trim(),
        }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      } else {
        Alert.alert('Błąd', 'Nie udało się wysłać wiadomości');
      }
    } catch {
      Alert.alert('Błąd', 'Problem z połączeniem');
    }
  };

  if (!userId || !conversationId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#fff' }}>Ładowanie...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchMessages}
        renderItem={({ item }) => (
          <View style={[styles.message, item.senderId === userId ? styles.myMessage : styles.otherMessage]}>
            <Text style={{ color: '#fff' }}>{item.content}</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Napisz wiadomość..."
        value={newMessage}
        onChangeText={setNewMessage}
      />
      <Button title="Wyślij" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 10 },
  message: { marginVertical: 5, padding: 10, borderRadius: 8, maxWidth: '80%' },
  myMessage: { backgroundColor: '#4caf50', alignSelf: 'flex-end' },
  otherMessage: { backgroundColor: '#333', alignSelf: 'flex-start' },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  timestamp: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});

export default ChatScreen;

