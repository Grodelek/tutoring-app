import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Alert, StyleSheet } from 'react-native';

const Dashboard: React.FC = () => {
  const [lesson, setLesson] = useState<any[]>([]);

  const fetchLessons = async () => {
    try {
      const response = await fetch('http://192.168.1.32:8091/api/lessons/all-with-tutors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const lessonsWithTutors = await response.json();  // <-- tutaj parsujemy json
        setLesson(lessonsWithTutors);
      } else {
        const errorText = await response.text();
        Alert.alert('Błąd', `Nie udało się pobrać lekcji: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert('Błąd', `Problem z połączeniem: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={lesson}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userText}>Subject: {item.subject}</Text>
            <Text style={styles.userText}>Description: {item.description}</Text>
            <Text style={styles.userText}>Duration time: {item.durationTime}</Text>
            <Text style={styles.userText}>
              Tutor: {item.tutor ? item.tutor.username : 'Brak danych'}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.userText}>Brak lekcji.</Text>}
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
  userItem: {
    backgroundColor: '#333',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Dashboard;

