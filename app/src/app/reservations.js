import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomBar } from "../components/BottomBar";
import { FoodImage } from "../components/FoodImage";
import { ScreenHeader } from "../components/ui";
import { WindowChip } from "../components/WindowChip";
import { formatAud, listingImage } from "../data/domain";
import { useApp } from "../state/AppContext";
import { colors, radius } from "../theme";

const STATUS = {
  reserved: "Ready",
  collected: "Collected",
  cancelled: "Cancelled",
};

export default function ReservationsScreen() {
  const { reservations } = useApp();
  const router = useRouter();
  const ordered = [...reservations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Vouchers" subtitle="Active and past collections" />
      <ScrollView style={styles.fill} contentContainerStyle={styles.list}>
        {ordered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No reservations yet</Text>
            <Text style={styles.emptyBody}>Reserve a surplus plate and the countdown voucher will land here.</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Browse surplus" onPress={() => router.replace("/discover")} style={styles.browse}>
              <Text style={styles.browseText}>Browse surplus</Text>
            </Pressable>
          </View>
        ) : (
          ordered.map((reservation) => (
            <Pressable
              key={reservation.id}
              accessibilityRole="button"
              accessibilityLabel={`${reservation.listingName}, ${reservation.code}`}
              onPress={() => router.push(`/voucher/${reservation.id}`)}
              style={styles.card}
            >
              <FoodImage uri={listingImage(reservation)} style={styles.photo} iconSize={18} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.row}>
                  <Text style={styles.code}>{reservation.code}</Text>
                  <Text style={styles.status}>{STATUS[reservation.status] || reservation.status}</Text>
                </View>
                <Text style={styles.name} numberOfLines={1}>{reservation.listingName}</Text>
                <Text style={styles.meta} numberOfLines={1}>{reservation.merchantName}</Text>
                <WindowChip start={reservation.collectStart} end={reservation.collectEnd} compact />
              </View>
              <Text style={styles.price}>{formatAud(reservation.discountedPrice)}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
      <BottomBar mode="consumer" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
    alignItems: "center",
  },
  photo: { width: 72, height: 72, borderRadius: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  code: { fontWeight: "800", color: colors.text, letterSpacing: 0.6 },
  status: { color: colors.primaryDark, fontWeight: "800", fontSize: 12 },
  name: { fontWeight: "800", color: colors.text, fontSize: 16 },
  meta: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  price: { fontWeight: "800", color: colors.text },
  empty: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 20, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  emptyBody: { color: colors.muted, lineHeight: 20 },
  browse: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  browseText: { color: "#FFFFFF", fontWeight: "800" },
});
