import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Colors } from "@/constants/theme";
import { CourseProvider } from "@/contexts/CourseContext";
import { AccountProvider } from "@/contexts/AccountContext";
import { MascotProvider } from "@/contexts/MascotContext";
import { StudyActivityProvider } from "@/contexts/StudyActivityContext";
import { TopicProgressProvider } from "@/contexts/TopicProgressContext";
import { SubjectTransitionProvider } from "@/contexts/SubjectTransitionContext";

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
  const [fontsLoaded, fontError] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <AccountProvider>
      <CourseProvider>
        <TopicProgressProvider>
          <StudyActivityProvider>
            <MascotProvider>
              <SubjectTransitionProvider>
                <ThemeProvider value={aceTheme}>
                  <StatusBar style="dark" />
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen
                      name="onboarding"
                      options={{ animation: "fade", gestureEnabled: false }}
                    />
                    <Stack.Screen
                      name="account"
                      options={{ presentation: "modal" }}
                    />
                    <Stack.Screen
                      name="auth/callback"
                      options={{ animation: "fade" }}
                    />
                  </Stack>
                </ThemeProvider>
              </SubjectTransitionProvider>
            </MascotProvider>
          </StudyActivityProvider>
        </TopicProgressProvider>
      </CourseProvider>
    </AccountProvider>
  );
}
