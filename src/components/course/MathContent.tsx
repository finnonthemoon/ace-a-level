import { MathJaxSvg } from "react-native-mathjax-html-to-svg";
import { StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";

interface MathContentProps {
  content: string;
  size?: number;
  color?: string;
}

/** Renders plain text mixed with inline TeX using the app's existing MathJax renderer. */
export function MathContent({ content, size = 15, color = Colors.ink }: MathContentProps) {
  return (
    <View style={styles.container}>
      <MathJaxSvg fontSize={size} color={color} fontCache maxWidth={680}>
        {content}
      </MathJaxSvg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", flexShrink: 1 },
});
