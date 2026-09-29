import { useLocalSearchParams } from "expo-router";

import { AssessmentPreview } from "@/components/practice/AssessmentPreview";

export default function TimedAssessmentOverviewScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  return <AssessmentPreview mode="timed" subjectId={subjectId} />;
}
