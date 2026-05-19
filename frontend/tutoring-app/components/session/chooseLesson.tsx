import {fetchLessonsFromApi} from "@/api/lessonApi";
import {sendMessageToTutor} from "@/api/lessonApi";
import {
    Alert,
    FlatList,
    Image,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import React, {useState, useEffect} from "react";
import {router, useLocalSearchParams} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChooseLesson: React.FC = () => {
    const [lessons, setLessons] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { receiverId } = useLocalSearchParams();

    useEffect(() => {
        const initialize = async () => {
            const id = await AsyncStorage.getItem("userId");
            if (id) setUserId(id);
        };
        initialize();
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        setLoading(true);
        try {
            const lessonsData = await fetchLessonsFromApi();
            setLessons(lessonsData);
        } catch (error: any) {
            console.error("Error fetching lessons:", error);
            if (error.message === "Authentication token not found") {
                Alert.alert("Session expired", "Please log in again.");
                router.push("/login");
                return;
            }
            Alert.alert("Error", `Problem with connection: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLesson = async (lesson: any) => {
        if (!receiverId) {
            Alert.alert("Error", "Receiver ID is missing");
            return;
        }

        try {
            const conversation = await sendMessageToTutor(receiverId.toString());
            router.push({
                pathname: "/messages/[conversationId]",
                params: {
                    conversationId: conversation.id,
                    receiverId: receiverId.toString(),
                    lessonId: lesson.id,
                },
            });
        } catch (error: any) {
            console.error("Error selecting lesson:", error);
            Alert.alert("Error", `Cannot start conversation: ${error.message}`);
        }
    };

    const containerContent = (
        <View style={styles.container}>
            <Text style={styles.header}>Choose a Lesson</Text>
            {loading ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.loadingText}>Loading lessons...</Text>
                </View>
            ) : lessons.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No lessons available</Text>
                </View>
            ) : (
                <FlatList
                    data={lessons}
                    refreshing={loading}
                    onRefresh={fetchLessons}
                    keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.lessonItem}
                            onPress={() => handleSelectLesson(item)}
                        >
                            <View style={styles.lessonContent}>
                                {item.tutor?.photoPath && (
                                    <Image
                                        source={{ uri: item.tutor.photoPath }}
                                        style={styles.avatar}
                                    />
                                )}
                                <View style={styles.lessonInfo}>
                                    <Text style={styles.lessonSubject}>{item.subject}</Text>
                                    <Text style={styles.lessonTutor}>
                                        Tutor: {item.tutor?.username || "Unknown"}
                                    </Text>
                                    <Text style={styles.lessonDescription}>
                                        {item.description}
                                    </Text>
                                    <Text style={styles.lessonDuration}>
                                        Duration: {item.durationTime} minutes
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
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
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#888",
        fontSize: 16,
    },
    emptyText: {
        color: "#888",
        fontSize: 16,
    },
    lessonItem: {
        backgroundColor: "#333",
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
    },
    lessonContent: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    avatar: {
        borderRadius: 25,
        width: 50,
        height: 50,
        marginRight: 15,
        borderWidth: 1,
        borderColor: "#4CAF50",
    },
    lessonInfo: {
        flex: 1,
    },
    lessonSubject: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    lessonTutor: {
        color: "#BB86FC",
        fontSize: 14,
        marginBottom: 5,
    },
    lessonDescription: {
        color: "#ccc",
        fontSize: 14,
        marginBottom: 5,
    },
    lessonDuration: {
        color: "#888",
        fontSize: 12,
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

export default ChooseLesson;
