import { useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { BottomBar } from "../../components/BottomBar";
import { FoodImage } from "../../components/FoodImage";
import { PrimaryButton, ScreenHeader, VenuePicker } from "../../components/ui";
import {
  ALLERGENS,
  CATEGORIES,
  CATEGORY_IMAGES,
  DIETARY_TAGS,
  formatWindow,
} from "../../data/domain";
import { useApp } from "../../state/AppContext";
import { colors, inputStyle, radius } from "../../theme";

const STARTS = [
  { id: "now", label: "Now", offset: 0 },
  { id: "30", label: "In 30 min", offset: 30 },
  { id: "60", label: "In 1 hour", offset: 60 },
  { id: "120", label: "In 2 hours", offset: 120 },
];

const DURATIONS = [
  { id: 45, label: "45 min" },
  { id: 90, label: "90 min" },
  { id: 120, label: "2 hours" },
  { id: 180, label: "3 hours" },
];

function clockChoices(now) {
  return [16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20]
    .map((hourValue) => {
      const hours = Math.floor(hourValue);
      const minutes = Math.round((hourValue - hours) * 60);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      const label = date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false });
      return { id: `clock-${label}`, label, date, available: date.getTime() > now + 60 * 1000 };
    })
    .filter((choice) => choice.available);
}

