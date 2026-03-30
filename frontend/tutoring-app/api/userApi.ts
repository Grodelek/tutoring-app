import { BASE_URL } from "../config/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export interface LoginResponse {
  token: string;
  userId: string;
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
  userType: string;
  confirmed: boolean;
}

export interface AuthDataRegister {
  email: string;
  username?: string;
  password: string;
  userType: string;
}

export interface AuthData{
    email: string;
    username?: string;
    password: string;
}

export type ExperienceTime =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

export type Availability =
  | "WEEKDAYS_ONLY"
  | "WEEKENDS_ONLY"
  | "EVENING_ONLY"
  | "FLEXIBLE";

export type LessonType = "PROFESSIONAL" | "CASUAL" | "FLEXIBLE";

export interface TutorInfoRequest {
  experienceTime: ExperienceTime;
  availability: Availability;
  lessonType: LessonType;
}

export interface TutorInfoResponse {
  experienceTime: ExperienceTime;
  availability: Availability;
  lessonType: LessonType;
}

interface UserResponseDTO {
    id: string;
    username: string;
    email: string;
    photoPath?: string;
    points: number;
    description?: string;
}

interface TutorResponse {
    username: string;
    experienceTime: string,
    availability: string,
    lessonType: string
}

export const postLogin = async (data: AuthData): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });
  if (!response.ok) {
    throw new Error("Login failed");
  }
  return response.json();
};

export const postRegister = async (data: AuthDataRegister): Promise<User> => {
  const response = await fetch(`${BASE_URL}/api/users/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      username: data.username,
      password: data.password,
      userType: data.userType
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const user: User = await response.json();
  return user;
};

export const getMyAccount = async (): Promise<UserResponseDTO> => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
        Alert.alert("Error", "Missing token – user not logged in.");
        throw new Error("Missing token");
    }
    console.log("token:", token);
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
    return response.json();
};


export const getTutorMyAccount = async (): Promise<TutorResponse> => {
        const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
        Alert.alert("Error", "Missing token – user not logged in.");
        throw new Error("Missing token");
    }
    const response = await fetch(`${BASE_URL}/api/users/tutor/me`, {
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

export const addMoreInfo = async (
  data: TutorInfoRequest,
): Promise<TutorInfoResponse> => {
  const token = await AsyncStorage.getItem("jwtToken");
  console.log("Token in addMoreInfo:", token);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api/users/tutor/info`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      experienceTime: data.experienceTime,
      availability: data.availability,
      lessonType: data.lessonType,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log("addMoreInfo error status:", response.status, "body:", errorText);
    throw new Error(errorText || `Failed to save tutor info (${response.status})`);
  }

  return response.json();
};
