import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

export function SubjectSwitcher() {
  const { activeSubjectId, selections, setActiveSubject } = useCourse();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {selections.map((selection) => {
        const subject = findSubject(selection.subjectId);
        if (!subject) return null;
        const active = subject.id === activeSubjectId;
        return (
          <TouchableOpacity
            accessibilityRole="button"
            key={subject.id}
            onPress={() => void setActiveSubject(subject.id)}
            style={[styles.pill, active && { backgroundColor: subject.color, borderColor: subject.color }]}
          >
            <View style={[styles.icon, { backgroundColor: active ? "rgba(255,255,255,0.2)" : subject.softColor }]}>
              <Ionicons name={subject.icon} color={active ? "#FFFFFF" : subject.color} size={16} />
            </View>
            <Text style={[styles.label, active && styles.activeLabel]}>{subject.shortTitle}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingRight: 10 },
  pill: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  icon: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  label: { color: Colors.ink, fontSize: 12, fontWeight: "800" },
  activeLabel: { color: "#FFFFFF" },
});
