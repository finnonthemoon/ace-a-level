import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { storageKey } from "@/product/config";
import { SUBJECTS, type SubjectId } from "@/product/subjects";
import { useAccount } from "@/contexts/AccountContext";
import {
  fetchRemoteCourseSettings,
  saveRemoteCourseSettings,
  type SyncedCourseSettings,
  type TargetGrade,
} from "@/services/course-sync";

const SETTINGS_KEY = storageKey("course/settings/v1");

export interface SubjectSelection {
  subjectId: SubjectId;
  specificationId: string | null;
  targetGrade: TargetGrade | null;
}

interface CourseSettings extends SyncedCourseSettings {
  activeSubjectId: SubjectId | null;
  examYear: number | null;
  selections: SubjectSelection[];
}

interface CourseContextValue extends CourseSettings {
  isHydrated: boolean;
  isSyncing: boolean;
  syncError: string | null;
  setActiveSubject: (subjectId: SubjectId) => Promise<void>;
  saveSelections: (selections: SubjectSelection[], examYear: number | null) => Promise<void>;
}

const EMPTY_SETTINGS: CourseSettings = {
  activeSubjectId: null,
  examYear: null,
  selections: [],
};

const CourseContext = createContext<CourseContextValue | null>(null);

function isSubjectId(value: unknown): value is SubjectId {
  return typeof value === "string" && SUBJECTS.some((subject) => subject.id === value);
}

function normaliseSettings(value: unknown): CourseSettings {
  if (!value || typeof value !== "object") return EMPTY_SETTINGS;
  const candidate = value as Partial<CourseSettings>;
  const selections = Array.isArray(candidate.selections)
    ? candidate.selections.filter(
        (selection): selection is SubjectSelection =>
          Boolean(selection) &&
          typeof selection === "object" &&
          isSubjectId((selection as SubjectSelection).subjectId),
      )
    : [];
  const activeSubjectId = isSubjectId(candidate.activeSubjectId)
    ? candidate.activeSubjectId
    : selections[0]?.subjectId ?? null;

  return {
    activeSubjectId,
    examYear:
      typeof candidate.examYear === "number" && Number.isInteger(candidate.examYear)
        ? candidate.examYear
        : null,
    selections,
  };
}

export function CourseProvider({ children }: PropsWithChildren) {
  const { isLoading: isAccountLoading, session } = useAccount();
  const [settings, setSettings] = useState<CourseSettings>(EMPTY_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((stored) => {
        if (stored) setSettings(normaliseSettings(JSON.parse(stored)));
      })
      .catch(() => setSettings(EMPTY_SETTINGS))
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (!isHydrated || isAccountLoading || !session) return;
    let active = true;

    void Promise.resolve()
      .then(() => {
        if (!active) return null;
        setIsSyncing(true);
        setSyncError(null);
        return fetchRemoteCourseSettings(session.user.id);
      })
      .then(async (remote) => {
        if (!active) return;
        if (remote) {
          const next = normaliseSettings(remote);
          setSettings(next);
          await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        } else {
          await saveRemoteCourseSettings(session.user.id, settings);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setSyncError(error instanceof Error ? error.message : "Course sync failed.");
        }
      })
      .finally(() => {
        if (active) setIsSyncing(false);
      });

    return () => {
      active = false;
    };
    // Sync once for each authenticated user. Local edits are uploaded by persist.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAccountLoading, isHydrated, session?.user.id]);

  const persist = useCallback(async (next: CourseSettings) => {
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    if (session) {
      setIsSyncing(true);
      setSyncError(null);
      try {
        await saveRemoteCourseSettings(session.user.id, next);
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : "Course sync failed.");
      } finally {
        setIsSyncing(false);
      }
    }
  }, [session]);

  const setActiveSubject = useCallback(
    async (subjectId: SubjectId) => {
      if (!settings.selections.some((selection) => selection.subjectId === subjectId)) return;
      await persist({ ...settings, activeSubjectId: subjectId });
    },
    [persist, settings],
  );

  const saveSelections = useCallback(
    async (selections: SubjectSelection[], examYear: number | null) => {
      const activeSubjectId = selections.some(
        (selection) => selection.subjectId === settings.activeSubjectId,
      )
        ? settings.activeSubjectId
        : selections[0]?.subjectId ?? null;
      await persist({ activeSubjectId, examYear, selections });
    },
    [persist, settings.activeSubjectId],
  );

  const value = useMemo(
    () => ({ ...settings, isHydrated, isSyncing, syncError, saveSelections, setActiveSubject }),
    [isHydrated, isSyncing, saveSelections, setActiveSubject, settings, syncError],
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourse() {
  const value = useContext(CourseContext);
  if (!value) throw new Error("useCourse must be used inside CourseProvider.");
  return value;
}
