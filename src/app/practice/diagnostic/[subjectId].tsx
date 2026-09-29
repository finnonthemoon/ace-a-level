import { useLocalSearchParams } from "expo-router";

import { AssessmentPreview } from "@/components/practice/AssessmentPreview";

export default function DiagnosticOverviewScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  return <AssessmentPreview mode="diagnostic" subjectId={subjectId} />;
}
