import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, StyleSheet, Text, type GestureResponderEvent } from "react-native";
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import { LessonColors as Colors, LessonShadow, LessonSpacing as Space, LessonTypography as Type } from "@/constants/theme";

interface LessonActionButtonProps {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  enhanced: boolean;
  backArrow: boolean;
  onPress: () => void;
}

export function LessonActionButton({ label, accessibilityLabel, disabled, enhanced, backArrow, onPress }: LessonActionButtonProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const arrowOffset = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const rippleX = useSharedValue(0);
  const rippleY = useSharedValue(0);
  const buttonWidth = useSharedValue(0);
  const buttonHeight = useSharedValue(0);
  const buttonAnimation = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const arrowAnimation = useAnimatedStyle(() => ({ transform: [{ translateX: arrowOffset.get() }] }));
  const rippleAnimation = useAnimatedStyle(() => ({
    opacity: rippleOpacity.get(),
    transform: [{ translateX: rippleX.get() }, { translateY: rippleY.get() }, { scale: rippleScale.get() }],
  }));

  function pressIn(event: GestureResponderEvent) {
    if (disabled || !enhanced) return;
    scale.set(withTiming(0.985, { duration: 90, reduceMotion: ReduceMotion.System }));
    arrowOffset.set(withTiming(4, { duration: 120, reduceMotion: ReduceMotion.System }));
    if (reducedMotion) return;
    rippleX.set(Math.max(0, Math.min(event.nativeEvent.locationX ?? buttonWidth.get() / 2, buttonWidth.get())));
    rippleY.set(Math.max(0, Math.min(event.nativeEvent.locationY ?? buttonHeight.get() / 2, buttonHeight.get())));
    rippleScale.set(0.1);
    rippleOpacity.set(0.2);
    rippleScale.set(withTiming(Math.max(buttonWidth.get(), buttonHeight.get()) / 40, { duration: 360, easing: Easing.out(Easing.cubic) }));
    rippleOpacity.set(withTiming(0, { duration: 360, easing: Easing.out(Easing.quad) }));
  }

  function pressOut() {
    scale.set(withTiming(1, { duration: 150, reduceMotion: ReduceMotion.System }));
    arrowOffset.set(enhanced && !disabled
      ? withSequence(withTiming(6, { duration: 80, reduceMotion: ReduceMotion.System }), withTiming(0, { duration: 180, reduceMotion: ReduceMotion.System }))
      : 0);
  }

  function activate() {
    if (disabled) return;
    if (enhanced && Platform.OS !== "web") {
      const feedback = Platform.OS === "android"
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Tick)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      void feedback.catch(() => undefined);
    }
    onPress();
  }

  return (
    <Animated.View style={[styles.frame, enhanced && !disabled && styles.enhancedFrame, buttonAnimation]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={activate}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onLayout={({ nativeEvent }) => {
          buttonWidth.set(nativeEvent.layout.width);
          buttonHeight.set(nativeEvent.layout.height);
        }}
        style={({ pressed }) => [styles.button, enhanced && styles.enhancedButton, disabled && styles.disabledButton, pressed && !disabled && styles.pressed, pressed && !disabled && !enhanced && styles.standardPressed]}
      >
        {enhanced ? <Animated.View pointerEvents="none" style={[styles.ripple, rippleAnimation]} /> : null}
        <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
        <Animated.View pointerEvents="none" style={arrowAnimation}>
          <Ionicons name={backArrow ? "arrow-back" : "arrow-forward"} color={disabled ? Colors.disabledLabel : Colors.surface} size={20} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 22 },
  enhancedFrame: { ...LessonShadow.action },
  button: { minHeight: 60, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Space.medium, paddingHorizontal: Space.large, paddingVertical: Space.regular, borderRadius: 20, backgroundColor: Colors.primary, overflow: "hidden" },
  enhancedButton: { minHeight: 62, gap: Space.regular, paddingHorizontal: Space.extraLarge, borderRadius: 22 },
  label: { ...Type.action, color: Colors.surface, flexShrink: 1, textAlign: "center" },
  disabledButton: { backgroundColor: Colors.primaryDisabled },
  disabledLabel: { color: Colors.disabledLabel },
  pressed: { backgroundColor: Colors.primaryPressed },
  standardPressed: { transform: [{ scale: 0.99 }] },
  ripple: { position: "absolute", left: -50, top: -50, width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.ripple },
});