export default function CreateListingScreen() {
  const router = useRouter();
  const { merchants, activeMerchantId, setActiveMerchantId, createListing } = useApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("Bakery");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [quantity, setQuantity] = useState(4);
  const [startId, setStartId] = useState("now");
  const [duration, setDuration] = useState(90);
  const [allergens, setAllergens] = useState([]);
  const [noAllergens, setNoAllergens] = useState(false);
  const [diets, setDiets] = useState([]);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [previewUri, setPreviewUri] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const now = Date.now();
  const clocks = useMemo(() => clockChoices(now), [now]);

  const startDate = useMemo(() => {
    const relative = STARTS.find((item) => item.id === startId);
    if (relative) return new Date(Date.now() + relative.offset * 60 * 1000);
    const clock = clocks.find((item) => item.id === startId);
    return clock ? clock.date : new Date();
  }, [startId, clocks]);
  const endDate = useMemo(() => new Date(startDate.getTime() + duration * 60 * 1000), [startDate, duration]);

  const toggleAllergen = (id) => {
    setNoAllergens(false);
    setAllergens((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleDiet = (tag) => {
    setDiets((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted && Platform.OS !== "web") {
      Alert.alert("Photo access is needed to attach a picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.4,
      mediaTypes: ["images"],
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setPreviewUri(asset.uri);
    setPhotoBase64(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null);
  };

  const publish = async () => {
    setError("");
    setSubmitting(true);
    try {
      await createListing({
        merchantId: activeMerchantId,
        name,
        description,
        ingredients,
        category,
        originalPrice,
        discountedPrice,
        quantity,
        collectStart: startDate.toISOString(),
        collectEnd: endDate.toISOString(),
        allergens,
        noAllergens,
        dietaryTags: diets,
        photoBase64,
        imageUrl: CATEGORY_IMAGES[category],
      });
      router.replace("/merchant");
    } catch (err) {
      setError(err.message || "Could not publish.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Post surplus" subtitle="Allergens are required" back fallback="/merchant" />
      <ScrollView style={styles.fill} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <VenuePicker merchants={merchants} value={activeMerchantId} onChange={setActiveMerchantId} />

        <Text style={styles.label}>Item</Text>
        <TextInput style={inputStyle} placeholder="Item name" placeholderTextColor={colors.faint} value={name} onChangeText={setName} />
        <TextInput
          style={[inputStyle, styles.multi]}
          placeholder="What is left, and when it was made"
          placeholderTextColor={colors.faint}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={[inputStyle, styles.multi]}
          placeholder="Ingredients, separated by commas"
          placeholderTextColor={colors.faint}
          value={ingredients}
          onChangeText={setIngredients}
          multiline
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.wrap}>
          {CATEGORIES.map((item) => (
            <Choice key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />
          ))}
        </View>

        <Text style={styles.label}>Prices · AUD</Text>
        <View style={styles.pair}>
          <TextInput
            style={[inputStyle, styles.half]}
            keyboardType="decimal-pad"
            placeholder="Original"
            placeholderTextColor={colors.faint}
            value={originalPrice}
            onChangeText={setOriginalPrice}
          />
          <TextInput
            style={[inputStyle, styles.half]}
            keyboardType="decimal-pad"
            placeholder="Surplus"
            placeholderTextColor={colors.faint}
            value={discountedPrice}
            onChangeText={setDiscountedPrice}
          />
        </View>

        <Text style={styles.label}>Portions left</Text>
        <View style={styles.stepper}>
          <Pressable accessibilityLabel="Decrease stock" onPress={() => setQuantity((value) => Math.max(1, value - 1))} style={styles.step}>
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{quantity}</Text>
          <Pressable accessibilityLabel="Increase stock" onPress={() => setQuantity((value) => Math.min(99, value + 1))} style={styles.step}>
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Collection starts</Text>
        <View style={styles.wrap}>
          {STARTS.map((item) => (
            <Choice key={item.id} label={item.label} selected={startId === item.id} onPress={() => setStartId(item.id)} />
          ))}
          {clocks.map((item) => (
            <Choice key={item.id} label={item.label} selected={startId === item.id} onPress={() => setStartId(item.id)} />
          ))}
        </View>
        <Text style={styles.label}>Collection lasts</Text>
        <View style={styles.wrap}>
          {DURATIONS.map((item) => (
            <Choice key={item.id} label={item.label} selected={duration === item.id} onPress={() => setDuration(item.id)} />
          ))}
        </View>
        <Text style={styles.preview}>{formatWindow(startDate.toISOString(), endDate.toISOString())}</Text>

        <View style={styles.allergenBox}>
          <Text style={styles.allergenTitle}>Allergen checklist</Text>
          <Text style={styles.allergenBody}>
            Required before publishing. Tick every FSANZ Standard 1.2.3 allergen in this food, or confirm that none apply.
          </Text>
          <View style={styles.wrap}>
            {ALLERGENS.map((item) => (
              <Choice
                key={item.id}
                label={item.label}
                selected={allergens.includes(item.id)}
                danger
                onPress={() => toggleAllergen(item.id)}
              />
            ))}
          </View>
          <Choice
            label="None of these allergens are present"
            selected={noAllergens}
            onPress={() => {
              setNoAllergens((value) => !value);
              setAllergens([]);
            }}
          />
        </View>

        <Text style={styles.label}>Dietary tags</Text>
        <View style={styles.wrap}>
          {DIETARY_TAGS.map((tag) => (
            <Choice key={tag} label={tag} selected={diets.includes(tag)} onPress={() => toggleDiet(tag)} />
          ))}
        </View>

        <Text style={styles.label}>Photo</Text>
        <FoodImage uri={previewUri || photoBase64 || CATEGORY_IMAGES[category]} style={styles.photo} />
        <Pressable accessibilityRole="button" accessibilityLabel="Choose photo" onPress={pickPhoto} style={styles.photoButton}>
          <Text style={styles.photoButtonText}>{previewUri ? "Change photo" : "Choose a photo, or use the sample"}</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label={submitting ? "Publishing…" : "Publish listing"} disabled={submitting} onPress={publish} testID="publish-listing" />
      </ScrollView>
      <BottomBar mode="merchant" />
    </SafeAreaView>
  );
}

function Choice({ label, selected, onPress, danger }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.choice, selected && (danger ? styles.choiceDanger : styles.choiceOn)]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 28 },
  label: { marginTop: 6, fontWeight: "800", color: colors.text },
  multi: { minHeight: 84, textAlignVertical: "top" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pair: { flexDirection: "row", gap: 8 },
  half: { flex: 1 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 12 },
  step: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 22, fontWeight: "700", color: colors.text },
  qty: { fontSize: 20, fontWeight: "800", color: colors.text, minWidth: 28, textAlign: "center" },
  preview: { color: colors.primaryDark, fontWeight: "800" },
  allergenBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  allergenTitle: { fontWeight: "800", color: colors.dangerDark, fontSize: 16 },
  allergenBody: { color: colors.dangerDark, lineHeight: 20 },
  choice: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  choiceOn: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  choiceDanger: { backgroundColor: colors.danger, borderColor: colors.danger },
  choiceText: { fontWeight: "800", color: colors.muted, fontSize: 13 },
  choiceTextOn: { color: "#FFFFFF" },
  photo: { height: 160, borderRadius: radius.lg },
  photoButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    padding: 12,
    alignItems: "center",
  },
  photoButtonText: { fontWeight: "800", color: colors.text },
  error: { color: colors.dangerDark, fontWeight: "700" },
});
