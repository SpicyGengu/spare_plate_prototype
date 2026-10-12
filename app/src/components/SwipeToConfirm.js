import { Alert, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ChevronRight, Check } from "lucide-react-native";
import { colors, radius } from "../theme";
import { hapticSuccess } from "../hooks/haptics";

export function SwipeToConfirm({ onConfirm, disabled, label = "Swipe to confirm collection" }) {
  const x = useSharedValue(0);
  const max = useSharedValue(0);
  const done = useSharedValue(false);
  const thumb = 56;

  const finish = async () => {
    try {
      await onConfirm();
      hapticSuccess();
    } catch (error) {
      done.value = false;
      x.value = withSpring(0);
      Alert.alert("Could not confirm", error.message || "Try again.");
    }
  };

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX(8)
    .failOffsetY([-18, 18])
    .onUpdate((event) => {
      if (done.value) return;
      x.value = Math.min(Math.max(0, event.translationX), max.value);
    })
    .onEnd(() => {
      if (done.value) return;
      if (max.value > 0 && x.value > max.value * 0.82) {
        done.value = true;
        x.value = withSpring(max.value);
        runOnJS(finish)();
      } else {
        x.value = withSpring(0);
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, Math.max(max.value * 0.55, 1)], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View
      accessibilityLabel={label}
      onLayout={(event) => {
        max.value = Math.max(0, event.nativeEvent.layout.width - thumb - 8);
      }}
      style={[styles.track, disabled && styles.trackDisabled]}
    >
      <Animated.Text style={[styles.label, disabled && styles.labelDisabled, labelStyle]}>
        {disabled ? "Collection unavailable" : label}
      </Animated.Text>
      <GestureDetector gesture={pan}>
        <Animated.View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Slide to confirm collection"
          style={[styles.thumb, thumbStyle, disabled && styles.thumbDisabled]}
        >
          {disabled ? (
            <Check color={colors.faint} size={22} strokeWidth={2.4} />
          ) : (
            <ChevronRight color={colors.primaryDark} size={26} strokeWidth={2.6} />
          )}
        </Animated.View>
      </GestureDetector>
      </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 68,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryDark,
    justifyContent: "center",
    overflow: "hidden",
  },
  trackDisabled: { backgroundColor: "#E2E8F0" },
  label: {
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    paddingHorizontal: 72,
  },
  labelDisabled: { color: colors.muted },
  thumb: {
    position: "absolute",
    left: 6,
    top: 6,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbDisabled: { backgroundColor: "#F8FAFC" },
});
