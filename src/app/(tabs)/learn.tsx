import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";
import { Colors, Shadow } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

export default function LearnScreen() {
  const { activeSubjectId } = useCourse();
  const subject = findSubject(activeSubjectId);

  return (
    <Screen
      eyebrow="COURSE MAP"
      title={subject ? `Learn ${subject.shortTitle}` : "Learn"}
      subtitle="Move through each course in order, or jump to the topic you need before a lesson or assessment."
    >
      <SubjectSwitcher />

      {subject ? (
        <View style={styles.subjectHero}>
          <View style={[styles.subjectHeroIcon, { backgroundColor: subject.softColor }]}>
            <Ionicons name={subject.icon} color={subject.color} size={27} />
          </View>
          <View style={styles.subjectHeroCopy}>
            <Text style={styles.subjectHeroEyebrow}>YOUR {subject.title.toUpperCase()} COURSE</Text>
            <Text style={styles.subjectHeroTitle}>{subject.topics.length} topic areas</Text>
            <Text style={styles.subjectHeroBody}>Exam-board detail will appear here once your specification is selected.</Text>
          </View>
          <View style={styles.percentRing}><Text style={styles.percentText}>0%</Text></View>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>EXPLORE THE COURSE</Text>
          <Text style={styles.sectionTitle}>Topics</Text>
        </View>
        <Text style={styles.orderHint}>Study in order</Text>
      </View>

      <View style={styles.grid}>
        {subject?.topics.map((topic, index) => (
          <Pressable
            accessibilityRole="button"
            key={topic.id}
            style={({ pressed }) => [styles.topic, pressed && styles.pressed]}
          >
            <View style={styles.topicTop}>
              <View style={[styles.number, { backgroundColor: subject.softColor }]}>
                <Text style={[styles.numberText, { color: subject.color }]}>{index + 1}</Text>
              </View>
              <View style={styles.lessonCount}><Text style={styles.lessonCountText}>COMING SOON</Text></View>
            </View>
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={styles.topicSummary}>{topic.summary}</Text>
            <View style={styles.topicFooter}>
              <View style={styles.topicProgress}><View style={[styles.topicProgressFill, { backgroundColor: subject.color }]} /></View>
              <Ionicons name="arrow-forward" color={subject.color} size={18} />
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipIcon}><Ionicons name="bulb-outline" color={Colors.primary} size={21} /></View>
        <View style={styles.tipCopy}>
          <Text style={styles.tipTitle}>A-level study is a multi-course plan</Text>
          <Text style={styles.tipBody}>Switch subjects above without losing your place. Each course keeps its own specification, lessons and progress.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subjectHero: { flexDirection: "row", alignItems: "center", gap: 13, padding: 17, borderRadius: 23, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface, ...Shadow.card },
  subjectHeroIcon: { width: 52, height: 52, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  subjectHeroCopy: { flex: 1, gap: 3 },
  subjectHeroEyebrow: { color: Colors.primary, fontSize: 8, fontWeight: "900", letterSpacing: 1.05 },
  subjectHeroTitle: { color: Colors.ink, fontSize: 17, fontWeight: "900" },
  subjectHeroBody: { color: Colors.muted, fontSize: 10, lineHeight: 15 },
  percentRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 5, borderColor: Colors.primarySoft, alignItems: "center", justifyContent: "center" },
  percentText: { color: Colors.ink, fontSize: 10, fontWeight: "900" },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  sectionEyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.25 },
  sectionTitle: { color: Colors.ink, fontSize: 22, fontWeight: "900", marginTop: 3 },
  orderHint: { color: Colors.muted, fontSize: 10, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
  topic: { flexBasis: "47%", flexGrow: 1, minHeight: 214, padding: 16, borderRadius: 23, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface, ...Shadow.card },
  topicTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  number: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  numberText: { fontSize: 16, fontWeight: "900" },
  lessonCount: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.cream },
  lessonCountText: { color: Colors.muted, fontSize: 6, fontWeight: "900", letterSpacing: 0.7 },
  topicTitle: { color: Colors.ink, fontSize: 16, lineHeight: 20, fontWeight: "900", marginTop: 18 },
  topicSummary: { flex: 1, color: Colors.muted, fontSize: 11, lineHeight: 16, marginTop: 6 },
  topicFooter: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 15 },
  topicProgress: { flex: 1, height: 4, overflow: "hidden", borderRadius: 2, backgroundColor: Colors.line },
  topicProgressFill: { width: "0%", height: "100%" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 17, borderRadius: 21, backgroundColor: Colors.primarySoft },
  tipIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surface },
  tipCopy: { flex: 1, gap: 4 },
  tipTitle: { color: Colors.ink, fontSize: 14, fontWeight: "900" },
  tipBody: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
});
