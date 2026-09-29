import type { TopicProgressRecord } from "@/contexts/TopicProgressContext";

export function getTopicMastery(
  progress: TopicProgressRecord,
  lessonIds: readonly string[],
) {
  const lessonCompletion = lessonIds.length === 0
    ? 0
    : progress.completedLessonIds.filter((id) => lessonIds.includes(id)).length / lessonIds.length;
  const practiceAccuracy = progress.questionsAttempted > 0
    ? progress.questionsCorrect / progress.questionsAttempted
    : 0;
  const completedSession = progress.completedPracticeSessionIds.length > 0 ? 1 : 0;

  return Math.round(lessonCompletion * 35 + practiceAccuracy * 45 + completedSession * 20);
}
