import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QualificationStageBadge } from "@/components/QualificationStageBadge";
import { LessonRoadmap, type CheckpointRoadmapItem } from "@/components/course/LessonRoadmap";
import { Colors, MaxContentWidth } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { useTopicProgress } from "@/contexts/TopicProgressContext";
import { getTopicProgressId, getVisibleLessons, resolveCoursePath } from "@/content/course-catalog";
import { findQuestions, getVisiblePracticeSets } from "@/content/practice-content";

export default function TopicLearnScreen() {
  const router = useRouter();
  const { subjectId, areaId, groupId, topicId } = useLocalSearchParams<{
    subjectId: string;
    areaId: string;
    groupId: string;
    topicId: string;
  }>();
  const { qualificationLevel } = useCourse();
  const { getProgress, isHydrated } = useTopicProgress();
  const resolved = resolveCoursePath(subjectId, [areaId, groupId, topicId], qualificationLevel);
  const specification = resolved?.specification;
  const area = resolved?.area;
  const group = resolved?.selectedGroup;
  const topic = resolved?.selectedTopic;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace(`/course/${subjectId}/${areaId}/${groupId}/${topicId}` as Href);
  }

  if (!specification || !area || !group || !topic) {
    return (
      <SafeAreaView edges={["top", "right", "bottom", "left"]} style={styles.safeArea}>
        <View style={styles.errorContent}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to topic overview" onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color={Colors.ink} />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.errorTitle}>Lesson roadmap unavailable</Text>
          <Text style={styles.context}>This topic could not be found for your selected qualification.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const lessons = getVisibleLessons(topic, qualificationLevel);
  const visibleStages = [...new Set(lessons.map((lesson) => lesson.stage))];
  const progressTopicId = getTopicProgressId(specification, area, group, topic);
  const progress = getProgress(progressTopicId);
  const completedCount = lessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
  const completionPercent = lessons.length > 0 && isHydrated ? Math.round(completedCount / lessons.length * 100) : 0;
  const practiceSets = getVisiblePracticeSets(topic.practiceSetIds, qualificationLevel)
    .map((set) => ({ set, questionCount: findQuestions(set.questionIds).length }))
    .filter(({ questionCount }) => questionCount > 0);
  const checkpoints: CheckpointRoadmapItem[] = practiceSets.length > 0 ? [{
    type: "checkpoint",
    id: `${progressTopicId}:practice`,
    title: "Topic Practice",
    questionCount: practiceSets.reduce((total, { questionCount }) => total + questionCount, 0),
    completed: progress.completedPracticeSessionIds.length > 0,
    // Match TopicOverview's practice action; use the existing topic chooser
    // when more than one real set is available. Practice has no lesson lock.
    onPress: () => router.push((practiceSets.length === 1
      ? `/practice/${practiceSets[0].set.id}`
      : `/practice/course/${subjectId}/${areaId}/${groupId}/${topicId}`) as Href),
  }] : [];

  return (
    <SafeAreaView edges={["top", "right", "bottom", "left"]} style={styles.safeArea}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to topic overview" onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color={Colors.ink} />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.contextRow}>
            <Text numberOfLines={1} style={styles.context}>{area.title} · {specification.examBoard.title}</Text>
            <View style={styles.stageBadges}>
              {visibleStages.map((stage) => <QualificationStageBadge key={stage} stage={stage} />)}
            </View>
          </View>
          <Text style={styles.title}>Learn {topic.title}</Text>
          <Text style={styles.progressText}>
            {isHydrated ? `${completedCount} / ${lessons.length} lessons · ${completionPercent}%` : "Loading lesson progress"}
          </Text>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Lesson completion"
            accessibilityValue={{ min: 0, max: 100, now: completionPercent, text: isHydrated ? `${completedCount} of ${lessons.length} lessons complete, ${completionPercent}%` : "Loading lesson progress" }}
            style={styles.progressTrack}
          >
            {completionPercent > 0 ? <View style={[styles.progressFill, { width: `${completionPercent}%` }]} /> : null}
          </View>
        </View>

        {lessons.length > 0 ? (
          <LessonRoadmap
            lessons={lessons}
            progress={progress}
            isHydrated={isHydrated}
            checkpoints={checkpoints}
            onLessonPress={(lessonId) => router.push(`/lesson/${lessonId}` as Href)}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={21} color={Colors.muted} />
            <Text style={styles.emptyText}>No lessons are available for this qualification yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.cream },
  scroll: { flex: 1, width: "100%" },
  content: { width: "100%", maxWidth: MaxContentWidth, alignSelf: "center", paddingHorizontal: 22, paddingTop: 12, paddingBottom: 36, gap: 18 },
  errorContent: { width: "100%", maxWidth: MaxContentWidth, alignSelf: "center", paddingHorizontal: 22, paddingTop: 12, gap: 18 },
  backButton: { minHeight: 40, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 2 },
  backLabel: { color: Colors.ink, fontSize: 13, fontWeight: "600" },
  header: { gap: 8, paddingBottom: 2 },
  contextRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  context: { color: Colors.primary, fontSize: 10, lineHeight: 15, fontWeight: "700", letterSpacing: 0.55, textTransform: "uppercase" },
  stageBadges: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 5 },
  title: { color: Colors.ink, fontSize: 27, lineHeight: 33, fontWeight: "700", letterSpacing: -0.55 },
  progressText: { color: Colors.muted, fontSize: 12, lineHeight: 18, fontWeight: "600", marginTop: 2 },
  progressTrack: { width: "100%", height: 10, overflow: "hidden", borderRadius: 999, backgroundColor: "#EDF1F7" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: Colors.primary },
  emptyState: { minHeight: 96, flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 15, backgroundColor: Colors.surface },
  emptyText: { flex: 1, color: Colors.muted, fontSize: 12, lineHeight: 17 },
  errorTitle: { color: Colors.ink, fontSize: 24, lineHeight: 30, fontWeight: "700" },
});
