import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { useSubjectTransition } from "@/contexts/SubjectTransitionContext";
import { findSubject, type SubjectId } from "@/product/subjects";

interface Anchor { x: number; y: number; width: number; height: number }

function colorWithAlpha(color: string, alpha: number) {
  const hex = color.replace("#", "");
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function SubjectArtwork({ subjectId, color }: { subjectId: SubjectId; color: string }) {
  return (
    <View pointerEvents="none" accessible={false} style={styles.artwork}>
      <Svg width={112} height={62} viewBox="0 0 112 62">
        <G fill="none" stroke={color} strokeWidth={1.35} strokeLinecap="round" strokeLinejoin="round" opacity={0.72}>
          {subjectId === "mathematics" ? <>
            <Path d="M13 49V12M13 49H102" />
            <Path d="M18 41C31 39 34 20 48 20S65 43 78 41 91 19 101 14" />
            <Path d="M28 12h9M28 17h9M43 12h9" opacity={0.55} />
          </> : null}
          {subjectId === "physics" ? <>
            <Path d="M16 31c0-11 17-20 38-20s38 9 38 20-17 20-38 20-38-9-38-20Z" />
            <Path d="M54 11c11 0 20 17 20 20s-9 20-20 20-20-17-20-20 9-20 20-20Z" transform="rotate(55 54 31)" />
            <Circle cx="54" cy="31" r="3" fill={color} />
            <Circle cx="89" cy="23" r="2.3" fill={color} />
          </> : null}
          {subjectId === "chemistry" ? <>
            <Path d="m20 31 20-13 21 13 21-13 16 10M40 18v26l21 11 21-11V18" />
            <Circle cx="20" cy="31" r="3" fill={color} />
            <Circle cx="40" cy="18" r="3" fill={color} />
            <Circle cx="61" cy="31" r="3" fill={color} />
            <Circle cx="82" cy="18" r="3" fill={color} />
            <Circle cx="82" cy="44" r="3" fill={color} />
          </> : null}
          {subjectId === "biology" ? <>
            <Path d="M30 10c35 8 17 34 52 42M82 10c-35 8-17 34-52 42" />
            <Path d="m39 15 33 7M34 25l42 9M35 37l40-9M41 47l31-8" opacity={0.8} />
            <Circle cx="30" cy="10" r="2" fill={color} />
            <Circle cx="82" cy="52" r="2" fill={color} />
          </> : null}
          {subjectId === "computer-science" ? <>
            <Path d="M18 13h22v13h21v11h23v12h14M18 49h17V37h20M61 13v8h16v9h21" />
            <Circle cx="18" cy="13" r="2.5" fill={color} />
            <Circle cx="98" cy="49" r="2.5" fill={color} />
            <Circle cx="18" cy="49" r="2.5" fill={color} />
            <Circle cx="98" cy="30" r="2.5" fill={color} />
          </> : null}
          {subjectId === "economics" ? <>
            <Path d="M16 48h80M20 44V14M25 39l19-10 17 5 27-21" />
            <Path d="M78 13h10v10" />
            <Circle cx="44" cy="29" r="2" fill={color} />
            <Circle cx="61" cy="34" r="2" fill={color} />
          </> : null}
        </G>
      </Svg>
    </View>
  );
}

export function SubjectSwitcher({ compact = false, header = false }: { compact?: boolean; header?: boolean }) {
  const { activeSubjectId, selections } = useCourse();
  const { transitionToSubject } = useSubjectTransition();
  const activeSubject = findSubject(activeSubjectId);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const trigger = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor>({ x: 16, y: 140, width: 320, height: 64 });

  if (!activeSubject) return null;

  const menuWidth = Math.min(380, windowWidth - 32);
  const menuHeight = Math.min(66 + selections.length * 61, windowHeight - 32);
  const menuLeft = Math.max(16, Math.min(anchor.x, windowWidth - menuWidth - 16));
  const menuTop = anchor.y + anchor.height + 8 + menuHeight <= windowHeight - 16
    ? anchor.y + anchor.height + 8
    : Math.max(16, anchor.y - menuHeight - 8);

  function openMenu() {
    trigger.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }

  function selectSubject(subjectId: SubjectId) {
    setOpen(false);
    if (subjectId !== activeSubjectId) requestAnimationFrame(() => transitionToSubject(subjectId));
  }

  return (
    <View style={[styles.shell, compact && styles.compactShell, header && styles.headerShell]}>
      {!header ? <Text style={styles.heading}>CURRENT SUBJECT</Text> : null}
      <Pressable
        ref={trigger}
        accessibilityRole="button"
        accessibilityLabel={`Current subject ${activeSubject.title}. Change subject`}
        accessibilityState={{ expanded: open }}
        onPress={openMenu}
        style={({ pressed }) => [
          styles.trigger,
          header && styles.headerTrigger,
          {
            backgroundColor: colorWithAlpha(activeSubject.color, 0.025),
            borderColor: colorWithAlpha(activeSubject.color, 0.16),
          },
          pressed && styles.pressed,
        ]}
      >
        {!header ? <SubjectArtwork subjectId={activeSubject.id} color={activeSubject.color} /> : null}
        <View style={[styles.triggerIcon, header && styles.headerTriggerIcon, { backgroundColor: activeSubject.softColor }]}>
          <Ionicons name={activeSubject.icon} size={header ? 19 : 21} color={activeSubject.color} />
        </View>
        <View style={[styles.triggerCopy, header && styles.headerTriggerCopy]}>
          <Text numberOfLines={1} style={styles.triggerTitle}>{activeSubject.title}</Text>
          {!header ? <Text style={styles.triggerHint}>Your A Level course</Text> : null}
        </View>
        <View style={[styles.chevronBacking, header && styles.headerChevron, { backgroundColor: colorWithAlpha(activeSubject.color, 0.07) }]}>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={header ? 14 : 17} color={activeSubject.color} />
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType="none" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <View style={styles.modal} accessibilityViewIsModal>
          <Pressable accessibilityLabel="Close subject menu" accessibilityRole="button" style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={[styles.menu, { top: menuTop, left: menuLeft, width: menuWidth, maxHeight: menuHeight }]}>
            <Text style={styles.menuHeading}>Switch subject</Text>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {selections.map((selection, index) => {
                const subject = findSubject(selection.subjectId);
                if (!subject) return null;
                const selected = subject.id === activeSubjectId;
                return (
                  <Pressable
                    key={subject.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => selectSubject(subject.id)}
                    style={({ pressed }) => [styles.option, index > 0 && styles.optionDivider, pressed && styles.pressed]}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: subject.softColor }]}>
                      <Ionicons name={subject.icon} size={20} color={subject.color} />
                    </View>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{subject.title}</Text>
                    {selected ? <Ionicons name="checkmark" size={19} color={Colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { gap: 9 },
  compactShell: { gap: 7 },
  headerShell: { flex: 1, minWidth: 0, gap: 0 },
  heading: { color: Colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1.2 },
  trigger: { height: 64, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 13, borderRadius: 15, borderWidth: 1, overflow: "hidden" },
  headerTrigger: { height: 48, gap: 8, paddingHorizontal: 7, paddingRight: 9, borderRadius: 16, backgroundColor: Colors.surface },
  triggerIcon: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center", zIndex: 1 },
  headerTriggerIcon: { width: 34, height: 34, borderRadius: 11 },
  triggerCopy: { flex: 1, gap: 2, zIndex: 1 },
  headerTriggerCopy: { flex: 1, minWidth: 0 },
  triggerTitle: { color: Colors.ink, fontSize: 16, fontWeight: "700" },
  triggerHint: { color: "#556174", fontSize: 12 },
  chevronBacking: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", zIndex: 1 },
  headerChevron: { width: 24, height: 24, borderRadius: 12 },
  artwork: { position: "absolute", right: 27, top: 0, bottom: 0, width: 112, alignItems: "center", justifyContent: "center", opacity: 0.15 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  modal: { flex: 1, backgroundColor: "rgba(17, 31, 55, 0.28)" },
  menu: { position: "absolute", overflow: "hidden", borderRadius: 17, backgroundColor: Colors.surface, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 26, elevation: 12 },
  menuHeading: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 13, color: Colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  option: { minHeight: 61, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14 },
  optionDivider: { borderTopWidth: 1, borderTopColor: Colors.line },
  optionIcon: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  optionText: { flex: 1, color: Colors.ink, fontSize: 14, fontWeight: "600" },
  optionTextSelected: { color: Colors.primary, fontWeight: "700" },
});
