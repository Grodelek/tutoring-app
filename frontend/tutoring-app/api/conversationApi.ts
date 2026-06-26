import { User } from "@/api/lessonApi";
import { authFetch } from "./httpClient";

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
  const response = await authFetch(`/api/messages/${conversationId}`);
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
  const response = await authFetch("/api/messages/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  const response = await authFetch(`/api/messages/${messageId}`, { method: "DELETE" });
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
  const response = await authFetch(`/api/conversation/${id}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  return response.json();
};
