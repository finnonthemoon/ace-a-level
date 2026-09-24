import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";

export function Screen({
  children,
  eyebrow,
  title,
  trailing,
}: PropsWithChildren<{ eyebrow?: string; title: string; trailing?: ReactNode }>) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.heading}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title}>{title}</Text>
          </View>
          {trailing}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.cream },
  content: { width: "100%", maxWidth: 820, alignSelf: "center", padding: 20, paddingBottom: 48, gap: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  heading: { flex: 1, gap: 4 },
  eyebrow: { color: Colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: Colors.ink, fontSize: 32, lineHeight: 38, fontWeight: "900" },
});
