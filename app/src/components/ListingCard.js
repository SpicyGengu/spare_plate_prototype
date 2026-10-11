import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { discountPercent, formatAud, listingImage } from "../data/domain";
import { colors, radius, shadow } from "../theme";
import { FoodImage } from "./FoodImage";
import { PressableScale } from "./PressableScale";
import { WindowChip } from "./WindowChip";

export function ListingCard({ listing }) {
  const router = useRouter();
  const percent = discountPercent(listing.originalPrice, listing.discountedPrice);
  const soldOut = listing.quantity < 1;

  return (
    <PressableScale
      accessibilityLabel={`${listing.name} from ${listing.merchantName}, ${formatAud(listing.discountedPrice)}`}
      testID={`listing-${listing.id}`}
      onPress={() => router.push(`/listing/${listing.id}`)}
      style={[styles.card, shadow]}
    >
      <View>
        <FoodImage uri={listingImage(listing)} style={styles.photo} />
        <View style={styles.discount}>
          <Text style={styles.discountText}>-{percent}%</Text>
        </View>
        <View style={[styles.qty, soldOut && styles.qtySold]}>
          <Text style={[styles.qtyText, soldOut && styles.qtySoldText]}>
            {soldOut ? "Sold out" : `${listing.quantity} left`}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.merchant} numberOfLines={1}>{listing.merchantName}</Text>
        <Text style={styles.title} numberOfLines={2}>{listing.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatAud(listing.discountedPrice)}</Text>
          <Text style={styles.was}>{formatAud(listing.originalPrice)}</Text>
          <Text style={styles.aud}>AUD</Text>
        </View>
        <WindowChip start={listing.collectStart} end={listing.collectEnd} />
        {listing.dietaryTags.length > 0 ? (
          <View style={styles.tags}>
            {listing.dietaryTags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, overflow: "hidden" },
  photo: { height: 176, width: "100%" },
  discount: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: colors.amber,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountText: { color: colors.text, fontWeight: "800", fontSize: 13 },
  qty: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(15,23,42,0.78)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  qtySold: { backgroundColor: colors.danger },
  qtyText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  qtySoldText: { color: "#FFFFFF" },
  body: { padding: 14, gap: 6 },
  merchant: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  title: { color: colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  price: { color: colors.primaryDark, fontSize: 20, fontWeight: "800" },
  was: { color: colors.faint, fontSize: 14, textDecorationLine: "line-through", fontWeight: "600" },
  aud: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  tag: { backgroundColor: "#F1F5F9", borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
});
