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
import {MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import {fetchLessonsFromApi, sendMessageToTutor} from "@/api/lessonApi";

const Dashboard: React.FC = () => {
  const [lesson, setLesson] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
    const fetchLessons = async () => {
        try {
            const lessons = await fetchLessonsFromApi();
            setLesson(lessons);
        } catch (error: any) {
            console.error("Error fetching lessons:", error);
            if (error.message === "Authentication token not found") {
                Alert.alert("Session expired", "Please log in again.");
                router.push("/login");
                return;
            }
            setLesson([]);
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

  const handleMessageTutor = async (tutorId: string) => {
      try {
          const conversation = await sendMessageToTutor(tutorId);
          router.push({
              pathname: "/messages/[conversationId]",
              params: {
                  conversationId: conversation.id,
                  receiverId: tutorId,
              },
          });
      } catch (error: any) {
          console.error("Error starting conversation:", error);
          Alert.alert("Error", `Problem with connection: ${error.message}`);
      }
  };

  const onRefresh = async () => {
      setRefreshing(true);
      await fetchLessons();
      setRefreshing(false);
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
