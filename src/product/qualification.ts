/** AS content is included in both AS and full A Level courses. */
export type QualificationStage = "as" | "a-level";
export type QualificationLevel = QualificationStage;

export function canViewStage(qualification: QualificationLevel, stage: QualificationStage) {
  return qualification === "a-level" || stage === "as";
}
