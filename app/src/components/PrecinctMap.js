import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Rect, Text as SvgText } from "react-native-svg";
import { useRouter } from "expo-router";
import { Leaf, MapPin } from "lucide-react-native";
import { discountPercent, formatAud, listingImage } from "../data/domain";
import { colors, radius, shadow } from "../theme";
import { FoodImage } from "./FoodImage";

export function PrecinctMap({ merchants, listings, selectedId, onSelect }) {
  const router = useRouter();
  const visibleMerchants = merchants
    .map((merchant) => {
      const items = listings.filter((listing) => listing.merchantId === merchant.id);
      const best = items.reduce((max, listing) => {
        const percent = discountPercent(listing.originalPrice, listing.discountedPrice);
        return Math.max(max, percent);
      }, 0);
      return { merchant, items, best };
    })
    .filter((entry) => entry.items.length > 0);

  const selected = visibleMerchants.find((entry) => entry.merchant.id === selectedId) || null;

  return (
    <View style={styles.wrap}>
      <View style={[styles.map, shadow]}>
        <Svg width="100%" height="100%" viewBox="0 0 360 420" preserveAspectRatio="none">
          <Rect width="360" height="420" fill="#E7F6EF" />
          <Path d="M0 0 H360 V72 C300 108 246 36 180 64 C112 92 64 28 0 58 Z" fill="#BAE6FD" />
          <Path d="M0 54 C70 24 120 88 180 58 C240 28 300 96 360 62" stroke="#7DD3FC" strokeWidth="4" fill="none" />
          <Rect x="14" y="268" width="118" height="132" rx="26" fill="#A7F3D0" />
          <Rect x="146" y="168" width="86" height="64" rx="16" fill="#BBF7D0" />
          <Path d="M248 96 V400" stroke="#FFFFFF" strokeWidth="16" />
          <Path d="M248 96 V400" stroke="#E2E8F0" strokeWidth="10" />
          <Path d="M16 292 H344" stroke="#FFFFFF" strokeWidth="14" />
          <Path d="M16 292 H344" stroke="#E2E8F0" strokeWidth="8" />
          <Path d="M36 188 H200" stroke="#FFFFFF" strokeWidth="10" />
          <Circle cx="196" cy="236" r="7" fill="#0F172A" />
          <SvgText x="16" y="28" fill="#0369A1" fontSize="11" fontWeight="700">PARRAMATTA RIVER</SvgText>
          <SvgText x="22" y="258" fill="#047857" fontSize="11" fontWeight="700">PARRAMATTA PARK</SvgText>
          <SvgText x="258" y="150" fill="#64748B" fontSize="10" fontWeight="700">CHURCH ST</SvgText>
          <SvgText x="150" y="282" fill="#64748B" fontSize="10" fontWeight="700">MACQUARIE ST</SvgText>
          <SvgText x="158" y="198" fill="#047857" fontSize="10" fontWeight="700">PSQ</SvgText>
          <SvgText x="206" y="232" fill="#0F172A" fontSize="9" fontWeight="700">Station</SvgText>
          <SvgText x="24" y="386" fill="#047857" fontSize="10" fontWeight="700">WSU</SvgText>
        </Svg>
        {visibleMerchants.map(({ merchant, best }) => {
          const on = merchant.id === selectedId;
          return (
            <Pressable
              key={merchant.id}
              accessibilityRole="button"
              accessibilityLabel={`${merchant.name}, ${best} percent off`}
              onPress={() => onSelect(merchant.id)}
              style={[styles.pinWrap, { left: `${merchant.mapX}%`, top: `${merchant.mapY}%` }]}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>-{best}%</Text>
              </View>
              <View style={[styles.pin, on && styles.pinOn]}>
                <Leaf color={on ? "#FFFFFF" : colors.primaryDark} size={16} strokeWidth={2.4} />
              </View>
              {on ? <Text style={styles.pinName} numberOfLines={1}>{merchant.short}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      {selected ? (
        <View style={styles.preview}>
          <View style={styles.previewHead}>
            <MapPin color={colors.primaryDark} size={16} />
            <View style={{ flex: 1 }}>
              <Text style={styles.previewTitle}>{selected.merchant.name}</Text>
              <Text style={styles.previewMeta}>{selected.merchant.area}</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewRow}>
            {selected.items.map((listing) => (
              <Pressable
                key={listing.id}
                accessibilityRole="button"
                accessibilityLabel={listing.name}
                onPress={() => router.push(`/listing/${listing.id}`)}
                style={styles.mini}
              >
                <FoodImage uri={listingImage(listing)} style={styles.miniPhoto} iconSize={18} />
                <Text style={styles.miniTitle} numberOfLines={2}>{listing.name}</Text>
                <Text style={styles.miniPrice}>{formatAud(listing.discountedPrice)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.hint}>Tap a pin to see that venue’s surplus.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  map: {
    height: 420,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: "#E7F6EF",
  },
  pinWrap: {
    position: "absolute",
    width: 84,
    marginLeft: -42,
    marginTop: -18,
    alignItems: "center",
  },
  badge: {
    backgroundColor: colors.amber,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 4,
  },
  badgeText: { color: colors.text, fontSize: 11, fontWeight: "800" },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  pinOn: { backgroundColor: colors.primaryDark },
  pinName: {
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    color: colors.text,
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  preview: { gap: 8 },
  previewHead: { flexDirection: "row", gap: 8, alignItems: "center" },
  previewTitle: { fontWeight: "800", color: colors.text, fontSize: 15 },
  previewMeta: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  previewRow: { gap: 10 },
  mini: {
    width: 132,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  miniPhoto: { height: 72, borderRadius: 12 },
  miniTitle: { fontWeight: "800", color: colors.text, fontSize: 13, minHeight: 34 },
  miniPrice: { color: colors.primaryDark, fontWeight: "800" },
  hint: { color: colors.muted, fontWeight: "600", textAlign: "center" },
});
