import { requireSupabase } from "@/lib/supabase";
import { SUBJECTS, type SubjectId } from "@/product/subjects";

export type TargetGrade = "A*" | "A" | "B" | "C" | "D" | "E";

export interface SyncedSubjectSelection {
  subjectId: SubjectId;
  specificationId: string | null;
  targetGrade: TargetGrade | null;
}

export interface SyncedCourseSettings {
  activeSubjectId: SubjectId | null;
  examYear: number | null;
  selections: SyncedSubjectSelection[];
}

function isSubjectId(value: unknown): value is SubjectId {
  return typeof value === "string" && SUBJECTS.some((subject) => subject.id === value);
}

function isTargetGrade(value: unknown): value is TargetGrade {
  return ["A*", "A", "B", "C", "D", "E"].includes(String(value));
}

export async function fetchRemoteCourseSettings(userId: string) {
  const client = requireSupabase();
  const [settingsResult, selectionsResult] = await Promise.all([
    client
      .from("a_level_user_settings")
      .select("active_subject_id, exam_year")
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
      targetGrade: isTargetGrade(row.target_grade) ? row.target_grade : null,
    }));
  const activeSubjectId = isSubjectId(settingsResult.data.active_subject_id)
    ? settingsResult.data.active_subject_id
    : selections[0]?.subjectId ?? null;

  return {
    activeSubjectId,
    examYear:
      typeof settingsResult.data.exam_year === "number"
        ? settingsResult.data.exam_year
        : null,
    selections,
  } satisfies SyncedCourseSettings;
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
  const { error: settingsError } = await client.from("a_level_user_settings").upsert({
    user_id: userId,
    active_subject_id: settings.activeSubjectId,
    exam_year: settings.examYear,
  });
  if (settingsError) throw settingsError;
}
