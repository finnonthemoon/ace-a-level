import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { QualificationStageBadge } from "@/components/QualificationStageBadge";
import { Screen } from "@/components/Screen";
import { CollapsibleTopicGroup } from "@/components/course/CollapsibleTopicGroup";
import { TopicOverview } from "@/components/course/TopicOverview";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { useTopicProgress } from "@/contexts/TopicProgressContext";
import {
  getTopicStages,
  getTopicProgressId,
  getVisibleLessons,
  getVisibleTopics,
  resolveCoursePath,
  type CourseTopic,
  type CourseTopicGroup,
} from "@/content/course-catalog";

export default function CourseOutlineScreen() {
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const { subjectId, coursePath } = useLocalSearchParams<{ subjectId: string; coursePath: string[] }>();
  const path = Array.isArray(coursePath) ? coursePath : coursePath ? [coursePath] : [];
  const { qualificationLevel } = useCourse();
  const { getProgress, isHydrated } = useTopicProgress();
  const resolved = resolveCoursePath(subjectId, path, qualificationLevel);
  const specification = resolved?.specification;
  const area = resolved?.area;
  const selectedGroup = resolved?.selectedGroup ?? null;
  const selectedTopic = resolved?.selectedTopic ?? null;

  function goBack() {
    if (router.canGoBack()) router.back();
    else if (path.length > 2) router.replace(`/course/${subjectId}/${path.slice(0, -1).join("/")}` as Href);
    else if (path.length > 1) router.replace(`/course/${subjectId}/${path[0]}` as Href);
    else router.replace("/(tabs)/learn");
  }

  function openTopic(group: CourseTopicGroup, topic: CourseTopic) {
    if (!area) return;
    router.push(`/course/${subjectId}/${area.id}/${group.id}/${topic.id}` as Href);
  }

  if (!resolved || !specification || !area) {
    return (
      <Screen eyebrow="COURSE LIBRARY" title="Course unavailable" subtitle="This course outline could not be found for your selected qualification." onBack={goBack}>
        <Pressable accessibilityRole="button" onPress={goBack} style={styles.returnButton}>
          <Text style={styles.returnButtonText}>Return to Learn</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </Pressable>
      </Screen>
    );
  }

  if (selectedTopic) {
    const progressTopicId = getTopicProgressId(specification, area, selectedGroup!, selectedTopic);
    const learnHref = `/course-learn/${subjectId}/${area.id}/${selectedGroup!.id}/${selectedTopic.id}` as Href;
    return <TopicOverview topic={selectedTopic} progressTopicId={progressTopicId} learnHref={learnHref} onBack={goBack} />;
  }

  const groups = selectedGroup ? [selectedGroup] : area.topicGroups;
  const visibleGroups = groups.map((group) => ({ group, topics: getVisibleTopics(group, qualificationLevel) })).filter(({ topics }) => topics.length > 0);
  const title = selectedGroup?.title ?? area.title;
  const subtitle = selectedGroup ? "Choose a topic to explore." : area.summary;

  function renderTopicList(group: CourseTopicGroup, topics: readonly CourseTopic[]) {
    return (
      <View style={styles.list}>
        {topics.map((topic, index) => (
          <TopicRow
            key={topic.id}
            topic={topic}
            index={index}
            isHydrated={isHydrated}
            getProgress={getProgress}
            qualificationLevel={qualificationLevel}
            onPress={() => openTopic(group, topic)}
          />
        ))}
      </View>
    );
  }

  return (
    <Screen
      eyebrow={`${specification.examBoard.title} · ${specification.title}`}
      title={title}
      subtitle={subtitle}
      onBack={goBack}
    >
      {path.length === 1 ? (
        <View style={styles.courseInfo}>
          <View accessible={false} style={styles.courseInfoIcon}>
            <Ionicons name="information-circle-outline" color={Colors.primary} size={18} />
          </View>
          <View style={styles.courseInfoCopy}>
            <Text style={styles.courseInfoEyebrow}>YOUR COURSE</Text>
            <Text style={styles.courseInfoTitle}>
              {specification.examBoard.title} {specification.title} · {qualificationLevel === "as" ? "AS Level" : "A Level"}
            </Text>
            {qualificationLevel === "a-level" ? (
              <Text style={styles.courseInfoNote}>AS content is included as part of your A Level course.</Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.groupList}>
        {visibleGroups.map(({ group, topics }) => selectedGroup ? (
          <View key={group.id} style={styles.groupSection}>
            <View style={styles.groupHeading}>
              <View style={styles.groupHeadingCopy}>
                <Text style={styles.sectionTitle}>{group.title}</Text>
                <Text style={styles.sectionMeta}>{topics.length} {topics.length === 1 ? "topic" : "topics"}</Text>
              </View>
            </View>
            {renderTopicList(group, topics)}
          </View>
        ) : (
          <CollapsibleTopicGroup
            key={group.id}
            group={group}
            topics={topics}
            expanded={expandedGroups[group.id] ?? false}
            onToggle={() => setExpandedGroups((current) => ({ ...current, [group.id]: !(current[group.id] ?? false) }))}
          >
            {renderTopicList(group, topics)}
          </CollapsibleTopicGroup>
        ))}
      </View>
    </Screen>
  );
}

function TopicRow({
  topic,
  index,
  isHydrated,
  getProgress,
  qualificationLevel,
  onPress,
}: {
  topic: CourseTopic;
  index: number;
  isHydrated: boolean;
  getProgress: ReturnType<typeof useTopicProgress>["getProgress"];
  qualificationLevel: ReturnType<typeof useCourse>["qualificationLevel"];
  onPress: () => void;
}) {
  const lessons = getVisibleLessons(topic, qualificationLevel);
  const progress = getProgress(topic.contentId ?? topic.id);
  const completed = progress.completedLessonIds.filter((id) => lessons.some((lesson) => lesson.id === id)).length;
  const stages = getTopicStages(topic);
  const stageDescription = stages.map((stage) => stage === "as" ? "AS specification content" : "A Level only content").join(", ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${topic.title}, ${stageDescription}, ${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}${completed > 0 ? `, ${completed} complete` : ""}`}
      onPress={onPress}
      style={({ pressed }) => [styles.topicRow, index > 0 && styles.divider, pressed && styles.pressed]}
    >
      <View style={styles.topicIcon}><Ionicons name="book-outline" size={18} color={Colors.primary} /></View>
      <View style={styles.topicCopy}>
        <Text style={styles.topicTitle}>{topic.title}</Text>
        <Text numberOfLines={2} style={styles.topicSummary}>{topic.summary}</Text>
      </View>
      <View style={styles.topicMeta}>
        <View style={styles.badges}>{stages.map((stage) => <QualificationStageBadge key={stage} stage={stage} />)}</View>
        {isHydrated && completed > 0 ? <Text style={styles.progress}>{completed}/{lessons.length} lessons</Text> : null}
      </View>
      <Ionicons name="chevron-forward" color={Colors.primary} size={17} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  courseInfo: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 13, borderRadius: 14, backgroundColor: Colors.primarySoft },
  courseInfoIcon: { width: 28, height: 28, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: "#DDE8FA" },
  courseInfoCopy: { flex: 1, minWidth: 0, gap: 2 },
  courseInfoEyebrow: { color: Colors.primary, fontSize: 9, lineHeight: 12, fontWeight: "700", letterSpacing: 1.1 },
  courseInfoTitle: { color: Colors.ink, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  courseInfoNote: { color: Colors.muted, fontSize: 11, lineHeight: 15 },
  groupList: { gap: 0 },
  groupSection: { gap: 10 },
  groupHeading: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 1 },
  groupHeadingCopy: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", flex: 1, gap: 12 },
  sectionTitle: { color: Colors.ink, fontSize: 19, fontWeight: "700", letterSpacing: -0.3 },
  sectionMeta: { color: Colors.muted, fontSize: 11 },
  list: { paddingHorizontal: 14, borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  topicRow: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11 },
  divider: { borderTopColor: Colors.line, borderTopWidth: 1 },
  topicIcon: { width: 34, height: 34, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: Colors.primarySoft },
  topicCopy: { flex: 1, minWidth: 0, gap: 3 },
  topicTitle: { color: Colors.ink, fontSize: 13, lineHeight: 17, fontWeight: "700" },
  topicSummary: { color: Colors.muted, fontSize: 10, lineHeight: 14 },
  topicMeta: { alignItems: "flex-end", gap: 4 },
  badges: { flexDirection: "row", alignItems: "center", gap: 4 },
  progress: { color: Colors.muted, fontSize: 9, fontWeight: "600" },
  pressed: { opacity: 0.78 },
  returnButton: { minHeight: 46, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 16, borderRadius: 11, backgroundColor: Colors.primary },
  returnButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
