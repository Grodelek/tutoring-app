import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setToken } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://192.168.1.32:8090/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        const userId = data.userId;
        if (token) {
          await AsyncStorage.setItem("jwtToken", token);
          await AsyncStorage.setItem("username", username);
          await AsyncStorage.setItem("userId", userId.toString());
          setToken(token);
          Alert.alert("Success", "User logged in successfully!");
        } else {
          Alert.alert("Error", "Token not found in response");
        }
      } else {
        const errorText = await response.text();
        Alert.alert("Error", `User login failed ${errorText}`);
      }
    } catch (error) {
      Alert.alert("Error", `Problem with connection`);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>LOGIN</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        autoCapitalize="none"
        secureTextEntry
        placeholderTextColor="#aaa"
      />
      <View style={styles.rememberMeContainer}>
        <Text style={styles.rememberMeText}>Remember me</Text>
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
        <Text style={styles.loginButtonText}>LOGIN</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function Login() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace("/(auth)");
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
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    backgroundColor: "#202040",
    padding: 30,
    borderRadius: 10,
    width: "85%",
  },
  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#2f2f4f",
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
    color: "#fff",
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  rememberMeText: {
    color: "#ccc",
    marginLeft: 5,
  },
  loginButton: {
    backgroundColor: "#4a63f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  forgotPassword: {
    color: "#b29eff",
    textAlign: "center",
    marginTop: 10,
  },
});
