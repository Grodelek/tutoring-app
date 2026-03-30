// frontend/tutoring-app/api/postApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { BASE_URL } from "@/config/baseUrl";
import { router } from "expo-router";

export interface CreateLessonPayload {
    subject: string;
    description: string;
    price: string | number;
    durationTime: string | number;
}

export const handleSubmitPost = async ({
                                           subject,
                                           description,
                                           price,
                                           durationTime,
                                       }: CreateLessonPayload) => {
    try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("jwtToken");

        if (!storedUserId) {
            Alert.alert("Error", "User ID not found in storage");
            return;
        }
        if (!token) {
            Alert.alert("Error", "Missing token – user not logged in.");
            return;
        }

        const response = await fetch(`${BASE_URL}/api/lessons/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
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
            Alert.alert("Error", `User registration failed: ${errorText}`);
        }
    } catch (error) {
        Alert.alert("Error", `Problem with connection: ${error}`);
    }
};
