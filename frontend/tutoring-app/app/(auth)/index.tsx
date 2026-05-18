import React from "react";
import { Redirect } from "expo-router";

export default function RedirectToAuth() {
  return <Redirect href="/(auth)/home" />;
}
