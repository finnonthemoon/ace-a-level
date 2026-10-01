import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { test } from "node:test";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
// Execute the real TypeScript modules without introducing a test runtime dependency.
function sourceLoader(mocks = {}) {
  const cache = new Map();
  function load(id, parent = root) {
    if (id in mocks) return mocks[id];
    let filename = id.startsWith("@/") ? path.join(root, "src", id.slice(2)) : path.resolve(parent, id);
    if (!fs.existsSync(filename)) filename += fs.existsSync(`${filename}.ts`) ? ".ts" : ".tsx";
    if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const localRequire = (dependency) => dependency in mocks ? mocks[dependency] : dependency.startsWith(".") || dependency.startsWith("@/") ? load(dependency, path.dirname(filename)) : require(dependency);
    vm.runInThisContext(`(function(require, module, exports) { ${code}\n})`, { filename })(localRequire, module, module.exports);
    return module.exports;
  }
  return load;
}
const load = sourceLoader();
const plan = load("@/core/study-plan");
const reminders = load("@/core/study-reminders");
const selection = (subjectId, predictedGrade = null, targetGrade = null) => ({ subjectId, specificationId: null, predictedGrade, targetGrade });
function newPlan() { return { ...plan.emptyStudyPlan(), selections: [selection("mathematics"), selection("physics"), selection("chemistry")] }; }

test("new users and partial drafts remain incomplete through JSON persistence", () => {
  assert.equal(plan.emptyStudyPlan().onboarding.completed, false);
  const draft = { ...newPlan(), examYear: 2028, goals: ["grades", "habit"], onboarding: { completed: false, step: "times" } };
  const restored = plan.normaliseStudyPlan(JSON.parse(JSON.stringify(draft)));
  assert.deepEqual(restored.onboarding, draft.onboarding);
  assert.deepEqual(restored.selections, draft.selections);
  assert.deepEqual(restored.goals, draft.goals);
  assert.equal(restored.examYear, 2028);
});
test("legacy users migrate as complete without dropping courses, unknown IDs, grades or qualification", () => {
  const legacy = { selections: [{ subjectId: "mathematics", specificationId: "historic-spec", targetGrade: "A*" }], examYear: 2027, qualificationLevel: "as", activeSubjectId: "mathematics" };
  const migrated = plan.normaliseStudyPlan(legacy);
  assert.equal(migrated.onboarding.completed, true);
  assert.equal(migrated.selections[0].specificationId, "historic-spec");
  assert.equal(migrated.selections[0].targetGrade, "A*");
  assert.equal(migrated.selections[0].predictedGrade, null);
  assert.equal(migrated.qualificationLevel, "as");
  assert.equal(plan.planValidation(migrated), null);
  assert.equal(migrated.studyPreferences.notificationsEnabled, false);
});
test("explicit 3–5 product rule applies to new plans; one-subject legacy plans remain editable", () => {
  const draft = { ...newPlan(), selections: [selection("mathematics")] };
  assert.match(plan.planValidation(draft), /3–5/);
  assert.equal(plan.planValidation({ ...draft, onboarding: { step: "review", completed: true } }), null);
  assert.equal(plan.planValidation(newPlan()), null);
});
test("unset and equal predicted/target grades, absent boards and real specifications", () => {
  const value = plan.normaliseStudyPlan({ ...newPlan(), selections: [selection("mathematics", "A", "A"), selection("physics")] });
  assert.equal(value.selections[0].predictedGrade, value.selections[0].targetGrade);
  assert.equal(value.selections[1].targetGrade, null);
  assert.equal(plan.specificationLabel(value.selections[1]), "Board not set");
  assert.equal(plan.specificationsForSubject("mathematics", "a-level")[0].id, "ocr-mei-mathematics-b");
  assert.equal(plan.specificationsForSubject("physics", "a-level").length, 0);
});
test("years are dynamic and retain a saved value outside the offered upcoming years", () => {
  assert.deepEqual(plan.upcomingExamYears(2027, new Date(2030, 9, 1)), [2027, 2031, 2032, 2033]);
});
test("malformed persistence is normalised and active subjects cannot point outside selections", () => {
  const value = plan.normaliseStudyPlan({ schemaVersion: 2, selections: [selection("physics", "Z", "A"), selection("physics"), selection("unknown")], activeSubjectId: "chemistry", studyPreferences: { weeklyTargetMinutes: -2, selectedStudyDays: ["mon", "mon", "invalid"], reminders: { defaultTimeMinutes: 9999, dayOverrides: { mon: null, tue: 1440 } } } });
  assert.equal(value.selections.length, 1);
  assert.equal(value.activeSubjectId, "physics");
  assert.equal(value.selections[0].predictedGrade, null);
  assert.equal(value.onboarding.completed, false);
  assert.equal(value.studyPreferences.weeklyTargetMinutes, 180);
  assert.equal(value.studyPreferences.targetDaysPerWeek, 1);
  assert.equal(value.studyPreferences.reminders.defaultTimeMinutes, 1080);
  assert.deepEqual(value.studyPreferences.reminders.dayOverrides, { mon: null });
});

