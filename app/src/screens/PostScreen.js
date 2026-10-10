import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SERVER_URL, DIETARY_TAGS } from "../config";

export default function PostScreen({ onBack }) {
  const [photo, setPhoto] = useState(null); // { uri, base64 }
  const [selectedTags, setSelectedTags] = useState([]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera permission is required to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.5, // keep the JSON payload small-ish
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const submit = async () => {
    if (!photo) return Alert.alert("Take a photo first.");
    if (!description.trim()) return Alert.alert("Add a short description.");

    setSubmitting(true);
    try {
      const res = await fetch(`${SERVER_URL}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoBase64: `data:image/jpeg;base64,${photo.base64}`,
          dietaryTags: selectedTags,
          description: description.trim(),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      Alert.alert("Posted!", "Your listing is live.");
      setPhoto(null);
      setSelectedTags([]);
      setDescription("");
    } catch (err) {
      Alert.alert("Couldn't reach the server", String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← back</Text>
      </Pressable>

      <Text style={styles.title}>New Listing</Text>

      <Pressable style={styles.photoBox} onPress={takePhoto}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.photo} />
        ) : (
          <Text style={styles.photoPlaceholder}>Tap to take a photo</Text>
        )}
      </Pressable>

      <Text style={styles.label}>Dietary requirements</Text>
      <View style={styles.tagRow}>
        {DIETARY_TAGS.map((tag) => (
          <Pressable
            key={tag}
            style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
            onPress={() => toggleTag(tag)}
          >
            <Text
              style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.tagTextSelected,
              ]}
            >
              {tag}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="e.g. 3 unsold sandwiches, best eaten today"
        value={description}
        onChangeText={setDescription}
      />

      <Pressable style={styles.submitButton} onPress={submit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? "Posting…" : "Post Listing"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  back: { color: "#1a7f37", marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  photoBox: {
    height: 220,
    backgroundColor: "#eee",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: { color: "#888" },
  label: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1a7f37",
  },
  tagSelected: { backgroundColor: "#1a7f37" },
  tagText: { color: "#1a7f37" },
  tagTextSelected: { color: "white" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#1a7f37",
    padding: 16,
    borderRadius: 10,
    marginTop: 12,
  },
  submitText: { color: "white", textAlign: "center", fontWeight: "700", fontSize: 16 },
});
