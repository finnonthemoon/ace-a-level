import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useAccount } from "@/contexts/AccountContext";
import { validateNewPassword } from "@/services/auth-validation";

type AuthMode = "create" | "sign-in";

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : "Authentication failed.";
}

export function EmailAuthPanel({ onComplete }: { onComplete: () => void }) {
  const {
    authError,
    isSupabaseConfigured,
    resendEmailConfirmation,
    sendPasswordReset,
    signInWithEmail,
    signUpWithEmail,
  } = useAccount();
  const [mode, setMode] = useState<AuthMode>("create");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (nextError) {
      setError(messageFrom(nextError));
    } finally {
      setBusy(false);
    }
  }

  function validate() {
    if (!email.trim() || !email.includes("@")) return "Enter a valid email address.";
    if (mode === "create") return validateNewPassword(password);
    if (!password) return "Enter your password.";
    return null;
  }

  function submit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    void run(async () => {
      if (mode === "create") {
        const result = await signUpWithEmail(email, password);
        if (result.requiresEmailConfirmation) {
          setConfirmationEmail(email.trim());
          return;
        }
      } else {
        await signInWithEmail(email, password);
      }
      onComplete();
    });
  }

  if (confirmationEmail) {
    return (
      <View style={styles.panel}>
        <View style={styles.messageIcon}>
          <Ionicons name="mail-outline" color={Colors.primary} size={26} />
        </View>
        <Text style={styles.title}>Check your inbox</Text>
        <Text style={styles.body}>
          We sent a confirmation link to {confirmationEmail}. Open it on this device to finish signing in.
        </Text>
        <Pressable
          disabled={busy}
          onPress={() => void run(() => resendEmailConfirmation(confirmationEmail))}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>{busy ? "Sending…" : "Resend email"}</Text>
        </Pressable>
        <Pressable onPress={() => setConfirmationEmail(null)}>
          <Text style={styles.linkText}>Use a different email</Text>
        </Pressable>
        {error ?? authError ? <Text style={styles.error}>{error ?? authError}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      {!isSupabaseConfigured ? (
        <View style={styles.setupNote}>
          <Ionicons name="construct-outline" color={Colors.primary} size={18} />
          <Text style={styles.setupText}>Add the Supabase values in .env.local to enable accounts.</Text>
        </View>
      ) : null}
      <View style={styles.modeSwitch}>
        {(["create", "sign-in"] as AuthMode[]).map((nextMode) => (
          <Pressable
            key={nextMode}
            onPress={() => {
              setMode(nextMode);
              setError(null);
            }}
            style={[styles.modeButton, mode === nextMode && styles.modeButtonActive]}
          >
            <Text style={[styles.modeText, mode === nextMode && styles.modeTextActive]}>
              {nextMode === "create" ? "Create account" : "Sign in"}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        editable={!busy}
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email address"
        placeholderTextColor="#8A94A6"
        style={styles.input}
        value={email}
      />
      <TextInput
        autoCapitalize="none"
        autoComplete={mode === "create" ? "new-password" : "current-password"}
        editable={!busy}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#8A94A6"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      {mode === "create" ? (
        <Text style={styles.hint}>At least 8 characters, including uppercase, lowercase and a number.</Text>
      ) : (
        <Pressable
          disabled={busy}
          onPress={() => {
            if (!email.trim() || !email.includes("@")) {
              setError("Enter your email address first.");
              return;
            }
            void run(async () => {
              await sendPasswordReset(email);
              Alert.alert(
                "Check your inbox",
                Platform.OS === "web"
                  ? "Open the secure reset link in this browser."
                  : "Open the secure reset link on a device with Ace A Level installed.",
              );
            });
          }}
        >
          <Text style={styles.linkText}>Forgot password?</Text>
        </Pressable>
      )}
      {error ?? authError ? <Text style={styles.error}>{error ?? authError}</Text> : null}
      <Pressable
        disabled={busy || !isSupabaseConfigured}
        onPress={submit}
        style={[styles.primaryButton, (!isSupabaseConfigured || busy) && styles.disabled]}
      >
        {busy ? <ActivityIndicator color="#FFFFFF" /> : null}
        <Text style={styles.primaryButtonText}>{mode === "create" ? "Create account" : "Sign in"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 13, padding: 18, borderRadius: 22, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  setupNote: { flexDirection: "row", alignItems: "center", gap: 9, padding: 12, borderRadius: 14, backgroundColor: Colors.primarySoft },
  setupText: { flex: 1, color: Colors.muted, fontSize: 12, lineHeight: 17 },
  modeSwitch: { flexDirection: "row", padding: 4, borderRadius: 14, backgroundColor: Colors.cream },
  modeButton: { flex: 1, alignItems: "center", padding: 10, borderRadius: 11 },
  modeButtonActive: { backgroundColor: Colors.surface },
  modeText: { color: Colors.muted, fontSize: 12, fontWeight: "800" },
  modeTextActive: { color: Colors.ink },
  input: { minHeight: 50, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.line, color: Colors.ink, backgroundColor: Colors.cream },
  hint: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
  primaryButton: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 15, backgroundColor: Colors.primary },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  secondaryButton: { alignItems: "center", padding: 13, borderRadius: 14, borderWidth: 1, borderColor: Colors.primary },
  secondaryButtonText: { color: Colors.primary, fontSize: 12, fontWeight: "900" },
  disabled: { opacity: 0.45 },
  error: { color: Colors.danger, fontSize: 12, lineHeight: 17 },
  linkText: { color: Colors.primaryDark, fontSize: 12, fontWeight: "800", textAlign: "center" },
  messageIcon: { width: 52, height: 52, alignSelf: "center", alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: Colors.primarySoft },
  title: { color: Colors.ink, fontSize: 20, fontWeight: "900", textAlign: "center" },
  body: { color: Colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center" },
});
