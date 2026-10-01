import type { ComponentProps } from "react";

import { Ionicons } from "@expo/vector-icons";

type TopicGroupIconName = ComponentProps<typeof Ionicons>["name"];

export const TOPIC_GROUP_ICONS: Record<string, TopicGroupIconName> = {
  proof: "checkmark-done-outline",
  "algebra-and-functions": "calculator-outline",
  graphs: "bar-chart-outline",
  "coordinate-geometry": "grid-outline",
  "sequences-and-series": "list-outline",
  trigonometry: "triangle-outline",
  "exponentials-and-logarithms": "trending-up-outline",
  calculus: "pulse-outline",
  "numerical-methods": "calculator-outline",
  vectors: "arrow-up-outline",
  "sampling-and-data": "file-tray-full-outline",
  probability: "shuffle-outline",
  "probability-distributions": "stats-chart-outline",
  "hypothesis-testing": "flask-outline",
  "large-data-set": "server-outline",
  "modelling-and-motion": "speedometer-outline",
  "forces-and-newton-s-laws": "move-outline",
  "rigid-bodies": "scale-outline",
};

export const DEFAULT_TOPIC_GROUP_ICON: TopicGroupIconName = "book-outline";
