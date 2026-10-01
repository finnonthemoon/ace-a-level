import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import type { QualificationStage } from "@/product/qualification";

const STAGE_LABELS: Record<QualificationStage, { label: string; accessibilityLabel: string }> = {
  as: { label: "AS", accessibilityLabel: "AS specification content" },
  "a-level": { label: "A LEVEL", accessibilityLabel: "A Level only content" },
};

export function QualificationStageBadge({ stage }: { stage: QualificationStage }) {
  const stageLabel = STAGE_LABELS[stage];
  return (
    <View accessibilityRole="text" accessibilityLabel={stageLabel.accessibilityLabel} style={styles.badge}>
      <Text style={[styles.label, stage === "a-level" && styles.aLevelLabel]}>{stageLabel.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", justifyContent: "center", minHeight: 20, paddingHorizontal: 8, borderRadius: 999, backgroundColor: Colors.primarySoft },
  label: { color: Colors.primary, fontSize: 9, lineHeight: 12, fontWeight: "800", letterSpacing: 0.45 },
  aLevelLabel: { color: Colors.primaryDeep },
});
