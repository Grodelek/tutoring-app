import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AuthenticatedTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol name="person.crop.circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="createPost"
        options={{
          title: 'Add Post',
          tabBarIcon: ({ color }) => <IconSymbol name="rise" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol name="arrow" color={color} />,
        }}
      />
      <Tabs.Screen
        name="myAccount"
        options={{
          title: 'Moje konto',
          tabBarIcon: ({ color }) => <IconSymbol name="gear" color={color} />,
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Wyloguj',
          tabBarIcon: ({ color }) => <IconSymbol name="arrow.right.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
