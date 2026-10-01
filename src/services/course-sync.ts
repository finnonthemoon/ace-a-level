import { requireSupabase } from "@/lib/supabase";
import type { SubjectId } from "@/product/subjects";
import { isSubjectId, normaliseGrade, normaliseStudyPlan, type StudyPlan, type Grade, type SubjectSelection } from "@/core/study-plan";

export type TargetGrade = Grade;

export type SyncedSubjectSelection = SubjectSelection;

export interface SyncedCourseSettings {
  activeSubjectId: SubjectId | null;
  examYear: number | null;
  selections: SyncedSubjectSelection[];
  studyPlan?: StudyPlan;
}

export async function fetchRemoteCourseSettings(userId: string): Promise<SyncedCourseSettings | null> {
  const client = requireSupabase();
  const [settingsResult, selectionsResult] = await Promise.all([
    client
      .from("a_level_user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    client
      .from("a_level_subject_selections")
      .select("subject_id, specification_id, target_grade")
      .eq("user_id", userId),
  ]);
  if (settingsResult.error) throw settingsResult.error;
  if (selectionsResult.error) throw selectionsResult.error;
  if (!settingsResult.data) return null;

  const selections: SyncedSubjectSelection[] = (selectionsResult.data ?? [])
    .filter((row) => isSubjectId(row.subject_id))
    .map((row) => ({
      subjectId: row.subject_id as SubjectId,
      specificationId: typeof row.specification_id === "string" ? row.specification_id : null,
      targetGrade: normaliseGrade(row.target_grade),
      predictedGrade: null,
    }));
  const activeSubjectId: SubjectId | null = isSubjectId(settingsResult.data.active_subject_id)
    ? settingsResult.data.active_subject_id as SubjectId
    : selections[0]?.subjectId ?? null;

  const base = {
    activeSubjectId,
    examYear:
      typeof settingsResult.data.exam_year === "number"
        ? settingsResult.data.exam_year
        : null,
    selections,
  } satisfies SyncedCourseSettings;
  const rawExtension: unknown = settingsResult.data.study_plan;
  const extension = rawExtension && typeof rawExtension === "object" && !Array.isArray(rawExtension) ? rawExtension as Record<string, unknown> : null;
  if (!extension || typeof extension !== "object" || Array.isArray(extension)) return base;
  const rawPredicted = extension.predictedGrades;
  const predicted = rawPredicted && typeof rawPredicted === "object" && !Array.isArray(rawPredicted) ? rawPredicted as Record<string, unknown> : {};
  const plan = normaliseStudyPlan({
    ...extension, ...base,
    selections: selections.map((selection) => ({ ...selection, predictedGrade: predicted[selection.subjectId] })),
  });
  return { ...base, selections: plan.selections, studyPlan: plan } satisfies SyncedCourseSettings;
}

export async function saveRemoteCourseSettings(
  userId: string,
  settings: SyncedCourseSettings,
) {
  const client = requireSupabase();
  if (settings.selections.length > 0) {
    const { error } = await client.from("a_level_subject_selections").upsert(
      settings.selections.map((selection) => ({
        user_id: userId,
        subject_id: selection.subjectId,
        specification_id: selection.specificationId,
        target_grade: selection.targetGrade,
      })),
    );
    if (error) throw error;
  }

  const { data: existing, error: existingError } = await client
    .from("a_level_subject_selections")
    .select("subject_id")
    .eq("user_id", userId);
  if (existingError) throw existingError;
  const selectedIds = new Set(settings.selections.map((selection) => selection.subjectId));
  const removedIds = (existing ?? [])
    .map((row) => row.subject_id)
    .filter((subjectId) => !selectedIds.has(subjectId as SubjectId));
  if (removedIds.length > 0) {
    const { error } = await client
      .from("a_level_subject_selections")
      .delete()
      .eq("user_id", userId)
      .in("subject_id", removedIds);
    if (error) throw error;
  }

  // Write this marker last. If an account's first upload fails part-way through,
  // the next sign-in retries the local seed instead of accepting incomplete cloud data.
  const row = {
    user_id: userId,
    active_subject_id: settings.activeSubjectId,
    exam_year: settings.examYear,
  };
  const plan = settings.studyPlan;
  const extension = plan ? {
    schemaVersion: 2,
    qualificationLevel: plan.qualificationLevel,
    predictedGrades: Object.fromEntries(plan.selections.map((selection) => [selection.subjectId, selection.predictedGrade])),
    goals: plan.goals,
    studyPreferences: { ...plan.studyPreferences, notificationsEnabled: undefined },
    onboarding: plan.onboarding,
    updatedAt: plan.updatedAt,
  } : undefined;
  const settingsRow: typeof row & { study_plan?: typeof extension } = { ...row };
  if (extension) settingsRow.study_plan = extension;
  const { error: settingsError } = await client.from("a_level_user_settings").upsert(settingsRow);
  if (settingsError) {
    if (extension && ["42703", "PGRST204"].includes(settingsError.code) && settingsError.message.includes("study_plan")) {
      const legacy = await client.from("a_level_user_settings").upsert(row);
      if (legacy.error) throw legacy.error;
      throw new Error("Courses synced. New study settings are saved on this device until the study-plan database migration is deployed.");
    }
    throw settingsError;
  }
}
