import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/config/baseUrl";
import { triggerUnauthorized } from "./authEvents";

export const authFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await AsyncStorage.getItem("jwtToken");
  if (!token) {
    triggerUnauthorized();
    throw new Error("Authentication token not found");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (response.status === 401) {
    triggerUnauthorized();
    throw new Error("Sesja wygasła. Zaloguj się ponownie.");
  }

  return response;
};
