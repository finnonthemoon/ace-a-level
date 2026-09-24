import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Screen } from "@/components/Screen";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";
import { Colors, Shadow } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const { activeSubjectId, examYear, isHydrated, selections, setActiveSubject } = useCourse();
  const subject = findSubject(activeSubjectId);

  useEffect(() => {
    if (isHydrated && selections.length === 0) router.replace("/onboarding");
  }, [isHydrated, router, selections.length]);

  if (!isHydrated || !subject) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingText}>Building your A-level plan…</Text>
      </View>
    );
  }

  return (
    <Screen
      eyebrow="ACE A LEVEL"
      title={`${greeting()} — ready to study?`}
      subtitle={`${selections.length} subjects${examYear ? ` · Exams in ${examYear}` : ""}`}
      trailing={
        <Pressable onPress={() => router.push("/(tabs)/profile")} style={styles.avatar}>
          <Ionicons name="person" color="#FFFFFF" size={20} />
        </Pressable>
      }
    >
      <SubjectSwitcher />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/(tabs)/learn")}
        style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
      >
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Ionicons name={subject.icon} color="#FFFFFF" size={27} />
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>YOUR NEXT STEP</Text>
          </View>
        </View>
        <Text style={styles.heroEyebrow}>{subject.title.toUpperCase()}</Text>
        <Text style={styles.heroTitle}>{subject.topics[0].title}</Text>
        <Text style={styles.heroBody}>
          Start with the first topic in your {subject.shortTitle} course map and build momentum from there.
        </Text>
        <View style={styles.heroAction}>
          <Text style={styles.heroActionText}>Open course map</Text>
          <Ionicons name="arrow-forward" color={Colors.primaryDeep} size={18} />
        </View>
      </Pressable>

      <View style={styles.metrics}>
        <Metric icon="flame-outline" value="0" label="day streak" />
        <Metric icon="checkmark-circle-outline" value="0" label="lessons" />
        <Metric icon="time-outline" value="0m" label="this week" />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>YOUR COURSES</Text>
          <Text style={styles.sectionTitle}>Keep every subject moving</Text>
        </View>
        <Pressable onPress={() => router.push("/onboarding")}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.courseList}>
        {selections.map((selection, index) => {
          const item = findSubject(selection.subjectId);
          if (!item) return null;
          const active = item.id === activeSubjectId;
          return (
            <Pressable
              accessibilityRole="button"
              key={item.id}
              onPress={() => void setActiveSubject(item.id)}
              style={({ pressed }) => [
                styles.courseCard,
                active && styles.courseCardActive,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.courseIcon, { backgroundColor: item.softColor }]}>
                <Ionicons name={item.icon} color={item.color} size={22} />
              </View>
              <View style={styles.courseCopy}>
                <View style={styles.courseTitleRow}>
                  <Text style={styles.courseTitle}>{item.title}</Text>
                  {active ? <Text style={styles.activeBadge}>ACTIVE</Text> : null}
                </View>
                <Text style={styles.courseMeta}>
                  {selection.specificationId ?? "Exam board not set"} · {item.topics.length} topic areas
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: index === 0 ? "8%" : "0%", backgroundColor: item.color }]} />
                </View>
              </View>
              <Ionicons name="chevron-forward" color={active ? Colors.primary : Colors.muted} size={18} />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => router.push("/(tabs)/practice")}
        style={({ pressed }) => [styles.practiceCard, pressed && styles.pressed]}
      >
        <View style={styles.practiceIcon}>
          <Ionicons name="sparkles" color={Colors.primary} size={23} />
        </View>
        <View style={styles.practiceCopy}>
          <Text style={styles.practiceEyebrow}>SMART PRACTICE</Text>
          <Text style={styles.practiceTitle}>Find the gaps across your subjects</Text>
          <Text style={styles.practiceBody}>Diagnostics and focused question sets will live here as each course launches.</Text>
        </View>
        <Ionicons name="arrow-forward" color={Colors.primary} size={20} />
      </Pressable>
    </Screen>
  );
}

function Metric({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricIcon}><Ionicons name={icon} color={Colors.primary} size={18} /></View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, gap: 12, backgroundColor: Colors.cream, alignItems: "center", justifyContent: "center" },
  loadingText: { color: Colors.muted, fontSize: 13, fontWeight: "700" },
  avatar: { width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary, ...Shadow.blue },
  hero: { minHeight: 310, overflow: "hidden", padding: 22, borderRadius: 30, backgroundColor: Colors.primary, ...Shadow.blue },
  heroGlowOne: { position: "absolute", width: 210, height: 210, borderRadius: 105, right: -70, top: -70, backgroundColor: "rgba(255,255,255,0.13)" },
  heroGlowTwo: { position: "absolute", width: 150, height: 150, borderRadius: 75, right: 25, bottom: -85, backgroundColor: "rgba(10,43,112,0.22)" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 38 },
  heroIcon: { width: 53, height: 53, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)" },
  heroPill: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.15)" },
  heroPillText: { color: "rgba(255,255,255,0.86)", fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  heroEyebrow: { color: "rgba(255,255,255,0.72)", fontSize: 9, fontWeight: "900", letterSpacing: 1.4 },
  heroTitle: { color: "#FFFFFF", fontSize: 28, lineHeight: 33, fontWeight: "900", marginTop: 7, letterSpacing: -0.5 },
  heroBody: { color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 540 },
  heroAction: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 20, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 14, backgroundColor: "#FFFFFF" },
  heroActionText: { color: Colors.primaryDeep, fontSize: 12, fontWeight: "900" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.995 }] },
  metrics: { flexDirection: "row", gap: 10 },
  metric: { flex: 1, minHeight: 110, padding: 13, borderRadius: 21, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface, ...Shadow.card },
  metricIcon: { width: 31, height: 31, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primarySoft },
  metricValue: { color: Colors.ink, fontSize: 20, fontWeight: "900", marginTop: 9 },
  metricLabel: { color: Colors.muted, fontSize: 9, fontWeight: "700", marginTop: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  sectionEyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.3 },
  sectionTitle: { color: Colors.ink, fontSize: 21, fontWeight: "900", marginTop: 4, letterSpacing: -0.3 },
  editText: { color: Colors.primary, fontSize: 12, fontWeight: "900" },
  courseList: { gap: 10 },
  courseCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15, borderRadius: 21, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  courseCardActive: { borderColor: "#A9C4FF", backgroundColor: "#FBFCFF", ...Shadow.card },
  courseIcon: { width: 45, height: 45, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  courseCopy: { flex: 1, gap: 5 },
  courseTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  courseTitle: { color: Colors.ink, fontSize: 14, fontWeight: "900" },
  activeBadge: { color: Colors.primary, fontSize: 7, fontWeight: "900", letterSpacing: 0.8, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7, backgroundColor: Colors.primarySoft },
  courseMeta: { color: Colors.muted, fontSize: 10 },
  progressTrack: { height: 4, overflow: "hidden", borderRadius: 2, backgroundColor: Colors.line, marginTop: 2 },
  progressFill: { height: "100%", borderRadius: 2 },
  practiceCard: { flexDirection: "row", alignItems: "center", gap: 13, padding: 18, borderRadius: 23, borderWidth: 1, borderColor: "#C8D8FF", backgroundColor: Colors.primarySoft },
  practiceIcon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surface },
  practiceCopy: { flex: 1, gap: 3 },
  practiceEyebrow: { color: Colors.primary, fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  practiceTitle: { color: Colors.ink, fontSize: 15, fontWeight: "900" },
  practiceBody: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
});
