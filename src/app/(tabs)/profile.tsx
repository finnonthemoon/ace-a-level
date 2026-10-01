import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { StarMascot } from "@/components/StarMascot";
import { Colors } from "@/constants/theme";
import { useAccount } from "@/contexts/AccountContext";
import { useCourse } from "@/contexts/CourseContext";
import { STAR_STAGES, useMascot } from "@/contexts/MascotContext";
import { findSubject } from "@/product/subjects";
import { DAY_LABELS, formatReminderTime, formatStudyMinutes, reminderEntries, reminderStatusLabel, specificationLabel, STUDY_GOALS } from "@/core/study-plan";

export default function ProfileScreen() {
  const router = useRouter();
  const { examYear, isSyncing, selections, syncError, studyPreferences, goals, reminderRuntime, isSchedulingReminders, persistenceError } = useCourse();
  const { isSignedIn, session, signOut } = useAccount();
  const { stage, setStage } = useMascot();

  async function handleSignOut() {
    try { await signOut(); }
    catch (error) { Alert.alert("Could not sign out", error instanceof Error ? error.message : "Please try again."); }
  }

  return (
    <Screen tabHeader eyebrow="YOUR PLAN" title="Profile" subtitle={examYear ? `${examYear} exams · ${selections.length} subjects` : `${selections.length} subjects in your A-level plan`}>
      <View style={styles.starPanel}>
        <View style={styles.starTop}>
          <View style={styles.starCopy}><Text style={styles.panelLabel}>MASCOT PREVIEW</Text><Text style={styles.panelTitle}>Your star, your pace.</Text><Text style={styles.panelBody}>Your star will grow with consistency towards your own weekly goal. Choose a stage to preview it across the app.</Text></View>
          <StarMascot size={112} />
        </View>
        <View style={styles.stageRow}>
          {STAR_STAGES.map((item) => (
            <Pressable key={item} accessibilityRole="button" accessibilityLabel={`Preview ${item} star`} accessibilityState={{ selected: stage === item }} onPress={() => setStage(item)} style={[styles.stageButton, stage === item && styles.stageSelected]}>
              <StarMascot stage={item} size={37} /><Text style={[styles.stageText, stage === item && styles.stageTextSelected]}>{item[0].toUpperCase() + item.slice(1)}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.previewNote}>Preview only · Activity tracking is not connected yet</Text>
      </View>

      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Your subjects</Text><Pressable accessibilityRole="button" onPress={() => router.push("/onboarding")} style={styles.editButton}><Text style={styles.editText}>Edit plan</Text></Pressable></View>
      <View style={styles.subjectList}>
        {selections.map((selection, index) => {
          const subject = findSubject(selection.subjectId);
          return subject ? <View key={subject.id} style={[styles.subject, index < selections.length - 1 && styles.divider]}>
            <View style={[styles.subjectIcon, { backgroundColor: subject.softColor }]}><Ionicons name={subject.icon} color={subject.color} size={20} /></View>
            <View style={styles.subjectCopy}><Text style={styles.subjectTitle}>{subject.title}</Text><Text style={styles.subjectMeta}>{specificationLabel(selection)}</Text><Text style={styles.subjectMeta}>Predicted {selection.predictedGrade ?? "not set"} · Target {selection.targetGrade ?? "not set"}</Text></View>
          </View> : null;
        })}
      </View>

      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Study goal</Text><Pressable accessibilityRole="button" accessibilityLabel="Edit study goal and schedule" onPress={() => router.push({ pathname: "/onboarding", params: { step: "target" } })} style={styles.editButton}><Text style={styles.editText}>Edit</Text></Pressable></View>
      <View style={styles.studyGoal}>
        <Text style={styles.goalValue}>{formatStudyMinutes(studyPreferences.weeklyTargetMinutes)} <Text style={styles.goalUnit}>per week</Text></Text>
        <Text style={styles.goalMeta}>{studyPreferences.selectedStudyDays.length} study days · {studyPreferences.selectedStudyDays.map((day) => DAY_LABELS[day].slice(0, 3)).join(", ")}</Text>
        {goals.map((goal) => <Text key={goal} style={styles.goalMeta}>{STUDY_GOALS[goal]}</Text>)}
        <View style={styles.notificationRow}><Text style={styles.subjectTitle}>Notifications</Text><Pressable accessibilityRole="button" accessibilityLabel="Edit notification settings" onPress={() => router.push({ pathname: "/onboarding", params: { step: "notifications" } })} style={styles.editButton}><Text style={styles.editText}>{reminderStatusLabel(studyPreferences, reminderRuntime, isSchedulingReminders)}</Text></Pressable></View>
        {reminderEntries(studyPreferences).map(({ day, minutes }) => <Text key={day} style={styles.goalMeta}>{DAY_LABELS[day]} · {formatReminderTime(minutes)}</Text>)}
        {reminderRuntime.error ? <Text style={styles.syncError}>{reminderRuntime.error}</Text> : null}
        {persistenceError ? <Text style={styles.syncError}>{persistenceError}</Text> : null}
      </View>

      <View style={styles.accountSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.accountIdentity}>{isSignedIn ? session?.user.email ?? "Signed in" : "Save your study plan"}</Text>
        <Text style={styles.accountDescription}>{isSignedIn ? isSyncing ? "Syncing your study plan…" : "Your plan is saved locally and connected to your account. Notification permission stays on this device." : "Sign in to keep your study plan across devices."}</Text>
        {syncError ? <Text style={styles.syncError}>{syncError}</Text> : null}
        {isSignedIn ? <Pressable accessibilityRole="button" onPress={() => void handleSignOut()} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Sign out</Text></Pressable> : <Pressable accessibilityRole="button" onPress={() => router.push("/account" as Href)} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Create account or sign in</Text><Ionicons name="arrow-forward" color="#FFFFFF" size={17} /></Pressable>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  starPanel: { padding: 19, borderRadius: 20, backgroundColor: Colors.primarySoft, gap: 12 },
  starTop: { flexDirection: "row", alignItems: "center", gap: 4 },
  starCopy: { flex: 1 },
  panelLabel: { color: Colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  panelTitle: { color: Colors.ink, fontSize: 21, fontWeight: "700", marginTop: 6, letterSpacing: -0.3 },
  panelBody: { color: Colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  stageRow: { flexDirection: "row", gap: 5 },
  stageButton: { flex: 1, minHeight: 72, alignItems: "center", justifyContent: "center", borderRadius: 11, gap: 2 },
  stageSelected: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#B4C7E9" },
  stageText: { color: Colors.muted, fontSize: 10, fontWeight: "600" },
  stageTextSelected: { color: Colors.primary, fontWeight: "700" },
  previewNote: { color: Colors.muted, fontSize: 11, textAlign: "center" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: Colors.ink, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  editButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  editText: { color: Colors.primary, fontSize: 13, fontWeight: "700" },
  subjectList: { paddingHorizontal: 17, borderRadius: 17, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  subject: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  subjectIcon: { width: 41, height: 41, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  subjectCopy: { flex: 1, gap: 4 },
  subjectTitle: { color: Colors.ink, fontSize: 14, fontWeight: "700" },
  subjectMeta: { color: Colors.muted, fontSize: 11 },
  studyGoal: { padding: 19, gap: 10, borderRadius: 17, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  goalValue: { color: Colors.ink, fontSize: 29, fontWeight: "700" },
  goalUnit: { color: Colors.muted, fontSize: 14, fontWeight: "400" },
  goalMeta: { color: Colors.muted, fontSize: 14, lineHeight: 21 },
  notificationRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 6 },
  accountSection: { gap: 8, paddingTop: 3 },
  accountIdentity: { color: Colors.ink, fontSize: 15, fontWeight: "700" },
  accountDescription: { color: Colors.muted, fontSize: 12, lineHeight: 18 },
  syncError: { color: Colors.danger, fontSize: 12 },
  primaryButton: { minHeight: 49, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 18, borderRadius: 11, backgroundColor: Colors.primary, marginTop: 9 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  secondaryButton: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: 2, marginTop: 4 },
  secondaryButtonText: { color: Colors.danger, fontSize: 13, fontWeight: "700" },
});
