import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { useSubjectTransition } from "@/contexts/SubjectTransitionContext";
import { findSubject, type SubjectId } from "@/product/subjects";

interface Anchor { x: number; y: number; width: number; height: number }

export function SubjectSwitcher() {
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
    <View style={styles.shell}>
      <Text style={styles.heading}>CURRENT SUBJECT</Text>
      <Pressable
        ref={trigger}
        accessibilityRole="button"
        accessibilityLabel={`Current subject ${activeSubject.title}. Change subject`}
        accessibilityState={{ expanded: open }}
        onPress={openMenu}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <View style={[styles.triggerIcon, { backgroundColor: activeSubject.softColor }]}>
          <Ionicons name={activeSubject.icon} size={22} color={activeSubject.color} />
        </View>
        <View style={styles.triggerCopy}>
          <Text style={styles.triggerTitle}>{activeSubject.title}</Text>
          <Text style={styles.triggerHint}>Tap to switch subject</Text>
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color={Colors.muted} />
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
  heading: { color: Colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1.2 },
  trigger: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  triggerIcon: { width: 43, height: 43, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  triggerCopy: { flex: 1, gap: 3 },
  triggerTitle: { color: Colors.ink, fontSize: 16, fontWeight: "700" },
  triggerHint: { color: Colors.muted, fontSize: 12 },
  pressed: { opacity: 0.72 },
  modal: { flex: 1, backgroundColor: "rgba(17, 31, 55, 0.28)" },
  menu: { position: "absolute", overflow: "hidden", borderRadius: 17, backgroundColor: Colors.surface, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 26, elevation: 12 },
  menuHeading: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 13, color: Colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  option: { minHeight: 61, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14 },
  optionDivider: { borderTopWidth: 1, borderTopColor: Colors.line },
  optionIcon: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  optionText: { flex: 1, color: Colors.ink, fontSize: 14, fontWeight: "600" },
  optionTextSelected: { color: Colors.primary, fontWeight: "700" },
});
