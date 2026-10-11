import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function SkeletonBlock({ height = 16, width = "100%", radius = 12, style }) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.block, { height, width, borderRadius: radius, opacity }, style]}
    />
  );
}

export function ListingSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBlock height={168} radius={0} />
      <View style={styles.body}>
        <SkeletonBlock height={12} width={120} />
        <SkeletonBlock height={18} width="78%" />
        <SkeletonBlock height={14} width={90} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: "#E2E8F0" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  body: { padding: 14, gap: 10 },
});
