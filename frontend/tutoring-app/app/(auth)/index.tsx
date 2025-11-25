import { Redirect } from "expo-router";

export default function RedirectToDashboard() {
  return <Redirect href="/(auth)/dashboard" />;
}
