import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Fragment, useCallback, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StarMascot } from "@/components/StarMascot";
import { GradeControl, PlanChoice, TimeControl } from "@/components/study-plan/PlanControls";
import { StudyPlanSummary } from "@/components/study-plan/StudyPlanSummary";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { STAR_STAGES } from "@/contexts/MascotContext";
import { DAY_LABELS, formatReminderTime, formatStudyMinutes, MAX_PLAN_SUBJECTS, MIN_PLAN_SUBJECTS, ONBOARDING_STEPS, planValidation, reminderEntries, reminderStatusLabel, specificationsForSubject, STUDY_DAYS, STUDY_GOALS, upcomingExamYears, type OnboardingStep, type StudyGoal, type StudyPlan, type StudyPreferences, type SubjectSelection } from "@/core/study-plan";
import { SUBJECTS, findSubject, type SubjectId } from "@/product/subjects";

const COPY: Record<OnboardingStep, { title: string; body: string }> = {
  welcome: { title: "Build your A-level plan", body: "Tell us what you’re studying and what you’re aiming for. Ace will organise your courses, goals and study routine." },
  year: { title: "When are your exams?", body: "Choose the year you expect to sit your A-levels. You can change this later." },
  subjects: { title: "What are you studying?", body: "Pick the A-levels on your timetable." },
  boards: { title: "Choose your specifications", body: "We’ll keep your courses tied to the right exam board. You can leave a board unset." },
  grades: { title: "What are you aiming for?", body: "Add predicted and target grades for each subject. Not sure yet? Leave them unset." },
  goals: { title: "How can Ace help?", body: "Choose any goals that feel right for you. These will help shape future personalisation." },
  target: { title: "Make time for your goals", body: "How much would you like to study with Ace each week? This is your goal, and you can adjust it anytime." },
  days: { title: "Choose your study days", body: "Pick the days that fit your routine. Your weekly target will stay the same." },
  times: { title: "A time that suits you", body: "Choose a reminder time for your study days. You can change individual days if you need to." },
  notifications: { title: "Ready when you are", body: "We can remind you on the days you chose so your study plan doesn’t get forgotten." },
  star: { title: "Meet your Ace star", body: "Study consistently and your star grows with you. It will respond to how you meet your own goals." },
  review: { title: "Your plan, your pace", body: "Take a look at your plan. You can adjust it now or return to it from Profile." },
};

