import React, { useState, useEffect } from "react";
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
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import useUpdateUserProfile from "@/hooks/MyAccount/useUpdateUserProfile";
import { router } from "expo-router";
import { BASE_URL } from "@/config/baseUrl";
import {AuthData, getMyAccount} from "@/api/userApi";

const MyAccount: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [description, setDescription] = useState("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  };

  const fetchUser = async () => {
      try {
          const response = await getMyAccount();
      if (response) {
        const userData = await response.json();
        setUser(userData);
        setUsername(userData.username);
        setDescription(userData.description || "");
      } else {
        Alert.alert("Error", `Failed to fetch user`);
        router.push("/login");
      }
    } catch (error: any) {
      Alert.alert("Error", `Connection error: ${error.message}`);
    }
  };

  const updateUserProfile = useUpdateUserProfile({
    user,
    username,
    password,
    description,
    setIsEditing,
    fetchUser,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
          <Text style={styles.userName}>{user.username}</Text>
          <Text style={styles.userText}>Email: {user.email}</Text>
          <Text style={styles.userText}>Description: {user.description}</Text>
            <Text style={styles.userText}>Points: {user.points}</Text>
          <Button
            title={isEditing ? "Cancel" : "Edit"}
            onPress={() => setIsEditing((prev) => !prev)}
            color="#61dafb"
          />
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
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                placeholder="New description"
                placeholderTextColor="#888"
              />
              <Button
                title="Save"
                color="#c678dd"
                onPress={updateUserProfile}
              />
            </>
          ) : null}
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
            <>
              <Image
                source={{ uri: user.photoPath }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
              <Text style={{ color: "white" }}>hello!</Text>
            </>
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
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#1e1e1e",
    justifyContent: "flex-start",
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
  userName: {
    color: "white",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
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

export default MyAccount;
