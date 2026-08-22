import React from 'react';
import { Stack } from 'expo-router';

export default function AuthStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="messages/[conversationId]" />
      <Stack.Screen name="matchCelebration" />
      <Stack.Screen name="explorePreferences" />
      <Stack.Screen name="userSettings" />
      <Stack.Screen name="editProfile" />
      <Stack.Screen name="session/calendar" />
    </Stack>
  );
}
