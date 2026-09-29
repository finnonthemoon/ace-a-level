import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { Screen } from "@/components/Screen";
import { SubjectMascot } from "@/components/SubjectMascot";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

const MODES = [
  {
    id: "diagnostic", icon: "pulse-outline", title: "Subject diagnostic",
    description: "Find your starting point and the topics to work on next.",
    accent: "#3975D6", tile: "#E6EFFD", wash: "#F5F8FF", border: "#E1EAF8",
  },
  {
    id: "topic", icon: "options-outline", title: "Topic practice",
    description: "Choose a topic and work through focused questions.",
    accent: "#7659C8", tile: "#EEE9FB", wash: "#FAF8FF", border: "#E9E2F5",
  },
  {
    id: "timed", icon: "timer-outline", title: "Timed assessment",
    description: "Build confidence with exam-style timing and questions.",
    accent: "#2B8398", tile: "#E3F2F5", wash: "#F5FAFB", border: "#DEEDF0",
  },
] as const;

type ModeId = (typeof MODES)[number]["id"];

function ModeMotif({ mode, color }: { mode: ModeId; color: string }) {
  return (
    <View pointerEvents="none" accessible={false} style={styles.motif}>
      <Svg width="100%" height="100%" viewBox="0 0 210 116">
        {mode === "diagnostic" ? (
          <>
            <Circle cx={156} cy={58} r={43} fill="none" stroke={color} strokeWidth={1.4} />
            <Circle cx={156} cy={58} r={29} fill="none" stroke={color} strokeWidth={1.3} />
            <Circle cx={156} cy={58} r={13} fill="none" stroke={color} strokeWidth={1.5} />
            <Circle cx={156} cy={58} r={3.5} fill={color} />
            <Path d="M156 4v10m0 88v10M102 58h10m88 0h10M118 20l7 7m62 62 7 7" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
            <Path d="M2 63h22l9-12 10 27 12-46 12 39 10-15 8 7h27" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9 26h28M13 34h17M22 91h40" fill="none" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
          </>
        ) : null}
        {mode === "topic" ? (
          <>
            <Path d="M11 58h42c15 0 16-29 35-29h31M53 58c15 0 17 31 35 31h31M119 29h28c16 0 18 29 35 29M119 89h28c16 0 18-31 35-31" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M88 29v60M182 58h22" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
            <Circle cx={11} cy={58} r={7} fill="none" stroke={color} strokeWidth={2} />
            <Circle cx={88} cy={29} r={8} fill={color} />
            <Circle cx={88} cy={89} r={8} fill="none" stroke={color} strokeWidth={2} />
            <Circle cx={119} cy={29} r={4} fill={color} />
            <Circle cx={119} cy={89} r={4} fill={color} />
            <Circle cx={182} cy={58} r={11} fill="none" stroke={color} strokeWidth={2} />
            <Circle cx={182} cy={58} r={4} fill={color} />
          </>
        ) : null}
        {mode === "timed" ? (
          <>
            <Path d="M12 19h65v78H12zM24 36h40M24 47h32M24 58h37M24 69h23" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={151} cy={60} r={43} fill="none" stroke={color} strokeWidth={1.7} />
            <Circle cx={151} cy={60} r={34} fill="none" stroke={color} strokeWidth={1} />
            <Path d="M151 26v8m0 52v8m-34-34h8m52 0h8m-59-25 6 6m38 38 6 6m0-50-6 6m-38 38-6 6M151 60V38m0 22 18 11M143 9h16m21 13 7-7" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={151} cy={60} r={3} fill={color} />
          </>
        ) : null}
      </Svg>
    </View>
  );
}

export default function PracticeScreen() {
  const router = useRouter();
  const { activeSubjectId } = useCourse();
  const subject = findSubject(activeSubjectId);
  const subjectName = subject?.title ?? "your subject";

  function openMode(mode: ModeId) {
    if (!subject) return;
    const href = mode === "topic"
      ? `/practice/course/${subject.id}`
      : `/practice/${mode}/${subject.id}`;
    router.push(href as Href);
  }

  return (
    <Screen compact tabHeader eyebrow="ASSESSMENTS" title="Practice" subtitle={`Build confidence in ${subjectName}, one session at a time.`}>
      <SubjectSwitcher compact />

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>YOUR PRACTICE SPACE</Text>
          <Text style={styles.heroTitle}>Make every session count.</Text>
          <Text style={styles.heroBody}>Pick a topic to focus on, or explore the formats we are building for you.</Text>
        </View>
        {subject ? (
          <View style={styles.mascotWrap}>
            <SubjectMascot subjectId={subject.id} size={96} />
          </View>
        ) : null}
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.headingTitle}>Choose your practice</Text>
      </View>

      <View style={styles.modeList}>
        {MODES.map((mode) => (
          <Pressable
            key={mode.id}
            accessibilityRole="button"
            accessibilityLabel={`${mode.title}. ${mode.description}`}
            onPress={() => openMode(mode.id)}
            disabled={!subject}
            style={({ pressed }) => [
              styles.modeCard,
              { backgroundColor: mode.wash, borderColor: mode.border },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.iconTile, { backgroundColor: mode.tile }]}>
              <Ionicons name={mode.icon} color={mode.accent} size={23} />
            </View>
            <View style={styles.modeCopy}>
              <Text style={styles.modeTitle}>{mode.title}</Text>
              <Text style={styles.modeDescription}>{mode.description}</Text>
            </View>
            <ModeMotif mode={mode.id} color={mode.accent} />
            <View style={[styles.arrowButton, { backgroundColor: mode.tile, borderColor: mode.border }]}>
              <Ionicons name="arrow-forward" color={mode.accent} size={18} />
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 145, flexDirection: "row", alignItems: "center", gap: 8, overflow: "hidden", borderRadius: 19, paddingLeft: 19, paddingVertical: 17, backgroundColor: Colors.primaryDeep },
  heroCopy: { flex: 1, zIndex: 1 },
  heroEyebrow: { color: "#BFCDE5", fontSize: 10, fontWeight: "700", letterSpacing: 0.9 },
  heroTitle: { color: Colors.surface, fontSize: 21, lineHeight: 26, fontWeight: "700", letterSpacing: -0.3, marginTop: 6 },
  heroBody: { color: "#D6DFEE", fontSize: 12, lineHeight: 17, marginTop: 7 },
  mascotWrap: { width: 100, height: 110, alignItems: "center", justifyContent: "center", marginRight: 5, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.07)" },
  sectionHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: -9 },
  headingTitle: { color: Colors.ink, fontSize: 22, fontWeight: "700", letterSpacing: -0.4 },
  modeList: { gap: 11 },
  modeCard: { minHeight: 112, flexDirection: "row", alignItems: "center", gap: 12, overflow: "hidden", paddingHorizontal: 14, paddingVertical: 17, borderRadius: 18, borderWidth: 1, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.055, shadowRadius: 8, elevation: 1 },
  iconTile: { width: 47, height: 47, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  modeCopy: { flex: 1, minWidth: 0, gap: 5, zIndex: 1 },
  modeTitle: { color: Colors.ink, fontSize: 16, lineHeight: 21, fontWeight: "700", letterSpacing: -0.15 },
  modeDescription: { color: "#566273", fontSize: 11, lineHeight: 16 },
  motif: { position: "absolute", right: 19, top: 2, bottom: 2, width: 210, opacity: 0.14 },
  arrowButton: { width: 35, height: 35, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 18, borderWidth: 1, zIndex: 1 },
  pressed: { opacity: 0.73 },
});
