import { useLocalSearchParams } from "expo-router";

import { TopicPracticeCourseScreen } from "@/components/practice/TopicPracticeCourseScreen";

export default function TopicPracticePathRoute() {
  const { subjectId, coursePath } = useLocalSearchParams<{ subjectId: string; coursePath: string[] }>();
  const path = Array.isArray(coursePath) ? coursePath : coursePath ? [coursePath] : [];
  return <TopicPracticeCourseScreen subjectId={subjectId} path={path} />;
}
