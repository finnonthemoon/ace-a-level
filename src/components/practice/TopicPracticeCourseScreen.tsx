import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import {
  findSpecification,
  getTopicProgressId,
  getVisibleTopics,
  resolveCoursePath,
  type ContentStatus,
  type CourseTopic,
  type CourseTopicArea,
} from "@/content/course-catalog";
import { findPracticeSet, findQuestions, getVisiblePracticeSets } from "@/content/practice-content";
import { useTopicProgress } from "@/contexts/TopicProgressContext";
import { findSubject, type SubjectId } from "@/product/subjects";

interface TopicPracticeCourseScreenProps {
  subjectId: string;
  path: readonly string[];
}

function ownQuestionCount(topic: CourseTopic) {
  return topic.practiceSetIds.reduce((total, id) => {
    const set = findPracticeSet(id);
    return total + (set ? findQuestions(set.questionIds).length : 0);
  }, 0);
}

function questionCount(topic: CourseTopic): number {
  return ownQuestionCount(topic);
}

function statusLabel(readiness: ContentStatus, questions: number) {
  if (questions > 0) return "Ready to practise";
  return readiness === "planned" ? "Planned" : "Coming soon";
}

function itemMeta(children: number, questions: number) {
  const topicText = `${children} ${children === 1 ? "topic" : "topics"}`;
  const questionText = `${questions} ${questions === 1 ? "question" : "questions"} ready`;
  if (children > 0 && questions > 0) return `${topicText} · ${questionText}`;
  if (children > 0) return topicText;
  return questions > 0 ? questionText : "Practice questions coming soon";
}

interface TopicCardProps {
  title: string;
  summary: string;
  childCount: number;
  questions: number;
  readiness: ContentStatus;
  color: string;
  softColor: string;
  onPress: () => void;
}

