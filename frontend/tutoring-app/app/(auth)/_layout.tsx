import { Tabs, useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

export default function AuthenticatedTabsLayout() {
  const router = useRouter();
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="exploreTutors"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="magnifyingglass" color={color} />
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
          headerRight: () => (
            <Pressable
              style={{ marginRight: 16 }}
              onPress={() => router.push("/settings/userSettings")}
            >
              <IconSymbol name="gear" color="white" size={24} />
            </Pressable>
          ),
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
        name="conversations"
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
