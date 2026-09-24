import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { EmailAuthPanel } from "@/components/auth/EmailAuthPanel";
import { Screen } from "@/components/Screen";
import { Colors } from "@/constants/theme";
import { useAccount } from "@/contexts/AccountContext";
import { validateNewPassword } from "@/services/auth-validation";

export default function AccountScreen() {
  const router = useRouter();
  const { isPasswordRecovery, isSignedIn, session, updatePassword } = useAccount();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isPasswordRecovery) {
    async function savePassword() {
      const validationError = validateNewPassword(password);
      if (validationError) {
        setError(validationError);
        return;
      }
      setBusy(true);
      setError(null);
      try {
        await updatePassword(password);
        router.replace("/(tabs)/profile");
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Could not update password.");
      } finally {
        setBusy(false);
      }
    }
    return (
      <Screen eyebrow="ACCOUNT RECOVERY" title="Choose a new password">
        <View style={styles.card}>
          <TextInput
            autoComplete="new-password"
            onChangeText={setPassword}
            placeholder="New password"
            placeholderTextColor="#8A94A6"
            secureTextEntry
            style={styles.input}
            value={password}
          />
          <Text style={styles.help}>At least 8 characters, including uppercase, lowercase and a number.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable disabled={busy} onPress={() => void savePassword()} style={styles.button}>
            {busy ? <ActivityIndicator color="#FFFFFF" /> : null}
            <Text style={styles.buttonText}>Save new password</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  if (isSignedIn) {
    return (
      <Screen eyebrow="ACE ACCOUNT" title="You’re signed in">
        <View style={styles.card}>
          <Text style={styles.email}>{session?.user.email ?? "Your account"}</Text>
          <Text style={styles.help}>Your A-level study plan is now connected to the shared ACE account.</Text>
          <Pressable onPress={() => router.back()} style={styles.button}>
            <Text style={styles.buttonText}>Done</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen eyebrow="SYNC YOUR PLAN" title="Your ACE account">
      <Text style={styles.intro}>Sign in to keep this A-level plan available across your devices.</Text>
      <EmailAuthPanel onComplete={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: Colors.muted, fontSize: 14, lineHeight: 21 },
  card: { gap: 13, padding: 18, borderRadius: 22, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  input: { minHeight: 50, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.line, color: Colors.ink, backgroundColor: Colors.cream },
  help: { color: Colors.muted, fontSize: 12, lineHeight: 18 },
  error: { color: Colors.danger, fontSize: 12 },
  email: { color: Colors.ink, fontSize: 17, fontWeight: "900" },
  button: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 15, backgroundColor: Colors.primary },
  buttonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
});
