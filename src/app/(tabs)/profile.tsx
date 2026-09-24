import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Colors, Shadow } from "@/constants/theme";
import { useAccount } from "@/contexts/AccountContext";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

export default function ProfileScreen() {
  const router = useRouter();
  const { examYear, isSyncing, selections, syncError } = useCourse();
  const { isSignedIn, session, signOut } = useAccount();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Could not sign out", error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <Screen eyebrow="YOUR PLAN" title="Profile" subtitle="Manage the courses that make up your A-level programme.">
      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.avatar}><Ionicons name="person" color="#FFFFFF" size={29} /></View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>ACE A LEVEL STUDENT</Text>
          <Text style={styles.heroTitle}>{isSignedIn ? session?.user.email ?? "Your account" : "Your study plan"}</Text>
          <Text style={styles.heroBody}>{examYear ? `Exams in ${examYear}` : "Exam year not set"} · {selections.length} subjects</Text>
        </View>
        <View style={styles.heroBadge}><Ionicons name="school-outline" color="#FFFFFF" size={18} /></View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>YOUR COURSES</Text>
          <Text style={styles.sectionTitle}>A-level subjects</Text>
        </View>
        <Pressable onPress={() => router.push("/onboarding")}><Text style={styles.editText}>Edit plan</Text></Pressable>
      </View>

      <View style={styles.section}>
        {selections.map((selection, index) => {
          const subject = findSubject(selection.subjectId);
          return subject ? (
            <View key={subject.id} style={[styles.subject, index < selections.length - 1 && styles.subjectDivider]}>
              <View style={[styles.subjectIcon, { backgroundColor: subject.softColor }]}><Ionicons name={subject.icon} color={subject.color} size={21} /></View>
              <View style={styles.subjectCopy}>
                <Text style={styles.subjectTitle}>{subject.title}</Text>
                <Text style={styles.subjectMeta}>{selection.specificationId ?? "Exam board not chosen"} · Target {selection.targetGrade ?? "not set"}</Text>
              </View>
              <Ionicons name="chevron-forward" color={Colors.muted} size={18} />
            </View>
          ) : null;
        })}
      </View>

      <View style={styles.stats}>
        <ProfileStat value={`${selections.length}`} label="subjects" />
        <ProfileStat value="0" label="lessons" />
        <ProfileStat value="0m" label="study time" />
      </View>

      <View style={[styles.connection, isSignedIn && styles.connectionSignedIn]}>
        <View style={[styles.connectionIcon, isSignedIn && styles.connectionIconSignedIn]}>
          <Ionicons name={isSignedIn ? "cloud-done-outline" : "cloud-offline-outline"} color={isSignedIn ? Colors.success : Colors.primary} size={22} />
        </View>
        <View style={styles.connectionCopy}>
          <Text style={styles.connectionTitle}>{isSignedIn ? "Your plan is connected" : "Save your A-level plan"}</Text>
          <Text style={styles.connectionBody}>
            {isSignedIn
              ? isSyncing
                ? "Syncing your latest course choices…"
                : "Your subject choices are available across signed-in devices."
              : "Create an ACE account or sign in to keep your courses across devices."}
          </Text>
          {syncError ? <Text style={styles.syncError}>{syncError}</Text> : null}
        </View>
      </View>

      {isSignedIn ? (
        <Pressable onPress={() => void handleSignOut()} style={({ pressed }) => [styles.accountButton, pressed && styles.pressed]}>
          <Ionicons name="log-out-outline" color={Colors.danger} size={18} />
          <Text style={[styles.accountButtonText, { color: Colors.danger }]}>Sign out</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push("/account" as Href)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Ionicons name="person-add-outline" color="#FFFFFF" size={18} />
          <Text style={styles.primaryButtonText}>Create account or sign in</Text>
        </Pressable>
      )}
    </Screen>
  );
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  hero: { overflow: "hidden", flexDirection: "row", alignItems: "center", gap: 13, padding: 19, borderRadius: 27, backgroundColor: Colors.primaryDeep, ...Shadow.blue },
  heroGlow: { position: "absolute", width: 160, height: 160, borderRadius: 80, right: -55, top: -70, backgroundColor: "rgba(79,135,255,0.24)" },
  avatar: { width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary },
  heroCopy: { flex: 1, gap: 3 },
  heroEyebrow: { color: "#9EBEFF", fontSize: 8, fontWeight: "900", letterSpacing: 1.05 },
  heroTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  heroBody: { color: "rgba(255,255,255,0.65)", fontSize: 10 },
  heroBadge: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  sectionEyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  sectionTitle: { color: Colors.ink, fontSize: 21, fontWeight: "900", marginTop: 3 },
  editText: { color: Colors.primary, fontSize: 12, fontWeight: "900" },
  section: { paddingHorizontal: 17, borderRadius: 23, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface, ...Shadow.card },
  subject: { minHeight: 75, flexDirection: "row", alignItems: "center", gap: 11 },
  subjectDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  subjectIcon: { width: 43, height: 43, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  subjectCopy: { flex: 1, gap: 3 },
  subjectTitle: { color: Colors.ink, fontSize: 14, fontWeight: "900" },
  subjectMeta: { color: Colors.muted, fontSize: 10 },
  stats: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, alignItems: "center", paddingVertical: 15, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  statValue: { color: Colors.ink, fontSize: 18, fontWeight: "900" },
  statLabel: { color: Colors.muted, fontSize: 9, fontWeight: "700", marginTop: 2 },
  connection: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 17, borderRadius: 21, backgroundColor: Colors.primarySoft },
  connectionSignedIn: { backgroundColor: Colors.successSoft },
  connectionIcon: { width: 43, height: 43, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surface },
  connectionIconSignedIn: { backgroundColor: "#FFFFFF" },
  connectionCopy: { flex: 1, gap: 4 },
  connectionTitle: { color: Colors.ink, fontSize: 14, fontWeight: "900" },
  connectionBody: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
  syncError: { color: Colors.danger, fontSize: 10, lineHeight: 15 },
  primaryButton: { minHeight: 53, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 15, borderRadius: 17, backgroundColor: Colors.primary, ...Shadow.blue },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  accountButton: { minHeight: 51, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 17, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  accountButtonText: { fontSize: 13, fontWeight: "900" },
  pressed: { opacity: 0.84 },
});
