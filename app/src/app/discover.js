import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Leaf, List, Map as MapIcon, Search, X } from "lucide-react-native";
import { BottomBar } from "../components/BottomBar";
import { ListingCard } from "../components/ListingCard";
import { PrecinctMap } from "../components/PrecinctMap";
import { RoleSwitcher } from "../components/RoleSwitcher";
import { DIETARY_FILTERS, filterListings, sortListings } from "../data/domain";
import { useApp } from "../state/AppContext";
import { colors, radius } from "../theme";

export default function DiscoverScreen() {
  const { listings, merchants, source, refresh } = useApp();
  const [query, setQuery] = useState("");
  const [diets, setDiets] = useState([]);
  const [mode, setMode] = useState("list");
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const visible = useMemo(
    () => sortListings(filterListings(listings, merchants, { query, diets })),
    [listings, merchants, query, diets]
  );

  const toggleDiet = (diet) => {
    setDiets((current) => (current.includes(diet) ? current.filter((item) => item !== diet) : [...current, diet]));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brand}>
            <View style={styles.mark}>
              <Leaf color="#FFFFFF" size={16} strokeWidth={2.4} />
            </View>
            <View>
              <Text style={styles.wordmark}>Spare Plate</Text>
              <Text style={styles.sync}>{source === "remote" ? "Parramatta · synced" : "Parramatta · demo"}</Text>
            </View>
          </View>
          <RoleSwitcher />
        </View>

        <View style={styles.search}>
          <Search color={colors.faint} size={18} />
          <TextInput
            accessibilityLabel="Search surplus"
            placeholder="Search food, venues, ingredients"
            placeholderTextColor={colors.faint}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          {query ? (
            <Pressable accessibilityLabel="Clear search" onPress={() => setQuery("")}>
              <X color={colors.muted} size={16} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {DIETARY_FILTERS.map((diet) => {
            const on = diets.includes(diet);
            return (
              <Pressable
                key={diet}
                accessibilityRole="button"
                accessibilityLabel={diet}
                accessibilityState={{ selected: on }}
                testID={`filter-${diet}`}
                onPress={() => toggleDiet(diet)}
                style={[styles.filter, on && styles.filterOn]}
              >
                <Text style={[styles.filterText, on && styles.filterTextOn]}>{diet}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.metaRow}>
          <Text style={styles.count}>{visible.length} surplus listing{visible.length === 1 ? "" : "s"}</Text>
          <View style={styles.segment}>
            <Segment icon={List} label="List" on={mode === "list"} onPress={() => setMode("list")} />
            <Segment icon={MapIcon} label="Map" on={mode === "map"} onPress={() => setMode("map")} />
          </View>
        </View>
      </View>

      {mode === "list" ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryDark} />}
        >
          {visible.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nothing matches</Text>
              <Text style={styles.emptyBody}>Try another dietary filter, or clear the search to see every venue in the precinct.</Text>
            </View>
          ) : (
            visible.map((listing) => <ListingCard key={listing.id} listing={listing} />)
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.fill} contentContainerStyle={styles.mapScroll}>
          {visible.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No pins for this filter</Text>
              <Text style={styles.emptyBody}>Clear a dietary tag to bring the Parramatta venues back onto the map.</Text>
            </View>
          ) : (
            <PrecinctMap
              merchants={merchants}
              listings={visible}
              selectedId={selectedMerchantId}
              onSelect={setSelectedMerchantId}
            />
          )}
        </ScrollView>
      )}
      <BottomBar mode="consumer" />
    </SafeAreaView>
  );
}

function Segment({ icon: Icon, label, on, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} view`}
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[styles.seg, on && styles.segOn]}
    >
      <Icon color={on ? "#FFFFFF" : colors.muted} size={14} strokeWidth={2.4} />
      <Text style={[styles.segText, on && styles.segTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  header: { paddingTop: 4, gap: 12, paddingBottom: 8 },
  brandRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  mark: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: { fontSize: 18, fontWeight: "800", color: colors.text, letterSpacing: -0.3 },
  sync: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  search: {
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 10 },
  filters: { paddingHorizontal: 16, gap: 8 },
  filter: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterOn: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  filterText: { fontWeight: "800", color: colors.muted, fontSize: 13 },
  filterTextOn: { color: "#FFFFFF" },
  metaRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  segment: { flexDirection: "row", backgroundColor: "#E2E8F0", borderRadius: radius.pill, padding: 3 },
  seg: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  segOn: { backgroundColor: colors.text },
  segText: { fontSize: 12, fontWeight: "800", color: colors.muted },
  segTextOn: { color: "#FFFFFF" },
  list: { padding: 16, gap: 14, paddingBottom: 24 },
  mapScroll: { padding: 16, paddingBottom: 24 },
  empty: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    gap: 6,
  },
  emptyTitle: { fontWeight: "800", fontSize: 18, color: colors.text },
  emptyBody: { color: colors.muted, lineHeight: 20 },
});
