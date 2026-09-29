import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MathContent } from "@/components/course/MathContent";
import { Screen } from "@/components/Screen";
import { Colors } from "@/constants/theme";
import { useTopicProgress } from "@/contexts/TopicProgressContext";
import { findLesson, type LessonBlock } from "@/content/lesson-content";

function LessonCheck({ block }: { block: Extract<LessonBlock, { type: "check" }> }) {
  const [selected, setSelected] = useState<string | null>(null);
  const correct = selected === block.correctOptionId;

  return (
    <View style={styles.checkCard}>
      <Text style={styles.checkLabel}>CHECK YOUR UNDERSTANDING</Text>
      <MathContent content={block.prompt} />
      <View style={styles.checkOptions}>
        {block.options.map((option) => {
          const isSelected = selected === option.id;
          const isCorrectAnswer = selected !== null && option.id === block.correctOptionId;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              disabled={selected !== null}
              onPress={() => setSelected(option.id)}
              style={[styles.checkOption, isSelected && (correct ? styles.correctOption : styles.incorrectOption), isCorrectAnswer && styles.correctOption]}
            >
              <MathContent content={option.content} size={14} />
            </Pressable>
          );
        })}
      </View>
      {selected ? <View style={[styles.feedback, correct ? styles.correctFeedback : styles.incorrectFeedback]}>
        <Text style={[styles.feedbackTitle, correct ? styles.correctText : styles.incorrectText]}>{correct ? "That’s right" : "Not quite"}</Text>
        <Text style={styles.feedbackBody}>{block.explanation}</Text>
      </View> : null}
    </View>
  );
}

export default function LessonScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = findLesson(lessonId);
  const { completeLesson, getProgress, isHydrated } = useTopicProgress();
  const [saving, setSaving] = useState(false);
  const isComplete = lesson ? getProgress(lesson.topicId).completedLessonIds.includes(lesson.id) : false;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/learn");
  }

  async function finishLesson() {
    if (!lesson || isComplete || saving) return;
    setSaving(true);
    try {
      await completeLesson(lesson.topicId, lesson.id);
    } finally {
      setSaving(false);
    }
  }

  if (!lesson) {
    return <Screen eyebrow="LESSON" title="Lesson unavailable" subtitle="This lesson could not be found." onBack={goBack} />;
  }

  return (
    <Screen eyebrow={`${lesson.estimatedMinutes} MIN LESSON`} title={lesson.title} subtitle={lesson.description} onBack={goBack}>
      <View style={styles.lessonMeta}>
        <Ionicons name="book-outline" size={17} color={Colors.primary} />
        <Text style={styles.lessonMetaText}>{isComplete ? "Lesson complete" : "Read the examples, then finish when you’re ready."}</Text>
        {isComplete ? <Ionicons name="checkmark-circle" size={18} color={Colors.success} /> : null}
      </View>

      {lesson.blocks.map((block, index) => {
        if (block.type === "heading") return <Text key={`heading-${index}`} style={styles.blockHeading}>{block.text}</Text>;
        if (block.type === "text") return <MathContent key={`text-${index}`} content={block.content} />;
        if (block.type === "math") return <View key={`math-${index}`} style={styles.mathCard}><MathContent content={String.raw`$$${block.expression}$$`} size={19} /></View>;
        if (block.type === "callout") return (
          <View key={`callout-${index}`} style={styles.callout}>
            <Ionicons name="bulb-outline" color={Colors.primary} size={19} />
            <View style={styles.calloutCopy}><Text style={styles.calloutTitle}>{block.title}</Text><Text style={styles.calloutText}>{block.content}</Text></View>
          </View>
        );
        if (block.type === "worked-example") return (
          <View key={`example-${index}`} style={styles.exampleCard}>
            <Text style={styles.exampleLabel}>WORKED EXAMPLE</Text>
            <Text style={styles.exampleTitle}>{block.title}</Text>
            <MathContent content={block.question} />
            <View style={styles.steps}>
              {block.steps.map((step, stepIndex) => <View key={stepIndex} style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{stepIndex + 1}</Text></View>
                <MathContent content={step} size={14} />
              </View>)}
            </View>
            <View style={styles.exampleAnswer}><MathContent content={block.answer} size={14} color={Colors.primaryDeep} /></View>
          </View>
        );
        return <LessonCheck key={`check-${index}`} block={block} />;
      })}

      <Pressable
        accessibilityRole="button"
        disabled={!isHydrated || saving}
        onPress={() => isComplete ? router.back() : void finishLesson()}
        style={({ pressed }) => [styles.finishButton, (!isHydrated || saving) && styles.disabledButton, pressed && styles.pressed]}
      >
        <Text style={styles.finishButtonText}>{isComplete ? "Back to topic" : saving ? "Saving progress..." : "Mark lesson complete"}</Text>
        <Ionicons name={isComplete ? "arrow-back" : "checkmark"} color="#FFFFFF" size={18} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lessonMeta: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 13, borderRadius: 12, backgroundColor: Colors.primarySoft },
  lessonMetaText: { flex: 1, color: Colors.primaryDeep, fontSize: 12, fontWeight: "600" },
  blockHeading: { color: Colors.ink, fontSize: 21, lineHeight: 27, fontWeight: "700", letterSpacing: -0.4, marginTop: 2 },
  mathCard: { minHeight: 56, justifyContent: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  callout: { flexDirection: "row", alignItems: "flex-start", gap: 11, padding: 15, borderRadius: 14, backgroundColor: Colors.primarySoft },
  calloutCopy: { flex: 1, gap: 5 },
  calloutTitle: { color: Colors.primaryDeep, fontSize: 13, fontWeight: "700" },
  calloutText: { color: Colors.ink, fontSize: 12, lineHeight: 18 },
  exampleCard: { gap: 12, padding: 16, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  exampleLabel: { color: Colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  exampleTitle: { color: Colors.ink, fontSize: 16, fontWeight: "700" },
  steps: { gap: 11, marginTop: 3 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  stepNumber: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primarySoft },
  stepNumberText: { color: Colors.primary, fontSize: 10, fontWeight: "700" },
  exampleAnswer: { padding: 11, borderRadius: 11, backgroundColor: "#F4F7FC" },
  checkCard: { gap: 12, padding: 16, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  checkLabel: { color: Colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 0.7 },
  checkOptions: { gap: 8 },
  checkOption: { minHeight: 44, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 11, borderWidth: 1, borderColor: Colors.line, backgroundColor: "#FFFFFF" },
  correctOption: { borderColor: Colors.success, backgroundColor: Colors.successSoft },
  incorrectOption: { borderColor: Colors.danger, backgroundColor: "#FFF1EF" },
  feedback: { gap: 4, padding: 11, borderRadius: 10 },
  correctFeedback: { backgroundColor: Colors.successSoft },
  incorrectFeedback: { backgroundColor: "#FFF1EF" },
  feedbackTitle: { fontSize: 12, fontWeight: "700" },
  correctText: { color: Colors.success },
  incorrectText: { color: Colors.danger },
  feedbackBody: { color: Colors.ink, fontSize: 11, lineHeight: 16 },
  finishButton: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: Colors.primary },
  finishButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  disabledButton: { opacity: 0.55 },
  pressed: { opacity: 0.82 },
});
