import { Image, type ImageStyle, type StyleProp } from "react-native";

import { type StarStage, useMascot } from "@/contexts/MascotContext";

const images = {
  red: require("../../assets/images/mascot/star-red.png"),
  orange: require("../../assets/images/mascot/star-orange.png"),
  yellow: require("../../assets/images/mascot/star-yellow.png"),
  white: require("../../assets/images/mascot/star-white.png"),
  blue: require("../../assets/images/mascot/star-blue.png"),
} as const;

export function StarMascot({ stage, size = 96, style, decorative = false }: { stage?: StarStage; size?: number; style?: StyleProp<ImageStyle>; decorative?: boolean }) {
  const mascot = useMascot();
  const shownStage = stage ?? mascot.stage;
  return (
    <Image
      accessible={!decorative}
      accessibilityLabel={decorative ? undefined : `${shownStage} star mascot`}
      source={images[shownStage]}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}
