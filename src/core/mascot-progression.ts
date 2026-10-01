import type { SubjectId } from "../product/subjects";
import type { QualificationLevel } from "../product/qualification";

// No measured study time exists yet. Lesson completion is not elapsed study time.
// A future evaluator uses each historical week's own goal, not today's goal or total hours.
export interface StudyGoalWeek {
  weekStartingLocalDate: string;
  targetMinutes: number;
  measuredStudyMinutes: number;
  targetDays: number;
  measuredStudyDays: number;
  completeObservation: boolean;
}
export interface GoalConsistencyEvidence {
  source: "measured-study-time";
  weeks: readonly StudyGoalWeek[];
}
export type MascotEmotion = "calm" | "engaged" | "energetic";
export type MascotProgression =
  | { mode: "preview"; evidence: null; emotion: "calm" }
  | { mode: "measured"; evidence: GoalConsistencyEvidence; emotion: MascotEmotion };

// Stage thresholds intentionally await real measurement coverage and a reviewed policy.
export const MASCOT_PROGRESSION_FOUNDATION: MascotProgression = { mode: "preview", evidence: null, emotion: "calm" };
export const STAR_STAGE_MEANINGS = { red: "Beginning", orange: "Building momentum", yellow: "Consistent", white: "Strong consistency", blue: "Excellent recent consistency" } as const;

// A future weekly planner should publish only evidence-backed items, never sample recommendations.
export interface PersonalisedWeekPlan {
  weekStartingLocalDate: string;
  source: "recommendation-engine";
  qualificationLevel: QualificationLevel;
  items: readonly { subjectId: SubjectId; specificationId: string; contentId: string; kind: "lesson" | "practice"; estimatedMinutes: number }[];
}
