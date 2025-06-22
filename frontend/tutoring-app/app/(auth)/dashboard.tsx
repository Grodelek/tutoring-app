import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Alert, StyleSheet } from 'react-native';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://192.168.1.32:8090/api/users/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data); // Zakładamy, że `data` to tablica użytkowników
      } else {
        const errorText = await response.text();
        Alert.alert('Błąd', `Nie udało się pobrać użytkowników: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert('Błąd', `Problem z połączeniem: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userText}>Email: {item.email}</Text>
            <Text style={styles.userText}>Username: {item.username}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.userText}>Brak użytkowników.</Text>}
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

