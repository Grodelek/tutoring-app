import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { postRegister } from "@/api/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"TUTOR" | "STUDENT">("STUDENT");

  const showAlert = (message: string) => {
    if (Platform.OS === "web") {
      alert(message);
    } else {
      Alert.alert("Error", message);
    }
  };

  const handleSubmit = async () => {
    try {
      if (username.length < 6) {
        showAlert("Username must have at least 6 characters.");
        return;
      }

      await postRegister({ email, username, password, userType });
      setEmail("");
      setUsername("");
      setPassword("");
      showAlert("Success! User registered successfully!");
      AsyncStorage.setItem("userType", userType);
      router.push("/login");
    } catch (error) {
      console.log("Registration error:", error);

      showAlert("Error while registering user");
    }
  };

  return (
      <View style={styles.screen}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>CREATE ACCOUNT</Text>

          <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
          />
          <TextInput
              placeholder="Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect={false}
          />
          <TextInput
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              autoCapitalize="none"
              secureTextEntry={true}
              autoComplete="password"
              autoCorrect={false}
          />

          <Text style={styles.roleLabel}>I am a:</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
                style={[
                  styles.roleButton,
                  userType === "STUDENT" && styles.roleButtonActive,
                ]}
                onPress={() => setUserType("STUDENT")}
            >
              <Text
                  style={[
                    styles.roleButtonText,
                    userType === "STUDENT" && styles.roleButtonTextActive,
                  ]}
              >
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                  styles.roleButton,
                  userType === "TUTOR" && styles.roleButtonActive,
                ]}
                onPress={() => setUserType("TUTOR")}
            >
              <Text
                  style={[
                    styles.roleButtonText,
                    userType === "TUTOR" && styles.roleButtonTextActive,
                  ]}
              >
                Tutor
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleSubmit} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Register</Text>
          </TouchableOpacity>

          <Text style={styles.secondaryText}>
            Already have an account?{" "}
            <Text onPress={() => router.push("/login")} style={styles.loginText}>
              Login here
            </Text>
          </Text>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B0C10",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#111827",
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    color: "#F9FAFB",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: "#1F2937",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderRadius: 10,
    color: "#F9FAFB",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#111827",
  },
  roleLabel: {
    color: "#9CA3AF",
    fontSize: 13,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#1F2937",
  },
  roleButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  roleButtonText: {
    color: "#9CA3AF",
    fontWeight: "600",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#F9FAFB",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryText: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
  },
  loginText: {
    color: "#5e5ce6",
    textDecorationLine: "underline",
  },
});

export default RegisterForm;