import { Redirect, type Href } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useAccount } from "@/contexts/AccountContext";

export default function AuthCallbackScreen() {
  const { authError, isLoading, isPasswordRecovery, isSignedIn } = useAccount();
  if (!isLoading && (isPasswordRecovery || isSignedIn || authError)) {
    return <Redirect href={"/account" as Href} />;
  }
  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.primary} size="large" />
      <Text style={styles.text}>Finishing secure sign-in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: Colors.cream },
  text: { color: Colors.muted, fontSize: 13 },
});
