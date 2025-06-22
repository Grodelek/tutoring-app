
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function GuestTabsLayout() {
  return (
    <Tabs>
  <Tabs.Screen
    name="index"
    options={{ title: 'Home'}}
  />
  <Tabs.Screen
    name="explore"
    options={{ title: 'Explore'}}
  />
      <Tabs.Screen
        name="login"
        options={{
          title: 'Logowanie',
          tabBarIcon: ({ color }) => <IconSymbol name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: 'Rejestracja',
          tabBarIcon: ({ color }) => <IconSymbol name="person.badge.plus.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

