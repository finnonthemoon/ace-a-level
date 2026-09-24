import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Colors } from "@/constants/theme";
import { useCourse, type SubjectSelection } from "@/contexts/CourseContext";
import { SUBJECTS, type SubjectId } from "@/product/subjects";

export default function OnboardingScreen() {
  const router = useRouter();
  const { examYear: savedExamYear, saveSelections, selections } = useCourse();
  const [selectedIds, setSelectedIds] = useState<SubjectId[]>(
    selections.map((selection) => selection.subjectId),
  );
  const years = useMemo(() => {
    const firstYear = new Date().getFullYear() + 1;
    return [firstYear, firstYear + 1, firstYear + 2];
  }, []);
  const [examYear, setExamYear] = useState<number | null>(savedExamYear);
  const [saving, setSaving] = useState(false);

  function toggleSubject(subjectId: SubjectId) {
    setSelectedIds((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId],
    );
  }

  async function continueToApp() {
    if (selectedIds.length === 0 || saving) return;
    setSaving(true);
    const previous = new Map(selections.map((selection) => [selection.subjectId, selection]));
    const nextSelections: SubjectSelection[] = selectedIds.map(
      (subjectId) =>
        previous.get(subjectId) ?? {
          subjectId,
          specificationId: null,
          targetGrade: null,
        },
    );
    await saveSelections(nextSelections, examYear);
    router.replace("/");
  }

  return (
    <Screen eyebrow="BUILD YOUR PLAN" title="What are you studying?">
      <Text style={styles.intro}>
        Pick every A-level subject you take. You can change these later, and exam-board selection will be added in the next content phase.
      </Text>

      <View style={styles.grid}>
        {SUBJECTS.map((subject) => {
          const selected = selectedIds.includes(subject.id);
          return (
            <TouchableOpacity
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              key={subject.id}
              onPress={() => toggleSubject(subject.id)}
              style={[
                styles.subject,
                selected && { borderColor: subject.color, backgroundColor: subject.softColor },
              ]}
            >
              <View style={[styles.subjectIcon, { backgroundColor: selected ? subject.color : subject.softColor }]}>
                <Ionicons name={subject.icon} color={selected ? "#FFFFFF" : subject.color} size={24} />
              </View>
              <Text style={styles.subjectTitle}>{subject.title}</Text>
              <Ionicons
                name={selected ? "checkmark-circle" : "ellipse-outline"}
                color={selected ? subject.color : Colors.line}
                size={24}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.yearCard}>
        <Text style={styles.yearTitle}>When will you sit your exams?</Text>
        <Text style={styles.yearBody}>This will eventually tailor the pace of your study plan.</Text>
        <View style={styles.years}>
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              onPress={() => setExamYear(year)}
              style={[styles.year, examYear === year && styles.yearActive]}
            >
              <Text style={[styles.yearText, examYear === year && styles.yearTextActive]}>{year}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setExamYear(null)}
            style={[styles.year, examYear === null && styles.yearActive]}
          >
            <Text style={[styles.yearText, examYear === null && styles.yearTextActive]}>Not sure</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        disabled={selectedIds.length === 0 || saving}
        onPress={() => void continueToApp()}
        style={[styles.continueButton, selectedIds.length === 0 && styles.continueDisabled]}
      >
        <Text style={styles.continueText}>{saving ? "Saving…" : "Create my A-level plan"}</Text>
        <Ionicons name="arrow-forward" color="#FFFFFF" size={19} />
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: Colors.muted, fontSize: 14, lineHeight: 21 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  subject: { flexBasis: "47%", flexGrow: 1, minHeight: 132, padding: 15, borderRadius: 22, borderWidth: 1.5, borderColor: Colors.line, backgroundColor: Colors.surface, gap: 11 },
  subjectIcon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  subjectTitle: { flex: 1, color: Colors.ink, fontSize: 15, lineHeight: 19, fontWeight: "900" },
  yearCard: { padding: 18, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  yearTitle: { color: Colors.ink, fontSize: 17, fontWeight: "900" },
  yearBody: { color: Colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  years: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  year: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.line },
  yearActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  yearText: { color: Colors.ink, fontSize: 12, fontWeight: "800" },
  yearTextActive: { color: "#FFFFFF" },
  continueButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, backgroundColor: Colors.primary, padding: 17, borderRadius: 18 },
  continueDisabled: { opacity: 0.4 },
  continueText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
});
