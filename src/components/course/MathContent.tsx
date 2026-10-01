import { MathJaxSvg } from "react-native-mathjax-html-to-svg";
import { useState } from "react";
import { StyleSheet, View, type TextStyle } from "react-native";

import { Colors } from "@/constants/theme";

interface MathContentProps {
  content: string;
  size?: number;
  color?: string;
  textStyle?: TextStyle;
}

/** Renders plain text mixed with inline TeX using the app's existing MathJax renderer. */
export function MathContent({ content, size = 15, color = Colors.ink, textStyle }: MathContentProps) {
  const [contentWidth, setContentWidth] = useState(0);
  return (
    <View style={styles.container} onLayout={({ nativeEvent }) => setContentWidth(nativeEvent.layout.width)}>
      <MathJaxSvg fontSize={size} color={color} textStyle={textStyle} fontCache maxWidth={contentWidth || 680}>
        {content}
      </MathJaxSvg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", flexShrink: 1 },
});
