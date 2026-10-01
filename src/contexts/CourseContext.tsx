import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { AppState } from "react-native";

import { useAccount } from "@/contexts/AccountContext";
import { normaliseStudyPlan, planValidation, type ReminderRuntime, type StudyPlan, type SubjectSelection } from "@/core/study-plan";
import { storageKey } from "@/product/config";
import type { QualificationLevel } from "@/product/qualification";
import type { SubjectId } from "@/product/subjects";
import { fetchRemoteCourseSettings, saveRemoteCourseSettings } from "@/services/course-sync";
import { requestStudyReminderPermission, syncStudyReminders } from "@/services/study-reminders";

export type { SubjectSelection } from "@/core/study-plan";
const SETTINGS_KEY = storageKey("course/settings/v1");
const EMPTY_RUNTIME: ReminderRuntime = { permission: "undetermined", scheduledIds: [], signature: null, error: null };
interface StoredSettings extends StudyPlan {
  reminderRuntime: ReminderRuntime;
  syncPending: boolean;
  syncOwner: string | null;
}
type PlanUpdate = (current: StudyPlan) => StudyPlan;
interface CourseContextValue extends StudyPlan {
  isHydrated: boolean;
  isSyncing: boolean;
  syncError: string | null;
  persistenceError: string | null;
  reminderRuntime: ReminderRuntime;
  isSchedulingReminders: boolean;
  updatePlan: (update: PlanUpdate) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  enableReminders: () => Promise<void>;
  retryReminders: () => void;
  setActiveSubject: (subjectId: SubjectId) => Promise<void>;
  setQualificationLevel: (level: QualificationLevel) => Promise<void>;
  saveSelections: (selections: SubjectSelection[], examYear: number | null) => Promise<void>;
}
const CourseContext = createContext<CourseContextValue | null>(null);
function storedSettings(value: unknown): StoredSettings {
  const candidate = value && typeof value === "object" ? value as Partial<StoredSettings> : {};
  return { ...normaliseStudyPlan(value), reminderRuntime: EMPTY_RUNTIME, syncPending: candidate.syncPending === true, syncOwner: typeof candidate.syncOwner === "string" ? candidate.syncOwner : null };
}
function message(error: unknown) { return error instanceof Error ? error.message : "Please try again."; }

