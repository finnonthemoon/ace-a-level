import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";

export default function TabLayout() {
  const { isHydrated, onboarding } = useCourse();
  if (!isHydrated) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.cream }}><ActivityIndicator accessibilityLabel="Loading your plan" color={Colors.primary} /></View>;
  if (!onboarding.completed) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.line, height: 76, paddingTop: 8, paddingBottom: 10 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarItemStyle: { borderRadius: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size} /> }} />
      <Tabs.Screen name="learn" options={{ title: "Learn", tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "book" : "book-outline"} color={color} size={size} /> }} />
      <Tabs.Screen name="practice" options={{ title: "Practice", tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "document-text" : "document-text-outline"} color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "person" : "person-outline"} color={color} size={size} /> }} />
    </Tabs>
  );
}
