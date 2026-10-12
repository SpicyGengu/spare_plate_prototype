import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, MapPin } from "lucide-react-native";
import { QrCode } from "../../components/QrCode";
import { ScreenHeader } from "../../components/ui";
import { SwipeToConfirm } from "../../components/SwipeToConfirm";
import { countdownParts, formatAud, formatWindow, paymentLabel, windowState } from "../../data/domain";
import { useNow } from "../../hooks/useNow";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme";

function routeId(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default function VoucherScreen() {
  const { id } = useLocalSearchParams();
  const reservationId = routeId(id);
  const router = useRouter();
  const now = useNow(1000);
  const { reservations, collect, cancel } = useApp();
  const reservation = reservations.find((item) => item.id === reservationId);

  if (!reservation) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Voucher" back />
        <Text style={styles.missing}>This voucher is not on this device.</Text>
      </SafeAreaView>
    );
  }

  const state = windowState(reservation.collectStart, reservation.collectEnd, now);
  const parts = countdownParts(reservation.collectEnd, now);
  const collected = reservation.status === "collected";
  const cancelled = reservation.status === "cancelled";
  const expired = state === "closed";
  const statusLabel = collected ? "Collected" : cancelled ? "Cancelled" : expired ? "Window closed" : state === "upcoming" ? "Opens soon" : "Ready to collect";

  const onSwipe = () => collect(reservation.id);

  const onCancel = () => {
    Alert.alert("Cancel this reservation?", "The portion goes back on the listing.", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Cancel reservation",
        style: "destructive",
        onPress: async () => {
          try {
            await cancel(reservation.id);
            router.replace("/reservations");
          } catch (error) {
            Alert.alert("Could not cancel", error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Your voucher" subtitle={reservation.merchantName} back />
      <ScrollView style={styles.fill} contentContainerStyle={styles.content}>
        <View style={[styles.status, collected && styles.statusDone, expired && !collected && styles.statusLate]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>

        <Text style={styles.name}>{reservation.listingName}</Text>
        <View style={styles.venue}>
          <MapPin color={colors.primaryDark} size={15} />
          <Text style={styles.venueText}>{reservation.merchantName}</Text>
        </View>
        <Text style={styles.window}>{formatWindow(reservation.collectStart, reservation.collectEnd, now)}</Text>

        <View style={[styles.timer, (expired || collected) && styles.timerMuted]}>
          <Text style={styles.timerLabel}>
            {collected ? "Collected" : state === "upcoming" ? "Window ends in" : expired ? "Window ended" : "Collect before"}
          </Text>
          <View style={styles.digits}>
            <Digit value={parts.hours} unit="hrs" />
            <Text style={styles.colon}>:</Text>
            <Digit value={parts.minutes} unit="min" />
            <Text style={styles.colon}>:</Text>
            <Digit value={parts.seconds} unit="sec" />
          </View>
        </View>

        {collected ? (
          <View style={styles.done}>
            <CheckCircle2 color={colors.primaryDark} size={28} />
            <Text style={styles.doneTitle}>Enjoy your meal</Text>
            <Text style={styles.doneBody}>This voucher has been marked as collected.</Text>
          </View>
        ) : (
          <View style={styles.qrCard}>
            <QrCode value={`SPAREPLATE:${reservation.code}`} />
            <Text style={styles.code}>{reservation.code}</Text>
            <Text style={styles.qrHint}>Show this code at the counter</Text>
          </View>
        )}

        <View style={styles.pay}>
          <Text style={styles.payLabel}>Payment</Text>
          <Text style={styles.payValue}>{paymentLabel(reservation.paymentMethod)}</Text>
          <Text style={styles.payPrice}>{formatAud(reservation.discountedPrice)} AUD</Text>
        </View>

        {!collected && !cancelled ? (
          <SwipeToConfirm
            label="Swipe to confirm collection"
            disabled={expired}
            onConfirm={onSwipe}
          />
        ) : null}

        {reservation.status === "reserved" ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Cancel reservation" onPress={onCancel}>
            <Text style={styles.cancel}>Cancel reservation</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Digit({ value, unit }) {
  return (
    <View style={styles.digit}>
      <Text style={styles.digitValue}>{value}</Text>
      <Text style={styles.digitUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  status: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDone: { backgroundColor: "#DCFCE7" },
  statusLate: { backgroundColor: colors.amberSoft },
  statusText: { fontWeight: "800", color: colors.text },
  name: { fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: -0.4 },
  venue: { flexDirection: "row", alignItems: "center", gap: 6 },
  venueText: { fontWeight: "700", color: colors.muted },
  window: { color: colors.text, fontWeight: "700" },
  timer: {
    backgroundColor: colors.text,
    borderRadius: radius.xl,
    padding: 16,
    gap: 8,
  },
  timerMuted: { backgroundColor: "#334155" },
  timerLabel: { color: "#CBD5E1", fontWeight: "700", fontSize: 13 },
  digits: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  digit: { alignItems: "center", minWidth: 64 },
  digitValue: { color: "#FFFFFF", fontSize: 36, fontWeight: "800", fontVariant: ["tabular-nums"] },
  digitUnit: { color: "#94A3B8", fontSize: 11, fontWeight: "700" },
  colon: { color: colors.amber, fontSize: 28, fontWeight: "800", marginBottom: 14 },
  qrCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    paddingVertical: 18,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  code: { fontSize: 28, fontWeight: "800", letterSpacing: 4, color: colors.text },
  qrHint: { color: colors.muted, fontWeight: "600" },
  pay: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, gap: 4 },
  payLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  payValue: { color: colors.text, fontWeight: "800" },
  payPrice: { color: colors.primaryDark, fontWeight: "800", fontSize: 18 },
  done: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.xl,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  doneTitle: { fontWeight: "800", fontSize: 18, color: colors.text },
  doneBody: { color: colors.muted, textAlign: "center" },
  cancel: { textAlign: "center", color: colors.dangerDark, fontWeight: "800", paddingVertical: 8 },
  missing: { padding: 20, color: colors.muted },
});
