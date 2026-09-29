import { Ionicons } from "@expo/vector-icons";
import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, MaxContentWidth } from "@/constants/theme";

interface ScreenProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onBack?: () => void;
}

export function Screen({
  children,
  eyebrow,
  title,
  subtitle,
  trailing,
  onBack,
}: PropsWithChildren<ScreenProps>) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {onBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color={Colors.ink} />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        ) : null}
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
  content: { width: "100%", maxWidth: MaxContentWidth, alignSelf: "center", paddingHorizontal: 22, paddingTop: 20, paddingBottom: 60, gap: 28 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  backButton: { minHeight: 40, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 2 },
  backLabel: { color: Colors.ink, fontSize: 13, fontWeight: "600" },
  heading: { flex: 1, gap: 7 },
  eyebrow: { color: Colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 1.1, textTransform: "uppercase" },
  title: { color: Colors.ink, fontSize: 32, lineHeight: 38, fontWeight: "700", letterSpacing: -0.8 },
  subtitle: { maxWidth: 610, color: Colors.muted, fontSize: 14, lineHeight: 21 },
});
