import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Colors } from "@/constants/theme";
import { CourseProvider } from "@/contexts/CourseContext";
import { AccountProvider } from "@/contexts/AccountContext";

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
    <AccountProvider>
      <CourseProvider>
        <ThemeProvider value={aceTheme}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ animation: "fade", gestureEnabled: false }} />
            <Stack.Screen name="account" options={{ presentation: "modal" }} />
            <Stack.Screen name="auth/callback" options={{ animation: "fade" }} />
          </Stack>
        </ThemeProvider>
      </CourseProvider>
    </AccountProvider>
  );
}
