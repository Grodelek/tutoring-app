import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const CreatePost: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [durationTime, setDurationTime] = useState("");

  const handleSubmit = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("jwtToken");
      if (!storedUserId) {
        Alert.alert("Error", "User ID not found in storage");
        return;
      }
      const response = await fetch("http://16.16.106.84:8090/api/lessons/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          description,
          durationTime: parseInt(durationTime, 10),
          tutorId: storedUserId,
        }),
      });
      if (response.ok) {
        setSubject("");
        setDescription("");
        setDurationTime("");
        Alert.alert("Success", "Lesson added!");
        router.push("/dashboard");
      } else {
        const errorText = await response.text();
        Alert.alert("Error", `User registration failed: ${errorText}`);
      }
    } catch (error) {
      Alert.alert("Error", `Problem with connection: ${error}`);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.title}>Add lesson</Text>

        <TextInput
          placeholder="Subject"
          placeholderTextColor="#999"
          value={subject}
          onChangeText={setSubject}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Description"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Duration time"
          placeholderTextColor="#999"
          value={durationTime}
          onChangeText={setDurationTime}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Wyślij</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 16,
    color: "#fff",
    marginBottom: 16,
    backgroundColor: "#1a1a1a",
  },
  button: {
    backgroundColor: "#5e5ce6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#5e5ce6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreatePost;
