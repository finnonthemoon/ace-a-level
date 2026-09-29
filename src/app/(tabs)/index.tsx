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
      compact
      tabHeader
      eyebrow="ACE A LEVEL"
      title={greeting()}
      subtitle={`${selections.length} subjects in your plan${examYear ? ` · ${examYear} exams` : ""}`}
      trailing={<Pressable accessibilityLabel="Open profile" accessibilityRole="button" onPress={() => router.push("/(tabs)/profile")} style={styles.profileButton}><Ionicons name="person-outline" size={22} color={Colors.ink} /></Pressable>}
    >
      <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/learn")} style={({ pressed }) => [styles.hero, pressed && styles.heroPressed]}>
        {({ pressed }) => (
          <View style={styles.heroContent}>
            <View style={styles.heroCopy}>
              <View style={styles.heroKicker}><View style={styles.heroDot} /><Text style={styles.heroKickerText}>PICK UP A SUBJECT</Text></View>
              <Text style={styles.heroSubject}>{subject.title}</Text>
              <Text style={styles.heroTitle}>{subject.topics[0]?.title ?? "Explore your course"}</Text>
              <Text style={styles.heroDescription}>Explore your course, one topic at a time.</Text>
              <View style={[styles.heroAction, pressed && styles.heroActionPressed]}><Text style={styles.heroActionText}>View course</Text><Ionicons name="arrow-forward" size={17} color={Colors.primaryDeep} /></View>
            </View>
            <View pointerEvents="none" accessible={false} style={styles.heroArtwork}>
              <View style={styles.heroGlow} />
              <View style={styles.heroOrbit} />
              <Text style={styles.heroPi}>π</Text>
              <Text style={styles.heroX2}>x²</Text>
              <Ionicons name="sparkles" size={15} color="#CDE3FF" style={styles.heroSparkle} />
              <SubjectMascot subjectId={subject.id} size={126} style={styles.heroStar} />
            </View>
          </View>
        )}
      </Pressable>

      <View style={styles.sectionHeading}>
        <View><Text style={styles.sectionTitle}>Your subjects</Text><Text style={styles.sectionSubtitle}>Choose a subject to bring it into focus.</Text></View>
        <Pressable accessibilityRole="button" onPress={() => router.push("/onboarding")} style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}><Text style={styles.editText}>Edit plan</Text></Pressable>
      </View>

      <View style={styles.courseList}>
        {selections.map((selection) => {
          const item = findSubject(selection.subjectId);
          if (!item) return null;
          const active = item.id === activeSubjectId;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={item.id}
              onPress={() => transitionToSubject(item.id)}
              style={({ pressed }) => [styles.courseRow, { backgroundColor: item.softColor }, pressed && styles.pressed]}
            >
              <View style={[styles.courseIcon, { borderColor: item.softColor }]}><Ionicons name={item.icon} color={item.color} size={21} /></View>
              <View style={styles.courseCopy}><Text style={styles.courseTitle}>{item.title}</Text><Text style={styles.courseMeta}>{item.topics.length} topic areas · {selection.specificationId ?? "Board to be selected"}</Text></View>
              {active ? <View style={styles.currentPill}><Text style={styles.currentLabel}>Current</Text></View> : <View style={[styles.courseArrow, { borderColor: item.softColor }]}><Ionicons name="chevron-forward" color={item.color} size={17} /></View>}
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
  profileButton: { width: 43, height: 43, borderRadius: 22, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  hero: { overflow: "hidden", paddingHorizontal: 20, paddingVertical: 19, borderRadius: 25, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "#1B3563", shadowColor: Colors.primaryDeep, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.16, shadowRadius: 13, elevation: 3 },
  heroPressed: { opacity: 0.96, transform: [{ scale: 0.997 }] },
  heroContent: { minHeight: 188, flexDirection: "row", alignItems: "center" },
  heroCopy: { flex: 1, minWidth: 0, zIndex: 1 },
  heroKicker: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 13 },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#F5CA68" },
  heroKickerText: { color: "#D5E3F8", fontSize: 10, fontWeight: "700", letterSpacing: 1.05 },
  heroSubject: { color: "#C7D7F0", fontSize: 13, lineHeight: 17, fontWeight: "600" },
  heroTitle: { color: "#FFFFFF", fontSize: 26, lineHeight: 30, fontWeight: "700", letterSpacing: -0.55, marginTop: 3 },
  heroDescription: { color: "#D8E2F2", fontSize: 12, lineHeight: 17, marginTop: 8, maxWidth: 310 },
  heroArtwork: { width: 120, height: 150, flexShrink: 0, alignItems: "center", justifyContent: "center", marginLeft: -4, overflow: "visible" },
  heroGlow: { position: "absolute", width: 158, height: 158, borderRadius: 79, right: -24, top: -2, backgroundColor: "rgba(105,166,255,0.13)" },
  heroOrbit: { position: "absolute", width: 116, height: 116, borderRadius: 58, right: -4, top: 17, borderWidth: 1, borderColor: "rgba(210,231,255,0.12)" },
  heroPi: { position: "absolute", top: 11, left: 5, color: "#D7E8FF", fontSize: 12, fontWeight: "600", opacity: 0.46 },
  heroX2: { position: "absolute", right: 2, bottom: 11, color: "#D7E8FF", fontSize: 11, fontWeight: "600", fontStyle: "italic", opacity: 0.44 },
  heroSparkle: { position: "absolute", right: 7, top: 13, opacity: 0.58 },
  heroStar: { width: 126, height: 126, maxWidth: "100%" },
  heroAction: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 11, marginTop: 15, paddingHorizontal: 16, minHeight: 42, borderRadius: 12, backgroundColor: "#FFFFFF", shadowColor: "#081A3A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 1 },
  heroActionPressed: { backgroundColor: "#EAF1FC", transform: [{ scale: 0.98 }] },
  heroActionText: { color: Colors.primaryDeep, fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.78 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: -4 },
  sectionTitle: { color: Colors.ink, fontSize: 21, fontWeight: "700", letterSpacing: -0.35 },
  sectionSubtitle: { color: "#596579", fontSize: 12, marginTop: 3 },
  editButton: { minHeight: 35, justifyContent: "center", paddingHorizontal: 11, borderRadius: 11, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  editButtonPressed: { backgroundColor: Colors.primarySoft, opacity: 0.86 },
  editText: { color: Colors.primary, fontSize: 12, fontWeight: "700" },
  courseList: { gap: 8 },
  courseRow: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 17, borderWidth: 1, borderColor: "rgba(44,76,130,0.11)", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.045, shadowRadius: 6, elevation: 1 },
  courseIcon: { width: 43, height: 43, flexShrink: 0, borderRadius: 14, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.76)", alignItems: "center", justifyContent: "center" },
  courseCopy: { flex: 1, minWidth: 0, gap: 3 },
  courseTitle: { color: Colors.ink, fontSize: 15, lineHeight: 19, fontWeight: "700" },
  courseMeta: { color: "#596579", fontSize: 10.5, lineHeight: 14, fontWeight: "500" },
  currentPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.78)" },
  currentLabel: { color: Colors.primary, fontSize: 10, lineHeight: 13, fontWeight: "700" },
  courseArrow: { width: 30, height: 30, flexShrink: 0, borderRadius: 15, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.78)", alignItems: "center", justifyContent: "center" },
  practiceNote: { flexDirection: "row", alignItems: "flex-start", gap: 13, paddingHorizontal: 2 },
  practiceCopy: { flex: 1, gap: 4 },
  practiceTitle: { color: Colors.ink, fontSize: 14, fontWeight: "700" },
  practiceBody: { color: Colors.muted, fontSize: 12, lineHeight: 18 },
});
