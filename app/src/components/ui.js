import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Leaf } from "lucide-react-native";
import { colors, radius } from "../theme";
import { RoleSwitcher } from "./RoleSwitcher";

export function ScreenHeader({ title, subtitle, back = false, logo = false, fallback = "/discover" }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {back ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
            style={styles.back}
          >
            <ChevronLeft color={colors.text} size={22} />
          </Pressable>
        ) : null}
        {logo ? (
          <View style={styles.logoMark}>
            <Leaf color="#FFFFFF" size={16} strokeWidth={2.4} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>
      <RoleSwitcher />
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled, testID }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

export function StickyBar({ children }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.sticky, { paddingBottom: Math.max(insets.bottom, 14) }]}>{children}</View>;
}

export function VenuePicker({ merchants, value, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.venueScroller}
      contentContainerStyle={styles.venues}
    >
      {merchants.map((merchant) => {
        const on = merchant.id === value;
        return (
          <Pressable
            key={merchant.id}
            accessibilityRole="button"
            accessibilityLabel={merchant.name}
            accessibilityState={{ selected: on }}
            onPress={() => onChange(merchant.id)}
            style={[styles.venue, on && styles.venueOn]}
          >
            <Text style={[styles.venueText, on && styles.venueTextOn]}>{merchant.short}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  left: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.text, letterSpacing: -0.3 },
  subtitle: { color: colors.muted, fontSize: 12, fontWeight: "600", marginTop: 1 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  buttonDisabled: { backgroundColor: "#E2E8F0" },
  buttonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  buttonTextDisabled: { color: colors.muted },
  sticky: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  venues: { gap: 8, paddingHorizontal: 16, alignItems: "center" },
  venueScroller: { flexGrow: 0, flexShrink: 0, maxHeight: 52 },
  venue: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  venueOn: { backgroundColor: colors.text, borderColor: colors.text },
  venueText: { fontWeight: "800", color: colors.muted, fontSize: 13 },
  venueTextOn: { color: "#FFFFFF" },
});
