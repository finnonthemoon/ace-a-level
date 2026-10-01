import { COURSE_CATALOG } from "../content/course-catalog";
import type { QualificationLevel } from "../product/qualification";
import { SUBJECTS, type SubjectId } from "../product/subjects";

export const GRADES = ["A*", "A", "B", "C", "D", "E"] as const;
export type Grade = (typeof GRADES)[number];
export const STUDY_GOALS = {
  grades: "Improve my grades",
  classes: "Stay on top of class",
  exams: "Prepare for exams",
  habit: "Build a consistent study habit",
} as const;
export type StudyGoal = keyof typeof STUDY_GOALS;
export const STUDY_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type StudyDay = (typeof STUDY_DAYS)[number];
export const DAY_LABELS: Record<StudyDay, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
};
// Retain the explicit product rule in PROJECT_CONTEXT.md. Legacy smaller plans still load.
export const MIN_PLAN_SUBJECTS = 3;
export const MAX_PLAN_SUBJECTS = 5;
export const ONBOARDING_STEPS = ["welcome", "year", "subjects", "boards", "grades", "goals", "target", "days", "times", "notifications", "star", "review"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface SubjectSelection {
  subjectId: SubjectId;
  specificationId: string | null;
  predictedGrade: Grade | null;
  targetGrade: Grade | null;
}
export interface StudyPreferences {
  weeklyTargetMinutes: number;
  targetDaysPerWeek: number;
  selectedStudyDays: StudyDay[];
  reminders: {
    // Wall-clock minutes after midnight, following the device's local timezone / DST.
    defaultTimeMinutes: number;
    dayOverrides: Partial<Record<StudyDay, number | null>>;
  };
  // Device opt-in, separate from OS permission and never restored from cloud.
  notificationsEnabled: boolean;
}
export type ReminderPermission = "undetermined" | "granted" | "denied" | "unavailable";
export interface ReminderRuntime {
  permission: ReminderPermission;
  scheduledIds: string[];
  signature: string | null;
  error: string | null;
}
export interface StudyPlan {
  schemaVersion: 2;
  activeSubjectId: SubjectId | null;
  examYear: number | null;
  qualificationLevel: QualificationLevel;
  selections: SubjectSelection[];
  goals: StudyGoal[];
  studyPreferences: StudyPreferences;
  onboarding: { step: OnboardingStep; completed: boolean };
  updatedAt: string | null;
}

export function defaultStudyPreferences(): StudyPreferences {
  return { weeklyTargetMinutes: 180, targetDaysPerWeek: 3, selectedStudyDays: ["mon", "wed", "fri"], reminders: { defaultTimeMinutes: 1080, dayOverrides: {} }, notificationsEnabled: false };
}
export function emptyStudyPlan(): StudyPlan {
  return { schemaVersion: 2, activeSubjectId: null, examYear: null, qualificationLevel: "a-level", selections: [], goals: [], studyPreferences: defaultStudyPreferences(), onboarding: { step: "welcome", completed: false }, updatedAt: null };
}
export function isSubjectId(value: unknown): value is SubjectId {
  return SUBJECTS.some((subject) => subject.id === value);
}
export function normaliseGrade(value: unknown): Grade | null {
  return GRADES.find((grade) => grade === value) ?? null;
}
function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function integer(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}
export function normaliseStudyPreferences(value: unknown): StudyPreferences {
  const candidate = object(value);
  const defaults = defaultStudyPreferences();
  const days = Array.isArray(candidate.selectedStudyDays)
    ? STUDY_DAYS.filter((day) => candidate.selectedStudyDays instanceof Array && candidate.selectedStudyDays.includes(day))
    : defaults.selectedStudyDays;
  const reminders = object(candidate.reminders);
  const overrides = object(reminders.dayOverrides);
  const dayOverrides: StudyPreferences["reminders"]["dayOverrides"] = {};
  for (const day of STUDY_DAYS) {
    if (overrides[day] === null || integer(overrides[day], 0, 1439)) dayOverrides[day] = overrides[day] as number | null;
  }
  return {
    weeklyTargetMinutes: integer(candidate.weeklyTargetMinutes, 15, 10080) ? candidate.weeklyTargetMinutes : defaults.weeklyTargetMinutes,
    // The chosen days are the source of truth for the count.
    targetDaysPerWeek: days.length,
    selectedStudyDays: days,
    reminders: { defaultTimeMinutes: integer(reminders.defaultTimeMinutes, 0, 1439) ? reminders.defaultTimeMinutes : 1080, dayOverrides },
    notificationsEnabled: candidate.notificationsEnabled === true,
  };
}
export function normaliseStudyPlan(value: unknown): StudyPlan {
  const candidate = object(value);
  const seen = new Set<SubjectId>();
  const selections: SubjectSelection[] = [];
  for (const item of Array.isArray(candidate.selections) ? candidate.selections : []) {
    const selection = object(item);
    if (!isSubjectId(selection.subjectId) || seen.has(selection.subjectId)) continue;
    seen.add(selection.subjectId);
    selections.push({
      subjectId: selection.subjectId,
      // Preserve historical IDs; new choices are always constrained by the catalogue.
      specificationId: typeof selection.specificationId === "string" ? selection.specificationId : null,
      predictedGrade: normaliseGrade(selection.predictedGrade), targetGrade: normaliseGrade(selection.targetGrade),
    });
  }
  const onboarding = object(candidate.onboarding);
  return {
    schemaVersion: 2,
    activeSubjectId: selections.some((s) => s.subjectId === candidate.activeSubjectId) ? candidate.activeSubjectId as SubjectId : selections[0]?.subjectId ?? null,
    examYear: integer(candidate.examYear, 2000, 2100) ? candidate.examYear : null,
    qualificationLevel: candidate.qualificationLevel === "as" ? "as" : "a-level",
    selections,
    goals: Object.keys(STUDY_GOALS).filter((goal): goal is StudyGoal => Array.isArray(candidate.goals) && candidate.goals.includes(goal)),
    studyPreferences: normaliseStudyPreferences(candidate.studyPreferences),
    onboarding: {
      step: ONBOARDING_STEPS.find((step) => step === onboarding.step) ?? "welcome",
      // Only pre-v2 plans migrate as complete. Draft selections never bypass onboarding.
      completed: typeof onboarding.completed === "boolean" ? onboarding.completed : candidate.schemaVersion !== 2 && selections.length > 0,
    },
    updatedAt: typeof candidate.updatedAt === "string" && Number.isFinite(Date.parse(candidate.updatedAt)) ? candidate.updatedAt : null,
  };
}
export function specificationsForSubject(subjectId: SubjectId, level: QualificationLevel) {
  return COURSE_CATALOG.filter((spec) => spec.subject.id === subjectId && spec.qualification.specifications.some((entry) => entry.level === level));
}
export function specificationLabel(selection: SubjectSelection): string {
  if (!selection.specificationId) return "Board not set";
  const spec = COURSE_CATALOG.find((item) => item.id === selection.specificationId && item.subject.id === selection.subjectId);
  return spec ? `${spec.examBoard.title} ${spec.title}` : "Previously selected specification (unavailable)";
}
export function upcomingExamYears(saved: number | null, now = new Date()): number[] {
  const first = now.getFullYear() + 1;
  return [...new Set([first, first + 1, first + 2, ...(saved === null ? [] : [saved])])].sort((a, b) => a - b);
}
export function formatStudyMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60), rest = minutes % 60;
  return [hours ? `${hours}h` : "", rest ? `${rest}m` : ""].filter(Boolean).join(" ") || "0m";
}
export function formatReminderTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
export function reminderEntries(preferences: StudyPreferences) {
  return STUDY_DAYS.filter((day) => preferences.selectedStudyDays.includes(day)).flatMap((day) => {
    const time = preferences.reminders.dayOverrides[day];
    return time === null ? [] : [{ day, minutes: time ?? preferences.reminders.defaultTimeMinutes }];
  });
}
export function reminderStatusLabel(preferences: StudyPreferences, runtime: ReminderRuntime, scheduling = false): string {
  if (runtime.permission === "unavailable") return "Unavailable on this device";
  if (!preferences.notificationsEnabled) return "Off · You can enable reminders anytime";
  if (runtime.permission !== "granted") return "Off · Device permission needed";
  if (runtime.error) return "Needs attention · Reminders could not be updated";
  if (scheduling || !runtime.signature) return "Updating reminders…";
  return runtime.scheduledIds.length ? "On" : "On · No reminder days selected";
}
export function planValidation(plan: StudyPlan): string | null {
  // Existing smaller plans are editable; new plans follow the explicit product range.
  const minimum = plan.onboarding.completed ? 1 : MIN_PLAN_SUBJECTS;
  if (plan.selections.length < minimum || plan.selections.length > MAX_PLAN_SUBJECTS) return `Choose ${minimum}–${MAX_PLAN_SUBJECTS} subjects to continue.`;
  if (!plan.studyPreferences.selectedStudyDays.length) return "Choose at least one study day.";
  return null;
}
