import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "react-native";
import { C } from "@/constants/theme";

export default function AuthIndex() {
  const [userType, setUserType] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("userType").then(t => {
      setUserType(t);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  if (userType === "TUTOR") {
    return <Redirect href="/(auth)/(tabs)/tutorDashboard" />;
  }
  return <Redirect href="/(auth)/(tabs)/exploreTutors" />;
}
