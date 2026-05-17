import React from 'react';
import { Tabs } from 'expo-router';
import { QuestTabBar } from '@/components/ui/QuestTabBar';

export default function AuthenticatedTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <QuestTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* hidden — only used for programmatic navigation */}
      <Tabs.Screen name="index"             options={{ href: null }} />
      <Tabs.Screen name="logout"            options={{ href: null }} />
      <Tabs.Screen name="matchCelebration"  options={{ href: null }} />

      {/* visible tabs — icons/labels controlled by QuestTabBar */}
      <Tabs.Screen name="home" />
      <Tabs.Screen name="exploreTutors" />
      <Tabs.Screen name="conversations" />
      <Tabs.Screen name="myAccount" />
      <Tabs.Screen name="createPost" />
    </Tabs>
  );
}
