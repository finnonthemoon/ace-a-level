import { useLocalSearchParams } from "expo-router";

import { TopicPracticeCourseScreen } from "@/components/practice/TopicPracticeCourseScreen";

export default function TopicPracticeSubjectRoute() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  return <TopicPracticeCourseScreen subjectId={subjectId} path={[]} />;
}
