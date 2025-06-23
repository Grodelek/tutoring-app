import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { token, setToken } = useAuth();
  const router = useRouter();
  const handleSubmit = async () => {
    try {
      const response = await fetch('http://192.168.1.32:8090/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });
      if (response.ok) {
        const token = await response.text();
        if (token) {
          await AsyncStorage.setItem('jwtToken', token);
          setToken(token);
          Alert.alert('Success', 'User logged in successfully!');
        } else {
          Alert.alert('Error', 'Token not found in response');
        }
      } else {
        const errorText = await response.text();
        Alert.alert('Error', `User login failed ${errorText}`);
      }
    } catch (error) {
      Alert.alert('Error', `Problem with connection: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, styles.inputTextWhite]}
        autoCapitalize="none"
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={[styles.input, styles.inputTextWhite]}
        autoCapitalize="none"
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        autoCapitalize="none"
        secureTextEntry={true}
        placeholderTextColor="#aaa"
      />
      <Button title="Login" onPress={handleSubmit} />
    </View>
  );
};

export default function Login() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace('(auth)');
    }
  }, [token]);
  return (
    <View style={styles.container}>
      <LoginForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
    backgroundColor: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    color: 'white',
    backgroundColor: '#222',
  },
  inputTextWhite: {
    color: 'white',
  },
});

