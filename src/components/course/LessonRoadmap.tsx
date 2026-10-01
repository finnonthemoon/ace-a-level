import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";

import { StarMascot } from "@/components/StarMascot";
import { Colors } from "@/constants/theme";
import type { CourseLessonDefinition } from "@/content/course-catalog";
import type { TopicProgressRecord } from "@/contexts/TopicProgressContext";

export type RoadmapNodeState = "not-started" | "current" | "completed";
export type LessonRoadmapItem = { type: "lesson"; lesson: CourseLessonDefinition };
export type CheckpointRoadmapItem = {
  type: "checkpoint";
  id: string;
  title: string;
  questionCount: number;
  /** Omit to place at the end. An anchor must belong to the visible lessons. */
  afterLessonId?: string;
  completed?: boolean;
  onPress: () => void;
};
export type RoadmapItem = LessonRoadmapItem | CheckpointRoadmapItem;

interface LessonRoadmapProps {
  lessons: readonly CourseLessonDefinition[];
  progress: TopicProgressRecord;
  isHydrated: boolean;
  onLessonPress: (lessonId: string) => void;
  /** Only supply checkpoints backed by real content and an existing action. */
  checkpoints?: readonly CheckpointRoadmapItem[];
}

const NODE_CENTER_Y = 52;
const MIN_ROW_HEIGHT = 140;
const LABEL_WIDTH = 176;
const MIN_LABEL_WIDTH = 128;
const LABEL_OUTSET = 44;
const LABEL_GAP = 22;
const ROW_BOTTOM_SPACE = 18;
const GUIDE_WIDTH = 64;
const GUIDE_GAP = 18;
const SAFE_EDGE = 6;
const NARROW_GUIDE_HEIGHT = 80;
const NODE_X_POSITIONS = [0.54, 0.63, 0.47, 0.36, 0.55, 0.64, 0.45, 0.38] as const;
const NO_CHECKPOINTS: readonly CheckpointRoadmapItem[] = [];

function itemKey(item: RoadmapItem) {
  return item.type === "lesson" ? `lesson:${item.lesson.id}` : `checkpoint:${item.id}`;
}

function getNodeX(index: number, width: number, checkpoint: boolean) {
  const fraction = checkpoint ? 0.5 : NODE_X_POSITIONS[index % NODE_X_POSITIONS.length]
    + (Math.floor(index / NODE_X_POSITIONS.length) % 2) * 0.012;
  const inset = Math.min(NODE_CENTER_Y + SAFE_EDGE, width / 2);
  return Math.max(inset, Math.min(width - inset, fraction * width));
}

function getConnectorSide(startX: number, endX: number) {
  return Math.sign(endX - startX) || 1;
}

function getLabelLayout(x: number, nextX: number | undefined, width: number) {
  // Put labels toward the outside of the route. Nodes near an edge use that
  // same outside edge; central nodes use the side opposite their next bend.
  const side = Math.abs(x - width / 2) > width * 0.1
    ? Math.sign(x - width / 2)
    : nextX === undefined ? 1 : -getConnectorSide(x, nextX);
  const outset = side * Math.min(LABEL_OUTSET, width * 0.14);
  const inset = Math.min(MIN_LABEL_WIDTH / 2 + SAFE_EDGE, width / 2);
  const center = Math.max(inset, Math.min(width - inset, x + outset));
  const labelWidth = Math.min(LABEL_WIDTH, Math.max(0, Math.min(center - SAFE_EDGE, width - SAFE_EDGE - center) * 2));
  return {
    left: Math.max(SAFE_EDGE, center - labelWidth / 2), width: labelWidth,
  };
}

function getNodeMetrics(state: RoadmapNodeState, checkpoint: boolean) {
  if (checkpoint) return { frameSize: 104, faceSize: 90 };
  if (state === "current") return { frameSize: 92, faceSize: 80 };
  if (state === "completed") return { frameSize: 82, faceSize: 70 };
  return { frameSize: 74, faceSize: 63 };
}

interface RoadmapPoint { x: number; y: number }

function connectorPath(start: RoadmapPoint, end: RoadmapPoint) {
  const deltaY = end.y - start.y;
  // Nodes are points on the route. Vertical tangents at both centres make
  // each connection flow smoothly into and out of the circles.
  return `M ${start.x} ${start.y} C ${start.x} ${start.y + deltaY * 0.42}, ${end.x} ${end.y - deltaY * 0.42}, ${end.x} ${end.y}`;
}

