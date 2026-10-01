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
  eyebrowAccessory?: ReactNode;
  onBack?: () => void;
  compact?: boolean;
  tabHeader?: boolean;
}

export function Screen({
  children,
  eyebrow,
  title,
  subtitle,
  trailing,
  eyebrowAccessory,
  onBack,
  compact = false,
  tabHeader = false,
}: PropsWithChildren<ScreenProps>) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, compact && styles.compactContent, tabHeader && styles.tabContent]} showsVerticalScrollIndicator={false}>
        {onBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color={Colors.ink} />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        ) : null}
        <View style={[styles.header, tabHeader && (compact ? styles.compactTabHeader : styles.regularTabHeader)]}>
          <View style={[styles.heading, tabHeader && styles.tabHeading]}>
            {eyebrow ? (
              <View style={styles.eyebrowRow}>
                <Text style={[styles.eyebrow, tabHeader && styles.tabEyebrow]}>{eyebrow}</Text>
                {eyebrowAccessory}
              </View>
            ) : null}
            <Text style={[styles.title, tabHeader && styles.tabTitle]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, tabHeader && styles.tabSubtitle]}>{subtitle}</Text> : null}
          </View>
          {tabHeader && trailing ? <View style={styles.tabTrailing}>{trailing}</View> : trailing}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.cream },
  content: { width: "100%", maxWidth: MaxContentWidth, alignSelf: "center", paddingHorizontal: 22, paddingTop: 20, paddingBottom: 60, gap: 28 },
  compactContent: { paddingTop: 16, gap: 20 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  tabContent: { paddingTop: 15 },
  compactTabHeader: { marginBottom: -5 },
  regularTabHeader: { marginBottom: -13 },
  tabTrailing: { marginTop: 16 },
  backButton: { minHeight: 40, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 2 },
  backLabel: { color: Colors.ink, fontSize: 13, fontWeight: "600" },
  heading: { flex: 1, gap: 7 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  tabHeading: { gap: 0 },
  eyebrow: { color: Colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 1.1, textTransform: "uppercase" },
  tabEyebrow: { color: Colors.primary, fontSize: 10, lineHeight: 13, letterSpacing: 1.45, marginBottom: 4 },
  title: { color: Colors.ink, fontSize: 32, lineHeight: 38, fontWeight: "700", letterSpacing: -0.8 },
  tabTitle: { fontSize: 31, lineHeight: 36, letterSpacing: -0.9, marginBottom: 2 },
  subtitle: { maxWidth: 610, color: Colors.muted, fontSize: 14, lineHeight: 21 },
  tabSubtitle: { maxWidth: 520, color: "#526071", fontSize: 14, lineHeight: 19 },
});
