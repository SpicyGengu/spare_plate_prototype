import { View, Text, Pressable, StyleSheet } from "react-native";

export default function RoleSelectScreen({ onSelectRole }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prototype</Text>
      <Text style={styles.subtitle}>What is this phone doing?</Text>

      <Pressable style={styles.button} onPress={() => onSelectRole("shop")}>
        <Text style={styles.buttonText}>I'm the Shop (post a listing)</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => onSelectRole("customer")}>
        <Text style={styles.buttonText}>I'm the Customer (browse listings)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 16 },
  button: {
    backgroundColor: "#1a7f37",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
  },
  buttonText: { color: "white", fontSize: 16, textAlign: "center", fontWeight: "600" },
});
