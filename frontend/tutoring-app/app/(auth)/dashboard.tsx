import React, { useState, useEffect } from "react";
import {
    View,
    FlatList,
    Text,
    Alert,
    StyleSheet,
    TouchableOpacity,
    Image
} from "react-native";
import { Button } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { BASE_URL } from "@/config/baseUrl";
import {MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";

const Dashboard: React.FC = () => {
  const [lesson, setLesson] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const fetchLessons = async () => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
      Alert.alert("Error", "No token – user is not logged in.");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/lessons/all-with-tutors`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const lessonsWithTutors = await response.json();
        setLesson(lessonsWithTutors);
      } else {
        const errorText = await response.text();
        Alert.alert("Error", `Cannot fetch lessons: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert("Error", `Problem with connection: ${error.message}`);
    }
  };

  const initialize = async () => {
    const storedUserId = await AsyncStorage.getItem("userId");
    setUserId(storedUserId);
    await fetchLessons();
  };

  useEffect(() => {
    initialize();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLessons();
    setRefreshing(false);
  };

  const handleMessageTutor = async (tutorId: string) => {
    const token = await AsyncStorage.getItem("jwtToken");
    const currentUserId = await AsyncStorage.getItem("userId");
    if (!token || !currentUserId) {
      Alert.alert("Error", "No user info");
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/api/messages/get-or-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user1Id: currentUserId,
            user2Id: tutorId,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        router.push({
          pathname: "/messages/[conversationId]",
          params: { conversationId: data.id, receiverId: tutorId },
        });
      } else {
        const errorText = await response.text();
        Alert.alert(
          "Error",
          `Cannot start conversation: ${response.status} - ${errorText}`,
        );
      }
    } catch (error: any) {
      Alert.alert("Error", `Connection error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lista lekcji:</Text>
      <FlatList
        data={lesson}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.lessonItem}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/userProfile/[userId]",
                  params: { userId: item.tutorId },
                })
              }
            >
              {item.tutorPhotoPath ? (
                <Image
                  source={{ uri: item.tutorPhotoPath }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: "#555",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Text style={{ color: "#fff" }}>No Image</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.userText}>
                <MaterialIcons name="person" size={19} color="white" /> Tutor: {item.tutorUsername ?? "No data"}
            </Text>
            <Text style={styles.userText}>
                <MaterialCommunityIcons name="book-open-page-variant" size={19} color="white" /> Subject: {item.subject}</Text>
            <Text style={styles.userText}>
                <MaterialCommunityIcons name="note-outline" size={19} color="white" /> Description: {item.description}
            </Text>
            <Text style={styles.userText}>
                <MaterialIcons name="access-time" size={19} color="white" /> Lesson duration: {item.durationTime} minutes
            </Text>
            {userId !== item.tutorId && (
                <Button
                    mode="outlined"
                    onPress={() => handleMessageTutor(item.tutorId)}
                    textColor="#7C4DFF"
                    style={{
                        borderColor: "#7C4DFF",
                        borderWidth: 2,
                        borderRadius: 12,
                        paddingVertical: 4,
                        marginTop: 8,
                    }}
                    labelStyle={{
                        fontSize: 16,
                        fontWeight: "600",
                    }}
                >
                    Write message
                </Button>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  lessonItem: {
    marginTop: 20,
  },
  avatar: {
    borderRadius: 30,
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  userItem: {
    backgroundColor: "#333",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
  },
  userText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
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
});
export default Dashboard;
