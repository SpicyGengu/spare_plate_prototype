import { useEffect, useState } from "react";
import { View, Text, Image, FlatList, Pressable, StyleSheet } from "react-native";
import { io } from "socket.io-client";
import { SERVER_URL } from "../config";

export default function FeedScreen({ onBack }) {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    // Initial load
    fetch(`${SERVER_URL}/listings`)
      .then((r) => r.json())
      .then(setListings)
      .catch((err) => console.warn("failed to load listings", err));

    // Live updates
    const socket = io(SERVER_URL);

    socket.on("listing:new", (listing) => {
      setListings((prev) => [listing, ...prev]);
    });

    socket.on("listing:update", (updated) => {
      setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    });

    return () => socket.disconnect();
  }, []);

  const respond = async (id, status) => {
    try {
      await fetch(`${SERVER_URL}/listings/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      // No local state update needed — the server broadcasts "listing:update"
      // back to us (and every other connected phone) over the socket.
    } catch (err) {
      console.warn("failed to respond", err);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← back</Text>
      </Pressable>
      <Text style={styles.title}>Listings</Text>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.photoBase64 }} style={styles.photo} />
            <View style={styles.cardBody}>
              {item.dietaryTags.length > 0 && (
                <Text style={styles.tags}>{item.dietaryTags.join(" · ")}</Text>
              )}
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.status}>status: {item.status}</Text>

              {item.status === "pending" && (
                <Pressable
                  style={styles.buyButton}
                  onPress={() => respond(item.id, "accepted")}
                >
                  <Text style={styles.actionText}>Buy for ${item.price.toFixed(2)}</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  back: { color: "#1a7f37", marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  card: {
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    overflow: "hidden",
  },
  photo: { width: "100%", height: 180 },
  cardBody: { padding: 12, gap: 4 },
  tags: { fontSize: 12, color: "#1a7f37", fontWeight: "600" },
  description: { fontSize: 15 },
  status: { fontSize: 12, color: "#888" },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  actionButton: { flex: 1, paddingVertical: 10, borderRadius: 8 },
  accept: { backgroundColor: "#1a7f37" },
  deny: { backgroundColor: "#b00020" },
  actionText: { color: "white", textAlign: "center", fontWeight: "600" },
  buyButton: {
    backgroundColor: "#1a7f37",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});
