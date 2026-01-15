import {BASE_URL} from "@/config/baseUrl";
import {Alert} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useState} from "react";

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

export const fetchLessonsFromApi = async(): Promise<Lesson[]> => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
        throw new Error("Authentication token not found");
    }
    const response = await fetch(
        `${BASE_URL}/api/lessons/all-with-tutors`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to fetch lessons: ${response.status} - ${errorText}`
        )
    }
    return response.json();
};

export const fetchLesson = async(id: string): Promise<Lesson> => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
        throw new Error("Authentication token not found");
    }
    const response = await fetch(
        `${BASE_URL}/api/lessons/${id}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to fetch lesson: ${response.status} - ${errorText}`
        )
    }
    return response.json();
};

export const fetchLessonByTutor = async(): Promise<Lesson[]> => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
        throw new Error("Authentication token not found");
    }
    const response = await fetch(
        `${BASE_URL}/api/lessons/by-tutor`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to fetch lessons: ${response.status} - ${errorText}`
        )
    }
    return response.json();
};

export const sendMessageToTutor = async (tutorId: string) => {
    const token = await AsyncStorage.getItem("jwtToken");
    const currentUserId = await AsyncStorage.getItem("userId");
    if (!token || !currentUserId) {
        throw new Error("No user info");
    }
    const response = await fetch(
        `${BASE_URL}/api/messages/get-or-create`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                user1Id: currentUserId,
                user2Id: tutorId,
            }),
        }
    );
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }
    return response.json();
};