export function CourseProvider({ children }: PropsWithChildren) {
  const { isLoading: isAccountLoading, session } = useAccount();
  const [settings, setSettings] = useState<StoredSettings>(() => storedSettings(null));
  const current = useRef(settings);
  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [restoredAccountId, setRestoredAccountId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [isSchedulingReminders, setIsSchedulingReminders] = useState(false);
  const [reminderRevision, setReminderRevision] = useState(0);
  const localWrites = useRef<Promise<void>>(Promise.resolve());
  const cloudWrites = useRef<Promise<void>>(Promise.resolve());
  const localVersion = useRef(0);
  const initialSync = useRef(false);
  const restoredSuccessfully = useRef(true);
  const replace = useCallback((next: StoredSettings) => { current.current = next; setSettings(next); }, []);
  const writeLocal = useCallback((next: StoredSettings) => {
    const job = localWrites.current.catch(() => undefined).then(() => {
      const latest = current.current;
      // A queued runtime/sync write must not restore an older plan revision.
      const nextTime = Date.parse(next.updatedAt ?? "") || 0;
      const latestTime = Date.parse(latest.updatedAt ?? "") || 0;
      const payload = nextTime > latestTime ? { ...next, reminderRuntime: latest.reminderRuntime } : latest;
      return AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    });
    localWrites.current = job;
    return job;
  }, []);
  const upload = useCallback(() => {
    const userId = sessionRef.current?.user.id;
    if (!userId || initialSync.current) return;
    cloudWrites.current = cloudWrites.current.catch(() => undefined).then(async () => {
      if (sessionRef.current?.user.id !== userId || !current.current.syncPending) return;
      const snapshot = current.current;
      setIsSyncing(true);
      try {
        await saveRemoteCourseSettings(userId, { ...snapshot, studyPlan: snapshot });
        if (sessionRef.current?.user.id !== userId) return;
        if (current.current.updatedAt === snapshot.updatedAt) {
          const next = { ...current.current, syncPending: false, syncOwner: userId };
          replace(next);
          await writeLocal(next);
        }
        setSyncError(null);
      } catch (error) { setSyncError(message(error)); }
      finally { setIsSyncing(false); }
    });
  }, [replace, writeLocal]);

  useEffect(() => {
    void AsyncStorage.getItem(SETTINGS_KEY).then((stored) => {
      if (stored) replace(storedSettings(JSON.parse(stored)));
    }).catch((error: unknown) => {
      restoredSuccessfully.current = false;
      setPersistenceError(`Could not restore your plan: ${message(error)}`);
    }).finally(() => setIsHydrated(true));
  }, [replace]);

  useEffect(() => {
    if (!isHydrated || isAccountLoading || !session) return;
    const userId = session.user.id;
    const version = localVersion.current;
    let active = true;
    initialSync.current = true;
    void Promise.resolve().then(() => {
      if (!active) return null;
      setIsSyncing(true);
      return fetchRemoteCourseSettings(userId);
    }).then(async (remote) => {
      if (!active) return;
      const local = current.current;
      if (localVersion.current !== version || (local.syncPending && (!local.syncOwner || local.syncOwner === userId))) return;
      if (remote) {
        const sameOwner = !local.syncOwner || local.syncOwner === userId;
        const base = remote.studyPlan ?? normaliseStudyPlan({ ...remote,
          ...(sameOwner ? { goals: local.goals, studyPreferences: local.studyPreferences, qualificationLevel: local.qualificationLevel } : {}),
          selections: remote.selections.map((selection) => ({ ...selection, predictedGrade: sameOwner ? local.selections.find((s) => s.subjectId === selection.subjectId)?.predictedGrade ?? null : null })),
        });
        const next: StoredSettings = { ...base, studyPreferences: { ...base.studyPreferences, notificationsEnabled: local.studyPreferences.notificationsEnabled }, reminderRuntime: local.reminderRuntime, syncPending: false, syncOwner: userId };
        await localWrites.current.catch(() => undefined);
        if (!active || localVersion.current !== version) return;
        replace(next);
        await writeLocal(next);
      } else { replace({ ...local, syncPending: true }); }
      setSyncError(null);
    }).catch((error: unknown) => { if (active) setSyncError(message(error)); }).finally(() => {
      if (active) { initialSync.current = false; setRestoredAccountId(userId); setIsSyncing(false); upload(); }
    });
    return () => { active = false; initialSync.current = false; };
    // A session refresh does not refetch and overwrite the plan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, isAccountLoading, session?.user.id, replace, upload, writeLocal]);

  const persistPlan = useCallback(async (update: PlanUpdate, publishAfterSave = false) => {
    if (!isHydrated) throw new Error("Your plan is still loading.");
    localVersion.current += 1;
    const previous = current.current;
    const now = Math.max(Date.now(), Date.parse(previous.updatedAt ?? "") + 1 || 0);
    const next: StoredSettings = { ...previous, ...normaliseStudyPlan(update(previous)), updatedAt: new Date(now).toISOString(), syncPending: true };
    if (!publishAfterSave) replace(next);
    try { await writeLocal(next); restoredSuccessfully.current = true; setPersistenceError(null); }
    catch (error) { setPersistenceError(`Your latest changes could not be saved: ${message(error)}`); throw error; }
    if (publishAfterSave) {
      if (current.current.updatedAt !== previous.updatedAt) throw new Error("Your plan changed while saving. Review it and try again.");
      replace({ ...next, reminderRuntime: current.current.reminderRuntime });
    }
    upload();
  }, [isHydrated, replace, upload, writeLocal]);
  const updatePlan = useCallback((update: PlanUpdate) => persistPlan(update), [persistPlan]);
  const preferencesKey = JSON.stringify(settings.studyPreferences);
  useEffect(() => {
    if (!isHydrated) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return null;
      setIsSchedulingReminders(true);
      return syncStudyReminders(current.current.studyPreferences);
    }).then(async (runtime) => {
      if (!active || !runtime) return;
      const next = { ...current.current, reminderRuntime: runtime };
      replace(next);
      // Retain the original stored payload if hydration failed; don't silently replace it.
      if (restoredSuccessfully.current) await writeLocal(next);
    }).catch((error: unknown) => {
      if (active) replace({ ...current.current, reminderRuntime: { ...current.current.reminderRuntime, signature: null, error: `Reminders could not be updated: ${message(error)}` } });
    }).finally(() => { if (active) setIsSchedulingReminders(false); });
    return () => { active = false; };
  }, [isHydrated, preferencesKey, reminderRevision, replace, writeLocal]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => { if (state === "active") { setReminderRevision((revision) => revision + 1); upload(); } });
    return () => subscription.remove();
  }, [upload]);
  const enableReminders = useCallback(async () => {
    const permission = await requestStudyReminderPermission();
    replace({ ...current.current, reminderRuntime: { ...current.current.reminderRuntime, permission } });
    await updatePlan((plan) => ({ ...plan, studyPreferences: { ...plan.studyPreferences, notificationsEnabled: permission === "granted" } }));
    setReminderRevision((revision) => revision + 1);
  }, [replace, updatePlan]);
  const completeOnboarding = useCallback(async () => {
    const error = planValidation(current.current);
    if (error) throw new Error(error);
    await persistPlan((plan) => ({ ...plan, onboarding: { step: "review", completed: true } }), true);
  }, [persistPlan]);
  const setActiveSubject = useCallback(async (subjectId: SubjectId) => {
    if (current.current.selections.some((selection) => selection.subjectId === subjectId)) await updatePlan((plan) => ({ ...plan, activeSubjectId: subjectId }));
  }, [updatePlan]);
  const setQualificationLevel = useCallback(async (qualificationLevel: QualificationLevel) => { await updatePlan((plan) => ({ ...plan, qualificationLevel })); }, [updatePlan]);
  const saveSelections = useCallback(async (selections: SubjectSelection[], examYear: number | null) => { await updatePlan((plan) => ({ ...plan, selections, examYear })); }, [updatePlan]);
  // First-launch routing also waits for an authenticated user's initial plan fetch.
  const ready = isHydrated && !isAccountLoading && (!session || restoredAccountId === session.user.id);
  const value = useMemo(() => ({ ...settings, isHydrated: ready, isSyncing, syncError, persistenceError, reminderRuntime: settings.reminderRuntime, isSchedulingReminders, updatePlan, completeOnboarding, enableReminders, retryReminders: () => setReminderRevision((revision) => revision + 1), setActiveSubject, setQualificationLevel, saveSelections }), [settings, ready, isSyncing, syncError, persistenceError, isSchedulingReminders, updatePlan, completeOnboarding, enableReminders, setActiveSubject, setQualificationLevel, saveSelections]);
  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}
export function useCourse() {
  const value = useContext(CourseContext);
  if (!value) throw new Error("useCourse must be used inside CourseProvider.");
  return value;
}
