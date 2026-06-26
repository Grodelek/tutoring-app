import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFetch } from "./httpClient";

export interface User {
  id: string;
  email: string;
  roles: string[];
  username: string;
  photoPath: string;
  description: string | null;
  points: number;
  confirmed: boolean;
}

export interface Lesson {
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

export const fetchLessonsFromApi = async (): Promise<Lesson[]> => {
  const response = await authFetch("/api/lessons/all-with-tutors");
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch lessons: ${response.status} - ${errorText}`);
  }
  return response.json();
};

export const fetchLesson = async (id: string): Promise<Lesson> => {
  const response = await authFetch(`/api/lessons/${id}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch lesson: ${response.status} - ${errorText}`);
  }
  return response.json();
};

export const fetchLessonByTutor = async (): Promise<Lesson[]> => {
  const response = await authFetch("/api/lessons/by-tutor");
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch lessons: ${response.status} - ${errorText}`);
  }
  return response.json();
};

export const fetchLessonsByTutorId = async (tutorId: string): Promise<Lesson[]> => {
  const response = await authFetch(`/api/lessons/by-tutor/${tutorId}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch lessons: ${response.status} - ${errorText}`);
  }
  return response.json();
};

export const sendMessageToTutor = async (tutorId: string) => {
  const currentUserId = await AsyncStorage.getItem("userId");
  if (!currentUserId) throw new Error("No user info");
  const response = await authFetch("/api/messages/get-or-create", {
    method: "POST",
    body: JSON.stringify({ user1Id: currentUserId, user2Id: tutorId }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
  return response.json();
};
