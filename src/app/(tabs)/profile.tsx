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

export default function ProfileScreen() {
  const router = useRouter();
  const { examYear, isSyncing, selections, syncError } = useCourse();
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
          <View style={styles.starCopy}><Text style={styles.panelLabel}>MASCOT PREVIEW</Text><Text style={styles.panelTitle}>Your star, your pace.</Text><Text style={styles.panelBody}>As study activity grows, your star warms from red to blue. Choose a stage to preview it across the app.</Text></View>
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
            <View style={styles.subjectCopy}><Text style={styles.subjectTitle}>{subject.title}</Text><Text style={styles.subjectMeta}>{selection.specificationId ?? "Board to be selected"}{selection.targetGrade ? ` · Target ${selection.targetGrade}` : ""}</Text></View>
          </View> : null;
        })}
      </View>

      <View style={styles.accountSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.accountIdentity}>{isSignedIn ? session?.user.email ?? "Signed in" : "Save your study plan"}</Text>
        <Text style={styles.accountDescription}>{isSignedIn ? isSyncing ? "Syncing your subject choices…" : "Your subject choices are connected across signed-in devices." : "Sign in to keep your subject choices across devices."}</Text>
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
  accountSection: { gap: 8, paddingTop: 3 },
  accountIdentity: { color: Colors.ink, fontSize: 15, fontWeight: "700" },
  accountDescription: { color: Colors.muted, fontSize: 12, lineHeight: 18 },
  syncError: { color: Colors.danger, fontSize: 12 },
  primaryButton: { minHeight: 49, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 18, borderRadius: 11, backgroundColor: Colors.primary, marginTop: 9 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  secondaryButton: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: 2, marginTop: 4 },
  secondaryButtonText: { color: Colors.danger, fontSize: 13, fontWeight: "700" },
});
