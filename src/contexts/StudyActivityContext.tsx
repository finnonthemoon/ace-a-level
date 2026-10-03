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
import { AppState } from "react-native";

import { storageKey } from "@/product/config";

const ACTIVITY_KEY = storageKey("learning/study-activity/v1");
const FLUSH_INTERVAL_MS = 15_000;

type ActivityByDate = Record<string, number>;

interface StudyActivityContextValue {
  isHydrated: boolean;
  todaySeconds: number;
  streakDays: number;
  startStudySession: () => () => void;
}

const StudyActivityContext = createContext<StudyActivityContextValue | null>(null);

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseActivity(value: string | null): ActivityByDate {
  if (!value) return {};
  try {
    const candidate = JSON.parse(value) as unknown;
    if (!candidate || typeof candidate !== "object") return {};
    return Object.fromEntries(Object.entries(candidate).flatMap(([date, seconds]) =>
      /^\d{4}-\d{2}-\d{2}$/.test(date) && typeof seconds === "number" && Number.isFinite(seconds) && seconds >= 0
        ? [[date, Math.floor(seconds)]]
        : [],
    ));
  } catch {
    return {};
  }
}

function calculateStreak(activity: ActivityByDate, now = new Date()) {
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!(activity[localDateKey(cursor)] > 0)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (activity[localDateKey(cursor)] > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function StudyActivityProvider({ children }: PropsWithChildren) {
  const [activity, setActivity] = useState<ActivityByDate>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const activityRef = useRef<ActivityByDate>({});
  const sessionCount = useRef(0);
  const lastTick = useRef<number | null>(null);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  const addElapsedTime = useCallback(() => {
    const startedAt = lastTick.current;
    if (startedAt === null) return;
    const now = Date.now();
    lastTick.current = now;
    const elapsedSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
    if (elapsedSeconds === 0) return;
    const date = localDateKey();
    const next = { ...activityRef.current, [date]: (activityRef.current[date] ?? 0) + elapsedSeconds };
    activityRef.current = next;
    setActivity(next);
    writeQueue.current = writeQueue.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(next)));
  }, []);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(ACTIVITY_KEY)
      .then((stored) => {
        if (!active) return;
        const next = parseActivity(stored);
        activityRef.current = next;
        setActivity(next);
      })
      .catch(() => undefined)
      .finally(() => { if (active) setIsHydrated(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionCount.current > 0 && AppState.currentState === "active") addElapsedTime();
    }, FLUSH_INTERVAL_MS);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && sessionCount.current > 0) lastTick.current = Date.now();
      else if (lastTick.current !== null) {
        addElapsedTime();
        lastTick.current = null;
      }
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [addElapsedTime]);

  const startStudySession = useCallback(() => {
    sessionCount.current += 1;
    if (sessionCount.current === 1 && AppState.currentState === "active") lastTick.current = Date.now();
    let stopped = false;
    return () => {
      if (stopped) return;
      stopped = true;
      sessionCount.current = Math.max(0, sessionCount.current - 1);
      if (sessionCount.current === 0) {
        addElapsedTime();
        lastTick.current = null;
      }
    };
  }, [addElapsedTime]);

  const todaySeconds = activity[localDateKey()] ?? 0;
  const value = useMemo(() => ({
    isHydrated,
    todaySeconds,
    streakDays: calculateStreak(activity),
    startStudySession,
  }), [activity, isHydrated, startStudySession, todaySeconds]);

  return <StudyActivityContext.Provider value={value}>{children}</StudyActivityContext.Provider>;
}

export function useStudyActivity() {
  const context = useContext(StudyActivityContext);
  if (!context) throw new Error("useStudyActivity must be used within StudyActivityProvider.");
  return context;
}
