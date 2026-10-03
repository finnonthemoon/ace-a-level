import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Fonts } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { useStudyActivity } from "@/contexts/StudyActivityContext";
import { useTopicProgress } from "@/contexts/TopicProgressContext";
import { findSpecification, getTopicProgressId, getVisibleAreaTopics, getVisibleLessons } from "@/content/course-catalog";
import { findSubject } from "@/product/subjects";

export default function ProgressScreen() {
  const router = useRouter();
  const { qualificationLevel, selections } = useCourse();
  const { getProgress } = useTopicProgress();
  const { streakDays, todaySeconds } = useStudyActivity();
  const todayMinutes = Math.floor(todaySeconds / 60);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>YOUR LEARNING</Text><Text style={styles.title}>Progress</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Open profile and settings" onPress={() => router.push("/(tabs)/profile")} style={styles.settingsButton}>
            <Ionicons name="person-outline" size={21} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}><Ionicons name="flame" size={25} color="#FF865C" /><Text style={styles.statValue}>{streakDays}</Text><Text style={styles.statLabel}>day streak</Text></View>
          <View style={styles.statCard}><Ionicons name="time-outline" size={25} color="#C9A7FF" /><Text style={styles.statValue}>{todayMinutes}</Text><Text style={styles.statLabel}>minutes today</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Course progress</Text>
        <View style={styles.subjects}>
          {selections.map((selection) => {
            const subject = findSubject(selection.subjectId);
            const specification = subject ? findSpecification(subject.id) : null;
            const lessons = specification?.topicAreas.flatMap((area) => getVisibleAreaTopics(area, qualificationLevel).flatMap(({ topic }) => getVisibleLessons(topic, qualificationLevel))) ?? [];
            const completed = specification?.topicAreas.reduce((total, area) => total + getVisibleAreaTopics(area, qualificationLevel).reduce((areaTotal, { group, topic }) => {
              const progress = getProgress(getTopicProgressId(specification, area, group, topic));
              return areaTotal + getVisibleLessons(topic, qualificationLevel).filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
            }, 0), 0) ?? 0;
            const percent = lessons.length ? Math.round(completed / lessons.length * 100) : 0;
            if (!subject) return null;
            return (
              <View key={subject.id} style={styles.subjectCard}>
                <View style={[styles.subjectIcon, { backgroundColor: subject.softColor }]}><Ionicons name={subject.icon} size={22} color={subject.color} /></View>
                <View style={styles.subjectCopy}>
                  <View style={styles.subjectHeading}><Text style={styles.subjectTitle}>{subject.title}</Text><Text style={styles.percent}>{percent}%</Text></View>
                  <View style={styles.track}><View style={[styles.fill, { width: `${percent}%`, backgroundColor: subject.color }]} /></View>
                  <Text style={styles.subjectMeta}>{lessons.length ? `${completed} of ${lessons.length} lessons` : "Course content coming soon"}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  content: { width: "100%", maxWidth: 820, alignSelf: "center", gap: 23, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 46 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: "#FF6A3A", fontSize: 10, lineHeight: 14, fontFamily: Fonts.sansExtraBold, letterSpacing: 1.2 },
  title: { color: "#FFFFFF", fontSize: 34, lineHeight: 40, fontFamily: Fonts.display },
  settingsButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 21, backgroundColor: "#242426" },
  stats: { flexDirection: "row", gap: 11 },
  statCard: { flex: 1, minHeight: 132, justifyContent: "center", gap: 4, padding: 17, borderRadius: 19, backgroundColor: "#1A1A1C" },
  statValue: { color: "#FFFFFF", fontSize: 30, lineHeight: 34, fontFamily: Fonts.sansExtraBold },
  statLabel: { color: "#A9A9B0", fontSize: 11, fontFamily: Fonts.sansSemiBold },
  sectionTitle: { color: "#FFFFFF", fontSize: 20, lineHeight: 25, fontFamily: Fonts.sansExtraBold },
  subjects: { gap: 10 },
  subjectCard: { minHeight: 92, flexDirection: "row", alignItems: "center", gap: 13, padding: 14, borderRadius: 17, backgroundColor: "#171719" },
  subjectIcon: { width: 45, height: 45, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  subjectCopy: { flex: 1, gap: 7 },
  subjectHeading: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  subjectTitle: { color: "#FFFFFF", fontSize: 14, fontFamily: Fonts.sansExtraBold },
  percent: { color: "#D4D4D8", fontSize: 12, fontFamily: Fonts.sansExtraBold },
  track: { height: 5, overflow: "hidden", borderRadius: 4, backgroundColor: "#333337" },
  fill: { height: "100%", borderRadius: 4 },
  subjectMeta: { color: "#929299", fontSize: 10.5, fontFamily: Fonts.sans },
});
