
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWebSocketMessages } from '../../hooks/useWebSocketMessages';

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
  const { conversationId, receiverId } = useLocalSearchParams();
  const router = useRouter();
  const [receiverName, setReceiverName] = useState<string>('Nauczyciel');

  useWebSocketMessages(conversationId, (incomingMessage) => {
    setMessages((prev) => [...prev, incomingMessage]);
  });

  useEffect(() => {
    AsyncStorage.getItem('userId').then(setUserId);
    if (receiverId && typeof receiverId === 'string') {
      setReceiverName(receiverId);
    }
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
    } catch (e) {
      Alert.alert('Błąd', 'Problem z połączeniem');
    } finally {
      setLoading(false);
    }
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
          senderId: userId,
          receiverId: receiverId,
          content: newMessage.trim(),
        }),
      });
      if (res.ok) {
        setNewMessage('');
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/dashboard')} style={styles.backButton}>
          <Text style={styles.backText}>← Wróć</Text>
        </TouchableOpacity>
        <View style={styles.receiverInfo}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                receiverName
              )}&background=random&bold=true&color=fff&size=48`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.receiverName}>{receiverName}</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchMessages}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.senderId === userId ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.content}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Napisz wiadomość..."
          placeholderTextColor="#888"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Wyślij</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1F1B24',
  },
  backButton: {
    paddingRight: 12,
  },
  backText: {
    color: '#BB86FC',
    fontSize: 16,
    fontWeight: '600',
  },
  receiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#BB86FC',
  },
  receiverName: {
    color: '#E0E0E0',
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    marginVertical: 5,
    padding: 12,
    borderRadius: 16,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  myMessage: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#333',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1F1B24',
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#BB86FC',
    paddingHorizontal: 16,
    marginLeft: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendText: {
    color: '#121212',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ChatScreen;

