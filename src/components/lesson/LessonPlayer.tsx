import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { LessonPageView } from "@/components/lesson/LessonPageView";
import { LessonActionButton } from "@/components/lesson/LessonActionButton";
import { LessonColors as Colors, LessonContentWidth, LessonSpacing as Space, LessonTypography as Type } from "@/constants/theme";
import type { LessonDefinition, LessonPage } from "@/content/lesson-content";

interface CheckState {
  selectedOptionId: string | null;
  submitted: boolean;
}

interface LessonPlayerProps {
  lesson: LessonDefinition;
  isHydrated: boolean;
  isComplete: boolean;
  onExit: () => void;
  onComplete: () => Promise<void>;
  onRecordAttempt: (questionId: string, correct: boolean) => void;
}

function pageTitle(page: LessonPage) {
  if (page.type === "teaching" || page.type === "recap") return page.title;
  return page.type === "worked-example" ? page.title : "Quick check";
}

export function LessonPlayer({ lesson, isHydrated, isComplete, onExit, onComplete, onRecordAttempt }: LessonPlayerProps) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollToRevealedStep = useRef(false);
  const [pagePosition, setPagePosition] = useState({ lessonId: "", index: 0 });
  const [visibleSteps, setVisibleSteps] = useState<Record<string, number>>({});
  const [checkStates, setCheckStates] = useState<Record<string, CheckState>>({});
  const [saving, setSaving] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const pages = lesson.pages;
  const activeIndex = pagePosition.lessonId === lesson.id ? pagePosition.index : 0;
  const totalSteps = pages.length + 1;
  const onCompletionScreen = activeIndex >= pages.length;
  const currentPage = pages[activeIndex];
  const stepNumber = Math.min(activeIndex + 1, totalSteps);
  const activeCheck = currentPage?.type === "check" ? currentPage : undefined;
  const activeCheckState = activeCheck
    ? checkStates[activeCheck.id] ?? { selectedOptionId: null, submitted: false }
    : { selectedOptionId: null, submitted: false };
  const checksSummary = useMemo(() => {
    const answered = pages.flatMap((page) => {
      if (page.type !== "check") return [];
      const answer = checkStates[page.id];
      return answer?.submitted ? [{ correct: answer.selectedOptionId === page.check.correctOptionId }] : [];
    });
    return { answered: answered.length, correct: answered.filter((answer) => answer.correct).length };
  }, [checkStates, pages]);

  const setPageIndex = useCallback((index: number) => {
    scrollToRevealedStep.current = false;
    setPagePosition({ lessonId: lesson.id, index: Math.max(0, Math.min(index, pages.length)) });
  }, [lesson.id, pages.length]);

  const goBack = useCallback(() => {
    if (activeIndex > 0) setPageIndex(activeIndex - 1);
    else onExit();
  }, [activeIndex, onExit, setPageIndex]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [goBack]);

  async function handlePrimaryAction() {
    if (currentPage?.type === "check") {
      if (activeCheckState.submitted) {
        setPageIndex(activeIndex + 1);
      } else if (activeCheckState.selectedOptionId) {
        const correct = activeCheckState.selectedOptionId === currentPage.check.correctOptionId;
        setCheckStates((current) => ({
          ...current,
          [currentPage.id]: { ...activeCheckState, submitted: true },
        }));
        onRecordAttempt(currentPage.check.id, correct);
      }
      return;
    }

    if (currentPage?.type === "worked-example") {
      const revealed = visibleSteps[currentPage.id] ?? 0;
      if (revealed < currentPage.steps.length) {
        scrollToRevealedStep.current = true;
        setVisibleSteps((current) => ({ ...current, [currentPage.id]: revealed + 1 }));
      } else {
        setPageIndex(activeIndex + 1);
      }
      return;
    }

    if (!onCompletionScreen) {
      setPageIndex(activeIndex + 1);
      return;
    }
    if (isComplete) {
      onExit();
      return;
    }

    setSaving(true);
    setCompletionError(null);
    try {
      await onComplete();
    } catch {
      setCompletionError("Progress could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  let actionLabel = "Continue";
  if (activeCheck) actionLabel = activeCheckState.submitted ? "Continue" : "Check answer";
  if (currentPage?.type === "worked-example") {
    actionLabel = (visibleSteps[currentPage.id] ?? 0) < currentPage.steps.length ? "Show next step" : "Continue";
  }
  if (onCompletionScreen) actionLabel = saving ? "Saving progress..." : isComplete ? "Back to topic" : "Complete lesson";
  const actionDisabled = !isHydrated || saving || (activeCheck !== undefined && !activeCheckState.submitted && !activeCheckState.selectedOptionId);
  const actionAccessibilityLabel = currentPage ? pageTitle(currentPage) : `Lesson complete, ${lesson.title}`;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable accessibilityRole="button" accessibilityLabel={activeIndex > 0 ? "Previous lesson page" : "Back to topic"} onPress={goBack} style={styles.backButton}>
            <Ionicons name={activeIndex > 0 ? "arrow-back" : "close"} size={24} color={Colors.text} />
          </Pressable>
          <Text numberOfLines={1} style={styles.lessonContext}>{lesson.title}</Text>
        </View>
        <View accessibilityRole="progressbar" accessibilityLabel="Lesson page progress" accessibilityValue={{ min: 1, max: totalSteps, now: stepNumber, text: `Step ${stepNumber} of ${totalSteps}` }} style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${stepNumber / totalSteps * 100}%` }]} />
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          ref={scrollViewRef}
          key={`${lesson.id}:${activeIndex}`}
          style={styles.flex}
          contentContainerStyle={styles.pageContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (!scrollToRevealedStep.current) return;
            scrollToRevealedStep.current = false;
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {currentPage ? (
            <LessonPageView
              page={currentPage}
              contextLabel={`${lesson.topicTitle} · ${stepNumber} of ${totalSteps}`}
              visibleStepCount={visibleSteps[currentPage.id] ?? 0}
              selectedOptionId={activeCheckState.selectedOptionId}
              checkSubmitted={activeCheckState.submitted}
              onSelectOption={(optionId) => {
                if (!activeCheck || activeCheckState.submitted) return;
                setCheckStates((current) => ({ ...current, [activeCheck.id]: { selectedOptionId: optionId, submitted: false } }));
              }}
              checkDisabled={!isHydrated}
            />
          ) : (
            <View style={styles.completionContent}>
              <View style={styles.completionIcon}><Ionicons name="checkmark" size={30} color={Colors.primary} /></View>
              <Text style={styles.completionEyebrow}>{isComplete ? "LESSON COMPLETE" : "FINAL STEP"}</Text>
              <Text style={styles.completionTitle}>{isComplete ? "Well done" : "Ready to finish?"}</Text>
              <Text style={styles.completionLesson}>{lesson.title}</Text>
              {checksSummary.answered > 0 ? (
                <Text style={styles.completionSummary}>You answered {checksSummary.correct} of {checksSummary.answered} checks correctly.</Text>
              ) : (
                <Text style={styles.completionSummary}>You’ve reached the end of this lesson.</Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Space.regular) }]}>
          <View style={styles.footerContent}>
            {completionError ? <Text accessibilityRole="alert" style={styles.errorText}>{completionError}</Text> : null}
            <LessonActionButton
              key={`${lesson.id}:${activeIndex}`}
              label={!isHydrated && onCompletionScreen ? "Loading progress..." : actionLabel}
              accessibilityLabel={`${actionLabel}, ${actionAccessibilityLabel}`}
              disabled={actionDisabled}
              enhanced={currentPage?.type === "worked-example"}
              backArrow={onCompletionScreen && isComplete}
              onPress={() => void handlePrimaryAction()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { width: "100%", maxWidth: LessonContentWidth, alignSelf: "center", paddingHorizontal: Space.large, paddingTop: Space.small, paddingBottom: Space.regular },
  headerTop: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: Space.medium },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: -Space.medium, borderRadius: 22 },
  lessonContext: { flex: 1, color: Colors.secondaryText, fontSize: 13, lineHeight: 20, fontWeight: "500" },
  progressTrack: { height: 6, overflow: "hidden", marginTop: Space.medium, borderRadius: 999, backgroundColor: Colors.track },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: Colors.primary },
  pageContent: { flexGrow: 1, width: "100%", maxWidth: LessonContentWidth, alignSelf: "center", paddingHorizontal: Space.large, paddingTop: Space.regular, paddingBottom: Space.bottomClearance },
  footer: { paddingTop: Space.regular, backgroundColor: Colors.background },
  footerContent: { width: "100%", maxWidth: LessonContentWidth, alignSelf: "center", paddingHorizontal: Space.large },
  errorText: { marginBottom: Space.medium, color: Colors.incorrect, fontSize: 15, lineHeight: 22, textAlign: "center" },
  completionContent: { flex: 1, alignItems: "center", justifyContent: "center", gap: Space.regular, paddingVertical: Space.section },
  completionIcon: { width: 80, height: 80, alignItems: "center", justifyContent: "center", marginBottom: Space.small, borderRadius: 24, backgroundColor: Colors.soft },
  completionEyebrow: { ...Type.eyebrow, color: Colors.primary, textAlign: "center" },
  completionTitle: { ...Type.title, color: Colors.text, textAlign: "center" },
  completionLesson: { ...Type.body, maxWidth: 380, color: Colors.text, fontWeight: "600", textAlign: "center" },
  completionSummary: { ...Type.body, maxWidth: 380, color: Colors.secondaryText, textAlign: "center" },
});
