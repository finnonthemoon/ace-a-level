import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";
import { Colors, Shadow } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

const MODES = [
  { icon: "pulse-outline" as const, eyebrow: "FIND YOUR STARTING POINT", title: "Subject diagnostic", body: "A short mixed check across the active subject." },
  { icon: "options-outline" as const, eyebrow: "FOCUS YOUR REVISION", title: "Topic practice", body: "Build a set from one or more course topics." },
  { icon: "timer-outline" as const, eyebrow: "PRACTISE EXAM CONDITIONS", title: "Timed assessment", body: "Use the format and timing for your specification." },
];

export default function PracticeScreen() {
  const { activeSubjectId, selections } = useCourse();
  const subject = findSubject(activeSubjectId);

  return (
    <Screen
      eyebrow="QUESTION PRACTICE"
      title={subject ? `${subject.shortTitle} practice` : "Practice"}
      subtitle="Choose one subject at a time for focused practice, while your dashboard keeps sight of the whole A-level plan."
    >
      <SubjectSwitcher />

      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.heroIcon}><Ionicons name="analytics-outline" color="#FFFFFF" size={26} /></View>
        <Text style={styles.heroEyebrow}>PERSONALISED REVIEW</Text>
        <Text style={styles.heroTitle}>Turn weak areas into your next session</Text>
        <Text style={styles.heroBody}>Practice results will feed a clear revision queue across all {selections.length} of your subjects.</Text>
        <View style={styles.heroStatus}><Text style={styles.heroStatusText}>ASSESSMENT ENGINE COMING NEXT</Text></View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>CHOOSE A FORMAT</Text>
          <Text style={styles.sectionTitle}>Practice modes</Text>
        </View>
      </View>

      <View style={styles.modeList}>
        {MODES.map((mode, index) => (
          <Pressable
            accessibilityRole="button"
            disabled
            key={mode.title}
            style={styles.card}
          >
            <View style={[styles.icon, index === 0 && styles.featuredIcon]}>
              <Ionicons name={mode.icon} color={index === 0 ? "#FFFFFF" : subject?.color ?? Colors.primary} size={23} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.cardEyebrow}>{mode.eyebrow}</Text>
              <Text style={styles.title}>{mode.title}</Text>
              <Text style={styles.body}>{mode.body}</Text>
            </View>
            <View style={styles.badge}><Text style={styles.badgeText}>SOON</Text></View>
          </Pressable>
        ))}
      </View>

      <View style={styles.coverageCard}>
        <View style={styles.coverageHeading}>
          <View>
            <Text style={styles.coverageEyebrow}>YOUR A-LEVEL COVERAGE</Text>
            <Text style={styles.coverageTitle}>{selections.length} subjects connected</Text>
          </View>
          <Ionicons name="layers-outline" color={Colors.primary} size={24} />
        </View>
        <View style={styles.subjectDots}>
          {selections.map((selection) => {
            const item = findSubject(selection.subjectId);
            return item ? (
              <View key={item.id} style={styles.subjectDotRow}>
                <View style={[styles.subjectDot, { backgroundColor: item.color }]} />
                <Text style={styles.subjectDotText}>{item.shortTitle}</Text>
              </View>
            ) : null;
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 255, overflow: "hidden", padding: 21, borderRadius: 29, backgroundColor: Colors.primaryDeep, ...Shadow.blue },
  heroGlow: { position: "absolute", width: 210, height: 210, borderRadius: 105, right: -60, top: -75, backgroundColor: "rgba(74,133,255,0.25)" },
  heroIcon: { width: 50, height: 50, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.13)", marginBottom: 25 },
  heroEyebrow: { color: "#9EBEFF", fontSize: 9, fontWeight: "900", letterSpacing: 1.3 },
  heroTitle: { color: "#FFFFFF", fontSize: 24, lineHeight: 29, fontWeight: "900", marginTop: 6, maxWidth: 520 },
  heroBody: { color: "rgba(255,255,255,0.72)", fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 560 },
  heroStatus: { alignSelf: "flex-start", marginTop: 17, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.12)" },
  heroStatusText: { color: "rgba(255,255,255,0.82)", fontSize: 7, fontWeight: "900", letterSpacing: 0.9 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  sectionEyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.25 },
  sectionTitle: { color: Colors.ink, fontSize: 22, fontWeight: "900", marginTop: 3 },
  modeList: { gap: 11 },
  card: { flexDirection: "row", alignItems: "center", gap: 13, padding: 17, borderRadius: 22, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface, ...Shadow.card },
  icon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primarySoft },
  featuredIcon: { backgroundColor: Colors.primary },
  copy: { flex: 1, gap: 3 },
  cardEyebrow: { color: Colors.primary, fontSize: 7, fontWeight: "900", letterSpacing: 0.9 },
  title: { color: Colors.ink, fontSize: 16, fontWeight: "900" },
  body: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
  badge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.cream },
  badgeText: { color: Colors.muted, fontSize: 7, fontWeight: "900", letterSpacing: 0.7 },
  coverageCard: { gap: 15, padding: 18, borderRadius: 22, borderWidth: 1, borderColor: "#C8D8FF", backgroundColor: Colors.primarySoft },
  coverageHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  coverageEyebrow: { color: Colors.primary, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  coverageTitle: { color: Colors.ink, fontSize: 16, fontWeight: "900", marginTop: 3 },
  subjectDots: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subjectDotRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 10, backgroundColor: Colors.surface },
  subjectDot: { width: 7, height: 7, borderRadius: 4 },
  subjectDotText: { color: Colors.ink, fontSize: 9, fontWeight: "800" },
});
