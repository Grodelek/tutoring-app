import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const Dashboard: React.FC = () => {
  const [lesson, setLesson] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchLessons = async () => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) {
      Alert.alert('Błąd', 'Brak tokenu – użytkownik niezalogowany.');
      router.replace('tabs');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.32:8090/api/lessons/all-with-tutors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const lessonsWithTutors = await response.json();
        setLesson(lessonsWithTutors);
      } else {
        const errorText = await response.text();
        Alert.alert('Błąd', `Nie udało się pobrać lekcji: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert('Błąd', `Problem z połączeniem: ${error.message}`);
    }
  };

  const initialize = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    setUserId(storedUserId);
    await fetchLessons();
  };

  useEffect(() => {
    initialize();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLessons();
    setRefreshing(false);
  };
const handleMessageTutor = async (tutorId: string) => {
  const token = await AsyncStorage.getItem('jwtToken');
  const currentUserId = await AsyncStorage.getItem('userId');
  console.log("Attempting to message tutor with ID:", tutorId); // ✅ Debugowanie
  console.log('TOKEN:', token);
  console.log('USER ID:', currentUserId);
  if (!token || !currentUserId) {
    Alert.alert('Błąd', 'Brak informacji o użytkowniku.');
    return;
  }

  const response = await fetch('http://192.168.1.32:8090/api/messages/get-or-create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user1Id: currentUserId,
      user2Id: tutorId,
    }),
  });
if (response.ok) {
  const data = await response.json();
  const conversationId = data.id;
  console.log(conversationId);
  router.push({
        pathname: "/(auth)/messages/[conversationId]",
        params: { conversationId: data.id, receiverId: tutorId },
    });
} else {
  const status = response.status;
  const statusText = response.statusText;
  const errorText = await response.text();
  console.log('❌ Błąd serwera:', { status, statusText, errorText });
  Alert.alert('Błąd', `Nie udało się rozpocząć konwersacji: ${status} ${statusText} - ${errorText}`);
}
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lista lekcji:</Text>
      <FlatList
        data={lesson}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userText}>📘 Przedmiot: {item.subject}</Text>
            <Text style={styles.userText}>📝 Opis: {item.description}</Text>
            <Text style={styles.userText}>⏱️ Czas trwania: {item.durationTime} minut</Text>
            <Text style={styles.userText}>👤 Nauczyciel: {item.tutorUsername ?? 'Brak danych'}</Text>

            {userId !== item.tutorId && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleMessageTutor(item.tutorId)}
              >
                <Text style={styles.buttonText}>Napisz do nauczyciela</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.userText}>Brak dostępnych lekcji.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  userItem: {
    backgroundColor: '#333',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default Dashboard;

