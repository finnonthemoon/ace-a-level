import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { Screen } from "@/components/Screen";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { useTopicProgress } from "@/contexts/TopicProgressContext";
import { findLesson } from "@/content/lesson-content";
import { canViewStage } from "@/product/qualification";

export default function LessonScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = findLesson(lessonId);
  const { qualificationLevel } = useCourse();
  const { completeLesson, getProgress, isHydrated, recordQuestionAttempt } = useTopicProgress();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/learn");
  }, [router]);

  if (!lesson) {
    return <Screen eyebrow="LESSON" title="Lesson unavailable" subtitle="This lesson could not be found." onBack={goBack} />;
  }

  if (!canViewStage(qualificationLevel, lesson.stage)) {
    return <Screen eyebrow="LESSON" title="Lesson unavailable" subtitle="This lesson is not part of your selected qualification." onBack={goBack} />;
  }

  if (lesson.contentStatus === "planned" || lesson.pages.length === 0) {
    return (
      <Screen eyebrow={lesson.areaTitle.toUpperCase()} title={lesson.title} subtitle={lesson.description} onBack={goBack}>
        <View style={styles.planned}>
          <Text style={styles.eyebrow}>LESSON PLANNED</Text>
          <Text style={styles.plannedText}>This lesson is part of the course outline. Its teaching content is being prepared.</Text>
        </View>
      </Screen>
    );
  }

  const topicProgress = getProgress(lesson.topicId);
  const isComplete = topicProgress.completedLessonIds.includes(lesson.id);
  return (
    <LessonPlayer
      lesson={lesson}
      isHydrated={isHydrated}
      isComplete={isComplete}
      onExit={goBack}
      onComplete={() => completeLesson(lesson.topicId, lesson.id)}
      onRecordAttempt={(questionId, correct) => {
        void recordQuestionAttempt(lesson.topicId, questionId, correct).catch(() => undefined);
      }}
    />
  );
}

const styles = StyleSheet.create({
  planned: { gap: 10, padding: 16, borderRadius: 15, backgroundColor: Colors.surface },
  eyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  plannedText: { color: Colors.muted, fontSize: 13, lineHeight: 20 },
});
