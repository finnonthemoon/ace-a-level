import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MathContent } from "@/components/course/MathContent";
import { Screen } from "@/components/Screen";
import { Colors, MaxContentWidth } from "@/constants/theme";
import { useTopicProgress } from "@/contexts/TopicProgressContext";
import { findLesson, type LessonBlock } from "@/content/lesson-content";

interface LessonSection {
  title: string;
  blocks: LessonBlock[];
}

function groupLessonSections(blocks: readonly LessonBlock[]): LessonSection[] {
  const sections: LessonSection[] = [];
  for (const block of blocks) {
    if (block.type === "section-heading") {
      sections.push({ title: block.text, blocks: [] });
    } else {
      if (sections.length === 0) sections.push({ title: "Lesson", blocks: [] });
      sections[sections.length - 1].blocks.push(block);
    }
  }
  return sections;
}

function LessonCheck({
  block,
  disabled,
  onAnswered,
}: {
  block: Extract<LessonBlock, { type: "check" }>;
  disabled: boolean;
  onAnswered: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const correct = selected === block.correctOptionId;

  function chooseOption(optionId: string) {
    if (selected !== null || disabled) return;
    setSelected(optionId);
    onAnswered(optionId === block.correctOptionId);
  }

  return (
    <View style={styles.checkCard}>
      <Text style={styles.blockEyebrow}>CHECK YOUR UNDERSTANDING</Text>
      <MathContent content={block.prompt} />
      <View style={styles.checkOptions}>
        {block.options.map((option) => {
          const isSelected = selected === option.id;
          const isCorrectAnswer = selected !== null && option.id === block.correctOptionId;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ disabled: disabled || selected !== null, selected: isSelected }}
              disabled={disabled || selected !== null}
              onPress={() => chooseOption(option.id)}
              style={[
                styles.checkOption,
                isSelected && (correct ? styles.correctOption : styles.incorrectOption),
                isCorrectAnswer && styles.correctOption,
                disabled && styles.disabledOption,
              ]}
            >
              <MathContent content={option.content} size={14} />
            </Pressable>
          );
        })}
      </View>
      {selected !== null ? (
        <View style={[styles.feedback, correct ? styles.correctFeedback : styles.incorrectFeedback]}>
          <Text style={[styles.feedbackTitle, correct ? styles.correctText : styles.incorrectText]}>
            {correct ? "That's right" : "Not quite"}
          </Text>
          <MathContent content={block.explanation} size={12} />
        </View>
      ) : null}
    </View>
  );
}

