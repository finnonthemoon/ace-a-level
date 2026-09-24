import { Platform } from "react-native";

export const Colors = {
  primary: "#2563EB",
  primaryDark: "#1746A2",
  primaryDeep: "#142B5F",
  primarySoft: "#E8F0FF",
  cream: "#F6F8FC",
  surface: "#FFFFFF",
  ink: "#17233C",
  muted: "#667085",
  line: "#DEE5F0",
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
