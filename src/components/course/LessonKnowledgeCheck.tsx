import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MathContent } from "@/components/course/MathContent";
import { LessonColors as Colors, LessonSpacing as Space, LessonTypography as Type } from "@/constants/theme";
import type { LessonBlock } from "@/content/lesson-content";

interface LessonKnowledgeCheckProps {
  block: Extract<LessonBlock, { type: "check" }>;
  disabled: boolean;
  selectedOptionId: string | null;
  submitted: boolean;
  onSelect: (optionId: string) => void;
}

/** Controlled check: selection is neutral; answer feedback appears only after submission. */
export function LessonKnowledgeCheck({ block, disabled, selectedOptionId, submitted, onSelect }: LessonKnowledgeCheckProps) {
  const correct = selectedOptionId === block.correctOptionId;
  return (
    <View style={styles.checkPage}>
      <MathContent content={block.prompt} size={Type.question.fontSize} color={Colors.text} textStyle={Type.question} />
      <View style={styles.checkOptions}>
        {block.options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrectAnswer = submitted && option.id === block.correctOptionId;
          const isIncorrectAnswer = submitted && isSelected && !correct;
          const answerState = isCorrectAnswer ? "Correct answer" : isIncorrectAnswer ? "Incorrect answer" : undefined;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ disabled: disabled || submitted, selected: isSelected }}
              accessibilityHint={answerState}
              disabled={disabled || submitted}
              onPress={() => onSelect(option.id)}
              style={({ pressed }) => [
                styles.checkOption,
                pressed && !isSelected && styles.pressedOption,
                isSelected && styles.selectedOption,
                isCorrectAnswer && styles.correctOption,
                isIncorrectAnswer && styles.incorrectOption,
                disabled && styles.disabledOption,
              ]}
            >
              <View style={[
                styles.optionBadge,
                isSelected && styles.selectedBadge,
                isCorrectAnswer && styles.correctBadge,
                isIncorrectAnswer && styles.incorrectBadge,
              ]}>
                {isCorrectAnswer || isIncorrectAnswer ? (
                  <Ionicons name={isCorrectAnswer ? "checkmark" : "close"} size={18} color={Colors.surface} accessibilityLabel={answerState} />
                ) : (
                  <Text style={[styles.optionLetter, isSelected && styles.selectedLetter]}>{String.fromCharCode(65 + index)}</Text>
                )}
              </View>
              <View style={styles.optionCopy}>
                <MathContent content={option.content} size={Type.option.fontSize} color={Colors.text} textStyle={Type.option} />
              </View>
            </Pressable>
          );
        })}
      </View>
      {submitted ? (
        <View accessibilityLiveRegion="polite" style={[styles.feedback, correct ? styles.correctFeedback : styles.incorrectFeedback]}>
          <View style={styles.feedbackHeading}>
            <Ionicons name={correct ? "checkmark-circle-outline" : "information-circle-outline"} size={24} color={correct ? Colors.success : Colors.incorrect} />
            <Text style={[styles.feedbackTitle, correct ? styles.correctText : styles.incorrectText]}>{correct ? "That's right" : "Not quite"}</Text>
          </View>
          <MathContent content={block.explanation} size={Type.body.fontSize} color={Colors.bodyText} textStyle={Type.body} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  checkPage: { gap: Space.extraLarge },
  checkOptions: { gap: Space.regular },
  checkOption: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: Space.regular, padding: Space.regular, borderRadius: 20, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.surface },
  pressedOption: { backgroundColor: Colors.soft },
  selectedOption: { borderColor: Colors.primary, backgroundColor: Colors.soft },
  correctOption: { borderColor: Colors.success, backgroundColor: Colors.successSoft },
  incorrectOption: { borderColor: Colors.incorrect, backgroundColor: Colors.incorrectSoft },
  disabledOption: { opacity: 0.65 },
  optionBadge: { width: 32, height: 32, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 16, borderWidth: 1, borderColor: Colors.soft, backgroundColor: Colors.soft },
  selectedBadge: { backgroundColor: Colors.surface, borderColor: Colors.primary },
  correctBadge: { backgroundColor: Colors.success, borderColor: Colors.success },
  incorrectBadge: { backgroundColor: Colors.incorrect, borderColor: Colors.incorrect },
  optionLetter: { color: Colors.primary, fontSize: 14, fontWeight: "800" },
  selectedLetter: { color: Colors.primary, fontWeight: "900" },
  optionCopy: { flex: 1 },
  feedback: { gap: Space.medium, padding: Space.large, borderRadius: 20 },
  feedbackHeading: { flexDirection: "row", alignItems: "center", gap: Space.small },
  correctFeedback: { backgroundColor: Colors.successSoft },
  incorrectFeedback: { backgroundColor: Colors.incorrectSoft },
  feedbackTitle: { fontSize: 18, lineHeight: 26, fontWeight: "700" },
  correctText: { color: Colors.success },
  incorrectText: { color: Colors.incorrect },
});