export default function LessonScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = findLesson(lessonId);
  const currentLessonId = lesson?.id ?? "";
  const lessonTopicId = lesson?.topicId ?? "";
  const { completeLesson, getProgress, isHydrated, recordQuestionAttempt } = useTopicProgress();
  const [sectionProgress, setSectionProgress] = useState({ lessonId: "", index: 0 });
  const [saving, setSaving] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const sectionOffsets = useRef<Record<number, number>>({});
  const sections = lesson ? groupLessonSections(lesson.blocks) : [];
  const isComplete = lesson ? getProgress(lesson.topicId).completedLessonIds.includes(lesson.id) : false;
  const sectionCount = sections.length;
  const activeSection = sectionProgress.lessonId === currentLessonId ? sectionProgress.index : 0;
  const sectionNumber = Math.min(activeSection + 1, Math.max(sectionCount, 1));
  const progressPercent = sectionCount > 0 ? (sectionNumber / sectionCount) * 100 : 0;

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/learn");
  }, [router]);

  function updateActiveSection(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const marker = event.nativeEvent.contentOffset.y + 48;
    let nextSection = 0;
    for (let index = 0; index < sectionCount; index += 1) {
      const sectionTop = sectionOffsets.current[index];
      if (sectionTop !== undefined && sectionTop <= marker) nextSection = index;
      else break;
    }
    setSectionProgress((current) => (
      current.lessonId === currentLessonId && current.index === nextSection
        ? current
        : { lessonId: currentLessonId, index: nextSection }
    ));
  }

  async function finishLesson() {
    if (!lesson || saving) return;
    if (isComplete) {
      goBack();
      return;
    }
    setSaving(true);
    setCompletionError(null);
    try {
      await completeLesson(lesson.topicId, lesson.id);
      goBack();
    } catch {
      setCompletionError("Progress could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!lesson) {
    return <Screen eyebrow="LESSON" title="Lesson unavailable" subtitle="This lesson could not be found." onBack={goBack} />;
  }

  function renderBlock(block: LessonBlock, sectionIndex: number, blockIndex: number) {
    const key = `${sectionIndex}-${blockIndex}`;
    if (block.type === "section-heading") return null;
    if (block.type === "text") {
      return <View key={key} style={styles.paragraphCard}><MathContent content={block.content} /></View>;
    }
    if (block.type === "math") {
      return <View key={key} style={styles.mathCard}><MathContent content={String.raw`$$${block.expression}$$`} size={19} /></View>;
    }
    if (block.type === "callout") {
      return (
        <View key={key} style={styles.callout}>
          <View style={styles.calloutIcon}><Ionicons name="bulb-outline" color={Colors.primary} size={18} /></View>
          <View style={styles.calloutCopy}>
            <Text style={styles.calloutTitle}>{block.title}</Text>
            <MathContent content={block.content} size={13} />
          </View>
        </View>
      );
    }
    if (block.type === "warning") {
      return (
        <View key={key} style={styles.warningCard}>
          <View style={styles.warningIcon}><Ionicons name="alert-circle-outline" color={Colors.warning} size={19} /></View>
          <View style={styles.calloutCopy}>
            <Text style={styles.warningTitle}>{block.title}</Text>
            <MathContent content={block.content} size={13} />
          </View>
        </View>
      );
    }
    if (block.type === "worked-example") {
      return (
        <View key={key} style={styles.exampleCard}>
          <Text style={styles.blockEyebrow}>WORKED EXAMPLE</Text>
          <Text style={styles.exampleTitle}>{block.title}</Text>
          <MathContent content={block.question} />
          <View style={styles.steps}>
            {block.steps.map((step, stepIndex) => (
              <View key={stepIndex} style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{stepIndex + 1}</Text></View>
                <MathContent content={step} size={14} />
              </View>
            ))}
          </View>
          <View style={styles.exampleAnswer}><MathContent content={block.answer} size={14} color={Colors.primaryDeep} /></View>
        </View>
      );
    }
    return (
      <LessonCheck
        key={key}
        block={block}
        disabled={!isHydrated}
        onAnswered={(correct) => {
          void recordQuestionAttempt(lessonTopicId, block.id, correct).catch(() => undefined);
        }}
      />
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to topic" onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={17} color={Colors.ink} />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.courseLabel}>{lesson.courseLabel}</Text>
        </View>
        <Text style={styles.title}>{lesson.title}</Text>
        <View style={styles.headerMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={15} color={Colors.muted} />
            <Text style={styles.metaText}>{lesson.estimatedMinutes} min</Text>
          </View>
          <View style={styles.metaDivider} />
          <Text style={styles.metaText}>{sectionNumber} of {sectionCount || 1}</Text>
          {isComplete ? <View style={styles.completedPill}><Ionicons name="checkmark-circle" size={14} color={Colors.success} /><Text style={styles.completedText}>Complete</Text></View> : null}
        </View>
        <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: sectionCount || 1, now: sectionNumber }} style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        onScroll={updateActiveSection}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, sectionIndex) => (
          <View
            key={`${sectionIndex}-${section.title}`}
            onLayout={(event) => { sectionOffsets.current[sectionIndex] = event.nativeEvent.layout.y; }}
            style={styles.section}
          >
            <View style={styles.sectionHeading}>
              <View style={styles.sectionNumber}><Text style={styles.sectionNumberText}>{String(sectionIndex + 1).padStart(2, "0")}</Text></View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.blocks.map((block, blockIndex) => renderBlock(block, sectionIndex, blockIndex))}
          </View>
        ))}

        <View style={styles.completionArea}>
          {completionError ? <Text accessibilityRole="alert" style={styles.completionError}>{completionError}</Text> : null}
          <Pressable
            accessibilityRole="button"
            disabled={!isHydrated || saving}
            onPress={() => void finishLesson()}
            style={({ pressed }) => [styles.finishButton, (!isHydrated || saving) && styles.disabledButton, pressed && styles.pressed]}
          >
            <Text style={styles.finishButtonText}>
              {!isHydrated ? "Loading progress..." : saving ? "Saving progress..." : isComplete ? "Back to topic" : "Complete lesson"}
            </Text>
            <Ionicons name={isComplete ? "arrow-back" : "checkmark"} color="#FFFFFF" size={18} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingHorizontal: 21, paddingTop: 5, paddingBottom: 14, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.line },
  headerTopRow: { minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 5, paddingRight: 10 },
  backLabel: { color: Colors.ink, fontSize: 12, fontWeight: "600" },
  courseLabel: { color: Colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 0.9, textTransform: "uppercase" },
  title: { maxWidth: 650, marginTop: 7, color: Colors.ink, fontSize: 25, lineHeight: 30, fontWeight: "700", letterSpacing: -0.55 },
  headerMeta: { minHeight: 25, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: Colors.muted, fontSize: 11, fontWeight: "600" },
  metaDivider: { width: 1, height: 12, backgroundColor: Colors.line },
  completedPill: { flexDirection: "row", alignItems: "center", gap: 3, marginLeft: "auto" },
  completedText: { color: Colors.success, fontSize: 10, fontWeight: "700" },
  progressTrack: { height: 4, overflow: "hidden", marginTop: 6, borderRadius: 3, backgroundColor: "#E7EDF6" },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: Colors.primary },
  content: { width: "100%", maxWidth: MaxContentWidth, alignSelf: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 34, gap: 20 },
  section: { gap: 11 },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 1 },
  sectionNumber: { width: 31, height: 31, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: Colors.primarySoft },
  sectionNumberText: { color: Colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  sectionTitle: { flex: 1, color: Colors.ink, fontSize: 19, lineHeight: 24, fontWeight: "700", letterSpacing: -0.25 },
  paragraphCard: { padding: 15, borderRadius: 15, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  mathCard: { minHeight: 57, justifyContent: "center", paddingHorizontal: 15, paddingVertical: 12, borderRadius: 14, backgroundColor: "#F0F5FF", borderWidth: 1, borderColor: "#E0EAFB" },
  callout: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 15, backgroundColor: Colors.primarySoft },
  calloutIcon: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "rgba(255,255,255,0.78)" },
  calloutCopy: { flex: 1, gap: 5, paddingTop: 2 },
  calloutTitle: { color: Colors.primaryDeep, fontSize: 13, fontWeight: "700" },
  warningCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 15, backgroundColor: Colors.warningSoft, borderWidth: 1, borderColor: "#F5E4C5" },
  warningIcon: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#FFFFFF" },
  warningTitle: { color: Colors.warning, fontSize: 13, fontWeight: "700" },
  exampleCard: { gap: 11, padding: 15, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.045, shadowRadius: 9, elevation: 1 },
  blockEyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  exampleTitle: { color: Colors.ink, fontSize: 15, fontWeight: "700" },
  steps: { gap: 10, marginTop: 2 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  stepNumber: { width: 22, height: 22, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: Colors.primarySoft },
  stepNumberText: { color: Colors.primary, fontSize: 10, fontWeight: "700" },
  exampleAnswer: { padding: 11, borderRadius: 11, backgroundColor: "#F4F7FC" },
  checkCard: { gap: 11, padding: 15, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: "#DCE6F6" },
  checkOptions: { gap: 8 },
  checkOption: { minHeight: 44, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 11, borderWidth: 1, borderColor: Colors.line, backgroundColor: "#FFFFFF" },
  correctOption: { borderColor: Colors.success, backgroundColor: Colors.successSoft },
  incorrectOption: { borderColor: Colors.danger, backgroundColor: "#FFF1EF" },
  disabledOption: { opacity: 0.65 },
  feedback: { gap: 5, padding: 11, borderRadius: 10 },
  correctFeedback: { backgroundColor: Colors.successSoft },
  incorrectFeedback: { backgroundColor: "#FFF1EF" },
  feedbackTitle: { fontSize: 12, fontWeight: "700" },
  correctText: { color: Colors.success },
  incorrectText: { color: Colors.danger },
  completionArea: { gap: 10, marginTop: 2 },
  completionError: { color: Colors.danger, fontSize: 12, lineHeight: 17, textAlign: "center" },
  finishButton: { minHeight: 51, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 18, borderRadius: 14, backgroundColor: Colors.primary },
  finishButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  disabledButton: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
});
