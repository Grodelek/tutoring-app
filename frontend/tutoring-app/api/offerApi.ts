import {BASE_URL} from "@/config/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OfferRequest{
    tutorId: string,
    studentId: string,
    lessonId: string
}

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

export interface Offer {
    id: string;
    tutor: User;
    student: User;
    lesson: Lesson;
    sessionStartTime: string | null;
    accepted: boolean;
}

export const sendOffer = async (data: OfferRequest): Promise<Offer> => {
    const token = await AsyncStorage.getItem("jwtToken");
    if(!token){
        throw new Error("Authentication token not found");
    }
    const response = await fetch(`${BASE_URL}/api/offer/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }

    return await response.json();
};