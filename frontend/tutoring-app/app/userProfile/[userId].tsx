import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
const UserProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [refreshing, setRefreshing] = useState(false);

  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId && typeof userId === "string") {
      await fetchUser(userId);
    }
    setRefreshing(false);
  };

  const fetchUser = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        Alert.alert("Error", "Missing token – user not logged in.");
        return;
      }
      const response = await fetch(`http://16.16.106.84:8090/api/users/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched user data:", data);
        setUser(data);
        setUsername(data.username);
      } else {
        const errorText = await response.text();
        Alert.alert("Error", `Failed to fetch user: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert("Error", `Connection error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (userId && typeof userId === "string") {
      fetchUser(userId);
    } else {
      console.warn("Invalid userId param:", userId);
    }
  }, [userId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user ? (
        <View style={styles.userItem}>
          <Pressable onPress={() => setModalVisible(true)}>
            {user.photoPath ? (
              <Image source={{ uri: user.photoPath }} style={styles.avatar} />
            ) : (
              <Text style={{ color: "white", textAlign: "center" }}>
                No photo available
              </Text>
            )}
          </Pressable>
          <Text style={styles.userText}>ID: {user.id}</Text>
          <Text style={styles.userText}>Username: {user.username}</Text>
          <Text style={styles.userText}>Email: {user.email}</Text>
          <Text style={styles.userText}>
            Description: {user.description ?? "No description"}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigateToDashboard()}
          >
            <Text style={styles.buttonText}>Return</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.userText}>Loading user data...</Text>
      )}
      <Modal
        visible={modalVisible && !!user?.photoPath}
        transparent
        animationType="fade"
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        >
          {user?.photoPath ? (
            <Image
              source={{ uri: user.photoPath }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ color: "white" }}>No photo available</Text>
          )}
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#1e1e1e",
    justifyContent: "flex-start",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  userItem: {
    backgroundColor: "#2d2d2d",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  userText: {
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    borderColor: "#444",
    borderWidth: 1,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 15,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#c678dd",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "85%",
    height: "50%",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#c678dd",
  },
});

export default UserProfile;
