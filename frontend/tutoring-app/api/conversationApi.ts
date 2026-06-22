import {BASE_URL} from "@/config/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {User} from "@/api/lessonApi";

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: string;
  conversationId?: string;
  messageType: string;
  lessonId: string;
}

export const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const token = await AsyncStorage.getItem("jwtToken");
  if (!token) throw new Error("Authentication token not found");
  const response = await fetch(`${BASE_URL}/api/messages/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  return response.json();
};

export const sendMessage = async (payload: {
  senderId: string;
  receiverId: string;
  content: string;
}): Promise<ChatMessage> => {
  const token = await AsyncStorage.getItem("jwtToken");
  if (!token) throw new Error("Authentication token not found");
  const response = await fetch(`${BASE_URL}/api/messages/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  const token = await AsyncStorage.getItem("jwtToken");
  if (!token) throw new Error("Authentication token not found");
  const response = await fetch(`${BASE_URL}/api/messages/${messageId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete message");
};

export interface Conversation {
    id: string;
    student: User;
    tutor: User;
    subject: string;
    startTime: string | null;
    durationMinutes: number;
    status: string | null;
    price: number | null;
    description: string;
    durationTime: number;
}

export const fetchConversationHistoryFromApi = async (id: string): Promise<Conversation> => {
    try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
            throw new Error("Authentication token not found");
        }

        const response = await fetch(`${BASE_URL}/api/conversation/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch conversation: ${response.status} - ${errorText}`);
            throw new Error(errorText || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error fetching conversation history:", error);
        throw error;
    }
}
