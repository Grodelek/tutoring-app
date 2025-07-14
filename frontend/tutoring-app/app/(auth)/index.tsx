import { useEffect } from "react";
import { router } from "expo-router";

export default function RedirectToDashboard() {
  useEffect(() => {
    router.replace("/(auth)/dashboard");
  }, []);

  return null;
}
