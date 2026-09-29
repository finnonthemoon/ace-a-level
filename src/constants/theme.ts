import { Platform } from "react-native";

export const Colors = {
  primary: "#2556B7",
  primaryDark: "#174489",
  primaryDeep: "#172B53",
  primarySoft: "#EAF0FB",
  cream: "#F7F8F6",
  surface: "#FFFFFF",
  ink: "#1B2740",
  muted: "#626D7D",
  line: "#E0E5E9",
  success: "#27835B",
  successSoft: "#E9F7EF",
  warning: "#B66A12",
  warningSoft: "#FFF3DD",
  danger: "#B5473E",
  shadow: "#152C59",
} as const;

export const Radius = {
  large: 28,
  medium: 20,
  small: 14,
} as const;

export const Shadow = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 24,
    elevation: 5,
  },
  blue: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 7,
  },
} as const;

export const MaxContentWidth = 820;

export const Fonts = Platform.select({
  ios: { rounded: "ui-rounded", sans: "system-ui" },
  web: { rounded: "system-ui", sans: "system-ui" },
  default: { rounded: "sans-serif", sans: "sans-serif" },
})!;