function notificationHarness(permission = "granted") {
  const queue = new Map([["unrelated", { identifier: "unrelated", category: "other" }]]);
  const calls = { schedules: [], cancelled: [] };
  const adapter = {
    permission: async () => permission,
    list: async () => [...queue.values()],
    cancel: async (id) => { calls.cancelled.push(id); queue.delete(id); },
    schedule: async (entry) => { calls.schedules.push(entry); queue.set(entry.identifier, { ...entry, category: reminders.STUDY_REMINDER_CATEGORY }); return entry.identifier; },
  };
  return { queue, calls, adapter };
}
test("accepted reminders schedule local weekday/time components and reconciliation is idempotent", async () => {
  const prefs = { ...plan.defaultStudyPreferences(), notificationsEnabled: true };
  const h = notificationHarness();
  const runtime = await reminders.reconcileStudyReminders(prefs, "Europe/London", h.adapter);
  assert.equal(runtime.scheduledIds.length, 3);
  assert.equal(h.calls.schedules[0].weekday, 2);
  assert.equal(h.calls.schedules[0].hour, 18);
  assert.equal(h.calls.schedules[0].minute, 0);
  await reminders.reconcileStudyReminders(prefs, "Europe/London", h.adapter);
  assert.equal(h.calls.schedules.length, 3);
  assert.equal(h.calls.cancelled.length, 0);
});
test("changed time, removed day and per-day opt-out cancel old reminders while preserving other categories", async () => {
  const prefs = { ...plan.defaultStudyPreferences(), notificationsEnabled: true };
  const h = notificationHarness();
  await reminders.reconcileStudyReminders(prefs, "Europe/London", h.adapter);
  const changed = { ...prefs, selectedStudyDays: ["mon", "wed"], reminders: { defaultTimeMinutes: 660, dayOverrides: { wed: null } } };
  const runtime = await reminders.reconcileStudyReminders(changed, "Europe/London", h.adapter);
  assert.equal(runtime.scheduledIds.length, 1);
  assert.equal(h.calls.schedules.at(-1).hour, 11);
  assert.equal(h.calls.cancelled.length, 3);
  assert.equal(h.queue.size, 2);
  assert.ok(h.queue.has("unrelated"));
});
test("denial, disabling and unavailable permission never create reminders or cancel unrelated entries", async () => {
  for (const permission of ["denied", "undetermined", "unavailable"]) {
    const h = notificationHarness(permission);
    const runtime = await reminders.reconcileStudyReminders({ ...plan.defaultStudyPreferences(), notificationsEnabled: true }, "Europe/London", h.adapter);
    assert.equal(runtime.scheduledIds.length, 0);
    assert.equal(h.calls.schedules.length, 0);
    assert.ok(h.queue.has("unrelated"));
  }
  const h = notificationHarness();
  await reminders.reconcileStudyReminders({ ...plan.defaultStudyPreferences(), notificationsEnabled: true }, "Europe/London", h.adapter);
  await reminders.reconcileStudyReminders(plan.defaultStudyPreferences(), "Europe/London", h.adapter);
  assert.equal(h.queue.size, 1);
});
test("timezone changes reconcile the schedule and interrupted scheduling can be retried without duplicates", async () => {
  const prefs = { ...plan.defaultStudyPreferences(), notificationsEnabled: true };
  const h = notificationHarness();
  await reminders.reconcileStudyReminders(prefs, "Europe/London", h.adapter);
  await reminders.reconcileStudyReminders(prefs, "Europe/Paris", h.adapter);
  assert.equal(h.calls.schedules.length, 6);
  const original = h.adapter.schedule;
  let count = 0;
  h.adapter.schedule = async (entry) => { if (++count === 2) throw new Error("Native scheduling failed"); return original(entry); };
  await assert.rejects(reminders.reconcileStudyReminders(prefs, "America/New_York", h.adapter), /Native/);
  assert.equal(h.queue.size, 1);
  h.adapter.schedule = original;
  await reminders.reconcileStudyReminders(prefs, "America/New_York", h.adapter);
  assert.equal(h.queue.size, 4);
});
test("onboarding completion and schedule values survive a restart", () => {
  const completed = { ...newPlan(), onboarding: { step: "review", completed: true }, studyPreferences: { ...plan.defaultStudyPreferences(), weeklyTargetMinutes: 300, selectedStudyDays: ["mon", "sun"], reminders: { defaultTimeMinutes: 1080, dayOverrides: { sun: 660 } } } };
  const restored = plan.normaliseStudyPlan(JSON.parse(JSON.stringify(completed)));
  assert.equal(restored.onboarding.completed, true);
  assert.equal(restored.studyPreferences.weeklyTargetMinutes, 300);
  assert.equal(restored.studyPreferences.targetDaysPerWeek, 2);
  assert.deepEqual(plan.reminderEntries(restored.studyPreferences), [{ day: "mon", minutes: 1080 }, { day: "sun", minutes: 660 }]);
});
test("mascot remains explicit preview with no invented activity or thresholds", () => {
  const mascot = load("@/core/mascot-progression");
  assert.deepEqual(mascot.MASCOT_PROGRESSION_FOUNDATION, { mode: "preview", evidence: null, emotion: "calm" });
});

