import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { Colors, Fonts } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";

export default function TabLayout() {
  const { isHydrated, onboarding } = useCourse();
  if (!isHydrated) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.cream }}><ActivityIndicator accessibilityLabel="Loading your plan" color={Colors.primary} /></View>;
  if (!onboarding.completed) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF5A2F",
        tabBarInactiveTintColor: "#B1B1B7",
        tabBarStyle: { backgroundColor: "#050505", borderTopColor: "#242426", height: 76, paddingTop: 8, paddingBottom: 10 },
        tabBarLabelStyle: { fontSize: 11, fontFamily: Fonts.sansSemiBold },
        tabBarItemStyle: { borderRadius: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Learn", tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "book" : "book-outline"} color={color} size={size} /> }} />
      <Tabs.Screen name="learn" options={{ href: null }} />
      <Tabs.Screen name="practice" options={{ title: "Practice", tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "document-text" : "document-text-outline"} color={color} size={size} /> }} />
      <Tabs.Screen name="progress" options={{ title: "Progress", tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
