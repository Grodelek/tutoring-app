import { BASE_URL } from "@/config/baseUrl";
import { authFetch } from "./httpClient";

export interface LoginResponse {
  token: string;
  userId: string;
  userType?: string;
  tutorProfileComplete?: boolean;
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

export interface AuthData {
  email: string;
  username?: string;
  password: string;
}

export type ExperienceTime = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type Availability = "WEEKDAYS_ONLY" | "WEEKENDS_ONLY" | "EVENING_ONLY" | "FLEXIBLE";
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
  experienceTime: string;
  availability: string;
  lessonType: string;
}

// ── Public endpoints (no token) ──

export const postLogin = async (data: AuthData): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email, password: data.password }),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
};

export const postRegister = async (data: AuthDataRegister): Promise<User> => {
  const response = await fetch(`${BASE_URL}/api/users/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: data.email,
      username: data.username,
      password: data.password,
      userType: data.userType,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
  return response.json();
};

export const reLogin = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error("Re-login failed");
  return response.json();
};

// ── Authenticated endpoints ──

export const getMyAccount = async (): Promise<UserResponseDTO> => {
  const response = await authFetch("/api/users/me");
  if (!response.ok) throw new Error("Failed to fetch account");
  return response.json();
};

export const getTutorMyAccount = async (): Promise<TutorResponse> => {
  const response = await authFetch("/api/users/tutor/me");
  if (!response.ok) throw new Error("Failed to fetch tutor account");
  return response.json();
};

export const saveToBackend = async (imageUrl: string): Promise<Response> => {
  return authFetch("/api/users/photo/upload", {
    method: "PUT",
    body: JSON.stringify(imageUrl),
  });
};

export const fetchUserById = async (id: string): Promise<User> => {
  const response = await authFetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
};

export const updateUser = async (
  id: string,
  data: { username: string; description: string },
  _token?: string,
): Promise<void> => {
  const response = await authFetch(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
};

export const addMoreInfo = async (data: TutorInfoRequest): Promise<TutorInfoResponse> => {
  const response = await authFetch("/api/users/tutor/info", {
    method: "PUT",
    body: JSON.stringify({
      experienceTime: data.experienceTime,
      availability: data.availability,
      lessonType: data.lessonType,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to save tutor info (${response.status})`);
  }
  return response.json();
};

export const deleteUser = async (id: string): Promise<void> => {
  const response = await authFetch(`/api/users/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Nie udało się usunąć konta");
};
