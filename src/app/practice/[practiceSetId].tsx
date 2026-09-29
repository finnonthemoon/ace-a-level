import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MathContent } from "@/components/course/MathContent";
import { Screen } from "@/components/Screen";
import { Colors } from "@/constants/theme";
import { useTopicProgress } from "@/contexts/TopicProgressContext";
import { findPracticeSet, findQuestions } from "@/content/practice-content";
import { markSingleChoice } from "@/core/practice-marking";

export default function PracticeSessionScreen() {
  const router = useRouter();
  const { practiceSetId } = useLocalSearchParams<{ practiceSetId: string }>();
  const practiceSet = findPracticeSet(practiceSetId);
  const questions = practiceSet ? findQuestions(practiceSet.questionIds) : [];
  const { completePracticeSession, recordQuestionAttempt, getProgress, isHydrated } = useTopicProgress();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finishing, setFinishing] = useState(false);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/learn");
  }

  async function chooseAnswer(answerId: string) {
    const question = questions[questionIndex];
    if (!question || selectedAnswerId || !isHydrated) return;
    const result = markSingleChoice(question, answerId);
    setSelectedAnswerId(answerId);
    setWasCorrect(result.correct);
    if (result.correct) setSessionCorrect((current) => current + 1);
    await recordQuestionAttempt(question.topicId, question.id, result.correct);
  }

  async function finishSession() {
    if (!practiceSet || finishing) return;
    setFinishing(true);
    try {
      await completePracticeSession(practiceSet.topicId, `${practiceSet.id}-${Date.now()}`);
      setFinished(true);
    } finally {
      setFinishing(false);
    }
  }

  if (!practiceSet || questions.length === 0) {
    return <Screen eyebrow="PRACTICE" title="Practice set unavailable" subtitle="This practice set could not be found." onBack={goBack} />;
  }

  if (finished) {
    const progress = getProgress(practiceSet.topicId);
    const percentage = Math.round((sessionCorrect / questions.length) * 100);
    return (
      <Screen eyebrow="SESSION COMPLETE" title="Practice finished" subtitle="Your answers and progress have been saved." onBack={goBack}>
        <View style={styles.resultCard}>
          <View style={styles.resultIcon}><Ionicons name="checkmark-done" size={28} color={Colors.primary} /></View>
          <Text style={styles.resultScore}>{percentage}%</Text>
          <Text style={styles.resultSubtitle}>{sessionCorrect} of {questions.length} correct</Text>
          <View style={styles.resultStats}>
            <Text style={styles.resultStat}>Questions attempted: {progress.questionsAttempted}</Text>
            <Text style={styles.resultStat}>Questions correct: {progress.questionsCorrect}</Text>
            <Text style={styles.resultStat}>Sessions completed: {progress.completedPracticeSessionIds.length}</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={goBack} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>View topic progress</Text>
          <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
        </Pressable>
      </Screen>
    );
  }

  const question = questions[questionIndex];
  const correctAnswerId = question.correctAnswerId;
  const isLastQuestion = questionIndex === questions.length - 1;

  function nextQuestion() {
    setQuestionIndex((current) => current + 1);
    setSelectedAnswerId(null);
  }

  return (
    <Screen eyebrow={`QUESTION ${questionIndex + 1} OF ${questions.length}`} title={practiceSet.title} subtitle={practiceSet.description} onBack={goBack}>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((questionIndex + 1) / questions.length) * 100}%` }]} /></View>
      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>QUESTION {questionIndex + 1}</Text>
        <MathContent content={question.prompt} size={17} />
      </View>

      <View style={styles.options}>
        {question.options.map((option) => {
          const selected = selectedAnswerId === option.id;
          const correct = selectedAnswerId !== null && option.id === correctAnswerId;
          const incorrectSelection = selected && !wasCorrect;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              disabled={selectedAnswerId !== null || !isHydrated}
              onPress={() => void chooseAnswer(option.id)}
              style={({ pressed }) => [
                styles.option,
                correct && styles.correctOption,
                incorrectSelection && styles.incorrectOption,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.optionLetter, correct && styles.correctLetter, incorrectSelection && styles.incorrectLetter]}>
                <Text style={[styles.optionLetterText, (correct || incorrectSelection) && styles.selectedLetterText]}>{option.id.toUpperCase()}</Text>
              </View>
              <View style={styles.optionContent}><MathContent content={option.content} size={15} /></View>
              {correct ? <Ionicons name="checkmark-circle" size={19} color={Colors.success} /> : null}
              {incorrectSelection ? <Ionicons name="close-circle" size={19} color={Colors.danger} /> : null}
            </Pressable>
          );
        })}
      </View>

      {selectedAnswerId ? (
        <View style={[styles.feedback, wasCorrect ? styles.correctFeedback : styles.incorrectFeedback]}>
          <Text style={[styles.feedbackTitle, wasCorrect ? styles.correctText : styles.incorrectText]}>{wasCorrect ? "Correct" : "Not quite"}</Text>
          <MathContent content={question.explanation} size={13} />
        </View>
      ) : null}

      {selectedAnswerId ? (
        <Pressable
          accessibilityRole="button"
          disabled={finishing}
          onPress={() => isLastQuestion ? void finishSession() : nextQuestion()}
          style={({ pressed }) => [styles.primaryButton, finishing && styles.disabled, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>{finishing ? "Saving session…" : isLastQuestion ? "Finish practice" : "Next question"}</Text>
          <Ionicons name={isLastQuestion ? "checkmark-done" : "arrow-forward"} size={17} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressTrack: { height: 7, overflow: "hidden", borderRadius: 5, backgroundColor: Colors.primarySoft },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: Colors.primary },
  questionCard: { gap: 13, padding: 17, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  questionLabel: { color: Colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  options: { gap: 9 },
  option: { minHeight: 59, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  optionLetter: { width: 29, height: 29, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: Colors.primarySoft },
  optionLetterText: { color: Colors.primary, fontSize: 11, fontWeight: "700" },
  correctOption: { borderColor: Colors.success, backgroundColor: Colors.successSoft },
  incorrectOption: { borderColor: Colors.danger, backgroundColor: "#FFF1EF" },
  correctLetter: { backgroundColor: Colors.success },
  incorrectLetter: { backgroundColor: Colors.danger },
  selectedLetterText: { color: "#FFFFFF" },
  optionContent: { flex: 1 },
  feedback: { gap: 7, padding: 14, borderRadius: 13 },
  correctFeedback: { backgroundColor: Colors.successSoft },
  incorrectFeedback: { backgroundColor: "#FFF1EF" },
  feedbackTitle: { fontSize: 13, fontWeight: "700" },
  correctText: { color: Colors.success },
  incorrectText: { color: Colors.danger },
  primaryButton: { minHeight: 49, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: Colors.primary },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  resultCard: { alignItems: "center", gap: 8, padding: 23, borderRadius: 20, backgroundColor: Colors.primarySoft },
  resultIcon: { width: 56, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#FFFFFF" },
  resultScore: { color: Colors.ink, fontSize: 38, lineHeight: 44, fontWeight: "700", letterSpacing: -1 },
  resultSubtitle: { color: Colors.muted, fontSize: 13, fontWeight: "600" },
  resultStats: { alignSelf: "stretch", gap: 5, marginTop: 8, paddingTop: 13, borderTopWidth: 1, borderTopColor: "#D5E0F3" },
  resultStat: { color: Colors.ink, fontSize: 11, textAlign: "center" },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
});
