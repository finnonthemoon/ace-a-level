import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { DAY_LABELS, formatReminderTime, formatStudyMinutes, reminderEntries, specificationLabel, STUDY_GOALS, type OnboardingStep, type StudyPlan } from "@/core/study-plan";
import { findSubject } from "@/product/subjects";

export function StudyPlanSummary({ plan, notificationsLabel, onEdit }: { plan: StudyPlan; notificationsLabel: string; onEdit?: (step: OnboardingStep) => void }) {
  function heading(label: string, step: OnboardingStep) {
    return <View style={styles.heading}><Text style={styles.sectionTitle}>{label}</Text>{onEdit ? <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${label}`} onPress={() => onEdit(step)} style={styles.edit}><Text style={styles.editText}>Edit</Text></Pressable> : null}</View>;
  }
  const entries = reminderEntries(plan.studyPreferences);
  return <View style={styles.summary}>
    {heading("Your A-level plan", "year")}
    <Text style={styles.emphasis}>{plan.examYear ? `${plan.examYear} exams` : "Exam year not set"}</Text>
    {onEdit ? <Pressable accessibilityRole="button" accessibilityLabel="Edit subjects and boards" onPress={() => onEdit("subjects")} style={styles.editSubjects}><Text style={styles.editText}>Edit subjects and boards</Text></Pressable> : null}
    {plan.selections.map((selection) => <View key={selection.subjectId} style={styles.subject}>
      <Text style={styles.subjectTitle}>{findSubject(selection.subjectId)?.title}</Text>
      <Text style={styles.body}>{specificationLabel(selection)}</Text>
      <View style={styles.heading}><Text style={styles.body}>Predicted {selection.predictedGrade ?? "not set"} · Target {selection.targetGrade ?? "not set"}</Text>{onEdit ? <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${selection.subjectId} grades`} onPress={() => onEdit("grades")} style={styles.edit}><Text style={styles.editText}>Edit</Text></Pressable> : null}</View>
    </View>)}
    {heading("Study target", "target")}
    <Text style={styles.emphasis}>{formatStudyMinutes(plan.studyPreferences.weeklyTargetMinutes)} per week</Text>
    <Text style={styles.body}>{plan.studyPreferences.selectedStudyDays.length} study days · {plan.studyPreferences.selectedStudyDays.map((day) => DAY_LABELS[day].slice(0, 3)).join(", ")}</Text>
    {heading("Reminders", "times")}
    <Text style={styles.body}>{notificationsLabel}</Text>
    {onEdit ? <Pressable accessibilityRole="button" onPress={() => onEdit("notifications")} style={styles.editSubjects}><Text style={styles.editText}>Edit notification settings</Text></Pressable> : null}
    {entries.map(({ day, minutes }) => <Text key={day} style={styles.body}>{DAY_LABELS[day]} · {formatReminderTime(minutes)}</Text>)}
    {!entries.length ? <Text style={styles.body}>No reminder times selected</Text> : null}
    {heading("Your goals", "goals")}
    {plan.goals.length ? plan.goals.map((goal) => <Text style={styles.body} key={goal}>{STUDY_GOALS[goal]}</Text>) : <Text style={styles.body}>No goal set yet</Text>}
  </View>;
}
const styles = StyleSheet.create({
  summary: { gap: 10 }, heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.ink, marginTop: 12 }, emphasis: { fontSize: 21, fontWeight: "600", color: Colors.ink }, body: { flexShrink: 1, fontSize: 14, color: Colors.muted, lineHeight: 22 }, subject: { borderBottomWidth: 1, borderBottomColor: Colors.line, paddingVertical: 12, gap: 5 }, subjectTitle: { fontSize: 17, fontWeight: "700", color: Colors.ink }, edit: { minHeight: 44, minWidth: 48, alignItems: "flex-end", justifyContent: "center" }, editText: { color: Colors.primary, fontWeight: "600", fontSize: 14 }, editSubjects: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
});
