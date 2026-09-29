import { Animated, Image, View, type ImageStyle, type StyleProp } from "react-native";

import type { SubjectId } from "@/product/subjects";

const images = {
  mathematics: require("../../assets/images/mascot/subjects/mathematics.png"),
  physics: require("../../assets/images/mascot/subjects/physics.png"),
  biology: require("../../assets/images/mascot/subjects/biology.png"),
  chemistry: require("../../assets/images/mascot/subjects/chemistry.png"),
  "computer-science": require("../../assets/images/mascot/subjects/computer-science.png"),
  economics: require("../../assets/images/mascot/subjects/economics.png"),
} as const;

const actionImages = {
  mathematics: require("../../assets/images/mascot/subjects/frames/mathematics-writing.png"),
  physics: require("../../assets/images/mascot/subjects/frames/physics-pendulum.png"),
  biology: require("../../assets/images/mascot/subjects/frames/biology-focus.png"),
  "computer-science": require("../../assets/images/mascot/subjects/frames/computer-science-typing.png"),
  economics: require("../../assets/images/mascot/subjects/frames/economics-coin.png"),
} as const;

const chemistryFrames = [
  { source: require("../../assets/images/mascot/subjects/frames/chemistry-curious.png"), inputRange: [0, 0.55, 0.8, 1.35, 1.65, 4], outputRange: [0, 0, 1, 1, 0, 0] },
  { source: require("../../assets/images/mascot/subjects/frames/chemistry-swirl.png"), inputRange: [0, 1.35, 1.65, 2.3, 2.6, 4], outputRange: [0, 0, 1, 1, 0, 0] },
  { source: require("../../assets/images/mascot/subjects/frames/chemistry-reaction.png"), inputRange: [0, 2.3, 2.6, 3.05, 3.35, 4], outputRange: [0, 0, 1, 1, 0, 0] },
  { source: require("../../assets/images/mascot/subjects/frames/chemistry-celebrate.png"), inputRange: [0, 3.05, 3.35, 4], outputRange: [0, 0, 1, 1] },
] as const;

export function SubjectMascot({ subjectId, size = 96, style }: { subjectId: SubjectId; size?: number; style?: StyleProp<ImageStyle> }) {
  return (
    <Image
      accessibilityLabel={`${subjectId.replace("-", " ")} star mascot`}
      source={images[subjectId]}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}

export function TransitionSubjectMascot({ subjectId, size, progress }: { subjectId: SubjectId; size: number; progress: Animated.Value }) {
  const name = `${subjectId.replace("-", " ")} star mascot animation`;
  const baseOpacity = subjectId === "chemistry"
    ? progress.interpolate({ inputRange: [0, 0.55, 0.8, 4], outputRange: [1, 1, 0, 0], extrapolate: "clamp" })
    : progress.interpolate({ inputRange: [0, 0.25, 0.35, 0.7, 0.8, 1], outputRange: [1, 1, 0, 0, 1, 1], extrapolate: "clamp" });
  const imageBounds = { position: "absolute" as const, left: 0, top: 0, width: size, height: size };

  return (
    <View style={{ width: size, height: size, overflow: "hidden" }} accessibilityLabel={name}>
      <Animated.Image source={images[subjectId]} resizeMode="contain" accessible={false} style={[imageBounds, { opacity: baseOpacity }]} />
      {subjectId === "chemistry"
        ? chemistryFrames.map((frame, index) => (
            <Animated.Image
              key={index}
              source={frame.source}
              resizeMode="contain"
              accessible={false}
              style={[imageBounds, { opacity: progress.interpolate({ inputRange: [...frame.inputRange], outputRange: [...frame.outputRange], extrapolate: "clamp" }) }]}
            />
          ))
        : <Animated.Image
            source={actionImages[subjectId]}
            resizeMode="contain"
            accessible={false}
            style={[imageBounds, { opacity: progress.interpolate({ inputRange: [0, 0.25, 0.35, 0.7, 0.8, 1], outputRange: [0, 0, 1, 1, 0, 0] }) }]}
          />}
    </View>
  );
}