function TopicCard({ title, summary, childCount, questions, readiness, color, softColor, onPress }: TopicCardProps) {
  const ready = questions > 0;
  const status = statusLabel(readiness, questions);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${itemMeta(childCount, questions)}, ${status}`}
      onPress={onPress}
      style={({ pressed }) => [styles.topicCard, pressed && styles.pressed]}
    >
      <View style={[styles.topicIcon, { backgroundColor: softColor }]}>
        <Ionicons name={childCount > 0 ? "layers-outline" : "locate-outline"} size={22} color={color} />
      </View>
      <View style={styles.topicCopy}>
        <Text style={styles.topicTitle}>{title}</Text>
        {summary ? <Text style={styles.topicSummary} numberOfLines={2}>{summary}</Text> : null}
        <Text style={styles.topicMeta}>{itemMeta(childCount, questions)}</Text>
      </View>
      <View style={styles.topicTrailing}>
        <Text style={[styles.topicStatus, { color: ready ? Colors.success : Colors.muted }]}>{status}</Text>
        <View style={[styles.arrowTile, { backgroundColor: softColor }]}>
          <Ionicons name="arrow-forward" size={16} color={color} />
        </View>
      </View>
    </Pressable>
  );
}

export function TopicPracticeCourseScreen({ subjectId, path }: TopicPracticeCourseScreenProps) {
  const router = useRouter();
  const { getProgress, isHydrated } = useTopicProgress();
  const { qualificationLevel } = useCourse();
  const subject = findSubject(subjectId as SubjectId);
  const specification = findSpecification(subjectId);
  const resolved = path.length > 0 ? resolveCoursePath(subjectId, path, qualificationLevel) : null;
  const area = resolved?.area ?? null;
  const selectedTopic = resolved?.selectedTopic ?? null;
  const selectedGroup = resolved?.selectedGroup ?? null;
  const currentItems: readonly CourseTopic[] = resolved?.selectedGroup
    ? resolved.children
    : area
      ? area.topicGroups.flatMap((group) => getVisibleTopics(group, qualificationLevel))
      : [];

  function goBack() {
    if (router.canGoBack()) router.back();
    else if (path.length > 1) router.replace(`/practice/course/${subjectId}/${path.slice(0, -1).join("/")}` as Href);
    else if (path.length === 1) router.replace(`/practice/course/${subjectId}` as Href);
    else router.replace("/(tabs)/practice");
  }

  function openPath(segment: string) {
    router.push(`/practice/course/${subjectId}/${[...path, segment].join("/")}` as Href);
  }

  if (!subject) {
    return <Screen eyebrow="TOPIC PRACTICE" title="Subject unavailable" subtitle="This subject could not be found." onBack={goBack} />;
  }

  if (!specification) {
    return (
      <Screen eyebrow="TOPIC PRACTICE" title={subject.title} subtitle={`Choose questions from your ${subject.title} course as content becomes available.`} onBack={goBack}>
        <View style={[styles.emptyCard, { borderColor: subject.softColor }]}>
          <View style={[styles.emptyIcon, { backgroundColor: subject.softColor }]}>
            <Ionicons name="library-outline" size={27} color={subject.color} />
          </View>
          <Text style={[styles.emptyEyebrow, { color: subject.color }]}>COURSE CONTENT COMING SOON</Text>
          <Text style={styles.emptyTitle}>{subject.title} topic practice is on its way</Text>
          <Text style={styles.emptyBody}>The course tree and its practice questions will appear here when they are ready.</Text>
        </View>
      </Screen>
    );
  }

  if (path.length > 0 && !resolved) {
    return (
      <Screen eyebrow="TOPIC PRACTICE" title="Topic unavailable" subtitle="This topic could not be found in the course catalog." onBack={goBack}>
        <Pressable accessibilityRole="button" onPress={() => router.replace(`/practice/course/${subjectId}` as Href)} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Browse {subject.title} topics</Text>
          <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
        </Pressable>
      </Screen>
    );
  }

  if (area && selectedTopic && currentItems.length === 0) {
    const progressTopicId = getTopicProgressId(specification, area, selectedGroup!, selectedTopic);
    const progress = getProgress(progressTopicId);
    const practiceSets = getVisiblePracticeSets(selectedTopic.practiceSetIds, qualificationLevel)
      .map((set) => ({ set, questions: findQuestions(set.questionIds).length }))
      .filter(({ questions }) => questions > 0);
    const availableQuestions = practiceSets.reduce((total, { questions }) => total + questions, 0);
    const parentPath = path.slice(0, -1);
    const parentPathResult = parentPath.length > 1 ? resolveCoursePath(subjectId, parentPath, qualificationLevel) : null;
    const parentTitle = parentPathResult?.selectedGroup?.title ?? parentPathResult?.selectedTopic?.title;
    const breadcrumb = [subject.title, area.title, ...(parentTitle ? [parentTitle] : [])].join(" / ");
    const accuracy = progress.questionsAttempted > 0
      ? Math.round((progress.questionsCorrect / progress.questionsAttempted) * 100)
      : 0;

    return (
      <Screen eyebrow="TOPIC PRACTICE" title={selectedTopic.title} subtitle={selectedTopic.summary} onBack={goBack}>
        <View style={styles.breadcrumb}>
          <Ionicons name="grid-outline" size={15} color={subject.color} />
          <Text style={styles.breadcrumbText}>{breadcrumb}</Text>
        </View>

        <View style={[styles.overviewCard, { backgroundColor: subject.softColor }]}>
          <View style={styles.overviewTop}>
            <View style={[styles.overviewIcon, { backgroundColor: Colors.surface }]}>
              <Ionicons name="locate-outline" size={26} color={subject.color} />
            </View>
            <View style={styles.overviewCopy}>
              <Text style={[styles.overviewEyebrow, { color: subject.color }]}>PRACTICE OVERVIEW</Text>
              <Text style={styles.overviewTitle}>{availableQuestions > 0 ? "Ready for a focused session" : "Practice coming soon"}</Text>
              <Text style={styles.overviewBody}>{availableQuestions > 0
                ? "Work through questions and get immediate feedback on every answer."
                : `Questions for ${selectedTopic.title} are being prepared. You can return here as soon as they are ready.`}</Text>
            </View>
          </View>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{availableQuestions}</Text>
              <Text style={styles.overviewStatLabel}>{availableQuestions === 1 ? "question" : "questions"} available</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{practiceSets.length}</Text>
              <Text style={styles.overviewStatLabel}>{practiceSets.length === 1 ? "practice set" : "practice sets"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeading}>
            <View style={styles.progressIcon}><Ionicons name="stats-chart-outline" size={19} color={subject.color} /></View>
            <View style={styles.progressCopy}>
              <Text style={styles.sectionTitle}>Previous practice</Text>
              <Text style={styles.sectionSubtitle}>{!isHydrated ? "Loading your progress…" : progress.questionsAttempted > 0
                ? `${progress.questionsCorrect} of ${progress.questionsAttempted} answers correct · ${accuracy}% accuracy`
                : "Your results will appear after your first session."}</Text>
            </View>
          </View>
          {isHydrated && progress.questionsAttempted > 0 ? (
            <View style={styles.progressFooter}>
              <Text style={styles.progressFootText}>{progress.completedPracticeSessionIds.length} {progress.completedPracticeSessionIds.length === 1 ? "session" : "sessions"} completed</Text>
            </View>
          ) : null}
        </View>

        {practiceSets.length > 0 ? (
          <View style={styles.setsSection}>
            {practiceSets.length > 1 ? <Text style={styles.sectionTitle}>Available practice sets</Text> : null}
            {practiceSets.map(({ set, questions }, index) => (
              <Pressable
                key={set.id}
                accessibilityRole="button"
                disabled={!isHydrated}
                onPress={() => router.push(`/practice/${set.id}` as Href)}
                style={({ pressed }) => [index === 0 ? styles.primaryButton : styles.secondaryButton, !isHydrated && styles.disabled, pressed && styles.pressed]}
              >
                <View style={styles.setButtonCopy}>
                  <Text style={index === 0 ? styles.primaryButtonText : styles.secondaryButtonText}>{index === 0 ? "Start practice" : set.title}</Text>
                  <Text style={index === 0 ? styles.primaryButtonMeta : styles.secondaryButtonMeta}>{set.title} · {questions} {questions === 1 ? "question" : "questions"}</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={index === 0 ? "#FFFFFF" : subject.color} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.comingSoonCard}>
            <Ionicons name="time-outline" size={21} color={subject.color} />
            <View style={styles.comingSoonCopy}>
              <Text style={styles.comingSoonTitle}>Questions are coming soon</Text>
              <Text style={styles.comingSoonText}>This topic is in the course outline. A practice set is not available yet.</Text>
            </View>
          </View>
        )}
      </Screen>
    );
  }

  const isRoot = path.length === 0;
  const items: readonly (CourseTopicArea | CourseTopic)[] = isRoot ? specification.topicAreas : currentItems;
  const title = isRoot ? subject.title : selectedTopic?.title ?? area?.title ?? subject.title;
  const subtitle = isRoot
    ? "Choose a course area, then follow the topic path to a focused practice session."
    : selectedTopic?.summary ?? area?.summary ?? "Choose a topic to practise.";
  const availableQuestions = isRoot
    ? specification.topicAreas.reduce((total, courseArea) => total + courseArea.topicGroups.reduce((sum, group) => sum + getVisibleTopics(group, qualificationLevel).reduce((groupTotal, topic) => groupTotal + questionCount(topic), 0), 0), 0)
    : currentItems.reduce((total, topic) => total + questionCount(topic), 0);

  return (
    <Screen eyebrow="TOPIC PRACTICE" title={title} subtitle={subtitle} onBack={goBack}>
      <View style={[styles.guideCard, { backgroundColor: subject.softColor }]}>
        <View style={[styles.guideIcon, { backgroundColor: Colors.surface }]}>
          <Ionicons name="options-outline" size={22} color={subject.color} />
        </View>
        <View style={styles.guideCopy}>
          <Text style={[styles.guideEyebrow, { color: subject.color }]}>{specification.examBoard.title} · {specification.title}</Text>
          <Text style={styles.guideTitle}>{isRoot ? "Find your focus" : "Keep following the topic path"}</Text>
          <Text style={styles.guideText}>{availableQuestions > 0
            ? `${availableQuestions} ${availableQuestions === 1 ? "question is" : "questions are"} ready in this part of your course.`
            : "Browse every topic. Practice overviews open even while questions are being prepared."}</Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{isRoot ? "Course areas" : "Topics"}</Text>
        <Text style={styles.sectionCount}>{items.length} {items.length === 1 ? "item" : "items"}</Text>
      </View>

      <View style={styles.topicList}>
        {items.map((item) => {
          const isArea = "topicGroups" in item;
          const children = isArea ? item.topicGroups.length : 0;
          const questions = isArea
            ? item.topicGroups.reduce((total, group) => total + getVisibleTopics(group, qualificationLevel).reduce((sum, topic) => sum + questionCount(topic), 0), 0)
            : questionCount(item);
          const readiness: ContentStatus = questions > 0 || (!isArea && item.readiness === "ready") ? "ready" : "planned";
          return (
            <TopicCard
              key={item.id}
              title={item.title}
              summary={item.summary}
              childCount={children}
              questions={questions}
              readiness={readiness}
              color={subject.color}
              softColor={subject.softColor}
              onPress={() => openPath(item.id)}
            />
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  guideCard: { flexDirection: "row", alignItems: "flex-start", gap: 13, padding: 17, borderRadius: 18 },
  guideIcon: { width: 43, height: 43, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  guideCopy: { flex: 1, gap: 3 },
  guideEyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  guideTitle: { color: Colors.ink, fontSize: 17, fontWeight: "700" },
  guideText: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
  sectionHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: -13 },
  sectionTitle: { color: Colors.ink, fontSize: 19, fontWeight: "700", letterSpacing: -0.2 },
  sectionCount: { color: Colors.muted, fontSize: 11 },
  topicList: { gap: 10 },
  topicCard: { minHeight: 105, flexDirection: "row", alignItems: "center", gap: 11, padding: 13, borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 7, elevation: 1 },
  topicIcon: { width: 42, height: 42, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 13 },
  topicCopy: { flex: 1, minWidth: 0, gap: 4 },
  topicTitle: { color: Colors.ink, fontSize: 14, lineHeight: 18, fontWeight: "700" },
  topicSummary: { color: Colors.muted, fontSize: 11, lineHeight: 15 },
  topicMeta: { color: "#596579", fontSize: 10, lineHeight: 14, fontWeight: "600" },
  topicTrailing: { alignItems: "flex-end", justifyContent: "space-between", alignSelf: "stretch", gap: 9 },
  topicStatus: { fontSize: 9, fontWeight: "700", textAlign: "right" },
  arrowTile: { width: 29, height: 29, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  breadcrumb: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: -12 },
  breadcrumbText: { flex: 1, color: Colors.muted, fontSize: 11, lineHeight: 15 },
  overviewCard: { gap: 17, padding: 18, borderRadius: 20 },
  overviewTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  overviewIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 15 },
  overviewCopy: { flex: 1, gap: 5 },
  overviewEyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 0.7 },
  overviewTitle: { color: Colors.ink, fontSize: 19, lineHeight: 24, fontWeight: "700" },
  overviewBody: { color: Colors.muted, fontSize: 12, lineHeight: 17 },
  overviewStats: { flexDirection: "row", gap: 10 },
  overviewStat: { flex: 1, gap: 3, padding: 12, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.76)" },
  overviewStatValue: { color: Colors.ink, fontSize: 21, lineHeight: 25, fontWeight: "700" },
  overviewStatLabel: { color: Colors.muted, fontSize: 10, lineHeight: 13 },
  progressCard: { gap: 12, padding: 16, borderRadius: 17, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  progressHeading: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressIcon: { width: 39, height: 39, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: Colors.primarySoft },
  progressCopy: { flex: 1, gap: 4 },
  sectionSubtitle: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
  progressFooter: { paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.line },
  progressFootText: { color: Colors.muted, fontSize: 10, fontWeight: "600" },
  setsSection: { gap: 9 },
  primaryButton: { minHeight: 53, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 13, backgroundColor: Colors.primary },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  primaryButtonMeta: { color: "#DCE7FA", fontSize: 10, lineHeight: 14 },
  secondaryButton: { minHeight: 51, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 13, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  secondaryButtonText: { color: Colors.ink, fontSize: 13, fontWeight: "700" },
  secondaryButtonMeta: { color: Colors.muted, fontSize: 10 },
  setButtonCopy: { flex: 1, gap: 3 },
  comingSoonCard: { flexDirection: "row", alignItems: "flex-start", gap: 11, padding: 16, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  comingSoonCopy: { flex: 1, gap: 5 },
  comingSoonTitle: { color: Colors.ink, fontSize: 14, fontWeight: "700" },
  comingSoonText: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
  emptyCard: { alignItems: "flex-start", gap: 10, padding: 22, borderRadius: 20, borderWidth: 1, backgroundColor: Colors.surface },
  emptyIcon: { width: 55, height: 55, alignItems: "center", justifyContent: "center", borderRadius: 17 },
  emptyEyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 0.7 },
  emptyTitle: { color: Colors.ink, fontSize: 21, lineHeight: 27, fontWeight: "700" },
  emptyBody: { color: Colors.muted, fontSize: 12, lineHeight: 18 },
  disabled: { opacity: 0.58 },
  pressed: { opacity: 0.77 },
});
