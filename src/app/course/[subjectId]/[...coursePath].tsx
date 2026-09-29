import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { CourseProgressCard } from "@/components/course/CourseProgressCard";
import { Screen } from "@/components/Screen";
import { TopicOverview } from "@/components/course/TopicOverview";
import { Colors } from "@/constants/theme";
import {
  findSpecification,
  findTopicArea,
  type CourseTopic,
} from "@/content/course-catalog";

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
  const specification = findSpecification(subjectId, path[0]);
  const area = specification && path[0] ? findTopicArea(specification, path[0]) : null;

  let currentItems: readonly CourseTopic[] = area?.topics ?? [];
  let title = area?.title ?? "Course";
  let subtitle = area?.summary ?? "Explore your course outline.";
  let validPath = Boolean(specification && area);
  let selectedTopic: CourseTopic | null = null;

  for (const segment of path.slice(1)) {
    const selected = currentItems.find((topic) => topic.id === segment);
    if (!selected) {
      validPath = false;
      break;
    }
    title = selected.title;
    subtitle = selected.summary;
    currentItems = selected.topics ?? [];
    selectedTopic = selected;
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/learn");
  }

  function openTopic(topic: CourseTopic) {
    if (topic.readiness !== "available") {
      Alert.alert(
        topic.readiness === "planned" ? "Planned next" : "Coming soon",
        topic.readiness === "planned"
          ? `${topic.title} is the first planned lesson and practice topic.`
          : `Content for ${topic.title} is being prepared.`,
      );
      return;
    }
    router.push(`/course/${subjectId}/${[...path, topic.id].join("/")}` as Href);
  }

  if (!validPath || !specification || !area) {
    return (
      <Screen eyebrow="COURSE LIBRARY" title="Course unavailable" subtitle="This course outline could not be found." onBack={goBack}>
        <Pressable accessibilityRole="button" onPress={goBack} style={styles.returnButton}>
          <Text style={styles.returnButtonText}>Return to Learn</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </Pressable>
      </Screen>
    );
  }

  if (selectedTopic && (selectedTopic.lessonIds.length > 0 || selectedTopic.practiceSetIds.length > 0)) {
    return <TopicOverview topic={selectedTopic} onBack={goBack} />;
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
          <Text style={styles.specNoteText}>Initial OCR MEI Mathematics B outline. Topic names are scaffolding and may be refined against the specification.</Text>
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
              {topic.id === "quadratics" ? <Text style={styles.planNote}>First lesson and practice topic</Text> : null}
            </View>
            <View style={styles.trailing}>
              <Text style={[styles.status, { color: readinessColor(topic.readiness) }]}>{readinessLabel(topic.readiness)}</Text>
              <Ionicons name={topic.readiness === "available" ? "chevron-forward" : "lock-closed-outline"} color={topic.readiness === "available" ? Colors.primary : "#9DA8B5"} size={17} />
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
  planNote: { color: Colors.primary, fontSize: 10, fontWeight: "600", marginTop: 2 },
  trailing: { alignItems: "flex-end", gap: 7 },
  status: { fontSize: 9, fontWeight: "700" },
  pressed: { opacity: 0.78 },
  returnButton: { minHeight: 46, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 16, borderRadius: 11, backgroundColor: Colors.primary },
  returnButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
