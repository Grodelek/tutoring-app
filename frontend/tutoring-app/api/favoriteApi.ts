import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFetch } from "./httpClient";

export interface FavoriteTutor {
  id: string;
  studentId: string;
  tutorId: string;
  tutorUsername: string;
  tutorPhotoPath?: string | null;
  tutorDescription?: string | null;
}

export const addFavoriteTutor = async (tutorId: string): Promise<FavoriteTutor> => {
  const studentId = await AsyncStorage.getItem("userId");
  if (!studentId) throw new Error("Authentication required");

  const response = await authFetch("/api/favorites/add", {
    method: "POST",
    body: JSON.stringify({ studentId, tutorId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add favorite tutor: ${response.status} - ${errorText}`);
  }
  return response.json();
};

export const getFavoriteTutors = async (): Promise<FavoriteTutor[]> => {
  const studentId = await AsyncStorage.getItem("userId");
  if (!studentId) return [];
  try {
    const response = await authFetch(`/api/favorites/student/${studentId}`);
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
};
