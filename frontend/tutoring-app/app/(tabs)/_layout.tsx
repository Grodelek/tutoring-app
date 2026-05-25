import { Tabs } from 'expo-router';
import { QuestTabBar, TabDef } from '@/components/ui/QuestTabBar';
import { C } from '@/constants/theme';

const GUEST_TABS: TabDef[] = [
  { route: 'explore',  label: 'EXPLORE',  icon: 'compass',      color: C.teal   },
  { route: 'login',    label: 'LOGIN',    icon: 'login',        color: C.amber  },
  { route: 'register', label: 'REGISTER', icon: 'account-plus', color: C.purple },
];

export default function GuestTabsLayout() {
  return (
    <Tabs
      initialRouteName="explore"
      tabBar={(props) => <QuestTabBar {...props} staticTabs={GUEST_TABS} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="explore"  />
      <Tabs.Screen name="login"    />
      <Tabs.Screen name="register" />
    </Tabs>
  );
}
