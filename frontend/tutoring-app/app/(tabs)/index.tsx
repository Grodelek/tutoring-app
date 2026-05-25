import { Redirect } from "expo-router";

export default function GuestIndexRedirect() {
  return <Redirect href="/(tabs)/explore" />;
}
