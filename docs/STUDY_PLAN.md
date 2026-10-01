# Onboarding and study plan

`CourseContext` owns the single study plan. Onboarding, its Edit Plan mode, Profile, course sync and local reminders all consume it. `core/study-plan.ts` defines version 2, validation, catalogue lookup and migration. AsyncStorage continues using the existing `@ace-a-level/course/settings/v1` key; the payload version changes, not the namespace. Lesson and topic progress keys are untouched.

## Flow and editing

Welcome → exam year → subjects → specifications → predicted/target grades → personal goals → weekly minutes and number of days → chosen days → reminder times → notification explanation and explicit opt-in → star introduction → review and Start learning.

Every answer and the new user's current step save incrementally. Android hardware back moves to the previous step, closes a selector first, or allows leaving the app at welcome. Only the final action sets completion. Profile and Home Edit Plan reopen the same controls at review; Profile Study Goal opens at the weekly target, and notification status opens at permission settings. Edits save as you go, including when closing the editor. Add another subject before removing your last one.

The documented product rule of **3–5 subjects for a new plan** remains in force. An existing one- or two-subject plan loads as completed and can be edited without being forced to add subjects. New one-subject drafts are retained but cannot complete. No three-subject default or fabricated board is assigned. Subject choices come from `SUBJECTS`; specifications come from `COURSE_CATALOG` filtered by subject and qualification. At present only OCR MEI Mathematics B is available. Other subjects remain in the academic plan with their specification unset. Historical specification IDs are preserved if no longer available. Grades independently accept A*, A, B, C, D, E or null.

Exam years are generated from the local calendar year and retain a previously chosen year even outside the upcoming options. Weekly targets are stored in minutes, with presets and a custom range of 15–10,080 minutes. Selected study days are authoritative: the day count is always their length. Multiple personal goals are optional. Diagnostic routes currently show preparation screens, so onboarding offers no fake diagnostic launch or scoring and completion is never blocked by diagnostics.

## Persistence and cloud migration

Legacy payloads with selections and no v2 completion field migrate as completed. Explicit v2 drafts stay incomplete, even with selected courses. Grades, selections, qualification and unknown historical specification IDs survive normalisation. Safe defaults add three hours per week, Monday/Wednesday/Friday and 18:00, with reminders off.

Local writes and cloud uploads are separately serialized. A failed upload leaves a persisted pending marker and visible sync error; retries occur on edits, sign-in and foregrounding. Pending local changes and edits made while sign-in is fetching a plan are not replaced by that fetch. First-launch routing waits for local storage and an authenticated user's initial plan fetch, so a returning account on a new device is not sent through new-user onboarding. Supabase's existing course columns remain authoritative for subjects, specification, target grade, exam year and active subject.

`supabase/migrations/20261001000000_a_level_study_plan.sql` adds a nullable `study_plan` JSON object to `a_level_user_settings` for predicted grades, goals, qualification, study preferences and onboarding metadata. Copy it into the **canonical shared backend migration history** and deploy from there. It was not deployed by this task. No TMUA tables or policies change. Reads work on the legacy schema; if the new column is absent, writes fall back to syncing course columns and report that the new fields are local until migration. This is a compatibility fallback, not a claim of full cross-device sync before deployment.

## Reminders

`services/study-reminders.ts` uses the existing Expo Notifications dependency, following the [SDK 57 documentation](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/). No push tokens, notification service, new dependency or exact-alarm permission is required. Android's existing notifications plugin supplies the native permissions; the installed SDK falls back to inexact alarms when exact alarms are unavailable. OS power management can delay delivery.

Permission is requested only from the explicit **Turn on reminders** action, after showing the proposed schedule. Denied, undetermined and unavailable permission leave the app usable; users can decline, retry or open OS settings. Foregrounding refreshes permission, timezone and pending sync. OS permission, device opt-in, scheduled identifiers and schedule error are local; restoring a cloud plan cannot silently opt another device in.

Times are local wall-clock minutes after midnight. Android uses repeating weekly triggers and iOS repeating calendar components. Day overrides can specify a separate time or null for no reminder. A dedicated `ace-a-level-study` Android channel, `ace-a-level.study-reminder.v1` category/data tag and deterministic `ace-a-level-study-v1-<day>` identifiers distinguish these reminders. Reconciliation lists the OS queue, cancels only notifications matching both the category and ID namespace, and avoids recreating an unchanged schedule. Removing a day, disabling reminders or changing times/timezone replaces obsolete requests. The OS queue also recovers orphaned requests after an interrupted app run. A failed replacement cleans up the successfully scheduled portion and surfaces an error for retry. No unrelated scheduled notification is cancelled.

## Progression and future plans

All five existing star images are reused. `MascotContext.progression.mode` is explicitly `preview`; no activity is generated. The existing Profile stage selector remains a visual preview. `core/mascot-progression.ts` defines measured weekly evidence against that historical week's own minutes/day goals, conceptual stages and future emotion types. No alternate expression artwork exists, so no expression paths are invented. Automatic stages and thresholds await robust study-time measurement and a reviewed progression policy. `PersonalisedWeekPlan` provides typed qualification/subject/specification/content identities for future recommendations, with no sample plan or recommendation engine.

## Validation

Run `npm run typecheck`, `npm run lint`, `npm run validate:catalog`, `npm run test:study-plan`, `npm run web:export` and `git diff --check`. The 19 Node tests execute the actual TypeScript models, reconciler and course-sync service with isolated notification/database adapters, plus CourseProvider in an in-memory hook host with storage/account/native boundaries stubbed. They cover new and legacy plans, partial restoration, completed restarts, grades, unavailable boards, dynamic years, malformed persisted fields, accepted/denied/unavailable permission, schedule edits, removed days, timezone changes, interrupted scheduling, category isolation, mascot preview and the legacy-cloud fallback. Provider tests also verify rapid updates, real incremental storage/restoration, permission only on an explicit action, stale-fetch protection and storage failure during completion. Completion publishes only after a successful local save; queued runtime writes cannot restore an older plan revision.

UI automation could not be completed: the in-app browser timed out, and Windows computer-use ended because it could not confidently identify the current browser URL. Native notification permission dialogs, actual delivery, hardware-back interaction and rendered phone layouts still need device verification. Automated permission cases use a fake native adapter, not an OS dialog. No live Supabase account was modified during validation.

## Changed files

- Flow and navigation: `src/app/onboarding.tsx`, `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/index.tsx`.
- Shared controls and review: `src/components/study-plan/PlanControls.tsx`, `src/components/study-plan/StudyPlanSummary.tsx`.
- Profile and state: `src/app/(tabs)/profile.tsx`, `src/contexts/CourseContext.tsx`, `src/contexts/MascotContext.tsx`.
- Plan, scheduling and progression models: `src/core/study-plan.ts`, `src/core/study-reminders.ts`, `src/core/mascot-progression.ts`.
- Native reminder adapter and cloud sync: `src/services/study-reminders.ts`, `src/services/course-sync.ts`.
- Additive database draft: `supabase/migrations/20261001000000_a_level_study_plan.sql`.
- Verification: `scripts/test-study-plan.mjs`, `package.json`.
- Documentation: `README.md`, `docs/PROJECT_CONTEXT.md`, `docs/SHARED_SERVICES_SETUP.md`, `docs/STUDY_PLAN.md`.

Lesson content, player layout, roadmap, knowledge checks, practice architecture, TopicProgressContext and authentication implementation are unchanged. No commit was created.
