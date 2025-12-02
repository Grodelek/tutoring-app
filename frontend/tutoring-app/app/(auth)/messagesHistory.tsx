import React, { useState, useCallback, useEffect } from "react";
import {
    View,
    FlatList,
    Text,
    Alert,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "@/config/baseUrl";
import {fetchUserById, Lesson} from "@/api/userApi";

interface Conversation {
    id: string | number;
    user1Id: string;
    user2Id: string;
    user1Username?: string;
    user2Username?: string;
}
interface User {
    id: string;
    email: string;
    password: string;
    roles: string;
    username: string;
    photoPath: string;
    description: string;
    lessons: Lesson[];
    confirmed: boolean;
}
interface ConversationRowProps {
    item: Conversation;
    userId: string | null;
    onPress: () => void;
}
const ConversationRow: React.FC<ConversationRowProps> = ({ item, userId, onPress }) => {
    const [receiver, setReceiver] = useState<User | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    useEffect(() => {
        const loadReceiver = async () => {
            const otherId =
                item.user1Id === userId ? item.user2Id : item.user1Id;

            const data = await fetchUserById(otherId);
            setReceiver(data);
        };

        loadReceiver();
    }, [item, userId]);

    return (
        <TouchableOpacity style={styles.conversationItem} onPress={onPress}>
            {receiver ? (
                <>
                    <Image source={{ uri: receiver.photoPath }} style={styles.avatar} />
                    <Text style={styles.conversationId}>{receiver.username}</Text>
                </>
            ) : (
                <Text style={{ color: "#888" }}>Loading...</Text>
            )}
        </TouchableOpacity>
    );
};


const ConversationHistoryScreen: React.FC = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchConversationHistory = async (uid: string, token: string) => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/conversation/${uid}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                const filtered = Array.isArray(data)
                    ? data.filter(
                        (conv) => conv.user1Id === uid || conv.user2Id === uid
                    )
                    : [];

                setConversations(filtered);
            }
        } catch (error: any) {
            Alert.alert("Error", `Problem with connection: ${error.message}`);
        }
    };

    const loadAndFetch = useCallback(async () => {
        try {
            const [uid, token] = await Promise.all([
                AsyncStorage.getItem("userId"),
                AsyncStorage.getItem("jwtToken"),
            ]);

            if (uid && token) {
                setUserId(uid);
                await fetchConversationHistory(uid, token);
            }
        } catch (error: any) {
            Alert.alert("Error", `Problem loading user data: ${error.message}`);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadAndFetch();
        }, [loadAndFetch])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        if (userId) {
            const token = await AsyncStorage.getItem("jwtToken");
            if (token) {
                await fetchConversationHistory(userId, token);
            }
        }
        setRefreshing(false);
    };

    const handlePressConversation = (item: any) => {
        if (!userId) return;
        const conversationId = String(item.id);
        const receiverId =
            String(item.user1Id) === String(userId)
                ? String(item.user2Id)
                : String(item.user1Id);

        router.push({
            pathname: "/messages/[conversationId]",
            params: {
                conversationId,
                receiverId,
            },
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Conversation History</Text>
            <FlatList<Conversation>
                data={conversations}
                keyExtractor={(item) => String(item.id)}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Empty conversation history</Text>
                }
                renderItem={({ item }) => (
                    <ConversationRow
                        item={item}
                        userId={userId}
                        onPress={() => handlePressConversation(item)}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#121212" },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#fff" },

    conversationItem: {
        backgroundColor: "#222",
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
    },

    avatar: {
        width: 45,
        height: 45,
        borderRadius: 45,
        marginBottom: 15,
        alignSelf: "flex-start",
        borderWidth: 2,
        borderColor: "#c678dd",
    },

    conversationId: { color: "#BB86FC", fontWeight: "900", marginBottom: 5 },
    emptyText: { color: "#888", marginTop: 50, textAlign: "center" },
});

export default ConversationHistoryScreen;
