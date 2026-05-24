import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { QuestTabBar } from '@/components/ui/QuestTabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from '@/constants/theme';

type Status = "checking" | "ok" | "needs-onboarding";

export default function AuthenticatedTabsLayout() {
  const [status, setStatus] = useState<Status>("checking");
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const userType = await AsyncStorage.getItem("userType");
      const completed = await AsyncStorage.getItem("hasCompletedTutorProfile");
      setUserType(userType);
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
    return <Redirect href={"/AfterLoginPopUp/moreInfoAboutTutor" as any} />;
  }

  const isStudent = userType === "STUDENT";

  return (
    <Tabs
      tabBar={(props) => <QuestTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"             options={{ href: null }} />
      <Tabs.Screen name="logout"            options={{ href: null }} />
      <Tabs.Screen name="matchCelebration"  options={{ href: null }} />

      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen
        name="tutorDashboard"
        options={{ href: isStudent ? null : undefined }}
      />
      <Tabs.Screen
        name="exploreTutors"
        options={{ href: isStudent ? undefined : null }}
      />
      <Tabs.Screen name="explorePreferences" options={{ href: null }} />
      <Tabs.Screen name="myAccount" />
      <Tabs.Screen name="userSettings" options={{ href: null }} />
      <Tabs.Screen name="conversations" />
      <Tabs.Screen name="messages/[conversationId]" options={{ href: null }} />
      <Tabs.Screen name="createPost" />
    </Tabs>
  );
}
