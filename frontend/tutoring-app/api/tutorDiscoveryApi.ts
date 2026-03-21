import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/config/baseUrl";

export interface TutorSearchRequest {
  userId?: string | null;
  subject?: string | null;
  level?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
}

export interface TutorCard {
  tutorId: string;
  tutorUsername: string;
  tutorPhotoPath?: string | null;
  tutorDescription?: string | null;
  lessonId: string;
  subject: string;
  lessonDescription: string;
  durationTime: number;
  price: number | null;
  rating: number;
}

export const searchTutors = async (
  filters: TutorSearchRequest
): Promise<TutorCard[]> => {
  const token = await AsyncStorage.getItem("jwtToken");
  const userId = await AsyncStorage.getItem("userId");

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const payload: TutorSearchRequest = {
    ...filters,
    userId: filters.userId ?? userId,
  };

  const response = await fetch(`${BASE_URL}/api/tutors/discover/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to search tutors: ${response.status} - ${errorText}`
    );
  }

  return response.json();
};

