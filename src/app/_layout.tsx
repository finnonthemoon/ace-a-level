import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Colors } from "@/constants/theme";
import { CourseProvider } from "@/contexts/CourseContext";

const aceTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.cream,
    card: Colors.cream,
    text: Colors.ink,
    border: Colors.line,
    notification: Colors.primary,
  },
};

export default function RootLayout() {
  return (
    <CourseProvider>
      <ThemeProvider value={aceTheme}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: "fade", gestureEnabled: false }} />
        </Stack>
      </ThemeProvider>
    </CourseProvider>
  );
}