function getRecommendedLessonIndex(lessons: readonly CourseLessonDefinition[], completedLessonIds: readonly string[]) {
  const completedIds = new Set(completedLessonIds);
  const latestCompletedIndex = lessons.reduce(
    (latest, lesson, index) => completedIds.has(lesson.id) ? index : latest,
    -1,
  );
  return lessons.findIndex((lesson, index) => index > latestCompletedIndex && !completedIds.has(lesson.id));
}

function guidePlacement(nodeCenter: number, width: number) {
  const radius = getNodeMetrics("current", false).frameSize / 2;
  const left = nodeCenter - radius - GUIDE_GAP - GUIDE_WIDTH;
  const right = nodeCenter + radius + GUIDE_GAP;
  if (nodeCenter < width / 2 && right + GUIDE_WIDTH <= width - SAFE_EDGE) return { left: right, pointsRight: false };
  if (left >= SAFE_EDGE) return { left, pointsRight: true };
  if (right + GUIDE_WIDTH <= width - SAFE_EDGE) return { left: right, pointsRight: false };
  return null;
}

function RoadmapNode({ state, number, checkpoint = false, pressed }: { state: RoadmapNodeState; number?: number; checkpoint?: boolean; pressed: boolean }) {
  const { frameSize, faceSize } = getNodeMetrics(state, checkpoint);
  const filled = state === "current" || state === "completed";
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const animation = Animated.timing(scale, { toValue: pressed ? 0.965 : 1, duration: pressed ? 90 : 140, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [pressed, scale]);

  return (
    <Animated.View style={[
      styles.nodeFrame,
      { width: frameSize, height: frameSize, borderRadius: frameSize / 2, transform: [{ scale }] },
      state === "current" && styles.currentNodeFrame,
      state === "completed" && styles.completedNodeFrame,
      checkpoint && styles.checkpointNodeFrame,
    ]}>
      <View style={[
        styles.nodeBase,
        { width: faceSize, height: faceSize, borderRadius: faceSize / 2 },
        filled && styles.filledNodeBase,
      ]} />
      <View style={[
        styles.nodeFace,
        { width: faceSize, height: faceSize, borderRadius: faceSize / 2 },
        state === "current" && styles.currentNodeFace,
        state === "completed" && styles.completedNodeFace,
        checkpoint && !filled && styles.checkpointNodeFace,
      ]}>
        <View pointerEvents="none" style={[styles.faceHighlight, filled && styles.filledHighlight]} />
        {checkpoint ? <Ionicons name="star" size={38} color={filled ? Colors.surface : Colors.primary} />
          : state === "completed" ? <Ionicons name="checkmark" size={32} color={Colors.surface} />
          : state === "current" ? <Ionicons name="play" size={28} color={Colors.surface} style={styles.playIcon} />
          : <Text style={styles.nodeNumber}>{number}</Text>}
      </View>
    </Animated.View>
  );
}

function RoadmapGuide({ hasProgress, pointsRight }: { hasProgress: boolean; pointsRight: boolean }) {
  return (
    <View accessible={false} pointerEvents="none" style={styles.guide}>
      <View style={styles.speechBubble}>
        <Text maxFontSizeMultiplier={1.2} style={styles.speechText}>{hasProgress ? "Up next!" : "Start here!"}</Text>
        <View style={[styles.bubbleTail, pointsRight ? styles.tailRight : styles.tailLeft]} />
      </View>
      <StarMascot stage="blue" size={54} decorative style={{ transform: [{ rotate: pointsRight ? "8deg" : "-8deg" }] }} />
    </View>
  );
}

export function LessonRoadmap({ lessons, progress, isHydrated, onLessonPress, checkpoints = NO_CHECKPOINTS }: LessonRoadmapProps) {
  const [roadmapWidth, setRoadmapWidth] = useState(0);
  const [rowHeights, setRowHeights] = useState<Record<string, { width: number; height: number }>>({});
  const completedIds = progress.completedLessonIds;
  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  const recommendedIndex = useMemo(
    () => isHydrated ? getRecommendedLessonIndex(lessons, completedIds) : -1,
    [completedIds, isHydrated, lessons],
  );
  const items = useMemo<RoadmapItem[]>(() => [
    ...lessons.flatMap((lesson): RoadmapItem[] => [
      { type: "lesson", lesson },
      ...checkpoints.filter((checkpoint) => checkpoint.afterLessonId === lesson.id),
    ]),
    ...checkpoints.filter((checkpoint) => checkpoint.afterLessonId === undefined),
  ], [checkpoints, lessons]);
  const completedCount = lessons.filter((lesson) => completedSet.has(lesson.id)).length;
  const recommendedId = lessons[recommendedIndex]?.id;

  // Measure row heights to keep nodes aligned when titles wrap. Connector
  // geometry depends only on those nodes, never on measured label boundaries.
  let rowTop = 0;
  let lessonNumber = 0;
  const rows = items.map((item, index) => {
    const key = itemKey(item);
    const state: RoadmapNodeState = item.type === "checkpoint"
      ? (isHydrated && item.completed ? "completed" : "not-started")
      : isHydrated && completedSet.has(item.lesson.id) ? "completed"
        : item.lesson.id === recommendedId ? "current" : "not-started";
    const checkpoint = item.type === "checkpoint";
    const { frameSize } = getNodeMetrics(state, checkpoint);
    const nodeAreaHeight = NODE_CENTER_Y + frameSize / 2;
    const x = getNodeX(index, roadmapWidth, checkpoint);
    const guide = state === "current" ? guidePlacement(x, roadmapWidth) : null;
    const stackGuide = state === "current" && !guide;
    const guideHeight = stackGuide ? NARROW_GUIDE_HEIGHT : 0;
    const measured = rowHeights[key];
    const height = measured?.width === roadmapWidth ? measured.height
      : Math.max(MIN_ROW_HEIGHT, nodeAreaHeight + LABEL_GAP + 40 + ROW_BOTTOM_SPACE) + guideHeight;
    const nextItem = items[index + 1];
    const nextX = nextItem ? getNodeX(index + 1, roadmapWidth, nextItem.type === "checkpoint") : undefined;
    const label = getLabelLayout(x, nextX, roadmapWidth);
    const row = { item, key, state, x, y: rowTop + guideHeight + NODE_CENTER_Y, label, frameSize, nodeAreaHeight, guide, stackGuide, number: item.type === "lesson" ? ++lessonNumber : undefined };
    rowTop += height;
    return row;
  });

  return (
    <View onLayout={(event) => setRoadmapWidth(event.nativeEvent.layout.width)} style={styles.roadmap}>
      {roadmapWidth > 0 ? (
        <Svg accessible={false} pointerEvents="none" width={roadmapWidth} height={rowTop} style={StyleSheet.absoluteFill}>
          {rows.slice(1).map((row, index) => {
            const previous = rows[index];
            const path = connectorPath(previous, row);
            const completed = previous.state === "completed";
            return (
              <G key={`${previous.key}:${row.key}`}>
                <Path d={path} fill="none" stroke={completed ? "#D8E4F7" : "#E5EDF9"} strokeWidth={9} strokeLinecap="round" />
                <Path d={path} fill="none" stroke={completed ? Colors.primary : "#9DBAE9"} strokeWidth={6} strokeLinecap="round" />
                <Path d={path} fill="none" stroke={completed ? "#82A8E8" : "#C4D6F3"} strokeWidth={1} strokeLinecap="round" />
              </G>
            );
          })}
        </Svg>
      ) : null}

      {rows.map(({ item, key, state, x, label, frameSize, nodeAreaHeight, guide, stackGuide, number }) => {
        const isLesson = item.type === "lesson";
        const title = isLesson ? item.lesson.title : item.title;
        const stageDescription = isLesson ? (item.lesson.stage === "as" ? "AS content" : "A Level only content") : "checkpoint";
        const status = !isHydrated ? "progress loading" : state === "current" ? "recommended next lesson" : state === "completed" ? "completed" : "not started";
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${stageDescription}, ${isLesson ? `lesson ${number} of ${lessons.length}` : `${item.questionCount} questions`}, ${status}${isLesson && item.lesson.contentStatus === "planned" ? ", teaching content coming soon" : ""}`}
            accessibilityState={{ disabled: !isHydrated }}
            disabled={!isHydrated}
            onPress={() => isLesson ? onLessonPress(item.lesson.id) : item.onPress()}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setRowHeights((current) => current[key]?.height === height && current[key]?.width === width
                ? current : { ...current, [key]: { width, height } });
            }}
            style={styles.roadmapStep}
          >
            {({ pressed }) => (
              <>
                {stackGuide ? (
                  <View style={styles.stackedGuide}><RoadmapGuide hasProgress={completedCount > 0} pointsRight /></View>
                ) : null}
                <View pointerEvents="none" style={[styles.nodeArea, { height: nodeAreaHeight }]}>
                  {state === "current" && guide ? (
                    <View style={[styles.guidePosition, { left: guide.left }]}>
                      <RoadmapGuide hasProgress={completedCount > 0} pointsRight={guide.pointsRight} />
                    </View>
                  ) : null}
                  <View style={[styles.nodePosition, { left: x - frameSize / 2, top: NODE_CENTER_Y - frameSize / 2 }]}>
                    <RoadmapNode state={state} number={number} checkpoint={!isLesson} pressed={pressed} />
                  </View>
                </View>
                <View pointerEvents="none" style={[
                  styles.lessonLabel,
                  { marginLeft: label.left, width: label.width || LABEL_WIDTH },
                ]}>
                  <Text style={[styles.lessonTitle, state === "current" && styles.currentTitle, !isLesson && styles.checkpointTitle]}>{title}</Text>
                  {isLesson && item.lesson.durationMinutes ? <Text style={styles.lessonDetail}>~{item.lesson.durationMinutes} min</Text> : null}
                  {!isLesson ? <Text style={styles.lessonDetail}>{item.questionCount} questions</Text> : null}
                </View>
              </>
            )}
          </Pressable>
        );
      })}
      {isHydrated && lessons.length > 0 && completedCount === lessons.length ? (
        <View style={styles.completeMessage}>
          <Ionicons name="checkmark-circle" size={17} color={Colors.primary} />
          <Text style={styles.completeText}>Topic lessons complete</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  roadmap: { position: "relative", width: "100%" },
  roadmapStep: { position: "relative", minHeight: MIN_ROW_HEIGHT, paddingBottom: ROW_BOTTOM_SPACE, width: "100%", borderRadius: 20 },
  nodeArea: { width: "100%" },
  nodePosition: { position: "absolute" },
  guidePosition: { position: "absolute", top: -6, width: GUIDE_WIDTH },
  stackedGuide: { height: NARROW_GUIDE_HEIGHT, alignItems: "center" },
  guide: { width: GUIDE_WIDTH, alignItems: "center" },
  speechBubble: { minHeight: 21, justifyContent: "center", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: "#D5E1F2", backgroundColor: Colors.surface, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  speechText: { color: Colors.primaryDeep, fontSize: 9, lineHeight: 12, fontWeight: "700", textAlign: "center" },
  bubbleTail: { position: "absolute", bottom: -3, width: 5, height: 5, borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#D5E1F2", backgroundColor: Colors.surface, transform: [{ rotate: "45deg" }] },
  tailRight: { right: 12 },
  tailLeft: { left: 12 },
  nodeFrame: { alignItems: "center", justifyContent: "center", backgroundColor: "#E4EDFB", borderWidth: 1, borderColor: "#D5E2F5", shadowColor: Colors.primaryDeep, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  currentNodeFrame: { backgroundColor: "#D9E6FC", borderColor: "#C7D9F8", shadowOpacity: 0.16, shadowRadius: 8, elevation: 5 },
  completedNodeFrame: { backgroundColor: "#DCE8FA", borderColor: "#CADCF6" },
  checkpointNodeFrame: { borderWidth: 2, borderColor: "#BCD0F0", backgroundColor: "#E1EBFB" },
  nodeBase: { position: "absolute", backgroundColor: "#799CD4", transform: [{ translateY: 4 }] },
  filledNodeBase: { backgroundColor: Colors.primaryDark },
  nodeFace: { marginTop: -4, alignItems: "center", justifyContent: "center", borderWidth: 2.5, borderColor: "#7FA5DF", backgroundColor: "#F5F9FF", overflow: "hidden" },
  currentNodeFace: { borderColor: "#3064C6", backgroundColor: Colors.primary },
  completedNodeFace: { borderColor: "#3567B8", backgroundColor: Colors.primaryDark },
  checkpointNodeFace: { borderColor: "#6D95D4", backgroundColor: "#ECF3FF" },
  faceHighlight: { position: "absolute", top: 2, left: 9, right: 9, height: 24, borderTopWidth: 2, borderColor: Colors.surface, borderRadius: 36 },
  filledHighlight: { borderColor: "rgba(255,255,255,0.16)" },
  playIcon: { marginLeft: 4 },
  nodeNumber: { color: Colors.primaryDark, fontSize: 17, fontWeight: "600" },
  lessonLabel: { marginTop: LABEL_GAP, alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  lessonTitle: { width: "100%", color: Colors.ink, fontSize: 15, lineHeight: 20, fontWeight: "700", textAlign: "center" },
  currentTitle: { color: Colors.primaryDeep, fontWeight: "800" },
  checkpointTitle: { color: Colors.primaryDeep, fontWeight: "800" },
  lessonDetail: { color: Colors.muted, fontSize: 11, lineHeight: 15, textAlign: "center" },
  completeMessage: { flexDirection: "row", alignSelf: "center", alignItems: "center", gap: 6, marginTop: 2, paddingVertical: 10 },
  completeText: { color: Colors.primaryDark, fontSize: 12, fontWeight: "700" },
});
