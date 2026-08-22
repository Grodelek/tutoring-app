// Use the computer's LAN address, not the Wi-Fi gateway, so physical devices
// running Expo Go can reach the Spring Boot server.
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8090";
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? `${BASE_URL}/ws`;
