import { useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CircleDollarSign, Package, ShoppingBag } from "lucide-react-native";
import { BottomBar } from "../../components/BottomBar";
import { WindowChip } from "../../components/WindowChip";
import { ScreenHeader, VenuePicker } from "../../components/ui";
import { formatAud, merchantStats, sortListings } from "../../data/domain";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme";

export default function MerchantDashboard() {
  const router = useRouter();
  const {
    merchants,
    listings,
    reservations,
    activeMerchantId,
    setActiveMerchantId,
    collect,
    refresh,
  } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const merchant = merchants.find((item) => item.id === activeMerchantId) || merchants[0];

  const stats = useMemo(
    () => (merchant ? merchantStats(merchant.id, listings, reservations) : { activeListings: 0, portions: 0, revenue: 0 }),
    [merchant, listings, reservations]
  );

  const mine = useMemo(
    () => sortListings(listings.filter((item) => item.merchantId === merchant?.id)),
    [listings, merchant]
  );

  const waiting = reservations.filter((item) => item.merchantId === merchant?.id && item.status === "reserved");

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const confirm = async (reservation) => {
    try {
      await collect(reservation.id);
    } catch (error) {
      Alert.alert("Could not collect", error.message);
    }
  };

  if (!merchant) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>Venues are still loading.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Today" subtitle={merchant.name} />
      <VenuePicker merchants={merchants} value={merchant.id} onChange={setActiveMerchantId} />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} />}
      >
        <Text style={styles.address}>{merchant.address}</Text>
        <View style={styles.stats}>
          <Stat icon={Package} label="Active" value={String(stats.activeListings)} />
          <Stat icon={ShoppingBag} label="Claimed" value={String(stats.portions)} />
          <Stat icon={CircleDollarSign} label="Recovered" value={formatAud(stats.revenue)} />
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.section}>Surplus listings</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Post surplus" onPress={() => router.push("/merchant/create")}>
            <Text style={styles.link}>Post</Text>
          </Pressable>
        </View>
        {mine.length === 0 ? (
          <Text style={styles.empty}>Nothing posted for this venue yet.</Text>
        ) : (
          mine.map((listing) => (
            <Pressable
              key={listing.id}
              accessibilityRole="button"
              accessibilityLabel={listing.name}
              onPress={() => router.push(`/listing/${listing.id}`)}
              style={styles.row}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.rowTitle}>{listing.name}</Text>
                <Text style={styles.rowMeta}>
                  {listing.quantity} left · {formatAud(listing.discountedPrice)}
                </Text>
                <WindowChip start={listing.collectStart} end={listing.collectEnd} compact />
              </View>
            </Pressable>
          ))
        )}

        <View style={styles.sectionHead}>
          <Text style={styles.section}>Waiting for collection</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Open scanner" onPress={() => router.push("/merchant/scan")}>
            <Text style={styles.link}>Scan</Text>
          </Pressable>
        </View>
        {waiting.length === 0 ? (
          <Text style={styles.empty}>No vouchers are waiting at this venue.</Text>
        ) : (
          waiting.map((reservation) => (
            <View key={reservation.id} style={styles.row}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.code}>{reservation.code}</Text>
                <Text style={styles.rowTitle}>{reservation.listingName}</Text>
                <Text style={styles.rowMeta}>{reservation.paymentMethod === "card" ? "Card already taken" : "Pay at collection"}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Mark ${reservation.code} collected`}
                onPress={() => confirm(reservation)}
                style={styles.confirm}
              >
                <Text style={styles.confirmText}>Collected</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
      <BottomBar mode="merchant" />
    </SafeAreaView>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <View style={styles.stat}>
      <Icon color={colors.primaryDark} size={16} />
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  address: { color: colors.muted, fontWeight: "600", fontSize: 13 },
  stats: { flexDirection: "row", gap: 8 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.text },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  sectionHead: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  section: { fontSize: 18, fontWeight: "800", color: colors.text },
  link: { color: colors.primaryDark, fontWeight: "800" },
  empty: { color: colors.muted, fontWeight: "600" },
  row: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  rowTitle: { fontWeight: "800", color: colors.text, fontSize: 15 },
  rowMeta: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  code: { fontWeight: "800", letterSpacing: 0.8, color: colors.text },
  confirm: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  confirmText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  missing: { padding: 20, color: colors.muted },
});
