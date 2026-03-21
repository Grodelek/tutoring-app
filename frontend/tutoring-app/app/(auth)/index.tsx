import { Redirect } from "expo-router";

export default function RedirectToExplore() {
  return <Redirect href="/(auth)/exploreTutors" />;
}
