import { StatusBar } from "expo-status-bar";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { AccessibilityInfo, Animated, Easing, Modal, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { TransitionSubjectMascot } from "@/components/SubjectMascot";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject, type SubjectDefinition, type SubjectId } from "@/product/subjects";

interface SubjectTransitionContextValue {
  transitionToSubject: (subjectId: SubjectId) => void;
}

const SubjectTransitionContext = createContext<SubjectTransitionContextValue | null>(null);

const SPLASH_PATH = "M110 12 C123 7 126 34 139 39 C152 44 173 21 181 34 C190 46 169 65 176 78 C182 90 210 88 209 104 C208 119 181 119 177 132 C173 145 195 164 181 175 C168 186 151 161 137 169 C123 176 125 209 109 211 C94 213 94 181 79 176 C64 171 45 191 34 179 C23 167 46 148 42 134 C38 121 9 118 10 103 C11 89 38 90 42 76 C46 63 26 44 38 34 C50 24 65 46 79 39 C94 32 95 12 110 12 Z";

const SUBJECT_MOMENTS: Record<SubjectId, { line: string; glyphs: string[]; x: number; y: number }> = {
  mathematics: { line: "Make it add up.", glyphs: ["π", "+", "×"], x: 0.77, y: 0.51 },
  physics: { line: "Set ideas in motion.", glyphs: ["✦", "↝", "✦"], x: 0.76, y: 0.62 },
  biology: { line: "Look a little closer.", glyphs: ["✦", "◌", "✦"], x: 0.78, y: 0.61 },
  chemistry: { line: "Let’s experiment.", glyphs: [], x: 0.16, y: 0.37 },
  "computer-science": { line: "Make something work.", glyphs: ["{ }", "</>", "_"], x: 0.74, y: 0.72 },
  economics: { line: "Watch ideas grow.", glyphs: ["£", "↗", "+"], x: 0.82, y: 0.52 },
};

