import { StyleSheet, Text, View } from "react-native";
import { Clock } from "lucide-react-native";
import { windowChip } from "../data/domain";
import { useNow } from "../hooks/useNow";
import { colors, radius } from "../theme";

export function WindowChip({ start, end, compact = false }) {
  const now = useNow(1000);
  const chip = windowChip(start, end, now);
  const urgent = chip.urgent;
  const closed = chip.state === "closed";
  const tone = closed ? styles.closed : urgent ? styles.urgent : styles.calm;
  const text = closed ? styles.closedText : urgent ? styles.urgentText : styles.calmText;

  return (
    <View style={[styles.chip, tone, compact && styles.compact]}>
      <Clock size={13} color={closed ? colors.muted : urgent ? colors.amberDark : colors.primaryDark} strokeWidth={2.4} />
      <Text style={[styles.label, text]}>{chip.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  compact: { paddingVertical: 4 },
  calm: { backgroundColor: colors.primarySoft },
  urgent: { backgroundColor: colors.amberSoft },
  closed: { backgroundColor: "#F1F5F9" },
  label: { fontSize: 12, fontWeight: "700" },
  calmText: { color: colors.primaryDark },
  urgentText: { color: colors.amberDark },
  closedText: { color: colors.muted },
});
