import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, radius } from "../theme";
import { hapticLight } from "../hooks/haptics";
import { useApp } from "../state/AppContext";

export function RoleSwitcher() {
  const { role, setRole } = useApp();
  const router = useRouter();

  const choose = (next) => {
    if (next === role) return;
    hapticLight();
    setRole(next);
    router.replace(next === "merchant" ? "/merchant" : "/discover");
  };

  return (
    <View style={styles.track} accessibilityRole="tablist">
      <Segment label="Consumer" selected={role === "consumer"} onPress={() => choose("consumer")} testID="role-consumer" />
      <Segment label="Merchant" selected={role === "merchant"} onPress={() => choose("merchant")} testID="role-merchant" />
    </View>
  );
}

function Segment({ label, selected, onPress, testID }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={`${label} mode`}
      accessibilityState={{ selected }}
      testID={testID}
      onPress={onPress}
      style={[styles.segment, selected && styles.segmentOn]}
    >
      <Text style={[styles.text, selected && styles.textOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: radius.pill,
    padding: 3,
  },
  segment: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  segmentOn: { backgroundColor: colors.primaryDark },
  text: { fontSize: 11, fontWeight: "800", color: colors.muted },
  textOn: { color: "#FFFFFF" },
});
