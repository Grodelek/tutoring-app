import { BASE_URL } from "../config/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Alert} from "react-native";
import uuid from "expo-modules-core/src/uuid";

export interface LoginResponse {
  token: string;
  userId: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
}

export interface Lesson {
  id: string;
  subject: string;
  description: string;
  durationTime: number;
  tutor: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  roles: string;
  username: string;
  photoPath: string;
  description: string;
  lessons: Lesson[];
  confirmed: boolean;
}

export interface AuthData {
  email: string;
  username: string;
  password: string;
}

export const postLogin = async (data: AuthData): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      username: data.username,
      password: data.password,
    }),
  });
  if (!response.ok) {
    throw new Error("Login failed");
  }
  return response.json();
};

export const postRegister = async (data: AuthData): Promise<User> => {
  const response = await fetch(`${BASE_URL}/api/users/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      username: data.username,
      password: data.password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const user: User = await response.json();
  return user;
};

export const getMyAccount = async (): Promise<Response> => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
        Alert.alert("Error", "Missing token – user not logged in.");
        throw new Error("Missing token");
    }
    const response = await fetch(`${BASE_URL}/api/users/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Login failed");
    }
    return response;
};

export const saveToBackend = async (imageUrl: string) => {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
            throw new Error("Missing token");
        }
        return fetch(`${BASE_URL}/api/users/photo/upload`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(imageUrl),
        });
};

export const fetchUserById = async (id: any) => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
        Alert.alert("Error", "Missing token – user not logged in.");
        throw new Error("Missing token");
    }
    const response = await fetch(`${BASE_URL}/api/users/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Login failed");
    }
    return response.json();
};

