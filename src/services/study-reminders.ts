import { Platform } from "react-native";

import { reconcileStudyReminders, STUDY_REMINDER_CATEGORY, type StudyReminderAdapter } from "@/core/study-reminders";
import type { ReminderPermission, ReminderRuntime, StudyPreferences } from "@/core/study-plan";

const CHANNEL = "ace-a-level-study";
let work: Promise<unknown> = Promise.resolve();
let handlerInstalled = false;
async function nativeNotifications() {
  return import("expo-notifications");
}
async function permissionStatus(request: boolean): Promise<ReminderPermission> {
  if (Platform.OS === "web") return "unavailable";
  try {
    const notifications = await nativeNotifications();
    // Creating a channel happens only on explicit opt-in or reconciliation of an opted-in plan.
    if (request && Platform.OS === "android") await notifications.setNotificationChannelAsync(CHANNEL, { name: "Study reminders", importance: notifications.AndroidImportance.DEFAULT });
    const current = await notifications.getPermissionsAsync();
    const result = request && !current.granted && current.canAskAgain
      ? await notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } }) : current;
    return result.granted || result.ios?.status === notifications.IosAuthorizationStatus.PROVISIONAL || result.ios?.status === notifications.IosAuthorizationStatus.EPHEMERAL
      ? "granted" : result.status === "denied" ? "denied" : "undetermined";
  } catch {
    return "unavailable";
  }
}
// This is the only permission-request entry point. UI invokes it after explicit consent.
export function requestStudyReminderPermission() { return permissionStatus(true); }

export function syncStudyReminders(preferences: StudyPreferences): Promise<ReminderRuntime> {
  const run = async (): Promise<ReminderRuntime> => {
    const permission = await permissionStatus(false);
    if (Platform.OS === "web" || permission === "unavailable") return { permission, scheduledIds: [], signature: null, error: preferences.notificationsEnabled ? "Study reminders are unavailable on this device." : null };
    const notifications = await nativeNotifications();
    if (!handlerInstalled) {
      notifications.setNotificationHandler({ handleNotification: async ({ request }) => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: request.content.data?.category !== STUDY_REMINDER_CATEGORY, shouldSetBadge: false }) });
      handlerInstalled = true;
    }
    if (preferences.notificationsEnabled && permission === "granted" && Platform.OS === "android") {
      await notifications.setNotificationChannelAsync(CHANNEL, { name: "Study reminders", importance: notifications.AndroidImportance.DEFAULT });
    }
    const adapter: StudyReminderAdapter = {
      permission: async () => permission,
      list: async () => (await notifications.getAllScheduledNotificationsAsync()).map((item) => ({ identifier: item.identifier, category: item.content.data?.category as string | undefined, signature: item.content.data?.signature as string | undefined })),
      cancel: (id) => notifications.cancelScheduledNotificationAsync(id),
      schedule: ({ identifier, weekday, hour, minute, signature }) => notifications.scheduleNotificationAsync({
        identifier,
        content: { title: "Ready for today’s Ace session?", body: "A little time for your A-level plan.", categoryIdentifier: STUDY_REMINDER_CATEGORY, data: { category: STUDY_REMINDER_CATEGORY, signature } },
        // Recurring calendar components follow local time rather than a fixed UTC interval.
        trigger: Platform.OS === "ios"
          ? { type: notifications.SchedulableTriggerInputTypes.CALENDAR, weekday, hour, minute, repeats: true }
          : { type: notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute, channelId: CHANNEL },
      }),
    };
    return reconcileStudyReminders(preferences, Intl.DateTimeFormat().resolvedOptions().timeZone, adapter);
  };
  const next = work.catch(() => undefined).then(run);
  work = next;
  return next;
}
