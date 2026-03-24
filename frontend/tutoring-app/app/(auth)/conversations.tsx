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
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/config/baseUrl";
import {fetchUserById, Lesson} from "@/api/userApi";

interface Conversation {
    id: string | number;
    user1Id: string;
    user2Id: string;
    user1Username?: string;
    user2Username?: string;
    lastMessageSnippet?: string;
    unreadCount?: number;
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
    
    useEffect(() => {
        const loadReceiver = async () => {
            try {
            const otherId =
                item.user1Id === userId ? item.user2Id : item.user1Id;

            const data = await fetchUserById(otherId);
            setReceiver(data);
            } catch (error) {
                console.error("Error loading receiver:", error);
            }
        };

        if (userId) {
        loadReceiver();
        }
    }, [item, userId]);

    const unreadCount = item.unreadCount ?? 0;
    const lastMessage = item.lastMessageSnippet ?? "Tap to continue your chat";

    const formatLastMessageTime = () => {
        if (!("lastMessageAt" in item) || !(item as any).lastMessageAt) return "";
        const raw = (item as any).lastMessageAt as string;
        if (!raw) return "";
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return "";

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return "just now";
        if (diffMinutes < 60) return `${diffMinutes} min ago`;
        if (diffHours < 24) return `${diffHours} h ago`;
        if (diffDays === 1) return "yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const lastMessageTimeLabel = formatLastMessageTime();

    return (
        <TouchableOpacity style={styles.conversationItem} onPress={onPress}>
            {receiver ? (
                <>
                    <View style={styles.conversationHeaderRow}>
                        <Image source={{ uri: receiver.photoPath }} style={styles.avatar} />
                        <View style={styles.conversationTextWrapper}>
                            <View style={styles.nameRow}>
                                <Text style={styles.conversationName}>{receiver.username}</Text>
                                {unreadCount > 0 && (
                                    <View style={styles.unreadBadge}>
                                        <Text style={styles.unreadBadgeText}>
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text
                                style={styles.conversationSub}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {lastMessage}
                            </Text>
                            {lastMessageTimeLabel ? (
                                <Text style={styles.conversationMeta}>
                                    Last message · {lastMessageTimeLabel}
                                </Text>
                            ) : null}
                        </View>
                    </View>
                </>
            ) : (
                <Text style={styles.loadingText}>Loading...</Text>
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
                const conversations = Array.isArray(data) ? data : [];
                setConversations(conversations);
            } else {
                const errorText = await response.text();
                console.error(`Failed to fetch conversations: ${response.status} - ${errorText}`);
                setConversations([]);
                if (response.status !== 404) {
                    Alert.alert("Error", `Cannot fetch conversations: ${errorText}`);
                }
            }
        } catch (error: any) {
            console.error("Error fetching conversations:", error);
            setConversations([]);
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
            <View style={styles.headerCard}>
                <Text style={styles.header}>Your conversations</Text>
                <Text style={styles.subHeader}>Jump back into chats with your tutors</Text>
            </View>
            <FlatList<Conversation>
                data={conversations}
                keyExtractor={(item) => String(item.id)}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={
                    conversations.length === 0 ? styles.emptyListContainer : undefined
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        You don't have any conversations yet.
                        {"\n"}Find a tutor and start your first chat!
                    </Text>
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
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
        backgroundColor: "#121212",
    },
    headerCard: {
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderRadius: 18,
        marginBottom: 16,
        backgroundColor: "#181020",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ECEDEE",
        marginBottom: 4,
    },
    subHeader: {
        fontSize: 14,
        color: "#9BA1A6",
    },
    conversationItem: {
        backgroundColor: "#1e1e1e",
        paddingVertical: 14,
        paddingHorizontal: 14,
        marginVertical: 8,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    conversationHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        borderWidth: 2,
        borderColor: "#c678dd",
    },
    conversationTextWrapper: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    conversationName: {
        color: "#ECEDEE",
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 2,
    },
    conversationSub: {
        color: "#9BA1A6",
        fontSize: 13,
        marginTop: 1,
    },
    conversationMeta: {
        color: "#555",
        fontSize: 11,
        marginTop: 2,
    },
    unreadBadge: {
        marginLeft: 8,
        backgroundColor: "#FF6B6B",
        borderRadius: 999,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    unreadBadgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
    },
    loadingText: {
        color: "#888",
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: "center",
    },
    emptyText: {
        color: "#888",
        marginTop: 32,
        textAlign: "center",
        fontSize: 14,
        lineHeight: 20,
    },
});

export default ConversationHistoryScreen;
