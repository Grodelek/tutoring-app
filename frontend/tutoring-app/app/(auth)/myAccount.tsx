import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Image,
  TextInput,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyAccount: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState('');
 
  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('Błąd', 'Brak tokenu – użytkownik niezalogowany.'); 
        router.replace('tabs');
        return;
      }

      const response = await fetch('http://192.168.1.32:8090/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setUsername(userData.username);
      } else {
        const errorText = await response.text();
        Alert.alert('Błąd', `Nie udało się pobrać danych użytkownika: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert('Błąd', `Problem z połączeniem: ${error.message}`);
    }
  };

 const updateUsername = async () => {
  try {
    const token = await AsyncStorage.getItem('jwtToken');
    if (!token || !user) return;

    const response = await fetch(`http://192.168.1.32:8090/api/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });

    if (response.ok) {
      Alert.alert('Sukces', 'Nazwa użytkownika została zaktualizowana.');

      const loginResponse = await fetch('http://192.168.1.32:8090/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        await AsyncStorage.setItem('jwtToken', data.token);
        setIsEditing(false);
        fetchUser();
      } else {
        Alert.alert('Błąd logowania', 'Zaloguj się ponownie ręcznie.');
        navigation.navigate('Login');
      }

    } else {
      const errorText = await response.text();
      Alert.alert('Błąd', `Nie udało się zapisać zmian: ${errorText}`);
    }
  } catch (error: any) {
    Alert.alert('Błąd', `Błąd połączenia: ${error.message}`);
  }
};  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.userItem}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${user.username}&background=random` }}
            style={styles.avatar}
          />
          <Text style={styles.userText}>Id: {user.id}</Text>
          <Text style={styles.userText}>Username: {user.username}</Text>
          <Text style={styles.userText}>email: {user.email}</Text>
          {isEditing ? (
            <>
              <TextInput
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                placeholder="Nowa nazwa użytkownika"
                placeholderTextColor="#888"
              />
              <Button title="Zapisz" onPress={updateUsername} />
            </>
          ) : (
            <Button title="Change username" onPress={() => setIsEditing(true)} />
          )}


        </View>
      ) : (
        <Text style={styles.userText}>Ładowanie danych użytkownika...</Text>
      )}
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
    borderRadius: 8,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
    borderColor: '#444',
    borderWidth: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    alignSelf: 'center',
  },
});

export default MyAccount;

