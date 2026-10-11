import { StyleSheet, Text, View } from "react-native";
import { ShieldAlert } from "lucide-react-native";
import { allergenLabel } from "../data/domain";
import { colors, radius } from "../theme";

export function AllergenBadges({ allergens = [], showHeading = true }) {
  return (
    <View style={styles.wrap}>
      {showHeading ? (
        <View style={styles.heading}>
          <ShieldAlert color={colors.danger} size={18} strokeWidth={2.3} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Allergen disclosure</Text>
            <Text style={styles.caption}>FSANZ Standard 1.2.3</Text>
          </View>
        </View>
      ) : null}
      {allergens.length === 0 ? (
        <View style={styles.clear}>
          <Text style={styles.clearText}>No mandatory allergens declared</Text>
        </View>
      ) : (
        <View style={styles.row}>
          {allergens.map((id) => (
            <View key={id} style={styles.badge} accessibilityLabel={`Contains ${allergenLabel(id)}`}>
              <Text style={styles.badgeText}>Contains · {allergenLabel(id)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  heading: { flexDirection: "row", gap: 8, alignItems: "center" },
  title: { fontSize: 16, fontWeight: "800", color: colors.text },
  caption: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    backgroundColor: colors.dangerSoft,
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { color: colors.dangerDark, fontWeight: "800", fontSize: 12 },
  clear: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearText: { color: colors.primaryDark, fontWeight: "700" },
});