function databaseHarness({ missingColumn = false, extension = null } = {}) {
  const writes = [];
  const client = { from(table) {
    const query = {
      select() { return query; }, eq() { return query; },
      maybeSingle: async () => ({ data: { active_subject_id: "mathematics", exam_year: 2028, study_plan: extension }, error: null }),
      then(resolve) { return Promise.resolve({ data: table === "a_level_subject_selections" ? [{ subject_id: "mathematics", specification_id: "ocr-mei-mathematics-b", target_grade: "A" }] : [], error: null }).then(resolve); },
      upsert: async (value) => { writes.push({ table, value }); return { error: missingColumn && value.study_plan ? { code: "PGRST204", message: "Missing study_plan column" } : null }; },
      delete() { return query; }, in() { return query; },
    };
    return query;
  } };
  const sync = sourceLoader({ "@/lib/supabase": { requireSupabase: () => client } })("@/services/course-sync");
  return { sync, writes };
}
test("cloud extension restores predicted grades and preferences without enabling device notifications", async () => {
  const h = databaseHarness({ extension: { schemaVersion: 2, predictedGrades: { mathematics: "B" }, goals: ["exams"], studyPreferences: { ...plan.defaultStudyPreferences(), weeklyTargetMinutes: 420, notificationsEnabled: undefined }, onboarding: { step: "review", completed: true } } });
  const remote = await h.sync.fetchRemoteCourseSettings("test-user");
  assert.equal(remote.selections[0].predictedGrade, "B");
  assert.equal(remote.studyPlan.studyPreferences.weeklyTargetMinutes, 420);
  assert.equal(remote.studyPlan.studyPreferences.notificationsEnabled, false);
  assert.equal(remote.selections[0].specificationId, "ocr-mei-mathematics-b");
  const local = { ...newPlan(), studyPreferences: { ...plan.defaultStudyPreferences(), notificationsEnabled: true } };
  await h.sync.saveRemoteCourseSettings("test-user", { ...local, studyPlan: local });
  assert.equal(h.writes.at(-1).value.study_plan.studyPreferences.notificationsEnabled, undefined);
  assert.ok(h.writes.every((write) => write.table.startsWith("a_level_")));
});
test("an undeployed cloud extension preserves legacy course sync and reports local-only new fields", async () => {
  const h = databaseHarness({ missingColumn: true });
  const local = newPlan();
  await assert.rejects(h.sync.saveRemoteCourseSettings("test-user", { ...local, studyPlan: local }), /saved on this device/);
  assert.equal(h.writes.at(-1).value.study_plan, undefined);
  assert.equal(h.writes.at(-1).value.exam_year, local.examYear);
});

