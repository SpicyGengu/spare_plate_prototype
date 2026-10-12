import { Platform, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider, useApp } from "../state/AppContext";
import { colors, radius, shadow } from "../theme";

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={styles.toastWrap}>
      <View style={styles.toast}>
        <Text style={styles.toastText}>{toast}</Text>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <View style={styles.canvas}>
            <View style={styles.phone}>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.bg },
                  animation: "slide_from_right",
                }}
              />
              <Toast />
            </View>
          </View>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  canvas: { flex: 1, backgroundColor: colors.canvas, alignItems: "center" },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    backgroundColor: colors.bg,
    ...Platform.select({
      web: {
        marginVertical: 18,
        borderRadius: 28,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#1E293B",
        ...shadow,
      },
    }),
  },
  toastWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 12,
    alignItems: "center",
  },
  toast: {
    backgroundColor: colors.text,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toastText: { color: "#FFFFFF", fontWeight: "700" },
});
