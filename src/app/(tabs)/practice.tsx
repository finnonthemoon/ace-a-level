import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { StarMascot } from "@/components/StarMascot";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

const MODES = [
  { icon: "pulse-outline" as const, title: "Subject diagnostic", description: "A short check to find a useful starting point." },
  { icon: "options-outline" as const, title: "Topic practice", description: "Questions focused on the topics you choose." },
  { icon: "timer-outline" as const, title: "Timed assessment", description: "Practice to the format and timing of your specification." },
];

export default function PracticeScreen() {
  const { activeSubjectId } = useCourse();
  const subject = findSubject(activeSubjectId);

  return (
    <Screen eyebrow="ASSESSMENTS" title="Practice" subtitle="Focused questions for the subject you’re studying.">
      <SubjectSwitcher />
      <View style={styles.intro}>
        <View style={styles.introCopy}>
          <Text style={styles.introLabel}>IN PREPARATION</Text>
          <Text style={styles.introTitle}>Practice is on its way.</Text>
          <Text style={styles.introBody}>{subject?.title ?? "Your subject"} question sets will appear here when they’re ready.</Text>
        </View>
        <StarMascot size={100} />
      </View>

      <View style={styles.heading}><Text style={styles.headingTitle}>Planned formats</Text><Text style={styles.headingMeta}>Coming soon</Text></View>
      <View style={styles.list}>
        {MODES.map((mode, index) => (
          <View key={mode.title} style={[styles.mode, index < MODES.length - 1 && styles.divider]}>
            <View style={styles.icon}><Ionicons name={mode.icon} color={Colors.primary} size={21} /></View>
            <View style={styles.modeCopy}><Text style={styles.modeTitle}>{mode.title}</Text><Text style={styles.modeDescription}>{mode.description}</Text></View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { minHeight: 163, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 20, borderRadius: 19, backgroundColor: Colors.primaryDeep },
  introCopy: { flex: 1 },
  introLabel: { color: "#BFCDE5", fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  introTitle: { color: "#FFFFFF", fontSize: 22, lineHeight: 27, fontWeight: "700", letterSpacing: -0.3, marginTop: 7 },
  introBody: { color: "#D6DFEE", fontSize: 12, lineHeight: 18, marginTop: 8 },
  heading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  headingTitle: { color: Colors.ink, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  headingMeta: { color: Colors.muted, fontSize: 12 },
  list: { paddingHorizontal: 17, borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  mode: { minHeight: 91, flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  icon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primarySoft },
  modeCopy: { flex: 1, gap: 4 },
  modeTitle: { color: Colors.ink, fontSize: 15, fontWeight: "700" },
  modeDescription: { color: Colors.muted, fontSize: 12, lineHeight: 17 },
});
