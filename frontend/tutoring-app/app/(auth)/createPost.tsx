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
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { BASE_URL } from "@/config/baseUrl";

const CreatePost: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [durationTime, setDurationTime] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("jwtToken");
      if (!storedUserId) {
        Alert.alert("Error", "User ID not found in storage");
        return;
      }
      if (!token) {
        Alert.alert("Error", "Missing token – user not logged in.");
        return;
      }
      const response = await fetch(`${BASE_URL}/api/lessons/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          description,
          price,
          durationTime: parseInt(durationTime, 10),
        }),
      });
      if (response.ok) {
        setSubject("");
        setDescription("");
        setDurationTime("");
        Alert.alert("Success", "Lesson added!");
        router.push("/exploreTutors");
      } else {
        const errorText = await response.text();
        Alert.alert("Error", `User registration failed: ${errorText}`);
      }
    } catch (error) {
      Alert.alert("Error", `Problem with connection: ${error}`);
    }
  };

  const containerContent = (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create a lesson offer</Text>
        <Text style={styles.subtitle}>
          Share what you teach and help students reach their goals.
        </Text>

        <Text style={styles.label}>Subject</Text>
        <TextInput
          placeholder="e.g. Math, English, Guitar"
          placeholderTextColor="#999"
          value={subject}
          onChangeText={setSubject}
          style={styles.input}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          onFocus={(e) => {
            if (Platform.OS === "web") {
              e.currentTarget?.focus();
            }
          }}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Describe your lesson, level, and what students can expect."
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.multilineInput]}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          multiline
          numberOfLines={3}
          onFocus={(e) => {
            if (Platform.OS === "web") {
              e.currentTarget?.focus();
            }
          }}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Duration</Text>
            <TextInput
              placeholder="45"
              placeholderTextColor="#999"
              value={durationTime}
              onChangeText={setDurationTime}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="numeric"
              returnKeyType="done"
              autoComplete="off"
              autoCorrect={false}
              onSubmitEditing={() => Keyboard.dismiss()}
              onFocus={(e) => {
                if (Platform.OS === "web") {
                  e.currentTarget?.focus();
                }
              }}
            />
            <Text style={styles.helperText}>minutes</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              placeholder="30"
              placeholderTextColor="#999"
              value={price}
              onChangeText={setPrice}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="numeric"
              returnKeyType="done"
              autoComplete="off"
              autoCorrect={false}
              onSubmitEditing={() => Keyboard.dismiss()}
              onFocus={(e) => {
                if (Platform.OS === "web") {
                  e.currentTarget?.focus();
                }
              }}
            />
            <Text style={styles.helperText}>per lesson</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Publish offer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return Platform.OS === 'web' ? (
    containerContent
  ) : (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      {containerContent}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 14,
    color: "#9BA1A6",
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: "#ECEDEE",
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 14,
    color: "#fff",
    marginBottom: 4,
    backgroundColor: "#1a1a1a",
  },
  multilineInput: {
    height: 96,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  rowItem: {
    flex: 1,
    marginRight: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#9BA1A6",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#5e5ce6",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 12,
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
