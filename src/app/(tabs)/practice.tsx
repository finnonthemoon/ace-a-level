import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

const MODES = [
  { icon: "pulse-outline" as const, title: "Diagnostic", body: "Find strengths and gaps across the active subject." },
  { icon: "options-outline" as const, title: "Topic practice", body: "Build a session from one or more curriculum topics." },
  { icon: "timer-outline" as const, title: "Timed paper", body: "Practise against an exam-board assessment format." },
];

export default function PracticeScreen() {
  const { activeSubjectId } = useCourse();
  const subject = findSubject(activeSubjectId);
  return (
    <Screen eyebrow="QUESTION PRACTICE" title={subject ? `${subject.shortTitle} practice` : "Practice"}>
      <SubjectSwitcher />
      <View style={styles.notice}><Ionicons name="construct-outline" color={Colors.primary} size={21} /><Text style={styles.noticeText}>The assessment engine will be connected after the subject and exam-board schemas are approved.</Text></View>
      {MODES.map((mode) => (
        <View key={mode.title} style={styles.card}>
          <View style={styles.icon}><Ionicons name={mode.icon} color={subject?.color ?? Colors.primary} size={23} /></View>
          <View style={styles.copy}><Text style={styles.title}>{mode.title}</Text><Text style={styles.body}>{mode.body}</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>PLANNED</Text></View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: { flexDirection: "row", gap: 10, padding: 15, borderRadius: 18, backgroundColor: "#FFF0D8" },
  noticeText: { flex: 1, color: Colors.primaryDark, fontSize: 12, lineHeight: 18, fontWeight: "700" },
  card: { flexDirection: "row", alignItems: "center", gap: 13, padding: 18, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  icon: { width: 46, height: 46, borderRadius: 15, backgroundColor: Colors.cream, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: 4 },
  title: { color: Colors.ink, fontSize: 16, fontWeight: "900" },
  body: { color: Colors.muted, fontSize: 12, lineHeight: 17 },
  badge: { backgroundColor: Colors.cream, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9 },
  badgeText: { color: Colors.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
});
