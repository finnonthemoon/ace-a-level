import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

export default function LearnScreen() {
  const { activeSubjectId } = useCourse();
  const subject = findSubject(activeSubjectId);

  return (
    <Screen eyebrow="COURSE MAP" title={subject ? `Learn ${subject.shortTitle}` : "Learn"}>
      <SubjectSwitcher />
      <Text style={styles.intro}>Choose a topic to see its ordered lessons. The cards below are the initial curriculum outline.</Text>
      <View style={styles.list}>
        {subject?.topics.map((topic, index) => (
          <View key={topic.id} style={styles.topic}>
            <View style={[styles.number, { backgroundColor: subject.softColor }]}><Text style={[styles.numberText, { color: subject.color }]}>{index + 1}</Text></View>
            <View style={styles.copy}><Text style={styles.title}>{topic.title}</Text><Text style={styles.summary}>{topic.summary}</Text><Text style={styles.status}>LESSONS COMING NEXT</Text></View>
            <Ionicons name="chevron-forward" color={Colors.muted} size={20} />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: Colors.muted, fontSize: 14, lineHeight: 21 },
  list: { gap: 11 },
  topic: { flexDirection: "row", alignItems: "center", gap: 13, padding: 17, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  number: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  numberText: { fontSize: 17, fontWeight: "900" },
  copy: { flex: 1, gap: 4 },
  title: { color: Colors.ink, fontSize: 16, fontWeight: "900" },
  summary: { color: Colors.muted, fontSize: 12, lineHeight: 17 },
  status: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1, marginTop: 4 },
});
