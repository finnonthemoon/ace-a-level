import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, FadeIn, ReduceMotion } from "react-native-reanimated";

import { LessonKnowledgeCheck } from "@/components/course/LessonKnowledgeCheck";
import { MathContent } from "@/components/course/MathContent";
import { WorkedExampleStep } from "@/components/lesson/WorkedExampleStep";
import { LessonColors as Colors, LessonShadow, LessonSpacing as Space, LessonTypography as Type } from "@/constants/theme";
import type { LessonPage } from "@/content/lesson-content";

const answerEntry = FadeIn.duration(280).easing(Easing.out(Easing.cubic)).reduceMotion(ReduceMotion.System);

interface LessonPageViewProps {
  page: LessonPage;
  contextLabel: string;
  visibleStepCount: number;
  selectedOptionId: string | null;
  checkSubmitted: boolean;
  onSelectOption: (optionId: string) => void;
  checkDisabled: boolean;
}

/** Lift existing notation into a focal display only when a page has no other focal surface. */
function teachingFocalExpression(page: Extract<LessonPage, { type: "teaching" }>): string | null {
  if (!page.blocks.every((block) => block.type === "text")) return null;
  const copy = page.blocks.map((block) => block.type === "text" ? block.content : "").join(" ");
  const maths = Array.from(copy.matchAll(/\\\((.*?)\\\)/g));
  const notation: string[] = [];
  for (let index = 0; index < maths.length - 1; index += 1) {
    const source = maths[index];
    const destination = maths[index + 1];
    const connectingCopy = copy.slice(source.index + source[0].length, destination.index).trim();
    if (connectingCopy === "is written") {
      notation.push(String.raw`${source[1]} &\longrightarrow ${destination[1]}`);
    }
  }
  if (notation.length > 0) return String.raw`\begin{aligned}${notation.slice(0, 2).join(String.raw`\\`)}\end{aligned}`;
  return maths.find((match) => match[1].length <= 80 && /[=^+\-]|\\times/.test(match[1]))?.[1] ?? null;
}

function LessonCaution({ title, content }: { title: string; content: string }) {
  return (
    <View style={styles.note}>
      <View style={styles.noteHeading}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.secondaryText} />
        <Text style={styles.noteLabel}>Take care</Text>
      </View>
      <Text style={styles.noteTitle}>{title}</Text>
      <MathContent content={content} size={Type.body.fontSize} color={Colors.bodyText} textStyle={Type.body} />
    </View>
  );
}

