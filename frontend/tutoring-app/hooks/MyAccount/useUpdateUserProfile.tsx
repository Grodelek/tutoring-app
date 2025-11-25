import React from "react";
import { Alert, GestureResponderEvent } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/config/baseUrl";

type Props = {
  user: any;
  username: string;
  password: string;
  description: string;
  setIsEditing: (val: boolean) => void;
  fetchUser: () => Promise<void>;
};

const useUpdateUserProfile = ({
  user,
  username,
  password,
  description,
  setIsEditing,
  fetchUser,
}: Props) => {
  const updateUserProfile = async (
    _event?: GestureResponderEvent,
  ): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token || !user) return;

      const response = await fetch(
      `${BASE_URL}/api/users/${user.id}`,
      {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, description }),
        },
      );

      if (response.ok) {
        Alert.alert("Success", "User profile updated.");
        const loginResponse = await fetch(
          `${BASE_URL}/api/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          },
        );

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          await AsyncStorage.setItem("jwtToken", data.token);
          setIsEditing(false);
          fetchUser();
        }
      } else {
        const errorText = await response.text();
        Alert.alert("Error", `Could not update: ${errorText}`);
      }
    } catch (error: any) {
      Alert.alert("Error", `Connection issue: ${error.message}`);
    }
  };

  return updateUserProfile;
};
export default useUpdateUserProfile;
