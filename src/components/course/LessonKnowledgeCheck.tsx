import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MathContent } from "@/components/course/MathContent";
import { Colors } from "@/constants/theme";
import type { LessonBlock } from "@/content/lesson-content";

interface LessonKnowledgeCheckProps {
  block: Extract<LessonBlock, { type: "check" }>;
  disabled: boolean;
  onAnswered: (correct: boolean) => void;
}

/** Reusable multiple-choice check with immediate marking and a short explanation. */
export function LessonKnowledgeCheck({ block, disabled, onAnswered }: LessonKnowledgeCheckProps) {
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

const styles = StyleSheet.create({
  checkCard: { gap: 11, padding: 15, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: "#DCE6F6" },
  blockEyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
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
});
