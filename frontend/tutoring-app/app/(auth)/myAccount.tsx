import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Image,
  TextInput,
  Button,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const MyAccount: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('Error', 'Missing token – user not logged in.');
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
        Alert.alert('Error', `Failed to fetch user: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert('Error', `Connection error: ${error.message}`);
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
        Alert.alert('Success', 'Username updated.');

        const loginResponse = await fetch('http://192.168.1.32:8090/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          await AsyncStorage.setItem('jwtToken', data.token);
          setIsEditing(false);
          fetchUser();
        } else {
          Alert.alert('Login error', 'Please log in manually.');
          navigation.navigate('Login' as never);
        }
      } else {
        const errorText = await response.text();
        Alert.alert('Error', `Could not update: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert('Error', `Connection issue: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user ? (
        <View style={styles.userItem}>
          <Pressable onPress={() => setModalVisible(true)}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${user.username}&background=random&bold=true&color=fff` }}
              style={styles.avatar}
            />
          </Pressable>

          <Text style={styles.userText}>ID: {user.id}</Text>
          <Text style={styles.userText}>Username: {user.username}</Text>
          <Text style={styles.userText}>Email: {user.email}</Text>

          {isEditing ? (
            <>
              <TextInput
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                placeholder="New username"
                placeholderTextColor="#888"
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholder="Current password"
                placeholderTextColor="#888"
                secureTextEntry
              />
              <Button title="Save" onPress={updateUsername} color="#c678dd" />
            </>
          ) : (
            <Button title="Change Username" onPress={() => setIsEditing(true)} color="#c678dd" />
          )}
        </View>
      ) : (
        <Text style={styles.userText}>Loading user data...</Text>
      )}

      {/* Modal for full-screen avatar */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${user?.username}&background=random&bold=true&color=fff` }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#1e1e1e',
    justifyContent: 'flex-start',
  },
  userItem: {
    backgroundColor: '#2d2d2d',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  userText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    borderColor: '#444',
    borderWidth: 1,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 15,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#c678dd',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '85%',
    height: '50%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#c678dd',
  },
});

export default MyAccount;