export function LessonPageView({
  page,
  contextLabel,
  visibleStepCount,
  selectedOptionId,
  checkSubmitted,
  onSelectOption,
  checkDisabled,
}: LessonPageViewProps) {
  const isExample = page.type === "worked-example";
  const pageLabel = page.type === "check" ? "Quick check" : isExample ? "Worked example" : page.type === "recap" ? "Recap" : undefined;
  const focalExpression = page.type === "teaching" ? teachingFocalExpression(page) : null;
  const showTeachingIcon = page.type === "teaching" && page.blocks.some((block) => block.type === "callout") && !page.blocks.some((block) => block.type === "math");
  return (
    <View style={styles.page}>
      <View style={styles.pageHeading}>
        <View style={styles.contextHeading}>
          {showTeachingIcon || page.type === "recap" ? (
            <View style={styles.iconTile}>
              <Ionicons name={page.type === "teaching" ? "bulb-outline" : "checkmark-done-outline"} size={22} color={Colors.primary} />
            </View>
          ) : null}
          <View style={styles.contextCopy}>
            <Text style={styles.eyebrow}>{contextLabel}</Text>
            {pageLabel ? <Text style={styles.pageLabel}>{pageLabel}</Text> : null}
          </View>
        </View>
        {page.type !== "check" ? <Text accessibilityRole="header" style={styles.pageTitle}>{page.title}</Text> : null}
      </View>

      {page.type === "teaching" ? page.blocks.map((block, index) => {
        if (block.type === "text") {
          return <MathContent key={index} content={block.content} size={Type.body.fontSize} color={Colors.bodyText} textStyle={Type.body} />;
        }
        if (block.type === "math") {
          return (
            <View key={index} style={styles.focalExpression}>
              <MathContent content={String.raw`$$${block.expression}$$`} size={24} color={Colors.text} />
            </View>
          );
        }
        if (block.type === "warning") return <LessonCaution key={index} title={block.title} content={block.content} />;
        return (
          <View key={index} style={styles.callout}>
            <Text style={styles.calloutLabel}>Key idea</Text>
            <Text style={styles.calloutTitle}>{block.title}</Text>
            <MathContent content={block.content} size={Type.body.fontSize} color={Colors.text} textStyle={Type.body} />
          </View>
        );
      }) : null}
      {focalExpression ? (
        <View style={styles.focalExpression}>
          <MathContent content={String.raw`$$${focalExpression}$$`} size={24} color={Colors.text} />
        </View>
      ) : null}

      {page.type === "worked-example" ? (
        <>
          <View style={styles.exampleQuestion}>
            <MathContent content={page.question} size={20} color={Colors.text} textStyle={{ lineHeight: 30, fontWeight: "600" }} />
            <Text style={styles.instruction}>Follow the solution one step at a time.</Text>
          </View>
          <View style={styles.guidedSteps} accessibilityLiveRegion="polite">
            {page.steps.slice(0, visibleStepCount).map((step, index) => (
              <WorkedExampleStep key={index} content={step} index={index} hints={page.hints} />
            ))}
            {visibleStepCount >= page.steps.length ? (
              <Animated.View entering={answerEntry} style={styles.answerSurface}>
                <View style={styles.answerHeading}>
                  <View style={styles.answerCheck}><Ionicons name="checkmark" size={16} color={Colors.success} /></View>
                  <Text style={styles.answerLabel}>Final answer</Text>
                </View>
                <MathContent content={page.answer} size={28} color={Colors.example} textStyle={{ lineHeight: 36, fontWeight: "700" }} />
              </Animated.View>
            ) : null}
          </View>
        </>
      ) : null}

      {page.type === "check" ? (
        <LessonKnowledgeCheck
          block={page.check}
          disabled={checkDisabled}
          selectedOptionId={selectedOptionId}
          submitted={checkSubmitted}
          onSelect={onSelectOption}
        />
      ) : null}

      {page.type === "recap" ? (
        <View style={styles.recapList}>
          {page.points.map((point, index) => (
            <View key={index} style={styles.recapPoint}>
              <View style={styles.recapDot}><Ionicons name="checkmark" size={18} color={Colors.primary} /></View>
              <View style={styles.recapCopy}><MathContent content={point} size={Type.body.fontSize} color={Colors.text} textStyle={Type.body} /></View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: "100%", gap: Space.large },
  pageHeading: { gap: Space.medium },
  contextHeading: { flexDirection: "row", alignItems: "center", gap: Space.medium },
  contextCopy: { flex: 1, gap: Space.small },
  iconTile: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: Colors.soft },
  pageTitle: { ...Type.title, color: Colors.text },
  eyebrow: { ...Type.eyebrow, color: Colors.primary },
  pageLabel: { ...Type.secondaryEyebrow, color: Colors.secondaryText },
  focalExpression: { paddingVertical: Space.small },
  callout: { gap: Space.small, padding: Space.large, borderRadius: 20, backgroundColor: Colors.soft, borderWidth: 1, borderColor: Colors.border },
  calloutLabel: { ...Type.eyebrow, color: Colors.primary },
  calloutTitle: { color: Colors.text, fontSize: 17, lineHeight: 24, fontWeight: "700" },
  note: { gap: Space.small, paddingLeft: Space.regular, borderLeftWidth: 2, borderLeftColor: Colors.track },
  noteHeading: { flexDirection: "row", alignItems: "center", gap: Space.small },
  noteLabel: { ...Type.secondaryEyebrow, color: Colors.secondaryText },
  noteTitle: { color: Colors.bodyText, fontSize: 15, lineHeight: 22, fontWeight: "600" },
  exampleQuestion: { gap: Space.regular },
  instruction: { color: Colors.secondaryText, fontSize: 15, lineHeight: 24, fontWeight: "500" },
  guidedSteps: { gap: Space.large },
  answerSurface: { gap: Space.large, padding: Space.large, paddingVertical: Space.extraLarge, borderRadius: 22, backgroundColor: Colors.answerSurface, borderWidth: 1, borderColor: Colors.answerBorder, ...LessonShadow.answer },
  answerHeading: { flexDirection: "row", alignItems: "center", gap: Space.small },
  answerCheck: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surface },
  answerLabel: { ...Type.eyebrow, color: Colors.example },
  recapList: { gap: Space.large, padding: Space.large, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  recapPoint: { flexDirection: "row", alignItems: "flex-start", gap: Space.regular },
  recapDot: { width: 28, height: 28, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: Colors.soft },
  recapCopy: { flex: 1 },
});
