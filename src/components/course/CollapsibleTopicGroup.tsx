import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import type { CourseTopic, CourseTopicGroup } from "@/content/course-catalog";
import { DEFAULT_TOPIC_GROUP_ICON, TOPIC_GROUP_ICONS } from "@/components/course/topic-group-icons";

interface CollapsibleTopicGroupProps {
  group: CourseTopicGroup;
  topics: readonly CourseTopic[];
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function CollapsibleTopicGroup({ group, topics, expanded, onToggle, children }: CollapsibleTopicGroupProps) {
  const topicCount = topics.length;

  return (
    <View style={[styles.section, expanded && styles.expandedSection]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${group.title}, ${topicCount} ${topicCount === 1 ? "topic" : "topics"}, ${expanded ? "expanded" : "collapsed"}`}
        onPress={onToggle}
        style={({ pressed }) => [styles.heading, pressed && styles.pressed]}
      >
        <View accessible={false} style={styles.iconTile}>
          <Ionicons name={TOPIC_GROUP_ICONS[group.id] ?? DEFAULT_TOPIC_GROUP_ICON} color={Colors.primary} size={17} />
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>{group.title}</Text>
        </View>
        <View style={styles.disclosure}>
          <Text style={styles.count}>{topicCount} {topicCount === 1 ? "topic" : "topics"}</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} color={Colors.muted} size={17} />
        </View>
      </Pressable>
      {expanded ? children : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderBottomColor: "#E9EDF3", borderBottomWidth: StyleSheet.hairlineWidth },
  expandedSection: { gap: 8, paddingBottom: 8 },
  heading: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 8, borderRadius: 12 },
  iconTile: { width: 32, height: 32, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: Colors.primarySoft },
  headingCopy: { minWidth: 0, flex: 1, justifyContent: "center" },
  title: { minWidth: 0, flexShrink: 1, color: Colors.ink, fontSize: 18, lineHeight: 23, fontWeight: "700", letterSpacing: -0.25 },
  disclosure: { flexShrink: 0, flexDirection: "row", alignItems: "center", gap: 7 },
  count: { flexShrink: 0, color: Colors.muted, fontSize: 11 },
  pressed: { backgroundColor: "#F0F3F8" },
});