function ChemistryEffect({ progress, size }: { progress: Animated.Value; size: number }) {
  const x = size * SUBJECT_MOMENTS.chemistry.x;
  const y = size * SUBJECT_MOMENTS.chemistry.y;
  const bubbleOpacity = progress.interpolate({ inputRange: [0, 0.08, 0.43, 0.62], outputRange: [0, 0.85, 0.85, 0], extrapolate: "clamp" });
  const burstOpacity = progress.interpolate({ inputRange: [0, 0.65, 0.74, 1], outputRange: [0, 0, 0.95, 0], extrapolate: "clamp" });
  const burstScale = progress.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0.2, 0.2, 2.7], extrapolate: "clamp" });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {[0, 1, 2, 3].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.bubble,
            {
              left: x + (index - 1.5) * 10,
              top: y + index * 3,
              width: 7 + index * 2,
              height: 7 + index * 2,
              borderRadius: 8,
              opacity: bubbleOpacity,
              transform: [
                { translateX: progress.interpolate({ inputRange: [0, 0.62], outputRange: [0, (index % 2 ? 1 : -1) * (8 + index * 4)], extrapolate: "clamp" }) },
                { translateY: progress.interpolate({ inputRange: [0, 0.62], outputRange: [0, -32 - index * 11], extrapolate: "clamp" }) },
              ],
            },
          ]}
        />
      ))}
      <Animated.View style={[styles.burstGlow, { left: x - 29, top: y - 29, opacity: burstOpacity, transform: [{ scale: burstScale }] }]} />
      <Animated.View style={[styles.burstRing, { left: x - 22, top: y - 22, opacity: burstOpacity, transform: [{ scale: burstScale }] }]} />
      {[-80, -37, 5, 49, 91, 143].map((angle, index) => {
        const radians = (angle * Math.PI) / 180;
        return (
          <Animated.View
            key={angle}
            style={[
              styles.burstSpark,
              {
                left: x,
                top: y,
                opacity: burstOpacity,
                transform: [
                  { translateX: progress.interpolate({ inputRange: [0, 0.66, 1], outputRange: [0, 0, Math.cos(radians) * (38 + index % 2 * 13)], extrapolate: "clamp" }) },
                  { translateY: progress.interpolate({ inputRange: [0, 0.66, 1], outputRange: [0, 0, Math.sin(radians) * (38 + index % 2 * 13)], extrapolate: "clamp" }) },
                  { rotate: `${angle + 90}deg` },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function SubjectEffect({ subjectId, progress, size }: { subjectId: SubjectId; progress: Animated.Value; size: number }) {
  if (subjectId === "chemistry") return <ChemistryEffect progress={progress} size={size} />;
  const moment = SUBJECT_MOMENTS[subjectId];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {moment.glyphs.map((glyph, index) => {
        const start = index * 0.13;
        const end = 0.75 + index * 0.08;
        return (
          <Animated.Text
            key={`${glyph}-${index}`}
            style={[
              styles.effectGlyph,
              {
                left: size * moment.x + (index - 1) * 21,
                top: size * moment.y + (index % 2) * 9,
                opacity: progress.interpolate({ inputRange: [0, start + 0.01, start + 0.13, end, 1], outputRange: [0, 0, 1, 1, 0], extrapolate: "clamp" }),
                transform: [
                  { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, -48 - index * 8] }) },
                  { scale: progress.interpolate({ inputRange: [0, 0.38, 1], outputRange: [0.6, 1.1, 0.9] }) },
                ],
              },
            ]}
          >
            {glyph}
          </Animated.Text>
        );
      })}
    </View>
  );
}

function SubjectTransitionScene({ subject, onCovered, onComplete }: { subject: SubjectDefinition; onCovered: () => void; onComplete: () => void }) {
  const { width, height } = useWindowDimensions();
  const callbacks = useRef({ onCovered, onComplete });
  const { splashScale, mascotEntrance, mascotOpacity, copyOpacity, float, tilt, breathe, effect, pose } = useMemo(() => ({
    splashScale: new Animated.Value(0.015),
    mascotEntrance: new Animated.Value(0),
    mascotOpacity: new Animated.Value(0),
    copyOpacity: new Animated.Value(0),
    float: new Animated.Value(0),
    tilt: new Animated.Value(0),
    breathe: new Animated.Value(0),
    effect: new Animated.Value(0),
    pose: new Animated.Value(0),
  }), []);
  const mascotSize = Math.min(width * 0.85, height * 0.46, 370);
  const fullScale = Math.hypot(width, height) / 125 + 1.5;

  useEffect(() => { callbacks.current = { onCovered, onComplete }; }, [onCovered, onComplete]);

  useEffect(() => {
    let cancelled = false;
    const running: Animated.CompositeAnimation[] = [];
    const start = (animation: Animated.CompositeAnimation) => { running.push(animation); animation.start(); };
    const fill = Animated.timing(splashScale, { toValue: fullScale, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    running.push(fill);
    fill.start(({ finished }) => {
      if (!finished || cancelled) return;
      callbacks.current.onCovered();
      const enter = Animated.parallel([
        Animated.spring(mascotEntrance, { toValue: 1, friction: 7, tension: 100, useNativeDriver: true }),
        Animated.timing(mascotOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(copyOpacity, { toValue: 1, duration: 340, useNativeDriver: true }),
      ]);
      running.push(enter);
      enter.start(({ finished: entered }) => {
        if (!entered || cancelled) return;
        start(Animated.loop(Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 1050, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])));
        start(Animated.loop(Animated.sequence([
          Animated.timing(tilt, { toValue: 1, duration: 1360, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(tilt, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])));
        start(Animated.loop(Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 1250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0, duration: 1050, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])));
        start(Animated.timing(effect, { toValue: 1, duration: 1750, easing: Easing.linear, useNativeDriver: true }));
        start(Animated.timing(pose, { toValue: subject.id === "chemistry" ? 4 : 1, duration: 1750, easing: Easing.linear, useNativeDriver: true }));

        const hold = Animated.delay(1900);
        running.push(hold);
        hold.start(({ finished: held }) => {
          if (!held || cancelled) return;
          const leave = Animated.parallel([
            Animated.timing(mascotOpacity, { toValue: 0, duration: 190, useNativeDriver: true }),
            Animated.timing(copyOpacity, { toValue: 0, duration: 190, useNativeDriver: true }),
          ]);
          running.push(leave);
          leave.start(({ finished: left }) => {
            if (!left || cancelled) return;
            const reverse = Animated.timing(splashScale, { toValue: 0.015, duration: 750, easing: Easing.inOut(Easing.cubic), useNativeDriver: true });
            running.push(reverse);
            reverse.start(({ finished: reversed }) => {
              if (reversed && !cancelled) callbacks.current.onComplete();
            });
          });
        });
      });
    });

    return () => { cancelled = true; running.forEach((animation) => animation.stop()); };
  }, [breathe, copyOpacity, effect, float, fullScale, mascotEntrance, mascotOpacity, pose, splashScale, subject.id, tilt]);

  const splashRotate = splashScale.interpolate({ inputRange: [0, fullScale], outputRange: ["-14deg", "7deg"], extrapolate: "clamp" });
  const mascotRise = mascotEntrance.interpolate({ inputRange: [0, 1], outputRange: [72, 0] });
  const mascotScale = mascotEntrance.interpolate({ inputRange: [0, 1], outputRange: [0.73, 1] });
  const mascotTurn = mascotEntrance.interpolate({ inputRange: [0, 1], outputRange: ["-11deg", "0deg"] });

  return (
    <View style={styles.scene} accessibilityViewIsModal>
      <StatusBar style="light" />
      <Animated.View style={[styles.splash, { left: width / 2 - 110, top: height / 2 - 110, transform: [{ scale: splashScale }, { rotate: splashRotate }] }]}>
        <Svg width={220} height={220} viewBox="0 0 220 220"><Path d={SPLASH_PATH} fill={subject.transitionColor} /></Svg>
      </Animated.View>
      <Animated.View style={[styles.splashDroplet, { left: width / 2 - 77, top: height / 2 - 72, backgroundColor: subject.transitionColor, transform: [{ translateX: splashScale.interpolate({ inputRange: [0, fullScale], outputRange: [-24, -80] }) }, { scale: splashScale.interpolate({ inputRange: [0, 1, fullScale], outputRange: [0, 1.2, 0] }) }] }]} />
      <Animated.View style={[styles.splashDroplet, { left: width / 2 + 69, top: height / 2 + 42, backgroundColor: subject.transitionColor, transform: [{ translateX: splashScale.interpolate({ inputRange: [0, fullScale], outputRange: [12, 72] }) }, { scale: splashScale.interpolate({ inputRange: [0, 1.2, fullScale], outputRange: [0, 1, 0] }) }] }]} />

      <Animated.View style={[styles.heading, { opacity: copyOpacity, transform: [{ translateY: copyOpacity.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }]}>
        <Text style={styles.kicker}>ACE A LEVEL</Text>
        <Text style={styles.title}>{subject.title}</Text>
      </Animated.View>
      <Animated.View style={[styles.mascotEntrance, { width: mascotSize, height: mascotSize, left: (width - mascotSize) / 2, top: height * 0.31, opacity: mascotOpacity, transform: [{ translateY: mascotRise }, { scale: mascotScale }, { rotate: mascotTurn }] }]}>
        <Animated.View style={{ width: mascotSize, height: mascotSize, transform: [
          { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [3, -4] }) },
          { rotate: tilt.interpolate({ inputRange: [0, 1], outputRange: ["-0.8deg", "0.8deg"] }) },
          { scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] }) },
        ] }}>
          <TransitionSubjectMascot subjectId={subject.id} size={mascotSize} progress={pose} />
          <SubjectEffect subjectId={subject.id} progress={effect} size={mascotSize} />
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[styles.footer, { opacity: copyOpacity }]}>{SUBJECT_MOMENTS[subject.id].line}</Animated.Text>
    </View>
  );
}

export function SubjectTransitionProvider({ children }: PropsWithChildren) {
  const { activeSubjectId, setActiveSubject } = useCourse();
  const [transition, setTransition] = useState<SubjectDefinition | null>(null);
  const busy = useRef(false);

  const transitionToSubject = useCallback((subjectId: SubjectId) => {
    if (busy.current || subjectId === activeSubjectId) return;
    const subject = findSubject(subjectId);
    if (!subject) return;
    busy.current = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (reduceMotion) {
          void setActiveSubject(subjectId);
          busy.current = false;
        } else {
          setTransition(subject);
        }
      })
      .catch(() => setTransition(subject));
  }, [activeSubjectId, setActiveSubject]);

  const value = useMemo(() => ({ transitionToSubject }), [transitionToSubject]);

  return (
    <SubjectTransitionContext.Provider value={value}>
      {children}
      <Modal animationType="none" visible={transition !== null} transparent presentationStyle="overFullScreen" statusBarTranslucent navigationBarTranslucent onRequestClose={() => {}}>
        {transition ? (
          <SubjectTransitionScene
            key={transition.id}
            subject={transition}
            onCovered={() => { void setActiveSubject(transition.id); }}
            onComplete={() => { busy.current = false; setTransition(null); }}
          />
        ) : null}
      </Modal>
    </SubjectTransitionContext.Provider>
  );
}

