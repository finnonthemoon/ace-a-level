import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

export default function HomeScreen() {
  const router = useRouter();
  const { activeSubjectId, isHydrated, selections } = useCourse();
  const subject = findSubject(activeSubjectId);

  useEffect(() => {
    if (isHydrated && selections.length === 0) router.replace("/onboarding");
  }, [isHydrated, router, selections.length]);

  if (!isHydrated || !subject) {
    return <View style={styles.loading}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  return (
    <Screen eyebrow="ACE A LEVEL" title={`Good afternoon — ready for ${subject.shortTitle}?`}>
      <SubjectSwitcher />

      <View style={[styles.hero, { backgroundColor: subject.color }]}>
        <View style={styles.heroIcon}><Ionicons name={subject.icon} color="#FFFFFF" size={30} /></View>
        <Text style={styles.heroEyebrow}>CONTINUE LEARNING</Text>
        <Text style={styles.heroTitle}>{subject.topics[0].title}</Text>
        <Text style={styles.heroBody}>Your first structured lesson will appear here when the content pack is added.</Text>
        <TouchableOpacity disabled style={styles.heroButton}>
          <Text style={styles.heroButtonText}>Course foundation ready</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metrics}>
        <Metric icon="flame-outline" value="0" label="day streak" />
        <Metric icon="checkmark-circle-outline" value="0" label="lessons" />
        <Metric icon="time-outline" value="0m" label="this week" />
      </View>

      <View style={styles.card}>
        <View style={styles.cardIcon}><Ionicons name="sparkles-outline" color={Colors.primary} size={22} /></View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>Your personalised plan starts here</Text>
          <Text style={styles.cardBody}>Lessons, practice and recommendations will all follow the active subject selected above.</Text>
        </View>
      </View>
    </Screen>
  );
}

function Metric({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; value: string }) {
  return <View style={styles.metric}><Ionicons name={icon} color={Colors.primary} size={20} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.cream, alignItems: "center", justifyContent: "center" },
  hero: { borderRadius: 28, padding: 22, minHeight: 260, shadowColor: Colors.shadow, shadowOpacity: 0.15, shadowRadius: 18, shadowOffset: { width: 0, height: 9 } },
  heroIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  heroEyebrow: { color: "rgba(255,255,255,0.72)", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  heroTitle: { color: "#FFFFFF", fontSize: 27, fontWeight: "900", marginTop: 6 },
  heroBody: { color: "rgba(255,255,255,0.86)", fontSize: 14, lineHeight: 20, marginTop: 8, maxWidth: 520 },
  heroButton: { marginTop: 20, alignSelf: "flex-start", backgroundColor: "#FFFFFF", paddingHorizontal: 15, paddingVertical: 11, borderRadius: 14 },
  heroButtonText: { color: Colors.ink, fontWeight: "900", fontSize: 12 },
  metrics: { flexDirection: "row", gap: 10 },
  metric: { flex: 1, minHeight: 100, borderRadius: 20, padding: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  metricValue: { color: Colors.ink, fontSize: 21, fontWeight: "900", marginTop: 8 },
  metricLabel: { color: Colors.muted, fontSize: 10, marginTop: 2 },
  card: { flexDirection: "row", gap: 13, alignItems: "flex-start", backgroundColor: Colors.surface, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: Colors.line },
  cardIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFF0D8", alignItems: "center", justifyContent: "center" },
  cardCopy: { flex: 1, gap: 5 },
  cardTitle: { color: Colors.ink, fontSize: 16, fontWeight: "900" },
  cardBody: { color: Colors.muted, fontSize: 13, lineHeight: 19 },
});