// An in-memory hook host runs the actual CourseProvider and its effects. Native storage,
// account and notification boundaries are stubbed; no visual or OS-dialog coverage is claimed.
function providerHarness({ seed = null, session = null, fetch = async () => null } = {}) {
  const slots = [];
  let cursor = 0, scheduled = false, value, provider, destroyed = false;
  let stored = seed, failWrites = false;
  let account = { isLoading: false, session };
  const effects = [];
  const uploads = [], permissionRequests = [];
  function slot(init) { const index = cursor++; if (!slots[index]) slots[index] = init(); return slots[index]; }
  function changed(a, b) { return !a || !b || a.length !== b.length || a.some((item, i) => !Object.is(item, b[i])); }
  function schedule() { if (!scheduled && !destroyed) { scheduled = true; queueMicrotask(render); } }
  const hooks = {
    createContext: () => ({ Provider: "provider" }), useContext: () => value,
    useRef: (initial) => slot(() => ({ current: initial })),
    useState(initial) {
      const item = slot(() => ({ value: typeof initial === "function" ? initial() : initial }));
      return [item.value, (next) => { const resolved = typeof next === "function" ? next(item.value) : next; if (!Object.is(resolved, item.value)) { item.value = resolved; schedule(); } }];
    },
    useMemo(callback, deps) {
      const item = slot(() => ({ deps: null }));
      if (changed(item.deps, deps)) { item.value = callback(); item.deps = deps; }
      return item.value;
    },
    useCallback(callback, deps) { return hooks.useMemo(() => callback, deps); },
    useEffect(callback, deps) {
      const item = slot(() => ({ deps: null }));
      if (changed(item.deps, deps)) { item.deps = deps; effects.push(() => { item.cleanup?.(); item.cleanup = callback(); }); }
    },
  };
  const storage = { getItem: async () => stored, setItem: async (_key, next) => { if (failWrites) throw new Error("Storage unavailable"); stored = next; } };
  const context = sourceLoader({
    react: hooks,
    "react/jsx-runtime": { jsx: (_type, props) => { value = props.value; return null; } },
    "@react-native-async-storage/async-storage": storage,
    "react-native": { AppState: { addEventListener: () => ({ remove() {} }) } },
    "@/contexts/AccountContext": { useAccount: () => account },
    "@/services/course-sync": { fetchRemoteCourseSettings: fetch, saveRemoteCourseSettings: async (userId, settings) => uploads.push({ userId, settings }) },
    "@/services/study-reminders": { syncStudyReminders: async () => ({ permission: "undetermined", scheduledIds: [], signature: "test", error: null }), requestStudyReminderPermission: async () => { permissionRequests.push(true); return "granted"; } },
  })("@/contexts/CourseContext");
  provider = context.CourseProvider;
  function render() { if (destroyed) return; scheduled = false; cursor = 0; provider({ children: null }); while (effects.length) effects.shift()(); }
  render();
  return {
    get value() { return value; }, get stored() { return stored; }, uploads, permissionRequests,
    failStorage(flag) { failWrites = flag; },
    account(next) { account = { isLoading: false, session: next }; render(); },
    async settle() { for (let i = 0; i < 20; i++) await new Promise((resolve) => setImmediate(resolve)); },
    destroy() { destroyed = true; slots.forEach((item) => item.cleanup?.()); },
  };
}
test("CourseProvider preserves rapid incremental answers, restores a draft and requests permission only explicitly", async () => {
  const h = providerHarness();
  await h.settle();
  assert.equal(h.value.isHydrated, true);
  assert.equal(h.permissionRequests.length, 0);
  await Promise.all([
    h.value.updatePlan((value) => ({ ...value, selections: newPlan().selections, examYear: 2028 })),
    h.value.updatePlan((value) => ({ ...value, goals: ["habit"], onboarding: { completed: false, step: "days" } })),
  ]);
  await h.settle();
  const saved = JSON.parse(h.stored);
  assert.equal(saved.examYear, 2028);
  assert.deepEqual(saved.goals, ["habit"]);
  assert.equal(saved.selections.length, 3);
  assert.equal(saved.onboarding.completed, false);
  const restarted = providerHarness({ seed: h.stored });
  await restarted.settle();
  assert.equal(restarted.value.onboarding.step, "days");
  assert.equal(restarted.value.examYear, 2028);
  await restarted.value.enableReminders();
  await restarted.settle();
  assert.equal(restarted.permissionRequests.length, 1);
  assert.equal(restarted.value.studyPreferences.notificationsEnabled, true);
  h.destroy(); restarted.destroy();
});
test("CourseProvider never lets an older remote fetch replace newer local answers", async () => {
  let resolveRemote;
  const remote = new Promise((resolve) => { resolveRemote = resolve; });
  const h = providerHarness({ session: { user: { id: "test-user" } }, fetch: () => remote });
  await h.settle();
  await h.value.updatePlan((value) => ({ ...value, examYear: 2029, goals: ["exams"], selections: newPlan().selections }));
  resolveRemote({ activeSubjectId: "mathematics", examYear: 2027, selections: [selection("mathematics")] });
  await h.settle();
  assert.equal(h.value.examYear, 2029);
  assert.equal(h.value.selections.length, 3);
  assert.deepEqual(h.value.goals, ["exams"]);
  assert.equal(h.uploads.at(-1).settings.examYear, 2029);
  h.destroy();
});
test("CourseProvider validates completion and persists it only after the explicit final action", async () => {
  const h = providerHarness();
  await h.settle();
  await assert.rejects(h.value.completeOnboarding(), /subjects/);
  await h.value.updatePlan((value) => ({ ...value, selections: newPlan().selections, onboarding: { step: "review", completed: false } }));
  assert.equal(h.value.onboarding.completed, false);
  await h.value.completeOnboarding();
  await h.settle();
  assert.equal(JSON.parse(h.stored).onboarding.completed, true);
  const restarted = providerHarness({ seed: h.stored });
  await restarted.settle();
  assert.equal(restarted.value.onboarding.completed, true);
  h.destroy(); restarted.destroy();
});
test("failed local persistence cannot leave onboarding marked complete in memory", async () => {
  const h = providerHarness();
  await h.settle();
  await h.value.updatePlan((value) => ({ ...value, selections: newPlan().selections }));
  h.failStorage(true);
  await assert.rejects(h.value.completeOnboarding(), /Storage/);
  await h.settle();
  assert.equal(h.value.onboarding.completed, false);
  assert.equal(JSON.parse(h.stored).onboarding.completed, false);
  h.destroy();
});
test("a returning account waits for its remote plan before first-launch routing", async () => {
  let resolveRemote;
  const remote = new Promise((resolve) => { resolveRemote = resolve; });
  const h = providerHarness({ session: { user: { id: "returning-user" } }, fetch: () => remote });
  await h.settle();
  assert.equal(h.value.isHydrated, false);
  resolveRemote({ activeSubjectId: "mathematics", examYear: 2027, selections: [selection("mathematics")] });
  await h.settle();
  assert.equal(h.value.isHydrated, true);
  assert.equal(h.value.onboarding.completed, true);
  assert.equal(h.value.selections.length, 1);
  h.destroy();
});
