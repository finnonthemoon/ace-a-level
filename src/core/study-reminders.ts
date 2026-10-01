import { reminderEntries, type ReminderPermission, type ReminderRuntime, type StudyPreferences } from "./study-plan";

export const STUDY_REMINDER_CATEGORY = "ace-a-level.study-reminder.v1";
export const STUDY_REMINDER_PREFIX = "ace-a-level-study-v1-";
export interface ScheduledStudyNotification {
  identifier: string;
  category?: string;
  signature?: string;
}
export interface StudyReminderAdapter {
  permission: () => Promise<ReminderPermission>;
  list: () => Promise<ScheduledStudyNotification[]>;
  cancel: (identifier: string) => Promise<void>;
  schedule: (entry: { identifier: string; weekday: number; hour: number; minute: number; signature: string }) => Promise<string>;
}
export function ownsStudyReminder(item: ScheduledStudyNotification) {
  return item.identifier.startsWith(STUDY_REMINDER_PREFIX) && item.category === STUDY_REMINDER_CATEGORY;
}
export function studyReminderSignature(preferences: StudyPreferences, timezone: string) {
  return JSON.stringify({ enabled: preferences.notificationsEnabled, entries: reminderEntries(preferences), timezone });
}
// Callers serialize reconciliation. List the OS queue rather than trusting a possibly stale ledger.
export async function reconcileStudyReminders(preferences: StudyPreferences, timezone: string, adapter: StudyReminderAdapter): Promise<ReminderRuntime> {
  const permission = await adapter.permission();
  if (permission === "unavailable") return { permission, scheduledIds: [], signature: null, error: preferences.notificationsEnabled ? "Study reminders are unavailable on this device." : null };
  const signature = studyReminderSignature(preferences, timezone);
  const own = (await adapter.list()).filter(ownsStudyReminder);
  const entries = preferences.notificationsEnabled && permission === "granted" ? reminderEntries(preferences) : [];
  const expectedIds = entries.map((entry) => `${STUDY_REMINDER_PREFIX}${entry.day}`);
  if (own.length === expectedIds.length && own.every((item) => expectedIds.includes(item.identifier) && item.signature === signature)) {
    return { permission, scheduledIds: own.map((item) => item.identifier), signature, error: null };
  }
  // Cancel only this category, including leftovers from an interrupted scheduling attempt.
  for (const item of own) await adapter.cancel(item.identifier);
  const scheduledIds: string[] = [];
  try {
    for (const entry of entries) {
      const weekday = { sun: 1, mon: 2, tue: 3, wed: 4, thu: 5, fri: 6, sat: 7 }[entry.day];
      scheduledIds.push(await adapter.schedule({ identifier: `${STUDY_REMINDER_PREFIX}${entry.day}`, weekday, hour: Math.floor(entry.minutes / 60), minute: entry.minutes % 60, signature }));
    }
    return { permission, scheduledIds, signature, error: null };
  } catch (error) {
    // Leave no partial new schedule. Retry can safely reconstruct from the OS queue.
    for (const id of scheduledIds) await adapter.cancel(id);
    throw error;
  }
}
