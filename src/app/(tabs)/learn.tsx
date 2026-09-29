import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { StarMascot } from "@/components/StarMascot";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

export default function LearnScreen() {
  const { activeSubjectId } = useCourse();
  const subject = findSubject(activeSubjectId);

  return (
    <Screen eyebrow="COURSE LIBRARY" title="Learn" subtitle="A clear view of each subject, from first topic to final revision.">
      <SubjectSwitcher />

      {subject ? <>
        <View style={styles.intro}>
          <View style={styles.introCopy}>
            <Text style={styles.introLabel}>{subject.title.toUpperCase()}</Text>
            <Text style={styles.introTitle}>{subject.topics.length} topic areas</Text>
            <Text style={styles.introBody}>Your course outline is ready. Lessons will appear here as they’re released.</Text>
          </View>
          <StarMascot size={92} />
        </View>

        <View style={styles.heading}><Text style={styles.headingTitle}>Topic outline</Text><Text style={styles.headingMeta}>{subject.topics.length} topics</Text></View>

        <View style={styles.list}>
          {subject.topics.map((topic, index) => (
            <View key={topic.id} style={[styles.topic, index < subject.topics.length - 1 && styles.divider]}>
              <Text style={styles.number}>{String(index + 1).padStart(2, "0")}</Text>
              <View style={styles.topicCopy}><Text style={styles.topicTitle}>{topic.title}</Text><Text style={styles.topicSummary}>{topic.summary}</Text></View>
              <Ionicons name="lock-closed-outline" color="#9DA8B5" size={17} />
            </View>
          ))}
        </View>
        <Text style={styles.note}>Lesson content and specification details are being prepared.</Text>
      </> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { minHeight: 148, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 18, borderRadius: 19, backgroundColor: Colors.primarySoft },
  introCopy: { flex: 1 },
  introLabel: { color: Colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 0.7 },
  introTitle: { color: Colors.ink, fontSize: 23, fontWeight: "700", letterSpacing: -0.3, marginTop: 5 },
  introBody: { color: Colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  heading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  headingTitle: { color: Colors.ink, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  headingMeta: { color: Colors.muted, fontSize: 12 },
  list: { paddingHorizontal: 18, borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  topic: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 17 },
  divider: { borderBottomColor: Colors.line, borderBottomWidth: 1 },
  number: { color: Colors.primary, fontSize: 13, fontWeight: "700", paddingTop: 1 },
  topicCopy: { flex: 1, gap: 5 },
  topicTitle: { color: Colors.ink, fontSize: 15, fontWeight: "700" },
  topicSummary: { color: Colors.muted, fontSize: 12, lineHeight: 18 },
  note: { color: Colors.muted, fontSize: 12, lineHeight: 18, paddingHorizontal: 2 },
});
