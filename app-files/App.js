import { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import RoleSelectScreen from "./src/screens/RoleSelectScreen";
import PostScreen from "./src/screens/PostScreen";
import FeedScreen from "./src/screens/FeedScreen";

export default function App() {
  const [role, setRole] = useState(null); // null | "shop" | "customer"

  return (
    <SafeAreaView style={styles.safeArea}>
      {role === null && <RoleSelectScreen onSelectRole={setRole} />}
      {role === "shop" && <PostScreen onBack={() => setRole(null)} />}
      {role === "customer" && <FeedScreen onBack={() => setRole(null)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "white" },
});
