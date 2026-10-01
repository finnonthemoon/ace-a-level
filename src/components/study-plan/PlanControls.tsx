import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { formatReminderTime, GRADES, type Grade } from "@/core/study-plan";

export function PlanChoice({ label, description, selected, onPress, icon, multiple = false, disabled = false }: { label: string; description?: string; selected: boolean; onPress: () => void; icon?: ReactNode; multiple?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole={multiple ? "checkbox" : "radio"} accessibilityState={{ checked: selected, disabled }} accessibilityLabel={description ? `${label}. ${description}` : label} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && styles.pressed, disabled && styles.disabled]}>
    {icon}<View style={styles.copy}><Text style={styles.label}>{label}</Text>{description ? <Text style={styles.description}>{description}</Text> : null}</View>
    <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={24} color={selected ? Colors.primary : Colors.muted} />
  </Pressable>;
}

function ControlSheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <Modal visible animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={styles.sheet}>
      <View style={styles.sheetHeader}><Text accessibilityRole="header" style={styles.sheetTitle}>{title}</Text><Pressable accessibilityLabel="Close selector" accessibilityRole="button" onPress={onClose} style={styles.close}><Ionicons name="close" size={24} color={Colors.ink} /></Pressable></View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetContent}>{children}</ScrollView>
    </SafeAreaView>
  </Modal>;
}
export function GradeControl({ subject, kind, value, onChange }: { subject: string; kind: "Predicted" | "Target"; value: Grade | null; onChange: (grade: Grade | null) => void }) {
  const [open, setOpen] = useState(false);
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`${subject}, ${kind} grade, ${value ?? "not set"}. Change grade`} onPress={() => setOpen(true)} style={styles.grade}>
      <Text style={styles.description}>{kind}</Text><View style={styles.gradeValue}><Text style={styles.label}>{value ?? "Not set"}</Text><Ionicons name="chevron-down" color={Colors.primary} size={18} /></View>
    </Pressable>
    {open ? <ControlSheet title={`${subject} · ${kind.toLowerCase()}`} onClose={() => setOpen(false)}>
      {[null, ...GRADES].map((grade) => <PlanChoice key={grade ?? "unset"} label={grade ?? (kind === "Predicted" ? "Not sure" : "Not set")} selected={grade === value} onPress={() => { onChange(grade); setOpen(false); }} />)}
    </ControlSheet> : null}
  </>;
}
export function TimeControl({ label, value, onChange, allowOff = false }: { label: string; value: number | null; onChange: (minutes: number | null) => void; allowOff?: boolean }) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState("18");
  const [minute, setMinute] = useState("00");
  const valid = /^\d{1,2}$/.test(hour) && /^\d{1,2}$/.test(minute) && Number(hour) <= 23 && Number(minute) <= 59;
  function show() { const time = value ?? 1080; setHour(String(Math.floor(time / 60)).padStart(2, "0")); setMinute(String(time % 60).padStart(2, "0")); setOpen(true); }
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}, ${value === null ? "no reminder" : formatReminderTime(value)}. Change time`} onPress={show} style={styles.timeRow}>
      <Text style={styles.label}>{label}</Text><View style={styles.gradeValue}><Text style={styles.timeValue}>{value === null ? "No reminder" : formatReminderTime(value)}</Text><Ionicons name="chevron-down" color={Colors.primary} size={18} /></View>
    </Pressable>
    {open ? <ControlSheet title={label} onClose={() => setOpen(false)}>
      <Text style={styles.description}>Choose a local time in 24-hour format.</Text>
      <View style={styles.clockInputs}>
        <View style={styles.clockField}><Text style={styles.description}>Hour</Text><TextInput accessibilityLabel={`${label} hour, 0 to 23`} keyboardType="number-pad" maxLength={2} value={hour} onChangeText={setHour} style={styles.clockInput} selectTextOnFocus /></View>
        <Text style={styles.colon}>:</Text>
        <View style={styles.clockField}><Text style={styles.description}>Minute</Text><TextInput accessibilityLabel={`${label} minute, 0 to 59`} keyboardType="number-pad" maxLength={2} value={minute} onChangeText={setMinute} style={styles.clockInput} selectTextOnFocus /></View>
      </View>
      {!valid ? <Text accessibilityRole="alert" style={styles.error}>Use an hour from 0–23 and a minute from 0–59.</Text> : null}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: !valid }} disabled={!valid} onPress={() => { onChange(Number(hour) * 60 + Number(minute)); setOpen(false); }} style={[styles.apply, !valid && styles.disabled]}><Text style={styles.applyLabel}>Use this time</Text></Pressable>
      {allowOff ? <Pressable accessibilityRole="button" onPress={() => { onChange(null); setOpen(false); }} style={styles.off}><Text style={styles.offLabel}>No reminder on this day</Text></Pressable> : null}
    </ControlSheet> : null}
  </>;
}
const styles = StyleSheet.create({
  choice: { minHeight: 64, flexDirection: "row", alignItems: "center", padding: 16, gap: 12, borderWidth: 1, borderColor: Colors.line, borderRadius: 16, backgroundColor: Colors.surface },
  selected: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  copy: { flex: 1, gap: 4 }, label: { fontSize: 16, fontWeight: "600", color: Colors.ink }, description: { fontSize: 14, lineHeight: 21, color: Colors.muted },
  pressed: { opacity: 0.8 }, disabled: { opacity: 0.45 },
  sheet: { flex: 1, backgroundColor: Colors.cream }, sheetHeader: { flexDirection: "row", alignItems: "center", padding: 20, gap: 8 }, sheetTitle: { flex: 1, fontSize: 22, fontWeight: "700", color: Colors.ink }, close: { minHeight: 48, minWidth: 48, alignItems: "center", justifyContent: "center" }, sheetContent: { padding: 22, gap: 12, width: "100%", maxWidth: 620, alignSelf: "center" },
  grade: { flex: 1, minHeight: 76, borderRadius: 12, borderWidth: 1, borderColor: Colors.line, padding: 13, gap: 8, backgroundColor: Colors.surface }, gradeValue: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "space-between" },
  timeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", minHeight: 64, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.line, paddingVertical: 12 }, timeValue: { color: Colors.primary, fontSize: 18, fontWeight: "600" },
  clockInputs: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginVertical: 16 }, clockField: { gap: 8 }, clockInput: { borderWidth: 1, borderColor: Colors.line, borderRadius: 16, padding: 16, width: 100, fontSize: 32, textAlign: "center", color: Colors.ink, backgroundColor: Colors.surface }, colon: { fontSize: 28, color: Colors.ink },
  apply: { minHeight: 54, borderRadius: 16, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" }, applyLabel: { color: "white", fontSize: 16, fontWeight: "700" }, off: { minHeight: 48, alignItems: "center", justifyContent: "center" }, offLabel: { color: Colors.primary, fontSize: 15, fontWeight: "600" }, error: { color: Colors.danger, fontSize: 14, lineHeight: 20 },
});
