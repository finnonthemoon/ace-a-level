import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { Colors } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.line, height: 74, paddingTop: 7, paddingBottom: 9 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800" },
        tabBarItemStyle: { borderRadius: 16 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="learn" options={{ title: "Learn", tabBarIcon: ({ color, size }) => <Ionicons name="map" color={color} size={size} /> }} />
      <Tabs.Screen name="practice" options={{ title: "Practice", tabBarIcon: ({ color, size }) => <Ionicons name="document-text" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
