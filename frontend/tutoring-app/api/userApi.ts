import { BASE_URL } from "../config/baseUrl";

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
