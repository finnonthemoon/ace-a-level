import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CourseProgressCard } from "@/components/course/CourseProgressCard";
import { Screen } from "@/components/Screen";
import { TopicOverview } from "@/components/course/TopicOverview";
import { Colors } from "@/constants/theme";
import { resolveCoursePath, type CourseTopic } from "@/content/course-catalog";

function readinessLabel(readiness: CourseTopic["readiness"]) {
  if (readiness === "available") return "Explore";
  if (readiness === "planned") return "Planned";
  return "Coming soon";
}

function readinessColor(readiness: CourseTopic["readiness"]) {
  return readiness === "available" ? Colors.primary : Colors.muted;
}

export default function CourseOutlineScreen() {
  const router = useRouter();
  const { subjectId, coursePath } = useLocalSearchParams<{ subjectId: string; coursePath: string[] }>();
  const path = Array.isArray(coursePath) ? coursePath : coursePath ? [coursePath] : [];
  const resolved = resolveCoursePath(subjectId, path);
  const specification = resolved?.specification;
  const area = resolved?.area;
  const selectedTopic = resolved?.selectedTopic ?? null;
  const currentItems: readonly CourseTopic[] = resolved?.children ?? [];
  const title = selectedTopic?.title ?? area?.title ?? "Course";
  const subtitle = selectedTopic?.summary ?? area?.summary ?? "Explore your course outline.";

  function goBack() {
    if (router.canGoBack()) router.back();
    else if (path.length > 1) router.replace(`/course/${subjectId}/${path.slice(0, -1).join("/")}` as Href);
    else router.replace("/(tabs)/learn");
  }

  function openTopic(topic: CourseTopic) {
    router.push(`/course/${subjectId}/${[...path, topic.id].join("/")}` as Href);
  }

  if (!resolved || !specification || !area) {
    return (
      <Screen eyebrow="COURSE LIBRARY" title="Course unavailable" subtitle="This course outline could not be found." onBack={goBack}>
        <Pressable accessibilityRole="button" onPress={goBack} style={styles.returnButton}>
          <Text style={styles.returnButtonText}>Return to Learn</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </Pressable>
      </Screen>
    );
  }

  if (selectedTopic && currentItems.length === 0) {
    const progressTopicId = selectedTopic.contentId ?? [
      specification.qualification.id,
      specification.subject.id,
      specification.id,
      ...path,
    ].join(":");
    return <TopicOverview topic={selectedTopic} progressTopicId={progressTopicId} onBack={goBack} />;
  }

  return (
    <Screen
      eyebrow={`${specification.qualification.title} | ${specification.examBoard.title} ${specification.title}`}
      title={title}
      subtitle={subtitle}
      onBack={goBack}
    >
      {path.length === 1 ? (
        <View style={styles.specNote}>
          <Ionicons name="information-circle-outline" color={Colors.primary} size={19} />
          <Text style={styles.specNoteText}>Showing the {specification.title} topic structure (version {specification.version}). Lesson content is being added topic by topic.</Text>
        </View>
      ) : null}

      <CourseProgressCard completed={0} total={currentItems.length} />

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{path.length === 1 ? "Topic groups" : "Topics"}</Text>
        <Text style={styles.sectionMeta}>{currentItems.length} {currentItems.length === 1 ? "item" : "items"}</Text>
      </View>

      <View style={styles.list}>
        {currentItems.map((topic, index) => (
          <Pressable
            key={topic.id}
            accessibilityRole="button"
            accessibilityLabel={`${topic.title}, ${readinessLabel(topic.readiness)}`}
            onPress={() => openTopic(topic)}
            style={({ pressed }) => [styles.topicRow, index < currentItems.length - 1 && styles.divider, pressed && styles.pressed]}
          >
            <View style={[styles.numberBadge, topic.readiness === "available" && styles.activeNumberBadge]}>
              <Text style={[styles.number, topic.readiness === "available" && styles.activeNumber]}>{String(index + 1).padStart(2, "0")}</Text>
            </View>
            <View style={styles.topicCopy}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicSummary}>{topic.summary}</Text>
            </View>
            <View style={styles.trailing}>
              <Text style={[styles.status, { color: readinessColor(topic.readiness) }]}>{readinessLabel(topic.readiness)}</Text>
              <Ionicons name="chevron-forward" color={topic.readiness === "available" ? Colors.primary : "#9DA8B5"} size={17} />
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  specNote: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 14, borderRadius: 13, backgroundColor: Colors.primarySoft },
  specNoteText: { flex: 1, color: Colors.muted, fontSize: 11, lineHeight: 16 },
  sectionHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  sectionTitle: { color: Colors.ink, fontSize: 21, fontWeight: "700", letterSpacing: -0.3 },
  sectionMeta: { color: Colors.muted, fontSize: 12 },
  list: { paddingHorizontal: 16, borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  topicRow: { minHeight: 80, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13 },
  divider: { borderBottomColor: Colors.line, borderBottomWidth: 1 },
  numberBadge: { width: 37, height: 37, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#F1F3F5" },
  activeNumberBadge: { backgroundColor: Colors.primarySoft },
  number: { color: Colors.muted, fontSize: 11, fontWeight: "700" },
  activeNumber: { color: Colors.primary },
  topicCopy: { flex: 1, gap: 4 },
  topicTitle: { color: Colors.ink, fontSize: 14, fontWeight: "700" },
  topicSummary: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
  trailing: { alignItems: "flex-end", gap: 7 },
  status: { fontSize: 9, fontWeight: "700" },
  pressed: { opacity: 0.78 },
  returnButton: { minHeight: 46, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 16, borderRadius: 11, backgroundColor: Colors.primary },
  returnButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