export function useSubjectTransition() {
  const value = useContext(SubjectTransitionContext);
  if (!value) throw new Error("useSubjectTransition must be used inside SubjectTransitionProvider.");
  return value;
}

const styles = StyleSheet.create({
  scene: { flex: 1, overflow: "hidden", backgroundColor: "transparent" },
  splash: { position: "absolute", width: 220, height: 220 },
  splashDroplet: { position: "absolute", width: 33, height: 27, borderRadius: 16 },
  heading: { position: "absolute", top: "15%", left: 24, right: 24, alignItems: "center" },
  kicker: { color: "#E7DDFB", fontSize: 11, fontWeight: "800", letterSpacing: 2.3 },
  title: { color: "#FFFFFF", fontSize: 39, lineHeight: 47, fontWeight: "700", letterSpacing: -1.2, marginTop: 8, textAlign: "center" },
  mascotEntrance: { position: "absolute" },
  footer: { position: "absolute", bottom: "13%", left: 24, right: 24, textAlign: "center", color: "#FFFFFF", fontSize: 16, fontWeight: "600", letterSpacing: 0.2 },
  effectGlyph: { position: "absolute", color: "#FFFFFF", fontSize: 28, fontWeight: "800", textShadowColor: "#34137B", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  bubble: { position: "absolute", backgroundColor: "#C780FF", borderColor: "#FFE9FF", borderWidth: 2, shadowColor: "#FFFFFF", shadowOpacity: 0.65, shadowRadius: 8 },
  burstGlow: { position: "absolute", width: 58, height: 58, borderRadius: 29, backgroundColor: "#F5D5FF" },
  burstRing: { position: "absolute", width: 44, height: 44, borderRadius: 22, borderWidth: 4, borderColor: "#FFFFFF" },
  burstSpark: { position: "absolute", width: 6, height: 17, borderRadius: 3, backgroundColor: "#FFE5A7" },
});
