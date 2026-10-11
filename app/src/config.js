import { Platform } from "react-native";
import Constants from "expo-constants";

const LAN_FALLBACK = "http://192.168.1.82:3000";

function devHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    "";
  const host = String(hostUri).split(":")[0];
  return host || null;
}

export function getServerUrl() {
  if (process.env.EXPO_PUBLIC_SERVER_URL) return process.env.EXPO_PUBLIC_SERVER_URL;
  if (Platform.OS === "web") return "http://localhost:3000";
  const host = devHost();
  if (host) return `http://${host}:3000`;
  return LAN_FALLBACK;
}

export const SERVER_URL = getServerUrl();
