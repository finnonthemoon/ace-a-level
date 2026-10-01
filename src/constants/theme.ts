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
  dangerSoft: "#FFF0EF",
  coolBackground: "#F5F8FF",
  blueBorder: "#C9D9F5",
  mutedTrack: "#E6EBF3",
  shadow: "#152C59",
} as const;

/** Lesson presentation roles reuse the app palette without restyling other screens. */
export const LessonColors = {
  background: Colors.coolBackground,
  surface: Colors.surface,
  text: Colors.ink,
  bodyText: "#475569",
  secondaryText: Colors.muted,
  primary: Colors.primary,
  primaryPressed: Colors.primaryDark,
  primaryDisabled: "#617DAF",
  disabledLabel: "#F4F7FC",
  soft: Colors.primarySoft,
  border: Colors.blueBorder,
  track: Colors.mutedTrack,
  example: Colors.primaryDark,
  stepSurface: "#FBFCFF",
  stepBorder: "#DCE5F3",
  answerSurface: "#E3EDFF",
  answerBorder: "#AFC7EE",
  ripple: "#74A1F1",
  success: Colors.success,
  successSoft: Colors.successSoft,
  incorrect: Colors.danger,
  incorrectSoft: Colors.dangerSoft,
} as const;

export const LessonSpacing = { small: 8, medium: 12, regular: 16, large: 24, extraLarge: 32, section: 40, bottomClearance: 40 } as const;

export const LessonTypography = {
  title: { fontSize: 32, lineHeight: 38, fontWeight: "800", letterSpacing: -0.8 },
  eyebrow: { fontSize: 12, lineHeight: 18, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
  secondaryEyebrow: { fontSize: 11, lineHeight: 16, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  body: { fontSize: 17, lineHeight: 28, fontWeight: "500" },
  question: { fontSize: 22, lineHeight: 32, fontWeight: "700" },
  option: { fontSize: 18, lineHeight: 26, fontWeight: "600" },
  action: { fontSize: 18, lineHeight: 26, fontWeight: "700" },
} as const;

export const LessonContentWidth = 680;

/** Quiet surface progression; the number marker stays Ace blue throughout. */
export const LessonStepTones = [
  { surface: LessonColors.stepSurface, border: LessonColors.stepBorder, accent: "#4972C5" },
  { surface: "#F0F5FC", border: "#D3DFEF", accent: "#5275A8" },
  { surface: "#F2F6F8", border: "#D8E2EB", accent: "#617EAE" },
  { surface: "#F4F3FC", border: "#DEDEF0", accent: "#6E72B3" },
] as const;

export const LessonShadow = {
  step: { shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  answer: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  action: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 10, elevation: 3 },
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
