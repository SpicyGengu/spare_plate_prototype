import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Banknote, CreditCard } from "lucide-react-native";
import { FoodImage } from "../../components/FoodImage";
import { PrimaryButton, ScreenHeader, StickyBar } from "../../components/ui";
import { formatAud, formatWindow, listingImage } from "../../data/domain";
import { hapticSuccess } from "../../hooks/haptics";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme";

function routeId(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams();
  const { listings, reserve } = useApp();
  const listing = listings.find((item) => item.id === routeId(id));
  const router = useRouter();
  const [method, setMethod] = useState("collection");
  const [submitting, setSubmitting] = useState(false);

  if (!listing) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Reserve" back />
        <Text style={styles.missing}>This listing is no longer available.</Text>
      </SafeAreaView>
    );
  }

  const confirm = async () => {
    setSubmitting(true);
    try {
      const reservation = await reserve({ listingId: listing.id, paymentMethod: method });
      hapticSuccess();
      router.replace(`/voucher/${reservation.id}`);
    } catch (error) {
      Alert.alert("Could not reserve", error.message || "Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Reserve" subtitle={listing.merchantName} back />
      <ScrollView style={styles.fill} contentContainerStyle={styles.content}>
        <View style={styles.summary}>
          <FoodImage uri={listingImage(listing)} style={styles.photo} iconSize={20} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.name}>{listing.name}</Text>
            <Text style={styles.window}>{formatWindow(listing.collectStart, listing.collectEnd)}</Text>
          </View>
        </View>

        <View style={styles.bill}>
          <Row label="Original price" value={formatAud(listing.originalPrice)} muted />
          <Row label="Surplus price" value={formatAud(listing.discountedPrice)} />
          <Row label="You save" value={formatAud(listing.originalPrice - listing.discountedPrice)} accent />
        </View>

        <Text style={styles.heading}>How will you pay?</Text>
        <PayOption
          icon={Banknote}
          title="Pay at collection"
          body="Cash or EFTPOS when you pick up. Nothing is charged now."
          selected={method === "collection"}
          onPress={() => setMethod("collection")}
          testID="pay-collection"
        />
        <PayOption
          icon={CreditCard}
          title="Card provider"
          body="Demo charge to Visa ···· 4242. No real payment is taken."
          selected={method === "card"}
          onPress={() => setMethod("card")}
          testID="pay-card"
        />
      </ScrollView>
      <StickyBar>
        <PrimaryButton
          label={submitting ? "Reserving…" : `Confirm · ${formatAud(listing.discountedPrice)} AUD`}
          disabled={submitting || listing.quantity < 1}
          onPress={confirm}
          testID="confirm-reserve"
        />
      </StickyBar>
    </SafeAreaView>
  );
}

function Row({ label, value, muted, accent }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, muted && styles.muted]}>{label}</Text>
      <Text style={[styles.rowValue, accent && styles.accent, muted && styles.strike]}>{value}</Text>
    </View>
  );
}

function PayOption({ icon: Icon, title, body, selected, onPress, testID }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ selected }}
      testID={testID}
      onPress={onPress}
      style={[styles.option, selected && styles.optionOn]}
    >
      <View style={[styles.icon, selected && styles.iconOn]}>
        <Icon color={selected ? "#FFFFFF" : colors.primaryDark} size={18} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionBody}>{body}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  summary: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
    alignItems: "center",
  },
  photo: { width: 72, height: 72, borderRadius: 14 },
  name: { fontWeight: "800", fontSize: 16, color: colors.text },
  window: { color: colors.muted, fontWeight: "600", fontSize: 13 },
  bill: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: colors.text, fontWeight: "700" },
  rowValue: { color: colors.text, fontWeight: "800" },
  muted: { color: colors.muted },
  strike: { textDecorationLine: "line-through", color: colors.faint },
  accent: { color: colors.primaryDark },
  heading: { marginTop: 6, fontWeight: "800", fontSize: 16, color: colors.text },
  option: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  optionOn: { borderColor: colors.primaryDark, backgroundColor: "#F0FDF4" },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconOn: { backgroundColor: colors.primaryDark },
  optionTitle: { fontWeight: "800", color: colors.text },
  optionBody: { color: colors.muted, marginTop: 2, lineHeight: 18, fontSize: 13 },
  missing: { padding: 20, color: colors.muted },
});
