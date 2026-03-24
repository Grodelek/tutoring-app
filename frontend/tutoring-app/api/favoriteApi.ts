import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/config/baseUrl";

export interface FavoriteTutor {
  id: string;
  studentId: string;
  tutorId: string;
  tutorUsername: string;
  tutorPhotoPath?: string | null;
  tutorDescription?: string | null;
}

export const addFavoriteTutor = async (
  tutorId: string
): Promise<FavoriteTutor> => {
  const token = await AsyncStorage.getItem("jwtToken");
  const studentId = await AsyncStorage.getItem("userId");

  if (!token || !studentId) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${BASE_URL}/api/favorites/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studentId, tutorId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to add favorite tutor: ${response.status} - ${errorText}`
    );
  }

  return response.json();
};

