import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

export default function ProfileScreen() {
  const router = useRouter();
  const { examYear, selections } = useCourse();
  return (
    <Screen eyebrow="YOUR PLAN" title="Profile">
      <View style={styles.hero}><View style={styles.avatar}><Ionicons name="person" color="#FFFFFF" size={30} /></View><View><Text style={styles.heroTitle}>A-level learner</Text><Text style={styles.heroBody}>{examYear ? `Exam year ${examYear}` : "Exam year not set"}</Text></View></View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your subjects</Text>
        {selections.map((selection) => {
          const subject = findSubject(selection.subjectId);
          return subject ? <View key={subject.id} style={styles.subject}><View style={[styles.subjectIcon, { backgroundColor: subject.softColor }]}><Ionicons name={subject.icon} color={subject.color} size={20} /></View><View style={styles.subjectCopy}><Text style={styles.subjectTitle}>{subject.title}</Text><Text style={styles.subjectMeta}>{selection.specificationId ?? "Exam board not chosen"} · Target {selection.targetGrade ?? "not set"}</Text></View></View> : null;
        })}
      </View>
      <TouchableOpacity onPress={() => router.push("/onboarding")} style={styles.button}><Ionicons name="create-outline" color="#FFFFFF" size={18} /><Text style={styles.buttonText}>Edit study plan</Text></TouchableOpacity>
      <View style={styles.connection}><Ionicons name="server-outline" color={Colors.success} size={18} /><View style={styles.connectionCopy}><Text style={styles.connectionTitle}>Shared services ready</Text><Text style={styles.connectionBody}>Supabase and RevenueCat configuration points are namespaced for ACE A Level. Dashboard setup is still required.</Text></View></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", alignItems: "center", gap: 14, padding: 19, borderRadius: 24, backgroundColor: Colors.ink },
  avatar: { width: 56, height: 56, borderRadius: 20, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  heroTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  heroBody: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 3 },
  section: { backgroundColor: Colors.surface, borderRadius: 22, borderWidth: 1, borderColor: Colors.line, padding: 17, gap: 12 },
  sectionTitle: { color: Colors.ink, fontSize: 17, fontWeight: "900" },
  subject: { flexDirection: "row", alignItems: "center", gap: 11 },
  subjectIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  subjectCopy: { flex: 1 },
  subjectTitle: { color: Colors.ink, fontSize: 14, fontWeight: "800" },
  subjectMeta: { color: Colors.muted, fontSize: 11, marginTop: 2 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.primary, padding: 15, borderRadius: 17 },
  buttonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  connection: { flexDirection: "row", gap: 11, padding: 16, backgroundColor: "#E8F7EE", borderRadius: 18 },
  connectionCopy: { flex: 1, gap: 3 },
  connectionTitle: { color: "#215F42", fontSize: 13, fontWeight: "900" },
  connectionBody: { color: "#41725B", fontSize: 11, lineHeight: 16 },
});
