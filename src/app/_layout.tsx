import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Colors } from "@/constants/theme";
import { CourseProvider } from "@/contexts/CourseContext";
import { AccountProvider } from "@/contexts/AccountContext";
import { MascotProvider } from "@/contexts/MascotContext";
import { TopicProgressProvider } from "@/contexts/TopicProgressContext";

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
        <TopicProgressProvider>
          <MascotProvider>
            <ThemeProvider value={aceTheme}>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="onboarding" options={{ animation: "fade", gestureEnabled: false }} />
                <Stack.Screen name="account" options={{ presentation: "modal" }} />
                <Stack.Screen name="auth/callback" options={{ animation: "fade" }} />
              </Stack>
            </ThemeProvider>
          </MascotProvider>
        </TopicProgressProvider>
      </CourseProvider>
    </AccountProvider>
  );
}
