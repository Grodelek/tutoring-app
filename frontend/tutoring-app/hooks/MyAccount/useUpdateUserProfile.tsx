import React from "react";
import { Alert, GestureResponderEvent } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateUser, reLogin } from "@/api/userApi";

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

      await updateUser(user.id, { username, description }, token);
      Alert.alert("Success", "User profile updated.");

      const data = await reLogin(username, password);
      await AsyncStorage.setItem("jwtToken", data.token);
      setIsEditing(false);
      fetchUser();
    } catch (error: any) {
      Alert.alert("Error", `Could not update: ${error.message}`);
    }
  };

  return updateUserProfile;
};
export default useUpdateUserProfile;
