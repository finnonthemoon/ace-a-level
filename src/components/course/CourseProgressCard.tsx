import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";

interface CourseProgressCardProps {
  completed: number;
  total: number;
}

export function CourseProgressCard({ completed, total }: CourseProgressCardProps) {
  const progress = total > 0 ? Math.min(completed / total, 1) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>Your progress</Text>
          <Text style={styles.subtitle}>Your completed topics will appear here.</Text>
        </View>
        <Text style={styles.count}>{completed} of {total}</Text>
      </View>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: completed }} style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 13, padding: 17, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.surface },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  copy: { flex: 1, gap: 4 },
  title: { color: Colors.ink, fontSize: 14, fontWeight: "700" },
  subtitle: { color: Colors.muted, fontSize: 11, lineHeight: 16 },
  count: { color: Colors.primary, fontSize: 12, fontWeight: "700" },
  track: { height: 7, overflow: "hidden", borderRadius: 5, backgroundColor: Colors.primarySoft },
  fill: { height: "100%", borderRadius: 5, backgroundColor: Colors.primary },
});
