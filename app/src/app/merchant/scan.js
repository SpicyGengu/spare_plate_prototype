import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomBar } from "../../components/BottomBar";
import { PrimaryButton, ScreenHeader } from "../../components/ui";
import { formatAud } from "../../data/domain";
import { useApp } from "../../state/AppContext";
import { colors, inputStyle, radius } from "../../theme";

export default function ScanScreen() {
  const { reservations, activeMerchantId, merchants, collect, collectByCode } = useApp();
  const merchant = merchants.find((item) => item.id === activeMerchantId);
  const waiting = reservations.filter((item) => item.merchantId === activeMerchantId && item.status === "reserved");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(scan, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scan]);

  const lineStyle = {
    transform: [
      {
        translateY: scan.interpolate({ inputRange: [0, 1], outputRange: [12, 168] }),
      },
    ],
  };

  const submitCode = async (value) => {
    const next = (value || code).trim();
    if (!next) {
      Alert.alert("Enter a voucher code", "Codes look like SP-4K2M.");
      return;
    }
    setBusy(true);
    try {
      await collectByCode(next);
      setCode("");
    } catch (error) {
      Alert.alert("Scan failed", error.message);
    } finally {
      setBusy(false);
    }
  };

  const simulate = () => {
    const next = waiting[0];
    if (!next) {
      Alert.alert("Nothing to scan", "There is no active voucher for this venue.");
      return;
    }
    setCode(next.code);
    submitCode(next.code);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Collect" subtitle={merchant?.short || "Venue"} back fallback="/merchant" />
      <ScrollView style={styles.fill} contentContainerStyle={styles.content}>
        <View style={styles.finder}>
          <View style={styles.frame}>
            <Corner style={styles.tl} />
            <Corner style={styles.tr} />
            <Corner style={styles.bl} />
            <Corner style={styles.br} />
            <Animated.View style={[styles.laser, lineStyle]} />
            <Text style={styles.finderText}>Point at the diner’s QR code</Text>
          </View>
        </View>
        <Text style={styles.help}>
          This is a scanner simulation. Use the next waiting voucher, or type the code printed under the QR.
        </Text>
        <PrimaryButton label={busy ? "Checking…" : "Simulate scan"} disabled={busy} onPress={simulate} testID="simulate-scan" />

        <Text style={styles.label}>Or enter the code</Text>
        <TextInput
          accessibilityLabel="Voucher code"
          autoCapitalize="characters"
          placeholder="SP-0000"
          placeholderTextColor={colors.faint}
          value={code}
          onChangeText={(value) => setCode(value.toUpperCase())}
          style={inputStyle}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Confirm code" onPress={() => submitCode()} style={styles.manual}>
          <Text style={styles.manualText}>Confirm code</Text>
        </Pressable>

        <Text style={styles.label}>Waiting at this venue</Text>
        {waiting.length === 0 ? (
          <Text style={styles.empty}>No active vouchers. Switch venue on Today if you are covering another cafe.</Text>
        ) : (
          waiting.map((reservation) => (
            <View key={reservation.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.code}>{reservation.code}</Text>
                <Text style={styles.name}>{reservation.listingName}</Text>
                <Text style={styles.meta}>{formatAud(reservation.discountedPrice)} · {reservation.paymentMethod === "card" ? "Card" : "Pay at pickup"}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Confirm ${reservation.code}`}
                onPress={() => collect(reservation.id).catch((error) => Alert.alert("Could not collect", error.message))}
                style={styles.confirm}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
      <BottomBar mode="merchant" />
    </SafeAreaView>
  );
}

function Corner({ style }) {
  return <View style={[styles.corner, style]} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  finder: { alignItems: "center" },
  frame: {
    width: 240,
    height: 220,
    borderRadius: 24,
    backgroundColor: "#0F172A",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 16,
  },
  laser: {
    position: "absolute",
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: colors.primary,
  },
  finderText: { color: "#E2E8F0", fontWeight: "700", fontSize: 12 },
  corner: { position: "absolute", width: 28, height: 28, borderColor: "#FFFFFF" },
  tl: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 40, left: 16, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 40, right: 16, borderBottomWidth: 3, borderRightWidth: 3 },
  help: { color: colors.muted, lineHeight: 20 },
  label: { marginTop: 6, fontWeight: "800", color: colors.text },
  manual: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  manualText: { fontWeight: "800", color: colors.text },
  empty: { color: colors.muted, fontWeight: "600" },
  row: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  code: { fontWeight: "800", letterSpacing: 1, color: colors.text },
  name: { fontWeight: "700", color: colors.text, marginTop: 2 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  confirm: { backgroundColor: colors.primaryDark, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  confirmText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
});
