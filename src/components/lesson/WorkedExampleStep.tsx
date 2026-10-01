import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, FadeInDown, ReduceMotion } from "react-native-reanimated";

import { MathContent } from "@/components/course/MathContent";
import { LessonColors as Colors, LessonShadow, LessonSpacing as Space, LessonStepTones, LessonTypography as Type } from "@/constants/theme";
import type { LessonStepHint } from "@/content/lesson-content";

const stepEntry = FadeInDown.duration(260)
  .easing(Easing.out(Easing.cubic))
  .withInitialValues({ opacity: 0, transform: [{ translateY: 10 }] })
  .reduceMotion(ReduceMotion.System);

/** Promote the existing instruction; keep mathematical notation in the maths renderer. */
function stepPresentation(content: string) {
  const instruction = content.match(/^(.*?):\s+([\s\S]+)$/);
  if (instruction) {
    const isMaths = /^\\\([\s\S]+\\\)[.,]?$/.test(instruction[2]);
    return { title: instruction[1], maths: isMaths ? instruction[2] : null, explanation: isMaths ? null : instruction[2] };
  }
  if (/^\\\([\s\S]+\\\)[.,]?$/.test(content)) return { title: null, maths: content, explanation: null };
  if (!content.includes(String.raw`\(`)) return { title: content.replace(/[.]$/, ""), maths: null, explanation: null };
  return { title: null, maths: null, explanation: content };
}

export function WorkedExampleStep({ content, index, hints }: { content: string; index: number; hints?: readonly LessonStepHint[] }) {
  const presentation = stepPresentation(content);
  const stepHints = hints?.filter((hint) => hint.stepIndex === index) ?? [];
  const tone = LessonStepTones[index % LessonStepTones.length];
  return (
    <Animated.View entering={stepEntry} style={[styles.frame, { backgroundColor: tone.surface }]}>
      <View style={[styles.card, { backgroundColor: tone.surface, borderColor: tone.border }]}>
        <View pointerEvents="none" style={[styles.accent, { backgroundColor: tone.accent }]} />
        <View style={styles.heading}>
          <View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View>
          {presentation.title ? (
            <View style={styles.headingCopy}>
              {presentation.title.includes(String.raw`\(`) ? (
                <MathContent content={presentation.title} size={17} color={Colors.text} textStyle={styles.title} />
              ) : <Text style={styles.title}>{presentation.title}</Text>}
            </View>
          ) : null}
        </View>
        {presentation.explanation ? <MathContent content={presentation.explanation} size={Type.body.fontSize} color={Colors.bodyText} textStyle={Type.body} /> : null}
        {presentation.maths ? (
          <View style={styles.maths}>
            <MathContent content={presentation.maths} size={24} color={Colors.text} textStyle={{ lineHeight: 32, fontWeight: "600" }} />
          </View>
        ) : null}
        {stepHints.map((hint, hintIndex) => (
          <View key={hintIndex} style={styles.hint}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.example} style={styles.hintIcon} />
            <View style={styles.hintCopy}>
              <Text style={styles.hintTitle}>{hint.title}</Text>
              <MathContent content={hint.content} size={14} color={Colors.bodyText} textStyle={{ lineHeight: 22, fontWeight: "400" }} />
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 22, ...LessonShadow.step },
  card: { gap: Space.regular, padding: Space.large, borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  accent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  heading: { flexDirection: "row", alignItems: "center", gap: Space.medium },
  number: { width: 44, height: 44, flexShrink: 0, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary },
  numberText: { color: Colors.surface, fontSize: 18, lineHeight: 24, fontWeight: "800", includeFontPadding: false, textAlign: "center" },
  headingCopy: { flex: 1 },
  title: { color: Colors.text, fontSize: 17, lineHeight: 24, fontWeight: "700" },
  maths: { paddingVertical: Space.small },
  hint: { flexDirection: "row", alignItems: "flex-start", gap: Space.small, paddingTop: Space.medium, borderTopWidth: 1, borderTopColor: Colors.track },
  hintIcon: { marginTop: 2 },
  hintCopy: { flex: 1, gap: Space.small },
  hintTitle: { color: Colors.bodyText, fontSize: 13, lineHeight: 20, fontWeight: "600" },
});
