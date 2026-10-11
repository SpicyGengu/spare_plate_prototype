import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "react-native";
import { UtensilsCrossed } from "lucide-react-native";
import { SkeletonBlock } from "./Skeleton";
import { colors } from "../theme";

export function FoodImage({ uri, style, iconSize = 28 }) {
  const [phase, setPhase] = useState(uri ? "loading" : "empty");

  useEffect(() => {
    setPhase(uri ? "loading" : "empty");
  }, [uri]);

  return (
    <View style={[styles.frame, style]}>
      {phase !== "ready" && phase !== "empty" && <SkeletonBlock height="100%" radius={0} style={StyleSheet.absoluteFill} />}
      {uri && phase !== "error" ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          onLoad={() => setPhase("ready")}
          onError={() => setPhase("error")}
        />
      ) : null}
      {(phase === "error" || phase === "empty") && (
        <View style={styles.fallback}>
          <UtensilsCrossed color={colors.primaryDark} size={iconSize} strokeWidth={2.1} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: "hidden", backgroundColor: "#D1FAE5" },
  fallback: { flex: 1, alignItems: "center", justifyContent: "center" },
});
