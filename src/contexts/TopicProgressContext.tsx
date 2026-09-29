import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { storageKey } from "@/product/config";

const PROGRESS_KEY = storageKey("learning/topic-progress/v1");

export interface TopicProgressRecord {
  completedLessonIds: string[];
  questionsAttempted: number;
  questionsCorrect: number;
  completedPracticeSessionIds: string[];
}

type ProgressState = Record<string, TopicProgressRecord>;

interface TopicProgressContextValue {
  isHydrated: boolean;
  getProgress: (topicId: string) => TopicProgressRecord;
  completeLesson: (topicId: string, lessonId: string) => Promise<void>;
  recordQuestionAttempt: (topicId: string, questionId: string, correct: boolean) => Promise<void>;
  completePracticeSession: (topicId: string, sessionId: string) => Promise<void>;
}

const EMPTY_RECORD: TopicProgressRecord = {
  completedLessonIds: [],
  questionsAttempted: 0,
  questionsCorrect: 0,
  completedPracticeSessionIds: [],
};

const TopicProgressContext = createContext<TopicProgressContextValue | null>(null);

function normaliseProgress(value: unknown): ProgressState {
  if (!value || typeof value !== "object") return {};
  const result: ProgressState = {};
  for (const [topicId, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object") continue;
    const record = raw as Partial<TopicProgressRecord>;
    result[topicId] = {
      completedLessonIds: Array.isArray(record.completedLessonIds)
        ? record.completedLessonIds.filter((item): item is string => typeof item === "string")
        : [],
      questionsAttempted: Number.isInteger(record.questionsAttempted) ? Math.max(0, record.questionsAttempted!) : 0,
      questionsCorrect: Number.isInteger(record.questionsCorrect) ? Math.max(0, record.questionsCorrect!) : 0,
      completedPracticeSessionIds: Array.isArray(record.completedPracticeSessionIds)
        ? record.completedPracticeSessionIds.filter((item): item is string => typeof item === "string")
        : [],
    };
  }
  return result;
}

export function TopicProgressProvider({ children }: PropsWithChildren) {
  const [progress, setProgress] = useState<ProgressState>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const progressRef = useRef<ProgressState>({});
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(PROGRESS_KEY)
      .then((stored) => {
        if (!active || !stored) return;
        const next = normaliseProgress(JSON.parse(stored));
        progressRef.current = next;
        setProgress(next);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsHydrated(true);
      });
    return () => { active = false; };
  }, []);

  const updateRecord = useCallback(async (topicId: string, update: (record: TopicProgressRecord) => TopicProgressRecord) => {
    const current = progressRef.current[topicId] ?? EMPTY_RECORD;
    const next = { ...progressRef.current, [topicId]: update(current) };
    progressRef.current = next;
    setProgress(next);
    writeQueueRef.current = writeQueueRef.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next)));
    await writeQueueRef.current;
  }, []);

  const completeLesson = useCallback((topicId: string, lessonId: string) => updateRecord(topicId, (record) => ({
    ...record,
    completedLessonIds: record.completedLessonIds.includes(lessonId)
      ? record.completedLessonIds
      : [...record.completedLessonIds, lessonId],
  })), [updateRecord]);

  const recordQuestionAttempt = useCallback((topicId: string, _questionId: string, correct: boolean) => updateRecord(topicId, (record) => ({
    ...record,
    questionsAttempted: record.questionsAttempted + 1,
    questionsCorrect: record.questionsCorrect + (correct ? 1 : 0),
  })), [updateRecord]);

  const completePracticeSession = useCallback((topicId: string, sessionId: string) => updateRecord(topicId, (record) => ({
    ...record,
    completedPracticeSessionIds: record.completedPracticeSessionIds.includes(sessionId)
      ? record.completedPracticeSessionIds
      : [...record.completedPracticeSessionIds, sessionId],
  })), [updateRecord]);

  const getProgress = useCallback((topicId: string) => progress[topicId] ?? EMPTY_RECORD, [progress]);
  const value = useMemo(() => ({
    isHydrated,
    getProgress,
    completeLesson,
    recordQuestionAttempt,
    completePracticeSession,
  }), [completeLesson, completePracticeSession, getProgress, isHydrated, recordQuestionAttempt]);

  return <TopicProgressContext.Provider value={value}>{children}</TopicProgressContext.Provider>;
}

export function useTopicProgress() {
  const context = useContext(TopicProgressContext);
  if (!context) throw new Error("useTopicProgress must be used within TopicProgressProvider.");
  return context;
}
