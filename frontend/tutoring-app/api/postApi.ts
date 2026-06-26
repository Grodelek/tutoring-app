import { Alert } from "react-native";
import { router } from "expo-router";
import { authFetch } from "./httpClient";

export interface CreateLessonPayload {
  subject: string;
  description: string;
  price: string | number;
  durationTime: string | number;
}

export const handleSubmitPost = async ({
  subject, description, price, durationTime,
}: CreateLessonPayload) => {
  try {
    const response = await authFetch("/api/lessons/add", {
      method: "POST",
      body: JSON.stringify({
        subject,
        description,
        price,
        durationTime: typeof durationTime === "string"
          ? parseInt(durationTime, 10)
          : durationTime,
      }),
    });

    if (response.ok) {
      Alert.alert("Success", "Lesson added!");
      router.push("/exploreTutors");
    } else {
      const errorText = await response.text();
      Alert.alert("Error", `Lesson creation failed: ${errorText}`);
    }
  } catch (error: any) {
    Alert.alert("Error", error?.message || "Problem with connection");
  }
};
