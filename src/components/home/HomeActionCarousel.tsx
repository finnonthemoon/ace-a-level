import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Fonts } from "@/constants/theme";
import type { SubjectDefinition } from "@/product/subjects";

interface HomeActionCarouselProps {
  subject: SubjectDefinition;
}

export function HomeActionCarousel({ subject }: HomeActionCarouselProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(410, width - 58);
  const cards = [
    {
      id: "diagnostic",
      eyebrow: "PLACEMENT QUIZ",
      title: "Find your starting point",
      action: "Find level",
      color: "#D9AFF7",
      ink: "#23142E",
      onPress: () => router.push(`/practice/diagnostic/${subject.id}` as Href),
    },
    {
      id: "course",
      eyebrow: "YOUR COURSE",
      title: `Explore ${subject.shortTitle}`,
      action: "View topics",
      color: "#FF895D",
      ink: "#35150C",
      onPress: () => router.push("/(tabs)/learn"),
    },
    {
      id: "practice",
      eyebrow: "QUICK PRACTICE",
      title: "Turn knowledge into confidence",
      action: "Start practice",
      color: "#9FD6FF",
      ink: "#102438",
      onPress: () => router.push("/(tabs)/practice"),
    },
  ];

  return (
    <ScrollView
      horizontal
      snapToInterval={cardWidth + 14}
      snapToAlignment="start"
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.track}
    >
      {cards.map((card, index) => (
        <Pressable
          key={card.id}
          accessibilityRole="button"
          accessibilityLabel={`${card.eyebrow}. ${card.title}`}
          onPress={card.onPress}
          style={({ pressed }) => [styles.card, { width: cardWidth, backgroundColor: card.color }, pressed && styles.pressed]}
        >
          <Text style={[styles.eyebrow, { color: card.ink }]}>{card.eyebrow}</Text>
          <Text style={[styles.title, { color: card.ink }]}>{card.title}</Text>
          <View pointerEvents="none" style={styles.artwork}>
            <View style={[styles.block, styles.blockOne, { backgroundColor: card.ink }]} />
            <View style={[styles.block, styles.blockTwo, { backgroundColor: subject.color }]} />
            <View style={[styles.block, styles.blockThree, { backgroundColor: index === 0 ? "#E33A2F" : "rgba(255,255,255,0.72)" }]} />
          </View>
          <View style={[styles.action, { backgroundColor: card.ink }]}>
            <Text style={styles.actionText}>{card.action}</Text>
            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  track: { gap: 14, paddingRight: 18 },
  card: { height: 322, overflow: "hidden", padding: 24, borderRadius: 18 },
  pressed: { opacity: 0.83, transform: [{ scale: 0.992 }] },
  eyebrow: { fontSize: 12, lineHeight: 16, fontFamily: Fonts.sansBold, letterSpacing: 0.35, opacity: 0.75 },
  title: { maxWidth: 285, marginTop: 8, fontSize: 37, lineHeight: 40, fontFamily: Fonts.display, letterSpacing: -0.7 },
  artwork: { position: "absolute", left: 0, right: 0, bottom: 0, height: 145 },
  block: { position: "absolute", bottom: -10, borderRadius: 4, transform: [{ rotate: "2deg" }] },
  blockOne: { left: 20, width: 64, height: 78, opacity: 0.72 },
  blockTwo: { left: 75, width: 70, height: 114 },
  blockThree: { left: 134, width: 72, height: 92 },
  action: { position: "absolute", right: 20, bottom: 20, minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, borderRadius: 25 },
  actionText: { color: "#FFFFFF", fontSize: 13, lineHeight: 17, fontFamily: Fonts.sansExtraBold },
});
