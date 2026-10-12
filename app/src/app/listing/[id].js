import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, MapPin } from "lucide-react-native";
import { AllergenBadges } from "../../components/AllergenBadges";
import { FoodImage } from "../../components/FoodImage";
import { WindowChip } from "../../components/WindowChip";
import { PrimaryButton, StickyBar } from "../../components/ui";
import {
  discountPercent,
  formatAud,
  formatWindow,
  listingImage,
  windowState,
} from "../../data/domain";
import { useNow } from "../../hooks/useNow";
import { useApp } from "../../state/AppContext";
import { colors, radius } from "../../theme";

function routeId(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const listingId = routeId(id);
  const router = useRouter();
  const now = useNow(1000);
  const { listings, merchants } = useApp();
  const listing = listings.find((item) => item.id === listingId);
  const merchant = merchants.find((item) => item.id === listing?.merchantId);

  if (!listing) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>This listing is no longer available.</Text>
      </SafeAreaView>
    );
  }

  const state = windowState(listing.collectStart, listing.collectEnd, now);
  const soldOut = listing.quantity < 1;
  const closed = state === "closed";
  const disabled = soldOut || closed;
  const percent = discountPercent(listing.originalPrice, listing.discountedPrice);
  const action = soldOut ? "Sold out" : closed ? "Window closed" : state === "upcoming" ? "Reserve for later" : "Reserve";

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView style={styles.fill} contentContainerStyle={styles.scroll}>
        <View>
          <FoodImage uri={listingImage(listing)} style={styles.hero} iconSize={42} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/discover"))}
            style={styles.back}
          >
            <ChevronLeft color={colors.text} size={22} />
          </Pressable>
          <View style={styles.discount}>
            <Text style={styles.discountText}>-{percent}%</Text>
          </View>
        </View>

        <View style={styles.sheet}>
          <Text style={styles.category}>{listing.category}</Text>
          <Text style={styles.title}>{listing.name}</Text>
          <View style={styles.venue}>
            <MapPin color={colors.primaryDark} size={16} />
            <View style={{ flex: 1 }}>
              <Text style={styles.venueName}>{listing.merchantName}</Text>
              <Text style={styles.address}>{merchant?.address}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatAud(listing.discountedPrice)}</Text>
            <Text style={styles.was}>{formatAud(listing.originalPrice)}</Text>
            <Text style={styles.aud}>AUD</Text>
          </View>
          <Text style={styles.save}>You save {formatAud(listing.originalPrice - listing.discountedPrice)}</Text>

          <View style={styles.windowCard}>
            <Text style={styles.windowLabel}>Collection window</Text>
            <Text style={styles.windowTime}>{formatWindow(listing.collectStart, listing.collectEnd, now)}</Text>
            <WindowChip start={listing.collectStart} end={listing.collectEnd} />
            <Text style={styles.stock}>
              {soldOut ? "None left" : `${listing.quantity} portion${listing.quantity === 1 ? "" : "s"} left`}
            </Text>
          </View>

          <Text style={styles.section}>About this plate</Text>
          <Text style={styles.body}>{listing.description}</Text>

          <AllergenBadges allergens={listing.allergens} />
          <Text style={styles.note}>
            Declared by the venue. If you have a severe allergy, confirm the ingredients at collection before you eat.
          </Text>

          <Text style={styles.section}>Ingredients</Text>
          <Text style={styles.body}>{listing.ingredients}</Text>

          {listing.dietaryTags.length > 0 ? (
            <View style={styles.tags}>
              {listing.dietaryTags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <StickyBar>
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerPrice}>{formatAud(listing.discountedPrice)}</Text>
            <Text style={styles.footerMeta}>1 portion · AUD</Text>
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={action}
              disabled={disabled}
              testID="reserve-button"
              onPress={() => router.push(`/checkout/${listing.id}`)}
            />
          </View>
        </View>
      </StickyBar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  scroll: { paddingBottom: 24 },
  hero: { height: 280, width: "100%" },
  back: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  discount: {
    position: "absolute",
    top: 52,
    right: 16,
    backgroundColor: colors.amber,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  discountText: { fontWeight: "800", color: colors.text },
  sheet: {
    marginTop: -24,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    gap: 10,
  },
  category: { color: colors.primaryDark, fontWeight: "800", fontSize: 12, letterSpacing: 0.4 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  venue: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  venueName: { fontWeight: "800", color: colors.text },
  address: { color: colors.muted, fontSize: 13, marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 6 },
  price: { fontSize: 28, fontWeight: "800", color: colors.primaryDark },
  was: { color: colors.faint, textDecorationLine: "line-through", fontWeight: "700", fontSize: 16 },
  aud: { color: colors.muted, fontWeight: "800", fontSize: 12 },
  save: { color: colors.amberDark, fontWeight: "800" },
  windowCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  windowLabel: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  windowTime: { color: colors.text, fontWeight: "800", fontSize: 16 },
  stock: { color: colors.muted, fontWeight: "700" },
  section: { marginTop: 8, fontSize: 16, fontWeight: "800", color: colors.text },
  body: { color: "#334155", lineHeight: 22, fontSize: 15 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  tagText: { color: colors.primaryDark, fontWeight: "800", fontSize: 12 },
  footer: { flexDirection: "row", alignItems: "center", gap: 12 },
  footerPrice: { fontSize: 20, fontWeight: "800", color: colors.text },
  footerMeta: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  missing: { padding: 24, color: colors.muted, fontWeight: "700" },
});
