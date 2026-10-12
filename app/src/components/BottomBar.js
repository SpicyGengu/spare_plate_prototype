import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Compass, Plus, QrCode, ScanLine, Store } from "lucide-react-native";
import { colors } from "../theme";
import { useApp } from "../state/AppContext";
import { hapticLight } from "../hooks/haptics";

const CONSUMER = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/reservations", label: "Vouchers", icon: QrCode, badge: "consumer" },
];

const MERCHANT = [
  { href: "/merchant", label: "Today", icon: Store },
  { href: "/merchant/create", label: "Post", icon: Plus },
  { href: "/merchant/scan", label: "Collect", icon: ScanLine, badge: "merchant" },
];

function active(href, path) {
  if (href === "/merchant") return path === "/merchant";
  if (href === "/discover") return path === "/discover";
  return path === href || path.startsWith(`${href}/`);
}

export function BottomBar({ mode }) {
  const router = useRouter();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const { reservations, activeMerchantId } = useApp();
  const items = mode === "merchant" ? MERCHANT : CONSUMER;
  const consumerBadge = reservations.filter((item) => item.status === "reserved").length;
  const merchantBadge = reservations.filter(
    (item) => item.status === "reserved" && item.merchantId === activeMerchantId
  ).length;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {items.map((item) => {
        const on = active(item.href, path);
        const Icon = item.icon;
        const count = item.badge === "consumer" ? consumerBadge : item.badge === "merchant" ? merchantBadge : 0;
        return (
          <Pressable
            key={item.href}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (on) return;
              hapticLight();
              router.replace(item.href);
            }}
            style={styles.item}
          >
            <View>
              <Icon color={on ? colors.primaryDark : colors.faint} size={22} strokeWidth={on ? 2.5 : 2.1} />
              {count > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, on && styles.labelOn]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  item: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 4 },
  label: { fontSize: 11, fontWeight: "700", color: colors.faint },
  labelOn: { color: colors.primaryDark },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.amber,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.text, fontSize: 10, fontWeight: "800" },
});
