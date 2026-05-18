import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { QuestTabBar } from '@/components/ui/QuestTabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from '@/constants/theme';

type Status = "checking" | "ok" | "needs-onboarding";

export default function AuthenticatedTabsLayout() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    (async () => {
      const userType = await AsyncStorage.getItem("userType");
      const completed = await AsyncStorage.getItem("hasCompletedTutorProfile");
      if (userType === "TUTOR" && completed !== "true") {
        setStatus("needs-onboarding");
      } else {
        setStatus("ok");
      }
    })();
  }, []);

  if (status === "checking") {
    return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  }

  if (status === "needs-onboarding") {
    return <Redirect href="/registerForm/moreInfoAboutTutor" />;
  }

  return (
    <Tabs
      tabBar={(props) => <QuestTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"             options={{ href: null }} />
      <Tabs.Screen name="logout"            options={{ href: null }} />
      <Tabs.Screen name="matchCelebration"  options={{ href: null }} />

      <Tabs.Screen name="home" />
      <Tabs.Screen name="exploreTutors" />
      <Tabs.Screen name="myAccount" />
      <Tabs.Screen name="conversations" />
      <Tabs.Screen name="createPost" />
    </Tabs>
  );
}
