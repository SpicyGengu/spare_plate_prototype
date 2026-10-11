import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { colors } from "../theme";

export default function NotFound() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>That screen is not on the menu.</Text>
      <Link href="/discover" style={styles.link}>Back to surplus</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12, backgroundColor: colors.bg },
  title: { fontWeight: "800", fontSize: 18, color: colors.text, textAlign: "center" },
  link: { color: colors.primaryDark, fontWeight: "800" },
});
