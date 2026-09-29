import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Screen } from "@/components/Screen";
import { StarMascot } from "@/components/StarMascot";
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
    setSelectedIds((current) => {
      if (current.includes(subjectId)) return current.filter((id) => id !== subjectId);
      if (current.length >= 5) return current;
      return [...current, subjectId];
    });
  }

  async function continueToApp() {
    if (selectedIds.length < 3 || selectedIds.length > 5 || saving) return;
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
    try {
      await saveSelections(nextSelections, examYear);
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Saved on this device",
        error instanceof Error
          ? `Your plan could not sync yet: ${error.message}`
          : "Your plan could not sync yet. Please try again later.",
      );
      router.replace("/");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      eyebrow="BUILD YOUR PLAN"
      title="Choose your A-levels"
      subtitle="Start with the subjects you study. You can change your plan later."
    >
      <View style={styles.stepCard}>
        <View style={styles.stepCopy}>
          <Text style={styles.stepEyebrow}>YOUR COURSES</Text>
          <Text style={styles.stepTitle}>Select 3–5 subjects</Text>
          <Text style={styles.stepBody}>Pick the A-levels on your timetable.</Text>
        </View>
        <StarMascot size={70} stage="yellow" />
        <View style={[styles.countBadge, selectedIds.length >= 3 && styles.countBadgeReady]}>
          <Text style={[styles.countText, selectedIds.length >= 3 && styles.countTextReady]}>{selectedIds.length}/5</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {SUBJECTS.map((subject) => {
          const selected = selectedIds.includes(subject.id);
          const unavailable = !selected && selectedIds.length >= 5;
          return (
            <TouchableOpacity
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              disabled={unavailable}
              key={subject.id}
              onPress={() => toggleSubject(subject.id)}
              style={[
                styles.subject,
                selected && styles.subjectSelected,
                unavailable && styles.subjectUnavailable,
              ]}
            >
              <View style={[styles.subjectIcon, { backgroundColor: subject.softColor }]}>
                <Ionicons name={subject.icon} color={subject.color} size={24} />
              </View>
              <Text style={styles.subjectTitle}>{subject.title}</Text>
              <Ionicons
                name={selected ? "checkmark-circle" : "ellipse-outline"}
                color={selected ? Colors.primary : Colors.line}
                size={24}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.yearCard}>
        <Text style={styles.yearEyebrow}>EXAM YEAR</Text>
        <Text style={styles.yearTitle}>When will you sit your exams?</Text>
        <Text style={styles.yearBody}>This helps shape your study plan later.</Text>
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
        disabled={selectedIds.length < 3 || selectedIds.length > 5 || saving}
        onPress={() => void continueToApp()}
        style={[styles.continueButton, selectedIds.length < 3 && styles.continueDisabled]}
      >
        <Text style={styles.continueText}>{saving ? "Saving…" : selectedIds.length < 3 ? `Choose ${3 - selectedIds.length} more` : "Create my A-level plan"}</Text>
        <Ionicons name="arrow-forward" color="#FFFFFF" size={19} />
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepCard: { flexDirection: "row", alignItems: "center", gap: 4, padding: 17, borderRadius: 18, backgroundColor: Colors.primarySoft },
  stepCopy: { flex: 1, gap: 2 },
  stepEyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 0.7 },
  stepTitle: { color: Colors.ink, fontSize: 17, fontWeight: "700" },
  stepBody: { color: Colors.muted, fontSize: 12, lineHeight: 17 },
  countBadge: { minWidth: 38, alignItems: "center", paddingHorizontal: 7, paddingVertical: 7, borderRadius: 9, backgroundColor: Colors.surface },
  countBadgeReady: { backgroundColor: Colors.primary },
  countText: { color: Colors.muted, fontSize: 11, fontWeight: "700" },
  countTextReady: { color: "#FFFFFF" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  subject: { flexBasis: "47%", flexGrow: 1, minHeight: 126, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface, gap: 11 },
  subjectSelected: { borderColor: Colors.primary, backgroundColor: "#FBFCFF" },
  subjectUnavailable: { opacity: 0.45 },
  subjectIcon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  subjectTitle: { flex: 1, color: Colors.ink, fontSize: 15, lineHeight: 19, fontWeight: "700" },
  yearCard: { padding: 18, borderRadius: 17, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line },
  yearEyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 0.7, marginBottom: 4 },
  yearTitle: { color: Colors.ink, fontSize: 17, fontWeight: "700" },
  yearBody: { color: Colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  years: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  year: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.line },
  yearActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  yearText: { color: Colors.ink, fontSize: 13, fontWeight: "600" },
  yearTextActive: { color: "#FFFFFF" },
  continueButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, backgroundColor: Colors.primary, padding: 17, borderRadius: 12 },
  continueDisabled: { opacity: 0.4 },
  continueText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