export default function OnboardingScreen() {
  const { isHydrated } = useCourse();
  return isHydrated ? <PlanFlow /> : <SafeAreaView style={styles.safe}><ActivityIndicator accessibilityLabel="Loading your plan" color={Colors.primary} /></SafeAreaView>;
}
function PlanFlow() {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string }>();
  const course = useCourse();
  const [editing] = useState(course.onboarding.completed);
  const { updatePlan } = course;
  const [step, setStep] = useState<OnboardingStep>(() => ONBOARDING_STEPS.find((item) => item === params.step) ?? (editing ? "review" : course.onboarding.step));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [askedPermission, setAskedPermission] = useState(false);
  const [custom, setCustom] = useState(![60, 120, 180, 300, 420].includes(course.studyPreferences.weeklyTargetMinutes));
  const [customMinutes, setCustomMinutes] = useState(String(course.studyPreferences.weeklyTargetMinutes));
  const scroll = useRef<ScrollView>(null);
  const stepIndex = ONBOARDING_STEPS.indexOf(step);
  const prefs = course.studyPreferences;
  const minimum = editing ? 1 : MIN_PLAN_SUBJECTS;
  const subjectValid = course.selections.length >= minimum && course.selections.length <= MAX_PLAN_SUBJECTS;
  const customValid = /^\d+$/.test(customMinutes) && Number(customMinutes) >= 15 && Number(customMinutes) <= 10080;
  const invalid = (step === "subjects" && !subjectValid) || (step === "days" && !prefs.selectedStudyDays.length) || (step === "target" && custom && !customValid) || (step === "review" && Boolean(planValidation(course)));
  const statusLabel = reminderStatusLabel(prefs, course.reminderRuntime, course.isSchedulingReminders);

  function save(update: (plan: StudyPlan) => StudyPlan) {
    setError(null);
    void course.updatePlan(update).catch((problem: unknown) => setError(problem instanceof Error ? problem.message : "Your changes could not be saved. Please try again."));
  }
  function preferences(update: (preferences: StudyPreferences) => StudyPreferences) {
    save((plan) => ({ ...plan, studyPreferences: update(plan.studyPreferences) }));
  }
  function selection(subjectId: SubjectId, update: Partial<SubjectSelection>) {
    save((plan) => ({ ...plan, selections: plan.selections.map((item) => item.subjectId === subjectId ? { ...item, ...update } : item) }));
  }
  const goTo = useCallback((next: OnboardingStep) => {
    setStep(next);
    setError(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
    if (!editing) void updatePlan((plan) => ({ ...plan, onboarding: { ...plan.onboarding, step: next } })).catch((problem: unknown) => setError(problem instanceof Error ? problem.message : "Could not save your place."));
  }, [updatePlan, editing]);
  const goBack = useCallback(() => {
    if (busy) return true;
    if (editing && step === "review") { if (router.canGoBack()) router.back(); else router.replace("/(tabs)/profile"); return true; }
    if (stepIndex > 0) { goTo(ONBOARDING_STEPS[stepIndex - 1]); return true; }
    // At welcome Android can leave the app. Answers have already been saved.
    return false;
  }, [busy, editing, step, router, stepIndex, goTo]);
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", goBack);
    return () => subscription.remove();
  }, [goBack]));
  async function next() {
    if (busy || invalid) return;
    setBusy(true);
    setError(null);
    try {
      if (step === "review") {
        await course.completeOnboarding();
        router.replace(editing ? "/(tabs)/profile" : "/");
      } else if (step === "notifications" && !askedPermission && !prefs.notificationsEnabled) {
        await course.enableReminders();
        setAskedPermission(true);
      } else {
        const nextStep = ONBOARDING_STEPS[stepIndex + 1];
        await course.updatePlan((plan) => ({ ...plan, onboarding: { ...plan.onboarding, step: editing ? plan.onboarding.step : nextStep } }));
        goTo(nextStep);
      }
    } catch (problem) { setError(problem instanceof Error ? problem.message : "Could not save your plan. Please try again."); }
    finally { setBusy(false); }
  }
  async function skipReminders() {
    if (busy) return;
    setBusy(true);
    try { await course.updatePlan((plan) => ({ ...plan, studyPreferences: { ...plan.studyPreferences, notificationsEnabled: false } })); goTo("star"); }
    catch (problem) { setError(problem instanceof Error ? problem.message : "Could not save this change."); }
    finally { setBusy(false); }
  }
  const primaryLabel = busy ? "Saving…" : step === "welcome" ? "Get started" : step === "review" ? editing ? "Save plan" : "Start learning" : step === "notifications" && !askedPermission && !prefs.notificationsEnabled ? "Turn on reminders" : "Continue";

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel={editing && step === "review" ? "Close plan editor" : "Previous step"} disabled={busy || (!editing && stepIndex === 0)} onPress={goBack} style={styles.back}><Ionicons name={editing && step === "review" ? "close" : "arrow-back"} size={23} color={(!editing && stepIndex === 0) ? "transparent" : Colors.ink} /></Pressable>
        <Text style={styles.brand}>{editing ? "EDIT YOUR PLAN" : "YOUR A-LEVEL PLAN"}</Text>
        <Text accessibilityLabel={`Step ${stepIndex + 1} of ${ONBOARDING_STEPS.length}`} style={styles.stepCount}>{stepIndex + 1}/{ONBOARDING_STEPS.length}</Text>
      </View>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: ONBOARDING_STEPS.length, now: stepIndex + 1 }} style={styles.progressTrack}><View style={[styles.progress, { width: `${((stepIndex + 1) / ONBOARDING_STEPS.length) * 100}%` }]} /></View>
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === "welcome" ? <StarMascot stage="blue" size={96} decorative /> : null}
        <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{COPY[step].title}</Text><Text style={styles.body}>{COPY[step].body}</Text></View>

        {step === "welcome" ? <View style={styles.welcomeList}>{["Your subjects and ambitions", "A study routine that fits your week", "Gentle reminders, if you want them"].map((label) => <View key={label} style={styles.welcomeRow}><Ionicons name="checkmark" size={21} color={Colors.primary} /><Text style={styles.body}>{label}</Text></View>)}<Text style={styles.note}>A few minutes to make it yours. Your answers save as you go.</Text></View> : null}

        {step === "year" ? <View style={styles.choices}>{upcomingExamYears(course.examYear).map((year) => <PlanChoice key={year} label={String(year)} selected={course.examYear === year} onPress={() => save((plan) => ({ ...plan, examYear: year }))} />)}<PlanChoice label="Not sure yet" selected={course.examYear === null} onPress={() => save((plan) => ({ ...plan, examYear: null }))} /></View> : null}

        {step === "subjects" ? <View style={styles.choices}>
          <Text style={styles.note}>{editing ? "Choose 1–5 subjects" : `Choose ${MIN_PLAN_SUBJECTS}–${MAX_PLAN_SUBJECTS} subjects`} · {course.selections.length} selected</Text>
          {SUBJECTS.map((subject) => {
            const selected = course.selections.some((item) => item.subjectId === subject.id);
            return <PlanChoice key={subject.id} label={subject.title} description={selected && editing && course.selections.length === 1 ? "Add another subject before removing your last one." : undefined} selected={selected} multiple disabled={(!selected && course.selections.length >= MAX_PLAN_SUBJECTS) || (selected && editing && course.selections.length === 1)} icon={<View style={[styles.subjectIcon, { backgroundColor: subject.softColor }]}><Ionicons name={subject.icon} color={subject.color} size={23} /></View>} onPress={() => save((plan) => ({ ...plan, selections: selected ? plan.selections.filter((item) => item.subjectId !== subject.id) : [...plan.selections, { subjectId: subject.id, specificationId: null, predictedGrade: null, targetGrade: null }] }))} />;
          })}
        </View> : null}

        {step === "boards" ? <View style={styles.choices}>{course.selections.map((item) => {
          const specs = specificationsForSubject(item.subjectId, course.qualificationLevel);
          return <View key={item.subjectId} style={styles.subjectSection}><Text style={styles.sectionTitle}>{findSubject(item.subjectId)?.title}</Text>
            {!specs.length ? <Text style={styles.body}>Specification not available yet. We’ll keep this subject in your plan.</Text> : null}
            {specs.map((spec) => <PlanChoice key={spec.id} label={`${spec.examBoard.title} ${spec.title}`} description={spec.qualification.specifications.find((entry) => entry.level === course.qualificationLevel)?.code} selected={item.specificationId === spec.id} onPress={() => selection(item.subjectId, { specificationId: spec.id })} />)}
            {item.specificationId && !specs.some((spec) => spec.id === item.specificationId) ? <Text style={styles.note}>Your previous specification is retained, but is not currently available in the catalogue.</Text> : null}
            <PlanChoice label="Board not set" selected={item.specificationId === null} onPress={() => selection(item.subjectId, { specificationId: null })} />
          </View>;
        })}</View> : null}

        {step === "grades" ? <View style={styles.choices}>{course.selections.map((item) => <View key={item.subjectId} style={styles.subjectSection}><Text style={styles.sectionTitle}>{findSubject(item.subjectId)?.title}</Text><View style={styles.gradeRow}><GradeControl subject={findSubject(item.subjectId)?.title ?? item.subjectId} kind="Predicted" value={item.predictedGrade} onChange={(predictedGrade) => selection(item.subjectId, { predictedGrade })} /><GradeControl subject={findSubject(item.subjectId)?.title ?? item.subjectId} kind="Target" value={item.targetGrade} onChange={(targetGrade) => selection(item.subjectId, { targetGrade })} /></View></View>)}</View> : null}

        {step === "goals" ? <View style={styles.choices}>{(Object.keys(STUDY_GOALS) as StudyGoal[]).map((goal) => <PlanChoice key={goal} label={STUDY_GOALS[goal]} selected={course.goals.includes(goal)} multiple onPress={() => save((plan) => ({ ...plan, goals: plan.goals.includes(goal) ? plan.goals.filter((item) => item !== goal) : [...plan.goals, goal] }))} />)}<Text style={styles.note}>Choose more than one, or continue without a goal for now.</Text></View> : null}

        {step === "target" ? <View style={styles.choices}>
          <View style={styles.presetGrid}>{[60, 120, 180, 300, 420].map((minutes) => <View key={minutes} style={styles.presetCell}><PlanChoice label={formatStudyMinutes(minutes)} selected={!custom && prefs.weeklyTargetMinutes === minutes} onPress={() => { setCustom(false); preferences((value) => ({ ...value, weeklyTargetMinutes: minutes })); }} /></View>)}<View style={styles.presetCell}><PlanChoice label="Custom" selected={custom} onPress={() => { setCustom(true); setCustomMinutes(String(prefs.weeklyTargetMinutes)); }} /></View></View>
          {custom ? <View style={styles.customTarget}><Text style={styles.sectionTitle}>Minutes per week</Text><TextInput accessibilityLabel="Weekly study target in minutes" keyboardType="number-pad" value={customMinutes} maxLength={5} onChangeText={(value) => { setCustomMinutes(value); if (/^\d+$/.test(value) && Number(value) >= 15 && Number(value) <= 10080) preferences((current) => ({ ...current, weeklyTargetMinutes: Number(value) })); }} style={styles.numericInput} /><Text style={styles.note}>Choose 15–10,080 minutes. Currently saved: {formatStudyMinutes(prefs.weeklyTargetMinutes)}.</Text></View> : null}
          <Text style={styles.sectionTitle}>How many days each week?</Text>
          <View style={styles.dayCounts}>{[1, 2, 3, 4, 5, 6, 7].map((count) => <Pressable key={count} accessibilityRole="radio" accessibilityLabel={`${count} study ${count === 1 ? "day" : "days"} per week`} accessibilityState={{ checked: prefs.targetDaysPerWeek === count }} onPress={() => preferences((value) => {
            const keep = value.selectedStudyDays.slice(0, count);
            const selectedStudyDays = [...keep, ...STUDY_DAYS.filter((day) => !keep.includes(day)).slice(0, count - keep.length)];
            return { ...value, selectedStudyDays, targetDaysPerWeek: count };
          })} style={[styles.countButton, prefs.targetDaysPerWeek === count && styles.countSelected]}><Text style={[styles.countLabel, prefs.targetDaysPerWeek === count && styles.countLabelSelected]}>{count}</Text>{prefs.targetDaysPerWeek === count ? <Ionicons name="checkmark" size={12} color={Colors.primary} /> : null}</Pressable>)}</View>
          <Text style={styles.note}>About {formatStudyMinutes(Math.round(prefs.weeklyTargetMinutes / Math.max(1, prefs.targetDaysPerWeek)))} per study day. No pressure to be exact.</Text>
        </View> : null}

        {step === "days" ? <View style={styles.choices}>
          <Pressable accessibilityRole="button" onPress={() => preferences((value) => ({ ...value, selectedStudyDays: ["mon", "tue", "wed", "thu", "fri"], targetDaysPerWeek: 5 }))} style={styles.textButton}><Text style={styles.linkText}>Use weekdays</Text></Pressable>
          {STUDY_DAYS.map((day) => <PlanChoice key={day} label={DAY_LABELS[day]} selected={prefs.selectedStudyDays.includes(day)} multiple onPress={() => preferences((value) => { const selectedStudyDays = STUDY_DAYS.filter((item) => item === day ? !value.selectedStudyDays.includes(item) : value.selectedStudyDays.includes(item)); return { ...value, selectedStudyDays, targetDaysPerWeek: selectedStudyDays.length }; })} />)}
          <Text style={styles.note}>{prefs.selectedStudyDays.length} days chosen · {formatStudyMinutes(prefs.weeklyTargetMinutes)} per week</Text>
        </View> : null}

        {step === "times" ? <View style={styles.choices}>
          <TimeControl label="Remind me at" value={prefs.reminders.defaultTimeMinutes} onChange={(time) => { if (time !== null) preferences((value) => ({ ...value, reminders: { ...value.reminders, defaultTimeMinutes: time } })); }} />
          <PlanChoice label="Use this time for all study days" selected={Object.keys(prefs.reminders.dayOverrides).length === 0} onPress={() => preferences((value) => ({ ...value, reminders: { ...value.reminders, dayOverrides: {} } }))} />
          <Text style={styles.sectionTitle}>Or adjust individual days</Text>
          {STUDY_DAYS.map((day) => prefs.selectedStudyDays.includes(day) ? <TimeControl key={day} label={DAY_LABELS[day]} allowOff value={prefs.reminders.dayOverrides[day] === null ? null : prefs.reminders.dayOverrides[day] ?? prefs.reminders.defaultTimeMinutes} onChange={(time) => preferences((value) => ({ ...value, reminders: { ...value.reminders, dayOverrides: { ...value.reminders.dayOverrides, [day]: time } } }))} /> : <View key={day} style={styles.noStudyRow}><Text style={styles.note}>{DAY_LABELS[day]}</Text><Text style={styles.note}>No study day</Text></View>)}
          <Text style={styles.note}>Times follow your device’s local timezone. Notifications are optional.</Text>
        </View> : null}

        {step === "notifications" ? <View style={styles.choices}>
          <View style={styles.reminderPreview}><Ionicons name="notifications-outline" size={26} color={Colors.primary} /><Text style={styles.sectionTitle}>Your reminder schedule</Text>{reminderEntries(prefs).map(({ day, minutes }) => <Text style={styles.body} key={day}>{DAY_LABELS[day]} · {formatReminderTime(minutes)}</Text>)}{!reminderEntries(prefs).length ? <Text style={styles.body}>No reminders selected. You can continue without them.</Text> : null}</View>
          <Text accessibilityLiveRegion="polite" style={styles.body}>{statusLabel}</Text>
          {course.reminderRuntime.permission === "denied" ? <><Text style={styles.note}>Notifications are disabled in your device settings. You can keep using Ace and enable them later.</Text><Pressable accessibilityRole="button" onPress={() => void Linking.openSettings().catch(() => setError("Open your device settings to allow Ace notifications."))} style={styles.textButton}><Text style={styles.linkText}>Open device settings</Text></Pressable></> : null}
          {course.reminderRuntime.permission === "unavailable" ? <Text style={styles.note}>Reminders are unavailable here. Your plan still works normally.</Text> : null}
          <Text style={styles.note}>One gentle reminder per chosen day. You’re always in control.</Text>
        </View> : null}

        {step === "star" ? <View style={styles.choices}>
          <View style={styles.starHero}><StarMascot stage="red" size={104} decorative /></View>
          <View style={styles.starStages}>{STAR_STAGES.map((stage, index) => <Fragment key={stage}><View style={styles.starStage}><StarMascot stage={stage} size={40} decorative /><Text style={styles.starLabel}>{stage[0].toUpperCase() + stage.slice(1)}</Text></View>{index < STAR_STAGES.length - 1 ? <Text style={styles.starArrow}>→</Text> : null}</Fragment>)}</View>
          <Text style={styles.body}>Consistency is personal. Meeting a 3-hour weekly goal can count just as much as meeting a 7-hour goal.</Text>
          <Text style={styles.body}>Missing a session won’t make your star sad. Start again when you’re ready.</Text>
          <Text style={styles.note}>For now, explore the stages in Profile’s mascot preview. Measured study time and automatic progression are coming later.</Text>
        </View> : null}

        {step === "review" ? <><StudyPlanSummary plan={course} notificationsLabel={statusLabel} onEdit={goTo} />{planValidation(course) ? <Text style={styles.error}>{planValidation(course)}</Text> : null}<Text style={styles.note}>Subject diagnostics are in preparation. You can start learning now and find them in Practice when they’re ready.</Text></> : null}
        {course.reminderRuntime.error ? <View><Text accessibilityRole="alert" style={styles.error}>{course.reminderRuntime.error}</Text><Pressable accessibilityRole="button" onPress={course.retryReminders} style={styles.textButton}><Text style={styles.linkText}>Retry reminders</Text></Pressable></View> : null}
        {error || course.persistenceError ? <Text accessibilityRole="alert" style={styles.error}>{error ?? course.persistenceError}</Text> : null}
      </ScrollView>
      <View style={styles.footer}>
        {step === "notifications" ? <Pressable accessibilityRole="button" disabled={busy} onPress={() => void skipReminders()} style={styles.secondary}><Text style={styles.linkText}>{prefs.notificationsEnabled ? "Turn off reminders" : "Not now"}</Text></Pressable> : null}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy || invalid }} disabled={busy || invalid} onPress={() => void next()} style={({ pressed }) => [styles.primary, (busy || invalid) && styles.disabled, pressed && styles.pressed]}><Text style={styles.primaryText}>{primaryLabel}</Text>{!busy ? <Ionicons name="arrow-forward" size={20} color="white" /> : <ActivityIndicator color="white" />}</Pressable>
        {editing ? <Text style={styles.footerNote}>Changes save as you go.</Text> : null}
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream }, topBar: { width: "100%", maxWidth: 620, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 6 }, back: { minHeight: 48, minWidth: 48, alignItems: "center", justifyContent: "center" }, brand: { flex: 1, color: Colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 1 }, stepCount: { fontSize: 12, color: Colors.muted, paddingRight: 8 }, progressTrack: { height: 3, backgroundColor: Colors.line }, progress: { height: 3, backgroundColor: Colors.primary },
  content: { width: "100%", maxWidth: 620, alignSelf: "center", padding: 22, paddingTop: 28, paddingBottom: 30, gap: 26 }, heading: { gap: 12 }, title: { fontSize: 30, lineHeight: 37, fontWeight: "700", color: Colors.ink, letterSpacing: -0.7 }, body: { fontSize: 15, lineHeight: 23, color: Colors.muted }, note: { fontSize: 13, lineHeight: 20, color: Colors.muted }, sectionTitle: { fontSize: 17, lineHeight: 23, fontWeight: "700", color: Colors.ink },
  choices: { gap: 12 }, welcomeList: { gap: 18 }, welcomeRow: { flexDirection: "row", alignItems: "center", gap: 12 }, subjectIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" }, subjectSection: { gap: 12, marginBottom: 16 }, gradeRow: { flexDirection: "row", gap: 10 }, presetGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, presetCell: { flexBasis: "47%", flexGrow: 1 }, customTarget: { gap: 10, marginVertical: 10 }, numericInput: { minHeight: 54, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line, padding: 14, color: Colors.ink, fontSize: 19 },
  dayCounts: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, countButton: { minHeight: 52, minWidth: 48, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 3 }, countSelected: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft }, countLabel: { color: Colors.ink, fontSize: 17, fontWeight: "600" }, countLabelSelected: { color: Colors.primary },
  noStudyRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14 }, textButton: { minHeight: 48, justifyContent: "center", alignSelf: "flex-start" }, linkText: { fontSize: 15, color: Colors.primary, fontWeight: "600" }, reminderPreview: { borderRadius: 18, backgroundColor: Colors.primarySoft, padding: 20, gap: 10 },
  starHero: { alignItems: "center", padding: 8 }, starStages: { flexDirection: "row", alignItems: "center", marginBottom: 14 }, starStage: { alignItems: "center", flex: 1, gap: 4 }, starLabel: { fontSize: 12, fontWeight: "600", color: Colors.ink }, starArrow: { fontSize: 16, width: 12, textAlign: "center", color: Colors.muted },
  footer: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: 22, paddingTop: 12, paddingBottom: 12, gap: 8, borderTopWidth: 1, borderTopColor: Colors.line, backgroundColor: Colors.cream }, primary: { minHeight: 56, borderRadius: 18, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 12, padding: 14 }, primaryText: { fontSize: 16, fontWeight: "700", color: "white" }, secondary: { minHeight: 44, alignItems: "center", justifyContent: "center" }, footerNote: { fontSize: 12, textAlign: "center", color: Colors.muted }, disabled: { opacity: 0.45 }, pressed: { opacity: 0.85 }, error: { color: Colors.danger, fontSize: 14, lineHeight: 21 },
});
