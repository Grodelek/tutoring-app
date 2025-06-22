import React, {useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
const UserForm: React.FC = () => {

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigateToLogin = () => {
   router.push('/login'); 
  };
  const handleSubmit = async () => {
    try {
      const response = await fetch('http://192.168.1.32:8090/api/users/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });
    if (response.ok) {
      Alert.alert('Success', 'User registered successfully!');
    } else {
      const errorText = await response.text();
      Alert.alert('Error', `User registration failed ${errorText}`);
    }
    }catch (error){
      Alert.alert('Error', `Problem with connection: ${error}`);
    }
};
return (
  <View style = {styles.container}>
    <TextInput
      placeholder="Email"
      value={email}
      onChangeText={setEmail}
      style={[styles.input, styles.inputTextWhite]}
      autoCapitalize="none"
      />
    <TextInput
      placeholder="Username"
      value={username}
      onChangeText={setUsername}
      style={[styles.input, styles.inputTextWhite]}
      autoCapitalize="none"
      />
     <TextInput
      placeholder="Password"
      value={password}
      onChangeText={setPassword}
      style={[styles.input]}
      autoCapitalize="none"
      secureTextEntry={true}
      />
    <Text onPress={navigateToLogin} style={{ color: 'blue', textDecorationLine: 'underline' }}>
      Already have an account? Login here:
    </Text>
      <Button title="Register" onPress={handleSubmit} />
  </View>
);
};
const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
    backgroundColor: '#000', // opcjonalnie ciemne tło formularza
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    color: 'white',               // 👈 biały tekst
    backgroundColor: '#222',      // 👈 ciemne tło inputa
  },
});

export default UserForm;
