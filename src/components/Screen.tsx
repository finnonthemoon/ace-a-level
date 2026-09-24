import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, MaxContentWidth } from "@/constants/theme";

interface ScreenProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}

export function Screen({
  children,
  eyebrow,
  title,
  subtitle,
  trailing,
}: PropsWithChildren<ScreenProps>) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.heading}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
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
  content: { width: "100%", maxWidth: MaxContentWidth, alignSelf: "center", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 52, gap: 20 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  heading: { flex: 1, gap: 5 },
  eyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.7, textTransform: "uppercase" },
  title: { color: Colors.ink, fontSize: 31, lineHeight: 37, fontWeight: "900", letterSpacing: -0.7 },
  subtitle: { maxWidth: 610, color: Colors.muted, fontSize: 13, lineHeight: 20 },
});
