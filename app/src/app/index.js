import { StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { Leaf } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListingSkeleton } from "../components/Skeleton";
import { useApp } from "../state/AppContext";
import { colors } from "../theme";

export default function Index() {
  const { ready, hasOnboarded, role } = useApp();

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.brand}>
          <View style={styles.mark}>
            <Leaf color="#FFFFFF" size={22} strokeWidth={2.4} />
          </View>
          <Text style={styles.title}>Spare Plate</Text>
          <Text style={styles.sub}>Finding surplus around Parramatta…</Text>
        </View>
        <View style={styles.list}>
          <ListingSkeleton />
          <ListingSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  if (role === "merchant") return <Redirect href="/merchant" />;
  return <Redirect href="/discover" />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  brand: { padding: 24, gap: 8 },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 32, fontWeight: "800", color: colors.text, letterSpacing: -0.6 },
  sub: { color: colors.muted, fontWeight: "600" },
  list: { paddingHorizontal: 20, gap: 16 },
});
