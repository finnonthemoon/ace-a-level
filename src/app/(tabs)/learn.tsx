import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Screen } from "@/components/Screen";
import { SubjectMascot } from "@/components/SubjectMascot";
import { SubjectSwitcher } from "@/components/SubjectSwitcher";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { useTopicProgress } from "@/contexts/TopicProgressContext";
import { countAreaLessons, findSpecification, getTopicProgressId, getVisibleAreaTopics, getVisibleLessons } from "@/content/course-catalog";
import { findSubject } from "@/product/subjects";

const areaIcons = {
  pure: "calculator-outline",
  statistics: "bar-chart-outline",
  mechanics: "move-outline",
} as const;

const areaAccents = {
  pure: { color: "#3978F6", soft: "#EAF1FF", wash: "#F5F8FF", border: "#E1EAFE", formula: "f(x)", motif: "pure" },
  statistics: { color: "#7758E8", soft: "#F0ECFF", wash: "#F8F6FF", border: "#EBE5FF", formula: "μ   Σ", motif: "statistics" },
  mechanics: { color: "#3477E8", soft: "#E8F2FF", wash: "#F3F8FF", border: "#DFEBFC", formula: "v = u + at", motif: "mechanics" },
} as const;

function AreaArtwork({ motif, color, formula }: { motif: "pure" | "statistics" | "mechanics"; color: string; formula: string }) {
  return (
    <View style={styles.artwork} pointerEvents="none" accessible={false}>
      <View style={styles.artworkMotifs}>
      <View style={[styles.artworkBlob, { backgroundColor: color }]} />
      <Text style={[styles.artworkFormula, { color }]}>{formula}</Text>
      {motif === "pure" ? <>
        <View style={[styles.graphAxisX, { backgroundColor: color }]} />
        <View style={[styles.graphAxisY, { backgroundColor: color }]} />
        <Svg width={94} height={52} viewBox="0 0 94 52" style={styles.pureCurve}>
          <Path d="M 0 3 C 25 3 22 43 47 43 C 72 43 69 3 94 3" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.34} />
        </Svg>
        <Text style={[styles.artworkLabel, styles.pureX2, { color }]}>x²</Text>
        <Text style={[styles.artworkLabel, styles.pureDerivative, { color }]}>f′(x)</Text>
      </> : null}
      {motif === "statistics" ? <>
        <View style={styles.histogram}>
          {[12, 20, 31, 39, 31, 20, 12].map((height, index) => (
            <View key={index} style={[styles.histogramBar, { height, backgroundColor: color, opacity: 0.22 + (index === 3 ? 0.12 : 0) }]} />
          ))}
        </View>
        <Svg width={90} height={38} viewBox="0 0 90 38" style={styles.statisticsCurve}>
          <Path d="M 0 35 C 24 35 21 3 45 3 C 69 3 66 35 90 35" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.34} />
        </Svg>
        <View style={[styles.scatterDot, styles.scatterOne, { backgroundColor: color }]} />
        <View style={[styles.scatterDot, styles.scatterTwo, { backgroundColor: color }]} />
        <View style={[styles.scatterDot, styles.scatterThree, { backgroundColor: color }]} />
      </> : null}
      {motif === "mechanics" ? <>
        <View style={[styles.trajectoryArc, { borderColor: color }]} />
        <View style={[styles.particle, { backgroundColor: color, borderColor: color }]} />
        <Ionicons name="arrow-up" size={20} color={color} style={styles.forceArrow} />
        <Ionicons name="arrow-forward" size={16} color={color} style={styles.motionArrow} />
        <Text style={[styles.artworkLabel, styles.forceLabel, { color }]}>F</Text>
        <Text style={[styles.artworkLabel, styles.accelerationLabel, { color }]}>a</Text>
        <Text style={[styles.mechanicsFormula, { color }]}>s = ut + ½at²</Text>
      </> : null}
      </View>
      <View style={[styles.chevronWrap, styles.artworkArrow, { backgroundColor: "rgba(255,255,255,0.82)" }]}>
        <Ionicons name="arrow-forward" size={15} color={color} />
      </View>
    </View>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const { activeSubjectId, qualificationLevel } = useCourse();
  const { getProgress } = useTopicProgress();
  const subject = findSubject(activeSubjectId);
  const specification = subject ? findSpecification(subject.id) : null;
  const availableLessons = specification
    ? specification.topicAreas.flatMap((area) => getVisibleAreaTopics(area, qualificationLevel).flatMap(({ group, topic }) => getVisibleLessons(topic, qualificationLevel).map((lesson) => ({ area, group, lesson, topic }))))
    : [];
  const completedLessons = availableLessons.filter(({ area, group, lesson, topic }) => getProgress(getTopicProgressId(specification!, area, group, topic)).completedLessonIds.includes(lesson.id)).length;
  const progressPercent = availableLessons.length ? Math.round((completedLessons / availableLessons.length) * 100) : 0;

  return (
    <Screen compact tabHeader eyebrow="COURSE LIBRARY" title="Learn" subtitle="A clear view of each subject, from first topic to final revision.">
      <SubjectSwitcher compact />

      {subject ? <>
        <View style={styles.summaryCard}>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryEyebrow}>{subject.title.toUpperCase()}</Text>
            <Text style={styles.summaryTitle}>{subject.topics.length} topic areas</Text>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Course progress</Text>
              <Text style={styles.progressValue}>{progressPercent}%</Text>
            </View>
            <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: progressPercent }} style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
          <View style={styles.mascotWrap}>
            <SubjectMascot subjectId={subject.id} size={88} style={styles.mascot} />
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.headingTitle}>Topic areas</Text>
          <Text style={styles.headingMeta}>{subject.topics.length} areas</Text>
        </View>

        <View style={styles.topicList}>
          {subject.topics.map((topic, index) => {
            const area = specification?.topicAreas.find((candidate) => candidate.id === topic.id);
            const descendants = area ? getVisibleAreaTopics(area, qualificationLevel) : [];
            const lessonCount = area ? countAreaLessons(area, qualificationLevel) : 0;
            const completedAreaLessons = descendants.reduce((total, { topic: courseTopic, group }) => {
              const topicProgress = getProgress(getTopicProgressId(specification!, area!, group, courseTopic));
              return total + getVisibleLessons(courseTopic, qualificationLevel).filter((lesson) => topicProgress.completedLessonIds.includes(lesson.id)).length;
            }, 0);
            const areaProgress = lessonCount ? Math.round((completedAreaLessons / lessonCount) * 100) : 0;
            const themed = subject.id === "mathematics" ? areaAccents[topic.id as keyof typeof areaAccents] : undefined;
            const isMathArea = Boolean(themed);
            const icon = areaIcons[topic.id as keyof typeof areaIcons] ?? "book-outline";
            const accent = themed ?? { color: subject.color, soft: subject.softColor, wash: Colors.surface, border: Colors.line, formula: "", motif: "pure" as const };
            const metadata = isMathArea
              ? lessonCount > 0
                ? `${descendants.length} topics, ${lessonCount} lesson${lessonCount === 1 ? "" : "s"} available`
                : `${descendants.length} topics, Coming soon`
              : lessonCount > 0
                ? `${descendants.length} topics, ${completedAreaLessons}/${lessonCount} lessons complete`
                : area ? `${descendants.length} topics, Coming soon` : `${index + 1} in your outline`;
            const cardContents = <>
              <View style={[isMathArea ? styles.topicIcon : styles.genericTopicIcon, { backgroundColor: accent.soft }]}>
                <Ionicons name={icon} size={isMathArea ? 23 : 21} color={accent.color} />
              </View>
              <View style={styles.topicCopy}>
                <View style={styles.topicTitleRow}><Text style={styles.topicTitle}>{topic.title}</Text></View>
                <Text style={styles.topicSummary} numberOfLines={2}>{topic.summary}</Text>
                <View style={styles.topicMetaRow}>
                  <Ionicons name="document-text-outline" size={12} color={Colors.muted} />
                  <Text style={styles.topicMeta} numberOfLines={1}>{isMathArea ? metadata.replace(", ", " · ") : metadata}</Text>
                </View>
                {isMathArea || lessonCount > 0 ? <View style={styles.areaProgressRow}>
                  <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: areaProgress }} style={styles.areaProgressTrack}>
                    <View style={[styles.areaProgressFill, { width: `${areaProgress}%`, backgroundColor: accent.color }]} />
                  </View>
                  <Text style={styles.areaProgressLabel}>{areaProgress}%</Text>
                </View> : null}
              </View>
              {isMathArea ? <AreaArtwork motif={accent.motif} color={accent.color} formula={accent.formula} /> : <>
                <View style={styles.genericArtwork}>
                  <Ionicons name={topic.id === "pure" ? "analytics-outline" : topic.id === "statistics" ? "stats-chart-outline" : "move-outline"} size={32} color={accent.color} />
                </View>
                <View style={[styles.chevronWrap, { backgroundColor: accent.soft }]}>
                  <Ionicons name={area ? "chevron-forward" : "lock-closed-outline"} color={accent.color} size={17} />
                </View>
              </>}
            </>;

            return area ? (
              <Pressable
                key={topic.id}
                accessibilityRole="button"
                onPress={() => router.push(`/course/${subject.id}/${topic.id}` as Href)}
                style={({ pressed }) => [isMathArea ? styles.topicCard : styles.genericTopicCard, isMathArea && { backgroundColor: accent.wash, borderColor: accent.border }, pressed && styles.pressed]}
              >
                {cardContents}
              </Pressable>
            ) : (
              <View key={topic.id} style={[isMathArea ? styles.topicCard : styles.genericTopicCard, isMathArea && { backgroundColor: accent.wash, borderColor: accent.border }]}>{cardContents}</View>
            );
          })}
        </View>
      </> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: { minHeight: 136, flexDirection: "row", alignItems: "center", overflow: "hidden", borderRadius: 19, paddingLeft: 18, paddingVertical: 14, backgroundColor: Colors.primarySoft },
  summaryCopy: { flex: 1, maxWidth: 420, zIndex: 1 },
  summaryEyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  summaryTitle: { color: Colors.ink, fontSize: 21, fontWeight: "700", letterSpacing: -0.3, marginTop: 3 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 5, maxWidth: 250 },
  progressLabel: { color: Colors.muted, fontSize: 11, fontWeight: "500" },
  progressValue: { color: Colors.primaryDark, fontSize: 11, fontWeight: "700" },
  progressTrack: { width: "100%", maxWidth: 250, height: 5, borderRadius: 5, backgroundColor: "#D5E1F6", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: Colors.primary },
  mascotWrap: { width: 94, height: 116, alignSelf: "stretch", justifyContent: "center", alignItems: "center", marginLeft: 4, marginRight: 3, borderBottomLeftRadius: 52, borderTopLeftRadius: 52, backgroundColor: "rgba(255,255,255,0.32)" },
  mascot: { maxWidth: "100%" },
  sectionHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: -8 },
  headingTitle: { color: Colors.ink, fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  headingMeta: { color: Colors.muted, fontSize: 12 },
  topicList: { gap: 10 },
  topicCard: { minHeight: 126, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 11, paddingVertical: 10, borderRadius: 18, borderWidth: 1, overflow: "hidden", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.045, shadowRadius: 7, elevation: 1 },
  genericTopicCard: { minHeight: 120, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  topicIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", alignSelf: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.85)" },
  genericTopicIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", marginTop: 1 },
  topicCopy: { flex: 1, minWidth: 0, gap: 4 },
  topicTitleRow: { flexDirection: "row", alignItems: "center" },
  topicTitle: { flexShrink: 1, color: Colors.ink, fontSize: 15, lineHeight: 19, fontWeight: "700" },
  topicSummary: { color: Colors.muted, fontSize: 10, lineHeight: 14 },
  topicMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  topicMeta: { flexShrink: 1, color: "#596579", fontSize: 10, lineHeight: 14, fontWeight: "500" },
  areaProgressRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  areaProgressTrack: { flex: 1, height: 6, maxWidth: 150, borderRadius: 5, backgroundColor: "rgba(74,98,143,0.13)", overflow: "hidden" },
  areaProgressFill: { height: "100%", borderRadius: 5 },
  areaProgressLabel: { width: 30, color: Colors.ink, fontSize: 10, fontWeight: "700", textAlign: "right" },
  artwork: { position: "relative", flexShrink: 0, width: 120, height: 104, marginLeft: 1 },
  artworkMotifs: { position: "absolute", top: 0, bottom: 0, left: -5, right: 0, opacity: 0.78, transform: [{ scale: 1.06 }] },
  artworkBlob: { position: "absolute", width: 116, height: 116, top: -5, right: -20, borderRadius: 60, opacity: 0.055 },
  artworkFormula: { position: "absolute", top: 10, left: 8, right: 25, fontSize: 10, fontWeight: "600", fontStyle: "italic", opacity: 0.48 },
  pureCurve: { position: "absolute", left: 16, bottom: 17 },
  statisticsCurve: { position: "absolute", left: 13, top: 41 },
  graphAxisX: { position: "absolute", left: 16, right: 8, bottom: 17, height: 1, opacity: 0.24 },
  graphAxisY: { position: "absolute", left: 22, top: 27, bottom: 15, width: 1, opacity: 0.24 },
  artworkLabel: { position: "absolute", fontSize: 9, fontWeight: "600", fontStyle: "italic", opacity: 0.44 },
  pureX2: { right: 14, bottom: 3 },
  pureDerivative: { right: 10, top: 35 },
  histogram: { position: "absolute", left: 18, right: 12, bottom: 15, height: 42, flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 3, borderBottomWidth: 1, borderBottomColor: "rgba(90,75,150,0.2)" },
  histogramBar: { width: 7, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  scatterDot: { position: "absolute", width: 4, height: 4, borderRadius: 2, opacity: 0.4 },
  scatterOne: { left: 29, top: 36 },
  scatterTwo: { left: 56, top: 24 },
  scatterThree: { left: 78, top: 40 },
  trajectoryArc: { position: "absolute", width: 76, height: 74, left: 14, top: 25, borderWidth: 1.5, borderTopColor: "rgba(52,119,232,0.32)", borderLeftColor: "rgba(52,119,232,0.28)", borderRightColor: "transparent", borderBottomColor: "transparent", borderTopLeftRadius: 70, borderTopRightRadius: 8, transform: [{ rotate: "12deg" }] },
  particle: { position: "absolute", width: 10, height: 10, borderRadius: 5, left: 20, top: 57, borderWidth: 2, opacity: 0.48 },
  forceArrow: { position: "absolute", left: 68, top: 36, opacity: 0.43 },
  motionArrow: { position: "absolute", left: 83, top: 60, opacity: 0.42 },
  forceLabel: { right: 18, top: 39 },
  accelerationLabel: { right: 9, top: 61 },
  mechanicsFormula: { position: "absolute", left: 8, bottom: 8, fontSize: 8, fontWeight: "600", fontStyle: "italic", opacity: 0.43 },
  genericArtwork: { width: 56, height: 76, alignItems: "center", justifyContent: "center", opacity: 0.48 },
  chevronWrap: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  artworkArrow: { position: "absolute", top: 3, right: 2, zIndex: 2, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  pressed: { opacity: 0.76 },
});
