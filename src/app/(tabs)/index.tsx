import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeActionCarousel } from "@/components/home/HomeActionCarousel";
import { Fonts } from "@/constants/theme";
import { useAccount } from "@/contexts/AccountContext";
import { useCourse } from "@/contexts/CourseContext";
import { useStudyActivity } from "@/contexts/StudyActivityContext";
import { findSubject } from "@/product/subjects";

function displayName(email: string | undefined, metadata: Record<string, unknown> | undefined) {
  const candidate = metadata?.given_name ?? metadata?.full_name ?? metadata?.name;
  if (typeof candidate === "string" && candidate.trim()) return candidate.trim().split(/\s+/)[0];
  const emailName = email?.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return emailName ? emailName[0].toUpperCase() + emailName.slice(1) : "there";
}

function formatToday(seconds: number) {
  if (seconds < 60) return seconds > 0 ? "<1m" : "0m";
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAccount();
  const { activeSubjectId, isHydrated } = useCourse();
  const { isHydrated: isActivityHydrated, streakDays, todaySeconds } = useStudyActivity();
  const subject = findSubject(activeSubjectId);
  const name = displayName(session?.user.email, session?.user.user_metadata);
  const currentTopic = subject?.topics[0];

  if (!isHydrated || !subject) {
    return <View style={styles.loading}><ActivityIndicator color="#FF5A2F" /></View>;
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open profile and settings" onPress={() => router.push("/(tabs)/profile")} style={({ pressed }) => [styles.identity, pressed && styles.pressed]}>
            <View style={styles.avatar}><Ionicons name="person-outline" size={23} color="#FFFFFF" /></View>
            <Text numberOfLines={1} style={styles.greeting}>Hi, {name}</Text>
          </Pressable>
          <View style={styles.headerStats}>
            <View style={styles.statPill} accessibilityLabel={`${streakDays} day study streak`}>
              <Ionicons name="flame" size={18} color="#B8B8BE" />
              <Text style={styles.statText}>{isActivityHydrated ? streakDays : "–"}</Text>
            </View>
            <View style={styles.statPill} accessibilityLabel={`${formatToday(todaySeconds)} studied today`}>
              <Ionicons name="time-outline" size={18} color="#B8B8BE" />
              <Text style={styles.statText}>{isActivityHydrated ? formatToday(todaySeconds) : "–"}</Text>
            </View>
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/learn")} style={({ pressed }) => [styles.currentCourse, pressed && styles.pressed]}>
          <View style={styles.currentCopy}>
            <Text style={styles.currentMeta}>{subject.title} · Topic 1</Text>
            <Text style={styles.currentTitle}>{currentTopic?.title ?? "Explore your course"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
        </Pressable>

        <HomeActionCarousel subject={subject} />

        <View style={styles.explore}>
          <Text style={styles.exploreTitle}>Explore lessons on{`\n`}specific topics</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/learn")} style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
            <Text style={styles.outlineText}>Show topics</Text>
            <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.premiumStrip}>
        <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" />
        <Text style={styles.premiumText}>Unlock all Ace A Level courses</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#050505" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#050505" },
  content: { width: "100%", maxWidth: 820, alignSelf: "center", gap: 24, paddingHorizontal: 10, paddingTop: 12, paddingBottom: 116 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  identity: { minWidth: 0, flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17 },
  greeting: { flex: 1, color: "#FFFFFF", fontSize: 18, lineHeight: 23, fontFamily: Fonts.sansBold },
  headerStats: { flexDirection: "row", alignItems: "center", gap: 7 },
  statPill: { minWidth: 58, height: 39, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 10, borderRadius: 20, backgroundColor: "#242426" },
  statText: { color: "#FFFFFF", fontSize: 13, fontFamily: Fonts.sansExtraBold },
  currentCourse: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 0 },
  currentCopy: { flex: 1, gap: 6 },
  currentMeta: { color: "#BABAC1", fontSize: 14, lineHeight: 18, fontFamily: Fonts.sans },
  currentTitle: { color: "#FFFFFF", fontSize: 16, lineHeight: 21, fontFamily: Fonts.sansExtraBold },
  explore: { alignItems: "center", gap: 19, paddingVertical: 35 },
  exploreTitle: { color: "#FFFFFF", fontSize: 29, lineHeight: 33, fontFamily: Fonts.display, textAlign: "center", letterSpacing: -0.25 },
  outlineButton: { minHeight: 47, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1.5, borderColor: "#E5E5E8" },
  outlineText: { color: "#FFFFFF", fontSize: 14, fontFamily: Fonts.sansExtraBold },
  premiumStrip: { position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 15, backgroundColor: "#FF4F18" },
  premiumText: { color: "#FFFFFF", fontSize: 13, fontFamily: Fonts.sansExtraBold },
  pressed: { opacity: 0.7 },
});
