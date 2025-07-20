import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Ionicons } from "@expo/vector-icons";

export default function AuthenticatedTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.crop.circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="createPost"
        options={{
          title: "Add Post",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="myAccount"
        options={{
          title: "My Account",
          tabBarIcon: ({ color }) => <IconSymbol name="gear" color={color} />,
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: "Logout",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="arrow.right.circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messagesHistory"
        options={{
          title: "Conversations",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
