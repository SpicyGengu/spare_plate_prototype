import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export function PressableScale({
  children,
  onPress,
  disabled,
  style,
  accessibilityLabel,
  testID,
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 280 });
      }}
    >
      <Animated.View style={[style, animated]}>{children}</Animated.View>
    </Pressable>
  );
}
