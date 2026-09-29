import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Colors } from "@/constants/theme";
import { SUBJECTS, type SubjectIcon } from "@/product/subjects";

type AssessmentMode = "diagnostic" | "timed";

const modeDetails: Record<AssessmentMode, {
  eyebrow: string;
  title: string;
  lead: string;
  icon: SubjectIcon;
  features: { icon: SubjectIcon; title: string; description: string }[];
}> = {
  diagnostic: {
    eyebrow: "SUBJECT DIAGNOSTIC",
    title: "Find your starting point",
    lead: "A short check will help you see what feels secure and which topic areas need attention next.",
    icon: "pulse-outline",
    features: [
      { icon: "list-outline", title: "A short first check", description: "Around 15–20 questions are planned for each subject diagnostic." },
      { icon: "scan-outline", title: "A subject-wide picture", description: "The questions will sample topic areas across your subject." },
      { icon: "compass-outline", title: "A clearer next step", description: "Your results will point to weaker areas to revisit in Learn and Practice." },
    ],
  },
  timed: {
    eyebrow: "TIMED ASSESSMENT",
    title: "Build exam confidence",
    lead: "Practise working through exam-style questions with the pace and focus of an assessment.",
    icon: "timer-outline",
    features: [
      { icon: "document-text-outline", title: "Exam-style questions", description: "Assessment sets will bring several topics together." },
      { icon: "time-outline", title: "Specification timing", description: "Time limits will follow the supported specification for your subject." },
      { icon: "analytics-outline", title: "Review your work", description: "After each assessment, you’ll be able to see where to improve." },
    ],
  },
};

export function AssessmentPreview({ mode, subjectId }: { mode: AssessmentMode; subjectId: string }) {
  const router = useRouter();
  const subject = SUBJECTS.find((candidate) => candidate.id === subjectId);
  const details = modeDetails[mode];

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/practice");
  }

  if (!subject) {
    return <Screen eyebrow="PRACTICE" title="Subject unavailable" subtitle="This subject could not be found." onBack={goBack} />;
  }

  return (
    <Screen compact eyebrow={details.eyebrow} title={mode === "diagnostic" ? "Subject diagnostic" : "Timed assessment"} subtitle={`${subject.title} practice`} onBack={goBack}>
      <View style={[styles.hero, { backgroundColor: subject.softColor }]}>
        <View style={styles.heroTop}>
          <View style={[styles.heroIcon, { backgroundColor: "#FFFFFF" }]}>
            <Ionicons name={details.icon} color={subject.color} size={29} />
          </View>
          <View style={styles.statusPill}><View style={[styles.statusDot, { backgroundColor: subject.color }]} /><Text style={[styles.statusText, { color: subject.color }]}>IN PREPARATION</Text></View>
        </View>
        <Text style={styles.heroTitle}>{details.title}</Text>
        <Text style={styles.heroLead}>{details.lead}</Text>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>What to expect</Text>
        <Text style={styles.sectionMeta}>{subject.shortTitle}</Text>
      </View>
      <View style={styles.featureList}>
        {details.features.map((feature) => (
          <View key={feature.title} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: subject.softColor }]}>
              <Ionicons name={feature.icon} size={20} color={subject.color} />
            </View>
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.comingSoon}>
        <View style={styles.comingSoonIcon}><Ionicons name="sparkles-outline" size={20} color={subject.color} /></View>
        <View style={styles.comingSoonCopy}>
          <Text style={styles.comingSoonTitle}>Coming soon</Text>
          <Text style={styles.comingSoonDescription}>The {subject.title.toLowerCase()} {mode === "diagnostic" ? "diagnostic" : "timed assessment"} is being prepared. You can explore topic practice now.</Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(`/practice/course/${subject.id}` as Href)}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryButtonText}>Explore topic practice</Text>
        <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 210, gap: 10, padding: 21, borderRadius: 20, overflow: "hidden" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  heroIcon: { width: 57, height: 57, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.78)" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  heroTitle: { color: Colors.ink, fontSize: 23, lineHeight: 28, fontWeight: "700", letterSpacing: -0.4 },
  heroLead: { maxWidth: 480, color: Colors.muted, fontSize: 13, lineHeight: 19 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  sectionTitle: { color: Colors.ink, fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  sectionMeta: { color: Colors.muted, fontSize: 12 },
  featureList: { gap: 9 },
  featureCard: { flexDirection: "row", alignItems: "center", gap: 13, minHeight: 79, padding: 13, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.035, shadowRadius: 6, elevation: 1 },
  featureIcon: { width: 41, height: 41, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  featureCopy: { flex: 1, gap: 3 },
  featureTitle: { color: Colors.ink, fontSize: 14, fontWeight: "700" },
  featureDescription: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
  comingSoon: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 15, borderRadius: 16, backgroundColor: Colors.primarySoft },
  comingSoonIcon: { width: 33, height: 33, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  comingSoonCopy: { flex: 1, gap: 4 },
  comingSoonTitle: { color: Colors.ink, fontSize: 14, fontWeight: "700" },
  comingSoonDescription: { color: Colors.muted, fontSize: 11, lineHeight: 17 },
  primaryButton: { minHeight: 51, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 17, borderRadius: 13, backgroundColor: Colors.primary },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.8 },
});
