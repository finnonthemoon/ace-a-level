import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SubjectMascot } from "@/components/SubjectMascot";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { useSubjectTransition } from "@/contexts/SubjectTransitionContext";
import { findSubject } from "@/product/subjects";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";
}

export default function HomeScreen() {
  const router = useRouter();
  const { activeSubjectId, examYear, isHydrated, selections } = useCourse();
  const { transitionToSubject } = useSubjectTransition();
  const subject = findSubject(activeSubjectId);

  useEffect(() => {
    if (isHydrated && selections.length === 0) router.replace("/onboarding");
  }, [isHydrated, router, selections.length]);

  if (!isHydrated || !subject) {
    return <View style={styles.loading}><ActivityIndicator color={Colors.primary} /><Text style={styles.loadingText}>Opening your study plan…</Text></View>;
  }

  return (
    <Screen
      eyebrow="ACE A LEVEL"
      title={greeting()}
      subtitle={`${selections.length} subjects in your plan${examYear ? ` · ${examYear} exams` : ""}`}
      trailing={<Pressable accessibilityLabel="Open profile" accessibilityRole="button" onPress={() => router.push("/(tabs)/profile")} style={styles.profileButton}><Ionicons name="person-outline" size={22} color={Colors.ink} /></Pressable>}
    >
      <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/learn")} style={({ pressed }) => [styles.hero, pressed && styles.pressed]}>
        <View style={styles.heroTop}>
          <View style={styles.heroKicker}><View style={styles.heroDot} /><Text style={styles.heroKickerText}>PICK UP A SUBJECT</Text></View>
          <SubjectMascot subjectId={subject.id} size={112} style={styles.heroStar} />
        </View>
        <Text style={styles.heroSubject}>{subject.title}</Text>
        <Text style={styles.heroTitle}>{subject.topics[0]?.title ?? "Explore your course"}</Text>
        <Text style={styles.heroDescription}>Explore the topic outline and see what’s ahead in your course.</Text>
        <View style={styles.heroAction}><Text style={styles.heroActionText}>View course</Text><Ionicons name="arrow-forward" size={17} color={Colors.primaryDeep} /></View>
      </Pressable>

      <View style={styles.sectionHeading}>
        <View><Text style={styles.sectionTitle}>Your subjects</Text><Text style={styles.sectionSubtitle}>Choose a subject to bring it into focus.</Text></View>
        <Pressable accessibilityRole="button" onPress={() => router.push("/onboarding")} style={styles.editButton}><Text style={styles.editText}>Edit plan</Text></Pressable>
      </View>

      <View style={styles.courseList}>
        {selections.map((selection, index) => {
          const item = findSubject(selection.subjectId);
          if (!item) return null;
          const active = item.id === activeSubjectId;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={item.id}
              onPress={() => transitionToSubject(item.id)}
              style={({ pressed }) => [styles.courseRow, index < selections.length - 1 && styles.courseDivider, pressed && styles.pressed]}
            >
              <View style={[styles.courseIcon, { backgroundColor: item.softColor }]}><Ionicons name={item.icon} color={item.color} size={21} /></View>
              <View style={styles.courseCopy}><Text style={styles.courseTitle}>{item.title}</Text><Text style={styles.courseMeta}>{item.topics.length} topic areas · {selection.specificationId ?? "Board to be selected"}</Text></View>
              {active ? <Text style={styles.currentLabel}>Current</Text> : <Ionicons name="chevron-forward" color={Colors.muted} size={18} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.practiceNote}>
        <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
        <View style={styles.practiceCopy}><Text style={styles.practiceTitle}>Practice, coming next</Text><Text style={styles.practiceBody}>Question sets and assessments are being prepared for your subjects.</Text></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, flexDirection: "row", gap: 10, backgroundColor: Colors.cream, alignItems: "center", justifyContent: "center" },
  loadingText: { color: Colors.muted, fontSize: 14 },
  profileButton: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  hero: { padding: 23, borderRadius: 22, backgroundColor: Colors.primaryDeep, overflow: "hidden" },
  heroTop: { height: 108, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  heroKicker: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 4 },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F5CA68" },
  heroKickerText: { color: "#BFCDE5", fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  heroStar: { marginTop: -18, marginRight: -8 },
  heroSubject: { color: "#BFCDE5", fontSize: 13, fontWeight: "600" },
  heroTitle: { color: "#FFFFFF", fontSize: 29, lineHeight: 34, fontWeight: "700", letterSpacing: -0.7, marginTop: 4 },
  heroDescription: { color: "#D6DFEE", fontSize: 13, lineHeight: 20, marginTop: 10, maxWidth: 470 },
  heroAction: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 9, marginTop: 20, paddingHorizontal: 15, minHeight: 43, borderRadius: 10, backgroundColor: "#FFFFFF" },
  heroActionText: { color: Colors.primaryDeep, fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.83 },
  sectionHeading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10 },
  sectionTitle: { color: Colors.ink, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  sectionSubtitle: { color: Colors.muted, fontSize: 13, marginTop: 5 },
  editButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  editText: { color: Colors.primary, fontSize: 13, fontWeight: "700" },
  courseList: { paddingHorizontal: 17, borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  courseRow: { minHeight: 77, flexDirection: "row", alignItems: "center", gap: 13 },
  courseDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  courseIcon: { width: 43, height: 43, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  courseCopy: { flex: 1, gap: 4 },
  courseTitle: { color: Colors.ink, fontSize: 15, fontWeight: "700" },
  courseMeta: { color: Colors.muted, fontSize: 11, lineHeight: 15 },
  currentLabel: { color: Colors.primary, fontSize: 11, fontWeight: "700" },
  practiceNote: { flexDirection: "row", alignItems: "flex-start", gap: 13, paddingHorizontal: 2 },
  practiceCopy: { flex: 1, gap: 4 },
  practiceTitle: { color: Colors.ink, fontSize: 14, fontWeight: "700" },
  practiceBody: { color: Colors.muted, fontSize: 12, lineHeight: 18 },
});
