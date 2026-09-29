import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

export function SubjectSwitcher() {
  const { activeSubjectId, selections, setActiveSubject } = useCourse();

  return (
    <View style={styles.shell}>
      <Text style={styles.heading}>Subject</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {selections.map((selection) => {
          const subject = findSubject(selection.subjectId);
          if (!subject) return null;
          const active = subject.id === activeSubjectId;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={subject.id}
              onPress={() => void setActiveSubject(subject.id)}
              style={[styles.pill, active && styles.activePill]}
            >
              <Ionicons name={subject.icon} color={active ? Colors.primary : Colors.muted} size={17} />
              <Text style={[styles.label, active && styles.activeLabel]}>{subject.shortTitle}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { gap: 12 },
  heading: { color: Colors.ink, fontSize: 15, fontWeight: "700" },
  row: { gap: 8, paddingRight: 22 },
  pill: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  activePill: { backgroundColor: Colors.primarySoft, borderColor: "#AFC4EA" },
  label: { color: Colors.muted, fontSize: 13, fontWeight: "600" },
  activeLabel: { color: Colors.primary, fontWeight: "700" },
});
