import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Clock, QrCode, ShieldAlert, ShoppingBag } from "lucide-react-native";
import { useApp } from "../state/AppContext";
import { colors, radius } from "../theme";
import { hapticLight } from "../hooks/haptics";

const SLIDES = [
  {
    key: "reserve",
    kicker: "Reserve and collect",
    title: "Save a plate before it is wasted",
    body: "Cafes around Church Street, Parramatta Square and the WSU city campus post surplus food at the end of service. Reserve a portion, then collect it in the pickup window.",
    icon: ShoppingBag,
    colors: ["#059669", "#10B981"],
  },
  {
    key: "allergens",
    kicker: "Allergen transparency",
    title: "See what is in the food first",
    body: "Every listing declares FSANZ Standard 1.2.3 allergens, ingredients and dietary tags before you reserve. Peanuts, gluten, milk and the rest are shown as badges, not buried in fine print.",
    icon: ShieldAlert,
    colors: ["#B91C1C", "#F97316"],
  },
  {
    key: "confirm",
    kicker: "Pickup confirmation",
    title: "Show the code, then swipe",
    body: "Your voucher has a live countdown and a QR code for the counter. When the bag is in your hands, swipe to confirm collection — or let the venue mark it collected.",
    icon: QrCode,
    colors: ["#B45309", "#F59E0B"],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const scroller = useRef(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const finish = () => {
    hapticLight();
    completeOnboarding();
    router.replace("/discover");
  };

  const next = () => {
    if (index >= SLIDES.length - 1) {
      finish();
      return;
    }
    const nextIndex = index + 1;
    scroller.current?.scrollTo({ x: width * nextIndex, animated: true });
    setIndex(nextIndex);
  };

  return (
    <SafeAreaView
      style={styles.safe}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.top}>
        <Text style={styles.brand}>Spare Plate</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Skip tutorial" onPress={finish}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scroller}
        style={styles.pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          if (!width) return;
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
      >
        {SLIDES.map((slide) => {
          const Icon = slide.icon;
          return (
            <View key={slide.key} style={[styles.slide, { width: width || "100%" }]}>
              <LinearGradient colors={slide.colors} style={styles.hero}>
                <View style={styles.iconBubble}>
                  <Icon color={colors.text} size={36} strokeWidth={2.2} />
                </View>
                <View style={styles.clockRow}>
                  <Clock color="#FFFFFF" size={16} />
                  <Text style={styles.clockText}>Parramatta · today</Text>
                </View>
              </LinearGradient>
              <Text style={styles.kicker}>{slide.kicker}</Text>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.body}>{slide.body}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, dot) => (
            <View key={slide.key} style={[styles.dot, dot === index && styles.dotOn]} />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={index === SLIDES.length - 1 ? "Start saving food" : "Next"}
          testID="onboarding-next"
          onPress={next}
          style={styles.next}
        >
          <Text style={styles.nextText}>{index === SLIDES.length - 1 ? "Start saving food" : "Next"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pager: { flex: 1 },
  top: {
    paddingHorizontal: 20,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontWeight: "800", color: colors.text, fontSize: 16 },
  skip: { color: colors.muted, fontWeight: "800" },
  slide: { paddingHorizontal: 20, paddingTop: 12 },
  hero: {
    height: 240,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  iconBubble: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  clockRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  clockText: { color: "#FFFFFF", fontWeight: "700" },
  kicker: { color: colors.primaryDark, fontWeight: "800", fontSize: 13, marginBottom: 8 },
  title: { fontSize: 30, lineHeight: 36, fontWeight: "800", color: colors.text, letterSpacing: -0.6 },
  body: { marginTop: 12, color: colors.muted, fontSize: 16, lineHeight: 24 },
  footer: { padding: 20, gap: 16 },
  dots: { flexDirection: "row", gap: 6, justifyContent: "center" },
  dot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: "#CBD5E1" },
  dotOn: { width: 22, backgroundColor: colors.primaryDark },
  next: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  nextText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
});
