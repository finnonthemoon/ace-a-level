import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors, Shadow } from "@/constants/theme";
import { useCourse } from "@/contexts/CourseContext";
import { findSubject } from "@/product/subjects";

export function SubjectSwitcher() {
  const { activeSubjectId, selections, setActiveSubject } = useCourse();

  return (
    <View style={styles.shell}>
      <View style={styles.headingRow}>
        <Text style={styles.eyebrow}>ACTIVE SUBJECT</Text>
        <Text style={styles.count}>{selections.length} subjects</Text>
      </View>
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
              <View style={[styles.icon, { backgroundColor: active ? "rgba(255,255,255,0.18)" : subject.softColor }]}>
                <Ionicons name={subject.icon} color={active ? "#FFFFFF" : subject.color} size={16} />
              </View>
              <Text style={[styles.label, active && styles.activeLabel]}>{subject.shortTitle}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { gap: 10, padding: 14, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line, ...Shadow.card },
  headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: Colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.3 },
  count: { color: Colors.primary, fontSize: 10, fontWeight: "800" },
  row: { gap: 8, paddingRight: 10 },
  pill: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 9, borderRadius: 15, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.cream },
  activePill: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  icon: { width: 27, height: 27, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  label: { color: Colors.ink, fontSize: 11, fontWeight: "800" },
  activeLabel: { color: "#FFFFFF" },
});
