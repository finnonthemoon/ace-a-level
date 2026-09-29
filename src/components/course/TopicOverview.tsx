import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Colors } from "@/constants/theme";
import { useTopicProgress } from "@/contexts/TopicProgressContext";
import { findLesson } from "@/content/lesson-content";
import { findPracticeSet } from "@/content/practice-content";
import type { CourseTopic } from "@/content/course-catalog";
import { getTopicMastery } from "@/core/topic-mastery";

interface TopicOverviewProps {
  topic: CourseTopic;
  progressTopicId?: string;
  onBack: () => void;
}

export function TopicOverview({ topic, progressTopicId, onBack }: TopicOverviewProps) {
  const router = useRouter();
  const { getProgress, isHydrated } = useTopicProgress();
  const topicId = progressTopicId ?? topic.contentId ?? topic.id;
  const progress = getProgress(topicId);
  const mastery = getTopicMastery(progress, topic.lessonIds);
  const lessons = topic.lessonIds.map(findLesson).filter((lesson) => lesson !== null);
  const practiceSets = topic.practiceSetIds.map(findPracticeSet).filter((practiceSet) => practiceSet !== null);

  return (
    <Screen eyebrow="TOPIC OVERVIEW" title={topic.title} subtitle={topic.summary} onBack={onBack}>
      <View style={styles.masteryCard}>
        <View style={styles.masteryTop}>
          <View style={styles.masteryCopy}>
            <Text style={styles.masteryEyebrow}>TOPIC MASTERY</Text>
            <Text style={styles.masteryValue}>{isHydrated ? `${mastery}%` : "Loading"}</Text>
            <Text style={styles.masterySubtitle}>{mastery === 100 ? "Excellent work. Keep practising to retain it." : "Build your understanding lesson by lesson."}</Text>
          </View>
          <View style={styles.masteryIcon}><Ionicons name="school-outline" size={27} color={Colors.primary} /></View>
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${mastery}%` }]} /></View>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>{progress.completedLessonIds.length}/{topic.lessonIds.length} lessons</Text>
          <Text style={styles.stat}>{progress.questionsCorrect}/{progress.questionsAttempted} correct</Text>
          <Text style={styles.stat}>{progress.completedPracticeSessionIds.length} sessions</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}><Ionicons name="book-outline" size={19} color={Colors.primary} /></View>
          <View style={styles.sectionCopy}><Text style={styles.sectionTitle}>Learn</Text><Text style={styles.sectionSubtitle}>Read a short lesson and follow worked examples.</Text></View>
        </View>
        <View style={styles.itemList}>
          {lessons.map((lesson) => {
            const complete = progress.completedLessonIds.includes(lesson.id);
            return (
              <Pressable key={lesson.id} accessibilityRole="button" disabled={!isHydrated} onPress={() => router.push(`/lesson/${lesson.id}` as Href)} style={({ pressed }) => [styles.contentRow, pressed && styles.pressed]}>
                <View style={styles.itemCopy}><Text style={styles.itemTitle}>{lesson.title}</Text><Text style={styles.itemMeta}>{lesson.estimatedMinutes} min lesson</Text></View>
                <Text style={[styles.itemStatus, complete && styles.completeStatus]}>{complete ? "Complete" : "Start lesson"}</Text>
                <Ionicons name={complete ? "checkmark-circle" : "chevron-forward"} size={18} color={complete ? Colors.success : Colors.primary} />
              </Pressable>
            );
          })}
          {lessons.length === 0 ? (
            <View style={styles.emptyRow}>
              <View style={styles.itemCopy}><Text style={styles.itemTitle}>Lessons coming soon</Text><Text style={styles.itemMeta}>Learning content for this topic is being prepared.</Text></View>
              <Ionicons name="time-outline" size={18} color={Colors.muted} />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <View style={[styles.sectionIcon, styles.practiceIcon]}><Ionicons name="create-outline" size={19} color={Colors.primary} /></View>
          <View style={styles.sectionCopy}><Text style={styles.sectionTitle}>Practice</Text><Text style={styles.sectionSubtitle}>Try questions, get instant feedback and review solutions.</Text></View>
        </View>
        <View style={styles.itemList}>
          {practiceSets.map((practiceSet) => (
            <Pressable key={practiceSet.id} accessibilityRole="button" disabled={!isHydrated} onPress={() => router.push(`/practice/${practiceSet.id}` as Href)} style={({ pressed }) => [styles.contentRow, pressed && styles.pressed]}>
              <View style={styles.itemCopy}><Text style={styles.itemTitle}>{practiceSet.title}</Text><Text style={styles.itemMeta}>{practiceSet.questionIds.length} questions | Immediate marking</Text></View>
              <Text style={styles.itemStatus}>{progress.completedPracticeSessionIds.length > 0 ? "Practise again" : "Start practice"}</Text>
              <Ionicons name={progress.completedPracticeSessionIds.length > 0 ? "checkmark-circle" : "chevron-forward"} size={18} color={progress.completedPracticeSessionIds.length > 0 ? Colors.success : Colors.primary} />
            </Pressable>
          ))}
          {practiceSets.length === 0 ? (
            <View style={styles.emptyRow}>
              <View style={styles.itemCopy}><Text style={styles.itemTitle}>Practice coming soon</Text><Text style={styles.itemMeta}>Questions and feedback will appear here when ready.</Text></View>
              <Ionicons name="time-outline" size={18} color={Colors.muted} />
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  masteryCard: { gap: 16, padding: 19, borderRadius: 20, backgroundColor: Colors.primaryDeep },
  masteryTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  masteryCopy: { flex: 1, gap: 4 },
  masteryEyebrow: { color: "#BFCDE5", fontSize: 10, fontWeight: "700", letterSpacing: 0.9 },
  masteryValue: { color: "#FFFFFF", fontSize: 30, lineHeight: 34, fontWeight: "700", letterSpacing: -0.6 },
  masterySubtitle: { color: "#D6DFEE", fontSize: 11, lineHeight: 16 },
  masteryIcon: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  progressTrack: { height: 7, overflow: "hidden", borderRadius: 5, backgroundColor: "#52617D" },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: "#82A9F5" },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat: { color: "#D6DFEE", fontSize: 10, fontWeight: "600" },
  section: { gap: 13 },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 11 },
  sectionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primarySoft },
  practiceIcon: { backgroundColor: "#EAF3F7" },
  sectionCopy: { flex: 1, gap: 3 },
  sectionTitle: { color: Colors.ink, fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  sectionSubtitle: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
  itemList: { paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  contentRow: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 9 },
  emptyRow: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 9, opacity: 0.72 },
  itemCopy: { flex: 1, gap: 5 },
  itemTitle: { color: Colors.ink, fontSize: 13, fontWeight: "700" },
  itemMeta: { color: Colors.muted, fontSize: 10 },
  itemStatus: { color: Colors.primary, fontSize: 10, fontWeight: "700" },
  completeStatus: { color: Colors.success },
  pressed: { opacity: 0.78 },
});
