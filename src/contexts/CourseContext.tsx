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

const SETTINGS_KEY = storageKey("course/settings/v1");

export interface SubjectSelection {
  subjectId: SubjectId;
  specificationId: string | null;
  targetGrade: "A*" | "A" | "B" | "C" | "D" | "E" | null;
}

interface CourseSettings {
  activeSubjectId: SubjectId | null;
  examYear: number | null;
  selections: SubjectSelection[];
}

interface CourseContextValue extends CourseSettings {
  isHydrated: boolean;
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
  const [settings, setSettings] = useState<CourseSettings>(EMPTY_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((stored) => {
        if (stored) setSettings(normaliseSettings(JSON.parse(stored)));
      })
      .catch(() => setSettings(EMPTY_SETTINGS))
      .finally(() => setIsHydrated(true));
  }, []);

  const persist = useCallback(async (next: CourseSettings) => {
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }, []);

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
    () => ({ ...settings, isHydrated, saveSelections, setActiveSubject }),
    [isHydrated, saveSelections, setActiveSubject, settings],
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourse() {
  const value = useContext(CourseContext);
  if (!value) throw new Error("useCourse must be used inside CourseProvider.");
  return value;
}
